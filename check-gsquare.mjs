// Source-level checks for the gsquare under-staircase viewer (not visual proof).
import assert from 'node:assert/strict';
import {register} from 'node:module';
const vendor=new URL('./dist/vendor/three.module.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,next){if(s==='three')return{url:${JSON.stringify(vendor)},shortCircuit:true};return next(s,c);}`),import.meta.url);
const T=await import(vendor);
T.TextureLoader.prototype.load=function(){return new T.Texture();}; // no DOM image loading in Node
const {buildModel,exactLayout}=await import('./dist/gsquare/model.js');
const m=buildModel(),get=id=>m.units.find(u=>u.id===id);
// Every extracted source face retained, exactly.
assert.equal(exactLayout.sourceFaces.length,170);assert.equal(m.sourceMeshes.length,170);
for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),p=mesh.geometry.attributes.position;assert.equal(p.count,f.points.flat().length);for(let i=0;i<p.count;i++)assert(new T.Vector3().fromBufferAttribute(p,i).distanceTo(new T.Vector3(...f.points.flat()[i]))<1e-6);}
m.setReference(true);const ref=new T.Box3();for(const s of m.sourceMeshes)ref.expandByObject(s);const size=ref.getSize(new T.Vector3());m.setReference(false);
for(const [i,w] of [144.30,120,108.13].entries())assert(Math.abs(size.getComponent(i)-w*.0254)<.002,'source bounds '+i);
// Confirmed design.
const tvw=get('tv-wall');assert.equal(tvw.actions.length,0);assert(tvw.defaultFront.gloss);assert(!tvw.defaultFront.horizontal);assert(tvw.front.roughness<=.06&&tvw.front.clearcoat===1);assert(tvw.lightNodes.length>0);
const tv=get('tv');assert.deepEqual(tv.sizeInches,[56.7,31.9]);assert.equal(tv.bottomInches,26);
const tvBox=new T.Box3().setFromObject(tv.group),tvC=tvBox.getCenter(new T.Vector3());assert(Math.abs(tvC.x/.0254-62.73)<.01,'TV centred on panel');assert(Math.abs(tvBox.min.y/.0254-26)<.01);
const slope=x=>100.19-(x-26.73)*(40.19/72);assert(tvBox.max.y/.0254<slope(tvBox.max.x/.0254),'TV clears the sloping top');
const lc=get('tv-cabinet');assert.equal(lc.doorCount,4);assert.equal(lc.actions.length,4);assert.equal(lc.actions.filter(a=>a.door==='glass').length,2);assert(lc.lightNodes.length>0);
const st=get('right-storage');assert.equal(st.actions.length,2);assert.equal(st.handles,'Handleless, push to open');
const pj=get('pooja');assert.equal(pj.doorCount,2);assert(pj.lightNodes.length>0);
const dr=get('pooja-drawers');assert.deepEqual(dr.drawerHeightsInches,[6,4]);assert(dr.actions.every(a=>a.type==='slide'));
const lo=get('pooja-lower');assert.equal(lo.actions.length,2);
for(const id of ['fluted-column','grass-panel','tv-wall','tv','wash-basin'])assert.equal(get(id).actions.length,0,id+' must stay fixed');
assert.equal(get('grass-panel').finishable,false);assert.equal(get('fluted-column').finishable,false);
const wb=get('wash-basin');assert(wb.purpose.includes('mirror'));{const b=new T.Box3().setFromObject(wb.group);assert(Math.abs(b.min.x/.0254-7.82)<.01&&Math.abs(b.max.x/.0254-24.73)<.01,'basin niche width');}
{const sd=get('stair-door');assert.equal(sd.actions.length,1);assert(sd.actions[0].skipOpenAll);assert.equal(sd.handles,'Handleless, push to open');}
const rs=get('rear-storage');assert.equal(rs.actions.length,1);assert.equal(rs.hinge,'Staircase side');
// Opening direction: front doors +Z, pooja unit and rear door -X; drawers slide -X.
m.root.updateMatrixWorld(true);
const outward={'stair-door':['z',1],'tv-cabinet':['z',1],'right-storage':['z',1],pooja:['x',-1],'pooja-drawers':['x',-1],'pooja-lower':['x',-1],'rear-storage':['x',-1]};
function centre(a){return new T.Box3().setFromObject(a.node).getCenter(new T.Vector3());}
for(const a of m.actions){const before=centre(a);a.open=true;for(let i=0;i<120;i++)m.update(1/30);m.root.updateMatrixWorld(true);const after=centre(a),[axis,sgn]=outward[a.unit.id];
 assert((after[axis]-before[axis])*sgn>.04,a.unit.id+' opens outward');a.open=false;for(let i=0;i<120;i++)m.update(1/30);}
// Rear door must stay clear of the grass panel border while swinging (render check, not fabrication).
const rp=rs.actions[0],grass=new T.Box3().setFromObject(get('grass-panel').group);
for(let d=0;d<=85;d+=1){rp.node.rotation.y=rp.travel*d/85;m.root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(rp.node);b.expandByScalar(-.002);assert(!b.intersectsBox(grass),'rear door clears grass border at '+d);}
rp.node.rotation.y=0;
// Right storage door (corner shared with pooja) must clear the closed pooja unit at its limited swing.
const corner=st.actions.find(a=>a.skipOpenAll);assert(corner&&Math.abs(corner.travel-Math.PI*80/180)<1e-9);
corner.node.rotation.y=corner.travel;m.root.updateMatrixWorld(true);
const meshes=n=>{const r=[];n.traverse(o=>{if(o.isMesh)r.push(o)});return r;};
function obbHit(d,t){d.geometry.computeBoundingBox();const tb=new T.Box3().setFromObject(t),inv=d.matrixWorld.clone().invert(),lb=new T.Box3();for(const x of [tb.min.x,tb.max.x])for(const y of [tb.min.y,tb.max.y])for(const z of [tb.min.z,tb.max.z])lb.expandByPoint(new T.Vector3(x,y,z).applyMatrix4(inv));return d.geometry.boundingBox.intersectsBox(lb.expandByScalar(-.0008));}
for(const d of meshes(corner.node))for(const id of ['pooja','pooja-drawers','pooja-lower'])for(const t of meshes(get(id).group))assert(!obbHit(d,t),'corner door clears '+id);
corner.node.rotation.y=0;

// No two cabinet surfaces may share a plane and overlap while facing the same way (z-fighting flicker).
{const tris=[];m.root.updateMatrixWorld(true);const arch=new Set();m.architecture.traverse(o=>arch.add(o));const ref=new Set(m.sourceMeshes);
 m.root.traverse(o=>{if(!o.isMesh||ref.has(o)||arch.has(o))return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,pos=g.attributes.position;
  for(let i=0;i<pos.count;i+=3){const a=new T.Vector3().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld),b=new T.Vector3().fromBufferAttribute(pos,i+1).applyMatrix4(o.matrixWorld),c=new T.Vector3().fromBufferAttribute(pos,i+2).applyMatrix4(o.matrixWorld);
   const n=b.clone().sub(a).cross(c.clone().sub(a));if(n.length()<2e-7)continue;n.normalize();tris.push({a,b,c,n,d:n.dot(a),o});}});
 const inside=(p,t)=>{const v0=t.c.clone().sub(t.a),v1=t.b.clone().sub(t.a),v2=p.clone().sub(t.a),d00=v0.dot(v0),d01=v0.dot(v1),d02=v0.dot(v2),d11=v1.dot(v1),d12=v1.dot(v2),inv=1/(d00*d11-d01*d01),u=(d11*d02-d01*d12)*inv,v=(d00*d12-d01*d02)*inv;return u>1e-3&&v>1e-3&&u+v<1-1e-3;};
 const buckets=new Map();for(const t of tris){const k=[t.n.x,t.n.y,t.n.z].map(v=>v.toFixed(2)).join()+','+(t.d/.0254).toFixed(1);(buckets.get(k)||buckets.set(k,[]).get(k)).push(t);}
 let bad=[];for(const list of buckets.values())for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const s=list[i],t=list[j];if(s.o===t.o||Math.abs(s.d-t.d)>4e-4)continue;
  const ctr=x=>x.a.clone().add(x.b).add(x.c).multiplyScalar(1/3);if(inside(ctr(s),t)||inside(ctr(t),s))bad.push((s.o.userData.unit?.id)+'/'+(t.o.userData.unit?.id)+' @'+(s.d/.0254).toFixed(2));}
 assert.equal(bad.length,0,'coplanar same-facing overlaps: '+[...new Set(bad)].slice(0,8).join('; '));}
m.setLights(false);assert(m.units.every(u=>u.lightNodes.every(l=>!l.visible)));m.setLights(true);
m.setReference(true);assert(m.units.every(u=>!u.group.visible));m.setReference(false);
console.log('gsquare checks passed:',m.units.length,'units,',m.actions.length,'actions');
