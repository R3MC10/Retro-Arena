"""Inline engine + games into one self-contained retro-arena.html (desktop app / offline).
Usage: python3 tools/bundle.py [out.html]   (run from the Retro Arena folder)"""
import re,sys,os
base=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html=open(os.path.join(base,'index.html')).read()
read=lambda p:open(os.path.join(base,p)).read()
html=re.sub(r'<link rel="stylesheet" href="((?!https?:)[^"]+)">',lambda m:'<style>\n'+read(m.group(1))+'</style>',html)
html=re.sub(r'<script src="((?!https?:)[^"]+)"></script>',lambda m:'<script>\n'+read(m.group(1)).replace('</script','<\\/script')+'</script>',html)
out=sys.argv[1] if len(sys.argv)>1 else os.path.join(base,'retro-arena.html')
open(out,'w').write(html);print('wrote',out,len(html),'bytes')
