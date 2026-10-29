import * as T from 'three';
import {earcut} from '../venki/triangulate.js';
import {exactLayout} from './exact-layout.js';
export {exactLayout};
export {createWoodTexture} from '../venki/model.js';
import {createWoodTexture} from '../venki/model.js';
export const DEFAULT_FINISH='#c6b69f';
export const project={id:'venki-new-unit-v1',customer:'Mr. Venki',quotation:null};
const I=.0254,beige={name:'Beige matte',color:DEFAULT_FINISH},walnut={name:'Walnut brown matte',color:'#76523b',wood:true};
// Thickness/reveals, exact laminate shade/grain and rod placement are render
// approximations. Outer dimensions/face loops come from the supplied SKP.
export function buildModel(){
 const root=new T.Group(),architecture=new T.Group(),referenceRoot=new T.Group();root.add(architecture,referenceRoot);referenceRoot.visible=false;
 const units=[],actions=[],sourceMeshes=[],t=.016,reveal=.003;
 const interiorMat=new T.MeshStandardMaterial({color:'#ddd3c1',roughness:.9});
 const metal=new T.MeshStandardMaterial({color:'#a1a39f',metalness:.85,roughness:.25});
 function material(f){const m=new T.MeshPhysicalMaterial({color:f.wood?'#ffffff':f.color,map:f.wood?createWoodTexture():null,roughness:.83,clearcoat:0,side:T.DoubleSide});m.userData.compatColor=f.color;return m;}
 function box(p,w,h,d,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
 function unit(id,name,kind,x,y,w,h,depth,front=beige,side=walnut){const group=new T.Group();group.position.set(x,y,0);root.add(group);const u={id,name,kind,group,x,y,w,h,depth,angle:0,front:material(front),side:material(side),defaultFront:{...front},defaultSide:{...side},actions:[],interiors:[],finishable:true};u.sideSkin=u.side;u.members=[u];u.product=u;units.push(u);return u;}
 function act(u,node,type,travel,extra={}){const a={unit:u,node,type,travel,initial:node.position.clone(),open:false,value:0,...extra};actions.push(a);u.actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 function polygon(f,mat){const n=new T.Vector3(...f.normal).normalize(),ax=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),ay=n.clone().cross(ax).normalize(),loops=f.points.map(l=>l.map(p=>new T.Vector3(...p))),flat=loops.flat(),xy=flat.flatMap(p=>[p.dot(ax),p.dot(ay)]),holes=[];let count=loops[0].length;for(const l of loops.slice(1)){holes.push(count);count+=l.length;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(flat.flatMap(p=>p.toArray()),3));g.setIndex(earcut(xy,holes));g.computeVertexNormals();const m=new T.Mesh(g,mat);m.userData={sourceFace:f.id,exactPolygon:true,polygonLoops:loops,polygonNormal:n};return m;}
 function fixedSource(u,ids,mat=u.front){for(const id of ids){const f=exactLayout.sourceFaces.find(f=>f.id===id),m=polygon(f,mat);m.position.set(-u.x,-u.y,0);m.castShadow=false;m.receiveShadow=false;u.group.add(m);}}
 function casework(u){const g=new T.Group();u.group.add(g);u.interiors.push(g);box(u.group,t,u.h,u.depth,-u.w/2+t/2,0,-u.depth/2-t/2,u.side);box(u.group,t,u.h,u.depth,u.w/2-t/2,0,-u.depth/2-t/2,u.side);for(const y of [-u.h/2+t/2,u.h/2-t/2])box(u.group,u.w-2*t,t,u.depth,0,y,-u.depth/2-t/2,u.side);box(u.group,u.w-2*t,u.h-2*t,t,0,0,-u.depth+t/2,u.side);return g;}
 function doubleCabinet(id,name,left){const u=unit(id,name,'shelves',(left+19.5)*I,42*I,39*I,84*I,24*I);const g=casework(u);for(let i=1;i<=4;i++)box(g,u.w-2*t,t,u.depth-.04,0,-u.h/2+t+(u.h-2*t)*i/5,-u.depth/2,interiorMat);u.shelfCount=4;u.shelfSpacing='even';u.cabinetCount=1;u.doorCount=2;u.handles='Handleless';for(const right of [false,true]){const pivot=new T.Group();pivot.position.set((right?1:-1)*u.w/2,0,0);u.group.add(pivot);box(pivot,u.w/2-reveal,u.h-reveal,t,(right?-1:1)*u.w/4,0,0,u.front);act(u,pivot,'hinge',right?Math.PI/2:-Math.PI/2);}return u;}
 doubleCabinet('cabinet-left','Double-door cabinet · left',54);doubleCabinet('cabinet-right','Double-door cabinet · right',93);
 const fixed=unit('fixed-front','Fixed beige section','fixed',9*I,42*I,18*I,84*I,24*I,beige,beige);box(fixed.group,fixed.w,fixed.h,t,0,0,-t/2,fixed.front);fixed.fixed=true;
 const side=unit('side-shutter','Side-opening hanging cabinet','side-shutter',9*I,61*I,18*I,46*I,23*I,walnut);side.angle=Math.PI/2;side.handles='Handleless';side.hingeEdge='rear';side.swingDirection='inward toward mirror';
 // Cabinet behind the fixed front: right-side access. No shelves/drawers.
 box(side.group,side.w,side.h,t,0,0,-23*I,side.side);box(side.group,t,side.h,23*I,-side.w/2+t/2,0,-11.5*I,side.side);for(const yy of [-side.h/2+t/2,side.h/2-t/2])box(side.group,side.w,t,23*I,0,yy,-11.5*I,side.side);
 const sg=new T.Group();side.group.add(sg);side.interiors.push(sg);const rod=new T.Mesh(new T.CylinderGeometry(.009,.009,side.w-.08,24),metal);rod.rotation.z=Math.PI/2;rod.position.set(0,side.h/2-.12,-.28);sg.add(rod);side.rodCount=1;side.shelfCount=0;side.internalDrawerCount=0;
 // Source green plane: x=18 inches, front-to-rear length=20 inches.
 // Positive Y rotation at rear pivot moves its free front edge toward mirror.
 const pivot=new T.Group();pivot.position.set(9*I,0,-20*I);side.group.add(pivot);const sideDoor=box(pivot,t,46*I-reveal,20*I-reveal,0,0,10*I,side.front);const sideAction=act(side,pivot,'hinge',Math.PI/2);sideAction.confirmedHinge='rear';sideAction.confirmedSwing='inward';side.sideDoor=sideDoor;
 const trim=unit('surround','Walnut surround & open compartments','open',36*I,61*I,36*I,46*I,23*I,walnut);fixedSource(trim,[46604,46422,46635,46399,46666,46882,46886,46887,46675,46914,46916,46918,46684,46946,46948,46951,46693,46980,46982,46983,47043,47107]);trim.compartmentCount=4;trim.fixed=true;
 const table=unit('table','Brown mica table','table',36*I,19*I,36*I,38*I,23*I,walnut);fixedSource(table,[46470,46494,46519,46568,46572]);table.fixed=true;table.renderNote='Brown mica uses a provisional walnut-tone swatch; exact brown shade was not supplied.';
 const drawer=unit('drawer','Beige makeup drawer','drawer',36*I,34*I,36*I,8*I,23*I);const dg=new T.Group();drawer.group.add(dg);box(dg,drawer.w-reveal,drawer.h-reveal,t,0,0,0,drawer.front);const dd=.43;box(dg,drawer.w-.04,.012,dd,0,-drawer.h/2+.02,-dd/2-.016,interiorMat);for(const x of [-drawer.w/2+.025,drawer.w/2-.025])box(dg,.012,drawer.h-.04,dd,x,0,-dd/2-.016,interiorMat);box(dg,drawer.w-.04,drawer.h-.04,.012,0,0,-dd,interiorMat);act(drawer,dg,'drawer',.35);drawer.handles='Handleless';
 const mirror=unit('mirror','Touch-light mirror','mirror',28.5*I,61*I,15*I,40*I,0,walnut);mirror.finishable=false;mirror.group.position.z=-23*I;
 const mm=new T.MeshPhysicalMaterial({color:'#bcc8ca',metalness:1,roughness:.04});const pane=box(mirror.group,mirror.w,mirror.h,.008,0,0,.007,mm);pane.castShadow=false;const lg=new T.Group();mirror.group.add(lg);const glow=new T.MeshBasicMaterial({color:'#fff0d4'});for(const x of [-mirror.w/2+.006,mirror.w/2-.006])box(lg,.008,mirror.h-.01,.004,x,0,.014,glow);for(const y of [-mirror.h/2+.006,mirror.h/2-.006])box(lg,mirror.w-.01,.008,.004,0,y,.014,glow);const light=new T.PointLight('#ffe4b5',.7,1.5);light.position.set(0,0,.12);lg.add(light);const touch=new T.Mesh(new T.TorusGeometry(.012,.0017,8,24),glow);touch.position.set(0,-mirror.h/2+.07,.018);mirror.group.add(touch);const ma=act(mirror,pane,'light',0,{lightGroup:lg});ma.open=true;ma.value=1;touch.userData.action=ma;mirror.touchLight=ma;mirror.lightColour='Warm white';mirror.lightControl='Touch sensor';
 // Reference mode preserves every extracted root face including neutral ones.
 for(const f of exactLayout.sourceFaces){const m=polygon(f,new T.MeshStandardMaterial({color:f.color,side:T.DoubleSide,roughness:1}));referenceRoot.add(m);sourceMeshes.push(m);}
 const floor=box(architecture,4.2,.025,1.8,66*I,-.035,-.28,new T.MeshStandardMaterial({color:'#ded9cf',roughness:1}));floor.receiveShadow=true;
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 let reference=false;return {root,architecture,units,products:units,actions,sourceMeshes,exactLayout,setReference(on){reference=on;referenceRoot.visible=on;for(const u of units)u.group.visible=!on;architecture.visible=!on;},update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='hinge')a.node.rotation.y=a.travel*a.value;else if(a.type==='drawer')a.node.position.z=a.initial.z+a.travel*a.value;else if(a.type==='light')a.lightGroup.visible=a.open;}for(const u of units)for(const g of u.interiors)g.visible=!reference&&u.actions.some(a=>a.type==='hinge'&&a.value>.05);}};
}
