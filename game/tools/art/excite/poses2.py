import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
from bike3 import build
from bike4 import BIKE
import math
# rider poses, hand drawn; column 0 = bike grid x 8, row 0 = bike grid y 0 (negative rows allowed via 'top')
P={}
P['sit']=(0,[".......1112","......11122233","......112kCC","......222233G",".......2333",".....112223","....112222323","....122223..33","...122223.....KK","...12223","..wwwwwG","..wwwwwwwG",".......wGG",".......wG",".......wG","......KKKK"])
P['back']=(0,["....1112","...11122233","...112kCC","...222233G","....2333","...1122233","..1122223333","..122223...3333","..12223.......KK","..1223",".wwwwwG",".wwwwwwwwG",".......wGG",".......wG",".......wG","......KKKK"])
P['fwd']=(1,["..........1112",".........11122233",".........112kCC",".........222233G","......1112333","....1122222233","...1222223...33","..ww2223......KK","..wwwwwwwG",".......wGG",".......wG",".......wG",".......wG",".......wG","......KKKK"])
P['tuck']=(3,[".........1112","........11122233","........112kCC","...1111222233G","..112222222333","..wwww2223...KK","..wwwwwwwG",".......wGG",".......wG",".......wG",".......wG",".......wG","......KKKK"])
P['stand']=(-3,[".......1112","......11122233","......112kCC","......222233G",".......2333",".....112223","....112222323","....122223..33","....122223....3","....12223......KK","...wwwwwG","...wwwwwwwG","........wG","........wG",".......wGG",".......wG",".......wG","......KKKK"])
P['wave']=(-4,["........KK","........3.","........3.","....1112.3","...11122233","...112kCC","...222233G","....2333","..112223","..11222223","..122223..33","..122223....KK","..12223","..wwwwwG","..wwwwwwwG",".......wGG",".......wG",".......wG","......KKKK"])
ALONE={
 'runA':["...1112..","..11122233","..112kCC..","..222233G.","...2333...","..1122233.",".11222.33.","K1222..K..","..2223....","..wwwww...",".ww..ww...","ww....wG..","KK.....KK."],
 'runB':["...1112..","..11122233","..112kCC..","..222233G.","...2333...","..112223..","..122223..","..12223K..","..2223....","..wwwww...","...www....","...wwG....","..KKKK...."],
 'ball':["..1112....",".11122233.",".112kCC2..",".22223322.","..w23222..",".ww22233K.",".wwwGG3K..","KKwwG.....",".KK......."],
 'flat':["..........1112..","KK.wwwww2222122.","KKwwwwwG22223kCC","..........23333."],
}
def wheel(f,r=5):
    n=2*r+1;g=Grid(n,n);c=r
    for y in range(n):
        for x in range(n):
            d=math.hypot(x-c,y-c)
            if d<=r+.4: g.set(x,y,'k')
            if d<=r-.6: g.set(x,y,'K')
            if d<=r-1.8: g.set(x,y,'.')
    a0=f*math.pi/8
    for k in range(8):   # knobs on the tyre
        a=a0+k*math.pi/4;g.set(round(c+math.cos(a)*(r-.2)),round(c+math.sin(a)*(r-.2)),'g')
    for k in range(3):   # spokes
        a=a0+k*math.pi/3
        for t in (1.2,2.2):
            for s in (1,-1): g.set(round(c+s*math.cos(a)*t),round(c+s*math.sin(a)*t),'G')
    g.set(c,c,'g');return g.rows()
def pose_rows(name,W=36,H=34,OY=6):
    top,rows=P[name];g=Grid(W,H)
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch!='.': g.set(9+x,OY+top+y,ch)
    return g.rows()
def compose(name,W=36,H=34,OY=6,wf=0):
    g=Grid(W,H);g.paste(outline(build(BIKE,32,26)),1,OY-1+1);g.paste(outline(pose_rows(name,W-2,H-2,OY-1)),0,0)
    wh=wheel(wf);g.paste(wh,2+1,OY+15-0);g.paste(wh,2+20,OY+15)
    return g.rows()
if __name__=='__main__':
    sheet([compose(k,wf=i%4) for i,k in enumerate(P)],'poses2.png',z=7)
    sheet([wheel(f) for f in range(4)]+[outline(v) for v in ALONE.values()],'alone.png',z=10)
