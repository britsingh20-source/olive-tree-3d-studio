"""Normalize the root geometry extracted by the repository's bounded SKP reader."""
import json,sys
from pathlib import Path
s=json.loads(Path(sys.argv[1]).read_text())
v=s['vertices']; pts=list(v.values()); lo=[min(p[i] for p in pts) for i in range(3)]; hi=[max(p[i] for p in pts) for i in range(3)]; I=.0254
faces=[]
for f in s['faces']:
    faces.append({**f,'points':[[[(v[str(k)][0]-lo[0])*I,v[str(k)][2]*I,-(v[str(k)][1]-lo[1])*I] for k in loop] for loop in f['loops']],'normal':[f['normal'][0],f['normal'][2],-f['normal'][1]]})
layout={'source':s['source'],'sha256':s['sha256'],'sourceUnits':'inches','width':(hi[0]-lo[0])*I,'height':(hi[2]-lo[2])*I,'depth':(hi[1]-lo[1])*I,'sourceFaces':faces,'sourceVertexCount':len(v),'omittedNonCabinetInstances':s['omittedNonCabinetInstances']}
out=Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True);out.write_text('export const exactLayout='+json.dumps(layout,separators=(',',':'))+';')
print(len(faces),'faces retained')
