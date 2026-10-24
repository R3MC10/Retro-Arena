---
name: retro-game
description: How to build or remake a Retro Arena game to the owner's standard - hand-made pixel art, real animation and physics, play-tested for fun. Use for any new game in game/games/ and any rework of an existing one.
---

# Building a Retro Arena game

The owner's bar: **no sloppy work.** A game is done when it looks like hand-made retro pixel art, moves with proper
animation and physics, plays like the game it is named after, and is fun - checked by playing it, not by reading code.
`game/games/excite.js` is the reference implementation of everything below.

## 0. Before writing code: what game is this?

Write down, in the file header, before any code:
- **The original.** What made it great? (Excitebike: the heat gauge, landing angle, back-wheel bumps, lanes.)
  Keep those mechanics; a remake that loses them is a different, worse game.
- **The 20-player twist.** What changes with 20 people (eliminator, teams, catch-up items), and how does the screen stay readable.
- **The first 10 seconds.** What does a new player see and press? How do they learn the controls (on-screen hints)?
- **Why it is fun.** A skill to master, a risk/reward choice, a moment that makes people shout.

Ask these again at every milestone: *Does this make sense? Does it align with the game it should become? Is it fun?*

## 1. Pixel art (engine/pix.js)

- Draw into a low-resolution screen: `const SCR=RA.pix.screen()`, in `render(ctx,W,H)`: `const g=SCR.size(W,H)`, draw,
  `SCR.present(ctx,W,H)`. Use `baseH:180` in RA.kit (a 320x180 frame). Never draw smooth gradients, blurred circles
  or canvas fonts into it - everything sits on the pixel grid.
- **Sprites are hand-drawn**, as rows of palette letters (`RA.pix.PAL`; `1 2 3` = the player's colour light/mid/dark,
  swapped by `RA.pix.recolor`). No sphere models, no procedural blobs, no skeleton stick figures (tried: they look bad).
- Workbench: `game/tools/art/pixart.py`. Paint on a `Grid`, `outline()` adds the dark 1px outline, `sheet()` renders a
  zoomed PNG - **look at it** (Read the PNG) and iterate until it reads at a glance. Expect 3-5 drafts per character.
  Export rows to JSON and embed them as `const ART=...` at the top of the game. Keep the .py sources in
  `game/tools/art/<game>/` (see `excite/`).
- Readability rules learned the hard way: big heads/helmets, contrasting colours between body parts (white pants
  vs coloured jersey vs dark boots), 1px dark outline, light from the top left, no lone diagonal 1px lines.
- **Draw the whole object under anything that covers it.** If a part can ever be seen alone (bike after the rider
  falls off), it must be complete - hidden pixels become holes.
- Rotation: `RA.pix.rot(canvas, angle)` (RotSprite style, cached per 5 degrees). Round positions to whole pixels.
- Text: `RA.pix.text(g, s, x, y, {col, outline, scale, align})` - the 5x7 bitmap font. HUD panels in the pixel style.
- Backgrounds tell the place: crowds, ad boards, lights, parallax layers, themed variants (day / desert / night).
- Keep the bottom ~9px of the frame free: the kit's control legend sits there.

## 2. Animation and physics

- Every character has **poses**, hand-drawn: idle, move cycle, the action poses the game needs (lean, jump, attack),
  hurt/crash, recovery, celebrate. Pose changes need a short hold (3 frames) so they never flicker.
- Moving parts animate with speed (wheels spin with distance travelled, legs cycle with velocity).
- Bodies have physics, not keyframes: velocity, gravity, angular velocity, springs (suspension, squash on landing).
  Model the real contact points (two wheels, two feet) instead of a single point.
- Failure is an animation sequence driven by physics (thrown, bounce, slide, lie, get up, return), never a sprite
  that just spins.
- Juice: particles from contact points (dirt, dust, sparks), screen shake on big impacts (only for that player),
  sound for every action, an engine/movement sound that follows speed.
- Test edge cases of the physics on purpose: lips of ramps, cliffs, slopes measured across a drop (Excitebike crashed
  every rider at cliff edges until the slope was measured only behind the wheel and take-off was checked first).

## 3. Gameplay and fairness

- Tune in pixel units: crossing the screen at full speed takes ~2-3 s; a match is 1-3 minutes.
- Beginner assists that do not remove skill (Excitebike auto-levels slowly in the air; leaning yourself still earns
  PERFECT boosts). On-screen hints for the first seconds and when the player is doing it wrong.
- CPUs: competent, beatable, difficulty via speed factor and aim error; never perfect.
- Only show messages that matter to the viewer (your own PERFECT, not 7 CPUs' ones); name tags only on other humans.
- Power-ups that fit the game and the place-based catch-up rule (back of the pack gets the strong ones).

## 4. Online (RA.kit localFirst)

- Each player's own character runs on their device; upload it, the host reads `K.remote(i)`. Shared things (items,
  places, eliminations) belong to the host; hits are sent to the victim's owner as events (seq numbers).
- **snap() keys must not clash with the kit's:** ph id r md bs sd n t mt w rk e (the kit warns in the console).
- Sync what others need to draw: pose, suspension, crash state, not just x/y.

## 5. Play-testing protocol (do all of it, every game)

Serve: `cd game && python3 -m http.server 8765`. Tools in `game/tools/test` (see its README).
1. `node smoke.js <id>` - no errors, look at every screenshot.
2. **Play as a person**: hold keys, read the screen. Then simulate players with the input hooks (override
   `RA.input.keys`): a *lazy* player (only the main button) and a *skilled* player (uses the game's techniques).
   Targets: the lazy player finishes and isn't humiliated; the skilled player usually beats normal CPUs; crashes /
   deaths have causes you can name. Log failure causes (reason, position) and fix patterns that hit everyone.
3. `node sim.js <id> <mode> 8` and with 20 players - every mode ends properly, results make sense, snapshot under 3 KB,
   frame time reasonable.
4. `node frames.js ...` - contact sheets of the animations (jump, lean, crash, celebrate). Look at them.
5. `node online.js <id>` - the guest gets a seat (myIdx >= 0), moves, and the host sees its poses/crashes.
6. Split screen (2 local humans) and the lobby demo look right.
In tests, blur the focused button before pressing Space (it would click it).

## 6. Shipping

- Bump `RA.VERSION` in engine/ra.js, commit on the working branch with a message that says what changed and why,
  push, and (owner's rule) **fast-forward `main` to it for every finished game** - each push to main builds the
  Windows release; check the "Build Windows app" run passes.
- Show the owner screenshots / contact sheets of the result.
