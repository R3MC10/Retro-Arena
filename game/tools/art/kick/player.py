import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# Footballer, 14x22 before the outline. Letters: 1 2 3 shirt (team), a b shorts light/dark, h H hair, s S skin, K k boots, 2/3 socks
W,H=14,22
HEADS={
 'E':[".hhhh..",
      "hhhhhh.",
      "hhhssss",
      "hhsssks",
      "hHsssss",
      ".Hsss..",
      "..SS..."],
 'S':[".hhhhh.",
      "hhhhhhh",
      "hssssSh",
      "hsksksH",
      "hsssssH",
      ".sSSSs.",
      "..SSS.."],
 'N':[".hhhhh.",
      "hhhhhhh",
      "hhhhhhH",
      "hhhhhHH",
      "HhhhhHH",
      ".sHHHs.",
      "..SSS.."],
 'SE':[".hhhhh.",
       "hhhhhhh",
       "hhsssss",
       "hsssksk",
       "Hssssss",
       ".HsssS.",
       "..SSS.."],
 'NE':[".hhhhh.",
       "hhhhhhh",
       "hhhhhhs",
       "hhhhhss",
       "HhhhHss",
       ".HHHss.",
       "..SSS.."]}
def leg(g,hip,knee,ank,toe,near):
    sk,so,bo='s' if near else 'S','2' if near else '3','K' if near else 'k'
    g.line(hip[0],hip[1],knee[0],knee[1],sk,2)
    g.line(knee[0],knee[1],ank[0],ank[1]-1,so,2)
    g.line(ank[0],ank[1],ank[0]+toe,ank[1],bo,1);g.line(ank[0],ank[1]-1+1,ank[0]+toe,ank[1]-1+1,bo,1);g.set(ank[0],ank[1]-1,bo);g.set(ank[0]+1,ank[1]-1,bo)
def arm(g,sh,hand,near):
    sl,sk='1' if near else '3','s' if near else 'S'
    mx,my=(sh[0]+hand[0])//2,(sh[1]+hand[1])//2
    g.line(sh[0],sh[1],mx,my,sl,2);g.line(mx,my,hand[0],hand[1],sk,1)
    if near:g.set(hand[0],hand[1],'s')
def torso(g,d,dy):
    y=7+dy
    if d in('S','N'):
        rows=["...112223...",
              "..11122223..",
              "..11222223..",
              "..1122222 3.".replace(' ','2'),
              "...1222223..",
              "...aaaaaab..",
              "...aaabaab.."]
    elif d=='E':
        rows=["....1123....",
              "...112223...",
              "...112223...",
              "...122223...",
              "...122223...",
              "...aaaaab...",
              "...aaaaab..."]
    else:
        rows=["....11223...",
              "...1122223..",
              "...1122223..",
              "...1222223..",
              "...1222233..",
              "...aaaaabb..",
              "...aaa.abb.."]
    g.paste(rows,1,y)
def head(g,d,dy):
    h=HEADS[d];x=4 if d!='E' else 5
    g.paste(h,x,dy)
# poses: per direction, list of (legs, arms, bob)
SIDE={ # E: hips at x 6/7, y 14
 'stand':dict(b=0,legs=[((6,14),(6,17),(6,20),2,False),((7,14),(7,17),(7,20),2,True)],arms=[((6,8),(6,12),False),((7,8),(7,12),True)]),
 'r1':dict(b=1,legs=[((6,15),(5,18),(3,20),1,False),((7,15),(9,17),(10,20),2,True)],arms=[((6,9),(9,12),False),((7,9),(4,12),True)]),
 'r2':dict(b=0,legs=[((6,14),(8,16),(6,18),1,False),((7,14),(7,17),(7,20),2,True)],arms=[((6,8),(7,12),False),((7,8),(6,12),True)]),
 'r3':dict(b=1,legs=[((6,15),(8,17),(9,20),2,False),((7,15),(5,18),(3,20),1,True)],arms=[((6,9),(4,12),False),((7,9),(10,12),True)]),
 'r4':dict(b=0,legs=[((6,14),(6,17),(6,20),2,False),((7,14),(9,16),(7,18),1,True)],arms=[((6,8),(6,12),False),((7,8),(8,12),True)]),
 'kick':dict(b=0,legs=[((6,14),(6,17),(6,20),2,False),((7,14),(10,15),(12,16),2,True)],arms=[((6,8),(9,10),False),((7,8),(3,10),True)]),
}
FRONT={ # S / N: hips 5 and 8
 'stand':dict(b=0,legs=[((5,14),(5,17),(5,20),1,True),((8,14),(8,17),(8,20),1,True)],arms=[((3,8),(2,12),True),((10,8),(11,12),True)]),
 'r1':dict(b=1,legs=[((5,15),(5,17),(5,19),1,True),((8,15),(8,18),(8,21),1,True)],arms=[((3,9),(2,11),True),((10,9),(11,13),True)]),
 'r2':dict(b=0,legs=[((5,14),(5,17),(5,20),1,True),((8,14),(8,17),(8,20),1,True)],arms=[((3,8),(2,12),True),((10,8),(11,12),True)]),
 'r3':dict(b=1,legs=[((5,15),(5,18),(5,21),1,True),((8,15),(8,17),(8,19),1,True)],arms=[((3,9),(2,13),True),((10,9),(11,11),True)]),
 'r4':dict(b=0,legs=[((5,14),(5,17),(5,20),1,True),((8,14),(8,17),(8,20),1,True)],arms=[((3,8),(2,12),True),((10,8),(11,12),True)]),
 'kick':dict(b=0,legs=[((5,14),(5,17),(5,20),1,True),((8,14),(9,16),(10,18),1,True)],arms=[((3,8),(1,11),True),((10,8),(12,11),True)]),
}
DIAG={ # SE / NE
 'stand':dict(b=0,legs=[((5,14),(5,17),(5,20),2,False),((8,14),(8,17),(8,20),2,True)],arms=[((4,8),(3,12),False),((10,8),(10,12),True)]),
 'r1':dict(b=1,legs=[((5,15),(4,18),(3,20),1,False),((8,15),(9,17),(10,20),2,True)],arms=[((4,9),(5,12),False),((10,9),(9,12),True)]),
 'r2':dict(b=0,legs=[((5,14),(6,16),(5,18),1,False),((8,14),(8,17),(8,20),2,True)],arms=[((4,8),(3,12),False),((10,8),(10,12),True)]),
 'r3':dict(b=1,legs=[((5,15),(6,17),(7,20),2,False),((8,15),(7,18),(6,20),1,True)],arms=[((4,9),(2,11),False),((10,9),(12,12),True)]),
 'r4':dict(b=0,legs=[((5,14),(5,17),(5,20),2,False),((8,14),(10,16),(9,18),1,True)],arms=[((4,8),(3,12),False),((10,8),(10,12),True)]),
 'kick':dict(b=0,legs=[((5,14),(5,17),(5,20),2,False),((8,14),(11,15),(12,17),2,True)],arms=[((4,8),(2,10),False),((10,8),(12,10),True)]),
}
def frame(d,pose):
    P=(SIDE if d=='E' else FRONT if d in('S','N') else DIAG)[pose];g=Grid(W,H);b=P['b']
    back=d in('N','NE')
    legs=P['legs'];arms=P['arms']
    if back: legs=[(l[0],l[1],l[2],l[3],True) for l in legs]
    # far side first
    for (sh,hd,near) in arms:
        if not near: arm(g,sh,hd,False)
    for L in legs:
        if not L[4]: leg(g,*L)
    if back:
        for (sh,hd,near) in arms: arm(g,sh,hd,True)
    torso(g,d,b)
    for L in legs:
        if L[4]: leg(g,*L)
    head(g,d,b)
    if not back:
        for (sh,hd,near) in arms:
            if near: arm(g,sh,hd,True)
    return g.rows()
DIRS=['E','SE','S','NE','N'];POSES=['stand','r1','r2','r3','r4','kick']
F={d+'_'+p:frame(d,p) for d in DIRS for p in POSES}
EXTRA={'a':'#f4f4f4','b':'#b8b8c8','h':'#5a3a20','H':'#3a2414'}
if __name__=='__main__':
    for d in DIRS:pass
    from pixart import PAL
    PAL.update(EXTRA)
    sheet([outline(F[d+'_'+p]) for d in DIRS for p in POSES],'players.png',z=8)
