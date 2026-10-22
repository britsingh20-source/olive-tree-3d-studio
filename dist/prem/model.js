import * as T from 'three';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';
import {exactLayout} from './exact-layout.js';
export {exactLayout};
export const DEFAULT_FINISH='#23576c';
export const project={id:'prem-temple-town-exact-skp-v2',customer:'Mr. Prem',location:'Temple Town · Teachers Colony · Karamadai',quotation:null,dimensionStatus:'Cabinet front positions, widths, heights and divisions read from the supplied SKP. Internal hardware is a design visualization.'};
export const definitions=exactLayout.units;
export function buildModel(){
 const root=new T.Group(),architecture=new T.Group();root.add(architecture);const units=[],actions=[],sourceMeshes=[];
 const liner=new T.MeshStandardMaterial({color:'#e9e3d5',roughness:.75}),steel=new T.MeshStandardMaterial({color:'#929b9d',metalness:.85,roughness:.25}),wicker=new T.MeshStandardMaterial({color:'#b99461',roughness:.85}),black=new T.MeshStandardMaterial({color:'#313c3d',roughness:.28}),white=new T.MeshPhysicalMaterial({color:'#f4f0e7',roughness:.26,clearcoat:.55,side:T.DoubleSide}),plinth=new T.MeshStandardMaterial({color:'#dddcd3',roughness:.6,side:T.DoubleSide});
 const faceById=new Map(exactLayout.sourceFaces.map(f=>[f.id,f]));
 function box(parent,w,h,d,x,y,z,mat){if(Math.min(w,h,d)<.0001)return null;const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.002,w/6,h/6,d/6)),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function rod(parent,a,b,r=.003,mat=steel){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),m=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),6),mat);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());parent.add(m);return m;}
 function wire(p,w,d,y,z,hh=.13){for(const yy of [y,y+hh]){for(const zz of [z-d/2,z+d/2])rod(p,[-w/2,yy,zz],[w/2,yy,zz]);for(const xx of [-w/2,w/2])rod(p,[xx,yy,z-d/2],[xx,yy,z+d/2]);}for(let i=0;i<=8;i++){const xx=-w/2+w*i/8;rod(p,[xx,y,z-d/2],[xx,y,z+d/2],.002);for(const zz of [z-d/2,z+d/2])rod(p,[xx,y,zz],[xx,y+hh,zz],.002);}for(let i=0;i<=5;i++){const zz=z-d/2+d*i/5;for(const xx of [-w/2,w/2])rod(p,[xx,y,zz],[xx,y+hh,zz],.002);}}
 function sourceFace(f,mat,parent){const n=new T.Vector3(...f.normal).normalize(),u=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),v=n.clone().cross(u).normalize();const loops=f.points.map(l=>l.map(p=>new T.Vector3(...p))),planeLoops=loops.map(l=>l.map(p=>new T.Vector2(p.dot(u),p.dot(v))));const indices=T.ShapeUtils.triangulateShape(planeLoops[0],planeLoops.slice(1)).flat(),points=loops.flat();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flatMap(p=>p.toArray()),3));g.setAttribute('normal',new T.Float32BufferAttribute(points.flatMap(()=>n.toArray()),3));g.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(p=>[p.dot(u),p.dot(v)]),2));g.setIndex(indices);parent.updateWorldMatrix(true,false);g.applyMatrix4(parent.matrixWorld.clone().invert());const mesh=new T.Mesh(g,mat);mesh.userData.sourceFace=f.id;mesh.userData.exactPolygon=true;mesh.userData.polygonLoops=loops.map(l=>l.map(p=>p.applyMatrix4(parent.matrixWorld.clone().invert())));mesh.userData.polygonNormal=n.clone().transformDirection(parent.matrixWorld.clone().invert());mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);sourceMeshes.push(mesh);return mesh;}
 function action(u,node,type,travel,direction){const a={unit:u,node,type,travel,open:false,value:0,initial:node.position.clone(),direction:direction||new T.Vector3(0,0,1)};u.actions.push(a);actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 function localPart(u,part){const frame=new T.Group();frame.position.fromArray(part.center);frame.rotation.y=Math.atan2(part.normal[0],part.normal[2]);u.group.add(frame);return frame;}
 function interior(u,parent){const p=new T.Group();p.userData.interior=true;u.interiors.push(p);parent.add(p);return p;}
 function carcass(u,frame,w,h,d){const t=.018;const cabinet=new T.Group();cabinet.position.z=-.022;frame.add(cabinet);frame=cabinet;d=Math.max(.05,d-.022);box(frame,t,h,d,-w/2+t/2,0,-d/2,u.side);box(frame,t,h,d,w/2-t/2,0,-d/2,u.side);box(frame,w-2*t,t,d,0,-h/2+t/2,-d/2,liner);box(frame,w-2*t,t,d,0,h/2-t/2,-d/2,liner);box(frame,w-2*t,h-2*t,t,0,0,-d+t/2,u.side);}
 function shelves(u,frame,w,h,d,count){const inside=interior(u,frame);for(let i=1;i<=count;i++)box(inside,w-.045,.018,d-.045,0,-h/2+h*i/(count+1),-d/2,liner);}
 function shutter(u,frame,part,{glass=false,hinge=true}={}){const pivot=new T.Group();pivot.position.x=-part.w/2;frame.add(pivot);const {w,h}=part;frame.updateWorldMatrix(true,true);
 if(glass){const pane=new T.MeshPhysicalMaterial({color:'#b9d4c6',transparent:true,opacity:.56,roughness:.025,metalness:.05,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.5,side:T.DoubleSide,depthWrite:false});const f=faceById.get(part.faceId);sourceFace(f,pane,pivot);for(const x of [.012,w-.012])box(pivot,.024,h,.021,x,0,-.008,steel);for(const y of [-h/2+.012,h/2-.012])box(pivot,w,.024,.021,w/2,y,-.008,steel);}
 else{const reference=sourceFace(faceById.get(part.faceId),u.front,pivot);reference.userData.referenceOnly=true;reference.visible=false;box(pivot,w-.006,h-.006,.019,w/2,0,-.0095,u.front);}
 if(hinge)action(u,pivot,'hinge',-1.65);return pivot;}
 function tray(u,frame,w,h,d,kind,y=0,hh=h,hasFront=true,part=null){const p=new T.Group();p.position.y=y;frame.add(p);if(hasFront){if(part){frame.updateWorldMatrix(true,true);const reference=sourceFace(faceById.get(part.faceId),u.front,p);reference.userData.referenceOnly=true;reference.visible=false;box(p,w-.006,hh-.006,.019,0,0,-.0095,u.front);}else box(p,w-.05,hh-.06,.014,0,0,-.015,liner);}
 const inside=interior(u,p),ww=Math.max(.1,w-.07),dd=Math.max(.12,d-.07),base=-hh/2+.035,z=-d/2;
 if(kind==='oil'){for(let i=0;i<3;i++)wire(inside,ww,dd,-hh/2+.07+i*(hh-.22)/2,z,.12);}
 else if(kind==='rice'){box(inside,ww,Math.min(.46,hh-.07),dd,0,-hh/2+.04+Math.min(.46,hh-.07)/2,z,liner);box(inside,ww+.005,.016,dd+.005,0,-hh/2+.055+Math.min(.46,hh-.07),z,steel);}
 else if(kind==='tall'){for(const x of [-ww/2,ww/2])rod(inside,[x,-hh/2+.07,-d+.035],[x,hh/2-.07,-d+.035],.007);for(let i=0;i<6;i++)wire(inside,ww,dd,-hh/2+.12+(hh-.38)*i/5,z,.14);}
 else if(kind==='wicker'){const bh=Math.max(.1,hh-.07);box(inside,ww,.012,dd,0,base,z,wicker);for(let i=0;i<11;i++){const yy=base+bh*i/10;for(const x of [-ww/2,ww/2])box(inside,.009,.008,dd,x,yy,z,wicker);for(const zz of [z-dd/2,z+dd/2])box(inside,ww,.008,.009,0,yy,zz,wicker);}for(let i=0;i<14;i++)for(const zz of [z-dd/2,z+dd/2])box(inside,.007,bh,.007,-ww/2+ww*i/13,base+bh/2,zz,wicker);}
 else{box(inside,ww,.012,dd,0,base,z,liner);for(const x of [-ww/2,ww/2])box(inside,.012,Math.max(.04,hh-.05),dd,x,base+(hh-.05)/2,z,steel);box(inside,ww,Math.max(.04,hh-.05),.012,0,base+(hh-.05)/2,z-dd/2,liner);}
 action(u,p,'slide',Math.min(.46,d*.78));return p;}
 const assigned=new Set();
 for(const def of definitions){const group=new T.Group();root.add(group);const front=new T.MeshPhysicalMaterial({color:DEFAULT_FINISH,roughness:.07,metalness:0,clearcoat:1,clearcoatRoughness:.025,ior:1.49,specularIntensity:1,envMapIntensity:1.25,side:T.DoubleSide}),side=front.clone(),sideSkin=side.clone(),u={...def,group,front,side,sideSkin,actions:[],interiors:[],angle:Math.atan2(def.parts[0].normal[0],def.parts[0].normal[2])};// Imported outer skins share planes with the generated carcass panels.
 // Give only the skins a depth priority, leaving all measured vertices intact.
 sideSkin.polygonOffset=true;sideSkin.polygonOffsetFactor=-2;sideSkin.polygonOffsetUnits=-4;
 units.push(u);def.sourceFaces.forEach(id=>assigned.add(id));
 if(def.kind==='dishwasher'){
 // The three blue faces describe the original appliance bay, including its
 // rear and sides. Keep those faces and fit the appliance within that bay.
 const all=def.sourceFaces.flatMap(id=>faceById.get(id).points.flat()),lo=[0,1,2].map(i=>Math.min(...all.map(p=>p[i]))),hi=[0,1,2].map(i=>Math.max(...all.map(p=>p[i])));for(const id of def.sourceFaces)sourceFace(faceById.get(id),steel,group);
 const w=hi[0]-lo[0],h=hi[1]-lo[1],d=hi[2]-lo[2],frame=new T.Group();frame.position.set((lo[0]+hi[0])/2,(lo[1]+hi[1])/2,lo[2]);frame.rotation.y=Math.PI;group.add(frame);u.angle=Math.PI;const pivot=new T.Group();pivot.position.y=-h/2;frame.add(pivot);box(pivot,w-.006,h-.006,.025,0,h/2,-.013,steel);box(pivot,w-.025,.05,.014,0,h-.04,-.001,black);const rack=interior(u,frame);wire(rack,w-.07,d-.06,-h*.25,-d/2,.13);wire(rack,w-.07,d-.06,h*.20,-d/2,.13);action(u,pivot,'flap',Math.PI/2);
 }else for(const part of def.parts){const frame=localPart(u,part),{w,h,depth:d}=part;carcass(u,frame,w,h,d);
 if(def.kind==='shelves'||def.kind==='pantry'||def.kind==='glass'){shelves(u,frame,w,h,d,def.kind==='pantry'?5:2);shutter(u,frame,part,{glass:def.kind==='glass'});if(def.kind==='glass'){const led=new T.MeshStandardMaterial({color:'#fff0c9',emissive:'#ffd59d',emissiveIntensity:2});box(frame,w-.04,.008,.014,0,h/2-.025,-d+.025,led);const light=new T.PointLight('#ffe1af',.5,.9);light.position.set(0,h/2-.06,-d/2);frame.add(light);}}
 else if(def.kind==='wicker'){shutter(u,frame,part);for(let i=0;i<2;i++)tray(u,frame,w,h,d,'wicker',-h/2+h/2*(i+.5),h/2,false);}
 else tray(u,frame,w,h,d,def.kind,0,h,true,part);
 }
 group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 }
 // Keep every remaining source polygon: continuous worktops, outer side
 // panels, plinth, floor outline, fillers and the original stepped sections.
 const stoneFaceIds=new Set([46522,46524,46526,46816,46839,47033]);
 for(const f of exactLayout.sourceFaces){if(assigned.has(f.id))continue;const pts=f.points.flat(),isFloor=pts.every(p=>Math.abs(p[1])<1e-8),isPlinth=Math.max(...pts.map(p=>p[1]))<.08;let mat=isFloor||isPlinth?plinth:white;
 // Original white carcass surfaces receive the chosen exterior mica. The
 // separate stone worktop and its edge polygons keep their stone material.
 if(!isFloor&&!isPlinth&&!stoneFaceIds.has(f.id)){const center=pts.reduce((v,p)=>v.add(new T.Vector3(...p)),new T.Vector3()).multiplyScalar(1/pts.length);let closest=units[0],distance=Infinity;for(const u of units.filter(u=>u.kind!=='dishwasher'))for(const part of u.parts){const d=center.distanceToSquared(new T.Vector3(...part.center));if(d<distance){distance=d;closest=u;}}mat=closest.sideSkin;}
 const mesh=sourceFace(f,mat,architecture);if(units.some(u=>mat===u.sideSkin)){mesh.userData.outerSkin=true;mesh.castShadow=false;}
 mesh.userData.floor=isFloor;mesh.userData.wall=Math.abs(f.normal[1])<.5;}
 // Select the complete low-level cabinet run as one customer-facing item.
 const baseMembers=units.filter(u=>!['dishwasher','glass','pantry','tall'].includes(u.kind)&&u.parts.every(p=>p.center[1]<1));
 const baseGroup=new T.Group();root.add(baseGroup);
 const base={id:'base-cabinet',name:'Complete kitchen base cabinet',kind:'base',group:baseGroup,members:baseMembers,angle:Math.PI/4,actions:baseMembers.flatMap(u=>u.actions)};
 for(const u of units){u.product=baseMembers.includes(u)?base:u;if(u.product===u)u.members=[u];else baseGroup.add(u.group);}
 // The raised appliance surround belongs to the dishwasher, not the base run.
 const dishwasher=units.find(u=>u.kind==='dishwasher');
 const dishwasherFrameFaceIds=new Set([46520,46522,46816,46828,46851,46939]);
 for(const mesh of [...architecture.children])if(dishwasherFrameFaceIds.has(mesh.userData.sourceFace)){
  dishwasher.group.add(mesh);mesh.userData.unit=dishwasher;mesh.userData.dishwasherFrame=true;
  // Keep the surround independent from later mica changes to the base run.
  mesh.material=mesh.material.clone();
 }
 // Include the adjoining worktop and exposed base panels in the item view.
 for(const mesh of [...architecture.children]){const f=faceById.get(mesh.userData.sourceFace),pts=f.points.flat();if(!mesh.userData.floor&&Math.max(...pts.map(p=>p[1]))<1.1&&Math.min(...pts.map(p=>p[1]))<.85){baseGroup.add(mesh);mesh.userData.unit=baseMembers[0];}}
 const products=[base,...units.filter(u=>u.product===u)];
 // Track source meshes by face ID for regression checks and imported overlays.
 let reference=false;const allMeshes=[];root.traverse(o=>{if(o.isMesh)allMeshes.push(o);});
 function setReference(on){reference=on;if(on){for(const a of actions){a.open=false;a.value=0;a.node.position.copy(a.initial);a.node.rotation.set(0,0,0);}}for(const mesh of allMeshes){if(on){mesh.userData.finishedMaterial??=mesh.material;const f=faceById.get(mesh.userData.sourceFace);if(f){mesh.userData.referenceMaterial??=new T.MeshStandardMaterial({color:f.color,roughness:.65,side:T.DoubleSide});mesh.material=mesh.userData.referenceMaterial;mesh.visible=true;}else mesh.visible=false;}else{if(mesh.userData.finishedMaterial)mesh.material=mesh.userData.finishedMaterial;mesh.visible=!mesh.userData.referenceOnly;}}}
 root.updateMatrixWorld(true);return {root,architecture,units,products,actions,sourceMeshes,exactLayout,setReference,update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='slide')a.node.position.z=a.initial.z+a.travel*a.value;else if(a.type==='flap')a.node.rotation.x=a.travel*a.value;else a.node.rotation.y=a.travel*a.value;}for(const u of units){const visible=!reference&&u.actions.some(a=>a.value>.015);for(const p of u.interiors)p.visible=visible;}}};
}
