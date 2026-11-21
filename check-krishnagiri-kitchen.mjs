import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from './dist/vendor/three.module.js';
const vendor=new URL('./dist/vendor/three.module.js',import.meta.url).href;
const rounded=fs.readFileSync('dist/vendor/RoundedBoxGeometry.js','utf8').replace("from 'three'",`from '${vendor}'`),roundedURL='data:text/javascript;base64,'+Buffer.from(rounded).toString('base64');
const layoutURL=new URL('./dist/krishnagiri-kitchen/exact-layout.js',import.meta.url).href;
const source=fs.readFileSync('dist/krishnagiri-kitchen/model.js','utf8').replace("from 'three'",`from '${vendor}'`).replace("from '../vendor/RoundedBoxGeometry.js'",`from '${roundedURL}'`).replace("from './exact-layout.js'",`from '${layoutURL}'`);
const {buildModel,exactLayout,DEFAULT_FINISH}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const m=buildModel(),unit=id=>m.units.find(u=>u.id===id);
assert.equal(DEFAULT_FINISH,'#7fb3ad');assert.equal(m.units.length,13);assert.equal(exactLayout.sourceFaces.length,33);
// every source face rendered exactly once, at its measured position
assert.equal(new Set(m.sourceMeshes.map(o=>o.userData.sourceFace)).size,33);assert.equal(m.sourceMeshes.length,33);
m.root.updateMatrixWorld(true);for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),pts=f.points.flat();for(let i=0;i<pts.length;i++){const p=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i).applyMatrix4(mesh.matrixWorld);assert(p.distanceTo(new T.Vector3(...pts[i]))<1e-6,'Source face moved: '+f.id);}}
// confirmed mapping (Bright, 2026-11-21)
const map={'shelves-back-1':'#a56348','shelves-back-2':'#a56348','shelves-side':'#a56348',cutlery:'#ffb299',thali:'#ffd562',oil:'#5a7a43',corner:'#65ffff',rice:'#3e5781',wicker:'#cc99ff','glass-back':'#4d6fb2','glass-side':'#4d6fb2','wall-normal':'#ff007f'};
for(const [id,c] of Object.entries(map))assert.equal(unit(id).ref,c,id);
assert.equal(unit('wicker').actions.length,2);assert(unit('wicker').actions.every(a=>a.type==='slide'),'wicker baskets slide; no shutter');assert.equal(unit('open-box').actions.length,0);
assert.equal(unit('corner').actions.length,1);{const c=unit('corner').actions[0];assert.equal(c.hingeSide,'right');assert(c.node.position.x>0,'S-corner hinge on the corner (right) side');assert(c.travel>0,'opens from the left edge toward the room');}assert.equal(unit('corner').actions[0].cornerRacks.length,2);
for(const id of ['cutlery','thali','oil','rice'])assert(unit(id).actions.length===1&&unit(id).actions[0].type==='slide',id);
for(const id of ['glass-back','glass-side'])assert.equal(unit(id).actions.length,2);
assert(m.lightNodes.some(n=>n.isLight),'concealed lights present');for(const id of ['glass-back','glass-side']){let strips=0,lamps=0;unit(id).group.traverse(o=>{if(o.userData.led)strips++;if(o.isLight)lamps++;});assert.equal(strips,2,id+' one top concealed strip per glass bay only');assert.equal(lamps,2);}
{const ends=m.sourceMeshes.filter(o=>[42991,42898].includes(o.userData.sourceFace));assert.equal(ends.length,2);for(const e of ends){assert(e.material.map,'marked end panels are wooden mica');assert(Math.abs(e.material.map.rotation-Math.PI/2)<1e-9,'end panel grain runs vertically');}}
m.root.traverse(o=>{if(o.isLight)assert(o.isRectAreaLight,'LED surface lights only — no spot/point lights');});
{let rattan=0;unit('wicker').group.traverse(o=>{if(o.isMesh&&o.material.map&&o.material.color.getHexString()==='ffffff'&&o.material.roughness===.7)rattan++;});assert(rattan>=10,'woven rattan basket bodies');}
const base=m.products.find(p=>p.id==='base-cabinet');assert.equal(base.members.length,9);assert.equal(m.products.length,5);
m.update(.033);assert(unit('wicker').interiors.every(p=>p.visible));
for(const a of m.actions)a.open=true;for(let i=0;i<100;i++)m.update(.033);assert(unit('corner').actions[0].cornerRacks.every(p=>p.position.z>.3));
for(const a of m.actions){assert(a.value>.999);a.open=false;}for(let i=0;i<100;i++)m.update(.033);for(const a of m.actions)assert(a.node.position.distanceTo(a.initial)<1e-5);
m.setLights(false);assert(m.lightNodes.filter(n=>n.isLight).every(l=>!l.visible));m.setLights(true);assert(m.lightNodes.filter(n=>n.isLight).every(l=>l.visible));
m.setReference(true);let ref=0;m.root.traverse(o=>{if(o.isMesh&&o.visible){assert(o.userData.sourceFace!==undefined);ref++;}});assert.equal(ref,33);m.setReference(false);m.update(.033);
// open S-corner door must not intrude into the side-wall run
for(const aspect of [390/500,1200/600])for(const u of m.products){const b=new T.Box3().setFromObject(u.group),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3()),fov=40*Math.PI/180,r=size.length()/2,distance=Math.max(r/Math.sin(fov/2),r/Math.sin(Math.atan(Math.tan(fov/2)*aspect)))*1.18,camera=new T.PerspectiveCamera(40,aspect,.01,300);camera.position.copy(center).addScaledVector(new T.Vector3(Math.sin(u.angle+.65),.3,Math.cos(u.angle+.65)).normalize(),distance);camera.lookAt(center);camera.updateMatrixWorld(true);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new T.Vector3(x,y,z).project(camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,u.id+' clipped');}}
const studio=fs.readFileSync('dist/krishnagiri-kitchen/studio.js','utf8');
assert(studio.includes('controls.enableDamping=false'));assert(!/renderer\.setSize\(w,h\);if\(model\)fit/.test(studio)&&studio.includes('if(model&&!userMoved&&!selected'),'resize reframes only the untouched opening view');assert(!/\n startKitchenTour\(\);\n/.test(studio),'tour must not auto-start');assert(studio.includes('down.moved'));
const {createKitchenTour}=await import('./dist/krishnagiri-kitchen/tour.js');let completed=0,events=0;const visits=new Set(),opens=new Set();
const tour=createKitchenTour({units:m.units,onOverview(){events++;},onVisit(u){visits.add(u);events++;},onAction(a,o){if(o)opens.add(a);events++;},onStatus(){events++;},onComplete(){completed++;}});
tour.start();tour.update(4);tour.stop();const after=events;tour.update(1000);assert.equal(events,after);tour.start();for(let i=0;i<2000&&tour.active;i++)tour.update(.5);assert.equal(completed,1);assert.equal(visits.size,m.units.length);assert.equal(opens.size,m.actions.length);
console.log('Passed: 33 exact SKP faces, 13 sections, 5 products, confirmed colour mapping, shutter-free wicker/open box, S-corner trays, glass lights toggle, no damping/auto-tour/resize reframe, tour stop/complete.');
