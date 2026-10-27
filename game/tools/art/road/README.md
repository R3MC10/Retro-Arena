# Road Brawler pixel workbench

Hand-painted letter rows are in `art.js`. `1/2/3` are player paint shades; all sprites use the engine palette. The car has driving tyre glints, shoulder-check paint, and damaged glass poses; recovery flashes and physical rotation are applied in game.

From the repository root (uses the supplied NODE_PATH and PLAYWRIGHT_BROWSERS_PATH):

    node game/tools/art/road/build.cjs
    node game/tools/art/road/render-sheet.cjs

The second command requires the game server at http://localhost:8766 (or RA_URL) and writes `sheet.png`. Inspect it after editing. Art is embedded into games/road.js so no runtime image loading is required.
