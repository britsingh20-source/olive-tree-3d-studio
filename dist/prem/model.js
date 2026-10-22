import * as T from 'three';
import {RoundedBoxGeometry} from '../vendor/RoundedBoxGeometry.js';
export const DEFAULT_FINISH='#86a79a';
export const project={id:'prem-temple-town-kitchen-v1',customer:'Mr. Prem',location:'Temple Town · Teachers Colony · Karamadai',quotation:null,dimensionStatus:'Arrangement rebuilt from supplied views. Exact dimensions require confirmation.'};
// Dimensions in metres are provisional reconstruction values, never quotation measurements.
export const definitions=[
{id:'dishwasher',name:'Dishwasher',kind:'dishwasher',ref:'#0000ff',w:.60,h:.76,d:.59,x:0,z:2.66,angle:Math.PI/2},
{id:'tandem-three',name:'Three tandem drawers',kind:'tandem',count:3,ref:'#e85b13',w:.72,h:.76,d:.59,x:0,z:1.99,angle:Math.PI/2},
{id:'shelves-left',name:'Base cabinet · shelves',kind:'shelves',ref:'#eed02c',w:.72,h:.76,d:.59,x:0,z:1.26,angle:Math.PI/2},
{id:'corner',name:'Corner cabinet · shelves',kind:'shelves',ref:'#eed02c',w:.64,h:.76,d:.59,x:.64,z:.59,angle:0},
{id:'shelves-back',name:'Base cabinet · double shutters',kind:'shelves',ref:'#eed02c',w:.90,h:.76,d:.59,x:1.42,z:.59,angle:0},
{id:'tandem-two',name:'Two tandem drawers',kind:'tandem',count:2,ref:'#ff0000',w:.72,h:.76,d:.59,x:2.24,z:.59,angle:0},
{id:'oil',name:'Oil pull-out',kind:'oil',ref:'#62a800',w:.25,h:.76,d:.59,x:2.735,z:.59,angle:0},
{id:'shelves-end',name:'Base cabinet · shelves',kind:'shelves',ref:'#eed02c',w:.52,h:.76,d:.59,x:3.13,z:.59,angle:0},
{id:'rice',name:'Rice basket',kind:'rice',ref:'#7200c9',w:.60,h:.76,d:.59,x:3.40,z:.90,angle:-Math.PI/2},
{id:'wicker',name:'Two wicker baskets',kind:'wicker',ref:'#800000',w:.60,h:.76,d:.59,x:3.40,z:1.51,angle:-Math.PI/2},
{id:'pantry',name:'Pantry · fixed shelves',kind:'pantry',ref:'#ad83cb',w:.85,h:2.12,d:.59,x:3.40,z:2.25,angle:-Math.PI/2},
{id:'tall',name:'Tall unit · pull-out baskets',kind:'tall',ref:'#ca0063',w:.52,h:2.12,d:.59,x:3.40,z:2.95,angle:-Math.PI/2},
{id:'glass-wall',name:'Aluminium-framed glass wall unit',kind:'glass',ref:'#00ffff',w:1.18,h:.72,d:.32,x:1.05,z:.32,angle:0,base:1.46},
{id:'wall-shutters',name:'Wall cabinet · normal shutters',kind:'shelves',ref:'#eed02c',w:1.12,h:.72,d:.32,x:2.23,z:.32,angle:0,base:1.46}
];
export function buildModel({batch=true}={}){
 const root=new T.Group(),architecture=new T.Group();root.add(architecture);const units=[],actions=[];
 const ivory=new T.MeshStandardMaterial({color:'#eee9df',roughness:.65}),metal=new T.MeshStandardMaterial({color:'#b9c1c3',roughness:.24,metalness:.85}),basketMat=new T.MeshStandardMaterial({color:'#b98d54',roughness:.83}),black=new T.MeshStandardMaterial({color:'#263033',roughness:.28,metalness:.32});
 function box(parent,w,h,d,x,y,z,mat){const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(.003,w/5,h/5,d/5)),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function rod(parent,a,b,r=.003,mat=metal){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),m=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),6),mat);m.position.copy(av).add(bv).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());parent.add(m);return m;}
 function wire(p,w,depth,y,z,hh=.14){for(const yy of [y,y+hh]){for(const zz of [z-depth/2,z+depth/2])rod(p,[-w/2,yy,zz],[w/2,yy,zz]);for(const xx of [-w/2,w/2])rod(p,[xx,yy,z-depth/2],[xx,yy,z+depth/2]);}for(let i=0;i<=8;i++){let xx=-w/2+w*i/8;rod(p,[xx,y,z-depth/2],[xx,y,z+depth/2],.002);for(const zz of [z-depth/2,z+depth/2])rod(p,[xx,y,zz],[xx,y+hh,zz],.002);}for(let i=0;i<6;i++){const zz=z-depth/2+depth*i/5;for(const xx of [-w/2,w/2])rod(p,[xx,y,zz],[xx,y+hh,zz],.002);}}
 function action(u,node,type,travel){const a={unit:u,node,type,travel,open:false,value:0,initial:node.position.clone()};u.actions.push(a);actions.push(a);node.traverse(o=>{if(o.isMesh)o.userData.action=a;});return a;}
 for(const def of definitions){const g=new T.Group();g.position.set(def.x,(def.base??.08)+def.h/2,def.z);g.rotation.y=def.angle;root.add(g);const front=new T.MeshPhysicalMaterial({color:DEFAULT_FINISH,roughness:.12,clearcoat:1,clearcoatRoughness:.055,envMapIntensity:1.5}),side=front.clone(),u={...def,group:g,front,side,actions:[]};units.push(u);const {w,h,d}=def,t=.018;
 function carcass(){box(g,t,h,d,-w/2+t/2,0,-d/2,side);box(g,t,h,d,w/2-t/2,0,-d/2,side);box(g,w-2*t,t,d,0,-h/2+t/2,-d/2,ivory);box(g,w,t,d,0,h/2-t/2,-d/2,side);box(g,w-2*t,h-2*t,t,0,0,-d+t/2,ivory);}
 function shelves(count){for(let i=1;i<=count;i++)box(g,w-.045,.018,d-.045,0,-h/2+h*i/(count+1),-d/2,ivory);}
 function door(xx,ww,left=true,isGlass=false){const pivot=new T.Group();pivot.position.set(xx+(left?-ww/2:ww/2),0,0);g.add(pivot);const sign=left?1:-1;if(isGlass){const glass=new T.MeshPhysicalMaterial({color:'#b4ceca',transparent:true,opacity:.24,roughness:.07,metalness:.04,clearcoat:1,depthWrite:false});box(pivot,ww-.045,h-.045,.012,sign*ww/2,0,.012,glass);for(const x of [.012,ww-.012])box(pivot,.024,h,.025,sign*x,0,.018,metal);for(const y of [-h/2+.012,h/2-.012])box(pivot,ww,.024,.025,sign*ww/2,y,.018,metal);}else box(pivot,ww-.004,h-.006,.020,sign*ww/2,0,.012,front);for(const y of [-h/2+.12,h/2-.12])box(g,.025,.045,.025,pivot.position.x+sign*.02,y,-.018,metal);action(u,pivot,'hinge',left?-1.65:1.65);}
 function slider(y,hh,kind){const p=new T.Group();g.add(p);box(p,w-.005,hh-.006,.02,0,y,.012,front);const ww=w-.075,dd=d-.08,z=-d/2+.02,bottom=y-hh/2+.035;for(const x of [-w/2+.026,w/2-.026])box(g,.012,.025,d-.05,x,bottom+.02,-d/2,metal);
 if(kind==='oil'){for(let i=0;i<3;i++)wire(p,ww,dd,-h/2+.08+i*.23,z,.13);for(const x of [-ww/2,ww/2])rod(p,[x,-h/2+.08,z-dd/2],[x,h/2-.07,z-dd/2],.006);}
 else if(kind==='rice'){const bucket=new T.MeshStandardMaterial({color:'#e8e4d8',roughness:.4});box(p,ww,.47,dd,0,-h/2+.30,z,bucket);box(p,ww+.01,.018,dd+.01,0,-h/2+.55,z,metal);box(p,.11,.012,.03,0,-h/2+.57,z,black);}
 else if(kind==='wicker'){box(p,ww,.012,dd,0,bottom,z,basketMat);const bh=hh-.075;for(let i=0;i<12;i++){const yy=bottom+bh*i/11;for(const xx of [-ww/2,ww/2])box(p,.009,.008,dd,xx,yy,z,basketMat);for(const zz of [z-dd/2,z+dd/2])box(p,ww,.008,.009,0,yy,zz,basketMat);}for(let i=0;i<16;i++)for(const zz of [z-dd/2,z+dd/2])box(p,.007,bh,.007,-ww/2+ww*i/15,bottom+bh/2,zz,basketMat);}
 else{box(p,ww,.014,dd,0,bottom,z,ivory);for(const x of [-ww/2,ww/2])box(p,.012,hh-.06,dd,x,bottom+(hh-.06)/2,z,metal);box(p,ww,hh-.06,.012,0,bottom+(hh-.06)/2,z-dd/2,ivory);}
 action(u,p,'slide',Math.min(.44,d*.8));}
 if(def.kind==='dishwasher'){carcass();const drum=new T.MeshStandardMaterial({color:'#858f90',roughness:.23,metalness:.8});box(g,w-.045,h-.045,.012,0,0,-d+.025,drum);const door=new T.Group();door.position.y=-h/2+.02;g.add(door);box(door,w-.012,h-.025,.025,0,(h-.025)/2,.02,drum);box(door,w-.03,.055,.014,0,h-.07,.04,black);for(let i=0;i<4;i++)box(door,.015,.008,.005,-.1+i*.035,h-.07,.05,ivory);action(u,door,'flap',Math.PI/2);wire(g,w-.09,d-.11,-.2,-d/2,.11);wire(g,w-.09,d-.11,.13,-d/2,.11);}
 else{carcass();if(def.kind==='shelves'||def.kind==='pantry'||def.kind==='glass'){shelves(def.kind==='pantry'?5:2);const n=w>.78?2:1;for(let i=0;i<n;i++)door(-w/2+w/n*(i+.5),w/n,i===0,def.kind==='glass');if(def.kind==='glass'){const led=new T.MeshStandardMaterial({color:'#fff1ce',emissive:'#ffd18a',emissiveIntensity:2.2});box(g,w-.05,.012,.018,0,h/2-.025,-d+.045,led);const light=new T.PointLight('#ffe2ac',.65,1);light.position.set(0,h/2-.08,-d/2);g.add(light);}}
 else if(def.kind==='tandem'||def.kind==='wicker'){const n=def.count??2;for(let i=0;i<n;i++)slider(-h/2+h/n*(i+.5),h/n,def.kind);}
 else if(def.kind==='oil'||def.kind==='rice')slider(0,h,def.kind);
 else if(def.kind==='tall'){const p=new T.Group();g.add(p);box(p,w-.005,h-.006,.022,0,0,.013,front);const ww=w-.09,dd=d-.10;for(const x of [-ww/2,ww/2])rod(p,[x,-h/2+.08,-d+.065],[x,h/2-.08,-d+.065],.007);for(let i=0;i<6;i++)wire(p,ww,dd,-h/2+.12+(h-.38)*i/5,-d/2,.15);for(const y of [-h/2+.04,h/2-.04])box(g,.03,.025,d-.04,0,y,-d/2,metal);action(u,p,'slide',.46);}}
 g.traverse(o=>{if(o.isMesh)o.userData.unit=u;});
 }
 const stone=new T.MeshPhysicalMaterial({color:'#f5f1e8',roughness:.22,clearcoat:.7}),wall=new T.MeshStandardMaterial({color:'#f0ede5',roughness:.85}),floor=new T.MeshStandardMaterial({color:'#e1ded4',roughness:.5});
 box(architecture,4.7,.07,4.2,1.7,-.055,1.6,floor).userData.floor=true;
 // Straight, clean worktops and plinths, independent of imported face extrusions.
 for(const a of [[.64,.04,2.92,-.29,.86,1.53],[3.40,.04,.64,1.70,.86,.285],[.64,.04,1.62,3.70,.86,1.13]])box(architecture,...a,stone);
 for(const a of [[.56,.08,2.90,-.295,.04,1.53],[3.4,.08,.56,1.70,.04,.295],[.56,.08,3.24,3.695,.04,1.80]])box(architecture,...a,black);
 const back=box(architecture,4.24,2.6,.055,1.70,1.28,-.065,wall);back.userData.wall=true;
 const left=box(architecture,.055,2.6,3.40,-.64,1.28,1.61,wall);left.userData.wall=true;
 // Fine stone veins are decorative surface lines, not grooves in the cabinetry.
 const vein=new T.MeshStandardMaterial({color:'#bcaa83',roughness:.35});for(let i=0;i<8;i++){const x=.04+i*.46;rod(architecture,[x,.94,-.031],[x+.27,1.20,-.031],.002,vein);rod(architecture,[x+.27,1.20,-.031],[x+.45,1.31,-.031],.001,vein);}
 const strip=new T.MeshStandardMaterial({color:'#fff2d2',emissive:'#ffd7a2',emissiveIntensity:2});box(architecture,2.32,.009,.018,1.64,1.452,.23,strip);for(const x of [.7,1.8,2.6]){const l=new T.PointLight('#ffdfae',.5,1.5);l.position.set(x,1.40,.28);architecture.add(l);}
 // Batch static pieces within each moving parent. Doors/drawers keep their
 // own parent, so their animation and hit target remain independent.
 let batches=0;const parents=[];root.traverse(o=>{if(o.isGroup)parents.push(o);});
 for(const parent of (batch?parents:[])){const groups=new Map();for(const child of [...parent.children]){if(!child.isMesh||Array.isArray(child.material))continue;const key=child.material.uuid+':'+(actions.indexOf(child.userData.action));if(!groups.has(key))groups.set(key,[]);groups.get(key).push(child);}for(const list of groups.values()){if(list.length<4)continue;const positions=[],normals=[],uv=[],indices=[];let offset=0;for(const mesh of list){mesh.updateMatrix();const geo=mesh.geometry,nm=new T.Matrix3().getNormalMatrix(mesh.matrix),p=geo.attributes.position,n=geo.attributes.normal,tex=geo.attributes.uv;for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrix),normal=new T.Vector3().fromBufferAttribute(n,i).applyMatrix3(nm).normalize();positions.push(v.x,v.y,v.z);normals.push(normal.x,normal.y,normal.z);uv.push(tex?tex.getX(i):0,tex?tex.getY(i):0);}if(geo.index)for(const ix of geo.index.array)indices.push(ix+offset);else for(let i=0;i<p.count;i++)indices.push(i+offset);offset+=p.count;parent.remove(mesh);geo.dispose();}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);const merged=new T.Mesh(geometry,list[0].material);merged.userData={...list[0].userData};merged.castShadow=list.some(m=>m.castShadow);merged.receiveShadow=true;parent.add(merged);batches++;}}
 root.updateMatrixWorld(true);return {root,architecture,units,actions,batches,update(dt){for(const a of actions){a.value=T.MathUtils.damp(a.value,a.open?1:0,10,dt);if(a.type==='slide')a.node.position.z=a.initial.z+a.travel*a.value;else if(a.type==='flap')a.node.rotation.x=a.travel*a.value;else a.node.rotation.y=a.travel*a.value;}}};
}
