import assert from 'node:assert/strict';
import fs from 'node:fs';
import {register} from 'node:module';
const vendor=new URL('./dist/vendor/three.module.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,next){if(s==='three')return{url:${JSON.stringify(vendor)},shortCircuit:true};return next(s,c);}`),import.meta.url);
const T=await import(vendor);
const {buildModel,exactLayout}=await import('./dist/venki-new-unit/model.js');
const m=buildModel(),get=id=>m.units.find(u=>u.id===id);
assert.equal(m.sourceMeshes.length,50);
for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),p=mesh.geometry.attributes.position;assert.equal(p.count,f.points.flat().length);for(let i=0;i<p.count;i++)assert(new T.Vector3().fromBufferAttribute(p,i).distanceTo(new T.Vector3(...f.points.flat()[i]))<1e-6);}
const sourceBox=new T.Box3().setFromObject(m.sourceMeshes[0].parent);const size=sourceBox.getSize(new T.Vector3());for(const [i,w] of [132,84,24].entries())assert(Math.abs(size.getComponent(i)-w*.0254)<1e-6);
for(const id of ['cabinet-left','cabinet-right']){const u=get(id);assert.equal(u.shelfCount,4);assert.equal(u.doorCount,2);assert.equal(u.actions.length,2);const ys=u.interiors[0].children.map(o=>o.position.y);for(let i=2;i<4;i++)assert(Math.abs((ys[i]-ys[i-1])-(ys[1]-ys[0]))<1e-8);assert.equal(u.front.color.getHexString(),'c6b69f');assert.equal(u.handles,'Handleless');}
for(const id of ['fixed-front','surround','table'])assert.equal(get(id).actions.length,0);
assert.equal(get('surround').compartmentCount,4);const side=get('side-shutter');assert.equal(side.rodCount,1);assert.equal(side.shelfCount,0);assert.equal(side.internalDrawerCount,0);assert.equal(side.handles,'Handleless');assert.equal(side.hingeEdge,'rear');assert.equal(side.swingDirection,'inward toward mirror');
const mirror=get('mirror');assert.equal(mirror.lightColour,'Warm white');assert.equal(mirror.lightControl,'Touch sensor');assert.equal(mirror.actions[0].type,'light');
// Verify the entire inward sweep clears the mirror and open compartment body.
const sideAction=side.actions[0],mirrorPane=mirror.actions[0].node;let clearance=Infinity;
for(let n=0;n<=90;n++){sideAction.node.rotation.y=n*Math.PI/180;m.root.updateMatrixWorld(true);const doorBox=new T.Box3().setFromObject(side.sideDoor),mirrorBox=new T.Box3().setFromObject(mirrorPane);assert(!doorBox.intersectsBox(mirrorBox),'side shutter intersects mirror at '+n+' degrees');clearance=Math.min(clearance,doorBox.min.z-mirrorBox.max.z);assert(doorBox.max.x<39*.0254,'side shutter crosses open compartment at '+n+' degrees');}
sideAction.node.rotation.y=0;for(const a of m.actions)a.open=true;for(let i=0;i<180;i++)m.update(1/60);assert(Math.abs(sideAction.node.rotation.y-Math.PI/2)<1e-5);assert(get('drawer').actions[0].node.position.z>.349);assert(get('cabinet-left').interiors[0].visible);assert(side.interiors[0].visible);
for(const a of m.actions)a.open=false;for(let i=0;i<180;i++)m.update(1/60);assert(Math.abs(sideAction.node.rotation.y)<1e-5);assert(!side.interiors[0].visible);assert(!mirror.touchLight.lightGroup.visible);mirror.touchLight.open=true;m.update(1/60);assert(mirror.touchLight.lightGroup.visible);
m.setReference(true);assert(m.sourceMeshes.every(mesh=>mesh.parent.visible));assert(m.units.every(u=>!u.group.visible));m.setReference(false);assert(m.units.every(u=>u.group.visible));
// A stage resize must update projection only, never call fit or reset a camera.
const code=fs.readFileSync('dist/venki-new-unit/studio.js','utf8'),resize=code.slice(code.indexOf('function resize()'),code.indexOf('async function start()'));let fitted=0,sized=0;const fakeCam={fov:40,aspect:1,position:{x:1,y:2,z:3},updateProjectionMatrix(){}};const run=new Function('stage','renderer','camera','window','fit',"let lastStageSize='';"+resize+';return resize;')({clientWidth:1000,clientHeight:600},{capabilities:{maxTextureSize:8192},setPixelRatio(){},setSize(){sized++;}},fakeCam,{devicePixelRatio:1},()=>fitted++);run();run();assert.equal(sized,1);assert.equal(fitted,0);assert.deepEqual(fakeCam.position,{x:1,y:2,z:3});
console.log(JSON.stringify({sourceFaces:50,sourceBoundsInches:[132,24,84],cabinets:2,shelvesPerCabinet:4,mirrorSweepMinimumZClearanceMillimetres:Math.round(clearance*1000),actions:m.actions.length,checks:'source loops/bounds, even shelves, fixed units, hinge sweep clearance, open/close, mirror toggle, reference mode, no resize recenter'}));
