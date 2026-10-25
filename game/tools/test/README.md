# Test tools

Run from `game/tools/test` after `cd game && python3 -m http.server 8765` (in another shell). Output goes to `./out` (git-ignored).

| Script | What it does |
|---|---|
| `smoke.js <id>` | lobby + a short local match with keys held; screenshots |
| `sim.js <id> [mode] [players] [steps] [humans] [png] [expr]` | plays a whole match at full speed (CPUs), prints winner, results, frame times, snapshot size |
| `online.js <id> [mode] [cpus] [hostExpr] [guestExpr] [guestScript]` | host + guest tabs on a fake network; guest plays; checks both sides |
| `shots.js <id> <players> <name> <steps> [mode] [settingsJSON] [humans]` | seat 0 plays with the CPU brain; full screenshots at the given steps (check every track / mode) |
| `tnprobe.js <players> <steps>` / `tnplay.js tennis <players> <level>` | Centre Court: how points end (calls, shots per point); seat 0 played by the brain at level -1 (novice) .. 2 (skilled) |
| `frames.js <id> <players> <name> <inputFn> <grabFn>` | steps the game frame by frame with scripted keys and builds an animation contact sheet |

`../art/pixart.py` is the sprite workbench: paint sprites as letter rows, `outline()` them, `sheet()` renders a zoomed preview PNG.
