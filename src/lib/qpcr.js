// Análise de qPCR — lógica pura (sem React), testável.
// Fluxo: arquivo do termociclador → poços com Cq → cruzar com o mapa da placa → réplicas → ΔCq / ΔΔCq.

// ---------- leitura do arquivo ----------

const NO_CQ = /^(undetermined|undet\.?|n\/?a|no ct|no cq|nan|-+|—|indeterminado|não determinado|nd)$/i;

/** Número com ponto ou vírgula decimal. Retorna null para vazio/"Undetermined"/inválido. */
export function parseCq(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace(/^"|"$/g, '');
  if (text === '' || NO_CQ.test(text)) return null;
  const normalized = text.replace(/\s/g, '').replace(',', '.');
  if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(normalized)) return null;
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** "A01" → "A1"; "a1" → "A1". Número (1..384) vira posição pela largura da placa. */
export function normalizeWell(value, columns = 12) {
  const text = String(value ?? '').trim().replace(/^"|"$/g, '').toUpperCase();
  const m = text.match(/^([A-P])\s*0*(\d{1,2})$/);
  if (m) return `${m[1]}${Number(m[2])}`;
  if (/^\d{1,3}$/.test(text)) {
    const n = Number(text);
    if (n < 1) return null;
    const row = String.fromCharCode(65 + Math.floor((n - 1) / columns));
    return `${row}${((n - 1) % columns) + 1}`;
  }
  return null;
}

/** Divide uma linha respeitando aspas. */
function splitLine(line, delimiter) {
  const cells = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === delimiter && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

const WELL_HEADER = /^(well position|well pos\.?|position|pos|posi[cç][aã]o|po[cç]o|well)$/i;
const CQ_HEADER = /^(cq|ct|cт|c\.t\.|c_t|cq \(∆r\)|cq \(Δrn\)|ct \(Δrn\)|crt|cp)$/i;
const SAMPLE_HEADER = /^(sample|sample name|sample id|amostra|nome da amostra|name)$/i;
const TARGET_HEADER = /^(target|target name|detector|detector name|gene|alvo|assay|gene name)$/i;

function detectDelimiter(lines) {
  const candidates = ['\t', ';', ','];
  let best = '\t';
  let bestScore = -1;
  for (const d of candidates) {
    // linha de cabeçalho típica tem várias colunas; pontua quantas linhas têm o mesmo nº (>1) de colunas
    const counts = lines.slice(0, 60).map((l) => splitLine(l, d).length).filter((c) => c > 1);
    if (!counts.length) continue;
    const freq = {};
    counts.forEach((c) => { freq[c] = (freq[c] || 0) + 1; });
    const score = Math.max(...Object.values(freq)) * (d === ',' ? 0.9 : 1);
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

/** Acha a linha de cabeçalho e as colunas de poço, Cq, amostra e alvo. */
export function detectColumns(lines, delimiter) {
  for (let i = 0; i < Math.min(lines.length, 200); i++) {
    const cells = splitLine(lines[i], delimiter).map((c) => c.replace(/^"|"$/g, '').trim());
    const wellIdx = findHeader(cells, WELL_HEADER, ['well position', 'well pos', 'position', 'posição', 'poço', 'well']);
    const cqIdx = findHeader(cells, CQ_HEADER, ['cq', 'ct']);
    if (wellIdx >= 0 && cqIdx >= 0) {
      return {
        headerIndex: i,
        headers: cells,
        well: wellIdx,
        cq: cqIdx,
        sample: findHeader(cells, SAMPLE_HEADER, ['sample name', 'sample', 'amostra']),
        target: findHeader(cells, TARGET_HEADER, ['target name', 'target', 'gene', 'detector name', 'detector']),
      };
    }
  }
  return null;
}

function findHeader(cells, regex, preference) {
  const matches = cells.map((c, i) => [c.toLowerCase(), i]).filter(([c]) => regex.test(c));
  if (!matches.length) return -1;
  for (const pref of preference) {
    const hit = matches.find(([c]) => c === pref);
    if (hit) return hit[1];
  }
  return matches[0][1];
}

/**
 * Lê o texto exportado pelo termociclador (CSV/TXT, ou colado do Excel).
 * columns: opcional, para forçar os índices { well, cq, sample, target } escolhidos pelo usuário.
 * Retorna { rows: [{ well, cq, sample, target }], headers, columns, skipped } ou { error }.
 */
export function parseRunText(text, columns = null, plateColumns = 12) {
  const lines = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (!lines.length) return { error: 'empty' };
  const delimiter = detectDelimiter(lines);
  const detected = detectColumns(lines, delimiter);
  if (!detected && !columns) return { error: 'noHeader' };
  const cols = { ...(detected || { headerIndex: 0, headers: splitLine(lines[0], delimiter) }), ...(columns || {}) };

  const rows = [];
  let skipped = 0;
  const seen = new Set();
  for (let i = cols.headerIndex + 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], delimiter);
    const well = normalizeWell(cells[cols.well], plateColumns);
    if (!well) { skipped++; continue; }
    const sample = cols.sample >= 0 ? (cells[cols.sample] || '').replace(/^"|"$/g, '').trim() : '';
    const target = cols.target >= 0 ? (cells[cols.target] || '').replace(/^"|"$/g, '').trim() : '';
    // alguns aparelhos repetem o poço (uma linha por alvo/corante); guarda poço+alvo
    const key = `${well}|${target}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ well, cq: parseCq(cells[cols.cq]), sample, target });
  }
  if (!rows.length) return { error: 'noRows', headers: cols.headers, columns: cols };
  return { rows, headers: cols.headers, columns: cols, delimiter, skipped };
}

// ---------- cruzar com o mapa da placa ----------

/**
 * nameSource: 'auto' (mapa do qPlate quando o poço está mapeado, senão o arquivo), 'plate' ou 'file'.
 * Retorna [{ well, sample, gene, cq }] só com poços que têm amostra e gene.
 */
export function mergeWithPlate(rows, plateData = {}, targets = [], nameSource = 'auto') {
  const targetName = (id) => targets.find((t) => t.id === id)?.name || '';
  return rows
    .map((r) => {
      const well = plateData[r.well] || {};
      const plateSample = well.sampleName || '';
      const plateGene = well.targetId && well.targetId !== 'empty' ? targetName(well.targetId) : '';
      let sample = r.sample;
      let gene = r.target;
      if (nameSource === 'plate') { sample = plateSample; gene = plateGene; }
      else if (nameSource === 'auto') { sample = plateSample || r.sample; gene = plateGene || r.target; }
      return { well: r.well, sample: sample.trim(), gene: gene.trim(), cq: r.cq };
    })
    .filter((w) => w.sample && w.gene);
}

// ---------- análise ----------

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs) => (xs.length < 2 ? null : Math.sqrt(xs.reduce((a, x) => a + (x - mean(xs)) ** 2, 0) / (xs.length - 1)));
const geomean = (xs) => Math.exp(mean(xs.map(Math.log)));

export const DEFAULT_SETTINGS = {
  replicates: 3, // 2 = duplicata, 3 = triplicata
  maxSpread: 0.5, // diferença máxima de Cq aceitável entre réplicas
  highCq: 35,
  referenceGenes: [],
  calibratorSamples: [],
  efficiencies: {}, // { gene: % } — padrão 100%
  excluded: [], // poços excluídos manualmente
};

/** Eficiência em % → base da amplificação (100% → 2). */
export function amplificationBase(pct) {
  const p = Number(pct);
  return Number.isFinite(p) && p > 0 && p <= 150 ? 1 + p / 100 : 2;
}

/**
 * Calcula, por amostra × gene: réplicas, Cq médio, DP, amplitude, alertas,
 * ΔCq (vs. média dos genes de referência), ΔΔCq (vs. calibrador),
 * expressão relativa (NRQ = 2^−ΔCq com 100% de eficiência) e fold change (2^−ΔΔCq).
 * Com eficiências diferentes de 100% usa a forma generalizada (Pfaffl / qBase): E^−Cq normalizado pela média geométrica das referências.
 */
export function analyze(wells, settings = DEFAULT_SETTINGS) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const excluded = new Set(s.excluded);
  const refs = s.referenceGenes.filter(Boolean);
  const base = (gene) => amplificationBase(s.efficiencies?.[gene] ?? 100);

  // agrupa réplicas
  const groups = new Map();
  for (const w of wells) {
    const key = `${w.sample}\u0000${w.gene}`;
    if (!groups.has(key)) groups.set(key, { sample: w.sample, gene: w.gene, replicates: [] });
    groups.get(key).replicates.push({ well: w.well, cq: w.cq, excluded: excluded.has(w.well) });
  }

  const results = [...groups.values()].map((g) => {
    g.replicates.sort((a, b) => wellOrder(a.well) - wellOrder(b.well));
    const valid = g.replicates.filter((r) => !r.excluded && r.cq !== null).map((r) => r.cq);
    const meanCq = valid.length ? mean(valid) : null;
    const spread = valid.length > 1 ? Math.max(...valid) - Math.min(...valid) : null;
    const flags = [];
    const undetermined = g.replicates.filter((r) => !r.excluded && r.cq === null).length;
    if (undetermined) flags.push(valid.length ? 'someUndetermined' : 'undetermined');
    if (g.replicates.length < s.replicates) flags.push('fewReplicates'); // poços faltando no mapa/arquivo
    if (g.replicates.some((r) => r.excluded)) flags.push('excluded'); // informativo: exclusão manual
    if (spread !== null && spread > s.maxSpread) flags.push('spread');
    if (meanCq !== null && meanCq > s.highCq) flags.push('highCq');

    // sugestão de réplica a excluir: com 3+ réplicas e amplitude alta, a mais distante da mediana
    let suggestedOutlier = null;
    if (spread !== null && spread > s.maxSpread && valid.length >= 3) {
      const sorted = [...valid].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const candidates = g.replicates.filter((r) => !r.excluded && r.cq !== null);
      suggestedOutlier = candidates.reduce((far, r) => (Math.abs(r.cq - median) > Math.abs(far.cq - median) ? r : far)).well;
    }
    return { ...g, n: valid.length, meanCq, sd: sd(valid), spread, flags, suggestedOutlier, isReference: refs.includes(g.gene) };
  });

  // normalização por amostra
  const bySample = new Map();
  results.forEach((r) => {
    if (!bySample.has(r.sample)) bySample.set(r.sample, {});
    bySample.get(r.sample)[r.gene] = r;
  });

  results.forEach((r) => {
    r.deltaCq = null;
    r.nrq = null;
    if (!refs.length || r.isReference || r.meanCq === null) return;
    const refRows = refs.map((g) => bySample.get(r.sample)?.[g]);
    if (refRows.some((x) => !x || x.meanCq === null)) { r.flags.push('noReference'); return; }
    r.refMeanCq = mean(refRows.map((x) => x.meanCq));
    r.deltaCq = r.meanCq - r.refMeanCq;
    const normFactor = geomean(refRows.map((x) => base(x.gene) ** -x.meanCq));
    r.nrq = (base(r.gene) ** -r.meanCq) / normFactor;
  });

  // calibrador (ΔΔCq e fold change)
  const calibrators = new Set(s.calibratorSamples);
  const genes = [...new Set(results.map((r) => r.gene))];
  const calibratorStats = {};
  genes.forEach((gene) => {
    const cal = results.filter((r) => r.gene === gene && calibrators.has(r.sample) && r.deltaCq !== null);
    if (cal.length) calibratorStats[gene] = { meanDeltaCq: mean(cal.map((r) => r.deltaCq)), geoNrq: geomean(cal.map((r) => r.nrq)) };
  });
  results.forEach((r) => {
    r.deltaDeltaCq = null;
    r.foldChange = null;
    const cal = calibratorStats[r.gene];
    if (!cal || r.deltaCq === null) return;
    r.deltaDeltaCq = r.deltaCq - cal.meanDeltaCq;
    r.foldChange = r.nrq / cal.geoNrq;
  });

  results.sort((a, b) => a.gene.localeCompare(b.gene) || naturalCompare(a.sample, b.sample));
  return { results, genes, samples: [...bySample.keys()].sort(naturalCompare), calibratorStats };
}

function wellOrder(well) {
  const m = String(well).match(/^([A-P])(\d+)$/);
  return m ? (m[1].charCodeAt(0) - 65) * 100 + Number(m[2]) : 0;
}

export function naturalCompare(a, b) {
  return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' });
}

// ---------- exportação ----------

const fmt = (v, d = 3, comma = true) => (v === null || v === undefined || !Number.isFinite(v) ? '' : comma ? v.toFixed(d).replace('.', ',') : v.toFixed(d));

export const FLAG_LABELS = {
  undetermined: 'Sem amplificação',
  someUndetermined: 'Réplica sem amplificação',
  fewReplicates: 'Faltam réplicas',
  excluded: 'Réplica excluída',
  spread: 'Réplicas discordantes',
  highCq: 'Cq alto',
  noReference: 'Sem gene de referência',
};

/** CSV formato longo (uma linha por amostra × gene) — bom para R/estatística. */
export function toLongCsv(results, { comma = true } = {}) {
  const sep = comma ? ';' : ',';
  const header = ['Amostra', 'Gene', 'Referência', 'Poços', 'Cq réplicas', 'Excluídas', 'n', 'Cq médio', 'DP', 'Amplitude', 'ΔCq', 'ΔΔCq', 'Expressão relativa (NRQ)', 'Fold change', 'Alertas'];
  const lines = results.map((r) => [
    r.sample,
    r.gene,
    r.isReference ? 'sim' : '',
    r.replicates.map((x) => x.well).join(' '),
    r.replicates.map((x) => (x.cq === null ? 'Und' : fmt(x.cq, 2, comma))).join(' '),
    r.replicates.filter((x) => x.excluded).map((x) => x.well).join(' '),
    r.n,
    fmt(r.meanCq, 3, comma),
    fmt(r.sd, 3, comma),
    fmt(r.spread, 3, comma),
    fmt(r.deltaCq, 3, comma),
    fmt(r.deltaDeltaCq, 3, comma),
    fmt(r.nrq, 6, comma),
    fmt(r.foldChange, 4, comma),
    r.flags.map((f) => FLAG_LABELS[f] || f).join(' | '),
  ]);
  return [header, ...lines].map((cols) => cols.map((c) => csvCell(String(c), sep)).join(sep)).join('\n');
}

/** CSV formato largo: amostras nas linhas, genes nas colunas (fold change se houver calibrador, senão NRQ). */
export function toWideCsv(analysis, { comma = true } = {}) {
  const sep = comma ? ';' : ',';
  const targets = analysis.genes.filter((g) => !analysis.results.find((r) => r.gene === g)?.isReference);
  const useFold = analysis.results.some((r) => r.foldChange !== null);
  const header = ['Amostra', ...targets.map((g) => `${g} (${useFold ? 'fold change' : 'NRQ'})`)];
  const lines = analysis.samples.map((sample) => [
    sample,
    ...targets.map((g) => {
      const r = analysis.results.find((x) => x.sample === sample && x.gene === g);
      return r ? fmt(useFold ? r.foldChange : r.nrq, 6, comma) : '';
    }),
  ]);
  return [header, ...lines].map((cols) => cols.map((c) => csvCell(String(c), sep)).join(sep)).join('\n');
}

function csvCell(value, sep) {
  return new RegExp(`[${sep}"\\n]`).test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
