import * as T from 'three';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';
import {exactLayout} from './exact-layout.js';
export {exactLayout};
// Krishnagiri living area. Every meaning below was confirmed by Bright on 2026-11-22
// (customers/krishnagiri-living/design.json). Items marked APPROX are render approximations still to confirm.
export const WOOD_TEXTURE='./wood-mica-reference.jpg';
export const LOUVER_TEXTURE='./louver-reference.jpg';
export const WOOD_FINISH={name:'Wooden mica (reference)',color:'#a06230',wood:true,texture:WOOD_TEXTURE};
export const DEFAULT_FINISH=WOOD_FINISH.color;
export const FINISH_NAME=WOOD_FINISH.name;
export const project={id:'krishnagiri-living-v1',customer:'Krishnagiri living area',location:'Krishnagiri',quotation:null};
export const definitions=exactLayout.units;
export const PRODUCTS={'crockery':{name:'Crockery unit',angle:0},'wall-unit':{name:'Book shelf wall unit',angle:0},'tv-unit':{name:'TV unit',angle:Math.PI/2},'entrance':{name:'Entrance partition',angle:Math.PI/2},'pooja':{name:'Pooja unit',angle:-Math.PI/2},'under-stair':{name:'Under-staircase storage',angle:-Math.PI/2},'bench':{name:'Seating bench',angle:Math.PI/2}};
const IN=exactLayout.metresPerInch,[OX,OY]=exactLayout.originInches;
// source inches (x, y, height) -> scene metres
export const P=(x,y,z)=>new T.Vector3((x-OX)*IN,z*IN,-(y-OY)*IN);
const browser=typeof document!=='undefined';
function canvasTexture(w,h,draw,fallback='#cccccc'){let t;if(browser){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);t=new T.CanvasTexture(c);}else{const col=new T.Color(fallback),data=new Uint8Array(16);for(let i=0;i<4;i++){data[i*4]=col.r*255;data[i*4+1]=col.g*255;data[i*4+2]=col.b*255;data[i*4+3]=255;}t=new T.DataTexture(data,2,2);t.needsUpdate=true;}t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;}
function imageTexture(url,fallback){let t;if(browser)t=new T.TextureLoader().load(url);else{t=canvasTexture(2,2,()=>{},fallback);}t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;return t;}
// White marble-look slab (Bright's TV background reference: warm white with soft gold/beige veining). One tile = one slab.
function marbleTexture(){return canvasTexture(1024,1024,(g,w,h)=>{const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(19);g.fillStyle='#f1ede5';g.fillRect(0,0,w,h);
 // soft clouding
 for(let k=0;k<260;k++){const x=rnd()*w,y=rnd()*h,r=30+rnd()*160,gr=g.createRadialGradient(x,y,0,x,y,r);const warm=rnd()<.5;gr.addColorStop(0,warm?'rgba(226,214,194,.10)':'rgba(255,255,255,.14)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}
 const vein=(x,y,dx,dy,len,width,col,blur,depth=0)=>{g.filter='blur('+blur+'px)';g.strokeStyle=col;g.lineCap='round';let px=x,py=y;for(let k=0;k<len;k++){const nx=px+dx*(18+rnd()*14)+(rnd()-.5)*22,ny=py+dy*(18+rnd()*14)+(rnd()-.5)*22;g.lineWidth=Math.max(.4,width*(.55+rnd()*.9));g.beginPath();g.moveTo(px,py);g.quadraticCurveTo((px+nx)/2+(rnd()-.5)*14,(py+ny)/2+(rnd()-.5)*14,nx,ny);g.stroke();px=nx;py=ny;if(depth<2&&rnd()<.08)vein(px,py,dx+(rnd()-.5),dy+(rnd()-.5),8+rnd()*10,width*.45,col,blur,depth+1);}};
 // two main diagonal gold veins with soft halo, then thin grey veins
 for(const [x,y,dx,dy] of [[-40,140,.72,.7],[380,-30,.35,.94],[1060,520,-.8,.6]]){vein(x,y,dx,dy,48,9,'rgba(196,160,110,.18)',6);vein(x,y,dx,dy,48,2.4,'rgba(166,122,66,.55)',.8);}
 for(let k=0;k<6;k++)vein(rnd()*w,rnd()*h,rnd()-.5,rnd()-.2,20+rnd()*20,1,'rgba(150,140,128,.22)',.6);
 g.filter='none';g.fillStyle='rgba(120,110,95,.18)';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);},'#f1ede5');}
function pebbleMat(){return new T.MeshStandardMaterial({color:'#8f8a82',roughness:.75});}
// Pooja CNC shutter pattern (design ONLY from Bright's photo — not its colour): mandala split across the pair,
// hanging bells along the top, lotus motifs. Drawn for both 15in shutters side by side (30 x 84 in, 20 px/in).
function cncTexture(){const PX=20;return canvasTexture(30*PX,84*PX,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-out';const Y=z=>h-z*PX,X=x=>x*PX;
 // mandala centred on the meeting edge at 49in: rings of petal cut-outs growing outward
 const cx=X(15),cy=Y(49);for(const [r,n,s] of [[4.2,10,.9],[6,14,1.15],[7.9,18,1.4],[9.9,22,1.65],[11.9,26,1.9]])for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2+(r>7?.08:0),x=cx+Math.cos(a)*r*PX,y=cy+Math.sin(a)*r*PX;g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.ellipse(0,0,s*PX*.62,s*PX*.5,0,0,Math.PI*2);g.fill();g.restore();}
 // keep a solid strip on the meeting edge so each half stays one piece
 g.globalCompositeOperation='source-over';g.fillStyle='#ffffff';g.fillRect(cx-PX*.35,0,PX*.7,h);g.globalCompositeOperation='destination-out';
 const bell=(x,z,s)=>{g.beginPath();g.moveTo(X(x),Y(z+s));g.bezierCurveTo(X(x-s*.55),Y(z+s*.9),X(x-s*.5),Y(z+s*.2),X(x-s*.75),Y(z));g.lineTo(X(x+s*.75),Y(z));g.bezierCurveTo(X(x+s*.5),Y(z+s*.2),X(x+s*.55),Y(z+s*.9),X(x),Y(z+s));g.fill();g.beginPath();g.arc(X(x),Y(z-.25),s*PX*.18,0,Math.PI*2);g.fill();};
 for(const [x,drop] of [[3,14],[7.5,8],[11.5,4],[18.5,4],[22.5,8],[27,14]]){for(let z=84;z>84-drop;z-=1.4){g.fillRect(X(x)-PX*.12,Y(z),PX*.24,PX*.7);}bell(x,84-drop-2.2,2);}
 const lotus=(x,z,s)=>{for(const [a,len,wid] of [[0,1,.32],[-.45,.85,.28],[.45,.85,.28],[-1,.7,.24],[1,.7,.24]]){g.save();g.translate(X(x),Y(z));g.rotate(a);g.beginPath();g.ellipse(0,-len*s*PX*.5,wid*s*PX,len*s*PX*.5,0,0,Math.PI*2);g.fill();g.restore();}g.fillRect(X(x-s*.8),Y(z-s*.18),s*1.6*PX,s*.16*PX);};
 lotus(11,24,3.2);lotus(19,24,3.2);lotus(4.5,10,3.2);lotus(25.5,10,3.2);},'#ffffff');}
export function buildModel(){
 const root=new T.Group(),architecture=new T.Group();root.add(architecture);const units=[],actions=[],sourceMeshes=[],lightNodes=[];
 const woodMap=imageTexture(WOOD_TEXTURE,'#a06230');
 const wood=new T.MeshPhysicalMaterial({color:'#ffffff',map:woodMap,bumpMap:woodMap,bumpScale:.6,roughness:.42,clearcoat:.35,clearcoatRoughness:.22,side:T.DoubleSide});wood.userData.wood=true;
 const woodSkin=wood.clone();woodSkin.polygonOffset=true;woodSkin.polygonOffsetFactor=-2;woodSkin.polygonOffsetUnits=-4;
 const whiteMat=new T.MeshStandardMaterial({color:'#f1efe9',roughness:.85,side:T.DoubleSide});
 const liner=new T.MeshStandardMaterial({color:'#eeebe3',roughness:.55,side:T.DoubleSide});
 const marble=new T.MeshPhysicalMaterial({color:'#ffffff',map:marbleTexture(),roughness:.12,clearcoat:.8,clearcoatRoughness:.08,side:T.DoubleSide});marble.polygonOffset=true;marble.polygonOffsetFactor=-2;marble.polygonOffsetUnits=-4;
 const louverMat=new T.MeshStandardMaterial({color:'#ffffff',map:imageTexture(LOUVER_TEXTURE,'#7a4a2c'),roughness:.6,side:T.DoubleSide});louverMat.polygonOffset=true;louverMat.polygonOffsetFactor=-2;louverMat.polygonOffsetUnits=-4;
 const louverBack=new T.MeshStandardMaterial({color:'#2a1d14',roughness:.9,side:T.DoubleSide});louverBack.polygonOffset=true;louverBack.polygonOffsetFactor=-2;louverBack.polygonOffsetUnits=-4;const slatMat=new T.MeshPhysicalMaterial({color:'#b08672',map:woodMap,bumpMap:woodMap,bumpScale:.5,roughness:.5,clearcoat:.2});slatMat.userData.wood=true;// walnut tone sampled from Bright's louver swatch; vertical grain per slat
 const blackHole=new T.MeshStandardMaterial({color:'#0d0d0c',roughness:1,side:T.DoubleSide});blackHole.polygonOffset=true;blackHole.polygonOffsetFactor=-3;blackHole.polygonOffsetUnits=-6;
 const plate=new T.MeshStandardMaterial({color:'#f7f6f2',roughness:.35,side:T.DoubleSide});plate.polygonOffset=true;plate.polygonOffsetFactor=-3;plate.polygonOffsetUnits=-6;
 const switchMat=new T.MeshStandardMaterial({color:'#e6e4de',roughness:.3});
 const pebble=pebbleMat(),pebbleBase=new T.MeshStandardMaterial({color:'#6e6a63',roughness:.9,side:T.DoubleSide});
 const shelfGlass=new T.MeshPhysicalMaterial({color:'#d4e6e3',transparent:true,opacity:.32,roughness:.03,clearcoat:1,depthWrite:false});
 const led=new T.MeshStandardMaterial({color:'#fff4e0',emissive:'#ffcf94',emissiveIntensity:1.15}),profileMetal=new T.MeshStandardMaterial({color:'#b9bbbb',metalness:.8,roughness:.35}),ledBright=new T.MeshStandardMaterial({color:'#fff3df',emissive:'#ffe0b8',emissiveIntensity:1.6,toneMapped:false,transparent:true,opacity:.9});
 const ledOff=new T.MeshStandardMaterial({color:'#d9d6cf',roughness:.5});
 const glassTypes={// APPROX tints: Bright said 'tinted', 'clear', 'tinted gray'; exact shade to confirm
  'glass-tinted':{color:'#1b1d1d',opacity:.62},'glass-clear':{color:'#dbe8e6',opacity:.16},'glass-grey':{color:'#4c5253',opacity:.5},'glass-lift':{color:'#1b1d1d',opacity:.62}};
 const faceById=new Map(exactLayout.sourceFaces.map(f=>[f.id,f])),S=exactLayout.special;
 const box=(parent,w,h,d,x,y,z,mat)=>{if(Math.min(w,h,d)<.0001)return null;const geo=new RoundedBoxGeometry(w,h,d,2,Math.min(.002,w/6,h/6,d/6));if(mat?.userData?.wood)grainUV(geo,[w,h,d]);const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const worldBox=(parent,lo,hi,mat)=>{const a=P(...lo),b=P(...hi),c=a.clone().add(b).multiplyScalar(.5),s=a.clone().sub(b);parent.updateWorldMatrix(true,false);const m=box(parent,Math.abs(s.x),Math.abs(s.y),Math.abs(s.z),0,0,0,mat);if(!m)return null;m.position.copy(parent.worldToLocal(c.clone()));return m;};
 // Wood grain follows the longer side of every panel (Bright 2026-11-22: vertical units vertical grain, horizontal units horizontal grain).
 // The mica image has horizontal grain, so U runs along the grain. One texture tile = WOOD_TILE metres.
 const WOOD_TILE=1.1;
 function grainUV(geo,size){const pos=geo.attributes.position,nor=geo.attributes.normal,uv=geo.attributes.uv;for(let k=0;k<pos.count;k++){const n=[Math.abs(nor.getX(k)),Math.abs(nor.getY(k)),Math.abs(nor.getZ(k))],axis=n.indexOf(Math.max(...n)),plane=[0,1,2].filter(a=>a!==axis),[a,b]=size[plane[0]]>=size[plane[1]]?plane:[plane[1],plane[0]];uv.setXY(k,(pos.getComponent(k,a)+size[a]/2)/WOOD_TILE,(pos.getComponent(k,b)+size[b]/2)/WOOD_TILE);}uv.needsUpdate=true;}
 // sourceFace: mesh at the exact measured position. uv: [metres per tile across, metres per tile up] for tiled finishes.
 function sourceFace(f,mat,parent,uv=null){const n=new T.Vector3(...f.visibleNormal).normalize(),u=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),v=n.clone().cross(u).normalize();const loops=f.points.map(l=>l.map(p=>new T.Vector3(...p))),planeLoops=loops.map(l=>l.map(p=>new T.Vector2(p.dot(u),p.dot(v))));const indices=T.ShapeUtils.triangulateShape(planeLoops[0],planeLoops.slice(1)).flat(),points=loops.flat();const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flatMap(p=>p.toArray()),3));g.setAttribute('normal',new T.Float32BufferAttribute(points.flatMap(()=>n.toArray()),3));const u0=Math.min(...points.map(p=>p.dot(u))),v0=Math.min(...points.map(p=>p.dot(v))),eu=Math.max(...points.map(p=>p.dot(u)))-u0,ev=Math.max(...points.map(p=>p.dot(v)))-v0,[su,sv]=uv||[WOOD_TILE,WOOD_TILE],swap=!uv&&mat?.userData?.wood&&ev>eu;g.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap(p=>swap?[(p.dot(v)-v0)/sv,(p.dot(u)-u0)/su]:[(p.dot(u)-u0)/su,(p.dot(v)-v0)/sv]),2));g.setIndex(indices);parent.updateWorldMatrix(true,false);g.applyMatrix4(parent.matrixWorld.clone().invert());const mesh=new T.Mesh(g,mat);mesh.userData.sourceFace=f.id;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);sourceMeshes.push(mesh);return mesh;}
 function faceBounds(f){const pts=f.points.flat();return [[0,1,2].map(i=>Math.min(...pts.map(p=>p[i]))),[0,1,2].map(i=>Math.max(...pts.map(p=>p[i])))];}
 function action(u,node,type,travel){const a={unit:u,node,type,travel,open:false,value:0,initial:node.position.clone()};u.actions.push(a);actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 function localPart(u,part){const frame=new T.Group();frame.position.fromArray(part.center);frame.rotation.y=Math.atan2(part.normal[0],part.normal[2]);u.group.add(frame);return frame;}
 function interior(u,parent){const p=new T.Group();p.userData.interior=true;u.interiors.push(p);parent.add(p);return p;}
 // LED surface light: frosted profile + rectangular area light facing down (soft linear wash, no spot pools).
 function addLight(parent,x,y,z,w,d,mat=led,intensity=40,area=true){box(parent,w+.01,.012,Math.max(.016,d+.006),x,y+.004,z,profileMetal);const strip=box(parent,w,.004,Math.max(.006,d*.55),x,y-.003,z,mat);strip.userData.onMaterial=mat;strip.castShadow=false;strip.userData.led=true;if(mat!==led)strip.renderOrder=10;lightNodes.push(strip);if(area){const light=new T.RectAreaLight('#ffe6c2',intensity,w,Math.max(.03,d));light.position.set(x,y-.007,z);light.rotation.x=-Math.PI/2;parent.add(light);lightNodes.push(light);}return strip;}
 function stripUnder(f,intensity=40,parent=architecture){const [lo,hi]=faceBounds(f),dx=hi[0]-lo[0],dz=hi[2]-lo[2],g=new T.Group();g.position.set((lo[0]+hi[0])/2,lo[1]-.006,(lo[2]+hi[2])/2);if(dz>dx)g.rotation.y=Math.PI/2;parent.add(g);parent.updateWorldMatrix(true,false);g.applyMatrix4(parent.matrixWorld.clone().invert());addLight(g,0,0,0,Math.max(dx,dz)-.04,.018,led,intensity);return g;}
 function carcass(u,frame,w,h,d,inner=liner){const t=.018,c=new T.Group();c.position.z=-.022;frame.add(c);d=Math.max(.05,d-.022);box(c,t,h,d,-w/2+t/2,0,-d/2,u.side);box(c,t,h,d,w/2-t/2,0,-d/2,u.side);box(c,w-2*t,t,d,0,-h/2+t/2,-d/2,inner);box(c,w-2*t,t,d,0,h/2-t/2,-d/2,inner);box(c,w-2*t,h-2*t,t,0,0,-d+t/2,inner);return c;}
 function shelves(u,frame,w,h,d,count,mat=liner){const inside=interior(u,frame);for(let i=1;i<=count;i++)box(inside,w-.045,mat===shelfGlass?.008:.018,d-.06,0,-h/2+h*i/(count+1),-d/2-.02,mat);return inside;}
 function glassPane(kind){const t=glassTypes[kind];return new T.MeshPhysicalMaterial({color:t.color,transparent:true,opacity:t.opacity,roughness:.05,metalness:0,clearcoat:.6,clearcoatRoughness:.05,envMapIntensity:.4,side:T.DoubleSide,depthWrite:false});}
 const frameMetal=new T.MeshPhysicalMaterial({color:'#1d1e1d',metalness:.7,roughness:.3});
 // Side-hinged shutter. hingeRight: hinge on the viewer's right. Glass shutters are the measured source face itself.
 function shutter(u,frame,part,{glass=null,hingeRight=false,travel=1.65,sourceDoor=false,mat=null}={}){const pivot=new T.Group(),sgn=hingeRight?-1:1;pivot.position.x=-sgn*part.w/2;frame.add(pivot);const {w,h}=part;frame.updateWorldMatrix(true,true);
  if(glass){sourceFace(faceById.get(part.faceId),glassPane(glass),pivot);for(const x of [.01,w-.01])box(pivot,.02,h,.02,sgn*x,0,-.008,frameMetal);for(const y of [-h/2+.01,h/2-.01])box(pivot,w,.02,.02,sgn*w/2,y,-.008,frameMetal);}
  else if(sourceDoor){sourceFace(faceById.get(part.faceId),mat||u.front,pivot);}
  else{const ref=sourceFace(faceById.get(part.faceId),u.front,pivot);ref.userData.referenceOnly=true;ref.visible=false;box(pivot,w-.006,h-.006,.019,sgn*w/2,0,-.0095,mat||u.front);}
  const a=action(u,pivot,'hinge',-sgn*travel);a.hingeSide=hingeRight?'right':'left';return pivot;}
 const orderAcross=(parts)=>{const a=Math.atan2(parts[0].normal[0],parts[0].normal[2]),right=new T.Vector3(Math.cos(a),0,-Math.sin(a)),c0=new T.Vector3(...parts[0].center);return [...parts].sort((p,q)=>new T.Vector3(...p.center).sub(c0).dot(right)-new T.Vector3(...q.center).sub(c0).dot(right));};
 // Which source faces belong inside each unit (front face pushed back by its depth): they move with the unit in product view.
 const unitBoxes=[];
 const assigned=new Set();
 const cncTex=cncTexture();
 for(const def of definitions){const group=new T.Group();root.add(group);const front=wood.clone(),side=wood.clone(),sideSkin=woodSkin.clone(),u={...def,group,front,side,sideSkin,actions:[],interiors:[],defaultFront:{...WOOD_FINISH},defaultSide:{...WOOD_FINISH},angle:Math.atan2(def.parts[0].normal[0],def.parts[0].normal[2])};
  units.push(u);def.sourceFaces.forEach(id=>assigned.add(id));
  for(const part of def.parts){const n=new T.Vector3(...part.normal),b=new T.Box3(new T.Vector3(...part.lo),new T.Vector3(...part.hi));b.expandByPoint(new T.Vector3(...part.center).addScaledVector(n,-part.depth));b.expandByScalar(.012);unitBoxes.push([b,u]);}
  const ordered=orderAcross(def.parts);
  if(def.kind==='bench'){// Lift-up seat with cushion on top; storage only under the seating area (Bright). Body: wooden mica (APPROX).
   const part=def.parts[0];sourceFace(faceById.get(part.faceId),u.front,group);const bb=S.benchBox;const inside=interior(u,group);worldBox(inside,[bb.x[0]+.7,bb.y[0]+.7,bb.z[0]],[bb.x[1]-.7,bb.y[1]-.7,bb.z[0]+.7],liner);
   const hinge=new T.Group();hinge.position.copy(P(bb.x[0],(bb.y[0]+bb.y[1])/2,bb.z[1]));group.add(hinge);worldBox(hinge,[bb.x[0],bb.y[0],bb.z[1]],[bb.x[1],bb.y[1],bb.z[1]+.7],u.front);for(const id of S.benchTop){assigned.add(id);sourceFace(faceById.get(id),u.front,hinge);}// the measured seat top lifts with the lid
   const cushion=new T.MeshStandardMaterial({color:'#c9bfae',roughness:.95});// APPROX cushion colour (not yet chosen)
   const c=new T.Mesh(new RoundedBoxGeometry((bb.x[1]-bb.x[0])*IN,3*IN,(bb.y[1]-bb.y[0]-.6)*IN,4,.02),cushion);hinge.updateWorldMatrix(true,false);c.position.copy(hinge.worldToLocal(P((bb.x[0]+bb.x[1])/2,(bb.y[0]+bb.y[1])/2,bb.z[1]+.75+1.5)));c.castShadow=true;hinge.add(c);
   const a=action(u,hinge,'liftZ',1.25);a.hingeSide='wall';
  }
  else for(const part of def.parts){const frame=localPart(u,part),{w,h,depth:d}=part,i=ordered.indexOf(part);
   if(def.kind==='glass-tinted'||def.kind==='glass-clear'||def.kind==='glass-grey'){carcass(u,frame,w,h,d,wood);const count=def.id==='crockery'?4:def.id==='book-shelf'?2:def.id==='entrance-display'?5:3;// APPROX shelf counts
    shelves(u,frame,w,h,d,count,def.id==='book-shelf'?wood:shelfGlass);const pair=def.parts.length===2;shutter(u,frame,part,{glass:def.kind,hingeRight:pair&&i===1});
    const glow=interior(u,frame);glow.userData.glassLighting=true;addLight(glow,0,h/2-.03,-.05,w-.06,.05,ledBright,22);}
   else if(def.kind==='glass-lift'){carcass(u,frame,w,h,d);const pivot=new T.Group();pivot.position.y=h/2;frame.add(pivot);frame.updateWorldMatrix(true,true);sourceFace(faceById.get(part.faceId),glassPane('glass-lift'),pivot);box(pivot,w,.02,.02,0,-.01,-.008,frameMetal);box(pivot,w,.02,.02,0,-h+.01,-.008,frameMetal);action(u,pivot,'liftX',-1.15).hingeSide='top';shelves(u,frame,w,h,d,0);}
   else if(def.kind==='wood-shutters'){carcass(u,frame,w,h,d);shelves(u,frame,w,h,d,0);// pairs open outward from each pair centre (APPROX hinge sides)
    shutter(u,frame,part,{hingeRight:i%2===1});}
   else if(def.kind==='tandem'){carcass(u,frame,w,h,d);const p=new T.Group();frame.add(p);frame.updateWorldMatrix(true,true);const ref=sourceFace(faceById.get(part.faceId),u.front,p);ref.userData.referenceOnly=true;ref.visible=false;box(p,w-.006,h-.006,.019,0,0,-.0095,u.front);const inside=interior(u,p),ww=w-.07,dd=d-.08,steel=new T.MeshStandardMaterial({color:'#929b9d',metalness:.85,roughness:.25});box(inside,ww,.012,dd,0,-h/2+.02,-d/2,liner);for(const x of [-ww/2,ww/2])box(inside,.012,h-.06,dd,x,0,-d/2,steel);box(inside,ww,h-.06,.012,0,0,-d+.04,liner);action(u,p,'slide',d*.75);}
   else if(def.kind==='fixed'){carcass(u,frame,w,h,d);const ref=sourceFace(faceById.get(part.faceId),u.front,frame);ref.userData.referenceOnly=true;ref.visible=false;box(frame,w-.006,h-.006,.019,0,0,-.0095,u.front);// robot cleaner inside, visible through the side opening
    const bot=new T.Mesh(new T.CylinderGeometry(.165,.165,.09,40),new T.MeshStandardMaterial({color:'#2b2d2f',roughness:.35,metalness:.2}));bot.position.set(-.02,-h/2+.065,-d/2);frame.add(bot);const lid=new T.Mesh(new T.CylinderGeometry(.05,.05,.012,24),new T.MeshStandardMaterial({color:'#4a4d50'}));lid.position.set(-.02,-h/2+.115,-d/2+.06);frame.add(lid);}
   else if(def.kind==='cnc'){carcass(u,frame,w,h,d,wood);// warm glow behind the CNC cut-outs
    const glow=interior(u,frame);glow.userData.alwaysVisible=true;const back=new T.MeshStandardMaterial({color:'#e9b06d',emissive:'#ffb054',emissiveIntensity:.9});box(glow,w-.04,h-.04,.006,0,0,-d+.06,back);lightNodes.push(glow.children[0]);glow.children[0].userData.onMaterial=back;glow.children[0].userData.led=true;
    const shutterMat=new T.MeshStandardMaterial({color:'#efebe4',map:cncTex.clone(),alphaTest:.5,roughness:.55,side:T.DoubleSide});// APPROX shutter colour — the photo was for the CNC design only
    shutterMat.map.repeat.set(.5,1);shutterMat.map.offset.set(i===1?.5:0,0);shutterMat.map.needsUpdate=true;const pivot=shutter(u,frame,part,{hingeRight:i===1,sourceDoor:true,mat:shutterMat});
    // UVs of the measured face span 0..1 across this shutter: rewrite so the pattern lines up
    const m=pivot.children.find(o=>o.userData.sourceFace);const pos=m.geometry.attributes.position,uvA=m.geometry.attributes.uv;m.updateWorldMatrix(true,false);const f=faceById.get(part.faceId),[lo,hi]=faceBounds(f);const along=Math.abs(hi[0]-lo[0])>Math.abs(hi[2]-lo[2])?0:2;for(let k=0;k<pos.count;k++){const wp=new T.Vector3().fromBufferAttribute(pos,k).applyMatrix4(m.matrixWorld);let s=(wp.getComponent(along)-lo[along])/(hi[along]-lo[along]);const right=new T.Vector3(Math.cos(u.angle),0,-Math.sin(u.angle));if(right.getComponent(along)<0)s=1-s;uvA.setXY(k,s,(wp.y-lo[1])/(hi[1]-lo[1]));}uvA.needsUpdate=true;
    // round wood-look handle disc split across the meeting edge
    const half=new T.Mesh(new T.CylinderGeometry(.075,.075,.012,32,1,false,i===1?0:Math.PI,Math.PI),u.front);half.rotation.x=Math.PI/2;half.position.set(i===1?-w:w,49*IN-part.center[1],.008);pivot.add(half);}
   else if(def.kind==='stair-shutters'){// sloped-top shutters: the measured face is the door (hinged on the taller side, APPROX)
    shutter(u,frame,part,{sourceDoor:true,hingeRight:false,travel:1.5});}
  }
  group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 }
 // Fixed source geometry
 const sets=Object.fromEntries(Object.entries(S).filter(([,v])=>Array.isArray(v)&&typeof v[0]==='number').map(([k,v])=>[k,new Set(v)]));const woodColours=new Set(exactLayout.woodColours);
 const regions=Object.entries(S.productRegions).map(([pid,[a,b]])=>{const p1=P(...a),p2=P(...b);return [new T.Box3(p1.clone().min(p2),p1.clone().max(p2)).expandByScalar(.003),units.find(u=>u.product===pid)];});
 const ownerOf=f=>{const [lo,hi]=faceBounds(f),c=new T.Vector3(...lo).add(new T.Vector3(...hi)).multiplyScalar(.5);for(const [b,u] of unitBoxes)if(b.containsPoint(c))return u;for(const [b,u] of regions)if(b.containsPoint(c))return u;return null;};
 const groupOf=pid=>units.find(u=>u.product===pid).group;
 for(const f of exactLayout.sourceFaces){if(assigned.has(f.id))continue;const c=f.visibleColor;let mat,uv=null;
  if(sets.marble.has(f.id)){mat=marble;uv=[1.2,1.2];}else if(sets.louver.has(f.id)){mat=louverBack;uv=[1,1];}else if(sets.whiteWall.has(f.id))mat=whiteMat;else if(sets.robotOpening.has(f.id))mat=blackHole;else if(sets.switchBoxes.has(f.id))mat=plate;else if(sets.pebbles.has(f.id))mat=pebbleBase;else if(woodColours.has(c))mat=woodSkin;else mat=whiteMat;
  const owner=ownerOf(f),parent=owner?owner.group:architecture;const mesh=sourceFace(f,mat,parent,uv);if(owner){mesh.userData.unit=owner;mesh.userData.outerSkin=true;}
  if(sets.louver.has(f.id)){const [lo,hi]=faceBounds(f),n=new T.Vector3(...f.visibleNormal),alongX=hi[0]-lo[0]>hi[2]-lo[2],len=alongX?hi[0]-lo[0]:hi[2]-lo[2],pitch=.034,wS=.024,dS=.016,cnt=Math.floor(len/pitch),hgt=hi[1]-lo[1]-.004;const geo=new T.BoxGeometry(alongX?wS:dS,hgt,alongX?dS:wS);grainUV(geo,[alongX?wS:dS,hgt,alongX?dS:wS]);const inst=new T.InstancedMesh(geo,slatMat,cnt),mtx=new T.Matrix4();for(let k=0;k<cnt;k++){const t=(k+.5)*len/cnt;const p=new T.Vector3(alongX?lo[0]+t:(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,alongX?(lo[2]+hi[2])/2:lo[2]+t).addScaledVector(n,dS/2+.001);mtx.makeTranslation(p.x,p.y,p.z);inst.setMatrixAt(k,mtx);}inst.castShadow=true;inst.receiveShadow=true;parent.updateWorldMatrix(true,false);inst.applyMatrix4(parent.matrixWorld.clone().invert());parent.add(inst);}
  if(sets.ledStrips.has(f.id))stripUnder(f,f.id===45644?28:40,parent);
  if(sets.switchBoxes.has(f.id)){const [lo,hi]=faceBounds(f),n=new T.Vector3(...f.visibleNormal),c0=new T.Vector3(...lo).add(new T.Vector3(...hi)).multiplyScalar(.5),wide=Math.max(hi[0]-lo[0],hi[2]-lo[2]);const across=Math.abs(n.x)>.5?new T.Vector3(0,0,1):new T.Vector3(1,0,0);const cnt=Math.max(2,Math.floor(wide/.045));for(let k=0;k<cnt;k++){const s=new T.Mesh(new T.BoxGeometry(.026,.05,.008),switchMat);s.position.copy(c0).addScaledVector(across,(k-(cnt-1)/2)*.04).addScaledVector(n,.004);s.lookAt(s.position.clone().add(n));architecture.add(s);}}
 }
 // Concealed light at the base of the open niche ceiling already handled by ledStrips. Beam over rafters: small surface lights between pillars.
 {const beam=faceById.get(S.surfaceLights[0]),[lo]=faceBounds(beam),y=lo[1],zc=P(0,(S.rafterDepth[0]+S.rafterDepth[1])/2,0).z;const g=new T.Group();groupOf('entrance').add(g);
  const body=new T.MeshStandardMaterial({color:'#1c1c1c',roughness:.55,metalness:.3}),lens=new T.MeshStandardMaterial({color:'#fffaf0',emissive:'#ffdcae',emissiveIntensity:1.4});
  for(const [x0,x1] of S.beamGaps){const x=P((x0+x1)/2,0,0).x,c=new T.Mesh(new T.CylinderGeometry(.03,.03,.045,32),body);c.position.set(x,y-.0225,zc);c.castShadow=false;g.add(c);const l=new T.Mesh(new T.CylinderGeometry(.022,.022,.003,32),lens);l.position.set(x,y-.046,zc);l.userData.onMaterial=lens;l.userData.led=true;g.add(l);lightNodes.push(l);
   const a=new T.RectAreaLight('#ffdcb0',30,.04,.04);a.position.set(x,y-.05,zc);a.rotation.x=-Math.PI/2;g.add(a);lightNodes.push(a);}}
 // Staggered plant shelves between the rafters (Bright: 5 ft / 4 ft alternately), concealed light under each.
 {const ent=groupOf('entrance');const plantMat=new T.MeshStandardMaterial({color:'#4f7a3a',roughness:.8}),potMat=new T.MeshStandardMaterial({color:'#d9d2c4',roughness:.6});
  for(const [x0,x1,h] of S.rafterGaps){worldBox(ent,[x0,S.rafterDepth[0]-.3,h-.6],[x1,S.rafterDepth[1]+.3,h],woodSkin);const c=P((x0+x1)/2,(S.rafterDepth[0]+S.rafterDepth[1])/2,h);const pot=new T.Mesh(new T.CylinderGeometry(.04,.032,.07,20),potMat);pot.position.copy(c).add(new T.Vector3(0,.035,0));ent.add(pot);for(let k=0;k<7;k++){const leaf=new T.Mesh(new T.SphereGeometry(.022,10,8),plantMat);leaf.scale.set(1,.45,.7);leaf.position.copy(c).add(new T.Vector3(Math.cos(k*.9)*.03,.08+(k%3)*.018,Math.sin(k*.9)*.03));leaf.rotation.z=k*.7;ent.add(leaf);}
   const strip=new T.Mesh(new T.BoxGeometry((x1-x0-.6)*IN,.006,.012),led);strip.position.copy(P((x0+x1)/2,(S.rafterDepth[0]+S.rafterDepth[1])/2,h-.6)).add(new T.Vector3(0,-.004,0));strip.userData.onMaterial=led;strip.userData.led=true;ent.add(strip);lightNodes.push(strip);}}
 // Pebbles on the planter base
 {const top=faceById.get(S.pebbles[0]),[lo,hi]=faceBounds(top),rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(11),geo=new T.SphereGeometry(1,10,8),tones=['#9b968d','#7d786f','#b5afa5','#6c675f'].map(c=>new T.MeshStandardMaterial({color:c,roughness:.7}));
  for(let k=0;k<260;k++){const r=.008+rnd()*.012,m=new T.Mesh(geo,tones[k%4]);m.scale.set(r*1.3,r*.7,r);m.position.set(lo[0]+r+rnd()*(hi[0]-lo[0]-2*r),hi[1]+r*.5,lo[2]+r+rnd()*(hi[2]-lo[2]-2*r));groupOf('entrance').add(m);}}
 // Open key/decor display box (wooden mica) — shelves skip the switch box. APPROX shelf heights.
 {const k=S.keyRecess;for(const z of [18,36,48,70])worldBox(groupOf('entrance'),[k.x[0],k.y[0]+.3,z-.7],[k.x[1],k.y[1],z],woodSkin);}
 // Box above the rafters: 2-3 plants (money plants + a bonsai) glowing under hanging pencil lights.
 {const floor=faceById.get(S.plantFloor[0]),[lo,hi]=faceBounds(floor),ceil=faceById.get(S.pencilLights[0]),[clo]=faceBounds(ceil),y0=hi[1],zc=(lo[2]+hi[2])/2;
  const leaf=new T.MeshStandardMaterial({color:'#4c8a3d',roughness:.6,emissive:'#2a4a12',emissiveIntensity:.35}),dark=new T.MeshStandardMaterial({color:'#3d6e2f',roughness:.6,emissive:'#20380e',emissiveIntensity:.3}),bark=new T.MeshStandardMaterial({color:'#5b4330',roughness:.8}),potM=new T.MeshStandardMaterial({color:'#2e2c2a',roughness:.45});
  const ent=groupOf('entrance'),plants=new T.Group();plants.userData.glowLeaves=[leaf,dark];ent.add(plants);
  const xs=[lo[0]+(hi[0]-lo[0])*.2,lo[0]+(hi[0]-lo[0])*.5,lo[0]+(hi[0]-lo[0])*.8];
  xs.forEach((x,k)=>{const pot=new T.Mesh(new T.CylinderGeometry(.07,.055,.11,24),potM);pot.position.set(x,y0+.055,zc);plants.add(pot);
   if(k===1){// bonsai
    const trunk=new T.Mesh(new T.CylinderGeometry(.012,.022,.22,10),bark);trunk.position.set(x,y0+.21,zc);trunk.rotation.z=.25;plants.add(trunk);for(const [dx,dy,r] of [[-.06,.33,.08],[.05,.36,.07],[0,.42,.065],[.09,.3,.05]]){const c=new T.Mesh(new T.SphereGeometry(r,16,12),dark);c.scale.y=.6;c.position.set(x+dx,y0+dy,zc);plants.add(c);}}
   else{// money plant: heart leaves on trailing vines
    for(let v=0;v<5;v++){const ang=v/5*Math.PI*2+k;for(let j=0;j<6;j++){const t=j/5,l=new T.Mesh(new T.SphereGeometry(.028,10,8),leaf);l.scale.set(1,.25,.85);l.position.set(x+Math.cos(ang)*(.05+t*.12),y0+.14-t*t*.16+(j%2)*.01,zc+Math.sin(ang)*(.03+t*.04));l.rotation.set(t*.8,ang,.3);plants.add(l);}}}});
  const glow=new T.MeshStandardMaterial({color:'#fff6e0',emissive:'#ffe1ad',emissiveIntensity:2.4,toneMapped:false}),body=new T.MeshStandardMaterial({color:'#1e1e1e',metalness:.6,roughness:.3});
  for(const x of [lo[0]+(hi[0]-lo[0])*.12,lo[0]+(hi[0]-lo[0])*.36,lo[0]+(hi[0]-lo[0])*.64,lo[0]+(hi[0]-lo[0])*.88]){const len=.2,bottom=y0+.55;const cord=new T.Mesh(new T.CylinderGeometry(.0015,.0015,clo[1]-(bottom+len),6),body);cord.position.set(x,(clo[1]+bottom+len)/2,zc);ent.add(cord);const tube=new T.Mesh(new T.CylinderGeometry(.012,.012,len,16),body);tube.position.set(x,bottom+len/2,zc);ent.add(tube);const tip=new T.Mesh(new T.CylinderGeometry(.011,.011,.008,16),glow);tip.position.set(x,bottom-.004,zc);tip.userData.onMaterial=glow;tip.userData.led=true;ent.add(tip);lightNodes.push(tip);}
  const l=new T.RectAreaLight('#ffe2b5',55,hi[0]-lo[0]-.1,.1);l.position.set((lo[0]+hi[0])/2,y0+.54,zc);l.rotation.x=-Math.PI/2;ent.add(l);lightNodes.push(l);
  plants.traverse(o=>{if(o.isMesh)o.castShadow=true;});}
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)o.userData.unit??=u;});
 {const b=new T.Box3().setFromObject(root),c=b.getCenter(new T.Vector3()),sz=b.getSize(new T.Vector3());const tile=canvasTexture(512,512,(g,w,h)=>{g.fillStyle='#ddd8cf';g.fillRect(0,0,w,h);const rnd=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(5);for(let k=0;k<120;k++){const x=rnd()*w,y=rnd()*h,r=20+rnd()*80,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(240,236,228,.25)');gr.addColorStop(1,'rgba(240,236,228,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r);}g.fillStyle='rgba(150,140,128,.5)';g.fillRect(0,0,w,2);g.fillRect(0,0,2,h);},'#ddd8cf');tile.repeat.set((sz.x+4)/.8,(sz.z+4)/.8);
  const floor=new T.Mesh(new T.PlaneGeometry(sz.x+4,sz.z+4),new T.MeshPhysicalMaterial({color:'#ffffff',map:tile,roughness:.22,clearcoat:.5,clearcoatRoughness:.12}));floor.rotation.x=-Math.PI/2;floor.position.set(c.x,-.002,c.z);floor.receiveShadow=true;floor.userData.floor=true;root.add(floor);}
 // Products (what 'Product view' and the unit list show)
 const products=[];for(const [pid,info] of Object.entries(PRODUCTS)){const members=units.filter(u=>u.product===pid);if(!members.length)continue;if(members.length===1){members[0].productName=info.name;members[0].members=[members[0]];products.push(members[0]);continue;}const g=new T.Group();root.add(g);for(const m of members)g.add(m.group);const prod={id:pid,name:info.name,kind:pid,group:g,members,angle:members[0].angle,actions:members.flatMap(m=>m.actions)};products.push(prod);for(const m of members)m.product=prod;}
 for(const u of units){if(typeof u.product==='string'){u.product=u;u.name=u.productName||u.name;}}
 let reference=false,lightsOn=true;const allMeshes=[];root.traverse(o=>{if(o.isMesh)allMeshes.push(o);});
 const glowLeaves=[];root.traverse(o=>{if(o.userData.glowLeaves)glowLeaves.push(...o.userData.glowLeaves);});
 function setLights(on){lightsOn=on;for(const n of lightNodes){if(n.isLight)n.visible=on&&!reference;else n.material=on?(n.userData.onMaterial||led):ledOff;}for(const m of glowLeaves)m.emissiveIntensity=on?.35:0;}
 function setReference(on){reference=on;if(on){for(const a of actions){a.open=false;a.value=0;a.node.position.copy(a.initial);a.node.rotation.set(0,0,0);}}for(const mesh of allMeshes){if(on){mesh.userData.finishedMaterial??=mesh.material;const f=faceById.get(mesh.userData.sourceFace);if(f){mesh.userData.referenceMaterial??=new T.MeshStandardMaterial({color:f.visibleColor,roughness:.65,side:T.DoubleSide});mesh.material=mesh.userData.referenceMaterial;mesh.visible=true;}else mesh.visible=false;}else{if(mesh.userData.finishedMaterial)mesh.material=mesh.userData.finishedMaterial;mesh.visible=!mesh.userData.referenceOnly;}}setLights(lightsOn);}
 root.updateMatrixWorld(true);
 return {root,architecture,units,products,actions,sourceMeshes,lightNodes,exactLayout,setReference,setLights,get lightsOn(){return lightsOn;},update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='slide')a.node.position.z=a.initial.z+a.travel*a.value;else if(a.type==='liftX')a.node.rotation.x=a.travel*a.value;else if(a.type==='liftZ')a.node.rotation.z=a.travel*a.value;else a.node.rotation.y=a.travel*a.value;}for(const u of units){const glassy=['glass-tinted','glass-clear','glass-grey','cnc'].includes(u.kind);const visible=!reference&&(glassy||u.actions.some(a=>a.value>.015));for(const p of u.interiors)p.visible=visible||(!reference&&p.userData.alwaysVisible);}}};
}
