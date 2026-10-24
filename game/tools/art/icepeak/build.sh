#!/bin/sh
# rebuild games/icepeak.js from the template + exported art (always edit icepeak_tpl.js, then run this)
cd "$(dirname "$0")" && python3 export.py >/dev/null && python3 -c "
s=open('icepeak_tpl.js').read().replace('/*ART*/',open('icepeak_art.js').read());open('../../../games/icepeak.js','w').write(s)" && node --check ../../../games/icepeak.js && echo built
