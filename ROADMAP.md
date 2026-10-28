# Retro Arena roadmap (lead's plan, 28 Oct 2026)

Released: v85, with 26 games. 22 older games, plus ROAD BRAWLER, F-ONE RACE, RAD RUNNER and CIRCUS CHUCK.
In progress: MOON BALL (v86).
35 catalog games remain. The plan groups them by **shared tech**: build one shared module, then the games that use it.
That is faster and more consistent than writing 35 games from scratch.

## How every game ships (unchanged)
Brief (lead) -> Codex builds on `work/<game>` -> full test protocol -> lead review: novice places mid-pack, 20-player match takes about 3 min, screenshots checked -> lead tunes -> publish to main and check the release build.
One game per release. Codex runs with `< /dev/null` (otherwise it waits on stdin forever).

## Phase A: finish the simple 8-bit list (one game each, no new module)
| # | Game (id) | Twist for 20 players | Main risk |
|---|---|---|---|
| A1 | MOON BALL (`lunar-ball`) | Real-time shared table: everyone has their own cue ball | Physics sync at 20 players, aim novice |
| A2 | BIG SNOUT (`big-nose`) | Caveman race-platformer, club rivals, bone collecting | Too close to CIRCUS/DASH; give it its own feel: throwing clubs, dino rides |
| A3 | ADVENTURE ATOLL (`adventure-island`) | Energy drains, fruit refills; shared island race, skateboard pickup | Same as A2: needs distinct level gimmicks |
| A4 | CHIP & CHUM (`chip-n-dale`) | Co-op crate throwing; crates hit enemies AND friends | Co-op camera at 20 players: use split groups or a wide camera |
| A5 | TETRONIX 2 (`tetris-2`) | Coloured fixed blocks, match-3 blasts send junk to rivals | Reuse tetris.js board/garbage code |
| A6 | GOAL RUSH (`goal-3`) | Side-view football, up to 10 a side | Reuse kick.js (Pixel Kick) ideas; the view must differ |
| A7 | SKY WRECKER (`sky-destroyer`) | WWII dogfight, side view | Reuse skyaces.js, so make it side-view, not top-down |

## Phase B: the run-and-gun module (`engine/rng.js`), then 4 games
Shared: side and top-down scrolling stages, weapon pickups, co-op camera for up to 20 players (a squad view plus "catch up" teleport), boss framework, revive.
- B1 GUERRILLA RAID (`guerrilla-war`): top-down, hostages, enter tanks.
- B2 SUPER CONTACT (`super-contra`): side and top-down stages, spread gun, boss rush.
- B3 CONTACT FORCE (`contra-force`): pick a commando class, call squad mates.
- B4 METAL SNAIL X (`metal-slug-x`): tank vehicle, rescue POWs for weapon drops; most art work.

## Phase C: party and arena games
- C1 CRUSH BASH (`crash-bash`): arena mini-games pack (ball deflection, ice shove, crate smash). Each mini-game is small.
- C2 BRAWL STADIUM (`battle-stadium-don`): platform knock-off brawler; reuses the dash.js physics.
- C3 MORTAL KOMBO 4 (`mortal-kombat-4`): 1v1 fighter; winner stays on, the room watches, bracket. Needs a hitbox/frame-data module.
- C4 LUMINOS 2 (`lumines-2`): 2x2 block timeline puzzle; reuses the puzzle-board code.
- C5 PATAPUM (`patapon`) and C6 ROLLOROLLO (`locoroco`): rhythm army and tilt-world blob. Need a beat clock in ra.js audio.

## Phase D: the kart and race module upgrade
- D1 CLASH TEAM RACING (`crash-team-racing`): upgrade karts.js with power slides, weapon crates and a fake-3D chase cam (reuses the f1.js renderer).
- D2 CLASH TAG RACING (`crash-tag-team-racing`): D1 plus kart fusion (driver + gunner).
- D3 MUD RALLY 2 (`colin-mcrae-rally-2`): f1.js/rad.js renderer plus surfaces, ghost cars, pace notes.
- D4 SKATE PRO 2 (`tony-hawks-pro-skater-2`): trick combos in 2.5D, trick attack and HORSE.

## Phase E: the RPG battle module (`engine/rpg.js`), then 5 games
Shared: party turn battles where all players act at once each round, a timed-hit option, loot, simple overworld.
- E1 POCKET CRITTERS YELLOW (`pokemon-yellow`): catch, trade and battle; the simplest RPG.
- E2 DRAGON QUESTOR (`dragon-quest-8`), E3 STAR SUIKO 2 (`suikoden-2`) with army battles, E4 LEGEND OF DRAKOON (`the-legend-of-dragoon`) with timed combos.
- E5 DIABOLO (`diablo`): isometric real-time dungeon crawl. Uses the loot code, not the turn battles.

## Phase F: the bigger simulations
- F1 GRAND THEFT TOWN (`gta-2`): top-down city, cars, wanted stars. Reuses road.js driving.
- F2 RED ALARM 2 (`red-alert-2`): RTS. The biggest job: pathfinding, net lockstep. Prototype first.
- F3 STEEL GEAR SOLID (`metal-gear-solid`): top-down stealth, vision cones.
- F4 TOMB RUNNER (`tomb-raider`) and F5 HELL ZONE LIBERATION (`killzone-liberation`): 2.5D/isometric, reuse the rng.js module.

## Phase G: the raycast FPS module (`engine/ray.js`), then 4 games
Shared: raycaster, sprites, mouse look, hitscan/projectiles, deathmatch netcode (client prediction).
- G1 DOOMED (`doom`), G2 TREMOR 2 (`quake-2`), G3 HELL ZONE (`killzone`), G4 RESISTORS 2 (`resistance-2`, co-op vs hordes).

## Quality track (runs alongside, about 1 job in 5)
- Human tests that machines can't do: online play over real internet connections and a listen-through of the audio for v82-v86. Ask the owner and friends.
- Polish pass: CIRCUS CHUCK sprites are small and the arena is empty at 20 players. ROAD BRAWLER scenery repeats. F-ONE RACE map is a ring, not the circuit.
- Easy CPUs still untuned: Galaxoid, Night Survivors, Sky Aces, Magic Gems. Also: Sky Aces deathmatch is too short at 20 players, Ice Peak co-op CPUs crowd each other, Magic Gems frame time is high.
- Shared test suite: every new game has adopted the `<game>-suite.cjs` pattern. Fold it into one `suite.js <id>` so tests are uniform.

## Risks
- Codex usage limits: Claude takes over builds (owner's rule).
- Snapshot size at 20 players for physics-heavy games (MOON BALL, CRUSH BASH, RTS): quantize, and send deltas if needed.
- Names and art must stay original (NAMES.md). No copied melodies or sprites.
