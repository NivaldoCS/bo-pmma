// Testes do módulo PERMUTA DE SERVIÇO (dados fictícios).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PDFDocument, PDFName } from '../vendor/pdf-lib.esm.min.js';
import { gerarPermuta } from '../js/permuta/gerador-permuta.js';
import { permutaVazia, validar, montarValores, nomeArquivoPermuta, postoSemPM, normalizar, horarioAtravessaMeiaNoite } from '../js/permuta/permuta.js';
import { medirTimes, suportadoTimes } from '../js/permuta/tela-permuta.js';
import { PERMUTA } from '../js/permuta/coordenadas.js';

const carregarModelo = async (n) => readFileSync(new URL(`../templates/${n}`, import.meta.url));

export function permutaFicticia(extra = {}) {
  const e = permutaVazia({ municipio: 'Barão de Grajaú', uf: 'MA' });
  e.solicitante = { posto: 'Sd PM', numero: '012345', nome: 'Ana Conceição Sá' };
  e.substituto = { posto: 'Cb PM', numero: '0098765', nome: 'João Ação' };
  e.servico = { data: '20/11/2026', inicio: '07:00', fim: '19:00', terminaDiaSeguinte: false };
  e.emissao = { local: 'Barão de Grajaú - MA', data: '16/11/2026' };
  return Object.assign(e, extra);
}
const val = (e) => validar(e, medirTimes, suportadoTimes);

test('dados completos: sem erros, valores nas áreas certas, zeros à esquerda', () => {
  const r = val(permutaFicticia());
  assert.deepEqual(r.erros, []);
  assert.equal(r.valores.solicitante_numero, '012345');
  assert.equal(r.valores.solicitante_posto, 'Sd', '"PM" não é duplicado antes de "PM nº"');
  assert.equal(r.valores.substituto, 'Cb PM 0098765 João Ação.');
  assert.equal(r.valores.emissao_dia, '16');
  assert.equal(r.valores.emissao_mes, 'novembro');
  assert.equal(r.valores.emissao_ano, '2026');
  assert.equal(r.valores.emissao_local, 'Barão de Grajaú - MA');
  assert.deepEqual([r.valores.servico_dia, r.valores.servico_mes, r.valores.servico_ano], ['20', '11', '2026']);
});

test('campos obrigatórios ausentes geram mensagens claras', () => {
  const e = permutaVazia({});
  e.emissao.local = ''; e.emissao.data = '';
  const r = val(e);
  for (const t of ['SOLICITANTE: informe o posto', 'SOLICITANTE: informe o número', 'SOLICITANTE: informe o nome', 'SUBSTITUTO: informe o nome',
    'data do serviço', 'horário inicial', 'horário final', 'local de emissão', 'data de emissão']) {
    assert.ok(r.erros.some((x) => x.toLowerCase().includes(t.toLowerCase())), `falta mensagem: ${t}`);
  }
});

test('serviço que termina no dia seguinte exige confirmação, sem presumir duração', () => {
  const e = permutaFicticia({ servico: { data: '31/12/2026', inicio: '19:00', fim: '07:00', terminaDiaSeguinte: false } });
  assert.ok(horarioAtravessaMeiaNoite(e));
  assert.ok(val(e).erros.some((x) => /dia seguinte/.test(x)));
  e.servico.terminaDiaSeguinte = true;
  assert.deepEqual(val(e).erros, []);
  assert.equal(val(e).valores.fim_hora, '07');
  const igual = permutaFicticia({ servico: { data: '20/11/2026', inicio: '07:00', fim: '07:00', terminaDiaSeguinte: false } });
  assert.ok(val(igual).erros.some((x) => /dia seguinte/.test(x)), 'início = fim também pede confirmação');
});

test('emissão em outro ano substitui o 2026 fixo', () => {
  const r = val(permutaFicticia({ emissao: { local: 'Barão de Grajaú - MA', data: '01/01/2027' } }));
  assert.equal(r.valores.emissao_ano, '2027');
  assert.equal(r.valores.emissao_dia, '1º');
  assert.equal(r.valores.emissao_mes, 'janeiro');
});

test('nomes longos: fonte reduzida até o limite; além disso, erro com orientação (nada é cortado)', () => {
  const e = permutaFicticia();
  e.solicitante.nome = 'Francisco das Chagas Conceição Albuquerque de Sousa Filho';
  let r = val(e);
  assert.deepEqual(r.erros, []);
  assert.ok(r.ajustes.solicitante_nome.tamanho < 10 && r.ajustes.solicitante_nome.tamanho >= PERMUTA.areas.solicitante_nome.min);
  e.substituto.nome = 'Maximiliano Bartolomeu Conceição Albuquerque de Sousa Filho';
  r = val(e);
  assert.ok(r.erros.some((x) => /não cabe/.test(x) && /abreviar/.test(x)));
  e.substitutoTexto = 'Cb PM 0098765 Maximiliano B. Sousa';
  r = val(e);
  assert.deepEqual(r.erros, []);
  assert.equal(r.valores.substituto, 'Cb PM 0098765 Maximiliano B. Sousa.');
});

test('número funcional não é confundido com CPF/telefone', () => {
  const e = permutaFicticia();
  e.substituto.numero = '529.982.247-25';
  assert.ok(val(e).avisos.some((x) => /parece um CPF/.test(x)));
  e.substituto.numero = '99988887777';
  assert.ok(val(e).avisos.some((x) => /telefone ou CPF/.test(x)));
});

test('caractere fora da fonte é erro explícito, não omissão', () => {
  const e = permutaFicticia();
  e.solicitante.nome = 'Ana 🙂 Sá';
  assert.ok(val(e).erros.some((x) => /não suportado/.test(x)));
});

test('utilidades', () => {
  assert.equal(postoSemPM('3º Sgt PM'), '3º Sgt');
  assert.equal(postoSemPM('Cb'), 'Cb');
  assert.equal(nomeArquivoPermuta(permutaFicticia()), 'Solicitacao_Permuta_2026-11-20.pdf');
  assert.equal(normalizar({ solicitante: { numero: 7 } }, {}).solicitante.numero, '7');
});

test('PDF gerado: 1 página A4, sem campos, sem anotações, sem senha', async () => {
  const r = await gerarPermuta(permutaFicticia(), { carregarModelo });
  assert.equal(r.nome, 'Solicitacao_Permuta_2026-11-20.pdf');
  const d = await PDFDocument.load(r.bytes);
  assert.equal(d.getPageCount(), 1);
  const { width, height } = d.getPage(0).getSize();
  assert.deepEqual([Math.round(width), Math.round(height)], [595, 842]);
  assert.ok(!d.catalog.has(PDFName.of('AcroForm')), 'sem /AcroForm');
  const an = d.getPage(0).node.Annots();
  assert.ok(!an || an.size() === 0, 'sem anotações');
  assert.ok(!d.context.trailerInfo.Encrypt, 'sem criptografia');
  assert.ok(!Buffer.from(r.bytes).includes(Buffer.from('/Encrypt')));
});

test('geração bloqueada com erros, sem perder dados', async () => {
  const e = permutaFicticia(); e.substituto.nome = '';
  await assert.rejects(gerarPermuta(e, { carregarModelo }), (err) => err.erros && err.erros.some((x) => /SUBSTITUTO/.test(x)));
  assert.equal(e.solicitante.nome, 'Ana Conceição Sá');
});

test('local de emissão editável', () => {
  const r = val(permutaFicticia({ emissao: { local: 'São João dos Patos - MA', data: '16/11/2026' } }));
  assert.equal(r.valores.emissao_local, 'São João dos Patos - MA');
  assert.equal(montarValores(permutaFicticia()).emissao_local, 'Barão de Grajaú - MA');
});
