#!/bin/sh
# rebuild games/worms.js from the template + exported art (always edit worms_tpl.js, then run this)
cd "$(dirname "$0")" && python3 export.py >/dev/null && python3 -c "
s=open('worms_tpl.js').read().replace('/*ART*/',open('worms_art.js').read());open('../../../games/worms.js','w').write(s)" && node --check ../../../games/worms.js && echo built
