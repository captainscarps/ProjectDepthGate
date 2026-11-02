"""
Pajé (sprites gerados enviados pelo usuário): recorte limpo, sem fundo e sem franja clara nas bordas.
Folhas de origem: PAJE_A (parado, sentado falando, retratos) e PAJE_B (andando, sentando, troncos).
Gera assets/pixel-art/npc/paje.png (+ .json com linhas/quadros), paje-logs.png e paje-p-<expressão>.png.
Uso: PAJE_A=folha1.png PAJE_B=folha2.png python3 scripts/build_paje.py
"""
import os, sys, json
import numpy as np
from PIL import Image
from scipy import ndimage

def clean(path):
    a = np.array(Image.open(path).convert('RGBA')).astype(np.int32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mn, mx = np.minimum(np.minimum(r, g), b), np.maximum(np.maximum(r, g), b)
    whiteish = (mn > 215) & (mx - mn < 35)
    lab, n = ndimage.label(whiteish)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = ndimage.sum(whiteish, lab, range(1, n + 1))
    kill = np.zeros(n + 1, bool); kill[1:] = sizes > 180
    for k in border: kill[k] = True
    alpha = np.where(kill[lab], 0, 255)
    # franja clara: pixels claros e pouco saturados encostados no transparente
    for _ in range(3):
        tr = alpha == 0
        edge = (alpha > 0) & ndimage.binary_dilation(tr)
        light = (mn > 175) & (mx - mn < 45)
        alpha = np.where(edge & light, 0, alpha)
    a[..., 3] = alpha
    return a

def downscale(a, box, F):
    x, y, w, h = box
    c = a[y:y + h, x:x + w].astype(np.float64)
    al = c[..., 3:4] / 255.0
    pm = c.copy(); pm[..., :3] *= al  # premultiplica
    nw, nh = max(1, round(w / F)), max(1, round(h / F))
    im = Image.fromarray(np.clip(pm, 0, 255).astype(np.uint8), 'RGBA')
    # redimensiona canais premultiplicados separadamente
    chans = [np.array(Image.fromarray(np.clip(pm[..., i], 0, 255).astype(np.uint8), 'L').resize((nw, nh), Image.BOX)).astype(np.float64) for i in range(4)]
    A = chans[3]
    out = np.zeros((nh, nw, 4), np.uint8)
    keep = A >= 128
    for i in range(3):
        out[..., i] = np.where(keep, np.clip(chans[i] / np.maximum(A, 1) * 255, 0, 255), 0)
    out[..., 3] = np.where(keep, 255, 0)
    # última passada: tira pixel claro e cinza na borda
    o = out.astype(np.int32); mn = o[..., :3].min(2); mx = o[..., :3].max(2)
    edge = keep & ndimage.binary_dilation(~keep)
    bad = edge & (mn > 185) & (mx - mn < 40)
    out[bad] = 0
    return Image.fromarray(out, 'RGBA')

def boxes_of(a, min_area=4000):
    fg = a[..., 3] > 0
    lab, n = ndimage.label(ndimage.binary_closing(fg, iterations=3))
    out = []
    for s in ndimage.find_objects(lab):
        w, h = s[1].stop - s[1].start, s[0].stop - s[0].start
        if w * h > min_area: out.append((s[1].start, s[0].start, w, h))
    return out
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTS = [os.path.join(ROOT, 'assets', 'pixel-art', 'npc'), os.path.join(ROOT, 'Projeto atualizado', 'assets', 'pixel-art', 'npc')]
new = clean(os.environ.get('PAJE_B', '/tmp/pj2/b.png'))
old = clean(os.environ.get('PAJE_A', '/tmp/pj2/a.png'))
def comp(a, box):
    x,y,w,h=box; sub=a[y:y+h,x:x+w].copy(); fg=sub[...,3]>0
    lab,n=ndimage.label(ndimage.binary_dilation(fg,iterations=2))
    if n>1:
        sz=ndimage.sum(fg,lab,range(1,n+1)); k=1+int(np.argmax(sz)); sub[~(lab==k)]=0
    out=a.copy(); out[y:y+h,x:x+w]=sub; return out
walkB=[(26, 29, 226, 318), (238, 30, 211, 314), (428, 30, 208, 317), (611, 34, 208, 317), (794, 36, 206, 313), (976, 34, 201, 314), (1160, 34, 194, 314), (1332, 32, 201, 318)]
cuts=[18,234,433,628,851,1057,1278,1515]
sitB=[(cuts[i],366,cuts[i+1]-cuts[i],394) for i in range(7)]
logB=[(16, 826, 296, 113), (321, 813, 301, 126), (630, 830, 288, 107), (945, 823, 287, 116), (1254, 823, 263, 116)]
oldTalk=[(38, 395, 308, 313), (426, 396, 324, 312), (802, 395, 308, 308), (1186, 390, 304, 313)]
oldStand=[(1026, 31, 200, 340), (1278, 14, 215, 360)]
heads=[(18, 725, 234, 263), (278, 717, 237, 271), (538, 728, 218, 256), (779, 720, 237, 268), (1058, 721, 226, 263), (1309, 731, 198, 256)]
FN,FO=6.6,7.1
def frames(a,bs,F):
    out=[]
    for b in bs:
        t=downscale(comp(a,b),b,F)
        arr=np.array(t); ys,xs=np.where(arr[...,3]>0); out.append(t.crop((xs.min(),ys.min(),xs.max()+1,ys.max()+1)))
    return out
rows={'walk':frames(new,walkB,FN),'sitdown':frames(new,sitB,FN),'talk':frames(old,oldTalk,FO),'idle':frames(old,oldStand,FO)}
FW=max(t.width for r in rows.values() for t in r)+2; FH=max(t.height for r in rows.values() for t in r)+1
order=['walk','sitdown','talk','idle']; maxn=max(len(rows[k]) for k in order)
sheet=Image.new('RGBA',(FW*maxn,FH*len(order))); meta={'fw':FW,'fh':FH}
for ri,k in enumerate(order):
    meta[k]=[ri*maxn, len(rows[k])]
    for i,t in enumerate(rows[k]): sheet.paste(t,(i*FW+(FW-t.width)//2,(ri+1)*FH-t.height),t)
[ (os.makedirs(o,exist_ok=True), sheet.save(os.path.join(o,'paje.png')), json.dump(meta,open(os.path.join(o,'paje.json'),'w'))) for o in OUTS ]; print(sheet.size,meta)
logs=frames(new,logB,FN); LW=max(t.width for t in logs); LH=max(t.height for t in logs)
ls=Image.new('RGBA',(LW*len(logs),LH))
for i,t in enumerate(logs): ls.paste(t,(i*LW+(LW-t.width)//2,LH-t.height),t)
[ls.save(os.path.join(o,'paje-logs.png')) for o in OUTS]
for b,ex in zip(heads,['calm','aggression','sadness','talk','special','smile']):
    F=max(b[2],b[3])/118; t=downscale(old,b,F); pp=Image.new('RGBA',(128,128)); pp.paste(t,((128-t.width)//2,128-t.height),t); [pp.save(os.path.join(o,f'paje-p-{ex}.png')) for o in OUTS]
