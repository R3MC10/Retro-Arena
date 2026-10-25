import sys,os,math,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# Tennis players for a court seen from behind one baseline (NES Tennis style).
# 'b' set: the near player, seen from the BACK; 'f' set: the far player, seen from the FRONT.
# Racket in the right hand: screen-right for the back view; the front view is the mirror.
# 1 2 3 shirt + headband (player colour), w W shorts/socks, s S skin, h hair, K g shoes, Y racket frame, n grip
W,H,OY=32,42,8
HEAD={'b':["..hhhh..",".hhhhhh.","h222222h","hhhhhhh2","hhhhhhhh","shhhhhhs",".hhhhhh.","..SSSS.."],
      'f':["..hhhh..",".hhhhhh.","h222222h","hssssssh","hskssksh","hssssssh",".sssSss.","..SSSS.."]}
TORSO={'b':[".11122223.","1112222233","1112222233",".11222223.",".11222223.",".12222233.",".wwwwwwWW.",".wwwwwwwW.",".www..wwW."],
       'f':[".1112w223.","11122w2233","1112222233",".11222223.",".11222223.",".12222233.",".wwwwwwWW.",".wwwwwwwW.",".www..wwW."]}
def limb(g,a,b,c,col,w=2):
    g.line(a[0],a[1],b[0],b[1],col,w);g.line(b[0],b[1],c[0],c[1],col,w)
def racket(g,hand,ang):
    r=math.radians(ang);dx,dy=math.cos(r),math.sin(r)
    for k in range(1,4):g.set(round(hand[0]+dx*k),round(hand[1]+dy*k),'n')
    cx,cy=hand[0]+dx*6.5,hand[1]+dy*6.5;pts=set()
    for i in range(48):
        t=i/48*math.tau;u,v=math.cos(t)*3.2,math.sin(t)*2.4;pts.add((round(cx+u*dx-v*dy),round(cy+u*dy+v*dx)))
    for y in range(int(cy)-5,int(cy)+6):
        for x in range(int(cx)-5,int(cx)+6):
            u=(x-cx)*dx+(y-cy)*dy;v=-(x-cx)*dy+(y-cy)*dx
            if (u/3.2)**2+(v/2.4)**2<1 and (x,y) not in pts:g.set(x,y,'W' if (x+y)&1 else 'G')
    for p in pts:g.set(p[0],p[1],'Y')
def pose(view,la,ra,rk,ll,rl,dy=0,lean=0,front=False,head=(0,0),jy=0):
    """la/ra=(elbow,hand) left/right arm in BACK-view coords; ll/rl=(knee,ankle); rk racket angle; front: racket in front of the body"""
    mir=view=='f';X=(lambda x:31-x) if mir else (lambda x:x)
    P=lambda p,d=0:(X(p[0]),p[1]+OY+d+jy);A=lambda a:(180-a) if mir else a
    g=Grid(W,H)
    sL,sR=(12+lean,15+dy),(19+lean,15+dy);hL,hR=(13,23+max(0,dy-1)),(18,23+max(0,dy-1))
    hidden=front if view=='b' else not front   # racket arm behind the body from this side?
    def draw_leg(h,L,col,sh):
        limb(g,P(h),P(L[0]),P(L[1]),col);a=P(L[1]);g.rect(a[0]-1,a[1]+1,a[0]+1,a[1]+1,sh);g.set(a[0],a[1],'W')
    def draw_rarm():
        e,hd=P(ra[0]),P(ra[1]);racket(g,hd,A(rk));limb(g,P(sR),e,hd,'s')
    draw_leg(hL,ll,'S' if not mir else 's','K');draw_leg(hR,rl,'s' if not mir else 'S','K')
    if hidden:draw_rarm()
    if view=='b':limb(g,P(sL),P(la[0]),P(la[1]),'s')
    T=TORSO[view];g.paste(T,X(11+lean+(9 if mir else 0)),15+dy+OY+jy)
    if view=='f':limb(g,P(sL),P(la[0]),P(la[1]),'s')
    g.paste(HEAD[view],X(12+lean+head[0]+(7 if mir else 0)),6+dy+head[1]+OY+jy)
    if not hidden:draw_rarm()
    return g.rows()
POSES={
 'ready': dict(la=((11,19),(15,21)),ra=((20,19),(17,21)),rk=-55,ll=((11,27),(11,31)),rl=((20,27),(20,31)),dy=2,front=True),
 'run1':  dict(la=((10,18),(10,21)),ra=((21,18),(23,16)),rk=-70,ll=((12,25),(11,28)),rl=((19,27),(20,31)),dy=0),
 'run2':  dict(la=((11,18),(11,22)),ra=((21,18),(22,17)),rk=-75,ll=((13,27),(13,31)),rl=((18,27),(18,31)),dy=-1),
 'run3':  dict(la=((10,18),(10,21)),ra=((21,18),(23,16)),rk=-70,ll=((12,27),(11,31)),rl=((19,25),(20,28)),dy=0),
 'run4':  dict(la=((11,18),(11,22)),ra=((21,18),(22,17)),rk=-75,ll=((13,27),(13,31)),rl=((18,27),(18,31)),dy=-1),
 'fore1': dict(la=((12,19),(15,20)),ra=((22,18),(24,20)),rk=25,ll=((11,27),(11,31)),rl=((20,27),(21,31)),dy=2,lean=1),
 'fore2': dict(la=((11,19),(10,21)),ra=((22,16),(25,15)),rk=-20,ll=((11,27),(11,31)),rl=((20,27),(21,31)),dy=2),
 'fore3': dict(la=((11,19),(10,21)),ra=((16,13),(13,12)),rk=-125,ll=((11,27),(11,31)),rl=((20,27),(20,31)),dy=1,lean=-1,front=True),
 'back1': dict(la=((12,19),(12,20)),ra=((15,18),(11,19)),rk=160,ll=((11,27),(10,31)),rl=((20,27),(20,31)),dy=2,lean=-1,front=True),
 'back2': dict(la=((13,19),(14,21)),ra=((11,16),(7,15)),rk=-160,ll=((11,27),(10,31)),rl=((20,27),(20,31)),dy=2),
 'back3': dict(la=((13,19),(14,21)),ra=((21,12),(23,9)),rk=-70,ll=((11,27),(11,31)),rl=((20,27),(20,31)),dy=1,lean=1),
 'serve1':dict(la=((11,11),(10,6)),ra=((22,13),(21,17)),rk=95,ll=((13,27),(13,31)),rl=((18,27),(18,31))),
 'serve2':dict(la=((11,18),(12,21)),ra=((20,10),(20,6)),rk=-90,ll=((13,27),(13,31)),rl=((18,27),(18,31)),jy=-1),
 'serve3':dict(la=((11,18),(10,20)),ra=((17,19),(13,22)),rk=145,ll=((12,27),(11,31)),rl=((19,27),(20,31)),dy=1,lean=-1,front=True),
 'volley':dict(la=((12,18),(14,17)),ra=((21,15),(22,12)),rk=-80,ll=((11,27),(11,31)),rl=((20,27),(20,31)),dy=1),
 'lunge': dict(la=((10,18),(8,20)),ra=((23,18),(27,19)),rk=5,ll=((9,26),(6,31)),rl=((22,27),(25,31)),dy=3),
 'win':   dict(la=((11,11),(10,7)),ra=((20,11),(21,7)),rk=-90,ll=((13,27),(13,31)),rl=((18,27),(18,31)),jy=-3),
 'sad':   dict(la=((12,19),(12,23)),ra=((20,19),(21,23)),rk=95,ll=((13,27),(13,31)),rl=((18,27),(18,31)),head=(0,1)),
}
F={v:{k:pose(v,**p) for k,p in POSES.items()} for v in 'bf'}
BALL=["kYk","YYY","kYk"]
EXTRA={'h':'#3a2414'}
if __name__=='__main__':
    PAL.update(EXTRA)
    ks=list(POSES)
    sheet([outline(F['b'][k]) for k in ks],'back.png',z=6)
    sheet([outline(F['f'][k]) for k in ks],'front.png',z=6)
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'tennis_art.js'),'w').write('const ART='+json.dumps({'b':{k:outline(v) for k,v in F['b'].items()},'f':{k:outline(v) for k,v in F['f'].items()}})+';')
