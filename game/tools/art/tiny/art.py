import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# a tiny racer seen from above, nose up: 1 2 3 body (player colour), C windscreen, k tyres, W stripe, Y lights
CAR=["...11111...",
     "..1YW1WY1..",
     "KK1111111KK",
     "KK1122211KK",
     "KK1CCCCC3KK",
     "..1CCCCC3..",
     "..1222223..",
     "..1W222W3..",
     "..1222223..",
     "..1CCCCC3..",
     "KK1222223KK",
     "KK1222223KK",
     "KK1222223KK",
     "..1333333.."]
if __name__=='__main__':
    sheet([outline(CAR)],'car.png',z=12)
    open('tiny_art.js','w').write('const ART='+json.dumps({'car':outline(CAR)})+';')
