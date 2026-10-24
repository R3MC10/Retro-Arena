import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
W,H=32,26
def build(segs,w=W,h=H):
    g=Grid(w,h)
    for y,x,s in segs:
        for i,ch in enumerate(s):
            if ch!='.': g.set(x+i,y,ch)
    return g.rows()
RIDER=[
 (1,17,'1112'),(2,16,'111222'),(2,22,'3'),(3,16,'1122kC'),(3,22,'33'),(4,16,'222223'),(5,17,'23333'),(5,22,'G'),
 (6,13,'1122223'),(7,12,'1122223'),(7,19,'33'),(8,11,'1222223'),(8,20,'333'),(9,10,'122223'),(9,22,'KK'),(10,9,'12223'),
 (11,8,'GGGGGGg'),(12,10,'GGGGGGGg'),(13,15,'Ggg'),(14,15,'Gg'),(15,14,'KKKK'),
]
BIKE=[
 (9,0,'1'),(10,0,'1112222'),(11,2,'222223'),(12,3,'KKKKKKK'),(13,4,'2222222222'),(13,5,'wwww'),(14,5,'wKwK'),(14,9,'2222'),
 (13,18,'1122'),(14,18,'22223'),
 (9,21,'K'),(9,24,'KK'),(10,23,'G'),(11,23,'GG'),(12,24,'GG'),(13,24,'GG'),(14,25,'GG'),(15,25,'GG'),(16,26,'GG'),(17,26,'Gg'),(18,26,'g'),
 (10,25,'Ww'),(11,25,'ww'),(12,26,'w'),(14,24,'1112222'),(15,29,'22'),
 (15,6,'GGGGGGG'),(16,7,'gggggg'),(16,13,'GGGgg'),(17,13,'GgggK'),(18,13,'gKgKg'),(19,14,'gggK'),(19,9,'KKKKK'),(20,8,'KK'),
]
WA=["...kkkkk...",".kkKKKKKkk.",".kKKgGgKKk.","kKKG...GKKk","kKg.G.G.gKk","kKG..k..GKk","kKg.G.G.gKk","kKKG...GKKk",".kKKgGgKKk.",".kkKKKKKkk.","...kkkkk..."]
WB=["...kkkkk...",".kkKKKKKkk.",".kKKgGgKKk.","kKKg.G.gKKk","kKg..G..gKk","kKGGGkGGGKk","kKg..G..gKk","kKKg.G.gKKk",".kKKgGgKKk.",".kkKKKKKkk.","...kkkkk..."]
def full(wh,rider=RIDER):
    g=Grid(W+2,H+2); g.paste(outline(build(BIKE+rider)),0,0); g.paste(wh,1+2,1+15); g.paste(wh,1+21,1+15)
    return g.rows()
if __name__=='__main__':
    sheet([full(WA),full(WB),(full(WA),'#2888ff'),(full(WB),'#f8c020'),(full(WA),'#20c040'),(full(WA),'#ff78e0')],'bike3.png',z=8)
