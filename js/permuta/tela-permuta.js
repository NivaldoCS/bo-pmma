// Tela do módulo PERMUTA DE SERVIÇO (mesmos componentes visuais do site).
import { esc } from '../telas.js';
import { LARGURAS_TIMES } from '../times.js';
import { validar, montarValores, horarioAtravessaMeiaNoite, diaSeguinte, identificacaoSubstitutoPadrao, MESES, postoSemPM } from './permuta.js';

export function medirTimes(texto, tam) {
  let w = 0;
  for (const ch of texto) w += LARGURAS_TIMES[ch] ?? 500;
  return (w * tam) / 1000;
}
export const suportadoTimes = (ch) => ch in LARGURAS_TIMES;
export function validarNaTela(e) { return validar(e, medirTimes, suportadoTimes); }

function obter(o, c) { return c.split('.').reduce((x, k) => (x == null ? undefined : x[k]), o); }

function campo(E, rotulo, caminho, o = {}) {
  const v = obter(E, caminho) ?? '';
  const a = [`data-bind="permuta:${caminho}"`, 'autocomplete="off"', 'spellcheck="false"', 'autocorrect="off"', `autocapitalize="${o.autocap || 'sentences'}"`];
  if (o.mascara) a.push(`data-mascara="${o.mascara}"`);
  if (o.inputmode) a.push(`inputmode="${o.inputmode}"`);
  if (o.placeholder) a.push(`placeholder="${esc(o.placeholder)}"`);
  if (o.lista) a.push(`list="${o.lista}"`);
  return `<label class="campo ${o.classe || ''}"><span>${esc(rotulo)}</span><input type="text" ${a.join(' ')} value="${esc(v)}">${o.ajuda ? `<small class="ajuda">${o.ajuda}</small>` : ''}</label>`;
}

function blocoPessoa(E, chave, titulo, prefs) {
  const integrantes = (prefs.integrantes || []).filter((p) => p.nome || p.matricula);
  const sel = integrantes.length ? `<label class="campo"><span>Preencher com policial cadastrado</span>
    <select data-permuta-cadastro="${chave}"><option value="">— escolher —</option>${integrantes.map((p, i) => `<option value="${(prefs.integrantes || []).indexOf(p)}">${esc([p.posto, p.nome, p.matricula && `nº ${p.matricula}`].filter(Boolean).join(' '))}</option>`).join('')}</select>
    <small class="ajuda">Copia apenas o que está no cadastro (Configurações da unidade). Revise depois.</small></label>` : '<p class="suave">Dica: cadastre os policiais em “Configurações da unidade” para preencher com um toque.</p>';
  return `<div class="cartao"><h2 style="margin-top:.2rem">${titulo}</h2>${sel}
    <div class="grade duas">
      ${campo(E, 'Posto ou graduação', `${chave}.posto`, { lista: 'dl-postos', autocap: 'words' })}
      ${campo(E, 'Nº de identificação funcional (PM nº)', `${chave}.numero`, { mascara: 'funcional', inputmode: 'numeric', ajuda: 'Não é CPF nem telefone. Zeros à esquerda são mantidos.' })}
      ${campo(E, 'Nome completo', `${chave}.nome`, { classe: 'inteiro', autocap: 'words' })}
    </div></div>`;
}

export function blocoMeiaNoite(E) {
  if (!horarioAtravessaMeiaNoite(E)) return '';
  const ds = diaSeguinte(E.servico.data);
  return `<div class="aviso alerta">O horário final (${esc(E.servico.fim)}) é anterior ou igual ao inicial (${esc(E.servico.inicio)}).
    <label class="marcar"><input type="checkbox" data-bind="permuta:servico.terminaDiaSeguinte"${E.servico.terminaDiaSeguinte ? ' checked' : ''}>
    <span>Confirmo que o serviço termina no dia seguinte${ds ? ` (${esc(ds)})` : ''}.</span></label>
    <span class="suave">O documento mantém o texto do modelo (“no horário das … às …”); nada é acrescentado.</span></div>`;
}

const sub = (v, larg = 4) => (v ? `<u>${esc(v)}</u>` : `<span class="suave">${'_'.repeat(larg)}</span>`);

export function previaHtml(E) {
  const v = montarValores(E);
  const local = v.emissao_local || 'Barão de Grajaú - MA';
  return `<div class="previa-doc">
    <p style="text-align:center">${esc(local)}, ${sub(v.emissao_dia, 5)} de ${sub(v.emissao_mes, 12)} de ${esc(v.emissao_ano || '2026')}.</p>
    <p><strong>Do:</strong> ${sub(v.solicitante_posto, 10)} <strong>PM nº</strong> ${sub(v.solicitante_numero, 8)}<br>${sub(v.solicitante_nome, 30)}<br>
    <strong>Ao:</strong> Cmt do 2º Pel/35º BPM<br><strong>Assunto:</strong> Solicitação de permuta de serviço</p>
    <p>Solicito-vos que seja autorizado permuta de serviço do dia ${sub(v.servico_dia, 2)}/${sub(v.servico_mes, 2)}/${sub(v.servico_ano, 4)}, no horário das ${sub(v.inicio_hora, 2)}:${sub(v.inicio_min, 2)} às ${sub(v.fim_hora, 2)}:${sub(v.fim_min, 2)}, com o ${sub(v.substituto, 20)} A fim de que este solicitante possa tratar de assuntos de interesse particulares.</p>
    <p class="suave">Assinatura do Solicitante · Assinatura do Substituto · Autorizo em ___/___/___ · Comandante do 2º Pelotão/35º BPM — <strong>em branco</strong>, para assinatura posterior.</p>
  </div>`;
}

export function mensagensHtml(E) {
  const r = validarNaTela(E);
  if (!r.erros.length && !r.avisos.length) return '<div class="aviso ok">Dados completos. Pronto para gerar.</div>';
  return `${r.erros.length ? `<div class="aviso erro"><strong>Falta corrigir antes de gerar:</strong><ul>${r.erros.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    ${r.avisos.length ? `<div class="aviso alerta"><ul>${r.avisos.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}`;
}

export function telaPermuta(E, prefs, ui) {
  const padrao = identificacaoSubstitutoPadrao(E.substituto);
  return `
  <h1>Permuta de serviço</h1>
  <p class="suave">Preencha os dados, confira a prévia e baixe o PDF. As assinaturas e a autorização do comandante ficam em branco no documento.</p>
  ${blocoPessoa(E, 'solicitante', '1. Solicitante', prefs)}
  ${blocoPessoa(E, 'substituto', '2. Substituto', prefs)}
  <div class="cartao"><h2 style="margin-top:.2rem">3. Dados do serviço e emissão</h2>
    ${campo(E, 'Data do serviço que será assumido pelo substituto', 'servico.data', { mascara: 'data', inputmode: 'numeric', placeholder: 'dd/mm/aaaa' })}
    <div class="grade duas">
      ${campo(E, 'Horário inicial', 'servico.inicio', { mascara: 'hora', inputmode: 'numeric', placeholder: 'hh:mm' })}
      ${campo(E, 'Horário final', 'servico.fim', { mascara: 'hora', inputmode: 'numeric', placeholder: 'hh:mm' })}
    </div>
    <div id="permuta-meianoite">${blocoMeiaNoite(E)}</div>
    <div class="grade duas">
      ${campo(E, 'Local de emissão', 'emissao.local', { autocap: 'words' })}
      ${campo(E, 'Data de emissão', 'emissao.data', { mascara: 'data', inputmode: 'numeric', placeholder: 'dd/mm/aaaa', ajuda: 'Sai por extenso: “16 de novembro de 2026”.' })}
    </div>
  </div>
  <details data-sec="permuta-abreviar"${ui.abertos.has('permuta-abreviar') || E.substitutoTexto ? ' open' : ''}><summary><span>Identificação do substituto no corpo do pedido</span>${E.substitutoTexto ? '<span class="contagem">personalizada</span>' : ''}</summary><div class="conteudo">
    <p class="suave">O espaço entre “com o” e “A fim de” é curto. Por padrão vai: <strong>${esc(padrao || '—')}</strong>. Se não couber, escreva aqui uma forma abreviada (você decide como abreviar).</p>
    ${campo(E, 'Forma abreviada (opcional)', 'substitutoTexto', { autocap: 'words', placeholder: padrao })}
  </div></details>
  <h2>Prévia</h2>
  <div id="permuta-previa" class="cartao">${previaHtml(E)}</div>
  <div id="permuta-mensagens">${mensagensHtml(E)}</div>
  <div class="acoes coluna">
    <button class="btn" data-acao="permuta-visualizar">Visualizar documento</button>
    <button class="btn primario" data-acao="permuta-gerar">Gerar PDF</button>
    <button class="btn perigo" data-acao="permuta-limpar">Limpar formulário</button>
  </div>
  <div id="permuta-resultado">${resultadoHtml(ui.permutaResultado)}</div>
  <div class="cartao suave">
    <strong>Assinaturas:</strong> imprima e assine à mão, ou baixe o PDF e assine pelo Gov.br. O site não assina, não tem integração com o Gov.br e não abre arquivos já assinados.
    Se precisar corrigir algo depois de assinado, corrija aqui e gere uma nova solicitação para novas assinaturas.
  </div>
  <label class="marcar"><input type="checkbox" data-acao-check="salvar-permuta"${ui.salvarPermuta ? ' checked' : ''}>
    <span><strong>Salvar rascunho da permuta neste aparelho</strong><br><span class="suave">Salva automaticamente. Quem usar este mesmo navegador poderá reabri-lo. Separado das ocorrências.</span></span></label>`;
}

export function resultadoHtml(r) {
  if (!r) return '';
  if (r.gerando) return '<div class="aviso info">Gerando documento…</div>';
  if (r.erros) return `<div class="aviso erro"><strong>O documento não foi gerado.</strong> Seus dados foram mantidos.<ul>${r.erros.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
  return `<div class="cartao resultado">
    <strong>${esc(r.nome)}</strong> — 1 página, sem campos editáveis, sem senha.
    ${r.avisos.length ? `<ul>${r.avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
    ${r.semVisualizador ? '<div class="aviso info">Este navegador não exibe PDF dentro da página. Toque em “Abrir em nova aba” para ver o documento, ou confira a prévia em texto acima.</div>' : ''}
    ${r.previa ? '<iframe class="previa-pdf" title="Prévia do documento" src="' + esc(r.url) + '#view=FitH"></iframe>' : ''}
    <div class="acoes">
      <button class="btn primario" data-acao="permuta-baixar">Baixar PDF</button>
      ${r.podeCompartilhar ? '<button class="btn" data-acao="permuta-compartilhar">Compartilhar…</button>' : ''}
      <button class="btn" data-acao="permuta-abrir">Abrir em nova aba</button>
    </div></div>`;
}

export { MESES, postoSemPM };
