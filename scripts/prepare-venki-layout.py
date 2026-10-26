"""Retain the supplied wardrobe's root faces and measured section arrangement."""
import json,sys
from pathlib import Path
s=json.loads(Path(sys.argv[1]).read_text());front=229.747;left=min(v[0] for v in s['vertices'].values());front=min(v[1] for v in s['vertices'].values());I=.0254
faces=[]
for f in s['faces']:
 pts=[ [[(s['vertices'][str(i)][0]-left)*I,s['vertices'][str(i)][2]*I,(front-s['vertices'][str(i)][1])*I] for i in loop] for loop in f['loops'] ]
 faces.append({**f,'points':pts,'normal':[f['normal'][0],f['normal'][2],-f['normal'][1]]})
layout={'source':s['source'],'sha256':s['sha256'],'sourceUnits':'inches','width':132*I,'height':120*I,'depth':21*I,'sourceFaces':faces,'sectionInches':{'dressing':[0,42,0,84],'single':[42,60,3,84],'hanging':[60,96,3,84],'shelves':[96,132,3,84],'loft':[0,132,84,120]}}
Path(sys.argv[2]).write_text('export const exactLayout='+json.dumps(layout,separators=(',',':'))+';\n')
print(len(faces),'source faces retained; 132 × 120 in overall; 21 in depth')
