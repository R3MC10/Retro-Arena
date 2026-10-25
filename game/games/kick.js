/* PIXEL KICK for Retro Arena: arcade football for up to 10 a side in 16-bit pixel art, filmed from the side like the
   console football games: a broadcast camera follows the ball along a mown pitch, with a crowd that jumps when you score.
   The original it follows: quick passing, charged shots, lobs and crosses, headers, slide tackles and diving keepers.
   The 20-player twist: every human is a footballer. With fewer humans than footballers, AUTO-SWITCH (default) hands you
   the team mate nearest the ball, so a lone player is always in the game; with ONE PLAYER EACH you keep yours.
   First seconds: hints show the keys (Space pass, hold to shoot, E lob, Q slide); your footballer has an arrow over the head
   and an arrow on the screen edge when the camera can't see you.
   W A S D run, Shift sprints. With the ball: tap Space (or click) to pass, hold it to charge a shot (W / S while shooting
   aim high or low at the far or near post), E lobs / crosses, Q is a burst dribble. Without it: Space tackles, Q slides in,
   E shouts for a pass. Crosses into the box are headed automatically. Touch: tap = pass / tackle, hold = shoot.
   Modes: MATCH (red vs blue, humans split) · CO-OP (all of you against a CPU team).
   Power-ups drop onto the pitch and work as soon as you run over them:
    SPEED BOOTS · FIRE SHOT (burns through the keeper's gloves) · BANANA SHOT (curls) · MAGNET (loose balls drift to you)
    GIANT KEEPER · party: FREEZE (rivals freeze for 2 s) · BRICK WALL (bricks up your goal) · TINY TEAM (rivals shrink).
   Online is lag-free (RA.kit localFirst): you run, dribble, switch and kick on your own device at once; the host referees
   the loose ball, tackles, headers, keepers and goals, and accepts your touches and kicks.
   Sprites are painted in tools/art/kick (python) and exported as ART below: edit kick_tpl.js there, then run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
const ART={"man": {"E_stand": [".......kkkk.....", "......khhhhk....", ".....khhhhhhk...", ".....khhhssssk..", ".....khhsssksk..", ".....khHsssssk..", "......kHssskk...", "......kkSSk.....", ".....k1123k.....", "....k112113k....", "....k112113k....", "....k122s13k....", "....k122s13k....", "....kaaasabk....", "....kaaaaabk....", ".....kkSssk.....", "......kSssk.....", "......kSssk.....", "......k322k.....", "......k322k.....", "......kkKKk.....", "......kkKKKk....", ".......kkkk.....", "................"], "E_r1": ["................", ".......kkkk.....", "......khhhhk....", ".....khhhhhhk...", ".....khhhssssk..", ".....khhsssksk..", ".....khHsssssk..", "......kHssskk...", "......kkSSk.....", ".....k1123k.....", "....k112113k....", "....k1s1113k....", "....ks11123k....", "....ks22223k....", "....kaaaaabk....", "....kaaaaabk....", ".....kkSssk.....", "......kSsssk....", ".....kSSSs22k...", "....k333kk222k..", "...kkk33k.kKKk..", "...kkkkk..kKKKk.", "....kk.....kkk..", "................"], "E_r2": [".......kkkk.....", "......khhhhk....", ".....khhhhhhk...", ".....khhhssssk..", ".....khhsssksk..", ".....khHsssssk..", "......kHssskk...", "......kkSSk.....", ".....k1123k.....", "....k112113k....", "....k111113k....", "....k12s123k....", "....k12s123k....", "....kaasaabk....", "....kaaaaabk....", ".....kkSssk.....", "......kSssk.....", ".......kss3k....", "......kk223k....", "......kk22k.....", ".......kKKk.....", ".......kKKKk....", "........kkk.....", "................"], "E_r3": ["................", ".......kkkk.....", "......khhhhk....", ".....khhhhhhk...", ".....khhhssssk..", ".....khhsssksk..", ".....khHsssssk..", "......kHssskk...", "......kkSSk.....", ".....k1123k.....", "....k112113k....", "....k1121s1k....", "....k12221sk....", "....k122223sk...", "....kaaaaabk....", "....kaaaaabk....", ".....kkSssk.....", "......ksssk.....", ".....kkss33k....", "....k222s33k....", "...kKK22k3kkk...", "...kKKkk.kkkkk..", "....kk....kkk...", "................"], "E_r4": [".......kkkk.....", "......khhhhk....", ".....khhhhhhk...", ".....khhhssssk..", ".....khhsssksk..", ".....khHsssssk..", "......kHssskk...", "......kkSSk.....", ".....k1123k.....", "....k112113k....", "....k112113k....", "....k122s13k....", "....k1221s3k....", "....kaaaasbk....", "....kaaaaabk....", ".....kkSssk.....", "......kSsssk....", "......kSS222k...", "......k3KK22k...", "......k3KKkk....", "......kkkk......", "......kkkkk.....", ".......kkk......", "................"], "E_kick": [".......kkkk.....", "......khhhhk....", ".....khhhhhhk...", ".....khhhssssk..", ".....khhsssksk..", ".....khHsssssk..", "......kHssskk...", "......kkSSk.....", ".....k1123k.....", "....k111113k....", "....k1s1113k....", "...kss11223k....", "....k122223k....", "....kaaaaabk....", "....kaaaaabk....", ".....kkSssskkkk.", "......kSsss22KKk", "......kSSks22KKk", "......k33kkkkkk.", "......k33k......", "......kkkk......", "......kkkkk.....", ".......kkk......", "................"], "SE_stand": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhsssssk...", "....khssskskk...", "....kHssssssk...", ".....kHsssSk....", "......kSSSk.....", ".....k11223kk...", "....k11222211k..", "....k11222211k..", "...kS122222s1k..", "...kS122223s1k..", "...kSaaaaabsk...", "....kaaakabbk...", ".....kSSkssk....", ".....kSSkssk....", ".....kSSkssk....", ".....k33k22k....", ".....k33k22k....", ".....kkkkKKk....", ".....kkkkKKKk...", "......kkkkkk....", "................"], "SE_r1": ["................", "......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhsssssk...", "....khssskskk...", "....kHssssssk...", ".....kHsssSk....", "......kSSSk.....", ".....k11223kk...", "....k11222211k..", "....k11222s11k..", "....k12222s1k...", "....k12222s3k...", "....kaaaaabbk...", "....kaaakabbk...", ".....kSSkssk....", ".....kSSkssk....", "....kSSSks22k...", "....k33k.k222k..", "...kkk3k..kKKk..", "...kkkk...kKKKk.", "....kk.....kkk..", "................"], "SE_r2": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhsssssk...", "....khssskskk...", "....kHssssssk...", ".....kHsssSk....", "......kSSSk.....", ".....k11223kk...", "....k11222211k..", "....k11222211k..", "...kS122222s1k..", "...kS122223s1k..", "...kSaaaaabsk...", "....kaaakabbk...", ".....kSSkssk....", ".....kSSSssk....", "......k33ssk....", ".....kkk322k....", ".....kkkk22k....", "......kkkKKk....", "........kKKKk...", ".........kkk....", "................"], "SE_r3": ["................", "......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhsssssk...", "....khssskskk...", "....kHssssssk...", ".....kHsssSk....", "......kSSSk.....", ".....k11223kk...", "....k11222211k..", "...kS1122221s1k.", "..kS312222231sk.", "...kk1222233ksk.", "....kaaaaabbkk..", "....kaaakabbk...", ".....kSSkssk....", ".....kSSSssk....", "......k3sssk....", "......k322k.....", "......kKK2k.....", "......kKKkkk....", ".......kkkk.....", "................"], "SE_r4": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhsssssk...", "....khssskskk...", "....kHssssssk...", ".....kHsssSk....", "......kSSSk.....", ".....k11223kk...", "....k11222211k..", "....k11222211k..", "...kS122222s1k..", "...kS122223s1k..", "...kSaaaaabsk...", "....kaaakabbk...", ".....kSSkssk....", ".....kSSksssk...", ".....kSSkks22k..", ".....k33kkKK2k..", ".....k33kkKKk...", ".....kkkk.kk....", ".....kkkkk......", "......kkk.......", "................"], "SE_kick": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhsssssk...", "....khssskskk...", "....kHssssssk...", ".....kHsssSk....", "......kSSSk.....", ".....k11223kk...", "....k11222211k..", "...kS1122221s1k.", "..kS312222231sk.", "...kk1222233kk..", "....kaaaaabbk...", "....kaaakabbk...", ".....kSSkssskk..", ".....kSSksss22k.", ".....kSSkkks2KKk", ".....k33k..kkKKk", ".....k33k....kk.", ".....kkkk.......", ".....kkkkk......", "......kkk.......", "................"], "S_stand": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khssssShk...", "....khsksksHk...", "....khsssssHk...", ".....ksSSSsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222211k..", "..k1112222211k..", "..ks1122222s1k..", "..ks1122222s1k..", "..kskaaaaaabsk..", "...kkaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....ksskssk....", ".....k22k22k....", ".....k22k22k....", ".....kKKkKKk....", ".....kKKkKKk....", "......kk.kk.....", "................"], "S_r1": ["................", "......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khssssShk...", "....khsksksHk...", "....khsssssHk...", ".....ksSSSsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222211k..", "..ks112222211k..", "..ks1122222s1k..", "...kk122222s1k..", "....kaaaaaabsk..", "....kaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....k22kssk....", ".....kKKk22k....", ".....kKKk22k....", "......kkkKKk....", "........kKKk....", ".........kk....."], "S_r2": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khssssShk...", "....khsksksHk...", "....khsssssHk...", ".....ksSSSsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222211k..", "..k1112222211k..", "..ks1122222s1k..", "..ks1122222s1k..", "..kskaaaaaabsk..", "...kkaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....ksskssk....", ".....k22k22k....", ".....k22k22k....", ".....kKKkKKk....", ".....kKKkKKk....", "......kk.kk.....", "................"], "S_r3": ["................", "......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khssssShk...", "....khsksksHk...", "....khsssssHk...", ".....ksSSSsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222211k..", "..k11122222s1k..", "..ks11222221sk..", "..ks11222223k...", "..kskaaaaaabk...", "...kkaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....kssk22k....", ".....k22kKKk....", ".....k22kKKk....", ".....kKKkkk.....", ".....kKKk.......", "......kk........"], "S_r4": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khssssShk...", "....khsksksHk...", "....khsssssHk...", ".....ksSSSsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222211k..", "..k1112222211k..", "..ks1122222s1k..", "..ks1122222s1k..", "..kskaaaaaabsk..", "...kkaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....ksskssk....", ".....k22k22k....", ".....k22k22k....", ".....kKKkKKk....", ".....kKKkKKk....", "......kk.kk.....", "................"], "S_kick": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khssssShk...", "....khsksksHk...", "....khsssssHk...", ".....ksSSSsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222211k..", "..ks11222221s1k.", "..ks112222221sk.", ".kskk1222223ksk.", "..k.kaaaaaabkk..", "....kaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....kssks22k...", ".....k22kk2KKk..", ".....k22k.kKKk..", ".....kKKk..kk...", ".....kKKk.......", "......kk........", "................"], "NE_stand": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhsk...", "....khhhhhssk...", "....kHhhhHssk...", ".....kHHHssk....", "......kSSSk.....", ".....k11223kk...", "....k11222231k..", "....k11222231k..", "...ks12222231k..", "...ks12222331k..", "...ksaaaaabbk...", "....kaaakabbk...", ".....ksskssk....", ".....ksskssk....", ".....ksskssk....", ".....k22k22k....", ".....k22k22k....", ".....kKKkKKk....", ".....kKKKKKKk...", "......kkkkkk....", "................"], "NE_r1": ["................", "......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhsk...", "....khhhhhssk...", "....kHhhhHssk...", ".....kHHHssk....", "......kSSSk.....", ".....k11223kk...", "....k11222231k..", "....k11222231k..", "....k1222223k...", "....k1222233k...", "....kaaaaabbk...", "....kaaakabbk...", ".....ksskssk....", ".....ksskssk....", "....ksssks22k...", "....k22k.k222k..", "...kKK2k..kKKk..", "...kKKk...kKKKk.", "....kk.....kkk..", "................"], "NE_r2": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhsk...", "....khhhhhssk...", "....kHhhhHssk...", ".....kHHHssk....", "......kSSSk.....", ".....k11223kk...", "....k11222231k..", "....k11222231k..", "...ks12222231k..", "...ks12222331k..", "...ksaaaaabbk...", "....kaaakabbk...", ".....ksskssk....", ".....ksssssk....", "......k22ssk....", ".....kKK222k....", ".....kKKk22k....", "......kkkKKk....", "........kKKKk...", ".........kkk....", "................"], "NE_r3": ["................", "......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhsk...", "....khhhhhssk...", "....kHhhhHssk...", ".....kHHHssk....", "......kSSSk.....", ".....k11223kk...", "....k11222231k..", "...ks1122223s1k.", "..ks112222231sk.", "...kk1222233ksk.", "....kaaaaabbkk..", "....kaaakabbk...", ".....ksskssk....", ".....ksssssk....", "......k2sssk....", "......k222k.....", "......kKK2k.....", "......kKKKKk....", ".......kkkk.....", "................"], "NE_r4": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhsk...", "....khhhhhssk...", "....kHhhhHssk...", ".....kHHHssk....", "......kSSSk.....", ".....k11223kk...", "....k11222231k..", "....k11222231k..", "...ks12222231k..", "...ks12222331k..", "...ksaaaaabbk...", "....kaaakabbk...", ".....ksskssk....", ".....kssksssk...", ".....ksskks22k..", ".....k22kkKK2k..", ".....k22kkKKk...", ".....kKKk.kk....", ".....kKKKk......", "......kkk.......", "................"], "NE_kick": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhsk...", "....khhhhhssk...", "....kHhhhHssk...", ".....kHHHssk....", "......kSSSk.....", ".....k11223kk...", "....k11222231k..", "...ks1122223s1k.", "..ks112222231sk.", "...kk1222233kk..", "....kaaaaabbk...", "....kaaakabbk...", ".....ksskssskk..", ".....kssksss22k.", ".....ksskkks2KKk", ".....k22k..kkKKk", ".....k22k....kk.", ".....kKKk.......", ".....kKKKk......", "......kkk.......", "................"], "N_stand": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhHk...", "....khhhhhHHk...", "....kHhhhhHHk...", ".....ksHHHsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222231k..", "..k1112222231k..", "..ks112222223k..", "..ks112222231k..", "..kskaaaaaabsk..", "...kkaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....ksskssk....", ".....k22k22k....", ".....k22k22k....", ".....kKKkKKk....", ".....kKKkKKk....", "......kk.kk.....", "................"], "N_r1": ["................", "......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhHk...", "....khhhhhHHk...", "....kHhhhhHHk...", ".....ksHHHsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222231k..", "..ks112222231k..", "..ks112222223k..", "...kk12222231k..", "....kaaaaaabsk..", "....kaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....k22kssk....", ".....kKKk22k....", ".....kKKk22k....", "......kkkKKk....", "........kKKk....", ".........kk....."], "N_r2": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhHk...", "....khhhhhHHk...", "....kHhhhhHHk...", ".....ksHHHsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222231k..", "..k1112222231k..", "..ks112222223k..", "..ks112222231k..", "..kskaaaaaabsk..", "...kkaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....ksskssk....", ".....k22k22k....", ".....k22k22k....", ".....kKKkKKk....", ".....kKKkKKk....", "......kk.kk.....", "................"], "N_r3": ["................", "......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhHk...", "....khhhhhHHk...", "....kHhhhhHHk...", ".....ksHHHsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222231k..", "..k1112222231k..", "..ks112222223k..", "..ks11222223k...", "..kskaaaaaabk...", "...kkaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....kssk22k....", ".....k22kKKk....", ".....k22kKKk....", ".....kKKkkk.....", ".....kKKk.......", "......kk........"], "N_r4": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhHk...", "....khhhhhHHk...", "....kHhhhhHHk...", ".....ksHHHsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222231k..", "..k1112222231k..", "..ks112222223k..", "..ks112222231k..", "..kskaaaaaabsk..", "...kkaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....ksskssk....", ".....k22k22k....", ".....k22k22k....", ".....kKKkKKk....", ".....kKKkKKk....", "......kk.kk.....", "................"], "N_kick": ["......kkkkk.....", ".....khhhhhk....", "....khhhhhhhk...", "....khhhhhhHk...", "....khhhhhHHk...", "....kHhhhhHHk...", ".....ksHHHsk....", ".....kkSSSk.....", "....k112223kk...", "...k111222231k..", "..ks11222223s1k.", "..ks112222223sk.", ".kskk1222223ksk.", "..k.kaaaaaabkk..", "....kaaabaabk...", ".....ksskssk....", ".....ksskssk....", ".....kssks22k...", ".....k22kk2KKk..", ".....k22k.kKKk..", ".....kKKk..kk...", ".....kKKk.......", "......kk........", "................"], "slide": [".......kkkk...........", "......khhhhk..........", ".....khhhhhhk.........", ".....khhhhsssk........", ".....khhhsssksk.......", ".....kHhsssssk........", ".....kkHsSSkk.........", "....k1112223k.........", "...k11122223k.........", "..ksk112222Sk.........", ".ksskk12222sk.........", ".ksk.kaaaaabkkkk......", "..k..kaaaaabbssskkkk..", "....kSS3kkkksss2222Kk.", "...kSS33k...kkk222KKKk", "..kkk33k.......kk2KKk.", ".kkkkkk..........kkk..", "..kkk................."], "down": [".................kkkk...", "...............kkhhhhk..", ".kkkkkkkkkkkkkkhhhhhhhk.", "kkk3322SSaab112222hhhhhk", "kKK2222ssaaa1122223hHssk", "kKK2222ssaab1222223Hsssk", ".kk33kkkSSabks3333ksssk.", "..kkk...kkkk.kkssk.kkk..", "...............kk......."], "dive": ["..........................", "...............kkkk..kk...", "..............khhhhkkwwk..", ".kkkkkkkkkkkkkhhhhhh1wwk..", "kKK22ssaaa111222hhhssswwk.", "kKK22ssaaab12222hhssks11wk", "kkk33SSaab112222Hssss2wwk.", "kk33SSkaabkS3333kSSSkkwwk.", ".kkkkk.kkk.kkkkkkssk..kk..", ".................kk......."], "cheer1": ["......kkkkk.......", ".....khhhhhk......", "....khhhhhhhk.....", "...kkhssssShk.....", "..kskhsksksHsk....", "..kskhssssssk.....", "..ks1ksSSSss1k....", "..k11kkSSSk11k....", "..k1111222311k....", "...k111222211k....", "...k112222211k....", "...k112222223k....", "....k1222223k.....", "....kaaaaaabk.....", "....kaaabaabk.....", ".....ksskssk......", ".....ksskssk......", ".....ksskssk......", ".....k22k22k......", ".....k22k22k......", ".....kKKkKKk......", ".....kKKkKKk......", "......kk.kk.......", ".................."], "cheer2": ["......kkkkk.......", ".....khhhhhk......", "....khhhhhhhk.....", "....khssssShk.....", "..k.khsksksHkk....", ".kskkhsssssHksk...", "..kskksSSSskksk...", "..ks1kkSSSkks1k...", "..k11112223111k...", "..k1111222211k....", "...k112222211k....", "...k112222223k....", "....k1222223k.....", "....kaaaaaabk.....", "....kaaabaabk.....", ".....ksskssk......", ".....ksskssk......", ".....kssk22k......", ".....k22kKKk......", ".....k22kKKk......", ".....kKKkkk.......", ".....kKKk.........", "......kk..........", ".................."], "ready": ["..................", "......kkkkk.......", ".....khhhhhk......", "....khhhhhhhk.....", "....khssssShk.....", "....khsksksHk.....", "....khsssssHk.....", ".....ksSSSsk......", ".....kkSSSk.......", "....k112223kk.....", "...k111222211k....", "..ks11222221s1k...", ".kws112222221wk...", ".kwkk1222223kwk...", "..k.kaaaaaabkk....", "....kaaabaabk.....", ".....ksskssk......", "....ksssksssk.....", "....k22k.k22k.....", "....k22k.k22k.....", "....kKKk.kKKk.....", "....kKKk.kKKk.....", ".....kk...kk......", ".................."], "hold": ["......kkkkk.......", ".....khhhhhk......", "....khhhhhhhk.....", "....khssssShk.....", "....khsksksHk.....", "....khsssssHk.....", ".....ksSSSsk......", ".....kkSSSk.......", "....k112223kk.....", "...k111w22211k....", "...kswWWw2w11k....", "...k1wWkw2w13k....", "....k1wwG223k.....", "....kaaaaaabk.....", "....kaaabaabk.....", ".....ksskssk......", ".....ksskssk......", ".....ksskssk......", ".....k22k22k......", ".....k22k22k......", ".....kKKkKKk......", ".....kKKkKKk......", "......kk.kk.......", ".................."], "head": ["......kkkkk.......", ".....khhhhhk......", "....khhhhhhhk.....", "....khssssShk.....", "....khsksksHk.....", "....khsssssHk.....", "..k..ksSSSsk.k....", ".kskkkkSSSk.ksk...", "..ks1112223ks1k...", "..k11112222111k...", "...k112222211k....", "...k112222223k....", "....k1222223k.....", "....kaaaaaabk.....", "....kaaabaabk.....", ".....ksskssk......", ".....ksskssk......", ".....k22k22k......", ".....kKKkKKk......", ".....kKKkKKk......", "......kk.kk.......", "..................", "..................", ".................."]}, "ball": [["...kk...", "..kwwk..", ".kWWkwk.", "kWWkkWwk", "kWWWWwwk", ".kwWWwk.", "..kwwk..", "...kk..."], ["...kk...", "..kwwk..", ".kWWWwk.", "kWWWkkwk", "kWWWkkwk", ".kwWWwk.", "..kwwk..", "...kk..."], ["...kk...", "..kwwk..", ".kWWWwk.", "kWWWWwwk", "kWWkkWwk", ".kwkkwk.", "..kwwk..", "...kk..."], ["...kk...", "..kwwk..", ".kWWWwk.", "kkkWWwwk", "kkkWWwwk", ".kwWWwk.", "..kwwk..", "...kk..."]], "icon": {"boots": ["............", "...kk.......", "..kcck......", "..kcCck.....", "..kcCck.....", "..kcCCckk...", "..kcCCCcck..", ".kkkkkkkkkk.", "..kkkkkkkk..", "...k.k.k....", "............", "............"], "fire": [".....k......", "....kOk..k..", "...kOYOkkOk.", "..kOYYYOkOk.", ".kOYWWYYOk..", ".kOYWWWYOk..", ".kooYYYOok..", "..kooOook...", "...koook....", "....kkk.....", "............", "............"], "banana": [".......kk...", "......knnk..", ".....kyYk...", "....kyYyk...", "...kyYyk....", "..kyYYyk....", ".kyYYyk.....", ".kyYyk......", "..kyyk......", "...kk.......", "............", "............"], "magnet": ["............", "..kk...kk...", ".krrk.krrk..", ".kRRk.kRRk..", ".kRRk.kRRk..", ".kRRk.kRRk..", ".kRRrkrRRk..", "..kRRRRRk...", "...krrrk....", "....kkk.....", "............", "............"], "glove": ["...k.k.k....", "..kwkwkwk...", ".kwWkWkWkk..", ".kwWwWwWkwk.", ".kwWWWWWwWk.", ".kwWWWWWWwk.", ".kwWWWWWwk..", "..kwWWWwk...", "..kbbbbbk...", "..kBBBBBk...", "...kkkkk....", "............"], "freeze": [".....k......", "...kkCkk....", "..kCkCkCk...", "..kkCWCkk...", ".kCCWWWCCk..", "..kkCWCkk...", "..kCkCkCk...", "...kkCkk....", ".....k......", "............", "............", "............"], "brick": ["............", ".kkkkkkkkk..", "krrrRrrrRrk.", "kRkkkkkkkRk.", "krRrrrRrrrk.", "kkkkkkkkkkk.", "krrrRrrrRrk.", "kRkkkkkkkRk.", "krRrrrRrrrk.", ".kkkkkkkkk..", "............", "............"], "tiny": ["............", "....kkkk....", "...kppppk...", "..kpPPPPpk..", ".kpPwPPwPpk.", ".kppppppppk.", "..kkssskkk..", "...ksSsk....", "....kkk.....", "............", "............", "............"]}};
const T=RA.music.track,sfx=RA.audio.sfx;
const PW=640,PH=400,GZ0=165,GZ1=235,GH=20,GD=16;
// camera: z squashed by ZS on screen, heights stretched by YS, mild perspective (the far touchline is narrower)
const ZS=.5,YS=1.6,STAND=56,KP=.18;
const TEAMC=['#e83838','#2c78f0'],TEAMN=['RED','BLUE'],GKC=['#f0c020','#30b050'],SHORTS=[['#f4f4f4','#b8b8c8'],['#1c2a5c','#101838']];
const HAIR=[['#5a3a20','#3a2414'],['#1c1418','#100c10'],['#e8c060','#b08838'],['#b85a28','#7c3818'],['#7c4a24','#5a3018']];
const ITEMS=[null,{n:'SPEED BOOTS',c:'#40e0ff',ic:'boots'},{n:'FIRE SHOT',c:'#ff6020',ic:'fire'},{n:'BANANA SHOT',c:'#f8e040',ic:'banana'},{n:'MAGNET',c:'#e04080',ic:'magnet'},
 {n:'GIANT KEEPER',c:'#60e060',ic:'glove'},{n:'FREEZE',c:'#a0e8ff',party:1,ic:'freeze'},{n:'BRICK WALL',c:'#c06040',party:1,ic:'brick'},{n:'TINY TEAM',c:'#e080ff',party:1,ic:'tiny'}];
RA.audio.add('whistle',(AC,now,g)=>{const o=AC.createOscillator(),l=AC.createOscillator(),lg=AC.createGain();o.type='square';o.frequency.value=2200;l.frequency.value=32;lg.gain.value=180;l.connect(lg);lg.connect(o.frequency);
 g.gain.setValueAtTime(.05,now);g.gain.setValueAtTime(.05,now+.32);g.gain.exponentialRampToValueAtTime(.001,now+.4);o.connect(g);o.start(now);l.start(now);o.stop(now+.42);l.stop(now+.42)});
RA.audio.add('kick',(AC,now,g,r)=>{const o=AC.createOscillator(),v=r||1;o.frequency.setValueAtTime(140+v*40,now);o.frequency.exponentialRampToValueAtTime(50,now+.09);g.gain.setValueAtTime(.2+.2*Math.min(1,v),now);g.gain.exponentialRampToValueAtTime(.001,now+.1);o.connect(g);o.start(now);o.stop(now+.11)});
RA.audio.add('post',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(1300,now);o.frequency.exponentialRampToValueAtTime(900,now+.3);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.35);o.connect(g);o.start(now);o.stop(now+.36)});
RA.audio.add('roar',(AC,now,g)=>{const s=AC.createBufferSource(),f=AC.createBiquadFilter();s.buffer=RA.audio.noise;s.loop=true;f.type='bandpass';f.frequency.value=700;f.Q.value=.6;
 g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(.16,now+.25);g.gain.exponentialRampToValueAtTime(.001,now+2.2);s.connect(f);f.connect(g);s.start(now);s.stop(now+2.3)});
const MUSIC=[T('Tunnel',100,['D','Bm','G','A'],'k...s...k.k.s...','f#5 - a5 d6 - a5 f#5 - g5 - b5 d6 - b5 g5 - e5 - a5 c#6 - a5 e5 - a5 - - - - - - -'),
 T('Kick Off',148,['C','G','Am','F'],'k.hsk.hsk.hsk.hs','c5 e5 g5 . g5 a5 g5 e5 d5 . g5 . b4 d5 g5 . e5 a5 c6 . a5 e5 c5 . f5 . a5 . c6 . a5 .'),
 T('Terrace Chant',132,['G','C','D','G'],'k.s.k.s.k.s.kkss','g5 g5 g5 . d5 . g5 . c6 c6 b5 . a5 . g5 . a5 a5 a5 . f#5 . d5 . g5 - - - - - - .'),
 T('Extra Time',170,['Em','C','D','B'],'k.hhs.hhk.hhs.hs','e5 g5 b5 e6 b5 g5 e5 g5 c5 e5 g5 c6 g5 e5 c5 e5 d5 f#5 a5 d6 a5 f#5 d5 f#5 b4 d#5 f#5 b5 f#5 d#5 b4 .')];
let celName='',K,pl=[],ball=null,items=[],parts=[],texts=[],score=[0,0],ko=0,koT=0,cel=0,celT=0,celBy=-1,golden=false,nextId=1,seatP=[],swT=[],wall=[0,0],gkBig=[0,0],lastGoal=null,shake=0,seatGoals=[];
// guest-side state: G.me is the footballer this device controls
const G={me:-1,swAt:0,hold:false,kickSeq:0,pred:null,koSeen:-1,evSeen:0,cseq:0,claims:[],kicks:[]};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
const attackX=t=>t===0?PW:0,dirX=t=>t===0?1:-1;
const human=s=>s>=0&&K.seats[s]&&K.seats[s].ctrl!=='cpu';
const ownerOf=p=>p.seat>=0&&K.seats[p.seat]&&K.seats[p.seat].ctrl==='net'?'net':'host';
const mine=p=>K.isClient()?p.n===G.me:ownerOf(p)==='host';
const ctrlBy=p=>p.seat>=0&&human(p.seat);   // a human is steering this footballer

/* ---------- match setup ---------- */
function formation(n,team){const out=[],lines=n<=2?[n]:n<=4?[Math.ceil(n/2),Math.floor(n/2)]:[Math.ceil(n*.4),Math.ceil(n*.35),n-Math.ceil(n*.4)-Math.ceil(n*.35)];
 const xs=lines.length===1?[.55]:lines.length===2?[.35,.75]:[.28,.58,.86];
 lines.forEach((m,li)=>{for(let k=0;k<m;k++){const x=xs[li]*PW/2,z=PH*(k+1)/(m+1);out.push([team===0?x:PW-x,z])}});return out}
function start(seats,md,S,seed){score=[0,0];ko=0;koT=0;cel=0;celBy=-1;golden=false;nextId=1;items=[];parts=[];texts=[];wall=[0,0];gkBig=[0,0];lastGoal=null;shake=0;
 Object.assign(G,{me:-1,swAt:0,hold:false,kickSeq:0,pred:null,koSeen:-1,evSeen:0,cseq:0,claims:[],kicks:[]});
 const rr=RA.util.mulberry(seed),sw=S.ctrl!=='fixed',bySide=[[],[]];seats.forEach((s,i)=>bySide[md===1?0:i%2].push(i));
 const hum=t=>bySide[t].filter(i=>seats[i].ctrl!=='cpu');
 const size=S.size==='auto'?Math.max(4,bySide[0].length,bySide[1].length):Math.max(+S.size,sw?hum(0).length:bySide[0].length,sw?hum(1).length:bySide[1].length);
 pl=[];seatP=[];swT=[];seatGoals=seats.map(()=>0);
 for(const t of[0,1]){pl.push(mk(t,-1,'KEEPER',true,t===0?6:PW-6,PH/2,rr));
  const f=formation(size,t),order=f.map((_,k)=>k).sort((a,b)=>Math.abs(f[a][1]-PH/2)+Math.abs(f[a][0]-PW/2)*.5-(Math.abs(f[b][1]-PH/2)+Math.abs(f[b][0]-PW/2)*.5));
  // humans take the central footballers first; CPU seats own a footballer only in ONE PLAYER EACH
  const own=sw?hum(t):bySide[t],slot=[];own.forEach((si,k)=>{if(k<order.length)slot[order[k]]=si});
  for(let k=0;k<size;k++){const si=slot[k];const p=mk(t,si==null?-1:si,si==null?'CPU':seats[si].name,false,f[k][0],f[k][1],rr);pl.push(p);if(si!=null)seatP[si]=p.n}
  if(sw)bySide[t].filter(i=>seats[i].ctrl==='cpu').forEach((i,k)=>{const free=pl.filter(p=>p.team===t&&!p.gk&&p.seat<0);if(free.length)seatP[i]=free[k%free.length].n})}
 ball={h:-1,x:PW/2,z:PH/2,y:0,vx:0,vz:0,vy:0,fire:0,curve:0,last:-1,kt:-99,spin:0};
 cam.x=PW/2;cam.y=60;kickoff(Math.floor(rr()*2))}
function mk(team,seat,name,gk,x,z,rr){const p={n:pl.length,team,seat,gk,name,x,z,d:team===0?0:Math.PI,vx:0,vz:0,run:0,st:'',stT:0,fx:{},home:[x,z],goals:0,stam:1,kc:0,ch:0,fh:false,dodge:0,
 cack:0,kack:0,ev:[],evSeq:0,kt:-99,ht:-99,hair:Math.floor(rr()*HAIR.length),pose:'stand',pHold:0,col:seat>=0?K.seats[seat].col:TEAMC[team]};return p}
function kickoff(t){ko++;koT=t;cel=0;celBy=-1;ball.h=-1;ball.x=PW/2;ball.z=PH/2;ball.y=0;ball.vx=ball.vz=ball.vy=0;ball.fire=0;ball.curve=0;ball.last=-1;
 for(const p of pl)if(mine(p)||K.isClient()&&p.n!==G.me)place(p);sfx('whistle')}
function place(p){p.x=clamp(p.home[0],p.team===0?4:PW/2+14,p.team===0?PW/2-14:PW-4);p.z=p.home[1];p.vx=p.vz=0;p.st='';p.stT=0;p.ch=0;p.d=p.team===0?0:Math.PI;
 if(!p.gk&&p.team===koT){const mates=pl.filter(q=>q.team===koT&&!q.gk);const c=mates.slice().sort((a,b)=>Math.abs(a.home[1]-PH/2)+Math.abs(a.home[0]-PW/2)-(Math.abs(b.home[1]-PH/2)+Math.abs(b.home[0]-PW/2)))[0];
  if(c===p){p.x=PW/2-dirX(p.team)*7;p.z=PH/2}}}

/* ---------- auto-switch: you play the free team mate nearest the ball ---------- */
function pickFor(i,cur){const p=pl[cur];if(!p||K.S.ctrl==='fixed'||cel>0)return cur;
 if(holding(p)||p.st==='slide'||p.ch>0||K.tick-(swT[i]||-99)<16)return cur;
 const b=ballView(),free=q=>q.team===p.team&&!q.gk&&(q.seat<0||q.seat===i||!human(q.seat))&&q.st!=='down';
 if(b.h>=0&&pl[b.h]&&pl[b.h]!==p&&free(pl[b.h]))return b.h;            // a CPU team mate has it: take it over
 const tx=b.x+(b.vx||0)*10,tz=b.z+(b.vz||0)*10,dd=q=>Math.hypot(q.x-tx,q.z-tz);let best=p,bd=dd(p)-22;
 for(const q of pl)if(q!==p&&free(q)){const d=dd(q);if(d<bd){bd=d;best=q}}return best.n}
function switchTo(i,n){const o=pl[seatP[i]],q=pl[n];if(!q||o===q)return;if(o&&o.seat===i)o.seat=-1;q.seat=i;q.ch=0;q.fh=false;seatP[i]=n;swT[i]=K.tick}

/* ---------- your own footballer (runs on its owner's device) ---------- */
function holding(p){return K.isClient()&&p.n===G.me?G.hold:ball.h===p.n}
function ballView(){if(K.isClient()){const me=pl[G.me];if(me&&G.hold)return feet(me);if(G.pred)return G.pred}
 if(ball.h>=0&&pl[ball.h])return feet(pl[ball.h]);return ball}
// the ball at your feet rolls a little ahead and back with your stride
const feet=p=>{const r=4.5+(Math.hypot(p.vx,p.vz)>.3?Math.sin(p.run*Math.PI/2)*1.2:0);return{x:p.x+Math.cos(p.d)*r,z:p.z+Math.sin(p.d)*r,y:0,vx:p.vx,vz:p.vz,vy:0,h:p.n}};
function moveP(p,mx,mz,sprint){const f=p.fx;
 if(f.frz>0){p.vx*=.8;p.vz*=.8}
 else if(p.st==='down'||p.st==='getup'){p.vx*=.85;p.vz*=.85}
 else if(p.st==='slide'||p.st==='dive'){p.vx*=.95;p.vz*=.95}
 else{let sp=1.45*(f.boots>0?1.35:1)*(f.tiny>0?.8:1)*(holding(p)?.92:1);if(sprint&&p.stam>.05&&(mx||mz)){sp*=1.4;p.stam-=.008}else p.stam=Math.min(1,p.stam+.004);
  if(p.dodge>0)sp*=1.7;const l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l}
  p.vx+=(mx*sp-p.vx)*.25;p.vz+=(mz*sp-p.vz)*.25;if(l>.2&&p.dodge<=0)p.d=Math.atan2(mz,mx)}
 p.x=clamp(p.x+p.vx,-30,PW+30);p.z=clamp(p.z+p.vz,-30,PH+20);
 if(p.z>GZ0-3&&p.z<GZ1+3&&!p.gk){if(p.x<3&&p.x>-GD-4)p.x=p.z>GZ0+2&&p.z<GZ1-2?3:p.x;if(p.x>PW-3&&p.x<PW+GD+4)p.x=p.z>GZ0+2&&p.z<GZ1-2?PW-3:p.x}
 const v=Math.hypot(p.vx,p.vz);p.run=v>.15?p.run+v*.11:0;
 // a state with no time left (taken over from a snapshot, which carries no timer) ends instead of lasting forever
 if(p.st&&p.stT<=0)p.stT=1;
 if(p.stT>0&&--p.stT===0){if(p.st==='slide'||p.st==='down'||p.st==='dive'){p.st='getup';p.stT=14}else p.st=''}
 if(p.dodge>0)p.dodge--;if(p.kc>0)p.kc--;for(const k in f)if(f[k]>0&&k!=='fire'&&k!=='banana')f[k]--;
 for(const q of pl){if(q===p||q.st==='down')continue;const dx=p.x-q.x,dz=p.z-q.z,d=Math.hypot(dx,dz);if(d<6&&d>.01){p.x+=dx/d*(6-d)*.5;p.z+=dz/d*(6-d)*.5}}}
function control(p,inp){if(!p)return;
 let mx=(inp.right?1:0)-(inp.left?1:0),mz=(inp.down?1:0)-(inp.up?1:0);
 if(inp.ax!=null&&Math.hypot(inp.ax,inp.ay||0)>.25){mx=inp.ax;mz=inp.ay||0}
 mz=-mz;                                // W runs up the screen, which is away from the camera (+z)
 const hold=holding(p),busy=p.st!==''||p.fx.frz>0;
 if(hold&&p.ch>8){mx*=.35;mz*=.35}       // winding up a shot slows you down
 moveP(p,mx,mz,inp.b4);
 if(!hold&&!busy&&p.kc<=0){const b=ballView();if(b.h==null||b.h<0)if((b.y||0)<7&&Math.hypot(b.x-p.x,b.z-p.z)<7.5)possess(p)}
 const aim=inp.aim!=null?inp.aim:null;
 if(inp.fire&&!busy)p.ch=Math.min(48,p.ch+1);
 if(!inp.fire&&p.fh&&!busy){if(hold){if(p.ch<9)pass(p,aim);else shoot(p,aim,Math.min(1,(p.ch-6)/36),inp)}else if(p.ch<12)tackle(p);p.ch=0}
 if(!inp.fire)p.ch=0;p.fh=!!inp.fire;
 if(inp.alt&&!p.ah&&!busy){if(hold)lob(p,aim);else claim(p,'call',0)}p.ah=!!inp.alt;
 if(inp.b3&&!p.qh&&!busy){if(hold){if(p.dodge<=0&&!(p.dc>K.tick)){p.dodge=12;p.dc=K.tick+60}}else{p.st='slide';p.stT=22;p.vx=Math.cos(p.d)*2.9;p.vz=Math.sin(p.d)*2.9;sfx('kick',.3)}}p.qh=!!inp.b3;
 if(p.st==='slide')for(const q of pl)if(q.team!==p.team&&ballOwner()===q.n&&dist(p,q)<9&&!(p.slid===ko+'_'+p.stT)){p.slid=ko+'_'+p.stT;tackleOn(p,q,true)}
 for(const it of items)if(!it.got&&Math.hypot(it.x-p.x,it.z-p.z)<9){it.got=1;claim(p,'i',it.id)}}
const ballOwner=()=>K.isClient()&&G.hold?G.me:ball.h;
function possess(p){p.kc=6;if(K.isClient()){G.hold=true;claim(p,'p',0)}else{ball.h=p.n;ball.last=p.n;ball.fire=p.fx.fire?ball.fire:0}sfx('kick',.25)}
function kickBall(p,ang,sp,vy,kind){const b=feet(p),f=p.fx;let fire=0,curve=0;
 if(kind==='shot'&&f.fire>0){fire=1;f.fire=0;sp*=1.15}if(kind==='shot'&&f.banana>0){curve=(Math.random()<.5?-1:1)*.022;f.banana=0}if(f.tiny>0)sp*=.7;
 const k={x:b.x,z:b.z,y:1,vx:Math.cos(ang)*sp,vz:Math.sin(ang)*sp,vy,fire,curve};p.kc=14;p.kt=K.tick;p.d=ang;sfx('kick',sp/5);
 if(K.isClient()){G.hold=false;G.kickSeq++;G.kicks.push([G.kickSeq,Math.round(k.x*10)/10,Math.round(k.z*10)/10,Math.round(k.vx*100)/100,Math.round(k.vz*100)/100,Math.round(k.vy*100)/100,fire,curve]);if(G.kicks.length>6)G.kicks.shift();
  G.pred=Object.assign({h:-1,last:p.n},k)}
 else applyKick(p,k)}
function applyKick(p,k){Object.assign(ball,{h:-1,x:k.x,z:k.z,y:k.y,vx:k.vx,vz:k.vz,vy:k.vy,fire:k.fire,curve:k.curve,last:p.n,kt:K.tick});p.kt=K.tick;if(k.fire)K.fx('fi',p.n)}
// shots towards goal aim inside the posts: W / S pick the far / near post, otherwise somewhere in between
function goalAim(p,ang,inp){const gx=attackX(p.team),ga=Math.atan2(PH/2-p.z,gx-p.x);if(ang!=null&&Math.abs(wrapA(ang-ga))>1.2)return ang;
 const up=inp&&inp.up,dn=inp&&inp.down,tz=PH/2+(up?24:dn?-24:(Math.random()-.5)*(inp?36:56));return Math.atan2(tz-p.z,gx-p.x)}
function shoot(p,aim,pow,inp){const ang=goalAim(p,aim!=null?aim:p.d,inp);kickBall(p,ang+(Math.random()-.5)*.08*(1-pow*.5),4.4+pow*3.4,.35+pow*1.6,'shot')}
function lob(p,aim){const ang=aim!=null?aim:p.d,m=mate(p,ang);let a=ang,sp=3.6;if(m){a=Math.atan2(m.z-p.z,m.x-p.x);sp=clamp(dist(p,m)/48,2.4,4.6)}kickBall(p,a,sp,3.2,'lob')}
function pass(p,aim){const ang=aim!=null?aim:p.d,m=mate(p,ang);if(!m){kickBall(p,ang,4.2,.15,'pass');return}
 const lx=m.x+m.vx*14,lz=m.z+m.vz*14,d=Math.hypot(lx-p.x,lz-p.z);kickBall(p,Math.atan2(lz-p.z,lx-p.x),clamp(d/50,2.4,6.4),.1,'pass')}
function mate(p,ang){let best=null,bs=-1e9;for(const q of pl){if(q===p||q.team!==p.team)continue;const d=dist(p,q);if(d<12||d>300)continue;
  const a=Math.atan2(q.z-p.z,q.x-p.x),da=Math.abs(wrapA(a-ang));if(da>1.1)continue;
  let sc=-da*90-d*.15+(q.x-p.x)*dirX(p.team)*.15;for(const o of pl)if(o.team!==p.team){const t=((o.x-p.x)*(q.x-p.x)+(o.z-p.z)*(q.z-p.z))/(d*d);if(t>0&&t<1){const ex=p.x+(q.x-p.x)*t-o.x,ez=p.z+(q.z-p.z)*t-o.z;if(Math.hypot(ex,ez)<10)sc-=40}}
  if(ctrlBy(q))sc+=10;if(q.gk)sc-=30;if(sc>bs){bs=sc;best=q}}return best}
function tackle(p){const v=pl.find(q=>q.team!==p.team&&ballOwner()===q.n&&dist(p,q)<12);if(v)tackleOn(p,v,false)}
function tackleOn(p,v,slide){if(K.isClient())claim(p,'t',v.n,slide?1:0);else resolveTackle(p,v,slide)}
function claim(p,k,a,b){if(!K.isClient()){resolve(p,[0,k,a,b]);return}G.cseq++;G.claims.push([G.cseq,k,a,b|0]);if(G.claims.length>10)G.claims.shift()}

/* ---------- host: the referee ---------- */
function resolve(p,[,k,a,b]){
 if(k==='p'){if(ball.h<0&&Math.hypot(ball.x-p.x,ball.z-p.z)<18&&ball.y<9&&!(ball.last===p.n&&K.tick-ball.kt<8)&&cel===0){ball.h=p.n;ball.last=p.n}}
 else if(k==='t'){const v=pl[a];if(v)resolveTackle(p,v,!!b)}
 else if(k==='i'){const it=items.find(x=>x.id===a);if(it&&!it.dead){it.dead=1;powerUp(p,it.k)}}
 else if(k==='call'){const h=pl[ball.h];if(h&&h.team===p.team&&h!==p&&!ctrlBy(h)&&!h.gk)h.callTo=p.n;say(p,'PASS!','#ffffff')}}
function resolveTackle(p,v,slide){if(v.gk||ball.h!==v.n||dist(p,v)>(slide?16:14))return;if(!slide&&Math.random()<.45){say(v,'NICE SKILL!','#c0e0ff');return}
 if(ownerOf(v)==='net')send(v,'lose');
 if(!slide&&ownerOf(p)!=='net'){ball.h=p.n;ball.last=p.n;p.hold=0;sfx('kick',.4);return}
 let a=p.d;if(Math.cos(a)*dirX(p.team)<0)a=Math.PI-a;ball.h=-1;ball.x=v.x;ball.z=v.z;ball.vx=Math.cos(a)*1.8;ball.vz=Math.sin(a)*1.8;ball.vy=.6;ball.last=p.n;ball.kt=K.tick-12;
 if(slide){send(v,'down');say(v,'TACKLE!','#f8d040')}sfx('kick',.5)}
function send(q,kind){if(ownerOf(q)==='net'){q.evSeq++;q.ev.push([q.evSeq,kind]);if(q.ev.length>6)q.ev.shift()}else onEv(q,kind)}
function onEv(p,kind){if(/^it\d$/.test(kind)){selfItem(p,+kind[2]);return}
 if(kind==='lose'){if(K.isClient())G.hold=false;return}
 if(kind==='down'){p.st='down';p.stT=40;p.ch=0;p.vx=Math.cos(p.d)*1.2;p.vz=Math.sin(p.d)*1.2;if(K.isClient())G.hold=false}else if(kind==='frz')p.fx.frz=130;else if(kind==='tiny')p.fx.tiny=480}
function powerUp(p,k){const it=ITEMS[k];say(p,it.n,it.c);sfx('pick');const t=p.team,rv=pl.filter(q=>q.team!==t);
 if(k<=4){if(ownerOf(p)==='net')send(p,'it'+k);else selfItem(p,k)}
 else if(k===5){gkBig[t]=720}else if(k===6){for(const q of rv)send(q,'frz')}else if(k===7)wall[t]=480;else if(k===8)for(const q of rv)send(q,'tiny')}
function selfItem(p,k){const f=p.fx;if(k===1)f.boots=600;else if(k===2)f.fire=1;else if(k===3)f.banana=1;else if(k===4)f.mag=600}
function readUpload(p,r){if(typeof r.x!=='number')return;p.x=r.x;p.z=r.z;p.d=r.d;p.vx=r.vx||0;p.vz=r.vz||0;p.st=r.s||'';p.fl=r.f|0;p.run=r.r||0;p.ch=r.c|0;if(r.kt)p.kt=K.tick-(r.kt|0);
 for(const e of r.cl||[])if((e[0]|0)>p.cack){p.cack=e[0]|0;resolve(p,e)}
 for(const e of r.k||[])if((e[0]|0)>p.kack){p.kack=e[0]|0;if(ball.h===p.n||ball.h<0&&ball.last===p.n&&K.tick-ball.kt<30)applyKick(p,{x:e[1],z:e[2],y:1,vx:e[3],vz:e[4],vy:e[5],fire:e[6],curve:e[7]})}}
function ballStep(b,host){if(b.h>=0)return;
 if(b.curve){const c=Math.cos(b.curve),s=Math.sin(b.curve),vx=b.vx*c-b.vz*s;b.vz=b.vx*s+b.vz*c;b.vx=vx;b.curve*=.985}
 if(host)for(const p of pl)if(p.fx.mag>0||p.fl&16){const dx=p.x-b.x,dz=p.z-b.z,d=Math.hypot(dx,dz);if(d<80&&d>4){b.vx+=dx/d*.07;b.vz+=dz/d*.07}}
 b.x+=b.vx;b.z+=b.vz;b.y+=b.vy;if(b.y>0){b.vy-=.2;b.vx*=.996;b.vz*=.996}else{b.y=0;if(b.vy<-.9){b.vy=-b.vy*.52;if(host)sfx('kick',.15)}else b.vy=0;b.vx*=.982;b.vz*=.982}
 b.spin=(b.spin||0)+Math.hypot(b.vx,b.vz)*.35;
 // goal frames: posts and crossbar
 for(const gx of[0,PW]){if(Math.abs(b.x-gx)<3){for(const pz of[GZ0,GZ1])if(Math.abs(b.z-pz)<3&&b.y<GH){b.vz=-b.vz*.7;b.vx=-b.vx*.5;b.x+=b.vx;if(host){sfx('post');shake=3}}
  if(b.z>GZ0&&b.z<GZ1&&Math.abs(b.y-GH)<2.5){b.vy=-Math.abs(b.vy)*.6;b.vx=-b.vx*.4;if(host){sfx('post');shake=3}}}}
 const inMouth=b.z>GZ0&&b.z<GZ1&&b.y<GH;
 for(const t of[0,1])if(wall[t]>0&&inMouth){const gx=t===0?0:PW;if(Math.abs(b.x-gx)<4){b.vx=-b.vx*.8;b.x=gx+(t===0?4:-4)}}
 if(b.x<0||b.x>PW){if(inMouth||b.x<-GD+2||b.x>PW+GD-2){if(b.x<-GD+2){b.x=-GD+2;b.vx=0;b.net=8}if(b.x>PW+GD-2){b.x=PW+GD-2;b.vx=0;b.net=8}}
  else if(K.S.walls==='on'||!host){b.x=b.x<0?0:PW;b.vx=-b.vx*.6}else out(b)}
 if(b.z<0||b.z>PH){if(b.x>0&&b.x<PW||!inMouth){if(K.S.walls==='on'||!host){b.z=b.z<0?0:PH;b.vz=-b.vz*.6}else out(b)}}
 if(b.net>0)b.net--}
function out(b){const last=pl[b.last],t=last?1-last.team:0,q=pl.filter(p=>p.team===t&&!p.gk).sort((a,c)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(c.x-b.x,c.z-b.z))[0];
 b.x=clamp(b.x,2,PW-2);b.z=clamp(b.z,2,PH-2);b.vx=b.vz=b.vy=0;b.y=0;if(q){b.h=q.n;b.last=q.n;say(q,'THROW-IN','#ffffff')}sfx('whistle')}
// headers: a ball dropping at head height next to an outfield player is nodded on (at goal in the attacking third)
function headers(){if(ball.h>=0||ball.y<9||ball.y>16||ball.vy>1)return;
 for(const p of pl){if(p.gk||p.st)continue;if(Math.hypot(ball.x-p.x,ball.z-p.z)>7||ball.last===p.n&&K.tick-ball.kt<20||K.tick-p.ht<20)continue;
  const gx=attackX(p.team),near=Math.abs(gx-p.x)<190,tz=PH/2+(Math.random()-.5)*50,a=near?Math.atan2(tz-p.z,gx-p.x):(p.team===0?0:Math.PI)+(Math.random()-.5)*.8;
  const sp=near?4.6:3.6;Object.assign(ball,{vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:near?-.2:1.8,last:p.n,kt:K.tick,curve:0});p.ht=K.tick;p.d=a;
  sfx('kick',.6);K.fx('hd',p.n);if(near)say(p,'HEADER!','#ffffff');return}}
function keeperSave(p){const b=ball;if(b.h>=0||!p.gk||p.st==='down')return false;const big=gkBig[p.team]>0,reach=p.st==='dive'?15:big?17:11,top=big?28:p.st==='dive'?22:18;
 if(Math.hypot(b.x-p.x,b.z-p.z)>=reach||b.y>=top||b.last===p.n&&K.tick-b.kt<12)return false;
 if(b.fire){b.vx=-b.vx*.35;b.vz=(Math.random()-.5)*3;b.vy=1.5;b.fire=0;say(p,'OUCH!','#ff8040');return true}
 // a hard shot at full stretch is parried, not caught
 const hard=Math.hypot(b.vx,b.vz)>5.2;if(p.st==='dive'&&hard&&Math.random()<.5){b.vx=-b.vx*.4;b.vz=b.vz*.5+(b.z<PH/2?-1.5:1.5);b.vy=1.2;b.last=p.n;b.kt=K.tick;say(p,'PARRIED!','#f8d040');sfx('kick',.6);return true}
 b.h=p.n;b.last=p.n;b.fire=0;p.hold=0;say(p,'SAVED!','#f8d040');sfx('kick',.4);return true}
function step(){if(K.tick===2)music();const S=K.S;
 // auto-switch for humans on this device
 for(let i=0;i<K.seats.length;i++){const s=K.seats[i];if(!s||s.ctrl==='cpu'||s.ctrl==='net'||seatP[i]==null)continue;const n=pickFor(i,seatP[i]);if(n!==seatP[i])switchTo(i,n)}
 // a footballer still marked with a seat that has moved on to someone else goes back to the AI (it used to freeze mid-slide)
 for(const p of pl)if(p.seat>=0&&seatP[p.seat]!==p.n)p.seat=-1;
 for(const p of pl){if(ownerOf(p)==='net'){const r=K.remote(p.seat);if(r){if(r.n!=null&&r.n!==p.n){ai(p);continue}readUpload(p,r)}continue}
  if(ctrlBy(p))control(p,K.inp(p.seat));else{ai(p);for(const it of items)if(!it.dead&&Math.hypot(it.x-p.x,it.z-p.z)<9){it.dead=1;powerUp(p,it.k)}}}
 // a guest asking for another footballer
 for(let i=0;i<K.seats.length;i++){const s=K.seats[i];if(!s||s.ctrl!=='net')continue;const r=K.remote(i);if(!r||r.n==null||r.n===seatP[i])continue;const q=pl[r.n];
  if(q&&!q.gk&&pl[seatP[i]]&&q.team===pl[seatP[i]].team&&(q.seat<0||!human(q.seat))&&!(ball.h===seatP[i])){switchTo(i,r.n);readUpload(q,r)}}
 if(cel>0){if(--cel===0)kickoff(lastGoal)}
 else{ballStep(ball,true);
  if(ball.h<0){headers();
   for(const p of pl){if(p.st&&p.st!=='dive'||p.fx.frz>0)continue;
    if(p.gk){if(Math.abs(p.x-(p.team===0?0:PW))<=70&&keeperSave(p))break;continue}
    if(Math.hypot(ball.x-p.x,ball.z-p.z)<7&&ball.y<7&&!(ball.last===p.n&&K.tick-ball.kt<12)){
     if(ownerOf(p)==='net'||ctrlBy(p)&&mine(p))continue;   // humans pick it up themselves
     ball.h=p.n;ball.last=p.n;ball.fire=0;p.hold=0;break}}
   if(ball.fire)for(const p of pl)if(!p.gk&&p.n!==ball.last&&Math.hypot(ball.x-p.x,ball.z-p.z)<6&&ball.y<10&&p.st!=='down'){send(p,'down');ball.vx*=.7;ball.vz*=.7}}
  const gl=goalCheck();if(gl!=null)goal(gl)}
 for(const t of[0,1]){if(wall[t]>0)wall[t]--;if(gkBig[t]>0)gkBig[t]--}
 if(S.items!=='off'&&K.tick%540===270&&items.length<3&&cel===0){const r=Math.random();let k=1+Math.floor(r*5);if(S.items==='party'&&Math.random()<.45)k=6+Math.floor(Math.random()*3);
  items.push({id:nextId++,k,x:80+Math.random()*(PW-160),z:40+Math.random()*(PH-80),t:900})}
 for(const it of items)it.t--;items=items.filter(it=>!it.dead&&it.t>0);
 vis();
 const lim=S.len*3600;if(lim&&K.tick>=lim&&cel===0){if(score[0]!==score[1]||S.gold!=='on'){finish();return}if(!golden){golden=true;say({x:PW/2,z:PH/2},'GOLDEN GOAL!','#f8d040');K.track(3);K.fx('gg')}}}
function goalCheck(){if(ball.h>=0||ball.z<=GZ0||ball.z>=GZ1||ball.y>=GH)return null;if(ball.x<-1&&!wall[0])return 1;if(ball.x>PW+1&&!wall[1])return 0;return null}
function goal(t){score[t]++;const s=pl[ball.last],own=s&&s.team!==t;if(s&&!own){s.goals++;if(s.seat>=0&&seatGoals[s.seat]!=null)seatGoals[s.seat]++}lastGoal=1-t;cel=170;celBy=s&&!own?s.n:-1;celT=t;
 const nm=s?(own?'OWN GOAL':ctrlBy(s)?(K.seats[s.seat].name||s.name):TEAMN[t]+' SCORES'):'';K.fx('g',t,s?s.n:-1,own?1:0);celebrate(t,nm);celName=nm;
 if(golden){finish();return}}
function celebrate(t,nm){sfx('roar');shake=6;celT=t;texts.push({big:'GOAL!',s:nm,col:TEAMC[t],t:150});
 const gx=t===0?PW:0;for(let k=0;k<60;k++)parts.push({x:gx-dirX(t)*4,z:PH/2+(Math.random()-.5)*60,y:6+Math.random()*12,vx:(Math.random()-.5)*2.5,vz:(Math.random()-.5)*2.5,vy:Math.random()*2.5,t:90,col:k%3?TEAMC[t]:'#ffffff',g:.05})}
function finish(){const w=score[0]>score[1]?0:score[1]>score[0]?1:-1;
 if(K.mode===1)K.end({coop:w===0?1:0,name:w===0?'YOU WIN '+score[0]+'-'+score[1]+'!':w<0?'DRAW '+score[0]+'-'+score[1]:'CPU WINS '+score[1]+'-'+score[0]});
 else K.end(w<0?null:{team:w,name:TEAMN[w]+' '+score[w]+'-'+score[1-w]})}
function music(){K.track(1+Math.floor(Math.random()*2))}
function say(p,s,col){texts=texts.filter(t=>t.big||Math.hypot(t.x-p.x,t.z-p.z)>40);texts.push({x:p.x,z:p.z,y:16,s,col,t:60})}
function vis(){for(const q of parts){q.x+=q.vx;q.z+=q.vz;q.y=Math.max(0,q.y+q.vy);q.vy-=q.g||.07;q.vx*=.97;q.vz*=.97;q.t--}parts=parts.filter(q=>q.t>0);if(parts.length>400)parts.splice(0,parts.length-400);
 for(const t of texts){t.t--;if(!t.big)t.y+=.15}texts=texts.filter(t=>t.t>0);if(shake>0)shake*=.88;
 const b=ballView();if(b.fire||ball.fire&&ball.h<0)parts.push({x:b.x,z:b.z,y:(b.y||0)+2,vx:(Math.random()-.5)*.3,vz:(Math.random()-.5)*.3,vy:.3,t:14,col:Math.random()<.5?'#ff8020':'#f8e040'});
 // grass kicked up by slides and hard turns
 for(const p of pl){const v=Math.hypot(p.vx,p.vz);if(p.st==='slide'&&K.tick%2===0||p.st==='dive'&&K.tick%3===0)parts.push({x:p.x,z:p.z,y:.5,vx:-p.vx*.2+(Math.random()-.5)*.6,vz:-p.vz*.2+(Math.random()-.5)*.6,vy:.6+Math.random()*.6,t:16,col:Math.random()<.5?'#2a7a2a':'#6cc058',g:.1});
  if(v>2&&K.tick%6===0)parts.push({x:p.x,z:p.z,y:.3,vx:0,vz:0,vy:.3,t:8,col:'#8ac878',g:.05})}}

/* ---------- CPU footballers and keepers ---------- */
const lvlOf=t=>K.mode===1&&t===1?K.cpu:Math.max(1,K.cpu);
// the outfield brain: where to run and what to do. CPUs act on it directly; bot() turns it into button presses
function brain(p,lvl){const b=ballView(),t=p.team,dx=dirX(t),gx=attackX(t),o={mx:0,mz:0,spr:false,act:null};lvl=lvl==null?lvlOf(t):lvl;
 const go=(x,z,stop)=>{const ddx=x-p.x,ddz=z-p.z,d=Math.hypot(ddx,ddz);if(d>(stop||3)){o.mx=ddx/d;o.mz=ddz/d;if(d<14){o.mx*=d/14;o.mz*=d/14}}return d};
 if(cel>0){// celebrate: the scorer runs to the corner flag, team mates chase him, the others trudge back
  const s=pl[celBy];if(s&&s.team===t){if(s===p)go(attackX(t)-dx*8,p.z<PH/2?8:PH-8,4);else go(s.x-dx*14,s.z+(p.n%3-1)*12,10)}else go(p.home[0],p.home[1],6);return o}
 const own=ballOwner(),hold=own===p.n,teamBall=own>=0&&pl[own]&&pl[own].team===t;
 if(hold){p.hold=(p.hold|0)+1;const dg=Math.hypot(gx-p.x,PH/2-p.z);
  if(p.callTo!=null&&pl[p.callTo]){const m=pl[p.callTo];p.callTo=null;o.act='pass';o.ang=Math.atan2(m.z-p.z,m.x-p.x);return o}
  const opp=pl.filter(q=>q.team!==t&&!q.gk&&dist(p,q)<30&&((q.x-p.x)*dx>-4));
  if(dg<60||dg<[85,105,125][lvl]&&Math.random()<.03+lvl*.015){o.act='shoot';o.pow=.5+Math.random()*.5;o.ang=Math.atan2(PH/2-p.z,gx-p.x);return o}
  if(opp.length&&p.hold>12&&Math.random()<[.03,.06,.09][lvl]){const m=mate(p,Math.atan2(PH/2-p.z,gx-p.x))||mate(p,dx>0?0:Math.PI);if(m){o.act='pass';o.ang=Math.atan2(m.z-p.z,m.x-p.x);return o}}
  let a=Math.atan2(PH/2-p.z,gx-p.x);const ob=opp.sort((q,r)=>dist(p,q)-dist(p,r))[0];if(ob){const ao=Math.atan2(ob.z-p.z,ob.x-p.x);a+=(Math.sin(a-ao)>0?.7:-.7)}
  if(p.z<20)a+=.4*dx;if(p.z>PH-20)a-=.4*dx;o.mx=Math.cos(a);o.mz=Math.sin(a);o.spr=lvl>0&&!opp.length;return o}
 p.hold=0;
 // the closest outfield player of the team presses the ball; a second one helps when the rivals have it
 const order=pl.filter(q=>q.team===t&&!q.gk).sort((q,r)=>Math.hypot(q.x-b.x,q.z-b.z)-Math.hypot(r.x-b.x,r.z-b.z)),rank=order.indexOf(p);
 const chase=!teamBall&&(rank===0||rank===1&&own>=0&&lvl>=1||order[0]&&ctrlBy(order[0])&&order[0]!==p&&rank===1);
 if(chase){const lead=own<0?8:4,d=go(b.x+(b.vx||0)*lead,b.z+(b.vz||0)*lead,1);o.spr=d>40;
  const h=own>=0?pl[own]:null;if(h&&h.team!==t&&dist(p,h)<10&&Math.random()<[.02,.05,.09][lvl])o.act=Math.random()<.4?'slide':'tackle'}
 else{const shift=(b.x-PW/2)*.45+(teamBall?dx*45:-dx*15);let hx=clamp(p.home[0]+shift,8,PW-8),hz=clamp(p.home[1]+(b.z-PH/2)*.3,10,PH-10);
  if(teamBall&&p.home[0]*dx>(dx>0?PW*.3:-PW*.7))hx=clamp(hx+dx*30,8,PW-8);go(hx,hz,5)}
 return o}
function ai(p){if(p.gk){keeper(p);return}
 if(p.st==='down'||p.st==='getup'||p.st==='slide'||p.fx.frz>0){moveP(p,0,0,false);return}
 const o=brain(p);
 if(o.act==='shoot'){shoot(p,null,o.pow,null);moveP(p,0,0,false);return}
 if(o.act==='pass'){pass(p,o.ang);moveP(p,0,0,false);return}
 moveP(p,o.mx,o.mz,o.spr);
 const h=pl[ball.h];if(h&&(o.act==='tackle'||o.act==='slide')){if(o.act==='slide'){p.st='slide';p.stT=22;p.d=Math.atan2(h.z-p.z,h.x-p.x);p.vx=Math.cos(p.d)*2.9;p.vz=Math.sin(p.d)*2.9;resolveTackle(p,h,true)}else resolveTackle(p,h,false)}}
function keeper(p){const b=ballView(),t=p.team,dx=dirX(t),own=t===0?0:PW,lvl=lvlOf(t);let mx=0,mz=0,spr=false;
 const go=(x,z,stop)=>{const ddx=x-p.x,ddz=z-p.z,d=Math.hypot(ddx,ddz);if(d>(stop||1)){mx=ddx/d;mz=ddz/d;if(d<10){mx*=d/10;mz*=d/10}}return d};
 if(p.st==='down'||p.st==='getup'||p.st==='dive'||p.fx.frz>0){moveP(p,0,0,false);return}
 if(cel>0){go(own+dx*6,PH/2);moveP(p,mx,mz,false);return}
 if(ball.h===p.n){p.hold=(p.hold|0)+1;if(p.hold>55){const m=mate(p,dx>0?0:Math.PI)||pl.find(q=>q.team===t&&!q.gk);if(m&&Math.random()<.6)pass(p,Math.atan2(m.z-p.z,m.x-p.x));else kickBall(p,(dx>0?0:Math.PI)+(Math.random()-.5)*.6,5.5,2.6,'pass')}moveP(p,0,0,false);return}
 const near=Math.hypot(b.x-own,b.z-PH/2),loose=ball.h<0,hd=ball.h>=0?pl[ball.h]:null;
 // a shot coming in: read where it crosses the goal line and dive if it's out of reach
 if(loose&&Math.sign(b.vx)===-dx&&Math.abs(b.vx)>1.4){const tt=(p.x-b.x)/b.vx;if(tt>0&&tt<45){const zi=b.z+b.vz*tt;
   if(zi>GZ0-14&&zi<GZ1+14){const dz=zi-p.z;
    if(Math.abs(dz)>7&&tt<16+lvl*3){if(Math.random()<[.55,.75,.88][lvl]){p.st='dive';p.stT=26;p.dv=Math.sign(dz);p.vz=clamp(dz/Math.max(5,tt),-3.3,3.3);p.vx=dx*.4;moveP(p,0,0,false);return}}
    go(p.x,zi,0);moveP(p,mx*1.4,mz*1.4,true);return}}}
 if(hd&&hd.team!==t&&near<60){go(hd.x,hd.z,1);moveP(p,mx*1.2,mz*1.2,true);if(dist(p,hd)<9&&Math.random()<[.05,.08,.12][lvl]){ball.h=p.n;ball.last=p.n;p.hold=0;say(p,'GRABBED!','#f8d040');if(ownerOf(hd)==='net')send(hd,'lose')}return}
 let tx=own+dx*(near<140?10:6),tz=clamp(b.z,GZ0+3,GZ1-3);
 if(loose&&near<70&&Math.hypot(b.x-p.x,b.z-p.z)<50){tx=b.x+b.vx*4;tz=b.z+b.vz*4}
 go(clamp(tx,own===0?-4:PW-60,own===0?60:PW+4),tz,1);moveP(p,mx,mz,spr)}
// the same brain as button presses, for a human seat (play-testing, and your footballer after the final whistle)
function bot(i){const p=K.isClient()?pl[G.me]:pl[seatP[i]];if(!p||p.gk)return{};const o={},q=p.bq||(p.bq={t:0});
 const steer=(mx,mz)=>{if(mx>.25)o.right=true;else if(mx<-.25)o.left=true;if(mz>.25)o.up=true;else if(mz<-.25)o.down=true};
 if(q.t>0){q.t--;steer(q.mx,q.mz);if(q.t>0&&q.key)o[q.key]=true;return o}
 const r=brain(p,2);steer(r.mx,r.mz);if(r.spr)o.b4=true;
 if(r.act==='shoot'||r.act==='pass'){const a=r.ang;q.mx=Math.cos(a);q.mz=Math.sin(a);steer(q.mx,q.mz);o.fire=true;q.key='fire';q.t=r.act==='shoot'?Math.round(9+r.pow*30):1}
 else if(r.act==='tackle'){o.fire=true;q.t=1;q.key=null;q.mx=r.mx;q.mz=r.mz}
 else if(r.act==='slide'){o.b3=true;q.t=1;q.key=null;q.mx=r.mx;q.mz=r.mz}
 return o}

/* ---------- guests: run my footballer, take the host's word for the rest ---------- */
function local(i){if(G.me<0&&seatP[i]!=null)G.me=seatP[i];let p=pl[G.me];if(!p)return;
 if(ko!==G.koSeen){G.koSeen=ko;place(p);G.hold=false;G.pred=null}
 if(K.S.ctrl!=='fixed'&&!G.hold){const n=pickFor(i,G.me);if(n!==G.me){G.me=n;G.swAt=K.tick;swT[i]=K.tick;p=pl[n];p.ch=0;p.fh=false}}
 if(G.hostMe!=null&&G.hostMe!==G.me&&K.tick-G.swAt>40){G.me=G.hostMe;G.hold=false;p=pl[G.me];G.swAt=K.tick}   // the host said no: take the one it gave me
 control(p,K.inp(i));if(G.pred){ballStep(G.pred,false);if(K.tick-(G.pred.at||(G.pred.at=K.tick))>45)G.pred=null}}
const ST={'':0,slide:1,down:2,getup:3,dive:4},STN=['','slide','down','getup','dive'];
const flagsOf=p=>p.fl!=null&&ownerOf(p)==='net'?p.fl:(p.fx.boots>0?1:0)|(p.fx.fire?2:0)|(p.fx.banana?4:0)|(p.fx.frz>0?8:0)|(p.fx.mag>0?16:0)|(p.fx.tiny>0?32:0)|(p.dv>0?64:0);
function upload(i){const p=pl[G.me];if(!p)return null;
 return{n:p.n,x:Math.round(p.x*10)/10,z:Math.round(p.z*10)/10,d:Math.round(p.d*100)/100,vx:Math.round(p.vx*100)/100,vz:Math.round(p.vz*100)/100,s:p.st,r:Math.round(p.run*10)/10,c:p.ch,
  kt:Math.min(99,K.tick-p.kt),f:flagsOf(p),cl:G.claims,k:G.kicks}}
function snap(){return{p:pl.map(p=>[Math.round(p.x),Math.round(p.z),Math.round(p.d*100),Math.round(p.run*10),ST[p.st]|0,flagsOf(p),p.goals,p.ch|0,p.seat,Math.min(99,K.tick-Math.max(p.kt,p.ht))]),
 b:[ball.h,Math.round(ball.x*10),Math.round(ball.z*10),Math.round(ball.y*10),Math.round(ball.vx*100),Math.round(ball.vz*100),Math.round(ball.vy*100),ball.fire|0,ball.last],
 s:score,ko,kt:koT,ce:cel,cb:celBy,gg:golden?1:0,wl:wall,gb:gkBig.map(v=>v>0?1:0),it:items.map(it=>[it.id,it.k,Math.round(it.x),Math.round(it.z)]),sp:seatP,sg:seatGoals,
 h:pl.filter(p=>ownerOf(p)==='net').map(p=>[p.n,p.cack,p.kack,p.ev])}}
function apply(g){const me=pl[G.me];score=g.s||score;koT=g.kt|0;cel=g.ce|0;celBy=g.cb==null?-1:g.cb;golden=!!g.gg;wall=g.wl||wall;gkBig=(g.gb||[0,0]).map(v=>v?1:0);seatGoals=g.sg||seatGoals;
 if(g.sp){seatP=g.sp;G.hostMe=g.sp[K.myIdx]}
 (g.p||[]).forEach((a,n)=>{const p=pl[n];if(!p)return;p.goals=a[6]|0;p.seat=a[8]==null?-1:a[8];if(p===me)return;p.tx=a[0];p.tz=a[1];p.d=a[2]/100;p.run=a[3]/10;p.st=STN[a[4]|0]||'';p.fl=a[5]|0;p.ch=a[7]|0;p.kt=K.tick-(a[9]==null?99:a[9]);if(p.gx==null){p.x=p.tx;p.z=p.tz;p.gx=1}});
 const B=g.b||[];ball.h=B[0]|0;ball.last=B[8]|0;const nb={x:B[1]/10,z:B[2]/10,y:B[3]/10,vx:B[4]/100,vz:B[5]/100,vy:B[6]/100};ball.fire=B[7]|0;
 if(ball.h<0){if(Math.hypot(nb.x-ball.x,nb.z-ball.z)>24||ball.h!==ball.ph)Object.assign(ball,nb);else{ball.tx=nb.x;ball.tz=nb.z;ball.vx=nb.vx;ball.vz=nb.vz;ball.vy=nb.vy;ball.y+=(nb.y-ball.y)*.5}}else Object.assign(ball,nb);ball.ph=ball.h;
 const im=new Map(items.map(i=>[i.id,i]));items=(g.it||[]).map(r=>({id:r[0],k:r[1],x:r[2],z:r[3],got:im.get(r[0])&&im.get(r[0]).got}));
 for(const r of g.h||[]){if(!me||r[0]!==me.n)continue;
  for(const e of r[3]||[])if((e[0]|0)>G.evSeen){G.evSeen=e[0]|0;onEv(me,e[1])}
  if(ball.h===me.n)G.hold=true;else if(G.hold&&(r[1]|0)>=G.claimLast())G.hold=false;
  if(G.pred&&(r[2]|0)>=G.kickSeq&&K.tick-(G.pred.at||0)>4)G.pred=null}
 if(typeof g.ko==='number'&&g.ko!==ko){ko=g.ko}}
G.claimLast=()=>{let m=0;for(const c of G.claims)if(c[1]==='p')m=c[0];return m};
function follow(){for(const p of pl){if(p.tx==null||p.n===G.me)continue;const dx=p.tx-p.x,dz=p.tz-p.z;if(Math.hypot(dx,dz)>40){p.x=p.tx;p.z=p.tz}else{p.x+=dx*.35;p.z+=dz*.35}
  const v=Math.hypot(dx,dz);p.vx=dx*.35;p.vz=dz*.35}
 if(ball.h<0){ballStep(ball,false);if(ball.tx!=null){ball.x+=(ball.tx-ball.x)*.25;ball.z+=(ball.tz-ball.z)*.25;ball.tx+=ball.vx;ball.tz+=ball.vz}}
 if(cel>0)cel--;vis()}
function onFx(k,a){if(k==='g'){const s=pl[a[1]];celebrate(a[0],s?(a[2]?'OWN GOAL':ctrlBy(s)?(K.seats[s.seat].name||s.name):TEAMN[a[0]]+' SCORES'):'');celBy=a[2]?-1:a[1]}else if(k==='gg'){K.track(3)}else if(k==='fi')sfx('boom');else if(k==='hd'){const p=pl[a[0]];if(p)p.ht=K.tick}}

/* ---------- drawing: a side-on broadcast camera on the pixel screen ---------- */
const cam={x:PW/2,y:60,tk:0,vw:320,vh:171};
const kz=z=>1-KP*clamp(z,-60,PH+60)/PH;                 // perspective: the far side is narrower
const wsy=z=>STAND+(PH-z)*ZS;                           // screen y of ground depth z, before scrolling
function proj(x,z,y){return{x:cam.vw/2+(x-cam.x)*kz(z)+cam.sx,y:wsy(z)-cam.y-(y||0)*YS+cam.sy}}
function aim(i,fx,fy){const p=K.isClient()?pl[G.me]:pl[seatP[i]];if(!p||!SCR)return null;const sx=fx*SCR.w,sy=fy*SCR.h,z=PH-(sy+cam.y-STAND)/ZS,x=cam.x+(sx-cam.vw/2)/kz(z);return Math.atan2(z-p.z,x-p.x)}
const C32=h=>{const c=X.hex(h);return((255<<24)|(c[2]<<16)|(c[1]<<8)|c[0])>>>0};
const hash=(x,y)=>{let h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
// the pitch, top down, one texel per unit: mown stripes, chalk lines 2 texels wide across and 3 along (rows sample every 2 units)
const TX0=-110,TZ0=-64,TW=860,TH=520;let TEX=null;
function pitchTex(){if(TEX)return TEX;TEX=new Uint32Array(TW*TH);const g1=C32('#47aa42'),g2=C32('#3e9a3a'),g3=C32('#378c34'),g4=C32('#33822f'),sp=C32('#358a34'),hi=C32('#58b850'),ln=C32('#e8e4dc');
 const L=(v,c,w)=>Math.abs(v-c)<w,inZ=(z,a,b)=>z>=a-1&&z<=b+1,inX=(x,a,b)=>x>=a-1&&x<=b+1;
 for(let tz=0;tz<TH;tz++)for(let tx=0;tx<TW;tx++){const x=tx+TX0,z=tz+TZ0,h=hash(tx,tz);const inside=x>=-24&&x<=PW+24&&z>=-20&&z<=PH+20;
  let c=inside?(Math.floor((x+1200)/40)&1?g1:g2):(Math.floor((x+1200)/40)&1?g3:g4);if(h<.035)c=sp;else if(h>.988)c=hi;
  const line=inZ(z,0,PH)&&(L(x,0,1)||L(x,PW,1)||L(x,PW/2,1))||inX(x,0,PW)&&(L(z,0,1.6)||L(z,PH,1.6))
   ||[0,PW].some(gx=>{const ax=Math.abs(x-gx);return ax<=97&&(L(ax,96,1)&&inZ(z,100,300)||(L(z,100,1.6)||L(z,300,1.6))&&ax<=96||L(ax,32,1)&&inZ(z,145,255)||(L(z,145,1.6)||L(z,255,1.6))&&ax<=32)
     ||Math.hypot(ax-64,z-PH/2)<2.2||ax>96&&L(Math.hypot(ax-64,(z-PH/2)),56,1.4)})
   ||L(Math.hypot(x-PW/2,z-PH/2),56,1.4)||Math.hypot(x-PW/2,z-PH/2)<2.6;
  TEX[tz*TW+tx]=line?ln:c}
 return TEX}
// the crowd: terraces of fans in team colours; frame 1 bobs, frame 2 is everyone up for a goal
const KST=kz(PH+40),KBD=kz(PH+24),SX0=-180,SX1=820;let CROWD=null,BOARDS=null;
function crowd(){if(CROWD)return CROWD;const w=Math.round((SX1-SX0)*KST),h=36,rr=RA.util.mulberry(11),cols=['#e83838','#e83838','#2c78f0','#2c78f0','#f4f4f4','#f0c020','#1c2a5c','#b8202c','#60a0ff'],skins=['#f0b888','#c07850','#8c5c34','#f8d0a8'];
 const fans=[];for(let row=0;row<6;row++)for(let x=1+(row&1)*2;x<w-3;x+=4)if(rr()<.92)fans.push({x,y:7+row*5,c:cols[rr()*cols.length|0],s:skins[rr()*skins.length|0],b:rr()<.5});
 CROWD=[0,1,2].map(f=>{const c=X.mk(w,h),g=c.getContext('2d');g.fillStyle='#241c34';g.fillRect(0,0,w,h);g.fillStyle='#100c18';g.fillRect(0,0,w,4);
  for(let x=10;x<w;x+=48){g.fillStyle='#fff07c';g.fillRect(x,1,3,2)}
  for(let row=0;row<6;row++){g.fillStyle=row&1?'#2e2440':'#382c4c';g.fillRect(0,10+row*5,w,1)}
  for(const q of fans){const up=f===2||f===1&&q.b?1:0,y=q.y-up;g.fillStyle=q.c;g.fillRect(q.x,y+2,3,3);g.fillStyle=q.s;g.fillRect(q.x+1,y,1,2);g.fillRect(q.x,y+1,3,1);
   if(f===2){g.fillStyle=q.s;g.fillRect(q.x-1,y-1,1,2);g.fillRect(q.x+3,y-1,1,2)}}
  return c});return CROWD}
function boards(){if(BOARDS)return BOARDS;const AD=[['#d82838','#ffffff','RETRO ARENA'],['#2058c0','#fff07c','PIXEL KICK'],['#100c18','#88dc48','20 PLAYERS'],['#f0c020','#100c18','GOAL!'],['#e8e4dc','#d82838','KICK OFF'],['#38a038','#ffffff','PLAY FAIR']];
 const w=Math.round((SX1-SX0)*KBD),c=X.mk(w,10),g=c.getContext('2d');let x=0,k=0;while(x<w){const a=AD[k++%AD.length],bw=X.tw(a[2])+10;g.fillStyle=P.k;g.fillRect(x,0,bw,10);g.fillStyle=a[0];g.fillRect(x+1,1,bw-2,8);X.text(g,a[2],x+5,2,{col:a[1],shadow:false});x+=bw}
 return BOARDS=c}
const CACHE=new Map(),cache=(k,f)=>{let v=CACHE.get(k);if(!v){v=f();CACHE.set(k,v)}return v};
const SHADOW=w=>cache('sh'+w,()=>{const h=Math.max(2,Math.round(w/3.5)),c=X.mk(w,h),g=c.getContext('2d');g.fillStyle=P.k;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=(x+.5-w/2)/(w/2),dy=(y+.5-h/2)/(h/2);if(dx*dx+dy*dy<=1)g.fillRect(x,y,1,1)}return c});
function manSpr(p,key,flip){const gk=p.gk,t=p.team,col=gk?GKC[t]:TEAMC[t],sh=gk?['#303040','#1c1c28']:SHORTS[t],hr=HAIR[p.hair];
 return cache('m'+key+col+p.hair+flip,()=>{const c=X.recolor(ART.man[key],col,{a:sh[0],b:sh[1],h:hr[0],H:hr[1]},'man'+key+sh[0]+hr[0]);return flip?X.flipX(c):c})}
const silh=(c,col)=>cache('si'+col,()=>new Map()).get(c)||(()=>{const o=X.mk(c.width,c.height),g=o.getContext('2d');g.drawImage(c,0,0);g.globalCompositeOperation='source-in';g.fillStyle=col;g.fillRect(0,0,o.width,o.height);cache('si'+col,()=>new Map()).set(c,o);return o})();
const DIRS=[['E',0],['NE',0],['N',0],['NE',1],['E',1],['SE',1],['S',0],['SE',0]];
// pick the sprite for a footballer; walking poses hold for 3 steps so they never flicker
function poseOf(p){const fl=flagsOf(p),v=Math.hypot(p.vx,p.vz),di=DIRS[((Math.round(p.d/(Math.PI/4))%8)+8)%8],side=Math.cos(p.d)<0?1:0;let key,flip=di[1],rot=0;
 const kAgo=K.tick-p.kt,hAgo=K.tick-p.ht,holdsBall=ballOwner()===p.n;
 if(p.st==='dive'){key='dive';const t=p.team;flip=t===1?1:0;const up=fl&64||p.dv>0;rot=(up?-1:1)*(t===1?-1:1)*.9}
 else if(p.st==='down'){key='down';flip=side}
 else if(p.st==='slide'){key='slide';flip=side}
 else if(hAgo<12)key='head';
 else if(p.gk&&holdsBall)key='hold';
 else if(cel>0&&celT===p.team&&v<.7)key=(K.tick>>3)&1?'cheer1':'cheer2';
 else if(kAgo<9&&kAgo>=0)key=di[0]+'_kick';
 else if(p.gk&&v<.25&&Math.abs(ball.x-p.x)<160)key='ready';
 else if(v>.2||p.st==='getup'&&false)key=di[0]+'_r'+(1+(Math.floor(p.run)&3));
 else key=di[0]+'_stand';
 const walk=k=>/_(r\d|stand)$/.test(k);
 if(walk(key)&&walk(p.pose)&&K.tick-p.pAt<3&&key!==p.pose){key=p.pose;flip=p.pFlip}else if(key!==p.pose||flip!==p.pFlip){p.pose=key;p.pFlip=flip;p.pAt=K.tick}
 return{key,flip,rot}}
function blit(g,c,x,y,k,ax,ay){const w=Math.max(1,Math.round(c.width*k)),h=Math.max(1,Math.round(c.height*k));g.drawImage(c,Math.round(x-w*(ax==null?.5:ax)),Math.round(y-h*(ay==null?1:ay)),w,h);return h}
function px(g,x,y,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),1,1)}
function line(g,a,b,col,mesh,w){const x0=Math.round(a.x),y0=Math.round(a.y),x1=Math.round(b.x),y1=Math.round(b.y),n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);g.fillStyle=col;
 for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);if(mesh&&(x+y)&1)continue;g.fillRect(x,y,w||1,1)}}
// a goal in two halves: the net behind (drawn first) and the frame in front (sorted with the players)
function goalBack(g,gx){const dd=gx===0?-1:1,bx=gx+dd*GD+dd*(ball.net>0&&Math.abs(ball.x-gx)<GD+4?1.5:0),NT='#c8c8d4',bh=GH*.8;
 for(let z=GZ0;z<=GZ1;z+=6)line(g,proj(bx,z,0),proj(bx,z,bh),NT,1);
 for(let y=0;y<=bh;y+=4)line(g,proj(bx,GZ0,y),proj(bx,GZ1,y),NT,1);
 for(let z=GZ0;z<=GZ1;z+=6)line(g,proj(gx,z,GH),proj(bx,z,bh),NT,1);
 for(let y=0;y<=bh;y+=4)line(g,proj(gx,GZ1,y*GH/bh),proj(bx,GZ1,y),NT,1);
 line(g,proj(gx,GZ1,0),proj(gx,GZ1,GH),'#f4f4f4',0,2);line(g,proj(bx,GZ1,0),proj(bx,GZ1,bh),'#9a94a8')}
function goalFront(g,gx){const dd=gx===0?-1:1,bx=gx+dd*GD,NT='#c8c8d4',bh=GH*.8;
 for(let y=0;y<=bh;y+=4)line(g,proj(gx,GZ0,y*GH/bh),proj(bx,GZ0,y),NT,1);
 line(g,proj(bx,GZ0,0),proj(bx,GZ0,bh),'#9a94a8');line(g,proj(gx,GZ0,GH),proj(bx,GZ0,bh),'#9a94a8');line(g,proj(gx,GZ1,GH),proj(bx,GZ1,bh),'#9a94a8');
 const a=proj(gx,GZ0,0),b=proj(gx,GZ0,GH),c=proj(gx,GZ1,GH);line(g,a,b,P.k,0,3);line(g,{x:a.x+(dd<0?1:0),y:a.y},{x:b.x+(dd<0?1:0),y:b.y},'#f4f4f4',0,2);
 line(g,{x:b.x,y:b.y-1},{x:c.x,y:c.y-1},P.k,0,2);line(g,b,c,'#f4f4f4',0,2);
 if(wall[gx===0?0:1]>0){for(let z=GZ0;z<GZ1;z+=8)for(let y=0;y<GH;y+=5){const q=proj(gx+dd,z,y+5);g.fillStyle=((z/8+y/5)&1)?'#c06040':'#a04830';g.fillRect(Math.round(q.x)-1,Math.round(q.y),3,Math.round(5*YS)-1)}}}
let PB=null;
function drawPitch(g,vw,vh){const tex=pitchTex();if(!PB||PB.width!==vw||PB.height!==vh){PB=X.mk(vw,vh);PB.im=PB.getContext('2d').createImageData(vw,vh);PB.o=new Uint32Array(PB.im.data.buffer)}
 const o=PB.o,out=C32('#2c7a2a');let q=0;
 for(let r=0;r<vh;r++){const z=PH-(r+cam.y-cam.sy-STAND)/ZS;if(z>PH+24){o.fill(0,q,q+vw);q+=vw;continue}const tz=Math.round(z)-TZ0;
  if(tz<0||tz>=TH){o.fill(out,q,q+vw);q+=vw;continue}const k=kz(z),row=tz*TW;let x=cam.x+(-vw/2-cam.sx)/k-TX0;const dx=1/k;
  for(let c=0;c<vw;c++){const tx=x|0;o[q++]=tx>=0&&tx<TW?tex[row+tx]:out;x+=dx}}
 PB.getContext('2d').putImageData(PB.im,0,0);g.drawImage(PB,0,0)}
function camStep(vw,vh){cam.vw=vw;cam.vh=vh;let n=0;
 while(cam.tk<K.tick&&n++<8){cam.tk++;const b=ballView(),s=cel>0&&pl[celBy]?pl[celBy]:null,fx=s?s.x:b.x+(b.vx||0)*18,fz=s?s.z:b.z+(b.vz||0)*10;
  const tx=clamp(fx,-70+vw/2,PW+70-vw/2),ty=clamp(wsy(fz)-(b.y||0)*YS*.4-vh*.52,0,wsy(-44)-vh);cam.x+=(tx-cam.x)*.07;cam.y+=(ty-cam.y)*.07}
 if(cam.tk>K.tick)cam.tk=K.tick;cam.sx=shake>.5?Math.round((Math.random()-.5)*shake):0;cam.sy=shake>.5?Math.round((Math.random()-.5)*shake):0}
let SCR=null;
const meLocal=()=>K.demo?null:K.isClient()?pl[G.me]:pl.find(p=>p.seat>=0&&human(p.seat)&&K.seats[p.seat].ctrl!=='net');
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H),vw=SCR.w,vh=SCR.h-(K.demo?0:9);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);
 if(!pl.length||!ball){SCR.present(ctx,W,H);return}
 camStep(vw,vh);g.save();g.beginPath();g.rect(0,0,vw,vh);g.clip();
 // stand, boards, pitch
 const cr=crowd(),cf=cel>0?((K.tick>>2)&1?2:0):((K.tick>>5)&1),sy0=wsy(PH+24)-cam.y+cam.sy;
 g.drawImage(cr[cf],Math.round(vw/2+(SX0-cam.x)*KST+cam.sx),Math.round(sy0-10-cr[cf].height));
 g.fillStyle='#100c18';g.fillRect(0,Math.round(sy0-10-cr[cf].height)-60,vw,60);
 g.drawImage(boards(),Math.round(vw/2+(SX0-cam.x)*KBD+cam.sx),Math.round(sy0-10));
 drawPitch(g,vw,vh);
 goalBack(g,0);goalBack(g,PW);
 // everything standing on the pitch, far to near
 const L=[];
 for(const p of pl)L.push([p.z,0,p]);
 const b=ballView(),hidden=ball.h>=0&&pl[ball.h]&&pl[ball.h].gk&&!(K.isClient()&&G.hold);if(!hidden)L.push([b.z-.1,1,b]);
 for(const it of items)L.push([it.z,2,it]);
 L.push([GZ0-.5,3,0],[GZ0-.5,3,PW]);
 for(const[fx,fz]of[[0,0],[0,PH],[PW,0],[PW,PH]])L.push([fz,4,{x:fx,z:fz}]);
 for(const q of parts)L.push([q.z,5,q]);
 L.sort((a,c)=>c[0]-a[0]);
 for(const[,ty,o]of L){
  if(ty===0)drawMan(g,o);
  else if(ty===1){const s=proj(o.x,o.z),y=o.y||0;g.globalAlpha=.4;blit(g,SHADOW(6),s.x,s.y,1,.5,.5);g.globalAlpha=1;blit(g,ART_BALL[(Math.floor((ball.spin||0)/3)&3)],s.x,s.y-y*YS+1,1,.5,1)}
  else if(ty===2){const s=proj(o.x,o.z),bob=Math.round(Math.sin(K.tick*.1+o.id)*2);g.globalAlpha=.4;blit(g,SHADOW(8),s.x,s.y,1,.5,.5);g.globalAlpha=1;blit(g,iconSpr(o.k),s.x,s.y-8+bob,1);if((K.tick>>3)&1)px(g,s.x+5,s.y-18+bob,'#ffffff')}
  else if(ty===3)goalFront(g,o);
  else if(ty===4){const s=proj(o.x,o.z),w=(K.tick>>4)&1;g.fillStyle=P.k;g.fillRect(Math.round(s.x)-1,Math.round(s.y)-15,3,15);g.fillStyle='#e8e4dc';g.fillRect(Math.round(s.x),Math.round(s.y)-14,1,14);
   g.fillStyle='#f05050';g.fillRect(Math.round(s.x)+1,Math.round(s.y)-14+w,4,3);g.fillStyle='#fff07c';g.fillRect(Math.round(s.x)+1,Math.round(s.y)-14+w,1,1)}
  else{const s=proj(o.x,o.z,o.y);g.fillStyle=o.col;g.fillRect(Math.round(s.x),Math.round(s.y),1,1)}}
 // markers over the footballers humans are playing, arrows at the edge for the ones off screen
 for(const p of pl){if(!ctrlBy(p))continue;const s=proj(p.x,p.z),mineP=K.isClient()?p.n===G.me:K.seats[p.seat].ctrl!=='net',col=K.seats[p.seat].col||p.col;
  const hy=s.y-(p.gk&&gkBig[p.team]>0?36:26);
  if(s.x<4||s.x>vw-4||hy<2||s.y>vh+2){const ex=clamp(s.x,6,vw-6),ey=clamp(s.y-12,16,vh-6);g.fillStyle=P.k;g.fillRect(Math.round(ex)-3,Math.round(ey)-3,7,7);g.fillStyle=col;g.fillRect(Math.round(ex)-2,Math.round(ey)-2,5,5);continue}
  if(p.ch>8&&ballOwner()===p.n){const pw=Math.min(1,(p.ch-6)/36),bx=Math.round(s.x-8);g.fillStyle=P.k;g.fillRect(bx-1,Math.round(hy)-7,18,4);g.fillStyle='#5c566c';g.fillRect(bx,Math.round(hy)-6,16,2);g.fillStyle=pw>.85?'#f05050':pw>.5?'#ffa040':'#fff07c';g.fillRect(bx,Math.round(hy)-6,Math.round(16*pw),2)}
  arrow(g,s.x,hy,col);
  const many=K.seats.filter((s,i)=>human(i)).length>1;if(many&&!mineP||many&&K.isClient()===false&&K.seats.filter(s=>s.ctrl!=='cpu'&&s.ctrl!=='net').length>1)X.text(g,(K.seats[p.seat].name||'').slice(0,6),s.x,hy-12,{col,align:'center',outline:P.k})}
 for(const t of texts)if(!t.big){const s=proj(t.x,t.z,t.y);if(s.x>-40&&s.x<vw+40)X.text(g,t.s,s.x,s.y-10,{col:t.col,align:'center',outline:P.k})}
 hud(g,vw,vh);g.restore();SCR.present(ctx,W,H);crowdSound()}
function arrow(g,x,y,col){x=Math.round(x);y=Math.round(y);g.fillStyle=P.k;g.fillRect(x-4,y-5,9,1);g.fillRect(x-4,y-4,1,1);g.fillRect(x+4,y-4,1,1);g.fillRect(x-3,y-3,1,1);g.fillRect(x+3,y-3,1,1);g.fillRect(x-2,y-2,1,1);g.fillRect(x+2,y-2,1,1);g.fillRect(x-1,y-1,3,1);g.fillRect(x,y,1,1);
 g.fillStyle=col;g.fillRect(x-3,y-4,7,1);g.fillRect(x-2,y-3,5,1);g.fillRect(x-1,y-2,3,1);g.fillRect(x,y-1,1,1)}
const ART_BALL=ART.ball.map(r=>X.sprite(r));
const iconSpr=k=>cache('ic'+k,()=>X.sprite(ART.icon[ITEMS[k].ic]));
function drawMan(g,p){const s=proj(p.x,p.z),fl=flagsOf(p),big=p.gk&&gkBig[p.team]>0?1.5:1,sc=big*(fl&32?.7:1);
 g.globalAlpha=.35;blit(g,SHADOW(Math.round(12*sc)),s.x,s.y,1,.5,.5);g.globalAlpha=1;
 const ps=poseOf(p);let c=manSpr(p,ps.key,ps.flip);if(ps.rot)c=X.rot(c,ps.rot);
 const lying=ps.key==='down'||ps.key==='slide'||ps.key==='dive',up=ps.key==='dive'?6:0;
 blit(g,c,s.x,s.y+(lying&&ps.key!=='dive'?1:0)-up+(c.pad?c.pad:0),sc,.5,1);
 if(fl&8){g.globalAlpha=.5;blit(g,silh(c,'#a0f0ff'),s.x,s.y-up+(c.pad||0),sc,.5,1);g.globalAlpha=1}
 if(fl&1&&(K.tick>>2)&1)px(g,s.x+(Math.random()*8-4),s.y-1,'#a0f0ff');
 if(fl&2&&ballOwner()===p.n&&(K.tick>>1)&1)px(g,s.x+(Math.random()*6-3),s.y-4-Math.random()*4,'#ffa040')}
const PANEL='#100c18';
function hud(g,W,H){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{}));
 const lim=K.S.len*3600,left=lim?Math.max(0,lim-K.tick):K.tick,sec=Math.ceil(left/60),clock=golden?'GOLDEN GOAL':Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
 // scoreboard
 const n0=K.mode===1?'YOU':TEAMN[0],n1=K.mode===1?'CPU':TEAMN[1],sc=score[0]+'-'+score[1],w=X.tw(n0)+X.tw(sc)+X.tw(n1)+26,x0=4,y0=14;
 g.fillStyle=P.k;g.fillRect(x0,y0,w,11);g.fillStyle='#241c34';g.fillRect(x0+1,y0+1,w-2,9);
 g.fillStyle=TEAMC[0];g.fillRect(x0+2,y0+2,3,7);g.fillStyle=TEAMC[1];g.fillRect(x0+w-5,y0+2,3,7);
 let x=x0+7;X.text(g,n0,x,y0+2,{col:'#ffffff',shadow:false});x+=X.tw(n0)+6;X.text(g,sc,x,y0+2,{col:'#fff07c',shadow:false});x+=X.tw(sc)+6;X.text(g,n1,x,y0+2,{col:'#ffffff',shadow:false});
 TX(clock,x0+2,y0+13,{col:golden||lim&&left<600?'#fff07c':'#a0f0ff'});
 // goal banner
 for(const t of texts)if(t.big){const k=1-t.t/150,bounce=k<.12?Math.round((1-k/.12)*-30):0;if(((t.t>>3)&1)||k<.6)TX(t.big,W/2,Math.round(H*.3)+bounce,{col:t.col,align:'center',scale:4});if(t.s)TX(t.s,W/2,Math.round(H*.3)+34,{col:'#ffffff',align:'center'})}
 if(K.demo){TX('PIXEL KICK',W/2,H-16,{col:'#fff07c',align:'center',scale:2});return}
 // radar
 const rw=64,rh=40,rx=W-rw-4,ry=H-rh-4;g.fillStyle=P.k;g.fillRect(rx-1,ry-1,rw+2,rh+2);g.fillStyle='#2a6a2a';g.fillRect(rx,ry,rw,rh);g.fillStyle='#4a8a4a';g.fillRect(rx+rw/2,ry,1,rh);
 g.fillStyle='#6aa86a';g.fillRect(rx,ry+Math.round(rh*(1-GZ1/PH)),1,Math.round(rh*(GZ1-GZ0)/PH));g.fillRect(rx+rw-1,ry+Math.round(rh*(1-GZ1/PH)),1,Math.round(rh*(GZ1-GZ0)/PH));
 for(const p of pl){const xx=Math.round(rx+clamp(p.x/PW,0,1)*(rw-2)),yy=Math.round(ry+clamp(1-p.z/PH,0,1)*(rh-2));if(ctrlBy(p)){g.fillStyle=P.k;g.fillRect(xx-1,yy-1,4,4);g.fillStyle=(K.tick>>3)&1?'#ffffff':K.seats[p.seat].col}else g.fillStyle=p.gk?GKC[p.team]:TEAMC[p.team];g.fillRect(xx,yy,2,2)}
 const bv=ballView();g.fillStyle='#ffffff';g.fillRect(Math.round(rx+clamp(bv.x/PW,0,1)*(rw-1)),Math.round(ry+clamp(1-bv.z/PH,0,1)*(rh-1)),2,2);
 const me=meLocal();if(!me)return;
 // stamina and power-ups of your footballer
 const f=me.fx,chips=[];if(f.boots>0)chips.push([1,f.boots/600]);if(f.fire)chips.push([2,1]);if(f.banana)chips.push([3,1]);if(f.mag>0)chips.push([4,f.mag/600]);if(f.tiny>0)chips.push([8,f.tiny/480]);if(f.frz>0)chips.push([6,f.frz/130]);
 chips.forEach(([k,v],n)=>{const y=H-34-n*15;g.drawImage(iconSpr(k),4,y);g.fillStyle=P.k;g.fillRect(17,y+5,26,4);g.fillStyle=ITEMS[k].c;g.fillRect(18,y+6,Math.round(24*v),2)});
 g.fillStyle=P.k;g.fillRect(4,H-10,34,5);g.fillStyle='#5c566c';g.fillRect(5,H-9,32,3);g.fillStyle=me.stam>.3?'#88dc48':'#f05050';g.fillRect(5,H-9,Math.round(32*me.stam),3);TX('RUN',40,H-11,{col:'#9a94a8'});
 // hints for the first seconds
 const t=K.tick,touch=K.seats[me.seat]&&K.seats[me.seat].ctrl==='touch';
 if(t<60*7)TX(touch?'TAP: PASS  HOLD: SHOOT':'SPACE: PASS  HOLD SPACE: SHOOT',W/2,30,{col:'#ffffff',align:'center'});
 else if(t<60*13&&!touch)TX('E: LOB  Q: SLIDE  SHIFT: SPRINT',W/2,30,{col:'#ffffff',align:'center'});
 else if(K.S.ctrl!=='fixed'&&t<60*18)TX('YOU PLAY THE MAN NEAREST THE BALL',W/2,30,{col:'#a0f0ff',align:'center'})}
// crowd noise that swells as the ball nears a goal
let amb=null;
function crowdSound(){const AC=RA.audio.ctx;if(!AC)return;const on=!K.demo&&K.state==='play'&&!(RA.menu.current&&RA.menu.current.id!=='kick');
 if(!amb&&on){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=RA.audio.noise;s.loop=true;f.type='bandpass';f.frequency.value=900;f.Q.value=.5;g.gain.value=0;s.connect(f);f.connect(g);g.connect(AC.destination);s.start();amb={g}}
 if(!amb)return;const V=RA.audio.vol,b=ballView(),near=1-Math.min(1,Math.min(Math.abs(b.x),Math.abs(PW-b.x))/260),vol=!on||V.mute?0:(.012+.03*near*near+(cel>0?.03:0))*V.master/100*V.sfx/100;
 amb.g.gain.setTargetAtTime(vol,AC.currentTime,.3)}
K=RA.kit({id:'kick',name:'PIXEL KICK',kind:'Football',players:'1-20 players',demo:8,localFirst:true,baseH:180,
 desc:'16-bit style arcade football for up to 10 a side: pass, charge shots, cross for headers, slide in, and watch the keepers dive. Auto-switch puts you on the man nearest the ball. Red vs blue, or all of you against a CPU team.',
 blurb:'WASD runs, Shift sprints. Tap Space to pass, hold to shoot (W / S aim), E lobs and crosses, Q slides in. You always play the man nearest the ball.',
 howto:'WASD run, Shift sprint. Ball: tap Space / click = pass, hold = shot (hold W or S to aim far / near post), E = lob / cross, Q = dribble burst. No ball: Space = tackle, Q = slide, E = call for a pass. Touch: tap = pass / tackle, hold = shoot.',
 icon:['..kkkkkk..','.kwwkkwwk.','kwwwkkwwwk','kkwwwwwwkk','kkkwwwwkkk','kwwwkkwwwk','kwwkkkkwwk','kwwwkkwwwk','.kwwwwwwk.','..kkkkkk..'],
 music:MUSIC,fireLabel:'KICK',
 modes:[['MATCH','Red vs blue: humans are split between the teams.'],['CO-OP','All of you on one team against the CPU.']],
 settings:[['len','Match length',[[3,'3 min'],[2,'2 min'],[5,'5 min'],[8,'8 min']]],['size','Team size',[['auto','Auto'],[3,'3 a side'],[5,'5 a side'],[7,'7 a side'],[10,'10 a side']]],
  ['ctrl','Control',[['switch','Auto-switch'],['fixed','One player each']]],
  ['walls','Boards',[['on','Arcade boards'],['off','Throw-ins']]],['items','Power-ups',[['on','On'],['party','Wild party'],['off','Off']]],['gold','If drawn',[['on','Golden goal'],['off','Draw']]]],
 kb:[['W A S D','run'],['SHIFT','sprint'],['SPACE LMB','pass / shoot'],['E','lob / call'],['Q','slide / burst'],['C','chat'],['ESC','menu']],pad:[['LS','run'],['A','pass / shoot'],['B','lob / call'],['X','slide'],['Y','sprint'],['START','menu']],
 ach:[{id:'first',name:'Debut',desc:'Play your first match',test:s=>s.played>=1,unlock:'title:Debutant'},{id:'win1',name:'Three Points',desc:'Win a match',test:(s,m)=>m.won,unlock:'title:Winner'},
  {id:'hat',name:'Hat-trick',desc:'Score 3 goals in one match',test:(s,m)=>m.kills>=3,unlock:'title:Hat-trick Hero'},{id:'g25',name:'Golden Boot',desc:'Score 25 goals in total',test:s=>s.kills>=25,unlock:'title:Golden Boot'},
  {id:'cs',name:'Clean Sheet',desc:'Win without conceding',test:(s,m)=>m.won&&m.cs,unlock:'title:The Wall'}],
 start,step,local,upload,follow,snap,apply,render,bot,onFx,aim,teamOf:i=>K.mode===1?0:i%2,
 info:()=>score[0]+' - '+score[1],
 ranks:()=>{const w=score[0]>score[1]?0:score[1]>score[0]?1:-1,tm=i=>K.mode===1?0:i%2,gl=i=>K.S.ctrl==='fixed'||!human(i)?((pl[seatP[i]]||{}).goals|0):seatGoals[i]|0;
  return K.seats.map((s,i)=>({s,i})).sort((a,b)=>(tm(b.i)===w)-(tm(a.i)===w)||gl(b.i)-gl(a.i)).map(({s,i})=>[s.name,TEAMC[tm(i)],gl(i)+' goal'+(gl(i)===1?'':'s')+' · '+(K.mode===1?(tm(i)===0?'you':'CPU'):TEAMN[tm(i)])])},
 result:(i,w)=>{const t=K.mode===1?0:i%2,won=score[t]>score[1-t],gl=K.S.ctrl==='fixed'||!human(i)?((pl[seatP[i]]||{}).goals|0):seatGoals[i]|0;return{won,kills:gl,cs:won&&score[1-t]===0?1:0}}});
window.__pk={get pl(){return pl},get ball(){return ball},K,get score(){return score},bot:i=>bot(i),get seatP(){return seatP}};

})();
