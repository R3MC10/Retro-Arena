// Hand-painted footballers. 1/2/3 are jersey highlights/midtones/shadows.
// Draft 2: white shorts, dark boots and a separated kicking leg for small screens.
const head=['.....kkkk....','....kNNNSk...','....kssksk...','.....kssk....'];
const ART={
 idle:[...head,'....k1123k...','...ks1223sk..','...kk2223kk..','....kwwwGk...','....kwkwwk...','....ks.ksk...','...kKK.kKKk..','...kkk.kkkk..'],
 runA:[...head,'....k1123k...','..ksk1223kk..','..kkk2223ssk.','....kwwwGkk..','...kwwkwwk...','..ksk...ksk..','.kKKk....kKKk','..kk......kk.'],
 runB:[...head,'....k1123k...','....k1223ssk.','...ks2223kk..','...kkwwwGk...','.....kwwk....','.....kssk....','....kKKKKk...','.....kkkk....'],
 kick:[...head,'....k1123k...','...ks1223sk..','...kk2223kk..','....kwwwGk...','....kwkwwsk..','....ksk.ksskk','...kKKk..kKKk','...kkk....kk.'],
 header:['.....kkkk....','....kNNNSk...','....kssksk...','..kk.kssk.kk.','.kssk1123kssk','..kkk1223kkk.','....k2223k...','....kwwwGk...','...kwwkwwk...','..kss...ssk..','..kKKk.kKKk..','...kk...kk...'],
 slide:['.............','.............','.............','.............','.............','...kkkk......','..kNNNSk.....','..kssksk.....','...kssk222kk.','..ks11223wwwk','..kkkkkwwwssk','.......kkkkKK'],
 dive:['..................','..................','..................','..............kk..','............kkWwk.','...kkkk...kk112sk.','..kNNNSkk11223kk..','..kssksk12223k....','...kssk2223wwsk...','....kkkkwwwwssk...','........kkkkKKk...','...........kkk....'],
 celebrate:['..kk......kk.','.kssk....kssk','..k1k.kk.k3k.','..k1kNNNSk3k.','..k1kssksk3k.','...k1kssk3k..','....k1223k...','....k2223k...','....kwwwGk...','....ks.ksk...','...kKK.kKKk..','...kkk.kkkk..'],
 ball:['.kkk.','kwWwk','kWkWk','kwwWk','.kkk.']
};
if(typeof module!=='undefined')module.exports=ART;
