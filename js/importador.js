// Importador LOCAL de relatórios colados do WhatsApp. Sem IA, sem rede.
// analisar(texto) -> resultado estruturado com o que foi identificado,
// pendências e conflitos. aplicar(estado, resultado, escolhas) -> preenche
// somente o que o usuário confirmou, sem apagar o que já foi revisado.
import { novoEnvolvido, novoVeiculo, novoObjeto, novoPolicial, renumerar } from './estado.js';

// ------------------------------------------------------------------ normalização
export function semAcento(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}
function chave(s) {
  return semAcento(s).toUpperCase().replace(/[º°ª]/g, '').replace(/\./g, '').replace(/[^A-Z0-9/ ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
const RE_EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}︎️‍⃣]/gu;

export function limparLinha(l) {
  return l
    .replace(RE_EMOJI, '')
    .replace(/[​‌⁠﻿]/g, '')
    .replace(/\*/g, '')
    .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,;:!?])/g, '$1$2')
    .replace(/(^|\s)~([^~]+)~(?=\s|$|[.,;:!?])/g, '$1$2')
    .replace(/[\t ]+/g, ' ')
    .replace(/^\s*(?:[•▪▫◦●○➡→►▶✓✔-]\s+)+/, '')
    .replace(/ {2,}/g, ' ')
    .trim();
}

// ------------------------------------------------------------------ rótulos
const ROTULOS = [
  ['servicoDia', ['SERVICO DO DIA', 'SERVICO', 'DATA DO SERVICO', 'SERVICO DIA']],
  ['cpu', ['CPU', 'CPU DO BPM', 'CPU DO DIA', 'CPU BPM', 'CPU DE SERVICO']],
  ['titulo', ['TITULO DA OCORRENCIA', 'TITULO', 'OCORRENCIA', 'NATUREZA', 'NATUREZA DA OCORRENCIA', 'TIPO DE OCORRENCIA', 'TIPO DA OCORRENCIA', 'FATO']],
  ['equipe', ['EQUIPE', 'GUARNICAO', 'GU', 'VTR', 'VIATURA', 'COMPOSICAO', 'EQUIPE DE SERVICO', 'COMPOSICAO DA EQUIPE', 'GUARNICAO DE SERVICO', 'POLICIAIS']],
  ['numeroBo', ['BO', 'B O', 'N BO', 'NO BO', 'NUMERO DO BO', 'N DO BO', 'BOLETIM', 'BOLETIM DE OCORRENCIA', 'CIOPS', 'COPOM', 'N CIOPS', 'N CIOPS/COPOM', 'CIOPS/COPOM', 'BOP']],
  ['dataHora', ['DATA/HORA', 'DATA E HORA', 'DATA HORA']],
  ['data', ['DATA', 'DATA DA OCORRENCIA', 'DATA DO FATO', 'DIA']],
  ['hora', ['HORA', 'HORARIO', 'HORA DA OCORRENCIA', 'HORA DO FATO', 'HR']],
  ['local', ['LOCAL', 'LOCAL DA OCORRENCIA', 'LOCAL DO FATO', 'ENDERECO DA OCORRENCIA', 'LOGRADOURO']],
  ['bairro', ['BAIRRO']],
  ['municipio', ['MUNICIPIO', 'CIDADE']],
  ['cep', ['CEP']],
  ['referencia', ['REFERENCIA', 'PONTO DE REFERENCIA', 'PTO DE REFERENCIA']],
  ['latitude', ['LATITUDE', 'LAT']],
  ['longitude', ['LONGITUDE', 'LONG', 'LNG', 'LON']],
  ['coordenadas', ['COORDENADAS', 'COORDENADA', 'LOCALIZACAO', 'GPS', 'COORD', 'LOCALIZACAO GPS']],
  ['procedimento', ['PROCEDIMENTO ADOTADO', 'PROCEDIMENTO', 'PROCEDIMENTOS ADOTADOS', 'PROCEDIMENTOS', 'PROVIDENCIA ADOTADA', 'PROVIDENCIAS ADOTADAS', 'PROVIDENCIAS', 'PROVIDENCIA', 'DESFECHO']],
  ['historico', ['HISTORICO', 'HISTORICO DA OCORRENCIA', 'RELATO', 'RELATO DA OCORRENCIA', 'RESUMO', 'DINAMICA', 'NARRATIVA', 'DESCRICAO', 'DESCRICAO DA OCORRENCIA']],
  ['veiculo', ['VEICULO', 'VEICULOS', 'VEICULO ENVOLVIDO', 'VEICULOS ENVOLVIDOS', 'VEICULO SUBTRAIDO', 'VEICULO APREENDIDO', 'VEICULO FURTADO', 'VEICULO ROUBADO', 'VEICULO RECUPERADO']],
  ['objetos', ['OBJETO', 'OBJETOS', 'MATERIAL APREENDIDO', 'MATERIAIS APREENDIDOS', 'MATERIAL', 'MATERIAIS', 'APREENSAO', 'APREENSOES', 'APREENDIDO', 'APREENDIDOS', 'OBJETOS APREENDIDOS', 'OBJETOS SUBTRAIDOS', 'OBJETOS FURTADOS', 'OBJETOS ROUBADOS', 'BENS SUBTRAIDOS', 'BENS']],
  ['unidade', ['UNIDADE', 'BPM', 'BATALHAO', 'OPM', 'UNIDADE POLICIAL', 'UPM']],
  ['pelotao', ['PELOTAO', 'PEL', 'CIA', 'COMPANHIA', 'DESTACAMENTO', 'SUBUNIDADE']],
  // pessoas
  ['p:vitima', ['VITIMA', 'VITIMAS', 'OFENDIDO', 'OFENDIDA', 'OFENDIDOS', 'VITIMA(S)']],
  ['p:comunicante', ['COMUNICANTE', 'SOLICITANTE', 'NOTICIANTE', 'REQUERENTE', 'DENUNCIANTE', 'COMUNICANTES']],
  ['p:testemunha', ['TESTEMUNHA', 'TESTEMUNHAS', 'TESTEMUNHA(S)']],
  ['p:suspeito', ['SUSPEITO', 'SUSPEITOS', 'SUSPEITA', 'ACUSADO', 'ACUSADOS', 'ACUSADA', 'AUTOR', 'AUTORES', 'AUTOR DO FATO', 'AUTORES DO FATO', 'INFRATOR', 'INFRATORES', 'CONDUZIDO', 'CONDUZIDOS', 'PRESO', 'PRESOS', 'DETIDO', 'INDICIADO', 'AGRESSOR', 'ACUSADO(S)', 'SUSPEITO(S)']],
  ['p:envolvido', ['ENVOLVIDO', 'ENVOLVIDOS', 'PARTES', 'PARTE', 'ENVOLVIDO(S)']],
  ['p:proprietario', ['PROPRIETARIO', 'PROPRIETARIA', 'PROPRIETARIO DO VEICULO', 'DONO']],
];
const SUBROTULOS = [
  ['cpf', ['CPF', 'C P F']],
  ['nascimento', ['NASC', 'NASCIMENTO', 'DATA DE NASCIMENTO', 'DT NASC', 'DN', 'D N', 'NASCIDO EM', 'NASCIDA EM', 'DATA NASC']],
  ['rg', ['RG', 'IDENTIDADE', 'R G']],
  ['mae', ['MAE', 'NOME DA MAE', 'FILIACAO']],
  ['pai', ['PAI', 'NOME DO PAI']],
  ['telefone', ['TELEFONE', 'TEL', 'FONE', 'CONTATO', 'CELULAR', 'CEL', 'WHATSAPP']],
  ['endereco', ['ENDERECO', 'RESIDENCIA', 'RESIDENTE', 'END', 'ENDERECO RESIDENCIAL']],
  ['idade', ['IDADE']],
  ['apelido', ['VULGO', 'ALCUNHA', 'APELIDO']],
];
const MAPA_ROTULOS = new Map();
for (const [k, lista] of ROTULOS) for (const r of lista) MAPA_ROTULOS.set(chave(r), k);
const MAPA_SUB = new Map();
for (const [k, lista] of SUBROTULOS) for (const r of lista) MAPA_SUB.set(chave(r), k);

// rótulos que encerram o histórico (o histórico pode conter "Vítima:" no meio do texto)
const ENCERRA_HISTORICO = new Set(['veiculo', 'objetos', 'equipe', 'numeroBo', 'servicoDia', 'cpu', 'procedimento', 'latitude', 'longitude', 'coordenadas', 'dataHora']);

function separarRotulo(l) {
  const m = l.match(/^([^:]{1,45}?)\s*:\s*(.*)$/);
  if (m) {
    const k = chave(m[1]);
    if (MAPA_ROTULOS.has(k)) return { tipo: MAPA_ROTULOS.get(k), valor: m[2].trim(), rotulo: m[1].trim() };
    if (MAPA_SUB.has(k)) return { sub: MAPA_SUB.get(k), valor: m[2].trim(), rotulo: m[1].trim() };
    return null;
  }
  // rótulo sozinho na linha (ex.: "HISTÓRICO")
  const k = chave(l);
  if (MAPA_ROTULOS.has(k) && ['historico', 'equipe', 'objetos', 'veiculo'].includes(MAPA_ROTULOS.get(k)) && l.length <= 30) {
    return { tipo: MAPA_ROTULOS.get(k), valor: '', rotulo: l };
  }
  return null;
}

// ------------------------------------------------------------------ extratores
export function normalizarData(s) {
  const m = String(s || '').match(/\b(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})\b/);
  if (!m) return '';
  let [, d, mo, a] = m;
  if (a.length === 2) a = `20${a}`;
  if (+d < 1 || +d > 31 || +mo < 1 || +mo > 12) return '';
  return `${d.padStart(2, '0')}/${mo.padStart(2, '0')}/${a}`;
}
export function normalizarHora(s) {
  const m = String(s || '').match(/\b(\d{1,2})\s*(?:[:hH]\s*(\d{2})?|\s*horas?)(?!\d)/);
  if (!m) return '';
  const h = +m[1]; const mi = m[2] ? +m[2] : 0;
  if (h > 23 || mi > 59) return '';
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
}
const RE_CPF = /\b(\d{3})\.?(\d{3})\.?(\d{3})\s*[-.]?\s*(\d{2})\b/;
export function extrairCpf(s) {
  const m = String(s || '').match(RE_CPF);
  return m ? `${m[1]}.${m[2]}.${m[3]}-${m[4]}` : '';
}
const RE_PLACA = /\b([A-Z]{3})[-\s]?(\d)([A-Z0-9])(\d{2})\b/;
export function extrairPlaca(s) {
  const m = semAcento(String(s || '')).toUpperCase().match(RE_PLACA);
  return m ? `${m[1]}${m[2]}${m[3]}${m[4]}` : '';
}
const CORES = ['PRETA', 'PRETO', 'BRANCA', 'BRANCO', 'PRATA', 'CINZA', 'VERMELHA', 'VERMELHO', 'AZUL', 'VERDE', 'AMARELA', 'AMARELO', 'MARROM', 'BEGE', 'DOURADA', 'DOURADO', 'LARANJA', 'ROXA', 'ROXO', 'VINHO', 'ROSA', 'GRAFITE', 'BORDO'];
const MARCAS = ['HONDA', 'YAMAHA', 'SUZUKI', 'SHINERAY', 'DAFRA', 'KAWASAKI', 'TRAXX', 'FIAT', 'VOLKSWAGEN', 'VW', 'CHEVROLET', 'GM', 'FORD', 'TOYOTA', 'HYUNDAI', 'RENAULT', 'NISSAN', 'JEEP', 'PEUGEOT', 'CITROEN', 'MITSUBISHI', 'KIA', 'BMW', 'MERCEDES', 'SCANIA', 'VOLVO', 'IVECO', 'MOTO', 'MOTOCICLETA', 'BIZ', 'CG', 'BROS', 'FAN', 'TITAN', 'POP', 'FACTOR', 'GOL', 'UNO', 'PALIO', 'CELTA', 'STRADA', 'HILUX', 'S10'];

export function analisarVeiculo(texto, origem) {
  const t = String(texto || '').trim();
  const T = semAcento(t).toUpperCase();
  const v = { texto: t, origem, placa: extrairPlaca(t), cor: '', ano: '', chassi: '', renavam: '', marcaModelo: '' };
  for (const c of CORES) if (new RegExp(`\\b${c}\\b`).test(T)) { v.cor = c.charAt(0) + c.slice(1).toLowerCase(); break; }
  const ano = t.match(/\b(?:ano(?:\/modelo)?\s*:?\s*)?((?:19|20)\d{2})(?:\s*\/\s*((?:19|20)\d{2}))?\b/i);
  if (ano) v.ano = ano[2] ? `${ano[1]}/${ano[2]}` : ano[1];
  const ch = T.match(/\b(?:CHASSI\s*:?\s*)?([A-HJ-NPR-Z0-9]{17})\b/);
  if (ch && /\d/.test(ch[1]) && /[A-Z]/.test(ch[1])) v.chassi = ch[1];
  const rn = T.match(/RENAVAM\s*:?\s*(\d{9,11})/);
  if (rn) v.renavam = rn[1];
  // marca/modelo: trecho antes de "placa", "cor", vírgula ou ano
  const mm = t.split(/,|;|\bplaca\b|\bcor\b|\bano\b|\bchassi\b|\brenavam\b/i)[0].replace(/^(uma?|o|a)\s+/i, '').trim();
  if (mm && MARCAS.some((m) => semAcento(mm).toUpperCase().includes(m)) && mm.length <= 60) v.marcaModelo = mm;
  return v;
}

const POSTOS = /^(CEL|TC|TEN\s*CEL|MAJ|CAP|[12]\s*[ºO°]?\s*TEN|TEN|ASP(?:\s*OF)?|SUBTEN|ST|[123]\s*[ºO°]?\s*SGT|SGT|CB|SD|AL\s*SD)\b\.?\s*(PM\b)?\.?/i;
export function analisarPolicial(linha) {
  let l = linha.replace(/^[-–•]\s*/, '').trim();
  if (!l) return null;
  let posto = '';
  const mp = l.match(POSTOS);
  if (mp) { posto = mp[0].replace(/\s+/g, ' ').trim(); l = l.slice(mp[0].length).trim(); }
  let matricula = '';
  const mm = l.match(/[,\-–(]?\s*\b(?:mat(?:r[ií]cula)?|id|rg|n[º°o]?)\b\.?\s*:?\s*(\d[\d.\-]*)\)?/i);
  if (mm) { matricula = mm[1].replace(/[.\-]$/, ''); l = (l.slice(0, mm.index) + l.slice(mm.index + mm[0].length)).trim(); }
  l = l.replace(/[,;\-–]+$/, '').trim();
  if (!l && !posto) return null;
  return { posto, nome: l, matricula };
}

function analisarPessoaTexto(valor) {
  // "Nome, CPF 012.345.678-90, nasc. 01/02/1990" -> {nome, cpf, nascimento, ...}
  const p = { nome: '', cpf: '', nascimento: '', rg: '', mae: '', pai: '', telefone: '', endereco: '', idade: '', apelido: '', extras: [] };
  let resto = valor;
  const cpf = extrairCpf(resto);
  if (cpf) { p.cpf = cpf; resto = resto.replace(/\b(?:cpf)?\s*:?\s*\d{3}\.?\d{3}\.?\d{3}\s*[-.]?\s*\d{2}\b/i, ' '); }
  const nasc = resto.match(/\b(?:nasc(?:ido|ida|imento)?|dn|d\.n\.|data de nascimento)\.?\s*(?:em)?\s*:?\s*(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4})/i);
  if (nasc) { p.nascimento = normalizarData(nasc[1]); resto = resto.replace(nasc[0], ' '); }
  const idade = resto.match(/\(?\b(\d{1,3})\s*anos\b\)?/i);
  if (idade) { p.idade = idade[1]; resto = resto.replace(idade[0], ' '); }
  const rg = resto.match(/\bRG\s*:?\s*([\d.\-xX]+)/i);
  if (rg) { p.rg = rg[1]; resto = resto.replace(rg[0], ' '); }
  const tel = resto.match(/\b(?:tel(?:efone)?|fone|cel(?:ular)?|contato)\.?\s*:?\s*([()\d\s\-]{8,})/i);
  if (tel) { p.telefone = tel[1].trim(); resto = resto.replace(tel[0], ' '); }
  const partes = resto.split(/[,;]|\s[-–]\s/).map((s) => s.trim()).filter(Boolean);
  if (partes.length) p.nome = partes.shift().replace(/[.]+$/, '').trim();
  p.extras = partes;
  return p;
}

function analisarLocal(valor, municipiosConhecidos) {
  const r = { texto: valor, logradouro: '', numero: '', bairro: '', municipio: '', cep: '', referencia: '', municipioIncerto: false };
  let v = valor.replace(/\.\s*$/, '').trim();
  const cep = v.match(/\b\d{5}-?\d{3}\b/);
  if (cep) { r.cep = cep[0].includes('-') ? cep[0] : `${cep[0].slice(0, 5)}-${cep[0].slice(5)}`; v = v.replace(cep[0], ' ').replace(/\bCEP\b\s*:?/i, ' '); }
  const ref = v.match(/\b(pr[oó]ximo (?:a|à|ao|aos|às|de|do|da)|perto (?:de|do|da)|ao lado (?:de|do|da)|em frente (?:a|à|ao|de|do|da)|nas proximidades (?:de|do|da)|ref(?:er[eê]ncia)?\.?:?)\s+[^,;]+/i);
  if (ref) { r.referencia = ref[0].trim(); v = v.replace(ref[0], ' '); }
  const partes = v.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const resto = [];
  for (const p of partes) {
    const b = p.match(/^(?:no\s+|na\s+)?bairro\s*:?\s*(.+)$/i);
    if (b) { r.bairro = b[1].trim(); continue; }
    const n = p.match(/^(?:n[º°o.]?\s*|n[uú]mero\s*)(\d+[A-Za-z]?|s\/?n)$/i) || p.match(/^(\d+[A-Za-z]?|s\/n)$/i);
    if (n) { r.numero = n[1].toUpperCase() === 'SN' ? 'S/N' : n[1].toUpperCase(); continue; }
    const conhecido = (municipiosConhecidos || []).find((m) => chave(m) === chave(p.replace(/\s*[-/]\s*MA$/i, '')));
    if (conhecido) { r.municipio = conhecido; continue; }
    resto.push(p);
  }
  if (resto.length) {
    let lg = resto.shift();
    const num = lg.match(/\s*,?\s*(?:n[º°o.]\s*|n[uú]mero\s+)(\d+[A-Za-z]?|s\/?n)\b/i) || lg.match(/\s+(s\/n)\b/i);
    if (num) { r.numero = r.numero || num[1].toUpperCase().replace('SN', 'S/N'); lg = lg.replace(num[0], '').trim(); }
    r.logradouro = lg;
  }
  if (!r.municipio && resto.length) {
    const ult = resto[resto.length - 1];
    if (/^[A-ZÀ-Úa-zà-ú' ]{3,40}(?:\s*[-/]\s*[A-Z]{2})?$/.test(ult) && !/\d/.test(ult)) {
      r.municipio = ult; r.municipioIncerto = true; resto.pop();
    }
  }
  if (resto.length) r.referencia = [r.referencia, ...resto].filter(Boolean).join(', ');
  return r;
}

function analisarCoordenadas(texto) {
  const t = String(texto || '');
  const url = t.match(/[@=](-?\d{1,2}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  if (url) return { latitude: url[1], longitude: url[2] };
  const par = t.match(/(-?\d{1,2}[.,]\d{3,})\s*[,;/ ]\s*(-?\d{1,3}[.,]\d{3,})/);
  if (par) return { latitude: par[1].replace(',', '.'), longitude: par[2].replace(',', '.') };
  return null;
}

// distância de edição simples
function lev(a, b) {
  const m = a.length; const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[m][n];
}

function variantesDeNome(nome, texto) {
  // palavras do texto parecidas, mas não idênticas, às palavras do nome
  const achados = [];
  const palavras = String(texto || '').match(/[A-Za-zÀ-ÿ]{4,}/g) || [];
  for (const tok of String(nome || '').match(/[A-Za-zÀ-ÿ]{4,}/g) || []) {
    const nt = semAcento(tok).toLowerCase();
    for (const w of palavras) {
      if (w === tok) continue;
      const nw = semAcento(w).toLowerCase();
      if (w.toLowerCase() === tok.toLowerCase()) continue;
      if (nt[0] !== nw[0]) continue;
      if (nw === nt || (Math.min(nt.length, nw.length) >= 5 && Math.abs(nt.length - nw.length) <= 1 && lev(nt, nw) === 1)) {
        if (!achados.some((a) => a.texto === w && a.nome === tok)) achados.push({ nome: tok, texto: w });
      }
    }
  }
  return achados;
}

// ------------------------------------------------------------------ análise principal
export function analisar(textoOriginal, { municipiosConhecidos = [] } = {}) {
  const r = {
    textoOriginal,
    campos: {},           // chave -> valor
    integrantes: [],
    pessoas: [],          // {papel, rotulo, nome, cpf, nascimento, ...}
    veiculos: [],
    objetos: [],
    vazios: [],           // rótulos presentes sem valor
    avisos: [],
    conflitos: [],
    sugestoesHistorico: [],
    naoReconhecido: [],
  };
  const linhas = String(textoOriginal || '').replace(/\r\n?/g, '\n').split('\n');
  let modo = null; // 'equipe' | 'historico' | 'pessoa' | 'objetos' | 'veiculo'
  let pessoaAtual = null; let papelAtual = null;
  const historico = [];
  let houveFormatacao = false;

  const fecharPessoa = () => { pessoaAtual = null; };

  for (let i = 0; i < linhas.length; i++) {
    const cru = linhas[i];
    if (/[*~]|\p{Extended_Pictographic}/u.test(cru)) houveFormatacao = true;
    const l = limparLinha(cru);
    if (!l) {
      if (modo === 'historico') historico.push('');
      else if (modo === 'equipe' || modo === 'pessoa' || modo === 'objetos') { modo = null; fecharPessoa(); }
      continue;
    }
    const rot = separarRotulo(l);

    if (modo === 'historico') {
      if (!rot || !rot.tipo || !ENCERRA_HISTORICO.has(rot.tipo)) { historico.push(l); continue; }
    }

    if (rot && rot.sub && pessoaAtual) {
      const v = rot.valor;
      if (rot.sub === 'cpf') pessoaAtual.cpf = extrairCpf(v) || v;
      else if (rot.sub === 'nascimento') pessoaAtual.nascimento = normalizarData(v) || v;
      else if (rot.sub === 'idade') pessoaAtual.idade = v;
      else pessoaAtual[rot.sub] = v;
      continue;
    }

    if (rot && rot.tipo) {
      modo = null; fecharPessoa();
      const v = rot.valor;
      const t = rot.tipo;
      if (t.startsWith('p:')) {
        papelAtual = { papel: t.slice(2), rotulo: rot.rotulo };
        modo = 'pessoa';
        if (!v || /^(n[aã]o (?:identificad[oa]s?|informad[oa]s?|h[aá])|nenhum[a]?|sem|-+|\.+|n\/?[ai])\.?$/i.test(v)) {
          r.vazios.push(rot.rotulo + (v ? ` (${v})` : ''));
          continue;
        }
        for (const parte of v.split(/;/)) {
          const p = { papel: papelAtual.papel, rotulo: papelAtual.rotulo, ...analisarPessoaTexto(parte) };
          if (p.nome || p.cpf) { r.pessoas.push(p); pessoaAtual = p; }
        }
        continue;
      }
      switch (t) {
        case 'equipe': {
          modo = 'equipe';
          if (v) {
            const membros = v.split(/;|,(?!\s*(?:mat|matr[ií]cula|id|rg)\b)/i).map(analisarPolicial).filter(Boolean);
            // "EQUIPE: RP" -> nome da equipe; "EQUIPE: Cb A, Sd B" -> integrantes
            if (membros.length === 1 && !membros[0].posto && !membros[0].matricula && v.split(/\s+/).length <= 3) r.campos.equipeNome = v;
            else r.integrantes.push(...membros);
          }
          break;
        }
        case 'historico':
          modo = 'historico';
          if (v) historico.push(v);
          break;
        case 'objetos':
          modo = 'objetos';
          if (v) for (const o of v.split(/;/)) if (o.trim()) r.objetos.push({ texto: o.trim() });
          break;
        case 'veiculo':
          if (v) r.veiculos.push(analisarVeiculo(v, 'rotulo'));
          else modo = 'veiculo';
          break;
        case 'dataHora': {
          const d = normalizarData(v); const h = normalizarHora(v.replace(/\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}/, ''));
          if (d) r.campos.data = d; if (h) r.campos.hora = h;
          if (!d && !h && v) r.avisos.push(`Data/hora não reconhecida: "${v}"`);
          break;
        }
        case 'data': case 'servicoDia': {
          const d = normalizarData(v);
          if (d) r.campos[t] = d; else if (v) { r.campos[t] = v; if (t === 'data') r.avisos.push(`Data em formato não reconhecido: "${v}"`); }
          if (t === 'data') { const h = normalizarHora(v.replace(/\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}/, '')); if (h && !r.campos.hora) r.campos.hora = h; }
          break;
        }
        case 'hora': {
          const h = normalizarHora(v);
          if (h) r.campos.hora = h; else if (v) r.avisos.push(`Hora em formato não reconhecido: "${v}"`);
          break;
        }
        case 'local': {
          r.campos.localTexto = v;
          Object.assign(r.campos, prefixar('local_', analisarLocal(v, municipiosConhecidos)));
          const c = analisarCoordenadas(v);
          if (c) { r.campos.latitude = c.latitude; r.campos.longitude = c.longitude; }
          break;
        }
        case 'bairro': r.campos.local_bairro = v; break;
        case 'municipio': r.campos.local_municipio = v; r.campos.local_municipioIncerto = false; break;
        case 'cep': r.campos.local_cep = v; break;
        case 'referencia': r.campos.local_referencia = v; break;
        case 'latitude': r.campos.latitude = (v.match(/-?\d+[.,]\d+/) || [v])[0].replace(',', '.'); break;
        case 'longitude': r.campos.longitude = (v.match(/-?\d+[.,]\d+/) || [v])[0].replace(',', '.'); break;
        case 'coordenadas': {
          const c = analisarCoordenadas(v);
          if (c) { r.campos.latitude = c.latitude; r.campos.longitude = c.longitude; } else if (v) r.avisos.push(`Coordenadas não reconhecidas: "${v}"`);
          break;
        }
        case 'numeroBo': if (v) r.campos.numeroBo = v.replace(/^n[º°o]?\s*/i, '').trim(); break;
        default:
          if (v) r.campos[t] = v; else r.vazios.push(rot.rotulo);
      }
      continue;
    }

    // linhas sem rótulo
    if (modo === 'equipe') { const p = analisarPolicial(l); if (p) r.integrantes.push(p); continue; }
    if (modo === 'objetos') { r.objetos.push({ texto: l }); continue; }
    if (modo === 'veiculo') { r.veiculos.push(analisarVeiculo(l, 'rotulo')); modo = null; continue; }
    if (modo === 'pessoa' && papelAtual) {
      const p = { papel: papelAtual.papel, rotulo: papelAtual.rotulo, ...analisarPessoaTexto(l) };
      if (p.nome || p.cpf) { r.pessoas.push(p); pessoaAtual = p; }
      continue;
    }
    // cabeçalho sem rótulo: "35º BPM - 2º PELOTÃO"
    if (i < 6 && /\b\d+\s*[ºo°]?\s*BPM\b/i.test(l) && !r.campos.unidade) {
      r.campos.unidade = l;
      const pel = l.match(/\b\d+\s*[ºo°]?\s*(?:PEL(?:OT[AÃ]O)?|CIA)\b[^,;-]*/i);
      if (pel) r.campos.pelotao = pel[0].trim();
      continue;
    }
    r.naoReconhecido.push(l);
  }

  // histórico: preserva o texto (apenas remove a formatação do WhatsApp)
  while (historico.length && !historico[historico.length - 1]) historico.pop();
  if (historico.length) r.campos.historico = historico.join('\n');
  if (houveFormatacao) r.avisos.push('Formatação do WhatsApp (asteriscos, emojis) foi removida; o texto original continua guardado para consulta.');

  // veículos mencionados no histórico (apenas sugestão, desmarcada)
  if (r.campos.historico) {
    const re = new RegExp(RE_PLACA.source, 'g');
    const h = semAcento(r.campos.historico).toUpperCase();
    let m;
    while ((m = re.exec(h))) {
      const placa = `${m[1]}${m[2]}${m[3]}${m[4]}`;
      if (!r.veiculos.some((v) => v.placa === placa)) {
        const ini = Math.max(0, m.index - 70);
        r.veiculos.push({ ...analisarVeiculo(r.campos.historico.slice(ini, m.index + 12), 'historico'), placa, texto: `Placa ${placa} mencionada no histórico` });
      }
    }
    if (!r.veiculos.length) {
      const mv = r.campos.historico.match(/\b(motocicleta|moto|carro|autom[oó]vel|caminhonete|caminh[aã]o|bicicleta)\b[^.;\n]{0,80}/i);
      if (mv) r.veiculos.push({ ...analisarVeiculo(mv[0], 'historico'), texto: `Mencionado no histórico: "${mv[0].trim()}"` });
    }
    const gu = r.campos.historico.match(/\b(guarni[cç][aã]o|guarni[cç][oõ]es|GU)\b/gi);
    if (gu) r.sugestoesHistorico.push({ tipo: 'equipe', de: [...new Set(gu)], para: 'EQUIPE', quantidade: gu.length });
  }

  // conflitos detectáveis
  if (r.campos.servicoDia && r.campos.data && normalizarData(r.campos.servicoDia) && r.campos.servicoDia !== r.campos.data) {
    r.conflitos.push(`Datas diferentes no relatório: SERVIÇO DO DIA ${r.campos.servicoDia} e DATA ${r.campos.data}. Confirme a data do fato.`);
  }
  for (const p of r.pessoas) {
    for (const v of variantesDeNome(p.nome, r.campos.historico)) {
      r.conflitos.push(`Nome divergente: "${v.nome}" (${p.rotulo}) aparece como "${v.texto}" no histórico. Nenhuma correção foi feita.`);
    }
  }
  const nomes = r.pessoas.map((p) => p.nome).filter(Boolean);
  for (let a = 0; a < nomes.length; a++) for (let b = a + 1; b < nomes.length; b++) {
    if (nomes[a] !== nomes[b] && semAcento(nomes[a]).toLowerCase() === semAcento(nomes[b]).toLowerCase()) {
      r.conflitos.push(`Mesmo nome com grafias diferentes: "${nomes[a]}" e "${nomes[b]}".`);
    }
  }
  if (r.campos.local_municipioIncerto) r.avisos.push(`Município "${r.campos.local_municipio}" deduzido do fim do endereço; confirme.`);
  return r;
}

function prefixar(p, o) { const out = {}; for (const [k, v] of Object.entries(o)) if (k !== 'texto') out[p + k] = v; return out; }

// ------------------------------------------------------------------ revisão
const ROTULOS_CAMPOS = {
  unidade: ['Unidade (cabeçalho)', 'ocorrencia.unidade', 'pdf'],
  pelotao: ['Pelotão', null, 'info'],
  servicoDia: ['Serviço do dia', 'ocorrencia.servicoDia', 'semCampo'],
  cpu: ['CPU', 'ocorrencia.cpu', 'semCampo'],
  equipeNome: ['Nome da EQUIPE', 'ocorrencia.equipeNome', 'semCampo'],
  titulo: ['Título → 1-Fato, descrição (linha 1)', 'ocorrencia.fatos.0.descricao', 'pdf'],
  numeroBo: ['Nº do BO (CIOPS/COPOM)', 'ocorrencia.numeroBo', 'pdf'],
  data: ['Data informada', 'ocorrencia.dataInformada', 'semCampo'],
  hora: ['Hora informada', 'ocorrencia.horaInformada', 'semCampo'],
  local_logradouro: ['Local: logradouro', 'local.logradouro', 'pdf'],
  local_numero: ['Local: nº/km', 'local.numero', 'pdf'],
  local_bairro: ['Local: bairro', 'local.bairro', 'pdf'],
  local_municipio: ['Local: município', 'local.municipio', 'pdf'],
  local_cep: ['Local: CEP', 'local.cep', 'pdf'],
  local_referencia: ['Local: ponto de referência', 'local.referencia', 'pdf'],
  latitude: ['Latitude', 'local.latitude', 'semCampo'],
  longitude: ['Longitude', 'local.longitude', 'semCampo'],
  procedimento: ['Procedimento adotado (informado)', 'ocorrencia.procedimentoAdotado', 'semCampo'],
  historico: ['Histórico → 5-Relato policial', 'relato', 'pdf'],
};

/**
 * Monta a lista de revisão comparando com o estado atual.
 * Cada item: {id, rotulo, valor, atual, destino, situacao: 'novo'|'igual'|'conflito', aplicar}
 */
export function montarRevisao(estado, r) {
  const itens = [];
  const obterCaminho = (c) => c.split('.').reduce((o, k) => (o == null ? undefined : o[k]), estado);
  for (const [k, [rotulo, destino, tipo]] of Object.entries(ROTULOS_CAMPOS)) {
    const valor = r.campos[k];
    if (valor === undefined || valor === '' || !destino) {
      if (valor && !destino) itens.push({ id: k, rotulo, valor, atual: '', destino: null, situacao: 'info', aplicar: false, tipo });
      continue;
    }
    const atual = String(obterCaminho(destino) ?? '');
    let situacao = 'novo';
    if (atual && atual === valor) situacao = 'igual';
    else if (atual && atual !== valor) situacao = 'conflito';
    // unidade e município vêm das preferências: só substitui com confirmação
    itens.push({ id: k, rotulo, valor, atual, destino, situacao, tipo, aplicar: situacao === 'novo' && !(k === 'local_municipio' && r.campos.local_municipioIncerto) });
  }
  r.pessoas.forEach((p, i) => {
    const ja = estado.envolvidos.find((e) => e.nome && semAcento(e.nome).toLowerCase() === semAcento(p.nome).toLowerCase());
    itens.push({ id: `pessoa:${i}`, rotulo: `${p.rotulo}`, valor: [p.nome, p.cpf && `CPF ${p.cpf}`, p.nascimento && `nasc. ${p.nascimento}`].filter(Boolean).join(' · '), atual: ja ? `já existe como E-${ja.numero}` : '', situacao: ja ? 'igual' : 'novo', aplicar: !ja, grupo: 'pessoa' });
  });
  r.integrantes.forEach((p, i) => {
    const ja = estado.equipe.find((x) => semAcento(x.nome).toLowerCase() === semAcento(p.nome).toLowerCase());
    itens.push({ id: `policial:${i}`, rotulo: 'Integrante da EQUIPE', valor: [p.posto, p.nome, p.matricula && `Mat. ${p.matricula}`].filter(Boolean).join(' '), atual: ja ? 'já cadastrado' : '', situacao: ja ? 'igual' : 'novo', aplicar: !ja, grupo: 'equipe' });
  });
  r.veiculos.forEach((v, i) => {
    const ja = v.placa && estado.veiculos.find((x) => x.placa && x.placa.replace(/\W/g, '').toUpperCase() === v.placa);
    itens.push({ id: `veiculo:${i}`, rotulo: v.origem === 'historico' ? 'Veículo mencionado no histórico (sugestão)' : 'Veículo', valor: [v.marcaModelo || v.texto, v.placa && `placa ${v.placa}`, v.cor && `cor ${v.cor}`, v.ano && `ano ${v.ano}`].filter(Boolean).join(' · '), atual: ja ? `já existe como V-${ja.numero}` : '', situacao: ja ? 'igual' : 'novo', aplicar: !ja && v.origem !== 'historico', grupo: 'veiculo' });
  });
  r.objetos.forEach((o, i) => {
    itens.push({ id: `objeto:${i}`, rotulo: 'Objeto', valor: o.texto, atual: '', situacao: 'novo', aplicar: true, grupo: 'objeto' });
  });
  return itens;
}

export function pendenciasImportacao(r) {
  const p = [];
  if (!r.campos.numeroBo) p.push('Nº do BO (CIOPS/COPOM) não informado.');
  if (r.campos.data || r.campos.hora) p.push('Data/hora informada NÃO foi aplicada a FATO, COMUNICAÇÃO, ATENDIMENTO ou FECHAMENTO. Escolha na etapa 1.');
  else p.push('Data e hora da ocorrência não informadas.');
  if (r.campos.procedimento) p.push(`Procedimento "${r.campos.procedimento}" não define sozinho o tipo de documento: marque o tipo no topo do BO.`);
  p.push('Ambiente/estabelecimento (quadro 3) e meios empregados (quadro 4) precisam ser marcados manualmente.');
  p.push('Perguntas de SIM/NÃO (fotografado, Polícia Civil, perícia, disparos) ficam em branco até serem respondidas.');
  for (const pe of r.pessoas) {
    if (pe.papel === 'suspeito' || pe.papel === 'envolvido' || pe.papel === 'proprietario') p.push(`Definir a participação de "${pe.nome || pe.rotulo}" (informado como ${pe.rotulo}).`);
    if (!pe.cpf) p.push(`CPF de "${pe.nome}" não informado.`);
  }
  for (const v of r.vazios) p.push(`"${v}" veio sem informação.`);
  if (r.objetos.length) p.push('Defina a participação (apreendido, furtado...) e o vínculo de cada objeto.');
  if (r.veiculos.length) p.push('Vincule os veículos aos envolvidos explicitamente (não há vínculo automático).');
  return p;
}

const PAPEL_PARTICIPACAO = { vitima: 'ofendido', comunicante: 'comunicante', testemunha: 'testemunha' };

/** Aplica somente os itens marcados. Nunca apaga dados existentes sem confirmação. */
export function aplicar(estado, r, itens) {
  const marcados = new Set(itens.filter((i) => i.aplicar).map((i) => i.id));
  const definirCaminho = (c, v) => {
    const partes = c.split('.'); let o = estado;
    for (let i = 0; i < partes.length - 1; i++) o = o[partes[i]];
    o[partes[partes.length - 1]] = v;
  };
  for (const it of itens) {
    if (!marcados.has(it.id) || !it.destino) continue;
    definirCaminho(it.destino, it.valor);
  }
  r.pessoas.forEach((p, i) => {
    if (!marcados.has(`pessoa:${i}`)) return;
    const e = novoEnvolvido(estado.envolvidos.length + 1);
    e.nome = p.nome; e.cpf = p.cpf; e.nascimento = p.nascimento; e.rg = p.rg; e.nomeMae = p.mae || ''; e.nomePai = p.pai || '';
    e.alcunha = p.apelido || '';
    e.papelImportado = p.rotulo;
    if (PAPEL_PARTICIPACAO[p.papel]) e.participacao = [PAPEL_PARTICIPACAO[p.papel]];
    if (p.telefone) {
      const d = p.telefone.replace(/\D/g, '');
      if (d.length >= 10) { e.res.telDdd = d.slice(0, 2); e.res.telNumero = `${d.slice(2, -4)}-${d.slice(-4)}`; } else e.res.telNumero = p.telefone;
    }
    // endereço residencial SOMENTE se informado explicitamente para a pessoa
    if (p.endereco) e.res.logradouro = p.endereco;
    const notas = [p.idade && `idade informada: ${p.idade} anos`, ...(p.extras || [])].filter(Boolean);
    if (notas.length) e.notasImportacao = notas.join('; ');
    estado.envolvidos.push(e);
  });
  renumerar(estado.envolvidos);
  r.integrantes.forEach((p, i) => {
    if (marcados.has(`policial:${i}`)) estado.equipe.push(novoPolicial(p));
  });
  r.veiculos.forEach((v, i) => {
    if (!marcados.has(`veiculo:${i}`)) return;
    const x = novoVeiculo(estado.veiculos.length + 1);
    x.placa = v.placa; x.cor = v.cor; x.ano = v.ano; x.marcaModelo = v.marcaModelo;
    if (v.chassi) x.renavamChassi = v.chassi; else if (v.renavam) x.renavamChassi = v.renavam;
    x.notaImportacao = v.texto;
    estado.veiculos.push(x);
  });
  renumerar(estado.veiculos);
  r.objetos.forEach((o, i) => {
    if (!marcados.has(`objeto:${i}`)) return;
    const x = novoObjeto(estado.objetos.length + 1);
    const q = o.texto.match(/^(\d+)\s*(?:x|un\.?|unidades?)?\s+(.+)$/i);
    if (q) { x.quantidade = q[1]; x.descricao = q[2]; } else x.descricao = o.texto;
    estado.objetos.push(x);
  });
  renumerar(estado.objetos);
  estado.importacoes.push({ em: new Date().toISOString(), texto: r.textoOriginal });
  return estado;
}

/** Aplica no histórico a troca sugerida (ex.: guarnição -> EQUIPE), só quando o usuário pede. */
export function substituirNoHistorico(texto, de, para) {
  let n = 0;
  const re = new RegExp(`\\b(${de.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');
  const novo = texto.replace(re, () => { n += 1; return para; });
  return { texto: novo, trocas: n };
}
