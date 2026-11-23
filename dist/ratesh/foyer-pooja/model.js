import * as T from 'three';
import {earcut} from '../../venki/triangulate.js';
import {exactLayout} from './exact-layout.js';
export {exactLayout};
// Mr. Ratesh · foyer + pooja unit (source: gn mills foir and pooja.skp, identical to Untitled (8).skp).
// World axes (metres): X = source x - 86.8 in, Y = height, Z = 215.4 in - source y.
// Book counter faces +Z; tall pooja unit faces +X. Positions below are in source inches.
export const DEFAULT_FINISH='#886040';
export const project={id:'ratesh-foyer-pooja-v1',customer:'Mr. Ratesh',quotation:null};
export const WOOD_TEXTURE='./natural-rough-cut-9189.jpg';
let woodTexture;
export function createWoodTexture(){
 if(!woodTexture){woodTexture=new T.TextureLoader().load(WOOD_TEXTURE);woodTexture.colorSpace=T.SRGBColorSpace;
 woodTexture.wrapS=woodTexture.wrapT=T.ClampToEdgeWrapping;woodTexture.offset.set(0,.1);woodTexture.repeat.set(1,.88);
 woodTexture.anisotropy=8;woodTexture.userData.shared=true;}return woodTexture;
}
const I=.0254,straight={name:'Natural Rough Cut Wood 9189 matte',color:DEFAULT_FINISH,wood:true};
function tex(path,srgb=true){const t=new T.TextureLoader().load(path);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.userData.shared=true;return t;}
export function buildModel(){
 const root=new T.Group(),architecture=new T.Group(),referenceRoot=new T.Group();root.add(architecture,referenceRoot);referenceRoot.visible=false;
 const units=[],actions=[],sourceMeshes=[],glowMaterials=[],lightMaterial=new T.MeshBasicMaterial({color:'#ffe2a6'});
 function mat(f){const m=new T.MeshPhysicalMaterial({color:f.wood?'#ffffff':f.color,map:f.wood?createWoodTexture():null,roughness:.84,clearcoat:0,side:T.DoubleSide});m.userData.compatColor=f.color;return m;}
 const grassTex=tex('./grass-mat.jpg');grassTex.wrapS=grassTex.wrapT=T.RepeatWrapping;
 function grassMat(w,h){const t=grassTex.clone();t.needsUpdate=true;t.repeat.set(w/12,h/12);t.userData.shared=true;const m=new T.MeshStandardMaterial({map:t,roughness:1,side:T.DoubleSide});m.userData.compatColor='#4f7a3a';return m;}
 // Box from world-inch extents, placed relative to the parent's world origin (parent.userData.o, metres).
 function B(p,x0,x1,y0,y1,z0,z1,m){const o=p.userData.o||new T.Vector3();const g=new T.Mesh(new T.BoxGeometry((x1-x0)*I,(y1-y0)*I,(z1-z0)*I),m);
  g.position.set((x0+x1)/2*I-o.x,(y0+y1)/2*I-o.y,(z0+z1)/2*I-o.z);g.castShadow=true;g.receiveShadow=true;p.add(g);return g;}
 function pivotAt(p,x,y,z){const q=new T.Group();const o=p.userData.o||new T.Vector3();q.position.set(x*I-o.x,y*I-o.y,z*I-o.z);q.userData.o=new T.Vector3(x*I,y*I,z*I);p.add(q);return q;}
 function unit(id,name,kind,angle,front=straight,side=straight){const group=new T.Group();root.add(group);
  const u={id,name,kind,group,angle,front:mat(front),side:mat(side),defaultFront:{...front},defaultSide:{...side},actions:[],interiors:[],lightNodes:[],finishable:true};
  u.sideSkin=u.side;u.members=[u];u.product=u;units.push(u);return u;}
 function act(u,node,type,travel,extra={}){const a={unit:u,node,type,travel,initial:node.position.clone(),open:false,value:0,...extra};actions.push(a);u.actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 function lamp(u,x,y,z,intensity=.18,distance=1.2){const l=new T.PointLight('#ffd9a0',intensity,distance,2);l.position.set(x*I,y*I,z*I);u.group.add(l);u.lightNodes.push(l);return l;}
 const t=.75,gap=.06;

 // 1 · Upper pooja (30-84 in): CNC-cut Natural Rough Cut Wood shutters, two shelves, warm light inside.
 const pooja=unit('pooja-upper','Pooja · CNC shutters','pooja',Math.PI/2);const pg=pooja.group;
 B(pg,0,t,30,84,14,51,pooja.side);B(pg,t,14.25,30,84,50.25,51,pooja.side);B(pg,t,14.25,30,84,14,14.75,pooja.side);
 B(pg,t,14.25,83.25,84,14.75,50.25,pooja.side);B(pg,t,14.25,30,30.75,14.75,50.25,pooja.side);
 for(const y of [48,66])B(pg,t,13.9,y-.75,y,14.75,50.25,pooja.side);
 pooja.shelfCount=2;pooja.shelfHeightsInches=[48,66];pooja.shelfMaterial='Natural Rough Cut Wood 9189 mica';
 const glowStrip=B(pg,t+.2,t+.6,82.6,83.1,15.5,49.5,lightMaterial);
 lamp(pooja,8,72,32.5,.22,1.4);lamp(pooja,8,40,32.5,.12,1);
 pooja.doors=[];
 for(const [side,hingeZ,z0,z1,travel] of [['left',51,32.5+gap/2,51-gap/2,-Math.PI*.47],['right',14,14+gap/2,32.5-gap/2,Math.PI*.47]]){
  const p=pivotAt(pg,15,57,hingeZ);
  const face=new T.MeshStandardMaterial({map:tex('./pooja-door-'+side+'.jpg'),emissiveMap:tex('./pooja-glow-'+side+'.png'),emissive:new T.Color('#ffffff'),emissiveIntensity:1,roughness:.84});
  face.userData.compatColor=DEFAULT_FINISH;glowMaterials.push(face);
  const door=B(p,14.25,15,30+gap,84-gap,z0,z1,[face,pooja.front,pooja.front,pooja.front,pooja.front,pooja.front]);door.userData.cnc=true;
  act(pooja,p,'hinge',travel,{side});pooja.doors.push(p);}
 pooja.doorCount=2;pooja.handles='Handleless';pooja.carving='Pattern 1 pooja CNC (mandala jali, hanging bells, lotus)';
 pooja.renderNote='CNC cutting is a drawn visual approximation of Pattern 1, not a fabrication file. Round centre is decorative only (fronts are handleless). Shelf spacing evenly assumed. CNC faces keep Natural Rough Cut Wood when other finishes are previewed.';

 // 2 · Drawers (18-26 in and 26-30 in).
 const dr=unit('drawers','Drawers','drawer',Math.PI/2);const dg=dr.group;
 B(dg,0,t,18,30,14,51,dr.side);B(dg,t,14.25,18,30,50.25,51,dr.side);B(dg,t,14.25,18,30,12,12.75,dr.side);B(dg,t,14.25,18,18.75,12.75,50.25,dr.side);
 const inner=new T.MeshStandardMaterial({color:'#efe9df',roughness:.9});
 for(const [y0,y1] of [[18,26],[26,30]]){const p=pivotAt(dg,15,(y0+y1)/2,32.5);
  B(p,14.25,15,y0+gap,y1-gap,14+gap,51-gap,dr.front);
  const h=y1-y0-1.6;B(p,1.5,14.25,y0+.8,y0+1.3,15,50,inner);for(const z of [15,49.5])B(p,1.5,14.25,y0+.8,y0+.8+h,z,z+.5,inner);B(p,1.5,2,y0+.8,y0+.8+h,15,50,inner);
  act(dr,p,'slide',11*I);}
 dr.drawerCount=2;dr.drawerHeightsInches=[8,4];dr.handles='Handleless';dr.renderNote='Drawer box depth, runners and handleless profile are visual approximations.';

 // 3 · Lower pooja storage (4-18 in): plain shutters, no shelves; toe kick and corner filler.
 const low=unit('pooja-lower','Pooja storage · lower','lower',Math.PI/2);const lg=low.group;
 B(lg,0,t,4,18,12,51,low.side);B(lg,t,14.25,4,18,50.25,51,low.side);B(lg,t,14.25,4,18,12,12.75,low.side);B(lg,t,14.25,4,4.75,12.75,50.25,low.side);
 B(lg,14.25,15,4,30,12,14-gap,low.front);B(lg,0,14,0,4,12,51,low.front);
 for(const [hingeZ,z0,z1,travel] of [[51,32.5+gap/2,51-gap/2,-Math.PI*.47],[14,14+gap/2,32.5-gap/2,Math.PI*.47]]){
  const p=pivotAt(lg,15,11,hingeZ);B(p,14.25,15,4+gap,18-gap,z0,z1,low.front);act(low,p,'hinge',travel);}
 low.doorCount=2;low.shelfCount=0;low.handles='Handleless';low.renderNote='Plain shutters; no shelves as confirmed. Toe kick 1 in recessed per source.';

 // 4 · Book storage counter (top at 30 in).
 const bk=unit('book-counter','Book storage counter','books',0);const bg=bk.group;
 B(bg,1,54,29.25,30,1,12,bk.front);B(bg,15,53.25,4,4.75,1,11.25,bk.side);B(bg,15,17,4,29.25,11.25,12,bk.side);B(bg,52,53.25,4,29.25,11.25,12,bk.side);
 B(bg,15,15.75,4.75,29.25,1,11.25,bk.side);B(bg,14,54,0,4,1,11,bk.front);
 for(const [hingeX,x0,x1,travel] of [[17,17+gap/2,34.5-gap/2,-Math.PI*.47],[52,34.5+gap/2,52-gap/2,Math.PI*.47]]){
  const p=pivotAt(bg,hingeX,16.6,12);B(p,x0,x1,4+gap,29.25-gap,11.25,12,bk.front);act(bk,p,'hinge',travel);}
 bk.doorCount=2;bk.handles='Handleless';bk.purpose='Storage box for books';
 bk.renderNote='Interior layout not yet confirmed — shown empty. Counter-top thickness is approximate.';

 // 5 · Artificial grass mat wall with warm strip light.
 const gr=unit('grass-wall','Grass-mat wall','grass',.35);gr.finishable=false;const gm=grassMat(41,54),gs=grassMat(13,54),ge=grassMat(13,84);
 gr.front=gm;gr.side=gs;gr.sideSkin=gs;
 B(gr.group,1,42,30,84,1,1.12,gm);B(gr.group,1,1.12,30,84,1.12,14,gs);B(gr.group,3,15,0,84,51,51.12,ge);
 B(gr.group,0,3,0,84,51,53,[grassMat(2,84),mat(straight),mat(straight),mat(straight),mat(straight),mat(straight)]);
 B(gr.group,0,3,0,84,53,53.01,mat(straight));
 B(gr.group,2,41.5,82.7,83.1,1.12,1.7,lightMaterial);
 lamp(gr,14,80,5,.16,1.3);lamp(gr,30,80,5,.16,1.3);
 gr.material='Artificial grass mat (illustrative texture)';gr.renderNote='Grass texture is illustrative. Strip-light position along the top edge is an approximation.';

 // 6 · Fixed PVC louvers, Natural Rough Cut Wood colour.
 const lv=unit('louvers','PVC louvers','louver',0);lv.fixed=true;
 B(lv.group,42,53.25,30,83.25,1,1.4,lv.side);
 for(let x=42.6;x<=52.4;x+=1.6)B(lv.group,x,x+.9,30,83.25,1.4,2.4,lv.front);
 lv.material='PVC louvers in Natural Rough Cut Wood colour';lv.renderNote='Fixed — no opening. Slat width/spacing approximate.';

 // 7 · Back, end and top panels (fixed).
 const sr=unit('surround','Back & end panels','fixed',.6);sr.fixed=true;
 B(sr.group,0,54,0,84,0,1,sr.side);B(sr.group,53.25,54,0,84,1,12,sr.side);B(sr.group,0,1,30,84,1,14,sr.side);
 B(sr.group,0,15,84-t,84,14,51,sr.side);
 sr.renderNote='Panel thicknesses are approximations around the verified source planes.';

 function polygon(f,material){const n=new T.Vector3(...f.normal).normalize(),ax=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),ay=n.clone().cross(ax).normalize(),loops=f.points.map(l=>l.map(p=>new T.Vector3(...p))),flat=loops.flat(),xy=flat.flatMap(p=>[p.dot(ax),p.dot(ay)]),holes=[];let count=loops[0].length;for(const l of loops.slice(1)){holes.push(count);count+=l.length;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(flat.flatMap(p=>p.toArray()),3));g.setIndex(earcut(xy,holes));g.computeVertexNormals();return new T.Mesh(g,material);}
 for(const f of exactLayout.sourceFaces){const m=polygon(f,new T.MeshStandardMaterial({color:f.color,side:T.DoubleSide,roughness:1,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));m.userData.sourceFace=f.id;referenceRoot.add(m);sourceMeshes.push(m);}
 const floor=B(architecture,-20,90,-1,-.02,-10,80,new T.MeshStandardMaterial({color:'#ded9cf',roughness:1}));floor.receiveShadow=true;
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 let reference=false;
 return {root,architecture,units,products:units,actions,sourceMeshes,exactLayout,
 setReference(on){reference=on;referenceRoot.visible=on;for(const u of units)u.group.visible=!on;architecture.visible=!on;},
 setLights(on){for(const u of units)for(const l of u.lightNodes)l.visible=on;lightMaterial.color.set(on?'#ffe2a6':'#a4a39c');for(const m of glowMaterials)m.emissiveIntensity=on?1:0;},
 update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='hinge')a.node.rotation.y=a.travel*a.value;else if(a.type==='slide')a.node.position.x=a.initial.x+a.travel*a.value;}}
 };
}
