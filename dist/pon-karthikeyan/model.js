import * as T from 'three';
import {earcut} from '../venki/triangulate.js';
import {exactLayout} from './exact-layout.js';
export {exactLayout};

// Mr. Pon Karthikeyan · Irugur TV unit.
// All positions below are in the source SKP's inches (relative to the model's
// minimum corner): sx = width, sy = depth from the front (0) to the wall (82),
// sz = height. They convert to three.js as x = sx, y = sz, z = -sy.
export const DEFAULT_FINISH='#9f612f'; // average of the customer's wood mica photo
export const GREEN_MICA='#6f7553';    // estimate: reference photo is under warm light
export const project={id:'pon-karthikeyan-tv-v1',customer:'Mr. Pon Karthikeyan',quotation:null};
export const WOOD_TEXTURE='./wood-mica-reference.jpg';
const I=.0254,WOOD_TILE=.62;
let woodTexture,louverTexture;
export function createWoodTexture(){
 if(!woodTexture){woodTexture=new T.TextureLoader().load(WOOD_TEXTURE);woodTexture.colorSpace=T.SRGBColorSpace;
 woodTexture.wrapS=woodTexture.wrapT=T.RepeatWrapping;woodTexture.anisotropy=8;woodTexture.userData.shared=true;}return woodTexture;
}
function createLouverTexture(){
 if(!louverTexture){louverTexture=new T.TextureLoader().load('./pvc-louver-reference.jpg');louverTexture.colorSpace=T.SRGBColorSpace;
 louverTexture.wrapS=louverTexture.wrapT=T.RepeatWrapping;louverTexture.anisotropy=8;louverTexture.userData.shared=true;}return louverTexture;
}
const wood={name:'Wood mica (your sample)',color:DEFAULT_FINISH,wood:true},green={name:'Green matte mica',color:GREEN_MICA};

export function buildModel(){
 const root=new T.Group(),architecture=new T.Group(),referenceRoot=new T.Group();root.add(architecture,referenceRoot);referenceRoot.visible=false;
 const units=[],actions=[],sourceMeshes=[],lights=[];
 const std=(color,roughness=.9,extra={})=>new T.MeshStandardMaterial({color,roughness,...extra});
 const wallPaint=std('#ece8df',1),carcass=std('#efe9df',.9);
 const blackGlass=new T.MeshPhysicalMaterial({color:'#15181a',transparent:true,opacity:.72,roughness:.06,metalness:.1,clearcoat:1,side:T.DoubleSide,depthWrite:false});
 const lightMaterial=new T.MeshBasicMaterial({color:'#ffe2a6'});
 const tvMaterial=new T.MeshPhysicalMaterial({color:'#0c0d0f',roughness:.18,metalness:.3,clearcoat:1});
 function mat(f){const m=new T.MeshPhysicalMaterial({color:f.wood?'#ffffff':f.color,map:f.wood?createWoodTexture():null,roughness:.84,clearcoat:0,side:T.DoubleSide});m.userData.compatColor=f.color;return m;}
 // Box from source-inch extents. UVs are scaled by real size so textures keep their grain scale.
 function B(parent,x0,x1,y0,y1,z0,z1,m,tileU=WOOD_TILE,tileV=tileU){
  const w=(x1-x0)*I,h=(z1-z0)*I,d=(y1-y0)*I,g=new T.BoxGeometry(w,h,d),uv=g.attributes.uv,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*dims[f][0]/tileU,uv.getY(k)*dims[f][1]/tileV);}
  const o=new T.Mesh(g,m),origin=parent.userData.origin||new T.Vector3();
  o.position.set((x0+x1)/2*I-origin.x,(z0+z1)/2*I-origin.y,-(y0+y1)/2*I-origin.z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function pivotAt(parent,sx,sy,sz){const p=new T.Group();p.position.set(sx*I,sz*I,-sy*I);p.userData.origin=p.position.clone();parent.add(p);return p;}
 function unit(id,name,kind,front,side,extra={}){const group=new T.Group();root.add(group);
  const u={id,name,kind,group,angle:0,front:mat(front),side:mat(side),defaultFront:{...front},defaultSide:{...side},actions:[],interiors:[],lightNodes:[],finishable:true,...extra};
  u.sideSkin=u.side;u.members=[u];u.product=u;units.push(u);return u;}
 function act(u,node,type,travel,extra={}){const a={unit:u,node,type,travel,initial:node.position.clone(),open:false,value:0,...extra};actions.push(a);u.actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 // Warm-white LED: visible strip plus a small point light, switched by setLights.
 function led(u,x0,x1,y0,y1,z0,z1,lx,ly,lz,intensity=.22,distance=1.2){B(u.group,x0,x1,y0,y1,z0,z1,lightMaterial).castShadow=false;
  const l=new T.PointLight('#ffd9a0',intensity,distance,2);l.position.set(lx*I,lz*I,-ly*I);u.group.add(l);u.lightNodes.push(l);lights.push(l);}
 function polygon(f,material,shift=0,tile=WOOD_TILE){const n=new T.Vector3(...f.normal).normalize(),ax=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),ay=n.clone().cross(ax).normalize(),loops=f.points.map(l=>l.map(p=>new T.Vector3(p[0],p[1]+shift,p[2]))),flat=loops.flat(),xy=flat.flatMap(p=>[p.dot(ax),p.dot(ay)]),holes=[];let count=loops[0].length;for(const l of loops.slice(1)){holes.push(count);count+=l.length;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(flat.flatMap(p=>p.toArray()),3));g.setAttribute('uv',new T.Float32BufferAttribute(xy.map(v=>v/tile),2));g.setIndex(earcut(xy,holes));g.computeVertexNormals();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;return m;}
 const face=id=>exactLayout.sourceFaces.find(f=>f.id===id);

 // ---- Room: TV wall (9 in), side wall pier, floor ----
 B(architecture,0,144.1,73,82,0,120,wallPaint);
 B(architecture,144.1,153.06,1.05,73,0,120,wallPaint);
 const floor=B(architecture,-30,175,-90,82,-1,0,std('#ddd6ca',.95));floor.castShadow=false;
 // Wall end beside the unit: green matte continued (customer option 1).
 const wallEnd=new T.MeshPhysicalMaterial({color:GREEN_MICA,roughness:.86});wallEnd.userData.compatColor=GREEN_MICA;
 B(architecture,144.1,153.06,.95,1.05,0,120,wallEnd);

 // ---- 1. Green matte mica TV panels with the TV ----
 const panel=unit('tv-panel','Green matte TV panel','panel',green,green);
 B(panel.group,24.1,120,72.05,72.95,20,68,panel.front);      // behind TV (source orange)
 B(panel.group,24.1,120,72.05,72.95,70,84,panel.front);      // above ledge (source olive)
 const tv=new T.Group();panel.group.add(tv);tv.userData.origin=new T.Vector3();
 B(tv,72-28.55,72+28.55,70.4,71.6,44-16.05,44+16.05,tvMaterial);B(tv,72-6,72+6,71.6,72.05,36,52,std('#222',.6));
 panel.tvNote='Illustrative 65-inch TV; actual TV size not specified.';

 // ---- 2. Wood mica decorative ledge with warm-white LED below ----
 const ledge=unit('ledge','Wooden mica display ledge','ledge',wood,wood);
 B(ledge.group,24.1,120,64,72.05,68,70,ledge.front);
 led(ledge,26,118,66.4,67,67.8,68,72,67.5,66.5,.30,1.4);
 const decor=[std('#e9e3d6',.7),std('#8a6a48',.6),std('#c9b48f',.5)];
 for(const [x,r,h,m] of [[38,1.6,6,0],[42,1.2,4,1],[100,1.8,7,2],[105,1.1,3.5,0]]){const v=new T.Mesh(new T.CylinderGeometry(r*.75*I,r*I,h*I,20),decor[m]);v.position.set(x*I,(70+h/2)*I,-68*I);v.castShadow=true;ledge.group.add(v);}
 ledge.decorNote='Small decoratives are illustrative.';

 // ---- 3. Fixed PVC louver header (no opening action) ----
 const louverMat=new T.MeshStandardMaterial({map:createLouverTexture(),roughness:.7});louverMat.userData.compatColor='#6e4a32';
 const louver=unit('louver','PVC louver header','louver',{name:'PVC louver',color:'#6e4a32'},{name:'PVC louver',color:'#6e4a32'},{finishable:false,fixed:true});
 louver.front=louver.side=louver.sideSkin=louverMat;
 B(louver.group,.1,144.1,72.4,72.95,84,120,louverMat,.46,.55);

 // ---- 4. Tall left unit: black tinted glass shutter, left hinge ----
 const tall=unit('tall-glass','Tall black-glass cabinet','glass',{name:'Black tinted glass',color:'#15181a'},wood,{finishable:false});
 const tg=tall.group;tg.userData.origin=new T.Vector3();
 B(tg,23.35,24.1,55.5,72,20,84,tall.side);                 // side toward TV (wood mica)
 B(tg,3.8,23.35,71.25,72,20,84,tall.side);                 // back
 B(tg,3.8,23.35,55.6,71.25,20,20.75,tall.side);B(tg,3.8,23.35,55.6,71.25,83.25,84,tall.side);
 for(const id of [44951,44953,44955,44957]){const m=polygon(face(id),tall.side);tg.add(m);} // exact rounded edge
 const cap=polygon(face(44039),tall.side);tg.add(cap);
 const bottomCap=polygon(face(44039),tall.side,-76*I);tg.add(bottomCap);   // same outline at 8 in
 const tallDoor=pivotAt(tg,3.8,55.5,52);B(tallDoor,3.85,24.05,54.8,55.5,20.1,83.9,blackGlass);
 const ta=act(tall,tallDoor,'hinge',-Math.PI*.47);ta.confirmedHinge='left';tall.hingeEdge='left';
 tall.interiorNote='Inside arrangement not specified yet; shown empty.';

 // ---- 5. Floating lower console: five wood shutters + one lift-up glass shutter ----
 const con=unit('console','Floating lower console','console',wood,wood);
 const cg=con.group;cg.userData.origin=new T.Vector3();
 B(cg,3.8,120,56,72,19.25,20,con.side);B(cg,3.8,120,56,72,8,8.75,con.side);B(cg,3.8,120,71.25,72,8.75,19.25,carcass);
 B(cg,119.25,120,56,72,8.75,19.25,con.side);
 for(const x of [24.1,44.3,64.5,84.8,105])B(cg,x-.35,x+.35,56.2,71.25,8.75,19.25,carcass);
 const cells=[[3.8,24.1,'left'],[24.1,44.3,'left'],[44.3,64.5,'left'],[64.5,84.8,'lift'],[84.8,105,'right'],[105,120,'right']];
 con.hinges=[];
 for(const [x0,x1,how] of cells){
  if(how==='lift'){const p=pivotAt(cg,x0,55.5,20);B(p,x0+.1,x1-.1,54.8,55.5,8.1,19.9,blackGlass);const a=act(con,p,'lift',-1.35);a.confirmed='lifts upward';con.glassLift=a;continue;}
  const left=how==='left',p=pivotAt(cg,left?x0:x1,55.5,14);B(p,x0+.1,x1-.1,54.8,55.5,8.1,19.9,con.front);
  const a=act(con,p,'hinge',(left?-1:1)*Math.PI*.47);a.hingeSide=how;a.hingeSideApproximate=true;con.hinges.push(how);}
 con.woodShutterCount=5;con.floatHeightInches=8;
 for(const x of [22,60,98])led(con,x-17,x+17,57,57.6,7.6,8,x,60,4,.28,1.1);   // glow under the floating console
 con.underGlow='Warm white';

 // ---- 6. Awards niche: green wallpaper walls, two L-shaped wood mica shelves ----
 const paperCanvas=typeof document!=='undefined'?document.createElement('canvas'):null;let paperMap=null;
 if(paperCanvas?.getContext){paperCanvas.width=paperCanvas.height=256;const c=paperCanvas.getContext('2d');if(c){c.fillStyle=GREEN_MICA;c.fillRect(0,0,256,256);for(let i=0;i<5200;i++){const v=Math.random();c.fillStyle=v>.5?'rgba(255,255,230,.06)':'rgba(20,25,10,.08)';c.fillRect(Math.random()*256,Math.random()*256,1+v*2,1+v*2);}paperMap=new T.CanvasTexture(paperCanvas);paperMap.colorSpace=T.SRGBColorSpace;paperMap.wrapS=paperMap.wrapT=T.RepeatWrapping;}}
 const paper=new T.MeshStandardMaterial({color:paperMap?'#ffffff':GREEN_MICA,map:paperMap,roughness:.95});paper.userData.compatColor=GREEN_MICA;
 const niche=unit('awards-niche','Awards display niche','niche',{name:'Green textured wallpaper',color:GREEN_MICA},wood,{finishable:false});niche.angle=-Math.PI/2+.35;
 const ng=niche.group;ng.userData.origin=new T.Vector3();
 B(ng,120,144.1,72.3,73,20,84,paper,.3);B(ng,143.4,144.1,37,73,20,84,paper,.3);B(ng,120,144.1,37,37.7,20,84,paper,.3);
 for(const z of [37,55]){B(ng,120,144.1,61,72.3,z,z+1,niche.side);B(ng,132.1,143.4,37.7,61,z,z+1,niche.side);}
 niche.shelfCount=2;niche.shelfMaterial='Wood mica';niche.purpose='Academic achievements: medals, winning cups, award certificates';
 const gold=std('#c9a24b',.32,{metalness:.85}),frameMat=std('#3b2a1d',.6),paperWhite=std('#f4f1e8',.9);
 for(const [z,x,y] of [[38,126,66],[56,138,50]]){const cup=new T.Group();cup.position.set(x*I,z*I,-y*I);ng.add(cup);
  const base=new T.Mesh(new T.BoxGeometry(2.4*I,1.2*I,2.4*I),frameMat);base.position.y=.6*I;cup.add(base);
  const stem=new T.Mesh(new T.CylinderGeometry(.25*I,.4*I,2.5*I,12),gold);stem.position.y=2.4*I;cup.add(stem);
  const bowl=new T.Mesh(new T.CylinderGeometry(1.6*I,.5*I,3*I,18,1,true),gold);bowl.position.y=5*I;bowl.material.side=T.DoubleSide;cup.add(bowl);}
 for(const [z,x,y] of [[38,138,68],[56,128,68]]){B(ng,x-4,x+4,y-.4,y+.4,z+1,z+7,frameMat);B(ng,x-3.3,x+3.3,y-.6,y-.4,z+1.7,z+6.3,paperWhite);}
 const medal=new T.Mesh(new T.CylinderGeometry(1.2*I,1.2*I,.2*I,20),gold);medal.rotation.x=Math.PI/2;medal.position.set(138*I,23*I,-55*I);ng.add(medal);
 niche.decorNote='Trophy, certificate and medal props are illustrative.';
 niche.lighting='Not specified; no niche lighting shown';

 // ---- 7. Robot floor-cleaner bay under the niche ----
 const bay=unit('robot-bay','Robot cleaner bay','bay',wood,wood,{fixed:true});bay.angle=-Math.PI/2+.25;
 const bg=bay.group;bg.userData.origin=new T.Vector3();
 B(bg,119.25,120,37,55.5,0,20,bay.front);                   // fixed wood mica shutter (source yellow)
 B(bg,120,144.1,37,73,19.25,20,bay.side);                   // niche floor / bay top
 B(bg,120,143.4,72.3,73,0,19.25,carcass);B(bg,120,144.1,37,37.7,0,19.25,carcass);
 const robot=new T.Group();robot.position.set(131*I,0,-64*I);bg.add(robot);
 const body=new T.Mesh(new T.CylinderGeometry(8*I,8*I,3.4*I,40),std('#2b2e31',.45));body.position.y=1.9*I;robot.add(body);
 const top=new T.Mesh(new T.CylinderGeometry(7.2*I,7.2*I,.12*I,40),std('#3c4044',.3,{metalness:.3}));top.position.y=3.65*I;robot.add(top);
 const lidar=new T.Mesh(new T.CylinderGeometry(1.6*I,1.6*I,1*I,24),std('#1a1c1e',.4));lidar.position.set(0,4.2*I,2*I);robot.add(lidar);
 for(const m of robot.children)m.castShadow=true;
 bay.robotDiameterInches=16;bay.exit='Open slot facing the TV area, under the floating console';bay.fixedShutter=true;

 // ---- 8. Tall right block: green matte front, concealed light strip, CNC pooja shutters ----
 const pooja=unit('pooja','Pooja unit with CNC shutters','pooja',green,wood,{finishable:false});pooja.angle=-Math.PI/2;
 const pg=pooja.group;pg.userData.origin=new T.Vector3();
 B(pg,124,144.1,1,1.75,0,84,pooja.front);                   // green matte front face
 B(pg,120,124,0,.75,0,84,pooja.side);                       // 4 in front strip (wood finish provisional)
 led(pooja,124.05,124.35,.8,1,2,82,125,.5,42,.18,.9);       // concealed vertical strip light
 B(pg,120.75,143.4,1.75,37,0,.75,carcass);B(pg,120.75,143.4,1.75,37,83.25,84,carcass);B(pg,143.4,144.1,1.75,37,0,84,carcass);B(pg,120.75,143.4,36.25,37,.75,83.25,carcass);
 B(pg,121,143,10,28,44,44.75,carcass);
 const shrine=new T.PointLight('#ffc77a',.25,1.2,2);shrine.position.set(132*I,70*I,-19*I);pg.add(shrine);pooja.lightNodes.push(shrine);lights.push(shrine);
 const doorTex=n=>{const t=new T.TextureLoader().load('./pooja-door-'+n+'.jpg');t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.userData.shared=true;return t;};
 const doorEdge=std('#d8d2c7',.8);pooja.doors=[];
 for(const [y0,y1,hingeY,img,sign] of [[0,18.5,0,'right',1],[18.5,37,37,'left',-1]]){
  const p=pivotAt(pg,120,hingeY,42);B(p,119.25,120,y0+.06,y1-.06,.4,83.6,doorEdge);
  const face=new T.MeshStandardMaterial({map:doorTex(img),roughness:.75});face.userData.compatColor='#d8d0c4';
  const plane=new T.Mesh(new T.PlaneGeometry((y1-y0-.12)*I,83.2*I),face);plane.rotation.y=-Math.PI/2;
  plane.position.set(119.24*I-p.position.x,42*I-p.position.y,-(y0+y1)/2*I-p.position.z);p.add(plane);
  const a=act(pooja,p,'hinge',sign*Math.PI*.47);a.opensToward='TV area';pooja.doors.push(p);}
 pooja.doorCount=2;pooja.carving='CNC per customer reference';pooja.frontStripLight='Concealed strip light';

 // ---- Reference colours: every extracted source face ----
 for(const f of exactLayout.sourceFaces){const m=polygon(f,new T.MeshStandardMaterial({color:f.color,side:T.DoubleSide,roughness:1}));m.castShadow=false;m.userData.sourceFace=f.id;referenceRoot.add(m);sourceMeshes.push(m);}
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 let reference=false;
 return {root,architecture,units,products:units,actions,sourceMeshes,exactLayout,lights,
 setReference(on){reference=on;referenceRoot.visible=on;for(const u of units)u.group.visible=!on;architecture.visible=!on;},
 setLights(on){for(const l of lights)l.visible=on;lightMaterial.color.set(on?'#ffe2a6':'#a4a39c');},
 update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='hinge')a.node.rotation.y=a.travel*a.value;else if(a.type==='lift')a.node.rotation.x=a.travel*a.value;}}
 };
}
