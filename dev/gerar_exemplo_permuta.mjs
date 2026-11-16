// Gera exemplos FICTÍCIOS da permuta em saida-testes/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gerarPermuta } from '../js/permuta/gerador-permuta.js';
import { permutaVazia } from '../js/permuta/permuta.js';
const raiz = new URL('..', import.meta.url);
const carregarModelo = async (n) => readFileSync(new URL(`templates/${n}`, raiz));
mkdirSync(new URL('saida-testes/', raiz), { recursive: true });
const casos = {
  curto: { solicitante: { posto: 'Sd PM', numero: '012345', nome: 'Ana Sá' }, substituto: { posto: 'Cb PM', numero: '098765', nome: 'João Pão' }, servico: { data: '20/11/2026', inicio: '07:00', fim: '19:00' }, emissao: { local: 'Barão de Grajaú - MA', data: '16/11/2026' } },
  longo: { solicitante: { posto: '3º Sgt PM', numero: '0123456', nome: 'Francisco das Chagas Conceição Albuquerque de Sousa Filho' }, substituto: { posto: 'Cb PM', numero: '0098765', nome: 'Antônio Ação' }, servico: { data: '31/12/2027', inicio: '19:00', fim: '07:00', terminaDiaSeguinte: true }, emissao: { local: 'São João dos Patos - MA', data: '01/12/2027' } },
};
for (const [n, d] of Object.entries(casos)) {
  const e = Object.assign(permutaVazia({}), d);
  try {
    const r = await gerarPermuta(e, { carregarModelo });
    writeFileSync(new URL(`saida-testes/permuta_${n}_${r.nome}`, raiz), r.bytes);
    console.log(n, r.nome, r.avisos);
  } catch (err) { console.log(n, 'ERROS', err.erros || err.message); }
}
