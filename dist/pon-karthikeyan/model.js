import * as T from 'three';
import {earcut} from '../venki/triangulate.js';
import {exactLayout} from './exact-layout.js';
export {exactLayout};

// Mr. Pon Karthikeyan · Irugur TV unit.
// All positions below are in the source SKP's inches (relative to the model's
// minimum corner): sx = width, sy = depth from the front (0) to the wall (82),
// sz = height. They convert to three.js as x = sx, y = sz, z = -sy.
export const DEFAULT_FINISH='#9f612f'; // average of the customer's wood mica photo
export const GREEN_MICA='#6b8559';    // matte green (rev 2: customer asked for a clearer matte green)
export const LOUVER_COLOUR='#8d5d42'; // walnut tone from the customer's PVC louver reference
export const project={id:'pon-karthikeyan-tv-v1',customer:'Mr. Pon Karthikeyan',quotation:null};
export const WOOD_TEXTURE='./wood-mica-reference.jpg';
const I=.0254,WOOD_TILE=1.05;
let woodTexture,louverTexture;
export function createWoodTexture(){
 if(!woodTexture){woodTexture=new T.TextureLoader().load(WOOD_TEXTURE);woodTexture.colorSpace=T.SRGBColorSpace;
 woodTexture.wrapS=woodTexture.wrapT=T.MirroredRepeatWrapping;woodTexture.anisotropy=8;woodTexture.userData.shared=true;}return woodTexture;
}
function createLouverTexture(){
 if(!louverTexture){louverTexture=new T.TextureLoader().load('./pvc-louver-reference.jpg');louverTexture.colorSpace=T.SRGBColorSpace;
 louverTexture.wrapS=louverTexture.wrapT=T.RepeatWrapping;louverTexture.anisotropy=8;louverTexture.userData.shared=true;}return louverTexture;
}
const hasCanvas=()=>typeof document!=='undefined'&&!!document.createElement('canvas').getContext?.('2d');
function canvasTexture(w,h,draw){if(!hasCanvas())return null;const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.userData.shared=true;return t;}
// Even, straight vertical grain for every louver slat (rev 2: the photo tiling looked uneven).
function slatTexture(){return canvasTexture(64,512,(c,w,h)=>{c.fillStyle=LOUVER_COLOUR;c.fillRect(0,0,w,h);for(let i=0;i<46;i++){const x=(i*13.7)%w,v=(Math.sin(i*12.9)+1)/2;c.strokeStyle=v>.5?'rgba(255,225,190,.07)':'rgba(40,18,8,.13)';c.lineWidth=.6+v*1.6;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+2,h*.3,x-2,h*.7,x+1,h);c.stroke();}});}
// Tone-on-tone green floral mica for the awards niche background.
function floralTexture(){return canvasTexture(512,512,(c,w,h)=>{c.fillStyle=GREEN_MICA;c.fillRect(0,0,w,h);
 const flower=(x,y,r,a)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle='rgba(225,240,205,.16)';for(let k=0;k<6;k++){c.rotate(Math.PI/3);c.beginPath();c.ellipse(0,-r*.55,r*.24,r*.5,0,0,Math.PI*2);c.fill();}c.fillStyle='rgba(240,230,190,.22)';c.beginPath();c.arc(0,0,r*.16,0,Math.PI*2);c.fill();c.restore();};
 const leaf=(x,y,r,a)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle='rgba(20,45,20,.18)';c.beginPath();c.ellipse(0,0,r*.18,r*.5,0,0,Math.PI*2);c.fill();c.strokeStyle='rgba(225,240,205,.10)';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-r*.45);c.lineTo(0,r*.45);c.stroke();c.restore();};
 c.strokeStyle='rgba(225,240,205,.10)';c.lineWidth=2;for(let i=0;i<4;i++){c.beginPath();c.moveTo(i*128+20,0);c.bezierCurveTo(i*128+90,170,i*128-30,340,i*128+40,512);c.stroke();}
 for(const [x,y,r] of [[64,64,58],[320,64,58],[192,192,46],[448,192,46],[64,320,58],[320,320,58],[192,448,46],[448,448,46]]){flower(x,y,r,x*.01);for(let k=0;k<3;k++)leaf(x+Math.cos(k*2.1+y)*r*1.05,y+Math.sin(k*2.1+y)*r*1.05,r*.9,k*2.1+y);}});}
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
 // UVs come from world position, so the grain runs continuously and in one
 // direction across neighbouring shutters (rev 2: no mismatched grain).
 function worldUV(g,center,grain='h',tile=WOOD_TILE){const pos=g.attributes.position,nor=g.attributes.normal,uvs=[];for(let i=0;i<pos.count;i++){const x=pos.getX(i)+center.x,y=pos.getY(i)+center.y,z=pos.getZ(i)+center.z,nx=Math.abs(nor.getX(i)),ny=Math.abs(nor.getY(i));let u,v;if(ny>.5){u=x;v=z;}else if(nx>.5){u=z;v=y;}else{u=x;v=y;}if(grain==='v')[u,v]=[v,u];uvs.push(u/tile,v/tile);}g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));}
 function B(parent,x0,x1,y0,y1,z0,z1,m,grain='h'){
  const w=(x1-x0)*I,h=(z1-z0)*I,d=(y1-y0)*I,g=new T.BoxGeometry(w,h,d),center=new T.Vector3((x0+x1)/2*I,(z0+z1)/2*I,-(y0+y1)/2*I);
  worldUV(g,center,grain,m.userData?.tile||WOOD_TILE);
  const o=new T.Mesh(g,m),origin=parent.userData.origin||new T.Vector3();
  o.position.set(center.x-origin.x,center.y-origin.y,center.z-origin.z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 // Many identical boxes (louver slats) merged into one mesh for speed on phones.
 function mergedBoxes(parent,boxes,m,grain='h'){const pos=[],nor=[],uv=[];for(const [x0,x1,y0,y1,z0,z1] of boxes){const g=new T.BoxGeometry((x1-x0)*I,(z1-z0)*I,(y1-y0)*I),c=new T.Vector3((x0+x1)/2*I,(z0+z1)/2*I,-(y0+y1)/2*I);worldUV(g,c,grain,m.userData?.tile||WOOD_TILE);g.translate(c.x,c.y,c.z);const n=g.toNonIndexed();pos.push(...n.attributes.position.array);nor.push(...n.attributes.normal.array);uv.push(...n.attributes.uv.array);g.dispose();n.dispose();}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const o=new T.Mesh(g,m);o.receiveShadow=true;parent.add(o);return o;}
 function pivotAt(parent,sx,sy,sz){const p=new T.Group();p.position.set(sx*I,sz*I,-sy*I);p.userData.origin=p.position.clone();parent.add(p);return p;}
 function unit(id,name,kind,front,side,extra={}){const group=new T.Group();root.add(group);
  const u={id,name,kind,group,angle:0,front:mat(front),side:mat(side),defaultFront:{...front},defaultSide:{...side},actions:[],interiors:[],lightNodes:[],finishable:true,...extra};
  u.sideSkin=u.side;u.members=[u];u.product=u;units.push(u);return u;}
 function act(u,node,type,travel,extra={}){const a={unit:u,node,type,travel,initial:node.position.clone(),open:false,value:0,...extra};actions.push(a);u.actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 // Warm-white LED: visible strip plus a small point light, switched by setLights.
 // Rev 7: LED strip lighting only — no point/spot lights (they left round hot-spots).
 // A strip is an emissive bar; its wash is an additive gradient on the lit surface.
 function led(u,x0,x1,y0,y1,z0,z1){const o=B(u.group,x0,x1,y0,y1,z0,z1,lightMaterial);o.castShadow=false;o.receiveShadow=false;(u.strips??=[]).push(o);return o;}
 const glowTex=canvasTexture(256,8,(c,w,h)=>{const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(255,214,150,0)');g.addColorStop(.55,'rgba(255,214,150,.5)');g.addColorStop(1,'rgba(255,236,200,1)');c.fillStyle=g;c.fillRect(0,0,w,h);});
 const glowMat=(rot,strength=1)=>{const t=glowTex?.clone();if(t){t.center.set(.5,.5);t.rotation=rot;t.needsUpdate=true;}return new T.MeshBasicMaterial({color:new T.Color('#ffe9cc').multiplyScalar(strength),map:t||null,transparent:true,opacity:glowTex?1:.5,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});};
 // rot: 0 brightest at +u end, PI at -u end, PI/2 at top, -PI/2 at bottom.
 function glow(u,orient,cx,cy,cz,w,h,rot,strength=1){const m=new T.Mesh(new T.PlaneGeometry(w*I,h*I),glowMat(rot,strength));m.position.set(cx*I,cz*I,-cy*I);
  if(orient==='floor')m.rotation.x=-Math.PI/2;else if(orient==='+x')m.rotation.y=Math.PI/2;else if(orient==='-x')m.rotation.y=-Math.PI/2;
  m.renderOrder=5;m.userData.glow=true;u.group.add(m);(u.glows??=[]).push(m);return m;}
 const glowF=(u,x0,x1,z0,z1,y,rot,k)=>glow(u,'front',(x0+x1)/2,y,(z0+z1)/2,x1-x0,z1-z0,rot,k);
 function polygon(f,material,shift=0,grain='h'){const n=new T.Vector3(...f.normal).normalize(),ax=Math.abs(n.y)<.8?new T.Vector3(0,1,0).cross(n).normalize():new T.Vector3(1,0,0),ay=n.clone().cross(ax).normalize(),loops=f.points.map(l=>l.map(p=>new T.Vector3(p[0],p[1]+shift,p[2]))),flat=loops.flat(),xy=flat.flatMap(p=>[p.dot(ax),p.dot(ay)]),holes=[];let count=loops[0].length;for(const l of loops.slice(1)){holes.push(count);count+=l.length;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(flat.flatMap(p=>p.toArray()),3));g.setIndex(earcut(xy,holes));g.computeVertexNormals();worldUV(g,new T.Vector3(),grain);const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;return m;}
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
 // Green mica wall panel stays on the wall behind and above the TV panel.
 B(panel.group,24.1,120,72.15,72.95,20,84,panel.front);
 // Rev 5: TV panel 3 in deep, flush with the tall unit and the ledge; a 1.5 in reveal on
 // the niche side only, with one vertical concealed strip from the console up to the louvers.
 const rectStart=panel.group.children.length;
 const box=B(panel.group,24.1,118.5,69.05,72.15,20,68,panel.front);box.userData.role='tv-panel-box';
 panel.depthInches=3;panel.revealInches=1.5;panel.revealSide='niche side (right)';
 led(panel,118.85,119.25,71.5,71.95,20.2,83.8);
 panel.concealedLight='One vertical warm-white strip on the niche side, console to louvers';
 glowF(panel,118.5,120,20,84,72.1,Math.PI);      // vertical wash beside the panel
 const rectDesign=new T.Group();rectDesign.name='Current panel';for(const o of panel.group.children.slice(rectStart))rectDesign.add(o);panel.group.add(rectDesign);

 // ---- Design preview (19 Nov): curvy double-layer panel, after the customer's reference ----
 // A 3 in second layer of the same matte green mica over the wall panel. Its left edge is a
 // flowing S-curve from the louvers (x 80 in) down to the console at the tall unit; a concealed
 // warm-white strip follows the curve and washes the base layer. Switch with setPanelDesign('current'|'curvyNiches').
 // Two curvy variants share the traced reference curve (IMG_0390), scaled so our TV sits where
 // the reference TV sits (ref TV px 515-900 x 405-690 → our x 43.45-100.55, z 28-60):
 //  (19 Nov: earlier curvy options 2 and 3 removed at the customer's request; the curve runs to the
 //   ceiling; above the reference TV top the photo's wall is stretched to our 60 in TV-top-to-ceiling.)
 const mapX=X=>43.45+(X-515)*.1483,mapZLow=Y=>28+(690-Y)*.1123,mapZCeil=Y=>Y>=405?mapZLow(Y):60+(405-Y)*(60/390);
 const tracedAll=[[15,893],[50,850],[100,800],[150,748],[191,718],[200,712],[250,688],[285,665],[300,652],[315,638],[330,618],[345,566],[360,528],[375,510],[390,499],[405,491],[420,484],[450,477],[480,474],[510,471],[540,468],[570,463],[600,456],[630,444],[660,422],[690,399],[720,385],[745,380]];
 const cornerX=X=>mapX(X)+(118.5-mapX(985))*Math.max(0,(X-850)/135);
 const glowSide=()=>{const m=glowMat(0,.95);m.side=T.DoubleSide;return m;};
 function makeCurvy(name,top,mapZ,traced,{backY=72.15,minX=24.1,ownBase=false}={}){
  const g=new T.Group();g.name=name;g.visible=false;panel.group.add(g);
  const curvePts=new T.SplineCurve(traced.map(([Y,X])=>new T.Vector2(Math.max(minX,mapX(X)),Math.max(20,Math.min(top,mapZ(Y)))))).getSpacedPoints(90);   // top → bottom
  curvePts[0].y=top;const endX=Math.max(minX,curvePts[curvePts.length-1].x);curvePts[curvePts.length-1].set(endX,20);
  const cornerPts=new T.SplineCurve([[762,850],[750,872],[735,905],[710,940],[680,965],[650,978],[620,985]].map(([Y,X])=>new T.Vector2(cornerX(X),Math.max(20,mapZ(Y))))).getSpacedPoints(30);  // bottom → up
  cornerPts[0].y=20;
  const shape=new T.Shape();shape.moveTo(endX*I,20*I);for(const q of cornerPts)shape.lineTo(q.x*I,q.y*I);shape.lineTo(118.5*I,top*I);for(const q of curvePts)shape.lineTo(q.x*I,q.y*I);
  if(top>84&&!ownBase)B(g,24.1,120,72.15,72.95,84,top,panel.front);   // base green panel continues to the ceiling
  const layer=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:3*I,bevelEnabled:false,curveSegments:4}),panel.front);layer.position.z=-backY*I;layer.castShadow=layer.receiveShadow=true;layer.userData.role='curvy-layer';g.add(layer);
  const ribbon=(pts,width,y,mat)=>{const pos=[],uv=[],idx=[],n0=pts.length-1;pts.forEach((q,k)=>{const a=pts[Math.max(0,k-1)],b=pts[Math.min(n0,k+1)],t=new T.Vector2(b.x-a.x,b.y-a.y).normalize(),n=new T.Vector2(t.y,-t.x);
    const o=q.clone().addScaledVector(n,width);o.x=Math.min(118.5,Math.max(minX,o.x));o.y=Math.min(top,Math.max(20,o.y));pos.push(q.x*I,q.y*I,-y*I,o.x*I,o.y*I,-y*I);uv.push(1,k/n0,0,k/n0);if(k)idx.push(2*k-2,2*k-1,2*k,2*k-1,2*k+1,2*k);});
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const m=new T.Mesh(geo,mat);m.renderOrder=5;g.add(m);return m;};
  for(const pts of [curvePts,cornerPts]){ribbon(pts,.35,backY-.25,lightMaterial);const gl=ribbon(pts,7,backY-.1,glowSide());gl.userData.glow=true;panel.glows.push(gl);}
  g.userData.layer=layer;g.userData.curveXAt=z=>{let best=curvePts[0];for(const q of curvePts)if(Math.abs(q.y-z)<Math.abs(best.y-z))best=q;return best.x;};
  return g;}
 // Option 2 (was Option 4, 19 Nov): customer asked to remove the tall glass display and run the green double-layer
 // paneling across the whole wall to the ceiling, with open rounded niches cut in like the reference.
 // Base panel is built out 8 in (front at y 64) so the niches have depth; curvy layer 3 in in front.
 const NB=64;
 const curvyNiches=makeCurvy('Option 2 · Curvy panel with open niches',120,mapZCeil,tracedAll,{backY:NB,minX:.1,ownBase:true});
 const roundRect=(path,x0,x1,z0,z1,r)=>{path.moveTo((x0+r)*I,z0*I);path.lineTo((x1-r)*I,z0*I);path.quadraticCurveTo(x1*I,z0*I,x1*I,(z0+r)*I);path.lineTo(x1*I,(z1-r)*I);path.quadraticCurveTo(x1*I,z1*I,(x1-r)*I,z1*I);path.lineTo((x0+r)*I,z1*I);path.quadraticCurveTo(x0*I,z1*I,x0*I,(z1-r)*I);path.lineTo(x0*I,(z0+r)*I);path.quadraticCurveTo(x0*I,z0*I,(x0+r)*I,z0*I);};
 // Niche sizes/positions follow the reference's four stacked niches, kept left of the curve.
 const niches=[[4,35,67.5,86,5],[4,29.5,50.5,64.5,4.5],[4,28.5,36.5,48.5,4.5],[4,21,22,34.5,4]];
 const baseShape=new T.Shape();baseShape.moveTo(.1*I,20*I);baseShape.lineTo(120*I,20*I);baseShape.lineTo(120*I,120*I);baseShape.lineTo(.1*I,120*I);baseShape.lineTo(.1*I,20*I);
 for(const [x0,x1,z0,z1,r] of niches){const h=new T.Path();roundRect(h,x0,x1,z0,z1,r);baseShape.holes.push(h);}
 const base=new T.Mesh(new T.ExtrudeGeometry(baseShape,{depth:(72.15-NB)*I,bevelEnabled:false,curveSegments:10}),panel.front);base.position.z=-72.15*I;base.castShadow=base.receiveShadow=true;base.userData.role='niche-base';curvyNiches.add(base);
 const backPanel=B(curvyNiches,.1,120,72.15,72.95,20,120,panel.front);
 for(const [x0,x1,z0,z1,r] of niches){const st=led(panel,x0+r*.6,x1-r*.6,NB+.4,NB+.9,z1-.45,z1-.05);curvyNiches.add(st);curvyNiches.add(glowF(panel,x0,x1,z0,z1,72.1,Math.PI/2,.45));}
 const bookCols=['#6b4a3a','#c9b79c','#2f4a44','#8a6d4e','#e4ddd0','#3d3a36'];let bi=0;
 for(let x=6;x<16;x+=1.15)B(curvyNiches,x,x+1,65,71.5,36.5,36.5+7+(bi%3),std(bookCols[bi++%6],.8));
 for(const [x,z,r,h,c] of [[26,67.5,1.8,6,'#e9e3d6'],[12,50.5,1.4,4.5,'#8a6a48'],[24,36.5,1.2,3.5,'#c9b48f'],[13,22,2,5,'#ece6da']]){const v=new T.Mesh(new T.CylinderGeometry(r*.7*I,r*I,h*I,20),std(c,.6));v.position.set(x*I,(z+h/2)*I,-68*I);v.castShadow=true;curvyNiches.add(v);}
 B(curvyNiches,17,24,70.6,71.1,50.5,58.5,std('#3b2a1d',.6));B(curvyNiches,17.6,23.4,70.4,70.6,51.1,57.9,std('#d9d4c8',.9));
 // Rounded left end of the console (it was part of the glass cabinet's rounded edge).
 const endShape=new T.Shape();endShape.moveTo(3.8*I,55.5*I);for(let k=1;k<=16;k++){const t=Math.PI*1.5-k/16*Math.PI/2;endShape.lineTo((3.8+3.7*Math.cos(t))*I,(63.7+8.2*Math.sin(t))*I);}endShape.lineTo(.1*I,72*I);endShape.lineTo(3.8*I,72*I);endShape.lineTo(3.8*I,55.5*I);
 const consoleEnd=new T.Mesh(new T.ExtrudeGeometry(endShape,{depth:12*I,bevelEnabled:false,curveSegments:8}),mat(wood));consoleEnd.rotation.x=-Math.PI/2;consoleEnd.position.y=8*I;consoleEnd.castShadow=consoleEnd.receiveShadow=true;curvyNiches.add(consoleEnd);
 curvyNiches.userData.nicheCount=niches.length;curvyNiches.userData.baseDepthInches=72.15-NB;
 rectDesign.name='Option 1 · Classic panel with ledge';
 panel.curveSource='Traced from customer reference IMG_0390';
 panel.designs={current:rectDesign,curvyNiches};panel.design='current';
 panel.designOptions=[{id:'current',label:'Option 1 · Classic',note:'Rectangular 3 in panel, wooden ledge, louvers full width'},{id:'curvyNiches',label:'Option 2 · Curvy with open niches',note:'Glass display removed; green double-layer paneling across the wall to the ceiling with lit rounded open niches; no ledge'}];

 const tv=new T.Group();panel.group.add(tv);tv.userData.origin=new T.Vector3();panel.tv=tv;
 B(tv,72-28.55,72+28.55,67.4,68.6,44-16.05,44+16.05,tvMaterial);B(tv,72-6,72+6,68.6,69.05,36,52,std('#222',.6));
 panel.tvNote='Illustrative 65-inch TV; actual TV size not specified.';

 // ---- 2. Wood mica decorative ledge with warm-white LED below ----
 const ledge=unit('ledge','Wooden mica display ledge','ledge',wood,wood);
 B(ledge.group,24.1,120,64,72.05,68,70,ledge.front);
 led(ledge,26,118,66.4,67,67.8,68);glowF(ledge,24.1,118.5,54,68,68.95,Math.PI/2,.8);   // wash down the TV panel
 const decor=[std('#e9e3d6',.7),std('#8a6a48',.6),std('#c9b48f',.5)];
 for(const [x,r,h,m] of [[38,1.6,6,0],[42,1.2,4,1],[100,1.8,7,2],[105,1.1,3.5,0]]){const v=new T.Mesh(new T.CylinderGeometry(r*.75*I,r*I,h*I,20),decor[m]);v.position.set(x*I,(70+h/2)*I,-68*I);v.castShadow=true;ledge.group.add(v);}
 ledge.decorNote='Small decoratives are illustrative.';

 // ---- 3. Fixed PVC louvers (header + side-wall return), 3D slats with cove LED ----
 // Rev 2: follows the customer's reference — individual vertical slats over a dark
 // backing, even grain, warm LED washing down from the ceiling line.
 const slatMap=slatTexture();
 const slatMat=new T.MeshStandardMaterial({color:slatMap?'#ffffff':LOUVER_COLOUR,map:slatMap,roughness:.72});slatMat.userData.compatColor=LOUVER_COLOUR;slatMat.userData.tile=.5;
 const gapMat=std('#241a16',.95);
 const louver=unit('louver','PVC louvers','louver',{name:'PVC louver',color:LOUVER_COLOUR},{name:'PVC louver',color:LOUVER_COLOUR},{finishable:false,fixed:true});
 louver.front=louver.side=louver.sideSkin=slatMat;
 const LP=2,LW=1.4;let slats=0;
 // Louvers are built in three runs so the middle run (above the TV panel, x 24.1-120) can be
 // removed for the curvy panel design, which goes up to the ceiling there (19 Nov).
 const louverMid=new T.Group();louverMid.name='Louvers above TV panel';louver.group.add(louverMid);louver.middle=louverMid;
 const louverLeft=new T.Group();louverLeft.name='Louvers above glass cabinet';louver.group.add(louverLeft);louver.left=louverLeft;
 B(louverLeft,.1,24.1,72.35,72.95,84,120,gapMat);B(louverMid,24.1,120,72.35,72.95,84,120,gapMat);B(louver.group,120,143.4,72.35,72.95,84,120,gapMat);
 const slatBoxes=[],midSlats=[],leftSlats=[];for(let x=.1+.3;x+LW<=143.4;x+=LP){const b=[x,x+LW,71.6,72.35,84.05,119.95];if(x>=24.1&&x+LW<=120)midSlats.push(b);else if(x+LW<=24.1)leftSlats.push(b);else if(x>=120)slatBoxes.push(b);}
 B(louver.group,143.4,144.05,1.05,72.35,84,120,gapMat);              // dark backing, side-wall return
 for(let y=1.05+.3;y+LW<=72.35;y+=LP)slatBoxes.push([142.65,143.4,y,y+LW,84.05,119.95]);
 mergedBoxes(louver.group,slatBoxes,slatMat);mergedBoxes(louverMid,midSlats,slatMat);mergedBoxes(louverLeft,leftSlats,slatMat);slats=slatBoxes.length+midSlats.length+leftSlats.length;
 louver.slatCount=slats;louver.slatPitchInches=LP;louver.slatWidthInches=LW;
 B(louverLeft,.5,24.1,71.15,71.45,119.45,119.75,lightMaterial).castShadow=false;B(louverMid,24.1,120,71.15,71.45,119.45,119.75,lightMaterial).castShadow=false;B(louver.group,120,142.2,71.15,71.45,119.45,119.75,lightMaterial).castShadow=false;B(louver.group,142.2,142.5,1.5,71.15,119.45,119.75,lightMaterial).castShadow=false;
 louverLeft.add(glowF(louver,.5,24.1,104,119.7,71.5,Math.PI/2,.42));louverMid.add(glowF(louver,24.1,120,104,119.7,71.5,Math.PI/2,.42));glowF(louver,120,142.6,104,119.7,71.5,Math.PI/2,.42);glow(louver,'-x',142.6,36.45,111.85,70.3,15.7,Math.PI/2,.42);
 louver.coveLight='Warm white, ceiling line';

 // ---- 4. Tall left unit: black tinted glass shutter, left hinge ----
 const tall=unit('tall-glass','Tall black-glass cabinet','glass',{name:'Black tinted glass',color:'#15181a'},wood,{finishable:false});
 const tg=tall.group;tg.userData.origin=new T.Vector3();
 B(tg,23.35,24.1,55.5,72,20,84,tall.side,'v');             // side toward TV (wood mica)
 B(tg,3.8,23.35,71.25,72,20,84,tall.side);                 // back
 B(tg,3.8,23.35,55.6,71.25,20,20.75,tall.side);B(tg,3.8,23.35,55.6,71.25,83.25,84,tall.side);
 for(const id of [44951,44953,44955,44957]){const m=polygon(face(id),tall.side,0,'v');tg.add(m);} // exact rounded edge
 // Rev 3: close the hollow left side (customer: wooden panel). Outer side from the end
 // of the rounded edge back to the wall, full height 8-84 in, plus inner carcass sides.
 B(tg,.1,.85,63.7,73,8,84,tall.side,'v');tall.leftSidePanel='Wooden mica, full height';
 B(tg,3.8,4.55,55.6,71.25,20.75,83.25,tall.side,'v');
 B(tg,.85,3.8,63.7,64.45,8,84,tall.side,'v');
 const cap=polygon(face(44039),tall.side);tg.add(cap);
 const bottomCap=polygon(face(44039),tall.side,-76*I);tg.add(bottomCap);   // same outline at 8 in
 const tallDoor=pivotAt(tg,3.8,55.5,52);B(tallDoor,3.85,24.05,54.8,55.5,20.1,83.9,blackGlass);
 const ta=act(tall,tallDoor,'hinge',-Math.PI*.47);ta.confirmedHinge='left';tall.hingeEdge='left';
 tall.interiorNote='Inside arrangement not specified yet; shown empty.';
 // Rev 7: vertical LED strips inside the tall glass cabinet, on both inner sides at the front.
 led(tall,4.55,4.85,56.2,56.9,21,83);led(tall,23.05,23.35,56.2,56.9,21,83);
 glowF(tall,4.55,13.95,21,83,71.2,Math.PI,.7);glowF(tall,13.95,23.35,21,83,71.2,0,.7);
 glow(tall,'+x',4.6,64,52,14.3,62,Math.PI,.6);glow(tall,'-x',23.3,64,52,14.3,62,0,.6);
 tall.interiorLight='Vertical warm-white LED strips, both sides';
 // Rev 8: transparent glass shelves, evenly spaced (count not specified — 4 shown).
 const clear=new T.MeshPhysicalMaterial({color:'#dfeeea',transparent:true,opacity:.28,roughness:.04,metalness:0,clearcoat:1,side:T.DoubleSide,depthWrite:false});clear.userData.compatColor='#cfe0dc';
 const edge=new T.MeshStandardMaterial({color:'#a9c9c0',transparent:true,opacity:.7,roughness:.1});
 tall.glassShelves=[];for(const z of [33.25,45.75,58.25,70.75]){tall.glassShelves.push(B(tg,4.95,22.95,57.2,71.2,z,z+.25,clear));B(tg,4.95,22.95,57.1,57.2,z,z+.25,edge);}
 tall.shelfCount=4;tall.shelfMaterial='Transparent glass';

 // ---- 5. Floating lower console: five wood shutters + one lift-up glass shutter ----
 const con=unit('console','Floating lower console','console',wood,wood);
 const cg=con.group;cg.userData.origin=new T.Vector3();
 B(cg,3.8,120,56,72,19.25,20,con.side);B(cg,3.8,120,56,72,8,8.75,con.side);B(cg,3.8,120,71.25,72,8.75,19.25,carcass);
 B(cg,119.25,120,56,72,8.75,19.25,con.side);
 B(cg,3.8,4.55,56,71.25,8.75,19.25,con.side);   // rev 3: left end of console
 for(const x of [24.1,44.3,64.5,84.8,105])B(cg,x-.35,x+.35,56.2,71.25,8.75,19.25,carcass);
 const cells=[[3.8,24.1,'left'],[24.1,44.3,'left'],[44.3,64.5,'left'],[64.5,84.8,'lift'],[84.8,105,'right'],[105,120,'right']];
 con.hinges=[];
 for(const [x0,x1,how] of cells){
  if(how==='lift'){const p=pivotAt(cg,x0,55.5,20);B(p,x0+.1,x1-.1,54.8,55.5,8.1,19.9,blackGlass);const a=act(con,p,'lift',-1.35);a.confirmed='lifts upward';con.glassLift=a;continue;}
  const left=how==='left',p=pivotAt(cg,left?x0:x1,55.5,14);B(p,x0+.1,x1-.1,54.8,55.5,8.1,19.9,con.front);
  const a=act(con,p,'hinge',(left?-1:1)*Math.PI*.47);a.hingeSide=how;a.hingeSideApproximate=true;con.hinges.push(how);}
 con.woodShutterCount=5;con.floatHeightInches=8;
 led(con,5,118,57,57.6,7.6,8);glow(con,'floor',61.9,58,.06,116,28,Math.PI/2,.75);glowF(con,3.8,120,0,8,72.9,Math.PI/2,.6);   // even glow under the floating console
 con.underGlow='Warm white';

 // ---- 6. Awards niche: green wallpaper walls, two L-shaped wood mica shelves ----
 const floral=floralTexture();
 const paper=new T.MeshStandardMaterial({color:floral?'#ffffff':GREEN_MICA,map:floral,roughness:.88});paper.userData.compatColor=GREEN_MICA;paper.userData.tile=.55;
 const niche=unit('awards-niche','Awards display niche','niche',{name:'Green floral mica',color:GREEN_MICA},wood,{finishable:false});niche.angle=-Math.PI/2+.35;
 const ng=niche.group;ng.userData.origin=new T.Vector3();
 B(ng,120,144.1,72.3,73,20,84,paper);B(ng,143.4,144.1,37,73,20,84,paper);B(ng,120,144.1,37,37.7,20,84,paper);niche.background='Green floral mica';
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
 // Rev 9: cleaning animation. The robot leaves through the open slot under the console,
 // cleans the floor in front of the TV unit in back-and-forth rows, and returns to its dock.
 const brush=new T.Mesh(new T.CylinderGeometry(2.2*I,2.2*I,.15*I,6),std('#6b6f73',.6));brush.position.set(-5.5*I,.3*I,5.5*I);robot.add(brush);
 // Rev 10: runs by itself in a loop — rests in the bay 3-4 s, then a 6 s trip out and back.
 // Each trip picks a new spot under or in front of the console (often under the black glass
 // lift-up shutter at x 64.5-84.8 in), cleans it with a short zigzag, and returns.
 const dockP=new T.Vector3(131*I,0,-64*I),P=(x,y)=>new T.Vector3(x*I,0,-y*I);
 const spots=[[74,61],[70,50],[80,47],[40,60],[95,52],[55,46],[28,49],[88,62],[66,58]];
 const cleaner={active:false,waiting:true,timer:2,trips:0,tripSeconds:6,distance:0,route:[],lens:[],total:0,lastSpot:-1,
  plan(){let k;do{k=Math.floor(Math.random()*spots.length);}while(k===this.lastSpot);this.lastSpot=k;
   const [x,y]=spots[k],jx=(Math.random()-.5)*6,jy=(Math.random()-.5)*3,tx=x+jx,ty=y+jy,side=Math.random()<.5?1:-1;
   const out=[dockP,P(116,64),P(tx,64),P(tx,ty)],clean=[P(tx+5*side,ty-2),P(tx-5*side,ty-4),P(tx+5*side,ty-6),P(tx,ty-3)];
   const pts=[...out,...clean,P(tx,64),P(116,64),dockP.clone()];this.route=pts;this.spot=[tx,ty];this.lens=[];this.total=0;
   for(let n=1;n<pts.length;n++){const l=pts[n].distanceTo(pts[n-1]);this.lens.push(l);this.total+=l;}this.speed=this.total/this.tripSeconds;this.distance=0;},
  update(dt){if(this.paused)return;
   if(this.waiting){this.timer-=dt;if(this.timer<=0){this.waiting=false;this.active=true;this.plan();}return;}
   this.distance=Math.min(this.total,this.distance+this.speed*dt);let d=this.distance,k=0;while(k<this.lens.length-1&&d>this.lens[k]){d-=this.lens[k];k++;}
   const a=this.route[k],b=this.route[k+1],t=this.lens[k]?d/this.lens[k]:1;robot.position.lerpVectors(a,b,t);
   if(this.lens[k]>1e-4){const target=Math.atan2(b.x-a.x,b.z-a.z);let diff=((target-robot.rotation.y+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;robot.rotation.y+=diff*Math.min(1,dt*10);}
   brush.rotation.y+=dt*18;
   if(this.distance>=this.total){this.active=false;this.waiting=true;this.trips++;this.timer=3+Math.random();robot.position.copy(dockP);robot.rotation.y=-Math.PI/2;this.onTrip?.(this.trips);}}};
 robot.rotation.y=-Math.PI/2;bay.cleaner=cleaner;bay.robot=robot;
 bay.robotDiameterInches=16;bay.exit='Open slot facing the TV area, under the floating console';bay.fixedShutter=true;

 // ---- 8. Tall right block: green matte front, concealed light strip, CNC pooja shutters ----
 const pooja=unit('pooja','Pooja unit with CNC shutters','pooja',green,wood,{finishable:false});pooja.angle=-Math.PI/2;
 const pg=pooja.group;pg.userData.origin=new T.Vector3();
 // Rev 7: the front faces the foyer — green grass mat with a stainless-steel CNC scenery panel.
 // Rev 8: brighter artificial-grass look — dense blades in mixed greens over a darker base.
 const grassMap=canvasTexture(512,512,(c,w,h)=>{c.fillStyle='#3f7a26';c.fillRect(0,0,w,h);const cols=['#3a7322','#4f8f2c','#62a635','#76b941','#8ccb52','#a3d866','#5e9a30'];
  for(let pass=0;pass<3;pass++)for(let i=0;i<16000;i++){const x=Math.random()*w,y=Math.random()*h,l=5+Math.random()*(pass===2?9:7),bend=(Math.random()-.5)*4;c.strokeStyle=cols[(Math.random()*cols.length)|0];c.globalAlpha=pass===0?.9:pass===1?.85:.7;c.lineWidth=pass===2?1:1.4;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+bend*.5,y-l*.6,x+bend,y-l);c.stroke();}
  c.globalAlpha=.5;c.fillStyle='#c7ec8a';for(let i=0;i<1800;i++)c.fillRect(Math.random()*w,Math.random()*h,1,1.5);c.globalAlpha=1;});
 const grass=new T.MeshStandardMaterial({color:grassMap?'#ffffff':'#5f9c35',map:grassMap,bumpMap:grassMap,bumpScale:2,roughness:.95});grass.userData.compatColor='#5f9c35';grass.userData.tile=.18;
 pooja.front=grass;pooja.foyerFace='Green grass mat';
 B(pg,124,144.1,1,1.75,0,84,grass);
 const artMap=canvasTexture(256,704,(c,w,h)=>{c.fillStyle='#fff';c.strokeStyle='#fff';c.lineCap='round';
  c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=8)c.lineTo(x,h-60-Math.sin(x/40)*18-Math.sin(x/17)*6);c.lineTo(w,h);c.fill();          // hills
  c.lineWidth=16;c.beginPath();c.moveTo(w*.5,h-70);c.bezierCurveTo(w*.48,h*.65,w*.53,h*.5,w*.5,h*.38);c.stroke();                       // trunk
  const branch=(x,y,a,len,wd)=>{if(len<10)return;const x2=x+Math.cos(a)*len,y2=y-Math.sin(a)*len;c.lineWidth=wd;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();branch(x2,y2,a+.45,len*.7,wd*.68);branch(x2,y2,a-.42,len*.72,wd*.68);};
  branch(w*.5,h*.38,Math.PI/2,95,11);
  for(let i=0;i<70;i++){const a=Math.random()*Math.PI*2,r=20+Math.random()*95;c.beginPath();c.ellipse(w*.5+Math.cos(a)*r,h*.22+Math.sin(a)*r*.75,6,3,a,0,Math.PI*2);c.fill();}
  c.lineWidth=3;for(const [x,y,s] of [[40,120,1],[70,95,.8],[200,140,.9],[215,110,.7]]){c.beginPath();c.moveTo(x-10*s,y);c.quadraticCurveTo(x-4*s,y-7*s,x,y);c.quadraticCurveTo(x+4*s,y-7*s,x+10*s,y);c.stroke();}});
 const steel=new T.MeshStandardMaterial({color:'#d4d8dc',metalness:.92,roughness:.28,alphaMap:artMap,alphaTest:.5,transparent:false,side:T.DoubleSide});steel.userData.compatColor='#c9cdd1';
 // Rev 8: pebble box at the foot of the foyer face — full pooja width (24 in), 15 in high.
 // Depth not given: 8 in shown. Box in wooden mica (finish not given).
 const boxMat=pooja.side;
 B(pg,120,144.1,-8,-7.25,0,15,boxMat);B(pg,120,120.75,-7.25,1,0,15,boxMat);B(pg,143.35,144.1,-7.25,1,0,15,boxMat);
 B(pg,120.75,143.35,-7.25,1,0,13.4,std('#3b3732',1));                 // fill below the pebbles
 { const pos=[],nor=[],col=[],tones=['#e9e6df','#d8d3c9','#bdb7ab','#9e978b','#f2f0ea','#cfc6b6'];let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
   for(let layer=0;layer<2;layer++)for(let x=121.6;x<142.6;x+=1.35)for(let y=-6.5;y<0;y+=1.35){const g=new T.SphereGeometry(.68*I,9,6),sx=.85+rnd()*.5,sz=.75+rnd()*.5;g.scale(sx,.5+rnd()*.15,sz);g.rotateY(rnd()*Math.PI);
     g.translate((x+(rnd()-.5)*.8)*I,(13.6+layer*.6+rnd()*.3)*I,-(y+(rnd()-.5)*.8)*I);const n=g.toNonIndexed(),c=new T.Color(tones[(rnd()*tones.length)|0]);pos.push(...n.attributes.position.array);nor.push(...n.attributes.normal.array);for(let k=0;k<n.attributes.position.count;k++)col.push(c.r,c.g,c.b);g.dispose();n.dispose();}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));
   const pm=new T.MeshStandardMaterial({vertexColors:true,roughness:.55});pm.userData.compatColor='#d6d0c4';const pebbles=new T.Mesh(g,pm);pebbles.castShadow=pebbles.receiveShadow=true;pg.add(pebbles);pooja.pebbleBox={widthInches:24.1,heightInches:15,depthInches:8,finish:'Wooden mica (provisional)',pebbles:'White/grey river pebbles (illustrative)'};}
 if(artMap){const art=new T.Mesh(new T.PlaneGeometry(15*I,41.25*I),steel);art.position.set(134*I,46*I,-.9*I);art.castShadow=true;pg.add(art);pooja.foyerArt='Stainless-steel CNC-cut scenery panel (illustrative)';}
 B(pg,120,124,0,.75,0,84,pooja.side,'v');                   // 4 in front strip, wood mica
 led(pooja,124.05,124.35,.8,1,2,82);glow(pooja,'front',127,.95,42,6,80,Math.PI,.4);   // concealed vertical strip light
 B(pg,120.75,143.4,1.75,37,0,.75,carcass);B(pg,120.75,143.4,1.75,37,83.25,84,carcass);B(pg,143.4,144.1,1.75,37,0,84,carcass);B(pg,120.75,143.4,36.25,37,.75,83.25,carcass);
 B(pg,121,143,10,28,44,44.75,carcass);
 led(pooja,121,143,2.6,3.2,82.3,82.9);glow(pooja,'-x',143.35,19,64,34,38,Math.PI/2,.7);   // strip inside the pooja top
 const doorTex=n=>{const t=new T.TextureLoader().load('./pooja-door-'+n+'.jpg');t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.userData.shared=true;return t;};
 const doorEdge=pooja.side;pooja.doors=[];
 for(const [y0,y1,hingeY,img,sign] of [[0,18.5,0,'right',1],[18.5,37,37,'left',-1]]){
  const p=pivotAt(pg,120,hingeY,42);B(p,119.25,120,y0+.06,y1-.06,.4,83.6,doorEdge,'v');
  const face=new T.MeshStandardMaterial({map:doorTex(img),roughness:.75});face.userData.compatColor=DEFAULT_FINISH;
  const plane=new T.Mesh(new T.PlaneGeometry((y1-y0-.12)*I,83.2*I),face);plane.rotation.y=-Math.PI/2;
  plane.position.set(119.24*I-p.position.x,42*I-p.position.y,-(y0+y1)/2*I-p.position.z);p.add(plane);
  const a=act(pooja,p,'hinge',sign*Math.PI*.47);a.opensToward='TV area';pooja.doors.push(p);}
 pooja.doorCount=2;pooja.carving='CNC per customer reference';pooja.doorFinish='Wooden mica (customer sample) with CNC cut pattern';pooja.frontStripLight='Concealed strip light';

 // ---- Reference colours: every extracted source face ----
 for(const f of exactLayout.sourceFaces){const m=polygon(f,new T.MeshStandardMaterial({color:f.color,side:T.DoubleSide,roughness:1}));m.castShadow=false;m.userData.sourceFace=f.id;referenceRoot.add(m);sourceMeshes.push(m);}
 for(const u of units)u.group.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 let reference=false,lightsOn=true;
 return {robot:bay.cleaner,root,architecture,units,products:units,actions,sourceMeshes,exactLayout,lights,
 setReference(on){reference=on;referenceRoot.visible=on;for(const u of units)u.group.visible=!on;architecture.visible=!on;},
 setPanelDesign(name){const p=units.find(u=>u.id==='tv-panel');if(!p.designs[name])return;p.design=name;for(const [k,g] of Object.entries(p.designs))g.visible=k===name;const ledgeWash=units.find(u=>u.id==='ledge').glows[0];ledgeWash.userData.hiddenByDesign=name!=='current';ledgeWash.visible=name==='current'&&lightsOn;units.find(u=>u.id==='ledge').group.visible=name==='current';const lv=units.find(u=>u.id==='louver');lv.middle.visible=name==='current';lv.left.visible=name!=='curvyNiches';units.find(u=>u.id==='tall-glass').group.visible=name!=='curvyNiches';p.tv.position.z=name==='curvyNiches'?(72.15-64)*I:0;},
 setLights(on){lightsOn=on;for(const u of units)for(const g of u.glows||[])g.visible=on&&!g.userData.hiddenByDesign;lightMaterial.color.set(on?'#ffe2a6':'#a4a39c');},
 update(dt){bay.cleaner.update(dt);for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='hinge')a.node.rotation.y=a.travel*a.value;else if(a.type==='lift')a.node.rotation.x=a.travel*a.value;}}
 };
}
