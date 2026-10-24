import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# 8x8 blocks. tiers of breakable ice by altitude: grass / earth / ice / crystal; plus rock (unbreakable), slip ice, belts
T={}
T['grass']=["LLLLLLLl","LlLLLlLL","nNNnNNNn","NnNNNnNN","NNnNNNNn","nNNNnNNN","NNNnNNnN","mmmmmmmm"]
T['earth']=["TTTTTTTt","TttTTTtT","tTDtTDtt","DttDttDt","tDtttDtD","ttDtDttt","DtttDtDt","MMMMMMMM"]
T['ice']  =["CCCCCCCc","CWCCCCcB","CCBBCCBB","cBBBcBBb","BBcBBBBb","BBBBcBBb","bBBBBBbb","uuuuuuuu"]
T['cryst']=["PPPPPPPp","PWPPPPpV","PPVVPPVV","pVVVpVVv","VVpVVVVv","VVVVpVVv","vVVVVVvv","vvvvvvvv"]
T['rock'] =["GGGGGGgK","GgggGggK","GgggGggK","KKKKKKKK","GGgKGGGg","ggGKgggg","ggGKgggg","KKKKKKKK"]
T['slip'] =["WWWWWWWC","WCCWCCCC","CCWWCCWC","CWCCCWCC","CCCCWCCB","CCWCCCCB","BCCCCBBB","BBBBBBBB"]
T['beltL']=["GGGGGGGG","kkkkkkkk","yk.yk.yk","kyk.yk.y","yk.yk.yk","kkkkkkkk","GgggGggg","KKKKKKKK"]
SEAL=[["....wwww....","..wwwwwwkw..",".wwwwwwwwwwk","wwwBwwwwwww.","wBBBBwwwwBB.","..B..B..B..."],
      ["....wwww....","..wwwwwwkw..",".wwwwwwwwwwk","wwwBwwwwwww.","wBBBBwwwwBB.",".B..B..B...."]]
BIRD=[["...BBB......",".BBBBBB..yy.","BBbBBBBBBk..",".bb.BBBB....","....b..b...."],
      [".B......B...",".BBB..BBB.yy","BBbBBBBBBk..",".....BBB....","....b..b...."]]
CONDOR=[["......NNN.........NNN......","....NNnnNN.......NNnnNN....","..NNnnnnnNNN...NNNnnnnnNN..","NNnnn..nnnNNNNNNNnnn..nnnNN",".....n...nnNNNNNnn...n...n.","...........nNRRwnk.........","............nNnnRRk........","..............yy..yy......."],
        [".............NNNNN.........","............NnnnnnN........","..........NNnnRRwnnN.......","......NNNnnnNNRRnknnNNN....","...NNnnnnnNNNNNNnNNnnnnNN..",".NNnn....nnN.yy.Nnn...nnnN.","Nn.........n.yy..n.......nN","..........................."]]
VEG={'eggplant':["...ll...","..llll..",".vVvvv..","vVvvvvv.","vvvvvvvv","vvvvvvvv",".vvvvvv.","..vvvv.."],
 'carrot':["..lLl...","...l....","..oOo...","..ooo...","..ooo...","...oo...","...o....","...o...."],
 'cabbage':["..lLLl..",".lLLLLl.","lLlLLlLl","lLLlLLLl","lLLLlLLl",".lLLLLl.","..llll..","........"],
 'corn':["..yYy...",".yYyYy..",".YyYyY..",".yYyYy.l",".YyYyYl.","lyYyYyl.",".lyYyl..","..ll...."],
 'melon':["..llll..",".lLlLll.","lLlLlLll","LlLlLlLl","lLlLlLll","LlLlLlLl",".lLlLll.","..llll.."]}
CLOUD=["..WWWW....WWWW......","WWWWWWWWWWWWWWWWW...","WWWCWWWWWWWCWWWWWWW.","CCCCCCCCCCCCCCCCCCCC",".CCCCCC..CCCCCCCCC.."]
ICICLE=["CWC","CWC","CCC",".C.",".C.",".c."]
if __name__=='__main__':
    sheet([T[k] for k in T]+[outline(s) for s in SEAL+BIRD]+[outline(c) for c in CONDOR]+[outline(v) for v in VEG.values()]+[outline(CLOUD,'C'),outline(ICICLE)],'world.png',z=8)
