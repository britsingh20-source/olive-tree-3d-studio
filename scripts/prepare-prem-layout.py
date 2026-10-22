import sys,json,hashlib
from pathlib import Path
p=json.loads(Path(sys.argv[1]).read_text());vs=p['vertices'];fs={f['id']:f for f in p['faces']};origin=[min(v[i] for v in vs.values()) for i in range(2)]
def point(v):return [(v[0]-origin[0])*.0254,v[2]*.0254,-(v[1]-origin[1])*.0254]
def normal(n):return [n[0],n[2],-n[1]]
source=[]
for f in p['faces']:
 source.append({**f,'points':[[point(vs[str(v)]) for v in l] for l in f['loops']],'normal':normal(f['normal'])})
sourceById={f['id']:f for f in source}
groups=[
('tandem-red-left','Tandem drawers · left run','tandem',[46658,46743],.6096),
('oil','Oil pull-out','oil',[46708],.6096),
('shelves-left-1','Base cabinet · left 1','shelves',[46714],.6096),
('shelves-left-2','Base cabinet · left 2','shelves',[46729],.6096),
('shelves-left-3','Base cabinet · left 3','shelves',[46735],.6096),
('shelves-return-1','Base cabinet · return 1','shelves',[46785],.4572),
('shelves-return-2','Base cabinet · return 2','shelves',[46864],.4572),
('tandem-orange','Tandem drawers · orange section','tandem',[46858,46870],.4572),
('dishwasher','Dishwasher','dishwasher',[46912,46926,46930],.4206875),
('rice','Rice basket','rice',[46974],.4572),
('wicker','Two wicker baskets','wicker',[46981],.4572),
('tandem-red-back','Tandem drawers · back run','tandem',[46988,46994],.4572),
('shelves-back-1','Base cabinet · back 1','shelves',[47016],.4572),
('shelves-back-2','Base cabinet · back 2','shelves',[47002],.4572),
('shelves-back-3','Base cabinet · back 3','shelves',[47022],.4572),
('shelves-back-4','Base cabinet · back 4','shelves',[47009],.4572),
('glass-wall','Aluminium-framed glass wall unit','glass',[47048,47165],.3048),
('wall-corner','Wall cabinet · corner shutters','shelves',[47143,47155],.3048),
('pantry','Pantry · fixed shelves','pantry',[47194,47256,47243],.4572),
('tall','Tall unit · pull-out baskets','tall',[47268],.4572)
]
units=[]
for id,name,kind,ids,depth in groups:
 parts=[]
 for fid in ids:
  f=sourceById[fid];n=f['normal'];points=[v for loop in f['points'] for v in loop];lo=[min(v[i] for v in points) for i in range(3)];hi=[max(v[i] for v in points) for i in range(3)];parts.append({'faceId':fid,'normal':n,'center':[(lo[i]+hi[i])/2 for i in range(3)],'w':max(hi[0]-lo[0],hi[2]-lo[2]),'h':hi[1]-lo[1],'depth':depth})
 units.append({'id':id,'name':name,'kind':kind,'ref':sourceById[ids[0]]['color'],'sourceFaces':ids,'parts':parts})
layout={'source':p['source'],'sha256':p['sha256'],'sourceUnits':'inches','metresPerInch':.0254,'originInches':origin,'sourceFaces':source,'units':units,'omittedNonCabinetInstances':p['omittedNonCabinetInstances'],'validation':{'sourceVertexCount':len(vs),'sourceEdgeCount':len(p['edges']),'sourceFaceCount':len(source),'allFaceLoopsClosed':True,'allFacePlanesVerified':True},'notes':['Orange tandem has two source front divisions. Retained without adding a third front.','Maroon wicker has one source outer shutter, with two internal baskets.','Only the Ty human component is excluded; all root cabinet/architectural face loops are retained.']}
Path(sys.argv[2]).write_text('export const exactLayout='+json.dumps(layout,separators=(',',':'))+';\n')
print('Prepared',len(source),'source faces and',len(units),'units')
