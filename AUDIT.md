# Retro Arena quality audit

> **Lead review (Claude, 27 Oct 2026):** Codex ran smoke + sim for every id. The 39 BROKEN rows are not broken games:
> they are SOON cartridges in `catalog.js` (ready:false), so they are not bugs. The 22 real games: 13 OK, 9 MINOR, none broken.
> I confirmed TINY TRACKS "RED TEAM WINS! WINS" (tiny.js:97 + kit.js:131). This audit is smoke-level only: held keys and
> CPU sims, no play-feel review. Deeper per-game reviews (novice/skilled play, online.js) come next.

| Status | Game | ID | Finding |
|---|---|---|---|
| BROKEN | ADVENTURE ISLAND | adventure-island | Unfinished catalog entry; ready:false |
| BROKEN | BATTLE STADIUM DON | battle-stadium-don | Unfinished catalog entry; ready:false |
| BROKEN | BIG NOSE | big-nose | Unfinished catalog entry; ready:false |
| BROKEN | CHIP N DALE | chip-n-dale | Unfinished catalog entry; ready:false |
| BROKEN | CIRCUS CHARLIE | circus-charlie | Unfinished catalog entry; ready:false |
| BROKEN | COLIN MCRAE RALLY 2 | colin-mcrae-rally-2 | Unfinished catalog entry; ready:false |
| BROKEN | CONTRA FORCE | contra-force | Unfinished catalog entry; ready:false |
| BROKEN | CRASH BASH | crash-bash | Unfinished catalog entry; ready:false |
| BROKEN | CRASH TAG TEAM RACING | crash-tag-team-racing | Unfinished catalog entry; ready:false |
| BROKEN | CRASH TEAM RACING | crash-team-racing | Unfinished catalog entry; ready:false |
| BROKEN | DIABLO | diablo | Unfinished catalog entry; ready:false |
| BROKEN | DOOM | doom | Unfinished catalog entry; ready:false |
| BROKEN | DRAGON QUEST 8 | dragon-quest-8 | Unfinished catalog entry; ready:false |
| BROKEN | F-1 RACE | f-1-race | Unfinished catalog entry; ready:false |
| BROKEN | GOAL 3 | goal-3 | Unfinished catalog entry; ready:false |
| BROKEN | GTA 2 | gta-2 | Unfinished catalog entry; ready:false |
| BROKEN | GUERRILLA WAR | guerrilla-war | Unfinished catalog entry; ready:false |
| BROKEN | KILLZONE | killzone | Unfinished catalog entry; ready:false |
| BROKEN | KILLZONE LIBERATION | killzone-liberation | Unfinished catalog entry; ready:false |
| BROKEN | LOCOROCO | locoroco | Unfinished catalog entry; ready:false |
| BROKEN | LUMINES 2 | lumines-2 | Unfinished catalog entry; ready:false |
| BROKEN | LUNAR BALL | lunar-ball | Unfinished catalog entry; ready:false |
| BROKEN | METAL GEAR SOLID | metal-gear-solid | Unfinished catalog entry; ready:false |
| BROKEN | METAL SLUG X | metal-slug-x | Unfinished catalog entry; ready:false |
| BROKEN | MORTAL KOMBAT 4 | mortal-kombat-4 | Unfinished catalog entry; ready:false |
| BROKEN | PATAPON | patapon | Unfinished catalog entry; ready:false |
| BROKEN | POKEMON YELLOW | pokemon-yellow | Unfinished catalog entry; ready:false |
| BROKEN | QUAKE 2 | quake-2 | Unfinished catalog entry; ready:false |
| BROKEN | RAD RACER | rad-racer | Unfinished catalog entry; ready:false |
| BROKEN | RED ALERT 2 | red-alert-2 | Unfinished catalog entry; ready:false |
| BROKEN | RESISTANCE 2 | resistance-2 | Unfinished catalog entry; ready:false |
| BROKEN | ROAD FIGHTER | road-fighter | Unfinished catalog entry; ready:false |
| BROKEN | SKY DESTROYER | sky-destroyer | Unfinished catalog entry; ready:false |
| BROKEN | SUIKODEN 2 | suikoden-2 | Unfinished catalog entry; ready:false |
| BROKEN | SUPER CONTRA | super-contra | Unfinished catalog entry; ready:false |
| BROKEN | TETRIS 2 | tetris-2 | Unfinished catalog entry; ready:false |
| BROKEN | THE LEGEND OF DRAGOON | the-legend-of-dragoon | Unfinished catalog entry; ready:false |
| BROKEN | TOMB RAIDER | tomb-raider | Unfinished catalog entry; ready:false |
| BROKEN | TONY HAWKS PRO SKATER 2 | tony-hawks-pro-skater-2 | Unfinished catalog entry; ready:false |
| MINOR | ARKANOID | arkanoid | Final snapshot 3167 characters exceeds 3 KB |
| MINOR | BATTLE CITY | tanks | Harness derives tan instead of bc: game/tools/test/lib.js:13 and game/games/tanks.js:57 |
| MINOR | DR. MARIO | drmario | RACE winner has 0 stages and 8 viruses remaining although description promises first to clear target stages |
| MINOR | GALAXIAN | galaxian | All ships get labels at the same vertical position: game/games/galaxian.js:136 |
| MINOR | MAGIC JEWELRY | jewels | Harness derives jew instead of mj: game/tools/test/lib.js:13 and game/games/jewels.js:53 |
| MINOR | NIGHT SURVIVORS | surv | LAST STANDING extended snapshot 3181 characters exceeds 3 KB (game/games/surv.js:122) |
| MINOR | PAC-MAN | pacman | Name label drawn with Pac at game/games/pacman.js:166 can be covered by subsequent wall rendering; inspect rendering around game/games/pacman.js:190. |
| MINOR | TETRIS | tetris | Raw snapshot=0 is instrumentation failure |
| MINOR | TINY TRACKS | tiny | Exact team result RED TEAM WINS! WINS duplicates winner wording: game/games/tiny.js:97 supplies WINS! and game/engine/kit.js:133 appends WINS |
| OK | BLAST MAZE | blast | No concrete defect established. |
| OK | CENTRE COURT | tennis | No concrete defect established; Space-held smoke does not assess serve timing/balance. |
| OK | DUCK HUNT | duckhunt | No concrete defect established. |
| OK | EXCITEBIKE | excite | No concrete defect established. |
| OK | ICE PEAK | icepeak | No concrete defect established; Space held is not realistic climbing input. |
| OK | JUNGLE FORCE | jungle | No concrete defect established; transient first capture alone cannot diagnose a sprite bug. |
| OK | PIXEL KICK | kick | No concrete defect established. |
| OK | SKY ACES | skyaces | No concrete defect established. |
| OK | SNAKE PIT | snake | No concrete defect established. |
| OK | SUPER DASH BROS | dash | No concrete defect established. |
| OK | TRACK & FIELD | track | No concrete defect established. |
| OK | TURBO KARTS | karts | No concrete defect established; Space-only smoke does not assess steering/balance. |
| OK | WORMS | worms | No concrete defect established. |

## Scope and method

Audit date: 2026-10-27. Branch: `work/audit`. No game or engine source changed. Inventory: 61 IDs from game/games/*.js, including 22 playable registrations (mostly through RA.kit) and 39 unfinished catalog registrations. BROKEN for catalog entries means unavailable to play, **not a regression in a completed game**. No playable game rated MAJOR or BROKEN. MINOR includes presentation, payload-budget, rule-description and harness findings. OK means no concrete defect established by these bounded checks.

Ran `node smoke.js <id>` for all 61 IDs and `node sim.js <id> <mode> 8` for mode 0 and every declared mode: 94 simulation commands. Defaults: smoke has four players, one human holding Space, six seconds, lobby plus three play PNGs about two seconds apart. Sim has eight CPU seats, default settings/difficulty, 20000-step cap. Two test processes ran concurrently; supplemental probes sometimes overlapped. Playwright 1.64.1, Chromium 156.0.8078.4, Node v24.18.0, Windows, 1280x720, DPR 1. Single stochastic runs, not balance statistics.

Opened PNG contact sheets showing all generated smoke images, including every unfinished-entry menu capture. Opened Pac-Man play1 full-size to confirm obscured labels. Battle City/Magic Jewelry play images are supplemental because stock smoke cannot start them. Sky Destroyer/Tetris 2 have misleading menu-only play captures. No screenshot sequence establishes a permanently blank/frozen playable game. Default mode/random-track screenshots only; alternate modes simulated but not visually certified.

Metrics: steps is the script loop index, not exact match duration; ended tests the results overlay. Winner text is exact. Frame samples are the first up to 12 synchronous G.frame calls, sampled every 300 steps, in ms. They exclude simulation cost/asynchronous GPU presentation and are neither average FPS nor whole-match maxima. Concurrent automation affects timing. The tool's snapBytes is JSON.stringify(...).length: UTF-16 code units, not encoded network bytes. Final snapshots are single samples, not peak payloads; lengths over both 3000 and 3072 are flagged against the skill's 3 KB budget. Raw ranks below are the first nine text lines, or all available lines from supplemental probes.

This is the requested smoke/sim/screenshot audit. Online, 20-player, split-screen, novice/skilled input, staged animations, audio listening, other resolutions/scaling and every-track visuals were not tested. Those wider skill-section-5 checks remain unverified.

## Setup and failures

- `npm init -y` created package.json. Initial npm install and Chromium install failed: `EPERM: operation not permitted, mkdir 'C:\Users\r3mc1\AppData\Local\npm-cache\_cacache\tmp'`. Retried successfully with npm_config_cache=$PWD/out/npm-cache and PLAYWRIGHT_BROWSERS_PATH=$PWD/out/browsers. npm reported 0 vulnerabilities.
- Requested hidden background Python launch failed: `Start-Process : This command cannot be run due to the error: Odmowa dostępu.` Direct serve failed: `python : The term 'python' is not recognized as the name of a cmdlet, function, script file, or operable program.` Neither py nor python3 was found. Used a temporary Node HTTP server in ignored out/server.cjs, serving game/ on port 8765.
- `rg : The term 'rg' is not recognized as the name of a cmdlet, function, script file, or operable program.` Used PowerShell searches.
- Stock openGame walks every menu button without rejecting missing/non-ready targets (game/tools/test/lib.js:11). Unfinished IDs leave the menu visible and current can refer to a previously visited game. Sky Destroyer/Tetris 2 share DOM prefixes with Sky Aces/Tetris, so stock tools falsely return NO ERRORS plus residual simulation data. Such results are rejected below. Other unfinished IDs fail in startLocal before console diagnostics are printed.
- Prefix derivation in game/tools/test/lib.js:13 breaks jewels/tanks. All stock commands were attempted. Temporary out/adapt.cjs used mj/bc and existing startLocal/debug snapshot APIs, with eight CPUs and the same loop/cap. All five Jewelry modes were explicitly selected through mjLmode; numeric sim mode arguments do not operate its dropdown. First supplemental attempt failed: `page.evaluate: TypeError: Cannot set properties of null (setting 'value')` because mjs_mode was incorrect. Corrected to mjLmode (game/games/jewels.js:192).
- One contact-sheet command from repo root failed: `Error: ENOENT: no such file or directory, open 'C:\Users\r3mc1\Documents\AI Dev Studio\My Studio\projects\Retro Arena\Retro-Arena\out\inventory.json'`. Reran in game/tools/test successfully.
- Supplemental Tetris probe with an empty PowerShell argument shifted arguments and failed after metrics: `Error: path: unsupported mime type "null"`. Retry with a real PNG argument exposed `page.evaluate: TypeError: Cannot read properties of null (reading 'no')` at `Object.snap (http://localhost:8765/games/tiny.js:103:263)`. Final init-script setter retained both __tt assignments and selected K.root matching Tetris, obtaining its correct snapshot without source changes.
- Extended runs: `node sim.js surv 0 8 100000`, `node sim.js surv 1 8 100000`, `node sim.js tiny 0 8 100000`; all ended.
- An initial long report-generator shell command was rejected by execution policy before running (`rejected: blocked by policy`). Wrote the temporary generator using apply_patch instead; no escalation or game change.
- First report generation failed with `SyntaxError: "undefined" is not valid JSON`: PowerShell redirected extended logs as UTF-16, while generator read UTF-8. Corrected BOM-aware decoding and regenerated.

- Final staging and commit were attempted on work/audit, but both failed: `fatal: Unable to create 'C:/Users/r3mc1/Documents/AI Dev Studio/My Studio/projects/Retro Arena/Retro-Arena/.git/index.lock': Permission denied`. The session grants read-only access to .git; no escalation or permission bypass attempted. No audit commit exists. Configured identity was left unchanged. Intended message: `Audit all registered games with smoke, simulation and screenshot findings`.

Local evidence: ignored game/tools/test/out/ contains inventory.json, per-command *-smoke.json / *-sim-N.json (including stdout, stderr and exit status), adapted results, extended logs and PNGs. Report retains results and exact error messages; local evidence is not committed. Only AUDIT.md and newly created test package.json are left as untracked deliverables, ready to stage and commit. Generated package-lock.json was removed; node_modules and out are ignored. Full stderr stacks remain in local evidence. Failed stock commands did not print captured browser diagnostics; those are unknown, not assumed empty.


## ADVENTURE ISLAND (adventure-island)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:13; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/adventure-island-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## BATTLE STADIUM DON (battle-stadium-don)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:82; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/battle-stadium-don-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## BIG NOSE (big-nose)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:31; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/big-nose-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## CHIP N DALE (chip-n-dale)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:10; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/chip-n-dale-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## CIRCUS CHARLIE (circus-charlie)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:112; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/circus-charlie-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## COLIN MCRAE RALLY 2 (colin-mcrae-rally-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:67; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/colin-mcrae-rally-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## CONTRA FORCE (contra-force)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:19; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/contra-force-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## CRASH BASH (crash-bash)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:43; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/crash-bash-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## CRASH TAG TEAM RACING (crash-tag-team-racing)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:85; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/crash-tag-team-racing-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## CRASH TEAM RACING (crash-team-racing)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:46; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/crash-team-racing-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## DIABLO (diablo)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:70; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/diablo-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## DOOM (doom)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:109; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/doom-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## DRAGON QUEST 8 (dragon-quest-8)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:88; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/dragon-quest-8-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## F-1 RACE (f-1-race)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:22; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/f-1-race-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## GOAL 3 (goal-3)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:4; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/goal-3-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## GTA 2 (gta-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:58; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/gta-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## GUERRILLA WAR (guerrilla-war)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:28; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/guerrilla-war-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## KILLZONE (killzone)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:94; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/killzone-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## KILLZONE LIBERATION (killzone-liberation)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:91; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/killzone-liberation-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## LOCOROCO (locoroco)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:103; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/locoroco-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## LUMINES 2 (lumines-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:100; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/lumines-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## LUNAR BALL (lunar-ball)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:16; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/lunar-ball-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## METAL GEAR SOLID (metal-gear-solid)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:49; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/metal-gear-solid-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## METAL SLUG X (metal-slug-x)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:40; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/metal-slug-x-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## MORTAL KOMBAT 4 (mortal-kombat-4)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:64; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/mortal-kombat-4-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## PATAPON (patapon)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:106; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/patapon-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## POKEMON YELLOW (pokemon-yellow)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:115; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/pokemon-yellow-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## QUAKE 2 (quake-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:73; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/quake-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## RAD RACER (rad-racer)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:34; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/rad-racer-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## RED ALERT 2 (red-alert-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:61; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/red-alert-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## RESISTANCE 2 (resistance-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:97; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/resistance-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## ROAD FIGHTER (road-fighter)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:25; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/road-fighter-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## SKY DESTROYER (sky-destroyer)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:7; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 0: printed NO ERRORS, but captured only the menu.

Sim mode 0, eight requested players, exit 0: returned steps=20000, ended=false, winner=(empty), snapshot=479, frame samples=26.4,0.9,0.9,1.1,1.2,1.1,1,0.8,1.1,1.2,1,0.9; printed NO ERRORS. **Invalid for this ID**: residual game/demo data after failed lookup. Actual completion, winner, snapshot and frame time unavailable.

Screenshots: opened out/sky-destroyer-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. All three play PNGs were also opened and still show the menu.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## SUIKODEN 2 (suikoden-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:52; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/suikoden-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## SUPER CONTRA (super-contra)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:37; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/super-contra-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## TETRIS 2 (tetris-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:118; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 0: printed NO ERRORS, but captured only the menu.

Sim mode 0, eight requested players, exit 0: returned steps=20000, ended=false, winner=(empty), snapshot=480, frame samples=20.3,1,1.1,1.1,0.9,1,1,1,0.9,1.1,0.8,0.8; printed NO ERRORS. **Invalid for this ID**: residual game/demo data after failed lookup. Actual completion, winner, snapshot and frame time unavailable.

Screenshots: opened out/tetris-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. All three play PNGs were also opened and still show the menu.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## THE LEGEND OF DRAGOON (the-legend-of-dragoon)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:55; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/the-legend-of-dragoon-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## TOMB RAIDER (tomb-raider)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:76; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/tomb-raider-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## TONY HAWKS PRO SKATER 2 (tony-hawks-pro-skater-2)

Status: **BROKEN** (expected unfinished catalog entry).

Registration: game/games/catalog.js:79; ready:false registration at game/games/catalog.js:121. No modes declared.

Smoke exit 1: tool error: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')` (startLocal, game/tools/test/lib.js:18). Console/page diagnostics unknown: tool failed before printing them.

Sim mode 0, eight requested players, exit 1: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`. No match for this ID started. Completion, winner, snapshot and frame time unavailable. Console/page diagnostics unknown: tool failed before printing them.

Screenshots: opened out/tony-hawks-pro-skater-2-lobby.png; Retro Arena menu with final SOON catalog selection, not this game. No play PNGs produced.

Problem: no playable implementation for this registered ID (expected unfinished state). Registration pointer above. Missing-ID harness validation: game/tools/test/lib.js:11.

## ARKANOID (arkanoid)

Status: **MINOR**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 ROYALE | 18039 | true | CPU 1 WINS | 3167 | 0.7,1.4,1.1,2.3,1,1,1.1,1.2,1.1,1.4,1.1,1.3 |

Ranks (as printed):

- 0 ROYALE: 1  /  CPU 1  /  R2 · 40370  /  2  /  CPU 6  /  R3 · 35810  /  3  /  CPU 4  /  R2 · 32310

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Balls and brick gaps change across three images. Local board is large, CPU boards smaller with tiny labels. Lobby and legend are readable. Opened out/arkanoid-lobby.png and all three out/arkanoid-play0/1/2.png via contact sheet.

Problems / pointers: Final snapshot 3167 characters exceeds 3 KB. Serialization: game/games/arkanoid.js:96; not a peak-payload measurement.

## BATTLE CITY (tanks)

Status: **MINOR**.

Console/page errors: stock smoke failed: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`; captured browser diagnostics not printed, so unknown. Supplemental smoke: no captured console/page errors. All stock sim modes failed with the same null-click error. The table uses corrected-prefix supplemental runs; original metrics unavailable.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 CO-OP | 6847 | true | CITY SAVED! | 680 | 0.8,1.6,1.3,1.1,1.3,1,1.1,0.9,0.9,0.6,0.8,0.6 |
| 1 VERSUS | 1676 | true | CPU 8 WINS | 575 | 1.5,1.5,1.4,1,1.2,1.1 |
| 2 TEAM WAR | 2540 | true | RED TEAM WINS | 645 | 0.9,2.3,1.3,1.6,1.1,1.3,1.1,25.1,0.9 |
| 3 GROUND WAR | 2453 | true | BLUE TEAM WINS | 771 | 1,2.2,1.1,1.8,1.4,1.3,1,1,1 |

Ranks (as printed):

- 0 CO-OP: 1 / CPU 2 / 18 KO · 5000 / 2 / CPU 4 / 10 KO · 2500 / 3 / CPU 8 / 7 KO · 2000 / 4 / CPU 7 / 8 KO · 1750 / 5 / CPU 1 / 6 KO · 1250 / 6 / CPU 5 / 5 KO · 900 / 7 / CPU 6 / 3 KO · 750 / 8 / CPU 3 / 3 KO · 600
- 1 VERSUS: 1 / CPU 8 / 7 KO · 1750 / 2 / CPU 5 / 1 KO · 200 / 3 / CPU 4 / 5 KO · 1000 / 4 / CPU 2 / 2 KO · 400 / 5 / CPU 6 / 1 KO · 250 / 6 / CPU 3 / 3 KO · 600 / 7 / CPU 1 / 5 KO · 1050 / 8 / CPU 7 / 1 KO · 200
- 2 TEAM WAR: 1 / CPU 1 / 7 KO · 1500 / 2 / CPU 5 / 2 KO · 450 / 3 / CPU 7 / 2 KO · 400 / 4 / CPU 3 / 1 KO · 200 / 5 / CPU 4 / 1 KO · 200 / 6 / CPU 6 / 2 KO · 400 / 7 / CPU 8 / 1 KO · 200 / 8 / CPU 2 / 3 KO · 600
- 3 GROUND WAR: 1 / CPU 2 / 6 KO · 1650 / 2 / CPU 8 / 4 KO · 900 / 3 / CPU 6 / 2 KO · 300 / 4 / CPU 1 / 1 KO · 250 / 5 / CPU 4 / 1 KO · 200 / 6 / CPU 5 / 1 KO · 200 / 7 / CPU 7 / 1 KO · 200 / 8 / CPU 3 / 0 KO · 0

Sim console/page errors: all supplemental runs captured none.

Screenshots: Supplemental captures show tanks, eagle, walls, vegetation, shells, counter and minimap. CPUs move and counter drops; local stays at spawn with Space held. Legend below map. Opened out/tanks-lobby.png and all three out/tanks-play0/1/2.png via contact sheet.

Problems / pointers: Harness derives tan instead of bc: game/tools/test/lib.js:13 and game/games/tanks.js:57. All four supplemental modes end; no visual game defect established.

## DR. MARIO (drmario)

Status: **MINOR**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 VERSUS | 8851 | true | CPU 8 WINS | 2567 | 1,1.3,1.7,1.5,1.7,2,1.7,1.8,2.2,1.7,2,2.2 |
| 1 RACE | 4809 | true | CPU 7 WINS | 2566 | 1.1,1.3,1,2.1,2,1.6,1.9,2.9,1.2,2,2.2,2 |

Ranks (as printed):

- 0 VERSUS: 1  /  CPU 8  /  0 stages · 6 virus  /  2  /  CPU 2  /  0 stages · 6 virus  /  3  /  CPU 4  /  0 stages · 10 virus
- 1 RACE: 1  /  CPU 7  /  0 stages · 8 virus  /  2  /  CPU 4  /  0 stages · 14 virus  /  3  /  CPU 2  /  0 stages · 13 virus

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Four bottles, viruses, capsules and next previews render. CPU stacks and virus counts change; legend below bottles. Opened out/drmario-lobby.png and all three out/drmario-play0/1/2.png via contact sheet.

Problems / pointers: RACE winner has 0 stages and 8 viruses remaining although description promises first to clear target stages. Last-survivor fallback applies in both modes at game/games/drmario.js:78; stage target at :54; description at :128. Possibly intentional, but not explained in displayed race rule.

## GALAXIAN (galaxian)

Status: **MINOR**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 CO-OP | 4186 | true | GAME OVER · WAVE 3 | 1782 | 0.5,0.5,0.5,0.6,0.4,0.5,0.5,0.5,1.2,0.3,0.4,0.3 |
| 1 SCORE ATTACK | 6727 | true | CPU 1 WINS | 959 | 0.5,0.6,0.6,0.4,0.3,0.3,0.7,0.5,0.4,1.2,0.4,0.5 |

Ranks (as printed):

- 0 CO-OP: 1  /  CPU 1  /  3930 · 38 aliens  /  2  /  CPU 6  /  2370 · 21 aliens  /  3  /  CPU 5  /  2220 · 22 aliens
- 1 SCORE ATTACK: 1  /  CPU 1  /  4700 · 45 aliens  /  2  /  CPU 3  /  3780 · 28 aliens  /  3  /  CPU 4  /  3130 · 27 aliens

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Formation, diving enemies, bullets, ships and scoreboard render; scores change. FROZEN / CONVOY FREEZE is an item effect, with active bullets and changing scores. Bottom ship names overlap one another and crowd the legend. Opened out/galaxian-lobby.png and all three out/galaxian-play0/1/2.png via contact sheet.

Problems / pointers: All ships get labels at the same vertical position: game/games/galaxian.js:136. Four-seat screenshots show overlapping CPU names near the legend.

## MAGIC JEWELRY (jewels)

Status: **MINOR**.

Console/page errors: stock smoke failed: `page.evaluate: TypeError: Cannot read properties of null (reading 'click')`; captured browser diagnostics not printed, so unknown. Supplemental smoke: no captured console/page errors. All stock sim modes failed with the same null-click error. The table uses corrected-prefix supplemental runs; original metrics unavailable.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 ffa | 6192 | true | CPU 5 WINS | 1153 | 12.6,10.7,11.4,10.4,11.7,10.2,10.9,12.1,11.4,11.6,215.2,10.2 |
| 1 teams | 4754 | true | BLUE TEAM WINS | 1171 | 9.8,11.1,12.2,11.1,12.5,10.7,13.7,10.7,13.3,12.1,40.5,12 |
| 2 royale | 5519 | true | CPU 8 WINS | 1129 | 11.5,12.6,10.7,11.6,13.8,11.4,11,11.4,38,11.1,204.6,12 |
| 3 coop | 10786 | true | TEAM SCORE 102714 | 1149 | 10.5,12.1,10.7,11.2,11.4,13.4,17.2,10.7,11.5,39.4,216.4,12.3 |
| 4 race | 6040 | true | CPU 8 WINS | 1124 | 10,11.8,10.4,10.8,10.6,9.8,11.2,10.3,11.1,9.4,37.6,11.1 |

Ranks (as printed):

- 0 ffa: 1 / CPU 5 / 7 KO · 10860 / 2 / CPU 2 / 6294 / 3 / CPU 4 / 2 KO · 5716 / 4 / CPU 1 / 4058 / 5 / CPU 6 / 2 KO · 3193 / 6 / CPU 3 / 3007 / 7 / CPU 8 / 1035 / 8 / CPU 7 / 726
- 1 teams: 1 / CPU 8 / 1 KO · 4009 / 2 / CPU 6 / 1 KO · 3872 / 3 / CPU 4 / 3 KO · 3027 / 4 / CPU 3 / 1 KO · 7129 / 5 / CPU 1 / 1552 / 6 / CPU 7 / 2426 / 7 / CPU 5 / 1844 / 8 / CPU 2 / 1407
- 2 royale: 1 / CPU 8 / 6 KO · 11743 / 2 / CPU 4 / 2 KO · 6197 / 3 / CPU 1 / 1 KO · 5125 / 4 / CPU 2 / 6071 / 5 / CPU 7 / 4973 / 6 / CPU 5 / 2600 / 7 / CPU 3 / 1057 / 8 / CPU 6 / 442
- 3 coop: 1 / CPU 4 / 4 KO · 38216 / 2 / CPU 2 / 37597 / 3 / CPU 6 / 7453 / 4 / CPU 5 / 1 KO · 5629 / 5 / CPU 8 / 6176 / 6 / CPU 7 / 4334 / 7 / CPU 1 / 1680 / 8 / CPU 3 / 1629
- 4 race: 1 / CPU 8 / 2 KO · 9989 / 2 / CPU 7 / 3 KO · 7056 / 3 / CPU 3 / 6489 / 4 / CPU 5 / 2 KO · 5081 / 5 / CPU 2 / 2775 / 6 / CPU 4 / 954 / 7 / CPU 1 / 768 / 8 / CPU 6 / 1027

Sim console/page errors: all supplemental runs captured none.

Screenshots: Supplemental captures show four gem wells, next columns, falling/stacked jewels and changing scores. Lobby and bottom legend readable. Opened out/jewels-lobby.png and all three out/jewels-play0/1/2.png via contact sheet.

Problems / pointers: Harness derives jew instead of mj: game/tools/test/lib.js:13 and game/games/jewels.js:53. Supplemental render samples include 204.6-216.4 ms outliers (render entry game/games/jewels.js:591); concurrent synchronous sampling cannot establish sustained low FPS.

## NIGHT SURVIVORS (surv)

Status: **MINOR**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 CO-OP | 20000 | false | (empty) | 2662 | 1.1,3.1,3.9,1.3,2.4,2.8,2.4,2.5,3.3,2.8,2.7,3 |
| 1 LAST STANDING | 20000 | false | (empty) | 2410 | 1.4,3.2,1.8,1.8,1.6,2.1,2,1.7,2.1,1.9,1.6,2.6 |
| 0 extended, 100000 cap | 21639 | true | DAWN!  YOU SURVIVED | 2586 | 0.9,2.6,2.3,1.6,2.2,1.1,0.8,1.2,1.8,1.4,2.1,1 |
| 1 extended, 100000 cap | 21639 | true | CPU 8 WINS | 3181 | 1.1,2.7,1.5,1.5,1.6,1.7,1.2,1.4,1.4,0.9,1,1.7 |

Ranks (as printed):

- 0 CO-OP: 
- 1 LAST STANDING: 
- 0 extended: 1  /  CPU 6  /  975 kills · level 15  /  2  /  CPU 4  /  939 kills · level 14  /  3  /  CPU 3  /  827 kills · level 20
- 1 extended: 1  /  CPU 8  /  865 kills · level 12  /  2  /  CPU 4  /  828 kills · level 13  /  3  /  CPU 1  /  780 kills · level 12

Sim console/page errors: all completed stock runs printed `NO ERRORS`. Extended runs also printed `NO ERRORS`.

Screenshots: Characters, weapon arcs/projectiles, gems, bats, health/XP, kills/countdown render. Tutorial changes to revive guidance; legend separate. Opened out/surv-lobby.png and all three out/surv-play0/1/2.png via contact sheet.

Problems / pointers: LAST STANDING extended snapshot 3181 characters exceeds 3 KB (game/games/surv.js:122). The 20000-step cap is shorter than the six-minute default (game/games/surv.js:227); both extended runs end.

## PAC-MAN (pacman)

Status: **MINOR**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 BATTLE | 10839 | true | CPU 1 WINS | 1353 | 0.2,0.4,0.5,0.5,0.3,0.4,0.3,0.3,0.3,0.5,0.2,0.2 |
| 1 CO-OP | 10839 | true | TIME! LEVEL 1 | 1373 | 0.5,0.7,0.6,0.4,0.3,0.5,0.6,0.4,0.3,0.5,0.3,0.7 |
| 2 CHOMP | 10838 | true | CPU 1 WINS | 1370 | 0.3,0.6,0.5,0.4,0.3,0.4,0.6,0.4,0.4,0.4,0.3,0.5 |

Ranks (as printed):

- 0 BATTLE: 1  /  CPU 1  /  2660 pts · 0 ghosts  /  2  /  CPU 4  /  1920 pts · 1 ghosts  /  3  /  CPU 2  /  880 pts · 1 ghosts
- 1 CO-OP: 1  /  CPU 5  /  2860 pts · 0 ghosts  /  2  /  CPU 3  /  2140 pts · 0 ghosts  /  3  /  CPU 4  /  1980 pts · 0 ghosts
- 2 CHOMP: 1  /  CPU 1  /  6510 pts · 1 ghosts  /  2  /  CPU 2  /  5910 pts · 3 ghosts  /  3  /  CPU 5  /  5000 pts · 0 ghosts

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Maze, pellets, ghosts, powered Pacs and scores render; pellets decrease 180 to 153 to 137. Green CPU 3 label is partly hidden by walls in play1/play2. Legend stays below maze. Confirmed play1 at full size. Opened out/pacman-lobby.png and all three out/pacman-play0/1/2.png via contact sheet.

Problems / pointers: Name label drawn with Pac at game/games/pacman.js:166 can be covered by subsequent wall rendering; inspect rendering around game/games/pacman.js:190.

## TETRIS (tetris)

Status: **MINOR**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 99 BATTLE | 5284 | true | CPU 4 WINS | 0 | 0.2,0.7,0.4,1,0.9,0.7,1.2,0.7,28.5,0.9,0.9,1 |
| 0 preserved-hook probe | 5425 | true | CPU 3 WINS | 3272 | 0.3,0.8,1.5,1,0.9,1.1,1.3,1.2,33.8,1,1.5,1.3 |

Ranks (as printed):

- 0 99 BATTLE: 1  /  CPU 4  /  1 KO · 28 lines  /  2  /  CPU 5  /  1 KO · 26 lines  /  3  /  CPU 1  /  2 KO · 27 lines
- preserved-hook probe: 1 / CPU 3 / 2 KO · 25 lines / 2 / CPU 5 / 1 KO · 26 lines / 3 / CPU 4 / 0 KO · 19 lines / 4 / CPU 6 / 1 KO · 17 lines / 5 / CPU 2 / 0 KO · 18 lines / 6 / CPU 8 / 0 KO · 17 lines / 7 / CPU 1 / 0 KO · 17 lines / 8 / CPU 7 / 0 KO · 9 lines

Sim console/page errors: all completed stock runs printed `NO ERRORS`. Explicit hook-probe tool errors are recorded in setup; final preserved-hook probe captured none. Raw snapshot zero is unavailable measurement, not zero-byte traffic.

Screenshots: Four wells, colored pieces, ghost, next queue, hold/stats render. CPU stacks change and local piece descends after held hard drop. Legend below wells. Opened out/tetris-lobby.png and all three out/tetris-play0/1/2.png via contact sheet.

Problems / pointers: Raw snapshot=0 is instrumentation failure. Tetris game/games/tetris.js:159 and Tiny Tracks game/games/tiny.js:163 both assign window.__tt; Tiny Tracks overwrites Tetris hook. game/tools/test/sim.js:9 silently swallows snapshot errors. Preserved-hook probe measures correct Tetris snapshot at 3272 characters, above 3 KB; serialization game/games/tetris.js:97.

## TINY TRACKS (tiny)

Status: **MINOR**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 RACE | 20000 | false | (empty) | 455 | 0.6,2.1,1.1,1.5,1.1,1,0.7,1.6,0.8,0.4,1.2,0.3 |
| 1 TEAM RACE | 16214 | true | RED TEAM WINS! WINS | 745 | 0.4,0.9,0.8,0.6,0.7,0.7,0.4,0.4,0.5,0.4,0.4,0.4 |
| 0 extended, 100000 cap | 22192 | true | CPU 6 WINS | 720 | 0.5,3.4,1.3,1.7,0.9,1.4,0.6,0.8,1.2,2,1.8,3.2 |

Ranks (as printed):

- 0 RACE: 
- 1 TEAM RACE: 1  /  CPU 1  /  5 rounds  /  2  /  CPU 8  /  1 round  /  3  /  CPU 2  /  0 rounds
- 0 extended: 1  /  CPU 6  /  5 rounds  /  2  /  CPU 1  /  2 rounds  /  3  /  CPU 8  /  1 round

Sim console/page errors: all completed stock runs printed `NO ERRORS`. Extended runs also printed `NO ERRORS`.

Screenshots: Table, cars, plates, scoreboard and steering hint render. Unsteered human leaves road; OUT! BACK NEXT ROUND appears while CPUs continue. No blank/frozen field or legend obstruction. Opened out/tiny-lobby.png and all three out/tiny-play0/1/2.png via contact sheet.

Problems / pointers: Exact team result RED TEAM WINS! WINS duplicates winner wording: game/games/tiny.js:97 supplies WINS! and game/engine/kit.js:133 appends WINS. Race cap reached at 20000 but extended run ends at 22192; not evidence of a hang.

## BLAST MAZE (blast)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 BATTLE | 8323 | true | CPU 7 WINS | 1009 | 0.8,0.8,1.1,0.7,1,0.8,0.5,0.7,1.1,1,0.8,0.5 |
| 1 TEAMS | 10948 | true | RED TEAM WINS | 947 | 0.7,1,0.9,1,0.9,0.9,0.8,0.7,0.9,0.6,0.6,0.6 |
| 2 CO-OP | 1341 | true | GAME OVER | 1066 | 0.6,1,1,0.5,0.5 |

Ranks (as printed):

- 0 BATTLE: 1  /  CPU 7  /  ★4 · 0 KO  /  2  /  CPU 2  /  ★2 · 1 KO  /  3  /  CPU 4  /  ★1 · 1 KO
- 1 TEAMS: 1  /  CPU 5  /  ★4 · 2 KO  /  2  /  CPU 1  /  ★4 · 1 KO  /  3  /  CPU 3  /  ★4 · 1 KO
- 2 CO-OP: 1  /  CPU 6  /  ★0 · 4 KO  /  2  /  CPU 3  /  ★0 · 1 KO  /  3  /  CPU 8  /  ★0 · 1 KO

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Bombers, bombs, brick destruction and power-ups render. Eliminated local player becomes a revenge cart outside the arena. Names and legend readable. Opened out/blast-lobby.png and all three out/blast-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.

## CENTRE COURT (tennis)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 SINGLES LADDER | 13916 | true | CPU 4 WINS | 1214 | 0.8,1.4,1.4,1.2,0.8,0.8,0.9,1.9,1.1,0.7,1.1,0.9 |
| 1 DOUBLES LADDER | 11499 | true | C1+C2 WINS | 857 | 0.6,0.8,1.3,0.9,0.7,1.2,0.5,1.3,0.6,1,0.9,1.3 |

Ranks (as printed):

- 0 SINGLES LADDER: 1  /  CPU 4  /  Champion  /  2  /  CPU 3  /  Centre Court  /  3  /  CPU 2  /  Court 2
- 1 DOUBLES LADDER: 1  /  C1+C2  /  Champion  /  2  /  C7+C8  /  Centre Court  /  3  /  C5+C6  /  Court 2

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Court, net, ball, players, points, ladder/round and swing/lob hint render. ACE appears and points change. Long hint approaches right edge; bottom legend does not cover players. Opened out/tennis-lobby.png and all three out/tennis-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established; Space-held smoke does not assess serve timing/balance.

## DUCK HUNT (duckhunt)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 HUNT | 4215 | true | CPU 2 WINS | 698 | 0.2,0.5,0.2,0.5,0.2,0.2,0.4,0.5,0.2,0.3,0.3,0.3 |
| 1 BE THE DUCK | 2939 | true | CPU 6 WINS | 690 | 0.3,4.9,0.4,0.3,0.4,0.2,0.3,0.2,0.3,0.4 |
| 2 CLAY | 2507 | true | CPU 2 WINS | 683 | 0.3,0.3,0.4,0.3,0.4,0.4,0.3,0.4,0.3 |

Ranks (as printed):

- 0 HUNT: 1  /  CPU 2  /  17000 · 11 hits  /  2  /  CPU 1  /  10000 · 10 hits  /  3  /  CPU 4  /  5500 · 6 hits
- 1 BE THE DUCK: 1  /  CPU 6  /  5000 · 2 hits  /  2  /  CPU 1  /  4000 · 3 hits  /  3  /  CPU 3  /  2000 · 2 hits
- 2 CLAY: 1  /  CPU 2  /  8800 · 7 hits  /  2  /  CPU 5  /  5600 · 7 hits  /  3  /  CPU 6  /  1600 · 2 hits

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Ducks, crosshairs, dog, balloons, ammo and scores render. Round advances 1 to 2. CPU aim labels cluster, but targets/local crosshair remain visible; legend clear. Opened out/duckhunt-lobby.png and all three out/duckhunt-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.

## EXCITEBIKE (excite)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 RACE | 4718 | true | CPU 2 WINS | 772 | 1.7,4,13.7,11,7.3,4.7,3.5,5.1,6.4,6,2.6,2.6 |
| 1 TEAM RACE | 4835 | true | BLUE TEAM WINS | 827 | 1.8,3.6,9.7,10.8,7.5,5.1,5,3.9,3,3.1,3.7,2 |
| 2 ELIMINATOR | 4715 | true | CPU 1 WINS | 823 | 1.9,5.3,3.2,18.2,7.3,4.8,6.6,9,5.4,6.1,3.6,4.1 |

Ranks (as printed):

- 0 RACE: 1  /  CPU 2  /  1:10.96  /  2  /  CPU 8  /  1:13.00  /  3  /  CPU 4  /  1:14.21
- 1 TEAM RACE: 1  /  CPU 4  /  1:12.88  /  2  /  CPU 1  /  1:13.91  /  3  /  CPU 8  /  1:14.66
- 2 ELIMINATOR: 1  /  CPU 1  /  1:10.18  /  2  /  CPU 8  /  1:12.63  /  3  /  CPU 3  /  1:12.78

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Night stadium, detailed bikes/riders, lights, ramp, crate and temperature/lap HUD render. Countdown becomes racing and positions change; track stays visible above legend. Opened out/excite-lobby.png and all three out/excite-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.

## ICE PEAK (icepeak)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 RACE | 10808 | true | CPU 6 WINS | 959 | 0.7,3.4,2.1,1.7,1.7,2.2,2,1.9,1.9,1.4,1.2,1.1 |
| 1 TEAM RACE | 13235 | true | BLUE TEAM WINS | 1024 | 0.8,3,2.3,2,1.7,1,1.2,1.2,1.2,1.6,19.5,0.8 |
| 2 CO-OP CLIMB | 11620 | true | ALL TO THE TOP! | 1027 | 0.7,4.3,3.9,1.6,20.6,1.7,2.2,1,0.9,0.9,1.3,1.3 |

Ranks (as printed):

- 0 RACE: 1  /  CPU 6  /  summit 172.0s  /  2  /  CPU 4  /  floor 15  /  3  /  CPU 3  /  floor 14
- 1 TEAM RACE: 1  /  CPU 6  /  summit 212.4s  /  2  /  CPU 8  /  summit 212.7s  /  3  /  CPU 1  /  floor 16
- 2 CO-OP CLIMB: 1  /  CPU 2  /  summit 184.8s  /  2  /  CPU 1  /  summit 191.3s  /  3  /  CPU 6  /  floor 15

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Floors, ice gaps, climbers, countdown, snowballs and progress strip render. CPUs advance/break ice while local stays on floor 0 with Space held. Hint and legend readable. Opened out/icepeak-lobby.png and all three out/icepeak-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established; Space held is not realistic climbing input.

## JUNGLE FORCE (jungle)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 CO-OP | 6076 | true | FORTRESS DESTROYED! | 1031 | 0.8,2.3,2.4,3.5,1.7,1.6,1.7,2.4,2.4,1.3,1.5,1.2 |
| 1 SCORE ATTACK | 6432 | true | CPU 8 WINS | 1050 | 1.3,2.9,3.3,3.7,1.5,2,2.1,1.2,1.1,1.4,1.7,1.2 |

Ranks (as printed):

- 0 CO-OP: 1  /  CPU 6  /  5300 pts · 2 kills  /  2  /  CPU 4  /  1600 pts · 6 kills  /  3  /  CPU 5  /  900 pts · 5 kills
- 1 SCORE ATTACK: 1  /  CPU 8  /  5700 pts · 2 kills  /  2  /  CPU 7  /  1100 pts · 1 kills  /  3  /  CPU 3  /  1000 pts · 9 kills · out

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Lobby instructions/scenery render. First play capture has no visible characters; both later images show human, three allies and a moving shot, so sprites are not persistently missing. HUD/tutorial/legend readable. Opened out/jungle-lobby.png and all three out/jungle-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established; transient first capture alone cannot diagnose a sprite bug.

## PIXEL KICK (kick)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 MATCH | 10882 | true | RED 4-1 WINS | 979 | 1,1.9,1.9,1.1,1.2,3.4,1.2,2.1,1.5,1.1,1.8,0.8 |
| 1 CO-OP | 10839 | true | YOU WIN 8-0! | 1254 | 0.9,1.7,2.6,1.4,1.6,2.5,4.7,0.9,1.4,1.2,0.8,1 |

Ranks (as printed):

- 0 MATCH: 1  /  CPU 5  /  2 goals · RED  /  2  /  CPU 7  /  2 goals · RED  /  3  /  CPU 1  /  0 goals · RED
- 1 CO-OP: 1  /  CPU 7  /  3 goals · you  /  2  /  CPU 6  /  2 goals · you  /  3  /  CPU 8  /  2 goals · you

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Pitch, ball, players, keeper, goals, clock/stamina and minimap render. Camera follows play; SAVE appears. Large pass/shoot hint occupies upper pitch space but play stays readable; legend below pitch. Opened out/kick-lobby.png and all three out/kick-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.

## SKY ACES (skyaces)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 DOGFIGHT | 1653 | true | CPU 1 WINS | 1044 | 0.2,0.8,0.6,0.5,1.3,0.3 |
| 1 SQUADRONS | 1496 | true | RED SQUADRON WINS | 1018 | 0.2,0.5,0.4,0.8,0.5 |
| 2 CO-OP | 18039 | true | TIME! WAVE 3 | 971 | 0.3,0.9,0.4,1.8,0.7,0.6,0.5,0.4,0.4,0.4,0.5,0.6 |

Ranks (as printed):

- 0 DOGFIGHT: 1  /  CPU 1  /  6 kills · 2 down  /  2  /  CPU 8  /  5 kills · 3 down  /  3  /  CPU 4  /  3 kills · 3 down
- 1 SQUADRONS: 1  /  CPU 2  /  5 kills · 3 down  /  2  /  CPU 1  /  4 kills · 2 down  /  3  /  CPU 3  /  4 kills · 2 down
- 2 CO-OP: 1  /  CPU 7  /  12 kills · 1 down  /  2  /  CPU 2  /  7 kills · 1 down  /  3  /  CPU 4  /  7 kills · 3 down

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Planes, bullets, lives/HP/kills, map and item messages render. Local loses a life and positions change. Effect labels crowd during combat but no unreadable layout established; legend separate. Opened out/skyaces-lobby.png and all three out/skyaces-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.

## SNAKE PIT (snake)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 FREE FOR ALL | 1948 | true | CPU 8 WINS | 1554 | 0.4,1,0.5,0.4,0.7,0.5,0.4 |
| 1 TEAMS | 2110 | true | RED TEAM WINS | 1629 | 0.7,1.2,0.7,0.9,0.5,0.4,0.6,0.6 |

Ranks (as printed):

- 0 FREE FOR ALL: 1  /  CPU 8  /  best 8 · 0 KO  /  2  /  CPU 4  /  best 12 · 2 KO  /  3  /  CPU 1  /  best 11 · 0 KO
- 1 TEAMS: 1  /  CPU 7  /  best 11 · 0 KO  /  2  /  CPU 6  /  best 9 · 1 KO  /  3  /  CPU 3  /  best 9 · 1 KO

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Snake, apples, obstacles and scoreboard render. Later images show fruit/death particles and respawned CPU; absent local after collision is not a blank canvas. Legend clear. Opened out/snake-lobby.png and all three out/snake-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.

## SUPER DASH BROS (dash)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 RACE | 12325 | true | CPU 5 WINS | 703 | 1.1,4.5,2.8,0.6,2.1,1.3,1.5,1.7,2.6,4.4,23.1,2.5 |
| 1 TEAM RACE | 13285 | true | RED TEAM WINS | 725 | 1,4.1,2.2,1.2,0.8,1.1,1,1.3,4,1,23.5,1.3 |

Ranks (as printed):

- 0 RACE: 1  /  CPU 5  /  27 pts  /  2  /  CPU 4  /  25 pts  /  3  /  CPU 7  /  23 pts
- 1 TEAM RACE: 1  /  CPU 1  /  28 pts  /  2  /  CPU 8  /  28 pts  /  3  /  CPU 5  /  25 pts

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Countdown becomes racing; four distinct runners change positions. Local trails because Space-only input does not run right. Clear tutorial and separate bottom legend. Opened out/dash-lobby.png and all three out/dash-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.

## TRACK & FIELD (track)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 MEET | 6184 | true | CPU 2 WINS | 969 | 2.6,2.5,2.3,2.2,2.5,4.4,2.8,1.6,1.9,3.7,2.8,2.1 |
| 1 TEAM MEET | 6122 | true | BLUE TEAM WINS | 990 | 3.9,2.9,2.2,2,1.7,5.1,2.9,2.2,2.5,5.3,3.2,1.9 |

Ranks (as printed):

- 0 MEET: 1  /  CPU 2  /  24 pts · 1/0/2  /  2  /  CPU 7  /  24 pts · 1/0/2  /  3  /  CPU 8  /  24 pts · 0/2/0
- 1 TEAM MEET: 1  /  CPU 2  /  27 pts · 2/0/1  /  2  /  CPU 5  /  22 pts · 1/1/0  /  3  /  CPU 6  /  18 pts · 0/1/1

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Runners, instructions, countdown, track, timer and speed bar render. At six seconds runners just leave start; simulations complete, not evidence of freezing. Legend separate. Opened out/track-lobby.png and all three out/track-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.

## TURBO KARTS (karts)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 RACE | 4423 | true | CPU 1 WINS | 830 | 1.5,4,4.3,2.1,4.3,3.2,1.3,3.1,3.7,2.4,1.1,3.5 |
| 1 TEAM RACE | 5627 | true | RED TEAM WINS | 842 | 1.6,2.6,2.2,2.7,2.2,2,1.3,1.6,1.7,1.6,1.3,1.6 |
| 2 BALLOON BATTLE | 5916 | true | CPU 1 WINS | 913 | 1.7,3.1,2,2.3,2,1.5,2.5,3.4,2.2,4.7,2.2,2.7 |
| 3 TEAM BATTLE | 2711 | true | BLUE TEAM WINS | 972 | 1.4,2.5,3.1,2.2,2.6,2,1.7,1.3,2.9,2.8 |

Ranks (as printed):

- 0 RACE: 1  /  CPU 1  /  1:04.61  /  2  /  CPU 3  /  1:07.73  /  3  /  CPU 5  /  1:09.48
- 1 TEAM RACE: 1  /  CPU 5  /  1:25.68  /  2  /  CPU 1  /  1:28.16  /  3  /  CPU 4  /  1:28.25
- 2 BALLOON BATTLE: 1  /  CPU 1  /  4 balloons · 8 hits  /  2  /  CPU 2  /  out · 5 hits  /  3  /  CPU 7  /  out · 5 hits
- 3 TEAM BATTLE: 1  /  CPU 8  /  5 balloons · 3 hits  /  2  /  CPU 6  /  2 balloons · 2 hits  /  3  /  CPU 4  /  1 balloons · 7 hits

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Frosty Peaks, karts, lights/countdown, minimap and standings render. Positions/scenery change; unsteered local reaches track edge. Hint and legend readable. Opened out/karts-lobby.png and all three out/karts-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established; Space-only smoke does not assess steering/balance.

## WORMS (worms)

Status: **OK**.

Console/page errors: stock smoke printed `NO ERRORS`.

| Mode | Steps | Ended | Winner/result text | Snapshot length | Frame samples (ms) |
|---|---:|---|---|---:|---|
| 0 FREE FOR ALL | 14185 | true | CPU 8 WINS | 1888 | 1.8,4.5,1.8,1.3,1.4,3.5,3.5,4,3.3,1.7,1.1,1.1 |
| 1 TEAMS | 11903 | true | RED TEAM WINS | 1860 | 2.5,3.8,4,3.9,1.8,1.8,2.9,3.8,3.1,4.2,2.1,3.6 |

Ranks (as printed):

- 0 FREE FOR ALL: 1  /  CPU 8  /  41 hp  /  2  /  CPU 2  /  0 kills · 127 dmg  /  3  /  CPU 7  /  0 kills · 126 dmg
- 1 TEAMS: 1  /  CPU 7  /  16 hp  /  2  /  CPU 5  /  0 kills · 122 dmg  /  3  /  CPU 8  /  2 kills · 108 dmg

Sim console/page errors: all completed stock runs printed `NO ERRORS`.

Screenshots: Terrain/cavities, worms/HP, crates, wind, timer, weapon/status and event feed render. HP/damage change. Small text and dense bottom status/legend, but active worms remain visible. Opened out/worms-lobby.png and all three out/worms-play0/1/2.png via contact sheet.

Problems / pointers: No concrete defect established.
