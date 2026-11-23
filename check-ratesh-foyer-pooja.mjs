// Source-level checks for Mr. Ratesh's foyer + pooja viewer (not visual proof).
import assert from 'node:assert/strict';
import {register} from 'node:module';
const vendor=new URL('./dist/vendor/three.module.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,next){if(s==='three')return{url:${JSON.stringify(vendor)},shortCircuit:true};return next(s,c);}`),import.meta.url);
const T=await import(vendor);
T.TextureLoader.prototype.load=function(){return new T.Texture();}; // no DOM image loading in Node
const {buildModel,exactLayout}=await import('./dist/ratesh/foyer-pooja/model.js');
const m=buildModel(),get=id=>m.units.find(u=>u.id===id);
// Every extracted source face retained, exactly.
assert.equal(exactLayout.sourceFaces.length,40);assert.equal(m.sourceMeshes.length,40);
for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),p=mesh.geometry.attributes.position;assert.equal(p.count,f.points.flat().length);for(let i=0;i<p.count;i++)assert(new T.Vector3().fromBufferAttribute(p,i).distanceTo(new T.Vector3(...f.points.flat()[i]))<1e-6);}
const size=new T.Box3().setFromObject(m.sourceMeshes[0].parent).getSize(new T.Vector3());
for(const [i,w] of [54,84,53].entries())assert(Math.abs(size.getComponent(i)-w*.0254)<1e-6,'source bounds');
const colours=new Set(exactLayout.sourceFaces.map(f=>f.color));for(const c of ['#ffb299','#5a7a43','#db3500','#a56348','#ffffff'])assert(colours.has(c));
// Confirmed design.
const pooja=get('pooja-upper');assert.equal(pooja.doorCount,2);assert.equal(pooja.actions.length,2);assert.equal(pooja.shelfCount,2);assert.equal(pooja.handles,'Handleless');assert(pooja.lightNodes.length>0);
const dr=get('drawers');assert.equal(dr.drawerCount,2);assert.deepEqual(dr.drawerHeightsInches,[8,4]);assert(dr.actions.every(a=>a.type==='slide'));
const low=get('pooja-lower');assert.equal(low.doorCount,2);assert.equal(low.shelfCount,0);
const bk=get('book-counter');assert.equal(bk.doorCount,2);assert.equal(bk.purpose,'Storage box for books');
const gr=get('grass-wall');assert.equal(gr.finishable,false);assert.equal(gr.actions.length,0);assert(gr.lightNodes.length>0);
for(const id of ['louvers','surround'])assert.equal(get(id).actions.length,0,id+' must stay fixed');
// Opening mechanics: doors swing outward (toward +X for the tall unit, +Z for the counter); drawers slide out along +X.
m.root.updateMatrixWorld(true);
function centre(a){const b=new T.Box3().setFromObject(a.node);return b.getCenter(new T.Vector3());}
for(const a of m.actions){const before=centre(a);a.open=true;for(let i=0;i<120;i++)m.update(1/30);m.root.updateMatrixWorld(true);const after=centre(a);
 const axis=a.unit.id==='book-counter'?'z':'x';assert(after[axis]-before[axis]>.04,a.unit.id+' opens outward');a.open=false;for(let i=0;i<120;i++)m.update(1/30);}
m.setLights(false);assert(pooja.lightNodes.every(l=>!l.visible));m.setLights(true);
m.setReference(true);assert(m.units.every(u=>!u.group.visible));m.setReference(false);
console.log('ratesh foyer-pooja checks passed:',m.units.length,'units,',m.actions.length,'actions');
