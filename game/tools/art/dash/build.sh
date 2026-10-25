#!/bin/sh
# rebuild games/dash.js from the template + exported art (always edit dash_tpl.js, then run this)
cd "$(dirname "$0")" && python3 export.py >/dev/null && python3 -c "
s=open('dash_tpl.js').read().replace('/*ART*/',open('dash_art.js').read());open('../../../games/dash.js','w').write(s)" && node --check ../../../games/dash.js && echo built
