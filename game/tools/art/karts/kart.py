import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
SW={'1':'3','3':'1','<':'>','>':'<'}
def mirror(half):   # left half -> full row; shading flips so the light stays top-left
    return [h+''.join(SW.get(c,c) for c in reversed(h)) for h in half]
BACK_L=[
 "............1111",
 "..........111112",
 ".........111w122",
 ".........11w2222",
 ".........122w222",
 "..........2w2233",
 "...........33333",
 "..........111222",
 ".........3112222",
 "........33112222",
 "........3.322222",
 "......2222333333",
 ".....22222333333",
 "KKKKK22222223ggg",
 "KgggK22222223gGg",
 "KKKKK22222222ggg",
 "KgggK32222222GgK",
 "KKKKK33333333GGK",
 "KgggK..333333333",
 "KKKKK...........",
 "KgggK...........",
 ".KKK............",
]
FRONT_L=[
 "............1111",
 "..........111112",
 ".........1111122",
 ".........11uuuuu",
 ".........11uBuuu",
 "..........2uuuuu",
 "...........22222",
 "...........sss..",
 "..........11122.",
 ".........KK1KKKK",
 "........3K12K...",
 "......1111K22222",
 ".....11111222222",
 "KKKK.111wwwwwwww",
 "KgggK11wwkkwwkkw",
 "KKKKK111wwwwwwww",
 "KgggK222222222222"[:16],
 "KKKKK.3333333333",
 "KgggK...........",
 ".KKK............",
]
if __name__=='__main__':
    B=mirror(BACK_L);F=mirror(FRONT_L)
    sheet([outline(B),outline(F),(outline(B),'#2c78f0'),(outline(F),'#f8c020')],'kart.png',z=10)
