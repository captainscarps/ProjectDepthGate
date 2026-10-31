# Uso: python3 scripts/hero_dirs/build.py <mesma pasta>  -> gera <classe>-pack-t0-dirs.png (hoje: Draven/warrior)
import json
from PIL import Image
import numpy as np
from scipy import ndimage
D=''+__import__("sys").argv[1]+'/'
C='/home/claude/projectdepthgate/assets/pixel-art/characters/'
src=np.array(Image.open(D+'src.png').convert('RGB'))
fg=np.load(D+'fg.npy');fl=np.load(D+'fl.npy');S=json.load(open(D+'sprites.json'))
# paleta do Draven original
o=np.array(Image.open(C+'warrior-pack-t0-body.png').convert('RGBA'))
pal=o[o[...,3]>200][:,:3];pal=np.unique(pal,axis=0).astype(int)
print('paleta',len(pal))
TARGET=64  # altura do Draven no jogo (perfil)
hs=[]
for (y0,x0,y1,x1,k) in S[:7]:
    m=(fl[y0:y1,x0:x1]==k)&fg[y0:y1,x0:x1];ys=np.where(m.any(1))[0];hs.append(ys[-1]-ys[0]+1)
sc=TARGET/np.median(hs);print('escala',sc,hs)
cells=[]
for (y0,x0,y1,x1,k) in S:
    m=((fl[y0:y1,x0:x1]==k)&fg[y0:y1,x0:x1])
    rgba=np.zeros((y1-y0,x1-x0,4),np.uint8);rgba[...,:3]=src[y0:y1,x0:x1];rgba[...,3]=m*255
    I=Image.fromarray(rgba);w,h=I.size;nw,nh=max(1,round(w*sc)),max(1,round(h*sc))
    # média ponderada pelo alfa
    pre=np.array(I).astype(float);pre[...,:3]*=pre[...,3:4]/255
    P=Image.fromarray(pre.astype(np.uint8)).resize((nw,nh),Image.BOX);A=np.array(I.getchannel('A').resize((nw,nh),Image.BOX)).astype(float)
    P=np.array(P).astype(float);rgb=np.where(A[...,None]>0,P[...,:3]*255/np.maximum(A[...,None],1),0)
    a=A>110
    q=rgb.reshape(-1,3);d=((q[:,None,:]-pal[None,:,:])**2).sum(2);idx=d.argmin(1);q=pal[idx].reshape(rgb.shape)
    out=np.zeros((nh,nw,4),np.uint8);out[...,:3]=q;out[...,3]=a*255
    # contorno escuro de 1px onde a borda ficou clara
    cells.append(out)
def place(out):
    a=out[...,3]>0;ys,xs=np.where(a);
    top,bot=ys.min(),ys.max();h=bot-top+1
    band=a[top:top+int(h*.2)];cx=np.where(band.any(0))[0];cxm=(cx.min()+cx.max())/2
    cell=np.zeros((128,128,4),np.uint8);ox=int(round(64-cxm));oy=118-bot
    H,W=a.shape
    for y in range(H):
        ty=y+oy
        if 0<=ty<128:
            for x in range(W):
                tx=x+ox
                if 0<=tx<128 and out[y,x,3]: cell[ty,tx]=out[y,x]
    return cell
def outline(cell):
    a=cell[...,3]>0;dark=pal[np.argmin(pal.sum(1))]
    nb=np.zeros_like(a)
    for dy,dx in((1,0),(-1,0),(0,1),(0,-1)):nb|=~np.roll(np.roll(a,dy,0),dx,1)
    edge=a&nb;lum=cell[...,:3].astype(int).sum(2)
    m=edge&(lum>3*128);cell[m,:3]=dark
    return cell
sheet=Image.new('RGBA',(128*7,128*4),(0,0,0,0))
for i,c in enumerate(cells):
    r,cI=divmod(i,7);sheet.paste(Image.fromarray(outline(place(c))),(cI*128,r*128))
sheet.save(D+'warrior-pack-t0-dirs.png')
prev=Image.new('RGBA',sheet.size,(70,74,82,255));prev.alpha_composite(sheet);prev.resize((sheet.width*2,sheet.height*2),Image.NEAREST).save(D+'preview.png')
