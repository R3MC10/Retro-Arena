# TETRONIX 2 builder report

Built on `work/tetronix-2`. No branch switch, commit or push. RA.VERSION is v90.

## Delivered

- A new 8x16 colour-matching game, not a line-clear or capsule variant: mixed-colour 1-4-cell polyominoes, four marked colours, fixed blinking FLASH targets, horizontal/vertical triples, independent loose-cell gravity, staged clears and chains.
- Same seeded FLASH layout for every well. FLASH RACE has three 55-second rounds (plus brief transitions), finish places and cumulative placement points. Completed players retain their clear time; unfinished players are ranked at the round deadline.
- JUNK BATTLE eliminates topped-out wells, accelerates gravity, and has a hard 180-second limit. A completed FLASH well refills, letting survivors keep attacking.
- TEAM FLASH uses red/blue alternating seats and a shared quota of eight FLASH per teammate. Completed wells refill to keep helping; junk only targets the opposing team. Total team elimination also ends the match. Uneven teams use per-seat progress at timeout; solo practice does not immediately end.
- Junk is grey, falls with loose cells, and breaks only next to a same-row colour clear. Cumulative sent/received counters prevent duplicate attacks across repeated uploads. Pending junk is shown as a count and rising red meter.
- Next piece, ghost landing, remaining FLASH, chain, incoming junk, points, countdown, intro/round banner, ranked mini-wells, two local focus wells, touch and gamepad mapping. Three original tracks: Flash Foundry, Prism Relay, Junk Reactor.
- Save results and three achievements. Catalog entry removed; one script line added to index.html. Kit gained an optional prefix because the original TETRONIX already owns the tet DOM IDs; this game uses te2. Original prefix behavior remains the default.
- Two rotating full wells plus compact per-seat arrays keep the live snapshot small. Local human wells run on their own device; the host routes cumulative junk and eliminates disconnected seats. Results snapshots omit redundant well payloads.

## Executed checks

Environment: inherited NODE_PATH / PLAYWRIGHT_BROWSERS_PATH, Chromium via Playwright. RA_URL=http://localhost:8766/index.html and RA_LOCAL_ROOT pointing at this worktree's game directory.

- `node smoke.js tetris-2 3`: no errors, lobby and all three play screenshots inspected. Held Space rotates; input hooks and real held A/D, Q, S, W were also exercised in the suite. Both local keyboard seats moved independently. Existing TETRONIX smoke regression: no errors, lobby/play screenshots inspected.
- `node pass.js tetris-2`: every mode ended at 8 and 20 seats, no page/console/key-clash errors. Final pass numbers:

|Seats|Mode|Steps / seconds|Peak snapshot chars|Frame median / max ms|Result|
|---|---|---|---|---|---|
|8|Flash Race|10180 / 169.7|885|0.8 / 1.2|Ended; CPU 6 WINS|
|8|Junk Battle|4301 / 71.7|864|0.8 / 1.1|Ended; CPU 5 WINS|
|8|Team Flash|4032 / 67.2|868|1 / 1.2|Ended; RED TEAM WINS|
|20|Flash Race|10181 / 169.7|1619|2.7 / 4|Ended; CPU 20 WINS|
|20|Junk Battle|4328 / 72.1|1539|2.7 / 3.1|Ended; CPU 19 WINS|
|20|Team Flash|4745 / 79.1|1548|2.7 / 3.2|Ended; BLUE TEAM WINS|

- Generic pass online: guest seat 1; leaving stays eliminated. Its position reader reports 0,0 for board games, so that output alone is insufficient evidence of board movement. The dedicated suite additionally compared full wells: guest changed its well, host received that exact well, host changed its well, guest received that exact well. Forced cumulative attack reached a target once and stayed unchanged on repeated uploads. No online errors.
- `node tet2-suite.cjs`: horizontal FLASH removal, vertical triple, fixed targets staying fixed, loose-cell fall, two-chain, same-row junk adjacency (not vertical), real keyboard holds, split screen, host/guest board sync, exactly-once junk and leaver elimination all passed.
- Final TEAM FLASH balance, ten all-CPU Easy matches each: 8 seats: red 4/10, blue 6/10; 20 seats: red 3/10, blue 7/10. No side exceeded 7/10. Raw individual match durations are retained.
- Delayed-input novice (Normal planning brain, eight steps late, 30% of input samples missed) versus three Easy CPUs: places 4, 2, 1, 4, 3, 3, 4, 3, 2, 3; average **2.90/4**, **1/10 wins**. FLASH cleared per match: 2, 8, 11, 7, 10, 5, 9, 8, 11, 10. This is the explicitly measured slow-human model, not an instant CPU seat.
- `node tet2-pace.cjs`: five identical seeds per difficulty, eight seats, 60 simulated seconds, junk off. FLASH per seat per minute: Easy 2.48, Normal 9.5, Hard 12.97. Easy thinking is 240-399 ticks per piece with placement noise; Normal 28 ticks; Hard 8 ticks. Gravity continues while CPUs think.
- `node tet2-skilled.cjs`: ten matches, Hard planning brain through real keyboard mappings without delay versus Normal CPUs. Places 2, 1, 3, 1, 1, 2, 3, 1, 2, 4; average **2.00/4**, four wins and seven top-two results. It beats most individual Normal rivals on average; it does not always win the lobby.
- `node tet2-stress.cjs`: level 10, Fast, junk off, Normal CPUs, every mode at 8/20. All six ended. Steps: 8 seats/mode 0=10199; 8 seats/mode 1=6435; 8 seats/mode 2=3843; 20 seats/mode 0=10199; 20 seats/mode 1=6395; 20 seats/mode 2=2359. Largest snapshot 1601 chars; no errors.
- `node tet2-save.cjs`: dense 20-seat boards, large counters and long player names: **1760 chars live**, **1490 at results**. Save recorded one played / one win and best score; first-match and winner achievements earned; all three track names registered. No errors.
- `node tet2-controls.cjs`: simulated pad A turn / Up hard drop and touch TURN / Up hard drop passed. Solo TEAM FLASH remained playable after 200 steps. Physical controllers and phone hardware were not available.
- `shots.js`: 20 seats, all three modes, steps 300/900, at 1280x720, 2560x1440, and 1536x864 with DPR 1.25: **18 screenshots**, all viewed in review sheets; full 2560 screenshot also viewed. Two-pixel rival cells keep stacks and rank numbers legible; colour-shape marks are intended for the full-size local well. No runtime errors.
- `tet2-visuals.cjs`: eleven staged frames inspected; shows chain 1, falling cells, chain 2 and junk breaking. Pixel sheet, split screen, online host/guest, lobby demo and smoke shots were also inspected.
- `node --check game/games/tetris2.js` and `git diff --check`: clean (Git emits its normal LF/CRLF notices).

## Failures found and corrected

- First art draft was too pale; dark body marks and stronger tile colours fixed it. Mini-well lower labels collided with the following row; kept one compact rank above each rival instead. Engine time text overlapped the pixel title; this game hides its redundant Info line.
- Race placement originally sorted by previous-round points; changed to a separate current-round order before awarding points. Board reset now invalidates the CPU plan. Battle eliminated seats rank by survival time. Winning team sorts first in results.
- TEAM FLASH initially treated individual finished wells as the goal, which could strand teammates; replaced with a shared quota and refill. Solo team practice initially ended immediately because blue had no seats; fixed and tested.
- Early Easy tuning (150-249 thinking ticks) yielded zero novice wins and mostly third/fourth place. An intermediate 300-499 setting was too weak and gave 8/10 wins in one novice sample. Final 240-399 setting produced the measured mid/lower-pack result above and an occasional win.
- A one-off stock novice probe on the intermediate setting finished fourth; a one-off skilled probe finished third. Both completed without runtime errors. Ten-match models are recorded above rather than treating one trial as conclusive.
- First staged visual cleared both colours simultaneously, not a chain. Rebuilt its supports using fixed blocks, rerendered and inspected the actual two-chain.
- The brief's generated server file was absent. Creating it hit EADDRINUSE on 8766 (another checkout); 8767 bind was denied. The existing 8766 server returned 404 for this new game. Added an opt-in Playwright file route in test lib, scoped to RA_URL's origin and a checked root. All reported tests exercised this worktree. A first route attempt shadowed URL; fixed to globalThis.URL. Early runner invocations with a duplicated relative path failed, then were corrected.

## Limits / review notes

- Easy is deliberately much slower than Normal/Hard. The final 20-seat default battle lasted about 72 seconds: within the general 1-3 minute target, shorter than the brief's approximate three-minute battle preference. The hard time cap is three minutes; Normal level-10 battle lasted 107 seconds.
- Novice and balance samples are small and have random layouts/pieces. The final novice average is toward the lower half; longer human sessions may warrant further tuning. No external human playtester or physical pad/touch hardware was used; browser-driven held-key and simulated input checks are stated explicitly.
- At twenty seats rival tiles summarize colours/stacks rather than showing every symbol; the large local well carries the accessible shape marks. The game uses short bitmap HUD text rather than mini-well player names.
- Sound tracks were registered and played by the engine during tests, without WebAudio errors; no subjective listening review is claimed.

## Retained review artifacts

`game/tools/art/tet2/`: art.js, render-sheet.cjs, sheet.png, chains.png, review-1280.png, review-2560.png, review-1536.png, split.png, host.png, guest.png and evidence/*.json. Full-size raw screenshots also remain in ignored game/tools/test/out/. README there gives reproduction commands. No commits or pushes were made.

Report retention: this repository ignores .codex-* files; the requested root report also has a tracked-path copy at game/tools/art/tet2/review-report.md for the lead to include with the game.
