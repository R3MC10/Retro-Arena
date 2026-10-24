import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# ball: 6x6 inside the outline, 4 spin frames (the dark patches roll round)
BALL=[["..ww..",".WWkw.","WWkkWw","WWWWww",".wWWw.","..ww.."],
      ["..ww..",".WWWw.","WWWkkw","WWWkkw",".wWWw.","..ww.."],
      ["..ww..",".WWWw.","WWWWww","WWkkWw",".wkkw.","..ww.."],
      ["..ww..",".WWWw.","kkWWww","kkWWww",".wWWw.","..ww.."]]
# power-up icons 10x10: boots, fire shot, banana, magnet, giant glove, freeze, brick wall, tiny
ICON={
'boots':["..........","..cc......","..cCc.....","..cCc.....","..cCCc....","..cCCCcc..",".kkkkkkkk.","..k.k.k...","..........",".........."],
'fire':["....O.....","...OYO..O.","..OYYYO.O.",".OYWWYYO..",".OYWWWYO..",".ooYYYOo..","..ooOoo...","...ooo....","..........",".........."],
'banana':["......nn..",".....yY...","....yYy...","...yYy....","..yYYy....",".yYYy.....",".yYy......","..yy......","..........",".........."],
'magnet':["..........",".rr...rr..",".RR...RR..",".RR...RR..",".RR...RR..",".RRr.rRR..","..RRRRR...","...rrr....","..........",".........."],
'glove':["..w.w.w...",".wW.W.W...",".wWwWwW.w.",".wWWWWWwW.",".wWWWWWWw.",".wWWWWWw..","..wWWWw...","..bbbbb...","..BBBBB...",".........."],
'freeze':["....C.....","..C.C.C...","...CWC....",".CCWWWCC..","...CWC....","..C.C.C...","....C.....","..........","..........",".........."],
'brick':["..........","rrrRrrrRr.","RkkkkkkkR.","rRrrrRrrr.","kkkkkkkkk.","rrrRrrrRr.","RkkkkkkkR.","rRrrrRrrr.","..........",".........."],
'tiny':["..........","...pppp...","..pPPPPp..",".pPwPPwPp.",".pppppppp.","...sss....","...sSs....","..........","..........",".........."]}
if __name__=='__main__':
    sheet([outline(b) for b in BALL]+[outline(ICON[k]) for k in ICON],'items.png',z=10)
