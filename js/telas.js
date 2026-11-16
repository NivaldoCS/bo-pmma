// Montagem das telas (HTML em texto). Todos os valores passam por esc().
import { obter } from './estado.js';
import { alertaFormato } from './mascaras.js';
import { avaliarCampoMulti, avaliarLinhas } from './layout.js';
import * as OP from './opcoes.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let EST = null; let PREFS = null; let UI = null;
export function contexto(est, prefs, ui) { EST = est; PREFS = prefs; UI = ui; }
const val = (c) => (c.startsWith('prefs:') ? obter(PREFS, c.slice(6)) : obter(EST, c));

const MODOS_TECLADO = { cpf: 'numeric', cpfcnpj: 'numeric', data: 'numeric', hora: 'numeric', cep: 'numeric', telefone: 'tel', ddd: 'numeric', numero: 'numeric' };
const DICAS = { cpf: '000.000.000-00', data: 'dd/mm/aaaa', hora: 'hh:mm', cep: '00000-000', telefone: '00000-0000', ddd: '99', placa: 'AAA0A00' };

export function campo(rotulo, caminho, o = {}) {
  const v = val(caminho) ?? '';
  const a = [`data-bind="${esc(caminho)}"`, 'autocomplete="off"', 'spellcheck="false"', 'autocorrect="off"'];
  if (o.mascara) a.push(`data-mascara="${o.mascara}"`);
  const im = o.inputmode || MODOS_TECLADO[o.mascara];
  if (im) a.push(`inputmode="${im}"`);
  const ph = o.placeholder ?? DICAS[o.mascara];
  if (ph) a.push(`placeholder="${esc(ph)}"`);
  a.push(`autocapitalize="${o.autocap || (o.mascara ? 'characters' : 'sentences')}"`);
  if (o.lista) a.push(`list="${o.lista}"`);
  if (o.contador) a.push(`data-contador="${o.contador}"`);
  let entrada;
  if (o.multilinha) entrada = `<textarea ${a.join(' ')} rows="${o.linhas || 4}" class="${o.classeEntrada || ''}">${esc(v)}</textarea>`;
  else if (o.opcoes) {
    entrada = `<select ${a.join(' ')}><option value="">—</option>${o.opcoes.map(([k, r]) => `<option value="${esc(k)}"${String(v) === String(k) ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select>`;
  } else entrada = `<input type="text" ${a.join(' ')} value="${esc(v)}">`;
  const ajuda = o.ajuda ? `<small class="ajuda">${o.ajuda}</small>` : '';
  const alerta = o.mascara && ['cpf', 'cpfcnpj', 'data', 'hora', 'cep', 'placa'].includes(o.mascara)
    ? `<small class="alerta-campo" data-alerta-de="${esc(caminho)}">${esc(alertaFormato(o.mascara, v))}</small>` : '';
  const extra = o.contador ? `<div class="contador" data-contador-de="${esc(caminho)}">${contadorHtml(o.contador, v)}</div>` : '';
  return `<label class="campo ${o.classe || ''}"><span>${esc(rotulo)}</span>${entrada}${ajuda}${alerta}${extra}</label>`;
}

export function contadorHtml(tipo, texto) {
  const n = String(texto || '').length;
  if (tipo === 'relato' || tipo === 'relato_texto') {
    const r = avaliarCampoMulti(texto, tipo, tipo === 'relato' ? 'bo' : 'env');
    const pct = Math.min(100, r.percentual);
    const msg = r.cabe
      ? (r.tamanho < 10 ? `cabe no campo com fonte ${String(r.tamanho).replace('.', ',')}` : 'cabe no campo')
      : '<strong>excede o campo</strong>: o restante vai para a folha de continuação (nada é cortado)';
    return `<span>${n} caracteres · ~${r.linhas} de ${r.capacidade} linhas</span><span class="barra${r.cabe ? '' : ' excede'}"><i style="width:${pct}%"></i></span><span>${msg}</span>`;
  }
  if (tipo === 'outras' || tipo === 'bens') {
    const r = avaliarLinhas(texto, tipo === 'outras' ? ['outras_providencias_1', 'outras_providencias_2'] : ['bens_1', 'bens_2'], tipo === 'outras' ? 'bo' : 'env');
    return `<span>${n} caracteres · ~${r.linhas} de ${r.capacidade} linhas</span>${r.cabe ? '' : '<span><strong>excede</strong>: o restante vai para a folha de continuação</span>'}`;
  }
  return `<span>${n} caracteres</span>`;
}

function chipsLista(caminho, opcoes) {
  const atual = val(caminho) || [];
  return `<div class="chips">${opcoes.map(([k, r]) => `<button type="button" class="chip" data-lista="${esc(caminho)}" data-valor="${esc(k)}" aria-pressed="${atual.includes(k)}">${esc(r)}</button>`).join('')}</div>`;
}
function chipsUnico(caminho, opcoes) {
  const atual = val(caminho) || '';
  return `<div class="chips" role="group">${opcoes.map(([k, r]) => `<button type="button" class="chip" data-unico="${esc(caminho)}" data-valor="${esc(k)}" aria-pressed="${atual === k}">${esc(r)}</button>`).join('')}</div>`;
}
function marcaBool(rotulo, caminho) {
  return `<label class="marcar"><input type="checkbox" data-bind="${esc(caminho)}"${val(caminho) ? ' checked' : ''}><span>${esc(rotulo)}</span></label>`;
}
function chipsMarca(opcoes, grupoUnico) {
  return `<div class="chips">${opcoes.map(([n, r]) => `<button type="button" class="chip" data-marca="${esc(n)}"${grupoUnico ? ` data-grupo="${esc(grupoUnico)}"` : ''} aria-pressed="${!!EST.marcas[n]}">${esc(r)}</button>`).join('')}</div>`;
}
function pergunta(rotulo, caminho, opcoes = [['sim', 'SIM'], ['nao', 'NÃO']]) {
  return `<div class="pergunta"><span>${esc(rotulo)}</span>${chipsUnico(caminho, opcoes)}</div>`;
}
function secao(id, titulo, conteudo, o = {}) {
  const aberta = UI.abertos.has(id) || (o.aberta && !UI.fechados.has(id));
  const cont = o.contagem ? `<span class="contagem">${esc(o.contagem)}</span>` : '';
  return `<details data-sec="${esc(id)}" class="${o.classe || ''}"${aberta ? ' open' : ''}><summary>${o.prefixo || ''}<span>${esc(titulo)}</span>${cont}</summary><div class="conteudo">${conteudo}</div></details>`;
}
const aviso = (tipo, html) => `<div class="aviso ${tipo}">${html}</div>`;

// ------------------------------------------------------------------ início
export function telaInicio(info) {
  const cont = info.temSessao ? `<button class="botao-grande continuar" data-acao="continuar">CONTINUAR OCORRÊNCIA<small>${esc(info.resumoSessao)}</small></button>` : '';
  const rasc = info.rascunho ? `<button class="botao-grande continuar" data-acao="retomar-rascunho">RETOMAR RASCUNHO DESTE APARELHO<small>${esc(info.resumoRascunho)}</small></button>` : '';
  return `
  <h1>Boletim de Ocorrência</h1>
  <div class="inicio">
    <button class="botao-grande primario" data-acao="ir-importar">COLAR RELATÓRIO DO WHATSAPP<small>O texto é lido aqui no aparelho, sem internet.</small></button>
    <button class="botao-grande secundario" data-acao="nova">NOVA OCORRÊNCIA<small>Formulário vazio, em etapas.</small></button>
    ${cont}${rasc}
  </div>
  <div class="acoes" style="margin-top:1.2rem">
    <label class="btn pequeno">Abrir rascunho (JSON)<input type="file" accept="application/json,.json" data-arquivo="json" class="sr"></label>
    <button class="btn pequeno" data-acao="ir-config">Configurações da unidade</button>
  </div>
  <div class="cartao suave">
    <strong>Privacidade:</strong> os dados da ocorrência são processados somente neste aparelho. Nada é enviado pela internet.
    Por padrão, ficam guardados apenas enquanto esta aba estiver aberta.
  </div>`;
}

// ------------------------------------------------------------------ importação
export function telaImportar(texto, temDados) {
  return `
  <h1>Colar relatório do WhatsApp</h1>
  ${temDados ? aviso('info', 'Já existe uma ocorrência em andamento. A nova importação <strong>não apaga</strong> o que foi revisado: valores diferentes aparecem como conflito, desmarcados, para você decidir.') : ''}
  <label class="campo"><span>Relatório</span>
    <textarea data-import="texto" class="historico" rows="12" spellcheck="false" autocomplete="off" placeholder="Cole aqui o relatório copiado do WhatsApp">${esc(texto)}</textarea>
  </label>
  <div class="acoes">
    <button class="btn" data-acao="colar">Colar da área de transferência</button>
    <button class="btn primario" data-acao="analisar">Analisar relatório</button>
  </div>
  <p class="suave">A leitura é feita por regras locais (sem IA e sem serviços externos). Nada é aplicado antes da sua revisão.</p>`;
}

export function telaRevisao(r, itens, pendencias) {
  const tipoSelo = (it) => {
    if (it.situacao === 'conflito') return '<span class="selo conflito">CONFLITO</span>';
    if (it.situacao === 'igual') return '<span class="selo igual">já igual</span>';
    if (it.tipo === 'semCampo') return '<span class="selo semcampo">sem campo no PDF</span>';
    return '';
  };
  const linha = (it) => `
    <label class="item-rev">
      <input type="checkbox" data-rev="${esc(it.id)}"${it.aplicar ? ' checked' : ''}${it.situacao === 'info' ? ' disabled' : ''}>
      <span><span class="r">${esc(it.rotulo)}${tipoSelo(it)}</span><br><span class="v">${esc(it.valor).replace(/\n/g, '<br>')}</span>
      ${it.atual ? `<br><span class="atual">Atual: ${esc(it.atual).slice(0, 300)}</span>` : ''}</span>
    </label>`;
  const grupos = [
    ['Ocorrência e local', itens.filter((i) => !i.grupo)],
    ['Envolvidos', itens.filter((i) => i.grupo === 'pessoa')],
    ['EQUIPE', itens.filter((i) => i.grupo === 'equipe')],
    ['Veículos', itens.filter((i) => i.grupo === 'veiculo')],
    ['Objetos', itens.filter((i) => i.grupo === 'objeto')],
  ].filter(([, l]) => l.length);
  return `
  <h1>Revisão da importação</h1>
  <p class="suave">Marque o que deve ser aplicado. Itens em conflito com o que já foi preenchido vêm desmarcados.</p>
  ${r.conflitos.length ? aviso('alerta', `<strong>Divergências encontradas</strong><ul>${r.conflitos.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`) : ''}
  ${grupos.map(([t, l]) => `<div class="cartao"><h3>${esc(t)}</h3>${l.map(linha).join('')}</div>`).join('') || aviso('alerta', 'Nada foi identificado. Confira se o texto foi colado completo.')}
  ${pendencias.length ? `<div class="cartao"><h3>Precisa ser completado depois</h3><ul class="lista-pend">${pendencias.map((p) => `<li class="info">${esc(p)}</li>`).join('')}</ul></div>` : ''}
  ${r.avisos.length ? aviso('info', `<ul>${r.avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`) : ''}
  ${r.naoReconhecido.length ? secao('nao-rec', 'Linhas não reconhecidas', `<pre class="original">${esc(r.naoReconhecido.join('\n'))}</pre><p class="suave">Essas linhas não foram aplicadas. Copie manualmente o que for necessário.</p>`, { contagem: String(r.naoReconhecido.length) }) : ''}
  ${secao('orig', 'Texto original colado', `<pre class="original">${esc(r.textoOriginal)}</pre>`)}
  <div class="acoes coluna">
    <button class="btn primario" data-acao="aplicar-import">Aplicar selecionados e conferir</button>
    <button class="btn" data-acao="ir-importar">Voltar ao texto</button>
  </div>`;
}

// ------------------------------------------------------------------ etapas
export const NOMES_ETAPAS = ['Ocorrência', 'Local e ambiente', 'Envolvidos', 'Veículos e objetos', 'Histórico e providências', 'EQUIPE e revisão'];

export function barraEtapas(atual) {
  return `<nav class="etapas" aria-label="Etapas">${NOMES_ETAPAS.map((n, i) => `<button type="button" data-etapa="${i + 1}"${atual === i + 1 ? ' aria-current="step"' : ''}>${i + 1}. ${esc(n)}</button>`).join('')}</nav>`;
}

function etapa1() {
  const o = EST.ocorrencia;
  const datas = [['fato', 'FATO'], ['comunicacao', 'COMUNICAÇÃO'], ['atendimento', 'ATENDIMENTO'], ['fechamento', 'FECHAMENTO']];
  const informado = (o.dataInformada || o.horaInformada)
    ? aviso('info', `O relatório informou <strong>${esc([o.dataInformada, o.horaInformada].filter(Boolean).join(' '))}</strong>. Esse horário não é copiado automaticamente: toque onde ele deve ser usado.
      <div class="acoes">${datas.map(([k, r]) => `<button class="btn pequeno" data-acao="usar-informada" data-alvo="${k}">Usar em ${r}</button>`).join('')}</div>`) : '';
  return `
  <h2>Identificação</h2>
  <div class="grade duas">
    ${campo('Unidade policial militar', 'ocorrencia.unidade', { ajuda: 'Valor inicial vem das configurações da unidade.' })}
    ${campo('Nº CIOPS/COPOM (número do BO)', 'ocorrencia.numeroBo', { placeholder: '001/2026', inputmode: 'text', autocap: 'characters' })}
  </div>
  <h3>Tipo de documento</h3>
  ${chipsLista('ocorrencia.tipos', OP.TIPOS_DOC)}
  ${o.tipos.includes('outros') ? campo('Outros — especificar', 'ocorrencia.tipoOutrosTexto') : ''}
  ${o.procedimentoAdotado ? aviso('info', `Procedimento informado no relatório: <strong>${esc(o.procedimentoAdotado)}</strong>. Ele não define o tipo automaticamente.`) : ''}
  <h2>Datas e horários</h2>
  ${informado}
  ${datas.map(([k, r]) => `<div class="linha-data">${campo(`${r} — data`, `ocorrencia.datas.${k}.data`, { mascara: 'data' })}${campo('hora', `ocorrencia.datas.${k}.hora`, { mascara: 'hora' })}<button class="btn pequeno" data-acao="agora" data-alvo="${k}" title="Preencher com data e hora atuais" style="margin-bottom:.45rem">Agora</button></div>`).join('')}
  <h2>1 - Fato (natureza)</h2>
  ${o.fatos.map((f, i) => `<div class="cartao">${campo(`Descrição ${i + 1}`, `ocorrencia.fatos.${i}.descricao`)}
    <span class="suave">Envolvido(s) nesta descrição</span>
    ${EST.envolvidos.length ? `<div class="chips">${EST.envolvidos.map((e) => `<button type="button" class="chip" data-lista="ocorrencia.fatos.${i}.envolvidos" data-valor="${e.uid}" aria-pressed="${f.envolvidos.includes(e.uid)}">E-${e.numero}${e.nome ? ` · ${esc(e.nome.split(' ')[0])}` : ''}</button>`).join('')}</div>` : '<p class="suave">Cadastre envolvidos na etapa 3 para vinculá-los aqui.</p>'}
  </div>`).join('')}
  ${secao('info-relatorio', 'Informações do relatório sem campo no BO', `
    <p class="suave">O formulário oficial não tem campo para estes dados. Eles podem ser incluídos, se você quiser, nas “Informações complementares” da folha de continuação (etapa 6).</p>
    <div class="grade duas">
      ${campo('Serviço do dia', 'ocorrencia.servicoDia', { mascara: 'data' })}
      ${campo('CPU', 'ocorrencia.cpu')}
      ${campo('Nome da EQUIPE', 'ocorrencia.equipeNome')}
      ${campo('Procedimento adotado (informado)', 'ocorrencia.procedimentoAdotado')}
      ${campo('Data informada no relatório', 'ocorrencia.dataInformada', { mascara: 'data' })}
      ${campo('Hora informada no relatório', 'ocorrencia.horaInformada', { mascara: 'hora' })}
    </div>`)}`;
}

function etapa2() {
  const marcados = (g) => g.opcoes.filter(([n]) => EST.marcas[n]).length;
  return `
  <h2>2 - Local</h2>
  <div class="grade duas">
    ${campo('Logradouro', 'local.logradouro', { classe: 'inteiro' })}
    ${campo('Nº/Km', 'local.numero', { autocap: 'characters' })}
    ${campo('Bairro', 'local.bairro')}
    ${campo('Município', 'local.municipio')}
    ${campo('CEP', 'local.cep', { mascara: 'cep' })}
    ${campo('Ponto de referência', 'local.referencia', { classe: 'inteiro' })}
  </div>
  ${secao('coordenadas', 'Coordenadas (sem campo no BO)', `
    <p class="suave">O BO não tem campo para latitude/longitude. Elas só entram no PDF se você marcar a inclusão nas informações complementares (etapa 6).</p>
    <div class="grade duas">${campo('Latitude', 'local.latitude', { inputmode: 'decimal', placeholder: '-6.7500' })}${campo('Longitude', 'local.longitude', { inputmode: 'decimal', placeholder: '-43.0200' })}</div>
    <button class="btn pequeno" data-acao="gps">Usar localização deste aparelho</button>
    <p class="suave">A localização é lida pelo navegador e fica somente neste aparelho.</p>`, { contagem: EST.local.latitude ? 'preenchido' : '' })}
  <h2>3 - Ambiente / estabelecimento</h2>
  ${chipsMarca([['amb__interior', 'Interior do ambiente'], ['amb__via_publica', 'Via pública']])}
  ${OP.GRUPOS_AMBIENTE.map((g) => secao(`g-${g.id}`, g.titulo, chipsMarca(g.opcoes, OP.GRUPOS_UNICOS.has(g.id) ? g.id : null), { contagem: marcados(g) ? `${marcados(g)} marcado(s)` : '' })).join('')}`;
}

function enderecoHtml(base, titulo, id) {
  const end = val(base);
  const preenchido = Object.values(end).some(Boolean);
  return secao(id, titulo, `<div class="grade duas">
    ${campo('CEP', `${base}.cep`, { mascara: 'cep' })}${campo('Caixa postal', `${base}.caixaPostal`, { inputmode: 'numeric' })}
    ${campo('Tipo de logradouro', `${base}.tipoLogradouro`, { lista: 'dl-tipolog' })}${campo('Logradouro', `${base}.logradouro`)}
    ${campo('Número', `${base}.numero`, { autocap: 'characters' })}${campo('Complemento', `${base}.complemento`)}
    ${campo('Bairro', `${base}.bairro`)}${campo('Município', `${base}.municipio`)}
    ${campo('Estado', `${base}.estado`, { mascara: 'uf' })}${campo('País', `${base}.pais`)}
    ${campo('Referência', `${base}.referencia`, { classe: 'inteiro' })}
    ${campo('Tipo de telefone', `${base}.telTipo`, { lista: 'dl-teltipo' })}
    <div class="grade duas">${campo('DDD', `${base}.telDdd`, { mascara: 'ddd' })}${campo('Número', `${base}.telNumero`, { mascara: 'telefone' })}</div>
    ${campo('Ramal', `${base}.telRamal`, { inputmode: 'numeric' })}${campo('E-mail', `${base}.email`, { inputmode: 'email', autocap: 'none' })}
  </div>`, { contagem: preenchido ? 'preenchido' : '' });
}

function envolvidoHtml(e, i) {
  const b = `envolvidos.${i}`;
  const veic = EST.veiculos.map((v) => [v.uid, `V-${v.numero}${v.placa ? ` · ${v.placa}` : ''}${v.marcaModelo ? ` · ${v.marcaModelo}` : ''}`]);
  const resumo = [e.nome || 'sem nome', e.participacao.map((p) => OP.PARTICIPACAO.find((x) => x[0] === p)?.[1]).filter(Boolean).join(', ')].filter(Boolean).join(' — ');
  const conteudo = `
    ${e.papelImportado ? aviso(e.participacao.length ? 'info' : 'alerta', `Importado como <strong>${esc(e.papelImportado)}</strong>.${e.participacao.length ? '' : ' Defina a participação abaixo.'}`) : ''}
    ${e.notasImportacao ? aviso('info', `Informações extras do relatório (não aplicadas): ${esc(e.notasImportacao)}`) : ''}
    <h3>Participação geral</h3>${chipsLista(`${b}.participacao`, OP.PARTICIPACAO)}
    ${secao(`${e.uid}-acid`, 'Acidente de trânsito', chipsLista(`${b}.acidente`, OP.ACIDENTE), { contagem: e.acidente.length ? `${e.acidente.length}` : '' })}
    <div class="grade duas">
      ${campo('Nome', `${b}.nome`, { classe: 'inteiro', autocap: 'words', ajuda: 'Digite como no documento. O sistema não corrige nomes.' })}
      ${campo('CPF', `${b}.cpf`, { mascara: 'cpf' })}
      ${campo('Data de nascimento', `${b}.nascimento`, { mascara: 'data' })}
    </div>
    ${marcaBool('Pessoa sem documento conhecido (não alertar sobre CPF)', `${b}.semDocumento`)}
    <h3>Sexo</h3>${chipsUnico(`${b}.sexo`, OP.SEXO)}
    ${e.sexo === 'outros' ? campo('Outros — especificar', `${b}.sexoOutro`) : ''}
    <div class="grade duas">
      ${campo('Nome da mãe', `${b}.nomeMae`, { autocap: 'words' })}${campo('Nome do pai', `${b}.nomePai`, { autocap: 'words' })}
      ${campo('Nacionalidade', `${b}.nacionalidade`)}${campo('Natural de', `${b}.naturalDe`)}
      ${campo('Profissão', `${b}.profissao`)}${campo('Local de trabalho', `${b}.localTrabalho`)}
    </div>
    <h3>Raça/cor</h3>${chipsUnico(`${b}.raca`, OP.RACA)}
    ${secao(`${e.uid}-civil`, 'Estado civil e instrução', `
      <h3>Estado civil</h3>${chipsUnico(`${b}.estadoCivil`, OP.ESTADO_CIVIL)}
      <h3>Grau de instrução</h3>${chipsUnico(`${b}.instrucao`, OP.INSTRUCAO)}
      <h3>Situação</h3>${chipsUnico(`${b}.situacaoInstrucao`, OP.SITUACAO_INSTRUCAO)}`, { contagem: [e.estadoCivil, e.instrucao].filter(Boolean).length ? 'preenchido' : '' })}
    ${secao(`${e.uid}-docs`, 'Documentos, alcunha e nome falso', `<div class="grade duas">
      ${campo('Alcunha', `${b}.alcunha`)}${campo('Nome falso', `${b}.nomeFalso`)}
      ${campo('RG — número', `${b}.rg`, { autocap: 'characters' })}${campo('RG — data de emissão', `${b}.rgEmissao`, { mascara: 'data' })}
      ${campo('RG — órgão emissor', `${b}.rgOrgao`, { autocap: 'characters' })}${campo('RG — UF', `${b}.rgUf`, { mascara: 'uf' })}
      ${campo('CNH — número de registro', `${b}.cnh`, { inputmode: 'numeric' })}${campo('CNH — validade', `${b}.cnhValidade`, { mascara: 'data' })}
      ${campo('CNH — UF/país de expedição', `${b}.cnhUf`, { mascara: 'uf' })}
    </div>${marcaBool('Não habilitado', `${b}.naoHabilitado`)}`, { contagem: [e.rg, e.cnh, e.alcunha, e.nomeFalso].filter(Boolean).length ? 'preenchido' : '' })}
    ${enderecoHtml(`${b}.res`, 'Endereço residencial', `${e.uid}-res`)}
    ${enderecoHtml(`${b}.com`, 'Endereço comercial', `${e.uid}-com`)}
    ${secao(`${e.uid}-cond`, 'Condições físicas e bens', `${chipsLista(`${b}.condicoes`, OP.CONDICOES)}
      ${campo('Bens que portava consigo (vestuário, objetos, dinheiro etc.)', `${b}.bens`, { multilinha: true, linhas: 3, contador: 'bens' })}`, { contagem: e.condicoes.length || e.bens ? 'preenchido' : '' })}
    <h3>Veículo vinculado (ficha conjunta)</h3>
    ${veic.length ? campo('Este envolvido aparece na ficha com o veículo', `${b}.veiculoUid`, { opcoes: veic, ajuda: 'Vínculo explícito. Deixe “—” se não houver relação com veículo.' }) : '<p class="suave">Nenhum veículo cadastrado (etapa 4).</p>'}
    ${secao(`${e.uid}-relato`, 'Relato individual', `<div class="grade duas">${campo('Local', `${b}.relato.local`)}${campo('Data/hora', `${b}.relato.dataHora`, { placeholder: 'dd/mm/aaaa hh:mm', inputmode: 'numeric' })}</div>
      ${marcaBool('Testemunha compromissada', `${b}.relato.testemunhaCompromissada`)}
      ${chipsLista(`${b}.relato.alertas`, OP.ALERTAS)}
      ${campo('Relato individual', `${b}.relato.texto`, { multilinha: true, linhas: 8, contador: 'relato_texto', classeEntrada: 'historico' })}`, { contagem: e.relato.texto ? 'preenchido' : '' })}
    ${secao(`${e.uid}-algema`, 'Uso de algema e manifestação do ofendido', `
      ${pergunta('Este envolvido foi algemado?', `${b}.algemado`)}
      ${e.algemado === 'sim' ? `<h3>Justificativa</h3>${chipsLista(`${b}.algemaJustificativas`, OP.JUSTIFICATIVAS_ALGEMA)}` : ''}
      ${marcaBool('Manifestação do ofendido: declara interesse em não exercer, neste momento, o direito de representação ou queixa (texto do formulário)', `${b}.manifestacaoOfendido`)}`, { contagem: e.algemado ? 'preenchido' : '' })}
    ${secao(`${e.uid}-decl`, 'Declaração de recebimento', `<div class="grade duas">
      ${campo('Eu,', `${b}.declaracao.eu`, { autocap: 'words' })}${campo('Função', `${b}.declaracao.funcao`)}
      <div class="grade tres">${campo('Dia', `${b}.declaracao.dia`, { mascara: 'numero' })}${campo('Mês', `${b}.declaracao.mes`, { mascara: 'numero' })}${campo('Ano', `${b}.declaracao.ano`, { mascara: 'numero' })}</div>
      ${campo('no(a)', `${b}.declaracao.local`)}</div>
      ${marcaBool('A pessoa acima qualificada, nas condições físicas e portando os objetos descritos nos campos de qualificação', `${b}.declaracao.pessoaQualificada`)}
      ${marcaBool('Recebi as coisas apreendidas, registradas no campo "apreensões" deste Boletim de Ocorrência e associadas a este envolvido', `${b}.declaracao.recebiCoisas`)}
      <p class="suave">Assinaturas ficam em branco no PDF para assinatura posterior.</p>`, { contagem: e.declaracao.eu ? 'preenchido' : '' })}
    <div class="acoes"><button class="btn perigo pequeno" data-acao="remover-envolvido" data-indice="${i}">Remover E-${e.numero}</button></div>`;
  return secao(`env-${e.uid}`, resumo, conteudo, { classe: 'registro', prefixo: `<span class="rotulo-id">E-${e.numero}</span>`, aberta: UI.novoRegistro === e.uid });
}

function etapa3() {
  return `
  <h2>Envolvidos</h2>
  <p class="suave">Cada envolvido gera uma ficha “Dos envolvidos e dos veículos” (2 páginas), identificada como E-1, E-2…</p>
  ${EST.envolvidos.map(envolvidoHtml).join('') || '<p class="suave">Nenhum envolvido cadastrado.</p>'}
  <div class="acoes"><button class="btn primario" data-acao="add-envolvido">+ Adicionar envolvido</button></div>`;
}

function veiculoHtml(v, i) {
  const b = `veiculos.${i}`;
  const ligados = EST.envolvidos.filter((e) => e.veiculoUid === v.uid);
  const resumo = [v.marcaModelo, v.placa, v.cor].filter(Boolean).join(' · ') || 'sem dados';
  const conteudo = `
    ${v.notaImportacao ? aviso('info', `Do relatório: ${esc(v.notaImportacao)}`) : ''}
    <h3>Envolvidos vinculados a este veículo</h3>
    ${EST.envolvidos.length ? `<div class="chips">${EST.envolvidos.map((e) => `<button type="button" class="chip" data-vinculo-veiculo="${v.uid}" data-envolvido="${e.uid}" aria-pressed="${e.veiculoUid === v.uid}">E-${e.numero}${e.nome ? ` · ${esc(e.nome.split(' ')[0])}` : ''}</button>`).join('')}</div>
      <p class="suave">${ligados.length ? `Sairá na(s) ficha(s) de ${ligados.map((e) => `E-${e.numero}`).join(', ')}.` : 'Sem vínculo: sairá em ficha própria, apenas com os dados do veículo.'} Cada envolvido pode ser vinculado a um veículo.</p>` : '<p class="suave">Nenhum envolvido cadastrado.</p>'}
    <div class="grade duas">
      ${campo('Placa', `${b}.placa`, { mascara: 'placa' })}${campo('RENAVAM ou chassi', `${b}.renavamChassi`, { autocap: 'characters' })}
      ${campo('Espécie/tipo', `${b}.especie`, { lista: 'dl-especie' })}${campo('Marca/modelo', `${b}.marcaModelo`)}
      ${campo('Cor predominante', `${b}.cor`)}${campo('Ano fabric.', `${b}.ano`, { inputmode: 'numeric' })}
      ${campo('Município veículo/UF', `${b}.municipioUf`)}${campo('País', `${b}.pais`)}
    </div>
    ${secao(`${v.uid}-prop`, 'Proprietário', `
      ${EST.envolvidos.length ? `<div class="acoes">${EST.envolvidos.map((e) => `<button class="btn pequeno" data-acao="copiar-proprietario" data-veiculo="${i}" data-envolvido="${e.uid}">Copiar dados de E-${e.numero}</button>`).join('')}</div><p class="suave">Só copia quando você toca. O sistema não presume quem é o proprietário.</p>` : ''}
      <div class="grade duas">
      ${campo('Proprietário', `${b}.proprietario.nome`, { autocap: 'words' })}${campo('CPF/CNPJ', `${b}.proprietario.cpfCnpj`, { mascara: 'cpfcnpj' })}
      ${campo('Endereço', `${b}.proprietario.endereco`)}${campo('Bairro', `${b}.proprietario.bairro`)}
      ${campo('Município/UF', `${b}.proprietario.municipioUf`)}${campo('CEP', `${b}.proprietario.cep`, { mascara: 'cep' })}
      ${campo('Telefone', `${b}.proprietario.telefone`, { inputmode: 'tel' })}${campo('Nacionalidade', `${b}.proprietario.nacionalidade`)}
    </div>`, { contagem: v.proprietario.nome ? 'preenchido' : '' })}
    ${secao(`${v.uid}-outros`, 'Outros (cinto, ocupantes, condução)', `
      ${pergunta('Uso do cinto/capacete?', `${b}.cinto`, OP.CINTO)}
      <div class="grade duas">${campo('Nº de ocupantes', `${b}.ocupantes`, { inputmode: 'numeric' })}${campo('Conduzido para', `${b}.conduzidoPara`)}
      ${campo('Nome estabelecimento', `${b}.estabelecimento`)}${campo('Transporte', `${b}.transporte`)}</div>`, { contagem: v.cinto || v.ocupantes ? 'preenchido' : '' })}
    ${secao(`${v.uid}-prov`, 'Providências (condutor/veículo)', `
      ${OP.SN_VEICULO.map(([k, r]) => pergunta(r, `${b}.prov.${k}`)).join('')}
      <div class="grade duas">${campo('Medição', `${b}.prov.medicao`)}${campo('Nº tíquete etilômetro/auto de constatação', `${b}.prov.tiquete`)}
      ${campo('Nº AIT', `${b}.prov.ait`)}${campo('Nº auto remoção', `${b}.prov.autoRemocao`)}</div>
      <h3>Guinchado por</h3>${chipsLista(`${b}.prov.guinchadoPor`, OP.GUINCHADO_POR)}
      <div class="grade duas">${campo('Nome empresa guincho', `${b}.prov.empresaGuincho`)}${campo('Motorista (guincho)', `${b}.prov.motoristaGuincho`)}</div>`, { contagem: OP.SN_VEICULO.some(([k]) => v.prov[k]) ? 'preenchido' : '' })}
    ${secao(`${v.uid}-carga`, 'Carga (no caso de apreensão)', `
      ${marcaBool('Sem carga', `${b}.carga.semCarga`)}
      <div class="grade duas">${campo('Tipo de carga', `${b}.carga.tipo`)}${campo('Nº da nota fiscal', `${b}.carga.notaFiscal`)}
      ${campo('Empresa', `${b}.carga.empresa`)}${campo('Peso (kg)', `${b}.carga.peso`, { inputmode: 'decimal' })}${campo('Nº da ONU', `${b}.carga.onu`)}</div>
      <h3>Danos</h3>${chipsLista(`${b}.carga.danos`, OP.DANOS_CARGA)}
      <h3>Natureza da carga</h3>${chipsLista(`${b}.carga.natureza`, OP.NATUREZA_CARGA)}
      ${campo('Especificação/observação da carga (quadro sem rótulo ao lado do tacógrafo)', `${b}.carga.complemento`)}
      ${pergunta('Possui tacógrafo?', `${b}.carga.tacografo`)}`, { contagem: v.carga.tipo || v.carga.semCarga ? 'preenchido' : '' })}
    <div class="acoes"><button class="btn perigo pequeno" data-acao="remover-veiculo" data-indice="${i}">Remover V-${v.numero}</button></div>`;
  return secao(`vei-${v.uid}`, resumo, conteudo, { classe: 'registro', prefixo: `<span class="rotulo-id">V-${v.numero}</span>`, aberta: UI.novoRegistro === v.uid });
}

function objetoHtml(ob, i) {
  const b = `objetos.${i}`;
  return `<div class="cartao"><strong>Objeto ${ob.numero}</strong>
    <div class="grade duas">
      ${campo('Participação do objeto', `${b}.participacao`, { opcoes: OP.PARTICIPACAO_OBJETO })}
      ${campo('Quantidade', `${b}.quantidade`, { inputmode: 'numeric' })}
      ${campo('Descrição', `${b}.descricao`, { classe: 'inteiro' })}
      ${campo('Vínculo com envolvido', `${b}.envolvidoUid`, { opcoes: EST.envolvidos.map((e) => [e.uid, `E-${e.numero}${e.nome ? ` · ${e.nome}` : ''}`]) })}
      ${campo('Vínculo com veículo', `${b}.veiculoUid`, { opcoes: EST.veiculos.map((v) => [v.uid, `V-${v.numero}${v.placa ? ` · ${v.placa}` : ''}`]) })}
    </div>
    <button class="btn perigo pequeno" data-acao="remover-objeto" data-indice="${i}">Remover objeto ${ob.numero}</button></div>`;
}

function etapa4() {
  return `
  <h2>Veículos</h2>
  ${EST.veiculos.map(veiculoHtml).join('') || '<p class="suave">Nenhum veículo cadastrado.</p>'}
  <div class="acoes"><button class="btn primario" data-acao="add-veiculo">+ Adicionar veículo</button></div>
  <h2>6 - Dados dos objetos</h2>
  <p class="suave">O BO tem 6 linhas. Mais objetos vão para a folha de continuação, numerados.</p>
  ${EST.objetos.map(objetoHtml).join('')}
  <div class="acoes"><button class="btn primario" data-acao="add-objeto">+ Adicionar objeto</button></div>
  ${campo('Destino do(s) objeto(s)', 'objetosDestino')}`;
}

function etapa5() {
  const sug = UI.sugestaoHistorico;
  const nMeios = OP.GRUPO_MEIOS.opcoes.filter(([n]) => EST.marcas[n]).length;
  return `
  ${secao('meios', '4 - Meios empregados para a execução do ilícito', `${chipsMarca(OP.GRUPO_MEIOS.opcoes)}
    ${EST.marcas.meios__outros ? campo('Outros — especificar', 'meiosOutrosTexto') : ''}`, { contagem: nMeios ? `${nMeios} marcado(s)` : '', aberta: nMeios > 0 })}
  <h2>5 - Relato policial do ocorrido</h2>
  ${sug ? aviso('info', `O histórico usa ${sug.de.map((d) => `“${esc(d)}”`).join(', ')} (${sug.quantidade}x). <button class="btn pequeno" data-acao="trocar-equipe">Substituir por “EQUIPE”</button> <span class="suave">Só altera se você tocar.</span>`) : ''}
  ${campo('Relato (o que, quando, onde, quem, como e por que)', 'relato', { multilinha: true, linhas: 14, classeEntrada: 'historico', contador: 'relato' })}
  ${EST.importacoes.length ? secao('orig-import', 'Texto original importado (consulta)', EST.importacoes.map((im) => `<p class="suave">Importado em ${esc(new Date(im.em).toLocaleString('pt-BR'))}</p><pre class="original">${esc(im.texto)}</pre>`).join('')) : ''}
  <h2>7 - Providências adotadas</h2>
  <h3>Documentos</h3>${chipsMarca(OP.DOCUMENTOS_BO)}
  ${OP.SN_BO.map(([k, r]) => pergunta(r, `sn.${k}`)).join('')}
  ${EST.sn.ic_no_local === 'sim' || EST.icResponsavel ? campo('Criminalística — nome e cargo do responsável', 'icResponsavel') : ''}
  ${EST.sn.disparo === 'sim' || EST.disparoQuantidade ? campo('Quantidade de disparos', 'disparoQuantidade', { inputmode: 'numeric' }) : ''}
  ${campo('Outras providências', 'outrasProvidencias', { multilinha: true, linhas: 3, contador: 'outras' })}`;
}

function etapa6(pendencias) {
  const integrantes = (PREFS.integrantes || []).filter((p) => !EST.equipe.some((x) => x.nome === p.nome && x.matricula === p.matricula));
  const nivel = { falta: 'Falta', alerta: 'Conferir', info: 'Info' };
  const cp = EST.complemento; const o = EST.ocorrencia;
  return `
  <h2>EQUIPE / 8 - Atendente da ocorrência</h2>
  <p class="suave">O quadro 8 tem 2 linhas. Os demais marcados vão para a folha de continuação, com espaço para assinatura. Matrículas nunca são inventadas.</p>
  ${EST.equipe.map((p, i) => `<div class="cartao"><div class="grade duas">
      ${campo('Posto/graduação', `equipe.${i}.posto`, { lista: 'dl-postos' })}
      ${campo('Matrícula', `equipe.${i}.matricula`, { inputmode: 'numeric' })}
      ${campo('Nome', `equipe.${i}.nome`, { classe: 'inteiro', autocap: 'words' })}</div>
      ${marcaBool('Atendente (quadro 8 / assina)', `equipe.${i}.noQuadro8`)}
      <button class="btn perigo pequeno" data-acao="remover-policial" data-indice="${i}">Remover</button></div>`).join('')}
  <div class="acoes">
    <button class="btn primario" data-acao="add-policial">+ Adicionar policial</button>
    ${integrantes.map((p, k) => `<button class="btn pequeno" data-acao="add-integrante" data-indice="${(PREFS.integrantes || []).indexOf(p)}">+ ${esc([p.posto, p.nome].filter(Boolean).join(' '))}</button>`).join('')}
  </div>
  ${secao('complemento', 'Informações complementares (opcional)', `
    <p class="suave">Sem campo no formulário oficial. Só entram no PDF, em folha de continuação identificada, se você marcar.</p>
    ${marcaBool(`Incluir serviço do dia e nome da EQUIPE${o.servicoDia || o.equipeNome ? ` (${[o.servicoDia, o.equipeNome].filter(Boolean).join(' · ')})` : ''}`, 'complemento.incluirServico')}
    ${marcaBool(`Incluir CPU${o.cpu ? ` (${o.cpu})` : ''}`, 'complemento.incluirCpu')}
    ${marcaBool(`Incluir coordenadas${EST.local.latitude ? ` (${EST.local.latitude}, ${EST.local.longitude})` : ''}`, 'complemento.incluirCoordenadas')}
    ${marcaBool(`Incluir procedimento adotado informado${o.procedimentoAdotado ? ` (${o.procedimentoAdotado})` : ''}`, 'complemento.incluirProcedimento')}
    ${campo('Texto complementar', 'complemento.texto', { multilinha: true, linhas: 3 })}`, { contagem: [cp.incluirServico, cp.incluirCpu, cp.incluirCoordenadas, cp.incluirProcedimento, cp.texto].filter(Boolean).length ? 'incluído' : '' })}
  <h2>Revisão final</h2>
  ${pendencias.length ? `<ul class="lista-pend">${pendencias.map((p) => `<li class="${p.nivel}"><strong>${nivel[p.nivel]}:</strong> <span>${esc(p.texto)}</span><button class="btn pequeno" data-etapa="${p.etapa}">Etapa ${p.etapa}</button></li>`).join('')}</ul>
    <p class="suave">As pendências não impedem a geração: campos sem informação ficam em branco.</p>` : aviso('ok', 'Nenhuma pendência encontrada.')}
  <h2>Gerar documentos</h2>
  <div class="chips" role="group" aria-label="Formato">
    <button type="button" class="chip" data-modo="editavel" aria-pressed="${UI.modo === 'editavel'}">PDF editável (campos preenchidos)</button>
    <button type="button" class="chip" data-modo="impressao" aria-pressed="${UI.modo === 'impressao'}">Cópia final para impressão</button>
  </div>
  <div class="acoes coluna">
    <button class="btn primario" data-gerar="bo">Gerar BO</button>
    <button class="btn" data-gerar="fichas">Gerar ficha(s) de envolvido/veículo</button>
    <button class="btn ouro" data-gerar="conjunto">Gerar conjunto completo da ocorrência</button>
  </div>
  <div id="resultado-geracao">${painelResultado(UI.resultado)}</div>
  <h2>Rascunho</h2>
  ${painelRascunho()}`;
}

export function painelRascunho() {
  return `
  <label class="marcar"><input type="checkbox" data-acao-check="salvar-aparelho"${UI.salvarAparelho ? ' checked' : ''}>
    <span><strong>Salvar rascunho neste aparelho</strong><br><span class="suave">Salva automaticamente. Qualquer pessoa que usar este mesmo navegador poderá reabri-lo.</span></span></label>
  <div class="acoes">
    <button class="btn pequeno" data-acao="exportar-json">Exportar rascunho (JSON)</button>
    <label class="btn pequeno">Importar rascunho (JSON)<input type="file" accept="application/json,.json" data-arquivo="json" class="sr"></label>
    <button class="btn pequeno" data-acao="ir-importar">Importar outro relatório</button>
    <button class="btn perigo pequeno" data-acao="apagar">Apagar dados da ocorrência</button>
  </div>
  <p class="suave">“Apagar” remove a ocorrência e o rascunho, mas mantém as configurações da unidade.</p>`;
}

export function painelResultado(r) {
  if (!r) return '';
  if (r.gerando) return aviso('info', 'Gerando documento… (o primeiro uso carrega a biblioteca de PDF)');
  if (r.erro) return aviso('erro', `Não foi possível gerar: ${esc(r.erro)}`);
  const cont = r.resumo.continuacoes.length
    ? `<p>Folha(s) de continuação: ${r.resumo.continuacoes.map((c) => `${esc(c.doc)} (${c.paginas} pág.: ${c.motivos.map(esc).join('; ')})`).join(' · ')}</p>` : '';
  return `<div class="cartao resultado">
    <strong>${esc(r.nome)}</strong> — ${r.resumo.paginas} página(s)${r.resumo.fichas.length ? ` · fichas: ${r.resumo.fichas.map(esc).join(', ')}` : ''}
    ${cont}
    ${r.avisos.length ? `<ul>${r.avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
    <div class="acoes">
      <button class="btn primario" data-acao="baixar">Baixar PDF</button>
      ${r.podeCompartilhar ? '<button class="btn" data-acao="compartilhar">Compartilhar…</button>' : ''}
      <button class="btn" data-acao="abrir-pdf">Visualizar</button>
    </div></div>`;
}

export function telaEtapa(n, pendencias) {
  const corpo = [etapa1, etapa2, etapa3, etapa4, etapa5, () => etapa6(pendencias)][n - 1]();
  const faltam = pendencias.filter((p) => p.etapa === n && p.nivel === 'falta').length;
  return `${barraEtapas(n)}
    <h1>${n}. ${esc(NOMES_ETAPAS[n - 1])}${faltam ? ` <span class="selo conflito">${faltam} pendência(s)</span>` : ''}</h1>
    ${corpo}`;
}

// ------------------------------------------------------------------ configurações
export function telaConfig() {
  return `
  <h1>Configurações da unidade</h1>
  <p class="suave">Ficam salvas neste navegador, separadas das ocorrências. Servem de valor inicial em novas ocorrências.</p>
  <div class="grade duas">
    ${campo('Unidade policial militar (como sai no formulário)', 'prefs:unidade', { classe: 'inteiro' })}
    ${campo('Pelotão', 'prefs:pelotao')}
    ${campo('Município', 'prefs:municipio')}
    ${campo('UF', 'prefs:uf', { mascara: 'uf' })}
    ${campo('CEP padrão', 'prefs:cep', { mascara: 'cep' })}
  </div>
  <h2>Integrantes da EQUIPE</h2>
  <p class="suave">Cadastre para adicionar com um toque. Não preencha matrícula se não tiver certeza.</p>
  ${(PREFS.integrantes || []).map((p, i) => `<div class="cartao"><div class="grade duas">
    ${campo('Posto/graduação', `prefs:integrantes.${i}.posto`, { lista: 'dl-postos' })}${campo('Matrícula', `prefs:integrantes.${i}.matricula`, { inputmode: 'numeric' })}
    ${campo('Nome', `prefs:integrantes.${i}.nome`, { classe: 'inteiro', autocap: 'words' })}</div>
    <button class="btn perigo pequeno" data-acao="remover-integrante" data-indice="${i}">Remover</button></div>`).join('')}
  <div class="acoes coluna">
    <button class="btn" data-acao="add-integrante-config">+ Adicionar integrante</button>
    <button class="btn primario" data-acao="voltar">Concluir</button>
    <button class="btn perigo pequeno" data-acao="restaurar-config">Restaurar configuração inicial</button>
  </div>`;
}

export function listasDatalist() {
  return `
  <datalist id="dl-postos">${OP.POSTOS.map((p) => `<option value="${esc(p)}">`).join('')}</datalist>
  <datalist id="dl-tipolog">${['Rua', 'Avenida', 'Travessa', 'Praça', 'Rodovia', 'Estrada', 'Povoado', 'Quadra', 'Alameda'].map((p) => `<option value="${p}">`).join('')}</datalist>
  <datalist id="dl-teltipo">${['Celular', 'Residencial', 'Comercial', 'Recado'].map((p) => `<option value="${p}">`).join('')}</datalist>
  <datalist id="dl-especie">${['Motocicleta', 'Motoneta', 'Ciclomotor', 'Automóvel', 'Caminhonete', 'Camioneta', 'Caminhão', 'Ônibus', 'Micro-ônibus', 'Bicicleta', 'Reboque'].map((p) => `<option value="${p}">`).join('')}</datalist>`;
}
