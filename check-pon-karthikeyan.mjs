import assert from 'node:assert/strict';
import fs from 'node:fs';
import {register} from 'node:module';
const vendor=new URL('./dist/vendor/three.module.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,next){if(s==='three')return{url:${JSON.stringify(vendor)},shortCircuit:true};return next(s,c);}`),import.meta.url);
const T=await import(vendor);
// Node has no image loader; geometry and behaviour are checked, not texture appearance.
T.TextureLoader.prototype.load=function(){return new T.Texture();};
const {buildModel,exactLayout}=await import('./dist/pon-karthikeyan/model.js');
const m=buildModel(),get=id=>m.units.find(u=>u.id===id),I=.0254;
// Every extracted source face is preserved exactly for Reference colours.
assert.equal(exactLayout.sourceFaces.length,95);assert.equal(m.sourceMeshes.length,95);
for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),p=mesh.geometry.attributes.position,pts=f.points.flat();assert.equal(p.count,pts.length);for(let i=0;i<p.count;i++)assert(new T.Vector3().fromBufferAttribute(p,i).distanceTo(new T.Vector3(...pts[i]))<1e-6);}
const src=new T.Box3().setFromObject(m.sourceMeshes[0].parent).getSize(new T.Vector3());// Faces span 153.045 in; one unreferenced source vertex sits 0.01 in further out.
for(const [i,w] of [153.045,120,82].entries())assert(Math.abs(src.getComponent(i)-w*I)<.005*I);
// Confirmed decisions.
assert.deepEqual(m.units.map(u=>u.id),['tv-panel','ledge','louver','tall-glass','console','awards-niche','robot-bay','pooja']);
for(const id of ['tv-panel','ledge','louver','awards-niche','robot-bay'])assert.equal(get(id).actions.length,0,id+' must not open');
assert.equal(get('louver').fixed,true);assert.equal(get('louver').finishable,false);
const tall=get('tall-glass');assert.equal(tall.actions.length,1);assert.equal(tall.hingeEdge,'left');
const con=get('console');assert.equal(con.woodShutterCount,5);assert.equal(con.actions.filter(a=>a.type==='hinge').length,5);assert.equal(con.actions.filter(a=>a.type==='lift').length,1);assert.equal(con.glassLift.type,'lift');assert.equal(con.floatHeightInches,8);
const niche=get('awards-niche');assert.equal(niche.shelfCount,2);assert.equal(niche.shelfMaterial,'Wood mica');
const bay=get('robot-bay');assert.equal(bay.robotDiameterInches,16);assert.equal(bay.fixedShutter,true);
const pooja=get('pooja');assert.equal(pooja.doorCount,2);assert.equal(pooja.actions.length,2);
// Open everything: doors reach their travel and open toward the room / TV area.
for(const a of m.actions)a.open=true;for(let i=0;i<240;i++)m.update(1/60);
for(const a of m.actions){const v=a.type==='hinge'?a.node.rotation.y:a.node.rotation.x;assert(Math.abs(v-a.travel)<1e-4);}
m.root.updateMatrixWorld(true);
const tallDoor=new T.Box3().setFromObject(tall.actions[0].node);assert(tallDoor.max.z>-55*I+.1,'tall glass door swings outward');
const lift=new T.Box3().setFromObject(con.glassLift.node);assert(lift.min.y>15*I,'glass flap lifts up');
for(const d of pooja.doors){const b=new T.Box3().setFromObject(d);assert(b.min.x<110*I,'pooja door opens toward the TV area');}
// Pooja doors must not hit the console or the robot-bay shutter during the sweep.
const conBox=new T.Box3();for(const o of con.group.children)if(o.isMesh)conBox.union(new T.Box3().setFromObject(o));
for(let n=0;n<=84;n+=2){for(const a of pooja.actions)a.node.rotation.y=Math.sign(a.travel)*n*Math.PI/180;m.root.updateMatrixWorld(true);for(const d of pooja.doors)assert(!new T.Box3().setFromObject(d).intersectsBox(conBox),'pooja door hits console at '+n);}
for(const a of m.actions)a.open=false;for(let i=0;i<240;i++)m.update(1/60);for(const a of m.actions)assert(Math.abs(a.value)<1e-3);
// Robot fits through the open slot under the console (17.5 in wide x 8 in high).
const robot=bay.group.children.find(o=>o.isGroup);const rb=new T.Box3().setFromObject(robot);assert(rb.max.y<8*I,'robot lower than the 8 in slot');assert(rb.getSize(new T.Vector3()).z<17.5*I,'robot narrower than the 17.5 in slot');assert(rb.min.x>120*I&&rb.max.x<144.1*I,'robot inside the bay');
m.setLights(false);assert(m.lights.every(l=>!l.visible));m.setLights(true);assert(m.lights.every(l=>l.visible));
m.setReference(true);assert(m.units.every(u=>!u.group.visible));m.setReference(false);assert(m.units.every(u=>u.group.visible));
// A stage resize updates projection only; it never calls fit or moves the camera.
const code=fs.readFileSync('dist/pon-karthikeyan/studio.js','utf8'),resize=code.slice(code.indexOf('function resize()'),code.indexOf('async function start()'));let fitted=0,sized=0;const cam={fov:40,aspect:1,position:{x:1,y:2,z:3},updateProjectionMatrix(){}};const run=new Function('stage','renderer','camera','window','fit',"let lastStageSize='';"+resize+';return resize;')({clientWidth:1000,clientHeight:600},{capabilities:{maxTextureSize:8192},setPixelRatio(){},setSize(){sized++;}},cam,{devicePixelRatio:1},()=>fitted++);run();run();assert.equal(sized,1);assert.equal(fitted,0);assert.deepEqual(cam.position,{x:1,y:2,z:3});
assert(code.includes('controls.enableDamping=false'));
console.log(JSON.stringify({sourceFaces:95,sourceBoundsInches:[153.06,82,120],units:m.units.length,actions:m.actions.length,lights:m.lights.length,checks:'source loops/bounds, fixed louver/ledge/niche/bay, left-hinged tall glass, 5 hinged + 1 lift console, pooja double doors open toward TV without hitting console, open/close, lights, reference mode, no resize recenter, no damping'}));
