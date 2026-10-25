import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# Sprinter facing right, 16x24 before the outline. 1 2 3 singlet (player colour), a b shorts, h hair, s S skin, w shoes, k eye
W,H=16,24
HEAD=["..hhhh..",".hhhhhs.","hhhhsss.","hhhssks.","hhsssss.",".hsssS..","..sSS..."]
def frame(arms,legs,lean=0,dy=0,head=True,torso=True,extra=None):
    g=Grid(W,H)
    for L in legs:
        if not L[4]:leg(g,*L,dy=dy)
    for A in arms:
        if not A[3]:arm(g,*A,dy=dy)
    if torso:
        rows=["...1122...","..112223..","..122223..","..122223..","...12223..","...aaaab..","...aaabb.."]
        g.paste(rows,3+lean,7+dy)
    for L in legs:
        if L[4]:leg(g,*L,dy=dy)
    if head:g.paste(HEAD,5+lean,0+dy)
    for A in arms:
        if A[3]:arm(g,*A,dy=dy)
    if extra:extra(g)
    return g.rows()
def leg(g,hip,knee,ank,toe,near,dy=0):
    sk='s' if near else 'S';sh='w' if near else 'G'
    hip=(hip[0],hip[1]+dy);knee=(knee[0],knee[1]+dy);ank=(ank[0],ank[1]+dy)
    g.line(hip[0],hip[1],knee[0],knee[1],sk,2);g.line(knee[0],knee[1],ank[0],ank[1],sk,2)
    g.set(ank[0],ank[1],sh);g.set(ank[0]+1,ank[1],sh);g.set(ank[0]+toe,ank[1],sh);g.set(ank[0]+(1 if toe>0 else -1),ank[1]+1,sh) if False else None
def arm(g,sh,el,hand,near,dy=0):
    sk='s' if near else 'S'
    sh=(sh[0],sh[1]+dy);el=(el[0],el[1]+dy);hand=(hand[0],hand[1]+dy)
    g.line(sh[0],sh[1],el[0],el[1],sk,2 if near else 1);g.line(el[0],el[1],hand[0],hand[1],sk,1);g.set(hand[0],hand[1],sk)
F={}
# sprint cycle: 4 frames, knees high, arms pumping
F['r1']=frame([((7,8),(4,10),(4,13),False),((8,8),(11,9),(12,6),True)],[((7,14),(4,17),(2,20),1,False),((8,14),(11,14),(11,18),2,True)],lean=1,dy=1)
F['r2']=frame([((7,8),(6,11),(8,13),False),((8,8),(8,11),(10,12),True)],[((7,14),(9,16),(7,19),2,False),((8,14),(8,18),(8,22),2,True)],lean=1)
F['r3']=frame([((7,8),(11,9),(12,6),False),((8,8),(4,10),(4,13),True)],[((7,14),(11,14),(11,18),2,False),((8,14),(4,17),(2,20),1,True)],lean=1,dy=1)
F['r4']=frame([((7,8),(8,11),(10,12),False),((8,8),(6,11),(8,13),True)],[((7,14),(7,18),(7,22),2,False),((8,14),(10,16),(8,19),2,True)],lean=1)
F['stand']=frame([((7,8),(7,11),(7,14),False),((8,8),(8,11),(8,14),True)],[((7,14),(7,18),(7,22),2,False),((8,14),(8,18),(8,22),2,True)])
F['set']=frame([((9,13),(9,17),(9,21),False),((10,13),(10,17),(11,21),True)],[((5,17),(8,19),(6,22),2,False),((6,17),(4,20),(2,22),2,True)],lean=3,dy=6)
# long jump: take-off (knee drive), flight (hang, arms up), landing (sit, legs forward)
F['take']=frame([((7,8),(10,6),(12,3),False),((8,8),(5,9),(3,11),True)],[((7,14),(5,18),(3,22),1,False),((8,14),(11,13),(12,17),2,True)],lean=1)
F['fly']=frame([((7,8),(9,5),(10,2),False),((8,8),(10,5),(12,2),True)],[((7,14),(10,15),(13,17),2,False),((8,14),(11,15),(14,18),2,True)],dy=0)
F['land']=frame([((7,9),(10,11),(13,12),False),((8,9),(11,11),(14,12),True)],[((6,19),(10,19),(14,21),2,False),((7,19),(11,20),(15,22),2,True)],lean=0,dy=5)
# hurdle clearance: lead leg straight out, trail leg tucked
F['hop']=frame([((7,8),(10,9),(13,9),False),((8,8),(5,10),(3,12),True)],[((7,14),(4,14),(2,17),1,False),((8,14),(12,14),(15,14),2,True)],lean=2)
F['fall']=frame([((7,12),(10,15),(13,17),False),((8,12),(4,15),(2,18),True)],[((6,18),(3,20),(1,22),1,False),((7,18),(10,21),(13,22),2,True)],lean=3,dy=6)
F['win']=frame([((7,8),(6,4),(5,1),False),((8,8),(10,4),(11,1),True)],[((7,14),(7,18),(7,22),2,False),((8,14),(8,18),(8,22),2,True)])
# javelin: running with it held high (arm back), and the throw
F['jr1']=frame([((7,8),(4,10),(4,13),False),((8,8),(6,6),(4,4),True)],[((7,14),(4,17),(2,20),1,False),((8,14),(11,14),(11,18),2,True)],lean=1,dy=1)
F['jr2']=frame([((7,8),(6,11),(8,13),False),((8,8),(6,6),(4,4),True)],[((7,14),(9,16),(7,19),2,False),((8,14),(8,18),(8,22),2,True)],lean=1)
F['jr3']=frame([((7,8),(11,9),(12,6),False),((8,8),(6,6),(4,4),True)],[((7,14),(11,14),(11,18),2,False),((8,14),(4,17),(2,20),1,True)],lean=1,dy=1)
F['jr4']=frame([((7,8),(8,11),(10,12),False),((8,8),(6,6),(4,4),True)],[((7,14),(7,18),(7,22),2,False),((8,14),(10,16),(8,19),2,True)],lean=1)
F['throw']=frame([((7,8),(4,10),(2,12),False),((8,8),(11,6),(14,4),True)],[((7,14),(4,18),(2,22),1,False),((8,14),(11,17),(13,22),2,True)],lean=2)
EXTRA={'a':'#1c2a5c','b':'#101838','h':'#3a2414'}
if __name__=='__main__':
    PAL.update(EXTRA)
    sheet([outline(F[k]) for k in F],'athlete.png',z=8)
