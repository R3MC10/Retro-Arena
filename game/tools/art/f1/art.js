// Hand-painted rear open-wheel silhouette: exposed tyres, helmet, engine cowling and rear wing.
module.exports={car:[
'..........kkkk..........',
'.........kWWY3k.........',
'.........kYkk3k.........',
'..........k23k..........',
'....kkk..k1223k..kkk....',
'...kKGKkk112233kkKGKk...',
'...kKKKk11222233kKKKk...',
'...kKGKk12WWWW23kKGKk...',
'...kkkkk12222223kkkkk...',
'..kkkkkk122kk223kkkkkk..',
'.kKGKGKk122kk223kKGKGKk.',
'.kKKKKKk13333333kKKKKKk.',
'.kKGKGKkkkkkkkkkkKGKGKk.',
'.kKKKKk1111111111kKKKKk.',
'.kKGKGk1WW2222WW3kKGKGk.',
'..kkkkk3333333333kkkkk..',
'.......kkkkkkkkkk.......'],
 pine:['......kk......','.....kLlk.....','....kLLelk....','...kLLLellk...','....kLLelk....','..kLLLLelllk..','.kLLLLLellllk.','kkkkkkNNkkkkkk','......NN......','.....mNNm.....'],
 palm:['....ee...ee....','.eeellleelllee.','eLLLlllellLLLLe','ee...NN...ee...','.....NN.......','.....NN.......','.....NN.......','....mNNm......'],
 tower:['kkkkkkkkkkkk','kgGgggggggGk','kgcCKppPKgGk','kgKKKKKKKgGk','kgpPKccCKgGk','kgKKKKKKKgGk','kgcCKppPKgGk','kgKKKKKKKgGk','kgpPKccCKgGk','kgKKKKKKKgGk','kgKKKKKKKgGk','kkkkkkkkkkkk']};
// Wheel tread frames and driver poses, painted as letter rows (complete car underneath).
module.exports.roll=module.exports.car.map(r=>r.replace(/G/g,'g'));
module.exports.left=[...module.exports.car];module.exports.left[1]='........kWWY3k..........';module.exports.left[2]='........kYkk3k..........';module.exports.left[5]='...kGGKkk112233kkKKGk...';
module.exports.right=[...module.exports.car];module.exports.right[1]='..........kWWY3k........';module.exports.right[2]='..........kYkk3k........';module.exports.right[5]='...kGKKkk112233kkKGGk...';
module.exports.win=[...module.exports.car];module.exports.win[0]='......kWk.kkkk.kWk......';module.exports.win[1]='......k2kkWWY3kk2k......';module.exports.win[2]='.......k2kYkk3k2k.......';module.exports.win[3]='........kkk23kkk........';
