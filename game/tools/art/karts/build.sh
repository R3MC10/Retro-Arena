#!/bin/sh
# rebuild games/karts.js from the template + exported art (always edit karts_tpl.js, then run this)
cd "$(dirname "$0")" && python3 export.py >/dev/null && python3 -c "
s=open('karts_tpl.js').read().replace('/*ART*/',open('karts_art.js').read());open('../../../games/karts.js','w').write(s)" && node --check ../../../games/karts.js && echo built
