# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('assets/index-D6qIWtA7-p209.js', 'r', encoding='utf-8') as f:
    t = f.read()

idx = t.find('campanha_1')
start = t.rfind('if(this.scriptKey', 0, idx)
end = t.find('return}this.runScript()', idx) + len('return}')

print("START:", start)
print("END:", end)
print("SLICE:\n", t[start:end])
