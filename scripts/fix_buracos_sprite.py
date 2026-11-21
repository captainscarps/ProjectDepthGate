"""Tapa buracos transparentes dentro da silhueta de um sprite sheet (p216.83 — roupa da Guardiã).
Por quadro: fechamento 5x5 + preenchimento de buracos da máscara, erosão de 1 px para não engordar a borda,
e depois pinta os pixels novos com a cor média dos vizinhos (4-vizinhos, iterativo).
Uso: python3 scripts/fix_buracos_sprite.py entrada.png saida.png largura_do_quadro
Originais guardados em scripts/art-src/guardia-orig/."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage
def fix(path,out,fw,k=5):
    a=np.array(Image.open(path).convert('RGBA')); A=a[...,3]>0; o=a.copy()
    for x0 in range(0,a.shape[1],fw):
        m=A[:,x0:x0+fw]
        if not m.any(): continue
        c=ndimage.binary_fill_holes(ndimage.binary_closing(m,structure=np.ones((k,k))))
        core=ndimage.binary_erosion(c,iterations=1)
        todo=core&~m; sub=o[:,x0:x0+fw]; known=m.copy()
        for it in range(60):
            if not todo.any(): break
            acc=np.zeros(sub.shape[:2]+(3,)); cnt=np.zeros(sub.shape[:2])
            for dy,dx in ((0,1),(0,-1),(1,0),(-1,0)):
                kk=np.roll(np.roll(known,dy,0),dx,1); cc=np.roll(np.roll(sub[...,:3].astype(float),dy,0),dx,1)
                acc+=cc*kk[...,None]; cnt+=kk
            can=todo&(cnt>0); sub[can,:3]=(acc[can]/cnt[can][:,None]).round(); sub[can,3]=255; known|=can; todo&=~can
    Image.fromarray(o).save(out)
fix(sys.argv[1],sys.argv[2],int(sys.argv[3]))
