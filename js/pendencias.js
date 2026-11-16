// Lista o que falta conferir/completar. Nada aqui bloqueia a geração.
import { SN_BO } from './opcoes.js';
import { alertaFormato } from './mascaras.js';
import { avaliarCampoMulti, avaliarLinhas } from './layout.js';

export function calcularPendencias(e) {
  const p = []; // {etapa, nivel: 'falta'|'alerta'|'info', texto}
  const add = (etapa, nivel, texto) => p.push({ etapa, nivel, texto });
  const o = e.ocorrencia;
  if (!o.numeroBo) add(1, 'falta', 'Nº CIOPS/COPOM (número do BO) não informado.');
  if (!o.unidade) add(1, 'falta', 'Unidade policial militar não informada.');
  if (!o.tipos.length) add(1, 'falta', 'Tipo de documento não marcado (comunicação, acidente, prisão/apreensão, BOA, TC ou outros).');
  if (o.tipos.includes('outros') && !o.tipoOutrosTexto) add(1, 'alerta', 'Tipo "Outros" marcado sem especificação.');
  for (const [k, nome] of [['fato', 'FATO'], ['comunicacao', 'COMUNICAÇÃO'], ['atendimento', 'ATENDIMENTO'], ['fechamento', 'FECHAMENTO']]) {
    const d = o.datas[k];
    if (!d.data || !d.hora) add(1, 'falta', `Data/hora de ${nome} ${!d.data && !d.hora ? 'não informadas' : 'incompletas'}.`);
    if (d.data && alertaFormato('data', d.data)) add(1, 'alerta', `Data de ${nome} em formato inválido.`);
    if (d.hora && alertaFormato('hora', d.hora)) add(1, 'alerta', `Hora de ${nome} em formato inválido.`);
  }
  if ((o.dataInformada || o.horaInformada) && !o.datas.fato.data) add(1, 'info', `O relatório informou ${[o.dataInformada, o.horaInformada].filter(Boolean).join(' ')}: escolha em qual campo usar.`);
  if (!o.fatos[0].descricao) add(1, 'falta', 'Descrição do fato (quadro 1) vazia.');
  if (!e.local.logradouro) add(2, 'falta', 'Logradouro do local não informado.');
  if (!e.local.municipio) add(2, 'falta', 'Município do local não informado.');
  if (!e.marcas.amb__interior && !e.marcas.amb__via_publica) add(2, 'alerta', 'Marque "Interior do ambiente" ou "Via pública".');
  if (!e.envolvidos.length) add(3, 'alerta', 'Nenhum envolvido cadastrado.');
  e.envolvidos.forEach((x) => {
    const id = `E-${x.numero}`;
    if (!x.nome) add(3, 'falta', `${id}: nome não informado.`);
    if (!x.participacao.length && !x.acidente.length) add(3, 'falta', `${id}: participação não definida${x.papelImportado ? ` (importado como ${x.papelImportado})` : ''}.`);
    if (x.cpf && alertaFormato('cpf', x.cpf)) add(3, 'alerta', `${id}: CPF com formato/dígito a conferir.`);
    if (!x.cpf && !x.semDocumento) add(3, 'info', `${id}: CPF não informado (marque "sem documento conhecido" se for o caso).`);
    if (x.nascimento && alertaFormato('data', x.nascimento)) add(3, 'alerta', `${id}: data de nascimento a conferir.`);
    if (x.algemado === 'sim' && !x.algemaJustificativas.length) add(3, 'falta', `${id}: algemado sem justificativa marcada.`);
    if (x.relato.texto && !avaliarCampoMulti(x.relato.texto, 'relato_texto', 'env').cabe) add(3, 'info', `${id}: relato individual excede o campo; o restante irá para folha de continuação.`);
  });
  e.veiculos.forEach((v) => {
    const id = `V-${v.numero}`;
    if (!e.envolvidos.some((x) => x.veiculoUid === v.uid)) add(4, 'info', `${id} sem envolvido vinculado: terá ficha própria, só com dados do veículo.`);
    if (v.placa && alertaFormato('placa', v.placa)) add(4, 'alerta', `${id}: placa fora do padrão.`);
  });
  e.objetos.forEach((ob) => {
    if (!ob.participacao) add(4, 'falta', `Objeto ${ob.numero}: participação (apreendido, furtado...) não definida.`);
    if (!ob.descricao) add(4, 'falta', `Objeto ${ob.numero}: descrição vazia.`);
  });
  if (e.objetos.length > 6) add(4, 'info', `${e.objetos.length} objetos: o BO tem 6 linhas; os demais irão para a folha de continuação.`);
  if (!e.relato) add(5, 'falta', 'Relato policial do ocorrido (quadro 5) vazio.');
  else if (!avaliarCampoMulti(e.relato, 'relato').cabe) add(5, 'info', 'O relato excede o campo do BO: o restante irá para a folha de continuação identificada (nada será cortado).');
  for (const [k, rot] of SN_BO) if (!e.sn[k]) add(5, 'falta', `Sem resposta: ${rot}`);
  if (e.sn.disparo === 'sim' && !e.disparoQuantidade) add(5, 'falta', 'Disparo de arma de fogo: quantidade não informada.');
  if (e.outrasProvidencias && !avaliarLinhas(e.outrasProvidencias, ['outras_providencias_1', 'outras_providencias_2']).cabe) add(5, 'info', 'Outras providências excedem as 2 linhas: o restante irá para a folha de continuação.');
  if (!e.equipe.length) add(6, 'falta', 'Nenhum integrante da EQUIPE cadastrado.');
  const q8 = e.equipe.filter((x) => x.noQuadro8);
  if (e.equipe.length && !q8.length) add(6, 'falta', 'Nenhum policial marcado para o quadro 8 (atendente).');
  if (q8.length > 2) add(6, 'info', `${q8.length} atendentes: o quadro 8 tem 2 linhas; os demais irão para a folha de continuação, com espaço para assinatura.`);
  e.equipe.forEach((x, i) => { if (!x.matricula) add(6, 'info', `Policial ${i + 1} (${x.nome || 'sem nome'}): matrícula não informada.`); });
  return p;
}
