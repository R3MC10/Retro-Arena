# TETRONIX 2 art and review album

Hand-painted 7x7 palette-letter tiles in `art.js`, embedded in `games/tetris2.js`.
The first draft had pale tiles and white marks. The second darkened the body colour
and used dark square / cross / bars / hollow-diamond marks. Both drafts were viewed;
`sheet.png` preserves the final sheet. Flash borders blink; cleared cells blink before
loose cells fall. `chains.png` stages a real two-chain and adjacent junk destruction.

- `review-1280.png`: all three modes, 20 seats, steps 300 and 900, 1280x720.
- `review-2560.png`: same at 2560x1440.
- `review-1536.png`: same at 1536x864, DPR 1.25.
- `split.png`: two independent local keyboards with next-piece panels.
- `host.png`, `guest.png`: real fake-network match after board changes / junk delivery.
- `evidence/`: retained machine-readable results; see `.codex-report-tet2.md` at repo root.

From repo root, set PowerShell environment:

```powershell
$env:RA_URL='http://localhost:8766/index.html'
$env:RA_LOCAL_ROOT=(Resolve-Path game).Path
node game/tools/art/tet2/render-sheet.cjs
```

The optional local-root route lets Playwright serve this worktree's files without
reusing the unrelated worktree currently occupying port 8766. No production networking
is changed. For test scripts, run from `game/tools/test` with that same environment.
Use `tet2-visuals.cjs` after the `shots.js` matrix to recreate the review sheets.
