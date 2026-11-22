import fs from 'node:fs';import assert from 'node:assert/strict';import * as T from './dist/vendor/three.module.js';
const vendor=new URL('./dist/vendor/three.module.js',import.meta.url).href;
const rounded=fs.readFileSync('dist/vendor/RoundedBoxGeometry.js','utf8').replace("from 'three'",`from '${vendor}'`),roundedURL='data:text/javascript;base64,'+Buffer.from(rounded).toString('base64');
const layoutURL=new URL('./dist/krishnagiri-living/exact-layout.js',import.meta.url).href;
const source=fs.readFileSync('dist/krishnagiri-living/model.js','utf8').replace("from 'three'",`from '${vendor}'`).replace("from '../vendor/RoundedBoxGeometry.js'",`from '${roundedURL}'`).replace("from './exact-layout.js'",`from '${layoutURL}'`);
const {buildModel,exactLayout,WOOD_FINISH}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const m=buildModel(),unit=id=>m.units.find(u=>u.id===id),product=id=>m.products.find(p=>p.id===id);
assert.equal(exactLayout.sourceFaces.length,283);assert.equal(exactLayout.validation.backColouredFaces,62);
// every source face rendered exactly once at its measured position (doors at rest)
assert.equal(m.sourceMeshes.length,283);assert.equal(new Set(m.sourceMeshes.map(o=>o.userData.sourceFace)).size,283);
m.root.updateMatrixWorld(true);for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),pts=f.points.flat();for(let i=0;i<pts.length;i++){const p=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i).applyMatrix4(mesh.matrixWorld);assert(p.distanceTo(new T.Vector3(...pts[i]))<1e-6,'Source face moved: '+f.id);}}
// confirmed meanings (Bright 2026-11-22)
const kinds={crockery:'glass-tinted','book-shelf':'glass-clear',tandem:'tandem','robot-bay':'fixed','tv-shutters':'wood-shutters','tv-lift':'glass-lift','tv-display':'glass-clear','entrance-display':'glass-grey',pooja:'cnc','under-stair':'stair-shutters',bench:'bench'};
for(const [id,k] of Object.entries(kinds))assert.equal(unit(id).kind,k,id);
assert.equal(unit('crockery').actions.length,2);assert.deepEqual(unit('crockery').actions.map(a=>a.hingeSide),['left','right']);
assert.equal(unit('robot-bay').actions.length,0,'robot bay shutter is fixed');
assert.equal(unit('tandem').actions[0].type,'slide');assert.equal(unit('tv-lift').actions[0].type,'liftX');assert.equal(unit('tv-lift').actions[0].hingeSide,'top');
assert.equal(unit('tv-shutters').actions.length,4);assert(unit('tv-shutters').actions.every(a=>a.type==='hinge'));
assert.equal(unit('pooja').actions.length,2);assert.equal(unit('under-stair').actions.length,3);assert.equal(unit('bench').actions[0].type,'liftZ');
for(const id of ['wall-unit','tv-unit'])assert(product(id),id);assert.equal(product('wall-unit').members.length,5);assert.equal(product('tv-unit').members.length,3);assert.equal(m.products.length,7);
// materials on fixed source faces
const meshOf=id=>m.sourceMeshes.find(o=>o.userData.sourceFace===id);
for(const id of exactLayout.special.marble)assert(meshOf(id).material.map&&meshOf(id).material.clearcoat>.5,'marble '+id);
for(const id of exactLayout.special.louver){const o=meshOf(id);assert(o.material.map&&o.material.bumpMap,'louver: one mipmapped wood-slat surface '+id);}{let inst=0;m.root.traverse(o=>{if(o.isInstancedMesh)inst++;});assert.equal(inst,0,'no thin slat geometry (pixelated while rotating)');}
const grainOK=(mesh)=>{const g=mesh.geometry,uv=g.attributes.uv,pos=g.attributes.position;let best=null;for(let k=0;k<pos.count;k++)for(let l=k+1;l<pos.count;l++){const du=Math.abs(uv.getX(k)-uv.getX(l)),dv=Math.abs(uv.getY(k)-uv.getY(l));if(!best||du+dv>best[0]+best[1])best=[du,dv];}return best[0]>=best[1]-1e-9;};
for(const f of exactLayout.sourceFaces){const o=meshOf(f.id);if(o.material.userData?.wood)assert(grainOK(o),'grain runs along the longer side '+f.id);}
assert(unit('crockery').group.getObjectsByProperty('isMesh',true).some(o=>o.material.userData?.wood&&o.parent?.parent&&o.geometry.parameters?.height>2),'crockery interior wooden');
assert.equal(meshOf(45137).material.color.getHexString(),'f1efe9','charcoal face is white wall');
for(const f of exactLayout.sourceFaces)if(['#660000','#661900','#666600'].includes(f.visibleColor)&&!unit('tv-shutters').sourceFaces.includes(f.id)&&![46951,44607].includes(f.id)&&!unit('wall-upper').sourceFaces.includes(f.id))assert(meshOf(f.id).material.map,'wood mica '+f.id);
let rect=0;m.root.traverse(o=>{if(o.isLight){assert(o.isRectAreaLight,'LED surface lights only');rect++;}});assert(rect>=10&&rect<=20,'area light count '+rect);
// open everything then close: all return to rest
for(const a of m.actions)a.open=true;for(let i=0;i<120;i++)m.update(.033);
assert(unit('bench').actions[0].node.rotation.z>1.2,'bench seat lifts');assert(exactLayout.special.benchTop.every(id=>{let o=m.sourceMeshes.find(x=>x.userData.sourceFace===id);while(o&&o!==unit('bench').actions[0].node)o=o.parent;return !!o;}),'measured seat top lifts with the lid');assert(unit('tv-lift').actions[0].node.rotation.x<-1.1,'glass lifts up');
for(const a of m.actions)a.open=false;for(let i=0;i<200;i++)m.update(.033);for(const a of m.actions){assert(a.node.position.distanceTo(a.initial)<1e-3);assert(Math.abs(a.node.rotation.x)+Math.abs(a.node.rotation.y)+Math.abs(a.node.rotation.z)<1e-3);}
m.setLights(false);m.root.traverse(o=>{if(o.isLight)assert(!o.visible);});m.setLights(true);
m.setReference(true);let shown=0;m.root.traverse(o=>{if(o.isMesh&&o.visible){assert(o.userData.sourceFace,'only source faces in reference mode');shown++;}});assert.equal(shown,283);m.setReference(false);
// studio wiring
const studio=fs.readFileSync('dist/krishnagiri-living/studio.js','utf8'),html=fs.readFileSync('dist/krishnagiri-living/index.html','utf8');
assert(!/overflow='hidden'|classList\.add\('is-focused'\)/.test(studio),'no scroll lock in product view');assert(/controls\.enableDamping=false/.test(studio));
const v=html.match(/studio\.js\?v=(\w+)/)[1];assert(studio.includes('model.js?v='+v),'asset versions match');
console.log('krishnagiri-living check passed:',m.units.length,'sections,',m.products.length,'products,',m.actions.length,'actions,',rect,'area lights');
{// no unresolved coplanar overlap: every pushed face renders behind its partner via a positive polygon offset
 const pb=exactLayout.special.pushBack;assert(Object.keys(pb).length>=30);for(const [id,l] of Object.entries(pb)){const o=m.sourceMeshes.find(x=>x.userData.sourceFace===Number(id));assert(o.material.polygonOffset&&o.material.polygonOffsetFactor===2*l,'pushed back '+id);}
 for(const id of [43495,43517,43511])assert(!pb[id],'under-stair shutters stay in front');assert(pb[43505]&&pb[43474]&&pb[43475],'stair side and white faces behind the pooja/storage faces');
 for(const id of [46872,46874,46876,46878,46678,43679,43562])assert(meshOf(id).material.map,'white face inside a unit is wooden mica '+id);assert.equal(meshOf(43494).material.map,null,'floor under the stairs stays plain');assert(meshOf(45244).material.roughness<.1&&meshOf(45244).material.clearcoat===1,'marble is glossy');
 {let n=0;m.staircase.traverse(o=>{if(o.isMesh)n++;});assert(n>=20,'staircase faces grouped '+n);m.setStairOpacity(.12);m.staircase.traverse(o=>{if(o.isMesh)assert(o.material.opacity<.2&&o.material.transparent);});m.setStairOpacity(1);for(const id of [43495,43517,43511,43445])assert(!m.staircase.getObjectsByProperty('isMesh',true).some(o=>o.userData.sourceFace===id),'units are never faded');}
 console.log('coplanar overlaps resolved:',Object.keys(pb).length);}
{// robot cleaner loop: 4 s out, 4 s cleaning, 4 s back in the bay, repeating
 const m2=buildModel(),dock=m2.robot.position.clone();const at=s=>{for(let i=0;i<Math.round(s/0.02);i++)m2.update(.02);return m2.robot.position.clone();};
 const p4=at(4);assert.equal(m2.cleaner.phase,'clean');assert(p4.distanceTo(dock)>1,'out in the room after 4 s');
 at(4);assert.equal(m2.cleaner.phase,'back');const p12=at(4);assert.equal(m2.cleaner.phase,'out');assert(p12.distanceTo(dock)<.05,'back in the bay after 12 s');
 const p16=at(4);assert(p16.distanceTo(dock)>1,'second loop goes out again');
 m2.setReference(true);const frozen=m2.robot.position.clone();at(1);assert(m2.robot.position.distanceTo(frozen)<1e-9,'paused in reference mode');
 console.log('robot cleaner loop ok');}
{const {BEIGE_UNITS,BEIGE_FACES,BEIGE_FINISH}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 assert.deepEqual(BEIGE_UNITS,['tv-shutters','wall-upper','seat-end','tandem','robot-bay']);for(const id of ['wall-upper','seat-end'])assert(unit(id).actions.length===unit(id).sourceFaces.length&&unit(id).actions.every(a=>a.type==='hinge'),id+' opens');assert.equal(unit('tv-shutters').defaultFront.color,BEIGE_FINISH.color);assert(unit('under-stair').defaultFront.wood,'staircase storage stays wooden mica');
 for(const id of BEIGE_FACES)assert(meshOf(id).material.userData.beige,'beige front '+id);
 const st=fs.readFileSync('dist/krishnagiri-living/studio.js','utf8'),ht=fs.readFileSync('dist/krishnagiri-living/index.html','utf8');assert(!/applyOption|po-card/.test(st+ht),'no option cards');console.log('beige scheme ok');}
{const st=fs.readFileSync('dist/krishnagiri-living/studio.js','utf8');const steps=JSON.parse(st.match(/WALK_STEPS=(\[.*?\]);\n/)[1]);
 assert(steps[0].at[1]<109,'starts at the entrance');const fx=steps.flatMap(s=>s.fx||[]).map(f=>f.join(':'));
 for(const want of ['open:entrance-display','close:entrance-display','tv:1','tv:0','open:book-shelf','open:tandem','close:tandem','open:crockery','close:crockery','open:pooja','close:pooja','open:under-stair','close:under-stair'])assert(fx.includes(want),'walk does '+want);
 assert(steps.some(s=>s.at[2]<=44&&s.at[0]<53&&s.at[1]>229&&s.at[1]<278),'sits on the bay-window seat');assert(steps.some(s=>/reading/.test(s.label||'')),'reads at the study table');
 for(const id of steps.flatMap(s=>s.fx||[]).filter(f=>f[0]!=='tv').map(f=>f[1]))assert(unit(id)&&unit(id).actions.length,'unit has actions '+id);
 assert(m.tv&&typeof m.setTV==='function');m.setTV(true);assert(m.tv.userData.on);m.setTV(false);
 const total=steps.reduce((a,s)=>a+s.d,0);console.log('walkthrough ok:',steps.length,'steps,',total.toFixed(1),'s');}
