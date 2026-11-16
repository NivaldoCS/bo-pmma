# Mapeamento dos campos dos modelos

Gerado por `dev/preparar_modelos.py`. Coordenadas em pontos PDF (origem no canto inferior esquerdo, A4 ≈ 595 × 842).

* **nome**: nome do campo no modelo limpo (usado pelo gerador; no PDF final recebe prefixo, ex. `BO.` ou `F1.`).
* **original**: nome interno do campo no PDF recebido.
* **tipo**: `texto` ou `marca` (os modelos usam campos de texto que recebem "X" como caixa de marcação).
* Campos marcados como *adicionado* não existiam no original; foram criados sobre um espaço impresso do próprio formulário.

## Boletim de Ocorrência (`templates/bo.pdf`)

| pág. | nome | original | tipo | retângulo [x0, y0, x1, y1] | rótulo |
|---|---|---|---|---|---|
| 1 | `unidade` | `text_2yktf` | texto | [317.0, 786.0, 461.0, 800.0] | Unidade policial militar |
| 1 | `ciops` | `text_3gorw` | texto | [468.0, 786.0, 578.0, 799.0] | Nº CIOPS/COPOM (número do BO) |
| 1 | `tipo__comunicacao` | `text_44fwdp` | marca | [30.0, 771.0, 43.0, 785.0] | [X] Comunicação de ocorrência policial |
| 1 | `tipo__prisao_apreensao` | `text_46cnhb` | marca | [235.0, 771.0, 248.0, 785.0] | [X] Prisão/apreensão |
| 1 | `tipo__termo_circunstanciado` | `text_48bdua` | marca | [437.0, 771.0, 450.0, 785.0] | [X] Termo circunstanciado |
| 1 | `tipo__acidente_transito` | `text_45jeae` | marca | [30.0, 756.0, 43.0, 770.0] | [X] Acidente de trânsito |
| 1 | `tipo__boa` | `text_47pgam` | marca | [235.0, 756.0, 248.0, 770.0] | [X] BOA |
| 1 | `tipo__outros` | `text_49agrj` | marca | [437.0, 756.0, 450.0, 770.0] | [X] Outros |
| 1 | `tipo_outros_texto` | `text_236ejnf` | texto | [484.0, 756.0, 576.0, 765.0] | Outros (especificação) |
| 1 | `fato_data` | `text_4pp` | texto | [128.0, 718.0, 181.0, 731.0] | Fato - data |
| 1 | `fato_hora` | `text_5orkx` | texto | [184.0, 718.0, 237.0, 731.0] | Fato - hora |
| 1 | `comunicacao_data` | `text_6mzsl` | texto | [241.0, 718.0, 294.0, 731.0] | Comunicação - data |
| 1 | `comunicacao_hora` | `text_9faht` | texto | [297.0, 718.0, 350.0, 731.0] | Comunicação - hora |
| 1 | `atendimento_data` | `text_7ewej` | texto | [354.0, 718.0, 407.0, 731.0] | Atendimento - data |
| 1 | `atendimento_hora` | `text_10hoyz` | texto | [411.0, 718.0, 464.0, 731.0] | Atendimento - hora |
| 1 | `fechamento_data` | `text_8drho` | texto | [468.0, 718.0, 521.0, 731.0] | Fechamento - data |
| 1 | `fechamento_hora` | `text_11sikn` | texto | [524.0, 717.0, 577.0, 730.0] | Fechamento - hora |
| 1 | `fato1_descricao` | `text_22uayo` | texto | [63.0, 686.0, 436.0, 701.0] | 1-Fato: descrição (linha 1) |
| 1 | `fato1_envolvidos` | `text_124rtgq` | texto | [443.0, 686.0, 577.0, 695.0] | 1-Fato: envolvido(s) (linha 1) |
| 1 | `fato2_descricao` | `text_23vwgb` | texto | [63.0, 664.0, 436.0, 679.0] | 1-Fato: descrição (linha 2) |
| 1 | `fato2_envolvidos` | `text_125gtsr` | texto | [443.0, 663.0, 577.0, 672.0] | 1-Fato: envolvido(s) (linha 2) |
| 1 | `fato3_descricao` | `text_24dlni` | texto | [63.0, 641.0, 436.0, 656.0] | 1-Fato: descrição (linha 3) |
| 1 | `fato3_envolvidos` | `text_126xnpz` | texto | [442.0, 642.0, 576.0, 651.0] | 1-Fato: envolvido(s) (linha 3) |
| 1 | `local_logradouro` | `text_21iyzj` | texto | [68.0, 610.0, 339.0, 623.0] | 2-Local: logradouro |
| 1 | `local_bairro` | `text_26ydxj` | texto | [427.0, 610.0, 577.0, 622.0] | 2-Local: bairro |
| 1 | `local_numero` | `text_25frrp` | texto | [344.0, 611.0, 389.0, 620.0] | 2-Local: nº/km |
| 1 | `local_referencia` | `text_29vnyp` | texto | [357.0, 590.0, 577.0, 602.0] | 2-Local: ponto de referência |
| 1 | `local_municipio` | `text_27aefo` | texto | [54.0, 589.0, 174.0, 601.0] | 2-Local: município |
| 1 | `local_cep` | `text_28iotb` | texto | [198.0, 589.0, 256.0, 601.0] | 2-Local: CEP |
| 1 | `amb__interior` | `text_50izet` | marca | [26.0, 563.0, 39.0, 577.0] | [X] Interior do ambiente |
| 1 | `amb__via_publica` | `text_51bkzl` | marca | [163.0, 563.0, 176.0, 577.0] | [X] Via pública |
| 1 | `amb_atividade_financeira__casa_de_cambio` | `text_55drds` | marca | [329.0, 547.0, 342.0, 561.0] | [X] Atividade Financeira: Casa de câmbio |
| 1 | `amb_atividade_financeira__posto_de_atendimento` | `text_54wuyz` | marca | [246.0, 546.0, 259.0, 560.0] | [X] Atividade Financeira: Posto de atendimento |
| 1 | `amb_atividade_financeira__agencia_bancaria` | `text_52jywx` | marca | [82.0, 545.0, 95.0, 559.0] | [X] Atividade Financeira: Agência bancária |
| 1 | `amb_atividade_financeira__caixa_eletronico` | `text_53pcbm` | marca | [163.0, 545.0, 176.0, 559.0] | [X] Atividade Financeira: Caixa eletrônico |
| 1 | `amb_atividade_financeira__transporte_de_valor` | `text_56zxjn` | marca | [413.0, 545.0, 426.0, 559.0] | [X] Atividade Financeira: Transporte de valor |
| 1 | `amb_atividade_financeira__casa_loterica` | `text_57fqpm` | marca | [494.0, 545.0, 507.0, 559.0] | [X] Atividade Financeira: Casa lotérica |
| 1 | `amb_ensino__municipal` | `text_60mwoa` | marca | [246.0, 524.0, 259.0, 538.0] | [X] Ensino: Municipal |
| 1 | `amb_ensino__particular` | `text_61xrjx` | marca | [329.0, 524.0, 342.0, 538.0] | [X] Ensino: Particular |
| 1 | `amb_ensino__federal` | `text_58ftji` | marca | [81.0, 523.0, 94.0, 537.0] | [X] Ensino: Federal |
| 1 | `amb_ensino__estadual` | `text_59kyyc` | marca | [163.0, 523.0, 176.0, 537.0] | [X] Ensino: Estadual |
| 1 | `amb_saude__hospital` | `text_65licj` | marca | [329.0, 503.0, 342.0, 517.0] | [X] Saude: Hospital |
| 1 | `amb_saude__posto_de_saude` | `text_66aqvq` | marca | [413.0, 503.0, 426.0, 517.0] | [X] Saude: Posto de saúde |
| 1 | `amb_saude__clinica` | `text_62vxsp` | marca | [82.0, 502.0, 95.0, 516.0] | [X] Saude: Clínica |
| 1 | `amb_saude__consultorio` | `text_63bvfd` | marca | [163.0, 502.0, 176.0, 516.0] | [X] Saude: Consultório |
| 1 | `amb_saude__farmacia` | `text_64jmmf` | marca | [246.0, 502.0, 259.0, 516.0] | [X] Saude: Farmácia |
| 1 | `amb_posto_combustivel__posto_com_loja_de_conveniencia` | `text_67itla` | marca | [82.0, 480.0, 95.0, 494.0] | [X] Posto Combustivel: Posto com loja de conveniência |
| 1 | `amb_posto_combustivel__posto_sem_loja_de_conveniencia` | `text_68vdob` | marca | [246.0, 480.0, 259.0, 494.0] | [X] Posto Combustivel: Posto sem loja de conveniência |
| 1 | `amb_associacao__clube_desportivo` | `text_69fewz` | marca | [82.0, 462.0, 95.0, 476.0] | [X] Associacao: Clube desportivo |
| 1 | `amb_associacao__clube_social` | `text_70chdq` | marca | [163.0, 462.0, 176.0, 476.0] | [X] Associacao: Clube social |
| 1 | `amb_associacao__conselhos` | `text_71uzmi` | marca | [246.0, 462.0, 259.0, 476.0] | [X] Associacao: Conselhos |
| 1 | `amb_associacao__de_bairro` | `text_72nli` | marca | [329.0, 462.0, 342.0, 476.0] | [X] Associacao: De bairro |
| 1 | `amb_associacao__filantropica` | `text_73afhi` | marca | [413.0, 462.0, 426.0, 476.0] | [X] Associacao: Filantrópica |
| 1 | `amb_associacao__politica` | `text_74lmbr` | marca | [494.0, 462.0, 507.0, 476.0] | [X] Associacao: Política |
| 1 | `amb_associacao__cooperativa` | `text_76dple` | marca | [163.0, 450.0, 176.0, 464.0] | [X] Associacao: Cooperativa |
| 1 | `amb_associacao__religiosa_igreja_templo` | `text_77cabf` | marca | [246.0, 450.0, 259.0, 464.0] | [X] Associacao: Religiosa (igreja/templo) |
| 1 | `amb_associacao__sindicato` | `text_75njmj` | marca | [82.0, 449.0, 95.0, 463.0] | [X] Associacao: Sindicato |
| 1 | `amb_transporte__terminal_rodoviario` | `text_81sokx` | marca | [330.0, 436.0, 343.0, 450.0] | [X] Transporte: Terminal rodoviário |
| 1 | `amb_transporte__porto` | `text_79cdwt` | marca | [163.0, 435.0, 176.0, 449.0] | [X] Transporte: Porto |
| 1 | `amb_transporte__de_carga` | `text_85bzcn` | marca | [494.0, 435.0, 507.0, 449.0] | [X] Transporte: De carga |
| 1 | `amb_transporte__aeroporto` | `text_78xqdq` | marca | [82.0, 434.0, 95.0, 448.0] | [X] Transporte: Aeroporto |
| 1 | `amb_transporte__terminal_urbano` | `text_80ooiz` | marca | [246.0, 434.0, 259.0, 448.0] | [X] Transporte: Terminal urbano |
| 1 | `amb_transporte__terminal_ferroviario` | `text_83cxwy` | marca | [413.0, 434.0, 426.0, 448.0] | [X] Transporte: Terminal ferroviário |
| 1 | `amb_transporte__ponto_de_onibus` | `text_86mkmv` | marca | [81.0, 422.0, 94.0, 436.0] | [X] Transporte: Ponto de ônibus |
| 1 | `amb_transporte__ponto_de_taxi` | `text_87fudu` | marca | [163.0, 422.0, 176.0, 436.0] | [X] Transporte: Ponto de táxi |
| 1 | `amb_transporte__onibus` | `text_88grxu` | marca | [246.0, 422.0, 259.0, 436.0] | [X] Transporte: Ônibus |
| 1 | `amb_transporte__taxi` | `text_82untg` | marca | [330.0, 422.0, 343.0, 436.0] | [X] Transporte: Táxi |
| 1 | `amb_transporte__maritimo_fluvial` | `text_84flel` | marca | [413.0, 422.0, 426.0, 436.0] | [X] Transporte: Marítimo/fluvial |
| 1 | `amb_veiculo__em_transito` | `text_89qquc` | marca | [82.0, 404.0, 95.0, 418.0] | [X] Veiculo: Em trânsito |
| 1 | `amb_veiculo__estacionamento_pago` | `text_90etnv` | marca | [163.0, 404.0, 176.0, 418.0] | [X] Veiculo: Estacionamento pago |
| 1 | `amb_veiculo__estacionamento_outros` | `text_91oddz` | marca | [246.0, 404.0, 259.0, 418.0] | [X] Veiculo: Estacionamento outros |
| 1 | `amb_veiculo__residencia` | `text_92beir` | marca | [330.0, 404.0, 343.0, 418.0] | [X] Veiculo: Residência |
| 1 | `amb_residencia__casa` | `text_93mvye` | marca | [82.0, 385.0, 95.0, 399.0] | [X] Residencia: Casa |
| 1 | `amb_residencia__condominio_de_residencias` | `text_95adhz` | marca | [163.0, 385.0, 176.0, 399.0] | [X] Residencia: Condomínio de residências |
| 1 | `amb_residencia_qualificacao__abandonada` | `text_98vppk` | marca | [413.0, 385.0, 426.0, 399.0] | [X] Residencia Qualificacao: Abandonada |
| 1 | `amb_residencia_qualificacao__sem_morador` | `text_100trtk` | marca | [494.0, 385.0, 507.0, 399.0] | [X] Residencia Qualificacao: Sem morador |
| 1 | `amb_residencia__condominio_de_apartamentos` | `text_96xjlf` | marca | [163.0, 373.0, 176.0, 387.0] | [X] Residencia: Condomínio de apartamentos |
| 1 | `amb_residencia__apartamento` | `text_94wcao` | marca | [82.0, 372.0, 95.0, 386.0] | [X] Residencia: Apartamento |
| 1 | `amb_residencia_qualificacao__morador_presente` | `text_97hfko` | marca | [329.0, 372.0, 342.0, 386.0] | [X] Residencia Qualificacao: Morador presente |
| 1 | `amb_residencia_qualificacao__morador_ausente` | `text_99zwto` | marca | [413.0, 372.0, 426.0, 386.0] | [X] Residencia Qualificacao: Morador ausente |
| 1 | `amb_residencia_qualificacao__em_construcao` | `text_101sdqf` | marca | [494.0, 372.0, 507.0, 386.0] | [X] Residencia Qualificacao: Em construção |
| 1 | `amb_mercado__mercearia` | `text_102pmbp` | marca | [82.0, 355.0, 95.0, 369.0] | [X] Mercado: Mercearia |
| 1 | `amb_mercado__supermercado` | `text_103vflz` | marca | [163.0, 355.0, 176.0, 369.0] | [X] Mercado: Supermercado |
| 1 | `amb_mercado__feira` | `text_104opml` | marca | [246.0, 354.0, 259.0, 368.0] | [X] Mercado: Feira |
| 1 | `amb_mercado__atacado` | `text_106ibiv` | marca | [413.0, 354.0, 426.0, 368.0] | [X] Mercado: Atacado |
| 1 | `amb_mercado__panificadora` | `text_107labe` | marca | [494.0, 354.0, 507.0, 368.0] | [X] Mercado: Panificadora |
| 1 | `amb_mercado__ambulante` | `text_105ofqa` | marca | [329.0, 353.0, 342.0, 367.0] | [X] Mercado: Ambulante |
| 1 | `amb_alimentacao_diversao__danceteria` | `text_118qdzd` | marca | [413.0, 336.0, 426.0, 350.0] | [X] Alimentacao Diversao: Danceteria |
| 1 | `amb_alimentacao_diversao__lanchonete` | `text_120dcou` | marca | [494.0, 336.0, 507.0, 350.0] | [X] Alimentacao Diversao: Lanchonete |
| 1 | `amb_alimentacao_diversao__bar` | `text_108obnk` | marca | [82.0, 335.0, 95.0, 349.0] | [X] Alimentacao Diversao: Bar |
| 1 | `amb_alimentacao_diversao__casa_show` | `text_114lvdk` | marca | [245.0, 335.0, 258.0, 349.0] | [X] Alimentacao Diversao: Casa show |
| 1 | `amb_alimentacao_diversao__circo` | `text_115giyk` | marca | [330.0, 335.0, 343.0, 349.0] | [X] Alimentacao Diversao: Circo |
| 1 | `amb_alimentacao_diversao__boliche` | `text_113ggw` | marca | [162.0, 334.0, 175.0, 348.0] | [X] Alimentacao Diversao: Boliche |
| 1 | `amb_alimentacao_diversao__restaurante` | `text_111mrwc` | marca | [162.0, 322.0, 175.0, 336.0] | [X] Alimentacao Diversao: Restaurante |
| 1 | `amb_alimentacao_diversao__teatro` | `text_117cbsk` | marca | [329.0, 322.0, 342.0, 336.0] | [X] Alimentacao Diversao: Teatro |
| 1 | `amb_alimentacao_diversao__lan_house` | `text_119avhl` | marca | [413.0, 322.0, 426.0, 336.0] | [X] Alimentacao Diversao: Lan house |
| 1 | `amb_alimentacao_diversao__parque_diversao` | `text_109tfig` | marca | [82.0, 321.0, 95.0, 335.0] | [X] Alimentacao Diversao: Parque diversão |
| 1 | `amb_alimentacao_diversao__sorveteria` | `text_116ecct` | marca | [246.0, 321.0, 259.0, 335.0] | [X] Alimentacao Diversao: Sorveteria |
| 1 | `amb_alimentacao_diversao__cinema` | `text_121hxlq` | marca | [495.0, 321.0, 508.0, 335.0] | [X] Alimentacao Diversao: Cinema |
| 1 | `amb_alimentacao_diversao__centro_de_eventos` | `text_112srfg` | marca | [162.0, 309.0, 175.0, 323.0] | [X] Alimentacao Diversao: Centro de eventos |
| 1 | `amb_alimentacao_diversao__praca_desportiva` | `text_110org` | marca | [82.0, 308.0, 95.0, 322.0] | [X] Alimentacao Diversao: Praça desportiva |
| 1 | `amb_comercio__armas_municao` | `text_122jhgs` | marca | [82.0, 295.0, 95.0, 309.0] | [X] Comercio: Armas munição |
| 1 | `amb_comercio__autopecas` | `text_123rzdn` | marca | [163.0, 295.0, 176.0, 309.0] | [X] Comercio: Autopeças |
| 1 | `amb_comercio__banca_revista` | `text_127gtqp` | marca | [246.0, 295.0, 259.0, 309.0] | [X] Comercio: Banca revista |
| 1 | `amb_comercio__bebidas` | `text_128rird` | marca | [330.0, 295.0, 343.0, 309.0] | [X] Comercio: Bebidas |
| 1 | `amb_comercio__calcados` | `text_129uzai` | marca | [412.0, 295.0, 425.0, 309.0] | [X] Comercio: Calçados |
| 1 | `amb_comercio__eletroeletronicos` | `text_130fnhj` | marca | [494.0, 295.0, 507.0, 309.0] | [X] Comercio: Eletroeletrônicos |
| 1 | `amb_comercio__informatica` | `text_131vrnv` | marca | [82.0, 282.0, 95.0, 296.0] | [X] Comercio: Informática |
| 1 | `amb_comercio__mat_construcao` | `text_135nepc` | marca | [246.0, 282.0, 259.0, 296.0] | [X] Comercio: Mat. construção |
| 1 | `amb_comercio__esportivo` | `text_137qqwq` | marca | [330.0, 282.0, 343.0, 296.0] | [X] Comercio: Esportivo |
| 1 | `amb_comercio__veiculos` | `text_141edxn` | marca | [495.0, 282.0, 508.0, 296.0] | [X] Comercio: Veículos |
| 1 | `amb_comercio__joias_relogios` | `text_133ntnu` | marca | [163.0, 281.0, 176.0, 295.0] | [X] Comercio: Jóias/relógios |
| 1 | `amb_comercio__papelaria` | `text_139eiqj` | marca | [412.0, 281.0, 425.0, 295.0] | [X] Comercio: Papelaria |
| 1 | `amb_comercio__vestuario` | `text_132stpu` | marca | [82.0, 269.0, 95.0, 283.0] | [X] Comercio: Vestuário |
| 1 | `amb_comercio__video_locadora` | `text_134comg` | marca | [163.0, 269.0, 176.0, 283.0] | [X] Comercio: Vídeo locadora |
| 1 | `amb_comercio__moveis` | `text_136erry` | marca | [246.0, 269.0, 259.0, 283.0] | [X] Comercio: Móveis |
| 1 | `amb_comercio__distribuidor_de_gas` | `text_138wteo` | marca | [330.0, 269.0, 343.0, 283.0] | [X] Comercio: Distribuidor de gás |
| 1 | `amb_comercio__shopping_center` | `text_140ovpf` | marca | [412.0, 269.0, 425.0, 283.0] | [X] Comercio: Shopping center |
| 1 | `amb_industria__alimenticia` | `text_142epgp` | marca | [82.0, 253.0, 95.0, 267.0] | [X] Industria: Alimentícia |
| 1 | `amb_industria__ceramica` | `text_144jq` | marca | [163.0, 253.0, 176.0, 267.0] | [X] Industria: Cerâmica |
| 1 | `amb_industria__madeireira` | `text_146hche` | marca | [247.0, 253.0, 260.0, 267.0] | [X] Industria: Madeireira |
| 1 | `amb_industria__metalurgia` | `text_148eur` | marca | [329.0, 253.0, 342.0, 267.0] | [X] Industria: Metalurgia |
| 1 | `amb_industria__siderurgica` | `text_150rjr` | marca | [413.0, 253.0, 426.0, 267.0] | [X] Industria: Siderúrgica |
| 1 | `amb_industria__moveleira` | `text_151flpq` | marca | [495.0, 253.0, 508.0, 267.0] | [X] Industria: Moveleira |
| 1 | `amb_industria__papel_celulose` | `text_143aewc` | marca | [82.0, 240.0, 95.0, 254.0] | [X] Industria: Papel/celulose |
| 1 | `amb_industria__petroquimica_quimica` | `text_145diva` | marca | [163.0, 240.0, 176.0, 254.0] | [X] Industria: Petroquímica/química |
| 1 | `amb_industria__agroindustria` | `text_147pdvb` | marca | [246.0, 240.0, 259.0, 254.0] | [X] Industria: Agroindústria |
| 1 | `amb_industria__textil` | `text_149otbw` | marca | [329.0, 240.0, 342.0, 254.0] | [X] Industria: Têxtil |
| 1 | `amb_hospedagem__motel` | `text_153zhsh` | marca | [163.0, 222.0, 176.0, 236.0] | [X] Hospedagem: Motel |
| 1 | `amb_hospedagem__pensao` | `text_154gjnu` | marca | [246.0, 222.0, 259.0, 236.0] | [X] Hospedagem: Pensão |
| 1 | `amb_hospedagem__pousada` | `text_155gnfp` | marca | [330.0, 222.0, 343.0, 236.0] | [X] Hospedagem: Pousada |
| 1 | `amb_hospedagem__albergue` | `text_156gasb` | marca | [413.0, 222.0, 426.0, 236.0] | [X] Hospedagem: Albergue |
| 1 | `amb_hospedagem__camping` | `text_157nzrm` | marca | [495.0, 222.0, 508.0, 236.0] | [X] Hospedagem: Camping |
| 1 | `amb_hospedagem__hotel` | `text_152evuq` | marca | [82.0, 221.0, 95.0, 235.0] | [X] Hospedagem: Hotel |
| 1 | `amb_prestacao_servicos__construtora` | `text_158amyc` | marca | [494.0, 201.0, 507.0, 215.0] | [X] Prestacao Servicos: Construtora |
| 1 | `amb_prestacao_servicos__escritorio` | `text_159ibrr` | marca | [82.0, 200.0, 95.0, 214.0] | [X] Prestacao Servicos: Escritório |
| 1 | `amb_prestacao_servicos__estacionamento` | `text_161iyyk` | marca | [163.0, 200.0, 176.0, 214.0] | [X] Prestacao Servicos: Estacionamento |
| 1 | `amb_prestacao_servicos__consertos_reparos` | `text_162gmbj` | marca | [246.0, 200.0, 259.0, 214.0] | [X] Prestacao Servicos: Consertos/reparos |
| 1 | `amb_prestacao_servicos__transportadora` | `text_163mcjc` | marca | [330.0, 200.0, 343.0, 214.0] | [X] Prestacao Servicos: Transportadora |
| 1 | `amb_prestacao_servicos__vigilancia_limpeza` | `text_164sqnj` | marca | [413.0, 200.0, 426.0, 214.0] | [X] Prestacao Servicos: Vigilância/limpeza |
| 1 | `amb_prestacao_servicos__agencia_dos_correios` | `text_160qpvl` | marca | [82.0, 188.0, 95.0, 202.0] | [X] Prestacao Servicos: Agência dos correios |
| 1 | `amb_orgao_publico__estadual` | `text_167pefd` | marca | [246.0, 170.0, 259.0, 184.0] | [X] Orgao Publico: Estadual |
| 1 | `amb_orgao_publico__internacional` | `text_165gewk` | marca | [82.0, 169.0, 95.0, 183.0] | [X] Orgao Publico: Internacional |
| 1 | `amb_orgao_publico__federal` | `text_166pzun` | marca | [163.0, 169.0, 176.0, 183.0] | [X] Orgao Publico: Federal |
| 1 | `amb_orgao_publico__municipal` | `text_168ehlj` | marca | [329.0, 169.0, 342.0, 183.0] | [X] Orgao Publico: Municipal |
| 1 | `amb_outros_ambientes__terreno_baldio` | `text_170rrkf` | marca | [163.0, 148.0, 176.0, 162.0] | [X] Outros Ambientes: Terreno baldio |
| 1 | `amb_outros_ambientes__area_de_mata` | `text_171mjs` | marca | [246.0, 148.0, 259.0, 162.0] | [X] Outros Ambientes: Área de mata |
| 1 | `amb_outros_ambientes__praca_parque` | `text_169lydh` | marca | [82.0, 147.0, 95.0, 161.0] | [X] Outros Ambientes: Praça/parque |
| 1 | `amb_outros_ambientes__praia` | `text_172pgtb` | marca | [329.0, 147.0, 342.0, 161.0] | [X] Outros Ambientes: Praia |
| 1 | `amb_outros_ambientes__lagoa` | `text_173ooqp` | marca | [413.0, 147.0, 426.0, 161.0] | [X] Outros Ambientes: Lagoa |
| 1 | `amb_horario_funcionamento__diurno` | `text_174ttju` | marca | [83.0, 126.0, 96.0, 140.0] | [X] Horario Funcionamento: Diurno |
| 1 | `amb_horario_funcionamento__noturno` | `text_175kibb` | marca | [163.0, 126.0, 176.0, 140.0] | [X] Horario Funcionamento: Noturno |
| 1 | `amb_horario_funcionamento__diurno_noturno` | `text_176pfpu` | marca | [246.0, 126.0, 259.0, 140.0] | [X] Horario Funcionamento: Diurno/noturno |
| 1 | `amb_horario_funcionamento__24_horas` | `text_177rorc` | marca | [330.0, 126.0, 343.0, 140.0] | [X] Horario Funcionamento: 24 horas |
| 1 | `amb_eventos__competicao_desportiva` | `text_178mblr` | marca | [82.0, 108.0, 95.0, 122.0] | [X] Eventos: Competição desportiva |
| 1 | `amb_eventos__competicao_motorizada` | `text_179fxsu` | marca | [163.0, 108.0, 176.0, 122.0] | [X] Eventos: Competição motorizada |
| 1 | `amb_eventos__comicio` | `text_182hexm` | marca | [330.0, 108.0, 343.0, 122.0] | [X] Eventos: Comício |
| 1 | `amb_eventos__beneficente` | `text_180zwsu` | marca | [246.0, 107.0, 259.0, 121.0] | [X] Eventos: Beneficente |
| 1 | `amb_eventos__exposicao_feira` | `text_184vqbn` | marca | [414.0, 107.0, 427.0, 121.0] | [X] Eventos: Exposição feira |
| 1 | `amb_eventos__festa` | `text_185zgci` | marca | [542.0, 107.0, 555.0, 121.0] | [X] Eventos: Festa |
| 1 | `amb_eventos__futebol` | `text_188dnja` | marca | [495.0, 106.0, 508.0, 120.0] | [X] Eventos: Futebol |
| 1 | `amb_eventos__invasao` | `text_191qaja` | marca | [163.0, 95.0, 176.0, 109.0] | [X] Eventos: Invasão |
| 1 | `amb_eventos__passeata_manifestacao` | `text_183jgzq` | marca | [330.0, 95.0, 343.0, 109.0] | [X] Eventos: Passeata/manifestação |
| 1 | `amb_eventos__greve` | `text_190amsy` | marca | [82.0, 94.0, 95.0, 108.0] | [X] Eventos: Greve |
| 1 | `amb_eventos__leilao` | `text_181skqu` | marca | [246.0, 94.0, 259.0, 108.0] | [X] Eventos: Leilão |
| 1 | `amb_eventos__rodeio` | `text_189olnt` | marca | [494.0, 94.0, 507.0, 108.0] | [X] Eventos: Rodeio |
| 1 | `amb_eventos__show` | `text_186vkkj` | marca | [542.0, 94.0, 555.0, 108.0] | [X] Eventos: Show |
| 1 | `amb_eventos__religioso` | `text_187tlpv` | marca | [414.0, 93.0, 427.0, 107.0] | [X] Eventos: Religioso |
| 1 | `amb_circulacao_veiculos__pouco` | `text_192faso` | marca | [82.0, 77.0, 95.0, 91.0] | [X] Circulacao Veiculos: Pouco |
| 1 | `amb_circulacao_veiculos__intenso` | `text_194mafm` | marca | [246.0, 77.0, 259.0, 91.0] | [X] Circulacao Veiculos: Intenso |
| 1 | `amb_circulacao_veiculos__normal` | `text_193ryui` | marca | [163.0, 76.0, 176.0, 90.0] | [X] Circulacao Veiculos: Normal |
| 1 | `amb_circulacao_pessoas__pouca` | `text_195gfkv` | marca | [83.0, 56.0, 96.0, 70.0] | [X] Circulacao Pessoas: Pouca |
| 1 | `amb_circulacao_pessoas__normal` | `text_196uivs` | marca | [163.0, 55.0, 176.0, 69.0] | [X] Circulacao Pessoas: Normal |
| 1 | `amb_circulacao_pessoas__intensa` | `text_197hfgx` | marca | [247.0, 55.0, 260.0, 69.0] | [X] Circulacao Pessoas: Intensa |
| 1 | `amb_iluminacao_artificial__sim_boa_visibilidade` | `text_200ydjh` | marca | [246.0, 34.0, 259.0, 48.0] | [X] Iluminacao Artificial: Sim - boa visibilidade |
| 1 | `amb_iluminacao_artificial__nao` | `text_198xdgb` | marca | [82.0, 33.0, 95.0, 47.0] | [X] Iluminacao Artificial: Não |
| 1 | `amb_iluminacao_artificial__sim_pouca_visibilidade` | `text_199eeiq` | marca | [163.0, 33.0, 176.0, 47.0] | [X] Iluminacao Artificial: Sim - pouca visibilidade |
| 1 | `amb_desordem__lixo_nas_ruas` | `text_202lrvc` | marca | [163.0, 16.0, 176.0, 30.0] | [X] Desordem: Lixo nas ruas |
| 1 | `amb_desordem__pichacao` | `text_201elpu` | marca | [82.0, 15.0, 95.0, 29.0] | [X] Desordem: Pichação |
| 1 | `amb_desordem__terrenos_baldios` | `text_203imxb` | marca | [246.0, 15.0, 259.0, 29.0] | [X] Desordem: Terrenos baldios |
| 1 | `amb_desordem__ma_conservacao_vias` | `text_205jyew` | marca | [330.0, 15.0, 343.0, 29.0] | [X] Desordem: Má conservação vias |
| 1 | `amb_desordem__ma_conservacao_residencias` | `text_206rwff` | marca | [414.0, 15.0, 427.0, 29.0] | [X] Desordem: Má conservação residências |
| 1 | `amb_desordem__utilizacao_irregular_de_espaco_publico` | `text_204gjyz` | marca | [246.0, 3.0, 259.0, 17.0] | [X] Desordem: Utilização irregular de espaço público |
| 1 | `amb_desordem__construcoes_ilegais` | `text_208bmtd` | marca | [83.0, 2.0, 96.0, 16.0] | [X] Desordem: Construções ilegais |
| 1 | `amb_desordem__ambulantes_ilegais` | `text_209gieh` | marca | [163.0, 2.0, 176.0, 16.0] | [X] Desordem: Ambulantes ilegais |
| 1 | `amb_desordem__consumo_de_bebidas_alcoolicas` | `text_207frvx` | marca | [414.0, 2.0, 427.0, 16.0] | [X] Desordem: Consumo de bebidas alcoólicas |
| 2 | `meios__arma_de_fogo` | `text_210lhnv` | marca | [23.0, 784.0, 36.0, 798.0] | [X] Meios: Arma de fogo |
| 2 | `meios__alavanca_de_madeira` | `text_222hpym` | marca | [303.0, 784.0, 316.0, 798.0] | [X] Meios: Alavanca de madeira |
| 2 | `meios__arma_branca` | `text_214tbic` | marca | [114.0, 783.0, 127.0, 797.0] | [X] Meios: Arma branca |
| 2 | `meios__arma_de_brinquedo` | `text_218gvge` | marca | [209.0, 783.0, 222.0, 797.0] | [X] Meios: Arma de brinquedo |
| 2 | `meios__alavanca_de_metal` | `text_226lfjx` | marca | [398.0, 783.0, 411.0, 797.0] | [X] Meios: Alavanca de metal |
| 2 | `meios__alicate` | `text_230utfu` | marca | [490.0, 783.0, 503.0, 797.0] | [X] Meios: Alicate |
| 2 | `meios__chave_falsa_micha` | `text_211izhv` | marca | [23.0, 770.0, 36.0, 784.0] | [X] Meios: Chave falsa (micha) |
| 2 | `meios__explosivo` | `text_215ygja` | marca | [114.0, 770.0, 127.0, 784.0] | [X] Meios: Explosivo |
| 2 | `meios__furadeira` | `text_219dcux` | marca | [209.0, 770.0, 222.0, 784.0] | [X] Meios: Furadeira |
| 2 | `meios__macarico` | `text_223nkbt` | marca | [303.0, 770.0, 316.0, 784.0] | [X] Meios: Maçarico |
| 2 | `meios__marreta_martelo` | `text_227dfev` | marca | [398.0, 770.0, 411.0, 784.0] | [X] Meios: Marreta/martelo |
| 2 | `meios__facao` | `text_231nzk` | marca | [491.0, 769.0, 504.0, 783.0] | [X] Meios: Facão |
| 2 | `meios__chave_de_fenda` | `text_212atl` | marca | [23.0, 757.0, 36.0, 771.0] | [X] Meios: Chave de fenda |
| 2 | `meios__foice` | `text_216krjn` | marca | [114.0, 757.0, 127.0, 771.0] | [X] Meios: Foice |
| 2 | `meios__serra` | `text_220cdvv` | marca | [210.0, 756.0, 223.0, 770.0] | [X] Meios: Serra |
| 2 | `meios__picareta` | `text_224fzo` | marca | [303.0, 756.0, 316.0, 770.0] | [X] Meios: Picareta |
| 2 | `meios__motoserra` | `text_228ivlz` | marca | [399.0, 756.0, 412.0, 770.0] | [X] Meios: Motoserra |
| 2 | `meios__machado` | `text_232xdix` | marca | [490.0, 756.0, 503.0, 770.0] | [X] Meios: Machado |
| 2 | `meios__taco_madeira` | `text_213iqpr` | marca | [23.0, 744.0, 36.0, 758.0] | [X] Meios: Taco madeira |
| 2 | `meios__forca_fisica` | `text_217fhim` | marca | [115.0, 743.0, 128.0, 757.0] | [X] Meios: Força física |
| 2 | `meios__outros` | `text_229rthl` | marca | [398.0, 743.0, 411.0, 757.0] | [X] Meios: Outros |
| 2 | `meios__automovel` | `text_221ibaw` | marca | [210.0, 742.0, 223.0, 756.0] | [X] Meios: Automóvel |
| 2 | `meios__motocicleta` | `text_225uuzm` | marca | [303.0, 742.0, 316.0, 756.0] | [X] Meios: Motocicleta |
| 2 | `meios_outros_texto` | `text_237tkmm` | texto | [436.0, 743.0, 576.0, 752.0] | 4-Meios: outros (especificação) |
| 2 | `relato` | `textarea_32crwj` | texto multilinha | [12.0, 457.0, 579.0, 726.0] | 5-Relato policial do ocorrido (multilinha) |
| 2 | `objeto_1` | `text_33syqc` | texto | [16.0, 385.0, 576.0, 400.0] | 6-Objetos: linha 1 |
| 2 | `objeto_2` | `text_34qhpa` | texto | [15.0, 365.0, 576.0, 380.0] | 6-Objetos: linha 2 |
| 2 | `objeto_3` | `text_35cxle` | texto | [16.0, 344.0, 576.0, 359.0] | 6-Objetos: linha 3 |
| 2 | `objeto_4` | `text_36dkha` | texto | [16.0, 324.0, 576.0, 339.0] | 6-Objetos: linha 4 |
| 2 | `objeto_5` | `text_37wajn` | texto | [15.0, 303.0, 576.0, 318.0] | 6-Objetos: linha 5 |
| 2 | `objeto_6` | `text_38hbqh` | texto | [15.0, 283.0, 576.0, 298.0] | 6-Objetos: linha 6 |
| 2 | `objetos_destino` | `*adicionado*` | texto | [112, 266.0, 577, 284.0] | 6-Destino do(s) objeto(s) - espaço impresso sem campo no original |
| 2 | `doc__termo_manifestacao_ofendido` | `text_233cnt` | marca | [73.0, 229.0, 86.0, 243.0] | [X] Termo de manifestação do ofendido |
| 2 | `doc__termo_compromisso_comparecimento` | `text_236inkx` | marca | [311.0, 229.0, 324.0, 243.0] | [X] Termo de compromisso de comparecimento |
| 2 | `doc__termo_apreensao_deposito` | `text_234wkav` | marca | [73.0, 216.0, 86.0, 230.0] | [X] Termo de apreensão/depósito |
| 2 | `doc__requisicao_corpo_delito` | `text_237rsst` | marca | [311.0, 215.0, 324.0, 229.0] | [X] Requisição para exame de corpo de delito direto |
| 2 | `doc__requisicao_laudo_droga` | `text_235xyjb` | marca | [73.0, 201.0, 86.0, 215.0] | [X] Requisição de laudo de constatação de droga |
| 2 | `fotografado__sim` | `text_238eauj` | marca | [161.0, 176.0, 174.0, 190.0] | Fotografado? [X] SIM |
| 2 | `fotografado__nao` | `text_241gsix` | marca | [215.0, 176.0, 228.0, 190.0] | Fotografado? [X] NÃO |
| 2 | `ic_no_local__sim` | `text_244dkxb` | marca | [493.0, 174.0, 506.0, 188.0] | Instituto de Criminalística esteve no local? [X] SIM |
| 2 | `ic_no_local__nao` | `text_245bkqo` | marca | [531.0, 173.0, 544.0, 187.0] | Instituto de Criminalística esteve no local? [X] NÃO |
| 2 | `pc_acionada__sim` | `text_239qive` | marca | [161.0, 164.0, 174.0, 178.0] | A Polícia Civil foi acionada? [X] SIM |
| 2 | `pc_acionada__nao` | `text_242nwlk` | marca | [215.0, 164.0, 228.0, 178.0] | A Polícia Civil foi acionada? [X] NÃO |
| 2 | `ic_responsavel` | `*adicionado*` | texto multilinha | [400, 155.0, 578, 178.0] | 7-Nome e cargo do responsável (Criminalística) - espaço impresso sem campo no original |
| 2 | `pc_no_local__sim` | `text_240paea` | marca | [162.0, 153.0, 175.0, 167.0] | Polícia Civil esteve no local? [X] SIM |
| 2 | `pc_no_local__nao` | `text_243cmbk` | marca | [215.0, 152.0, 228.0, 166.0] | Polícia Civil esteve no local? [X] NÃO |
| 2 | `disparo__sim` | `text_246iegb` | marca | [359.0, 135.0, 372.0, 149.0] | Houve disparo de arma de fogo por PM? [X] SIM |
| 2 | `disparo__nao` | `text_247mhwa` | marca | [390.0, 134.0, 403.0, 148.0] | Houve disparo de arma de fogo por PM? [X] NÃO |
| 2 | `disparo_quantidade` | `text_235gkxj` | texto | [541.0, 133.0, 575.0, 147.0] | Quantidade de disparos |
| 2 | `outras_providencias_1` | `text_42xaze` | texto | [19.0, 93.0, 578.0, 108.0] | Outras providências (linha 1) |
| 2 | `outras_providencias_2` | `text_43ktka` | texto | [18.0, 72.0, 577.0, 87.0] | Outras providências (linha 2) |
| 2 | `atendente_1` | `text_39rqrw` | texto | [15.0, 27.0, 464.0, 42.0] | 8-Atendente: posto/grad., matrícula e nome (linha 1) |
| 2 | `atendente_2` | `text_40losi` | texto | [15.0, 7.0, 461.0, 22.0] | 8-Atendente: posto/grad., matrícula e nome (linha 2) |

## Dos Envolvidos e dos Veículos (`templates/envolvidos-veiculos.pdf`)

| pág. | nome | original | tipo | retângulo [x0, y0, x1, y1] | rótulo |
|---|---|---|---|---|---|
| 1 | `unidade` | `text_1colr` | texto | [293.0, 777.0, 433.0, 790.0] | Unidade policial militar |
| 1 | `ciops` | `text_2daoe` | texto | [443.0, 777.0, 583.0, 790.0] | Nº CIOPS/COPOM (número do BO) |
| 1 | `participacao__comunicante` | `text_10blim` | marca | [107.0, 742.0, 120.0, 756.0] | [X] Comunicante |
| 1 | `participacao__ofendido` | `text_12yhov` | marca | [216.0, 742.0, 229.0, 756.0] | [X] Ofendido |
| 1 | `participacao__a_apurar` | `text_14hsww` | marca | [298.0, 742.0, 311.0, 756.0] | [X] A apurar |
| 1 | `acidente__condutor_motorista` | `text_15mojk` | marca | [423.0, 742.0, 436.0, 756.0] | [X] Acidente: condutor/motorista |
| 1 | `acidente__passageiro` | `text_17pgwh` | marca | [532.0, 742.0, 545.0, 756.0] | [X] Acidente: passageiro |
| 1 | `id_e_outro_numero` | `text_3fext` | texto | [10.0, 729.0, 24.0, 745.0] | E-__ : número do envolvido |
| 1 | `participacao__autor_do_fato` | `text_11nowr` | marca | [107.0, 730.0, 120.0, 744.0] | [X] Autor do fato |
| 1 | `acidente__pedestre` | `text_16rwvj` | marca | [423.0, 730.0, 436.0, 744.0] | [X] Acidente: pedestre |
| 1 | `participacao__testemunha` | `text_13lshk` | marca | [216.0, 729.0, 229.0, 743.0] | [X] Testemunha |
| 1 | `acidente__vitima` | `text_18ocbn` | marca | [532.0, 729.0, 545.0, 743.0] | [X] Acidente: vítima |
| 1 | `nome` | `text_19rkpn` | texto | [34.0, 707.0, 575.0, 720.0] | Nome |
| 1 | `id__e_outro` | `text_4gcam` | marca | [10.0, 698.0, 23.0, 712.0] | [X] E-__ (número acima de 5) |
| 1 | `nome_mae` | `text_20konz` | texto | [34.0, 683.0, 288.0, 696.0] | Nome da mãe |
| 1 | `nome_pai` | `text_21j` | texto | [297.0, 683.0, 582.0, 696.0] | Nome do pai |
| 1 | `sexo_outros_texto` | `text_196fmec` | texto | [197.0, 664.0, 287.0, 677.0] | Sexo outros (especificação) |
| 1 | `sexo__f` | `text_24rjag` | marca | [132.0, 661.0, 145.0, 675.0] | [X] Sexo F |
| 1 | `sexo__m` | `text_23xzxy` | marca | [112.0, 660.0, 125.0, 674.0] | [X] Sexo M |
| 1 | `sexo__outros` | `text_25vwce` | marca | [152.0, 660.0, 165.0, 674.0] | [X] Sexo outros |
| 1 | `nacionalidade` | `text_27lhfg` | texto | [294.0, 661.0, 382.0, 674.0] | Nacionalidade |
| 1 | `natural_de` | `text_28cz` | texto | [390.0, 661.0, 583.0, 674.0] | Natural de |
| 1 | `nascimento` | `text_22ausj` | texto | [34.0, 660.0, 107.0, 673.0] | Data de nascimento |
| 1 | `id__e5` | `text_5cxam` | marca | [11.0, 648.0, 24.0, 662.0] | [X] E-5 |
| 1 | `profissao` | `text_197mewu` | texto | [36.0, 638.0, 182.0, 651.0] | Profissão |
| 1 | `raca__branca` | `text_30eslf` | marca | [189.0, 637.0, 202.0, 651.0] | [X] Raça/cor branca |
| 1 | `raca__preta` | `text_31pgmm` | marca | [231.0, 637.0, 244.0, 651.0] | [X] Raça/cor preta |
| 1 | `raca__parda` | `text_32yekv` | marca | [268.0, 636.0, 281.0, 650.0] | [X] Raça/cor parda |
| 1 | `raca__indigena` | `text_33ueeo` | marca | [305.0, 636.0, 318.0, 650.0] | [X] Raça/cor indígena |
| 1 | `raca__amarela` | `text_34vsmp` | marca | [351.0, 636.0, 364.0, 650.0] | [X] Raça/cor amarela |
| 1 | `local_trabalho` | `text_35lhhl` | texto | [409.0, 637.0, 583.0, 650.0] | Local de trabalho |
| 1 | `estado_civil__uniao_estavel` | `text_40fnez` | marca | [314.0, 620.0, 327.0, 634.0] | [X] União estável |
| 1 | `estado_civil__nao_informado` | `text_42luth` | marca | [422.0, 620.0, 435.0, 634.0] | [X] Estado civil não informado |
| 1 | `estado_civil__solteiro` | `text_36tygj` | marca | [107.0, 619.0, 120.0, 633.0] | [X] Solteiro |
| 1 | `estado_civil__casado` | `text_38tdnd` | marca | [216.0, 619.0, 229.0, 633.0] | [X] Casado |
| 1 | `estado_civil__divorciado` | `text_37wumy` | marca | [107.0, 608.0, 120.0, 622.0] | [X] Divorciado |
| 1 | `estado_civil__separado` | `text_39fbrj` | marca | [216.0, 608.0, 229.0, 622.0] | [X] Separado |
| 1 | `estado_civil__viuvo` | `text_41raki` | marca | [314.0, 608.0, 327.0, 622.0] | [X] Viúvo |
| 1 | `id__e4` | `text_6vkb` | marca | [11.0, 591.0, 24.0, 605.0] | [X] E-4 |
| 1 | `instrucao__nao_alfabetizado` | `text_43leuy` | marca | [107.0, 587.0, 120.0, 601.0] | [X] Não alfabetizado |
| 1 | `instrucao__semi_alfabetizado` | `text_45auus` | marca | [216.0, 586.0, 229.0, 600.0] | [X] Semi alfabetizado |
| 1 | `instrucao__fundamental` | `text_47fzkw` | marca | [313.0, 585.0, 326.0, 599.0] | [X] Fundamental |
| 1 | `instrucao__medio` | `text_49zuzr` | marca | [421.0, 584.0, 434.0, 598.0] | [X] Médio |
| 1 | `situacao__completo` | `text_51xtox` | marca | [541.0, 584.0, 554.0, 598.0] | [X] Situação: completo |
| 1 | `instrucao__superior` | `text_44dfzd` | marca | [107.0, 574.0, 120.0, 588.0] | [X] Superior |
| 1 | `situacao__incompleto` | `text_50nanc` | marca | [488.0, 574.0, 501.0, 588.0] | [X] Situação: incompleto |
| 1 | `situacao__cursando` | `text_52yqxx` | marca | [542.0, 574.0, 555.0, 588.0] | [X] Situação: cursando |
| 1 | `instrucao__pos_graduado` | `text_46ioka` | marca | [216.0, 573.0, 229.0, 587.0] | [X] Pós-graduado |
| 1 | `instrucao__nao_informado` | `text_48jdrw` | marca | [314.0, 573.0, 327.0, 587.0] | [X] Instrução não informada |
| 1 | `nome_falso` | `text_54oijn` | texto | [298.0, 550.0, 582.0, 563.0] | Nome falso |
| 1 | `alcunha` | `text_198kjco` | texto | [35.0, 549.0, 290.0, 562.0] | Alcunha |
| 1 | `id__e3` | `text_7pini` | marca | [10.0, 537.0, 23.0, 551.0] | [X] E-3 |
| 1 | `cpf` | `text_55fpex` | texto | [30.0, 524.0, 198.0, 537.0] | CPF |
| 1 | `rg` | `text_56onpx` | texto | [205.0, 523.0, 349.0, 536.0] | RG - número |
| 1 | `rg_emissao` | `text_57piql` | texto | [355.0, 523.0, 434.0, 536.0] | RG - data de emissão |
| 1 | `rg_orgao` | `text_58ocvj` | texto | [439.0, 522.0, 538.0, 535.0] | RG - órgão emissor |
| 1 | `rg_uf` | `text_60nlcz` | texto | [546.0, 522.0, 584.0, 535.0] | RG - UF |
| 1 | `nao_habilitado` | `text_64jnrl` | marca | [483.0, 503.0, 496.0, 517.0] | [X] Não habilitado |
| 1 | `cnh_validade` | `text_200sxld` | texto | [186.0, 499.0, 285.0, 512.0] | CNH - data de validade |
| 1 | `cnh` | `text_199pqyg` | texto | [34.0, 498.0, 184.0, 511.0] | CNH - número de registro |
| 1 | `cnh_uf` | `text_63wrf` | texto | [291.0, 498.0, 463.0, 511.0] | CNH - UF/país de expedição |
| 1 | `id__e2` | `text_8wsti` | marca | [10.0, 484.0, 23.0, 498.0] | [X] E-2 |
| 1 | `res_cep` | `text_65wydw` | texto | [32.0, 476.0, 147.0, 489.0] | Endereço residencial - CEP |
| 1 | `res_caixa_postal` | `text_66vu` | texto | [154.0, 476.0, 218.0, 489.0] | Endereço residencial - caixa postal |
| 1 | `res_tipo_logradouro` | `text_67bjws` | texto | [224.0, 475.0, 299.0, 488.0] | Endereço residencial - tipo de logradouro |
| 1 | `res_logradouro` | `text_68uqsz` | texto | [304.0, 475.0, 582.0, 488.0] | Endereço residencial - logradouro |
| 1 | `res_numero` | `text_69bgmf` | texto | [31.0, 453.0, 102.0, 466.0] | Endereço residencial - número |
| 1 | `res_complemento` | `text_70gdkt` | texto | [108.0, 453.0, 270.0, 466.0] | Endereço residencial - complemento |
| 1 | `res_bairro` | `text_71zrdj` | texto | [276.0, 453.0, 438.0, 466.0] | Endereço residencial - bairro |
| 1 | `res_municipio` | `text_72ddqo` | texto | [445.0, 452.0, 584.0, 465.0] | Endereço residencial - município |
| 1 | `id__e1` | `text_9hdwy` | marca | [11.0, 430.0, 24.0, 444.0] | [X] E-1 |
| 1 | `res_estado` | `text_73hzhs` | texto | [32.0, 430.0, 193.0, 443.0] | Endereço residencial - estado |
| 1 | `res_pais` | `text_201wgfe` | texto | [200.0, 429.0, 361.0, 442.0] | Endereço residencial - país |
| 1 | `res_referencia` | `text_75mkva` | texto | [367.0, 429.0, 583.0, 442.0] | Endereço residencial - referência |
| 1 | `res_tel_numero_1` | `text_78tiol` | texto | [164.0, 407.0, 204.0, 420.0] | Endereço residencial - número (antes do hífen) |
| 1 | `res_tel_numero_2` | `text_79fxsy` | texto | [216.0, 407.0, 261.0, 420.0] | Endereço residencial - número (depois do hífen) |
| 1 | `res_tel_ddd` | `text_77ggad` | texto | [138.0, 406.0, 161.0, 419.0] | Endereço residencial - DDD |
| 1 | `res_tel_ramal` | `text_80fdfs` | texto | [265.0, 406.0, 306.0, 419.0] | Endereço residencial - ramal |
| 1 | `res_email` | `text_81baax` | texto | [312.0, 406.0, 583.0, 419.0] | Endereço residencial - e-mail |
| 1 | `res_tel_tipo` | `text_76hzmn` | texto | [32.0, 405.0, 133.0, 418.0] | Endereço residencial - tipo de telefone |
| 1 | `com_cep` | `text_82qppu` | texto | [33.0, 383.0, 148.0, 396.0] | Endereço comercial - CEP |
| 1 | `com_caixa_postal` | `text_83pcs` | texto | [153.0, 383.0, 219.0, 396.0] | Endereço comercial - caixa postal |
| 1 | `com_tipo_logradouro` | `text_84tsuk` | texto | [223.0, 383.0, 298.0, 396.0] | Endereço comercial - tipo de logradouro |
| 1 | `com_logradouro` | `text_85mtsr` | texto | [304.0, 383.0, 583.0, 396.0] | Endereço comercial - logradouro |
| 1 | `com_numero` | `text_202qqmb` | texto | [30.0, 360.0, 102.0, 373.0] | Endereço comercial - número |
| 1 | `com_complemento` | `text_87ajxd` | texto | [108.0, 360.0, 270.0, 373.0] | Endereço comercial - complemento |
| 1 | `com_municipio` | `text_89svto` | texto | [444.0, 360.0, 582.0, 373.0] | Endereço comercial - município |
| 1 | `com_bairro` | `text_88yp` | texto | [276.0, 359.0, 438.0, 372.0] | Endereço comercial - bairro |
| 1 | `com_estado` | `text_90monb` | texto | [31.0, 336.0, 191.0, 349.0] | Endereço comercial - estado |
| 1 | `com_pais` | `text_91iclv` | texto | [199.0, 336.0, 359.0, 349.0] | Endereço comercial - país |
| 1 | `com_referencia` | `text_92eiuv` | texto | [366.0, 336.0, 583.0, 349.0] | Endereço comercial - referência |
| 1 | `com_tel_tipo` | `text_93nmcf` | texto | [30.0, 314.0, 133.0, 327.0] | Endereço comercial - tipo de telefone |
| 1 | `com_tel_ddd` | `text_94lgxw` | texto | [137.0, 313.0, 161.0, 326.0] | Endereço comercial - DDD |
| 1 | `com_tel_numero_1` | `text_96whsi` | texto | [166.0, 313.0, 206.0, 326.0] | Endereço comercial - número (antes do hífen) |
| 1 | `com_tel_numero_2` | `text_97jjqu` | texto | [214.0, 313.0, 259.0, 326.0] | Endereço comercial - número (depois do hífen) |
| 1 | `com_tel_ramal` | `text_98kcce` | texto | [265.0, 313.0, 306.0, 326.0] | Endereço comercial - ramal |
| 1 | `com_email` | `text_99wlev` | texto | [311.0, 312.0, 582.0, 325.0] | Endereço comercial - e-mail |
| 1 | `condicoes__sintomas_embriaguez` | `text_100fjxq` | marca | [107.0, 290.0, 120.0, 304.0] | [X] Sintomas de embriaguez |
| 1 | `condicoes__efeito_droga_ilicita` | `text_102xxcd` | marca | [209.0, 290.0, 222.0, 304.0] | [X] Sob efeito de droga ilícita |
| 1 | `condicoes__problema_clinico` | `text_104nuzk` | marca | [321.0, 289.0, 334.0, 303.0] | [X] Problema clínico |
| 1 | `condicoes__portador_deficiencia` | `text_106dutk` | marca | [430.0, 289.0, 443.0, 303.0] | [X] Portador de deficiência |
| 1 | `condicoes__parturiente` | `text_108naxj` | marca | [531.0, 289.0, 544.0, 303.0] | [X] Parturiente |
| 1 | `condicoes__sem_lesoes` | `text_101rxlp` | marca | [108.0, 279.0, 121.0, 293.0] | [X] Sem lesões |
| 1 | `condicoes__lesoes_leves` | `text_103ibux` | marca | [209.0, 279.0, 222.0, 293.0] | [X] Lesões leves |
| 1 | `condicoes__lesoes_graves` | `text_105rmil` | marca | [321.0, 279.0, 334.0, 293.0] | [X] Lesões graves ou gravíssimas |
| 1 | `condicoes__obito` | `text_107fbgd` | marca | [430.0, 278.0, 443.0, 292.0] | [X] Óbito |
| 1 | `bens_1` | `text_109zbbh` | texto | [226.0, 259.0, 581.0, 272.0] | Bens que portava consigo (linha 1) |
| 1 | `bens_2` | `text_110hlvn` | texto | [32.0, 237.0, 580.0, 250.0] | Bens que portava consigo (linha 2) |
| 1 | `veic__v_outro` | `text_116lgho` | marca | [435.0, 201.0, 448.0, 215.0] | [X] V-__ (número acima de 5) |
| 1 | `veic__v1` | `text_111vohh` | marca | [86.0, 200.0, 99.0, 214.0] | [X] V-1 |
| 1 | `veic__v4` | `text_114urxj` | marca | [297.0, 200.0, 310.0, 214.0] | [X] V-4 |
| 1 | `veic__v2` | `text_112fwtx` | marca | [156.0, 199.0, 169.0, 213.0] | [X] V-2 |
| 1 | `veic__v3` | `text_113ulcd` | marca | [227.0, 199.0, 240.0, 213.0] | [X] V-3 |
| 1 | `veic__v5` | `text_115rbdm` | marca | [367.0, 199.0, 380.0, 213.0] | [X] V-5 |
| 1 | `veic_outro_numero` | `text_117uhwi` | texto | [461.0, 199.0, 477.0, 213.0] | V-__ : número do veículo |
| 1 | `veic_renavam_chassi` | `text_119usuf` | texto | [143.0, 174.0, 333.0, 187.0] | RENAVAM ou chassi |
| 1 | `veic_marca_modelo` | `text_121zmse` | texto | [445.0, 174.0, 582.0, 187.0] | Marca/modelo |
| 1 | `veic_placa` | `text_118jjnm` | texto | [29.0, 173.0, 139.0, 186.0] | Placa |
| 1 | `veic_especie` | `text_120mgtd` | texto | [339.0, 173.0, 440.0, 186.0] | Espécie/tipo |
| 1 | `veic_cor` | `text_122qopf` | texto | [30.0, 151.0, 186.0, 164.0] | Cor predominante |
| 1 | `veic_municipio_uf` | `text_124mvbb` | texto | [300.0, 151.0, 459.0, 164.0] | Município veículo/UF |
| 1 | `veic_ano` | `text_123ipcv` | texto | [191.0, 150.0, 298.0, 163.0] | Ano fabric. |
| 1 | `veic_pais` | `text_125zmzm` | texto | [462.0, 150.0, 581.0, 163.0] | País |
| 1 | `prop_nome` | `text_203ddfu` | texto | [32.0, 128.0, 380.0, 141.0] | Proprietário |
| 1 | `prop_cpf_cnpj` | `text_128abnn` | texto | [387.0, 128.0, 580.0, 141.0] | Proprietário - CPF/CNPJ |
| 1 | `prop_endereco` | `text_127xlhz` | texto | [30.0, 106.0, 382.0, 119.0] | Proprietário - endereço |
| 1 | `prop_bairro` | `text_129fiic` | texto | [386.0, 106.0, 579.0, 119.0] | Proprietário - bairro |
| 1 | `prop_municipio_uf` | `text_130cksz` | texto | [29.0, 84.0, 196.0, 97.0] | Proprietário - município/UF |
| 1 | `prop_cep` | `text_132uftt` | texto | [199.0, 84.0, 299.0, 97.0] | Proprietário - CEP |
| 1 | `prop_nacionalidade` | `text_134epqr` | texto | [445.0, 84.0, 580.0, 97.0] | Proprietário - nacionalidade |
| 1 | `prop_telefone` | `text_133lfhs` | texto | [302.0, 83.0, 442.0, 96.0] | Proprietário - telefone |
| 1 | `cinto__ignorado` | `text_137uhyo` | marca | [245.0, 64.0, 258.0, 78.0] | [X] Uso do cinto/capacete: IGNORADO |
| 1 | `cinto__sim` | `text_135dznw` | marca | [146.0, 63.0, 159.0, 77.0] | [X] Uso do cinto/capacete: SIM |
| 1 | `cinto__nao` | `text_136imfw` | marca | [196.0, 63.0, 209.0, 77.0] | [X] Uso do cinto/capacete: NÃO |
| 1 | `ocupantes` | `text_138xofi` | texto | [313.0, 59.0, 581.0, 72.0] | Nº de ocupantes |
| 1 | `conduzido_para` | `text_131zqzj` | texto | [36.0, 37.0, 585.0, 50.0] | Conduzido para |
| 1 | `estabelecimento` | `text_204fazr` | texto | [32.0, 14.0, 305.0, 27.0] | Nome estabelecimento |
| 1 | `transporte` | `text_140dxyz` | texto | [312.0, 13.0, 585.0, 26.0] | Transporte |
| 2 | `exame_alcoolico__sim` | `text_141xzln` | marca | [103.0, 777.0, 116.0, 791.0] | [X] Exame alcoólico SIM |
| 2 | `exame_alcoolico__nao` | `text_142cqst` | marca | [158.0, 777.0, 171.0, 791.0] | [X] Exame alcoólico NÃO |
| 2 | `medicao` | `text_156dytg` | texto | [203.0, 775.0, 392.0, 788.0] | Medição |
| 2 | `tiquete` | `text_157imia` | texto | [397.0, 772.0, 582.0, 785.0] | Nº tíquete etilômetro/auto de constatação |
| 2 | `encaminhado_dp__sim` | `text_143zixd` | marca | [120.0, 754.0, 133.0, 768.0] | [X] Encaminhado DP SIM |
| 2 | `encaminhado_dp__nao` | `text_144cznt` | marca | [220.0, 754.0, 233.0, 768.0] | [X] Encaminhado DP NÃO |
| 2 | `condutor_autuado__sim` | `text_145rfu` | marca | [411.0, 754.0, 424.0, 768.0] | [X] Condutor autuado SIM |
| 2 | `condutor_autuado__nao` | `text_146omak` | marca | [511.0, 754.0, 524.0, 768.0] | [X] Condutor autuado NÃO |
| 2 | `cnh_recolhida__sim` | `text_147bdx` | marca | [103.0, 731.0, 116.0, 745.0] | [X] Recolhida CNH/PD SIM |
| 2 | `cnh_recolhida__nao` | `text_148otze` | marca | [157.0, 731.0, 170.0, 745.0] | [X] Recolhida CNH/PD NÃO |
| 2 | `crlv_recolhido__sim` | `text_149iue` | marca | [286.0, 731.0, 299.0, 745.0] | [X] Recolhido CRLV SIM |
| 2 | `crlv_recolhido__nao` | `text_150miaj` | marca | [344.0, 731.0, 357.0, 745.0] | [X] Recolhido CRLV NÃO |
| 2 | `ait` | `text_172noe` | texto | [399.0, 727.0, 582.0, 740.0] | Nº AIT |
| 2 | `guinchado_por__seguradora` | `text_151mciz` | marca | [416.0, 709.0, 429.0, 723.0] | [X] Guinchado por seguradora |
| 2 | `guinchamento__sim` | `text_154wygn` | marca | [103.0, 708.0, 116.0, 722.0] | [X] Guinchamento SIM |
| 2 | `guinchamento__nao` | `text_155kass` | marca | [158.0, 708.0, 171.0, 722.0] | [X] Guinchamento NÃO |
| 2 | `guinchado_por__upm` | `text_152wrzk` | marca | [492.0, 708.0, 505.0, 722.0] | [X] Guinchado por UPM |
| 2 | `guinchado_por__outro` | `text_153egvc` | marca | [535.0, 708.0, 548.0, 722.0] | [X] Guinchado por outro |
| 2 | `auto_remocao` | `text_158lxjp` | texto | [203.0, 705.0, 334.0, 718.0] | Nº auto remoção |
| 2 | `empresa_guincho` | `text_159fqie` | texto | [13.0, 681.0, 293.0, 694.0] | Nome empresa guincho |
| 2 | `motorista_guincho` | `text_160ibdk` | texto | [303.0, 681.0, 584.0, 694.0] | Motorista (guincho) |
| 2 | `carga__sem_carga` | `text_171hrxa` | marca | [518.0, 638.0, 531.0, 652.0] | [X] Sem carga |
| 2 | `carga_nota_fiscal` | `text_162ssck` | texto | [167.0, 635.0, 314.0, 648.0] | Carga - nº da nota fiscal |
| 2 | `carga_tipo` | `text_161czaw` | texto | [13.0, 634.0, 160.0, 647.0] | Carga - tipo |
| 2 | `carga_empresa` | `text_163bbqn` | texto | [322.0, 634.0, 505.0, 647.0] | Carga - empresa |
| 2 | `carga_natureza__outra` | `text_170vgob` | marca | [538.0, 616.0, 551.0, 630.0] | [X] Natureza: outra |
| 2 | `carga_danos__parcial` | `text_165oulm` | marca | [163.0, 615.0, 176.0, 629.0] | [X] Danos parcial |
| 2 | `carga_danos__total` | `text_166rhdc` | marca | [214.0, 615.0, 227.0, 629.0] | [X] Danos total |
| 2 | `carga_natureza__prod_per` | `text_167opjk` | marca | [356.0, 615.0, 369.0, 629.0] | [X] Natureza: prod. per. |
| 2 | `carga_natureza__perecivel` | `text_168knws` | marca | [416.0, 615.0, 429.0, 629.0] | [X] Natureza: perecível |
| 2 | `carga_natureza__indivisivel` | `text_169aazs` | marca | [477.0, 615.0, 490.0, 629.0] | [X] Natureza: indivisível |
| 2 | `carga_peso` | `text_176hnpr` | texto | [13.0, 611.0, 96.0, 624.0] | Carga - peso (kg) |
| 2 | `tacografo__sim` | `text_174ekpd` | marca | [193.0, 593.0, 206.0, 607.0] | [X] Possui tacógrafo SIM |
| 2 | `tacografo__nao` | `text_175ryiz` | marca | [228.0, 592.0, 241.0, 606.0] | [X] Possui tacógrafo NÃO |
| 2 | `carga_complemento` | `text_173vtlo` | texto | [271.0, 590.0, 584.0, 603.0] | Carga - quadro sem rótulo ao lado do tacógrafo (usado para especificar natureza "outra"/observação da carga) |
| 2 | `carga_onu` | `text_177gley` | texto | [13.0, 589.0, 97.0, 602.0] | Carga - nº da ONU |
| 2 | `relato__testemunha_compromissada` | `text_179geqe` | marca | [498.0, 539.0, 511.0, 553.0] | [X] Testemunha compromissada |
| 2 | `relato_local` | `text_164ctjc` | texto | [14.0, 532.0, 332.0, 545.0] | Relato individual - local |
| 2 | `relato_data_hora` | `text_178rvyb` | texto | [341.0, 531.0, 489.0, 544.0] | Relato individual - data/hora |
| 2 | `alerta__silencio` | `text_180nrht` | marca | [14.0, 496.0, 27.0, 510.0] | [X] Alertado sobre o direito de permanecer em silêncio |
| 2 | `alerta__falso_testemunho` | `text_181ozhx` | marca | [180.0, 496.0, 193.0, 510.0] | [X] Alertado sobre penas do crime de falso testemunho |
| 2 | `alerta__denunciacao_caluniosa` | `text_182nbke` | marca | [388.0, 495.0, 401.0, 509.0] | [X] Alertado sobre penas do crime de denunciação caluniosa |
| 2 | `relato_texto` | `textarea_183fdbw` | texto multilinha | [14.0, 267.0, 583.0, 480.0] | Relato individual (multilinha) |
| 2 | `algema_justificativa__resistencia` | `text_186mmxh` | marca | [359.0, 228.0, 372.0, 242.0] | [X] Justificativa: resistência |
| 2 | `algema_justificativa__perigo` | `text_188evij` | marca | [444.0, 228.0, 457.0, 242.0] | [X] Justificativa: perigo à integridade física própria ou alheia |
| 2 | `algemado__sim` | `text_184xbaa` | marca | [152.0, 219.0, 165.0, 233.0] | [X] Algemado SIM |
| 2 | `algemado__nao` | `text_185ykyd` | marca | [196.0, 219.0, 209.0, 233.0] | [X] Algemado NÃO |
| 2 | `algema_justificativa__fuga` | `text_187lxmv` | marca | [359.0, 212.0, 372.0, 226.0] | [X] Justificativa: fundado receio de fuga |
| 2 | `manifestacao_ofendido` | `text_189uzfl` | marca | [12.0, 169.0, 25.0, 183.0] | [X] Manifestação do ofendido (não exercer representação neste momento) |
| 2 | `decl_eu` | `text_190knik` | texto | [25.0, 92.0, 354.0, 105.0] | Declaração de recebimento - Eu, |
| 2 | `decl_funcao` | `text_191xumo` | texto | [390.0, 92.0, 581.0, 105.0] | Declaração de recebimento - função |
| 2 | `decl_dia` | `text_192edii` | texto | [25.0, 74.0, 52.0, 87.0] | Declaração de recebimento - dia |
| 2 | `decl_mes` | `text_193twmg` | texto | [58.0, 74.0, 85.0, 87.0] | Declaração de recebimento - mês |
| 2 | `decl_ano` | `text_194dgj` | texto | [92.0, 74.0, 124.0, 87.0] | Declaração de recebimento - ano |
| 2 | `decl_local` | `text_195rguq` | texto | [147.0, 74.0, 355.0, 87.0] | Declaração de recebimento - no(a) |
| 2 | `decl__pessoa_qualificada` | `text_190qcdd` | marca | [15.0, 50.0, 28.0, 64.0] | [X] A pessoa acima qualificada, nas condições físicas e portando os objetos descritos |
| 2 | `decl__recebi_coisas` | `text_191esit` | marca | [14.0, 38.0, 27.0, 52.0] | [X] Recebi as coisas apreendidas registradas no campo "apreensões" |
