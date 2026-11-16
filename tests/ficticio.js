// Dados 100% FICTÍCIOS para testes. Nenhum dado real.
import { ocorrenciaVazia, novoEnvolvido, novoVeiculo, novoObjeto, novoPolicial } from '../js/estado.js';

export const RELATO_LONGO = Array.from({ length: 14 }, (_, i) =>
  `Parágrafo ${i + 1}: a EQUIPE realizou diligências na região, conversou com moradores, verificou câmeras e registrou as informações coletadas, com atenção à ação, à situação e ao horário informado pela vítima.`).join('\n\n');

export function ocorrenciaCompleta({ relatoLongo = false, muitosObjetos = false } = {}) {
  const e = ocorrenciaVazia({ unidade: '35º BPM - 2º Pelotão - Barão de Grajaú/MA', municipio: 'Barão de Grajaú' });
  const o = e.ocorrencia;
  o.numeroBo = '001/2026';
  o.tipos = ['comunicacao'];
  o.datas.fato = { data: '14/11/2026', hora: '23:00' };
  o.datas.comunicacao = { data: '14/11/2026', hora: '23:05' };
  o.fatos[0].descricao = 'Furto de motocicleta';
  e.local = { ...e.local, logradouro: 'Rua Exemplo', numero: 'S/N', bairro: 'Centro', cep: '65660-000', referencia: 'Próximo à praça (fictício)', latitude: '-6.7500', longitude: '-43.0200' };
  e.marcas = { amb__via_publica: true, amb_iluminacao_artificial__sim_pouca_visibilidade: true, meios__forca_fisica: true, doc__termo_manifestacao_ofendido: true };
  e.relato = relatoLongo ? RELATO_LONGO : 'Por volta das 23h, a EQUIPE foi acionada pela vítima, que informou o furto de sua motocicleta. Foram feitas rondas sem êxito. Ação, situação, coração, pão — acentuação conferida.';
  e.sn.fotografado = 'nao';
  e.sn.disparo = 'nao';
  e.outrasProvidencias = 'Vítima orientada a comparecer à Delegacia de Polícia Civil para os procedimentos cabíveis.';

  const e1 = novoEnvolvido(1);
  Object.assign(e1, { nome: 'Pessoa de Exemplo Ação', nomeMae: 'Mãe Fictícia da Conceição', nascimento: '01/02/1990', sexo: 'm', cpf: '012.345.678-90', nacionalidade: 'Brasileira', naturalDe: 'São João dos Patos/MA', participacao: ['ofendido', 'comunicante'], raca: 'parda', estadoCivil: 'solteiro' });
  e1.res = { ...e1.res, logradouro: 'Travessa Fictícia', numero: '10', bairro: 'Vila Exemplo', municipio: 'Barão de Grajaú', estado: 'MA', telDdd: '99', telNumero: '98888-0000' };
  e1.relato.texto = 'Declara que deixou a motocicleta no quintal e, ao retornar, não a encontrou.';
  const e2 = novoEnvolvido(2);
  Object.assign(e2, { nome: 'Suspeito Não Identificado', participacao: ['a_apurar'], semDocumento: true });
  e.envolvidos = [e1, e2];
  o.fatos[0].envolvidos = [e1.uid, e2.uid];

  const v1 = novoVeiculo(1);
  Object.assign(v1, { placa: 'ABC1D23', marcaModelo: 'Honda / Modelo Fictício 150', cor: 'Preta', ano: '2009', especie: 'Motocicleta', municipioUf: 'Barão de Grajaú/MA', pais: 'Brasil' });
  v1.proprietario.nome = 'Pessoa de Exemplo Ação';
  v1.prov.guinchamento = 'nao';
  e1.veiculoUid = v1.uid;
  const v2 = novoVeiculo(2);
  Object.assign(v2, { placa: 'XYZ9876', marcaModelo: 'Veículo Fictício', cor: 'Branca' });
  e.veiculos = [v1, v2];

  const ob = novoObjeto(1);
  Object.assign(ob, { participacao: '2', descricao: 'Capacete preto', quantidade: '1', envolvidoUid: e1.uid });
  e.objetos = [ob];
  if (muitosObjetos) {
    for (let i = 2; i <= 9; i++) e.objetos.push(Object.assign(novoObjeto(i), { participacao: '1', descricao: `Objeto fictício ${i}`, quantidade: String(i) }));
  }
  e.equipe = [
    novoPolicial({ posto: 'Cb PM', nome: 'Policial A' }),
    novoPolicial({ posto: 'Cb PM', nome: 'Policial B' }),
    novoPolicial({ posto: 'Sd PM', nome: 'Policial C' }),
  ];
  return e;
}
