import * as T from 'three';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';
import {exactLayout} from './exact-layout.js';
export {exactLayout};
// Confirmed 2026-11-21: every solid front aqua/mint high gloss, handleless.
// Hex is an approximation sampled from Bright's reference photo.
export const DEFAULT_FINISH='#7fb3ad';
export const FINISH_NAME='Aqua high gloss';
// Design options (Bright 2026-11-21): 1 = aqua high gloss + wood (original), 2 = beige high gloss + wood.
// Beige hex sampled from Bright's beige reference kitchen photo; approximation until a laminate code is given.
export const OPTIONS=[{id:1,label:'Option 1 · Aqua & wood',name:'Aqua high gloss',color:'#7fb3ad'},{id:2,label:'Option 2 · Beige & wood',name:'Beige high gloss',color:'#a8927e'}];
export const WOOD_TEXTURE='./wood-mica-reference.jpg';
export const WOOD_FINISH={name:'Wooden mica (reference)',color:'#a8693a',wood:true,texture:WOOD_TEXTURE};
export const project={id:'krishnagiri-kitchen-v1',customer:'Krishnagiri kitchen',location:'Krishnagiri',quotation:null};
export const definitions=exactLayout.units;
const OPEN_KINDS=['wicker-open','open'];
function proceduralWood(){const w=128,h=512,data=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const warp=Math.sin(y*.014)*2+Math.sin(y*.036+x*.018)*1.5,grain=Math.sin((x+warp)*1.5)*9+Math.sin((x+warp)*.35)*11;const i=(y*w+x)*4;data[i]=168+grain;data[i+1]=105+grain*.8;data[i+2]=58+grain*.6;data[i+3]=255;}const t=new T.DataTexture(data,w,h);t.needsUpdate=true;return t;}
function weaveTexture(){let t;if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#5e3517';g.fillRect(0,0,256,256);const row=21,len=42,gap=10;for(let r=0;r*row<256+row;r++){const y=r*row,off=r%2?(len+gap)/2:0;for(let x=-len;x<256+len;x+=len+gap){const gr=g.createLinearGradient(0,y,0,y+row-5);gr.addColorStop(0,'#e2ac68');gr.addColorStop(.5,'#c98a45');gr.addColorStop(1,'#9c632c');g.fillStyle=gr;g.beginPath();g.roundRect(x+off,y+2,len,row-5,6);g.fill();g.strokeStyle='rgba(255,226,170,.35)';g.lineWidth=1;g.beginPath();g.moveTo(x+off+5,y+5);g.lineTo(x+off+len-5,y+5);g.stroke();}}for(let r=0;r*row<256+row;r++){const off=r%2?(len+gap)/2:0;for(let x=-len;x<256+len;x+=len+gap){g.fillStyle='#8a5124';g.fillRect(x+off+len+1,r*row,gap-2,row);}}t=new T.CanvasTexture(c);}else{const n=64,data=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const on=((x+((y>>3)%2)*6)%12)<10&&(y%8)<6,i=(y*n+x)*4;data[i]=on?201:94;data[i+1]=on?138:53;data[i+2]=on?69:23;data[i+3]=255;}t=new T.DataTexture(data,n,n);t.needsUpdate=true;}t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2,1.6);t.anisotropy=8;return t;}
function woodTexture(){let t;if(typeof document!=='undefined'){t=new T.TextureLoader().load(WOOD_TEXTURE);}else t=proceduralWood();t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;return t;}
export function buildModel(){
 const root=new T.Group(),architecture=new T.Group();root.add(architecture);const units=[],actions=[],sourceMeshes=[],lightNodes=[];
 const woodMap=woodTexture();
 const wood=new T.MeshPhysicalMaterial({color:'#ffffff',map:woodMap,roughness:.5,clearcoat:.12,side:T.DoubleSide});
 const woodSkin=wood.clone();woodSkin.polygonOffset=true;woodSkin.polygonOffsetFactor=-2;woodSkin.polygonOffsetUnits=-4;
 // Vertical grain for the exposed end panels (Bright 2026-11-21: 'I need vertical texture').
 const woodMapVertical=woodTexture();woodMapVertical.center.set(0,0);woodMapVertical.offset.set(.02,.02);woodMapVertical.rotation=Math.PI/2;woodMapVertical.repeat.set(.5,.5);const woodSkinVertical=woodSkin.clone();woodSkinVertical.map=woodMapVertical;
 // Closed-cabinet interiors: neutral, not wood (wood only in open areas per Bright's correction).
 const liner=new T.MeshStandardMaterial({color:'#eeebe3',roughness:.55});
 const steel=new T.MeshStandardMaterial({color:'#929b9d',metalness:.85,roughness:.25}),wicker=new T.MeshStandardMaterial({color:'#ffffff',map:weaveTexture(),roughness:.7,side:T.DoubleSide}),rimWood=new T.MeshPhysicalMaterial({color:'#a55f2c',roughness:.38,clearcoat:.35}),slotDark=new T.MeshStandardMaterial({color:'#2a160a',roughness:.9}),plinth=new T.MeshStandardMaterial({color:'#dddcd3',roughness:.6,side:T.DoubleSide});
 const shelfGlass=new T.MeshPhysicalMaterial({color:'#cfe3e0',transparent:true,opacity:.35,roughness:.03,clearcoat:1,depthWrite:false});
 const led=new T.MeshStandardMaterial({color:'#fff0c9',emissive:'#ffd59d',emissiveIntensity:2}),ledBright=new T.MeshStandardMaterial({color:'#fff3df',emissive:'#ffe0b8',emissiveIntensity:1.6,toneMapped:false,transparent:true,opacity:.9});// drawn after the tinted glass so the strips glow through it like real LED profiles
 const faceById=new Map(exactLayout.sourceFaces.map(f=>[f.id,f]));
 function box(parent,w,h,d,x,y,z,mat){if(Math.min(w,h,d)<.0001)return null;const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.002,w/6,h/6,d/6)),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function rod(parent,a,b,r=.003,mat=steel){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),m=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),6),mat);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());parent.add(m);return m;}
 function wire(p,w,d,y,z,hh=.13){for(const yy of [y,y+hh]){for(const zz of [z-d/2,z+d/2])rod(p,[-w/2,yy,zz],[w/2,yy,zz]);for(const xx of [-w/2,w/2])rod(p,[xx,yy,z-d/2],[xx,yy,z+d/2]);}for(let i=0;i<=8;i++){const xx=-w/2+w*i/8;rod(p,[xx,y,z-d/2],[xx,y,z+d/2],.002);for(const zz of [z-d/2,z+d/2])rod(p,[xx,y,zz],[xx,y+hh,zz],.002);}for(let i=0;i<=5;i++){const zz=z-d/2+d*i/5;for(const xx of [-w/2,w/2])rod(p,[xx,y,zz],[xx,y+hh,zz],.002);}}
 function sourceFace(f,mat,parent,localUV=false){const n=new T.Vector3(...f.normal).normalize(),u=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),v=n.clone().cross(u).normalize();const loops=f.points.map(l=>l.map(p=>new T.Vector3(...p))),planeLoops=loops.map(l=>l.map(p=>new T.Vector2(p.dot(u),p.dot(v))));const indices=T.ShapeUtils.triangulateShape(planeLoops[0],planeLoops.slice(1)).flat(),points=loops.flat();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flatMap(p=>p.toArray()),3));g.setAttribute('normal',new T.Float32BufferAttribute(points.flatMap(()=>n.toArray()),3));const u0=localUV?Math.min(...points.map(p=>p.dot(u))):0,v0=localUV?Math.min(...points.map(p=>p.dot(v))):0;g.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(p=>[(p.dot(u)-u0)*1.4,(p.dot(v)-v0)*1.4]),2));g.setIndex(indices);parent.updateWorldMatrix(true,false);g.applyMatrix4(parent.matrixWorld.clone().invert());const mesh=new T.Mesh(g,mat);mesh.userData.sourceFace=f.id;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);sourceMeshes.push(mesh);return mesh;}
 function action(u,node,type,travel,direction){const a={unit:u,node,type,travel,open:false,value:0,initial:node.position.clone(),direction:direction||new T.Vector3(0,0,1)};u.actions.push(a);actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 function localPart(u,part){const frame=new T.Group();frame.position.fromArray(part.center);frame.rotation.y=Math.atan2(part.normal[0],part.normal[2]);u.group.add(frame);return frame;}
 function interior(u,parent){const p=new T.Group();p.userData.interior=true;u.interiors.push(p);parent.add(p);return p;}
 // LED surface light: frosted aluminium-profile diffuser plus a rectangular area light, so the counter/shelf gets a soft linear wash
 // and reflections stay a continuous strip while the kitchen is rotated (no spotlight pools).
 function addLight(parent,x,y,z,w,d,mat=led,intensity=45){const strip=box(parent,w,.01,.018,x,y,z,mat);if(mat!==led)strip.renderOrder=10;strip.userData.onMaterial=mat;strip.castShadow=false;strip.userData.led=true;const light=new T.RectAreaLight('#ffe6c2',intensity,w,.03);light.position.set(x,y-.007,z);light.rotation.x=-Math.PI/2;parent.add(light);lightNodes.push(strip,light);return strip;}
 function carcass(u,frame,w,h,d,inner=liner){const t=.018;const cabinet=new T.Group();cabinet.position.z=-.022;frame.add(cabinet);frame=cabinet;d=Math.max(.05,d-.022);box(frame,t,h,d,-w/2+t/2,0,-d/2,inner===liner?u.side:inner);box(frame,t,h,d,w/2-t/2,0,-d/2,inner===liner?u.side:inner);box(frame,w-2*t,t,d,0,-h/2+t/2,-d/2,inner);box(frame,w-2*t,t,d,0,h/2-t/2,-d/2,inner);box(frame,w-2*t,h-2*t,t,0,0,-d+t/2,inner);}
 function shelves(u,frame,w,h,d,count,mat=liner){const inside=interior(u,frame);for(let i=1;i<=count;i++)box(inside,w-.045,mat===shelfGlass?.008:.018,d-.06,0,-h/2+h*i/(count+1),-d/2,mat);}
 function shutter(u,frame,part,{glass=false,hinge=true,hingeRight=false,travel=1.65}={}){const pivot=new T.Group();const sgn=hingeRight?-1:1;pivot.position.x=-sgn*part.w/2;pivot.userData.hingeRight=hingeRight;frame.add(pivot);const {w,h}=part;frame.updateWorldMatrix(true,true);
 if(glass){const pane=new T.MeshPhysicalMaterial({color:'#0b0d0e',transparent:true,opacity:.8,roughness:.05,metalness:0,clearcoat:.6,clearcoatRoughness:.05,envMapIntensity:.35,side:T.DoubleSide,depthWrite:false});sourceFace(faceById.get(part.faceId),pane,pivot);const frameMetal=new T.MeshPhysicalMaterial({color:'#1d1e1d',metalness:.7,roughness:.3});for(const x of [.01,w-.01])box(pivot,.02,h,.02,sgn*x,0,-.008,frameMetal);for(const y of [-h/2+.01,h/2-.01])box(pivot,w,.02,.02,sgn*w/2,y,-.008,frameMetal);}
 else{const reference=sourceFace(faceById.get(part.faceId),u.front,pivot);reference.userData.referenceOnly=true;reference.visible=false;box(pivot,w-.006,h-.006,.019,sgn*w/2,0,-.0095,u.front);}
 if(hinge)action(u,pivot,'hinge',-sgn*travel);return pivot;}
 function tray(u,frame,part,kind,{y=0,hh=part.h,hasFront=true}={}){const {w,depth:d}=part;const p=new T.Group();p.position.y=y;frame.add(p);
 if(hasFront){frame.updateWorldMatrix(true,true);const reference=sourceFace(faceById.get(part.faceId),u.front,p);reference.userData.referenceOnly=true;reference.visible=false;box(p,w-.006,hh-.006,.019,0,0,-.0095,u.front);}
 const inside=interior(u,p),ww=Math.max(.1,w-.07),dd=Math.max(.12,d-.08),base=-hh/2+.03,z=-d/2;
 if(kind==='oil'){for(let i=0;i<3;i++)wire(inside,ww,dd,-hh/2+.07+i*(hh-.22)/2,z,.12);}
 else if(kind==='rice'){const bh=Math.min(.46,hh-.07);box(inside,ww,bh,dd,0,-hh/2+.04+bh/2,z,liner);box(inside,.012,bh*.9,dd*.95,0,-hh/2+.04+bh/2,z,steel);box(inside,ww+.005,.016,dd+.005,0,-hh/2+.055+bh,z,steel);}
 else if(kind==='wicker'){const bh=Math.max(.1,hh-.08),t=.008,rimH=.028,rimW=.034,top=base+bh;
  // woven rattan body
  box(inside,ww-2*t,t,dd-2*t,0,base+t/2,z,wicker);for(const x of [-ww/2+t/2,ww/2-t/2])box(inside,t,bh-rimH,dd,x,base+(bh-rimH)/2,z,wicker);for(const zz of [z-dd/2+t/2,z+dd/2-t/2])box(inside,ww,bh-rimH,t,0,base+(bh-rimH)/2,zz,wicker);
  // brown wooden rim frame on top; deeper front rail with a cut-out handle slot (as in Bright's reference basket)
  const ry=top-rimH/2;box(inside,ww+.01,rimH,rimW*.6,0,ry,z-dd/2+rimW*.3,rimWood);for(const x of [-ww/2+rimW*.3,ww/2-rimW*.3])box(inside,rimW*.6,rimH,dd-rimW*1.2,x,ry,z+rimW*.2,rimWood);box(inside,ww+.016,rimH*1.6,.014,0,ry-rimH*.3,z+dd/2+.007,rimWood);box(inside,Math.min(.16,ww*.38),.012,.004,0,ry-rimH*.2,z+dd/2+.0145,slotDark);}
 else{// tandem drawer box: steel sides, liner base/back
  const sh=Math.max(.06,hh-.05);box(inside,ww,.012,dd,0,base,z,liner);for(const x of [-ww/2,ww/2])box(inside,.012,sh,dd,x,base+sh/2,z,steel);box(inside,ww,sh,.012,0,base+sh/2,z-dd/2,liner);
  if(kind==='cutlery'){const tray=new T.MeshStandardMaterial({color:'#8d9192',roughness:.4});for(let i=1;i<5;i++)box(inside,.006,.04,dd*.9,-ww/2+ww*i/5,base+.026,z,tray);box(inside,ww*.95,.006,.006,0,base+.026,z-dd*.2,tray);}
  if(kind==='thali'){for(let i=0;i<9;i++)for(const zz of [z-dd*.15,z+dd*.25])rod(inside,[-ww*.4+ww*.8*i/8,base+.01,zz],[-ww*.4+ww*.8*i/8,base+.14,zz],.0025);for(const zz of [z-dd*.15,z+dd*.25])rod(inside,[-ww*.42,base+.14,zz],[ww*.42,base+.14,zz]);}
 }
 action(u,p,'slide',Math.min(.46,d*.78));return p;}
 const assigned=new Set();
 for(const def of definitions){const group=new T.Group();root.add(group);const front=new T.MeshPhysicalMaterial({color:DEFAULT_FINISH,roughness:.015,metalness:0,clearcoat:1,clearcoatRoughness:0,ior:1.49,specularIntensity:1,envMapIntensity:2.1,side:T.DoubleSide}),side=front.clone(),sideSkin=side.clone(),u={...def,group,front,side,sideSkin,actions:[],interiors:[],angle:Math.atan2(def.parts[0].normal[0],def.parts[0].normal[2])};
 if(OPEN_KINDS.includes(u.kind)){u.defaultSide={...WOOD_FINISH};u.finishable=false;for(const mat of [side,sideSkin]){mat.map=woodMap;mat.color.set('#ffffff');mat.roughness=.5;mat.clearcoat=.12;}}
 // Imported outer skins share planes with generated panels; offset only the skins.
 sideSkin.polygonOffset=true;sideSkin.polygonOffsetFactor=-2;sideSkin.polygonOffsetUnits=-4;
 units.push(u);def.sourceFaces.forEach(id=>assigned.add(id));
 if(def.kind==='open'){
  for(const id of def.sourceFaces)sourceFace(faceById.get(id),woodSkin,group);
  // concealed light in the open box ceiling (source face 42942)
  const ceil=faceById.get(42942),pts=ceil.points.flat(),lo=[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))),hi=[0,1,2].map(i=>Math.max(...pts.map(p=>p[i])));
  const holder=new T.Group();holder.position.set((lo[0]+hi[0])/2,lo[1]-.006,(lo[2]+hi[2])/2);holder.rotation.y=-Math.PI/2;group.add(holder);addLight(holder,0,0,.1,hi[2]-lo[2]-.04,.05);
 }else for(const part of def.parts){const frame=localPart(u,part),{w,h,depth:d}=part;
  if(def.kind==='wicker-open'){carcass(u,frame,w,h,d,wood);const ref=sourceFace(faceById.get(part.faceId),u.front,frame);ref.userData.referenceOnly=true;ref.visible=false;for(let i=0;i<2;i++)tray(u,frame,part,'wicker',{y:-h/2+h/2*(i+.5),hh:h/2,hasFront:false});continue;}
  carcass(u,frame,w,h,d);
  if(def.kind==='shelves'){shelves(u,frame,w,h,d,1);shutter(u,frame,part);}
  else if(def.kind==='glass'){shelves(u,frame,w,h,d,1,shelfGlass);shutter(u,frame,part,{glass:true});
   // Concealed lighting inside every glass unit: top strip only (Bright 2026-11-21 correction).
   const glow=interior(u,frame);glow.userData.glassLighting=true;addLight(glow,0,h/2-.03,-.05,w-.06,.08,ledBright,25);}
  else if(def.kind==='corner'){
   shutter(u,frame,part,{hingeRight:true,travel:1.45});const linked=u.actions[u.actions.length-1];linked.hingeSide='right';linked.cornerRacks=[];
   for(let tier=0;tier<2;tier++){
    const rack=interior(u,frame);rack.userData.cornerBasket=true;const ww=w-.07,dd=d-.10,y=-h/2+.10+tier*(h-.24),shape=new T.Shape();
    shape.moveTo(-ww*.42,-dd*.35);shape.bezierCurveTo(-ww*.58,-dd*.05,-ww*.46,dd*.38,-ww*.10,dd*.42);shape.bezierCurveTo(ww*.40,dd*.48,ww*.58,dd*.18,ww*.42,-dd*.10);shape.bezierCurveTo(ww*.28,-dd*.40,ww*.05,-dd*.10,-ww*.10,-dd*.10);shape.bezierCurveTo(-ww*.22,-dd*.11,-ww*.18,-dd*.42,-ww*.42,-dd*.35);
    const base=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:false,curveSegments:20}),steel);base.rotation.x=-Math.PI/2;base.position.set(0,y,-d/2);rack.add(base);
    const outline=shape.getPoints(40);for(let j=1;j<outline.length;j++){const a=outline[j-1],b=outline[j];rod(rack,[a.x,y+.08,-d/2-a.y],[b.x,y+.08,-d/2-b.y],.003);if(j%4===0)rod(rack,[a.x,y,-d/2-a.y],[a.x,y+.08,-d/2-a.y],.002);}
    linked.cornerRacks.push(rack);rack.traverse(o=>{if(o.isMesh)o.userData.action=linked;});
   }
  }
  else tray(u,frame,part,def.kind);
 }
 group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 }
 // Fixed source geometry: countertop placeholder stone, lit wooden undersides, aqua outer skins.
 const stoneIds=new Set(exactLayout.special.countertop),litIds=new Set(exactLayout.special.litUndersides),woodEndIds=new Set(exactLayout.special.woodEndPanels||[]);
 const stone=new T.MeshPhysicalMaterial({color:'#1f2221',roughness:.18,clearcoat:.7,side:T.DoubleSide});stone.polygonOffset=true;stone.polygonOffsetFactor=-3;stone.polygonOffsetUnits=-6;const wallFace=new T.MeshStandardMaterial({color:'#efede6',roughness:.8,side:T.DoubleSide});
 for(const f of exactLayout.sourceFaces){if(assigned.has(f.id))continue;const pts=f.points.flat(),isFloor=pts.every(p=>Math.abs(p[1])<1e-8);const wallSide=f.normal[0]>.9||f.normal[2]<-.9;let mat=isFloor?plinth:stoneIds.has(f.id)?stone:litIds.has(f.id)?woodSkin:woodEndIds.has(f.id)?woodSkinVertical:wallSide?wallFace:null,owner=null;
 if(!mat){const center=pts.reduce((v,p)=>v.add(new T.Vector3(...p)),new T.Vector3()).multiplyScalar(1/pts.length);let distance=Infinity;for(const u of units)for(const part of u.parts){if(OPEN_KINDS.includes(u.kind))continue;const d=center.distanceToSquared(new T.Vector3(...part.center));if(d<distance){distance=d;owner=u;}}mat=owner.sideSkin;}
 const mesh=sourceFace(f,mat,architecture,woodEndIds.has(f.id));mesh.userData.floor=isFloor;mesh.userData.countertop=stoneIds.has(f.id);mesh.userData.wallSide=wallSide;if(owner){mesh.userData.unit=owner;mesh.userData.outerSkin=true;mesh.castShadow=false;}
 if(litIds.has(f.id)){mesh.userData.litUnderside=true;// concealed strips along the front edges of the corner wall units
  const lo=[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))),hi=[0,1,2].map(i=>Math.max(...pts.map(p=>p[i])));const y=lo[1]-.006;
  const backFrontZ=-(185.3-101.3)*.0254,sideFrontX=(154.2-exactLayout.originInches[0])*.0254;
  const a=new T.Group();a.position.set((lo[0]+sideFrontX)/2,y,backFrontZ-.06);architecture.add(a);addLight(a,0,0,0,sideFrontX-lo[0]-.04,.02);
  const b=new T.Group();b.position.set(sideFrontX+.06,y,(backFrontZ+hi[2])/2);b.rotation.y=-Math.PI/2;architecture.add(b);addLight(b,0,0,0,hi[2]-backFrontZ-.04,.02);
 }}
 const baseMembers=units.filter(u=>u.parts.every(p=>p.center[1]+p.h/2<.9));
 const baseGroup=new T.Group();root.add(baseGroup);
 const base={id:'base-cabinet',name:'Complete kitchen base cabinet',kind:'base',group:baseGroup,members:baseMembers,angle:-1.2,// view the L from inside the room
 actions:baseMembers.flatMap(u=>u.actions)};
 for(const u of units){u.product=baseMembers.includes(u)?base:u;if(u.product===u)u.members=[u];else baseGroup.add(u.group);}
 for(const mesh of [...architecture.children]){const f=faceById.get(mesh.userData.sourceFace);if(!f)continue;const pts=f.points.flat();if(!mesh.userData.floor&&Math.max(...pts.map(p=>p[1]))<.90){baseGroup.add(mesh);mesh.userData.unit??=baseMembers[0];}}
 const products=[base,...units.filter(u=>u.product===u)];
 let reference=false,lightsOn=true;const allMeshes=[];root.traverse(o=>{if(o.isMesh)allMeshes.push(o);});
 function setLights(on){lightsOn=on;for(const n of lightNodes){if(n.isLight)n.visible=on&&!reference;else n.material=on?(n.userData.onMaterial||led):liner;}}
 function setReference(on){reference=on;if(on){for(const a of actions){a.open=false;a.value=0;a.node.position.copy(a.initial);a.node.rotation.set(0,0,0);}}for(const mesh of allMeshes){if(on){mesh.userData.finishedMaterial??=mesh.material;const f=faceById.get(mesh.userData.sourceFace);if(f){mesh.userData.referenceMaterial??=new T.MeshStandardMaterial({color:f.color,roughness:.65,side:T.DoubleSide});mesh.material=mesh.userData.referenceMaterial;mesh.visible=true;}else mesh.visible=false;}else{if(mesh.userData.finishedMaterial)mesh.material=mesh.userData.finishedMaterial;mesh.visible=!mesh.userData.referenceOnly;}}setLights(lightsOn);}
 root.updateMatrixWorld(true);return {root,architecture,units,products,actions,sourceMeshes,lightNodes,exactLayout,setReference,setLights,get lightsOn(){return lightsOn;},update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='slide')a.node.position.z=a.initial.z+a.travel*a.value;else a.node.rotation.y=a.travel*a.value;if(a.cornerRacks){const p=T.MathUtils.clamp((a.value-.35)/.65,0,1);a.cornerRacks.forEach((rack,i)=>{rack.position.z=.36*p;rack.position.x=(i?-.04:.04)*p;rack.rotation.y=(i?.55:-.55)*p;});}}for(const u of units){const visible=!reference&&(OPEN_KINDS.includes(u.kind)||u.kind==='glass'||u.actions.some(a=>a.value>.015));for(const p of u.interiors)p.visible=visible;}}};
}
