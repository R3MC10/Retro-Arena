import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
from pixart import *
from bike3 import build
from bike4 import BIKE
from poses2 import P,ALONE,wheel,pose_rows
OY=6;W,H=36,34
def frame_with(name):
    g=Grid(W,H);g.paste(outline(build(BIKE,32,26)),1,OY);g.paste(outline(pose_rows(name,W-2,H-2,OY-1)),0,0);return g.rows()
art={'poses':{k:frame_with(k) for k in P},'wheels':[wheel(f) for f in range(4)],'alone':{k:outline(v) for k,v in ALONE.items()}}
open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'excite_art.js'),'w').write('const ART='+json.dumps(art)+';')
# check: where are the axles in composite coords (wheel 11x11 pasted at (3,21) and (22,21) -> centres (8,26) and (27,26))
pass;print('ok')
