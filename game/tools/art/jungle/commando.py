import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# Commando facing right, 18x24 before the outline. R bandana, s/S skin, h hair, 1 2 3 trousers (player colour), K boots, G/g rifle, k belt
W,H=18,24
HEAD=["....hhhh..","...hhhhhh.","..RRRRRRR.",".RR.ssskss","RR..ssssss","....SssSs.",".....sss.."]
def torso(g,x,y):
    for r,row in enumerate(["..sssss...",".ssSSSsss.",".sSssSSss.","..sSSsss..","..ssssss..","..kkkkkk.."]):
        for c,ch in enumerate(row):
            if ch!='.':g.set(x+c,y+r,ch)
def legs(g,x,y,pose):
    L={'stand':[".1122.23..",".112..23..",".112..23..",".112..23..",".KKK..KKK.","KKKK..KKKK"],
       'run1':[".11223....","..1122233.",".112...233","112.....23","KKK.....KK","KK......KK"],
       'run2':["..1123....","..1223....","...123....","...122....","...KKK....","..KKKK...."],
       'run3':[".1122233..","112...233.","12.....23.","12......23","KK.....KKK","K......KKK"],
       'prone':[]}[pose]
    for r,row in enumerate(L):
        for c,ch in enumerate(row):
            if ch!='.':g.set(x+c,y+r,ch)
def gun(g,aim,x,y):
    # rifle and the arms holding it, for each aim
    if aim=='f':pts=[(x+5,y+1,'s'),(x+6,y+1,'s'),(x+7,y+1,'s')];bar=[(x+7+i,y,'G') for i in range(7)]+[(x+7+i,y+1,'g') for i in range(4)]
    elif aim=='u':pts=[(x+5,y,'s'),(x+5,y-1,'s'),(x+6,y-2,'s')];bar=[(x+6,y-3-i,'G') for i in range(8)]+[(x+7,y-3-i,'g') for i in range(4)]
    elif aim=='ud':pts=[(x+5,y,'s'),(x+6,y-1,'s'),(x+7,y-2,'s')];bar=[(x+7+i,y-3-i,'G') for i in range(6)]+[(x+8+i,y-3-i,'g') for i in range(4)]
    else:pts=[(x+5,y+2,'s'),(x+6,y+3,'s'),(x+7,y+4,'s')];bar=[(x+7+i,y+4+i,'G') for i in range(6)]+[(x+7+i,y+5+i,'g') for i in range(3)]
    for (a,b,c) in bar+pts:g.set(a,b,c)
def frame(pose,aim='f',dy=0):
    g=Grid(W,H);legs(g,3,17+dy-0,pose if pose!='prone' else 'stand');torso(g,3,11+dy);g.paste(HEAD,4,4+dy);gun(g,aim,4,12+dy);return g.rows()
F={}
for p in ['stand','run1','run2','run3']:
    for a in ['f','u','ud','dd']:
        if p=='stand' and a=='dd':continue
        if p!='stand' and a=='u':continue
        F[p+'_'+a]=frame(p,a,0 if p!='run2' else -1)
# prone: lying flat, rifle forward
F['prone']=["..................","..................","..................","..................","..................","..................","..................","..................","..................","..................","..................","..................",
 "..................","..................","..................","..................","..................","....hhhh..........","..RRRRRRRhh.......","RR..ssskssGGGGGGGG",
 "KK1122ssssssggggG.","KK112233kkss......","K.1122...SSs......",".................."]
# somersault: a curled ball, 4 rotations
BALL=["......hhhh......","....RRRRRRhh....","...RRsssssshh...","..1Rsssksssss...","..11ssssssssS...","..112sSSSSssS...","..1122ssssss.K..","...11223333KKK..","....112233KK....","......KKKK......"]
def rot90(rows):return [''.join(rows[len(rows)-1-r][c] for r in range(len(rows))) for c in range(len(rows[0]))]
b=BALL;sq=[r.ljust(16,'.') for r in b]+['.'*16]*6
F['spin0']=sq;F['spin1']=rot90(sq);F['spin2']=rot90(F['spin1']);F['spin3']=rot90(F['spin2'])
F['die']=["..................","..................","..................","..................","..................","..................","..................","..................","..................","..................","..................","..................",
 "..................","..................","..................","........hhhh......",".....RRRhhhhh.....","KK..RR.ssskss.....","KK1122ssssss......","K.11223SSSsss.....","..1122..kkk.......","..................","..................",".................."]
if __name__=='__main__':
    PAL.update({'h':'#1c1418'})
    sheet([outline(F[k]) for k in F],'commando.png',z=8,team='#2c78f0')
