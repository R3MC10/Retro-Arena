import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import outline
from climber import F
from world import T,SEAL,BIRD,CONDOR,VEG,CLOUD,ICICLE
here=os.path.dirname(os.path.abspath(__file__))
art={'cl':{k:outline(v) for k,v in F.items()},'tile':T,'seal':[outline(s) for s in SEAL],'bird':[outline(b) for b in BIRD],'condor':[outline(c) for c in CONDOR],
 'veg':[outline(v) for v in VEG.values()],'cloud':outline(CLOUD,'C'),'icicle':outline(ICICLE)}
open(os.path.join(here,'icepeak_art.js'),'w').write('const ART='+json.dumps(art)+';');print('ok',len(json.dumps(art)))
