// Modelo de dados da ocorrência, configurações da unidade e armazenamento.
// Nenhum dado sai do aparelho. Por padrão tudo fica em sessionStorage.

export const VERSAO_FORMATO = 1;
export const TIPO_ARQUIVO = 'pmma-bo-rascunho';

const CHAVE_SESSAO = 'pmmabo.ocorrencia';
const CHAVE_LOCAL = 'pmmabo.rascunho';
const CHAVE_PREFS = 'pmmabo.preferencias';
const CHAVE_SALVAR = 'pmmabo.salvarNoAparelho';

let contador = 0;
export function novoId(prefixo) {
  contador += 1;
  return `${prefixo}${Date.now().toString(36)}${contador.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function preferenciasPadrao() {
  return {
    unidade: '35º BPM - 2º Pelotão - Barão de Grajaú',
    pelotao: '2º Pelotão',
    municipio: 'Barão de Grajaú',
    uf: 'MA',
    cep: '',
    integrantes: [], // {id, posto, matricula, nome}
  };
}

export function endereco() {
  return { cep: '', caixaPostal: '', tipoLogradouro: '', logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', estado: '', pais: '', referencia: '', telTipo: '', telDdd: '', telNumero: '', telRamal: '', email: '' };
}

export function novoEnvolvido(numero) {
  return {
    uid: novoId('e'), numero,
    participacao: [], // comunicante, autor_do_fato, ofendido, testemunha, a_apurar
    acidente: [],     // condutor_motorista, pedestre, passageiro, vitima
    papelImportado: '',
    nome: '', nomeMae: '', nomePai: '', nascimento: '', sexo: '', sexoOutro: '',
    nacionalidade: '', naturalDe: '', profissao: '', raca: '', localTrabalho: '',
    estadoCivil: '', instrucao: '', situacaoInstrucao: '',
    alcunha: '', nomeFalso: '', semDocumento: false,
    cpf: '', rg: '', rgEmissao: '', rgOrgao: '', rgUf: '',
    cnh: '', cnhValidade: '', cnhUf: '', naoHabilitado: false,
    res: endereco(), com: endereco(),
    condicoes: [], bens: '',
    veiculoUid: '', // vínculo explícito com um veículo (ficha conjunta)
    relato: { local: '', dataHora: '', testemunhaCompromissada: false, alertas: [], texto: '' },
    algemado: '', algemaJustificativas: [],
    manifestacaoOfendido: false,
    declaracao: { eu: '', funcao: '', dia: '', mes: '', ano: '', local: '', pessoaQualificada: false, recebiCoisas: false },
  };
}

export function novoVeiculo(numero) {
  return {
    uid: novoId('v'), numero,
    placa: '', renavamChassi: '', especie: '', marcaModelo: '', cor: '', ano: '', municipioUf: '', pais: '',
    proprietario: { envolvidoUid: '', nome: '', cpfCnpj: '', endereco: '', bairro: '', municipioUf: '', cep: '', telefone: '', nacionalidade: '' },
    cinto: '', ocupantes: '', conduzidoPara: '', estabelecimento: '', transporte: '',
    prov: {
      exameAlcoolico: '', medicao: '', tiquete: '', encaminhadoDp: '', condutorAutuado: '',
      cnhRecolhida: '', crlvRecolhido: '', ait: '', guinchamento: '', autoRemocao: '', guinchadoPor: [],
      empresaGuincho: '', motoristaGuincho: '',
    },
    carga: { tipo: '', notaFiscal: '', empresa: '', semCarga: false, peso: '', danos: [], natureza: [], complemento: '', onu: '', tacografo: '' },
  };
}

export function novoObjeto(numero) {
  return { uid: novoId('o'), numero, participacao: '', descricao: '', quantidade: '', envolvidoUid: '', veiculoUid: '' };
}

export function novoPolicial(base = {}) {
  return { uid: novoId('p'), posto: base.posto || '', matricula: base.matricula || '', nome: base.nome || '', noQuadro8: true };
}

export function ocorrenciaVazia(prefs = preferenciasPadrao()) {
  return {
    formato: VERSAO_FORMATO,
    criadoEm: new Date().toISOString(),
    alteradoEm: new Date().toISOString(),
    ocorrencia: {
      unidade: prefs.unidade || '',
      numeroBo: '',
      tipos: [], // comunicacao, acidente_transito, prisao_apreensao, boa, termo_circunstanciado, outros
      tipoOutrosTexto: '',
      datas: {
        fato: { data: '', hora: '' }, comunicacao: { data: '', hora: '' },
        atendimento: { data: '', hora: '' }, fechamento: { data: '', hora: '' },
      },
      fatos: [
        { descricao: '', envolvidos: [] },
        { descricao: '', envolvidos: [] },
        { descricao: '', envolvidos: [] },
      ],
      // informações sem campo no PDF (destino explicado na interface)
      servicoDia: '', cpu: '', equipeNome: '', procedimentoAdotado: '', tituloImportado: '',
      dataInformada: '', horaInformada: '', // vindas do relatório; não preenchem FATO/COMUNICAÇÃO sozinhas
    },
    local: {
      logradouro: '', numero: '', bairro: '', municipio: prefs.municipio || '', cep: prefs.cep || '', referencia: '',
      latitude: '', longitude: '',
    },
    marcas: {}, // campos-marca do BO (quadros 3 e 4 e documentos): nome do campo -> true
    meiosOutrosTexto: '',
    relato: '',
    objetos: [],
    objetosDestino: '',
    sn: { fotografado: '', pc_acionada: '', pc_no_local: '', ic_no_local: '', disparo: '' },
    icResponsavel: '', disparoQuantidade: '',
    outrasProvidencias: '',
    equipe: [],
    envolvidos: [],
    veiculos: [],
    complemento: { incluirServico: false, incluirCpu: false, incluirCoordenadas: false, incluirProcedimento: false, texto: '' },
    importacoes: [], // {em, texto} — texto original preservado para consulta
  };
}

// ---------------------------------------------------------------- caminhos
export function obter(obj, caminho) {
  return caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function definir(obj, caminho, valor) {
  const partes = caminho.split('.');
  let o = obj;
  for (let i = 0; i < partes.length - 1; i++) {
    if (o[partes[i]] == null) o[partes[i]] = {};
    o = o[partes[i]];
  }
  o[partes[partes.length - 1]] = valor;
}

// ---------------------------------------------------------------- armazenamento
function armazenamentoSeguro(tipo) {
  try {
    const s = window[tipo];
    const t = '__t';
    s.setItem(t, t); s.removeItem(t);
    return s;
  } catch { return null; }
}

export function salvarNoAparelhoAtivo() {
  const ls = armazenamentoSeguro('localStorage');
  return !!(ls && ls.getItem(CHAVE_SALVAR) === '1');
}

export function definirSalvarNoAparelho(ativo, estado) {
  const ls = armazenamentoSeguro('localStorage');
  if (!ls) return false;
  if (ativo) { ls.setItem(CHAVE_SALVAR, '1'); if (estado) ls.setItem(CHAVE_LOCAL, JSON.stringify(estado)); }
  else { ls.removeItem(CHAVE_SALVAR); ls.removeItem(CHAVE_LOCAL); }
  return true;
}

export function salvarOcorrencia(estado) {
  estado.alteradoEm = new Date().toISOString();
  const txt = JSON.stringify(estado);
  const ss = armazenamentoSeguro('sessionStorage');
  if (ss) ss.setItem(CHAVE_SESSAO, txt);
  if (salvarNoAparelhoAtivo()) {
    const ls = armazenamentoSeguro('localStorage');
    if (ls) ls.setItem(CHAVE_LOCAL, txt);
  }
}

export function carregarOcorrencia() {
  const ss = armazenamentoSeguro('sessionStorage');
  const sessao = ss && ss.getItem(CHAVE_SESSAO);
  if (sessao) { try { return { origem: 'sessao', estado: migrar(JSON.parse(sessao)) }; } catch { /* corrompido */ } }
  return null;
}

export function rascunhoNoAparelho() {
  if (!salvarNoAparelhoAtivo()) return null;
  const ls = armazenamentoSeguro('localStorage');
  const t = ls && ls.getItem(CHAVE_LOCAL);
  if (!t) return null;
  try { return migrar(JSON.parse(t)); } catch { return null; }
}

export function apagarOcorrencia() {
  const ss = armazenamentoSeguro('sessionStorage');
  if (ss) ss.removeItem(CHAVE_SESSAO);
  const ls = armazenamentoSeguro('localStorage');
  if (ls) ls.removeItem(CHAVE_LOCAL);
}

export function carregarPreferencias() {
  const ls = armazenamentoSeguro('localStorage');
  const t = ls && ls.getItem(CHAVE_PREFS);
  const base = preferenciasPadrao();
  if (!t) return base;
  try { return { ...base, ...JSON.parse(t) }; } catch { return base; }
}

export function salvarPreferencias(p) {
  const ls = armazenamentoSeguro('localStorage');
  if (ls) ls.setItem(CHAVE_PREFS, JSON.stringify(p));
}

// ---------------------------------------------------------------- JSON
export function exportarJson(estado) {
  return JSON.stringify({ tipo: TIPO_ARQUIVO, formato: VERSAO_FORMATO, exportadoEm: new Date().toISOString(), ocorrencia: estado }, null, 1);
}

function mesclarPadrao(padrao, dado) {
  if (Array.isArray(padrao)) return Array.isArray(dado) ? dado : padrao;
  if (padrao && typeof padrao === 'object') {
    const out = { ...padrao };
    if (dado && typeof dado === 'object' && !Array.isArray(dado)) {
      for (const k of Object.keys(dado)) out[k] = k in padrao ? mesclarPadrao(padrao[k], dado[k]) : dado[k];
    }
    return out;
  }
  if (dado === undefined || dado === null) return padrao;
  return typeof padrao === 'boolean' ? !!dado : (typeof dado === 'object' ? padrao : String(dado));
}

export function migrar(estado) {
  if (!estado || typeof estado !== 'object') throw new Error('Estrutura inválida.');
  if (estado.formato > VERSAO_FORMATO) throw new Error(`Rascunho feito por versão mais nova do sistema (formato ${estado.formato}).`);
  const base = ocorrenciaVazia({});
  const e = mesclarPadrao(base, estado);
  e.formato = VERSAO_FORMATO;
  e.envolvidos = (e.envolvidos || []).map((x, i) => mesclarPadrao(novoEnvolvido(i + 1), x));
  e.veiculos = (e.veiculos || []).map((x, i) => mesclarPadrao(novoVeiculo(i + 1), x));
  e.objetos = (e.objetos || []).map((x, i) => mesclarPadrao(novoObjeto(i + 1), x));
  e.equipe = (e.equipe || []).map((x) => mesclarPadrao(novoPolicial(), x));
  e.marcas = estado.marcas && typeof estado.marcas === 'object' ? Object.fromEntries(Object.entries(estado.marcas).filter(([, v]) => v === true)) : {};
  while (e.ocorrencia.fatos.length < 3) e.ocorrencia.fatos.push({ descricao: '', envolvidos: [] });
  e.ocorrencia.fatos = e.ocorrencia.fatos.slice(0, 3).map((f) => ({ descricao: String(f.descricao || ''), envolvidos: Array.isArray(f.envolvidos) ? f.envolvidos : [] }));
  return e;
}

export function importarJson(texto) {
  let dado;
  try { dado = JSON.parse(texto); } catch { throw new Error('O arquivo não é um JSON válido.'); }
  if (!dado || dado.tipo !== TIPO_ARQUIVO) throw new Error('Este arquivo não é um rascunho deste sistema.');
  if (typeof dado.formato !== 'number') throw new Error('Versão do formato ausente.');
  if (dado.formato > VERSAO_FORMATO) throw new Error(`Rascunho feito por versão mais nova (formato ${dado.formato}). Atualize o site.`);
  const o = dado.ocorrencia;
  if (!o || typeof o !== 'object' || !o.ocorrencia || !o.local) throw new Error('Estrutura do rascunho incompleta.');
  for (const k of ['envolvidos', 'veiculos', 'objetos', 'equipe']) {
    if (o[k] !== undefined && !Array.isArray(o[k])) throw new Error(`Campo "${k}" inválido.`);
  }
  return migrar(o);
}

// ---------------------------------------------------------------- utilidades
export function rotuloEnvolvido(e) { return `E-${e.numero}`; }
export function rotuloVeiculo(v) { return `V-${v.numero}`; }

export function renumerar(lista) { lista.forEach((x, i) => { x.numero = i + 1; }); }

export function ocorrenciaTemDados(e) {
  if (!e) return false;
  const o = e.ocorrencia;
  return !!(o.numeroBo || e.relato || e.envolvidos.length || e.veiculos.length || e.objetos.length ||
    e.local.logradouro || o.fatos.some((f) => f.descricao) || Object.keys(e.marcas).length || e.importacoes.length);
}
