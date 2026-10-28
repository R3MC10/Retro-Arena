# Atoll art workbench

`art.js` contains the original letter-row sprites. `node game/tools/art/atoll/build.cjs` embeds them into `games/atoll.js` and rebuilds `sheet.html`. Open that HTML through the game server to inspect the sheet; `sheet.png` is the inspected rendering.

`qa/` preserves the reviewed island/display matrix, staged pose sheet, two-human split screen, lobby demo and guest return screenshot. Individual full-resolution test captures are in the ignored `game/tools/test/out/atoll/` directory.

Run the test helpers from `game/tools/test`, with `RA_URL` pointing at this worktree's server and the supplied `NODE_PATH` / `PLAYWRIGHT_BROWSERS_PATH` environment variables. `atoll-suite.cjs` checks mechanics and a rhythmic-jump masher; `atoll-online.cjs` checks host-authoritative powers and guest respawn; `atoll-shots.cjs` captures all island/display combinations; `atoll-probe.cjs` prints death causes from a full skilled match.
