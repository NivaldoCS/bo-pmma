# -*- coding: utf-8 -*-
"""
Verificação independente (PyMuPDF + pikepdf) das solicitações de permuta
geradas em saida-testes/ (permuta_*.pdf e e2e_permuta_*.pdf).

    node dev/gerar_exemplo_permuta.mjs && python3 tests/verificar_permuta.py

Confere em cada arquivo:
  * 1 página, mesmo tamanho do modelo, sem /AcroForm, sem anotações/campos,
    sem criptografia, senha ou permissões (/Encrypt, /Perms);
  * NENHUM pixel muda fora das áreas de preenchimento — em especial
    "Autorizo em", área do comandante, assinaturas, justificativa, brasões e
    cabeçalho;
  * o texto do substituto termina antes de "A fim de" (sem sobreposição);
  * não há "2026" escondido quando o ano de emissão é outro.
"""
import os, sys, glob, re, json
import fitz, pikepdf
from PIL import Image, ImageChops, ImageDraw

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SAIDA = os.path.join(RAIZ, 'saida-testes')
MODELO = os.path.join(RAIZ, 'templates', 'permuta.pdf')
coord = open(os.path.join(RAIZ, 'js', 'permuta', 'coordenadas.js'), encoding='utf-8').read()
P = json.loads(coord[coord.index('{'):coord.rindex('}') + 1])
falhas = []
silencioso = False

def ok(c, m):
    if not c:
        falhas.append(m)
        if not silencioso: print('FALHA', m)

def img(page, dpi=100):
    p = page.get_pixmap(dpi=dpi)
    return Image.frombytes('RGB', (p.width, p.height), p.samples)

def verificar(caminho):
    nome = os.path.basename(caminho)
    pdf = pikepdf.open(caminho)
    ok(not pdf.is_encrypted, f'{nome}: criptografado')
    ok('/Encrypt' not in pdf.trailer, f'{nome}: /Encrypt no trailer')
    ok('/Perms' not in pdf.Root, f'{nome}: /Perms (restrições) presente')
    ok('/AcroForm' not in pdf.Root, f'{nome}: /AcroForm presente')
    ok(len(pdf.pages) == 1, f'{nome}: número de páginas')
    an = pdf.pages[0].obj.get('/Annots')
    ok(an is None or len(an) == 0, f'{nome}: há anotações/campos')
    doc = fitz.open(caminho); pg = doc[0]; md = fitz.open(MODELO)[0]
    ok(pg.rect == md.rect, f'{nome}: tamanho da página diferente do modelo')
    ok(len(list(pg.widgets())) == 0, f'{nome}: widgets presentes')
    # pixels: só podem mudar dentro das áreas de preenchimento
    escala = 100 / 72
    a = img(md); b = img(pg)
    diff = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 40 else 0)
    d = ImageDraw.Draw(diff)
    for k, ar in P['areas'].items():
        d.rectangle([(ar['x0'] - 2) * escala, (ar['base'] - 11) * escala, (ar['x1'] + 2) * escala, (ar['base'] + 3) * escala], fill=0)
    ok(diff.getbbox() is None, f'{nome}: pixels alterados fora das áreas de preenchimento em {diff.getbbox()}')
    # áreas protegidas: diferença zero, com tolerância nenhuma
    bruto = ImageChops.difference(a, b).convert('L')
    for k, r in P['protegidas'].items():
        caixa = tuple(int(v * escala) for v in r)
        ok(bruto.crop(caixa).getbbox() is None, f'{nome}: área protegida "{k}" foi alterada')
    # brasões e cabeçalho (topo da página até antes da linha de emissão)
    ok(bruto.crop((0, 0, int(595 * escala), int(190 * escala))).getbbox() is None, f'{nome}: brasões/cabeçalho alterados')
    # substituto não invade a justificativa
    fim = P['protegidas']['justificativa'][0]
    base = P['areas']['substituto']['base']
    palavras = [w for w in pg.get_text('words') if abs(w[3] - base) < 4 and w[0] < fim - 1
                and not set(w[4]) <= {'_'} and w[4] != 'o']  # ignora o traço do próprio modelo e o "o" fixo
    ok(all(w[2] <= fim - 1.0 for w in palavras), f'{nome}: identificação do substituto encosta/sobrepõe "A fim de"')
    texto = pg.get_text()
    if '2027' in nome:  # exemplo com emissão e serviço em 2027
        ok('2026' not in texto, f'{nome}: "2026" escondido no texto')
    return texto

def main():
    arqs = sorted(glob.glob(os.path.join(SAIDA, 'permuta_*.pdf')) + glob.glob(os.path.join(SAIDA, 'e2e_*Permuta*.pdf')))
    ok(arqs, 'nenhum PDF de permuta em saida-testes/')
    for a in arqs:
        verificar(a); print('verificado', os.path.basename(a))
    # teste negativo: alterar a área do comandante tem de ser detectado
    if arqs:
        d = fitz.open(arqs[0]); d[0].insert_text((60, 440), 'X', fontsize=10)
        neg = os.path.join(SAIDA, 'negativo_permuta.tmp.pdf'); d.save(neg)
        global silencioso
        antes = len(falhas); silencioso = True; verificar(neg); silencioso = False
        detectou = len(falhas) > antes
        del falhas[antes:]
        os.remove(neg)
        ok(detectou, 'teste negativo: alteração na área do comandante não foi detectada')
        print('teste negativo: alteração proposital detectada' if detectou else '')
    print(f'\n{len(falhas)} falha(s)')
    sys.exit(1 if falhas else 0)

if __name__ == '__main__':
    main()
