import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from './dist/vendor/three.module.js';
const url=new URL('./dist/vendor/three.module.js',import.meta.url).href;
const rounded=fs.readFileSync('dist/vendor/RoundedBoxGeometry.js','utf8').replace("from 'three'",`from '${url}'`),roundedURL='data:text/javascript;base64,'+Buffer.from(rounded).toString('base64');
const layoutURL=new URL('./dist/prem/exact-layout.js',import.meta.url).href;
const source=fs.readFileSync('dist/prem/model.js','utf8').replace("from 'three'",`from '${url}'`).replace("from '../vendor/RoundedBoxGeometry.js'",`from '${roundedURL}'`).replace("from './exact-layout.js'",`from '${layoutURL}'`);
const {buildModel,definitions,exactLayout,project}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const m=buildModel();assert.equal(m.units.length,20);assert.equal(project.quotation,null);assert.equal(new Set(definitions.map(d=>d.id)).size,20);
assert.equal(exactLayout.validation.sourceVertexCount,113);assert.equal(exactLayout.validation.sourceEdgeCount,174);assert.equal(exactLayout.validation.sourceFaceCount,63);
// Every source polygon is present once. Compare closed world vertices to the
// original SKP coordinates after only the documented axis/unit conversion.
assert.equal(m.sourceMeshes.length,63);assert.equal(new Set(m.sourceMeshes.map(o=>o.userData.sourceFace)).size,63);m.root.updateMatrixWorld(true);
for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),original=f.points.flat();assert.equal(mesh.geometry.attributes.position.count,original.length);for(let i=0;i<original.length;i++){const p=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i).applyMatrix4(mesh.matrixWorld);assert(p.distanceTo(new T.Vector3(...original[i]))<.000001,'Source vertex shifted, face '+f.id);}}
m.setReference(true);let visibleReference=0;m.root.traverse(o=>{if(o.isMesh&&o.visible){assert(o.userData.sourceFace!==undefined);visibleReference++;}});assert.equal(visibleReference,63);m.setReference(false);
// Finished doors use one solid beveled front, without the coplanar imported
// face overlay. Reference mode must still retain every original SKP face.
const referenceFronts=m.sourceMeshes.filter(o=>o.userData.referenceOnly);
assert(referenceFronts.length>20);assert(referenceFronts.every(o=>!o.visible));
for(const u of m.units.filter(u=>!['glass','dishwasher'].includes(u.kind))){
 let solid=0;u.group.traverse(o=>{if(o.isMesh&&o.material===u.front&&o.visible&&!o.userData.sourceFace)solid++;});
 assert(solid>=u.parts.length,'Missing solid fronts: '+u.id);
}

const unit=id=>m.units.find(u=>u.id===id);
for(const skin of m.sourceMeshes.filter(o=>o.userData.outerSkin)){assert(skin.material.polygonOffset);assert(skin.material.polygonOffsetUnits<0);assert.equal(skin.castShadow,false);}
for(const u of m.units){assert.notEqual(u.sideSkin,u.side);assert.equal(u.sideSkin.color.getHex(),u.side.color.getHex());}
const base=m.products.find(p=>p.id==='base-cabinet');assert(base);
assert.equal(base.members.length,15);assert.equal(m.products.length,6);
for(const member of base.members){assert.equal(member.product,base);assert.equal(member.group.parent,base.group);assert(base.actions.every(a=>base.members.includes(a.unit)));}
for(const id of ['dishwasher','pantry','tall','glass-wall','wall-corner'])assert.equal(unit(id).product,unit(id));
assert.equal(new Set(base.actions).size,base.members.reduce((n,u)=>n+u.actions.length,0));

for(const id of ['tandem-orange','tandem-red-left','tandem-red-back'])assert.equal(unit(id).actions.length,2);
assert.equal(unit('rice').actions.length,1);assert.equal(unit('wicker').actions.length,3);assert.equal(unit('wicker').actions.filter(a=>a.type==='slide').length,2);
assert(unit('pantry').actions.every(a=>a.type==='hinge'));assert.equal(unit('pantry').actions.length,3);assert.equal(unit('tall').actions.length,1);assert.equal(unit('tall').actions[0].type,'slide');assert.equal(unit('glass-wall').actions.length,2);
for(const a of m.actions)a.open=true;for(let i=0;i<100;i++)m.update(.033);for(const a of m.actions){assert(a.value>.999);if(a.type==='slide')assert(a.node.position.z>a.initial.z+.20);if(a.type==='hinge')assert(Math.abs(a.node.rotation.y)>1.5);a.open=false;}for(let i=0;i<100;i++)m.update(.033);for(const a of m.actions){assert(a.value<.00001);assert(a.node.position.distanceTo(a.initial)<.00001);}
// Opening a door cannot move source carcass, worktop or floor geometry.
for(const mesh of m.sourceMeshes.filter(o=>!o.userData.action)){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace);m.root.updateMatrixWorld(true);for(let i=0;i<f.points.flat().length;i++){const p=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i).applyMatrix4(mesh.matrixWorld);assert(p.distanceTo(new T.Vector3(...f.points.flat()[i]))<.000001);}}
for(const aspect of [390/500,1200/600])for(const u of m.units){const b=new T.Box3().setFromObject(u.group),size=b.getSize(new T.Vector3()),center=b.getCenter(new T.Vector3()),fov=39*Math.PI/180,radius=size.length()/2,distance=Math.max(radius/Math.sin(fov/2),radius/Math.sin(Math.atan(Math.tan(fov/2)*aspect)))*1.18,camera=new T.PerspectiveCamera(39,aspect,.01,100);camera.position.copy(center).addScaledVector(new T.Vector3(Math.sin(u.angle+.65),.3,Math.cos(u.angle+.65)).normalize(),distance);camera.lookAt(center);camera.updateMatrixWorld(true);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new T.Vector3(x,y,z).project(camera);assert(Math.abs(p.x)<1&&Math.abs(p.y)<1,u.id+' clipped');}}
console.log('Passed: 63 exact source faces, all closed vertices within 0.001 mm of SKP; 20 selectable units; source drawer divisions; hinged pantry; linked tall pull-out; rice/wicker/oil mechanisms; unchanged architecture; phone and desktop framing.');
