// Testes do mapeamento e do gerador (dados fictícios).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PDFDocument, PDFName } from '../vendor/pdf-lib.esm.min.js';
import { gerarDocumento } from '../js/pdf/gerador.js';
import { mapearBO, mapearFicha, planejarFichas, NOMES_BO, NOMES_ENV, nomeArquivo } from '../js/pdf/mapa.js';
import * as OP from '../js/opcoes.js';
import { ocorrenciaVazia, novoEnvolvido, novoVeiculo, novoObjeto, novoPolicial, migrar, exportarJson, importarJson } from '../js/estado.js';
import { ocorrenciaCompleta } from './ficticio.js';

const carregarModelo = async (n) => readFileSync(new URL(`../templates/${n}`, import.meta.url));

function tudoPreenchidoBO(i) {
  const e = ocorrenciaVazia({ unidade: 'U', municipio: 'M' });
  const o = e.ocorrencia;
  o.numeroBo = '1'; o.tipos = OP.TIPOS_DOC.map((t) => t[0]); o.tipoOutrosTexto = 'x';
  for (const k of Object.keys(o.datas)) o.datas[k] = { data: '01/01/2026', hora: '10:00' };
  const en = novoEnvolvido(1); e.envolvidos = [en];
  o.fatos.forEach((f) => { f.descricao = 'd'; f.envolvidos = [en.uid]; });
  Object.assign(e.local, { logradouro: 'a', numero: '1', bairro: 'b', municipio: 'm', cep: '65000-000', referencia: 'r' });
  for (const g of [...OP.GRUPOS_AMBIENTE, OP.GRUPO_MEIOS]) for (const [n] of g.opcoes) e.marcas[n] = true;
  for (const [n] of OP.DOCUMENTOS_BO) e.marcas[n] = true;
  e.marcas.amb__interior = true; e.marcas.amb__via_publica = true;
  e.meiosOutrosTexto = 'x'; e.relato = 'r'; e.objetosDestino = 'd'; e.icResponsavel = 'i'; e.disparoQuantidade = '0';
  for (const [k] of OP.SN_BO) e.sn[k] = i % 2 ? 'sim' : 'nao';
  e.outrasProvidencias = 'Linha um muito longa '.repeat(12);
  e.objetos = Array.from({ length: 6 }, (_, k) => Object.assign(novoObjeto(k + 1), { descricao: `o${k}`, participacao: '1' }));
  e.equipe = [novoPolicial({ posto: 'Cb PM', nome: 'A' }), novoPolicial({ posto: 'Sd PM', nome: 'B' })];
  return e;
}

test('BO: toda a estrutura de campos é alcançável pelo sistema', () => {
  const usados = new Set();
  for (const i of [0, 1]) {
    const m = mapearBO(tudoPreenchidoBO(i));
    Object.keys(m.campos).forEach((k) => usados.add(k));
    m.blocos.forEach((b) => b.campos.forEach((k) => usados.add(k)));
  }
  const faltando = [...NOMES_BO].filter((n) => !usados.has(n));
  assert.deepEqual(faltando, []);
  for (const k of usados) assert.ok(NOMES_BO.has(k), `campo inexistente ${k}`);
});

test('Ficha: toda a estrutura de campos é alcançável pelo sistema', () => {
  const usados = new Set();
  const pick = (lista, i) => lista[i % lista.length][0];
  for (let i = 0; i < 7; i++) {
    const e = ocorrenciaVazia({ unidade: 'U' });
    e.ocorrencia.numeroBo = '1';
    const en = novoEnvolvido(i + 1);
    Object.keys(en).forEach((k) => { if (typeof en[k] === 'string' && k !== 'uid') en[k] = 'v'; });
    en.numero = i + 1;
    en.participacao = OP.PARTICIPACAO.map((x) => x[0]); en.acidente = OP.ACIDENTE.map((x) => x[0]);
    en.sexo = pick(OP.SEXO, i); en.raca = pick(OP.RACA, i); en.estadoCivil = pick(OP.ESTADO_CIVIL, i);
    en.instrucao = pick(OP.INSTRUCAO, i); en.situacaoInstrucao = pick(OP.SITUACAO_INSTRUCAO, i);
    en.naoHabilitado = true;
    for (const end of [en.res, en.com]) for (const k of Object.keys(end)) end[k] = k === 'telNumero' ? '98888-0000' : 'v';
    en.condicoes = OP.CONDICOES.map((x) => x[0]); en.bens = 'b';
    en.relato = { local: 'l', dataHora: 'd', testemunhaCompromissada: true, alertas: OP.ALERTAS.map((x) => x[0]), texto: 't' };
    en.algemado = i % 2 ? 'sim' : 'nao'; en.algemaJustificativas = OP.JUSTIFICATIVAS_ALGEMA.map((x) => x[0]);
    en.manifestacaoOfendido = true;
    en.declaracao = { eu: 'e', funcao: 'f', dia: '1', mes: '2', ano: '2026', local: 'l', pessoaQualificada: true, recebiCoisas: true };
    const v = novoVeiculo(i + 1);
    for (const k of ['placa', 'renavamChassi', 'especie', 'marcaModelo', 'cor', 'ano', 'municipioUf', 'pais', 'ocupantes', 'conduzidoPara', 'estabelecimento', 'transporte']) v[k] = 'v';
    for (const k of Object.keys(v.proprietario)) v.proprietario[k] = 'v';
    v.cinto = pick(OP.CINTO, i);
    for (const [k] of OP.SN_VEICULO) v.prov[k] = i % 2 ? 'sim' : 'nao';
    Object.assign(v.prov, { medicao: 'm', tiquete: 't', ait: 'a', autoRemocao: 'r', guinchadoPor: OP.GUINCHADO_POR.map((x) => x[0]), empresaGuincho: 'e', motoristaGuincho: 'm' });
    Object.assign(v.carga, { tipo: 't', notaFiscal: 'n', empresa: 'e', semCarga: true, peso: 'p', danos: OP.DANOS_CARGA.map((x) => x[0]), natureza: OP.NATUREZA_CARGA.map((x) => x[0]), complemento: 'c', onu: 'o', tacografo: i % 2 ? 'sim' : 'nao' });
    const m = mapearFicha(e, en, v);
    Object.keys(m.campos).forEach((k) => usados.add(k));
    m.blocos.forEach((b) => b.campos.forEach((k) => usados.add(k)));
  }
  const faltando = [...NOMES_ENV].filter((n) => !usados.has(n));
  assert.deepEqual(faltando, []);
  for (const k of usados) assert.ok(NOMES_ENV.has(k), `campo inexistente ${k}`);
});

test('planejamento de fichas: sem vínculos inventados e sem omitir registros', () => {
  const e = ocorrenciaCompleta();
  const p = planejarFichas(e);
  assert.deepEqual(p.map((f) => f.rotulo), ['E-1 + V-1', 'E-2', 'V-2 (sem envolvido vinculado)']);
});

test('nome de arquivo sem dados pessoais', () => {
  const e = ocorrenciaCompleta();
  assert.equal(nomeArquivo(e, 'bo', 'editavel'), 'BO_001-2026.pdf');
  assert.equal(nomeArquivo(e, 'conjunto', 'impressao'), 'OCORRENCIA_001-2026_impressao.pdf');
  assert.ok(!/Pessoa|012/.test(nomeArquivo(e, 'fichas', 'editavel')));
});

async function abrir(bytes) { return PDFDocument.load(bytes); }

test('conjunto editável: nomes únicos por documento, valores e aparências', async () => {
  const e = ocorrenciaCompleta();
  const r = await gerarDocumento(e, { tipo: 'conjunto', modo: 'editavel', carregarModelo });
  const doc = await abrir(r.bytes);
  const campos = doc.getForm().getFields();
  const nomes = campos.map((f) => f.getName());
  assert.equal(new Set(nomes).size, nomes.length, 'nomes duplicados');
  assert.equal(nomes.filter((n) => n.startsWith('BO-')).length, NOMES_BO.size);
  assert.equal(nomes.filter((n) => n.startsWith('F1-')).length, NOMES_ENV.size);
  assert.equal(nomes.filter((n) => n.startsWith('F3-')).length, NOMES_ENV.size);
  const tf = (n) => doc.getForm().getTextField(n);
  assert.equal(tf('BO-ciops').getText(), '001/2026');
  assert.equal(tf('BO-fato1_envolvidos').getText(), 'E-1, E-2');
  assert.equal(tf('F1-cpf').getText(), '012.345.678-90', 'zero inicial preservado');
  assert.equal(tf('F1-nome').getText(), 'Pessoa de Exemplo Ação');
  assert.equal(tf('F1-veic_placa').getText(), 'ABC1D23');
  assert.equal(tf('F2-veic_placa').getText(), undefined, 'E-2 sem veículo vinculado');
  assert.equal(tf('F3-veic_placa').getText(), 'XYZ9876');
  assert.equal(tf('F3-nome').getText(), undefined);
  assert.equal(tf('F1-id__e1').getText(), 'X');
  assert.equal(tf('F2-id__e2').getText(), 'X');
  assert.equal(tf('BO-fotografado__nao').getText(), 'X');
  assert.equal(tf('BO-pc_acionada__sim').getText(), undefined, 'pergunta sem resposta fica vazia');
  assert.equal(tf('BO-pc_acionada__nao').getText(), undefined);
  // editar uma ficha não altera outra
  tf('F1-nome').setText('Alterado');
  assert.equal(tf('F2-nome').getText(), 'Suspeito Não Identificado');
  assert.equal(tf('F1-nome').getText(), 'Alterado');
  // widgets: todos com aparência e ligados às páginas
  const paginas = new Set(doc.getPages().map((p) => p.ref.toString()));
  for (const f of campos) {
    for (const w of f.acroField.getWidgets()) {
      assert.ok(w.getNormalAppearance(), `sem aparência: ${f.getName()}`);
      assert.ok(paginas.has(w.P().toString()), `widget sem página: ${f.getName()}`);
    }
  }
  const acro = doc.catalog.getAcroForm();
  assert.ok(acro.dict.get(PDFName.of('DR')));
});

test('cópia para impressão: sem campos, páginas na ordem', async () => {
  const e = ocorrenciaCompleta({ relatoLongo: true, muitosObjetos: true });
  const r = await gerarDocumento(e, { tipo: 'conjunto', modo: 'impressao', carregarModelo });
  const doc = await abrir(r.bytes);
  assert.equal(doc.getForm().getFields().length, 0);
  assert.equal(doc.getPageCount(), 3 + 6);
  assert.equal(r.resumo.continuacoes[0].doc, 'BO');
});

test('histórico longo gera continuação sem perder texto', async () => {
  const e = ocorrenciaCompleta({ relatoLongo: true });
  const r = await gerarDocumento(e, { tipo: 'bo', modo: 'editavel', carregarModelo });
  const doc = await abrir(r.bytes);
  const no = doc.getForm().getTextField('BO-relato').getText();
  assert.match(no, /\[continua na folha de continuação\]$/);
  assert.ok(r.resumo.continuacoes[0].motivos.some((m) => /RELATO/.test(m)));
  assert.equal(doc.getPageCount(), 3);
});

test('rascunho JSON: exporta, valida estrutura e versão', () => {
  const e = ocorrenciaCompleta();
  const j = exportarJson(e);
  const de = importarJson(j);
  assert.equal(de.envolvidos[0].cpf, '012.345.678-90');
  assert.equal(de.ocorrencia.numeroBo, '001/2026');
  assert.throws(() => importarJson('{"tipo":"outro"}'), /não é um rascunho/);
  assert.throws(() => importarJson(JSON.stringify({ tipo: 'pmma-bo-rascunho', formato: 99, ocorrencia: {} })), /mais nova/);
  assert.throws(() => importarJson('não json'), /JSON válido/);
  assert.throws(() => importarJson(JSON.stringify({ tipo: 'pmma-bo-rascunho', formato: 1, ocorrencia: { ocorrencia: {}, local: {}, envolvidos: 'x' } })), /inválido/);
  const m = migrar({ formato: 1, ocorrencia: { numeroBo: 7 }, local: {}, marcas: { a: true, b: 'sim' } });
  assert.equal(m.ocorrencia.numeroBo, '7');
  assert.deepEqual(m.marcas, { a: true });
});
