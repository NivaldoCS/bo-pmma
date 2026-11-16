# -*- coding: utf-8 -*-
"""
Teste de ponta a ponta no navegador (Chromium headless via Playwright), com
o site servido numa SUBPASTA, como no GitHub Pages. Dados 100% fictícios.

Uso (desenvolvimento):
    pip install playwright pymupdf && python -m playwright install chromium
    python3 tests/e2e_navegador.py

Gera capturas e PDFs em saida-testes/ (fora do controle de versão).
"""
import os, sys, json, time, threading, functools, http.server, socketserver, tempfile, shutil, re
from playwright.sync_api import sync_playwright, expect

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SAIDA = os.path.join(RAIZ, 'saida-testes')
os.makedirs(SAIDA, exist_ok=True)
SUBPASTA = 'bo-pmma'

RELATORIO = """🚨 *35º BPM - 2º PELOTÃO* 🚨
*SERVIÇO DO DIA:* 14/11/2026
*CPU DO BPM:* Nome do CPU
*TÍTULO DA OCORRÊNCIA:* Furto de motocicleta
*EQUIPE:* RP
Cb Policial A
Cb Policial B
Sd Policial C
*B.O:* 001/2026
*DATA:* 13/11/2026
*HORA:* 23:00
*LOCAL:* Rua Exemplo, bairro Centro, Barão de Grajaú.
*COORDENADAS:* -6.7512, -43.0234
*PROCEDIMENTO ADOTADO:* BO INFORMATIVO
*Vítima:* Anastazio Exemplo da Silva, CPF 012.345.678-90, nasc. 01/02/1990
*Acusado:*
*HISTÓRICO:* Por volta das 23h, o senhor Anastácio Exemplo da Silva acionou a guarnição informando o furto de sua motocicleta Honda placa ABC1D23, cor preta.
"""

def servidor():
    base = tempfile.mkdtemp()
    os.symlink(RAIZ, os.path.join(base, SUBPASTA))
    class Silencioso(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Silencioso, directory=base)
    class S(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True
    srv = S(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, base

def main():
    srv, base = servidor()
    url = f'http://127.0.0.1:{srv.server_address[1]}/{SUBPASTA}/'
    falhas = []
    def checar(cond, msg):
        print(('OK   ' if cond else 'FALHA'), msg)
        if not cond: falhas.append(msg)

    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True,
                            has_touch=True, accept_downloads=True, locale='pt-BR')
        pg = ctx.new_page()
        console, requisicoes = [], []
        pg.on('console', lambda m: console.append(f'{m.type}: {m.text}'))
        pg.on('pageerror', lambda e: console.append(f'pageerror: {e}'))
        ctx.on('request', lambda r: requisicoes.append(r.url))
        pg.on('dialog', lambda d: d.accept())

        pg.goto(url)
        pg.get_by_role('button', name=re.compile('COLAR RELATÓRIO')).click()
        pg.fill('textarea[data-import]', RELATORIO)
        pg.get_by_role('button', name='Analisar relatório').click()
        pg.wait_for_selector('.item-rev')
        txt = pg.inner_text('main')
        checar('Nome divergente' in txt and 'Anastácio' in txt, 'revisão mostra nome divergente (Anastazio x Anastácio)')
        checar('Datas diferentes' in txt, 'revisão mostra datas diferentes (serviço x data)')
        checar('NÃO foi aplicada a FATO' in txt, 'pendência: data/hora não aplicada automaticamente')
        sug = pg.locator('.item-rev', has_text='Veículo mencionado no histórico')
        checar(sug.count() == 1 and not sug.locator('input').is_checked(), 'veículo do histórico é sugestão desmarcada')
        pg.screenshot(path=f'{SAIDA}/ui_revisao.png', full_page=True)
        pg.get_by_role('button', name='Aplicar selecionados e conferir').click()

        # etapa 1
        pg.wait_for_selector('nav.etapas')
        checar(pg.input_value('[data-bind="ocorrencia.numeroBo"]') == '001/2026', 'nº BO aplicado')
        checar(pg.input_value('[data-bind="ocorrencia.datas.fato.data"]') == '', 'data do FATO continua vazia após importar')
        pg.get_by_role('button', name='Usar em FATO').click()
        checar(pg.input_value('[data-bind="ocorrencia.datas.fato.hora"]') == '23:00', 'usuário escolhe usar a hora informada no FATO')
        pg.locator('[data-bind="ocorrencia.datas.comunicacao.data"]').fill('13112026')
        checar(pg.input_value('[data-bind="ocorrencia.datas.comunicacao.data"]') == '13/11/2026', 'máscara de data')
        pg.locator('[data-bind="ocorrencia.datas.comunicacao.hora"]').fill('2305')
        pg.get_by_role('button', name='Comunicação de ocorrência policial').click()
        pg.screenshot(path=f'{SAIDA}/ui_etapa1.png', full_page=True)

        # etapa 2
        pg.click('#btn-proxima')
        checar(pg.input_value('[data-bind="local.logradouro"]') == 'Rua Exemplo', 'logradouro importado')
        checar(pg.input_value('[data-bind="local.bairro"]') == 'Centro', 'bairro importado')
        pg.get_by_role('button', name='Via pública').click()
        pg.locator('summary', has_text='Iluminação artificial').click()
        pg.get_by_role('button', name='Sim - pouca visibilidade').click()
        pg.get_by_role('button', name='Sim - boa visibilidade').click()
        checar(pg.get_by_role('button', name='Sim - pouca visibilidade').get_attribute('aria-pressed') == 'false', 'grupo de escolha única troca a marcação')

        # etapa 3: envolvidos
        pg.click('#btn-proxima')
        checar(pg.locator('details.registro').count() == 1, 'vítima importada como E-1')
        pg.locator('details.registro summary').first.click()
        checar(pg.input_value('[data-bind="envolvidos.0.cpf"]') == '012.345.678-90', 'CPF com zero inicial preservado')
        checar(pg.input_value('[data-bind="envolvidos.0.res.logradouro"]') == '', 'endereço da ocorrência NÃO copiado para a vítima')
        checar(pg.input_value('[data-bind="envolvidos.0.nome"]') == 'Anastazio Exemplo da Silva', 'nome não corrigido silenciosamente')
        pg.get_by_role('button', name='+ Adicionar envolvido').click()
        pg.fill('[data-bind="envolvidos.1.nome"]', 'Pessoa Sem Documento Ação')
        pg.locator('details.registro').nth(1).get_by_role('button', name='A apurar').click()
        pg.locator('[data-bind="envolvidos.1.semDocumento"]').check()
        pg.fill('[data-bind="envolvidos.1.cpf"]', '123')
        checar('incompleto' in pg.inner_text('[data-alerta-de="envolvidos.1.cpf"]'), 'alerta de CPF não bloqueia')
        pg.fill('[data-bind="envolvidos.1.cpf"]', '')
        pg.screenshot(path=f'{SAIDA}/ui_etapa3.png', full_page=False)

        # etapa 4: veículos/objetos
        pg.click('#btn-proxima')
        pg.get_by_role('button', name='+ Adicionar veículo').click()
        pg.fill('[data-bind="veiculos.0.placa"]', 'abc-1d23')
        checar(pg.input_value('[data-bind="veiculos.0.placa"]') == 'ABC1D23', 'máscara de placa')
        pg.fill('[data-bind="veiculos.0.marcaModelo"]', 'Honda / Modelo Fictício')
        pg.locator('[data-vinculo-veiculo]').first.click()
        checar('E-1' in pg.inner_text('details.registro >> nth=0'), 'vínculo explícito E-1 ↔ V-1')
        pg.get_by_role('button', name='+ Adicionar veículo').click()
        pg.fill('[data-bind="veiculos.1.placa"]', 'XYZ9876')
        pg.get_by_role('button', name='+ Adicionar objeto').click()
        pg.select_option('[data-bind="objetos.0.participacao"]', '2')
        pg.fill('[data-bind="objetos.0.descricao"]', 'Capacete preto')
        pg.fill('[data-bind="objetos.0.quantidade"]', '1')

        # etapa 5: histórico
        pg.click('#btn-proxima')
        checar(pg.locator('[data-acao="trocar-equipe"]').count() == 1, 'sugestão de trocar guarnição por EQUIPE (não automática)')
        rel = pg.input_value('[data-bind="relato"]')
        checar('guarnição' in rel, 'histórico importado não foi alterado silenciosamente')
        pg.get_by_role('button', name='Substituir por “EQUIPE”').click()
        try:
            expect(pg.locator('[data-bind="relato"]')).to_have_value(re.compile('acionou a EQUIPE'), timeout=5000); ok = True
        except Exception: ok = False
        checar(ok, 'substituição aplicada após confirmação')
        longo = ('Texto fictício de histórico longo com acentuação: ação, coração, órgão, você. ' * 70).strip()
        pg.fill('[data-bind="relato"]', longo)
        checar('excede o campo' in pg.inner_text('[data-contador-de="relato"]'), 'contador indica excesso do campo')
        pg.locator('.pergunta', has_text='Fotografado?').get_by_role('button', name='NÃO').click()

        # etapa 6
        pg.click('#btn-proxima')
        pend = pg.inner_text('.lista-pend')
        checar('Sem resposta: A Polícia Civil foi acionada?' in pend, 'pergunta SIM/NÃO sem resposta fica pendente (sem “NÃO” automático)')
        checar(pg.locator('[data-bind^="equipe."][data-bind$=".nome"]').count() == 3, 'EQUIPE importada (3 integrantes)')
        pg.screenshot(path=f'{SAIDA}/ui_etapa6.png', full_page=True)
        for tipo, nome_btn in [('conjunto', 'Gerar conjunto completo da ocorrência'), ('bo', 'Gerar BO')]:
            pg.get_by_role('button', name=nome_btn).click()
            pg.wait_for_selector('.resultado', timeout=30000)
            with pg.expect_download() as dl:
                pg.get_by_role('button', name='Baixar PDF').click()
            d = dl.value
            destino = os.path.join(SAIDA, f'e2e_{d.suggested_filename}')
            d.save_as(destino)
            checar(d.suggested_filename == ('OCORRENCIA_001-2026.pdf' if tipo == 'conjunto' else 'BO_001-2026.pdf'), f'nome do download: {d.suggested_filename}')
        res = pg.inner_text('.resultado')
        checar('continuação' in res.lower(), 'resultado informa folha de continuação')
        pg.get_by_role('button', name='Cópia final para impressão').click()
        pg.get_by_role('button', name='Gerar conjunto completo da ocorrência').click()
        pg.wait_for_selector('.resultado >> text=_impressao.pdf', timeout=30000)
        with pg.expect_download() as dl:
            pg.get_by_role('button', name='Baixar PDF').click()
        dl.value.save_as(os.path.join(SAIDA, f'e2e_{dl.value.suggested_filename}'))
        checar(dl.value.suggested_filename == 'OCORRENCIA_001-2026_impressao.pdf', 'download da cópia para impressão')

        # privacidade: URL e rede
        checar(pg.url.rstrip('/') == url.rstrip('/'), 'URL nunca contém dados')
        externas = [u for u in requisicoes if not u.startswith(url.split(f'/{SUBPASTA}/')[0]) and not u.startswith('blob:') and not u.startswith('data:')]
        checar(not externas, f'nenhuma requisição externa ({externas[:3]})')
        sensiveis = [m for m in console if re.search(r'Anast|012\.345|ABC1D23|Exemplo', m)]
        checar(not sensiveis, 'nenhum dado pessoal no console')

        # rascunho no aparelho
        pg.locator('[data-acao-check="salvar-aparelho"]').check()
        pg.wait_for_timeout(500)
        ls = pg.evaluate("localStorage.getItem('pmmabo.rascunho')")
        checar(ls and '012.345.678-90' in ls, 'rascunho salvo no aparelho quando ativado')
        pg2 = ctx.new_page()
        pg2.goto(url)
        checar(pg2.get_by_role('button', name=re.compile('RETOMAR RASCUNHO')).count() == 1, 'outra aba oferece retomar o rascunho')
        pg2.get_by_role('button', name=re.compile('RETOMAR RASCUNHO')).click()
        checar(pg2.input_value('[data-bind="ocorrencia.numeroBo"]') == '001/2026', 'rascunho retomado')
        pg2.close()

        # exportar/importar JSON
        with pg.expect_download() as dl:
            pg.get_by_role('button', name='Exportar rascunho (JSON)').click()
        jpath = os.path.join(SAIDA, 'rascunho_teste.json'); dl.value.save_as(jpath)
        dados = json.load(open(jpath, encoding='utf-8'))
        checar(dados['tipo'] == 'pmma-bo-rascunho' and dados['formato'] == 1, 'JSON com tipo e versão do formato')

        # offline
        pg.goto(url)
        expect(pg.locator('#status-offline')).to_contain_text('Pronto para uso sem internet', timeout=20000)
        caches = pg.evaluate("""async () => { const out = []; for (const k of await caches.keys()) { const c = await caches.open(k); for (const r of await c.keys()) out.push(r.url); } return out; }""")
        checar(all(('/' + SUBPASTA + '/') in u for u in caches) and not any(u.startswith('blob:') for u in caches), f'cache contém só arquivos do app ({len(caches)} itens)')
        checar(not any(re.search(r'\.json$', u) and 'rascunho' in u for u in caches), 'nenhum rascunho no cache')
        ctx.set_offline(True)
        pg.reload()
        pg.wait_for_selector('.botao-grande')
        pg.get_by_role('button', name=re.compile('CONTINUAR OCORRÊNCIA')).click()
        pg.click('[data-etapa="6"]')
        pg.get_by_role('button', name='Gerar ficha(s) de envolvido/veículo').click()
        pg.wait_for_selector('.resultado >> text=FICHAS_001-2026', timeout=30000)
        with pg.expect_download() as dl:
            pg.get_by_role('button', name='Baixar PDF').click()
        dl.value.save_as(os.path.join(SAIDA, f'e2e_offline_{dl.value.suggested_filename}'))
        checar(True, 'geração de PDF funcionando OFFLINE')
        ctx.set_offline(False)

        # apagar mantém preferências
        pg.evaluate("localStorage.setItem('pmmabo.preferencias', JSON.stringify({unidade:'Unidade teste', integrantes:[]}))")
        pg.get_by_role('button', name='Apagar dados da ocorrência').click()
        checar(pg.evaluate("sessionStorage.getItem('pmmabo.ocorrencia')") is None and pg.evaluate("localStorage.getItem('pmmabo.rascunho')") is None, 'apagar remove ocorrência e rascunho')
        checar('Unidade teste' in (pg.evaluate("localStorage.getItem('pmmabo.preferencias')") or ''), 'apagar mantém preferências da unidade')

        # computador (tela larga)
        ctx2 = b.new_context(viewport={'width': 1280, 'height': 900})
        pc = ctx2.new_page(); pc.goto(url)
        pc.get_by_role('button', name=re.compile('NOVA OCORRÊNCIA')).click()
        pc.screenshot(path=f'{SAIDA}/ui_computador_etapa1.png')
        ctx2.close()
        erros = [m for m in console if m.startswith(('error', 'pageerror'))]
        checar(not erros, f'sem erros no console {erros[:3]}')
        b.close()
    srv.shutdown(); shutil.rmtree(base, ignore_errors=True)
    print(f'\n{len(falhas)} falha(s)')
    sys.exit(1 if falhas else 0)

if __name__ == '__main__':
    main()
