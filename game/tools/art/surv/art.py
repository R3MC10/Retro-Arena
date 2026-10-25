import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# hooded hunter facing right, 12x15 inside the outline: 1 2 3 cloak (player colour), s skin, k eyes, n boots, G blade
HERO={'w1':["....1111....","...112222...","..11222222..","..1Kssss2...","..1Ksksk2...","...Ksss22...","..122222223.",".s12222223s.",".s12222223s.","..1222222 3.".replace(' ','2'),"..12222223..","...223322...","...nn..nn...","..nnn..nnn.."],
 'w2':["....1111....","...112222...","..11222222..","..1Kssss2...","..1Ksksk2...","...Ksss22...","..122222223.",".s12222223s.","..s2222223s.","..1222222 3.".replace(' ','2'),"..12222223..","...222322...","....nnnn....","...nnn......"],
 'hurt':["....WWWW....","...WWWWWW...","..WWWWWWWW..","..WKWWWWW...","..WKWKWKW...","...KWWWWW...","..WWWWWWWWW.",".WWWWWWWWWW.",".WWWWWWWWWW.","..WWWWWWWWW.","..WWWWWWWW..","...WWWWWW...","...WW..WW...","..WWW..WWW.."],
 'ghost':["....CCCC....","...CCCCCC...","..CCCCCCCC..","..CkCCkCCC..","..CCCCCCCC..","..CCCkkCCC..","..CCCCCCCC..","..CCCCCCCC..","..CCCCCCCC..","..CCCCCCCC..","..CC.CC.CC..","..C..C..C...","............","............"]}
BAT=[["k.........k","kk..kkk..kk","kVVkrkrkVVk",".VVVkkkVVV.","..V.kkk.V..","....k.k...."],[".....k.....","....kkk....","..VkrkrkV..",".VVVkkkVVV.","VV..kkk..VV","V...k.k...V"]]
ZOMB=[["...llll...","..llllll..","..lkllkl..","..llllll..","...lkkl...","..vvvvvv..","llvvvvvvll","l.vvvvvv.l","..vvvvvv..","..bbbbbb..","..bb..bb..","..bb..bb..",".mmm..mmm."],
      ["...llll...","..llllll..","..lkllkl..","..llllll..","...lkkl...","..vvvvvv..",".lvvvvvvl.",".lvvvvvvl.","..vvvvvv..","..bbbbbb..","..bb.bb...","...bbbb...","..mmmmm..."]]
SKEL=[["...wwww...","..wwwwww..","..wkwwkw..","..wwwwww..","...wkkw...","....ww....","..wwwwww..",".w.wwww.w.","...wwww...","....ww....","...w..w...","...w..w...","..ww..ww.."],
      ["...wwww...","..wwwwww..","..wkwwkw..","..wwwwww..","...wkkw...","....ww....","..wwwwww..","..wwwwwww.","...wwww...","....ww....","....ww....","...w.w....","..ww.ww..."]]
GHOST=[["...CCCC...","..CCCCCC..",".CCkCCkCC.",".CCkCCkCC.",".CCCCCCCC.",".CCCkkCCC.",".CCCCCCCC.",".CCCCCCCC.",".CC.CC.CC.",".C..C..C.."],
       ["...CCCC...","..CCCCCC..",".CCkCCkCC.",".CCkCCkCC.",".CCCCCCCC.",".CCCkkCCC.",".CCCCCCCC.",".CCCCCCCC.","..CC.CC.CC","..C..C..C."]]
BOSS=[[".......KKKKKK.........","......KKKKKKKK........",".....KKKKKKKKKK.......","....KKggggggggKK......","....KKgRggggRgKK......","....KKggggggggKK..G...","....KKKggRRggKKK.GG...","...KKKKKKKKKKKKKKGG...","..KKKKKKKKKKKKKKKKG...",".KKKKKKKKKKKKKKKKKKG..",".KK.KKKKKKKKKKKK.KKG..",".K..KKKKKKKKKKKK..KG..","....KKKKKKKKKKKK...G..","....KKKKKKKKKKKK...G..","...KKKKKKKKKKKKKK..G..","...KKKK.KKKK.KKKK..G..","..KKK...KKK...KKK.....","..KK....KK.....KK....."]]
GEM={'b':["..k..",".kBk.","kBBbk","kBbbk",".kbk.","..k.."],'g':["..k..",".kLk.","kLLlk","kLllk",".klk.","..k.."],'r':["..k..",".kRk.","kRRrk","kRrrk",".krk.","..k.."]}
AXE=[".....GG...","....GGGG..","...GGWGGG.","..nnGGGG..",".nn..GG...","nn........"]
CHEST=["kkkkkkkkkkkk","kNNNNNNNNNNk","knnnnYYnnnnk","kkkkkYYkkkkk","kNNNNYYNNNNk","knnnnnnnnnnk","knnnnnnnnnnk","kkkkkkkkkkkk"]
ICON={
'whip':["..........","........nn",".......nn.","..WWW.nn..",".W...Wn...","W.....W...",".......W..","........W.","..........",".........."],
'bolt':["..........","....CC....","...CWWC...","..CWWWWC..","..CWWWWC..","...CWWC...","....CC....","....c.....","...c......",".........."],
'axe':AXE+["..........","..........","..........",".........."],
'water':["....GG....","....GG....","...bBBb...","..bBBBBb..","..bBWBBb..","..bBBBBb..","...bbbb...","..........","..........",".........."],
'light':[".....YY...","....YY....","...YYYY...","....YY....","...YY.....","..YY......",".YYYYY....","...YY.....","..Y.......",".........."],
'garlic':["..........","...wwww...","..wWWWWw..",".wWWkWWWw.",".wWkWkWWw.",".wWWWWWWw.","..wwwwww..","...L..L...","..........",".........."],
'boots':["..........","..nn......","..nN......","..nN......","..nNN.....","..nNNNNn..",".kkkkkkkk.","..........","..........",".........."],
'heart':["..........",".RR...RR..","RRRR.RRRR.","RWRRRRRRR.","RRRRRRRRR.",".RRRRRRR..","..RRRRR...","...RRR....","....R.....",".........."],
'might':["..........","....rr....","...rRRr...","..rRWWRr..",".rRRRRRRr.","..rRRRRr..","...rrrr...","..........","..........",".........."],
'magnet':["..........",".RR...RR..",".RR...RR..",".RR...RR..",".RRr.rRR..","..RRRRR...","...rrr....","..........","..........",".........."],
'clock':["...kkkk...","..kWWWWk..",".kWWkWWWk.",".kWWkWWWk.",".kWWkkkWk.",".kWWWWWWk.","..kWWWWk..","...kkkk...","..........",".........."]}
DECOR={'flower':["..p..","pYp..","..p.L",".L.L.","..L.."],'grave':["..GGG..",".GgggG.",".GgkgG.",".GgggG.",".GgkgG.","GGGGGGG"],'rock':["..GGG..",".GGGgg.","GGggggg"],
 'tuft':["L.L.L",".LLL."]}
if __name__=='__main__':
    sheet([outline(HERO[k]) for k in HERO]+[outline(b) for b in BAT]+[outline(z) for z in ZOMB]+[outline(s) for s in SKEL]+[outline(g) for g in GHOST]+[outline(BOSS[0])],'chars.png',z=8)
    sheet([GEM[k] for k in GEM]+[outline(AXE),outline(CHEST)]+[outline(ICON[k]) for k in ICON]+[DECOR[k] for k in DECOR],'items.png',z=8)
    art={'hero':{k:outline(v) for k,v in HERO.items()},'bat':[outline(b) for b in BAT],'zomb':[outline(z) for z in ZOMB],'skel':[outline(s) for s in SKEL],'ghost':[outline(g) for g in GHOST],'boss':[outline(BOSS[0])],
     'gem':GEM,'axe':outline(AXE),'chest':outline(CHEST),'icon':{k:outline(v) for k,v in ICON.items()},'decor':DECOR}
    open('surv_art.js','w').write('const ART='+json.dumps(art)+';')
