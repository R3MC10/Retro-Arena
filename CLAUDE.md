# Retro Arena - project memory

Read this first, every session. Codex reads it through `AGENTS.md`.

## What it is
A non-commercial collection of retro-style online party games for up to 20 players: browser games on one shared engine,
packed into a Windows desktop app (Electron) with peer-to-peer rooms. The owner is R3MC10. It is a hobby project, free, with no sales.

## Who does what
- **Owner (R3MC10):** decides direction, merges pull requests, and releases.
- **Claude (lead):** plans, splits the work into tasks, writes the briefs for Codex, reviews every change, play-tests, and keeps this file up to date.
- **Codex (builder):** implements tasks on a work branch, following the brief and `.claude/skills/retro-game/SKILL.md`.
- **Quality bar: "no sloppy work".** Work is only done after the play-testing protocol in the skill (section 5), with screenshots checked.

## Workflow
1. Work on a branch `work/<topic>`, never directly on `main`.
2. Commit with messages that say what changed and why. Push the branch and open a pull request.
3. **The owner merges.** A push to `main` builds the Windows release, so nobody but the owner fast-forwards `main`.
   This overrides "fast-forward main" in the skill's section 6.
4. Bump `RA.VERSION` in `game/engine/ra.js` in every PR that changes a game.

## Where things are
- `game/engine/`: shared engine (`ra.js`, `kit.js`, `pix.js`, `ra.css`).
- `game/games/`: one file per game; `README.md` explains how to add a game.
- `game/tools/test/`: smoke / sim / online / shots / frames test scripts (README there).
- `game/tools/art/`: pixel-art workbench and per-game sprite sources.
- `app/`: Electron app and networking (`app/src/net.js`).
- `.claude/skills/retro-game/SKILL.md`: how to build a game to the owner's standard, plus lessons learned. Read it before any game work.

## Status (27 Oct 2026)
- v65+, about 22 games playable, with a release on GitHub. The latest work, from tester feedback, covers Worms, Turbo Karts, Super Dash Bros and readability on big monitors.
- Claude + Codex took over on 27 Oct 2026. First job: a quality audit of every game (smoke tests plus a review), then fixes by priority.

## Decisions log
- 2026-10-27: The project is non-commercial (owner). Claude leads and Codex builds. Work goes through branches and PRs, and the owner merges.

- 2026-10-27: Every game gets full testing (skill section 5: online.js, sim at 8/20 players, novice/skilled, shots checked by the lead).
- 2026-10-27: Build all the coming-soon games in catalog.js, simplest first (8-bit, then bigger 2D, then 3D-styled).
- 2026-10-27: Names that sound like the classics without being them; see `NAMES.md`. Ids stay the same.

## Next
1. Minor fixes from AUDIT.md (branch work/minor-fixes), then the renames from NAMES.md.
2. Full test pass of all 22 games, fixing what it finds, one commit per game.
3. Build the new games in this order: ROAD BRAWLER, F-ONE RACE, RAD RUNNER, CIRCUS CHUCK, MOON BALL, BIG SNOUT, CHIP & CHUM,
   ADVENTURE ATOLL, SUPER CONTACT, GUERRILLA RAID, SKY WRECKER, TETRONIX 2, GOAL RUSH; then METAL SNAIL X, CONTACT FORCE,
   BRAWL STADIUM, CRUSH BASH, LUMINOS 2, PATAPUM, ROLLOROLLO, MORTAL KOMBO 4, GRAND THEFT TOWN, RED ALARM 2,
   POCKET CRITTERS YELLOW, DIABOLO; then the 3D-styled ones. One game per branch and PR.
