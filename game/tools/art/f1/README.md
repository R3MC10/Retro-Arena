# F-ONE RACE art and review

`art.js` is the hand-painted palette-letter source. Run `node game/tools/art/f1/build.cjs` from the repo root after editing it. It replaces only the ART_BEGIN / ART_END block in games/f1.js. No Python required.

With the game server running, run `node game/tools/art/f1/render-sheet.cjs` to regenerate sheet.png. Set RA_URL to your server. PLAYWRIGHT_BROWSERS_PATH and NODE_PATH must point at the existing test browser and modules.

`review/` preserves the checked track screenshots at all three requested display sizes, split-screen examples, smoke screens and the staged motion contact sheet. Test helpers live in game/tools/test/f1-*.cjs; run from game/tools/test with RA_URL set. The general pass.js supports f-1-race too.
