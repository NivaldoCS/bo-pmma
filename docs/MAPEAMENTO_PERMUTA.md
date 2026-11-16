# Mapeamento da Solicitação de Permuta de Serviço

Gerado por `dev/preparar_permuta.py`. Modelo: `templates/permuta.pdf` (A4 retrato, 595.3 × 841.9 pt, 1 página, sem campos de formulário).

Coordenadas em pontos, origem no **topo** esquerdo (PyMuPDF). `base` é a linha de base do texto.

| área | x0 | x1 | base | alinhamento | fonte (mín.) | observação |
|---|---|---|---|---|---|---|
| `emissao_local` | 41.1 | 251.94 | 207.32 | direita | 10 (8) | Texto original retirado do modelo; o local informado é escrito alinhado à direita, encostado na vírgula. |
| `emissao_dia` | 256.94 | 282.02 | 207.32 | centro | 10 (8) |  |
| `emissao_mes` | 296.45 | 396.45 | 207.32 | centro | 10 (8) |  |
| `emissao_ano` | 410.85 | 430.88 | 207.32 | esquerda | 10 (8) | Os 4 dígitos de "2026" foram retirados do modelo (só eles); o ano da emissão é escrito no mesmo ponto. |
| `solicitante_posto` | 260.45 | 350.54 | 232.82 | centro | 10 (7) |  |
| `solicitante_numero` | 382.45 | 452.45 | 232.82 | centro | 10 (7) |  |
| `solicitante_nome` | 242.43 | 442.43 | 244.32 | centro | 10 (7) |  |
| `servico_dia` | 304.15 | 324.15 | 308.82 | centro | 10 (8) |  |
| `servico_mes` | 326.93 | 346.93 | 308.82 | centro | 10 (8) |  |
| `servico_ano` | 349.74 | 369.83 | 308.82 | centro | 10 (8) |  |
| `inicio_hora` | 433.72 | 453.72 | 308.82 | centro | 10 (8) |  |
| `inicio_min` | 456.5 | 476.61 | 308.82 | centro | 10 (8) |  |
| `fim_hora` | 489.51 | 509.51 | 308.82 | centro | 10 (8) |  |
| `fim_min` | 512.29 | 532.29 | 308.82 | centro | 10 (8) |  |
| `substituto` | 50.1 | 172.13 | 321.22 | esquerda | 10 (7) | Entre "o" e "A fim de". O traço do modelo (Helvetica) passa sob "A fim de"; o texto termina 4 pt antes da justificativa e recebe ponto final. |

## Áreas que o sistema NUNCA preenche

Verificadas nos testes: nenhum pixel muda nessas áreas no PDF gerado.

| área | retângulo [x0, y0, x1, y1] |
|---|---|
| autorizo_em | [41.1, 413.74, 147.18, 424.81] |
| comandante | [41.0, 430.0, 200.0, 457.0] |
| assinatura_solicitante | [100.0, 362.0, 262.0, 390.0] |
| assinatura_substituto | [335.0, 362.0, 497.0, 390.0] |
| justificativa | [176.13, 312.31, 487.73, 323.38] |

## Normalização do modelo

* Removido o `/AcroForm` vazio com `/SigFlags 3` (indicava, sem verdade, que o arquivo já tinha assinaturas e só aceitava anexação).
* Retirados **somente** os glifos de "Barão de Grajaú - MA" e "2026" da linha de emissão (o gerador sempre escreve o local e o ano). Assim o texto antigo não fica escondido sob o novo.
* Mantido o manifesto C2PA ("Content Credentials") que veio no arquivo (declaração de procedência; não contém dados pessoais).
* Todo o resto da página é idêntico ao original (comparação pixel a pixel fora das duas áreas retiradas).
