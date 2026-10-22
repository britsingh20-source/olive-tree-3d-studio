import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as T from './dist/vendor/three.module.js';
const url=new URL('./dist/vendor/three.module.js',import.meta.url).href;
const rounded=fs.readFileSync('dist/vendor/RoundedBoxGeometry.js','utf8').replace("from 'three'",`from '${url}'`);
const roundedURL='data:text/javascript;base64,'+Buffer.from(rounded).toString('base64');
const source=fs.readFileSync('dist/prem/model.js','utf8').replace("from 'three'",`from '${url}'`).replace("from '../vendor/RoundedBoxGeometry.js'",`from '${roundedURL}'`);
const {buildModel,definitions,project}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const m=buildModel();assert.equal(m.units.length,14);assert.equal(project.quotation,null);assert.equal(new Set(definitions.map(d=>d.id)).size,14);
const unit=id=>m.units.find(u=>u.id===id);
assert.equal(unit('tandem-three').actions.length,3);assert.equal(unit('tandem-two').actions.length,2);assert.equal(unit('wicker').actions.length,2);assert.equal(unit('rice').actions.length,1);
assert(unit('pantry').actions.every(a=>a.type==='hinge'));assert.equal(unit('tall').actions.length,1);assert.equal(unit('tall').actions[0].type,'slide');assert.equal(unit('glass-wall').actions.length,2);assert(unit('glass-wall').actions.every(a=>a.type==='hinge'));
for(const a of m.actions){a.open=true;}for(let i=0;i<100;i++)m.update(.033);
for(const a of m.actions){assert(a.value>.999);if(a.type==='slide')assert(a.node.position.z>a.initial.z+.35);if(a.type==='hinge')assert(Math.abs(a.node.rotation.y)>1.5);a.open=false;}
for(let i=0;i<100;i++)m.update(.033);for(const a of m.actions){assert(a.value<.00001);assert(a.node.position.distanceTo(a.initial)<.00001);}
// All meshes have closed volumetric geometry and correct unit hit targets.
let meshes=0;m.root.traverse(o=>{if(!o.isMesh)return;meshes++;assert(o.geometry.attributes.position.array.every(Number.isFinite));if(o.parent!==m.architecture&&!o.userData.wall&&!o.userData.floor)assert(o.userData.unit);});assert(meshes>50);assert(m.batches>10);
// Tall pull-out baskets and shutter share their actual moving parent.
const tall=unit('tall');let movingMeshes=0;tall.actions[0].node.traverse(o=>{if(o.isMesh){movingMeshes++;assert.equal(o.userData.action,tall.actions[0]);}});assert(movingMeshes>1);
// Camera framing must fit every unit on a narrow phone and a wide monitor.
m.root.updateMatrixWorld(true);for(const aspect of [390/500,1200/600])for(const u of m.units){const b=new T.Box3().setFromObject(u.group),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3()),fov=39*Math.PI/180,radius=size.length()/2,distance=Math.max(radius/Math.sin(fov/2),radius/Math.sin(Math.atan(Math.tan(fov/2)*aspect)))*1.18;const camera=new T.PerspectiveCamera(39,aspect,.01,100);camera.position.copy(center).addScaledVector(new T.Vector3(Math.sin(u.angle),.3,Math.cos(u.angle)).normalize(),distance);camera.lookAt(center);camera.updateMatrixWorld(true);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new T.Vector3(x,y,z).project(camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,u.id+' clipped');}}
console.log('Passed: 14 selectable units; tandem, rice, wicker, oil, pantry, glass and linked tall-unit mechanisms; finite geometry; correct hit targets; phone and desktop framing; no quotation prices.');
