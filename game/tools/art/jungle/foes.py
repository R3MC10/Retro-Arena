import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
from commando import F
# enemy soldier facing left: G g grey uniform, M helmet, s skin
SOL={'r1':["....MMMM....","...MMMMMM...","..MMMMMMMM..","...ksssk....","...sssss....","....sss.....","..GGGGGGG...",".GGgGGGGgG..",".sG.GGGG.Gs.",".s..GGGG..s.","....kkkk....","...GG..GG...","..GG....GG..",".GG......GG.",".KK......KK.","KKK......KKK"],
 'r2':["....MMMM....","...MMMMMM...","..MMMMMMMM..","...ksssk....","...sssss....","....sss.....","..GGGGGGG...",".GgGGGGGgs..","..sGGGGGG...","....GGGG....","....kkkk....","....GGGG....","....GGG.....","....GGG.....","....KKK.....","...KKKK....."],
 'r3':["....MMMM....","...MMMMMM...","..MMMMMMMM..","...ksssk....","...sssss....","....sss.....","..GGGGGGG...",".GGgGGGGgG..","..sGGGGGGs..","....GGGG....","....kkkk....","...GG.GG....","..GG...GG...","..GG....GG..","..KK....KK..",".KKK....KKK."],
 'aim':["....MMMM....","...MMMMMM...","..MMMMMMMM..","...ksssk....","...sssss....","....sss.....","GGGGGGGGG...","nnnnGGGGgG..","...sGGGG.Gs.","....GGGG..s.","....kkkk....","...GG..GG...","...GG..GG...","...GG..GG...","..KKK..KKK..",".KKKK..KKKK."]}
CAPS=[["......kk......","..kkkkWWkkkk..","kWWWkRRRRkWWWk",".kkWRRYYRRWkk.","...kRRRRRRk...","....kkkkkk...."],["..............","kk..kkWWkk..kk","kWWkRRRRRRkWWk","..kWRRYYRRWk..","...kRRRRRRk...","....kkkkkk...."]]
EAGLE=["W....WW....W","WW..WWWW..WW","WWWWWWWWWWWW",".WWWWWWWWWW.","..WWWWWWWW..","...WW..WW..."]
if __name__=='__main__':
    PAL.update({'h':'#1c1418'})
    sheet([outline(SOL[k]) for k in SOL]+[outline(c) for c in CAPS]+[outline(EAGLE)],'foes.png',z=8)
    art={'cm':{k:outline(v) for k,v in F.items()},'sol':{k:outline(v) for k,v in SOL.items()},'caps':[outline(c) for c in CAPS],'eagle':outline(EAGLE)}
    open('jungle_art.js','w').write('const ART='+json.dumps(art)+';')
