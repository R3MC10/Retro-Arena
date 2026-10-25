#!/bin/sh
# rebuild games/jungle.js from the template + exported art (always edit jungle_tpl.js, then run this)
cd "$(dirname "$0")" && python3 foes.py >/dev/null && python3 -c "
s=open('jungle_tpl.js').read().replace('/*ART*/',open('jungle_art.js').read());open('../../../games/jungle.js','w').write(s)" && node --check ../../../games/jungle.js && echo built
