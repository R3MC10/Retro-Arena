import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
from bike3 import build,WA,WB
W,H=32,26
RIDER=[
 (0,15,'1112'),(1,14,'111222'),(1,20,'33'),(2,14,'112kCC'),(3,14,'222233'),(3,20,'G'),(4,15,'2333'),
 (5,13,'112223'),(6,12,'1122223'),(6,19,'23'),(7,12,'122223'),(7,20,'33'),(8,11,'122223'),(8,22,'KK'),(9,11,'12223'),
 (10,10,'wwwwwG'),(11,10,'wwwwwwwG'),(12,15,'wGG'),(13,15,'wG'),(14,15,'wG'),(15,14,'KKKK'),
]
BIKE=[
 (10,2,'11122'),(11,3,'2KKKKKK'),(12,4,'2222222222'),(12,5,'wwww'),(13,5,'wKwK'),(13,9,'22223'),
 (11,10,'KKKKKKKK'),(12,14,'2222'),(13,14,'1122'),(14,15,'GG'),(15,15,'gG'),(14,17,'2'),
 (12,18,'1122'),(13,18,'22223'),
 (14,5,'GGGGGGG'),(15,6,'gggggg'),(16,12,'GGGgg'),(17,12,'GgggK'),(18,12,'gKgKg'),(19,13,'gggK'),(19,8,'KKKKK'),
 (8,21,'K'),(8,24,'K'),(9,22,'G'),(10,23,'GG'),(11,23,'GG'),(12,24,'GG'),(13,24,'GG'),(14,25,'GG'),(15,25,'GG'),(16,26,'G'),(17,26,'g'),
 (9,24,'Ww'),(10,25,'ww'),(11,25,'w'),(14,23,'1112222'),(15,28,'22'),
]
def full(wh,rider=RIDER,bike=BIKE):
    g=Grid(W+2,H+2); g.paste(outline(build(bike+rider)),0,0); g.paste(wh,1+2,1+15); g.paste(wh,1+21,1+15)
    return g.rows()
if __name__=='__main__':
    sheet([full(WA),full(WB),(full(WA),'#2888ff'),(full(WB),'#f8c020'),(full(WA),'#20c040'),(full(WA),'#ff78e0')],'bike4.png',z=8)
