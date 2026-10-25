#!/bin/sh
# rebuild games/tiny.js from the template + exported art (always edit tiny_tpl.js, then run this)
cd "$(dirname "$0")" && python3 art.py >/dev/null && python3 -c "
s=open('tiny_tpl.js').read().replace('/*ART*/',open('tiny_art.js').read());open('../../../games/tiny.js','w').write(s)" && node --check ../../../games/tiny.js && echo built
