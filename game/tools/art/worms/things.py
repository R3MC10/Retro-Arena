import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
# held weapons point right from the worm's middle (pivot at the left end, row 2); projectiles are small and centred
T={}
T['bazooka']=["..........","gGGGGGGGGk","gGWWWWWGGG","gggggggggk",".kk.......",]
T['shotgun']=["..........","nNNkkkkkkk","nnnGGGGGGG","nn........"]
T['launcher']=T['bazooka']
T['bat']=["..........","nNNNNNNNNN","nnnnnnnnNN",".........."]
T['rocket']=["..R.....","RRwwwwYO","RRwwwwYO","..R....."]
T['missile']=["..b.....","bbwwwwRO","bbwwwwRO","..b....."]
T['grenade']=[".kk..",".gG..","lLLl.","LLlLl","lLLll",".lll."]
T['cluster']=[".kk..",".gG..","RRrR.","RrRrR","RRrRr",".rrr."]
T['cbit']=["RR","Rr"]
T['banana']=["....yk","...yY.","..yYY.",".yYY..","yYY...","yy...."]
T['holy']=["..Y..",".YyY.","..Y..",".yYy.","yYYYy","YyYYy",".yyy."]
T['dynamite']=["..Y.",".k..","RRRR","RwwR","RRRR","RwwR","RRRR"]
T['mine']=["..R..",".kkk.","kKgKk","kgggk",".kkk."]
T['sheep']=["...WWWWW......","..WWwWWWWW....",".WWWWWWwWWWKK.","WWwWWWWWWWKKKK","WWWWWWwWWWKWKK",".WWWwWWWWWKKKK","..WWWWWWWW.KK.","..K.K...K.K...","..K.K...K.K..."]
T['crate']=["NNNNNNNNNN","NnnnnnnnnN","NnNNNNNNnN","NnNnnnnNnN","NnNnNNnNnN","NnNnNNnNnN","NnNnnnnNnN","NnNNNNNNnN","NnnnnnnnnN","NNNNNNNNNN"]
T['health']=["WWWWWWWWWW","WwwwwwwwwW","WwwwRRwwwW","WwwwRRwwwW","WwRRRRRRwW","WwRRRRRRwW","WwwwRRwwwW","WwwwRRwwwW","WwwwwwwwwW","WWWWWWWWWW"]
T['grave']=["..GGGG..",".GWWWWG.","GWWGGWWG","GWGGGGWG","GWWGGWWG","GWWGGWWG","GWWWWWWG","GGGGGGGG","llllllll"]
T['girder']=["kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk","kOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOk","kOoOoOoOoOoOoOoOoOoOoOoOoOoOoOok","kooooooooooooooooooooooooooooook","kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk"]
T['hook']=[".G.","GkG",".G."]
T['strike']=["..k..",".kgk.","kgGgk",".kgk.","..R..","..O.."]
T['punch']=[".......","RRRRR..","RRRRRR.","RRRRRR.","RRRRR.."]
T['tele']=[".C.C.","C.C.C",".CWC.","C.C.C",".C.C."]
if __name__=='__main__':
    sheet([outline(T[k]) if k not in ('girder','hook') else T[k] for k in T],'things.png',z=10)
