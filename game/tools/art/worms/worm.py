import sys,os,math,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# The worm, facing right, 16x16 before the outline: a tube of pink discs along a spine (head first), lit from the top left.
# P light / p mid / h dark pink, W eye white, k pupil, 1 2 3 team bandana
W,H=16,16
def body(sp,rad):
    g=Grid(W,H);cells={}
    for i in range(len(sp)-1):
        (x0,y0),(x1,y1)=sp[i],sp[i+1];r0,r1=rad[i],rad[i+1]
        for t in range(11):
            f=t/10;cx=x0+(x1-x0)*f;cy=y0+(y1-y0)*f;r=r0+(r1-r0)*f
            for y in range(H):
                for x in range(W):
                    d=math.hypot(x+.5-cx,y+.5-cy)
                    if d<=r: cells[(x,y)]=min(cells.get((x,y),9),d/r - ((cx-(x+.5))*.12+(cy-(y+.5))*.12))
    for (x,y),v in cells.items():g.set(x,y,'P' if v<.35 else 'p' if v<.85 else 'h')
    return g
def eyes(g,hx,hy,kind='open'):
    hx,hy=round(hx),round(hy)
    for ex in (hx-1,hx+1):
        if kind=='shut': g.set(ex,hy,'k');g.set(ex+1,hy,'k');continue
        if kind=='happy': g.set(ex,hy,'k');g.set(ex+1,hy-1,'k');g.set(ex+2,hy,'k') if ex==hx+1 else None;continue
        g.rect(ex,hy-2,ex+1,hy,'W');g.set(ex+1,hy-1 if kind=='up' else hy,'k')
def band(g,hx,hy):
    hx,hy=round(hx),round(hy)
    for x in range(hx-3,hx+2):g.set(x,hy-4,'2') if g.p[hy-4][x]!='.' else None
    g.set(hx-4,hy-3,'1');g.set(hx-5,hy-2,'3')
def rings(g,sp,rad):
    # two dark segment rings across the body
    for f in (.42,.66):
        L=len(sp)-1;t=f*L;i=min(L-1,int(t));u=t-i;(x0,y0),(x1,y1)=sp[i],sp[i+1];cx=x0+(x1-x0)*u;cy=y0+(y1-y0)*u
        dx,dy=x1-x0,y1-y0;l=math.hypot(dx,dy) or 1;nx,ny=-dy/l,dx/l;r=rad[i]+(rad[i+1]-rad[i])*u
        for k in range(-int(r),int(r)+1):
            x,y=round(cx+nx*k*.9),round(cy+ny*k*.9)
            if 0<=x<W and 0<=y<H and g.p[y][x] in 'Pp':g.p[y][x]='h' if g.p[y][x]=='p' else 'p'
def worm(sp,rad,kind='open',bnd=True,mouth=True):
    rad=[rad[0]+.5]+rad[1:] if rad[0]<4 else rad
    g=body(sp,rad);rings(g,sp,rad);hx,hy=sp[0];eyes(g,hx,hy,kind)
    if bnd:band(g,hx,hy)
    if mouth and kind!='shut':g.set(round(hx)+2,round(hy)+2,'h')
    return g.rows()
R=[4.3,3.3,3.1,2.7,2.0]
F={}
F['idle1']=worm([(10,6),(9.5,9),(8.5,11.5),(6,13),(3,13.5)],R)
F['idle2']=worm([(10,7),(9.5,9.6),(8.5,12),(6,13.2),(3,13.5)],[3.8,3.4,3.2,2.7,2.0])
F['walk1']=worm([(11,8),(10,10.5),(7.5,9.5),(5,12),(2.5,13.5)],R)
F['walk2']=worm([(12,9),(10,11.5),(7.5,12.5),(5,13),(2,13.5)],R)
F['walk3']=worm([(11.5,8.5),(10,11),(7.5,11),(5,12.5),(2.2,13.5)],R)
F['jump']=worm([(9,4),(9,7),(8.5,10),(7.5,12.5),(6.5,14.5)],[3.6,3.1,2.9,2.5,1.8],kind='up')
F['fly']=worm([(9,6),(10.5,9.5),(8,12),(5,10.5),(6.5,7.5)],[3.6,3.2,3.0,2.7,2.2],kind='shut')
F['aim']=worm([(9.5,5),(9.5,8),(9,11),(7,13),(4,13.5)],R)
F['hurt']=worm([(10,6),(9.5,9),(8.5,11.5),(6,13),(3,13.5)],R,kind='shut')
F['win']=worm([(9,4),(9,7),(8.5,10),(7.5,12.5),(6.5,14.5)],[3.6,3.1,2.9,2.5,1.8],kind='happy')
F['rope']=worm([(8,4),(8,7),(8,10),(8.5,12.5),(9.5,14.5)],[3.6,3.2,3.0,2.6,1.9],kind='up')
EXTRA={'h':'#b8447c'}
if __name__=='__main__':
    PAL.update(EXTRA)
    sheet([outline(F[k]) for k in F],'worm.png',z=10,team='#2888ff')
