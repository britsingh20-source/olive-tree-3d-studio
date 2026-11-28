import * as T from 'three';
import {earcut} from '../venki/triangulate.js';
import {exactLayout} from './exact-layout.js';
import {RectAreaLightUniformsLib} from '../vendor/RectAreaLightUniformsLib.js';
export {exactLayout};
// gsquare · U-shaped kitchen (source: gsquare k.skp, identical to (1) and (2)).
// Source-relative inches: xr (0-132), yr (0-96, back wall at 96), z height. World metres: X=(xr-66), Y=z, Z=(48-yr).
// Long counter fronts face +Z (source plane yr=72), short counter + wall cabinet face -X (xr=108 / xr=117), tall unit faces -Z (yr=24).
export const AQUA='#86b8b4';            // sampled from Bright's reference kitchen photo (#71a199 shaded .. #8cbcbc lit)
export const DEFAULT_FINISH='#a8662f';  // wood mica (Bright's wood photo) — used where the swatch is the photo texture
export const project={id:'gsquare-kitchen-v1',customer:'gsquare',quotation:null};
// Bright's wood photo rotated 90° so the grain runs vertically (Bright, 27 Nov 23:59).
export const WOOD_TEXTURE='./textures/wood-mica-vertical.jpg';
export const SHEET_INCHES=[24,24];
const I=.0254,loader=new T.TextureLoader();
function tex(path,srgb=true){const t=loader.load(path);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.userData.shared=true;return t;}
let woodTexture;
export function createWoodTexture(){if(!woodTexture){woodTexture=tex(WOOD_TEXTURE);woodTexture.wrapS=woodTexture.wrapT=T.MirroredRepeatWrapping;woodTexture.minFilter=T.LinearMipmapLinearFilter;woodTexture.anisotropy=16;}return woodTexture;}
export function createHorizontalWood(){return createWoodTexture();}
const aqua={name:'Aqua high gloss (your photo)',color:AQUA,gloss:true},wood={name:'Wood mica (your sample)',color:DEFAULT_FINISH,wood:true};
// Source-relative helpers → world inches.
const wx=xr=>xr-66,wz=yr=>48-yr;
export function buildModel(){
 RectAreaLightUniformsLib.init();
 const root=new T.Group(),architecture=new T.Group(),referenceRoot=new T.Group();root.add(architecture,referenceRoot);referenceRoot.visible=false;
 const units=[],actions=[],sourceMeshes=[],lightMaterial=new T.MeshBasicMaterial({color:'#ffe2a6'});
 function mat(f){const m=new T.MeshPhysicalMaterial({color:f.wood?'#ffffff':f.color,map:f.wood?createWoodTexture():null,roughness:f.gloss?.06:.84,clearcoat:f.gloss?1:0,clearcoatRoughness:.02,side:T.DoubleSide});m.userData.compatColor=f.color;m.userData.gloss=!!f.gloss;return m;}
 const std=(color,o={})=>{const m=new T.MeshStandardMaterial({color,roughness:.8,...o});m.userData.compatColor=color;return m;};
 const inner=std('#eef0ec',{roughness:.9});
 const groove=std('#141414',{roughness:.45,metalness:.5});
 const blackAlu=std('#1a1a1b',{roughness:.35,metalness:.7});
 const glass=new T.MeshPhysicalMaterial({color:'#e8f2f1',roughness:.02,transparent:true,opacity:.18,clearcoat:1,depthWrite:false});glass.userData.compatColor='#cfe0df';
 const wire=std('#c9ccce',{roughness:.25,metalness:.95});
 const steel=std('#c3c6c8',{roughness:.28,metalness:.9}),steelDark=std('#8d9194',{roughness:.35,metalness:.85});
 const chrome=std('#e6e8ea',{roughness:.12,metalness:1});
 const black=new T.MeshPhysicalMaterial({color:'#0b0b0c',roughness:.18,clearcoat:.8,envMapIntensity:.25});black.userData.compatColor='#0e0e0f';
 const burner=std('#2a2a2a',{roughness:.5,metalness:.6});
 // Worktop: white (Bright, 28 Nov 00:11 — no black). Faint speckle is illustrative.
 const topTex=tex('./textures/quartz-white.jpg');topTex.wrapS=topTex.wrapT=T.RepeatWrapping;
 const worktopMat=new T.MeshPhysicalMaterial({map:topTex,roughness:.28,clearcoat:.4,clearcoatRoughness:.15,envMapIntensity:.5});worktopMat.userData.compatColor='#f2f1ec';
 const wickerTex=tex('./textures/wicker.jpg');wickerTex.wrapS=wickerTex.wrapT=T.RepeatWrapping;
 const wicker=new T.MeshStandardMaterial({map:wickerTex,roughness:.75,side:T.DoubleSide});wicker.userData.compatColor='#b9773b';
 const caneRim=new T.MeshStandardMaterial({color:'#a8622c',roughness:.55});caneRim.userData.compatColor='#a8622c';
 const woodMica=mat(wood);

 function sheetUV(geo,x0,x1,y0,y1,z0,z1,size=SHEET_INCHES){const pos=geo.attributes.position,uv=geo.attributes.uv,cx=(x0+x1)/2,cy=(y0+y1)/2,cz=(z0+z1)/2,[sw,sh]=size;
  for(let i=0;i<pos.count;i++){const face=Math.floor(i/4),x=pos.getX(i)/I+cx,y=pos.getY(i)/I+cy,z=pos.getZ(i)/I+cz;let u,v;
   if(face<2){u=z;v=y;}else if(face<4){u=x;v=z;}else{u=x;v=y;}uv.setXY(i,u/sw,v/sh);}uv.needsUpdate=true;}
 // Box in WORLD inches (x0..x1, height y0..y1, z0..z1).
 function B(p,x0,x1,y0,y1,z0,z1,m,size){const o=p.userData.o||new T.Vector3();if(x1<x0)[x0,x1]=[x1,x0];if(z1<z0)[z0,z1]=[z1,z0];const geo=new T.BoxGeometry((x1-x0)*I,(y1-y0)*I,(z1-z0)*I);sheetUV(geo,x0,x1,y0,y1,z0,z1,size);const g=new T.Mesh(geo,m);
  g.position.set((x0+x1)/2*I-o.x,(y0+y1)/2*I-o.y,(z0+z1)/2*I-o.z);g.castShadow=true;g.receiveShadow=true;p.add(g);return g;}
 // Box in SOURCE-relative inches (xr, yr, z).
 function S(p,xr0,xr1,yr0,yr1,z0,z1,m,size){return B(p,wx(xr0),wx(xr1),z0,z1,wz(yr1),wz(yr0),m,size);}
 function pivot(p,xr,z,yr){const q=new T.Group(),o=p.userData.o||new T.Vector3(),x=wx(xr),zz=wz(yr);q.position.set(x*I-o.x,z*I-o.y,zz*I-o.z);q.userData.o=new T.Vector3(x*I,z*I,zz*I);p.add(q);return q;}
 function unit(id,name,kind,angle,front=aqua,side=aqua){const group=new T.Group();root.add(group);
  const u={id,name,kind,group,angle,front:mat(front),side:mat(side),defaultFront:{...front},defaultSide:{...side},actions:[],lightNodes:[],finishable:true};
  u.sideSkin=u.side;u.members=[u];u.product=u;units.push(u);return u;}
 // type 'hinge' rotates about Y; type 'slide' moves along axis ('x' or 'z') by travel (metres).
 function act(u,node,type,travel,extra={}){const a={unit:u,node,type,travel,axis:'z',initial:node.position.clone(),open:false,value:0,...extra};actions.push(a);u.actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 // Soft LED strip: rect-area light at world inches (x,y,z), long edge along L, shining toward F.
 function strip(u,x,y,z,len,wid,L,F,intensity=8){const l=new T.RectAreaLight('#ffd6a0',intensity,len*I,wid*I);l.position.set(x*I,y*I,z*I);
  const xa=new T.Vector3(...L).normalize(),za=new T.Vector3(...F).normalize().negate();const ya=za.clone().cross(xa).normalize();xa.copy(ya.clone().cross(za)).normalize();
  l.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(xa,ya,za));u.group.add(l);u.lightNodes.push(l);return l;}
 const t=.75,gap=.08,D=.75; // panel thickness, reveal, door thickness
 const FL=72; // long counter front plane (yr)

 // ---- Long counter (fronts face +Z at yr=72; carcass yr 72.75..96). Doors/drawers 0-27 in, black groove 27-29.2, white worktop 29.2-30.
 function baseShell(g,xr0,xr1,{left=true,right=true,leftMat=inner}={}){
  S(g,xr0,xr1,FL+D,96,0,t,inner);S(g,xr0,xr1,FL+D,96,27-t,27,inner);S(g,xr0,xr1,96-t,96,t,27-t,inner);
  if(left)S(g,xr0,xr0+t,FL+D,96-t,t,27-t,leftMat);if(right)S(g,xr1-t,xr1,FL+D,96-t,t,27-t,inner);}
 function grooveBand(g,xr0,xr1){S(g,xr0,xr1,FL+.4,FL+2.4,27,29.2,groove);}
 function pullOut(u,xr0,xr1,z0,z1,depth=18,levels=[]){const p=pivot(u.group,(xr0+xr1)/2,(z0+z1)/2,FL);
  S(p,xr0+gap,xr1-gap,FL,FL+D,z0+gap,z1-gap,u.front);
  const b0=xr0+1.2,b1=xr1-1.2,back=FL+D+20.5;
  for(const lv of levels){S(p,b0,b1,FL+D+.6,back,lv,lv+.25,wire);for(const xr of [b0,b1-.3])S(p,xr,xr+.3,FL+D+.6,back,lv+.25,lv+3.5,wire);S(p,b0+.3,b1-.3,back-.3,back,lv+.25,lv+3.5,wire);}
  return act(u,p,'slide',depth*I,{axis:'z'});}

 // 1 · Sink cabinet: 4 in fixed filler at the left end + two doors (opening from the middle). Sink is on the worktop unit.
 const sk=unit('sink-cabinet','Sink cabinet','sink',0);const skg=sk.group;
 baseShell(skg,0,40,{leftMat:sk.side});S(skg,0,4,FL,FL+D,0,27,sk.front);grooveBand(skg,0,40);
 for(const [hx,x0,x1,travel] of [[4,4,22,-Math.PI*.47],[40,22,40,Math.PI*.47]]){const p=pivot(skg,hx,13.5,FL);S(p,x0+gap,x1-gap,FL,FL+D,gap,27-gap,sk.front);act(sk,p,'hinge',travel);}
 sk.doorCount=2;sk.filler='4 in fixed aqua filler at the left end';sk.handles='Handleless, black groove profile';
 sk.renderNote='Hinge sides not specified (shown opening from the middle). Storage shell empty. Left end panel shown aqua (not asked).';

 // 2 · Pan pull-out (12 in).
 const pn=unit('pan-pullout','Pan pull-out','pan',0);baseShell(pn.group,40,52,{left:false});grooveBand(pn.group,40,52);pullOut(pn,40,52,0,27,18,[2,13]);
 pn.renderNote='Basket rows generic (not specified).';
 // 3 · Thali basket (lower) + cutlery drawer (upper), 26 in.
 const th=unit('thali-cutlery','Thali basket & cutlery drawer','thali',0);baseShell(th.group,52,78,{left:false});grooveBand(th.group,52,78);
 pullOut(th,52,78,0,17.7,18,[2]);
 {const p=pivot(th.group,65,22.35,FL);S(p,52+gap,78-gap,FL,FL+D,17.7+gap,27-gap,th.front);S(p,53.2,76.8,FL+D+.6,FL+D+20,18.6,18.9,wire);for(const xr of [53.2,57.6,62,66.4,70.8,76.5])S(p,xr,xr+.3,FL+D+.6,FL+D+20,18.9,21.2,wire);act(th,p,'slide',16*I,{axis:'z'});}
 th.drawerHeightsInches=[17.7,9.3];th.renderNote='Thali rack and cutlery tray divisions generic.';
 // 4 · Oil pull-out (10 in).
 const ol=unit('oil-pullout','Oil pull-out','oil',0);baseShell(ol.group,78,88,{left:false});grooveBand(ol.group,78,88);pullOut(ol,78,88,0,27,18,[2,10,18]);
 // 5 · S corner (18 in front, carcass runs into the blind corner to the side wall) + 2 in corner filler.
 const sc=unit('s-corner','S corner','corner',0);const scg=sc.group;
 S(scg,88,132,FL+D,96,0,t,inner);S(scg,88,132,FL+D,96,27-t,27,inner);S(scg,88,132-t,96-t,96,t,27-t,inner);S(scg,132-t,132,FL+D,96,t,27-t,inner);
 S(scg,106,108,FL,FL+D,0,27,sc.front);grooveBand(scg,88,108);
 {const a=pullOut(sc,88,106,0,27,16,[]),p=a.node;for(const lv of [3,15]){S(p,89.5,104.5,FL+D+.6,FL+D+17,lv,lv+.25,wire);S(p,104.5,118,FL+D+8,FL+D+17,lv,lv+.25,wire);}}
 sc.renderNote='S-corner fitting drawn as two generic trays reaching into the corner; 2 in filler at the corner is fixed aqua.';

 // ---- Short counter (fronts face -X at xr=108, carcass xr 108.75..132, yr 24..72).
 const SX=108;
 // 6 · Open wicker box (yr 52-70): no shutter, wood mica inside, two wicker baskets pulling out toward -X. Plus 2 in fixed filler (yr 70-72).
 const wk=unit('wicker-box','Open box · 2 wicker baskets','wicker',-Math.PI/2,aqua,wood);const wkg=wk.group;
 S(wkg,SX,SX+D,70,72,0,27,wk.front);
 S(wkg,SX,132,52,52+t,0,27,woodMica);S(wkg,SX,132,70-t,70,0,27,woodMica);S(wkg,SX+D,132,52+t,70-t,0,t,woodMica);S(wkg,SX,132,52+t,70-t,27-t,27,woodMica);S(wkg,132-t,132,52+t,70-t,t,27-t,woodMica);
 S(wkg,SX,SX+D,52+t,70-t,0,t,wk.front);// front lip of the bottom (aqua edge)
 S(wkg,SX+.4,SX+2.4,52,72,27,29.2,groove);
 wk.baskets=[];
 for(const [z0,z1] of [[1.2,12.6],[14,25.4]]){const p=pivot(wkg,SX,(z0+z1)/2,61);const y0=52+t+.4,y1=70-t-.4,x0=SX+.6,x1=131;
  S(p,x0+.8,x1-.3,y0+.3,y1-.3,z0,z0+.3,wicker,[8,8]);S(p,x0+.8,x1-.3,y0,y0+.3,z0,z1-1,wicker,[8,8]);S(p,x0+.8,x1-.3,y1-.3,y1,z0,z1-1,wicker,[8,8]);S(p,x1-.3,x1,y0,y1,z0,z1-1,wicker,[8,8]);S(p,x0+.5,x0+.8,y0,y1,z0,z1-1,wicker,[8,8]);
  S(p,x0,x0+.5,y0-.2,y1+.2,z1-2.4,z1,caneRim);S(p,x0+.5,x1,y0-.2,y0+.2,z1-1,z1-.4,caneRim);S(p,x0+.5,x1,y1-.2,y1+.2,z1-1,z1-.4,caneRim);
  S(p,x0-.02,x0+.01,61-3,61+3,z1-1.8,z1-.9,groove);// finger slot
  wk.baskets.push(act(wk,p,'slide',-15*I,{axis:'x'}));}
 wk.basketCount=2;wk.shutter='None — open box';wk.inside='Wood mica (Bright’s wood photo)';
 wk.renderNote='Wicker weave is an illustrative texture in the colour of Bright’s basket photo; basket heights and rim profile approximate.';
 // 7 · Two storage doors (yr 24-38, 38-52), opening from the middle.
 const sd=unit('short-doors','Storage doors (short counter)','shortdoors',-Math.PI/2);const sdg=sd.group;
 S(sdg,SX+D,132,24,52,0,t,inner);S(sdg,SX+D,132,24,52,27-t,27,inner);S(sdg,132-t,132,24,52,t,27-t,inner);S(sdg,SX+D,132-t,24,24+t,t,27-t,inner);S(sdg,SX+D,132-t,52-t,52,t,27-t,inner);
 S(sdg,SX+.4,SX+2.4,24,52,27,29.2,groove);
 // Door at the tall-unit corner is limited to 75° so it stops short of the tall unit's lower door.
 for(const [hy,y0,y1,travel,extra] of [[24,24,38,Math.PI*75/180,{skipOpenAll:true}],[52,38,52,-Math.PI*.47,{}]]){const p=pivot(sdg,SX,13.5,hy);S(p,SX,SX+D,y0+gap,y1-gap,gap,27-gap,sd.front);act(sd,p,'hinge',travel,extra);}
 sd.doorCount=2;sd.renderNote='Hinge sides not specified (shown opening from the middle). The door next to the tall unit opens 75° in the render and cannot be open together with the tall unit’s right lower door.';

 // ---- Tall unit (fronts face -Z at yr=24; body yr 0..23.25, xr 72..132, 84 in high).
 const tl=unit('tall-unit','Tall unit · OTG & grinder','tall',Math.PI,aqua,wood);const tg=tl.group,TF=24;
 S(tg,72,72+t,0,TF,0,84,tl.side);// outer side (wood mica)
 S(tg,72+t,132,0,TF-D,84-t,84,inner);S(tg,72+t,132,0,t,0,84-t,inner);S(tg,132-t,132,t,TF-D,0,84-t,inner);
 // lower doors 0-27 (opening from the middle; the right one stops at 75° by the short counter door)
 S(tg,72+t,108,t,TF-D,0,t,inner);S(tg,72+t,108,t,TF-D,27-t,27,inner);S(tg,108-t,108,t,TF-D,t,27-t,inner);
 for(const [hx,x0,x1,travel,extra] of [[72,72,90,Math.PI*.47,{}],[108,90,108,-Math.PI*75/180,{skipOpenAll:true}]]){const p=pivot(tg,hx,13.5,TF);S(p,x0+gap,x1-gap,TF-D,TF,gap,27-gap,tl.front);act(tl,p,'hinge',travel,extra);}
 S(tg,72+t,108,TF-2.4,TF-.4,27,30,groove);
 // drawer 32-40 inside an aqua frame (30-41)
 S(tg,72+t,108,TF-D,TF,30,32,tl.front);S(tg,72+t,74,TF-D,TF,32,40,tl.front);S(tg,106,108,TF-D,TF,32,40,tl.front);S(tg,72+t,108,TF-D,TF,40,41,tl.front);
 S(tg,74,106,t,TF-D,30,30.6,inner);
 {const p=pivot(tg,90,36,TF);S(p,74+gap,106-gap,TF-D,TF,32+gap,40-gap,tl.front);S(p,75,105,4,TF-D,32.6,32.9,inner);for(const xr of [75,104.7])S(p,xr,xr+.3,4,TF-D,32.9,38.6,inner);S(p,75.3,104.7,4,4.3,32.9,38.6,inner);
  S(p,74.3,105.7,TF-.02,TF+.02,39.2,39.9,groove);// slim black groove at the drawer top
  act(tl,p,'slide',-14*I,{axis:'z'});}
 // OTG space 41-59 (open, frame 1 in), LED at the top
 S(tg,72+t,73,.6,TF-D,41,59,tl.front);S(tg,107,108,.6,TF-D,41,59,tl.front);S(tg,72+t,108,TF-D,TF,59,60,tl.front);S(tg,72+t,73,TF-D,TF,41,59,tl.front);S(tg,107,108,TF-D,TF,41,59,tl.front);
 S(tg,73,107,t,TF-D,40.4,41,inner);S(tg,73,107,t,TF-D,59,59.6,inner);S(tg,73,107,t,.6,41,59,inner);
 // Microwave oven (generic 20 x 12 x 15 in) in the space, animated in a loop: cooking (turntable turns, light on) -> door opens -> closes.
 const lining=new T.MeshStandardMaterial({color:'#d4d6d6',roughness:.6,emissive:new T.Color('#ffcf8a'),emissiveIntensity:0});lining.userData.compatColor='#d4d6d6';
 const mwWindow=new T.MeshPhysicalMaterial({color:'#1c2124',roughness:.05,clearcoat:1,emissive:new T.Color('#ffb860'),emissiveIntensity:0});mwWindow.userData.compatColor='#1c2124';
 const display=new T.MeshBasicMaterial({color:'#47d16b'});
 S(tg,80,100,6,21,41,41.7,black);S(tg,80,100,6,21,52.9,53.6,black);S(tg,80,80.7,6,21,41.7,52.9,black);S(tg,99.3,100,6,21,41.7,52.9,black);S(tg,80.7,99.3,6,6.7,41.7,52.9,black);
 S(tg,80.7,84.5,20.3,21,41.7,52.9,black);S(tg,81.3,83.9,21,21.05,50,51.6,display);for(const z of [44,46,48])S(tg,81.6,83.6,21,21.05,z,z+1,steelDark);
 S(tg,84.5,85.2,6.7,20.3,41.7,52.9,lining);S(tg,85.2,99.3,6.7,20.3,41.7,41.8,lining);S(tg,85.2,99.3,6.7,6.8,41.8,52.8,lining);S(tg,85.2,99.3,6.8,20.3,52.8,52.9,lining);S(tg,99.2,99.3,6.8,20.3,41.8,52.8,lining);
 const mwTable=pivot(tg,92.25,42,13.5);{const plate=new T.Mesh(new T.CylinderGeometry(5.6*I,5.6*I,.25*I,36),new T.MeshPhysicalMaterial({color:'#eef4f4',roughness:.05,transparent:true,opacity:.55}));plate.position.y=-.05*I;mwTable.add(plate);
  const bowl=new T.Mesh(new T.CylinderGeometry(2.6*I,1.8*I,2*I,28),std('#f4f1ea',{roughness:.35}));bowl.position.set(1.2*I,1.1*I,0);mwTable.add(bowl);
  const food=new T.Mesh(new T.CylinderGeometry(2.3*I,2.3*I,.2*I,28),std('#c9762e',{roughness:.7}));food.position.set(1.2*I,2.15*I,0);mwTable.add(food);}
 const mwDoor=pivot(tg,100,47.3,21.05);S(mwDoor,84.6,99.95,20.4,21.05,41.75,52.85,black);S(mwDoor,87,97.6,21.05,21.08,43.5,51.2,mwWindow);S(mwDoor,85.3,85.9,21.08,21.9,44,50.6,chrome);
 const microwave={door:mwDoor,table:mwTable,lining,window:mwWindow,openAngle:-Math.PI*95/180};
 S(tg,74,106,TF-D-1.6,TF-D-1.3,58.7,59,lightMaterial);strip(tl,wx(90),58.6,wz(TF-D-1.5),30,.5,[1,0,0],[0,-1,.25],10);
 // upper doors 60-84 (xr 72-108, from the middle)
 S(tg,72+t,108,t,TF-D,60,60.6,inner);
 for(const [hx,x0,x1,travel] of [[72,72,90,Math.PI*.47],[108,90,108,-Math.PI*.47]]){const p=pivot(tg,hx,72,TF);S(p,x0+gap,x1-gap,TF-D,TF,60+gap,84-gap,tl.front);act(tl,p,'hinge',travel);}
  // right part xr 108-132: grinder space 30-47 (frame), single upper door 48-84 hinged on the wall side.
 S(tg,108,109,TF-D,TF,30,48,tl.front);S(tg,131,132-t,TF-D,TF,30,48,tl.front);S(tg,109,131,TF-D,TF,47,48,tl.front);
 S(tg,109,131,1,TF-D,29.4,30,inner);S(tg,109,131,1,TF-D,47,47.6,inner);S(tg,109,131,t,1,30,47,inner);S(tg,108,109,1,TF-D,30,47,inner);S(tg,131,132-t,1,TF-D,30,47,inner);
 // Tabletop wet grinder (generic), animated in a loop: slides out onto the counter, grinds (drum turns), slides back in.
 const grinderNode=pivot(tg,120,30,12),gBody=std('#e9e7e2',{roughness:.4});
 const cyl=(p,xr,zc,yr,r0,r1,h,m,seg=32)=>{const o=p.userData.o,me=new T.Mesh(new T.CylinderGeometry(r0*I,r1*I,h*I,seg),m);me.position.set(wx(xr)*I-o.x,zc*I-o.y,wz(yr)*I-o.z);me.castShadow=true;p.add(me);return me;};
 S(grinderNode,115,125,7.5,16.5,30,34,gBody);
 const drum=pivot(grinderNode,120,34,12.5);cyl(drum,120,37,12.5,4,3.8,6,steel);cyl(drum,120,39.85,12.5,3.55,3.55,.2,std('#efe6cf',{roughness:.9}));S(drum,123.75,124.05,12,13,34.5,39.5,steelDark);
 S(grinderNode,119.4,120.6,7.6,8.8,34,43.5,gBody);S(grinderNode,119.4,120.6,8.8,13.4,42.3,43.5,gBody);cyl(grinderNode,120,40.6,12.6,1.1,1.1,3.4,std('#8a8f93',{roughness:.6}),20);
 const grinder={node:grinderNode,drum,home:grinderNode.position.clone(),out:14};
 S(tg,110,130,TF-D-1.6,TF-D-1.3,46.7,47,lightMaterial);strip(tl,wx(120),46.6,wz(TF-D-1.5),18,.5,[1,0,0],[0,-1,.25],8);
 S(tg,108,132-t,t,TF-D,47.6,48,inner);
 {const p=pivot(tg,132,66,TF);S(p,108+gap,132-gap,TF-D,TF,48+gap,84-gap,tl.front);act(tl,p,'hinge',-Math.PI*.47);}
 tl.doorCount=5;tl.drawerCount=1;tl.spaces='OTG / oven space (34 x 18 in) and tabletop grinder space (22 x 17 in), each with an LED profile light shining down';
 tl.appliances='Microwave oven (loop: cooking, door opens, closes) and tabletop wet grinder (loop: slides out, grinds, slides back in)';
 tl.renderNote='Microwave and grinder are generic models; their animations are illustrative. Upper door hinge sides and the tall doors’ opening method (no grooves shown) not specified. Inner finish of the open spaces not specified (shown light).';

 // ---- Wall cabinet (fronts face -X at xr=117; yr 48..95.8, 60-84 in): black aluminium frame, clear glass, wood mica end side, LED below.
 const WX=117;
 const wc=unit('glass-wall-cabinet','Glass wall cabinet','wall',-Math.PI/2,aqua,wood);const wg=wc.group;
 S(wg,WX+D,132,48+t,95.8,60,60+t,inner);S(wg,WX+D,132,48+t,95.8,84-t,84,inner);S(wg,132-t,132,48+t,95.8,60+t,84-t,inner);S(wg,WX+D,132-t,95.8-t,95.8,60+t,84-t,inner);
 S(wg,WX,132,48,48+t,60,84,wc.side);// open end side (wood mica)
 for(const [hy,y0,y1,travel] of [[48,48+t,66,Math.PI*.47],[66,66,80.9,Math.PI*.47],[95.8,80.9,95.8,-Math.PI*.47]]){const p=pivot(wg,WX,72,hy);const a=y0+gap,b=y1-gap,f=.9;
  S(p,WX,WX+D,a,b,60+gap,60+gap+f,blackAlu);S(p,WX,WX+D,a,b,84-gap-f,84-gap,blackAlu);S(p,WX,WX+D,a,a+f,60+gap+f,84-gap-f,blackAlu);S(p,WX,WX+D,b-f,b,60+gap+f,84-gap-f,blackAlu);
  S(p,WX+.3,WX+.5,a+f,b-f,60+gap+f,84-gap-f,glass);act(wc,p,'hinge',travel);}
 S(wg,WX+1.5,131,49.5,95,59.7,60,lightMaterial);strip(wc,wx(124),59.6,wz(72),44,.5,[0,0,1],[0,-1,0],14);
 wc.doorCount=3;wc.glass='Clear glass in black aluminium frames';
 wc.renderNote='Hinge sides not specified (shown: left door on its own, other two from the middle). Inside not specified (shown empty).';

 // ---- Worktop (white), sink and hob (fixed).
 const wt=unit('worktop','Granite top, sink & hob','top',0);wt.finishable=false;wt.fixed=true;const wtg=wt.group;
 S(wtg,0,132,FL-.5,96,29.2,30,worktopMat,[30,30]);S(wtg,SX-.5,132,24,FL-.5,29.2,30,worktopMat,[30,30]);
 // sink over the left doors (generic stainless, centred on xr 4-40)
 {const c=22,w=30,d=17;S(wtg,c-w/2,c+w/2,FL+3,FL+3+d,30,30.12,steel);S(wtg,c-w/2+1.2,c+w/2-1.2,FL+4.2,FL+1.8+d,30.12,30.14,steelDark);
  const tapX=wx(c),tapZ=wz(FL+3+d+1.6);const post=new T.Mesh(new T.CylinderGeometry(.55*I,.6*I,11*I,16),chrome);post.position.set(tapX*I,35.5*I,tapZ*I);wtg.add(post);
  const spout=new T.Mesh(new T.TorusGeometry(3.2*I,.42*I,12,24,Math.PI),chrome);spout.rotation.y=Math.PI/2;spout.position.set(tapX*I,41*I,(tapZ+3.2)*I);wtg.add(spout);}
 // hob over the oil pull-out and S corner (xr 78-106)
 {S(wtg,79,105,FL+2.5,FL+20.5,30,30.25,black);for(const [x,y,r] of [[84.5,FL+11.5,2.6],[92,FL+11.5,3.2],[99.5,FL+11.5,2.6]]){const b=new T.Mesh(new T.CylinderGeometry(r*I,r*I,.6*I,24),burner);b.position.set(wx(x)*I,30.55*I,wz(y)*I);wtg.add(b);}}
 wt.material='White worktop';wt.renderNote='White top with faint illustrative speckle (stone type not specified). Sink and hob types/sizes not specified (generic stainless sink with tap, black glass 3-burner hob).';
 // Chimney removed at Bright's request (27 Nov 23:59).

 // Room walls and floor removed at Bright's request (28 Nov 08:12): they blocked the view when rotating.

 function polygon(f,material){const n=new T.Vector3(...f.normal).normalize(),ax=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),ay=n.clone().cross(ax).normalize(),loops=f.points.map(l=>l.map(p=>new T.Vector3(...p))),flat=loops.flat(),xy=flat.flatMap(p=>[p.dot(ax),p.dot(ay)]),holes=[];let count=loops[0].length;for(const l of loops.slice(1)){holes.push(count);count+=l.length;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(flat.flatMap(p=>p.toArray()),3));g.setIndex(earcut(xy,holes));g.computeVertexNormals();return new T.Mesh(g,material);}
 for(const f of exactLayout.sourceFaces){const m=polygon(f,new T.MeshStandardMaterial({color:f.color,side:T.DoubleSide,roughness:1,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));m.userData.sourceFace=f.id;referenceRoot.add(m);sourceMeshes.push(m);}
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 return {root,architecture,units,products:units,actions,sourceMeshes,exactLayout,
  setReference(on){referenceRoot.visible=on;for(const u of units)u.group.visible=!on;architecture.visible=!on;},
  setLights(on){for(const u of units)for(const l of u.lightNodes)l.visible=on;lightMaterial.color.set(on?'#ffe2a6':'#a4a39c');},
  microwave,grinder,animating:true,clock:0,
  setAnimation(on){this.animating=on;if(!on){this.clock=0;this.animate(0);}},
  // Loops: microwave 9 s (0-4 cooking, 4-5 door opens, 5-6.5 open, 6.5-7.5 closes); grinder 10 s (0-2 out, 2-7 grinding, 7-9 back in).
  animate(dt){const ease=s=>{s=Math.min(1,Math.max(0,s));return s*s*(3-2*s);},on=this.animating;
   const m=this.clock%9,cooking=on&&m<4,door=!on?0:m<4?0:m<5?ease(m-4):m<6.5?1:m<7.5?1-ease(m-6.5):0;
   microwave.door.rotation.y=microwave.openAngle*door;if(cooking)microwave.table.rotation.y+=dt*1.3;else if(!on)microwave.table.rotation.y=0;
   microwave.lining.emissiveIntensity=cooking?.75:door>0?.35:0;microwave.window.emissiveIntensity=cooking?.55:0;
   const g=this.clock%10,out=!on?0:g<2?ease(g/2):g<7?1:g<9?1-ease((g-7)/2):0,grinding=on&&g>=2&&g<7;
   grinder.node.position.copy(grinder.home);grinder.node.position.z-=grinder.out*I*out;if(grinding){grinder.drum.rotation.y+=dt*7;grinder.node.position.x+=Math.sin(this.clock*90)*.03*I;}else if(!on)grinder.drum.rotation.y=0;
   grinder.state=grinding?'grinding':out>0?'moving':'inside';microwave.state=cooking?'cooking':door>0?'door open':'idle';},
  update(dt){if(this.animating)this.clock+=dt;this.animate(dt);for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='hinge')a.node.rotation.y=a.travel*a.value;else a.node.position[a.axis]=a.initial[a.axis]+a.travel*a.value;}}
 };
}
