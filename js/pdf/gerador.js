// Gerador dos PDFs. Carregado somente quando o usuário pede um documento.
// Preenche os CAMPOS EXISTENTES dos modelos limpos (pdf-lib), gera aparências,
// e — quando o texto não cabe — cria folha de continuação identificada.
import {
  PDFDocument, StandardFonts, PDFName, PDFHexString, PDFBool, TextAlignment,
  layoutMultilineText, rgb,
} from '../../vendor/pdf-lib.esm.min.js';
import { CAMPOS_BO, CAMPOS_ENV } from './campos-modelo.js';
import { mapearBO, mapearFicha, planejarFichas, complementoBO, nomeArquivo } from './mapa.js';

const META_BO = new Map(CAMPOS_BO.map((c) => [c.n, c]));
const META_ENV = new Map(CAMPOS_ENV.map((c) => [c.n, c]));
const FONTE_MIN_LINHA = 6;         // menor fonte aceita em campos de uma linha
const FONTE_MULTI = [10, 9.5, 9];  // tamanhos aceitos em campos multilinha
const MARCA_CONT = ' [continua na folha de continuação]';

// ------------------------------------------------------------------ texto
function criarSanitizador(fonte) {
  const ok = new Set(fonte.getCharacterSet());
  const trocas = { '‐': '-', '‑': '-', '−': '-', ' ': ' ', ' ': ' ', '​': '', '﻿': '', '\t': ' ' };
  return function sanitizar(texto, avisos, onde) {
    let out = '';
    const ruins = new Set();
    for (const ch of String(texto).replace(/\r\n?/g, '\n')) {
      if (ch === '\n') { out += ch; continue; }
      if (trocas[ch] !== undefined) { out += trocas[ch]; continue; }
      const cp = ch.codePointAt(0);
      if (ok.has(cp)) { out += ch; continue; }
      const base = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
      if (base && [...base].every((b) => ok.has(b.codePointAt(0)))) { out += base; continue; }
      ruins.add(ch);
    }
    if (ruins.size && avisos) avisos.push(`${onde}: caracteres sem suporte na fonte do formulário foram omitidos (${[...ruins].join(' ')}).`);
    return out;
  };
}

function larguraCampo(r) { return (r[2] - r[0]) - 4; }
function alturaCampo(r) { return r[3] - r[1]; }

function cabeLinha(fonte, texto, tamanho, r) {
  return fonte.widthOfTextAtSize(texto, tamanho) <= larguraCampo(r);
}

function tamanhoLinha(fonte, texto, meta) {
  const r = meta.r;
  const max = Math.min(meta.f, alturaCampo(r) * 0.8);
  if (!texto) return { tamanho: max, cabe: true };
  const w = fonte.widthOfTextAtSize(texto, 1);
  const t = Math.min(max, larguraCampo(r) / w);
  if (t >= FONTE_MIN_LINHA) return { tamanho: Math.floor(t * 4) / 4, cabe: true };
  return { tamanho: FONTE_MIN_LINHA, cabe: false };
}

function limitesMulti(r) {
  // igual ao provedor de aparência padrão do pdf-lib: borda 0 + padding 1
  return { x: 1, y: 1, width: (r[2] - r[0]) - 2, height: (r[3] - r[1]) - 2 };
}

function cabeMulti(fonte, texto, tamanho, r) {
  const b = limitesMulti(r);
  const { lines } = layoutMultilineText(texto, { alignment: TextAlignment.Left, fontSize: tamanho, font: fonte, bounds: b });
  const alt = fonte.heightAtSize(tamanho) * 1.2;
  return lines.length * alt <= b.height + 0.01;
}

// Maior prefixo (em limites de palavra) que cabe com o sufixo
function dividirParaCaber(texto, cabe) {
  const cortes = [];
  const re = /\s+/g; let m;
  while ((m = re.exec(texto))) cortes.push(m.index);
  cortes.push(texto.length);
  let lo = 0; let hi = cortes.length - 1; let melhor = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cabe(texto.slice(0, cortes[mid]).trimEnd())) { melhor = mid; lo = mid + 1; } else hi = mid - 1;
  }
  if (melhor < 0) {
    // nem a primeira palavra cabe: corta por caractere
    let n = 0;
    while (n < texto.length && cabe(texto.slice(0, n + 1))) n++;
    return [texto.slice(0, n), texto.slice(n)];
  }
  const fim = cortes[melhor];
  return [texto.slice(0, fim).trimEnd(), texto.slice(fim).trimStart()];
}

// Distribui texto em linhas de campos de linha única (ex.: outras providências)
function distribuirLinhas(fonte, texto, metas) {
  const tamanho = Math.min(...metas.map((m) => Math.min(m.f, alturaCampo(m.r) * 0.8)));
  let resto = texto.replace(/\s*\n\s*/g, ' ').trim();
  const valores = [];
  metas.forEach((m, i) => {
    if (!resto) { valores.push(''); return; }
    const ultimo = i === metas.length - 1;
    if (cabeLinha(fonte, resto, tamanho, m.r)) { valores.push(resto); resto = ''; return; }
    if (ultimo) {
      const [a, b] = dividirParaCaber(resto, (s) => cabeLinha(fonte, s + MARCA_CONT, tamanho, m.r));
      valores.push(a + MARCA_CONT); resto = b; return;
    }
    const [a, b] = dividirParaCaber(resto, (s) => cabeLinha(fonte, s, tamanho, m.r));
    valores.push(a); resto = b;
  });
  return { valores, tamanho, resto };
}

// ------------------------------------------------------------------ preenchimento
/**
 * Preenche um documento (BO ou ficha). Retorna o que excedeu, para a continuação.
 */
async function preencher(doc, metaMap, mapeado, sanitizar, avisos, rotuloDoc) {
  const form = doc.getForm();
  const fonte = await doc.embedFont(StandardFonts.Helvetica);
  const excedentes = []; // {rotulo, texto}
  const continuacoes = []; // {titulo, texto}

  for (const [nome, bruto] of Object.entries(mapeado.campos)) {
    const meta = metaMap.get(nome);
    if (!meta) throw new Error(`Campo inexistente no modelo: ${nome}`);
    const tf = form.getTextField(nome);
    let valor = sanitizar(bruto, avisos, `${rotuloDoc} / ${nome}`);
    if (meta.t === 'm') {
      tf.setAlignment(TextAlignment.Center);
      tf.setFontSize(Math.min(11, alturaCampo(meta.r) * 0.8));
      tf.setText('X');
      continue;
    }
    if (meta.ml) {
      tf.enableMultiline();
      let escolhido = null;
      for (const t of FONTE_MULTI) if (cabeMulti(fonte, valor, t, meta.r)) { escolhido = t; break; }
      if (escolhido == null) {
        escolhido = FONTE_MULTI[0];
        const [a, b] = dividirParaCaber(valor, (s) => cabeMulti(fonte, s + MARCA_CONT, escolhido, meta.r));
        valor = a + MARCA_CONT;
        continuacoes.push({ campo: nome, texto: b });
      }
      tf.setFontSize(escolhido);
      tf.setText(valor);
      continue;
    }
    valor = valor.replace(/\s*\n\s*/g, ' ');
    const { tamanho, cabe } = tamanhoLinha(fonte, valor, meta);
    if (!cabe) {
      const [a] = dividirParaCaber(valor, (s) => cabeLinha(fonte, `${s}…*`, tamanho, meta.r));
      excedentes.push({ campo: nome, texto: valor });
      valor = `${a}…*`;
    }
    tf.setFontSize(tamanho);
    tf.setText(valor);
  }

  for (const bloco of mapeado.blocos || []) {
    if (!bloco.texto) continue;
    const metas = bloco.campos.map((n) => metaMap.get(n));
    const texto = sanitizar(bloco.texto, avisos, `${rotuloDoc} / ${bloco.campos[0]}`);
    const { valores, tamanho, resto } = distribuirLinhas(fonte, texto, metas);
    bloco.campos.forEach((n, i) => {
      if (!valores[i]) return;
      const tf = form.getTextField(n);
      tf.setFontSize(tamanho);
      tf.setText(valores[i]);
    });
    if (resto) continuacoes.push({ campo: bloco.campos[0], titulo: bloco.titulo, texto: resto });
  }

  form.updateFieldAppearances(fonte);
  return { excedentes, continuacoes };
}

function renomearCampos(doc, prefixo) {
  const form = doc.getForm();
  for (const f of form.getFields()) {
    const nome = f.getName();
    f.acroField.dict.set(PDFName.of('T'), PDFHexString.fromText(`${prefixo}${nome}`));
    for (const w of f.acroField.getWidgets()) w.dict.delete(PDFName.of('P'));
  }
}

// ------------------------------------------------------------------ continuação
function quebrarTexto(fonte, texto, tamanho, largura) {
  const linhas = [];
  for (const par of String(texto).split('\n')) {
    if (!par.trim()) { linhas.push(''); continue; }
    let atual = '';
    for (const palavra of par.split(/\s+/)) {
      if (!palavra) continue;
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (fonte.widthOfTextAtSize(tentativa, tamanho) <= largura) { atual = tentativa; continue; }
      if (atual) linhas.push(atual);
      // palavra maior que a linha
      let p = palavra;
      while (fonte.widthOfTextAtSize(p, tamanho) > largura) {
        let n = p.length;
        while (n > 1 && fonte.widthOfTextAtSize(p.slice(0, n), tamanho) > largura) n--;
        linhas.push(p.slice(0, n)); p = p.slice(n);
      }
      atual = p;
    }
    linhas.push(atual);
  }
  return linhas;
}

async function desenharContinuacao(out, { titulo, identificacao, secoes, sanitizar, avisos }) {
  const fonte = await out.embedFont(StandardFonts.Helvetica);
  const negrito = await out.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28; const H = 841.89; const M = 42; const larg = W - 2 * M;
  const TAM = 10; const ALT = TAM * 1.35;
  // monta itens de desenho com paginação
  const itens = []; // {tipo:'titulo'|'linha'|'assin'|'espaco', texto}
  for (const s of secoes) {
    itens.push({ tipo: 'secao', texto: sanitizar(s.titulo, avisos, 'continuação') });
    for (const p of s.paragrafos || []) {
      for (const l of quebrarTexto(fonte, sanitizar(p, avisos, 'continuação'), TAM, larg)) itens.push({ tipo: 'linha', texto: l });
      itens.push({ tipo: 'espaco' });
    }
    for (const a of s.assinaturas || []) itens.push({ tipo: 'assin', texto: sanitizar(a, avisos, 'continuação') });
  }
  const paginas = [];
  let atual = []; let y = 0;
  const topo = H - M - 74; const base = M + 34;
  const altura = (it) => ({ secao: 26, linha: ALT, espaco: 6, assin: 34 }[it.tipo]);
  y = topo;
  for (const it of itens) {
    const h = altura(it);
    if (y - h < base && atual.length) { paginas.push(atual); atual = []; y = topo; }
    atual.push({ ...it, y }); y -= h;
  }
  if (atual.length) paginas.push(atual);
  const preto = rgb(0, 0, 0); const cinza = rgb(0.35, 0.35, 0.35);
  paginas.forEach((itensPag, i) => {
    const pg = out.addPage([W, H]);
    pg.drawText('ESTADO DO MARANHÃO - POLÍCIA MILITAR', { x: M, y: H - M - 8, size: 9, font: fonte, color: cinza });
    pg.drawText(sanitizar(titulo, avisos, 'continuação'), { x: M, y: H - M - 26, size: 13, font: negrito, color: preto });
    for (const [k, l] of identificacao.entries()) {
      pg.drawText(sanitizar(l, avisos, 'continuação'), { x: M, y: H - M - 42 - k * 12, size: 9, font: fonte, color: preto });
    }
    pg.drawLine({ start: { x: M, y: H - M - 66 }, end: { x: W - M, y: H - M - 66 }, thickness: 0.8, color: preto });
    for (const it of itensPag) {
      if (it.tipo === 'secao') pg.drawText(it.texto, { x: M, y: it.y - 14, size: 10.5, font: negrito, color: preto });
      else if (it.tipo === 'linha') pg.drawText(it.texto, { x: M, y: it.y - TAM, size: TAM, font: fonte, color: preto });
      else if (it.tipo === 'assin') {
        pg.drawText(it.texto, { x: M, y: it.y - 22, size: 9.5, font: fonte, color: preto });
        pg.drawLine({ start: { x: W - M - 190, y: it.y - 24 }, end: { x: W - M, y: it.y - 24 }, thickness: 0.6, color: preto });
        pg.drawText('Assinatura', { x: W - M - 120, y: it.y - 33, size: 7, font: fonte, color: cinza });
      }
    }
    pg.drawLine({ start: { x: M, y: M + 20 }, end: { x: W - M, y: M + 20 }, thickness: 0.5, color: cinza });
    pg.drawText(sanitizar(`${titulo} - folha ${i + 1} de ${paginas.length} - ${identificacao[0]}`, avisos, 'continuação'),
      { x: M, y: M + 8, size: 7.5, font: fonte, color: cinza });
  });
  return paginas.length;
}

// ------------------------------------------------------------------ combinação
async function anexar(out, src, prefixo, modo) {
  if (modo === 'impressao') {
    src.getForm().flatten({ updateFieldAppearances: false });
  } else {
    renomearCampos(src, prefixo);
  }
  const paginas = await out.copyPages(src, src.getPageIndices());
  const acro = out.catalog.getOrCreateAcroForm();
  for (const p of paginas) {
    out.addPage(p);
    if (modo === 'impressao') continue;
    const annots = p.node.Annots();
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i++) {
      const ref = annots.get(i);
      const dict = out.context.lookup(ref);
      if (dict && dict.get(PDFName.of('Subtype')) === PDFName.of('Widget')) {
        dict.set(PDFName.of('P'), p.ref);
        acro.addField(ref);
      }
    }
  }
}

async function finalizar(out, modo) {
  if (modo !== 'impressao') {
    const helv = await out.embedFont(StandardFonts.Helvetica);
    const acro = out.catalog.getOrCreateAcroForm();
    acro.dict.set(PDFName.of('DR'), out.context.obj({ Font: { Helv: helv.ref } }));
    acro.dict.set(PDFName.of('DA'), PDFHexString.fromText('/Helv 0 Tf 0 g'));
    acro.dict.set(PDFName.of('NeedAppearances'), PDFBool.False);
  }
  out.setTitle('Documento de ocorrência - PMMA');
  out.setProducer('Preenchimento local - modelos PMMA 2026');
  out.setCreator('pmma-boletim');
  return out.save({ useObjectStreams: true });
}

function identificacaoBO(estado) {
  const o = estado.ocorrencia;
  const num = o.numeroBo || '(sem número)';
  const linhas = [`Boletim de Ocorrência - Nº CIOPS/COPOM: ${num}`];
  const extra = [o.unidade && `Unidade: ${o.unidade}`, o.datas.fato.data && `Data do fato: ${o.datas.fato.data}${o.datas.fato.hora ? ` ${o.datas.fato.hora}` : ''}`].filter(Boolean);
  if (extra.length) linhas.push(extra.join('  |  '));
  return linhas;
}

// ------------------------------------------------------------------ API
/**
 * gerarDocumento(estado, {tipo: 'bo'|'fichas'|'conjunto', modo: 'editavel'|'impressao', carregarModelo})
 * carregarModelo(nome) -> Promise<ArrayBuffer|Uint8Array> ('bo.pdf' | 'envolvidos-veiculos.pdf')
 */
export async function gerarDocumento(estado, { tipo = 'bo', modo = 'editavel', carregarModelo }) {
  const avisos = [];
  const out = await PDFDocument.create();
  const sanitizar = criarSanitizador(await out.embedFont(StandardFonts.Helvetica));
  let bytesBo = null; let bytesEnv = null;
  const resumo = { paginas: 0, fichas: [], continuacoes: [] };

  if (tipo === 'bo' || tipo === 'conjunto') {
    bytesBo = await carregarModelo('bo.pdf');
    const src = await PDFDocument.load(bytesBo);
    const mapeado = mapearBO(estado);
    const r = await preencher(src, META_BO, mapeado, sanitizar, avisos, 'BO');
    await anexar(out, src, 'BO-', modo);
    const secoes = [];
    const relatoCont = r.continuacoes.find((c) => c.campo === 'relato');
    if (relatoCont) secoes.push({ titulo: '5 - RELATO POLICIAL DO OCORRIDO (continuação)', paragrafos: [relatoCont.texto] });
    if (mapeado.objetosExtras.length) {
      const inicio = 6;
      secoes.push({ titulo: '6 - DADOS DOS OBJETOS (continuação)', paragrafos: mapeado.objetosExtras.map((t, i) => `${inicio + i}. ${t}`) });
    }
    for (const c of r.continuacoes.filter((c) => c.campo !== 'relato')) secoes.push({ titulo: c.titulo || c.campo, paragrafos: [c.texto] });
    if (mapeado.atendentesExtras.length) {
      secoes.push({ titulo: '8 - ATENDENTE DA OCORRÊNCIA (continuação) - posto/graduação, matrícula e nome', assinaturas: mapeado.atendentesExtras });
    }
    const comp = complementoBO(estado);
    if (comp.length) secoes.push({ titulo: 'INFORMAÇÕES COMPLEMENTARES (sem campo correspondente no formulário)', paragrafos: comp });
    if (r.excedentes.length) {
      secoes.push({ titulo: 'CAMPOS COM TEXTO MAIOR QUE O ESPAÇO DO FORMULÁRIO (marcados com …*)', paragrafos: r.excedentes.map((e) => `${e.campo}: ${e.texto}`) });
    }
    if (secoes.length) {
      const n = await desenharContinuacao(out, { titulo: 'FOLHA DE CONTINUAÇÃO - BOLETIM DE OCORRÊNCIA', identificacao: identificacaoBO(estado), secoes, sanitizar, avisos });
      resumo.continuacoes.push({ doc: 'BO', paginas: n, motivos: secoes.map((s) => s.titulo) });
    }
  }

  if (tipo === 'fichas' || tipo === 'conjunto') {
    const plano = planejarFichas(estado);
    if (!plano.length) avisos.push('Nenhum envolvido ou veículo cadastrado: nenhuma ficha foi gerada.');
    bytesEnv = plano.length ? await carregarModelo('envolvidos-veiculos.pdf') : null;
    let k = 0;
    for (const f of plano) {
      k += 1;
      const src = await PDFDocument.load(bytesEnv);
      const mapeado = mapearFicha(estado, f.envolvido, f.veiculo);
      const r = await preencher(src, META_ENV, mapeado, sanitizar, avisos, `Ficha ${f.rotulo}`);
      await anexar(out, src, `F${k}-`, modo);
      resumo.fichas.push(f.rotulo);
      const secoes = [];
      const rel = r.continuacoes.find((c) => c.campo === 'relato_texto');
      if (rel) secoes.push({ titulo: 'RELATO INDIVIDUAL (continuação)', paragrafos: [rel.texto] });
      for (const c of r.continuacoes.filter((c) => c.campo !== 'relato_texto')) secoes.push({ titulo: c.titulo || c.campo, paragrafos: [c.texto] });
      if (r.excedentes.length) secoes.push({ titulo: 'CAMPOS COM TEXTO MAIOR QUE O ESPAÇO DO FORMULÁRIO (marcados com …*)', paragrafos: r.excedentes.map((e) => `${e.campo}: ${e.texto}`) });
      if (secoes.length) {
        const id = identificacaoBO(estado);
        id[0] = `${id[0]}  -  Ficha ${f.rotulo}`;
        const n = await desenharContinuacao(out, { titulo: 'FOLHA DE CONTINUAÇÃO - DOS ENVOLVIDOS E DOS VEÍCULOS', identificacao: id, secoes, sanitizar, avisos });
        resumo.continuacoes.push({ doc: `Ficha ${f.rotulo}`, paginas: n, motivos: secoes.map((s) => s.titulo) });
      }
    }
  }

  if (out.getPageCount() === 0) throw new Error('Nada para gerar: cadastre ao menos um envolvido ou veículo para as fichas.');
  const bytes = await finalizar(out, modo);
  resumo.paginas = out.getPageCount();
  return { bytes, nome: nomeArquivo(estado, tipo, modo), avisos: [...new Set(avisos)], resumo };
}

// Estimativa usada na interface para o histórico (mesmo algoritmo do gerador)
export async function capacidadeRelato(texto) {
  const doc = await PDFDocument.create();
  const fonte = await doc.embedFont(StandardFonts.Helvetica);
  const meta = META_BO.get('relato');
  return FONTE_MULTI.some((t) => cabeMulti(fonte, texto, t, meta.r));
}
