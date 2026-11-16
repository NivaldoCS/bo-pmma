// Gera PDFs de exemplo com dados fictícios em saida-testes/ (fora do controle de versão)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gerarDocumento } from '../js/pdf/gerador.js';
import { ocorrenciaCompleta } from '../tests/ficticio.js';
const raiz = new URL('..', import.meta.url);
const carregarModelo = async (n) => readFileSync(new URL(`templates/${n}`, raiz));
mkdirSync(new URL('saida-testes/', raiz), { recursive: true });
const casos = [
  ['curto', ocorrenciaCompleta()],
  ['longo', ocorrenciaCompleta({ relatoLongo: true, muitosObjetos: true })],
];
for (const [nome, est] of casos) {
  for (const tipo of ['bo', 'fichas', 'conjunto']) for (const modo of ['editavel', 'impressao']) {
    const r = await gerarDocumento(est, { tipo, modo, carregarModelo });
    writeFileSync(new URL(`saida-testes/${nome}_${r.nome}`, raiz), r.bytes);
    console.log(nome, r.nome, r.resumo.paginas, 'pág', JSON.stringify(r.resumo.continuacoes), r.avisos);
  }
}
