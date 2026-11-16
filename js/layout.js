// Estimativa leve (sem pdf-lib) de quanto texto cabe nos campos multilinha,
// usando as mesmas larguras da Helvetica e a mesma regra do gerador.
import { LARGURAS, ALTURA_LINHA } from './helvetica.js';
import { CAMPOS_BO, CAMPOS_ENV } from './pdf/campos-modelo.js';

const LARG_PADRAO = 556;
function largura(texto, tamanho) {
  let w = 0;
  for (const ch of texto) w += LARGURAS[ch] ?? LARG_PADRAO;
  return (w * tamanho) / 1000;
}

function contarLinhas(texto, tamanho, larg) {
  let n = 0;
  for (const par of String(texto).replace(/\r\n?/g, '\n').split('\n')) {
    const palavras = par.split(/\s+/).filter(Boolean);
    if (!palavras.length) { n += 1; continue; }
    let atual = '';
    for (const p of palavras) {
      const t = atual ? `${atual} ${p}` : p;
      if (largura(t, tamanho) <= larg || !atual) atual = t;
      else { n += 1; atual = p; }
    }
    n += 1;
  }
  return n;
}

const TAMANHOS = [10, 9.5, 9];
export function avaliarCampoMulti(texto, nomeCampo, doc = 'bo') {
  const meta = (doc === 'bo' ? CAMPOS_BO : CAMPOS_ENV).find((c) => c.n === nomeCampo);
  const w = meta.r[2] - meta.r[0] - 2; const h = meta.r[3] - meta.r[1] - 2;
  const capacidade = Math.floor(h / (ALTURA_LINHA * TAMANHOS[0] * 1.2));
  if (!texto) return { linhas: 0, capacidade, cabe: true, tamanho: TAMANHOS[0], percentual: 0 };
  for (const t of TAMANHOS) {
    const linhas = contarLinhas(texto, t, w);
    const cap = Math.floor(h / (ALTURA_LINHA * t * 1.2));
    if (linhas <= cap) {
      const l10 = contarLinhas(texto, TAMANHOS[0], w);
      return { linhas: l10, capacidade, cabe: true, tamanho: t, percentual: Math.round((l10 / capacidade) * 100) };
    }
  }
  const l10 = contarLinhas(texto, TAMANHOS[0], w);
  return { linhas: l10, capacidade, cabe: false, tamanho: TAMANHOS[0], percentual: Math.round((l10 / capacidade) * 100) };
}

/** Para blocos de linhas simples (ex.: outras providências, 2 linhas). */
export function avaliarLinhas(texto, nomes, doc = 'bo') {
  const metas = nomes.map((n) => (doc === 'bo' ? CAMPOS_BO : CAMPOS_ENV).find((c) => c.n === n));
  const tam = Math.min(...metas.map((m) => Math.min(m.f, (m.r[3] - m.r[1]) * 0.8)));
  const w = metas[0].r[2] - metas[0].r[0] - 4;
  const linhas = texto ? contarLinhas(String(texto).replace(/\s*\n\s*/g, ' '), tam, w) : 0;
  return { linhas, capacidade: metas.length, cabe: linhas <= metas.length };
}
