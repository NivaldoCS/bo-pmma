# -*- coding: utf-8 -*-
"""
Verificação independente (PyMuPDF + pikepdf) dos PDFs gerados em saida-testes/.
Rodar depois de `node dev/gerar_exemplos.mjs` e/ou `python3 tests/e2e_navegador.py`:
    python3 tests/verificar_pdfs.py

Confere:
  * tamanho/orientação das páginas iguais aos modelos;
  * pixels FORA das áreas de campo idênticos aos do modelo (brasão, linhas,
    quadros, textos fixos, margens e espaços de assinatura preservados);
  * PDF editável: nomes únicos, todo widget ligado a uma página, todo campo
    preenchido com aparência (/AP) gerada;
  * cópia para impressão: nenhum campo restante e todos os valores do PDF
    editável correspondente presentes no texto da página;
  * nenhum dado dos PDFs originais (preenchimentos antigos) presente.
"""
import os, sys, glob, re
import fitz, pikepdf
from PIL import Image, ImageChops

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SAIDA = os.path.join(RAIZ, 'saida-testes')
MOD = {'bo': fitz.open(os.path.join(RAIZ, 'templates/bo.pdf')),
       'env': fitz.open(os.path.join(RAIZ, 'templates/envolvidos-veiculos.pdf'))}
def valores_antigos():
    # Lidos dos PDFs originais locais (pasta originais/, fora do repositório).
    vals = set()
    for f in glob.glob(os.path.join(RAIZ, 'originais', '*.pdf')):
        for p in fitz.open(f):
            for w in p.widgets():
                v = (w.field_value or '').strip()
                genericos = {'Barão de Grajaú', 'Brasileira', 'Furto de motocicleta'}
                if len(v) >= 4 and v.strip() not in genericos and not re.fullmatch(r'[\d/:\-]+', v):
                    vals.add(v)
    return sorted(vals)
ANTIGOS = valores_antigos()
if not ANTIGOS:
    print('Aviso: pasta originais/ ausente; a busca por dados antigos foi pulada.')
falhas = []

def ok(c, m):
    if not c:
        falhas.append(m); print('FALHA', m)

def pix(page, annots):
    p = page.get_pixmap(dpi=72, annots=annots)
    return Image.frombytes('RGB', (p.width, p.height), p.samples)

def mascara_campos(page_mod):
    rects = [w.rect for w in page_mod.widgets()]
    return [fitz.Rect(r.x0 - 3, r.y0 - 3, r.x1 + 3, r.y1 + 3) for r in rects]

def comparar_fixos(pg, pm, rotulo):
    a = pix(pm, False); b = pix(pg, True)
    ok(a.size == b.size, f'{rotulo}: tamanho de página diferente')
    if a.size != b.size: return
    diff = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 40 else 0)
    from PIL import ImageDraw
    d = ImageDraw.Draw(diff)
    for r in mascara_campos(pm): d.rectangle([r.x0, r.y0, r.x1, r.y1], fill=0)
    bbox = diff.getbbox()
    ok(bbox is None, f'{rotulo}: elementos fixos alterados em {bbox}')

def tipo_pagina(page):
    t = ' '.join(w.field_name or '' for w in page.widgets())
    return t

def verificar(caminho):
    nome = os.path.basename(caminho)
    doc = fitz.open(caminho)
    impressao = '_impressao' in nome
    texto_total = ''.join(p.get_text() for p in doc)
    for v in ANTIGOS:
        ok(v not in texto_total, f'{nome}: dado antigo "{v}" presente')
    # identifica cada página pelo par modelo/página (BO = 2 pág., ficha = 2 pág., continuação = 1+)
    pdf = pikepdf.open(caminho)
    nomes = []
    if not impressao:
        for f in pdf.Root.AcroForm.Fields:
            nomes.append(str(f.T))
            ok('/P' in f, f'{nome}: widget sem página {f.T}')
            if str(f.get('/V', '')):
                ok('/AP' in f and '/N' in f.AP, f'{nome}: campo preenchido sem aparência {f.T}')
        ok(len(nomes) == len(set(nomes)), f'{nome}: nomes de campo duplicados')
        widgets_pag = sum(len(p.get('/Annots', [])) for p in pdf.pages)
        ok(widgets_pag == len(nomes), f'{nome}: widgets das páginas ({widgets_pag}) != /Fields ({len(nomes)})')
    else:
        ok(len(list(doc[0].widgets())) == 0 and '/AcroForm' not in pdf.Root or len(pdf.Root.AcroForm.get('/Fields', [])) == 0,
           f'{nome}: cópia de impressão ainda tem campos')
    # comparação visual por página, usando o tamanho/conteúdo para casar com o modelo
    i = 0
    while i < len(doc):
        pg = doc[i]
        txt = pg.get_text()
        if 'FOLHA DE CONTINUAÇÃO' in txt:
            ok(re.search(r'Nº CIOPS/COPOM: \S+', txt) is not None, f'{nome} p{i+1}: continuação sem identificação do BO')
            i += 1; continue
        # BO tem 595x841; envolvidos 595.28x841.89
        chave = 'bo' if abs(pg.rect.height - 841) < 0.5 else 'env'
        for k in range(2):
            comparar_fixos(doc[i + k], MOD[chave][k], f'{nome} p{i+k+1} ({chave} pág. {k+1})')
        i += 2
    return nomes

def main():
    arquivos = sorted(glob.glob(os.path.join(SAIDA, '*.pdf')))
    ok(arquivos, 'nenhum PDF em saida-testes/ (rode dev/gerar_exemplos.mjs)')
    for a in arquivos:
        verificar(a)
        print('verificado', os.path.basename(a))
    # impressão x editável: todos os valores presentes
    for ed in arquivos:
        if '_impressao' in ed: continue
        imp = ed.replace('.pdf', '_impressao.pdf')
        if not os.path.exists(imp): continue
        de, di = fitz.open(ed), fitz.open(imp)
        texto = re.sub(r'\s+', ' ', ''.join(p.get_text() for p in di))
        faltando = []
        for p in de:
            for w in p.widgets():
                v = (w.field_value or '').strip()
                if not v: continue
                for trecho in re.split(r'\s+', v)[:3]:
                    if trecho not in texto: faltando.append((w.field_name, trecho))
        ok(not faltando, f'{os.path.basename(imp)}: valores ausentes na cópia de impressão {faltando[:5]}')
        print('impressão confere com editável:', os.path.basename(imp))
    print(f'\n{len(falhas)} falha(s)')
    sys.exit(1 if falhas else 0)

if __name__ == '__main__':
    main()
