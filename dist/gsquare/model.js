import * as T from 'three';
import {earcut} from '../venki/triangulate.js';
import {exactLayout} from './exact-layout.js';
import {RectAreaLightUniformsLib} from '../vendor/RectAreaLightUniformsLib.js';
export {exactLayout};
// gsquare · under-staircase TV wall, pooja unit and rear grass niche (source: gsquare.skp, identical to gsquare (1).skp).
// World axes (metres): X = source x - 256.1 in, Y = height, Z = 244.3 in - source y.
// TV wall faces +Z; pooja unit faces -X; grass panel and rear storage door face the staircase (-Z / -X).
// All positions below are in world inches (x, height, z) built around the verified source planes.
export const DEFAULT_FINISH='#a8662f';
export const project={id:'gsquare-v1',customer:'gsquare',quotation:null};
// Bright's wood-mica reference photo, treated as a 24 x 24 in sample (scale is an approximation).
export const WOOD_TEXTURE='./textures/wood-tile-vertical.jpg';
export const SHEET_INCHES=[24,24];
const I=.0254,loader=new T.TextureLoader();
function tex(path,srgb=true){const t=loader.load(path);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.userData.shared=true;return t;}
let woodTexture;
export function createWoodTexture(){if(!woodTexture){woodTexture=tex(WOOD_TEXTURE);woodTexture.wrapS=woodTexture.wrapT=T.MirroredRepeatWrapping;woodTexture.minFilter=T.LinearMipmapLinearFilter;woodTexture.magFilter=T.LinearFilter;woodTexture.anisotropy=16;}return woodTexture;}
const wood={name:'Wood mica matte',color:DEFAULT_FINISH,wood:true},woodGloss={name:'Wood mica high gloss',color:DEFAULT_FINISH,wood:true,gloss:true};
let horizontalWood;
export function createHorizontalWood(){if(!horizontalWood){horizontalWood=tex('./textures/wood-mica-gloss-ref.jpg');horizontalWood.wrapS=horizontalWood.wrapT=T.MirroredRepeatWrapping;horizontalWood.anisotropy=16;}return horizontalWood;}
export function buildModel(){
  RectAreaLightUniformsLib.init();
 const root=new T.Group(),architecture=new T.Group(),referenceRoot=new T.Group();root.add(architecture,referenceRoot);referenceRoot.visible=false;
 const units=[],actions=[],sourceMeshes=[],glowMaterials=[],lightMaterial=new T.MeshBasicMaterial({color:'#ffe2a6'});
 function mat(f){const m=new T.MeshPhysicalMaterial({color:'#ffffff',map:createWoodTexture(),roughness:f.gloss?.22:.84,clearcoat:f.gloss?.85:0,clearcoatRoughness:.08,side:T.DoubleSide});m.userData.compatColor=f.color;m.userData.gloss=!!f.gloss;return m;}
 // TV back panel: vertical grain, high gloss (Bright, 27 Nov 06:36).
 function glossPanelMat(){const m=new T.MeshPhysicalMaterial({color:'#ffffff',map:createWoodTexture(),roughness:.06,clearcoat:1,clearcoatRoughness:.02,reflectivity:.6,envMapIntensity:1.4,side:T.DoubleSide});m.userData.compatColor=DEFAULT_FINISH;m.userData.gloss=true;return m;}
 const gold=new T.MeshStandardMaterial({color:'#d4ae62',metalness:1,roughness:.22});gold.userData.compatColor='#d4ae62';
 const alu=new T.MeshStandardMaterial({color:'#b9bdc0',metalness:.85,roughness:.32});alu.userData.compatColor='#b9bdc0';
 const glass=new T.MeshPhysicalMaterial({color:'#4a4f55',roughness:.06,metalness:0,transparent:true,opacity:.55,clearcoat:1});glass.userData.compatColor='#5b6168';
 const tvBody=new T.MeshStandardMaterial({color:'#121314',roughness:.45,metalness:.3}),tvScreen=new T.MeshPhysicalMaterial({color:'#050607',roughness:.08,clearcoat:1});tvBody.userData.compatColor='#141516';tvScreen.userData.compatColor='#08090a';
 const inner=new T.MeshStandardMaterial({color:'#efe9df',roughness:.9});
 const fluted=tex('./textures/fluted-panel-ref.jpg');fluted.wrapS=fluted.wrapT=T.RepeatWrapping;
 const flutedMat=new T.MeshStandardMaterial({map:fluted,roughness:.7,side:T.DoubleSide});flutedMat.userData.compatColor='#7a4a2c';
 const grassTex=tex('./textures/grass-mat.jpg');grassTex.wrapS=grassTex.wrapT=T.RepeatWrapping;
 const grassMat=new T.MeshStandardMaterial({map:grassTex,roughness:1,emissive:new T.Color('#5fbf2c'),emissiveIntensity:.32,emissiveMap:grassTex,side:T.DoubleSide});grassMat.userData.compatColor='#5aa83a';glowMaterials.push({m:grassMat,on:.32});

 // World-scale UVs (grain vertical on upright faces) at the sample's true size.
 function sheetUV(geo,x0,x1,y0,y1,z0,z1,keep=[]){const pos=geo.attributes.position,uv=geo.attributes.uv,cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2,[sw,sh]=SHEET_INCHES;
  for(let i=0;i<pos.count;i++){const face=Math.floor(i/4);if(keep.includes(face))continue;const x=pos.getX(i)/I+cx,y=pos.getY(i)/I+cy,z=pos.getZ(i)/I+cz;let u,v;
   if(face<2){u=z;v=y;}else if(face<4){if(x1-x0>=z1-z0){u=z;v=x;}else{u=x;v=z;}}else{u=x;v=y;}uv.setXY(i,u/sw,v/sh);}uv.needsUpdate=true;}
 function B(p,x0,x1,y0,y1,z0,z1,m,keep=[]){const o=p.userData.o||new T.Vector3();const geo=new T.BoxGeometry((x1-x0)*I,(y1-y0)*I,(z1-z0)*I);sheetUV(geo,x0,x1,y0,y1,z0,z1,keep);const g=new T.Mesh(geo,m);
  g.position.set((x0+x1)/2*I-o.x,(y0+y1)/2*I-o.y,(z0+z1)/2*I-o.z);g.castShadow=true;g.receiveShadow=true;p.add(g);return g;}
 // Flat polygon panel. plane 'z': pts are (x, height), panel spans z c0..c0+t. plane 'x': pts are (-z, height), panel spans x c0..c0+t.
 function slab(p,pts,plane,c0,t,m,uvSize=SHEET_INCHES){const o=p.userData.o||new T.Vector3();const g=new T.ExtrudeGeometry(new T.Shape(pts.map(([a,b])=>new T.Vector2(a,b))),{depth:t,bevelEnabled:false});
  const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/uvSize[0],uv.getY(i)/uvSize[1]);uv.needsUpdate=true;
  if(plane==='x'){g.rotateY(Math.PI/2);g.translate(c0,0,0);}else g.translate(0,0,c0);g.scale(I,I,I);g.translate(-o.x,-o.y,-o.z);
  const mesh=new T.Mesh(g,m);mesh.castShadow=true;mesh.receiveShadow=true;p.add(mesh);return mesh;}
 function pivotAt(p,x,y,z){const q=new T.Group();const o=p.userData.o||new T.Vector3();q.position.set(x*I-o.x,y*I-o.y,z*I-o.z);q.userData.o=new T.Vector3(x*I,y*I,z*I);p.add(q);return q;}
 function unit(id,name,kind,angle,front=wood,side=wood){const group=new T.Group();root.add(group);
  const u={id,name,kind,group,angle,front:mat(front),side:mat(side),defaultFront:{...front},defaultSide:{...side},actions:[],interiors:[],lightNodes:[],finishable:true};
  u.sideSkin=u.side;u.members=[u];u.product=u;units.push(u);return u;}
 function act(u,node,type,travel,extra={}){const a={unit:u,node,type,travel,initial:node.position.clone(),open:false,value:0,...extra};actions.push(a);u.actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 function lamp(u,x,y,z,intensity=.18,distance=1.2){const l=new T.PointLight('#ffd9a0',intensity,distance,2);l.position.set(x*I,y*I,z*I);u.group.add(l);u.lightNodes.push(l);return l;}
 // Soft linear LED: rect-area light centred at (x,y,z) inches, long edge along dir L, emitting toward dir F.
 function strip(u,x,y,z,len,wid,L,F,intensity=6){const l=new T.RectAreaLight('#ffd6a0',intensity,len*I,wid*I);l.position.set(x*I,y*I,z*I);
  const xa=new T.Vector3(...L).normalize(),za=new T.Vector3(...F).normalize().negate();const ya=za.clone().cross(xa).normalize();xa.copy(ya.clone().cross(za)).normalize();
  l.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(xa,ya,za));u.group.add(l);u.lightNodes.push(l);return l;}
 // Chrome-gold knob; axis = outward normal ('z' or '-x').
 function knob(p,x,y,z,axis){const o=p.userData.o||new T.Vector3(),g=new T.Group();const stem=new T.Mesh(new T.CylinderGeometry(.22*I,.22*I,.55*I,16),gold),cap=new T.Mesh(new T.SphereGeometry(.55*I,20,14),gold);
  stem.position.y=.27*I;cap.position.y=.75*I;cap.scale.y=.75;g.add(stem,cap);if(axis==='z')g.rotation.x=Math.PI/2;else g.rotation.z=Math.PI/2;g.position.set(x*I-o.x,y*I-o.y,z*I-o.z);p.add(g);return g;}
 const t=.75,gap=.08,slopeY=x=>100.19-(x-26.73)*(40.19/72);

 // 1 · TV back panel (glossy wood mica, fixed) with matte recess frame and warm LED under the sloping top.
 const tvw=unit('tv-wall','TV back panel & frame','tvwall',0,woodGloss,wood);tvw.front=glossPanelMat();tvw.fixed=true;const tg=tvw.group;
 slab(tg,[[26.73,20],[98.73,20],[98.73,60],[26.73,100.19]],'z',-9.85,t,tvw.front);
 B(tg,97.98,98.73,20,60,-9.1,-.15,tvw.side);
 slab(tg,[[26.73,100.19],[98.73,60],[98.73,60.85],[26.73,101.04]],'z',-9.1,8.95,tvw.side);
 slab(tg,[[27.6,slopeY(27.6)-.42],[97.8,slopeY(97.8)-.42],[97.8,slopeY(97.8)-.04],[27.6,slopeY(27.6)-.04]],'z',-1.7,.5,lightMaterial);
 tvw.slopeLight=strip(tvw,62.73,slopeY(62.73)-.6,-1.6,Math.hypot(72,40.19)-3,.8,[72,-40.19,0],[-.42,-.75,-.5],30);
 tvw.material='Glossy wood mica (Bright’s reference grain), matte wood mica frame';tvw.lighting='Warm white LED under the sloping top, shining down on the panel';
 tvw.renderNote='Fixed back panel. Panel/frame thicknesses are approximations around the verified source planes.';

 // 2 · 65-inch TV, centred, bottom 26 in from floor.
 const tv=unit('tv','65-inch TV','tv',0);tv.finishable=false;tv.fixed=true;tv.front=tvBody;tv.side=tvBody;tv.sideSkin=tvBody;
 const tvW=56.7,tvH=31.9,tvX=62.73;B(tv.group,tvX-tvW/2,tvX+tvW/2,26,26+tvH,-9.05,-7.75,[tvBody,tvBody,tvBody,tvBody,tvScreen,tvBody]);
 tv.sizeInches=[tvW,tvH];tv.bottomInches=26;tv.renderNote='Generic 16:9 65-inch body; exact TV model not given.';

 // 3 · Low cabinet under the TV: brown matte doors (outer hinges) + grey tinted glass doors (from the middle), gold knobs, skirting with floor LED.
 const lc=unit('tv-cabinet','Cabinet under the TV','cabinet',0);const lg=lc.group;
 B(lg,26.73,98.73,8,8.75,-9.1,-.85,lc.side);B(lg,26.73,98.73,19.25,20,-9.1,-.85,lc.side);B(lg,26.73,98.73,8.75,19.25,-9.85,-9.1,lc.side);
 B(lg,26.73,27.48,8.75,19.25,-9.1,-.85,lc.side);B(lg,97.98,98.73,8.75,19.25,-9.1,-.85,lc.side);for(const x of [44.36,80.36])B(lg,x,x+.75,8.75,19.25,-9.1,-.85,lc.side);
 lc.doors=[];
 for(const [hx,x0,x1,travel,kx] of [[26.73,26.73+gap/2,44.73-gap/2,-Math.PI*.47,42.9],[98.73,80.73+gap/2,98.73-gap/2,Math.PI*.47,82.56]]){
  const p=pivotAt(lg,hx,14,-.1);B(p,x0,x1,8+gap,20-gap,-.85,-.1,lc.front);knob(p,kx,14,-.1,'z');act(lc,p,'hinge',travel,{door:'brown'});lc.doors.push(p);}
 for(const [hx,x0,x1,travel,kx] of [[44.73,44.73+gap/2,62.73-gap/2,-Math.PI*.47,60.9],[80.73,62.73+gap/2,80.73-gap/2,Math.PI*.47,64.56]]){
  const p=pivotAt(lg,hx,14,-.1);const f=1;B(p,x0,x1,8+gap,8+gap+f,-.85,-.1,alu);B(p,x0,x1,20-gap-f,20-gap,-.85,-.1,alu);B(p,x0,x0+f,8+gap+f,20-gap-f,-.85,-.1,alu);B(p,x1-f,x1,8+gap+f,20-gap-f,-.85,-.1,alu);
  B(p,x0+f,x1-f,8+gap+f,20-gap-f,-.6,-.35,glass);knob(p,kx,14,-.1,'z');act(lc,p,'hinge',travel,{door:'glass'});lc.doors.push(p);}
 B(lg,26.73,98.73,0,8,-5.9,-5.15,lc.side);
 B(lg,27.5,98,7.45,7.75,-4.9,-4.3,lightMaterial);strip(lc,62.73,7.3,-4.6,70,.6,[1,0,0],[0,-1,.45],30);
 lc.doorCount=4;lc.glassDoors=2;lc.handles='Small chrome-gold knobs';lc.skirting='Matte wood mica skirting, 5 in set back, warm white LED washing the floor';
 lc.renderNote='Knob positions, carcass thickness and inner partitions are approximations. Inside layout not specified (shown empty).';

 // 4 · Fluted column (fixed) with matte back/side and a concealed profile light strip.
 const fl=unit('fluted-column','Fluted column & profile light','fluted',0);fl.finishable=false;fl.fixed=true;fl.front=flutedMat;const fg=fl.group;
 const colPts=[[7.07,0],[24.73,0],[24.73,101.31],[7.07,111.17]];
 // Real 3D louvers: dark grooved backing board + 9 wood slats (texture cut from Bright's louver photo).
 const grooveMat=new T.MeshStandardMaterial({color:'#2b1f18',roughness:.8});grooveMat.userData.compatColor='#2b1f18';
 const slatTex=tex('./textures/louver-slat.jpg');slatTex.wrapS=slatTex.wrapT=T.MirroredRepeatWrapping;
 const slatMat=new T.MeshStandardMaterial({map:slatTex,roughness:.62,side:T.DoubleSide});slatMat.userData.compatColor='#7a4a2c';fl.front=slatMat;
 slab(fg,colPts,'z',-1.4,.45,grooveMat);
 const colTop=x=>111.17-(x-7.07)*(9.86/17.66),N=9,pitch=(24.73-7.07)/N,gw=.42;fl.slats=[];
 for(let k=0;k<N;k++){const x0=7.07+k*pitch+gw/2,x1=7.07+(k+1)*pitch-gw/2;
  const m=slab(fg,[[x0,0],[x1,0],[x1,colTop(x1)-.15],[x0,colTop(x0)-.15]],'z',-.95,.7,slatMat,[x1-x0,36]);
  const uv=m.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)-x0/(x1-x0)+k*.25);uv.needsUpdate=true;fl.slats.push(m);}
 fl.louverCount=N;
 B(fg,7.07,7.82,0,111.17,-12.94,-1.4,fl.side);
 B(fg,24.73,26.73,0,100.19,-12.9,-.15,fl.side);
 B(fg,24.66,24.73,2,99,-.6,-.2,lightMaterial);strip(fl,24.55,50,-.45,96,.5,[0,1,0],[-1,0,-.05],22);
 fl.material='Fixed fluted panel (Bright’s reference photo), matte wood mica back and sides';fl.lighting='Concealed LED in the 2 in matte strip, lighting the fluted face';
 fl.renderNote='Louvers modelled as 9 slats (~1.55 in) with ~0.4 in dark grooves, wood from Bright\u2019s louver photo; slat count/size approximate. The back of the column is the wash-basin niche (separate unit).';

 // 4b · Wash-basin niche at the back of the fluted column (staircase side): fixed box 0-30 in, basin counter at 30 in, mirror on the back wall.
 const wb=unit('wash-basin','Wash basin & mirror','basin',Math.PI);wb.fixed=true;const wg=wb.group;
 B(wg,7.82,24.73,0,29.25,-12.94,-12.19,wb.front);B(wg,7.82,24.73,0,.75,-12.19,-1.4,inner);
 B(wg,7.82,24.73,29.25,30,-12.94,-1.4,wb.side);
 B(wg,7.82,24.6,30,101.3,-1.62,-1.4,wb.side);
 const mirror=new T.MeshPhysicalMaterial({color:'#c8d3d8',metalness:.6,roughness:.05,clearcoat:1,envMapIntensity:1.2});mirror.userData.compatColor='#cfd8dc';
 B(wg,10.07,21.73,45.68,86.56,-1.87,-1.62,mirror);
 const ceramic=new T.MeshPhysicalMaterial({color:'#fbfaf7',roughness:.18,clearcoat:.6,side:T.DoubleSide});ceramic.userData.compatColor='#f4f3ef';
 const chrome=new T.MeshStandardMaterial({color:'#e6e8ea',metalness:1,roughness:.12});chrome.userData.compatColor='#d8dadc';
 {const pts=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI/2;pts.push(new T.Vector2((.2+5.8*Math.sin(a))*I,(4.6-4.6*Math.cos(a))*I));}pts.push(new T.Vector2(5.8*I,4.8*I));
  const bowl=new T.Mesh(new T.LatheGeometry(pts,40),ceramic);bowl.position.set(15.9*I,30*I,-7.2*I);bowl.castShadow=true;wg.add(bowl);
  const spout=new T.Mesh(new T.CylinderGeometry(.45*I,.45*I,9*I,16),chrome);spout.position.set(15.9*I,34.5*I,-2.6*I);wg.add(spout);
  const arm=new T.Mesh(new T.CylinderGeometry(.35*I,.35*I,3.2*I,16),chrome);arm.rotation.x=Math.PI/2;arm.position.set(15.9*I,38.7*I,-4*I);wg.add(arm);}
 wb.purpose='Wash basin: fixed box below, basin counter at 30 in, mirror on the back wall';
 wb.renderNote='Basin shape/size, tap and counter thickness are approximations (not specified). Niche inner finish rendered matte wood mica. No light in the niche (not specified).';

 // 5 · Storage doors right of the TV: matte, push-to-open, from the middle; empty inside.
 const st=unit('right-storage','Storage right of the TV','storage',0);const sg=st.group;
 B(sg,99.48,127.27,59.25,60,-35.4,-.75,st.side);B(sg,99.48,127.27,0,.75,-35.4,-.75,inner);B(sg,98.73,128.02,0,60,-36.15,-35.4,inner);
 B(sg,98.73,99.48,0,60,-35.4,-.75,st.side);B(sg,127.27,128.02,0,60,-35.4,-.75,st.side);
 // The right door shares its hinge corner with the pooja unit: limited to 80° so it stops short of the pooja drawer knobs.
 for(const [hx,x0,x1,travel] of [[98.73,98.73+gap/2,113.38-gap/2,-Math.PI*.47],[128.02,113.38+gap/2,128.02-gap/2,Math.PI*80/180]]){
  const p=pivotAt(sg,hx,30,0);B(p,x0,x1,gap,60-gap,-.75,0,st.front);act(st,p,'hinge',travel,hx===128.02?{skipOpenAll:true}:{});}
 st.doorCount=2;st.handles='Handleless, push to open';st.internal='Empty storage (no shelves)';st.renderNote='Carcass depth back to the staircase line is an approximation. The right door is hinged at the corner shared with the pooja unit; in the render it can open about 80° before the pooja drawer knobs, and it cannot be open at the same time as the pooja left doors.';st.maxOpenDegrees=[85,80];

 // 6 · Pooja unit (faces -X): CNC doors 30-84.8 in, two drawers 20-26 / 26-30 in, lower doors 0-20 in; plain matte side.
 const px0=128.02,pf=128.77,pb=144.32,zA=0,zB=35.98,zM=(zA+zB)/2;
 function poojaCarcass(g,u,y0,y1){B(g,pf,pb-t,y0,y0+t,zA+t,zB-t,u.side);B(g,pf,pb-t,y1-t,y1,zA+t,zB-t,u.side);B(g,pb-t,pb,y0,y1,zA,zB,u.side);B(g,pf,pb-t,y0,y1,zA,zA+t,u.side);B(g,pf,pb-t,y0,y1,zB-t,zB,u.side);}
 const pj=unit('pooja','Pooja · CNC doors','pooja',-Math.PI/2);const pg=pj.group;poojaCarcass(pg,pj,30,84.8);
 lamp(pj,136,72,zM,.22,1.4);lamp(pj,136,44,zM,.14,1.1);B(pg,pf+.5,pb-1,83.6,84.05,zA+1,zB-1,lightMaterial);
 pj.doors=[];
 for(const [side,hz,z0,z1,travel] of [['left',zA,zA+gap/2,zM-gap/2,-Math.PI*.47],['right',zB,zM+gap/2,zB-gap/2,Math.PI*.47]]){
  const p=pivotAt(pg,px0,57,hz);const face=new T.MeshStandardMaterial({map:tex('./textures/pooja-door-'+side+'.jpg'),emissiveMap:tex('./textures/pooja-glow-'+side+'.png'),emissive:new T.Color('#ffffff'),emissiveIntensity:1,roughness:.84});
  face.userData.compatColor=DEFAULT_FINISH;glowMaterials.push({m:face,on:1});
  const door=B(p,px0,pf,30+gap,84.8-gap,z0,z1,[pj.front,face,pj.front,pj.front,pj.front,pj.front],[1]);door.userData.cnc=true;
  act(pj,p,'hinge',travel,{side});pj.doors.push(p);}
 pj.doorCount=2;pj.carving='Pattern per Bright’s photo (mandala jali, hanging bells, lotus, round centre)';pj.lighting='Warm light inside; cut-outs glow';
 pj.renderNote='CNC pattern is a drawn visual approximation, not a fabrication file. Cut-outs shown on our matte wood mica, not the photo’s colour. Interior shelves not specified (shown empty).';
 const dr=unit('pooja-drawers','Pooja drawers','drawer',-Math.PI/2);const dg=dr.group;poojaCarcass(dg,dr,20,30);
 for(const [y0,y1] of [[20,26],[26,30]]){const p=pivotAt(dg,px0,(y0+y1)/2,zM);B(p,px0,pf,y0+gap,y1-gap,zA+gap,zB-gap,dr.front);
  const h=y1-y0-1.8;B(p,pf+.02,pb-2.4,y0+.9,y0+1.3,zA+1.4,zB-1.4,inner);for(const z of [zA+1,zB-1.4])B(p,pf+.02,pb-2.4,y0+.9,y0+.9+h,z,z+.4,inner);B(p,pb-2.4,pb-2,y0+.9,y0+.9+h,zA+1,zB-1,inner);
  for(const z of [9,27])knob(p,px0,(y0+y1)/2,z,'-x');act(dr,p,'slide',-11*I);}
 dr.drawerCount=2;dr.drawerHeightsInches=[6,4];dr.handles='Small chrome-gold knobs';dr.renderNote='Two knobs per drawer and drawer box depth are approximations.';
 const lo=unit('pooja-lower','Pooja lower storage','lower',-Math.PI/2);const log=lo.group;poojaCarcass(log,lo,0,20);
 B(log,px0,pb,0,84.8,zB,zB+.12,lo.side);
 for(const [hz,z0,z1,travel,kz] of [[zA,zA+gap/2,zM-gap/2,-Math.PI*.47,zM-1.8],[zB,zM+gap/2,zB-gap/2,Math.PI*.47,zM+1.8]]){
  const p=pivotAt(log,px0,10,hz);B(p,px0,pf,gap,20-gap,z0,z1,lo.front);knob(p,px0,14,kz,'-x');act(lo,p,'hinge',travel);}
 lo.doorCount=2;lo.handles='Small chrome-gold knobs';lo.sidePanel='Plain matte wood mica outer side';lo.renderNote='Knob height and interior are approximations (interior not specified).';

 // 7 · Rear (staircase side): fixed grass panel with matte border and concealed glow lights.
 const gr=unit('grass-panel','Grass panel (rear)','grass',Math.PI);gr.fixed=true;gr.finishable=false;gr.front=grassMat;const gg=gr.group;
 slab(gg,[[26.73,3],[66.48,3],[66.48,74.56],[26.73,96.75]],'z',-11.15,.75,grassMat,[12,12]);
 B(gg,26.73,66.48,0,3,-12.15,-10.4,gr.side);B(gg,66.48,67.23,0,78,-12.15,-10.4,gr.side);
 slab(gg,[[26.73,96.75],[66.48,74.56],[66.48,78],[26.73,100.19]],'z',-12.15,1.75,gr.side);
 slab(gg,[[27.2,96.2],[66,74.2],[66,74.5],[27.2,96.5]],'z',-11.9,.3,lightMaterial);B(gg,27.2,66,3,3.25,-11.9,-11.6,lightMaterial);
 gr.slopeLight=strip(gr,46.6,85.4,-11.8,43,.6,[39.75,-22.19,0],[-.45,-.8,.25],22);strip(gr,46.6,3.2,-11.8,38,.6,[1,0,0],[0,1,.2],14);
 gr.material='Artificial green grass mat (illustrative texture), matte wood mica border';gr.lighting='Concealed lights in the border make the grass glow';
 gr.renderNote='Grass texture and pile are illustrative; light colour not specified (shown warm white).';

 // 8 · Rear storage door (24 x 78 in), hinged on the staircase side, push to open; matte stair-side cladding.
 const rs=unit('rear-storage','Rear storage door','rear',-Math.PI*.75);const rg=rs.group;
 B(rg,67.23,98.73,0,.75,-36.15,-12.15,inner);
 const rp=pivotAt(rg,66.48,39,-36.15);B(rp,66.48,67.23,gap,78-gap,-36.15+gap,-12.15-gap,rs.front);act(rs,rp,'hinge',-Math.PI*.47);
 slab(rg,[[66.48,36],[66.48,78],[97.89,60.47],[97.89,54],[87.77,54],[87.77,48],[77.64,48],[77.64,42],[67.52,42],[67.52,36]],'z',-36.65,.5,rs.side);
 rs.doorCount=1;rs.handles='Handleless, push to open';rs.hinge='Staircase side';rs.cladding='Matte wood mica cladding on the stair side';
 rs.renderNote='Door swings outward toward the grass niche (direction not specified). Storage interior shown empty.';

 // 9 · Small door + fixed triangle low on the stair-side wall of the under-stair passage (SKP v2 teal faces 45605/45611).
 // Faces +Z into the passage; set flush into the wall (front face on the source plane). Door hinged on its short edge next to the fixed triangle; push to open.
 const sd=unit('stair-door','Small door under the stair','stairdoor',-Math.PI/4);const sdg=sd.group;
 slab(sdg,[[27.02,0],[46.75,0],[46.75,11.96]],'z',-36.9,.75,sd.front);
 const sdp=pivotAt(sdg,46.75,6,-36.15),sy=x=>11.96+(x-46.75)*(11.96/19.73);
 slab(sdp,[[46.75+gap,gap],[66.48-gap,gap],[66.48-gap,sy(66.48)-gap],[46.75+gap,sy(46.75)-gap]],'z',-36.9,.75,sd.front);
 act(sd,sdp,'hinge',-Math.PI*.47,{skipOpenAll:true});
 sd.doorCount=1;sd.fixedPanel='Triangle next to the bottom of the stairs';sd.handles='Handleless, push to open';sd.hinge='Short edge next to the fixed triangle';
 sd.renderNote='Set flush into the stair-side wall (depth approximate). It shares the passage corner with the rear storage door: when that door is fully open it lies over this one, so they cannot be open together (\u201cOpen all\u201d leaves this one shut).';

 function polygon(f,material){const n=new T.Vector3(...f.normal).normalize(),ax=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),ay=n.clone().cross(ax).normalize(),loops=f.points.map(l=>l.map(p=>new T.Vector3(...p))),flat=loops.flat(),xy=flat.flatMap(p=>[p.dot(ax),p.dot(ay)]),holes=[];let count=loops[0].length;for(const l of loops.slice(1)){holes.push(count);count+=l.length;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(flat.flatMap(p=>p.toArray()),3));g.setIndex(earcut(xy,holes));g.computeVertexNormals();return new T.Mesh(g,material);}
 const plaster=new T.MeshStandardMaterial({color:'#efebe4',roughness:1,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:4,polygonOffsetUnits:16});plaster.userData.compatColor='#efebe4';
 for(const f of exactLayout.sourceFaces){const shown=f.color==='#ffffff'&&f.backColor?f.backColor:f.color;const m=polygon(f,new T.MeshStandardMaterial({color:shown,side:T.DoubleSide,roughness:1,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));m.userData.sourceFace=f.id;referenceRoot.add(m);sourceMeshes.push(m);
  if(f.color==='#ffffff'&&!f.backColor){const s=polygon(f,plaster);s.receiveShadow=true;s.userData.sourceFace=f.id;architecture.add(s);}}
 const floor=B(architecture,-24,170,-1,-.02,-80,60,new T.MeshStandardMaterial({color:'#ded9cf',roughness:1}));floor.receiveShadow=true;
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 return {root,architecture,units,products:units,actions,sourceMeshes,exactLayout,
 setReference(on){referenceRoot.visible=on;for(const u of units)u.group.visible=!on;architecture.visible=!on;},
 setLights(on){for(const u of units)for(const l of u.lightNodes)l.visible=on;lightMaterial.color.set(on?'#ffe2a6':'#a4a39c');for(const g of glowMaterials)g.m.emissiveIntensity=on?g.on:0;},
 update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='hinge')a.node.rotation.y=a.travel*a.value;else if(a.type==='slide')a.node.position.x=a.initial.x+a.travel*a.value;}}
 };
}
