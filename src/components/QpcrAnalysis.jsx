// src/components/QpcrAnalysis.jsx — Aba "Análise": importa a corrida do termociclador e calcula ΔCq / ΔΔCq

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ClipboardPaste, Download, Copy, AlertTriangle, BarChart3, Settings2, FileSpreadsheet, ChevronDown, ChevronUp, UserX, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DEFAULT_SETTINGS, FLAG_LABELS, analyze, isBlankSample, mergeWithPlate, parseRunText, toLongCsv, toWideCsv, workbookToSheets } from '@/lib/qpcr';

const STORAGE_KEY = 'qpcrAnalysis';
const PLATE_COLUMNS = { '96': 12, '384': 24, '48': 8 };
const ERRORS = {
  empty: 'O arquivo está vazio.',
  noHeader: 'Não encontrei as colunas de poço e Cq/Ct. Confira se é o arquivo (ou a aba da planilha) com os resultados da corrida.',
  noRows: 'Achei o cabeçalho, mas nenhuma linha com poço válido (ex.: A1). Ajuste as colunas abaixo.',
};
const FLAG_STYLE = {
  undetermined: 'bg-red-100 text-red-800',
  someUndetermined: 'bg-amber-100 text-amber-800',
  fewReplicates: 'bg-amber-100 text-amber-800',
  spread: 'bg-red-100 text-red-800',
  highCq: 'bg-amber-100 text-amber-800',
  noReference: 'bg-gray-100 text-gray-700',
  referenceOutlier: 'bg-red-100 text-red-800',
  excluded: 'bg-blue-50 text-blue-700',
};
const WARNING_FLAGS = ['undetermined', 'someUndetermined', 'fewReplicates', 'spread', 'highCq', 'noReference', 'referenceOutlier'];

const num = (v, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : v.toFixed(d).replace('.', ','));
const sci = (v) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  if (v >= 0.0001 && v < 1) return Number(v.toPrecision(3)).toString().replace('.', ',');
  return v >= 1 && v < 10000 ? v.toFixed(2).replace('.', ',') : v.toExponential(2).replace('.', ',');
};

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function download(content, filename, type) {
  const blob = new Blob(['\uFEFF' + content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function FieldSelect({ label, value, onChange, headers, allowNone }) {
  return (
    <label className="text-xs space-y-1 block">
      <span className="text-gray-600">{label}</span>
      <select className="w-full h-9 rounded-md border px-2 text-sm bg-white" value={value ?? -1} onChange={(e) => onChange(Number(e.target.value))}>
        {allowNone && <option value={-1}>— nenhuma —</option>}
        {headers.map((h, i) => <option key={i} value={i}>{h || `Coluna ${i + 1}`}</option>)}
      </select>
    </label>
  );
}

/** Gráfico de barras horizontais (SVG), uma barra por amostra. */
function ExpressionChart({ rows, valueKey, logScale }) {
  const data = rows.filter((r) => Number.isFinite(r[valueKey]) && r[valueKey] > 0);
  if (!data.length) return <p className="text-sm text-gray-500 py-6 text-center">Sem valores para mostrar. Defina o gene de referência (e o calibrador para fold change).</p>;
  const values = data.map((r) => r[valueKey]);
  const transform = (v) => (logScale ? Math.log10(v) : v);
  const tv = values.map(transform);
  const min = logScale ? Math.min(0, ...tv) : 0;
  const max = Math.max(logScale ? 0 : 0, ...tv);
  const span = max - min || 1;
  const rowH = 22;
  const labelW = 120;
  const chartW = 520;
  const height = data.length * rowH + 30;
  const x = (v) => labelW + ((transform(v) - min) / span) * chartW;
  const zero = labelW + ((0 - min) / span) * chartW;
  const ref = valueKey === 'foldChange' ? 1 : null;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${labelW + chartW + 70} ${height}`} className="w-full max-w-3xl min-w-[560px]" role="img" aria-label="Expressão relativa por amostra">
        {data.map((r, i) => {
          const y = i * rowH + 4;
          const xv = x(r[valueKey]);
          const left = Math.min(xv, zero);
          return (
            <g key={r.sample}>
              <text x={labelW - 6} y={y + 13} textAnchor="end" fontSize="11" fill="#374151">{r.sample.length > 16 ? r.sample.slice(0, 15) + '…' : r.sample}</text>
              <rect x={left} y={y} width={Math.max(1, Math.abs(xv - zero))} height={rowH - 6} rx="3" fill={r.flags.some((f) => WARNING_FLAGS.includes(f)) ? '#f59e0b' : '#2563eb'} />
              <text x={Math.max(xv, zero) + 4} y={y + 13} fontSize="10" fill="#4b5563">{sci(r[valueKey])}</text>
            </g>
          );
        })}
        <line x1={zero} x2={zero} y1="0" y2={height - 22} stroke="#9ca3af" />
        {ref !== null && (
          <line x1={x(ref)} x2={x(ref)} y1="0" y2={height - 22} stroke="#dc2626" strokeDasharray="4 3" />
        )}
        <text x={labelW} y={height - 6} fontSize="10" fill="#6b7280">
          {valueKey === 'foldChange' ? 'Fold change (2^−ΔΔCq)' : 'Expressão relativa (2^−ΔCq)'}{logScale ? ' — escala log10' : ''}{ref !== null ? ' · linha vermelha = calibrador (1)' : ''}
        </text>
      </svg>
    </div>
  );
}

export function QpcrAnalysis({ plateData, targets, plateFormat }) {
  const saved = useMemo(loadSaved, []);
  const [rawText, setRawText] = useState(saved.rawText || '');
  const [fileName, setFileName] = useState(saved.fileName || '');
  const [columnsOverride, setColumnsOverride] = useState(saved.columnsOverride || null);
  const [nameSource, setNameSource] = useState(saved.nameSource || 'auto');
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...(saved.settings || {}) });
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showColumns, setShowColumns] = useState(false);
  const [geneFilter, setGeneFilter] = useState('');
  const [onlyFlags, setOnlyFlags] = useState(false);
  const [chartGene, setChartGene] = useState('');
  const [logScale, setLogScale] = useState(false);
  const [copied, setCopied] = useState(false);
  const [workbook, setWorkbook] = useState(null); // { name, sheets: [{ sheet, text, hasResults }], current }
  const [reading, setReading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rawText: rawText.length < 400000 ? rawText : '', fileName, columnsOverride, nameSource, settings }));
    } catch { /* armazenamento cheio: segue sem salvar */ }
  }, [rawText, fileName, columnsOverride, nameSource, settings]);

  const parsed = useMemo(
    () => (rawText ? parseRunText(rawText, columnsOverride, PLATE_COLUMNS[plateFormat] || 12) : null),
    [rawText, columnsOverride, plateFormat]
  );
  const wells = useMemo(() => (parsed?.rows ? mergeWithPlate(parsed.rows, plateData, targets, nameSource) : []), [parsed, plateData, targets, nameSource]);
  const analysis = useMemo(() => analyze(wells, settings), [wells, settings]);
  const { results, genes, samples, blanks, blankSamples, excludedSamples, allSamples } = analysis;

  const ignoredWells = parsed?.rows ? parsed.rows.length - wells.length : 0;
  const hasCalibrator = results.some((r) => r.foldChange !== null);
  const valueKey = hasCalibrator ? 'foldChange' : 'nrq';
  const targetGenes = genes.filter((g) => !settings.referenceGenes.includes(g));
  const activeChartGene = targetGenes.includes(chartGene) ? chartGene : targetGenes[0] || '';
  const warningCount = results.filter((r) => r.flags.some((f) => WARNING_FLAGS.includes(f))).length;
  const visible = results.filter((r) => (!geneFilter || r.gene === geneFilter) && (!onlyFlags || r.flags.some((f) => WARNING_FLAGS.includes(f))));

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));
  const toggleIn = (key, value) => setSettings((s) => ({ ...s, [key]: s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value] }));

  const loadText = (text, name) => {
    setRawText(text);
    setFileName(name);
    setColumnsOverride(null);
    // réplicas excluídas são por poço e zeram a cada arquivo; amostras excluídas continuam valendo
    // (e podem ser restauradas enquanto estiverem no arquivo)
    setSettings((s) => ({ ...s, excluded: [] }));
  };

  const excludeSample = (name) => {
    if (!window.confirm(`Excluir a amostra "${name}" de todos os genes?\n\nEla sai dos cálculos, do gráfico e dos CSVs. Dá para restaurar depois em "Amostras excluídas".`)) return;
    setSettings((s) => ({ ...s, excludedSamples: [...new Set([...(s.excludedSamples || []), name])], calibratorSamples: s.calibratorSamples.filter((c) => c !== name) }));
  };
  const restoreSample = (name) => setSettings((s) => ({ ...s, excludedSamples: (s.excludedSamples || []).filter((x) => x !== name) }));
  const restoreAllSamples = () => setSettings((s) => ({ ...s, excludedSamples: (s.excludedSamples || []).filter((x) => !excludedSamples.includes(x)) }));
  const toggleBlank = (name) => setSettings((s) => ({
    ...s,
    blankOverrides: { ...s.blankOverrides, [name]: !isBlankSample(name, s.blankOverrides) },
    calibratorSamples: s.calibratorSamples.filter((c) => c !== name),
  }));

  const selectSheet = (wb, sheetName) => {
    const sheet = wb.sheets.find((x) => x.sheet === sheetName) || wb.sheets[0];
    setWorkbook({ ...wb, current: sheet.sheet });
    loadText(sheet.text, `${wb.name} · aba "${sheet.sheet}"`);
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file) return;
    if (/\.eds$/i.test(file.name)) {
      alert('Arquivo .eds é o experimento do aparelho. No software do termociclador, exporte os resultados (Export → Results) em Excel (.xlsx), CSV ou TXT.');
      return;
    }
    if (/\.xls$/i.test(file.name)) {
      alert('Arquivo .xls (Excel antigo). Abra no Excel e use "Salvar como" → "Pasta de Trabalho do Excel (.xlsx)", ou exporte em CSV, e importe de novo.');
      return;
    }
    if (/\.xlsx$/i.test(file.name)) {
      setReading(true);
      try {
        const { default: readExcelFile } = await import('read-excel-file/browser');
        const sheets = workbookToSheets(await readExcelFile(file));
        if (!sheets.length) throw new Error('planilha vazia');
        selectSheet({ name: file.name, sheets }, sheets[0].sheet);
      } catch (error) {
        alert(`Não consegui ler a planilha: ${error.message}`);
      } finally {
        setReading(false);
      }
      return;
    }
    setWorkbook(null);
    const reader = new FileReader();
    reader.onload = (ev) => loadText(ev.target.result, file.name);
    reader.readAsText(file);
  };

  // genes de referência: sugere automaticamente genes comuns na primeira importação
  useEffect(() => {
    if (!genes.length || settings.referenceGenes.some((g) => genes.includes(g))) return;
    const common = genes.filter((g) => /^(ACTB|GAPDH|B2M|HPRT1?|RPLP0|18S|TBP|PPIA|YWHAZ|UBC|GUSB|RNU6|U6|RNU48|SNORD\d+)$/i.test(g));
    if (common.length) setSettings((s) => ({ ...s, referenceGenes: [common[0]] }));
  }, [genes, settings.referenceGenes]);

  const copyTable = () => {
    navigator.clipboard.writeText(toLongCsv(results).replace(/;/g, '\t')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const baseName = (fileName || 'qpcr').replace(/\.[^.]+$/, '');

  return (
    <div className="space-y-6">
      {/* 1. Importar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5" />1. Importar a corrida</CardTitle>
          <CardDescription>Planilha do Excel (.xlsx), CSV ou TXT exportado pelo termociclador, ou cole as colunas do Excel (Poço e Cq, opcionalmente Amostra e Gene).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => fileRef.current.click()} disabled={reading}><Upload className="h-4 w-4 mr-2" />{reading ? 'Lendo planilha…' : 'Importar arquivo'}</Button>
            <input ref={fileRef} type="file" accept=".xlsx,.csv,.txt,.tsv,.xls" className="hidden" onChange={handleFile} />
            <Button variant="outline" onClick={() => setShowPaste((v) => !v)}><ClipboardPaste className="h-4 w-4 mr-2" />Colar dados</Button>
            {rawText && <Button variant="ghost" className="text-gray-500" onClick={() => { setWorkbook(null); loadText('', ''); }}>Limpar</Button>}
          </div>

          {showPaste && (
            <div className="space-y-2">
              <Textarea rows={6} value={pasteText} onChange={(e) => setPasteText(e.target.value)} className="font-mono text-xs" placeholder={'Poço\tAmostra\tGene\tCq\nA1\tPac_01\tACTB\t18,2\nA2\tPac_01\tACTB\t18,3'} />
              <Button size="sm" disabled={!pasteText.trim()} onClick={() => { setWorkbook(null); loadText(pasteText, 'dados colados'); setShowPaste(false); setPasteText(''); }}>Usar estes dados</Button>
            </div>
          )}

          {workbook && workbook.sheets.length > 1 && (
            <label className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-600">Aba da planilha:</span>
              <select className="h-9 rounded-md border px-2 bg-white" value={workbook.current} onChange={(e) => selectSheet(workbook, e.target.value)}>
                {workbook.sheets.map((sh) => <option key={sh.sheet} value={sh.sheet}>{sh.sheet}{sh.hasResults ? ' (resultados)' : ''}</option>)}
              </select>
            </label>
          )}

          {parsed?.error && (
            <div className="flex gap-2 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />{ERRORS[parsed.error]}
            </div>
          )}

          {parsed?.rows && (
            <div className="text-sm space-y-1">
              <p><strong>{fileName}</strong>: {parsed.rows.length} poço(s) lido(s) · <strong>{wells.length}</strong> com amostra e gene{ignoredWells > 0 && <span className="text-amber-700"> · {ignoredWells} ignorado(s) por falta de amostra ou gene</span>}</p>
              <p className="text-gray-600">
                Colunas: Poço = <em>{parsed.headers[parsed.columns.well]}</em>, Cq = <em>{parsed.headers[parsed.columns.cq]}</em>
                {parsed.columns.sample >= 0 && <>, Amostra = <em>{parsed.headers[parsed.columns.sample]}</em></>}
                {parsed.columns.target >= 0 && <>, Gene = <em>{parsed.headers[parsed.columns.target]}</em></>}
              </p>
            </div>
          )}

          {parsed?.headers && (
            <div>
              <button type="button" className="text-sm text-blue-700 flex items-center gap-1" onClick={() => setShowColumns((v) => !v)}>
                {showColumns ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}Ajustar colunas e origem dos nomes
              </button>
              {showColumns && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[['well', 'Poço', false], ['cq', 'Cq / Ct', false], ['sample', 'Amostra', true], ['target', 'Gene / alvo', true]].map(([key, label, none]) => (
                    <FieldSelect key={key} label={label} allowNone={none} headers={parsed.headers}
                      value={(columnsOverride || parsed.columns)[key]}
                      onChange={(v) => setColumnsOverride({ ...(columnsOverride || { well: parsed.columns.well, cq: parsed.columns.cq, sample: parsed.columns.sample, target: parsed.columns.target, headerIndex: parsed.columns.headerIndex }), [key]: v })} />
                  ))}
                  <label className="text-xs space-y-1 block">
                    <span className="text-gray-600">Nomes de amostra e gene</span>
                    <select className="w-full h-9 rounded-md border px-2 text-sm bg-white" value={nameSource} onChange={(e) => setNameSource(e.target.value)}>
                      <option value="auto">Mapa do qPlate (se vazio, o arquivo)</option>
                      <option value="plate">Só o mapa do qPlate</option>
                      <option value="file">Só o arquivo</option>
                    </select>
                  </label>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {wells.length > 0 && (
        <>
          {/* 2. Configurar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" />2. Configurar</CardTitle>
              <CardDescription>
                {samples.length} amostra(s) · {genes.length} gene(s)
                {blankSamples.length > 0 && ` · ${blankSamples.length} branco(s)`}
                {excludedSamples.length > 0 && ` · ${excludedSamples.length} excluída(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Réplicas por amostra</Label>
                  <div className="flex gap-2">
                    {[[2, 'Duplicata'], [3, 'Triplicata']].map(([n, label]) => (
                      <Button key={n} variant={settings.replicates === n ? 'default' : 'outline'} className="flex-1" onClick={() => update({ replicates: n })}>{label}</Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-spread">Diferença máxima entre réplicas (Cq)</Label>
                  <Input id="max-spread" type="number" step="0.1" min="0.1" value={settings.maxSpread} onChange={(e) => update({ maxSpread: Number(e.target.value) || DEFAULT_SETTINGS.maxSpread })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="high-cq">Alertar Cq acima de</Label>
                  <Input id="high-cq" type="number" step="1" min="20" value={settings.highCq} onChange={(e) => update({ highCq: Number(e.target.value) || DEFAULT_SETTINGS.highCq })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ref-dev">Referência fora da faixa: diferença da mediana (Cq)</Label>
                  <Input id="ref-dev" type="number" step="0.5" min="1" value={settings.refMaxDeviation ?? DEFAULT_SETTINGS.refMaxDeviation} onChange={(e) => update({ refMaxDeviation: Number(e.target.value) || DEFAULT_SETTINGS.refMaxDeviation })} />
                  <p className="text-xs text-gray-500">Avisa quando o Cq do gene de referência de uma amostra fica muito longe das outras (pouco cDNA, RNA degradado ou falha na RT).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gene(s) de referência</Label>
                  <div className="space-y-1">
                    {genes.map((g) => (
                      <label key={g} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={settings.referenceGenes.includes(g)} onChange={() => toggleIn('referenceGenes', g)} />{g}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Com mais de um, usa a média dos Cq das referências.</p>
                </div>
                <div className="space-y-2">
                  <Label>Calibrador (opcional)</Label>
                  <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                    {samples.map((s) => (
                      <label key={s} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={settings.calibratorSamples.includes(s)} onChange={() => toggleIn('calibratorSamples', s)} />{s}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Amostra(s) de controle para o ΔΔCq. Sem calibrador, o app calcula só o 2^−ΔCq, que serve para a estatística da coorte.</p>
                </div>
                <div className="space-y-2 md:col-span-3 md:order-last">
                  <Label>Brancos / controles negativos</Label>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 max-h-28 overflow-y-auto border rounded-md p-2">
                    {allSamples.filter((x) => !excludedSamples.includes(x)).map((x) => (
                      <label key={x} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={blankSamples.includes(x)} onChange={() => toggleBlank(x)} />{x}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Reconhecidos pelo nome (BR, NTC, branco, H2O...); marque ou desmarque se precisar. Brancos saem dos resultados e viram checagem de contaminação.</p>
                </div>
                <div className="space-y-2">
                  <Label>Eficiência dos primers (%)</Label>
                  <div className="space-y-1">
                    {genes.map((g) => (
                      <label key={g} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">{g}</span>
                        <Input className="h-8 w-24" type="number" step="1" min="50" max="150" value={settings.efficiencies[g] ?? 100}
                          onChange={(e) => update({ efficiencies: { ...settings.efficiencies, [g]: e.target.value } })} />
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">100% = 2^−ΔΔCq clássico. Com outros valores, usa o método de Pfaffl.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {blanks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" />Controles negativos</CardTitle>
                <CardDescription>
                  {blanks.every((b) => b.status === 'ok')
                    ? 'Nenhum branco amplificou: sem sinal de contaminação.'
                    : blanks.some((b) => b.status === 'contaminated') ? 'Atenção: há branco com amplificação. Confira antes de usar os resultados desse gene.' : 'Branco com amplificação tardia: provavelmente dímero de primer.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {blanks.map((b) => (
                    <div key={`${b.sample}|${b.gene}`} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${b.status === 'ok' ? 'border-green-200 bg-green-50 text-green-900' : b.status === 'late' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
                      {b.status === 'ok' ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
                      <div>
                        <div className="font-medium">{b.sample} · {b.gene}</div>
                        <div className="text-xs">
                          {b.status === 'ok' && 'Controle negativo OK (sem amplificação)'}
                          {b.status === 'late' && `Amplificou tarde (Cq ${num(b.minCq)}): provável dímero de primer. Confira a curva de melting.`}
                          {b.status === 'contaminated' && `Possível contaminação (Cq ${num(b.minCq)})`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Resultados */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <CardTitle>3. Resultados</CardTitle>
                  <CardDescription>
                    {warningCount > 0 ? <span className="text-amber-700">{warningCount} combinação(ões) amostra × gene com alerta</span> : 'Nenhum alerta'}
                    {' · '}Clique numa réplica para excluir ou incluir de volta; o ícone ao lado do nome exclui a amostra inteira.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={copyTable}><Copy className="h-4 w-4 mr-2" />{copied ? 'Copiado!' : 'Copiar'}</Button>
                  <Button variant="outline" size="sm" onClick={() => download(toLongCsv(results), `${baseName}_analise_longa.csv`, 'text/csv;charset=utf-8')}><Download className="h-4 w-4 mr-2" />CSV longo</Button>
                  <Button variant="outline" size="sm" onClick={() => download(toWideCsv(analysis), `${baseName}_analise_larga.csv`, 'text/csv;charset=utf-8')}><Download className="h-4 w-4 mr-2" />CSV largo</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <select className="h-9 rounded-md border px-2 bg-white" value={geneFilter} onChange={(e) => setGeneFilter(e.target.value)}>
                  <option value="">Todos os genes</option>
                  {genes.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <label className="flex items-center gap-2"><input type="checkbox" checked={onlyFlags} onChange={(e) => setOnlyFlags(e.target.checked)} />Só com alerta</label>
                {excludedSamples.length > 0 && (
                  <div className="w-full flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <span className="text-gray-600">Amostras excluídas:</span>
                    {excludedSamples.map((x) => (
                      <button key={x} type="button" onClick={() => restoreSample(x)} className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-xs hover:bg-blue-50" title={`Restaurar ${x}`}>
                        <span className="line-through text-gray-500">{x}</span><RotateCcw className="h-3 w-3 text-blue-700" />
                      </button>
                    ))}
                    {excludedSamples.length > 1 && <button type="button" className="text-blue-700 underline text-xs" onClick={restoreAllSamples}>Restaurar todas</button>}
                  </div>
                )}
                {settings.excluded.length > 0 && (
                  <button type="button" className="text-blue-700 underline" onClick={() => update({ excluded: [] })}>Incluir de volta as {settings.excluded.length} réplica(s) excluída(s)</button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Amostra</th>
                      <th className="p-2">Gene</th>
                      <th className="p-2">Réplicas (Cq)</th>
                      <th className="p-2 text-right">Cq médio</th>
                      <th className="p-2 text-right">DP</th>
                      <th className="p-2 text-right">ΔCq</th>
                      <th className="p-2 text-right">ΔΔCq</th>
                      <th className="p-2 text-right">{hasCalibrator ? 'Fold change' : 'Expr. relativa'}</th>
                      <th className="p-2">Alertas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => (
                      <tr key={`${r.sample}|${r.gene}`} className={`border-b ${r.isReference ? 'bg-gray-50' : ''}`}>
                        <td className="p-2 font-medium">
                          <div className="group flex items-center gap-1">
                            <span>{r.sample}</span>
                            <button type="button" onClick={() => excludeSample(r.sample)} className="opacity-30 group-hover:opacity-100 focus:opacity-100 text-gray-500 hover:text-red-600" title={`Excluir a amostra ${r.sample} de todos os genes`} aria-label={`Excluir amostra ${r.sample}`}>
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="p-2">{r.gene}{r.isReference && <span className="ml-1 text-xs text-gray-500">(ref.)</span>}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {r.replicates.map((rep) => (
                              <button
                                key={rep.well}
                                type="button"
                                onClick={() => toggleIn('excluded', rep.well)}
                                title={rep.excluded ? `${rep.well}: excluída — clique para incluir` : rep.well === r.suggestedOutlier ? `${rep.well}: mais distante das outras — sugestão de exclusão` : `${rep.well}: clique para excluir`}
                                className={`rounded px-1.5 py-0.5 text-xs border tabular-nums ${rep.excluded ? 'line-through text-gray-400 bg-gray-50' : rep.well === r.suggestedOutlier ? 'border-orange-400 bg-orange-50 text-orange-800' : 'bg-white'}`}
                              >
                                <span className="text-gray-400 mr-1">{rep.well}</span>{rep.cq === null ? 'Und' : num(rep.cq)}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 text-right tabular-nums font-semibold">{num(r.meanCq)}</td>
                        <td className="p-2 text-right tabular-nums">{num(r.sd)}</td>
                        <td className="p-2 text-right tabular-nums">{num(r.deltaCq)}</td>
                        <td className="p-2 text-right tabular-nums">{num(r.deltaDeltaCq)}</td>
                        <td className="p-2 text-right tabular-nums font-semibold">{sci(hasCalibrator ? r.foldChange : r.nrq)}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            {r.flags.map((f) => <span key={f} className={`rounded-full px-2 py-0.5 text-xs whitespace-nowrap ${FLAG_STYLE[f] || ''}`}>{FLAG_LABELS[f] || f}</span>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!settings.referenceGenes.length && <p className="text-sm text-amber-700">Marque pelo menos um gene de referência para calcular ΔCq e a expressão relativa.</p>}
              <p className="text-xs text-gray-500">
                Duplicata: com réplicas discordantes não dá para saber qual está errada; exclua uma manualmente ou repita a amostra.
                Triplicata: a réplica mais distante das outras fica destacada em laranja como sugestão.
              </p>
            </CardContent>
          </Card>

          {/* 4. Gráfico */}
          {targetGenes.length > 0 && settings.referenceGenes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />4. Gráfico</CardTitle>
                  <div className="flex items-center gap-3 text-sm">
                    <select className="h-9 rounded-md border px-2 bg-white" value={activeChartGene} onChange={(e) => setChartGene(e.target.value)}>
                      {targetGenes.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={logScale} onChange={(e) => setLogScale(e.target.checked)} />Escala log</label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ExpressionChart rows={results.filter((r) => r.gene === activeChartGene)} valueKey={valueKey} logScale={logScale} />
                <p className="text-xs text-gray-500 mt-2">Barras em laranja têm alerta. O gráfico é para conferência rápida; a estatística deve ser feita com o CSV.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
