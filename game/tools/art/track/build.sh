#!/bin/sh
# rebuild games/track.js from the template + exported art (always edit track_tpl.js, then run this)
cd "$(dirname "$0")" && python3 export.py >/dev/null && python3 -c "
s=open('track_tpl.js').read().replace('/*ART*/',open('track_art.js').read());open('../../../games/track.js','w').write(s)" && node --check ../../../games/track.js && echo built
