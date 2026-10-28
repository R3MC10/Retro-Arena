# Moon Ball art and review images

`art.js` is the hand-painted palette-letter source. `node build.cjs` embeds it in `games/moon.js`.
With the game served and RA_URL set, `node render-sheet.cjs` renders `sheet.png` through RA.pix.
No Python or image generation is required. The sheet was inspected and its layout corrected so all seven sprites fit.

`previews/` preserves the reviewed 20-seat game, Classic and staged charge/collision/pocket/respawn sheet.
Full test images and numerical results are in `game/tools/test/out/moon/` (ignored build output).
Reproduce them with `moon-suite.cjs`, `moon-shots.cjs`, `moon-frames.cjs` and `moon-review.cjs` from `game/tools/test`.
