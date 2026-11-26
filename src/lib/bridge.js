// Ponte com o Lab MasterMix (cdna-litex.vercel.app)
// O Lab MasterMix abre este app com #import=<JSON em base64url> contendo o nome do projeto e a lista de amostras.

export const LAB_MASTERMIX_URL = 'https://cdna-litex.vercel.app/';

function decodeBase64Url(text) {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Lê (e remove da barra de endereço) os dados enviados pelo Lab MasterMix.
 * Retorna { project, samples: string[] } ou null.
 */
export function readImportFromHash() {
  const match = window.location.hash.match(/^#import=([A-Za-z0-9_-]+)$/);
  if (!match) return null;
  // limpa o hash para não reimportar ao recarregar a página
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  try {
    const data = JSON.parse(decodeBase64Url(match[1]));
    if (!data || data.source !== 'lab-mastermix' || !Array.isArray(data.samples)) return null;
    const samples = data.samples
      .map((s) => (typeof s === 'string' ? s : s?.name))
      .filter((s) => typeof s === 'string' && s.trim() !== '')
      .map((s) => s.trim().slice(0, 60))
      .slice(0, 384);
    if (!samples.length) return null;
    const project = typeof data.project === 'string' ? data.project.trim().slice(0, 80) : '';
    return { project, samples };
  } catch (error) {
    console.error('Dados do Lab MasterMix inválidos:', error);
    return null;
  }
}
