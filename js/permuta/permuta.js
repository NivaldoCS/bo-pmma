// Módulo PERMUTA DE SERVIÇO — dados, validação e montagem dos textos.
// Puro (sem pdf-lib): usado pela tela e pelo gerador. Nada sai do aparelho.
import { PERMUTA } from './coordenadas.js';

export const VERSAO_PERMUTA = 1;
const CHAVE_SESSAO = 'pmmabo.permuta';
const CHAVE_LOCAL = 'pmmabo.permutaRascunho';
const CHAVE_SALVAR = 'pmmabo.salvarPermuta';

export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const pessoa = () => ({ posto: '', numero: '', nome: '' });

export function localPadrao(prefs = {}) {
  const m = (prefs.municipio || 'Barão de Grajaú').trim();
  const uf = (prefs.uf || 'MA').trim();
  return uf ? `${m} - ${uf}` : m;
}

function hoje() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function permutaVazia(prefs = {}) {
  return {
    formato: VERSAO_PERMUTA,
    solicitante: pessoa(),
    substituto: pessoa(),
    servico: { data: '', inicio: '', fim: '', terminaDiaSeguinte: false },
    emissao: { local: localPadrao(prefs), data: hoje() },
    substitutoTexto: '', // forma usada no corpo do pedido, quando o usuário precisa abreviar
  };
}

// ------------------------------------------------------------------ armazenamento (mesma política do BO)
function ss() { try { return window.sessionStorage; } catch { return null; } }
function ls() { try { return window.localStorage; } catch { return null; } }

export function salvarPermutaNoAparelhoAtivo() { const l = ls(); return !!(l && l.getItem(CHAVE_SALVAR) === '1'); }
export function definirSalvarPermuta(ativo, estado) {
  const l = ls(); if (!l) return;
  if (ativo) { l.setItem(CHAVE_SALVAR, '1'); if (estado) l.setItem(CHAVE_LOCAL, JSON.stringify(estado)); } else { l.removeItem(CHAVE_SALVAR); l.removeItem(CHAVE_LOCAL); }
}
export function salvarPermuta(estado) {
  const t = JSON.stringify(estado);
  const s = ss(); if (s) s.setItem(CHAVE_SESSAO, t);
  if (salvarPermutaNoAparelhoAtivo()) { const l = ls(); if (l) l.setItem(CHAVE_LOCAL, t); }
}
export function carregarPermuta(prefs) {
  const s = ss(); const l = ls();
  const t = (s && s.getItem(CHAVE_SESSAO)) || (salvarPermutaNoAparelhoAtivo() && l && l.getItem(CHAVE_LOCAL));
  if (!t) return null;
  try { return normalizar(JSON.parse(t), prefs); } catch { return null; }
}
export function apagarPermuta() {
  const s = ss(); if (s) s.removeItem(CHAVE_SESSAO);
  const l = ls(); if (l) l.removeItem(CHAVE_LOCAL);
}
export function normalizar(o, prefs) {
  const b = permutaVazia(prefs);
  if (!o || typeof o !== 'object') return b;
  const str = (v) => (v == null ? '' : String(v));
  for (const k of ['solicitante', 'substituto']) for (const c of ['posto', 'numero', 'nome']) b[k][c] = str(o[k] && o[k][c]);
  for (const c of ['data', 'inicio', 'fim']) b.servico[c] = str(o.servico && o.servico[c]);
  b.servico.terminaDiaSeguinte = !!(o.servico && o.servico.terminaDiaSeguinte);
  if (o.emissao) { b.emissao.local = str(o.emissao.local); b.emissao.data = str(o.emissao.data); }
  b.substitutoTexto = str(o.substitutoTexto);
  return b;
}

// ------------------------------------------------------------------ textos
const limpa = (s) => String(s || '').replace(/\s+/g, ' ').trim();

/** "Cb PM" -> "Cb" no cabeçalho, pois o modelo já traz "PM nº" logo depois. */
export function postoSemPM(posto) { return limpa(posto).replace(/\s*\bPM\b\.?$/i, '').trim(); }

export function identificacaoSubstitutoPadrao(s) {
  const posto = postoSemPM(s.posto); const num = limpa(s.numero); const nome = limpa(s.nome);
  return [posto && `${posto} PM`, num, nome].filter(Boolean).join(' '); // formato compacto: o espaço do modelo é curto
}
export function identificacaoSubstituto(e) {
  return limpa(e.substitutoTexto) || identificacaoSubstitutoPadrao(e.substituto);
}
/** Texto que vai no corpo: identificação + ponto final (o modelo emenda "A fim de que..."). */
export function substitutoNoCorpo(e) {
  const t = identificacaoSubstituto(e);
  return t ? (/[.]$/.test(t) ? t : `${t}.`) : '';
}

function partesData(d) {
  const m = String(d || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const dt = new Date(+m[3], +m[2] - 1, +m[1]);
  if (dt.getFullYear() !== +m[3] || dt.getMonth() !== +m[2] - 1 || dt.getDate() !== +m[1]) return null;
  return { d: m[1], m: m[2], a: m[3], dt };
}
function partesHora(h) {
  const m = String(h || '').match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  return m ? { h: m[1], m: m[2], min: +m[1] * 60 + +m[2] } : null;
}

export function diaPorExtenso(d) { return +d === 1 ? '1º' : String(+d); }

export function diaSeguinte(data) {
  const p = partesData(data); if (!p) return '';
  const n = new Date(p.dt); n.setDate(n.getDate() + 1);
  const z = (x) => String(x).padStart(2, '0');
  return `${z(n.getDate())}/${z(n.getMonth() + 1)}/${n.getFullYear()}`;
}

export function horarioAtravessaMeiaNoite(e) {
  const i = partesHora(e.servico.inicio); const f = partesHora(e.servico.fim);
  return !!(i && f && f.min <= i.min);
}

/** Valores de cada área do modelo (somente os que foram informados). */
export function montarValores(e) {
  const v = {};
  // o modelo limpo não tem mais o local nem o ano: são sempre escritos
  const local = limpa(e.emissao.local);
  if (local) v.emissao_local = local;
  const pe = partesData(e.emissao.data);
  if (pe) { v.emissao_dia = diaPorExtenso(pe.d); v.emissao_mes = MESES[+pe.m - 1]; v.emissao_ano = pe.a; }
  v.solicitante_posto = postoSemPM(e.solicitante.posto);
  v.solicitante_numero = limpa(e.solicitante.numero);
  v.solicitante_nome = limpa(e.solicitante.nome);
  const ps = partesData(e.servico.data);
  if (ps) { v.servico_dia = ps.d; v.servico_mes = ps.m; v.servico_ano = ps.a; }
  const hi = partesHora(e.servico.inicio); const hf = partesHora(e.servico.fim);
  if (hi) { v.inicio_hora = hi.h; v.inicio_min = hi.m; }
  if (hf) { v.fim_hora = hf.h; v.fim_min = hf.m; }
  v.substituto = substitutoNoCorpo(e);
  for (const k of Object.keys(v)) if (!v[k]) delete v[k];
  return v;
}

/** Maior tamanho de fonte (entre tam e min, passo 0,25) em que o texto cabe. */
export function ajustarFonte(texto, area, medir) {
  const larg = area.x1 - area.x0;
  for (let t = area.tam; t >= area.min - 1e-9; t -= 0.25) {
    if (medir(texto, t) <= larg) return { tamanho: Math.round(t * 100) / 100, cabe: true };
  }
  return { tamanho: area.min, cabe: false, largura: medir(texto, area.min), disponivel: larg };
}

const ROTULOS = {
  emissao_local: 'Local de emissão', solicitante_posto: 'Posto/graduação do solicitante', solicitante_numero: 'Nº funcional do solicitante',
  solicitante_nome: 'Nome do solicitante', substituto: 'Identificação do substituto no corpo do pedido',
};

const digitos = (s) => String(s || '').replace(/\D/g, '');
function pareceCpf(n) {
  const d = digitos(n);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  for (const t of [9, 10]) {
    let s = 0; for (let i = 0; i < t; i++) s += +d[i] * (t + 1 - i);
    if (((s * 10) % 11) % 10 !== +d[t]) return false;
  }
  return true;
}

/**
 * Valida antes de gerar. medir(texto, tamanho) -> largura em pontos (Times-Roman).
 * suportado(ch) -> se o caractere existe na fonte.
 */
export function validar(e, medir, suportado = () => true) {
  const erros = []; const avisos = [];
  const exigir = (v, msg) => { if (!limpa(v)) erros.push(msg); };
  for (const [k, nome] of [['solicitante', 'SOLICITANTE'], ['substituto', 'SUBSTITUTO']]) {
    exigir(e[k].posto, `${nome}: informe o posto ou graduação.`);
    exigir(e[k].numero, `${nome}: informe o número de identificação funcional (PM nº).`);
    exigir(e[k].nome, `${nome}: informe o nome completo.`);
    const n = limpa(e[k].numero);
    if (n && !/^[0-9][0-9.\-/ ]*$/.test(n)) avisos.push(`${nome}: o número funcional tem caracteres além de dígitos, ponto ou hífen. Confira.`);
    if (pareceCpf(n)) avisos.push(`${nome}: o número informado parece um CPF. O campo é o número de identificação funcional (PM nº).`);
    else if (digitos(n).length >= 10) avisos.push(`${nome}: o número informado é longo (parece telefone ou CPF). Confira se é o número funcional.`);
  }
  const s = limpa(e.solicitante.numero); const t = limpa(e.substituto.numero);
  if (s && s === t) avisos.push('Solicitante e substituto estão com o mesmo número funcional.');
  if (!limpa(e.servico.data)) erros.push('Informe a data do serviço que será assumido pelo substituto.');
  else if (!partesData(e.servico.data)) erros.push('Data do serviço inválida (use dd/mm/aaaa).');
  if (!limpa(e.servico.inicio)) erros.push('Informe o horário inicial do serviço.');
  else if (!partesHora(e.servico.inicio)) erros.push('Horário inicial inválido (use hh:mm).');
  if (!limpa(e.servico.fim)) erros.push('Informe o horário final do serviço.');
  else if (!partesHora(e.servico.fim)) erros.push('Horário final inválido (use hh:mm).');
  if (horarioAtravessaMeiaNoite(e) && !e.servico.terminaDiaSeguinte) {
    erros.push('O horário final é anterior ou igual ao inicial. Confirme que o serviço termina no dia seguinte ou corrija os horários.');
  }
  if (!limpa(e.emissao.local)) erros.push('Informe o local de emissão.');
  if (!limpa(e.emissao.data)) erros.push('Informe a data de emissão.');
  else if (!partesData(e.emissao.data)) erros.push('Data de emissão inválida (use dd/mm/aaaa).');

  const valores = montarValores(e);
  const ajustes = {};
  for (const [k, txt] of Object.entries(valores)) {
    const ruins = [...new Set([...txt].filter((ch) => !suportado(ch)))];
    if (ruins.length) { erros.push(`${ROTULOS[k] || k}: caractere(s) não suportado(s) pela fonte do documento: ${ruins.join(' ')}`); continue; }
    const a = PERMUTA.areas[k];
    const r = ajustarFonte(txt, a, medir);
    ajustes[k] = r;
    if (!r.cabe) {
      const dica = k === 'substituto'
        ? 'O espaço entre "com o" e "A fim de" é curto. Use o campo "Identificação no corpo do pedido" para abreviar (ex.: iniciais dos sobrenomes do meio). Nada é cortado automaticamente.'
        : 'Revise ou abrevie o texto. Nada é cortado automaticamente.';
      erros.push(`${ROTULOS[k] || k}: o texto não cabe no espaço do documento nem com a fonte mínima (${a.min} pt). ${dica}`);
    } else if (r.tamanho < a.tam) {
      avisos.push(`${ROTULOS[k] || k}: fonte reduzida para ${String(r.tamanho).replace('.', ',')} pt para caber no espaço.`);
    }
  }
  return { erros, avisos, valores, ajustes };
}

export function nomeArquivoPermuta(e) {
  const p = partesData(e.servico.data);
  return p ? `Solicitacao_Permuta_${p.a}-${p.m}-${p.d}.pdf` : 'Solicitacao_Permuta.pdf';
}
