import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# tiles 16x16, theme letters: Q q top surface, A a Z ground light/mid/dark, F f x brick light/mid/mortar, J j ?-block, I mark
T={}
T['top']=["QQQQQQQQQQQQQQQQ","QQqQQQQQQqQQQQQq","qqaqqqQqqaqqqQqa","aaaaAaaqaaaaaAaa","aAaaaaaaaaaAaaaa","aaaaaaZaaaaaaaaZ","aaZaaaaaaaZaaaaa","aaaaaaaaAaaaaaaa",
 "aaaAaaaaaaaaaZaa","aZaaaaaZaaaaaaaa","aaaaaaaaaaAaaaaa","aaaaZaaaaaaaaaaa","aAaaaaaaaZaaaaAa","aaaaaaAaaaaaaaaa","aaaaaaaaaaaaZaaa","ZaaaaZaaaaaaaaaa"]
T['dirt']=[r.replace('Q','a').replace('q','a') for r in T['top'][3:]]+T['top'][3:6]
T['brick']=["FFFFFFFxFFFFFFFx","FffffffxFffffffx","FffffffxFffffffx","xxxxxxxxxxxxxxxx","FFFxFFFFFFFxFFFF","fffxFffffffxFfff","fffxFffffffxFfff","xxxxxxxxxxxxxxxx"]*2
T['hard']=["AAAAAAAAAAAAAAAZ","AaaaaaaaaaaaaaZZ","AaaaaaaaaaaaaZaZ","AaaAAAAAAAAAZaaZ","AaaAaaaaaaaaZaaZ","AaaAaaaaaaaaZaaZ","AaaAaaaaaaaaZaaZ","AaaAaaaaaaaaZaaZ",
 "AaaAaaaaaaaaZaaZ","AaaAaaaaaaaaZaaZ","AaaAaaaaaaaaZaaZ","AaaAZZZZZZZZZaaZ","AaaZaaaaaaaaaaaZ","AaZaaaaaaaaaaaaZ","AZaaaaaaaaaaaaaZ","ZZZZZZZZZZZZZZZZ"]
def qb(mark):
    r=["kkkkkkkkkkkkkkkk","kJJJJJJJJJJJJJJk","kJkJJJJJJJJJJkjk","kJJJJIIIIIJJJJjk","kJJJIIjjjIIJJJjk","kJJJIIjJJIIjJJjk","kJJJJjjJIIIjJJjk","kJJJJJJIIIjjJJjk",
       "kJJJJJJIIjjJJJjk","kJJJJJJJjjJJJJjk","kJJJJJJIIJJJJJjk","kJJJJJJIIjJJJJjk","kJkJJJJJjjJJJkjk","kJJJJJJJJJJJJJjk","kjjjjjjjjjjjjjjk","kkkkkkkkkkkkkkkk"]
    return [x.replace('I',mark) for x in r]
T['q1']=qb('I');T['q2']=qb('W');T['q3']=qb('O')
T['used']=["kkkkkkkkkkkkkkkk","kNNNNNNNNNNNNNNk","kNkNNNNNNNNNNkDk","kNNNNNNNNNNNNNDk","kNNNNNNNNNNNNNDk","kNNNNNNNNNNNNNDk","kNNNNNNNNNNNNNDk","kNNNNNNNNNNNNNDk",
 "kNNNNNNNNNNNNNDk","kNNNNNNNNNNNNNDk","kNNNNNNNNNNNNNDk","kNNNNNNNNNNNNNDk","kNkNNNNNNNNNNkDk","kNNNNNNNNNNNNNDk","kDDDDDDDDDDDDDDk","kkkkkkkkkkkkkkkk"]
# pipes: 2 tiles wide. top row (lip) and body
lipL="kLLlllllllllllll";T['pipeTL']=["kkkkkkkkkkkkkkkk"]+["kLLWLlllllllllll"]*13+["kLLlllllllllllll","kkkkkkkkkkkkkkkk"]
T['pipeTR']=["kkkkkkkkkkkkkkkk"]+["lllllllleleeeeek"]*13+["lllllllleleeeeek","kkkkkkkkkkkkkkkk"]
T['pipeBL']=["..kLLWLlllllllll"]*16
T['pipeBR']=["lllllllleleeek.."]*16
# coin 4 frames (10x14 inside)
COIN=[["...yyyy...","..yYYYYy..",".yYYyyYYy.",".yYYyyYYy.",".yYYyyYYy.",".yYYyyYYy.",".yYYyyYYy.",".yYYyyYYy.","..yYYYYy..","...yyyy..."],
      ["...yyy....","..yYYYy...","..yYyYy...","..yYyYy...","..yYyYy...","..yYyYy...","..yYyYy...","..yYyYy...","..yYYYy...","...yyy...."],
      ["....yy....","....yy....","....Yy....","....Yy....","....Yy....","....Yy....","....Yy....","....Yy....","....yy....","....yy...."],
      ["....yyy...","...yYYYy..","...yYyYy..","...yYyYy..","...yYyYy..","...yYyYy..","...yYyYy..","...yYyYy..","...yYYYy..","....yyy..."]]
# items
MUSH=["....RRRRRR....","..RRwwRRRRRR..",".RRwwwwRRwwRR.",".RRwwRRRRwwwR.","RRRRRRRRRRwwRR","RwwRRRRRRRRRRR","RwwwRRwwRRRRRR",".RRRRwwwRRRRR.","..ssskssksss..","..sssksskssS..","..ssssssssSS..","...sSSSSSSS..."]
FLOWER=["....RRRRRR....","..RROOOOOORR..",".RROYYYYYYORR.",".ROYYkYYkYYOR.",".RROYYYYYYORR.","..RROOOOOORR..","....RRRRRR....","......LL......",".LLL..LL..LLL.","..LLL.LL.LLL..","...LLLLLLLL...","......LL......"]
STAR=["......Y.......","......YY......",".....YYYY.....","YYYYYYYYYYYYY.",".YYYkYYkYYYY..","..YYkYYkYYY...","...YYYYYYY....","...YYYYYYYY...","..YYYY..YYYY..","..YYY....YYY..",".YY........YY."]
# enemies: a stomping mushroom-grump (2 walk frames + flat) and a shell beetle (2 walk + shell)
GRUMP=[["....nnnnnn....","..nnNNNNNNnn..",".nNNNNNNNNNNn.","nNwkNNNNNNkwNn","nNwwkNNNNkwwNn","nNNwwNNNNwwNNn","nNNNNNNNNNNNNn",".nnTTTTTTTTnn.","...TTTTTTTT...","..mmTTTTTT....",".mmmm..mmmm...",".mmm....mmm..."],
       ["....nnnnnn....","..nnNNNNNNnn..",".nNNNNNNNNNNn.","nNwkNNNNNNkwNn","nNwwkNNNNkwwNn","nNNwwNNNNwwNNn","nNNNNNNNNNNNNn",".nnTTTTTTTTnn.","...TTTTTTTT...","....TTTTTTmm..","...mmmm..mmmm.","...mmm....mmm."]]
GRUMP_FLAT=["..nnnnnnnnnn..",".nNwkNNNNkwNn.","nNNNNNNNNNNNNn",".mmmTTTTTTmmm."]
BEETLE=[["......LLLL....",".....LllllL...","....LlLLLLlL..","...LlLLllLLlL.","...LlLllllLlL.","...LlLLllLLlL.","..sLlllllllll.",".sksLLLLLLLLL.",".ssssyyyyyyy..","..sss.yy..yy..","...ss.ss..ss..","......ss...ss."],
        ["......LLLL....",".....LllllL...","....LlLLLLlL..","...LlLLllLLlL.","...LlLLllLLlL.","...LlLllllLlL.","..sLlllllllll.",".sksLLLLLLLLL.",".ssssyyyyyyy..","..sss..yy.yy..","...ss..ss.ss..","......ss.ss..."]]
SHELL=["....LLLLLL....","..LLlllllLL...",".LlLLLLLLLlL..",".LlLlllllLlL..",".LlLLLLLLLlL..","LLllllllllllL.","LwwwwwwwwwwwwL",".yyyyyyyyyyyy."]
FLAG=["kkkkkkkkkkkk","WWWWWWWWWWWk",".WWLLLLWWWWk","..WWLLWWWWWk","...WWWWWWWWk","....WWWWWWWk",".....WWWWWWk","......WWWWWk",".......WWWWk","........kkkk"]

# lava (2 frames): a glowing surface that ripples, darker swirls below. Not solid: you fall in.
def lava(ph):
    rows=[]
    for y in range(16):
        r=''
        for x in range(16):
            w=(x+ph)%8
            if y==0: c='.' if w not in (2,3,4) else 'Y'
            elif y==1: c='Y' if w in (1,2,3,4,5) else 'y'
            elif y==2: c='y' if w in (0,6,7) else 'O'
            else:
                import math
                a=math.sin(x*.7+y*.45+ph*.8)+math.sin(x*.31-y*.8+ph*.4)
                c='r' if a>1.35 else 'O' if a<-1.45 and y<9 else 'o'
            r+=c
        rows.append(r)
    return rows
T['lava1']=lava(0);T['lava2']=lava(4)
# moving platform (16 x 8 segment, repeated): a riveted girder lift
LIFT=["kkkkkkkkkkkkkkkk","kWWWWWWWWWWWWWWk","kGwGGGGGGGGGGwGk","kGGGGGGGGGGGGGGk","kgggggggggggggggk"[:16],"kgKgggKggggKgggk","kKKKKKKKKKKKKKKk","kkkkkkkkkkkkkkkk"]
# a firebar ball (outlined at export)
FIREB=[".OOOO.","OYYYYO","OYWWYO","OYWWYO","OYYYYO",".OOOO."]
if __name__=='__main__':
    PAL.update({'Q':'#88dc48','q':'#38a038','A':'#e8a070','a':'#c06838','Z':'#6c3018','F':'#d07040','f':'#a84c28','x':'#3c1c10','J':'#f0b030','j':'#a8641c','I':'#ffffff','h':'#5a3a20','u':'#1c2a7c'})
    sheet([T[k] for k in T],'tiles.png',z=6)
    sheet([outline(c) for c in COIN]+[outline(MUSH),outline(FLOWER),outline(STAR)]+[outline(g) for g in GRUMP]+[outline(GRUMP_FLAT)]+[outline(b) for b in BEETLE]+[outline(SHELL),outline(FLAG)],'things.png',z=8)
# the walker is an acorn grump: leafy stalk, cross-hatched cap
GRUMP=[["......el......","....mmeMmm....","..mMmMmMmMmm..",".mMmMmMmMmMmm.","nNwkNNNNNNkwNn","nNwwkNNNNkwwNn","nNNwwNNNNwwNNn","nNNNkkkkkkNNNn",".nnNNNNNNNNnn.","...TTTTTTTT...","..mmTTTTTT....",".mmmm..mmmm..."],
       ["......le......","....mmMemm....","..mmMmMmMmMm..",".mmMmMmMmMmMm.","nNwkNNNNNNkwNn","nNwwkNNNNkwwNn","nNNwwNNNNwwNNn","nNNNkkkkkkNNNn",".nnNNNNNNNNnn.","...TTTTTTTT...","....TTTTTTmm..","...mmmm..mmmm."]]
GRUMP_FLAT=[".mMmMmMmMmMmm.","nNwkNNNNNNkwNn",".nnNNNNNNNNnn.",".mmmTTTTTTmmm."]
CLOUD=["..........WWWW..........","......WWWWWWWWWW........","....WWWWWWWWWWWWWW......","..WWWWWWWWWWWWWWWWWWW...",".WWWWWWWWWWWWWWWWWWWWWW.","WWWWWWWWWWWWWWWWWWWWWWWW","WWWWWWWWWWWWWWWWWWWWWWWW","CWWWWWWWWWWWWWWWWWWWWWWC",".CCWWWWWWWWWWWWWWWWWWCC.","...CCCCCCCCCCCCCCCCCC..."]
BUSH=["........LLLL............","......LLLLLLL...LLLL....","....LLLLlLLLLLLLLLLLLL..","..LLLLlllLLLLLLlLLLLLLL.",".LLLLlllllLLLLlllLLLLLLL","LLLlllllllllllllllLLLLLl","LlllllllllllllllllllllLl","llllllllllllllllllllllll"]
HILL=["..........eeee..........",".........eLLLLe.........","........eLLLLLLe........",".......eLLkLLkLLe.......","......eLLLLLLLLLLe......",".....eLLLLLLLLLLLLe.....","....eLLLLLLLLLkLLLLe....","...eLLLLLkLLLLLLLLLLe...","..eLLLLLLLLLLLLLLLLLLe..",".eLLLLLLLLLLLLLLLLLLLLe.","eLLLLLLLLLLLLLLLLLLLLLLe"]
if __name__=='__main__':
    sheet([outline(g) for g in GRUMP]+[outline(GRUMP_FLAT),CLOUD,BUSH,HILL],'things2.png',z=8)
