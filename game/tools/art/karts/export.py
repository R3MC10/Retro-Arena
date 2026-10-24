import sys,os,json;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import outline,sheet
from kart2 import VIEWS
from items import ICON,WORLD
here=os.path.dirname(os.path.abspath(__file__))
TYRES={'back':[(0,4,13,21),(27,31,13,21)],'front':[(0,4,13,19),(27,31,13,19)],'bq':[(0,4,12,19),(25,30,8,13),(13,18,15,19)],
 'fq':[(3,7,9,13),(2,6,15,19),(18,22,15,20)],'side':[(3,9,16,20),(19,25,16,20)]}
def rolled(name,rows):
    g=[list(r) for r in rows];h=len(g);w=len(g[0])
    for (x0,x1,y0,y1) in TYRES[name]:
        for y in range(y0,y1+1):
            for x in range(x0,x1+1):
                if y>=h or x>=w or rows[y][x] not in 'gK':continue
                sx,sy=(x+1,y) if name=='side' else (x,y+1)
                if sx<=x1 and sy<=y1 and sy<h and sx<w and rows[sy][sx] in 'gK': g[y][x]=rows[sy][sx]
                else: g[y][x]=rows[y0 if name!='side' else y][x0 if name=='side' else x]
    return [''.join(r) for r in g]
art={'kart':{k:[outline(v),outline(rolled(k,v))] for k,v in VIEWS.items()},'icon':{k:outline(v) for k,v in ICON.items()},
 'world':{k:(v if k=='box' else outline(v)) for k,v in WORLD.items()}}
open(os.path.join(here,'karts_art.js'),'w').write('const ART='+json.dumps(art)+';')
sheet([art['kart'][k][f] for k in ['back','bq','side','fq','front'] for f in (0,1)],os.path.join(here,'kart_frames.png'),z=6);print('ok',len(json.dumps(art)))
