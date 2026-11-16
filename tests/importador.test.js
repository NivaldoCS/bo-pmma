// Testes do importador do WhatsApp (dados fictícios). Rodar: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analisar, montarRevisao, aplicar, pendenciasImportacao, normalizarHora, normalizarData, substituirNoHistorico, analisarPolicial } from '../js/importador.js';
import { ocorrenciaVazia } from '../js/estado.js';

const MUN = ['Barão de Grajaú', 'São João dos Patos', 'Floriano'];

const EXEMPLO = `SERVIÇO DO DIA: 14/11/2026
CPU DO BPM: Nome do CPU
TÍTULO DA OCORRÊNCIA: Furto de motocicleta
EQUIPE: RP
Cb Policial A
Cb Policial B
Sd Policial C
B.O: 001/2026
DATA: 14/11/2026
HORA: 23:00
LOCAL: Rua Exemplo, bairro Centro, Barão de Grajaú.
PROCEDIMENTO ADOTADO: BO INFORMATIVO
Vítima: Pessoa de Exemplo
Acusado:
HISTÓRICO: Relato da ocorrência.`;

test('exemplo do enunciado', () => {
  const r = analisar(EXEMPLO, { municipiosConhecidos: MUN });
  assert.equal(r.campos.servicoDia, '14/11/2026');
  assert.equal(r.campos.cpu, 'Nome do CPU');
  assert.equal(r.campos.titulo, 'Furto de motocicleta');
  assert.equal(r.campos.equipeNome, 'RP');
  assert.deepEqual(r.integrantes.map((p) => [p.posto, p.nome]), [['Cb', 'Policial A'], ['Cb', 'Policial B'], ['Sd', 'Policial C']]);
  assert.equal(r.campos.numeroBo, '001/2026');
  assert.equal(r.campos.data, '14/11/2026');
  assert.equal(r.campos.hora, '23:00');
  assert.equal(r.campos.local_logradouro, 'Rua Exemplo');
  assert.equal(r.campos.local_bairro, 'Centro');
  assert.equal(r.campos.local_municipio, 'Barão de Grajaú');
  assert.equal(r.campos.procedimento, 'BO INFORMATIVO');
  assert.equal(r.pessoas.length, 1);
  assert.equal(r.pessoas[0].papel, 'vitima');
  assert.equal(r.pessoas[0].nome, 'Pessoa de Exemplo');
  assert.ok(r.vazios.includes('Acusado'));
  assert.equal(r.campos.historico, 'Relato da ocorrência.');
  assert.equal(r.naoReconhecido.length, 0);
});

test('negrito, emojis, espaços e variações de rótulo', () => {
  const t = `🚨 *35º BPM - 2º PELOTÃO* 🚨
*SERVIÇO   DO DIA:*   14/11/2026
👮 *GUARNIÇÃO:* Cb PM Policial A, Mat. 123456; Sd PM Policial B
*BO:* 002/2026
*DATA/HORA:* 13/11/2026 às 22h30
📍 *ENDEREÇO DA OCORRÊNCIA:* Rua Fictícia, nº 45, bairro Vila Nova, Barão de Grajaú - MA
*COORDENADAS:* -6.7512, -43.0234
*VITIMA:* Fulano Fictício, CPF 012.345.678-90, nasc. 05/03/1985
*SUSPEITO:* não identificado
*TESTEMUNHA:* Testemunha Exemplo
CPF: 098.765.432-10
*Historico*
A guarnição foi acionada.

A GU deslocou ao local e localizou a moto Honda placa ABC1D23.`;
  const r = analisar(t, { municipiosConhecidos: MUN });
  assert.match(r.campos.unidade, /35º BPM/);
  assert.match(r.campos.pelotao, /2º PELOTÃO/);
  assert.equal(r.campos.servicoDia, '14/11/2026');
  assert.equal(r.integrantes.length, 2);
  assert.equal(r.integrantes[0].matricula, '123456');
  assert.equal(r.campos.numeroBo, '002/2026');
  assert.equal(r.campos.data, '13/11/2026');
  assert.equal(r.campos.hora, '22:30');
  assert.equal(r.campos.local_logradouro, 'Rua Fictícia');
  assert.equal(r.campos.local_numero, '45');
  assert.equal(r.campos.local_bairro, 'Vila Nova');
  assert.equal(r.campos.local_municipio, 'Barão de Grajaú');
  assert.equal(r.campos.latitude, '-6.7512');
  assert.equal(r.campos.longitude, '-43.0234');
  const v = r.pessoas.find((p) => p.papel === 'vitima');
  assert.equal(v.cpf, '012.345.678-90', 'CPF com zero inicial preservado');
  assert.equal(v.nascimento, '05/03/1985');
  assert.equal(r.pessoas.find((p) => p.papel === 'testemunha').cpf, '098.765.432-10');
  assert.ok(!r.pessoas.some((p) => p.papel === 'suspeito'), 'suspeito não identificado não vira pessoa');
  assert.match(r.campos.historico, /^A guarnição foi acionada\.\n\nA GU deslocou/);
  assert.ok(r.conflitos.some((c) => /SERVIÇO DO DIA 14\/11\/2026 e DATA 13\/11\/2026/.test(c)));
  const sug = r.veiculos.find((x) => x.placa === 'ABC1D23');
  assert.equal(sug.origem, 'historico');
  assert.ok(r.sugestoesHistorico.some((s) => s.para === 'EQUIPE'));
});

test('nome divergente entre rótulo e histórico não é corrigido', () => {
  const t = 'Vítima: Anastazio da Costa Exemplo\nHistórico: O senhor Anastácio da Costa Exemplo relatou o furto.';
  const r = analisar(t);
  assert.equal(r.pessoas[0].nome, 'Anastazio da Costa Exemplo');
  assert.ok(r.conflitos.some((c) => c.includes('"Anastazio"') && c.includes('"Anastácio"')));
  assert.match(r.campos.historico, /Anastácio/);
});

test('campos ausentes ficam vazios e viram pendência', () => {
  const r = analisar('Histórico: apenas o relato.');
  assert.equal(r.campos.numeroBo, undefined);
  const p = pendenciasImportacao(r);
  assert.ok(p.some((x) => /Nº do BO/.test(x)));
  assert.ok(p.some((x) => /Data e hora/.test(x)));
});

test('aplicar não preenche horários de fato/comunicação nem endereço da vítima', () => {
  const r = analisar(EXEMPLO, { municipiosConhecidos: MUN });
  const est = ocorrenciaVazia({ municipio: 'Barão de Grajaú' });
  const itens = montarRevisao(est, r);
  aplicar(est, r, itens);
  const o = est.ocorrencia;
  for (const k of ['fato', 'comunicacao', 'atendimento', 'fechamento']) {
    assert.equal(o.datas[k].data, ''); assert.equal(o.datas[k].hora, '');
  }
  assert.equal(o.dataInformada, '14/11/2026');
  assert.equal(o.horaInformada, '23:00');
  assert.deepEqual(o.tipos, [], 'BO INFORMATIVO não vira classificação');
  assert.equal(o.procedimentoAdotado, 'BO INFORMATIVO');
  assert.deepEqual(Object.values(est.sn), ['', '', '', '', ''], 'SIM/NÃO não preenchidos');
  assert.equal(est.envolvidos.length, 1);
  assert.equal(est.envolvidos[0].res.logradouro, '', 'endereço da ocorrência não é endereço da vítima');
  assert.deepEqual(est.envolvidos[0].participacao, ['ofendido']);
  assert.equal(est.local.logradouro, 'Rua Exemplo');
  assert.equal(est.relato, 'Relato da ocorrência.');
  assert.equal(est.equipe.length, 3);
  assert.equal(est.importacoes.length, 1);
  assert.equal(est.importacoes[0].texto, EXEMPLO, 'texto original preservado');
});

test('reimportação não apaga trabalho revisado (conflitos ficam desmarcados)', () => {
  const r1 = analisar(EXEMPLO, { municipiosConhecidos: MUN });
  const est = ocorrenciaVazia({});
  aplicar(est, r1, montarRevisao(est, r1));
  est.relato = 'Histórico revisado manualmente.';
  est.local.logradouro = 'Rua Exemplo, corrigida';
  const r2 = analisar(EXEMPLO, { municipiosConhecidos: MUN });
  const itens = montarRevisao(est, r2);
  const hist = itens.find((i) => i.id === 'historico');
  assert.equal(hist.situacao, 'conflito');
  assert.equal(hist.aplicar, false);
  assert.equal(itens.find((i) => i.id === 'pessoa:0').aplicar, false, 'pessoa já existente');
  assert.equal(itens.find((i) => i.id === 'policial:0').aplicar, false);
  aplicar(est, r2, itens);
  assert.equal(est.relato, 'Histórico revisado manualmente.');
  assert.equal(est.local.logradouro, 'Rua Exemplo, corrigida');
  assert.equal(est.envolvidos.length, 1);
  assert.equal(est.equipe.length, 3);
  assert.equal(est.importacoes.length, 2);
});

test('acusado nomeado não recebe participação automática', () => {
  const r = analisar('ACUSADO: Fulano de Tal Fictício\nVÍTIMA: Beltrana Fictícia');
  const est = ocorrenciaVazia({});
  aplicar(est, r, montarRevisao(est, r));
  const ac = est.envolvidos.find((e) => e.nome === 'Fulano de Tal Fictício');
  assert.deepEqual(ac.participacao, []);
  assert.equal(ac.papelImportado, 'ACUSADO');
  assert.ok(pendenciasImportacao(r).some((p) => /participação de "Fulano/.test(p)));
});

test('veículo e objetos com rótulo', () => {
  const r = analisar('VEÍCULO: Honda CG 160 Fan, placa QWE-1234, cor vermelha, ano 2019\nOBJETOS APREENDIDOS:\n1 faca tipo peixeira\n2 celulares');
  assert.equal(r.veiculos[0].placa, 'QWE1234');
  assert.equal(r.veiculos[0].cor, 'Vermelha');
  assert.equal(r.veiculos[0].ano, '2019');
  assert.equal(r.veiculos[0].marcaModelo, 'Honda CG 160 Fan');
  assert.equal(r.objetos.length, 2);
  const est = ocorrenciaVazia({});
  aplicar(est, r, montarRevisao(est, r));
  assert.equal(est.objetos[1].quantidade, '2');
  assert.equal(est.objetos[1].descricao, 'celulares');
  assert.equal(est.veiculos[0].proprietario.nome, '', 'proprietário não é suposto');
});

test('normalizações', () => {
  assert.equal(normalizarHora('23h'), '23:00');
  assert.equal(normalizarHora('7h05min'), '07:05');
  assert.equal(normalizarHora('23:59'), '23:59');
  assert.equal(normalizarData('1/2/26'), '01/02/2026');
  assert.equal(normalizarData('31.12.2026'), '31/12/2026');
  assert.deepEqual(analisarPolicial('3º SGT PM Fulano Fictício, mat. 001234'), { posto: '3º SGT PM', nome: 'Fulano Fictício', matricula: '001234' });
  const s = substituirNoHistorico('A guarnição chegou. A GU saiu.', ['guarnição', 'GU'], 'EQUIPE');
  assert.equal(s.texto, 'A EQUIPE chegou. A EQUIPE saiu.');
  assert.equal(s.trocas, 2);
});
