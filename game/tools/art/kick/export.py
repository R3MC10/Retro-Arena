import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import outline
from player import F
from poses import SP
from items import BALL,ICON
here=os.path.dirname(os.path.abspath(__file__))
art={'man':{k:outline(v) for k,v in list(F.items())+list(SP.items())},'ball':[outline(b) for b in BALL],'icon':{k:outline(v) for k,v in ICON.items()}}
open(os.path.join(here,'kick_art.js'),'w').write('const ART='+json.dumps(art)+';');print('ok',len(json.dumps(art)))
