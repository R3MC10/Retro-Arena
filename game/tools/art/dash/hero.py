import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# Hero facing right. 1 2 3 = player colour (cap, shirt), u/b overalls, s/S skin, h hair, w gloves, n/m boots, y buttons
HEAD=[
"....111111....",
"...12222222...",
"...2222222333.",
"...hhssskS....",
"..hsSsssssS...",
"..hhsssssss...",
"....SssSSS....",]
def small(body,legs):return HEAD+body+legs
BODY_STAND=[
"...11u222.....",
"..w12uuu22w...",
"..wwuuyuyuww..",
"....uuuuuu....",]
LEGS={
'stand':["....uu..uu....","...nnn..nnn...","..nnnn..nnnn.."],
'run1': ["...uu....uu...","..nnn....nnn..",".nnn......nnn."],
'run2': ["....uuuu......","....nnnnn.....","...nnnn.......",],
'run3': ["....uu.uu.....","...nnn..nnn...","..nnn....nnn.."],
'jump': ["...uu...uu....","..nnn....nnnn.","........nnn..."],
}
F={}
F['s_stand']=small(BODY_STAND,LEGS['stand'])
F['s_run1']=small(["...11u222.....","..w12uuu2w....","...wuuyuyuw...","....uuuuuu...."],LEGS['run1'])
F['s_run2']=small(["...11u222.....","...12uuu2w....","...wuuyuyw....","....uuuuuu...."],LEGS['run2'])
F['s_run3']=small(["...11u222.....","...12uuu22w...","..wwuuyuyuw...","....uuuuuu...."],LEGS['run3'])
F['s_jump']=["..........ww..","....111111ww..","...12222222w..","...2222222333.","...hhssskS....","..hsSsssssS...","..hhsssssss...","....SssSSS....",
 "..w11u2222....","..w12uuu2.....","....uuyuyu....","....uuuuuu...."]+LEGS['jump']
F['s_skid']=["....111111....","...12222222...","..3332222222..","....Skssshh...","...Sssssshh...","...ssssssshh..","....SSSssS....",
 "....222u11....","...w22uuu21w..","..wwuuyuyuww..","....uuuuuu....","....uu..uu....","...nnn...nnn..","...nnnn.nnnn.."]
F['s_die']=["....111111....","...12222222...","...22222222...","...hsksskshh..","..hssSSSSssh..","..hhssssssh...","....SssSSS....",
 "w..11u2222..w.","ww12uuuu22.ww.",".w.uuyuyuu.w..","....uuuuuu....","....uu..uu....","...nnn..nnn...","..............",]
F['s_climb']=["....111111....","...12222222...","...2222222333.","...hhssskS..w.","..hsSsssssS.ww","..hhsssssss.w.","....SssSSS..w.",
 "...11u222..w..","...12uuu22w...","....uuyuyu....","....uuuuuu....","....uu..uu....","...nnn..nnn...","..........nnn."]
F['s_win']=["..w........w..","..w.111111.w..","..w12222222w..","..w2222222333.","..whhssskS.w..","..hsSsssssSw..","..hhsssssss...","....SssSSS....",
 "...11u222.....","...12uuu22....","....uuyuyu....","....uuuuuu....","....uu..uu....","...nnn..nnn...","..nnnn..nnnn.."]
if __name__=='__main__':
    PAL.update({'h':'#5a3a20','u':'#1c2a7c','b':'#3450b0','y':'#f0c020','n':'#6c3a1c','m':'#3c200c'})
    sheet([outline(F[k]) for k in F],'hero.png',z=12)
# ---- big hero (after a mushroom): taller body and legs, same head
HEADB=["....111111....","...12222222...","...2222222333.","...hhssskS....","..hsSsssssS...","..hhsssssss...","...hhsSSSSs...","....SssSSS...."]
def big(top,legs):return HEADB+top+legs
TOPB={'stand':["...11u2222....","..112uuu222...","..1122uu2222..",".w122uyuyu22w.",".ww2uuuuuuu2ww","..wuuuuuuuuuw.","...uuuuuuuu...","...uuuu.uuuu.."],
 'run1':["...11u2222....","..112uuu222...","..1122uu22w...","..1w2uyuyuww..","..wwuuuuuuu...","...uuuuuuuu...","...uuuuuuuu...","..uuuu..uuuu.."],
 'run2':["...11u2222....","..112uuu222...","..1122uu222...","...12uyuyuw...","...wuuuuuuw...","...uuuuuuuu...","...uuuuuuu....","....uuuuuu...."],
 'run3':["...11u2222....","..112uuu222...",".w1122uu2222..",".ww22uyuyu2w..","...2uuuuuuuww.","...uuuuuuuu...","...uuuuuuuu...","...uuu..uuu..."]}
LEGB={'stand':["...uuu..uuu...","...uuu..uuu...","..nnnn..nnnn..",".nnnnn..nnnnn."],
 'run1':[".uuu......uuu.",".uu........uu.","nnn........nnn","nnn........nnn"],
 'run2':["....uuuuu.....","....uuuuu.....","....nnnnnn....","...nnnnnn....."],
 'run3':["..uuu....uuu..","..uu......uu..",".nnn......nnn.",".nnnn....nnnn."]}
for k in ['stand','run1','run2','run3']:F['b_'+k]=big(TOPB[k],LEGB[k])
F['b_jump']=["..........ww..","....111111ww..","...12222222w..","...2222222333.","...hhssskS.w..","..hsSsssssSw..","..hhsssssss...","...hhsSSSSs...","....SssSSS....",
 "..w11u2222....","..w12uuu222...","...122uu222...","...12uyuyu....","....uuuuuuu...","...uuuuuuuu...","...uuuuuuuu...","..uuuu..uuuu..","..uuu....uuuu.","..nnn.....nnnn","..........nnnn"]
F['b_skid']=[r[::-1].replace('3','#').replace('1','3').replace('#','1') for r in F['b_stand']]
F['b_crouch']=["..............","..............","..............","..............","..............","..............","..............","..............",
 "....111111....","...12222222...","...2222222333.","...hhssskS....","..hsSsssssS...","..hhsssssss...","...hhsSSSSs...","....SssSSS....",".w11u22222w...",".ww2uuyuyuww..","..uuuuuuuuuu..","..nnnn..nnnn..",]
F['b_climb']=big(["...11u2222.w..","..112uuu222w..","..1122uu222w..","..122uyuyu....","...2uuuuuuu...","...uuuuuuuu...","...uuuuuuuu...","...uuuu.uuuu.."],LEGB['stand'])
F['b_win']=[".w..........w.",".w..111111..w.",".w.12222222.w.",".w.2222222333.",".w.hhssskS.w..","..hsSsssssSw..","..hhsssssss...","...hhsSSSSs...","....SssSSS....",
 "...11u2222....","..112uuu222...","..1122uu2222..","...22uyuyu22..","...uuuuuuuu...","...uuuuuuuu...","...uuuuuuuu...","...uuuu.uuuu.."]+LEGB['stand']
if __name__=='__main__':
    sheet([outline(F[k]) for k in F if k.startswith('b_')],'hero_big.png',z=10)
