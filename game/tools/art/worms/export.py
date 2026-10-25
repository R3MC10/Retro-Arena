import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import outline
from worm import F
from things import T
here=os.path.dirname(os.path.abspath(__file__))
art={'w':{k:outline(v) for k,v in F.items()},'t':{k:(v if k in ('girder','hook') else outline(v)) for k,v in T.items()}}
open(os.path.join(here,'worms_art.js'),'w').write('const ART='+json.dumps(art)+';');print('ok')
