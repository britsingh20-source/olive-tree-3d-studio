"""Read validated TLV records used by these supplied SKP 26.2 kitchen files.
This is a deliberately bounded extractor, not a general SketchUp converter.
It preserves the root entity vertices, edges, face loops and material IDs.
Nested component definitions (the non-cabinet Ty human) are inventoried separately.
"""
import struct,zipfile,json,sys,hashlib,collections
from pathlib import Path
from xml.etree import ElementTree as ET

def fields(b):
    at=0;out=[]
    while at+6<=len(b):
        tag,n=struct.unpack_from('<HI',b,at)
        if at+6+n>len(b):raise ValueError('Invalid TLV boundary')
        out.append((tag,b[at+6:at+6+n]));at+=6+n
    if at!=len(b):raise ValueError('Trailing TLV bytes')
    return out

def mapping(b):return dict(fields(b))
def number(b):return int.from_bytes(b,'little')
def identity(b):return number(mapping(b)[1502])

def extract(path):
    z=zipfile.ZipFile(path);root=mapping(mapping(z.read('model.dat'))[500]);ent=mapping(mapping(root[502])[5000]);mats={}
    for tag,section in fields(mapping(root[503])[12500]):
        if tag!=12501:continue
        for _,rec in fields(section):
            m=mapping(rec);name=m[13004].decode();rid=identity(m[1500]);xml=ET.fromstring(z.read('materials/'+name+'/material.xml'))
            material=next(el for el in xml.iter() if el.tag.split('}')[-1]=='material')
            rgb=[int(material.attrib.get('color'+c,'255')) for c in ['Red','Green','Blue']]
            mats[rid]={'name':name,'color':'#'+''.join(f'{c:02x}' for c in rgb)}
    vertices={}
    for _,b in fields(ent[5001]):
        d=mapping(b);vertices[identity(d[1500])]=struct.unpack('<3d',d[2501])
    edges={}
    for _,b in fields(ent[5002]):
        d=mapping(b);e=mapping(d[2000]);edges[identity(e[1500])]=(number(d[3001]),number(d[3002]))
    faces=[]
    for _,b in fields(ent[5003]):
        d=mapping(b);e=mapping(d[2000]);fid=identity(e[1500]);plane=struct.unpack('<4d',d[3501]);loops=[]
        for _,loop in fields(d[3502]):
            uses=mapping(loop)[4501];ordered=[];last=None;first=None
            for _,use in fields(uses):
                u=mapping(use);a,b=edges[number(u[4001])]
                if number(u[4002]):a,b=b,a
                if first is None:first=a
                if last is not None and last!=a:raise ValueError(f'Loop continuity {fid}: {last} != {a}')
                ordered.append(a);last=b
            if last!=first:raise ValueError('Loop not closed')
            loops.append(ordered)
        pts=[vertices[v] for loop in loops for v in loop]
        for p in pts:
            assert abs(sum(plane[i]*p[i] for i in range(3))+plane[3])<1e-5,('plane',fid)
        mid=number(e.get(2001,b'\x00'));material=mats.get(mid,{'name':'Default','color':'#ffffff'})
        faces.append({'id':fid,'materialId':mid,**material,'normal':list(plane[:3]),'loops':loops})
    instance_counts={}
    if 5004 in ent:
        instance_counts=dict(collections.Counter(mapping(b).get(6501,b'').decode(errors='replace') for _,b in fields(ent[5004])))
    return {'source':Path(path).name,'sha256':hashlib.sha256(Path(path).read_bytes()).hexdigest(),'sourceUnits':'inches','vertices':vertices,'edges':edges,'faces':faces,'materials':mats,'omittedNonCabinetInstances':instance_counts}

if __name__=='__main__':
    result=extract(sys.argv[1]);out=Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,separators=(',',':')))
    print(result['source'],len(result['vertices']),'vertices',len(result['edges']),'edges',len(result['faces']),'faces')
    print('omitted instances',result['omittedNonCabinetInstances'])
    for f in result['faces']:
        if f['materialId']:
            pts=[result['vertices'][v] for loop in f['loops'] for v in loop]
            lo=[min(p[i] for p in pts) for i in range(3)];hi=[max(p[i] for p in pts) for i in range(3)]
            print(f['id'],f['color'],f['name'],[round(v,3) for v in lo],[round(v,3) for v in hi],f['normal'])
