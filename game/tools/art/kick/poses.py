import sys,os;sys.path.insert(0,os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from pixart import *
from player import F,EXTRA,HEADS,frame,Grid
SP={}
# slide tackle, facing right: leaning back on one hand, front leg out along the ground
SP['slide']=[
"......hhhh..........",
".....hhhhhh.........",
".....hhhhsss........",
".....hhhsssks.......",
".....Hhsssss........",
"......HsSS..........",
"....1112223.........",
"...11122223.........",
"..s.112222S.........",
".ss..12222s.........",
".s...aaaaab.........",
".....aaaaabbsss.....",
"....SS3....sss2222K.",
"...SS33.......222KKK",
"..kk33..........2KK.",
".kkk................"]
# lying face down after a hard tackle, head to the right
SP['down']=[
"................hhhh..",
"..............hhhhhhh.",
"kk3322SSaab112222hhhhh",
"KK2222ssaaa1122223hHss",
"KK2222ssaab1222223Hsss",
".k33...SSab.s3333.sss.",
"..............ss......"]
# keeper diving to the right, arms stretched out, gloves w
SP['dive']=[
"........................",
"..............hhhh..ww..",
".............hhhhhh1ww..",
"KK22ssaaa111222hhhsssww.",
"KK22ssaaab12222hhssks11w",
"kk33SSaab112222Hssss2ww.",
"k33SS.aab.S3333.SSS..ww.",
"................ss......"]
def figS(arms,legs=None,dy=0,ball=False,gloves=False):
    # front view figure from the 'S' stand frame with new arms
    g=Grid(16,22);base=frame('S','stand');
    # wipe arms of the base: redraw from parts
    from player import torso,head,leg,arm,FRONT
    P=FRONT['stand'];
    for L in (legs or P['legs']):leg(g,*L)
    torso(g,'S',dy);head(g,'S',dy)
    for sh,hd in arms:
        arm(g,sh,hd,True)
        if gloves:g.set(hd[0],hd[1],'w');g.set(hd[0],hd[1]-1,'w')
    if ball:
        for x,y,c in [(5,9,'W'),(6,9,'W'),(7,9,'w'),(5,10,'W'),(6,10,'k'),(7,10,'w'),(5,11,'w'),(6,11,'w'),(7,11,'G'),(6,8,'w')]:g.set(x,y,c)
    return g.rows()
SP['cheer1']=figS([((3,8),(2,3)),((10,8),(11,3))])
SP['cheer2']=figS([((3,8),(1,4)),((10,8),(12,4))],legs=[((5,14),(5,17),(5,20),1,True),((8,14),(8,16),(8,18),1,True)])
SP['ready']=figS([((3,9),(1,12)),((10,9),(12,12))],legs=[((5,14),(4,17),(4,20),1,True),((8,14),(9,17),(9,20),1,True)],dy=1,gloves=True)
SP['hold']=figS([((3,8),(4,10)),((10,8),(9,10))],ball=True,gloves=True)
SP['head']=figS([((3,8),(1,6)),((10,8),(12,6))],legs=[((5,14),(5,16),(5,18),1,True),((8,14),(8,16),(8,18),1,True)])
if __name__=='__main__':
    from pixart import PAL
    PAL.update(EXTRA)
    sheet([outline(SP[k]) for k in SP],'poses.png',z=12)
