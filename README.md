# BO PMMA — preenchimento de boletins de ocorrência

Site estático para preencher o **Boletim de Ocorrência** e a ficha **Dos Envolvidos e dos Veículos** da PMMA (modelos 2026) pelo celular ou pelo computador. Ele usa os próprios formulários oficiais e preenche os campos que já existem neles.

* Funciona sem conta, sem servidor e sem mensalidade. Fica hospedado no GitHub Pages.
* Os dados da ocorrência são processados **somente no aparelho**. Nenhum relato, CPF, documento ou coordenada é enviado pela internet. Isso é reforçado por uma política de segurança (CSP) que bloqueia conexões externas.
* Depois do primeiro acesso completo, funciona **sem internet**.

## Como usar

1. Abra o site no celular ou no computador.
2. Escolha **COLAR RELATÓRIO DO WHATSAPP** ou **NOVA OCORRÊNCIA**.
3. Na importação, revise o que foi identificado e marque o que deve ser aplicado. Divergências (nomes, datas) e pendências aparecem nessa revisão.
4. Confira e complete as 6 etapas: Ocorrência · Local e ambiente · Envolvidos · Veículos e objetos · Histórico e providências · EQUIPE e revisão.
5. Na etapa 6, gere **o BO**, **as fichas** ou **o conjunto completo**, em duas versões: **PDF editável** (com campos) ou **cópia final para impressão** (com os valores incorporados à página).

### Regras de preenchimento (o sistema não inventa dados)

* Um campo sem informação fica em branco e aparece como pendência.
* A data e a hora do relatório **não** são copiadas sozinhas para FATO, COMUNICAÇÃO, ATENDIMENTO ou FECHAMENTO. Você escolhe com um toque onde cada uma deve ser usada.
* Perguntas de SIM/NÃO sem resposta continuam em branco. O sistema nunca marca "NÃO" automaticamente.
* "BO INFORMATIVO" e outros procedimentos informados ficam registrados, mas não viram uma classificação do documento.
* O endereço da ocorrência não é copiado para o endereço residencial de ninguém.
* Proprietário, condutor e vínculos entre pessoas e veículos só existem quando você os define.
* Nomes e dados pessoais não são corrigidos. Grafias diferentes (por exemplo, "Anastazio" e "Anastácio") aparecem como divergência para você decidir.
* O histórico importado não é alterado. A troca de "guarnição" por "EQUIPE" é apenas oferecida como sugestão.
* Importar outro relatório não apaga o que já foi revisado. Valores diferentes aparecem como conflito e vêm desmarcados.
* Os espaços de assinatura ficam sempre em branco.

### Texto maior que o campo

O histórico tem contador e indicação da capacidade do campo do PDF. A fonte é reduzida no máximo até 9 pt. Se o texto ainda não couber, o campo recebe o trecho que cabe seguido de "[continua na folha de continuação]", e o restante vai para uma **folha de continuação** identificada com o número do BO. Nada é cortado sem aviso. O mesmo vale para:

* mais de 6 objetos;
* mais de 2 atendentes, que entram na folha de continuação com espaço para assinatura;
* as "outras providências" e os "bens que portava".

### Informações sem campo no formulário

Serviço do dia, CPU, nome da EQUIPE, procedimento informado e coordenadas são guardados na ocorrência, mas **não** são colocados no PDF oficial. Na etapa 6 você pode incluí-los, se quiser, em "Informações complementares", que saem na folha de continuação.

### Rascunhos e privacidade

* Por padrão, os dados ficam só na aba aberta (sessionStorage).
* **Salvar rascunho neste aparelho**: salva automaticamente no navegador (localStorage). Quem usar o mesmo navegador poderá reabrir o rascunho.
* **Exportar / importar rascunho (JSON)**: o arquivo é validado pelo tipo e pela versão do formato.
* **Apagar dados da ocorrência**: remove a ocorrência e o rascunho, mas mantém as configurações da unidade.
* As configurações da unidade (unidade, pelotão, município e integrantes da EQUIPE) ficam separadas das ocorrências. A configuração inicial é 2º Pelotão / Barão de Grajaú-MA e pode ser editada.
* O site não tem analytics nem corretores externos (spellcheck desativado nos campos) e não registra dados no console. Os dados nunca vão para a URL nem para o cache do service worker.

## Publicação no GitHub Pages

O site publicado é exatamente o conteúdo deste repositório: não há etapa de build.

1. Crie um repositório no GitHub (por exemplo, `bo-pmma`) e envie estes arquivos:
   ```bash
   git init
   git add .
   git commit -m "BO PMMA"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/bo-pmma.git
   git push -u origin main
   ```
2. No GitHub, abra **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, depois **main** e **/(root)**, e salve.
3. Depois de alguns minutos, o site estará em `https://SEU_USUARIO.github.io/bo-pmma/`.

Todos os caminhos são relativos e o service worker usa o escopo `./`, então o site funciona dentro da subpasta do repositório. O arquivo `.nojekyll` desativa o processamento Jekyll.

> **Nunca envie os PDFs originais recebidos.** Eles contêm dados de ocorrências reais. A pasta `originais/` está no `.gitignore`. O repositório leva apenas os modelos limpos em `templates/`.

### Atualizações

Se você alterar qualquer arquivo do site, rode `node dev/gerar_sw.mjs` antes do commit. O comando atualiza a lista de arquivos e a versão do cache. Quem estiver com o site aberto verá o aviso "Nova versão disponível". A página nunca é recarregada sozinha durante um preenchimento.

## Desenvolvimento

O computador do quartel não precisa de nada instalado: basta um navegador. As ferramentas abaixo servem apenas para quem mantém o projeto.

Requisitos: Node 18+ e Python 3.10+.

```bash
npm install                                   # instala pdf-lib (só para gerar dados/testes)
pip install pikepdf pymupdf playwright pypdfium2 pillow
python -m playwright install chromium

# servidor local (abra http://localhost:8080/)
python3 -m http.server 8080
```

### Comandos

| Comando | O que faz |
|---|---|
| `python3 dev/preparar_modelos.py originais/bo.pdf originais/envolvidos.pdf` | Recria `templates/*.pdf`, `templates/campos.json` e `docs/MAPEAMENTO.md` a partir dos PDFs originais (que ficam fora do repositório) |
| `node dev/gerar_dados.mjs` | Gera `js/pdf/campos-modelo.js` e `js/helvetica.js` |
| `node dev/gerar_sw.mjs` | Gera `sw.js` (lista de cache e versão) |
| `node --test tests/*.test.js` | Testes do importador, do mapeamento, do gerador e dos rascunhos |
| `node dev/gerar_exemplos.mjs` | Gera PDFs fictícios em `saida-testes/` |
| `python3 tests/verificar_pdfs.py` | Reabre os PDFs gerados e confere campos, widgets, aparências, cópia de impressão e elementos fixos (pixel a pixel) |
| `python3 tests/e2e_navegador.py` | Teste de ponta a ponta no Chromium (tela de celular, subpasta, download, rascunho, offline) |

### Estrutura

```
index.html, css/, icons/, manifest.webmanifest, sw.js   site
js/app.js            controlador da interface
js/telas.js          telas (HTML)
js/estado.js         modelo de dados, armazenamento, JSON
js/importador.js     leitura do relatório do WhatsApp (regras locais)
js/pdf/mapa.js       mapeamento explícito dados → campos do PDF
js/pdf/gerador.js    preenchimento (pdf-lib), continuação, combinação (carregado sob demanda)
js/pdf/campos-modelo.js  campos dos modelos (gerado)
vendor/pdf-lib.esm.min.js  biblioteca pdf-lib 1.17.1 (MIT), incluída localmente
templates/           modelos limpos + campos.json
docs/MAPEAMENTO.md   tabela de todos os campos (nome, nome original, posição, rótulo)
dev/                 scripts de preparação (não usados pelo site)
tests/               testes
```

## Como os modelos foram preparados

Detalhes em `docs/MODELOS.md` e na tabela completa em `docs/MAPEAMENTO.md`. Em resumo:

* Os PDFs recebidos foram salvos pelo iOS, e o `/AcroForm/Fields` deles apontava para **cópias desconectadas** dos widgets: 237 de 237 no BO e 195 de 195 na ficha. Um preenchimento normal alteraria as cópias, e a página continuaria mostrando o valor antigo. Na normalização, o formulário foi religado aos widgets reais.
* Os dados ocultos do Apple PencilKit (`/AAPL:PPK`) que estavam nas páginas do BO também foram removidos.
* Os valores antigos, as aparências e os metadados foram removidos, e o arquivo foi regravado por inteiro. Uma verificação automática procura os 27 valores antigos (lidos dos originais locais, nunca escritos no código) (bytes, streams descompactados, UTF-16, texto das páginas e valores de campo) e não encontra nenhum.
* Os campos foram renomeados para nomes semânticos (ex.: `relato`, `fato_data`, `amb_saude__clinica`). O nome original de cada um está documentado.
* Os rótulos dos formulários são curvas (CorelDRAW), sem texto extraível. Por isso o mapeamento foi feito pela geometria e conferido visualmente.
* Dois espaços impressos do BO não tinham campo: "Destino do(s) objeto(s)" e "Nome e cargo do responsável" (Criminalística). Foram criados campos sobre esses espaços, com as coordenadas documentadas.
* Os modelos limpos foram comparados com os originais sem os campos e são **idênticos pixel a pixel**.

## Limitações conhecidas

* Os modelos usam **campos de texto que recebem "X"** como caixas de marcação, e não caixas de seleção nativas. Isso foi mantido para preservar o formulário. No PDF editável, para marcar ou desmarcar, digite ou apague o "X".
* O texto do PDF usa a fonte Helvetica padrão (WinAnsi), que cobre o português (acentos, cedilha, º, ª). Emojis e símbolos fora desse conjunto são omitidos, e um aviso informa quais foram.
* O quadro 8 tem 2 linhas: os demais atendentes saem na folha de continuação.
* Uma ficha mostra **um** veículo. Um envolvido pode ser vinculado a um veículo, e um veículo pode aparecer nas fichas de vários envolvidos (por exemplo, condutor e passageiro). Nesse caso, os dados do veículo se repetem em cada ficha vinculada. Um veículo sem vínculo gera uma ficha só com os dados do veículo.
* O importador funciona por regras e cobre os formatos e rótulos usuais (com variações de escrita). Linhas que ele não entende aparecem em "Linhas não reconhecidas" para cópia manual.
* No PDF editável, um campo editado depois em outro programa tem a aparência regenerada por esse programa, e o resultado pode variar um pouco entre leitores. A cópia para impressão não tem essa variação.
* O teste automatizado de navegador usa Chromium, com tela de celular simulada. O Safari do iPhone não foi testado num aparelho real. O download usa `<a download>` (suportado a partir do iOS 13) e, quando disponível, o compartilhamento nativo.
* A lista de municípios usada para reconhecer o município no endereço é curta (região de Barão de Grajaú, mais o município configurado). Quando o município é deduzido do fim do endereço, ele chega à revisão desmarcado.
