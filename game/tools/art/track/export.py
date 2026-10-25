import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import outline
from athlete import F
here=os.path.dirname(os.path.abspath(__file__))
open(os.path.join(here,'track_art.js'),'w').write('const ART='+json.dumps({'a':{k:outline(v) for k,v in F.items()}})+';');print('ok')
