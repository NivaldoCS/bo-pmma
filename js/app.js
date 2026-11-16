// Controlador da interface. Sem dependências externas; nada é enviado à rede.
import * as E from './estado.js';
import * as T from './telas.js';
import { MASCARAS, alertaFormato, hojeAgora } from './mascaras.js';
import { calcularPendencias } from './pendencias.js';

const app = document.getElementById('app');
const topoSub = document.getElementById('topo-sub');
let prefs = E.carregarPreferencias();
let estado = null;
const ui = {
  tela: 'inicio', etapa: 1, importTexto: '', analise: null, itensRev: null, pendImport: null,
  abertos: new Set(), fechados: new Set(), modo: 'editavel', resultado: null, salvarAparelho: E.salvarNoAparelhoAtivo(),
  novoRegistro: null, sugestaoHistorico: null, telaAnterior: 'inicio',
};
let urlPdf = null; let blobPdf = null;

// ------------------------------------------------------------------ utilidades
function toast(msg, ms = 2600) {
  const t = document.createElement('div');
  t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), ms);
}
let tSalvar = null;
function agendarSalvar() {
  clearTimeout(tSalvar);
  tSalvar = setTimeout(() => { if (estado) E.salvarOcorrencia(estado); }, 350);
}
function salvarAgora() { clearTimeout(tSalvar); if (estado) E.salvarOcorrencia(estado); }
let tPrefs = null;
function agendarPrefs() { clearTimeout(tPrefs); tPrefs = setTimeout(() => E.salvarPreferencias(prefs), 350); }

function municipiosConhecidos() {
  return [...new Set([prefs.municipio, 'Barão de Grajaú', 'São João dos Patos', 'Floriano', 'Sucupira do Riachão', 'Paraibano', 'Pastos Bons', 'Nova Iorque', 'Passagem Franca', 'Lagoa do Mato', 'São Francisco do Maranhão', 'Colinas', 'Mirador'].filter(Boolean))];
}

function resumoOcorrencia(e) {
  if (!e) return '';
  const o = e.ocorrencia;
  return [o.numeroBo ? `BO ${o.numeroBo}` : 'sem número', o.fatos[0].descricao, `${e.envolvidos.length} envolvido(s)`].filter(Boolean).join(' · ');
}

function atualizarTopo() {
  topoSub.textContent = estado && ui.tela === 'etapa' ? (resumoOcorrencia(estado) || 'Ocorrência em andamento') : (prefs.unidade || '');
}

// ------------------------------------------------------------------ renderização
function render({ manterRolagem = false } = {}) {
  const y = window.scrollY;
  T.contexto(estado, prefs, ui);
  let html = '';
  switch (ui.tela) {
    case 'inicio': {
      const sess = estado && E.ocorrenciaTemDados(estado);
      const r = E.rascunhoNoAparelho();
      html = T.telaInicio({ temSessao: sess, resumoSessao: resumoOcorrencia(estado), rascunho: r && !sess ? r : null, resumoRascunho: resumoOcorrencia(r) });
      break;
    }
    case 'importar': html = T.telaImportar(ui.importTexto, estado && E.ocorrenciaTemDados(estado)); break;
    case 'revisao': html = T.telaRevisao(ui.analise, ui.itensRev, ui.pendImport); break;
    case 'config': html = T.telaConfig(); break;
    default: html = T.telaEtapa(ui.etapa, calcularPendencias(estado));
  }
  app.innerHTML = html + T.listasDatalist();
  document.getElementById('nav-etapas').classList.toggle('oculto', ui.tela !== 'etapa');
  if (ui.tela === 'etapa') {
    document.getElementById('btn-anterior').disabled = ui.etapa === 1;
    document.getElementById('btn-proxima').textContent = ui.etapa === 6 ? 'Início' : 'Próxima →';
  }
  atualizarTopo();
  if (manterRolagem) window.scrollTo(0, y); else window.scrollTo(0, 0);
  ui.novoRegistro = null;
}

function irPara(tela, extra = {}) {
  salvarAgora();
  ui.telaAnterior = ui.tela;
  Object.assign(ui, extra, { tela });
  render();
}

function garantirEstado() {
  if (!estado) estado = E.ocorrenciaVazia(prefs);
}

// ------------------------------------------------------------------ entrada de dados
function aplicarValor(alvo) {
  const caminho = alvo.dataset.bind;
  let valor;
  if (alvo.type === 'checkbox') valor = alvo.checked;
  else {
    valor = alvo.value;
    const m = alvo.dataset.mascara;
    if (m && MASCARAS[m]) {
      const novo = MASCARAS[m](valor);
      if (novo !== valor) {
        const fim = alvo.selectionEnd === valor.length;
        alvo.value = novo;
        if (fim) try { alvo.setSelectionRange(novo.length, novo.length); } catch { /* */ }
      }
      valor = novo;
    }
  }
  if (caminho.startsWith('prefs:')) { E.definir(prefs, caminho.slice(6), valor); agendarPrefs(); return; }
  E.definir(estado, caminho, valor);
  agendarSalvar();
  const alertaEl = app.querySelector(`[data-alerta-de="${CSS.escape(caminho)}"]`);
  if (alertaEl) alertaEl.textContent = alertaFormato(alvo.dataset.mascara, valor);
  if (alvo.dataset.contador) {
    const c = app.querySelector(`[data-contador-de="${CSS.escape(caminho)}"]`);
    if (c) c.innerHTML = T.contadorHtml(alvo.dataset.contador, valor);
  }
}

app.addEventListener('input', (ev) => {
  const a = ev.target;
  if (a.dataset.bind) aplicarValor(a);
  else if (a.dataset.import) ui.importTexto = a.value;
});
app.addEventListener('change', (ev) => {
  const a = ev.target;
  if (a.dataset.bind) {
    aplicarValor(a);
    // selects e checkboxes podem mudar campos condicionais
    if (a.tagName === 'SELECT' || a.type === 'checkbox') render({ manterRolagem: true });
  } else if (a.dataset.rev) {
    const it = ui.itensRev.find((i) => i.id === a.dataset.rev);
    if (it) it.aplicar = a.checked;
  } else if (a.dataset.arquivo === 'json') {
    abrirJson(a.files && a.files[0]); a.value = '';
  } else if (a.dataset.acaoCheck === 'salvar-aparelho') {
    ui.salvarAparelho = a.checked;
    E.definirSalvarNoAparelho(a.checked, estado);
    toast(a.checked ? 'Rascunho será salvo neste aparelho automaticamente.' : 'Rascunho removido deste aparelho. Dados ficam só nesta aba.');
  }
});
app.addEventListener('toggle', (ev) => {
  const d = ev.target;
  if (d.tagName !== 'DETAILS' || !d.dataset.sec) return;
  if (d.open) { ui.abertos.add(d.dataset.sec); ui.fechados.delete(d.dataset.sec); } else { ui.abertos.delete(d.dataset.sec); ui.fechados.add(d.dataset.sec); }
}, true);

function alternarLista(caminho, valor) {
  const lista = E.obter(estado, caminho) || [];
  const i = lista.indexOf(valor);
  if (i >= 0) lista.splice(i, 1); else lista.push(valor);
  E.definir(estado, caminho, lista);
}

app.addEventListener('click', async (ev) => {
  const b = ev.target.closest('button, [data-acao]');
  if (!b || b.disabled) return;
  const d = b.dataset;
  if (d.lista) { alternarLista(d.lista, d.valor); agendarSalvar(); render({ manterRolagem: true }); return; }
  if (d.unico) { const atual = E.obter(estado, d.unico); E.definir(estado, d.unico, atual === d.valor ? '' : d.valor); agendarSalvar(); render({ manterRolagem: true }); return; }
  if (d.marca) {
    const novo = !estado.marcas[d.marca];
    if (d.grupo) for (const k of Object.keys(estado.marcas)) if (k.startsWith(`amb_${d.grupo}__`)) delete estado.marcas[k];
    if (novo) estado.marcas[d.marca] = true; else delete estado.marcas[d.marca];
    agendarSalvar(); render({ manterRolagem: true }); return;
  }
  if (d.vinculoVeiculo) {
    const e = estado.envolvidos.find((x) => x.uid === d.envolvido);
    e.veiculoUid = e.veiculoUid === d.vinculoVeiculo ? '' : d.vinculoVeiculo;
    agendarSalvar(); render({ manterRolagem: true }); return;
  }
  if (d.etapa) { irPara('etapa', { etapa: +d.etapa }); return; }
  if (d.modo) { ui.modo = d.modo; render({ manterRolagem: true }); return; }
  if (d.gerar) { await gerar(d.gerar); return; }
  if (d.acao) await acao(d.acao, d, b);
});

async function acao(nome, d) {
  switch (nome) {
    case 'ir-importar': garantirEstadoParaImport(); irPara('importar'); break;
    case 'ir-config': irPara('config'); break;
    case 'voltar': irPara(estado && E.ocorrenciaTemDados(estado) && ui.telaAnterior === 'etapa' ? 'etapa' : 'inicio'); break;
    case 'nova':
      if (estado && E.ocorrenciaTemDados(estado) && !confirm('Iniciar uma nova ocorrência vai descartar a ocorrência atual desta sessão' + (ui.salvarAparelho ? ' e o rascunho salvo neste aparelho' : '') + '. Se quiser guardar, exporte o rascunho antes. Continuar?')) return;
      E.apagarOcorrencia();
      if (ui.salvarAparelho) E.definirSalvarNoAparelho(true, null);
      estado = E.ocorrenciaVazia(prefs); ui.resultado = null; ui.sugestaoHistorico = null;
      salvarAgora(); irPara('etapa', { etapa: 1 }); break;
    case 'continuar': irPara('etapa', { etapa: ui.etapa || 1 }); break;
    case 'retomar-rascunho': {
      const r = E.rascunhoNoAparelho();
      if (r) { estado = r; salvarAgora(); irPara('etapa', { etapa: 1 }); toast('Rascunho retomado.'); }
      break;
    }
    case 'colar':
      try { ui.importTexto = await navigator.clipboard.readText(); render(); } catch { toast('Não foi possível ler a área de transferência. Toque e segure no campo e escolha “Colar”.'); }
      break;
    case 'analisar': await analisarImport(); break;
    case 'aplicar-import': await aplicarImport(); break;
    case 'usar-informada': {
      const o = estado.ocorrencia;
      o.datas[d.alvo] = { data: o.dataInformada || o.datas[d.alvo].data, hora: o.horaInformada || o.datas[d.alvo].hora };
      agendarSalvar(); render({ manterRolagem: true }); break;
    }
    case 'agora': { estado.ocorrencia.datas[d.alvo] = hojeAgora(); agendarSalvar(); render({ manterRolagem: true }); break; }
    case 'gps': usarGps(); break;
    case 'add-envolvido': { const n = E.novoEnvolvido(estado.envolvidos.length + 1); estado.envolvidos.push(n); ui.novoRegistro = n.uid; agendarSalvar(); render({ manterRolagem: true }); break; }
    case 'remover-envolvido': {
      const e = estado.envolvidos[+d.indice];
      if (!confirm(`Remover E-${e.numero} ${e.nome || ''}? Os demais serão renumerados.`)) return;
      estado.envolvidos.splice(+d.indice, 1); E.renumerar(estado.envolvidos);
      estado.ocorrencia.fatos.forEach((f) => { f.envolvidos = f.envolvidos.filter((u) => u !== e.uid); });
      estado.objetos.forEach((o) => { if (o.envolvidoUid === e.uid) o.envolvidoUid = ''; });
      estado.veiculos.forEach((v) => { if (v.proprietario.envolvidoUid === e.uid) v.proprietario.envolvidoUid = ''; });
      agendarSalvar(); render({ manterRolagem: true }); break;
    }
    case 'add-veiculo': { const v = E.novoVeiculo(estado.veiculos.length + 1); estado.veiculos.push(v); ui.novoRegistro = v.uid; agendarSalvar(); render({ manterRolagem: true }); break; }
    case 'remover-veiculo': {
      const v = estado.veiculos[+d.indice];
      if (!confirm(`Remover V-${v.numero}? Os demais serão renumerados.`)) return;
      estado.veiculos.splice(+d.indice, 1); E.renumerar(estado.veiculos);
      estado.envolvidos.forEach((e) => { if (e.veiculoUid === v.uid) e.veiculoUid = ''; });
      estado.objetos.forEach((o) => { if (o.veiculoUid === v.uid) o.veiculoUid = ''; });
      agendarSalvar(); render({ manterRolagem: true }); break;
    }
    case 'copiar-proprietario': {
      const v = estado.veiculos[+d.veiculo]; const e = estado.envolvidos.find((x) => x.uid === d.envolvido);
      const p = v.proprietario;
      if (p.nome && !confirm('Substituir os dados atuais do proprietário?')) return;
      Object.assign(p, {
        envolvidoUid: e.uid, nome: e.nome, cpfCnpj: e.cpf, nacionalidade: e.nacionalidade,
        endereco: [e.res.tipoLogradouro, e.res.logradouro, e.res.numero && `nº ${e.res.numero}`, e.res.complemento].filter(Boolean).join(' '),
        bairro: e.res.bairro, municipioUf: [e.res.municipio, e.res.estado].filter(Boolean).join('/'), cep: e.res.cep,
        telefone: [e.res.telDdd && `(${e.res.telDdd})`, e.res.telNumero].filter(Boolean).join(' '),
      });
      agendarSalvar(); render({ manterRolagem: true }); toast(`Dados de E-${e.numero} copiados para o proprietário.`); break;
    }
    case 'add-objeto': estado.objetos.push(E.novoObjeto(estado.objetos.length + 1)); agendarSalvar(); render({ manterRolagem: true }); break;
    case 'remover-objeto': estado.objetos.splice(+d.indice, 1); E.renumerar(estado.objetos); agendarSalvar(); render({ manterRolagem: true }); break;
    case 'add-policial': estado.equipe.push(E.novoPolicial()); agendarSalvar(); render({ manterRolagem: true }); break;
    case 'add-integrante': estado.equipe.push(E.novoPolicial(prefs.integrantes[+d.indice])); agendarSalvar(); render({ manterRolagem: true }); break;
    case 'remover-policial': estado.equipe.splice(+d.indice, 1); agendarSalvar(); render({ manterRolagem: true }); break;
    case 'add-integrante-config': prefs.integrantes.push({ posto: '', nome: '', matricula: '' }); E.salvarPreferencias(prefs); render({ manterRolagem: true }); break;
    case 'remover-integrante': prefs.integrantes.splice(+d.indice, 1); E.salvarPreferencias(prefs); render({ manterRolagem: true }); break;
    case 'restaurar-config':
      if (!confirm('Restaurar a configuração inicial (2º Pelotão, Barão de Grajaú/MA) e remover os integrantes cadastrados?')) return;
      prefs = E.preferenciasPadrao(); E.salvarPreferencias(prefs); render(); break;
    case 'trocar-equipe': {
      const { substituirNoHistorico } = await import('./importador.js');
      const s = ui.sugestaoHistorico;
      const r = substituirNoHistorico(estado.relato, s.de, 'EQUIPE');
      if (!confirm(`Substituir ${r.trocas} ocorrência(s) de ${s.de.join(', ')} por “EQUIPE” no relato?`)) return;
      estado.relato = r.texto; ui.sugestaoHistorico = null; agendarSalvar(); render({ manterRolagem: true }); break;
    }
    case 'exportar-json': exportarJson(); break;
    case 'apagar':
      if (!confirm('Apagar todos os dados desta ocorrência (inclusive o rascunho salvo neste aparelho)? As configurações da unidade serão mantidas.')) return;
      E.apagarOcorrencia(); estado = null; ui.resultado = null; ui.analise = null; ui.importTexto = ''; ui.sugestaoHistorico = null;
      liberarPdf(); irPara('inicio'); toast('Dados da ocorrência apagados.'); break;
    case 'baixar': baixar(); break;
    case 'compartilhar': compartilhar(); break;
    case 'abrir-pdf': if (urlPdf) window.open(urlPdf, '_blank', 'noopener'); break;
    default: break;
  }
}

function garantirEstadoParaImport() { /* a ocorrência só é criada ao aplicar */ }

// ------------------------------------------------------------------ importação
async function analisarImport() {
  const texto = ui.importTexto.trim();
  if (!texto) { toast('Cole o relatório primeiro.'); return; }
  const imp = await import('./importador.js');
  const base = estado || E.ocorrenciaVazia(prefs);
  ui.analise = imp.analisar(texto, { municipiosConhecidos: municipiosConhecidos() });
  ui.itensRev = imp.montarRevisao(base, ui.analise);
  ui.pendImport = imp.pendenciasImportacao(ui.analise);
  irPara('revisao');
}

async function aplicarImport() {
  const imp = await import('./importador.js');
  garantirEstado();
  imp.aplicar(estado, ui.analise, ui.itensRev);
  const sug = ui.analise.sugestoesHistorico.find((s) => s.tipo === 'equipe');
  ui.sugestaoHistorico = sug && estado.relato && /guarni|\bGU\b/i.test(estado.relato) ? sug : null;
  ui.importTexto = '';
  salvarAgora();
  irPara('etapa', { etapa: 1 });
  toast('Dados aplicados. Confira cada etapa.');
}

// ------------------------------------------------------------------ GPS (local, iniciado pelo usuário)
function usarGps() {
  if (!navigator.geolocation) { toast('Este navegador não oferece localização.'); return; }
  toast('Obtendo localização…');
  navigator.geolocation.getCurrentPosition((p) => {
    estado.local.latitude = p.coords.latitude.toFixed(6);
    estado.local.longitude = p.coords.longitude.toFixed(6);
    agendarSalvar(); render({ manterRolagem: true }); toast('Coordenadas preenchidas.');
  }, () => toast('Não foi possível obter a localização.'), { enableHighAccuracy: true, timeout: 15000 });
}

// ------------------------------------------------------------------ JSON
function baixarBlob(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function exportarJson() {
  salvarAgora();
  const nome = `rascunho_${(estado.ocorrencia.numeroBo || 'sem-numero').replace(/[^0-9A-Za-z]+/g, '-')}.json`;
  baixarBlob(new Blob([E.exportarJson(estado)], { type: 'application/json' }), nome);
  toast('Rascunho exportado. Guarde o arquivo com cuidado: ele contém dados pessoais.');
}

async function abrirJson(arquivo) {
  if (!arquivo) return;
  try {
    const novo = E.importarJson(await arquivo.text());
    if (estado && E.ocorrenciaTemDados(estado) && !confirm('Abrir este rascunho vai substituir a ocorrência atual desta sessão. Continuar?')) return;
    estado = novo; ui.resultado = null; salvarAgora();
    irPara('etapa', { etapa: 1 }); toast('Rascunho aberto.');
  } catch (err) { alert(`Não foi possível abrir o rascunho: ${err.message}`); }
}

// ------------------------------------------------------------------ geração
async function carregarModelo(nome) {
  const r = await fetch(`templates/${nome}`);
  if (!r.ok) throw new Error(`modelo ${nome} indisponível (${r.status})`);
  return new Uint8Array(await r.arrayBuffer());
}

function liberarPdf() { if (urlPdf) URL.revokeObjectURL(urlPdf); urlPdf = null; blobPdf = null; }

async function gerar(tipo) {
  salvarAgora();
  ui.resultado = { gerando: true };
  const painel = document.getElementById('resultado-geracao');
  if (painel) { painel.innerHTML = T.painelResultado(ui.resultado); painel.scrollIntoView({ block: 'center' }); }
  try {
    const g = await import('./pdf/gerador.js');
    const r = await g.gerarDocumento(estado, { tipo, modo: ui.modo, carregarModelo });
    liberarPdf();
    blobPdf = new Blob([r.bytes], { type: 'application/pdf' });
    urlPdf = URL.createObjectURL(blobPdf);
    let podeCompartilhar = false;
    try { podeCompartilhar = !!(navigator.canShare && navigator.canShare({ files: [new File([blobPdf], r.nome, { type: 'application/pdf' })] })); } catch { /* */ }
    ui.resultado = { ...r, bytes: undefined, podeCompartilhar };
  } catch (err) {
    ui.resultado = { erro: err && err.message ? err.message : 'erro desconhecido' };
  }
  const p2 = document.getElementById('resultado-geracao');
  if (p2) { p2.innerHTML = T.painelResultado(ui.resultado); p2.scrollIntoView({ block: 'center' }); }
}

function baixar() {
  if (!blobPdf) return;
  const a = document.createElement('a');
  a.href = urlPdf; a.download = ui.resultado.nome; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
}

async function compartilhar() {
  if (!blobPdf) return;
  try {
    await navigator.share({ files: [new File([blobPdf], ui.resultado.nome, { type: 'application/pdf' })], title: ui.resultado.nome });
  } catch (err) { if (err && err.name !== 'AbortError') toast('Compartilhamento indisponível. Use “Baixar PDF”.'); }
}

// ------------------------------------------------------------------ navegação inferior
document.getElementById('btn-anterior').addEventListener('click', () => { if (ui.etapa > 1) irPara('etapa', { etapa: ui.etapa - 1 }); });
document.getElementById('btn-proxima').addEventListener('click', () => { if (ui.etapa < 6) irPara('etapa', { etapa: ui.etapa + 1 }); else irPara('inicio'); });
document.getElementById('btn-inicio').addEventListener('click', () => irPara('inicio'));

window.addEventListener('pagehide', salvarAgora);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') salvarAgora(); });
window.addEventListener('beforeunload', (ev) => {
  if (estado && E.ocorrenciaTemDados(estado) && !ui.salvarAparelho) { salvarAgora(); ev.preventDefault(); ev.returnValue = ''; }
});

// ------------------------------------------------------------------ service worker (offline)
const statusEl = document.getElementById('status-offline');
let atualizacaoPendente = null; let recarregarAoTrocar = false;
function mostrarBannerAtualizacao(sw) {
  atualizacaoPendente = sw;
  if (document.getElementById('banner-atualizacao')) return;
  const div = document.createElement('div');
  div.className = 'banner'; div.id = 'banner-atualizacao';
  div.innerHTML = '<span style="flex:1">Nova versão do site disponível. Seus dados desta aba serão mantidos.</span><button class="btn ouro" id="btn-atualizar">Atualizar</button><button class="btn" id="btn-depois">Depois</button>';
  document.body.appendChild(div);
  div.querySelector('#btn-depois').onclick = () => div.remove();
  div.querySelector('#btn-atualizar').onclick = () => {
    salvarAgora(); recarregarAoTrocar = true;
    atualizacaoPendente.postMessage({ tipo: 'ATIVAR' });
  };
}
async function iniciarSw() {
  if (!('serviceWorker' in navigator)) { statusEl.textContent = 'Este navegador não permite uso offline.'; return; }
  try {
    const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (recarregarAoTrocar) window.location.reload(); });
    if (reg.waiting && navigator.serviceWorker.controller) mostrarBannerAtualizacao(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      sw && sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) mostrarBannerAtualizacao(sw);
        if (sw.state === 'activated') verificarOffline();
      });
    });
    navigator.serviceWorker.addEventListener('message', (ev) => {
      if (ev.data && ev.data.tipo === 'STATUS') {
        statusEl.textContent = ev.data.completo ? `✓ Pronto para uso sem internet (versão ${ev.data.versao}).` : `Preparando uso offline… (${ev.data.presentes}/${ev.data.total} arquivos)`;
        statusEl.classList.toggle('ok', !!ev.data.completo);
      }
    });
    await navigator.serviceWorker.ready;
    verificarOffline();
  } catch { statusEl.textContent = 'Uso offline indisponível neste navegador.'; }
}
function verificarOffline() {
  const c = navigator.serviceWorker.controller;
  if (c) c.postMessage({ tipo: 'STATUS' });
  else navigator.serviceWorker.ready.then((r) => r.active && r.active.postMessage({ tipo: 'STATUS' }));
}

// ------------------------------------------------------------------ início
(function iniciar() {
  const s = E.carregarOcorrencia();
  if (s) estado = s.estado;
  render();
  if (location.protocol !== 'file:') iniciarSw();
})();
