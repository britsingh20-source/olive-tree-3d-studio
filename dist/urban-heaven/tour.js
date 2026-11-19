import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { buildSUV } from './suv.js?v=uh8';
import { buildCabin } from './interior.js?v=uh8';
import { STOPS, PICKUPS, JUNCTION_KM, HIGHWAY_KM, SCALE, highwayPoint, highwayX, sideKeyPoints, buildCarPath } from './route.js?v=uh8';

const $ = id => document.getElementById(id);
const stage = $('stage');

// ---------- WebGL check ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (e) {
  $('loading').textContent = 'This phone/browser cannot show the 3D drive. Route: pick up at Thudiyalur or Mettupalayam → Mettupalayam Road → KNM Mills (Santhaimedu) → left → ~750 m right → ~500 m left → Urban Heaven.';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const SKY = new THREE.Color('#cfe3ee');
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 160, 1300);
const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 6000);

scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.6;
scene.add(new THREE.HemisphereLight('#eaf4ff', '#6b6a4a', 1.25));
const sun = new THREE.DirectionalLight('#fff3dc', 2.2);
sun.position.set(-300, 500, 200);
scene.add(sun);

// ---------- helpers ----------
let seed = 20261119;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const mat = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });

function textTexture(draw, w = 1024, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function board({ lines, bg = '#11643d', fg = '#fff', w = 1024, h = 300, border = '#fff' }) {
  return textTexture((g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = border; g.lineWidth = 10; g.strokeRect(14, 14, W - 28, H - 28);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const step = H / (lines.length + 1);
    lines.forEach((ln, i) => {
      let size = ln.size || 64; g.font = `${ln.bold ? '700' : '500'} ${size}px "DM Sans", "Noto Sans Tamil", sans-serif`;
      while (g.measureText(ln.t).width > W - 80 && size > 20) { size -= 2; g.font = `${ln.bold ? '700' : '500'} ${size}px "DM Sans", "Noto Sans Tamil", sans-serif`; }
      g.fillStyle = ln.color || fg; g.fillText(ln.t, W / 2, step * (i + 1));
    });
  }, w, h);
}
function signboard(tex, w, h, poleH) {
  const grp = new THREE.Group();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, fog: true }));
  face.position.set(0, poleH + h / 2, 0.06);
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, h + 0.2, 0.1), mat('#5d6a66'));
  back.position.set(0, poleH + h / 2, 0);
  grp.add(face, back);
  for (const sx of [-w / 2 + 0.3, w / 2 - 0.3]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, poleH + h, 8), mat('#8a9196'));
    pole.position.set(sx, (poleH + h) / 2, -0.12); grp.add(pole);
  }
  return grp;
}
// place a sign beside a point, facing travellers coming from direction `from` (unit vec they travel along)
function placeFacing(obj, x, z, travelDir) { obj.position.set(x, 0, z); obj.rotation.y = Math.atan2(-travelDir.x, -travelDir.z); scene.add(obj); }

// ---------- ground & hills ----------
const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 12000, 90, 120), mat('#8fa65e'));
ground.rotation.x = -Math.PI / 2; ground.position.set(-600, -0.12, -3900); scene.add(ground);
{ // Western Ghats / Nilgiri foothills on the west and north
  const hillMat = new THREE.MeshBasicMaterial({ color: '#8fa8b8', fog: false });
  const farMat = new THREE.MeshBasicMaterial({ color: '#a9bfcc', fog: false });
  for (let i = 0; i < 26; i++) {
    const z = 600 - i * 360, h = 260 + rnd() * 420, r = 500 + rnd() * 400;
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), i % 2 ? hillMat : farMat);
    m.position.set(-2300 - rnd() * 900, h / 2 - 20, z); m.scale.z = 1.6; scene.add(m);
  }
  for (let i = 0; i < 12; i++) {
    const h = 500 + rnd() * 500, m = new THREE.Mesh(new THREE.ConeGeometry(700 + rnd() * 400, h, 7), i % 2 ? hillMat : farMat);
    m.position.set(-2400 + i * 450, h / 2 - 20, -9400 - rnd() * 800); scene.add(m);
  }
}

// ---------- roads ----------
function roadTexture(kind) {
  const t = textTexture((g, W, H) => {
    g.fillStyle = kind === 'highway' ? '#4b4d4f' : '#5c5a55'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},${rnd() > .5 ? 255 : 0},0.05)`; g.fillRect(rnd() * W, rnd() * H, 2, 2); }
    if (kind === 'highway') {
      g.fillStyle = '#f2f2ea'; g.fillRect(W / 2 - 3, 0, 6, H * 0.55);  // centre dashes
      g.fillRect(10, 0, 5, H); g.fillRect(W - 15, 0, 5, H);             // edge lines
    } else {
      g.fillStyle = '#7e6b55'; g.fillRect(0, 0, 8, H); g.fillRect(W - 8, 0, 8, H); // earth shoulders
    }
  }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const hwTex = roadTexture('highway'), sideTex = roadTexture('side');
function ribbon(points, width, tex, y) {
  const pos = [], uv = [], idx = []; let v = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    let dx = b.x - a.x, dz = b.z - a.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
    const nx = dz, nz = -dx; // left normal
    if (i) v += Math.hypot(points[i].x - points[i - 1].x, points[i].z - points[i - 1].z) / 12;
    pos.push(points[i].x + nx * width / 2, y, points[i].z + nz * width / 2, points[i].x - nx * width / 2, y, points[i].z - nz * width / 2);
    uv.push(0, v, 1, v);
    if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: -2 - y * 40 }));
  scene.add(m); return m;
}
const HW_W = 11, SIDE_W = 6.5;
{
  const pts = []; for (let km = -0.5; km <= HIGHWAY_KM + 0.5; km += 20 / SCALE.highway) pts.push(highwayPoint(km));
  ribbon(pts, HW_W, hwTex, 0.03);
  // gravel shoulders
  ribbon(pts, HW_W + 5, textTexture((g, W, H) => { g.fillStyle = '#9b8466'; g.fillRect(0, 0, W, H); }, 8, 8), 0.015);
}
const SK = sideKeyPoints();
const sideSeg = (a, b, extA = 0, extB = 0) => {
  const L = Math.hypot(b.x - a.x, b.z - a.z), ux = (b.x - a.x) / L, uz = (b.z - a.z) / L;
  return [{ x: a.x - ux * extA, z: a.z - uz * extA }, { x: b.x + ux * extB, z: b.z + uz * extB }];
};
ribbon(sideSeg({ x: SK.junction.x - HW_W / 2 - 2.5, z: SK.junction.z }, SK.turn1, 0, 70), SIDE_W, sideTex, 0.045);
ribbon(sideSeg(SK.turn1, SK.turn2, SIDE_W / 2, 60), SIDE_W, sideTex, 0.05);
ribbon(sideSeg(SK.turn2, SK.end, SIDE_W / 2, 30), SIDE_W, sideTex, 0.055);

// ---------- trees & buildings (instanced) ----------
const MAX_T = 3200, MAX_B = 1300;
const trunkG = new THREE.CylinderGeometry(0.35, 0.55, 1, 6), crownG = new THREE.IcosahedronGeometry(1, 1);
const trunks = new THREE.InstancedMesh(trunkG, mat('#5b4634'), MAX_T), crowns = new THREE.InstancedMesh(crownG, mat('#ffffff'), MAX_T);
const houses = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff'), MAX_B);
let nT = 0, nB = 0; const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), Pv = new THREE.Vector3(), C = new THREE.Color();
const nearJunction = (x, z, pad = 16) => z < SK.junction.z + pad && z > SK.junction.z - pad - 4 && x < SK.junction.x + 2;
const nearSide = (x, z, pad) => {
  const segs = [[SK.junction, SK.turn1], [SK.turn1, SK.turn2], [SK.turn2, SK.end]];
  return segs.some(([a, b]) => { const minx = Math.min(a.x, b.x) - pad, maxx = Math.max(a.x, b.x) + pad, minz = Math.min(a.z, b.z) - pad, maxz = Math.max(a.z, b.z) + pad; return x > minx && x < maxx && z > minz && z < maxz; });
};
function tree(x, z, h, crownW, kind = 'tamarind') {
  if (nT >= MAX_T) return;
  M4.compose(Pv.set(x, h * 0.5, z), Q.identity(), S.set(kind === 'coconut' ? 0.5 : 1, h, kind === 'coconut' ? 0.5 : 1)); trunks.setMatrixAt(nT, M4);
  if (kind === 'coconut') { M4.compose(Pv.set(x, h + 0.6, z), Q.identity(), S.set(crownW, 1.1, crownW)); C.set('#4f7d2c'); }
  else { M4.compose(Pv.set(x, h + crownW * 0.35, z), Q.setFromEuler(new THREE.Euler(0, rnd() * 3, 0)), S.set(crownW, crownW * 0.62, crownW * 0.9)); C.set(rnd() > .5 ? '#3f6b2f' : '#4c7a35'); }
  crowns.setMatrixAt(nT, M4); crowns.setColorAt(nT, C); nT++;
}
const PALETTE = ['#f3ead8', '#e9d6b9', '#cfe0e8', '#f1c9c2', '#f6e7a8', '#ffffff', '#d7e5c8', '#e7cfe3', '#c9d3dc'];
function house(x, z, w, h, d, rotY = 0, col) {
  if (nB >= MAX_B) return;
  M4.compose(Pv.set(x, h / 2, z), Q.setFromEuler(new THREE.Euler(0, rotY, 0)), S.set(w, h, d)); houses.setMatrixAt(nB, M4);
  C.set(col || PALETTE[Math.floor(rnd() * PALETTE.length)]); houses.setColorAt(nB, C); nB++;
}
const urbanity = km => km < 8.2 ? 0.55 : km < 10 ? 0.3 : (km > 16 && km < 18) ? 0.45 : km > 24 ? 0.6 : 0.12;
for (let km = -0.5; km <= HIGHWAY_KM + 0.5; km += 12 / SCALE.highway) {
  const c = highwayPoint(km);
  for (const side of [-1, 1]) {
    const x = c.x + side * (HW_W / 2 + 3 + rnd() * 3), z = c.z + (rnd() - .5) * 4;
    if (side < 0 && nearJunction(x, z)) continue;
    if (rnd() < 0.85) tree(x, z, 3.5 + rnd() * 2.5, 4 + rnd() * 3);
  }
}
for (let km = -0.5; km <= HIGHWAY_KM + 0.5; km += 15 / SCALE.highway) {
  const c = highwayPoint(km);
  for (const side of [-1, 1]) {
    if (rnd() > urbanity(km)) continue;
    const w = 6 + rnd() * 9, d = 7 + rnd() * 7, h = 3.2 + rnd() * (km < 8 || km > 24 ? 9 : 5);
    const x = c.x + side * (HW_W / 2 + 12 + rnd() * 10 + d / 2), z = c.z + (rnd() - .5) * 6;
    if (side < 0 && (nearJunction(x, z, 40) || (z > SK.junction.z && z < SK.junction.z + 200))) continue; // KNM Mills plot
    house(x, z, w, h, d);
  }
}
// side road: coconut groves and fields
const sidePts = buildCarPath('thudiyalur', 4).points.filter(p => p.type !== 'highway');
for (const p of sidePts) {
  for (const side of [-1, 1]) {
    if (rnd() > 0.55) continue;
    const ox = (rnd() - .5) * 2, off = SIDE_W / 2 + 4 + rnd() * 25;
    const a = sidePts[Math.max(0, sidePts.indexOf(p) - 1)], b = sidePts[Math.min(sidePts.length - 1, sidePts.indexOf(p) + 1)];
    let dx = b.x - a.x, dz = b.z - a.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
    const x = p.x + side * dz * off + ox, z = p.z - side * dx * off;
    if (Math.hypot(x - SK.gate.x, z - SK.gate.z) < 75 && x < SK.gate.x + 10) continue;
    if (nearSide(x, z, -1) && off < SIDE_W) continue;
    rnd() < 0.7 ? tree(x, z, 7 + rnd() * 5, 2.6, 'coconut') : house(x, z, 6 + rnd() * 5, 3 + rnd() * 3, 6 + rnd() * 4, rnd(), null);
  }
}
trunks.count = crowns.count = nT; houses.count = nB;
crowns.instanceColor.needsUpdate = houses.instanceColor.needsUpdate = true;
scene.add(trunks, crowns, houses);

// ---------- stop signboards ----------
const siteKmFrom = km => Math.abs(km - JUNCTION_KM) + 0.75 + 0.5 + 0.3;
for (const st of STOPS) {
  for (const dir of [+1, -1]) {
    if (st.km === JUNCTION_KM ? false : (dir > 0 ? st.km > JUNCTION_KM : st.km < JUNCTION_KM)) continue;
    const kmSign = st.km - dir * 0.12; if (kmSign < -0.4 || kmSign > HIGHWAY_KM + 0.4) continue;
    const c = highwayPoint(kmSign), travel = { x: 0, z: -dir };
    const tex = board({ lines: [{ t: st.ta, size: 58 }, { t: st.en.toUpperCase(), bold: true, size: 70 }, { t: `Urban Heaven  ≈ ${siteKmFrom(st.km).toFixed(1)} km`, size: 46, color: '#ffe68a' }], h: 360 });
    const s = signboard(tex, 9, 3.2, 3.2);
    placeFacing(s, c.x - dir * (HW_W / 2 + 2.2), c.z, travel);
  }
}

// ---------- KNM Mills ----------
{
  const j = SK.junction, wallX = j.x - HW_W / 2 - 4.5;
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.4, 180), mat('#e3dccd')); wall.position.set(wallX, 1.2, j.z + 15 + 90); scene.add(wall);
  const wall2 = new THREE.Mesh(new THREE.BoxGeometry(150, 2.4, 0.5), mat('#e3dccd')); wall2.position.set(wallX - 75, 1.2, j.z + SIDE_W / 2 + 3); scene.add(wall2);
  for (let i = 0; i < 4; i++) {
    const shed = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(34, 8, 22), mat('#d8d3c4')); body.position.y = 4; shed.add(body);
    for (let k = 0; k < 5; k++) { // saw-tooth roof
      const r = new THREE.Mesh(new THREE.BoxGeometry(34, 0.4, 5.2), mat('#9aa7ad')); r.position.set(0, 9.2, -9 + k * 4.4); r.rotation.x = -0.45; shed.add(r);
    }
    shed.position.set(wallX - 30 - (i % 2) * 44, 0, j.z + 45 + Math.floor(i / 2) * 40); scene.add(shed);
  }
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 30, 10), mat('#a6564a')); chimney.position.set(wallX - 110, 15, j.z + 70); scene.add(chimney);
  const name = signboard(board({ lines: [{ t: 'K.N.M. MILLS', bold: true, size: 96 }, { t: 'Santhaimedu · Mettupalayam Road', size: 44 }], bg: '#7a1f1f', h: 280 }), 10, 2.8, 1.2);
  name.position.set(wallX - 0.4, 0, j.z + 30); name.rotation.y = Math.PI / 2; scene.add(name);
  const name2 = name.clone(); name2.position.set(wallX - 30, 0, j.z + SIDE_W / 2 + 3.4); name2.rotation.y = 0; scene.add(name2);
}

// ---------- turn guidance boards ----------
function arrowBoard(arrow, text) {
  return board({ lines: [{ t: arrow, bold: true, size: 120 }, { t: text, bold: true, size: 56 }], bg: '#1f4f8f', h: 340 });
}
{
  const j = SK.junction;
  // northbound (from Thudiyalur) → left; southbound (from Mettupalayam) → right
  placeFacing(signboard(arrowBoard('←', 'URBAN HEAVEN  1.6 km'), 6, 3.2, 2.4), j.x - HW_W / 2 - 2, j.z + 40, { x: 0, z: -1 });
  placeFacing(signboard(arrowBoard('→', 'URBAN HEAVEN  1.6 km'), 6, 3.2, 2.4), j.x + HW_W / 2 + 2, j.z - 40, { x: 0, z: 1 });
  placeFacing(signboard(arrowBoard('→', 'URBAN HEAVEN'), 4.5, 2.6, 2), SK.turn1.x + 25, SK.turn1.z + SIDE_W / 2 + 2, { x: -1, z: 0 });
  placeFacing(signboard(arrowBoard('←', 'URBAN HEAVEN'), 4.5, 2.6, 2), SK.turn2.x + SIDE_W / 2 + 2, SK.turn2.z + 22, { x: 0, z: -1 });
}

// ---------- Urban Heaven gate & site ----------
{
  const g = SK.gate, grp = new THREE.Group();
  const pillarM = mat('#efe6d2'), accent = mat('#2e6b4f');
  for (const sz of [-5.2, 5.2]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.5, 1.4), pillarM); p.position.set(0, 3.75, sz); grp.add(p);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.8), accent); cap.position.set(0, 7.7, sz); grp.add(cap);
  }
  const beamTex = board({ lines: [{ t: 'URBAN HEAVEN', bold: true, size: 120, color: '#ffffff' }, { t: 'Veerapandi · Mettupalayam Road', size: 44, color: '#f1dfa3' }], bg: '#2e6b4f', border: '#d9b96a', w: 1200, h: 300 });
  for (const face of [1, -1]) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(10.8, 2.6), new THREE.MeshBasicMaterial({ map: beamTex }));
    b.position.set(face * 0.46, 6.2, 0); b.rotation.y = face * Math.PI / 2; grp.add(b);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.8, 11.8), accent); beam.position.y = 6.2; grp.add(beam);
  grp.position.set(g.x, 0, g.z); scene.add(grp);
  // site: red-earth plots with boundary kerbs on both sides of the internal road
  const earth = new THREE.Mesh(new THREE.PlaneGeometry(180, 130), mat('#b9835a', { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  earth.rotation.x = -Math.PI / 2; earth.position.set(g.x - 92, 0.02, g.z); scene.add(earth);
  const kerbM = mat('#efefe6');
  for (let i = 0; i < 7; i++) for (const side of [-1, 1]) for (let row = 0; row < 2; row++) {
    const cx = g.x - 14 - i * 23, cz = g.z + side * (SIDE_W / 2 + 4 + 9 + row * 19);
    for (const [w, d, ox, oz] of [[20, .35, 0, -8.5], [20, .35, 0, 8.5], [.35, 17, -10, 0], [.35, 17, 10, 0]]) {
      const k = new THREE.Mesh(new THREE.BoxGeometry(w, .35, d), kerbM); k.position.set(cx + ox, .18, cz + oz); scene.add(k);
    }
  }
  for (let i = 0; i < 9; i++) for (const side of [-1, 1]) { // flags along the avenue
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 4.5, 6), mat('#dddddd')); pole.position.set(g.x - 8 - i * 17, 2.25, g.z + side * (SIDE_W / 2 + 1)); scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .9), mat(i % 2 ? '#d9b96a' : '#2e6b4f', { side: THREE.DoubleSide })); flag.position.set(g.x - 8.7 - i * 17, 4, g.z + side * (SIDE_W / 2 + 1)); scene.add(flag);
  }
  placeFacing(signboard(board({ lines: [{ t: 'SITE MAP', bold: true, size: 96 }, { t: 'Plot layout will be added here', size: 50 }], bg: '#2e6b4f', h: 300 }), 7, 3, 1.4), SK.end.x - 25, SK.end.z, { x: -1, z: 0 });
}

// ---------- the cab ----------
const car = new THREE.Group(); scene.add(car);
const ext = buildSUV(), cabinKit = buildCabin(), cabin = cabinKit.group; car.add(ext, cabin);
const eye = new THREE.Group(); car.add(eye); eye.add(camera);

// ---------- tour state ----------
let path = null, s = 0, playing = false, speedMul = 1, view = 'inside', lookYaw = 0, lookPitch = 0, firedEvents = new Set(), finished = false;
const BASE = { highway: 46, side: 14, site: 7 };
function pointAt(sv) {
  const P = path.points, f = Math.min(P.length - 1.001, Math.max(0, sv / path.step)), i = Math.floor(f), t = f - i, a = P[i], b = P[i + 1];
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, km: a.km + (b.km - a.km) * t, type: a.type };
}
const LANE = { highway: 2.6, side: 1.35, site: 0 };
let laneNow = 2.6;
function placeCar(dt = 0) {
  const p = pointAt(s), ahead = pointAt(s + 7), back = pointAt(s - 1);
  let dx = ahead.x - back.x, dz = ahead.z - back.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
  const target = LANE[p.type]; laneNow += (target - laneNow) * Math.min(1, dt * 1.5 || 1);
  const nx = p.x + dz * laneNow, nz = p.z - dx * laneNow, moved = Math.hypot(nx - car.position.x, nz - car.position.z);
  if (moved < 5) for (const w of ext.userData.wheels) w.rotation.x -= moved / ext.userData.wheelRadius;
  car.position.set(nx, 0, nz); // drive on the left
  car.rotation.y = Math.atan2(-dx, -dz);
  return p;
}
// 'photo' = real cabin photograph with the windscreen cut out, road rendered behind it (default).
// 'inside' = procedural 3D cabin; 'outside' = chase camera. Only 'photo' is offered to customers.
// Photo views (customer turns their head): vx/vy = where the road ahead vanishes in that photo
// (vx may lie outside the frame), eye = seat position the photo was taken from.
const PHOTOS = [
  { id: 'left', label: 'Left window', src: 'cabin-left.webp', vx: 1560, vy: 360, eye: [-0.45, 1.45, 0.3] },
  { id: 'front', label: 'Windscreen', src: 'cabin-front.webp', vx: 930, vy: 424, eye: [-0.15, 1.45, 0.3], screen: [748, 627, 964, 742] },
  { id: 'right', label: "Driver's side", src: 'cabin-right.webp', vx: -300, vy: 440, eye: [0.35, 1.45, 0.25] },
];
const PHOTO = { w: 1672, h: 941, hfov: 100 };
let photoIdx = 1, photoYaw = 0, lookYawTarget = 0;
const photoF = () => (PHOTO.w / 2) / Math.tan(PHOTO.hfov * Math.PI / 360);
const yawFor = ph => Math.atan((ph.vx - PHOTO.w / 2) / photoF());
function showPhoto(i, instant = false) {
  photoIdx = Math.max(0, Math.min(PHOTOS.length - 1, i));
  const ph = PHOTOS[photoIdx];
  for (const [k, img] of document.querySelectorAll('.cockpit').entries()) img.classList.toggle('on', k === photoIdx);
  $('cockpitScreen').hidden = view !== 'photo' || !ph.screen;
  $('lookL').disabled = photoIdx === 0; $('lookR').disabled = photoIdx === PHOTOS.length - 1;
  $('lookLabel').textContent = ph.label;
  if (view === 'photo') { eye.position.set(...ph.eye); if (instant) photoYaw = yawFor(ph); resize(); }
}
function setView(v) {
  view = v; $('viewBtn').textContent = v === 'inside' ? 'Outside view' : 'Inside the cab';
  cabin.visible = v === 'inside' || v === 'rear'; ext.visible = v === 'outside';
  $('cockpits').hidden = v !== 'photo'; $('lookNav').hidden = v !== 'photo' && v !== 'rear';
  if (v === 'rear') { cabin.visible = true; eye.position.set(-0.4, 1.52, 0.4); lookYaw = lookYawTarget = 0; lookPitch = -0.12; $('lookLabel').textContent = 'Drag to look around · 360°'; $('lookL').disabled = $('lookR').disabled = false; }
  if (v === 'photo') { lookYaw = lookPitch = 0; showPhoto(1, true); }
  else if (v === 'inside') { eye.position.set(-0.4, 1.52, 0.4); }
  else if (v === 'outside') { eye.position.set(-3.6, 2.3, 7.2); }
  applyLook(); resize();
}
function applyLook() {
  eye.rotation.set(0, view === 'photo' ? photoYaw : lookYaw + (view === 'outside' ? -0.46 : 0), 0, 'YXZ'); camera.rotation.set(lookPitch + (view === 'inside' ? -0.14 : view === 'photo' || view === 'rear' ? 0 : -0.17), 0, 0);
}
function speedFor(sv) {
  const p = pointAt(sv); let v = BASE[p.type] || 10;
  for (const e of path.events) {
    const d = e.s - sv;
    if (e.kind === 'turn' && d > -8 && d < 90) v = Math.min(v, 6 + Math.max(0, d) * 0.45);
    if (e.kind === 'stop' && Math.abs(d) < 70) v = Math.min(v, 18 + Math.abs(d) * 0.4);
    if (e.kind === 'arrive' && d > -40 && d < 120) v = Math.min(v, 5 + Math.max(0, d) * 0.12);
  }
  const toEnd = path.totalS - sv; v = Math.min(v, 1.2 + toEnd * 0.25);
  const fromStart = sv; v = Math.min(v, 4 + fromStart * 0.6);
  return v;
}

// ---------- HUD ----------
function buildStrip() {
  const strip = $('strip'); strip.innerHTML = '<div class="strip-line"></div><div id="stripFill" class="strip-fill"></div><div id="stripCar" class="strip-car" aria-hidden="true">🚕</div>';
  for (const e of path.events) {
    if (e.kind === 'turn') continue;
    const d = document.createElement('div'); d.className = 'tick ' + e.kind + (e === path.events[path.events.length - 1] ? ' last' : ''); d.style.left = (e.km / path.totalKm * 100) + '%';
    d.innerHTML = `<i></i><span>${e.kind === 'arrive' ? 'Urban Heaven' : e.kind === 'turn' ? 'KNM turn' : e.en.replace(' · KNM Mills', '')}</span>`;
    strip.appendChild(d);
  }
}
const ARROWS = { left: '↰', right: '↱' };
let bannerTimer = 0;
function banner(title, sub) { $('bannerTitle').textContent = title; $('bannerSub').textContent = sub || ''; $('stopBanner').hidden = false; bannerTimer = 3.2; }
const hudState = {};
function updateHud(p) {
  hudState.left = Math.max(0, path.totalKm - p.km).toFixed(1) + ' km'; hudState.title = path.pickup.label + ' → Urban Heaven';
  $('kmDone').textContent = p.km.toFixed(1);
  $('kmLeft').textContent = Math.max(0, path.totalKm - p.km).toFixed(1);
  $('stripFill').style.width = $('stripCar').style.left = (p.km / path.totalKm * 100) + '%';
  const next = path.events.find(e => e.s > s + 0.5 && e.kind !== 'pickup');
  if (next) {
    const m = Math.max(0, (next.km - p.km) * 1000);
    const dist = m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.round(m / 10) * 10 + ' m';
    $('nextIcon').textContent = next.kind === 'turn' ? ARROWS[next.turn] : next.kind === 'arrive' ? '🏁' : '⦿';
    $('nextText').textContent = next.kind === 'stop' ? `Next stop · ${next.en}` : next.kind === 'arrive' ? 'Urban Heaven site entrance' : next.en;
    $('nextDist').textContent = 'in ' + dist;
    hudState.next = $('nextText').textContent; hudState.icon = $('nextIcon').textContent; hudState.dist = 'in ' + dist;
  } else { hudState.next = 'You have arrived'; hudState.icon = '🏁'; hudState.dist = ''; $('nextIcon').textContent = '🏁'; $('nextText').textContent = 'You have arrived at Urban Heaven'; $('nextDist').textContent = ''; }
  for (const e of path.events) {
    if (firedEvents.has(e.id) || s < e.s) continue;
    firedEvents.add(e.id);
    if (e.kind === 'stop') banner(e.en, `${e.ta} · ${e.km.toFixed(1)} km from ${path.pickup.label}`);
    if (e.kind === 'turn') banner(e.en, e.id === 'knm-turn' ? 'Leaving Mettupalayam Road · about 1.6 km to the site' : '');
    if (e.kind === 'arrive') banner('Welcome to Urban Heaven', 'The cab is entering the site');
  }
}

// ---------- controls ----------
function startTour(id) {
  path = buildCarPath(id); s = 0; s0 = 0; cabinKit.setRoute(path); firedEvents = new Set(); finished = false; lookYaw = lookPitch = 0;
  laneNow = 2.6; setView('rear');
  try { localStorage.setItem('urban-heaven-pickup', id); } catch (e) {}
  $('pickup').hidden = true; $('arrived').hidden = true; $('hud').hidden = false;
  $('routeName').textContent = `${path.pickup.label} → Urban Heaven · ≈ ${path.totalKm.toFixed(1)} km`;
  buildStrip(); placeCar(); updateHud(pointAt(0));
  banner(`Pickup · ${path.pickup.label}`, 'Your Property Manager cab is on its way');
  setPlaying(true);
}
function setPlaying(v) { playing = v; $('playBtn').textContent = v ? 'Pause' : 'Play'; $('playBtn').setAttribute('aria-pressed', String(!v)); }
$('playBtn').onclick = () => { if (finished) return startTour(path.pickup.id); setPlaying(!playing); };
$('viewBtn').onclick = () => setView(view === 'inside' ? 'outside' : 'inside');
$('lookBtn').onclick = () => { lookYaw = lookPitch = 0; applyLook(); };
for (const b of document.querySelectorAll('[data-speed]')) b.onclick = () => { speedMul = +b.dataset.speed; for (const o of document.querySelectorAll('[data-speed]')) o.setAttribute('aria-pressed', String(o === b)); };
const showPicker = () => { setPlaying(false); $('pickup').hidden = false; $('arrived').hidden = true; };
$('changeBtn').onclick = showPicker; $('againPick').onclick = showPicker;
$('again').onclick = () => startTour(path.pickup.id);
for (const b of document.querySelectorAll('[data-pickup]')) b.onclick = () => startTour(b.dataset.pickup);
for (const id of Object.keys(PICKUPS)) {
  const p = buildCarPath(id, 4); const el = document.querySelector(`[data-km="${id}"]`); if (el) el.textContent = `≈ ${p.totalKm.toFixed(1)} km`;
}

// look around inside the cab by dragging (no drift: the view stays where you leave it)
let drag = null;
let swipe = null;
$('cockpits').addEventListener('pointerdown', e => { swipe = { x: e.clientX }; });
window.addEventListener('pointerup', e => { if (!swipe) return; const dx = e.clientX - swipe.x; swipe = null; if (Math.abs(dx) > 40) showPhoto(photoIdx + (dx > 0 ? -1 : 1)); });
$('lookL').onclick = () => view === 'rear' ? (lookYawTarget += Math.PI / 2) : showPhoto(photoIdx - 1); $('lookR').onclick = () => view === 'rear' ? (lookYawTarget -= Math.PI / 2) : showPhoto(photoIdx + 1);
window.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') $('lookL').click(); if (e.key === 'ArrowRight') $('lookR').click(); });
renderer.domElement.addEventListener('pointerdown', e => { if (view === 'photo') return; drag = { x: e.clientX, y: e.clientY, yaw: lookYaw, pitch: lookPitch }; renderer.domElement.setPointerCapture(e.pointerId); });
renderer.domElement.addEventListener('pointermove', e => {
  if (!drag) return; const k = 3.2 / stage.clientWidth;
  lookYaw = view === 'rear' ? drag.yaw + (e.clientX - drag.x) * k : Math.max(-2.6, Math.min(2.6, drag.yaw + (e.clientX - drag.x) * k)); lookYawTarget = lookYaw;
  lookPitch = Math.max(-0.9, Math.min(0.6, drag.pitch + (e.clientY - drag.y) * k));
  applyLook();
});
const endDrag = () => { drag = null; };
renderer.domElement.addEventListener('pointerup', endDrag); renderer.domElement.addEventListener('pointercancel', endDrag);

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.clearViewOffset();
  if (view === 'photo') {
    // match the photo: object-fit cover, same focal length, vanishing point under the photo's
    const sc = Math.max(w / PHOTO.w, h / PHOTO.h), ox = (w - PHOTO.w * sc) / 2, oy = (h - PHOTO.h * sc) / 2;
    const f = photoF() * sc;
    camera.fov = 2 * Math.atan(h / 2 / f) * 180 / Math.PI;
    const ph = PHOTOS[photoIdx];
    camera.setViewOffset(w, h, w / 2 - (ox + PHOTO.w / 2 * sc), h / 2 - (oy + ph.vy * sc), w, h);
    if (ph.screen) { const [x0, y0, x1, y1] = ph.screen, cs = $('cockpitScreen');
      Object.assign(cs.style, { left: ox + x0 * sc + 'px', top: oy + y0 * sc + 'px', width: (x1 - x0) * sc + 'px', height: (y1 - y0) * sc + 'px' }); }
  } else camera.fov = view === 'inside' || view === 'rear' ? (w < h ? 86 : 72) : (w < h ? 74 : 62);
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage); resize();

// ---------- loop ----------
let last = performance.now(), s0 = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (path && playing && !finished) {
    s = Math.min(path.totalS, s + speedFor(s) * speedMul * dt);
    if (s >= path.totalS - 0.01) { finished = true; setPlaying(false); $('playBtn').textContent = 'Ride again'; setTimeout(() => { if (finished) $('arrived').hidden = false; }, 900); }
  }
  if (path) {
    const prevS = s0; s0 = s; const p = placeCar(dt); updateHud(p);
    const v = dt > 0 ? (s - prevS) / dt / Math.max(1, speedMul) : 0;
    const h1 = pointAt(s + 2), h2 = pointAt(s + 14), h0 = pointAt(s - 10);
    const steer = Math.atan2(h2.x - h1.x, h2.z - h1.z) - Math.atan2(h1.x - h0.x, h1.z - h0.z);
    if (view !== 'outside') cabinKit.update(dt, { speedKmh: v > 0.3 ? 18 + v * 0.95 : 0, km: p.km, steer: Math.atan2(Math.sin(steer), Math.cos(steer)), s, pos: p, ...hudState });
    if (view === 'photo' && PHOTOS[photoIdx].screen) { const sc = cabinKit.screenCanvas, cs = $('cockpitScreen'); if (cs.width !== sc.width) { cs.width = sc.width; cs.height = sc.height; } cs.getContext('2d').drawImage(sc, 0, 0); }
  }
  { const back = view === 'rear' && Math.cos(lookYaw) < -0.25; for (const o of cabinKit.ownSeat) o.visible = !back; }
  if (view === 'rear' && !drag && Math.abs(lookYawTarget - lookYaw) > 1e-3) { lookYaw += (lookYawTarget - lookYaw) * Math.min(1, dt * 6); applyLook(); }
  if (view === 'photo') { const t = yawFor(PHOTOS[photoIdx]); photoYaw += (t - photoYaw) * Math.min(1, dt * 7); applyLook(); }
  if (bannerTimer > 0) { bannerTimer -= dt; if (bannerTimer <= 0) $('stopBanner').hidden = true; }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
// idle scene behind the pickup chooser: parked at Thudiyalur
path = buildCarPath('thudiyalur'); placeCar(); setView('outside'); path = null;
$('loading').hidden = true;
const want = new URLSearchParams(location.search).get('from');
if (want && PICKUPS[want]) startTour(want);
requestAnimationFrame(frame);
window.__tour = { eye, car, scene, camera, get s() { return s; }, get path() { return path; }, startTour, setView, get finished() { return finished; }, jump: v => { s = v; } };
