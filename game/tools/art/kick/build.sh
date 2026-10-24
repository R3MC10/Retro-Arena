#!/bin/sh
# rebuild games/kick.js from the template + exported art (always edit kick_tpl.js, then run this)
cd "$(dirname "$0")" && python3 export.py >/dev/null && python3 -c "
s=open('kick_tpl.js').read().replace('/*ART*/',open('kick_art.js').read());open('../../../games/kick.js','w').write(s)" && node --check ../../../games/kick.js && echo built
