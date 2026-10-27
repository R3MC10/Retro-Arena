# Retro Arena

PS1-style multiplayer retro games for up to 20 players.

**Download:** grab `RetroArena-win64.zip` from the [latest release](../../releases/latest), unzip it and run `Retro Arena.exe`.
Everyone running the app sees each other and the open rooms, and can join with one click.

- `game/`: the games and the shared engine (`engine/ra.js`), see `game/games/README.md`.
- `app/`: the Windows desktop app (Electron) with peer-to-peer networking (`app/src/net.js`).

Cartridge names follow [NAMES.md](NAMES.md): BRICKANOID, DR. PILLBOX, QUACK HUNT, THRILL BIKE, GALAXOID, MAGIC GEMS, MUNCH-MAN, TETRONIX, BATTLE TOWN, WORM WAR, TRACK STARS and SUPER DASH BUDS. Internal game IDs stay stable for saves and online rooms.
