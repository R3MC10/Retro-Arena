# pixel-art helper: paint on a grid, outline, render zoomed sheets with the game's palette
from PIL import Image
PAL={'k':'#100c18','K':'#2c2638','g':'#5c566c','G':'#9a94a8','w':'#e8e4dc','W':'#ffffff','r':'#b8202c','R':'#f05050','d':'#6c1424','o':'#e06818','O':'#ffa040','y':'#f0c020','Y':'#fff07c',
 'n':'#7c4a24','N':'#b07038','m':'#462818','s':'#f0b888','S':'#c07850','b':'#2058c0','B':'#60a0ff','u':'#142870','c':'#30c8e0','C':'#a0f0ff','v':'#6838a8','V':'#b080f0',
 'l':'#38a038','L':'#88dc48','e':'#1c5c30','t':'#c49058','T':'#e8c088','D':'#8c5c34','M':'#5a3a20','p':'#f070c0','P':'#ffb0e0'}
def shades(h):
    c=[int(h[i:i+2],16) for i in (1,3,5)]
    f=lambda k:'#'+''.join('%02x'%round(max(0,min(255,v+(255-v)*k if k>0 else v*(1+k)))) for v in c)
    return {'1':f(.38),'2':h,'3':f(-.42)}
class Grid:
    def __init__(s,w,h): s.w,s.h=w,h; s.p=[['.']*w for _ in range(h)]
    def set(s,x,y,c):
        if 0<=x<s.w and 0<=y<s.h: s.p[y][x]=c
    def rect(s,x0,y0,x1,y1,c):
        for y in range(y0,y1+1):
            for x in range(x0,x1+1): s.set(x,y,c)
    def line(s,x0,y0,x1,y1,c,w=1):
        n=max(abs(x1-x0),abs(y1-y0),1)
        for i in range(n+1):
            x=round(x0+(x1-x0)*i/n); y=round(y0+(y1-y0)*i/n)
            for dx in range(w):
                for dy in range(w): s.set(x+dx,y+dy,c)
    def disc(s,cx,cy,r,c):
        for y in range(s.h):
            for x in range(s.w):
                if (x-cx)**2+(y-cy)**2<=r*r+.3: s.set(x,y,c)
    def paste(s,rows,ox,oy):
        for y,r in enumerate(rows):
            for x,ch in enumerate(r):
                if ch!='.': s.set(ox+x,oy+y,ch)
    def rows(s): return [''.join(r) for r in s.p]
def outline(rows,col='k',diag=False):
    h=len(rows); w=len(rows[0]); out=[['.']*(w+2) for _ in range(h+2)]
    for y in range(h):
        for x in range(w): out[y+1][x+1]=rows[y][x]
    res=[r[:] for r in out]
    nb=[(1,0),(-1,0),(0,1),(0,-1)]+([(1,1),(1,-1),(-1,1),(-1,-1)] if diag else [])
    for y in range(h+2):
        for x in range(w+2):
            if out[y][x]=='.' and any(0<=x+dx<w+2 and 0<=y+dy<h+2 and out[y+dy][x+dx] not in '.' for dx,dy in nb): res[y][x]=col
    return [''.join(r) for r in res]
def sheet(items,path,z=10,bg=(60,70,90),gap=4,team='#e83838'):
    # items: list of rows-lists (or (rows, colour) for team recolour)
    ims=[]
    for it in items:
        rows,col=(it if isinstance(it,tuple) else (it,team))
        P=dict(PAL);P.update(shades(col))
        h=len(rows); w=max(len(r) for r in rows)
        im=Image.new('RGB',(w,h),bg)
        for y,r in enumerate(rows):
            for x,ch in enumerate(r):
                if ch in P: im.putpixel((x,y),tuple(int(P[ch][i:i+2],16) for i in (1,3,5)))
        ims.append(im)
    W=sum(i.width for i in ims)+gap*(len(ims)+1); H=max(i.height for i in ims)+gap*2
    out=Image.new('RGB',(W,H),bg); x=gap
    for i in ims: out.paste(i,(x,gap)); x+=i.width+gap
    out=out.resize((W*z,H*z),Image.NEAREST); out.save(path)
