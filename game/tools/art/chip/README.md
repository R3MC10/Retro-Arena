# CHIP & CHUM pixel art

art.js contains the hand-painted palette-letter rows; player clothing uses 1/2/3 for RA.pix.recolor.
Run node game/tools/art/chip/build.cjs from the repo root to embed them in games/chip.js.
With the game server running, set RA_URL then run node game/tools/art/chip/render-sheet.cjs to regenerate sheet.png.
NODE_PATH and PLAYWRIGHT_BROWSERS_PATH must point at the installed tools.

Reviewed drafts: the initial hero/action sheet, the clustered-leaf tree/bench/flower/gear scenery pass, and the final in-game
scale/readability pass. No Python or image generation is required. Two guardian silhouettes: mechanical cat and robot dog.
Gameplay captures and test data live in game/tools/test/out/chip/. Reproducible checks: chip-suite.cjs,
chip-online.cjs, chip-shots.cjs, plus the standard smoke/pass/novice tools.

Additional co-op/boss checks: chip-extended.cjs. review.png is the 12-view display-size contact sheet.

Fix pass: art.js pads all nine hero poses with a one-pixel dark silhouette; rendering compensates for the extra bottom row.
sheet.png and review.png were regenerated and visually checked. chip-balance.cjs retains the fixed-seed balance sample.
