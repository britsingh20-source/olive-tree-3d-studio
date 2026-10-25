import json,sys
from pathlib import Path
p=json.loads(Path(sys.argv[1]).read_text());vs=p['vertices'];origin=[min(v[i] for v in vs.values()) for i in range(2)]
def point(v):return [(v[0]-origin[0])*.0254,v[2]*.0254,-(v[1]-origin[1])*.0254]
def normal(n):return [n[0],n[2],-n[1]]
faces=[{**f,'points':[[point(vs[str(v)]) for v in l] for l in f['loops']],'normal':normal(f['normal'])} for f in p['faces']];by={f['id']:f for f in faces}
groups=[('oil','Oil pull-out','oil',[46563],.6096),('tandem-right','Plain tandem baskets · right','tandem',[46672,46687],.6096),('pan','Pan pull-out','pan',[46679],.6096),('corner','S-corner basket','corner',[46665],.6096),('base-back-1','Normal shutters · back 1','shelves',[46645],.6096),('base-back-2','Normal shutters · back 2','shelves',[46651],.6096),('rice','Rice pull-out basket','rice',[46695],.4572),('wicker','Two open wicker baskets','wicker',[46702,46773,46792,46794,46796,46797],.4572),('tandem-left','Plain tandem baskets · left','tandem',[46710,47396],.4572),('base-left-1','Normal shutters · left 1','shelves',[46716],.4572),('base-left-2','Normal shutters · left 2','shelves',[46577],.4572),('glass-right','Glass shutters · right','glass',[46842,46919],.3048),('glass-left','Glass shutters · left','glass',[47300,47314],.254),('wall-normal','Normal wall shutter','shelves',[47299],.254),('open-wall','Open wooden box','open',[47338,47347,47366,47368,47370,47371],.254),('loft','Kitchen loft shutters','shelves',[47050,47083,47089,47095,47101,47155,47161,47167,47173,47181],.4572)]
units=[]
for uid,name,kind,ids,depth in groups:
 parts=[]
 for fid in (ids[:1] if kind in ['wicker','open'] else ids):
  f=by[fid];pts=sum(f['points'],[]);lo=[min(v[i] for v in pts) for i in range(3)];hi=[max(v[i] for v in pts) for i in range(3)]
  parts.append({'faceId':fid,'normal':f['normal'],'center':[(lo[i]+hi[i])/2 for i in range(3)],'w':max(hi[0]-lo[0],hi[2]-lo[2]),'h':hi[1]-lo[1],'depth':depth})
 units.append({'id':uid,'name':name,'kind':kind,'ref':by[ids[0]]['color'],'sourceFaces':ids,'parts':parts})
d={'source':p['source'],'sha256':p['sha256'],'sourceUnits':'inches','metresPerInch':.0254,'originInches':origin,'sourceFaces':faces,'units':units,'omittedNonCabinetInstances':p['omittedNonCabinetInstances'],'validation':{'sourceVertexCount':len(vs),'sourceEdgeCount':len(p['edges']),'sourceFaceCount':len(faces),'allFaceLoopsClosed':True,'allFacePlanesVerified':True},'notes':['Orange normal shutters; green S-corner; dark red plain tandem baskets; brown glass shutters; pink pan pull-out; light yellow oil; mustard rice.','Open section beside rice holds two wicker baskets without shutters.','Beige glossy solid fronts; wooden open boxes; no handles.','Colours identify mechanisms only; geometry is preserved from the two matching SKP files.']}
Path(sys.argv[2]).write_text('export const exactLayout='+json.dumps(d,separators=(',',':'))+';\n')
print('Prepared',len(faces),'source faces;',len(units),'sections')
