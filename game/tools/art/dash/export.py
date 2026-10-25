import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import outline
from hero import F
import world as W
here=os.path.dirname(os.path.abspath(__file__))
art={'hero':{k:outline(v) for k,v in F.items()},'tile':W.T,'coin':[outline(c) for c in W.COIN],
 'mush':outline(W.MUSH),'flower':outline(W.FLOWER),'star':outline(W.STAR),'grump':[outline(g) for g in W.GRUMP],'flat':outline(W.GRUMP_FLAT),
 'beetle':[outline(b) for b in W.BEETLE],'shell':outline(W.SHELL),'flag':outline(W.FLAG),'cloud':W.CLOUD,'lift':W.LIFT,'fireb':outline(W.FIREB),'bush':W.BUSH,'hill':W.HILL}
open(os.path.join(here,'dash_art.js'),'w').write('const ART='+json.dumps(art)+';');print('ok',len(json.dumps(art)))
