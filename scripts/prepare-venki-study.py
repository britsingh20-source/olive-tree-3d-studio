"""Retain source faces and measured sections for Venki study."""
from pathlib import Path
import json,sys
s=json.loads(Path(sys.argv[1]).read_text());I=.0254;left=min(v[0] for v in s['vertices'].values());front=min(v[1] for v in s['vertices'].values());faces=[]
for f in s['faces']:
 faces.append({**f,'points':[[[(s['vertices'][str(i)][0]-left)*I,s['vertices'][str(i)][2]*I,(front-s['vertices'][str(i)][1])*I] for i in l] for l in f['loops']],'normal':[f['normal'][0],f['normal'][2],-f['normal'][1]]})
layout={'source':s['source'],'sha256':s['sha256'],'sourceUnits':'inches','width':132*I,'height':120*I,'depth':24*I,'sourceFaces':faces,'sectionInches':{'green':[0,36,4,84],'peach':[36,54,4,84],'bookcase':[54,72,31.734318310293716,84],'drawers':[54,84,4,31.734318310293716],'flowers':[72,84,31.734318310293716,84],'desk':[84,132,0,31.734318310293716],'loft':[0,132,84,120]}}
Path(sys.argv[2]).write_text('export const exactLayout='+json.dumps(layout,separators=(',',':'))+';\n')
