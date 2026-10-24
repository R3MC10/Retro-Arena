import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
ICON={
 'boost':["......kk......",".....kYYk.....","....kYYyk.....","...kYYyk......","..kYYyykkkk...",".kYYYYYYYYk...","kkkkyyYYyk....","....kYYyk.....","...kYyyk......","..kYyk........",".kyk..........","kk............"],
 'triple':["...kk.....kk..","..kYk....kYk..",".kYyk...kYyk..","kkkYk..kkkYk..","..kyk....kyk..",".kk......kk...",".....kk.......","....kYk.......","...kYyk.......","..kkkYk.......","....kyk.......","...kk........."],
 'oil':["....kkkk......","...kGGGGk.....","..kkkkkkkk....","..kKgggggk....","..kKgKKKgk....","..kKgKKKgk....","..kKgggggk....","..kKKKKKKk....","...kkkkkk.....",".....kvVk.....","....kvVVvk....","....kkkkk....."],
 'bouncer':[".....kkkk.....","...kkLLLlkk...","..kLWWLLLLlk..",".kLWWLLLLLLlk.",".kLLLLLLLLLek.","kLLLLLLLLLLlek","kLLLLLLLLLleek",".kLLLLLLLleek.",".klLLLLLleeek.","..kllleeeeek..","...kkeeeekk...",".....kkkk....."],
 'rocket':[".........kk...","........kWRk..",".......kRRRk..","......kRRRk...",".....kRWRk....","...kkRRRk.....","..kRkRRk......","...kRRk.......","..kOkkRk......",".kOYOk.k......",".kOOk.........","..kk.........."],
 'shield':["....kkkkkk....","..kkCCCCCCkk..",".kCCWWCCCCCCk.",".kCWWCCCCCCBk.","kCCWCCCCCCCBBk","kCCCCCCCCCCBBk","kCCCCCCCCCBBBk","kCCCCCCCCBBBBk",".kCCCCCCBBBBk.",".kBCCCBBBBBBk.","..kkBBBBBBkk..","....kkkkkk...."],
 'star':["......kk......",".....kYYk.....",".....kYYk.....","kkkkkYYYYkkkkk","kYYYYYYYYYYYYk",".kYYYkYYkYYYk.","..kYYkYYkYYk..","..kYYYYYYYYk..",".kYYYYkkYYYYk.",".kYYYk..kYYYk.","kYYkk....kkYYk","kkk........kkk"],
 'ink':["....kkkkk.....","...kVVVVVk....","..kVWWVVVVk...","..kVWkVVkVk...","..kVVVVVVVk...","..kVVVVVVVk...","..kvVvVvVvk...",".kvkvkvkvkvk..",".kv.v.v.v.vk..","kv..v...v..vk.","k...k...k...k.","..............."],
 'shrink':["..........kk..",".........kPPk.",".kkkkkkkkkPPk.","kGGGGGGGGkkk..","kGgggggGGGk...","kkkkkkkGGGk...","......kgGk....","......kgGk....",".....kgGk.....","....kkkk......","..............","..............."],
}
WORLD={
 'box':["kkkkkkkkkkkkkk","kWWWWWWWWWWWWk","kWYYYYYYYYYYyk","kWYYYkkkkYYYyk","kWYYkYYYYkYYyk","kWYYYYYYkYYYyk","kWYYYYYkYYYYyk","kWYYYYkYYYYYyk","kWYYYYYYYYYYyk","kWYYYYkYYYYYyk","kWyyyyyyyyyyyk","kkkkkkkkkkkkkk"],
 'puddle':["....kkkkkkk.....","..kkvvvVvvvkk...",".kvvVVvvvvvvvk..","kvvvvvvvvVvvvvk.",".kkvvvvvvvvvkk..","...kkkkkkkkk...."],
 'ball':["...kkkk...",".kkLLLlkk.","kLWWLLLLlk","kLWLLLLLek","kLLLLLLlek","kLLLLLleek",".kleeeeek.","..kkkkkk.."],
 'rocket':["....kk....","...kRRk...","..kRWRRk..",".kRRRRRRk.","kkRRRRRRkk","kRkRRRRkRk","k.kOYYOk.k","...kOOk...","....kk...."],
 'balloon':["..kkkk..",".k1112k.","k11w122k","k112222k","k122223k",".k2233k.","..k33k..","...kk...","...k....","...k...."],
 'tree':["......kkkkk......","....kkLLLLlkk....","...kLLLLLLLLlk...","..kLLWLLLLLLLlk..","..kLLLLLLLLLlek..",".kLLLLLLLLLLleek.",".kLLLLLLLLLleeek.","..klLLLLLLleeek..","...kkllllleeekk..","....kkkkkkkkk....",".......knk.......",".......knNk......",".......knNk......",".......knNk......","......kknNkk.....","......kkkkkk....."],
 'tires':["..kkkkkkkk..",".kKgggggKKk.",".kKKKKKKKKk.","..kkkkkkkk..",".kRRRRRRRRk.",".kRwwwwwwRk.","..kkkkkkkk..",".kKgggggKKk.",".kKKKKKKKKk.","..kkkkkkkk.."],
 'cactus':[".....kkk.....","....kLLlk....","....kLLlk.k..","..k.kLLlkkLk.",".kLkkLLlklLk.",".kLlkLLlkLlk.",".kLLLLLLLlk..","..kkkLLlkk...","....kLLlk....","....kLLlk....","....kLLlk....","....kLLek....","...kkkkkkk..."],
 'rock':[".....kkkkk....","...kkTTTtkk...","..kTTTTttttk..",".kTTTtttttDtk.",".kTtttttttDDk.","kTtttttDDtDDDk","kttttDDDDDDDMk",".kkkkkkkkkkkk."],
 'pine':["......kk......",".....kWWk.....","....kWeeWk....","....keeeek....","...kWeeeeWk...","...keeeeeek...","..kWeeeeeeWk..","..keeeeeeeek..",".kWeeeeeeeeWk.",".keeeeeeeeeek.","kkkkkknkkkkkkk",".....knNk.....",".....knNk.....","....kkkkkk...."],
 'snowman':["....kkkk....","...kKKKKk...","..kkkkkkkk..","...kWWWWk...","..kWkWWkWk..","..kWWWOOOk..","...kWWWWk...","..kWWWWWWk..",".kWWWkWWWCk.",".kWWWWWWWCk.","..kWWkWWCk..",".kWWWWWWWCk.","kWWWWWWWWWCk","kWWWWWWWWCCk",".kkCCCCCCCk.","..kkkkkkkk.."],
 'lamp':["kkkkkk","kPWWPk","kkPPkk","..kk..","..kG..","..kG..","..kG..","..kG..","..kG..","..kG..","..kG..","..kG..","..kG..",".kkGk.","kGGGGk","kkkkkk"],
 'cone':["...kk...","..kOOk..","..kWWk..",".kOOOOk.",".kWWWWk.","kOOOOOOk","kkkkkkkk"],
}
if __name__=='__main__':
    sheet([outline(v) if k not in('box',) else v for k,v in ICON.items()]+[WORLD[k] if k=='box' else outline(WORLD[k]) for k in WORLD],'items.png',z=7)
