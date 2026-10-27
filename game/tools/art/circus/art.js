const ART={
run0:['....kRRk....','...kRWWRk...','...kWkkWk...','...kWsRWk...','....kWWk....','..kk1121kk..','.kWk1222kWk.','....1222....','....kWWk....','...kWWWWk...','...kWkkWk...','..kkk..kkk..'],
run1:['....kRRk....','...kRWWRk...','...kWkkWk...','...kWsRWk...','....kWWk....','...k1121k...','..kW1222Wk..','...k1222k...','....kWWk....','....kWWk....','...kWkkWk...','...kk..kk...'],
jump:['...kRWWRk...','...kWkkWk...','...kWsRWk...','.kWkkWWkkWk.','..k112221k..','...k1222k...','....kWWk....','..kkWWWWkk..','.kkk....kkk.'],
tumble:['..kkk...kkk.','...kWWWWWk..','.kWk1222kWk.','..kk1121kk..','....kWWk....','...kWsRWk...','...kWkkWk...','...kRWWRk...','....kRRk....'],
cheer:['kWk......kWk','.k1kRRRRk1k.','..kRWWWWRk..','...kWkkWk...','...kWsRWk...','....kWWk....','....k121k...','....k222k...','....kWWWk...','...kWWkWWk..','..kkkk.kkkk.'],
lion:['..............kkk....','............kkYYYk...','...kkkkkkkkkYOYYYk...','..kYYYYYYYYYYOWkkYk..','.kYYOOOOOOYYYYYYYkk..','kYkYYYYYYYYYYYkk.....','kk.kYYkkkkkYYk.......','...kYYk...kYYk.......','..kkkkk..kkkkk.......'],
horse:['..............kkk....','.............kNNNk...','...kkkkkkkkkkNWkNNk..','..kNNNNNNNNNNNNNkk...','.kNNmmmmmmmNNNNkk....','kNkNNmmmmNNNNNk......','kk..kNNkkkkNNNk......','....kNk...kNNk.......','...kkkk...kkkk.......'],
monkey:['...kkk.kkk...','..kNNNkNNNk..','...kNsWsNk...','...kNskNNk...','....kNNNk....','..kkNNNNkk...','.kNkNssNkNk..','kk..kNNk..kk.','...kNkkNk....','..kkk..kkk...'],
ball:['...kkkk....','.kkW11YYkk.','kW111YYY33k','k1111YYY33k','k111YY3333k','k1YYYY3333k','.kYYY3333k.','..kkkkkkk..'],
pot:['..kYkYk..','..kYOYk..','...kRk...','.kkkkkkk.','kYYYYYYYk','.kOOOOOk.','..kkkkk..'],
ring:['...kYkYk...','..kYOYOYk..','.kYOkkkOYk.','kYOk...kOYk','kYk.....kYk','kOk.....kOk','kYk.....kYk','kYOk...kOYk','.kYOkkkOYk.','..kYOYOYk..','...kkkkk...'],
spring:['kYYYYYYYYYk','.kkkkkkkkk.','..kW...Wk..','...kW.Wk...','..kW...Wk..','.kkkkkkkkk.'],
trapeze:['k.........k','k.........k','.k.......k.','.k.......k.','..k.....k..','..k.....k..','...k...k...','...k...k...','..kYYYYYk..']};
if(typeof module!=='undefined')module.exports=ART;
// Second contact poses: legs tuck under the body between strides.
ART.lionRun=[...ART.lion.slice(0,-2),'....kYk..kYk.........','...kkkk..kkkk........'];
ART.horseRun=[...ART.horse.slice(0,-2),'.....kNk.kNk.........','....kkkk.kkkk........'];
ART.monkeyRun=[...ART.monkey.slice(0,-2),'....kNNNk....','...kkkkkkk...'];
