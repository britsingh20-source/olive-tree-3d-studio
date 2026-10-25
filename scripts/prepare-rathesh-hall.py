import json,sys
from pathlib import Path
p=json.loads(Path(sys.argv[1]).read_text());vs=p['vertices'];origin=[min(v[i] for v in vs.values()) for i in range(2)]
def point(v):return [(v[0]-origin[0])*.0254,v[2]*.0254,-(v[1]-origin[1])*.0254]
def normal(n):return [n[0],n[2],-n[1]]
faces=[{**f,'points':[[point(vs[str(v)]) for v in l] for l in f['loops']],'normal':normal(f['normal'])} for f in p['faces']];by={f['id']:f for f in faces}
trim=[48582,48598,48599,48624];tv=[48352,48391,48405,48406];walnut=[f['id'] for f in faces if f['color']=='#a56348' and f['id'] not in trim+tv]+[47962,48717]
groups=[('tv-panel','Glossy marble TV panel','panel',tv,[48352]),('walnut-panel','Walnut paneling and louvers','panel',walnut,[46516]),('pooja','CNC pooja double doors','pooja',[46509,46508],[46509,46508]),('tv-storage','TV storage · glass and walnut shutters','storage',[47211,47205,47199,47193],[47211,47205,47199,47193]),('robot','Robot-cleaner cabinet','robot',[46447],[46447]),('display','Tinted-glass decorative display','display',[47183,47390],[47183]),('door-trim','Walnut doorway surround','panel',trim,[48598])]
units=[]
for uid,name,kind,ids,partIds in groups:
 parts=[]
 for fid in partIds:
  f=by[fid];pts=sum(f['points'],[]);lo=[min(v[i] for v in pts) for i in range(3)];hi=[max(v[i] for v in pts) for i in range(3)];parts.append({'faceId':fid,'normal':f['normal'],'center':[(lo[i]+hi[i])/2 for i in range(3)],'w':max(hi[0]-lo[0],hi[2]-lo[2]),'h':hi[1]-lo[1],'depth':.3048 if kind=='display' else .4572,'glass':f['color'] in ['#4d6fb2','#303e57']})
 units.append({'id':uid,'name':name,'kind':kind,'sourceFaces':ids,'parts':parts})
d={'source':p['source'],'sha256':p['sha256'],'sourceUnits':'inches','originInches':origin,'sourceFaces':faces,'units':units,'validation':{'sourceVertexCount':len(vs),'sourceFaceCount':len(faces)},'notes':['All three hall SKPs contain matching root geometry.','Source slopes, CNC door outlines and room openings are retained.','Robot cabinet finished shutter starts above a 6-inch cleaner opening; original face retained for reference.']}
Path(sys.argv[2]).write_text('export const exactLayout='+json.dumps(d,separators=(',',':'))+';\n')
print('Prepared',len(faces),'hall faces and',len(units),'selectable products')
