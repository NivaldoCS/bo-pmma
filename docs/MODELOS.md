# Preparação dos modelos limpos

Script: `dev/preparar_modelos.py` (mapeamento em `dev/mapa_campos.py`).

## Diagnóstico dos PDFs recebidos

| | Boletim de Ocorrência | Dos Envolvidos e dos Veículos |
|---|---|---|
| Páginas | 2 (A4, 595 × 841 pt, retrato) | 2 (A4, 595,28 × 841,89 pt, retrato) |
| Origem | CorelDRAW 2022 → regravado pelo iOS (Quartz PDFContext) | CorelDRAW 2021 → regravado pelo iOS |
| Campos | 237 widgets de texto (1 multilinha) | 195 widgets de texto (1 multilinha) |
| Caixas de marcação | campos de texto 13×14 pt que recebem "X" | idem |
| Texto fixo | convertido em curvas (não extraível) | idem |
| Dados antigos | nº do BO, datas, local, histórico, atendentes | nº do BO, envolvido, CPF, filiação, endereço |

### Defeito encontrado: campos desconectados

Em ambos os arquivos, `/AcroForm/Fields` aponta para **objetos diferentes** dos widgets que estão em `/Annots` das páginas. São cópias com o mesmo nome e o mesmo conteúdo, desconectadas dos widgets: 237 de 237 no BO e 195 de 195 na ficha. Uma biblioteca de formulário (pdf-lib, Acrobat etc.) preencheria as cópias, e a página continuaria exibindo a aparência antiga. Na normalização, `/Fields` passou a apontar para os widgets reais, e as cópias deixaram de ser gravadas.

### Dados ocultos do iOS

As 2 páginas do BO tinham `/AAPL:PPK` e `/AAPL:PPKHash`, o estado de desenho do Apple PencilKit. Esses dados não aparecem na página, mas ficariam recuperáveis no arquivo, e foram removidos. Depois disso, uma busca por chaves proprietárias, `/Metadata`, JavaScript, arquivos embutidos e camadas não encontra nada nos modelos limpos.

## Normalização

1. `/Fields` foi religado aos widgets das páginas, e cada widget recebeu `/P`.
2. Foram removidos `/V`, `/DV`, `/AP` (aparências antigas, que continham o texto anterior), `AAPL:AKExtras` e `/Outlines`. Os metadados de autoria também foram removidos.
3. Os campos foram renomeados para nomes semânticos, com o mapeamento original → novo documentado.
4. Os campos receberam `DA` com `/Helv`, fonte padrão definida em `/DR` (Helvetica, WinAnsi), na cor azul dos preenchimentos originais (`0.004 0.341 0.608 rg`).
5. Foram criados campos sobre 2 espaços impressos sem campo:
   * `objetos_destino`, na página 2: retângulo PyMuPDF (112, 557, 577, 575);
   * `ic_responsavel`, na página 2: retângulo (400, 663, 578, 686), multilinha.
6. O arquivo foi regravado por inteiro com pikepdf/qpdf. Objetos não referenciados não são copiados.

## Verificações automáticas (no próprio script)

* Todo campo original foi mapeado exatamente uma vez, e não há nomes novos duplicados.
* Cada célula das grades de marcação corresponde a exatamente um campo, conferido por linha e coluna.
* Cada quadrado desenhado no formulário tem um campo correspondente. A única exceção é um quadrado dentro do brasão.
* Os valores antigos (27 strings, mais nomes e números conhecidos) foram procurados em bytes crus, streams descompactados (`qpdf --qdf --decode-level=all`), latin-1, UTF-8, UTF-16BE, texto extraído das páginas e valores de campo. Nenhum foi encontrado.
* A renderização do modelo limpo é idêntica, pixel a pixel, à do original sem anotações, nas 4 páginas.

## Geração (js/pdf/gerador.js)

* Cada documento é preenchido a partir de uma cópia nova do modelo.
* No **PDF editável**, os campos de cada parte recebem prefixo (`BO-`, `F1-`, `F2-`…) antes da combinação. Assim, editar uma ficha não altera outra. Os widgets são religados às páginas copiadas e ao `/AcroForm` final, e todas as aparências são geradas com Helvetica.
* Na **cópia para impressão**, cada parte é achatada (`flatten`) antes da combinação: os valores ficam incorporados à página, sem campos.
* Ajuste de texto:
  * campos de linha única: fonte de até 10 pt, reduzida até no mínimo 6 pt. Se ainda não couber, o campo recebe "…*" e o texto completo vai para a folha de continuação;
  * campos multilinha: 10, 9,5 ou 9 pt. Se não couber, o restante vai para a continuação, com referência no próprio campo.
