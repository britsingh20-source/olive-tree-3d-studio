import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from './dist/vendor/three.module.js';import {createKitchenTour} from './dist/rathesh/tour.js';
const source=fs.readFileSync('dist/suresh/model.js','utf8').replace("from 'three'","from '../vendor/three.module.js'");fs.writeFileSync('dist/suresh/model-node.js',source);
try{
 const {buildModel}=await import('./dist/suresh/model-node.js');const m=buildModel();assert.equal(m.sourceMeshes.length,48);assert.equal(m.exactLayout.sourceVertexCount,73);
 for(const mesh of m.sourceMeshes){const f=m.exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),p=mesh.geometry.attributes.position;assert.equal(p.count,f.points.flat().length);for(let i=0;i<p.count;i++)assert(new T.Vector3().fromBufferAttribute(p,i).distanceTo(new T.Vector3(...f.points.flat()[i]))<1e-6);}
 assert.equal(m.actions.filter(a=>a.type==='lift').length,5);assert.equal(m.units.find(u=>u.id==='tv-panel').screenInches,65);assert(m.units.filter(u=>u.pvcLouver).every(u=>u.louverDirection==='vertical'&&!u.actions.length));
 for(const a of m.actions.filter(a=>a.type==='lift')){a.open=true;m.update(2);assert(Math.abs(a.node.rotation.x+Math.PI/2)<.0001);a.open=false;m.update(2);assert(Math.abs(a.node.rotation.x)<.0001);assert(a.unit.handleless&&a.unit.openStorage);}
 assert.equal(m.exactLayout.width,84*.0254);assert.equal(m.exactLayout.height,104*.0254);assert.equal(m.exactLayout.depth,12*.0254);
 let completed=false,visited=0;const tour=createKitchenTour({units:m.units,onOverview(){},onVisit(){visited++;},onAction(a,open){a.open=open;},onStatus(){},onComplete(){completed=true;}});tour.start();tour.update(1000);assert(completed&&!tour.active);assert.equal(visited,m.units.length);tour.start();assert(tour.stop());tour.update(1000);assert(!tour.active);
 console.log('PASS: source geometry, dimensions, five lifts, open storage, 65-inch TV, louvers and tour sequence.');
}finally{fs.unlinkSync('dist/suresh/model-node.js');}
