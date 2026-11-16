// Gera módulos JS compactos a partir de templates/campos.json e da fonte
// Helvetica do pdf-lib. Rodar após dev/preparar_modelos.py:
//   node dev/gerar_dados.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, StandardFonts } from '../vendor/pdf-lib.esm.min.js';

const raiz = new URL('..', import.meta.url);
const campos = JSON.parse(readFileSync(new URL('templates/campos.json', raiz), 'utf8'));

function compacto(lista) {
  return lista.map((c) => {
    const o = { n: c.nome, p: c.pagina, r: c.rect.map((v) => Math.round(v * 10) / 10), t: c.tipo === 'marca' ? 'm' : 't', f: c.fonte };
    if (c.multilinha) o.ml = 1;
    if (c.grupo) { o.g = c.grupo; o.o = c.opcao; }
    return o;
  });
}
const saida = `// GERADO por dev/gerar_dados.mjs a partir de templates/campos.json — não editar à mão.
// n=nome do campo, p=página (0), r=[x0,y0,x1,y1] em pontos PDF, t=t(exto)/m(arca), f=fonte padrão, ml=multilinha, g/o=grupo/opção.
export const CAMPOS_BO = ${JSON.stringify(compacto(campos.bo))};
export const CAMPOS_ENV = ${JSON.stringify(compacto(campos.envolvidos))};
`;
writeFileSync(new URL('js/pdf/campos-modelo.js', raiz), saida);

// Larguras Helvetica (unidades de 1/1000 em) para os caracteres WinAnsi usuais
const doc = await PDFDocument.create();
const f = await doc.embedFont(StandardFonts.Helvetica);
const larg = {};
for (let c = 32; c < 256; c++) {
  if (c >= 127 && c < 160) continue;
  const ch = String.fromCharCode(c);
  try { larg[ch] = Math.round(f.widthOfTextAtSize(ch, 1000)); } catch { /* sem glifo */ }
}
for (const ch of ['–', '—', '‘', '’', '“', '”', '•', '…', '€']) {
  try { larg[ch] = Math.round(f.widthOfTextAtSize(ch, 1000)); } catch { /* */ }
}
const alt = f.heightAtSize(1000);
writeFileSync(new URL('js/helvetica.js', raiz), `// GERADO por dev/gerar_dados.mjs — larguras da Helvetica (1/1000 em) usadas para estimar capacidade.
export const LARGURAS = ${JSON.stringify(larg)};
export const ALTURA_LINHA = ${alt / 1000};
`);
// Larguras Times-Roman (usadas pela permuta para avisar, na tela, sobre textos longos)
const tr = await doc.embedFont(StandardFonts.TimesRoman);
const largT = {};
for (let c = 32; c < 256; c++) {
  if (c >= 127 && c < 160) continue;
  const ch = String.fromCharCode(c);
  try { largT[ch] = Math.round(tr.widthOfTextAtSize(ch, 1000)); } catch { /* sem glifo */ }
}
writeFileSync(new URL('js/times.js', raiz), `// GERADO por dev/gerar_dados.mjs — larguras da Times-Roman (1/1000 em).
export const LARGURAS_TIMES = ${JSON.stringify(largT)};
`);
console.log('ok', campos.bo.length, campos.envolvidos.length, 'altura', alt);
