// Gerador da Solicitação de Permuta (carregado só quando o usuário pede).
// Usa o mesmo pdf-lib do projeto. O texto é desenhado na própria página do
// modelo em branco: não há campos, imagens de assinatura, senha ou restrições.
import { PDFDocument, StandardFonts, rgb } from '../../vendor/pdf-lib.esm.min.js';
import { PERMUTA } from './coordenadas.js';
import { validar, nomeArquivoPermuta } from './permuta.js';

/**
 * gerarPermuta(estado, { carregarModelo }) -> { bytes, nome, avisos }
 * Lança Error com .erros (lista) se houver pendências; nada é gerado nesse caso.
 */
export async function gerarPermuta(estado, { carregarModelo }) {
  const doc = await PDFDocument.load(await carregarModelo('permuta.pdf'));
  const fonte = await doc.embedFont(StandardFonts.TimesRoman);
  const conjunto = new Set(fonte.getCharacterSet());
  const medir = (t, tam) => fonte.widthOfTextAtSize(t, tam);
  const v = validar(estado, medir, (ch) => conjunto.has(ch.codePointAt(0)));
  if (v.erros.length) {
    const e = new Error('Há dados a corrigir antes de gerar o documento.');
    e.erros = v.erros;
    throw e;
  }
  const pg = doc.getPage(0);
  const H = pg.getHeight();
  const preto = rgb(0, 0, 0);
  for (const [k, texto] of Object.entries(v.valores)) {
    const a = PERMUTA.areas[k];
    const tam = v.ajustes[k].tamanho;
    const w = medir(texto, tam);
    let x = a.x0;
    if (a.alinhar === 'centro') x = a.x0 + (a.x1 - a.x0 - w) / 2;
    else if (a.alinhar === 'direita') x = a.x1 - w;
    pg.drawText(texto, { x, y: H - a.base, size: tam, font: fonte, color: preto });
  }
  doc.setTitle('Solicitação de permuta de serviço');
  doc.setSubject('Solicitação de permuta de serviço - aguardando assinaturas');
  doc.setProducer('pmma-boletim (gerado no próprio aparelho)');
  doc.setCreator('pmma-boletim');
  doc.setKeywords([]);
  const bytes = await doc.save({ useObjectStreams: false });
  return { bytes, nome: nomeArquivoPermuta(estado), avisos: v.avisos };
}
