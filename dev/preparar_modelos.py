# -*- coding: utf-8 -*-
"""
Prepara os MODELOS LIMPOS a partir dos PDFs originais (que contêm dados de
ocorrências anteriores e NÃO devem ir para o repositório).

Uso (somente no computador de desenvolvimento):
    pip install pikepdf pymupdf
    python3 dev/preparar_modelos.py originais/bo.pdf originais/envolvidos.pdf

Gera:
    templates/bo.pdf
    templates/envolvidos-veiculos.pdf
    templates/campos.json        (mapeamento usado pelo gerador)
    docs/MAPEAMENTO.md           (mapeamento documentado)

O que é feito:
  * remove /V, /DV, /AP (aparências antigas) e metadados de edição do iOS;
  * renomeia cada campo para um nome semântico (ver dev/mapa_campos.py);
  * define fonte padrão Helvetica (/Helv) no /DR do formulário;
  * adiciona campos sobre espaços impressos que não tinham campo;
  * remove marcadores e metadados de autoria;
  * regrava o arquivo inteiro (objetos órfãos não são copiados);
  * verifica que nenhum valor antigo ficou visível ou recuperável.
"""
import sys, os, json, re, zlib, subprocess, tempfile
import pikepdf
from pikepdf import Name, Dictionary, Array, String
import fitz

sys.path.insert(0, os.path.dirname(__file__))
from mapa_campos import (BO_AVULSOS, BO_ADICIONADOS, BO_GRADE_P0, BO_GRADE_P1,
                         C, CM, ENV, slug)

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
COR = '0.004 0.341 0.608 rg'   # azul usado nos preenchimentos originais


def resolver_grade(doc_fitz, page_idx, grade, colunas, prefixo, usados):
    """Associa cada (linha, coluna) da grade a exatamente um campo pelo retângulo."""
    res = {}
    widgets = [w for w in doc_fitz[page_idx].widgets() if w.rect.width < 20]
    for grupo, y, itens in grade:
        for col, rotulo in itens:
            x = colunas[col]
            cand = [w for w in widgets if abs(w.rect.y0 - y) <= 4 and abs(w.rect.x0 - x) <= 4
                    and w.field_name not in usados]
            if len(cand) != 1:
                raise SystemExit(f'Grade ambígua: {grupo} y={y} col={col} -> {[c.field_name for c in cand]}')
            nome = cand[0].field_name
            usados.add(nome)
            res[nome] = (f'{prefixo}{grupo}__{slug(rotulo)}', f'[X] {grupo.replace("_"," ").title()}: {rotulo}', grupo, rotulo)
    return res


def coletar_valores_antigos(pdf):
    vals = set()
    for f in pdf.Root.AcroForm.Fields:
        v = f.get('/V')
        if v is not None:
            s = str(v).strip()
            if len(s) >= 3:
                vals.add(s)
    return vals


def limpar(orig, destino, mapa, adicionados, tipo_doc):
    pdf = pikepdf.open(orig)
    antigos = coletar_valores_antigos(pdf)
    for p in pdf.pages:
        for a in p.get('/Annots', []):
            v = a.get('/V')
            if v is not None and len(str(v).strip()) >= 3:
                antigos.add(str(v).strip())
    # DEFEITO ENCONTRADO NOS ORIGINAIS: o iOS (Quartz PDFContext) regravou o
    # formulário com /AcroForm/Fields apontando para CÓPIAS dos widgets, e não
    # para as anotações que aparecem nas páginas. Uma biblioteca de formulário
    # alteraria as cópias e a página continuaria mostrando o valor antigo.
    # Normalização: /Fields passa a apontar para os widgets reais das páginas;
    # as cópias desconectadas deixam de ser referenciadas e não são gravadas.
    copias = {str(f.T): f for f in pdf.Root.AcroForm.Fields}
    widgets = []
    for p in pdf.pages:
        for a in p.get('/Annots', []):
            assert a.get('/Subtype') == Name.Widget, 'anotação que não é campo'
            assert '/Parent' not in a and '/Kids' not in a
            a.P = p.obj
            widgets.append(a)
    nomes_w = [str(a.T) for a in widgets]
    assert sorted(nomes_w) == sorted(copias), 'widgets e /Fields não correspondem'
    desconectados = sum(1 for a in widgets if copias[str(a.T)].objgen != a.objgen)
    print(f'  {os.path.basename(orig)}: {desconectados}/{len(widgets)} campos de /Fields eram cópias desconectadas -> religados')
    pdf.Root.AcroForm.Fields = Array(widgets)
    fields = widgets

    nomes_orig = [str(f.T) for f in fields]
    assert len(set(nomes_orig)) == len(nomes_orig), 'nomes duplicados no original'
    faltando = [n for n in nomes_orig if n not in mapa]
    sobrando = [n for n in mapa if n not in nomes_orig]
    if faltando or sobrando:
        raise SystemExit(f'Mapeamento incompleto. faltando={faltando} sobrando={sobrando}')
    novos = [mapa[n][0] for n in nomes_orig]
    assert len(set(novos)) == len(novos), 'nomes novos duplicados'

    # página de cada campo
    pagina_de = {}
    for i, p in enumerate(pdf.pages):
        for a in p.get('/Annots', []):
            pagina_de[a.objgen] = i

    campos_json = []
    for f in fields:
        orig_nome = str(f.T)
        novo, rotulo = mapa[orig_nome][0], mapa[orig_nome][1]
        for k in ['/V', '/DV', '/AP', '/AAPL:AKExtras', '/AS', '/RV', '/DS']:
            if k in f:
                del f[k]
        r = [float(x) for x in f.Rect]
        w, h = r[2] - r[0], r[3] - r[1]
        marca = w < 20 and not orig_nome.endswith(('3fext', '117uhwi'))
        multi = orig_nome.startswith('textarea_')
        if marca:
            fs = 11
            f.Q = 1
        elif multi:
            fs = 10
        else:
            fs = max(6, min(10, round(h * 0.72)))
        f.DA = String(f'/Helv {fs} Tf {COR}')
        f.Ff = 4096 if multi else 0
        f.T = String(novo)
        f.F = 4
        f.MK = Dictionary()
        f.BS = Dictionary(W=0)
        f.Border = Array([0, 0, 0])
        campos_json.append(dict(nome=novo, original=orig_nome, pagina=pagina_de[f.objgen],
                                rect=[round(v, 2) for v in r], tipo='marca' if marca else 'texto',
                                multilinha=multi, fonte=fs, rotulo=rotulo,
                                grupo=mapa[orig_nome][2] if len(mapa[orig_nome]) > 2 else None,
                                opcao=mapa[orig_nome][3] if len(mapa[orig_nome]) > 3 else None,
                                adicionado=False))

    # campos adicionados sobre espaço impresso sem campo
    for nome, pag, (x0, y0, x1, y1), fs, multi, rotulo in adicionados:
        page = pdf.pages[pag]
        H = float(page.MediaBox[3])
        rect = [x0, H - y1, x1, H - y0]
        campo = pdf.make_indirect(Dictionary(
            Type=Name.Annot, Subtype=Name.Widget, FT=Name.Tx, T=String(nome),
            Rect=Array(rect), F=4, Ff=4096 if multi else 0,
            DA=String(f'/Helv {fs} Tf {COR}'), MK=Dictionary(), BS=Dictionary(W=0),
            Border=Array([0, 0, 0]), P=page.obj))
        page.obj.Annots.append(campo)
        pdf.Root.AcroForm.Fields.append(campo)
        campos_json.append(dict(nome=nome, original=None, pagina=pag, rect=rect, tipo='texto',
                                multilinha=multi, fonte=fs, rotulo=rotulo, grupo=None, opcao=None,
                                adicionado=True))

    helv = pdf.make_indirect(Dictionary(Type=Name.Font, Subtype=Name.Type1,
                                        BaseFont=Name.Helvetica, Encoding=Name.WinAnsiEncoding))
    af = pdf.Root.AcroForm
    af.DR = Dictionary(Font=Dictionary(Helv=helv))
    af.DA = String('/Helv 0 Tf 0 g')
    af.NeedAppearances = True
    # DADOS OCULTOS DO iOS: as páginas trazem /AAPL:PPK e /AAPL:PPKHash (estado de
    # desenho do Apple PencilKit). Não aparecem na página, mas ficariam no arquivo.
    for p in pdf.pages:
        for k in [k for k in p.obj.keys() if k.startswith('/AAPL')]:
            del p.obj[k]
    if '/Outlines' in pdf.Root:
        del pdf.Root['/Outlines']
    if '/PageMode' in pdf.Root:
        del pdf.Root['/PageMode']
    with pdf.open_metadata(set_pikepdf_as_editor=False) as m:
        pass
    pdf.docinfo = pdf.make_indirect(Dictionary(
        Title=String('Boletim de Ocorrência PMMA 2026 - modelo limpo' if tipo_doc == 'bo'
                     else 'Dos envolvidos e dos veículos PMMA 2026 - modelo limpo'),
        Producer=String('modelo limpo - preparar_modelos.py')))
    if '/Metadata' in pdf.Root:
        del pdf.Root['/Metadata']
    pdf.remove_unreferenced_resources()
    pdf.save(destino, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate,
             fix_metadata_version=False, deterministic_id=True)
    return campos_json, antigos


def verificar_sem_dados(destino, antigos, extras):
    """Procura valores antigos no arquivo: bytes crus, streams descompactados,
    strings em UTF-16 e texto extraído das páginas."""
    with tempfile.TemporaryDirectory() as t:
        qdf = os.path.join(t, 'x.pdf')
        subprocess.run(['qpdf', '--qdf', '--object-streams=disable', '--decode-level=all', destino, qdf], check=True)
        dados = open(qdf, 'rb').read()
    alvos = set(antigos) | set(extras)
    problemas = []
    for v in alvos:
        variantes = {v, v.strip()}
        for s in list(variantes):
            for enc in ['latin-1', 'utf-8', 'utf-16-be']:
                try:
                    b = s.encode(enc)
                except Exception:
                    continue
                if len(b) >= 4 and b in dados:
                    problemas.append((s, enc))
    doc = fitz.open(destino)
    texto = ' '.join(p.get_text() for p in doc)
    for v in alvos:
        if len(v) >= 4 and v in texto:
            problemas.append((v, 'texto-pagina'))
    for p in doc:
        for w in p.widgets():
            if (w.field_value or '').strip():
                problemas.append((w.field_name, 'valor-campo'))
    return problemas


def main():
    bo_orig, env_orig = sys.argv[1], sys.argv[2]
    os.makedirs(os.path.join(RAIZ, 'templates'), exist_ok=True)
    os.makedirs(os.path.join(RAIZ, 'docs'), exist_ok=True)

    # ---- BO
    dbo = fitz.open(bo_orig)
    usados = set(BO_AVULSOS)
    mapa_bo = {k: (v[0], v[1]) for k, v in BO_AVULSOS.items()}
    mapa_bo.update(resolver_grade(dbo, 0, BO_GRADE_P0, C, 'amb_', usados))
    mapa_bo.update(resolver_grade(dbo, 1, BO_GRADE_P1, CM, '', usados))
    destino_bo = os.path.join(RAIZ, 'templates', 'bo.pdf')
    campos_bo, antigos_bo = limpar(bo_orig, destino_bo, mapa_bo, BO_ADICIONADOS, 'bo')

    # ---- Envolvidos / veículos
    destino_env = os.path.join(RAIZ, 'templates', 'envolvidos-veiculos.pdf')
    campos_env, antigos_env = limpar(env_orig, destino_env, ENV, [], 'env')

    # Valores a procurar: todos os /V antigos (coletados acima), os metadados de
    # autoria dos originais e, opcionalmente, trechos extras listados em
    # originais/procurar.txt (um por linha). Nada disso fica no repositório.
    extras = ['PPKID', 'AAPL', 'crdt']
    for o in (bo_orig, env_orig):
        with pikepdf.open(o) as po:
            extras += [str(v) for k, v in po.docinfo.items() if k in ('/Author', '/Title') and len(str(v)) >= 4]
    arq = os.path.join(os.path.dirname(os.path.abspath(bo_orig)), 'procurar.txt')
    if os.path.exists(arq):
        extras += [l.strip() for l in open(arq, encoding='utf-8') if len(l.strip()) >= 4]
    erros = verificar_sem_dados(destino_bo, antigos_bo, extras) + verificar_sem_dados(destino_env, antigos_env, extras)
    if erros:
        raise SystemExit(f'DADOS ANTIGOS ENCONTRADOS: {erros}')

    json.dump({'versao': 1, 'bo': campos_bo, 'envolvidos': campos_env},
              open(os.path.join(RAIZ, 'templates', 'campos.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    escrever_md(campos_bo, campos_env)
    print(f'OK: BO {len(campos_bo)} campos, envolvidos {len(campos_env)} campos; '
          f'{len(antigos_bo) + len(antigos_env)} valores antigos verificados como ausentes.')


def escrever_md(campos_bo, campos_env):
    L = ['# Mapeamento dos campos dos modelos', '',
         'Gerado por `dev/preparar_modelos.py`. Coordenadas em pontos PDF (origem no canto inferior esquerdo, A4 ≈ 595 × 842).',
         '',
         '* **nome**: nome do campo no modelo limpo (usado pelo gerador; no PDF final recebe prefixo, ex. `BO.` ou `F1.`).',
         '* **original**: nome interno do campo no PDF recebido.',
         '* **tipo**: `texto` ou `marca` (os modelos usam campos de texto que recebem "X" como caixa de marcação).',
         '* Campos marcados como *adicionado* não existiam no original; foram criados sobre um espaço impresso do próprio formulário.',
         '']
    for titulo, campos in [('Boletim de Ocorrência (`templates/bo.pdf`)', campos_bo),
                           ('Dos Envolvidos e dos Veículos (`templates/envolvidos-veiculos.pdf`)', campos_env)]:
        L += [f'## {titulo}', '', '| pág. | nome | original | tipo | retângulo [x0, y0, x1, y1] | rótulo |', '|---|---|---|---|---|---|']
        for c in sorted(campos, key=lambda c: (c['pagina'], -c['rect'][3], c['rect'][0])):
            orig = c['original'] or '*adicionado*'
            tipo = c['tipo'] + (' multilinha' if c['multilinha'] else '')
            L.append(f"| {c['pagina']+1} | `{c['nome']}` | `{orig}` | {tipo} | {c['rect']} | {c['rotulo']} |")
        L.append('')
    open(os.path.join(RAIZ, 'docs', 'MAPEAMENTO.md'), 'w', encoding='utf-8').write('\n'.join(L))


if __name__ == '__main__':
    main()
