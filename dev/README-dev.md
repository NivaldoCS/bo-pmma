# Notas de desenvolvimento

* `mapa_campos.py`: mapeamento explícito entre os nomes originais dos campos e os nomes semânticos.
* `preparar_modelos.py`: cria os modelos limpos a partir de `originais/`. Essa pasta nunca vai para o repositório.
* `gerar_dados.mjs`: gera `js/pdf/campos-modelo.js` e `js/helvetica.js`.
* `gerar_sw.mjs`: gera `sw.js`. Rode depois de qualquer alteração em arquivos do site.
* `gerar_exemplos.mjs`: gera PDFs com dados fictícios em `saida-testes/`.

Conferência do mapeamento: cada campo foi desenhado sobre a página renderizada a 200 dpi, com o número do nome interno, e conferido visualmente com o rótulo impresso. Os rótulos são curvas, sem texto extraível.
