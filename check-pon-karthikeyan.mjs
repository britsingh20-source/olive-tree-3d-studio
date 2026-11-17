import assert from 'node:assert/strict';
import fs from 'node:fs';
import {register} from 'node:module';
const vendor=new URL('./dist/vendor/three.module.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,next){if(s==='three')return{url:${JSON.stringify(vendor)},shortCircuit:true};return next(s,c);}`),import.meta.url);
const T=await import(vendor);
// Node has no image loader; geometry and behaviour are checked, not texture appearance.
T.TextureLoader.prototype.load=function(){return new T.Texture();};
const {buildModel,exactLayout}=await import('./dist/pon-karthikeyan/model.js');
const m=buildModel(),get=id=>m.units.find(u=>u.id===id),I=.0254;m.robot.paused=true; // keep the robot docked until its own test
// Every extracted source face is preserved exactly for Reference colours.
assert.equal(exactLayout.sourceFaces.length,95);assert.equal(m.sourceMeshes.length,95);
for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),p=mesh.geometry.attributes.position,pts=f.points.flat();assert.equal(p.count,pts.length);for(let i=0;i<p.count;i++)assert(new T.Vector3().fromBufferAttribute(p,i).distanceTo(new T.Vector3(...pts[i]))<1e-6);}
const src=new T.Box3().setFromObject(m.sourceMeshes[0].parent).getSize(new T.Vector3());// Faces span 153.045 in; one unreferenced source vertex sits 0.01 in further out.
for(const [i,w] of [153.045,120,82].entries())assert(Math.abs(src.getComponent(i)-w*I)<.005*I);
// Confirmed decisions.
assert.deepEqual(m.units.map(u=>u.id),['tv-panel','ledge','louver','tall-glass','console','awards-niche','robot-bay','pooja']);
for(const id of ['tv-panel','ledge','louver','awards-niche','robot-bay'])assert.equal(get(id).actions.length,0,id+' must not open');
assert.equal(get('louver').fixed,true);assert(get('louver').slatCount>100,'louver slats on header and side return');
// Rev 2: TV panel stands 3 in off the wall.
{const panel=get('tv-panel');assert.equal(panel.depthInches,3);const back=panel.group.children.find(o=>o.userData.role==='tv-panel-box'),bx=new T.Box3().setFromObject(back);assert(Math.abs((bx.max.z-bx.min.z)/I-3.1)<.01);assert.equal(panel.strips.length,1);assert(Math.abs(bx.max.x/I-118.5)<.01&&Math.abs(bx.min.x/I-24.1)<.01,'reveal on niche side only');assert.equal(get('louver').bottomStrip,undefined,'no strip under louvers (rev 6)');}
assert.equal(get('awards-niche').background,'Green floral mica');assert.match(get('pooja').doorFinish,/Wooden mica/);assert.equal(get('louver').finishable,false);
const tall=get('tall-glass');assert.equal(tall.leftSidePanel,'Wooden mica, full height');assert.equal(tall.actions.length,1);assert.equal(tall.hingeEdge,'left');
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
// Rev 7: strip lighting only — no point/spot lights anywhere.
let pointLights=0;m.root.traverse(o=>{if(o.isLight)pointLights++;});assert.equal(pointLights,0);
assert.equal(get('tall-glass').strips.length,2,'vertical strips inside tall glass cabinet');assert.equal(get('pooja').foyerFace,'Green grass mat');assert.equal(get('tall-glass').glassShelves.length,4);assert.equal(get('pooja').pebbleBox.heightInches,15);
const glows=m.units.flatMap(u=>u.glows||[]);assert(glows.length>=10);m.setLights(false);assert(glows.every(g=>!g.visible));m.setLights(true);assert(glows.every(g=>g.visible));
// Rev 10: robot loops by itself — rests 3-4 s in the bay, 6 s trips, different spot each trip.
{const r=bay.robot,home=new T.Vector3(131*I,0,-64*I),cl=m.robot;cl.paused=false;assert(r.position.distanceTo(home)<1e-6);const starts=[],ends=[],spots=new Set();let tm=0,wasActive=false;
 for(let i=0;i<60*70;i++){m.update(1/60);tm+=1/60;if(cl.active&&!wasActive){starts.push(tm);spots.add(cl.spot.map(v=>Math.round(v)).join(','));}if(!cl.active&&wasActive){ends.push(tm);assert(r.position.distanceTo(home)<1e-6,'back in bay after each trip');}wasActive=cl.active;
  if(r.position.x>120*I-.01&&r.position.x<144*I)assert(r.position.z<-55*I,'robot only uses the slot zone under the console');}
 assert(starts.length>=6,'several trips in 70 s');for(let k=0;k<ends.length;k++)assert(Math.abs(ends[k]-starts[k]-6)<.1,'each trip ~6 s');
 for(let k=1;k<starts.length;k++){const rest=starts[k]-ends[k-1];assert(rest>2.9&&rest<4.1,'rests 3-4 s');}
 assert(spots.size>=3,'trips vary');}
m.setReference(true);assert(m.units.every(u=>!u.group.visible));m.setReference(false);assert(m.units.every(u=>u.group.visible));
// A stage resize updates projection only; it never calls fit or moves the camera.
const code=fs.readFileSync('dist/pon-karthikeyan/studio.js','utf8'),resize=code.slice(code.indexOf('function resize()'),code.indexOf('async function start()'));let fitted=0,sized=0;const cam={fov:40,aspect:1,position:{x:1,y:2,z:3},updateProjectionMatrix(){}};const run=new Function('stage','renderer','camera','window','fit',"let lastStageSize='';"+resize+';return resize;')({clientWidth:1000,clientHeight:600},{capabilities:{maxTextureSize:8192},setPixelRatio(){},setSize(){sized++;}},cam,{devicePixelRatio:1},()=>fitted++);run();run();assert.equal(sized,1);assert.equal(fitted,0);assert.deepEqual(cam.position,{x:1,y:2,z:3});
assert(code.includes('controls.enableDamping=false'));
console.log(JSON.stringify({sourceFaces:95,sourceBoundsInches:[153.06,82,120],units:m.units.length,actions:m.actions.length,glows:m.units.flatMap(u=>u.glows||[]).length,checks:'source loops/bounds, 3 in TV panel, louver slats incl. side return, floral niche, wood-mica pooja doors, fixed louver/ledge/niche/bay, left-hinged tall glass, 5 hinged + 1 lift console, pooja double doors open toward TV without hitting console, open/close, lights, reference mode, no resize recenter, no damping'}));
