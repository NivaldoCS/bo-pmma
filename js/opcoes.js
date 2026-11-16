// Opções exibidas na interface. Os valores correspondem aos sufixos dos campos
// dos modelos (ver js/pdf/mapa.js). Fonte única para a tela e para os testes.
import { CAMPOS_BO } from './pdf/campos-modelo.js';

export const TIPOS_DOC = [
  ['comunicacao', 'Comunicação de ocorrência policial'],
  ['acidente_transito', 'Acidente de trânsito'],
  ['prisao_apreensao', 'Prisão/apreensão'],
  ['boa', 'BOA'],
  ['termo_circunstanciado', 'Termo circunstanciado'],
  ['outros', 'Outros'],
];

export const SN_BO = [
  ['fotografado', 'Fotografado?'],
  ['pc_acionada', 'A Polícia Civil foi acionada?'],
  ['pc_no_local', 'Polícia Civil esteve no local?'],
  ['ic_no_local', 'Instituto de Criminalística esteve no local?'],
  ['disparo', 'Houve disparo de arma de fogo por policiais militares nesta ocorrência?'],
];

const TITULOS_GRUPO = {
  atividade_financeira: '1 Atividade financeira', ensino: '2 Ensino', saude: '3 Saúde', posto_combustivel: '4 Posto de combustível',
  associacao: '5 Associação', transporte: '6 Transporte', veiculo: '7 Veículo', residencia: '8 Residência',
  residencia_qualificacao: '8 Residência — qualificação', mercado: '9 Mercado', alimentacao_diversao: '10 Alimentação/diversão',
  comercio: '11 Comércio', industria: '12 Indústria', hospedagem: '13 Hospedagem', prestacao_servicos: '14 Prestação de serviços',
  orgao_publico: '15 Órgão público', outros_ambientes: '16 Outros ambientes', horario_funcionamento: 'Horário de funcionamento',
  eventos: 'Eventos', circulacao_veiculos: 'Circulação de veículos', circulacao_pessoas: 'Circulação de pessoas',
  iluminacao_artificial: 'Iluminação artificial', desordem: 'Desordem', meios: '4 Meios empregados',
};

function grupos(filtro) {
  const mapa = new Map();
  for (const c of CAMPOS_BO) {
    if (!c.g || !filtro(c)) continue;
    if (!mapa.has(c.g)) mapa.set(c.g, { id: c.g, titulo: TITULOS_GRUPO[c.g] || c.g, opcoes: [] });
    mapa.get(c.g).opcoes.push([c.n, c.o]);
  }
  return [...mapa.values()];
}

// grupos de seleção única (somente uma opção faz sentido)
export const GRUPOS_UNICOS = new Set(['circulacao_veiculos', 'circulacao_pessoas', 'iluminacao_artificial', 'horario_funcionamento']);
export const GRUPOS_AMBIENTE = grupos((c) => c.n.startsWith('amb_'));
export const GRUPO_MEIOS = grupos((c) => c.g === 'meios')[0];

export const DOCUMENTOS_BO = [
  ['doc__termo_manifestacao_ofendido', 'Termo de manifestação do ofendido'],
  ['doc__termo_apreensao_deposito', 'Termo de apreensão/depósito'],
  ['doc__requisicao_laudo_droga', 'Requisição de laudo de constatação da natureza e quantidade de droga'],
  ['doc__termo_compromisso_comparecimento', 'Termo de compromisso de comparecimento'],
  ['doc__requisicao_corpo_delito', 'Requisição para exame de corpo de delito direto'],
];

export const PARTICIPACAO = [
  ['comunicante', 'Comunicante'], ['autor_do_fato', 'Autor do fato'], ['ofendido', 'Ofendido'],
  ['testemunha', 'Testemunha'], ['a_apurar', 'A apurar'],
];
export const ACIDENTE = [
  ['condutor_motorista', 'Condutor/motorista'], ['pedestre', 'Pedestre'], ['passageiro', 'Passageiro'], ['vitima', 'Vítima'],
];
export const SEXO = [['m', 'M'], ['f', 'F'], ['outros', 'Outros']];
export const RACA = [['branca', 'Branca'], ['preta', 'Preta'], ['parda', 'Parda'], ['indigena', 'Indígena'], ['amarela', 'Amarela']];
export const ESTADO_CIVIL = [
  ['solteiro', 'Solteiro'], ['casado', 'Casado'], ['uniao_estavel', 'União estável'], ['divorciado', 'Divorciado'],
  ['separado', 'Separado'], ['viuvo', 'Viúvo'], ['nao_informado', 'Não informado'],
];
export const INSTRUCAO = [
  ['nao_alfabetizado', 'Não alfabetizado'], ['semi_alfabetizado', 'Semi alfabetizado'], ['fundamental', 'Fundamental'],
  ['medio', 'Médio'], ['superior', 'Superior'], ['pos_graduado', 'Pós-graduado'], ['nao_informado', 'Não informado'],
];
export const SITUACAO_INSTRUCAO = [['completo', 'Completo'], ['incompleto', 'Incompleto'], ['cursando', 'Cursando']];
export const CONDICOES = [
  ['sintomas_embriaguez', 'Sintomas de embriaguez'], ['efeito_droga_ilicita', 'Sob efeito de droga ilícita'],
  ['problema_clinico', 'Problema clínico'], ['portador_deficiencia', 'Portador de deficiência'], ['parturiente', 'Parturiente'],
  ['sem_lesoes', 'Sem lesões'], ['lesoes_leves', 'Lesões leves'], ['lesoes_graves', 'Lesões graves ou gravíssimas'], ['obito', 'Óbito'],
];
export const ALERTAS = [
  ['silencio', 'Alertado(a) sobre o direito de permanecer em silêncio'],
  ['falso_testemunho', 'Alertado(a) sobre as penas do crime de falso testemunho'],
  ['denunciacao_caluniosa', 'Alertado(a) sobre as penas do crime de denunciação caluniosa'],
];
export const JUSTIFICATIVAS_ALGEMA = [
  ['resistencia', 'Resistência'], ['fuga', 'Fundado receio de fuga'], ['perigo', 'Perigo à integridade física própria ou alheia'],
];
export const CINTO = [['sim', 'Sim'], ['nao', 'Não'], ['ignorado', 'Ignorado']];
export const SN_VEICULO = [
  ['exameAlcoolico', 'Exame alcoólico?'], ['encaminhadoDp', 'Encaminhado DP?'], ['condutorAutuado', 'Condutor autuado?'],
  ['cnhRecolhida', 'Recolhida CNH/PD?'], ['crlvRecolhido', 'Recolhido CRLV?'], ['guinchamento', 'Guinchamento?'],
];
export const GUINCHADO_POR = [['seguradora', 'Seguradora'], ['upm', 'UPM'], ['outro', 'Outro']];
export const DANOS_CARGA = [['parcial', 'Parcial'], ['total', 'Total']];
export const NATUREZA_CARGA = [['prod_per', 'Prod. per.'], ['perecivel', 'Perecível'], ['indivisivel', 'Indivisível'], ['outra', 'Outra']];
export const PARTICIPACAO_OBJETO = [['1', '1 - Apreendido'], ['2', '2 - Furtado'], ['3', '3 - Roubado'], ['4', '4 - Perdido'], ['5', '5 - Encontrado'], ['6', '6 - Recuperado']];
export const POSTOS = ['Sd PM', 'Cb PM', '3º Sgt PM', '2º Sgt PM', '1º Sgt PM', 'ST PM', 'Asp Of PM', '2º Ten PM', '1º Ten PM', 'Cap PM', 'Maj PM', 'TC PM', 'Cel PM'];
