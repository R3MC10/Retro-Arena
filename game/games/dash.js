/* SUPER DASH BROS for Retro Arena: a platform race for up to 20 in 8-bit pixel art, after Super Mario Bros.
   The original it follows: momentum running (you speed up the longer you run, you skid when you turn), jumps that go
   higher the longer you hold the button, stomping enemies, kicking shells, ? blocks with power-ups (MUSHROOM makes you big,
   big heroes smash bricks, FLOWER throws fireballs, STAR makes you untouchable), pits, pipes and the flagpole at the end.
   The 20-player twist: everyone races the same course at once. Land on a rival's head to flatten them for a moment;
   kicked shells hit everybody. ? blocks and coins are your own (everyone finds them full), every 10 coins gives a dash,
   and the back of the pack gets stars more often. Falling in a pit puts you back at the last checkpoint flag.
   Local players share one camera (stragglers are carried forward in a bubble); online, everyone has their own.
   First seconds: hints show A / D run, Space / W jump (hold for higher), E / Shift fireball, S crouch.
   Online is lag-free (RA.kit localFirst): your hero, your blocks, coins and power-ups live on your device; the host runs
   the enemies, shells and smashed bricks and hands out finishing places.
   The sprites are painted in tools/art/dash (python), exported as ART below; edit dash_tpl.js there and run build.sh. */
(()=>{
const X=RA.pix,P=X.PAL;
const ART={"hero": {"s_stand": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...kkSssSSSk....", "...k11u222kk....", "..kw12uuu22wk...", "..kwwuuyuyuwwk..", "...kkuuuuuukk...", "....kuukkuuk....", "...knnnkknnnk...", "..knnnnkknnnnk..", "...kkkk..kkkk..."], "s_run1": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...kkSssSSSk....", "...k11u222k.....", "..kw12uuu2wk....", "...kwuuyuyuwk...", "....kuuuuuuk....", "...kuukkkkuuk...", "..knnnk..knnnk..", ".knnnk....knnnk.", "..kkk......kkk.."], "s_run2": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...kkSssSSSk....", "...k11u222k.....", "...k12uuu2wk....", "...kwuuyuywk....", "....kuuuuuuk....", "....kuuuukk.....", "....knnnnnk.....", "...knnnnkk......", "....kkkk........"], "s_run3": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...kkSssSSSk....", "...k11u222kk....", "...k12uuu22wk...", "..kwwuuyuyuwk...", "...kkuuuuuuk....", "....kuukuukk....", "...knnnkknnnk...", "..knnnk..knnnk..", "...kkk....kkk..."], "s_jump": ["...........kk...", ".....kkkkkkwwk..", "....k111111wwk..", "...k12222222wk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...kkSssSSSk....", "..kw11u2222k....", "..kw12uuu2k.....", "...kkuuyuyuk....", "....kuuuuuuk....", "...kuukkkuukkk..", "..knnnk..knnnnk.", "...kkk..knnnkk..", ".........kkk...."], "s_skid": [".....kkkkkk.....", "....k111111k....", "...k12222222k...", "..k3332222222k..", "...kkSkssshhk...", "...kSssssshhk...", "...kssssssshhk..", "....kSSSssSkk...", "....k222u11kk...", "...kw22uuu21wk..", "..kwwuuyuyuwwk..", "...kkuuuuuukk...", "....kuukkuukk...", "...knnnk.knnnk..", "...knnnnknnnnk..", "....kkkk.kkkk..."], "s_die": [".....kkkkkk.....", "....k111111k....", "...k12222222k...", "...k22222222k...", "...khsksskshhk..", "..khssSSSSsshk..", "..khhsssssshk...", ".k.kkSssSSSk.k..", "kwkk11u2222kkwk.", "kww12uuuu22kwwk.", ".kwkuuyuyuukwk..", "..k.kuuuuuukk...", "....kuukkuuk....", "...knnnkknnnk...", "....kkk..kkk....", "................"], "s_climb": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkwk.", "..khsSsssssSkwwk", "..khhssssssskwk.", "...kkSssSSSkkwk.", "...k11u222kkwk..", "...k12uuu22wk...", "....kuuyuyuk....", "....kuuuuuuk....", "....kuukkuuk....", "...knnnkknnnkk..", "....kkk..kknnnk.", "...........kkk.."], "s_win": ["...k........k...", "..kwkkkkkkkkwk..", "..kwk111111kwk..", "..kw12222222wk..", "..kw2222222333k.", "..kwhhssskSkwk..", "..khsSsssssSwk..", "..khhsssssssk...", "...kkSssSSSk....", "...k11u222k.....", "...k12uuu22k....", "....kuuyuyuk....", "....kuuuuuuk....", "....kuukkuuk....", "...knnnkknnnk...", "..knnnnkknnnnk..", "...kkkk..kkkk..."], "b_stand": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...khhsSSSSsk...", "....kSssSSSk....", "...k11u2222k....", "..k112uuu222k...", "..k1122uu2222k..", ".kw122uyuyu22wk.", ".kww2uuuuuuu2wwk", "..kwuuuuuuuuuwk.", "...kuuuuuuuukk..", "...kuuuukuuuuk..", "...kuuukkuuuk...", "...kuuukkuuuk...", "..knnnnkknnnnk..", ".knnnnnkknnnnnk.", "..kkkkk..kkkkk.."], "b_run1": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...khhsSSSSsk...", "....kSssSSSk....", "...k11u2222k....", "..k112uuu222k...", "..k1122uu22wk...", "..k1w2uyuyuwwk..", "..kwwuuuuuuuk...", "...kuuuuuuuuk...", "...kuuuuuuuuk...", "..kuuuukkuuuuk..", ".kuuukk..kkuuuk.", ".kuuk......kuuk.", "knnnk......knnnk", "knnnk......knnnk", ".kkk........kkk."], "b_run2": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...khhsSSSSsk...", "....kSssSSSk....", "...k11u2222k....", "..k112uuu222k...", "..k1122uu222k...", "...k12uyuyuwk...", "...kwuuuuuuwk...", "...kuuuuuuuuk...", "...kuuuuuuuk....", "....kuuuuuuk....", "....kuuuuuk.....", "....kuuuuuk.....", "....knnnnnnk....", "...knnnnnnk.....", "....kkkkkk......"], "b_run3": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...khhsSSSSsk...", "....kSssSSSk....", "...k11u2222k....", "..k112uuu222k...", ".kw1122uu2222k..", ".kww22uyuyu2wk..", "..kk2uuuuuuuwwk.", "...kuuuuuuuukk..", "...kuuuuuuuuk...", "...kuuukkuuuk...", "..kuuuk..kuuuk..", "..kuuk....kuuk..", ".knnnk....knnnk.", ".knnnnk..knnnnk.", "..kkkk....kkkk.."], "b_jump": ["...........kk...", ".....kkkkkkwwk..", "....k111111wwk..", "...k12222222wk..", "...k2222222333k.", "...khhssskSkwk..", "..khsSsssssSwk..", "..khhsssssssk...", "...khhsSSSSsk...", "...kkSssSSSk....", "..kw11u2222k....", "..kw12uuu222k...", "...k122uu222k...", "...k12uyuyuk....", "....kuuuuuuuk...", "...kuuuuuuuuk...", "...kuuuuuuuuk...", "..kuuuukkuuuuk..", "..kuuuk..kuuuuk.", "..knnnk...knnnnk", "...kkk....knnnnk", "...........kkkk."], "b_skid": [".....kkkkkk.....", "....k333333k....", "..kk22222223k...", ".k1112222222k...", "..kkkSkssshhk...", "...kSsssssSshk..", "...kssssssshhk..", "...ksSSSSshhk...", "....kSSSssSk....", "....k2222u33k...", "...k222uuu233k..", "..k2222uu2233k..", ".kw22uyuyu223wk.", "kww2uuuuuuu2wwk.", ".kwuuuuuuuuuwk..", "..kkuuuuuuuuk...", "..kuuuukuuuuk...", "...kuuukkuuuk...", "...kuuukkuuuk...", "..knnnnkknnnnk..", ".knnnnnkknnnnnk.", "..kkkkk..kkkkk.."], "b_crouch": ["................", "................", "................", "................", "................", "................", "................", "................", ".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...khhsSSSSsk...", "..kkkSssSSSk....", ".kw11u22222wk...", ".kww2uuyuyuwwk..", "..kuuuuuuuuuuk..", "..knnnnkknnnnk..", "...kkkk..kkkk..."], "b_climb": [".....kkkkkk.....", "....k111111k....", "...k12222222kk..", "...k2222222333k.", "...khhssskSkkk..", "..khsSsssssSk...", "..khhsssssssk...", "...khhsSSSSsk...", "....kSssSSSkk...", "...k11u2222kwk..", "..k112uuu222wk..", "..k1122uu222wk..", "..k122uyuyukk...", "...k2uuuuuuuk...", "...kuuuuuuuuk...", "...kuuuuuuuuk...", "...kuuuukuuuuk..", "...kuuukkuuuk...", "...kuuukkuuuk...", "..knnnnkknnnnk..", ".knnnnnkknnnnnk.", "..kkkkk..kkkkk.."], "b_win": ["..k..........k..", ".kwk.kkkkkk.kwk.", ".kwkk111111kkwk.", ".kwk12222222kwk.", ".kwk2222222333k.", ".kwkhhssskSkwk..", "..khsSsssssSwk..", "..khhsssssssk...", "...khhsSSSSsk...", "....kSssSSSk....", "...k11u2222k....", "..k112uuu222k...", "..k1122uu2222k..", "...k22uyuyu22k..", "...kuuuuuuuuk...", "...kuuuuuuuuk...", "...kuuuuuuuuk...", "...kuuuukuuuuk..", "...kuuukkuuuk...", "...kuuukkuuuk...", "..knnnnkknnnnk..", ".knnnnnkknnnnnk.", "..kkkkk..kkkkk.."]}, "tile": {"top": ["QQQQQQQQQQQQQQQQ", "QQqQQQQQQqQQQQQq", "qqaqqqQqqaqqqQqa", "aaaaAaaqaaaaaAaa", "aAaaaaaaaaaAaaaa", "aaaaaaZaaaaaaaaZ", "aaZaaaaaaaZaaaaa", "aaaaaaaaAaaaaaaa", "aaaAaaaaaaaaaZaa", "aZaaaaaZaaaaaaaa", "aaaaaaaaaaAaaaaa", "aaaaZaaaaaaaaaaa", "aAaaaaaaaZaaaaAa", "aaaaaaAaaaaaaaaa", "aaaaaaaaaaaaZaaa", "ZaaaaZaaaaaaaaaa"], "dirt": ["aaaaAaaaaaaaaAaa", "aAaaaaaaaaaAaaaa", "aaaaaaZaaaaaaaaZ", "aaZaaaaaaaZaaaaa", "aaaaaaaaAaaaaaaa", "aaaAaaaaaaaaaZaa", "aZaaaaaZaaaaaaaa", "aaaaaaaaaaAaaaaa", "aaaaZaaaaaaaaaaa", "aAaaaaaaaZaaaaAa", "aaaaaaAaaaaaaaaa", "aaaaaaaaaaaaZaaa", "ZaaaaZaaaaaaaaaa", "aaaaAaaqaaaaaAaa", "aAaaaaaaaaaAaaaa", "aaaaaaZaaaaaaaaZ"], "brick": ["FFFFFFFxFFFFFFFx", "FffffffxFffffffx", "FffffffxFffffffx", "xxxxxxxxxxxxxxxx", "FFFxFFFFFFFxFFFF", "fffxFffffffxFfff", "fffxFffffffxFfff", "xxxxxxxxxxxxxxxx", "FFFFFFFxFFFFFFFx", "FffffffxFffffffx", "FffffffxFffffffx", "xxxxxxxxxxxxxxxx", "FFFxFFFFFFFxFFFF", "fffxFffffffxFfff", "fffxFffffffxFfff", "xxxxxxxxxxxxxxxx"], "hard": ["AAAAAAAAAAAAAAAZ", "AaaaaaaaaaaaaaZZ", "AaaaaaaaaaaaaZaZ", "AaaAAAAAAAAAZaaZ", "AaaAaaaaaaaaZaaZ", "AaaAaaaaaaaaZaaZ", "AaaAaaaaaaaaZaaZ", "AaaAaaaaaaaaZaaZ", "AaaAaaaaaaaaZaaZ", "AaaAaaaaaaaaZaaZ", "AaaAaaaaaaaaZaaZ", "AaaAZZZZZZZZZaaZ", "AaaZaaaaaaaaaaaZ", "AaZaaaaaaaaaaaaZ", "AZaaaaaaaaaaaaaZ", "ZZZZZZZZZZZZZZZZ"], "q1": ["kkkkkkkkkkkkkkkk", "kJJJJJJJJJJJJJJk", "kJkJJJJJJJJJJkjk", "kJJJJIIIIIJJJJjk", "kJJJIIjjjIIJJJjk", "kJJJIIjJJIIjJJjk", "kJJJJjjJIIIjJJjk", "kJJJJJJIIIjjJJjk", "kJJJJJJIIjjJJJjk", "kJJJJJJJjjJJJJjk", "kJJJJJJIIJJJJJjk", "kJJJJJJIIjJJJJjk", "kJkJJJJJjjJJJkjk", "kJJJJJJJJJJJJJjk", "kjjjjjjjjjjjjjjk", "kkkkkkkkkkkkkkkk"], "q2": ["kkkkkkkkkkkkkkkk", "kJJJJJJJJJJJJJJk", "kJkJJJJJJJJJJkjk", "kJJJJWWWWWJJJJjk", "kJJJWWjjjWWJJJjk", "kJJJWWjJJWWjJJjk", "kJJJJjjJWWWjJJjk", "kJJJJJJWWWjjJJjk", "kJJJJJJWWjjJJJjk", "kJJJJJJJjjJJJJjk", "kJJJJJJWWJJJJJjk", "kJJJJJJWWjJJJJjk", "kJkJJJJJjjJJJkjk", "kJJJJJJJJJJJJJjk", "kjjjjjjjjjjjjjjk", "kkkkkkkkkkkkkkkk"], "q3": ["kkkkkkkkkkkkkkkk", "kJJJJJJJJJJJJJJk", "kJkJJJJJJJJJJkjk", "kJJJJOOOOOJJJJjk", "kJJJOOjjjOOJJJjk", "kJJJOOjJJOOjJJjk", "kJJJJjjJOOOjJJjk", "kJJJJJJOOOjjJJjk", "kJJJJJJOOjjJJJjk", "kJJJJJJJjjJJJJjk", "kJJJJJJOOJJJJJjk", "kJJJJJJOOjJJJJjk", "kJkJJJJJjjJJJkjk", "kJJJJJJJJJJJJJjk", "kjjjjjjjjjjjjjjk", "kkkkkkkkkkkkkkkk"], "used": ["kkkkkkkkkkkkkkkk", "kNNNNNNNNNNNNNNk", "kNkNNNNNNNNNNkDk", "kNNNNNNNNNNNNNDk", "kNNNNNNNNNNNNNDk", "kNNNNNNNNNNNNNDk", "kNNNNNNNNNNNNNDk", "kNNNNNNNNNNNNNDk", "kNNNNNNNNNNNNNDk", "kNNNNNNNNNNNNNDk", "kNNNNNNNNNNNNNDk", "kNNNNNNNNNNNNNDk", "kNkNNNNNNNNNNkDk", "kNNNNNNNNNNNNNDk", "kDDDDDDDDDDDDDDk", "kkkkkkkkkkkkkkkk"], "pipeTL": ["kkkkkkkkkkkkkkkk", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLWLlllllllllll", "kLLlllllllllllll", "kkkkkkkkkkkkkkkk"], "pipeTR": ["kkkkkkkkkkkkkkkk", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "lllllllleleeeeek", "kkkkkkkkkkkkkkkk"], "pipeBL": ["..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll", "..kLLWLlllllllll"], "pipeBR": ["lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek..", "lllllllleleeek.."]}, "coin": [["....kkkk....", "...kyyyyk...", "..kyYYYYyk..", ".kyYYyyYYyk.", ".kyYYyyYYyk.", ".kyYYyyYYyk.", ".kyYYyyYYyk.", ".kyYYyyYYyk.", ".kyYYyyYYyk.", "..kyYYYYyk..", "...kyyyyk...", "....kkkk...."], ["....kkk.....", "...kyyyk....", "..kyYYYyk...", "..kyYyYyk...", "..kyYyYyk...", "..kyYyYyk...", "..kyYyYyk...", "..kyYyYyk...", "..kyYyYyk...", "..kyYYYyk...", "...kyyyk....", "....kkk....."], [".....kk.....", "....kyyk....", "....kyyk....", "....kYyk....", "....kYyk....", "....kYyk....", "....kYyk....", "....kYyk....", "....kYyk....", "....kyyk....", "....kyyk....", ".....kk....."], [".....kkk....", "....kyyyk...", "...kyYYYyk..", "...kyYyYyk..", "...kyYyYyk..", "...kyYyYyk..", "...kyYyYyk..", "...kyYyYyk..", "...kyYyYyk..", "...kyYYYyk..", "....kyyyk...", ".....kkk...."]], "mush": [".....kkkkkk.....", "...kkRRRRRRkk...", "..kRRwwRRRRRRk..", ".kRRwwwwRRwwRRk.", ".kRRwwRRRRwwwRk.", "kRRRRRRRRRRwwRRk", "kRwwRRRRRRRRRRRk", "kRwwwRRwwRRRRRRk", ".kRRRRwwwRRRRRk.", "..kssskssksssk..", "..ksssksskssSk..", "..kssssssssSSk..", "...ksSSSSSSSk...", "....kkkkkkkk...."], "flower": [".....kkkkkk.....", "...kkRRRRRRkk...", "..kRROOOOOORRk..", ".kRROYYYYYYORRk.", ".kROYYkYYkYYORk.", ".kRROYYYYYYORRk.", "..kRROOOOOORRk..", "...kkRRRRRRkk...", "..kkkkkLLkkkkk..", ".kLLLkkLLkkLLLk.", "..kLLLkLLkLLLk..", "...kLLLLLLLLk...", "....kkkLLkkk....", ".......kk......."], "star": [".......k........", "......kYk.......", "......kYYk......", ".kkkkkYYYYkkkk..", "kYYYYYYYYYYYYYk.", ".kYYYkYYkYYYYk..", "..kYYkYYkYYYk...", "...kYYYYYYYk....", "...kYYYYYYYYk...", "..kYYYYkkYYYYk..", "..kYYYk..kYYYk..", ".kYYkk....kkYYk.", "..kk........kk.."], "grump": [[".......kk.......", ".....kkelkk.....", "...kkmmeMmmkk...", "..kmMmMmMmMmmk..", ".kmMmMmMmMmMmmk.", "knNwkNNNNNNkwNnk", "knNwwkNNNNkwwNnk", "knNNwwNNNNwwNNnk", "knNNNkkkkkkNNNnk", ".knnNNNNNNNNnnk.", "..kkTTTTTTTTkk..", "..kmmTTTTTTk....", ".kmmmmkkmmmmk...", "..kkkk..kkkk...."], [".......kk.......", ".....kklekk.....", "...kkmmMemmkk...", "..kmmMmMmMmMmk..", ".kmmMmMmMmMmMmk.", "knNwkNNNNNNkwNnk", "knNwwkNNNNkwwNnk", "knNNwwNNNNwwNNnk", "knNNNkkkkkkNNNnk", ".knnNNNNNNNNnnk.", "..kkTTTTTTTTkk..", "....kTTTTTTmmk..", "...kmmmmkkmmmmk.", "....kkkk..kkkk.."]], "flat": ["..kkkkkkkkkkkk..", ".kmMmMmMmMmMmmk.", "knNwkNNNNNNkwNnk", ".knnNNNNNNNNnnk.", ".kmmmTTTTTTmmmk.", "..kkkkkkkkkkkk.."], "beetle": [[".......kkkk.....", "......kLLLLk....", ".....kLllllLk...", "....kLlLLLLlLk..", "...kLlLLllLLlLk.", "...kLlLllllLlLk.", "...kLlLLllLLlLk.", "..ksLlllllllllk.", ".ksksLLLLLLLLLk.", ".kssssyyyyyyyk..", "..kssskyykkyyk..", "...kssksskkssk..", "....kkkssk.kssk.", ".......kk...kk.."], [".......kkkk.....", "......kLLLLk....", ".....kLllllLk...", "....kLlLLLLlLk..", "...kLlLLllLLlLk.", "...kLlLLllLLlLk.", "...kLlLllllLlLk.", "..ksLlllllllllk.", ".ksksLLLLLLLLLk.", ".kssssyyyyyyyk..", "..kssskkyykyyk..", "...ksskksskssk..", "....kkksskssk...", ".......kk.kk...."]], "shell": [".....kkkkkk.....", "...kkLLLLLLk....", "..kLLlllllLLk...", ".kLlLLLLLLLlLk..", ".kLlLlllllLlLk..", ".kLlLLLLLLLlLk..", "kLLllllllllllLk.", "kLwwwwwwwwwwwwLk", ".kyyyyyyyyyyyyk.", "..kkkkkkkkkkkk.."], "flag": [".kkkkkkkkkkkk.", "kkkkkkkkkkkkkk", "kWWWWWWWWWWWkk", ".kWWLLLLWWWWkk", "..kWWLLWWWWWkk", "...kWWWWWWWWkk", "....kWWWWWWWkk", ".....kWWWWWWkk", "......kWWWWWkk", ".......kWWWWkk", "........kkkkkk", ".........kkkk."], "cloud": ["..........WWWW..........", "......WWWWWWWWWW........", "....WWWWWWWWWWWWWW......", "..WWWWWWWWWWWWWWWWWWW...", ".WWWWWWWWWWWWWWWWWWWWWW.", "WWWWWWWWWWWWWWWWWWWWWWWW", "WWWWWWWWWWWWWWWWWWWWWWWW", "CWWWWWWWWWWWWWWWWWWWWWWC", ".CCWWWWWWWWWWWWWWWWWWCC.", "...CCCCCCCCCCCCCCCCCC..."], "bush": ["........LLLL............", "......LLLLLLL...LLLL....", "....LLLLlLLLLLLLLLLLLL..", "..LLLLlllLLLLLLlLLLLLLL.", ".LLLLlllllLLLLlllLLLLLLL", "LLLlllllllllllllllLLLLLl", "LlllllllllllllllllllllLl", "llllllllllllllllllllllll"], "hill": ["..........eeee..........", ".........eLLLLe.........", "........eLLLLLLe........", ".......eLLkLLkLLe.......", "......eLLLLLLLLLLe......", ".....eLLLLLLLLLLLLe.....", "....eLLLLLLLLLkLLLLe....", "...eLLLLLkLLLLLLLLLLe...", "..eLLLLLLLLLLLLLLLLLLe..", ".eLLLLLLLLLLLLLLLLLLLLe.", "eLLLLLLLLLLLLLLLLLLLLLLe"]};
const TM=RA.music.track,sfx=RA.audio.sfx;
const TS=16,LH=12,CD=150,TEAMC=['#e83838','#2c78f0'],TEAMN=['Red team','Blue team'];
// hero physics, px per step at 60 Hz
const WALK=1.5,RUN=2.6,DASH=3.3,ACC=.07,ACCR=.035,FRIC=.1,SKID=.22,AIRA=.06,JV=5,JVR=.5,GH=.2,GF=.55,FALL=5;
RA.audio.add('jump',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(330,now);o.frequency.exponentialRampToValueAtTime(880,now+.12);g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.16);o.connect(g);o.start(now);o.stop(now+.17)});
RA.audio.add('coin',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(988,now);o.frequency.setValueAtTime(1319,now+.06);g.gain.setValueAtTime(.05,now);g.gain.exponentialRampToValueAtTime(.001,now+.3);o.connect(g);o.start(now);o.stop(now+.31)});
RA.audio.add('stomp',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(600,now);o.frequency.exponentialRampToValueAtTime(150,now+.08);g.gain.setValueAtTime(.08,now);g.gain.exponentialRampToValueAtTime(.001,now+.1);o.connect(g);o.start(now);o.stop(now+.11)});
RA.audio.add('bump',(AC,now,g)=>{const o=AC.createOscillator();o.type='triangle';o.frequency.setValueAtTime(180,now);o.frequency.exponentialRampToValueAtTime(90,now+.08);g.gain.setValueAtTime(.12,now);g.gain.exponentialRampToValueAtTime(.001,now+.1);o.connect(g);o.start(now);o.stop(now+.11)});
RA.audio.add('power',(AC,now,g)=>{[523,659,784,1047,1319].forEach((f,k)=>{const o=AC.createOscillator(),q=AC.createGain();o.type='square';o.frequency.value=f;q.gain.setValueAtTime(0,now+k*.05);q.gain.linearRampToValueAtTime(.05,now+k*.05+.01);q.gain.exponentialRampToValueAtTime(.001,now+k*.05+.09);o.connect(q);q.connect(g);o.start(now+k*.05);o.stop(now+k*.05+.1)});g.gain.value=1});
RA.audio.add('die',(AC,now,g)=>{const o=AC.createOscillator();o.type='square';o.frequency.setValueAtTime(700,now);o.frequency.exponentialRampToValueAtTime(120,now+.6);g.gain.setValueAtTime(.06,now);g.gain.exponentialRampToValueAtTime(.001,now+.65);o.connect(g);o.start(now);o.stop(now+.66)});
const MUSIC=[TM('Overworld Dash',150,['C','F','G','C'],'k.s.k.s.k.s.k.ss','e5 e5 . e5 . c5 e5 . g5 . . . g4 . . . c5 . . g4 . . e4 . . a4 . b4 . a#4 a4 .'),
 TM('Pipe Cave',112,['Am','Dm','E','Am'],'k...s...k.k.s...','a4 . c5 . e5 . a5 . g5 . e5 . d5 . e5 . a4 . c5 . e5 . g#5 . a5 - - - - - - .'),
 TM('Dusk Run',138,['F','C','Dm','Bb'],'k.hsk.hsk.hsk.hs','f5 a5 c6 a5 g5 e5 c5 e5 f5 a5 d6 a5 bb5 g5 f5 d5 c5 e5 g5 c6 a5 f5 c5 a4 bb4 d5 f5 bb5 a5 . . .'),
 TM('Flag In Sight',168,['G','D','Em','C'],'kshskshskshskshs','g5 b5 d6 b5 a5 f#5 d5 f#5 e5 g5 b5 g5 c6 e6 g6 e6 d6 b5 g5 d5 a5 f#5 d5 a4 b4 d5 g5 b5 a5 . . .')];
const THEMES={
 over:{sky:['#5c94fc'],tile:{Q:'#88dc48',q:'#38a038',A:'#e8a070',a:'#c06838',Z:'#6c3018',F:'#d07040',f:'#a84c28',x:'#3c1c10',J:'#f0b030',j:'#a8641c',I:'#ffffff'},scen:1,mus:0},
 under:{sky:['#0c0818'],tile:{Q:'#80b0ff',q:'#3068d0',A:'#6890c8',a:'#2c4c88',Z:'#142870',F:'#4a78c8',f:'#2c4c88',x:'#0c1028',J:'#f0b030',j:'#a8641c',I:'#ffffff'},scen:0,mus:1,roof:1},
 dusk:{sky:['#f8b060','#f08858','#d86070','#a04878'],tile:{Q:'#6cc058',q:'#2a6a38',A:'#d89060',a:'#9c5030',Z:'#5a2414',F:'#c06040',f:'#8c3c24',x:'#2c1008',J:'#f0b030',j:'#a8641c',I:'#ffffff'},scen:1,mus:2}};

/* ---------- the course: hand-made chunks strung together by the seed ---------- */
// rows top to bottom; # ground, B brick, ? coin block, M power-up block, H hard block, [ ] pipe top, { } pipe body,
// o coin, g acorn grump, k shell beetle, ! checkpoint flag. Ground is rows 10-11 (feet at y=160).
const CH={
 start:["................","................","................","................","................","................","................","................","................","................","################","################"],
 blocks:["................","................","................","................","................","................","....B?BMB.......","................","................","..........g.....","################","################"],
 pit2:["................","................","................","................","................",".......ooo......","................","................","................","................","######...#######","######...#######"],
 pipes:["....................","....................","....................","....................","....................","....................","....................","..........[]...[]...","....[]....{}...{}...","....{}.g..{}.g.{}...","####################","####################"],
 stairs:["................","................","................","................","................","......oo........","....H....H......","...HH....HH.....","..HHH....HHH....",".HHHH....HHHH...","#####....#######","#####....#######"],
 high:["....................","....................","..o.o.o.............","....................","..BBBBBBB...........","....................","................?...","..........BB?BB.....","....................","...g....g......k....","####################","####################"],
 float:["....................","....................","....................","....................","....................","....................","....ooo.....ooo.....","....................","...HHH.....HHH.....H","....................","##................##","##................##"],
 beetles:["..................","..................","..................","..................","..................","...?.......M......","..................","..................","..................","......k.....g.g...","##################","##################"],
 steps:["..................","..................","..................","..................","......ooo.........","..................","..................","......HHH.....HH..","..............HH..",".............HHH..","###...####...#####","###...####...#####"],
 bricks:["......................","......................","......................","....o..o..o..o........","......................","...BBBMBBBB?BBB.......","......................","......................","...........BBBB.......","....g..g.........k....","######################","######################"],
 tunnel:["..................","..................","..................","..................","..................","..................",".BBBBBBBBBBBBBBBB.","..................","..o.o.o.o.o.o.o...","........g.........","##################","##################"],
 check:["............","............","............","............","............","............","............","............","............",".....!......","############","############"],
 end:["..............................","..............................","..............................","..............................","..............................","..............................","..........H...................",".........HH...................","........HHH...................",".......HHHH...................","##############################","##############################"]};
const POOL=['blocks','pit2','pipes','stairs','high','float','beetles','steps','bricks','tunnel'];
const E_GRUMP=1,E_BEETLE=2,E_SHELL=3;
let K,LV=null,heroes=[],enemies=[],parts=[],texts=[],finN=0,firstFin=0,lastHF=0,nextId=1,shake=0,champ=-1;
const broken=new Set(),L={broken:new Map()};          // host: smashed bricks; guest: bricks I smashed but the host hasn't confirmed
const teamOf=i=>K.mode===1?i%2:i,ownerNet=h=>K.seats[h.i]&&K.seats[h.i].ctrl==='net',isMine=h=>K.isClient()?h.i===K.myIdx:!ownerNet(h);
function build(seed,S){const rr=RA.util.mulberry(seed),n=S.length==='short'?6:S.length==='long'?14:10,list=['start'];
 const bag=[];for(let k=0;k<n;k++){if(!bag.length)bag.push(...POOL.slice().sort(()=>rr()-.5));list.push(bag.pop());if(k===Math.floor(n/2)-1)list.push('check')}list.push('end');
 const rows=Array.from({length:LH},()=>'');for(const c of list)for(let r=0;r<LH;r++)rows[r]+=CH[c][r];
 const W=rows[0].length,tiles=new Uint8Array(W*LH),spawns=[],coins=[],checks=[TS*3];
 const code={'#':1,B:2,'?':3,M:4,H:5,'[':6,']':7,'{':8,'}':9};
 for(let r=0;r<LH;r++)for(let c=0;c<W;c++){const ch=rows[r][c];if(code[ch])tiles[r*W+c]=code[ch];else if(ch==='o')coins.push(r*W+c);else if(ch==='g'||ch==='k')spawns.push({c,r,k:ch==='g'?E_GRUMP:E_BEETLE});else if(ch==='!')checks.push(c*TS+8)}
 const flagC=W-18,castleC=W-11;const theme=S.world==='rnd'||!S.world?['over','under','dusk'][Math.floor(rr()*3)]:S.world;
 const scen=[];for(let c=2;c<W-20;c+=6+Math.floor(rr()*8))scen.push({k:rr()<.5?'cloud':'cloud',x:c*TS,y:16+Math.floor(rr()*40)});
 const ground=[];for(let c=2;c<W-20;c+=5+Math.floor(rr()*9))if(tiles[10*W+c]===1&&tiles[9*W+c]===0)ground.push({k:rr()<.5?'bush':'hill',x:c*TS});
 return{W,tiles,spawns,coins,checks,flagX:flagC*TS+8,castleX:castleC*TS,theme,th:THEMES[theme],scen,ground}}
const tileAt=(c,r)=>{if(c<0)return 5;if(c>=LV.W||r<0)return 0;if(r>=LH)return 0;const q=r*LV.W+c,v=LV.tiles[q];if(v===2&&(broken.has(q)||L.broken.has(q)))return 0;return v};
const solid=v=>v>0;
/* ---------- heroes ---------- */
function start(seats,md,S,seed){LV=build(seed,S);broken.clear();L.broken.clear();enemies=[];parts=[];texts=[];finN=0;firstFin=0;lastHF=0;nextId=1;champ=-1;cams.length=0;
 heroes=seats.map((s,i)=>({i,name:s.name,col:md===1?TEAMC[i%2]:s.col,x:28+(i%5)*9,y:160,vx:0,vy:0,gr:true,face:1,big:0,fire:0,star:0,inv:0,dead:0,stun:0,run:0,held:0,jb:0,co:0,jh:false,
  coins:0,dash:0,ck:LV.checks[0],fin:0,ft:0,pole:0,place:i+1,used:new Set(),got:new Set(),items:[],fb:[],bump:null,claims:[],cseq:0,cSeen:0,ev:[],evSeq:0,evSeen:0,pose:'stand',pAt:0,stomps:0,deaths:0,bubble:0}));
 for(const sp of LV.spawns)enemies.push({id:nextId++,k:sp.k,x:sp.c*TS+8,y:(sp.r+1)*TS,vx:-.5,vy:0,st:0,t:0,on:0,spin:0,dead:0})}
const hH=h=>h.big?26:14,hW=6;     // half width 6, height small 14 / big 26
function hitWall(x,y,h){const c0=Math.floor((x-hW)/TS),c1=Math.floor((x+hW-.01)/TS),r0=Math.floor((y-h)/TS),r1=Math.floor((y-.01)/TS);
 for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)if(solid(tileAt(c,r)))return true;return false}
function move(h,inp){if(K.tick<CD){h.vx=0;return}
 for(const k of['star','inv','dash'])if(h[k]>0)h[k]--;
 if(h.fin){h.vx=0;return}
 if(h.dead>0){h.dead--;h.vy=Math.min(FALL,h.vy+.25);h.y+=h.vy;if(h.dead===0)respawn(h);return}
 if(h.bubble>0){h.bubble--;h.vx=0;h.vy=0;return}
 if(h.pole){poleStep(h);return}
 if(h.stun>0){h.stun--;inp={}}
 const left=!!inp.left,right=!!inp.right,dir=(right?1:0)-(left?1:0),jump=!!(inp.fire||inp.up),down=!!inp.down&&h.gr&&h.big;
 h.crouch=down;
 // momentum: walking speed at once, running speed after a short run-up
 if(dir&&h.gr&&Math.sign(h.vx)!==-dir)h.run=Math.min(40,h.run+1);else if(h.gr&&!dir)h.run=Math.max(0,h.run-2);else if(dir&&Math.sign(h.vx)===-dir&&h.gr)h.run=0;
 const top=h.dash>0?DASH:h.run>=28?RUN:WALK+(RUN-WALK)*h.run/28;
 if(down)h.vx*=.95;
 else if(dir){if(h.gr&&h.vx*dir<0){h.vx+=dir*SKID;h.skid=1}else{h.skid=0;const a=h.gr?(Math.abs(h.vx)<WALK?ACC:ACCR):AIRA;if(h.vx*dir<top)h.vx=dir*Math.min(top,Math.abs(h.vx)*(h.vx*dir>0?1:-1)+a);else h.vx+=(dir*top-h.vx)*.05}h.face=h.gr?dir:h.face}
 else{h.skid=0;if(h.gr){const s=Math.sign(h.vx);h.vx-=s*FRIC;if(Math.sign(h.vx)!==s)h.vx=0}}
 if(h.gr&&dir)h.face=dir;
 // jump: buffered press, coyote time, hold for height
 if(jump&&!h.jh)h.jb=6;else if(h.jb>0)h.jb--;h.jh=jump;
 if(h.gr)h.co=6;else if(h.co>0)h.co--;
 if(h.jb>0&&h.co>0&&!h.crouch){h.vy=-(JV+JVR*Math.min(1,Math.abs(h.vx)/RUN));h.gr=false;h.co=0;h.jb=0;sfx('jump')}
 h.vy=Math.min(FALL,h.vy+(h.vy<0&&jump?GH:GF));
 if((inp.alt||inp.b4)&&!h.fh&&h.fire&&h.fb.length<2){h.fb.push({x:h.x+h.face*8,y:h.y-hH(h)/2,vx:h.face*4,vy:1,t:90});sfx('shot')}h.fh=!!(inp.alt||inp.b4);
 const H=hH(h);
 // horizontal, then vertical, against the tiles
 let nx=h.x+h.vx;
 // ledge forgiveness: pushing into a wall whose top is just above your feet steps you up onto it
 if(!h.gr&&h.vx&&hitWall(nx,h.y,H)){const col=Math.floor((nx+Math.sign(h.vx)*hW)/TS),r=Math.floor((h.y-1)/TS);let top=r;while(top>0&&solid(tileAt(col,top-1)))top--;const ty=top*TS;if(solid(tileAt(col,r))&&h.y-ty<=10&&!hitWall(nx,ty,H)){h.y=ty;h.vy=Math.min(h.vy,0)}}
 if(hitWall(nx,h.y,H)){const s=Math.sign(h.vx);nx=s>0?Math.floor((nx+hW)/TS)*TS-hW-.01:Math.floor((nx-hW)/TS+1)*TS+hW+.01;if(hitWall(nx,h.y,H))nx=h.x;h.vx=0}h.x=Math.max(hW,nx);
 let ny=h.y+h.vy;h.gr=false;
 if(h.vy>=0){if(hitWall(h.x,ny,H)){ny=Math.floor(ny/TS)*TS;h.vy=0;h.gr=true}}
 else if(hitWall(h.x,ny,H)){// head: corner correction first, then bump the block over your head
  let fixed=false;for(const d of[-4,-3,-2,-1,1,2,3,4])if(!hitWall(h.x+d,ny,H)&&Math.abs(d)<=4){const cc=Math.floor((h.x+d+(d>0?-hW:hW))/TS);if(!hitWall(h.x+d,ny,H)){h.x+=d;fixed=true;break}}
  if(!fixed){const r=Math.floor((ny-H)/TS),c=Math.floor(h.x/TS),c2=solid(tileAt(c,r))?c:Math.floor((h.x+(h.x%TS<8?-hW:hW))/TS);bumpBlock(h,c2,r);ny=(r+1)*TS+H;h.vy=1}}
 h.y=ny;
 if(h.gr&&solid(tileAt(Math.floor((h.x-hW)/TS),Math.floor(h.y/TS)))&&solid(tileAt(Math.floor((h.x+hW)/TS),Math.floor(h.y/TS)))&&!enemies.some(e=>!e.dead&&!e.flat&&Math.abs(e.x-h.x)<40)){const sh=h.sh||(h.sh=[]);if(!sh.length||Math.abs(sh[sh.length-1].x-h.x)>12){sh.push({x:h.x,y:h.y});if(sh.length>24)sh.shift()}}
 if(h.y>LH*TS+40){die(h,'pit');return}
 // the flag
 if(h.x>=LV.flagX-4&&!h.pole&&!h.fin){h.pole=1;h.x=LV.flagX-5;h.vx=0;h.vy=0;h.poleY=h.y;sfx('power');claim(h,'pl',Math.round(160-h.y))}
 // checkpoints
 for(const cx of LV.checks)if(h.x>cx&&h.ck<cx){h.ck=cx;if(isMine(h)&&h.i===meIdx())say(h,'CHECKPOINT!','#88dc48')}
 coinsAndItems(h);fireballs(h);heroVsEnemies(h);heroVsHeroes(h);animStep(h);if(h.grow>0)h.grow--}
function poleStep(h){if(h.pole===1){h.y=Math.min(160,h.y+2.5);if(h.y>=160){h.pole=2;h.face=1}}
 else{h.x+=1.4;h.run+=.5;if(h.x>=LV.castleX+40&&!h.fin){h.pole=3;claim(h,'fin',0);h.vx=0}}}
function bumpBlock(h,c,r){const v=tileAt(c,r),q=r*LV.W+c;if(!v)return;sfx('bump');h.bump={c,r,t:8};
 if(v===2){if(h.big){smashBrick(h,q,c,r)}return}
 if((v===3||v===4)&&!h.used.has(q)){h.used.add(q);
  if(v===3){if(behind(h)&&Math.random()<.18)spawnItem(h,c,r,'m');else{h.coins++;coinPop(c,r);sfx('coin');if(h.coins%10===0){h.dash=150;say(h,'10 COINS: DASH!','#fff07c')}}}
  else spawnItem(h,c,r,behind(h)&&Math.random()<.35?'s':h.big?'f':'m')}}
const behind=h=>h.place>Math.max(1,heroes.length*.5);
function smashBrick(h,q,c,r){if(K.isClient())L.broken.set(q,K.tick);else broken.add(q);claim(h,'bk',q);
 for(let k=0;k<4;k++)parts.push({x:c*TS+4+(k&1)*8,y:r*TS+4+(k>>1)*8,vx:(k&1?1.2:-1.2),vy:-3-(k>>1),g:.3,t:50,col:LV.th.tile.F,sz:3})}
function coinPop(c,r){parts.push({x:c*TS+8,y:r*TS,vx:0,vy:-4,g:.3,t:26,coin:1})}
function spawnItem(h,c,r,k){h.items.push({k,x:c*TS+8,y:r*TS,vx:0,vy:0,rise:16,id:nextId++})}
function coinsAndItems(h){const H=hH(h);
 for(const q of LV.coins){if(h.got.has(q))continue;const cx=(q%LV.W)*TS+8,cy=Math.floor(q/LV.W)*TS+8;if(Math.abs(cx-h.x)<11&&cy>h.y-H-6&&cy<h.y+4){h.got.add(q);h.coins++;sfx('coin');if(h.coins%10===0){h.dash=150;say(h,'10 COINS: DASH!','#fff07c')}}}
 for(const it of h.items){if(it.rise>0){it.y-=1;it.rise--;if(it.rise===0)it.vx=it.k==='f'?0:1.1;continue}
  if(it.k!=='f'){it.vy=Math.min(4,it.vy+.3);if(it.k==='s'&&it.gr)it.vy=-4.5;let nx=it.x+it.vx;if(solid(tileAt(Math.floor((nx+(it.vx>0?7:-7))/TS),Math.floor((it.y-2)/TS))))it.vx=-it.vx;else it.x=nx;
   it.y+=it.vy;it.gr=false;if(solid(tileAt(Math.floor(it.x/TS),Math.floor(it.y/TS)))){it.y=Math.floor(it.y/TS)*TS;it.vy=0;it.gr=true}if(it.y>LH*TS+20)it.dead=1}
  if(Math.abs(it.x-h.x)<12&&it.y>h.y-H-8&&it.y<h.y+12){it.dead=1;sfx('power');
   if(it.k==='m'){if(!h.big){h.big=1;h.grow=30}say(h,'SUPER!','#f05050')}else if(it.k==='f'){h.big=1;h.fire=1;say(h,'FIRE!','#ffa040')}else{h.star=600;say(h,'STAR!','#fff07c')}}}
 h.items=h.items.filter(it=>!it.dead)}
function fireballs(h){for(const b of h.fb){b.t--;b.vy=Math.min(4,b.vy+.35);b.x+=b.vx;if(solid(tileAt(Math.floor(b.x/TS),Math.floor(b.y/TS)))){b.t=0;continue}b.y+=b.vy;
  if(solid(tileAt(Math.floor(b.x/TS),Math.floor((b.y+3)/TS)))){b.y=Math.floor((b.y+3)/TS)*TS-3;b.vy=-3}
  for(const e of enemies)if(!e.dead&&!e.flat&&Math.abs(e.x-b.x)<9&&Math.abs(e.y-8-b.y)<10){b.t=0;hitEnemy(h,e,'fire');break}}
 h.fb=h.fb.filter(b=>b.t>0)}
// big heroes shrink; small ones are bowled over and lose a second (only pits and shells take a life)
function hurt(h,src){if(h.star>0||h.inv>0||h.dead||h.fin||h.pole)return;if(h.big){h.big=0;h.fire=0;h.inv=110;sfx('die');say(h,'OUCH!','#f05050');return}
 if(src==='shell'){die(h,'shell');return}const d=src&&src.x!=null?Math.sign(h.x-src.x)||-1:-h.face;h.vx=d*2.2;h.vy=-3.5;h.gr=false;h.stun=40;h.inv=100;sfx('die');say(h,'BONK!','#f05050')}
function die(h,why){if(h.dead)return;h.dx=h.x;h.dead=80;h.vy=-5;h.vx=0;h.big=0;h.fire=0;h.deaths++;sfx('die')}
// back on the last safe ground you stood on (a fall costs you about two seconds, it never sends you back a whole section)
function respawn(h){const dx=h.dx||h.x,hist=h.sh||[];let s=null;for(let k=hist.length-1;k>=0;k--)if(hist[k].x<=dx-40){s=hist[k];break}if(!s)s=hist[0]||{x:h.ck,y:160};
 // died at the same place twice running: you're put just past it
 if(h.lastD!=null&&Math.abs(h.lastD-dx)<56)h.rep=(h.rep|0)+1;else h.rep=0;h.lastD=dx;
 if(h.rep>=2){h.rep=0;for(let c=Math.floor(dx/TS)+1;c<LV.W-1;c++){let r=-1;for(let k=2;k<LH;k++)if(solid(tileAt(c,k))&&!solid(tileAt(c,k-1))&&!solid(tileAt(c,k-2))){r=k;break}
   if(r>0&&solid(tileAt(c+1,r))&&!solid(tileAt(c+1,r-1))){s={x:c*TS+TS,y:r*TS};break}}if(h.i===meIdx())say(h,'HELPING HAND!','#a0f0ff')}
 h.x=s.x;h.y=s.y;h.vx=0;h.vy=0;h.inv=130;h.run=0;h.dead=0}
// a local hero against the enemies everyone shares: stomp, kick a shell, or get hurt
function heroVsEnemies(h){const H=hH(h);
 for(const e of enemies){if(e.dead||e.flat||e.lk>K.tick)continue;const eh=e.k===E_BEETLE?18:e.k===E_SHELL?12:12;
  if(Math.abs(e.x-h.x)>13||h.y<e.y-eh-2||h.y-H>e.y)continue;
  const stomp=h.vy>0&&h.y-h.vy<=e.y-eh+5;
  if(h.star>0){hitEnemy(h,e,'star');continue}
  if(stomp){h.vy=-(h.jh?6:4);h.y=e.y-eh;h.stomps++;sfx('stomp');hitEnemy(h,e,'stomp');continue}
  if(e.k===E_SHELL&&!e.spin){e.lk=K.tick+12;claim(h,'kk',e.id,h.x<e.x?1:-1);sfx('stomp');continue}
  if(e.k===E_SHELL&&e.own===h.i&&K.tick-e.kt<20)continue;
  hurt(h,e.k===E_SHELL?'shell':e)}}
function hitEnemy(h,e,how){e.lk=K.tick+20;claim(h,'e',e.id,how==='stomp'?1:2);if(how==='stomp'&&e.k===E_GRUMP){e.flat=40;e.vx=0}else if(how!=='stomp'){e.dead=1}}
// land on a rival's head and they are flattened for a moment (no damage)
function heroVsHeroes(h){if(h.vy<=0)return;for(const o of heroes){if(o===h||o.dead||o.fin||o.pole||o.stun>0||o.inv>0||o.star>0||o.bubble)continue;
 if(Math.abs(o.x-h.x)<10&&h.y>=o.y-hH(o)-2&&h.y-h.vy<=o.y-hH(o)+4){h.vy=-(h.jh?6:4.5);h.y=o.y-hH(o)-2;sfx('stomp');claim(h,'hs',o.i);if(!isMine(o))o.stunLook=K.tick;return}}}
function claim(h,k,a,b){if(!K.isClient()){resolve(h,[0,k,a,b]);return}h.cseq++;h.claims.push([h.cseq,k,a,b]);if(h.claims.length>12)h.claims.shift()}
/* ---------- host: enemies, shells, bricks and the finish ---------- */
function resolve(h,[,k,a,b]){
 if(k==='bk'){if(LV.tiles[a]===2&&!broken.has(a)){broken.add(a);if(K.isClient()===false&&!isMine(h)){const c=a%LV.W,r=Math.floor(a/LV.W);for(let q=0;q<4;q++)parts.push({x:c*TS+4+(q&1)*8,y:r*TS+4+(q>>1)*8,vx:(q&1?1.2:-1.2),vy:-3-(q>>1),g:.3,t:50,col:LV.th.tile.F,sz:3})}
   // enemies standing on a smashed brick are knocked off
   const c=a%LV.W,r=Math.floor(a/LV.W);for(const e of enemies)if(!e.dead&&Math.floor(e.x/TS)===c&&Math.abs(e.y-r*TS)<2){e.dead=1;e.vy=-4}}}
 else if(k==='e'){const e=enemies.find(x=>x.id===a);if(!e||e.dead)return;
  if(b===1){if(e.k===E_GRUMP){e.flat=40;e.vx=0}else if(e.k===E_BEETLE){e.k=E_SHELL;e.spin=0;e.vx=0;e.idle=0}else if(e.k===E_SHELL){e.spin=0;e.vx=0;e.idle=0}}
  else{e.dead=1;e.vy=-4;e.vx=h.x<e.x?1:-1}h.stomps=(h.stomps|0)}
 else if(k==='kk'){const e=enemies.find(x=>x.id===a);if(e&&!e.dead&&e.k===E_SHELL&&!e.spin){e.spin=1;e.vx=(b||1)*4;e.own=h.i;e.kt=K.tick}}
 else if(k==='hs'){const o=heroes[a];if(o&&!o.dead&&!o.fin&&!(o.inv>0)&&!(o.star>0)){send(o,'stun',h.i);say(o,'SQUASHED!','#fff07c')}}
 else if(k==='pl'){if(isMine(h))return;sfx('power')}
 else if(k==='fin'&&!h.fin){h.fin=++finN;h.ft=K.tick-CD;if(finN===1)firstFin=K.tick;if(K.seats[h.i].ctrl!=='cpu')lastHF=K.tick;K.fx('f',h.i,h.fin);say(h,ord(h.fin)+' PLACE!','#fff07c')}}
function send(o,kind,v){if(ownerNet(o)){o.evSeq++;o.ev.push([o.evSeq,kind,v|0]);if(o.ev.length>6)o.ev.shift()}else onEv(o,kind,v)}
function onEv(h,kind,v){if(kind==='stun'){if(h.inv>0||h.star>0||h.dead)return;h.stun=45;h.inv=90;h.vx*=.2;if(h.i===meIdx())shake=3}else if(kind==='hit')hurt(h)}
const onScreen=x=>heroes.some(h=>!h.fin&&x>h.x-260&&x<h.x+340);
function enemyStep(e,host){if(e.dead){e.vy+=.3;e.y+=e.vy;e.x+=e.vx;if(e.y>LH*TS+40)e.gone=1;return}
 if(!e.on){if(onScreen(e.x))e.on=1;else return}
 if(e.flat>0){if(--e.flat===0)e.gone=1;return}
 e.t++;const sp=e.k===E_SHELL?(e.spin?Math.sign(e.vx)*4:0):Math.sign(e.vx||-1)*(e.k===E_BEETLE?.5:.55);e.vx=sp;
 const nx=e.x+e.vx,front=nx+Math.sign(e.vx)*7,row=Math.floor((e.y-4)/TS);
 if(e.vx&&solid(tileAt(Math.floor(front/TS),row))){e.vx=-e.vx;if(e.k===E_SHELL&&host)sfx('bump')}else e.x=nx;
 e.vy=Math.min(5,e.vy+.35);e.y+=e.vy;if(solid(tileAt(Math.floor(e.x/TS),Math.floor(e.y/TS)))){e.y=Math.floor(e.y/TS)*TS;e.vy=0}
 if(e.y>LH*TS+30)e.gone=1;
 if(!host)return;
 // spinning shells take out everything in their way, and grumps / beetles turn round when they meet
 for(const o of enemies){if(o===e||o.dead||o.flat||!o.on)continue;if(Math.abs(o.x-e.x)<12&&Math.abs(o.y-e.y)<12){if(e.k===E_SHELL&&e.spin){o.dead=1;o.vy=-4;o.vx=Math.sign(e.vx);sfx('stomp')}else if(!(o.k===E_SHELL&&o.spin)&&e.k!==E_SHELL&&Math.sign(o.x-e.x)===Math.sign(e.vx)){e.vx=-e.vx}}}
 if(e.k===E_SHELL&&!e.spin){e.idle=(e.idle|0)+1;if(e.idle>420){e.k=E_BEETLE;e.vx=-.5;e.idle=0}}}
function step(){const S=K.S;
 for(const h of heroes){if(ownerNet(h)){const u=K.remote(h.i);if(u)readUp(h,u);continue}move(h,h.fin?{}:K.inp(h.i))}
 for(const e of enemies)enemyStep(e,true);enemies=enemies.filter(e=>!e.gone);
 // CPU heroes and the host's own humans against the enemies are handled in move(); guests check themselves and claim
 bubbles();places();vis();checkEnd()}
// local players share one screen: anyone too far behind the leader is carried forward in a bubble
function bubbles(){if(K.isClient())return;const loc=heroes.filter(h=>K.seats[h.i].ctrl!=='cpu'&&K.seats[h.i].ctrl!=='net'&&!h.fin);if(loc.length<2)return;
 const lead=loc.reduce((a,b)=>b.x>a.x?b:a);for(const h of loc)if(h!==lead&&lead.x-h.x>250&&!h.bubble&&!h.dead){h.x=lead.x-40;h.y=lead.y-30;h.vx=h.vy=0;h.bubble=50;h.inv=90;h.ck=Math.max(h.ck,lead.ck)}}
function places(){heroes.slice().sort((a,b)=>a.fin&&b.fin?a.fin-b.fin:a.fin?-1:b.fin?1:b.x-a.x).forEach((h,k)=>h.place=k+1)}
function checkEnd(){const lim=K.S.len*3600,humans=heroes.filter(h=>K.seats[h.i].ctrl!=='cpu'&&!h.fin).length,all=heroes.every(h=>h.fin);
 if(all||finN&&humans===0&&K.tick-Math.max(firstFin,lastHF)>300||finN&&K.tick-firstFin>1800||lim&&K.tick>lim+CD){places();const w=heroes.find(h=>h.place===1);champ=w?w.i:-1;
  if(K.mode===1){const n=heroes.length,sc=[0,1].map(t=>heroes.filter(h=>h.i%2===t).reduce((a,h)=>a+(n-h.place+1),0));K.end(sc[0]===sc[1]?null:{team:sc[0]>sc[1]?0:1,name:TEAMN[sc[0]>sc[1]?0:1]})}
  else K.end(w?{i:w.i}:null)}}
const ord=n=>n+(n%100>10&&n%100<14?'TH':['TH','ST','ND','RD'][n%10]||'TH');
function say(h,s,col){if(h.i!==meIdx()&&!(K.seats[h.i]&&K.seats[h.i].ctrl!=='cpu'&&!K.isClient()&&K.seats[h.i].ctrl!=='net'))return;texts.push({x:h.x,y:h.y-hH(h)-8,s,col,t:70,who:h.i})}
function vis(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;if(p.g)p.vy+=p.g;p.t--}parts=parts.filter(p=>p.t>0);if(parts.length>300)parts.splice(0,parts.length-300);
 for(const t of texts){t.t--;t.y-=.3}texts=texts.filter(t=>t.t>0);if(shake>0)shake*=.85;
 for(const h of heroes){if(h.bump&&--h.bump.t<=0)h.bump=null;const v=Math.abs(h.vx);if(h.skid&&h.gr&&K.tick%3===0)parts.push({x:h.x-h.face*4,y:h.y-1,vx:-h.face*.3,vy:-.4,t:14,col:'#e8e4dc',sz:2});
  if(h.star>0&&K.tick%3===0)parts.push({x:h.x+(Math.random()-.5)*14,y:h.y-Math.random()*hH(h),vx:0,vy:-.3,t:12,col:['#fff07c','#ffffff','#a0f0ff'][Math.random()*3|0],sz:1});
  if(h.dash>0&&K.tick%2===0)parts.push({x:h.x-h.face*6,y:h.y-4-Math.random()*8,vx:-h.face*.6,vy:0,t:10,col:'#fff07c',sz:1})}}

/* ---------- guests: run my hero, take the host's word for enemies and places ---------- */
const meIdx=()=>K.demo?-1:K.isClient()?K.myIdx:K.seats.findIndex(s=>s&&s.ctrl!=='cpu'&&s.ctrl!=='net');
const POSES=['stand','run1','run2','run3','jump','skid','die','climb','win','crouch'];
function poseOf(h){let p;
 if(h.dead)p='die';else if(h.fin||h.pole===3)p='win';else if(h.pole===1)p='climb';else if(h.crouch)p='crouch';else if(!h.gr)p='jump';else if(h.skid)p='skid';
 else if(Math.abs(h.vx)>.2||h.pole===2){const f=Math.floor(h.anim||0)%3;p='run'+(f+1)}else p='stand';
 return p}
function animStep(h){h.anim=(h.anim||0)+Math.max(.08,Math.abs(h.vx)*.12);const p=poseOf(h),walk=x=>/^run|stand/.test(x);
 if(walk(p)&&walk(h.pose)&&K.tick-h.pAt<3&&p!==h.pose)return;if(p!==h.pose){h.pose=p;h.pAt=K.tick}}
function flags(h){if(h.fl!=null&&(K.isClient()?h.i!==K.myIdx:ownerNet(h)))return h.fl;
 return(h.big?1:0)|(h.fire?2:0)|(h.star>0?4:0)|(h.inv>0?8:0)|(h.dead?16:0)|(h.stun>0?32:0)|(h.dash>0?64:0)|(h.bubble>0?128:0)|(h.face<0?256:0)}
function local(i){const h=heroes[i];if(!h)return;move(h,h.fin?{}:K.inp(i));for(const e of enemies)enemyStep(e,false);for(const[q,t]of L.broken)if(K.tick-t>90)L.broken.delete(q)}
function upload(i){const h=heroes[i];if(!h)return null;return{x:Math.round(h.x*10)/10,y:Math.round(h.y*10)/10,vx:Math.round(h.vx*100)/100,vy:Math.round(h.vy*100)/100,p:POSES.indexOf(h.pose),
 fl:flags(h),co:h.coins,ck:h.ck,st:h.stomps,c:h.claims,fb:h.fb.map(b=>[Math.round(b.x),Math.round(b.y)])}}
function readUp(h,u){if(typeof u.x!=='number')return;h.x=u.x;h.y=u.y;h.vx=u.vx;h.vy=u.vy;h.pose=POSES[u.p]||'stand';h.fl=u.fl|0;h.coins=u.co|0;h.ck=u.ck||h.ck;h.stomps=u.st|0;
 h.big=h.fl&1;h.dead=h.fl&16?1:0;h.star=h.fl&4?1:0;h.inv=h.fl&8?1:0;h.fbv=u.fb||[];
 for(const e of u.c||[])if((e[0]|0)>h.cSeen){h.cSeen=e[0]|0;resolve(h,e)}}
function snap(){return{hs:heroes.map(h=>[Math.round(h.x),Math.round(h.y),Math.round(h.vx*10),POSES.indexOf(h.pose),flags(h),h.place,h.fin,h.ft,h.coins,ownerNet(h)?h.ev:0,h.fbv||h.fb.map(b=>[Math.round(b.x),Math.round(b.y)])]),
 en:enemies.map(e=>[e.id,e.k,Math.round(e.x),Math.round(e.y),(e.flat>0?1:0)|(e.dead?2:0)|(e.spin?4:0)|(e.on?8:0),Math.round(e.vx*10)]),bk:[...broken].map(q=>q.toString(36)).join(',')}}
function apply(g){broken.clear();for(const s of String(g.bk||'').split(','))if(s){const q=parseInt(s,36);broken.add(q);L.broken.delete(q)}
 (g.hs||[]).forEach((a,i)=>{const h=heroes[i];if(!h)return;h.place=a[5];h.fin=a[6];h.ft=a[7];
  if(i===K.myIdx){for(const e of a[9]||[])if((e[0]|0)>h.evSeen){h.evSeen=e[0]|0;onEv(h,e[1],e[2])}return}
  h.tx=a[0];h.ty=a[1];h.vx=a[2]/10;h.pose=POSES[a[3]]||'stand';h.fl=a[4];h.coins=a[8];h.big=h.fl&1;h.fbv=a[10]||[];if(h.gx==null){h.x=h.tx;h.y=h.ty;h.gx=1}});
 const em=new Map(enemies.map(e=>[e.id,e]));enemies=(g.en||[]).map(r=>{const o=em.get(r[0])||{lk:0,vy:0,t:0};
  return Object.assign(o,{id:r[0],k:r[1],tx:r[2],ty:r[3],x:o.x==null||Math.abs(o.x-r[2])>24?r[2]:o.x+(r[2]-o.x)*.3,y:o.y==null||Math.abs(o.y-r[3])>24?r[3]:o.y+(r[3]-o.y)*.3,flat:r[4]&1?(o.flat||40):0,dead:r[4]&2?1:o.dead&&o.lk>K.tick?1:0,spin:r[4]&4?1:0,on:r[4]&8?1:0,vx:r[5]/10})})}
function follow(){for(const h of heroes){if(h.i===K.myIdx||h.tx==null)continue;const dx=h.tx-h.x,dy=h.ty-h.y;if(Math.abs(dx)>48||Math.abs(dy)>48){h.x=h.tx;h.y=h.ty}else{h.x+=dx*.4;h.y+=dy*.4}}
 for(const h of heroes)if(h.i===K.myIdx)animStep(h);vis()}
function onFx(k,a){if(k==='f'){const h=heroes[a[0]];if(h&&h.i===meIdx())sfx('power')}}

/* ---------- CPU racers: read the tiles ahead, jump exactly as high as needed ---------- */
// how high a jump rises for a given hold time (worked out with the real physics, cached)
const RISE=new Map();function riseFor(hold,v0){const k=hold+'_'+v0.toFixed(1);if(RISE.has(k))return RISE.get(k);let vy=-v0,y=0,best=0;for(let t=0;t<90;t++){vy=Math.min(FALL,vy+(vy<0&&t<hold?GH:GF));y+=vy;best=Math.min(best,y);if(vy>0)break}RISE.set(k,-best);return -best}
function holdFor(rise,v0){for(let t=1;t<30;t++)if(riseFor(t,v0)>=rise)return t;return 30}
function bot(i){const h=heroes[i];if(!h||h.dead||h.fin||h.pole||h.stun>0||K.tick<CD-20)return{};const o={right:true},lvl=K.cpu,b=h.bt||(h.bt={hold:0,stuck:0,lx:h.x,back:0,wait:0});
 if(b.wait>0){b.wait--;return{}}
 if(b.back>0){b.back--;return{left:true}}
 if(K.tick%30===0){if(Math.abs(h.x-b.lx)<6&&K.tick>CD+40)b.stuck++;else b.stuck=0;b.lx=h.x;if(b.stuck>=2){b.back=22;b.stuck=0;return{left:true}}}
 if(b.hold>0){b.hold--;o.fire=true;return o}
 if(lvl===0&&Math.random()<.003)b.wait=20+Math.random()*30;
 if(h.fire&&Math.random()<.02&&enemies.some(e=>!e.dead&&!e.flat&&e.x>h.x&&e.x-h.x<120&&Math.abs(e.y-h.y)<20))o.alt=(K.tick&1)>0;
 if(!h.gr)return o;
 const v0=JV+JVR*Math.min(1,Math.abs(h.vx)/RUN),c=Math.floor(h.x/TS),r=Math.floor((h.y-1)/TS),H=hH(h),body=Math.ceil(H/TS),reach=10+Math.abs(h.vx)*6,front=h.x+hW;
 const jumpNow=hold=>{b.hold=Math.max(1,hold-1);o.fire=true;return o};
 // a wall: jump to its top
 for(let dc=1;dc<=2;dc++){const col=c+dc,edge=col*TS-front;if(edge>reach)break;let s=-1;for(let k=0;k<body;k++)if(solid(tileAt(col,r-k))){s=r-k;break}
  if(s>=0){let top=s;while(top>0&&solid(tileAt(col,top-1)))top--;const rise=h.y-top*TS+4;if(rise>78)break;return jumpNow(holdFor(rise,v0)+(lvl===2?0:1))}}
 // a pit: jump with everything (or less if the far side is close and low)
 for(let dc=1;dc<=2;dc++){const col=c+dc,edge=col*TS-front;if(edge>reach)break;let ground=false;for(let k=r+1;k<LH;k++)if(solid(tileAt(col,k))){ground=true;break}
  if(!ground){let w=0;while(w<8){let g=false;for(let k=0;k<LH;k++)if(solid(tileAt(col+w,k))){g=true;break}if(g)break;w++}if(edge<6+Math.abs(h.vx)*3)return jumpNow(w<=2?14:26);return o}}
 // an enemy coming: hop on it
 for(const e of enemies){if(e.dead||e.flat||!e.on)continue;const d=e.x-h.x;if(d>0&&d<26+Math.abs(h.vx)*7&&Math.abs(e.y-h.y)<10){if(lvl===0&&Math.random()<.4)return o;return jumpNow(e.k===E_SHELL&&!e.spin?6:9)}}
 // rivals right in front get stomped by the Hard ones
 if(lvl===2)for(const q of heroes){if(q===h||q.dead||q.fin)continue;const d=q.x-h.x;if(d>10&&d<34&&Math.abs(q.y-h.y)<6&&Math.random()<.05)return jumpNow(10)}
 // ? blocks right overhead: Normal and Hard bump the ones they pass under
 if(lvl>=1&&Math.random()<.08){const rr=r-Math.ceil(H/TS)-1;for(const dr of[0,-1,-2]){const v=tileAt(c,rr+dr);if((v===3||v===4)&&!h.used.has((rr+dr)*LV.W+c))return jumpNow(holdFor(h.y-(rr+dr+1)*TS-H+2,v0))}}
 return o}

/* ---------- drawing ---------- */
const IMG=new Map(),img=(k,f)=>{let v=IMG.get(k);if(!v){v=f();IMG.set(k,v)}return v};
const tileImg=(k,th)=>img('t'+k+th,()=>X.sprite(ART.tile[k],THEMES[th].tile));
const RAINBOW=['#f05050','#ffa040','#fff07c','#88dc48','#60a0ff','#b080f0'];
function heroImg(h,col,pose,fl){const big=fl&1||h.grow>0&&(K.tick>>2)&1,key=(big?'b_':'s_')+(big||pose!=='crouch'?pose:'stand'),fire=fl&2,face=fl&256?-1:1,k='h'+key+col+fire+face;
 return img(k,()=>{const rows=ART.hero[key]||ART.hero[(big?'b_':'s_')+'stand'],c=X.recolor(rows,col,fire?{u:'#d82838',b:'#f05050',h:'#5a3a20',y:'#f0c020',n:'#6c3a1c',m:'#3c200c',w:'#ffffff'}:{u:'#1c2a7c',b:'#3450b0',h:'#5a3a20',y:'#f0c020',n:'#6c3a1c',m:'#3c200c'},key+(fire?'f':''));return face<0?X.flipX(c):c})}
const enImg=(k,f)=>img('e'+k+f,()=>{const fl=f.flip,up=f.up;let c;if(k==='g')c=X.sprite(ART.grump[f.fr]);else if(k==='flat')c=X.sprite(ART.flat);else if(k==='b')c=X.sprite(ART.beetle[f.fr]);else c=X.sprite(ART.shell);
 if(fl)c=X.flipX(c);if(up){const o=X.mk(c.width,c.height),g=o.getContext('2d');g.translate(0,c.height);g.scale(1,-1);g.drawImage(c,0,0);c=o}return c});
const coinImg=f=>img('c'+f,()=>X.sprite(ART.coin[f]));
const itemImg=k=>img('i'+k,()=>X.sprite(k==='m'?ART.mush:k==='f'?ART.flower:ART.star));
const sceneImg=k=>img('s'+k,()=>X.sprite(ART[k]));
const bubbleImg=()=>img('bub',()=>{const c=X.mk(26,30),g=c.getContext('2d');for(let y=0;y<30;y++)for(let x=0;x<26;x++){const d=Math.hypot((x+.5-13)/13,(y+.5-15)/15);if(d<=1&&d>.86){g.fillStyle=d>.95?'#60a0ff':'#a0f0ff';g.fillRect(x,y,1,1)}}g.fillStyle='#ffffff';g.fillRect(7,6,3,2);g.fillRect(6,8,1,2);return c});
function skyImg(th,w,h){return img('sky'+th+w+'x'+h,()=>{const t=THEMES[th],c=X.mk(w,h),g=c.getContext('2d'),n=t.sky.length;for(let y=0;y<h;y++){const f=y/h*n,k=Math.min(n-1,Math.floor(f)),fr=f-k;
  for(let x=0;x<w;x++){g.fillStyle=k<n-1&&fr>.75&&X.dither(x,y,(fr-.75)/.25)?t.sky[k+1]:t.sky[k];g.fillRect(x,y,1,1)}}
  if(t.roof){g.fillStyle='#1c1430';for(let x=0;x<w;x+=1)if(X.dither(x,0,.5))g.fillRect(x,0,1,1)}return c})}
const cams=[];let SCR=null;
function view(g,focus,vx,vy,vw,vh,ci){const th=LV.theme,T=LV.th;let cam=cams[ci];const lead=focus.reduce((a,b)=>b.x>a.x?b:a),back=focus.reduce((a,b)=>b.x<a.x?b:a);
 let tx=lead.x-vw*.42;if(focus.length>1)tx=Math.min(tx,back.x-24);tx=Math.max(0,Math.min(LV.W*TS-vw,tx));if(!cam)cam=cams[ci]={x:tx};cam.x+=(tx-cam.x)*.2;
 const cx=Math.round(cam.x)+(shake>.5?Math.round((Math.random()-.5)*shake):0),cy=LH*TS-vh;
 g.save();g.beginPath();g.rect(vx,vy,vw,vh);g.clip();g.translate(vx-cx,vy-cy);
 g.drawImage(skyImg(th,vw,vh),cx,cy);
 if(T.scen){for(const s of LV.scen){const px=Math.round(s.x-cx*.5+cx);if(px>cx-40&&px<cx+vw+10)g.drawImage(sceneImg('cloud'),px,s.y)}
  for(const s of LV.ground){if(s.x>cx-60&&s.x<cx+vw+20){const im=sceneImg(s.k);g.drawImage(im,s.x,160-im.height)}}}
 // tiles
 const c0=Math.max(0,Math.floor(cx/TS)),c1=Math.min(LV.W-1,Math.floor((cx+vw)/TS)),me=focus[0],qf=['q1','q1','q1','q2','q3','q2'][(K.tick>>3)%6];
 for(let r=0;r<LH;r++)for(let c=c0;c<=c1;c++){const v=tileAt(c,r);if(!v)continue;const q=r*LV.W+c;let k;
  if(v===1)k=r>0&&tileAt(c,r-1)===1?'dirt':'top';else if(v===2)k='brick';else if(v===3||v===4)k=me.used.has(q)?'used':qf;else if(v===5)k='hard';else k=['pipeTL','pipeTR','pipeBL','pipeBR'][v-6];
  let oy=0;for(const h of focus)if(h.bump&&h.bump.c===c&&h.bump.r===r)oy=-Math.round(Math.sin(h.bump.t/8*Math.PI)*4);
  g.drawImage(tileImg(k,th),c*TS,r*TS+oy)}
 // pits at night fall into darkness; the flag and the castle
 const fx=LV.flagX;if(fx>cx-20&&fx<cx+vw+20){g.fillStyle=P.k;g.fillRect(fx-2,24,4,136);g.fillStyle='#88dc48';g.fillRect(fx-1,24,2,136);g.fillStyle=P.k;g.fillRect(fx-4,16,8,8);g.fillStyle='#38a038';g.fillRect(fx-3,17,6,6);g.fillStyle='#88dc48';g.fillRect(fx-2,18,2,2);
  const fy=focus.some(h=>h.pole===1)?Math.min(140,(focus.find(h=>h.pole===1).y)-20):focus.some(h=>h.pole>=2||h.fin)?140:26;g.drawImage(sceneImg('flag'),fx-13,Math.round(fy))}
 const kx=LV.castleX;if(kx>cx-100&&kx<cx+vw+10){const b=tileImg('brick',th);for(let r=0;r<5;r++)for(let c=0;c<5;c++)if(!(r<2&&(c===0||c===4)&&r===0))g.drawImage(b,kx+c*TS,160-(r+1)*TS);
  for(let c=0;c<5;c+=2)g.drawImage(b,kx+c*TS,160-6*TS+8);g.fillStyle=P.k;g.fillRect(kx+32,160-28,16,28);g.fillRect(kx+34,160-30,12,2);g.fillRect(kx+20,160-60,8,10);g.fillRect(kx+52,160-60,8,10)}
 // coins (yours), items (yours), enemies, heroes
 const cf=[0,0,1,2,3,1][(K.tick>>3)%6];for(const q of LV.coins){if(me.got.has(q))continue;const x=(q%LV.W)*TS+3,y=Math.floor(q/LV.W)*TS+2;if(x>cx-16&&x<cx+vw)g.drawImage(coinImg(cf),x,y)}
 for(const h of focus)for(const it of h.items)g.drawImage(itemImg(it.k),Math.round(it.x-8),Math.round(it.y-14));
 for(const e of enemies){if(!e.on&&!K.isClient())continue;if(e.x<cx-20||e.x>cx+vw+20)continue;let k,f;
  if(e.flat)k='flat',f={};else if(e.k===E_GRUMP)k='g',f={fr:(e.t>>3)&1,flip:(e.t>>4)&1};else if(e.k===E_BEETLE)k='b',f={fr:(e.t>>3)&1,flip:e.vx>0};else k='s',f={flip:e.spin&&(K.tick>>2)&1};
  f.up=e.dead;const im=enImg(k,f);g.drawImage(im,Math.round(e.x-im.width/2),Math.round(e.y-im.height+1))}
 const order=heroes.slice().sort((a,b)=>(focus.includes(a)?1:0)-(focus.includes(b)?1:0));
 for(const h of order){const fl=flags(h);if(h.x<cx-20||h.x>cx+vw+20)continue;if(fl&8&&!(fl&16)&&(K.tick>>1)&1)continue;
  const col=fl&4?RAINBOW[(K.tick>>2)%6]:h.col,im=heroImg(h,col,h.pose,fl),x=Math.round(h.x-im.width/2),y=Math.round(h.y-im.height+1);
  if(fl&32){g.drawImage(im,x,y+Math.round(im.height/2),im.width,Math.round(im.height/2))}else g.drawImage(im,x,y);
  if(fl&128)g.drawImage(bubbleImg(),Math.round(h.x-13),Math.round(h.y-im.height/2-15));
  for(const b of(h.i===K.myIdx||isMine(h))?h.fb:(h.fbv||[])){const bx=Math.round(b.x!=null?b.x:b[0]),by=Math.round(b.y!=null?b.y:b[1]);g.fillStyle=P.k;g.fillRect(bx-3,by-3,6,6);g.fillStyle=(K.tick>>1)&1?'#ffa040':'#fff07c';g.fillRect(bx-2,by-2,4,4)}
  const hum=K.seats[h.i]&&K.seats[h.i].ctrl!=='cpu';if(hum&&heroes.length>1&&!focus.includes(h)||hum&&focus.length>1)X.text(g,(h.name||'').slice(0,6),h.x,y-9,{col:h.col,align:'center',outline:P.k})}
 for(const p of parts){if(p.coin){g.drawImage(coinImg((K.tick>>2)&3),Math.round(p.x-5),Math.round(p.y-6));continue}g.fillStyle=p.col;g.fillRect(Math.round(p.x),Math.round(p.y),p.sz||1,p.sz||1)}
 for(const t of texts)if(focus.some(h=>h.i===t.who))X.text(g,t.s,t.x,t.y,{col:t.col,align:'center',outline:P.k});
 g.restore();hud(g,focus,vx,vy,vw,vh)}
const tm=t=>{t=Math.max(0,t);const s=t/60;return Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0')+'.'+String(Math.floor(s*10)%10)};
const PLC=['#fff07c','#e8e4dc','#ffa040'];
function hud(g,focus,vx,vy,vw,vh){const TX=(s,x,y,o)=>X.text(g,s,x,y,Object.assign({outline:P.k},o||{})),me=focus[0];
 if(K.tick<CD+40){const n=K.tick<CD?3-Math.floor(K.tick/(CD/3)):0;TX(n>0?n+'':'GO!',vx+vw/2,vy+50,{col:n>0?'#ffffff':'#88dc48',align:'center',scale:3});
  if(K.tick%(CD/3|0)===0&&K.tick<CD&&K.tick>0)RA.audio.blip(440);if(K.tick===CD)RA.audio.blip(880)}
 if(K.demo){TX('SUPER DASH BROS',vx+vw/2,vy+vh-16,{col:'#fff07c',align:'center',scale:2});return}
 // progress along the course: everyone as a dot
 const bx=vx+vw/2-70,by=vy+16,bw=140;g.fillStyle=P.k;g.fillRect(bx-1,by-1,bw+2,4);g.fillStyle='#5c566c';g.fillRect(bx,by,bw,2);g.fillStyle='#88dc48';g.fillRect(bx+bw-2,by-4,2,6);
 const prog=h=>Math.max(0,Math.min(1,h.x/LV.flagX));for(const h of heroes){if(focus.includes(h))continue;g.fillStyle=h.col;g.fillRect(Math.round(bx+prog(h)*bw)-1,by,2,2)}
 for(const h of focus){const x=Math.round(bx+prog(h)*bw);g.fillStyle=P.k;g.fillRect(x-2,by-3,5,7);g.fillStyle=(K.tick>>3)&1?'#ffffff':h.col;g.fillRect(x-1,by-2,3,5)}
 // place, coins, time
 const pl=me.place||1,pc=PLC[pl-1]||'#ffffff';TX(pl+'',vx+4,vy+14,{col:pc,scale:2});TX(ord(pl).replace(/^\d+/,''),vx+4+X.tw(pl+'',2)+1,vy+14,{col:pc});
 g.drawImage(coinImg(0),vx+4,vy+31);TX('x'+String(me.coins).padStart(2,'0'),vx+17,vy+33,{col:'#ffffff'});
 TX(tm(me.fin?me.ft:K.tick-CD),vx+vw-4,vy+16,{col:'#a0f0ff',align:'right'});
 const t=K.tick-CD,touch=K.seats[me.i]&&K.seats[me.i].ctrl==='touch';
 if(t>0&&t<60*6)TX(touch?'HOLD JUMP FOR HIGHER JUMPS':'A D RUN - SPACE JUMP (HOLD = HIGHER)',vx+vw/2,vy+vh-22,{col:'#ffffff',align:'center'});
 else if(t>=60*6&&t<60*11)TX('JUMP ON ENEMIES - AND ON RIVALS!',vx+vw/2,vy+vh-22,{col:'#fff07c',align:'center'});
 if(me.fire&&t<60*30)TX('E / SHIFT: FIREBALL',vx+vw/2,vy+40,{col:'#ffa040',align:'center'});
 if(me.dead>0&&me.dead<60)TX('GET READY...',vx+vw/2,vy+vh/2,{col:'#ffffff',align:'center'});
 if(me.fin)TX(ord(me.fin)+' PLACE!',vx+vw/2,vy+vh*.35,{col:me.fin<=3?'#fff07c':'#ffffff',align:'center',scale:2})}
function render(ctx,W,H){if(!SCR)SCR=X.screen();const g=SCR.size(W,H);g.fillStyle=P.k;g.fillRect(0,0,SCR.w,SCR.h);
 if(!LV||!heroes.length){SCR.present(ctx,W,H);return}
 let ids=K.demo?[]:K.focus();if(!ids.length){const lead=heroes.slice().sort((a,b)=>a.place-b.place)[0];ids=[lead.i]}
 const focus=ids.map(i=>heroes[i]).filter(Boolean);view(g,focus.length?focus:[heroes[0]],0,0,SCR.w,SCR.h-(K.demo?0:9),0);SCR.present(ctx,W,H)}
K=RA.kit({id:'dash',name:'SUPER DASH BROS',kind:'Platform race',players:'1-20 players',demo:6,localFirst:true,baseH:180,
 desc:'An 8-bit platform race for up to 20: run, jump, stomp, kick shells, smash bricks with a mushroom and throw fireballs, and be first to the flagpole. Land on a rival to flatten them.',
 blurb:'A / D run (you speed up the longer you run), Space / W jump (hold for higher), E / Shift fireball. Be first to the flag!',
 howto:'A / D run, Space / W / click jump (hold it to jump higher), S crouch when big, E / Shift / right-click throws a fireball with the flower. Stomp enemies and rivals, kick shells, every 10 coins gives a dash.',
 icon:['...rrrr...','..rrrrrr..','..ssks....','.sssss....','..ssss....','.rruurr...','rruuuurr..','.uuyuyu...','.uu..uu...','nn....nn..'],
 music:MUSIC,fireLabel:'JUMP',
 modes:[['RACE','Everyone for themselves: first to the flag.'],['TEAM RACE','Red vs blue: points for every finishing place.']],
 settings:[['world','World',[['rnd','Random'],['over','Overworld'],['under','Underground'],['dusk','Dusk']]],['length','Course',[['normal','Normal'],['short','Short'],['long','Long']]],['len','Time limit',[[0,'None'],[3,'3 min'],[5,'5 min']]]],
 kb:[['A D','run'],['SPACE W','jump'],['E SHIFT','fireball'],['S','crouch'],['C','chat'],['ESC','menu']],pad:[['LS','run'],['A','jump'],['B X','fireball'],['START','menu']],
 ach:[{id:'first',name:'First Flag',desc:'Finish your first race',test:s=>s.played>=1,unlock:'title:Plumber'},{id:'win1',name:'Top Of The Pole',desc:'Win a race',test:(s,m)=>m.won,unlock:'title:Speed Runner'},
  {id:'stomp20',name:'Stomper',desc:'Stomp 20 enemies or rivals in one race',test:(s,m)=>m.kills>=20,unlock:'title:Stomper'},{id:'coins50',name:'Coin Collector',desc:'50 coins in one race',test:(s,m)=>m.coins>=50,unlock:'title:Coin Collector'}],
 alive:i=>!!heroes[i],out:i=>!!heroes[i]&&!!heroes[i].fin&&K.state!=='play',
 start,step,local,upload,follow,snap,apply,render,bot,onFx,teamOf,
 info:()=>LV?({over:'Overworld',under:'Underground',dusk:'Dusk'})[LV.theme]:'',
 ranks:()=>heroes.slice().sort((a,b)=>a.place-b.place).map(h=>[h.name,h.col,h.fin?tm(h.ft):Math.round(100*h.x/LV.flagX)+'%']),
 result:(i,w)=>{const h=heroes[i];return{won:!!w&&(w.team!=null?teamOf(i)===w.team:w.i===i),kills:h.stomps|0,coins:h.coins|0}}});
window.__db={get heroes(){return heroes},get lv(){return LV},get enemies(){return enemies},K,bot:i=>bot(i)};

})();
