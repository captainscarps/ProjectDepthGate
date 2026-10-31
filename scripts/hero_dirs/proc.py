# Uso: python3 scripts/hero_dirs/proc.py <pasta com src.png (grade 4x7 gerada pela IA)>
import sys
from PIL import Image
import numpy as np
from collections import deque
from scipy import ndimage
D=''+__import__("sys").argv[1]+'/'
im=np.array(Image.open(D+'src.png').convert('RGB')).astype(int)
H,W,_=im.shape
mn=im.min(2);mx=im.max(2)
bgc=(mn>188)&((mx-mn)<28)
# flood fill do fundo a partir das bordas e da coluna de rótulos
lab,n=ndimage.label(bgc)
edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
bg=np.isin(lab,list(edge))
fg=~bg
fg[:, :148]=False
# limpa ruído
fg=ndimage.binary_opening(fg,iterations=1)
# corta a franja clara que o fundo deixa na borda do desenho
fg=ndimage.binary_erosion(fg,iterations=2)
fl,fn=ndimage.label(ndimage.binary_dilation(fg,iterations=4))
objs=ndimage.find_objects(fl)
sprites=[]
for k,sl in enumerate(objs):
    ys,xs=sl;h=ys.stop-ys.start;w=xs.stop-xs.start
    if h<80 or w<40:continue
    sprites.append((ys.start,xs.start,ys.stop,xs.stop,k+1))
sprites.sort(key=lambda s:(round(s[0]/240),s[1]))
print(len(sprites),[ (s[0],s[1],s[2]-s[0],s[3]-s[1]) for s in sprites])
np.save(D+'fg.npy',fg);np.save(D+'fl.npy',fl)
import json;json.dump(sprites,open(D+'sprites.json','w'))
