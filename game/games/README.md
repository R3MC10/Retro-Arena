# Retro Arena: how to add a game

Every game runs on one shared engine, `engine/ra.js` (look: `engine/ra.css`). A game file only holds what makes
that game feel like itself. The engine already gives you:

| Engine part | What you get |
|---|---|
| `RA.screen({el, canvas, baseH, minW, onResize})` | Crisp whole-number pixel scaling to any window, phone to ultrawide. The view widens instead of letterboxing. |
| `RA.input` | Keys (`keys(map)`, quick taps never lost), mouse aim (`mouse.fx/fy`, `mouse.down`), touch aim (`touchAim`), touch buttons (`data-k="fire"` → `touchK.fire`), the slide D-pad (`class="dpad"`), gamepads (`pad(n)`), short virtual presses (`pulse`). |
| `RA.input.attachPointer(canvas, hooks)` | Left click / finger = fire + aim, right-click, mouse wheel. |
| `RA.audio` | `sfx('boom'|'shot'|'pick'|'sel')`, `blip(freq)`, and `add(name, fn)` for your own sounds. |
| `RA.music` | Chiptune player. `track(name, bpm, chords, drums, melody)`. Every game passes its own track list. M toggles, N skips. |
| `RA.hud` + `RA.ui.toast` | The MENU → QUIT? button (`class="ra-quit"`), the ♪ button (`class="ra-mus"`), Esc handling, toasts. |
| `RA.rooms({game, el, colors, onStart, onState, onLeave})` | The whole online lobby: room list, create / join by code, roster, CPU seats, host start. The host calls `R.broadcast(now, snapshot)`, players send buttons with `R.send({...})`, the host reads them with `R.input(peer)`. Games are online-first. |
| `RA.net` | Low-level claude.ai room connection (`connect()`, `newCode()`, `cleanCode()`). |
| `RA.gfx` | NES palette, `blit` pixel art from letter rows, `circle`, `disc`, the 3x5 pixel `text` / `num`. |
| `RA.util` | `rnd`, seeded `mulberry` (same level for every online player), `hash`, `mix`, `esc`, `touchDev`. |
| Loop + menu | Fixed 60 steps a second, a frame per screen refresh, the multicart menu with icons and gamepad support. |

## Steps

1. Copy the shape below into `games/<id>.js`.
2. Add `<script src="games/<id>.js"></script>` to `index.html`, before `catalog.js` (menu order = script order).
3. Remove the game's line from `games/catalog.js` (that list is the SOON cartridges).
4. Optional: `games/<id>.css` for styles only this game needs. Prefix element ids with the game id
   (`dk-cv`, not `cv`), since all games share one page.

```js
(()=>{
const root=RA.mount(`
  <div class="screen"><canvas id="pac-cv"></canvas>
    <button class="hudbtn ra-quit">MENU</button><button class="hudbtn ra-mus">♪</button></div>
  <div class="pad" hidden><div class="dpad"><i class="dU">▲</i><i class="dD">▼</i><i class="dL">◀</i><i class="dR">▶</i></div>
    <div class="ab"><button data-k="fire" class="a">FIRE</button></div></div>`);
const cv=root.querySelector('canvas'),ctx=cv.getContext('2d');
const SCR=RA.screen({el:root.querySelector('.screen'),canvas:cv,baseH:216});
const KEYS={KeyA:'left',KeyD:'right',KeyW:'up',KeyS:'down',Space:'fire'};
const T=RA.music.track;

function step(){ const k=RA.input.keys(KEYS); /* move things, 60 times a second */ }
function frame(now){ ctx.fillStyle=RA.gfx.NES.sky; ctx.fillRect(0,0,SCR.w,SCR.h); /* draw */ }

RA.register({id:'pacman',name:'PAC-MAN',kind:'Maze chase',players:'2-20 players',ready:true,el:root,
  desc:'One line for the menu.',
  icon:['..........', /* 10 rows of 10 letters, colours in RA.icons */ ],
  music:[T('Dot Muncher',140,['C','Am','F','G'],'k.h.s.h.','c5 - e5 - g5 - ...')],
  enter(){ RA.music.play('pacman',0); document.body.classList.add('playing'); SCR.fit() },
  leave(){ document.body.classList.remove('playing') },
  step, frame,
  onKey:e=>!!KEYS[e.code],          // true = this game uses that key
  onQuit(){ RA.menu.show() }});
})();
```

## House rules (from the project owner)

- Online multiplayer first (up to 20), with multiplayer twists made for that game.
- Power-ups that fit the game's feel and style: co-op, competitive, or co-op with trolling. Fun first.

- Modern feel in every game: mouse aim, click to fire, sensible keys (Space jump, E switch), gamepad and touch.
- Full-window play that scales cleanly to any resolution.
- Each game has its own set of music tracks.
- PS1 look and art style, in 2.5D: full colour, shaded pre-rendered-style sprites lit from the top left, dithered gradients (`RA.fx.gradient`), coloured light (`RA.fx.light`), scaled and spun sprites (`RA.fx.sprite`), textured perspective floors (`RA.fx.floor`), soft shadows (`RA.fx.shadow`), parallax layers. 3D originals become pseudo-3D (raycaster, scaling road, sprite scaling). The shared UI (blue gradient windows, metal buttons) comes from engine/ra.css. Up to 20 players.

`games/jewels.js` is the compact worked example (online rooms via `RA.rooms`, CPUs, power-ups, targeting). `games/worms.js` is the big one (weapons, physics, fog of war, camera).

## One-file build

`tools/bundle.py` inlines everything into a single `retro-arena.html` (for the desktop app or offline use).

## Save files
Every player has their own save file for every game. Use `const SAVE=RA.save('<game id>')` once at the top of the game,
call `SAVE.record({won, kills, bestScore, ...})` when a match ends for the local player, and `SAVE.set({...})` for
settings or unlocks. The menu shows each ready game's save line automatically. See the comment above `RA.save` in engine/ra.js.

## Online play is lag-free by default (RA.sync)
Every game uses the engine's `RA.sync`: each player's own character/board runs on their own device with zero input delay,
guests upload their state, the host referees shared things (projectiles, damage, items) and routes hits to the owner of the
target (`S.hit(key, kind, value, from)` → `onHit` on the owning device). Remote characters glide with `S.follow`.
Never make a guest wait for the host to move its own character. See the comment above `RA.sync` in engine/ra.js.
