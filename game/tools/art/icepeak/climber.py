import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# Ice climber facing right, 12x16 before the outline. 1 2 3 parka, w fur, s/S skin, k eye, K boots, n handle, G/g hammer head
HEAD=["....1112....","...111122...","..1wwwww2...","..1wssskw...","..1wsssSw...","...wwwww...."]
def hammer_up(rows):     # hammer held upright in the front hand
    g=Grid(12,16);g.paste(rows,0,0)
    for x,y,c in [(9,2,'G'),(10,2,'G'),(11,2,'g'),(9,3,'G'),(10,3,'G'),(11,3,'g'),(10,4,'n'),(10,5,'n'),(10,6,'n'),(9,7,'3'),(10,7,'3')]:g.set(x,y,c)
    return g.rows()
BODY=["..112222....",".1122222....",".s122223....","..12223.....","..2223......"]
LEGS={'stand':["..3333......","..33.33.....","..33.33.....",".KKK.KKK...."],
 'w1':["..3333......","..33.33.....",".33...33....","KKK...KKK..."],
 'w2':["..3333......","...333......","...33.......","..KKKK......"],
 'w3':["..3333......","..33.33.....","...3333.....","...KK.KKK..."],
 'jump':["..3333......",".33..33.....","KK....33....","......KK...."],
 'fall':["..3333......",".33..333....","33.....33...","KK......KK.."],
 'slip':["..3333......",".33...33...","33.....33..","KK......KK."]}
def frame(legs,body=BODY,head=HEAD,up=True):
    rows=head+body+LEGS[legs]
    return hammer_up(rows) if up else rows
F={}
F['stand']=frame('stand');F['w1']=frame('w1');F['w2']=frame('w2');F['w3']=frame('w3')
F['jump']=[ # both arms up, hammer over the head (this is also the smash pose)
 "......GGGg..","......GGGg..",".......n....","....1112n...","...111122...","..1wwwww2...","..1wssskw...","..1wsssSw...","...wwwww....",
 ".3112222....",".1122222....","..12223.....","..2223......",]+LEGS['jump']
F['fall']=frame('fall',body=["..112222...3","s1122222..3.","..12223.....","..12223.....","..2223......"],up=False)
F['fall']=hammer_up(F['fall'])
# hammer swing: back over the shoulder, overhead, forward and down
F['sw1']=["GGg.........","GGg.........",".n..1112....","..n111122...","..1wwwww2...","..1wssskw...","..1wsssSw...","...wwwww....","..112222....",".1122222....",".s122223....","..12223.....","..2223......"]+LEGS['stand']
F['sw2']=frame('stand',up=False);g=Grid(12,16);g.paste(F['sw2'],0,0)
for x,y,c in [(6,0,'G'),(7,0,'G'),(8,0,'g'),(6,1,'G'),(7,1,'G'),(8,1,'g'),(7,2,'n'),(8,3,'n'),(9,4,'3')]:g.set(x,y,c)
F['sw2']=g.rows()
F['sw3']=[r+"...." for r in frame('stand',up=False)];g=Grid(16,16);g.paste(F['sw3'],0,0)
for x,y,c in [(8,7,'3'),(9,7,'3'),(10,8,'n'),(11,9,'n'),(12,10,'G'),(13,10,'G'),(14,10,'g'),(12,11,'G'),(13,11,'G'),(14,11,'g')]:g.set(x,y,c)
F['sw3']=g.rows()
F['dizzy']=[r.replace('k','K') for r in frame('stand')]
F['cheer']=["..GGg..s....","..GGg.s.....","...n..s.....","...n1112....","...111122...","..1wwwww2...","..1wssskw...","..1wsSssw...","...wwwww....","..112222....","..122222....","..12223.....","..2223......"]+LEGS['stand']
if __name__=='__main__':
    sheet([outline(F[k]) for k in F],'climber.png',z=10,team='#2058c0')
