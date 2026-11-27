// Source-level checks for the gsquare kitchen viewer (not visual proof).
import assert from 'node:assert/strict';
import {register} from 'node:module';
const vendor=new URL('./dist/vendor/three.module.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,next){if(s==='three')return{url:${JSON.stringify(vendor)},shortCircuit:true};return next(s,c);}`),import.meta.url);
const T=await import(vendor);
T.TextureLoader.prototype.load=function(){return new T.Texture();};
const {buildModel,exactLayout,AQUA}=await import('./dist/gsquare-kitchen/model.js');
const m=buildModel(),get=id=>m.units.find(u=>u.id===id),I=.0254;
// Every source face retained exactly; bounds 132 x 84 x 96 in.
assert.equal(exactLayout.sourceFaces.length,62);assert.equal(m.sourceMeshes.length,62);
for(const mesh of m.sourceMeshes){const f=exactLayout.sourceFaces.find(f=>f.id===mesh.userData.sourceFace),p=mesh.geometry.attributes.position;assert.equal(p.count,f.points.flat().length);for(let i=0;i<p.count;i++)assert(new T.Vector3().fromBufferAttribute(p,i).distanceTo(new T.Vector3(...f.points.flat()[i]))<1e-6);}
m.setReference(true);{const b=new T.Box3();for(const s of m.sourceMeshes)b.expandByObject(s);const size=b.getSize(new T.Vector3());for(const [i,w] of [132,84,96].entries())assert(Math.abs(size.getComponent(i)-w*I)<.002,'bounds '+i);}m.setReference(false);
// Confirmed design.
for(const u of m.units.filter(u=>u.finishable))assert.equal(u.defaultFront.color,AQUA,u.id+' aqua front');
assert(get('sink-cabinet').defaultFront.gloss);
assert.equal(get('tall-unit').defaultSide.wood,true);assert.equal(get('glass-wall-cabinet').defaultSide.wood,true);assert.equal(get('wicker-box').defaultSide.wood,true);
assert.equal(get('wicker-box').baskets.length,2);assert.equal(get('wicker-box').shutter,'None — open box');
assert.equal(get('glass-wall-cabinet').doorCount,3);assert.equal(get('sink-cabinet').doorCount,2);assert.equal(get('short-doors').doorCount,2);
assert.equal(get('thali-cutlery').actions.length,2);for(const id of ['pan-pullout','oil-pullout','s-corner'])assert.equal(get(id).actions.length,1,id);
assert.equal(get('chimney').sizeCm,90);for(const id of ['worktop','chimney'])assert.equal(get(id).actions.length,0,id+' fixed');
for(const id of ['tall-unit','glass-wall-cabinet'])assert(get(id).lightNodes.length>0,id+' LED');
// Sink over the left doors (xr 4-40), hob over oil pull-out + S corner (xr 78-106) — world X = xr-66.
// Openings move outward: long counter +Z, short counter & wall cabinet -X, tall unit -Z.
m.root.updateMatrixWorld(true);
const outward={'sink-cabinet':['z',1],'pan-pullout':['z',1],'thali-cutlery':['z',1],'oil-pullout':['z',1],'s-corner':['z',1],'wicker-box':['x',-1],'short-doors':['x',-1],'glass-wall-cabinet':['x',-1],'tall-unit':['z',-1]};
const centre=a=>new T.Box3().setFromObject(a.node).getCenter(new T.Vector3());
for(const a of m.actions){const before=centre(a);a.open=true;for(let i=0;i<120;i++)m.update(1/30);m.root.updateMatrixWorld(true);const after=centre(a),[axis,sgn]=outward[a.unit.id];
 assert((after[axis]-before[axis])*sgn>.04,a.unit.id+' opens outward');a.open=false;for(let i=0;i<120;i++)m.update(1/30);}
// Corner doors: at their limited swing they must clear each other's closed neighbour.
const meshes=n=>{const r=[];n.traverse(o=>{if(o.isMesh)r.push(o)});return r;};
function obbHit(d,t){d.geometry.computeBoundingBox();const tb=new T.Box3().setFromObject(t),inv=d.matrixWorld.clone().invert(),lb=new T.Box3();for(const x of [tb.min.x,tb.max.x])for(const y of [tb.min.y,tb.max.y])for(const z of [tb.min.z,tb.max.z])lb.expandByPoint(new T.Vector3(x,y,z).applyMatrix4(inv));return d.geometry.boundingBox.intersectsBox(lb.expandByScalar(-.0008));}
const sdCorner=get('short-doors').actions.find(a=>a.skipOpenAll),tlCorner=get('tall-unit').actions.find(a=>a.skipOpenAll);
for(const [a,other] of [[sdCorner,tlCorner],[tlCorner,sdCorner]]){a.node.rotation.y=a.travel;m.root.updateMatrixWorld(true);for(const d of meshes(a.node))for(const t of meshes(other.node))assert(!obbHit(d,t),a.unit.id+' corner door clears '+other.unit.id);a.node.rotation.y=0;}
m.root.updateMatrixWorld(true);
// No coplanar same-facing overlaps between built surfaces (z-fighting).
{const tris=[];const arch=new Set();m.architecture.traverse(o=>arch.add(o));const ref=new Set(m.sourceMeshes);
 m.root.traverse(o=>{if(!o.isMesh||ref.has(o)||arch.has(o))return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry,pos=g.attributes.position;
  for(let i=0;i<pos.count;i+=3){const a=new T.Vector3().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld),b=new T.Vector3().fromBufferAttribute(pos,i+1).applyMatrix4(o.matrixWorld),c=new T.Vector3().fromBufferAttribute(pos,i+2).applyMatrix4(o.matrixWorld);
   const n=b.clone().sub(a).cross(c.clone().sub(a));if(n.length()<2e-7)continue;n.normalize();tris.push({a,b,c,n,d:n.dot(a),o});}});
 const inside=(p,t)=>{const v0=t.c.clone().sub(t.a),v1=t.b.clone().sub(t.a),v2=p.clone().sub(t.a),d00=v0.dot(v0),d01=v0.dot(v1),d02=v0.dot(v2),d11=v1.dot(v1),d12=v1.dot(v2),inv=1/(d00*d11-d01*d01),u=(d11*d02-d01*d12)*inv,v=(d00*d12-d01*d02)*inv;return u>1e-3&&v>1e-3&&u+v<1-1e-3;};
 const buckets=new Map();for(const t of tris){const k=[t.n.x,t.n.y,t.n.z].map(v=>v.toFixed(2)).join()+','+(t.d/I).toFixed(1);(buckets.get(k)||buckets.set(k,[]).get(k)).push(t);}
 const bad=[];for(const list of buckets.values())for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){const s=list[i],t=list[j];if(s.o===t.o||Math.abs(s.d-t.d)>4e-4)continue;
  const ctr=x=>x.a.clone().add(x.b).add(x.c).multiplyScalar(1/3);if(inside(ctr(s),t)||inside(ctr(t),s))bad.push((s.o.userData.unit?.id)+'/'+(t.o.userData.unit?.id)+' @'+(s.d/I).toFixed(2)+' n'+[s.n.x,s.n.y,s.n.z].map(v=>v.toFixed(0)));}
 assert.equal(bad.length,0,'coplanar same-facing overlaps: '+[...new Set(bad)].slice(0,12).join('; '));}
m.setLights(false);assert(m.units.every(u=>u.lightNodes.every(l=>!l.visible)));m.setLights(true);
m.setReference(true);assert(m.units.every(u=>!u.group.visible));m.setReference(false);
console.log('gsquare-kitchen checks passed:',m.units.length,'units,',m.actions.length,'actions');
