#!/bin/sh
# rebuild games/surv.js from the template + exported art (always edit surv_tpl.js, then run this)
cd "$(dirname "$0")" && python3 art.py >/dev/null && python3 -c "
s=open('surv_tpl.js').read().replace('/*ART*/',open('surv_art.js').read());open('../../../games/surv.js','w').write(s)" && node --check ../../../games/surv.js && echo built
