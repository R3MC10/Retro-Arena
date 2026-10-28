# BIG SNOUT original pixel art

`art.js` is the hand-painted letter-row source. Colours 1/2/3 are player tunic ramps; skin, hair, white loincloth, dark outlines and wooden clubs retain their own colours. It includes idle, two run frames, jump, swing, throw, hurt, duck, ghost, climb and celebration; three dinosaurs with alternate feet; a flapping pterodactyl; a two-pose boss; bones, hearts and cave checkpoints.

From the repository root, with the supplied NODE_PATH and PLAYWRIGHT_BROWSERS_PATH:

```powershell
$env:RA_URL='http://localhost:8778/index.html'
node game/tools/art/snout/embed.cjs
node game/tools/art/snout/render-sheet.cjs
node game/tools/test/snout-qa.cjs
node game/tools/test/snout-frames.cjs
node game/tools/test/snout-suite.cjs shots
node game/tools/test/snout-contact.cjs
```

The game must be served from this worktree. Ports 8766 and 8767 were occupied during implementation; the temporary server used 8778. See `.codex-report-snout.md` for exact test results.

- `sheet.png`: all original sprite rows, enlarged without smoothing.
- `gameplay-preview.png`: staged vine, ride, lava, boss, shop, ghost, swing and throw views.
- `animation-preview.png`: 14 frames driven by input and staged impacts, including movement, attack, stun, ghost and recovery/celebration poses.

The full 45 world/viewport captures and three review contact sheets are in `game/tools/test/out/`. The preview generator stages rare events rather than relying on random screenshots to find them.
