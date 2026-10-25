#!/bin/sh
# rebuild games/tennis.js from the template + exported art (always edit tennis_tpl.js, then run this)
cd "$(dirname "$0")" && python3 art.py >/dev/null && python3 -c "
s=open('tennis_tpl.js').read().replace('/*ART*/',open('tennis_art.js').read());open('../../../games/tennis.js','w').write(s)" && node --check ../../../games/tennis.js && echo built
