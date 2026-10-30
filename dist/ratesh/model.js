import * as T from 'three';
import {earcut} from '../venki/triangulate.js';
import {exactLayout} from './exact-layout.js';
export {exactLayout};
export const DEFAULT_FINISH='#c6a974';
export const project={id:'ratesh-wardrobe-v1',customer:'Mr. Ratesh',quotation:null};
export const DAYTONA_TEXTURE='./daytona-reference.jpg';
let woodTexture;
export function createWoodTexture(){
 if(!woodTexture){woodTexture=new T.TextureLoader().load(DAYTONA_TEXTURE);woodTexture.colorSpace=T.SRGBColorSpace;
 woodTexture.wrapS=woodTexture.wrapT=T.ClampToEdgeWrapping;woodTexture.offset.set(.02,.075);woodTexture.repeat.set(.96,.915);
 woodTexture.anisotropy=8;woodTexture.userData.shared=true;}return woodTexture;
}
const I=.0254,daytona={name:'Daytona wood matte',color:DEFAULT_FINISH,wood:true},smoke={name:'Smoke-grey glass',color:'#5e6263'};
export function buildModel(){
 const root=new T.Group(),architecture=new T.Group(),referenceRoot=new T.Group();root.add(architecture,referenceRoot);referenceRoot.visible=false;
 const units=[],actions=[],sourceMeshes=[],t=.016,reveal=.003;
 const white=new T.MeshStandardMaterial({color:'#f7f6f1',roughness:.9});
 const black=new T.MeshStandardMaterial({color:'#202523',metalness:.65,roughness:.35});
 const chrome=new T.MeshStandardMaterial({color:'#b9b9b3',metalness:.85,roughness:.24});
 const glassMaterial=new T.MeshPhysicalMaterial({color:'#8ca4a0',transparent:true,opacity:.32,roughness:.08,metalness:.05,side:T.DoubleSide,depthWrite:false});
 const lightMaterial=new T.MeshBasicMaterial({color:'#ffe5ad'});
 function mat(f){const m=new T.MeshPhysicalMaterial({color:f.wood?'#ffffff':f.color,map:f.wood?createWoodTexture():null,roughness:.84,clearcoat:0,side:T.DoubleSide});m.userData.compatColor=f.color;return m;}
 function box(p,w,h,d,x,y,z,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
 function unit(id,name,kind,x,y,w,h,depth,front=daytona,side=daytona){const group=new T.Group();group.position.set(x,y,0);root.add(group);
 const u={id,name,kind,group,x,y,w,h,depth,angle:0,front:mat(front),side:mat(side),defaultFront:{...front},defaultSide:{...side},actions:[],interiors:[],finishable:true};u.sideSkin=u.side;u.members=[u];u.product=u;units.push(u);return u;}
 function act(u,node,type,travel,extra={}){const a={unit:u,node,type,travel,initial:node.position.clone(),open:false,value:0,...extra};actions.push(a);u.actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 function cabinet(u,inside=white){const g=u.group;box(g,t,u.h,u.depth,-u.w/2+t/2,0,-u.depth/2,u.side);box(g,t,u.h,u.depth,u.w/2-t/2,0,-u.depth/2,u.side);
 for(const y of [-u.h/2+t/2,u.h/2-t/2])box(g,u.w-2*t,t,u.depth,0,y,-u.depth/2,inside);
 box(g,u.w-2*t,u.h-2*t,t,0,0,-u.depth+t/2,inside);
 for(const x of [-u.w/2+t+.0015,u.w/2-t-.0015])box(g,.002,u.h-2*t,u.depth-t,x,0,-u.depth/2,inside);return g;}
 function shelf(u,y,m=white,depth=u.depth-.03){return box(u.group,u.w-2*t-.004,t,depth,0,y-u.y,-depth/2-.012,m);}
 function rod(u,y){const o=new T.Mesh(new T.CylinderGeometry(.009,.009,u.w-.065,20),chrome);o.rotation.z=Math.PI/2;o.position.set(0,y-u.y,-.28);u.group.add(o);}
 function doors(u,framed=false){for(const right of [false,true]){const pivot=new T.Group();pivot.position.set((right?1:-1)*u.w/2,0,.010);u.group.add(pivot);const cx=(right?-1:1)*u.w/4,w=u.w/2-reveal,h=u.h-reveal;
 if(framed){const frame=.018;box(pivot,w,h,.008,cx,0,0,u.front);
 for(const x of [cx-w/2+frame/2,cx+w/2-frame/2])box(pivot,frame,h,.026,x,0,.008,black);
 for(const yy of [-h/2+frame/2,h/2-frame/2])box(pivot,w-2*frame,frame,.026,cx,yy,.008,black);
 for(const yy of [-h/2+h/3,-h/2+2*h/3])box(pivot,w-2*frame,.010,.018,cx,yy,.006,black);
 }else box(pivot,w,h,t,cx,0,0,u.front);act(u,pivot,'hinge',right?Math.PI*.478:-Math.PI*.478);}u.doorCount=2;}
 function strip(u,y,width=u.w-.05,depth=.08){const yy=y-u.y;box(u.group,width,.006,.012,0,yy,-depth,lightMaterial);
 const l=new T.PointLight('#ffe4af',.10,.6,2);l.position.set(0,yy-.025,-depth+.025);u.group.add(l);u.lightNodes??=[];u.lightNodes.push(l);}
 const hanging=unit('wardrobe-hanging','Wardrobe · hanging','wardrobe',18*I,43.5*I,36*I,81*I,24*I);cabinet(hanging);doors(hanging);
 shelf(hanging,70*I);rod(hanging,66*I);for(const y of [9,15,21])shelf(hanging,y*I);hanging.handles='Handleless';
 hanging.renderNote='Rod and shelf arrangement follows highlighted reference; no drawers. Positions are scaled visual proportions.';
 const folded=unit('wardrobe-shelves','Wardrobe · shelves','wardrobe',54*I,43.5*I,36*I,81*I,24*I);cabinet(folded);doors(folded);
 for(const y of [17,30,43,56,70])shelf(folded,y*I);folded.handles='Handleless';
 folded.renderNote='Shelf arrangement follows highlighted reference, with drawers omitted; render proportions only.';
 for(const u of [hanging,folded])box(u.group,u.w,3*I,24*I,0,-42*I,-12*I,u.side);
 const seat=unit('bay-seat','Bay-window seating','seat',108*I,7.5*I,72*I,15*I,24*I);
 box(seat.group,seat.w,t,seat.depth,0,-seat.h/2+t/2,-seat.depth/2,seat.side);
 for(const x of [-seat.w/2+t/2,seat.w/2-t/2])box(seat.group,t,seat.h,seat.depth,x,0,-seat.depth/2,seat.side);
 for(const z of [-t/2,-seat.depth+t/2])box(seat.group,seat.w-2*t,seat.h,t,0,0,z,z>-.1?seat.front:seat.side);
 const lid=new T.Group();lid.position.set(0,seat.h/2,-seat.depth+t/2);seat.group.add(lid);
 box(lid,seat.w-reveal,t,seat.depth-reveal,0,t/2,seat.depth/2-t/2,seat.front);
 box(lid,seat.w-.035,.065,seat.depth-.035,0,t+.0325,seat.depth/2-t/2,new T.MeshStandardMaterial({color:'#f7f6f1',roughness:1}));
 act(seat,lid,'lift',-1.05);seat.storage=true;seat.cushionColour='White';
 seat.renderNote='15-inch SKP base; cushion thickness and lift hardware are visual approximations.';
 const fixed=unit('fixed-base','Fixed Daytona section','fixed',150*I,16.5*I,12*I,27*I,24*I);cabinet(fixed,fixed.side);box(fixed.group,fixed.w-reveal,fixed.h-reveal,t,0,0,.004,fixed.front);fixed.fixed=true;
 box(fixed.group,fixed.w,3*I,fixed.depth,0,-15*I,-fixed.depth/2,fixed.side);
 const display=unit('open-glass-shelves','Open glass shelves','open',150*I,57*I,12*I,54*I,6*I);
 box(display.group,10*I,52*I,t,0,0,-3*I,display.side);
 for(const x of [-5.5*I,5.5*I])box(display.group,1*I,54*I,3*I,x,0,-1.5*I,display.side);
 for(const y of [-26.5*I,26.5*I])box(display.group,10*I,1*I,3*I,0,y,-1.5*I,display.side);
 for(const y of [43.5,56.5,69.5]){box(display.group,10*I,.008,6*I,0,y*I-display.y,-3*I,glassMaterial);strip(display,(y-.6)*I,9*I,2.6*I);}
 strip(display,82.4*I,9*I,2.6*I);display.shelfCount=3;display.shelfMaterial='Glass';
 // Small decorative plants stand on the three open glass shelves.
 const potMat=new T.MeshStandardMaterial({color:'#e7e3d9',roughness:.92});
 const soilMat=new T.MeshStandardMaterial({color:'#493d2f',roughness:1});
 const stemMat=new T.MeshStandardMaterial({color:'#526d42',roughness:.9});
 const leafMats=['#496e47','#668853','#78935f'].map(color=>new T.MeshStandardMaterial({color,roughness:.88,side:T.DoubleSide}));
 const plantShelfHeights=[43.5,56.5,69.5];display.plantCount=3;display.plants=[];
 for(let i=0;i<3;i++){
  const plant=new T.Group();plant.name='Shelf plant '+(i+1);plant.userData.decor='shelf-plant';
  plant.position.set((i===1?1:-1)*.025,plantShelfHeights[i]*I-display.y+.004,-.039);
  display.group.add(plant);display.plants.push(plant);
  const pot=new T.Mesh(new T.CylinderGeometry(.025,.019,.044,18),potMat);pot.position.y=.022;pot.castShadow=true;pot.receiveShadow=true;plant.add(pot);
  const soil=new T.Mesh(new T.CylinderGeometry(.022,.022,.002,18),soilMat);soil.position.y=.043;plant.add(soil);
  const stem=new T.Mesh(new T.CylinderGeometry(.0015,.002,.098,8),stemMat);stem.position.y=.091;plant.add(stem);
  for(let j=0;j<8;j++){
   const sign=j%2?1:-1,level=Math.floor(j/2);
   const leaf=new T.Mesh(new T.SphereGeometry(1,10,6),leafMats[(i+j)%3]);
   leaf.scale.set(.025-level*.002,.009,.010);leaf.rotation.z=sign*(.45+level*.1);
   leaf.position.set(sign*(.018-level*.001),.064+level*.021,(j%3-1)*.006);
   leaf.castShadow=true;plant.add(leaf);
  }
  const tip=new T.Mesh(new T.SphereGeometry(1,10,6),leafMats[i]);tip.scale.set(.010,.024,.009);tip.position.y=.151;plant.add(tip);
 }

 const side=unit('side-door','Side-opening shirt cabinet','side',150*I,57*I,12*I,54*I,24*I);side.angle=-Math.PI/2;
 box(side.group,12*I,54*I,t,0,0,-24*I+t/2,side.side);
 box(side.group,t,54*I,21*I,6*I-t/2,0,-13.5*I,side.side);
 for(const y of [-27*I+t/2,27*I-t/2])box(side.group,12*I,t,21*I,0,y,-13.5*I,side.side);
 const pivot=new T.Group();pivot.position.set(-6*I-.001,0,-24*I);side.group.add(pivot);
 box(pivot,t,54*I-reveal,21*I-reveal,0,0,10.5*I,side.front);
 const sa=act(side,pivot,'hinge',-Math.PI/2);sa.confirmedHinge='rear';sa.confirmedSwing='outward into bay-window space';
 side.hingeEdge='rear';side.swingDirection='outward into bay-window space';
 const hooks=new T.Group();side.group.add(hooks);side.interiors.push(hooks);
 for(const yy of [15*I,6*I,-3*I]){
 for(const x of [-.007,.007]){const disc=new T.Mesh(new T.SphereGeometry(.012,12,8),chrome);disc.scale.set(1,1,.4);disc.position.set(x,yy,-23.3*I);hooks.add(disc);}
 const stem=new T.Mesh(new T.CylinderGeometry(.003,.003,.034,8),chrome);stem.rotation.x=Math.PI/2;stem.position.set(0,yy,-22.8*I);hooks.add(stem);
 const tip=new T.Mesh(new T.SphereGeometry(.009,12,8),chrome);tip.position.set(0,yy+.004,-22.1*I);hooks.add(tip);}
 side.internalStorage='Apple hooks only';side.hookCount=3;side.renderNote='Three illustrative apple hooks; exact count, product and placement unconfirmed.';
 const tall=unit('glass-cabinet','Smoke-grey glass cabinet','glass',174*I,43.5*I,36*I,81*I,24*I,smoke);
 tall.front.transparent=true;tall.front.opacity=.33;tall.front.depthWrite=false;tall.front.roughness=.08;tall.front.metalness=.05;tall.finishable=false;
 cabinet(tall,tall.side);doors(tall,true);
 for(const yy of [19.2,35.4,51.6,67.8]){shelf(tall,yy*I,tall.side);strip(tall,(yy-.55)*I,34*I,2*I);}
 strip(tall,82.4*I,34*I,2*I);tall.shelfCount=4;tall.shelfMaterial='Daytona wood';tall.glassTint='Smoke-grey';
 box(tall.group,tall.w,3*I,tall.depth,0,-42*I,-tall.depth/2,tall.side);
 function polygon(f,material){const n=new T.Vector3(...f.normal).normalize(),ax=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),ay=n.clone().cross(ax).normalize(),loops=f.points.map(l=>l.map(p=>new T.Vector3(...p))),flat=loops.flat(),xy=flat.flatMap(p=>[p.dot(ax),p.dot(ay)]),holes=[];let count=loops[0].length;for(const l of loops.slice(1)){holes.push(count);count+=l.length;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(flat.flatMap(p=>p.toArray()),3));g.setIndex(earcut(xy,holes));g.computeVertexNormals();return new T.Mesh(g,material);}
 for(const f of exactLayout.sourceFaces){const m=polygon(f,new T.MeshStandardMaterial({color:f.color,side:T.DoubleSide,roughness:1}));m.userData.sourceFace=f.id;referenceRoot.add(m);sourceMeshes.push(m);}
 const floor=box(architecture,6.2,.025,2.4,96*I,-.04,-.15,new T.MeshStandardMaterial({color:'#ded9cf',roughness:1}));floor.receiveShadow=true;
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 let reference=false;
 return {root,architecture,units,products:units,actions,sourceMeshes,exactLayout,
 setReference(on){reference=on;referenceRoot.visible=on;for(const u of units)u.group.visible=!on;architecture.visible=!on;},
 setLights(on){for(const u of units)for(const l of u.lightNodes||[])l.visible=on;lightMaterial.color.set(on?'#ffe5ad':'#a4a39c');},
 update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='hinge')a.node.rotation.y=a.travel*a.value;else if(a.type==='lift')a.node.rotation.x=a.travel*a.value;}for(const u of units)for(const g of u.interiors)g.visible=!reference&&u.actions.some(a=>a.value>.04);}
 };
}
