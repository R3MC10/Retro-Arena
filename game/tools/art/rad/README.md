# RAD RUNNER pixel art

art.js is the editable hand-painted letter-row source. 1/2/3 recolor to the driver's palette. car/left/right/roll/win are coupe poses; traffic and van are slower vehicles.

Run node game/tools/art/rad/build.cjs from the root to embed rows in games/rad.js. With the game served and RA_URL set, render-sheet.cjs rebuilds sheet.png using the real RA.pix palette.

qa/ preserves inspected screenshots, review sheets, crash contact sheet and test logs. See /.codex-report-rad.md for the results and limitations.
