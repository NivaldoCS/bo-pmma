# -*- coding: utf-8 -*-
"""
Prepara o modelo da SOLICITAÇÃO DE PERMUTA DE SERVIÇO.

Uso:
    python3 dev/preparar_permuta.py originais/permuta.pdf

Gera:
    templates/permuta.pdf             modelo em branco normalizado
    js/permuta/coordenadas.js         áreas de preenchimento (medidas no próprio PDF)
    docs/MAPEAMENTO_PERMUTA.md        documentação do mapeamento

O modelo recebido (Word -> PDF, 1 página A4) não tem campos, mas traz um
/AcroForm vazio com /SigFlags 3 ("assinaturas existem / somente anexar"),
indicação falsa que pode confundir assinadores digitais. O /AcroForm é
removido; o conteúdo da página não é alterado (verificado pixel a pixel).

As coordenadas NÃO são digitadas à mão: são extraídas caractere a caractere
(PyMuPDF rawdict) a partir dos traços "____" e dos textos fixos de referência.
"""
import sys, os, json
import fitz, pikepdf

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def chars_por_linha(page):
    linhas = []
    for b in page.get_text('rawdict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                for c in s['chars']:
                    linhas.append(dict(c=c['c'], x0=c['bbox'][0], x1=c['bbox'][2], y0=c['bbox'][1], y1=c['bbox'][3],
                                       base=round(c['origin'][1], 2), fonte=s['font'], tam=s['size']))
    por_base = {}
    for c in linhas:
        k = (round(c['base']), c['fonte'])
        por_base.setdefault(k, []).append(c)
    for k in por_base:
        por_base[k].sort(key=lambda c: c['x0'])
    return por_base


def texto(linha):
    return ''.join(c['c'] for c in linha)


def achar_linha(por_base, trecho):
    achadas = [k for k, l in por_base.items() if trecho in texto(l)]
    if len(achadas) != 1:
        raise SystemExit(f'Trecho "{trecho}" encontrado em {len(achadas)} linhas')
    return por_base[achadas[0]]


def runs_sublinhado(linha):
    runs, cur = [], None
    for c in linha:
        if c['c'] == '_':
            if cur and abs(c['x0'] - cur['x1']) < 1.5 and c['fonte'] == cur['fonte']:
                cur['x1'] = c['x1']; cur['n'] += 1
            else:
                cur = dict(x0=c['x0'], x1=c['x1'], n=1, base=c['base'], fonte=c['fonte']); runs.append(cur)
        else:
            cur = None
    return runs


def faixa(linha, trecho):
    t = texto(linha)
    i = t.index(trecho)
    cs = linha[i:i + len(trecho)]
    return dict(x0=cs[0]['x0'], x1=cs[-1]['x1'], y0=min(c['y0'] for c in cs), y1=max(c['y1'] for c in cs), base=cs[0]['base'])


def main():
    orig = sys.argv[1]
    destino = os.path.join(RAIZ, 'templates', 'permuta.pdf')
    pdf = pikepdf.open(orig)
    assert len(pdf.pages) == 1, 'o modelo deve ter 1 página'
    assert not pdf.is_encrypted
    if '/AcroForm' in pdf.Root:
        af = pdf.Root.AcroForm
        assert len(af.get('/Fields', [])) == 0, 'modelo inesperado: há campos'
        del pdf.Root['/AcroForm']
    assert '/Annots' not in pdf.pages[0].obj or len(pdf.pages[0].Annots) == 0
    if '/Annots' in pdf.pages[0].obj:
        del pdf.pages[0].obj['/Annots']  # lista vazia
    # O catálogo traz um manifesto C2PA ("Content Credentials", arquivo associado /AF).
    # Ele é mantido como veio: é uma declaração de procedência do arquivo original.
    tmp = destino + '.tmp'
    pdf.save(tmp, deterministic_id=True)

    doc = fitz.open(orig)
    pg = doc[0]
    W, H = pg.rect.width, pg.rect.height
    L = chars_por_linha(pg)

    # ---- emissão: "Barão de Grajaú - MA, _____ de ____________________ de 2026."
    le = achar_linha(L, 'de 2026.')
    r = runs_sublinhado(le)
    assert len(r) == 2
    local = faixa(le, 'Barão de Grajaú - MA')
    virgula = faixa(le, 'MA,')
    ano = faixa(le, '2026')
    # ---- Do: ____ PM nº ____ / linha de baixo
    ld = achar_linha(L, 'Do:')
    rd = runs_sublinhado(ld)
    assert len(rd) == 2
    ln = [l for k, l in L.items() if texto(l).strip() and set(texto(l).strip()) == {'_'} and abs(l[0]['x0'] - faixa(ld, 'Do:')['x0']) < 1]
    assert len(ln) == 1, 'linha do nome do solicitante não encontrada'
    rn = runs_sublinhado(ln[0])[0]
    # ---- corpo: dia ____/____/____ horário ____:____ às ____:____
    lc = achar_linha(L, 'Solicito-vos')
    rc = runs_sublinhado(lc)
    assert len(rc) == 7, rc
    # ---- substituto: "o ________ A fim de ..."
    ls = achar_linha(L, 'A fim de que')
    fim = faixa(ls, 'A fim de')
    o_ = faixa(ls, 'o ')
    sub_run = [l for k, l in L.items() if k[1] == 'Helvetica' and abs(k[0] - round(fim['base'])) <= 1]
    assert len(sub_run) == 1 and set(texto(sub_run[0])) == {'_'}, 'traço do substituto não encontrado'
    # áreas protegidas (nunca recebem nada)
    la = achar_linha(L, 'Autorizo em')
    autorizo = faixa(la, 'Autorizo em')
    autorizo['x1'] = la[-1]['x1']
    lcmt = achar_linha(L, 'Comandante do 2º Pelotão')
    ass_sol = faixa(achar_linha(L, 'Assinatura do Solicitante'), 'Assinatura do Solicitante')
    ass_sub = faixa(achar_linha(L, 'Assinatura do Substituto'), 'Assinatura do Substituto')
    just = faixa(ls, 'A fim de que este solicitante possa tratar de assuntos de interesse particulares.')

    T = 10
    areas = {
        'emissao_local': dict(x0=41.1, x1=local['x1'], base=local['base'], tam=T, alinhar='direita', min=8,
                              retirado=[round(v, 2) for v in (local['x0'], local['y0'], local['x1'], local['y1'])],
                              original='Barão de Grajaú - MA', nota='Texto original retirado do modelo; o local informado é escrito alinhado à direita, encostado na vírgula.'),
        'emissao_dia': dict(x0=r[0]['x0'], x1=r[0]['x1'], base=r[0]['base'], tam=T, alinhar='centro', min=8),
        'emissao_mes': dict(x0=r[1]['x0'], x1=r[1]['x1'], base=r[1]['base'], tam=T, alinhar='centro', min=8),
        'emissao_ano': dict(x0=ano['x0'], x1=ano['x1'], base=ano['base'], tam=T, alinhar='esquerda', min=8,
                            retirado=[round(v, 2) for v in (ano['x0'], ano['y0'], ano['x1'], ano['y1'])],
                            original='2026', nota='Os 4 dígitos de "2026" foram retirados do modelo (só eles); o ano da emissão é escrito no mesmo ponto.'),
        'solicitante_posto': dict(x0=rd[0]['x0'], x1=rd[0]['x1'], base=rd[0]['base'], tam=T, alinhar='centro', min=7),
        'solicitante_numero': dict(x0=rd[1]['x0'], x1=rd[1]['x1'], base=rd[1]['base'], tam=T, alinhar='centro', min=7),
        'solicitante_nome': dict(x0=rn['x0'], x1=rn['x1'], base=rn['base'], tam=T, alinhar='centro', min=7),
        'servico_dia': dict(x0=rc[0]['x0'], x1=rc[0]['x1'], base=rc[0]['base'], tam=T, alinhar='centro', min=8),
        'servico_mes': dict(x0=rc[1]['x0'], x1=rc[1]['x1'], base=rc[1]['base'], tam=T, alinhar='centro', min=8),
        'servico_ano': dict(x0=rc[2]['x0'], x1=rc[2]['x1'], base=rc[2]['base'], tam=T, alinhar='centro', min=8),
        'inicio_hora': dict(x0=rc[3]['x0'], x1=rc[3]['x1'], base=rc[3]['base'], tam=T, alinhar='centro', min=8),
        'inicio_min': dict(x0=rc[4]['x0'], x1=rc[4]['x1'], base=rc[4]['base'], tam=T, alinhar='centro', min=8),
        'fim_hora': dict(x0=rc[5]['x0'], x1=rc[5]['x1'], base=rc[5]['base'], tam=T, alinhar='centro', min=8),
        'fim_min': dict(x0=rc[6]['x0'], x1=rc[6]['x1'], base=rc[6]['base'], tam=T, alinhar='centro', min=8),
        'substituto': dict(x0=o_['x1'] + 1.5, x1=fim['x0'] - 4.0, base=fim['base'], tam=T, alinhar='esquerda', min=7,
                           nota='Entre "o" e "A fim de". O traço do modelo (Helvetica) passa sob "A fim de"; o texto termina 4 pt antes da justificativa e recebe ponto final.'),
    }
    for a in areas.values():
        for k in ('x0', 'x1', 'base'):
            a[k] = round(a[k], 2)
    protegidas = {
        'autorizo_em': [round(v, 2) for v in (autorizo['x0'], autorizo['y0'], autorizo['x1'], autorizo['y1'])],
        'comandante': [41.0, 430.0, 200.0, 457.0],
        'assinatura_solicitante': [100.0, 362.0, 262.0, 390.0],
        'assinatura_substituto': [335.0, 362.0, 497.0, 390.0],
        'justificativa': [round(just['x0'], 2), round(just['y0'], 2), round(just['x1'], 2), round(just['y1'], 2)],
    }
    dados = dict(pagina=[round(W, 2), round(H, 2)], areas=areas, protegidas=protegidas)
    os.makedirs(os.path.join(RAIZ, 'js', 'permuta'), exist_ok=True)
    open(os.path.join(RAIZ, 'js', 'permuta', 'coordenadas.js'), 'w', encoding='utf-8').write(
        '// GERADO por dev/preparar_permuta.py a partir de templates/permuta.pdf — não editar à mão.\n'
        '// Coordenadas no sistema do PyMuPDF (origem no TOPO esquerdo, em pontos).\n'
        '// base = linha de base do texto; x0/x1 = espaço disponível; apagar = retângulo coberto de branco.\n'
        f'export const PERMUTA = {json.dumps(dados, ensure_ascii=False, indent=1)};\n')

    # ---- retira do modelo SOMENTE os glifos de "Barão de Grajaú - MA" e "2026"
    # (redação de texto do PyMuPDF: remove os caracteres, não desenha nada por cima)
    doc.close()
    limpo = fitz.open(tmp)
    p0 = limpo[0]
    for k in ('emissao_local', 'emissao_ano'):
        x0, y0, x1, y1 = areas[k]['retirado']
        cy = (y0 + y1) / 2
        p0.add_redact_annot(fitz.Rect(x0 + 0.6, cy - 1.5, x1 - 0.6, cy + 1.5), fill=False)
    p0.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE, text=fitz.PDF_REDACT_TEXT_REMOVE)
    limpo.save(destino + '.2', garbage=0, deflate=True)
    limpo.close(); os.remove(tmp)
    # a redação deixa /Annots vazio e /PageMode; remove o que não existia no original
    with pikepdf.open(destino + '.2') as fin:
        if '/Annots' in fin.pages[0].obj:
            assert len(fin.pages[0].Annots) == 0
            del fin.pages[0].obj['/Annots']
        with pikepdf.open(orig) as o:
            if '/PageMode' in fin.Root and '/PageMode' not in o.Root:
                del fin.Root['/PageMode']
        fin.save(destino, deterministic_id=True)
    os.remove(destino + '.2')
    linha_emissao = [texto(l) for k, l in chars_por_linha(fitz.open(destino)[0]).items() if k[0] == round(local['base'])]
    linha_emissao = ''.join(linha_emissao)
    assert '2026' not in linha_emissao and 'Grajaú' not in linha_emissao and '_____ de' in linha_emissao and 'de .' in linha_emissao.replace('  ', ' '), linha_emissao
    print('  linha de emissão no modelo limpo:', repr(linha_emissao.strip()))
    pg = fitz.open(destino)[0]

    # documentação
    md = ['# Mapeamento da Solicitação de Permuta de Serviço', '',
          'Gerado por `dev/preparar_permuta.py`. Modelo: `templates/permuta.pdf` (A4 retrato, '
          f'{W:.1f} × {H:.1f} pt, 1 página, sem campos de formulário).', '',
          'Coordenadas em pontos, origem no **topo** esquerdo (PyMuPDF). `base` é a linha de base do texto.', '',
          '| área | x0 | x1 | base | alinhamento | fonte (mín.) | observação |', '|---|---|---|---|---|---|---|']
    for k, a in areas.items():
        md.append(f"| `{k}` | {a['x0']} | {a['x1']} | {a['base']} | {a['alinhar']} | {a['tam']} ({a['min']}) | {a.get('nota', '')} |")
    md += ['', '## Áreas que o sistema NUNCA preenche', '',
           'Verificadas nos testes: nenhum pixel muda nessas áreas no PDF gerado.', '',
           '| área | retângulo [x0, y0, x1, y1] |', '|---|---|']
    for k, v in protegidas.items():
        md.append(f'| {k} | {v} |')
    md += ['', '## Normalização do modelo', '',
           '* Removido o `/AcroForm` vazio com `/SigFlags 3` (indicava, sem verdade, que o arquivo já tinha assinaturas e só aceitava anexação).',
           '* Retirados **somente** os glifos de "Barão de Grajaú - MA" e "2026" da linha de emissão (o gerador sempre escreve o local e o ano). Assim o texto antigo não fica escondido sob o novo.',
           '* Mantido o manifesto C2PA ("Content Credentials") que veio no arquivo (declaração de procedência; não contém dados pessoais).',
           '* Todo o resto da página é idêntico ao original (comparação pixel a pixel fora das duas áreas retiradas).', '']
    open(os.path.join(RAIZ, 'docs', 'MAPEAMENTO_PERMUTA.md'), 'w', encoding='utf-8').write('\n'.join(md))

    # verificação visual: idêntico ao original
    from PIL import Image, ImageChops
    from PIL import ImageDraw
    a = fitz.open(orig)[0].get_pixmap(dpi=72); b = pg.get_pixmap(dpi=72)
    ia = Image.frombytes('RGB', (a.width, a.height), a.samples); ib = Image.frombytes('RGB', (b.width, b.height), b.samples)
    diff = ImageChops.difference(ia, ib).convert('L')
    d = ImageDraw.Draw(diff)
    for k in ('emissao_local', 'emissao_ano'):
        x0, y0, x1, y1 = areas[k]['retirado']; d.rectangle([x0 - 1, y0 - 1, x1 + 1, y1 + 1], fill=0)
    assert diff.point(lambda v: 255 if v > 30 else 0).getbbox() is None, 'modelo limpo difere do original fora das áreas retiradas'
    print('OK: templates/permuta.pdf, js/permuta/coordenadas.js, docs/MAPEAMENTO_PERMUTA.md')


if __name__ == '__main__':
    main()
