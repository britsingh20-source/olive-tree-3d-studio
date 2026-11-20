// Urban Heaven · Phase 2 — 3D layout with a build-up animation, shown after the cab enters the site.
// Plot outlines are traced from Bright's "Veerapandi Phase 2 Layout - A4.pdf" (site-layout.js).
// Axes: x east, z south (metres), y up. Entrance assumed from the 12.2 m Panchayat road on the east.
import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { LAYOUT } from './site-layout.js?v=s1';
import { NEARBY } from './nearby.js?v=n1';

const CAT = {
  sunshine: { name: 'Sunshine East', color: '#7fa6ec' },
  elegant: { name: 'Elegant North', color: '#c7a9ea' },
  ethnic: { name: 'Ethnic South', color: '#6fd0b4' },
  early: { name: 'Early Bird South', color: '#e7ec7a' },
};
const ORDER = ['sunshine', 'elegant', 'ethnic', 'early'];
const $ = id => document.getElementById(id);
const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
const back = t => { t = Math.min(1, Math.max(0, t)); const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

let hemi, sun, lamps = [], tweens = [], houses = new Map(), mood = 'day', showcase = false;
let renderer, scene, camera, controls, root, started = false, raf = 0, t0 = 0, clock = 0, playing = false, onExit = () => {};
const anim = [];      // { start, dur, fn(k) }
const plotMeshes = [];
let cab, cabPath, labelsGroup, pulse = null, selected = null, filterCat = null;

// bounds/centre of the layout
const B = LAYOUT.boundary, CX = (B[0][0] + B[1][0]) / 2, CZ = (B[0][1] + B[2][1]) / 2;
const W = LAYOUT.mainRoad.x1 + 6 - (B[0][0] - 6), D = B[2][1] - B[0][1];
const P = (x, z, y = 0) => new THREE.Vector3(x - CX, y, z - CZ);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function label(text, { size = 3, bg = 'rgba(17,20,24,.82)', fg = '#fff', w = 256, h = 128, font = 70 } = {}) {
  const tex = canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill();
    g.fillStyle = fg; g.font = `700 ${font}px "DM Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 4);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false })); // constant on-screen size, never giant up close
  const k = size * 0.0095 * (matchMedia('(max-width: 640px)').matches ? 0.85 : 1); s.scale.set(k * w / h, k, 1); s.renderOrder = 10; return s;
}
function shapeFrom(poly) {
  const s = new THREE.Shape(); poly.forEach(([x, z], i) => (i ? s.lineTo(x - CX, -(z - CZ)) : s.moveTo(x - CX, -(z - CZ)))); s.closePath(); return s;
}
function slab(poly, h, mat, y = 0) { // extruded polygon lying on the ground, top at y + h
  const g = new THREE.ExtrudeGeometry(shapeFrom(poly), { depth: h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  return new THREE.Mesh(g, mat);
}
const at = (start, dur, fn) => anim.push({ start, dur, fn });

// ---------- real surroundings ----------
// Approximate site centre (lat, lon); the map tour passes the computed position. Until Bright drops a pin
// for the gate, the imagery under the layout is the nearby area, not the exact plot land.
let SITE_CENTER = [11.186187, 76.948113]; // from Bright's pin 5WPX+F9
const TILE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/';
function lonLatToTile(lat, lon, z) {
  const n = 2 ** z, x = (lon + 180) / 360 * n, r = lat * Math.PI / 180;
  return [x, (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n];
}
const metresPerTile = (lat, z) => 40075016.686 * Math.cos(lat * Math.PI / 180) / 2 ** z;
function imageryPlane(z, span, y, renderOrder) {
  // a span x span grid of tiles at zoom z centred on the site, drawn into one canvas texture
  const [lat, lon] = SITE_CENTER, [fx, fy] = lonLatToTile(lat, lon, z), tx0 = Math.floor(fx) - (span >> 1), ty0 = Math.floor(fy) - (span >> 1);
  const c = document.createElement('canvas'); c.width = c.height = span * 256; const g = c.getContext('2d');
  g.fillStyle = '#7d8a5c'; g.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mpt = metresPerTile(lat, z), size = span * mpt;
  const mat = new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -renderOrder, polygonOffsetUnits: -renderOrder * 4 }); // finer layer always wins, no flicker
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat); mesh.rotation.x = -Math.PI / 2; mesh.receiveShadow = true; mesh.renderOrder = renderOrder;
  // place so the site centre lands on the layout centre (0,0)
  mesh.position.set((tx0 + span / 2 - fx) * mpt, y, (ty0 + span / 2 - fy) * mpt);
  let pending = span * span;
  for (let i = 0; i < span; i++) for (let j = 0; j < span; j++) {
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => { g.drawImage(im, i * 256, j * 256); tex.needsUpdate = true; if (--pending === 0) mesh.userData.ready = true; };
    im.onerror = () => { pending--; };
    im.src = `${TILE}${z}/${ty0 + j}/${tx0 + i}`;
  }
  return mesh;
}
function realGround(parent) {
  parent.add(imageryPlane(14, 9, -1.4, -1));  // ~22 km wide, so the 5 km rings sit on real ground
  parent.add(imageryPlane(15, 7, -0.9, 0));   // ~8 km wide
  parent.add(imageryPlane(17, 9, -0.5, 1));   // ~2.7 km wide, detailed fields, trees, houses
  parent.add(imageryPlane(19, 6, -0.2, 2));   // ~0.45 km wide, sharp close-up around the site
}
function skyTexture() {
  return canvasTexBare(4, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#5d93c9'); gr.addColorStop(0.42, '#9fc0dc'); gr.addColorStop(0.56, '#c3d3dc'); gr.addColorStop(1, '#c9d6dc');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
}
function canvasTexBare(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

function build() {
  scene = new THREE.Scene();
  scene.background = skyTexture(); scene.fog = new THREE.Fog('#c9d6dc', 900, 16000);
  scene.add(new THREE.HemisphereLight('#eef5ff', '#6f6a55', 1.35));
  hemi = scene.children.find(o => o.isHemisphereLight);
  sun = new THREE.DirectionalLight('#fff1d6', 2.4); sun.position.set(-60, 120, -40); sun.castShadow = true;
  sun.shadow.bias = -0.0006; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, far: 400 });
  scene.add(sun);
  root = new THREE.Group(); scene.add(root);

  // surroundings: REAL satellite imagery around the site (Esri World Imagery, loaded live, CORS-enabled)
  realGround(root);
  let seed = 11; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const trunk = new THREE.MeshLambertMaterial({ color: '#6b5238' });

  // site earth pad (red soil) — appears first
  const earthM = new THREE.MeshLambertMaterial({ color: '#b98258', transparent: true, opacity: 0 });
  const earth = slab(B, 0.12, earthM); earth.receiveShadow = true; root.add(earth);
  at(0, 0.8, k => { earthM.opacity = k; earthM.transparent = k < 1; earthM.depthWrite = k >= 1; earthM.needsUpdate = true; });

  // boundary: compound wall drawn around (grows along its length)
  const wallM = new THREE.MeshLambertMaterial({ color: '#efe8da' });
  const corners = B.concat([B[0]]);
  corners.slice(0, -1).forEach((a, i) => {
    const b = corners[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (i === 1) return; // east side stays open to the Panchayat road
    const wall = new THREE.Mesh(new THREE.BoxGeometry(len, 1.2, 0.25), wallM); wall.castShadow = true;
    const mid = P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.6); wall.position.copy(mid); wall.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    wall.scale.x = 0.001; root.add(wall);
    at(0.4 + i * 0.25, 0.8, k => { wall.scale.x = Math.max(0.001, ease(k)); });
  });

  // 12.2 m existing Panchayat road (east)
  const asphalt = new THREE.MeshLambertMaterial({ color: '#3c3e41' });
  const RL = D + 70, mr = LAYOUT.mainRoad, mainRoad = new THREE.Mesh(new THREE.BoxGeometry(mr.x1 - mr.x0, 0.3, RL), asphalt); // site frontage only; the real road continues in the imagery
  mainRoad.position.copy(P((mr.x0 + mr.x1) / 2, CZ, 0.15)); mainRoad.receiveShadow = true; root.add(mainRoad);
  const gift = slab(LAYOUT.giftStrip, 0.06, new THREE.MeshLambertMaterial({ color: '#c8c0b2' })); root.add(gift);
  const dashTex = canvasTex(32, 256, (g, w, h) => { g.fillStyle = '#3c3e41'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2f2ea'; g.fillRect(w / 2 - 2, 0, 4, h * 0.5); });
  dashTex.wrapT = THREE.RepeatWrapping; dashTex.repeat.set(1, RL / 10);
  const mrLine = new THREE.Mesh(new THREE.PlaneGeometry(0.4, RL), new THREE.MeshBasicMaterial({ map: dashTex }));
  mrLine.rotation.x = -Math.PI / 2; mrLine.position.copy(P((mr.x0 + mr.x1) / 2, CZ, 0.34)); root.add(mrLine);
  const mrLbl = label('12.2 m Panchayat Road', { size: 2.6, w: 600, font: 54 }); mrLbl.position.copy(P((mr.x0 + mr.x1) / 2, B[0][1] - 14, 2)); root.add(mrLbl);

  // internal roads roll out from the main road westwards
  for (const [i, r] of LAYOUT.roads.entries()) {
    const len = mr.x0 - B[0][0];
    const road = new THREE.Mesh(new THREE.BoxGeometry(len, 0.3, r.z1 - r.z0), asphalt); road.receiveShadow = true;
    const g = new THREE.Group(); g.position.copy(P(mr.x0, (r.z0 + r.z1) / 2, 0.15)); root.add(g);
    road.position.x = -len / 2; g.add(road);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.25), new THREE.MeshBasicMaterial({ color: '#f2f2ea' }));
    line.rotation.x = -Math.PI / 2; line.position.set(-len / 2, 0.19, 0); g.add(line); // 4 cm above the 30 cm road slab
    const lbl = label(r.name.replace('wide road', 'road'), { size: 2.2, w: 360, font: 60 }); lbl.position.set(-len * 0.18, 1.2, 0); g.add(lbl); lbl.visible = false;
    g.scale.x = 0.001;
    at(1.4 + i * 0.3, 1.1, k => { g.scale.x = Math.max(0.001, ease(k)); lbl.visible = k > 0.9; });
  }

  // street lights along every internal road edge + avenue trees on the Panchayat road
  const poleM = new THREE.MeshStandardMaterial({ color: '#c9ced3', roughness: 0.35, metalness: 0.7 });
  const headM = new THREE.MeshStandardMaterial({ color: '#fff4d6', emissive: '#ffcf6b', emissiveIntensity: 0 });
  const glowTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,120,1)'); gr.addColorStop(1, 'rgba(255,190,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const poolTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,200,110,.55)'); gr.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const lamp = (x, z, faceZ, delay) => {
    const g = new THREE.Group(); g.position.copy(P(x, z)); root.add(g);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 6, 8), poleM); pole.position.y = 3; pole.castShadow = true; g.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.2), poleM); arm.position.set(0, 5.95, faceZ * 0.6); g.add(arm);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.6), headM); head.position.set(0, 5.88, faceZ * 1.15); g.add(head);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); glow.scale.setScalar(3.2); glow.position.copy(head.position); g.add(glow);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.36, faceZ * 2.2); g.add(pool);
    lamps.push({ glow, pool }); g.scale.setScalar(0.001); at(delay, 0.6, k => g.scale.setScalar(Math.max(0.001, back(k))));
  };
  LAYOUT.roads.forEach((r, i) => {
    for (let x = B[0][0] + 6, j = 0; x < mr.x0 - 3; x += 13, j++) {
      const north = j % 2 === 0; // staggered on both sides
      lamp(x, north ? r.z0 + 0.35 : r.z1 - 0.35, north ? 1 : -1, 2.4 + i * 0.2 + j * 0.04);
    }
  });
  for (let z = B[0][1] - 30; z < B[2][1] + 30; z += 11) {
    const tx = mr.x1 + 3.2, tree = new THREE.Group(); tree.position.copy(P(tx, z)); root.add(tree);
    const hgt = 3 + rnd() * 1.5, tt = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, hgt, 7), trunk); tt.position.y = hgt / 2; tt.castShadow = true; tree.add(tt);
    for (let k = 0; k < 6; k++) { const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(1 + rnd() * 0.7, 1), new THREE.MeshStandardMaterial({ color: ['#2f5e27', '#3d6f2e', '#4a7d35'][k % 3], roughness: 0.95, flatShading: true })); leaf.position.set((rnd() - 0.5) * 2.2, hgt + 0.6 + rnd() * 1.2, (rnd() - 0.5) * 2.2); leaf.castShadow = true; tree.add(leaf); }
    tree.scale.setScalar(0.001); at(2.2 + (z - B[0][1]) / 400, 0.7, k => tree.scale.setScalar(Math.max(0.001, back(k))));
  }

  // park with trees, P and EB
  for (const e of LAYOUT.extras) {
    const isPark = e.id === 'park';
    const m = new THREE.MeshLambertMaterial({ color: isPark ? '#79b85a' : e.id === 'P' ? '#e06d5a' : '#5ea154' });
    const s = slab(e.poly, isPark ? 0.25 : 0.6, m); s.receiveShadow = true; s.castShadow = !isPark; root.add(s);
    s.scale.y = 0.001; at(2.6, 0.8, k => { s.scale.y = Math.max(0.001, back(k)); });
    const lbl = label(isPark ? 'Park · பூங்கா' : e.id === 'P' ? 'P' : 'EB', { size: isPark ? 2.6 : 2, w: isPark ? 420 : 160, font: 64 });
    lbl.position.copy(P(e.c[0], e.c[1], isPark ? 6 : 3)); lbl.visible = false; root.add(lbl);
    at(3.2, 0.1, k => { lbl.visible = k > 0.5; });
    if (isPark) {
      const xs = e.poly.map(p => p[0]), zs = e.poly.map(p => p[1]);
      for (let i = 0; i < 14; i++) {
        const tx = Math.min(...xs) + 2.5 + (i % 7) * (Math.max(...xs) - Math.min(...xs) - 5) / 6, tz = Math.min(...zs) + (i < 7 ? 3 : 8.5);
        const tree = new THREE.Group(); tree.position.copy(P(tx, tz, 0.25)); root.add(tree);
        const hgt = 2.2 + rnd() * 1.4, tt = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, hgt, 7), trunk); tt.position.y = hgt / 2; tt.castShadow = true; tree.add(tt);
        for (let k = 0; k < 5; k++) { // clustered canopy reads as foliage, not a ball
          const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75 + rnd() * 0.55, 1), new THREE.MeshStandardMaterial({ color: ['#2f5e27', '#3d6f2e', '#4a7d35', '#567f3a'][(i + k) % 4], roughness: 0.95, flatShading: true }));
          leaf.position.set((rnd() - 0.5) * 1.6, hgt + 0.4 + rnd() * 0.9, (rnd() - 0.5) * 1.6); leaf.castShadow = true; tree.add(leaf);
        }
        tree.rotation.y = rnd() * 6; tree.scale.setScalar(0.001);
        at(2.9 + i * 0.05, 0.7, k => tree.scale.setScalar(Math.max(0.001, back(k) * (0.9 + (i % 3) * 0.12))));
      }
    }
  }

  // plots: rise category by category with a stagger, kerb stones + number label
  labelsGroup = new THREE.Group(); root.add(labelsGroup);
  const kerbM = new THREE.MeshLambertMaterial({ color: '#f4f1ea' });
  let order = 0;
  for (const cat of ORDER) {
    for (const p of LAYOUT.plots.filter(q => q.cat === cat).sort((a, b) => a.n - b.n)) {
      const mat = new THREE.MeshStandardMaterial({ color: CAT[cat].color, roughness: 0.7, emissive: '#000000', transparent: true });
      const g = new THREE.Group(); root.add(g);
      const pad = slab(p.poly, 0.5, mat, 0.12); pad.castShadow = true; pad.receiveShadow = true; g.add(pad);
      // kerb outline
      const pts = p.poly.concat([p.poly[0]]), kerbs = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 0.3) continue;
        const k = new THREE.Mesh(new THREE.BoxGeometry(len, 0.2, 0.18), kerbM);
        k.position.copy(P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.72)); k.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); g.add(k); kerbs.push(k);
      }
      const lbl = label(String(p.n), { size: 2.4, w: 160, font: 84, bg: 'rgba(17,20,24,.78)' }); lbl.position.copy(P(p.c[0], p.c[1], 2.6)); lbl.visible = false; labelsGroup.add(lbl);
      pad.userData.plot = p; pad.userData.group = g; pad.userData.mat = mat; pad.userData.label = lbl; plotMeshes.push(pad);
      g.position.y = 6; g.scale.y = 0.001; mat.opacity = 0;
      const start = 3.4 + order * 0.07; order++;
      at(start, 0.7, k => { const e = back(k); g.position.y = 6 * (1 - ease(k)); g.scale.y = Math.max(0.001, e); mat.opacity = Math.min(1, k * 2); if (k >= 1) { mat.transparent = false; mat.needsUpdate = true; } else if (!mat.transparent) { mat.transparent = true; mat.needsUpdate = true; } lbl.visible = k > 0.6; pad.castShadow = k > 0.7; pad.visible = k > 0.01; mat.depthWrite = k >= 1; for (const kb of kerbs) kb.visible = k > 0.55; });
    }
  }

  // entrance arch on the 9.0 m road at the Panchayat road (assumed main entrance)
  const r9 = LAYOUT.roads.find(r => r.w === 9), ez = (r9.z0 + r9.z1) / 2, ex = LAYOUT.boundary[1][0] + 0.6;
  const arch = new THREE.Group(); arch.position.copy(P(ex, ez)); root.add(arch);
  const pil = new THREE.MeshLambertMaterial({ color: '#efe6d2' }), grn = new THREE.MeshLambertMaterial({ color: '#2e6b4f' });
  for (const s of [-1, 1]) { const pp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 6, 0.9), pil); pp.position.set(0, 3, s * 5.4); pp.castShadow = true; arch.add(pp); }
  const beamTex = canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#2e6b4f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d9b96a'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 104px Georgia, serif'; g.fillText('URBAN HEAVEN', w / 2, h * 0.42);
    g.fillStyle = '#e9d69a'; g.font = '600 40px "DM Sans", sans-serif'; g.fillText('PHASE 2 · OLIVETREE BUILDERS', w / 2, h * 0.76);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.2, 11.6), [grn, grn, grn, grn, new THREE.MeshBasicMaterial({ map: beamTex }), new THREE.MeshBasicMaterial({ map: beamTex })]);
  beam.position.y = 6.6; beam.rotation.y = Math.PI / 2; beam.castShadow = true; arch.add(beam);
  arch.scale.setScalar(0.001); at(6.2, 0.8, k => arch.scale.setScalar(Math.max(0.001, back(k))));

  // the cab drives up the Panchayat road and turns in through the arch
  cab = new THREE.Group(); root.add(cab);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.0, 4.6), new THREE.MeshStandardMaterial({ color: '#111418', roughness: 0.25, metalness: 0.5 })); body.position.y = 0.85; body.castShadow = true;
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.7, 2.6), new THREE.MeshStandardMaterial({ color: '#26323b', roughness: 0.1, metalness: 0.6 })); top.position.set(0, 1.65, 0.3);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 0.3), new THREE.MeshLambertMaterial({ color: '#f6c519' })); sign.position.set(0, 2.15, 0.2);
  cab.add(body, top, sign); cab.visible = false;
  const roadX = (mr.x0 * 0.35 + mr.x1 * 0.65); // southbound, keep left = east lane (India drives on the left)
  cabPath = new THREE.CatmullRomCurve3([P(roadX, B[0][1] - 34), P(roadX, ez - 18), P(roadX - 2, ez - 4), P(mr.x0 - 1, ez + 1.6), P(ex - 8, ez + 1.6), P(ex - 22, ez + 1.6)]); // arrives from the north, as on the real roads
  at(6.6, 4.2, k => {
    cab.visible = k > 0; const u = ease(k) * 0.999, p = cabPath.getPointAt(u), q = cabPath.getPointAt(Math.min(1, u + 0.002));
    cab.position.copy(p); cab.lookAt(q.x, p.y, q.z); cab.rotateY(Math.PI);
  });

  // camera: start straight down (continuing from the map), then swing into a 3D bird's-eye view
  const camFrom = new THREE.Vector3(0, 320, 0.01), camTo = new THREE.Vector3(105, 90, 115);
  at(0, 6.5, k => { const e = ease(k); camera.position.lerpVectors(camFrom, camTo, e); camera.lookAt(0, 0, 0); });
  at(10.8, 0.1, () => { finishIntro(); });
}

// ---------- nearby schools / colleges / hospitals ----------
const NB_STYLE = { school: { icon: '🏫', color: '#2f7dff', label: 'Schools' }, college: { icon: '🎓', color: '#9b59d6', label: 'Colleges' }, hospital: { icon: '🏥', color: '#e0303a', label: 'Hospitals' } };
let nbGroup, nbItems = [], nbCat = null, nbFly = null;
function nbPos(r) {
  const k = 111320, x = (r.lon - SITE_CENTER[1]) * k * Math.cos(SITE_CENTER[0] * Math.PI / 180), z = (SITE_CENTER[0] - r.lat) * k;
  return new THREE.Vector3(x, 0, z);
}
function pinSprite(text, color, big = false) {
  const h = 120, mc = document.createElement('canvas').getContext('2d'); mc.font = `700 ${big ? 52 : 44}px "DM Sans", sans-serif`;
  const w = Math.min(640, Math.ceil(mc.measureText(text).width) + 48);
  const tex = canvasTex(w, h, (g) => {
    g.fillStyle = color; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 26); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle';
    let fs = big ? 52 : 44; g.font = `700 ${fs}px "DM Sans", sans-serif`;
    while (g.measureText(text).width > w - 40 && fs > 22) { fs -= 2; g.font = `700 ${fs}px "DM Sans", sans-serif`; }
    g.fillText(text, 22, h / 2 + 2);
  });
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false, fog: false }));
  const sc = big ? 0.062 : (matchMedia('(max-width: 640px)').matches ? 0.04 : 0.046); sp.scale.set(sc * w / h, sc, 1); sp.center.set(0.5, 0); sp.renderOrder = 20; return sp;
}
function buildNearby() {
  nbGroup = new THREE.Group(); nbGroup.visible = false; scene.add(nbGroup);
  // distance rings 1 / 3 / 5 km around the site
  for (const km of [1, 3, 5]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(km * 1000 - 6 * km, km * 1000 + 6 * km, 160), new THREE.MeshBasicMaterial({ color: '#f6c519', transparent: true, opacity: 0.85, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 2; nbGroup.add(ring);
    const lbl = pinSprite(`${km} km`, 'rgba(17,20,24,.85)'); lbl.scale.multiplyScalar(0.8); lbl.position.set(0, 4, -km * 1000); nbGroup.add(lbl);
  }
  const home = pinSprite('★ Urban Heaven', '#2e6b4f', true); home.position.set(0, 40, 0); nbGroup.add(home);
  const homeDot = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, 3, 32), new THREE.MeshBasicMaterial({ color: '#2e6b4f' })); homeDot.position.y = 2; nbGroup.add(homeDot);
  for (const r of NEARBY) {
    const st = NB_STYLE[r.cat], pos = nbPos(r), g = new THREE.Group(); g.position.copy(pos); nbGroup.add(g);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 160, 8), new THREE.MeshBasicMaterial({ color: st.color })); stem.position.y = 80; g.add(stem);
    const dot = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 3, 24), new THREE.MeshBasicMaterial({ color: st.color })); dot.position.y = 2; g.add(dot);
    const lbl = pinSprite(`${st.icon} ${r.name.replace(/, Coimbatore$/, '')}`, st.color); lbl.position.y = 165; g.add(lbl);
    nbItems.push({ r, g, lbl });
  }
}
// IPL-style "six" arcs: a ball flies from Urban Heaven to each place, leaving a glowing trail,
// with the distance shown at the top of the arc.
const arcs = []; let arcClock = 0;
function arcFor(it) {
  if (it.arc) return it.arc;
  const end = nbPos(it.r), d = end.length(), h = Math.max(450, d * 0.42);
  const mid = end.clone().multiplyScalar(0.5); mid.y = h * 2; // quadratic control point -> apex height h
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 30, 0), mid, end.clone().setY(8));
  const col = NB_STYLE[it.r.cat].color, segs = 120;
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, Math.max(14, d * 0.0045), 8, false), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 1, depthWrite: false, fog: false }));
  const glow = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, Math.max(34, d * 0.011), 8, false), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending }));
  const ball = new THREE.Mesh(new THREE.SphereGeometry(Math.max(40, d * 0.012), 20, 14), new THREE.MeshBasicMaterial({ color: '#fff7e0' }));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,240,180,1)'); gr.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(Math.max(260, d * 0.08)); ball.add(halo);
  const km = pinSprite(`${it.r.km.toFixed(1)} km`, '#111418', true); km.position.copy(curve.getPoint(0.68)).add(new THREE.Vector3(0, 60, 0)); km.center.set(0.5, 0);
  const g = new THREE.Group(); g.add(glow, tube, ball, km); g.visible = false; nbGroup.add(g);
  it.arc = { g, tube, glow, ball, km, curve, n: tube.geometry.index.count, start: 0, dur: 1.3 };
  return it.arc;
}
function launchArcs(items) {
  for (const it of nbItems) if (it.arc) it.arc.g.visible = false;
  arcs.length = 0; arcClock = 0;
  items.sort((a, b) => a.r.km - b.r.km).forEach((it, i) => { const a = arcFor(it); a.start = 0.9 + i * 0.3; a.g.visible = false; arcs.push(a); });
}
function tickArcs(dt) {
  if (!arcs.length) return; arcClock += dt;
  for (const a of arcs) {
    const k = Math.min(1, Math.max(0, (arcClock - a.start) / a.dur)); if (k <= 0) { a.g.visible = false; continue; }
    a.g.visible = true; const e = 1 - Math.pow(1 - k, 2);
    const cnt = Math.max(6, Math.floor(a.n * e / 6) * 6); a.tube.geometry.setDrawRange(0, cnt); a.glow.geometry.setDrawRange(0, cnt);
    a.ball.position.copy(a.curve.getPoint(e)); a.ball.visible = k < 1;
    a.km.visible = k > 0.7; a.km.material.opacity = Math.min(1, (k - 0.7) * 5);
  }
}

function showNearby(cat) {
  nbCat = cat; $('siteHint').hidden = true; nbGroup.visible = true; labelsGroup.visible = false;
  for (const it of nbItems) { it.g.visible = !cat || it.r.cat === cat; it.lbl.material.opacity = 1; it.g.scale.setScalar(1); }
  const shown = nbItems.filter(it => !cat || it.r.cat === cat), far = Math.max(...shown.map(it => it.r.km)) * 1000;
  flyTo(new THREE.Vector3(0, 0, 0), Math.max(4200, far * 1.75), 0.62);
  scene.fog.near = 30000; scene.fog.far = 60000; // clear air for the overview
  launchArcs(nbItems.filter(it => !cat || it.r.cat === cat));
}
function hideNearby() { scene.fog.near = 900; scene.fog.far = 16000; arcs.length = 0; for (const it of nbItems) if (it.arc) it.arc.g.visible = false; nbCat = null; $('siteHint').hidden = false; if (nbGroup) nbGroup.visible = false; labelsGroup.visible = true; flyTo(new THREE.Vector3(0, 0, 0), 190, 0.75); }
function focusNearby(r) {
  for (const it of nbItems) { const on = it.r === r; it.g.visible = on || !nbCat || it.r.cat === nbCat; it.lbl.material.opacity = on ? 1 : 0.35; it.g.scale.setScalar(on ? 1.4 : 1); }
  const p = nbPos(r); flyTo(p.clone().multiplyScalar(0.5), Math.max(2000, r.km * 1000 * 1.5), 0.95);
  const it = nbItems.find(x => x.r === r); launchArcs([it]); arcs[0].start = 0.6;
}
function flyTo(target, distance, polar) { // smooth camera move; keeps the current compass direction
  const dir = camera.position.clone().sub(controls.target); dir.y = 0; if (dir.lengthSq() < 1) dir.set(1, 0, 1); dir.normalize();
  const end = target.clone().add(dir.multiplyScalar(Math.sin(polar) * distance)); end.y = Math.cos(polar) * distance;
  nbFly = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP: end, toT: target.clone() };
}

// ---------- moods: day / sunset / night ----------
function sky(stops) { return canvasTexBare(4, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); }
const MOODS = {
  day: { sky: [[0, '#5d93c9'], [0.42, '#9fc0dc'], [0.56, '#c3d3dc'], [1, '#c9d6dc']], fog: '#c9d6dc', hemi: ['#eef5ff', '#6f6a55', 1.35], sun: ['#fff1d6', 2.4, [-60, 120, -40]], lamps: 0, glow: 0 },
  sunset: { sky: [[0, '#2c3e70'], [0.35, '#c4607a'], [0.5, '#f29a52'], [0.58, '#f7c27a'], [1, '#e9b98a']], fog: '#e7b48a', hemi: ['#ffd2a8', '#4a3a52', 0.85], sun: ['#ff9a4a', 2.1, [-140, 28, 30]], lamps: 0.7, glow: 0.12 },
  night: { sky: [[0, '#050a1a'], [0.45, '#0d1a36'], [0.58, '#1c2a4a'], [1, '#141d30']], fog: '#141d30', hemi: ['#5c6f9e', '#0b0d14', 0.32], sun: ['#9fb4ff', 0.25, [80, 120, -60]], lamps: 1, glow: 0.28 },
};
function setMood(name) {
  mood = name; const m = MOODS[name];
  scene.background = sky(m.sky); scene.fog.color.set(m.fog);
  hemi.color.set(m.hemi[0]); hemi.groundColor.set(m.hemi[1]); hemi.intensity = m.hemi[2];
  sun.color.set(m.sun[0]); sun.intensity = m.sun[1]; sun.position.set(...m.sun[2]);
  for (const l of lamps) { l.glow.material.opacity = m.lamps; l.pool.material.opacity = m.lamps * 0.9; }
  lamps.length && (lamps[0].glow.parent.children[2].material.emissiveIntensity = m.lamps * 2.2);
  for (const pm of plotMeshes) { pm.userData.mat.emissive.set(pm === selected ? '#5a4a00' : pm.userData.mat.color).multiplyScalar(pm === selected ? 1 : m.glow); }
  for (const b of document.querySelectorAll('[data-mood]')) b.setAttribute('aria-pressed', String(b.dataset.mood === name));
}

// ---------- sample home on a plot ----------
function sampleHome(p) {
  const xs = p.poly.map(q => q[0]), zs = p.poly.map(q => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  // which side faces a road: north/south internal road, else the Panchayat road on the east
  const north = LAYOUT.roads.some(r => Math.abs(z0 - r.z1) < 1.5), south = LAYOUT.roads.some(r => Math.abs(z1 - r.z0) < 1.5);
  const front = north ? 'n' : south ? 's' : 'e';
  const set = { n: [1, 1, 2.6, 1.2], s: [1, 1, 1.2, 2.6], e: [1.2, 2.6, 1, 1] }[front]; // [west, east, north, south] setbacks
  const hx0 = x0 + set[0], hx1 = x1 - set[1], hz0 = z0 + set[2], hz1 = z1 - set[3];
  const W = hx1 - hx0, Dd = hz1 - hz0, cx = (hx0 + hx1) / 2, cz = (hz0 + hz1) / 2;
  const g = new THREE.Group(); g.position.copy(P(cx, cz, 0.62)); root.add(g);
  const wall = new THREE.MeshStandardMaterial({ color: '#fbf3e4', roughness: 0.8 }), wood = new THREE.MeshStandardMaterial({ color: '#9a6238', roughness: 0.55 }), accent = new THREE.MeshStandardMaterial({ color: '#c8693f', roughness: 0.7 });
  const glass = new THREE.MeshStandardMaterial({ color: '#7fa6c2', roughness: 0.08, metalness: 0.3, emissive: '#ffcf80', emissiveIntensity: mood === 'day' ? 0 : 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: '#3a3d42', roughness: 0.7 }), grey = new THREE.MeshStandardMaterial({ color: '#c9c3b8', roughness: 0.9 });
  const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  // local frame: +z points to the front (road) side
  const rotY = { n: Math.PI, s: 0, e: Math.PI / 2 }[front];
  const fw = front === 'e' ? Dd : W, fd = front === 'e' ? W : Dd; // width along the front, depth into the plot
  const body = new THREE.Group(); body.rotation.y = rotY; g.add(body);
  const put = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; body.add(m); return m; };
  put(new THREE.BoxGeometry(fw, 0.45, fd), grey, 0, 0.22, 0);                                   // plinth
  put(new THREE.BoxGeometry(fw, 3.1, fd * 0.92), wall, 0, 0.45 + 1.55, -fd * 0.04);             // ground floor
  put(new THREE.BoxGeometry(fw * 0.82, 3.0, fd * 0.7), wall, -fw * 0.09, 3.55 + 1.5, -fd * 0.12); // first floor (stepped back)
  put(new THREE.BoxGeometry(fw * 0.86, 0.25, fd * 0.74), dark, -fw * 0.09, 6.15, -fd * 0.12);    // roof slab
  put(new THREE.BoxGeometry(fw * 0.32, 0.9, fd * 0.3), wall, fw * 0.2, 6.7, -fd * 0.3);           // staircase head room
  put(new THREE.BoxGeometry(fw * 0.84, 0.5, 0.12), accent, -fw * 0.09, 6.0, fd * 0.23 + 0.06);  // terracotta parapet band
  put(new THREE.BoxGeometry(fw * 1.02, 0.28, 0.5), accent, 0, 3.45, fd * 0.42);                 // ground-floor sunshade
  const lawn = put(new THREE.BoxGeometry(fw * 0.96, 0.05, 1.6), new THREE.MeshStandardMaterial({ color: '#5e9a45', roughness: 1 }), 0, 0.03, fd / 2 + 0.05); lawn.castShadow = false;
  put(new THREE.BoxGeometry(fw * 0.42, 0.14, 1.4), dark, fw * 0.26, 3.62, fd * 0.36);           // balcony slab
  put(new THREE.BoxGeometry(fw * 0.42, 0.9, 0.06), glass, fw * 0.26, 4.1, fd * 0.36 + 0.68);     // glass railing
  put(new THREE.BoxGeometry(fw * 0.3, 2.1, 0.08), wood, -fw * 0.22, 1.5, fd * 0.42 + 0.02);      // wooden main door + cladding
  put(new THREE.BoxGeometry(fw * 0.34, 1.5, 0.06), glass, fw * 0.2, 1.8, fd * 0.42 + 0.03);      // ground window
  put(new THREE.BoxGeometry(fw * 0.3, 1.7, 0.06), glass, -fw * 0.16, 4.9, fd * 0.23 + 0.03);     // first-floor window
  put(new THREE.BoxGeometry(fw * 0.12, 6.2, 0.4), wood, fw * 0.47, 3.4, fd * 0.3);               // vertical wood fin
  put(new THREE.BoxGeometry(fw, 0.9, 0.18), wall, 0, 0.45, fd / 2 + set[2] * 0.0 + 1.0);         // front compound wall
  put(new THREE.BoxGeometry(fw * 0.34, 1.2, 0.08), dark, fw * 0.25, 0.75, fd / 2 + 1.05);        // gate
  const tag = pinSprite(`Sample home · Plot ${p.n}`, '#2e6b4f'); tag.position.set(0, 8.5, 0); g.add(tag);
  g.scale.set(1, 0.001, 1); tweens.push({ t: 0, dur: 1.3, fn: k => g.scale.set(1, Math.max(0.001, back(k)), 1) });
  return g;
}
function toggleHome(p) {
  if (houses.has(p.n)) { root.remove(houses.get(p.n)); houses.delete(p.n); }
  else houses.set(p.n, sampleHome(p));
  if (selected) select(selected);
}

function finishIntro() {
  if (!playing) return; playing = false;
  controls.enabled = true; controls.target.set(0, 0, 0); controls.update();
  $('siteHint').hidden = false; $('siteReplay').hidden = false; $('nearStrip').hidden = false; $('moodBar').hidden = false;
  setShowcase(true);
}

function setShowcase(on) { showcase = on; controls.autoRotate = on; controls.autoRotateSpeed = 0.6; const b = $('showBtn'); if (b) b.setAttribute('aria-pressed', String(on)); }
function select(mesh) {
  if (selected) { selected.userData.mat.emissive.copy(selected.userData.mat.color).multiplyScalar(MOODS[mood].glow); selected.userData.group.position.y = 0; }
  selected = mesh;
  const card = $('plotCard');
  if (!mesh) { card.hidden = true; return; }
  const p = mesh.userData.plot; mesh.userData.mat.emissive.set('#5a4a00'); mesh.userData.group.position.y = 0.5;
  const faces = LAYOUT.roads.filter(r => p.poly.some(([, z]) => Math.abs(z - r.z0) < 1.2 || Math.abs(z - r.z1) < 1.2)).map(r => r.name.replace(' wide road', ' road'));
  card.innerHTML = `<button class="x" aria-label="Close">×</button><p class="eyebrow">${CAT[p.cat].name.toUpperCase()}</p><h3>Plot ${p.n}</h3>
    <dl><div><dt>Area</dt><dd>${p.sqft.toLocaleString('en-IN')} sq.ft</dd></div><div><dt>Sq.m</dt><dd>${p.sqm}</dd></div><div><dt>Cents</dt><dd>${p.cent}</dd></div>
    ${faces.length ? `<div class="wide"><dt>Facing</dt><dd>${[...new Set(faces)].join(' & ')}</dd></div>` : ''}</dl>
    <button class="home-btn">${houses.has(p.n) ? 'Remove sample home' : '🏠 See a sample home here'}</button>
    <p class="fine">Indicative · refer to the DTCP approved plan (No. 25/2025)${houses.has(p.n) ? ' · sample G+1 home for illustration only' : ''}</p>`;
  card.querySelector('.x').onclick = () => select(null);
  card.querySelector('.home-btn').onclick = () => toggleHome(p);
  card.hidden = false;
}
function setFilter(cat) {
  filterCat = filterCat === cat ? null : cat;
  for (const m of plotMeshes) {
    const on = !filterCat || m.userData.plot.cat === filterCat;
    const mt = m.userData.mat; mt.transparent = !on; mt.opacity = on ? 1 : 0.15; mt.depthWrite = on; mt.needsUpdate = true; m.userData.label.visible = on;
    m.userData.group.position.y = on && filterCat ? 0.35 : 0;
  }
  for (const b of document.querySelectorAll('[data-cat]')) b.setAttribute('aria-pressed', String(b.dataset.cat === filterCat));
}

function resize() {
  const el = $('site3d'), w = el.clientWidth, h = el.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 62 : 45; camera.updateProjectionMatrix();
}
function loop(now) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - (loop.last || now)) / 1000); loop.last = now;
  if (playing) {
    clock += dt;
    for (const a of anim) { const k = (clock - a.start) / a.dur; if (k >= 0 && (k <= 1 || !a.done)) { a.fn(Math.min(1, k)); if (k >= 1) a.done = true; } }
  } else {
    tickArcs(dt);
    for (const tw of tweens) { tw.t = Math.min(1, tw.t + dt / tw.dur); tw.fn(tw.t); } for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].t >= 1) tweens.splice(i, 1);
    if (nbFly) { nbFly.t = Math.min(1, nbFly.t + dt / 1.4); const e = ease(nbFly.t); camera.position.lerpVectors(nbFly.fromP, nbFly.toP, e); controls.target.lerpVectors(nbFly.fromT, nbFly.toT, e); if (nbFly.t >= 1) nbFly = null; }
    controls.update();
  }
  renderer.render(scene, camera);
}
function replay() {
  for (const a of anim) { a.done = false; a.fn(0); }
  select(null); if (filterCat) setFilter(filterCat); for (const h of houses.values()) root.remove(h); houses.clear(); if (controls) setShowcase(false); $('moodBar').hidden = true;
  clock = 0; playing = true; controls.enabled = false; $('siteHint').hidden = true; $('nearStrip').hidden = true; nbFly = null;
}

export function openSite({ onBack, center } = {}) {
  if (center) SITE_CENTER = center;
  onExit = onBack || onExit;
  $('site3d').hidden = false; $('sitePanel').hidden = false;
  if (!started) {
    started = true;
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true }); // log depth: no road/line flicker across a 25 m – 14 km zoom range renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    $('site3d').appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(45, 1, 0.5, 40000);
    build(); buildNearby();
    controls = new OrbitControls(camera, renderer.domElement);
    Object.assign(controls, { enableDamping: false, maxPolarAngle: Math.PI * 0.47, minDistance: 25, maxDistance: 14000, enabled: false, screenSpacePanning: false });
    new ResizeObserver(resize).observe($('site3d')); resize();
    // tap a plot (ignore drags)
    let down = null;
    renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
    renderer.domElement.addEventListener('pointerup', e => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6 || playing) return;
      const r = renderer.domElement.getBoundingClientRect(), ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
      const hit = ray.intersectObjects(plotMeshes.filter(m => !filterCat || m.userData.plot.cat === filterCat))[0];
      select(hit ? hit.object : null);
    });
    for (const b of document.querySelectorAll('[data-cat]')) b.onclick = () => setFilter(b.dataset.cat);
    const strip = $('nearStrip'), list = $('nearList');
    const render = cat => {
      const rows = NEARBY.filter(r => !cat || r.cat === cat).sort((a, b) => b.stars - a.stars || a.km - b.km);
      list.innerHTML = rows.map((r, i) => `<button class="near-card" data-i="${NEARBY.indexOf(r)}"><span class="ico" style="background:${NB_STYLE[r.cat].color}">${NB_STYLE[r.cat].icon}</span><b>${r.name.replace(/, Coimbatore$/, '')}</b><span class="stars" aria-label="${r.stars} of 5">${'★'.repeat(r.stars)}<i>${'★'.repeat(5 - r.stars)}</i></span><small>${r.km.toFixed(1)} km away${r.why.length ? ' · ' + r.why.slice(0, 2).join(', ') : ''}</small></button>`).join('');
      for (const b of list.querySelectorAll('.near-card')) b.onclick = () => { for (const o of list.querySelectorAll('.near-card')) o.classList.toggle('on', o === b); focusNearby(NEARBY[+b.dataset.i]); };
    };
    for (const b of strip.querySelectorAll('[data-near]')) b.onclick = () => {
      const v = b.dataset.near, on = b.getAttribute('aria-pressed') !== 'true';
      for (const o of strip.querySelectorAll('[data-near]')) o.setAttribute('aria-pressed', String(on && o === b));
      if (!on || v === 'off') { list.hidden = true; strip.querySelector('[data-near]').setAttribute('aria-pressed', 'false'); hideNearby(); return; }
      const cat = v === 'all' ? null : v; render(cat); list.hidden = false; select(null); showNearby(cat);
    };
    for (const b of document.querySelectorAll('[data-mood]')) b.onclick = () => setMood(b.dataset.mood);
    $('showBtn').onclick = () => setShowcase(!showcase);
    renderer.domElement.addEventListener('pointerdown', () => { if (showcase) setShowcase(false); });
    renderer.domElement.addEventListener('wheel', () => { if (showcase) setShowcase(false); }, { passive: true });
    $('siteReplay').onclick = () => { list.hidden = true; for (const o of strip.querySelectorAll('[data-near]')) o.setAttribute('aria-pressed', 'false'); if (nbGroup) nbGroup.visible = false; labelsGroup.visible = true; replay(); }; $('siteBack').onclick = closeSite;
    const f = LAYOUT.facts;
    $('siteFacts').textContent = `${f.plots} plots · ${f.sqft.toLocaleString('en-IN')} sq.ft · ${f.cents} cents · Park ${f.park} sq.m`;
  }
  cancelAnimationFrame(raf); loop.last = 0; raf = requestAnimationFrame(loop);
  replay();
}
export function closeSite() {
  cancelAnimationFrame(raf); $('site3d').hidden = true; $('sitePanel').hidden = true; select(null); onExit();
}
window.__site = { view: (x, y, z, tx = 0, tz = 0) => { camera.position.set(x, y, z); controls.target.set(tx, 0, tz); controls.update(); }, showNearby, focusNearby: n => focusNearby(NEARBY.find(r => r.name.startsWith(n))), hideNearby, openSite, get playing() { return playing; }, select: n => select(plotMeshes.find(m => m.userData.plot.n === n)), setFilter, skip: () => { clock = 99; } };

