// Mapeamento explícito: dados do sistema -> campos reais dos modelos limpos.
// Puro (sem pdf-lib), testável no Node. Os nomes de campo estão documentados
// em docs/MAPEAMENTO.md e em js/pdf/campos-modelo.js.
import { CAMPOS_BO, CAMPOS_ENV } from './campos-modelo.js';

export const NOMES_BO = new Set(CAMPOS_BO.map((c) => c.n));
export const NOMES_ENV = new Set(CAMPOS_ENV.map((c) => c.n));

const X = 'X';
const limpa = (s) => (s == null ? '' : String(s)).replace(/\s+$/g, '');
const linha = (s) => limpa(s).replace(/\s*\n\s*/g, ' ').trim();

export const PARTICIPACAO_OBJETO = {
  1: 'Apreendido', 2: 'Furtado', 3: 'Roubado', 4: 'Perdido', 5: 'Encontrado', 6: 'Recuperado',
};

export function formatarPolicial(p) {
  const posto = linha(p.posto); const nome = linha(p.nome); const mat = linha(p.matricula);
  let s = [posto, nome].filter(Boolean).join(' ');
  if (mat) s += `${s ? ', ' : ''}Mat. ${mat}`;
  return s;
}

export function formatarObjeto(o, estado) {
  const partes = [];
  if (o.participacao) partes.push(`${o.participacao} - ${PARTICIPACAO_OBJETO[o.participacao] || ''}`.trim());
  if (linha(o.descricao)) partes.push(linha(o.descricao));
  if (linha(o.quantidade)) partes.push(`Qtd.: ${linha(o.quantidade)}`);
  const vinc = [];
  const e = estado.envolvidos.find((x) => x.uid === o.envolvidoUid);
  if (e) vinc.push(`E-${e.numero}`);
  const v = estado.veiculos.find((x) => x.uid === o.veiculoUid);
  if (v) vinc.push(`V-${v.numero}`);
  if (vinc.length) partes.push(`Vínculo: ${vinc.join(', ')}`);
  return partes.join(' - ');
}

function dividirTelefone(num) {
  const d = String(num || '').replace(/\s/g, '');
  if (!d) return ['', ''];
  if (d.includes('-')) { const [a, ...b] = d.split('-'); return [a, b.join('')]; }
  const digitos = d.replace(/\D/g, '');
  if (digitos.length > 4) return [digitos.slice(0, -4), digitos.slice(-4)];
  return [d, ''];
}

function sn(v, campo, out) {
  if (v === 'sim') out[`${campo}__sim`] = X;
  else if (v === 'nao') out[`${campo}__nao`] = X;
}

/**
 * Mapeia a ocorrência para o BO.
 * Retorna { campos: {nome: valor}, blocos: [...] , objetosExtras, atendentesExtras }
 * blocos = textos distribuídos em várias linhas de campo (o gerador ajusta/continua).
 */
export function mapearBO(estado) {
  const o = estado.ocorrencia; const l = estado.local;
  const c = {};
  c.unidade = linha(o.unidade);
  c.ciops = linha(o.numeroBo);
  for (const t of o.tipos) c[`tipo__${t}`] = X;
  c.tipo_outros_texto = linha(o.tipoOutrosTexto);
  for (const k of ['fato', 'comunicacao', 'atendimento', 'fechamento']) {
    c[`${k}_data`] = linha(o.datas[k].data);
    c[`${k}_hora`] = linha(o.datas[k].hora);
  }
  o.fatos.forEach((f, i) => {
    c[`fato${i + 1}_descricao`] = linha(f.descricao);
    c[`fato${i + 1}_envolvidos`] = (f.envolvidos || [])
      .map((uid) => estado.envolvidos.find((e) => e.uid === uid))
      .filter(Boolean).map((e) => `E-${e.numero}`).join(', ');
  });
  c.local_logradouro = linha(l.logradouro);
  c.local_numero = linha(l.numero);
  c.local_bairro = linha(l.bairro);
  c.local_municipio = linha(l.municipio);
  c.local_cep = linha(l.cep);
  c.local_referencia = linha(l.referencia);
  for (const [k, v] of Object.entries(estado.marcas)) if (v && NOMES_BO.has(k)) c[k] = X;
  c.meios_outros_texto = linha(estado.meiosOutrosTexto);
  c.relato = limpa(estado.relato);

  const linhasObj = estado.objetos.map((ob) => formatarObjeto(ob, estado)).filter(Boolean);
  let objetosExtras = [];
  if (linhasObj.length > 6) {
    objetosExtras = linhasObj.slice(5);
    linhasObj.length = 5;
    linhasObj.push(`Demais objetos (${objetosExtras.length}) na folha de continuação deste BO.`);
  }
  linhasObj.forEach((t, i) => { c[`objeto_${i + 1}`] = t; });
  c.objetos_destino = linha(estado.objetosDestino);

  for (const k of Object.keys(estado.sn)) sn(estado.sn[k], k, c);
  c.ic_responsavel = linha(estado.icResponsavel);
  c.disparo_quantidade = linha(estado.disparoQuantidade);

  const atend = estado.equipe.filter((p) => p.noQuadro8).map(formatarPolicial).filter(Boolean);
  c.atendente_1 = atend[0] || '';
  c.atendente_2 = atend[1] || '';
  const atendentesExtras = atend.slice(2);

  const blocos = [
    { campos: ['outras_providencias_1', 'outras_providencias_2'], texto: limpa(estado.outrasProvidencias), titulo: '7 - Outras providências (continuação)' },
  ];
  return { campos: limparVazios(c), blocos, objetosExtras, atendentesExtras };
}

export function complementoBO(estado) {
  const o = estado.ocorrencia; const l = estado.local; const cp = estado.complemento;
  const itens = [];
  if (cp.incluirServico && o.servicoDia) itens.push(`Serviço do dia: ${linha(o.servicoDia)}`);
  if (cp.incluirServico && o.equipeNome) itens.push(`Equipe: ${linha(o.equipeNome)}`);
  if (cp.incluirCpu && o.cpu) itens.push(`CPU: ${linha(o.cpu)}`);
  if (cp.incluirProcedimento && o.procedimentoAdotado) itens.push(`Procedimento adotado (informado): ${linha(o.procedimentoAdotado)}`);
  if (cp.incluirCoordenadas && (l.latitude || l.longitude)) itens.push(`Coordenadas do local: latitude ${linha(l.latitude)}, longitude ${linha(l.longitude)}`);
  if (linha(cp.texto)) itens.push(limpa(cp.texto));
  return itens;
}

function limparVazios(c) {
  const out = {};
  for (const [k, v] of Object.entries(c)) if (v !== '' && v != null) out[k] = v;
  return out;
}

/**
 * Mapeia uma ficha "Dos envolvidos e dos veículos" (2 páginas).
 * e = envolvido (ou null para ficha só de veículo); v = veículo vinculado (ou null).
 */
export function mapearFicha(estado, e, v) {
  const o = estado.ocorrencia;
  const c = {};
  c.unidade = linha(o.unidade);
  c.ciops = linha(o.numeroBo);
  const blocos = [];
  let relatoTexto = '';
  if (e) {
    if (e.numero >= 1 && e.numero <= 5) c[`id__e${e.numero}`] = X;
    else { c.id__e_outro = X; c.id_e_outro_numero = String(e.numero); }
    for (const p of e.participacao) c[`participacao__${p}`] = X;
    for (const p of e.acidente) c[`acidente__${p}`] = X;
    c.nome = linha(e.nome); c.nome_mae = linha(e.nomeMae); c.nome_pai = linha(e.nomePai);
    c.nascimento = linha(e.nascimento);
    if (e.sexo === 'm') c.sexo__m = X;
    if (e.sexo === 'f') c.sexo__f = X;
    if (e.sexo === 'outros') { c.sexo__outros = X; c.sexo_outros_texto = linha(e.sexoOutro); }
    c.nacionalidade = linha(e.nacionalidade); c.natural_de = linha(e.naturalDe);
    c.profissao = linha(e.profissao);
    if (e.raca) c[`raca__${e.raca}`] = X;
    c.local_trabalho = linha(e.localTrabalho);
    if (e.estadoCivil) c[`estado_civil__${e.estadoCivil}`] = X;
    if (e.instrucao) c[`instrucao__${e.instrucao}`] = X;
    if (e.situacaoInstrucao) c[`situacao__${e.situacaoInstrucao}`] = X;
    c.alcunha = linha(e.alcunha); c.nome_falso = linha(e.nomeFalso);
    c.cpf = linha(e.cpf); c.rg = linha(e.rg); c.rg_emissao = linha(e.rgEmissao); c.rg_orgao = linha(e.rgOrgao); c.rg_uf = linha(e.rgUf);
    c.cnh = linha(e.cnh); c.cnh_validade = linha(e.cnhValidade); c.cnh_uf = linha(e.cnhUf);
    if (e.naoHabilitado) c.nao_habilitado = X;
    for (const [pre, end] of [['res', e.res], ['com', e.com]]) {
      c[`${pre}_cep`] = linha(end.cep); c[`${pre}_caixa_postal`] = linha(end.caixaPostal);
      c[`${pre}_tipo_logradouro`] = linha(end.tipoLogradouro); c[`${pre}_logradouro`] = linha(end.logradouro);
      c[`${pre}_numero`] = linha(end.numero); c[`${pre}_complemento`] = linha(end.complemento);
      c[`${pre}_bairro`] = linha(end.bairro); c[`${pre}_municipio`] = linha(end.municipio);
      c[`${pre}_estado`] = linha(end.estado); c[`${pre}_pais`] = linha(end.pais); c[`${pre}_referencia`] = linha(end.referencia);
      c[`${pre}_tel_tipo`] = linha(end.telTipo); c[`${pre}_tel_ddd`] = linha(end.telDdd);
      const [t1, t2] = dividirTelefone(end.telNumero);
      c[`${pre}_tel_numero_1`] = t1; c[`${pre}_tel_numero_2`] = t2;
      c[`${pre}_tel_ramal`] = linha(end.telRamal); c[`${pre}_email`] = linha(end.email);
    }
    for (const k of e.condicoes) c[`condicoes__${k}`] = X;
    blocos.push({ campos: ['bens_1', 'bens_2'], texto: limpa(e.bens), titulo: `Bens que portava consigo - E-${e.numero} (continuação)` });
    c.relato_local = linha(e.relato.local); c.relato_data_hora = linha(e.relato.dataHora);
    if (e.relato.testemunhaCompromissada) c.relato__testemunha_compromissada = X;
    for (const a of e.relato.alertas) c[`alerta__${a}`] = X;
    relatoTexto = limpa(e.relato.texto);
    if (e.algemado === 'sim') c.algemado__sim = X;
    if (e.algemado === 'nao') c.algemado__nao = X;
    for (const j of e.algemaJustificativas) c[`algema_justificativa__${j}`] = X;
    if (e.manifestacaoOfendido) c.manifestacao_ofendido = X;
    const d = e.declaracao;
    c.decl_eu = linha(d.eu); c.decl_funcao = linha(d.funcao); c.decl_dia = linha(d.dia); c.decl_mes = linha(d.mes);
    c.decl_ano = linha(d.ano); c.decl_local = linha(d.local);
    if (d.pessoaQualificada) c.decl__pessoa_qualificada = X;
    if (d.recebiCoisas) c.decl__recebi_coisas = X;
  }
  if (v) {
    if (v.numero >= 1 && v.numero <= 5) c[`veic__v${v.numero}`] = X;
    else { c.veic__v_outro = X; c.veic_outro_numero = String(v.numero); }
    c.veic_placa = linha(v.placa); c.veic_renavam_chassi = linha(v.renavamChassi); c.veic_especie = linha(v.especie);
    c.veic_marca_modelo = linha(v.marcaModelo); c.veic_cor = linha(v.cor); c.veic_ano = linha(v.ano);
    c.veic_municipio_uf = linha(v.municipioUf); c.veic_pais = linha(v.pais);
    const p = v.proprietario;
    c.prop_nome = linha(p.nome); c.prop_cpf_cnpj = linha(p.cpfCnpj); c.prop_endereco = linha(p.endereco);
    c.prop_bairro = linha(p.bairro); c.prop_municipio_uf = linha(p.municipioUf); c.prop_cep = linha(p.cep);
    c.prop_telefone = linha(p.telefone); c.prop_nacionalidade = linha(p.nacionalidade);
    if (v.cinto) c[`cinto__${v.cinto}`] = X;
    c.ocupantes = linha(v.ocupantes); c.conduzido_para = linha(v.conduzidoPara);
    c.estabelecimento = linha(v.estabelecimento); c.transporte = linha(v.transporte);
    const pr = v.prov;
    sn(pr.exameAlcoolico, 'exame_alcoolico', c); c.medicao = linha(pr.medicao); c.tiquete = linha(pr.tiquete);
    sn(pr.encaminhadoDp, 'encaminhado_dp', c); sn(pr.condutorAutuado, 'condutor_autuado', c);
    sn(pr.cnhRecolhida, 'cnh_recolhida', c); sn(pr.crlvRecolhido, 'crlv_recolhido', c);
    c.ait = linha(pr.ait); sn(pr.guinchamento, 'guinchamento', c); c.auto_remocao = linha(pr.autoRemocao);
    for (const g of pr.guinchadoPor) c[`guinchado_por__${g}`] = X;
    c.empresa_guincho = linha(pr.empresaGuincho); c.motorista_guincho = linha(pr.motoristaGuincho);
    const cg = v.carga;
    c.carga_tipo = linha(cg.tipo); c.carga_nota_fiscal = linha(cg.notaFiscal); c.carga_empresa = linha(cg.empresa);
    if (cg.semCarga) c.carga__sem_carga = X;
    c.carga_peso = linha(cg.peso);
    for (const dn of cg.danos) c[`carga_danos__${dn}`] = X;
    for (const n of cg.natureza) c[`carga_natureza__${n}`] = X;
    c.carga_complemento = linha(cg.complemento); c.carga_onu = linha(cg.onu);
    sn(cg.tacografo, 'tacografo', c);
  }
  const out = limparVazios(c);
  if (relatoTexto) out.relato_texto = relatoTexto;
  return { campos: out, blocos };
}

/**
 * Define quais fichas serão geradas, sem inventar vínculos:
 *  - uma ficha por envolvido, com o veículo explicitamente vinculado a ele (se houver);
 *  - uma ficha para cada veículo que não está vinculado a nenhum envolvido.
 */
export function planejarFichas(estado) {
  const fichas = [];
  const usados = new Set();
  for (const e of estado.envolvidos) {
    const v = estado.veiculos.find((x) => x.uid === e.veiculoUid) || null;
    if (v) usados.add(v.uid);
    fichas.push({ envolvido: e, veiculo: v, rotulo: v ? `E-${e.numero} + V-${v.numero}` : `E-${e.numero}` });
  }
  for (const v of estado.veiculos) {
    if (!usados.has(v.uid)) fichas.push({ envolvido: null, veiculo: v, rotulo: `V-${v.numero} (sem envolvido vinculado)` });
  }
  return fichas;
}

export function nomeArquivo(estado, tipo, modo) {
  const num = linha(estado.ocorrencia.numeroBo).replace(/[^0-9A-Za-z]+/g, '-').replace(/^-|-$/g, '');
  const base = { bo: 'BO', fichas: 'FICHAS', conjunto: 'OCORRENCIA' }[tipo] || 'BO';
  const id = num || `sem-numero_${new Date().toISOString().slice(0, 10)}`;
  return `${base}_${id}${modo === 'impressao' ? '_impressao' : ''}.pdf`;
}
