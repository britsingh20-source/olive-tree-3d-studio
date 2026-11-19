// Property Manager cab — passenger's view inside an original full-size SUV (right-hand drive,
// customer in the front-left seat). Car-local axes: forward −Z, driver side +X, up +Y.
// Everything is procedural; layout follows typical 7-seater SUV cabins, not any one model.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';

// ---------- materials ----------
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
function canvasTex(w, h, draw, repeat = [1, 1], srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8; return t;
}
function grain(g, w, h, base, amp, n = 9000, size = 2) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const v = (rnd() - 0.5) * amp; g.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; g.fillRect(rnd() * w, rnd() * h, size, size); }
}
const leatherTan = canvasTex(256, 256, (g, w, h) => {
  grain(g, w, h, '#8f6a4c', 0.045, 9000, 3);
  for (let i = 0; i < 260; i++) { g.strokeStyle = 'rgba(40,25,15,0.12)'; g.beginPath(); const x = rnd() * w, y = rnd() * h; g.moveTo(x, y); g.lineTo(x + (rnd() - .5) * 18, y + (rnd() - .5) * 18); g.stroke(); }
}, [3, 3]);
const leatherPerf = canvasTex(256, 256, (g, w, h) => {
  grain(g, w, h, '#86624a', 0.04, 6000, 3);
  g.fillStyle = 'rgba(30,18,10,0.55)'; for (let y = 6; y < h; y += 12) for (let x = (y / 12) % 2 ? 6 : 12; x < w; x += 12) { g.beginPath(); g.arc(x, y, 1.6, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(235,215,185,0.55)'; g.setLineDash([6, 4]); g.lineWidth = 2; for (const x of [4, w - 4]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}, [2, 2]);
const softTouch = canvasTex(256, 256, (g, w, h) => grain(g, w, h, '#26272a', 0.08, 16000, 1), [6, 6]);
const carpet = canvasTex(256, 256, (g, w, h) => grain(g, w, h, '#1d1d1f', 0.18, 30000, 1), [8, 8]);
const headliner = canvasTex(256, 256, (g, w, h) => grain(g, w, h, '#9e978b', 0.08, 20000, 1), [6, 6]);
const woodTrim = canvasTex(512, 64, (g, w, h) => {
  g.fillStyle = '#3b2618'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${120 + rnd() * 60},${70 + rnd() * 40},${35 + rnd() * 20},${0.25 + rnd() * 0.3})`; g.lineWidth = 1 + rnd() * 2; g.beginPath(); const y = rnd() * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 4 + (rnd() - .5) * 2); g.stroke(); }
}, [2, 1]);
const M = {
  dash: new THREE.MeshStandardMaterial({ map: softTouch, roughness: 0.85, metalness: 0 }),
  dashLower: new THREE.MeshStandardMaterial({ map: leatherTan, roughness: 0.6 }),
  leather: new THREE.MeshStandardMaterial({ map: leatherTan, roughness: 0.42 }),
  perf: new THREE.MeshStandardMaterial({ map: leatherPerf, roughness: 0.6 }),
  darkLeather: new THREE.MeshStandardMaterial({ color: '#2a2320', roughness: 0.55 }),
  piano: new THREE.MeshStandardMaterial({ color: '#0b0b0c', roughness: 0.08, metalness: 0.3 }),
  satin: new THREE.MeshStandardMaterial({ color: '#b7bcc2', roughness: 0.28, metalness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ map: woodTrim, roughness: 0.25, metalness: 0.05 }),
  carpet: new THREE.MeshStandardMaterial({ map: carpet, roughness: 1 }),
  liner: new THREE.MeshStandardMaterial({ map: headliner, color: '#a49d90', roughness: 0.95, side: THREE.DoubleSide }),
  rubber: new THREE.MeshStandardMaterial({ color: '#151515', roughness: 0.9 }),
  plastic: new THREE.MeshStandardMaterial({ color: '#2c2d30', roughness: 0.7 }),
};

const rbox = (w, h, d, r, mat, seg = 3) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) - 1e-4), mat);
const put = (parent, mesh, x, y, z, rx = 0, ry = 0, rz = 0) => { mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz); parent.add(mesh); return mesh; };
// side-profile (u = forward, v = up) extruded across x from x0 to x1
function profile(points, x0, x1, mat, bevel = 0.02) {
  const s = new THREE.Shape(); s.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) { const p = points[i]; p.length === 4 ? s.quadraticCurveTo(p[0], p[1], p[2], p[3]) : s.lineTo(p[0], p[1]); }
  const depth = x1 - x0 - 2 * bevel;
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 16 });
  const m = new THREE.Mesh(g, mat); m.rotation.y = Math.PI / 2; m.position.x = x0 + bevel; // local +u → −Z, extrusion → +X
  return m;
}
function textCanvasTex(w, h, draw) { return canvasTex(w, h, draw, [1, 1]); }

// ---------- seat ----------
function seat(width = 0.54, back = true) {
  const g = new THREE.Group();
  put(g, rbox(width, 0.14, 0.52, 0.05, M.leather), 0, 0.86, 0.12);
  put(g, rbox(width * 0.58, 0.04, 0.44, 0.02, M.perf), 0, 0.94, 0.1);
  for (const sx of [-1, 1]) put(g, rbox(0.1, 0.1, 0.5, 0.04, M.leather), sx * (width / 2 - 0.05), 0.95, 0.12);
  if (back) {
    const b = new THREE.Group(); b.position.set(0, 0.92, 0.38); b.rotation.x = 0.24; g.add(b);
    put(b, rbox(width, 0.72, 0.15, 0.06, M.leather), 0, 0.36, 0);
    put(b, rbox(width * 0.56, 0.6, 0.03, 0.02, M.perf), 0, 0.34, -0.075);
    for (const sx of [-1, 1]) put(b, rbox(0.1, 0.62, 0.12, 0.05, M.leather), sx * (width / 2 - 0.06), 0.33, -0.05);
    for (const sx of [-0.07, 0.07]) put(b, new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), M.satin), sx, 0.76, 0);
    put(b, rbox(0.27, 0.19, 0.11, 0.05, M.leather), 0, 0.88, 0.0);
  }
  put(g, rbox(width * 0.9, 0.2, 0.45, 0.03, M.plastic), 0, 0.7, 0.12); // base / runners
  return g;
}

// ---------- gauges & screen (live canvases) ----------
function makeGauges() {
  const c = document.createElement('canvas'); c.width = 768; c.height = 256; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  function dial(cx, cy, r, max, step, val, label, unit) {
    g.strokeStyle = '#3a3f46'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r, 0.75 * Math.PI, 2.25 * Math.PI); g.stroke();
    g.fillStyle = '#d8dde3'; g.font = '600 15px "DM Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let v = 0; v <= max; v += step) {
      const a = 0.75 * Math.PI + (v / max) * 1.5 * Math.PI;
      g.strokeStyle = '#d8dde3'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4)); g.lineTo(cx + Math.cos(a) * (r - 16), cy + Math.sin(a) * (r - 16)); g.stroke();
      g.fillText(String(v), cx + Math.cos(a) * (r - 32), cy + Math.sin(a) * (r - 32));
    }
    const a = 0.75 * Math.PI + Math.min(1, val / max) * 1.5 * Math.PI;
    g.strokeStyle = '#ff6a2b'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10)); g.stroke();
    g.fillStyle = '#1b1e22'; g.beginPath(); g.arc(cx, cy, 13, 0, 7); g.fill();
    g.fillStyle = '#8b939c'; g.font = '500 13px "DM Sans", sans-serif'; g.fillText(unit, cx, cy + r * 0.5);
    if (label) { g.fillStyle = '#fff'; g.font = '700 26px "DM Sans", sans-serif'; g.fillText(label, cx, cy + r * 0.28); }
  }
  let last = -1;
  function draw(speed, kmDone) {
    const sp = Math.round(speed); if (sp === last) return; last = sp;
    g.fillStyle = '#07090b'; g.fillRect(0, 0, 768, 256);
    dial(150, 135, 108, 220, 20, speed, String(sp), 'km/h');
    dial(618, 135, 108, 8, 1, speed > 0.5 ? 1.3 + speed / 45 : 0.8, '', 'x1000 rpm');
    g.fillStyle = '#11161b'; g.fillRect(300, 40, 168, 176); g.strokeStyle = '#2b3138'; g.strokeRect(300, 40, 168, 176);
    g.fillStyle = '#8b939c'; g.font = '500 14px "DM Sans", sans-serif'; g.textAlign = 'center'; g.fillText('TRIP', 384, 70);
    g.fillStyle = '#fff'; g.font = '700 30px "DM Sans", sans-serif'; g.fillText(kmDone.toFixed(1) + ' km', 384, 104);
    g.fillStyle = '#5be37d'; g.font = '700 40px "DM Sans", sans-serif'; g.fillText('D', 384, 160);
    g.fillStyle = '#8b939c'; g.font = '500 13px "DM Sans", sans-serif'; g.fillText('PROPERTY MANAGER', 384, 198);
    tex.needsUpdate = true;
  }
  return { tex, draw };
}
function makeScreen() {
  const c = document.createElement('canvas'); c.width = 800; c.height = 480; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  let route = null, bounds = null;
  function setRoute(path) {
    route = path.points.filter((_, i) => i % 15 === 0); route.push(path.points[path.points.length - 1]);
    let a = 1e9, b = -1e9, c2 = 1e9, d = -1e9; for (const p of route) { a = Math.min(a, p.x); b = Math.max(b, p.x); c2 = Math.min(c2, p.z); d = Math.max(d, p.z); }
    bounds = { minX: a, maxX: b, minZ: c2, maxZ: d };
  }
  function draw(info) {
    g.fillStyle = '#0d1116'; g.fillRect(0, 0, 800, 480);
    g.fillStyle = '#151b22'; g.fillRect(0, 0, 800, 56);
    g.fillStyle = '#f6c519'; g.font = '700 26px "DM Sans", sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('PROPERTY MANAGER', 24, 29);
    g.fillStyle = '#c8d0d8'; g.font = '500 22px "DM Sans", sans-serif'; g.textAlign = 'right'; g.fillText(info.title || 'Urban Heaven site tour', 776, 29);
    // map panel
    g.fillStyle = '#18222b'; g.fillRect(24, 74, 470, 382);
    if (route) {
      const W = 430, H = 342, sx = (bounds.maxX - bounds.minX) || 1, sz = (bounds.maxZ - bounds.minZ) || 1, k = Math.min(W / sx, H / sz);
      const ox = 44 + (W - sx * k) / 2, oy = 94 + (H - sz * k) / 2;
      const P = p => [ox + (p.x - bounds.minX) * k, oy + (p.z - bounds.minZ) * k];
      g.lineCap = 'round'; g.lineJoin = 'round';
      g.strokeStyle = '#4b5b69'; g.lineWidth = 9; g.beginPath(); route.forEach((p, i) => { const [x, y] = P(p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
      g.strokeStyle = '#f6c519'; g.lineWidth = 9; g.beginPath(); let started = false;
      for (const p of route) { if (p.s > info.s) break; const [x, y] = P(p); started ? g.lineTo(x, y) : (g.moveTo(x, y), started = true); }
      const [cx, cy] = P(info.pos); if (started) g.lineTo(cx, cy); g.stroke();
      const [ex, ey] = P(route[route.length - 1]); g.fillStyle = '#d9b96a'; g.beginPath(); g.arc(ex, ey, 11, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 11, 0, 7); g.fill(); g.fillStyle = '#2f80ff'; g.beginPath(); g.arc(cx, cy, 7, 0, 7); g.fill();
    }
    // instruction panel
    g.textAlign = 'left'; g.fillStyle = '#8b97a3'; g.font = '500 20px "DM Sans", sans-serif'; g.fillText('NEXT', 520, 100);
    g.fillStyle = '#fff'; g.font = '700 60px "DM Sans", sans-serif'; g.fillText(info.icon || '', 520, 160);
    g.font = '700 28px "DM Sans", sans-serif'; wrap(info.next || '', 520, 222, 260, 34);
    g.fillStyle = '#f6c519'; g.font = '700 30px "DM Sans", sans-serif'; g.fillText(info.dist || '', 520, 330);
    g.fillStyle = '#8b97a3'; g.font = '500 20px "DM Sans", sans-serif'; g.fillText('TO URBAN HEAVEN', 520, 384);
    g.fillStyle = '#fff'; g.font = '700 34px "DM Sans", sans-serif'; g.fillText(info.left || '', 520, 420);
    tex.needsUpdate = true;
  }
  function wrap(t, x, y, w, lh) { const words = t.split(' '); let line = ''; for (const wd of words) { const test = line ? line + ' ' + wd : wd; if (g.measureText(test).width > w && line) { g.fillText(line, x, y); y += lh; line = wd; } else line = test; } g.fillText(line, x, y); }
  return { tex, setRoute, draw };
}

// ---------- the cabin ----------
export function buildCabin({ body = '#eef0ee' } = {}) {
  const cab = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: body, roughness: 0.28, metalness: 0.35 });
  const HW = 0.78; // half inner width

  // bonnet seen through the windscreen (same paint as the outside)
  cab.add(profile([[1.36, 1.15], [2.28, 1.04], [2.4, 0.98, 2.42, 0.85], [2.42, 0.7], [1.36, 0.7]], -0.93, 0.93, paint, 0.06));
  // floor & footwells
  put(cab, new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.04, 2.6), M.carpet), 0, 0.53, 0.05);
  put(cab, new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.05), M.carpet), 0, 0.72, -1.02, -0.8);

  // ---- dashboard: soft-touch upper, wood strip, tan lower ----
  cab.add(profile([[1.36, 1.14], [1.0, 1.19], [0.86, 1.19, 0.82, 1.13], [0.81, 1.04], [1.36, 1.04]], -HW, HW, M.dash, 0.03));
  put(cab, new THREE.Mesh(new THREE.BoxGeometry(HW * 2 - 0.06, 0.035, 0.02), M.wood), 0, 1.02, -0.8);
  put(cab, new THREE.Mesh(new THREE.BoxGeometry(HW * 2 - 0.06, 0.006, 0.022), M.satin), 0, 1.0, -0.8);
  cab.add(profile([[1.36, 1.0], [0.82, 1.0], [0.8, 0.9, 0.86, 0.8], [1.0, 0.62], [1.36, 0.62]], -HW, HW, M.dashLower, 0.03));
  // glovebox seam + SRS airbag label on passenger side
  const seam = canvasTex(512, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(20,12,6,0.55)'; g.lineWidth = 3; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 26); g.stroke(); g.fillStyle = 'rgba(25,18,12,0.45)'; g.font = '700 22px "DM Sans", sans-serif'; g.textAlign = 'center'; g.fillText('SRS AIRBAG', w / 2, 34); g.fillStyle = 'rgba(30,20,10,.6)'; g.fillRect(w / 2 - 50, h - 52, 100, 10); });
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), new THREE.MeshStandardMaterial({ map: seam, transparent: true, roughness: 0.6 })), -0.42, 0.9, -0.835, -0.42);

  // air vents: passenger corner, two centre
  function vent(x, y, z, w, h, ry = 0) {
    const v = new THREE.Group(); put(v, rbox(w, h, 0.05, 0.015, M.piano), 0, 0, 0);
    for (let i = 0; i < 4; i++) put(v, new THREE.Mesh(new THREE.BoxGeometry(w - 0.02, 0.006, 0.03), M.satin), 0, -h / 2 + 0.012 + i * (h - 0.024) / 3, -0.012);
    put(cab, v, x, y, z, 0, ry); return v;
  }
  vent(-0.66, 1.09, -0.825, 0.16, 0.07); vent(0.66, 1.09, -0.825, 0.16, 0.07); vent(-0.07, 1.09, -0.83, 0.1, 0.07); vent(0.07, 1.09, -0.83, 0.1, 0.07);

  // floating touchscreen with live route
  const screen = makeScreen();
  put(cab, rbox(0.33, 0.21, 0.025, 0.012, M.piano), 0, 1.31, -0.9, -0.12);
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.186), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })), 0, 1.31, -0.886, -0.12);
  // climate panel + knobs + hazard
  put(cab, rbox(0.3, 0.09, 0.03, 0.01, M.piano), 0, 0.95, -0.82, -0.25);
  for (const x of [-0.1, 0.1]) put(cab, new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 24), M.satin), x, 0.95, -0.8, Math.PI / 2 - 0.25);
  put(cab, rbox(0.035, 0.02, 0.01, 0.004, new THREE.MeshStandardMaterial({ color: '#b3121b', roughness: 0.4 })), 0, 0.975, -0.8, -0.25);

  // centre console with shifter, cupholders, armrest
  put(cab, rbox(0.26, 0.34, 1.05, 0.04, M.plastic), 0, 0.72, -0.32);
  put(cab, rbox(0.24, 0.02, 0.62, 0.01, M.piano), 0, 0.895, -0.42);
  put(cab, rbox(0.04, 0.12, 0.05, 0.015, M.darkLeather), 0.03, 0.96, -0.5);
  put(cab, rbox(0.06, 0.035, 0.08, 0.015, M.satin), 0.03, 1.03, -0.5);
  for (const z of [-0.28, -0.18]) put(cab, new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.012, 24), M.rubber), -0.04, 0.902, z);
  put(cab, rbox(0.26, 0.1, 0.36, 0.04, M.leather), 0, 0.98, 0.1);

  // ---- driver side: cluster hood, gauges, steering wheel ----
  const gauges = makeGauges();
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 24, 1, true, -Math.PI / 2, Math.PI), M.dash);
  hood.material = M.dash.clone(); hood.material.side = THREE.DoubleSide;
  put(cab, hood, 0.42, 1.18, -0.92, 0, 0, Math.PI / 2); hood.scale.set(0.55, 1.5, 1);
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.14), new THREE.MeshBasicMaterial({ map: gauges.tex, toneMapped: false })), 0.42, 1.14, -0.93, -0.1);
  const wheel = new THREE.Group(); wheel.position.set(0.42, 1.05, -0.62); wheel.rotation.x = -0.42; cab.add(wheel);
  const spin = new THREE.Group(); wheel.add(spin);
  spin.add(new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.026, 14, 48), M.darkLeather));
  put(spin, rbox(0.12, 0.1, 0.05, 0.03, M.plastic), 0, -0.01, 0.01);
  put(spin, new THREE.Mesh(new THREE.CircleGeometry(0.022, 24), M.satin), 0, -0.005, 0.037);
  for (const [x, y, rz, len] of [[-0.11, 0, 0, 0.13], [0.11, 0, 0, 0.13], [0, -0.11, Math.PI / 2, 0.12]]) {
    put(spin, rbox(len, 0.035, 0.02, 0.01, M.plastic), x, y, 0, 0, 0, rz);
    if (y === 0) put(spin, rbox(0.05, 0.022, 0.006, 0.005, M.satin), x * 1.05, 0.002, 0.014);
  }
  put(wheel, new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.3, 14), M.plastic), 0, 0, -0.16, Math.PI / 2);

  // ---- seats: driver (right), our seat (left, mostly behind the camera), second row ----
  put(cab, seat(), 0.4, -0.1, 0.0);
  put(cab, seat(), -0.4, -0.1, 0.0);
  const bench = new THREE.Group(); put(cab, bench, 0, 0, 1.05);
  put(bench, rbox(1.46, 0.14, 0.5, 0.05, M.leather), 0, 0.84, 0.1);
  const bb = new THREE.Group(); bb.position.set(0, 0.9, 0.36); bb.rotation.x = 0.2; bench.add(bb);
  put(bb, rbox(1.46, 0.66, 0.15, 0.06, M.leather), 0, 0.33, 0);
  for (const x of [-0.48, 0, 0.48]) { put(bb, rbox(0.4, 0.5, 0.03, 0.02, M.perf), x, 0.32, -0.075); put(bb, rbox(0.25, 0.17, 0.1, 0.05, M.leather), x, 0.78, 0); }

  // ---- doors (inside panels), window frames, pillars, roof ----
  for (const side of [-1, 1]) {
    const x = side * (HW + 0.03), d = new THREE.Group(); put(cab, d, x, 0, 0);
    put(d, rbox(0.06, 0.62, 1.25, 0.03, M.dashLower), 0, 0.88, -0.2);
    put(d, rbox(0.07, 0.1, 1.25, 0.03, M.dash), -side * 0.005, 1.2, -0.2);
    put(d, new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 1.1), M.wood), -side * 0.035, 1.08, -0.2);
    put(d, rbox(0.1, 0.05, 0.42, 0.02, M.leather), -side * 0.06, 0.96, -0.05);
    put(d, rbox(0.015, 0.03, 0.12, 0.008, M.satin), -side * 0.035, 1.13, -0.55);
    put(d, new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), M.plastic), -side * 0.032, 0.7, -0.62, 0, -side * Math.PI / 2);
    put(d, rbox(0.06, 0.02, 0.14, 0.008, M.piano), -side * 0.06, 0.99, 0.08);
    // door glass frame
    put(d, new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 1.15), M.plastic), 0, 1.76, -0.15);
    // B-pillar trim
    put(cab, rbox(0.06, 0.58, 0.12, 0.02, M.liner), side * (HW + 0.0), 1.5, 0.48);
    // A-pillar (fabric) from windscreen base to roof
    const a0 = new THREE.Vector3(side * (HW - 0.01), 1.17, -1.33), a1 = new THREE.Vector3(side * (HW - 0.05), 1.78, -0.76);
    const len = a0.distanceTo(a1), ap = rbox(0.055, len, 0.075, 0.025, M.plastic);
    ap.position.copy(a0).add(a1).multiplyScalar(0.5); ap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a1.clone().sub(a0).normalize()); cab.add(ap);
    // sun visor folded up, grab handle
    put(cab, rbox(0.38, 0.018, 0.17, 0.008, M.liner), side * 0.38, 1.765, -0.66);
    if (side < 0) put(cab, rbox(0.03, 0.03, 0.22, 0.012, M.plastic), side * (HW - 0.06), 1.72, 0.05);
  }
  // roof lining + windscreen header + dome light
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(1.62, 2.6), M.liner), 0, 1.8, 0.5, Math.PI / 2);
  put(cab, rbox(1.62, 0.05, 0.12, 0.02, M.liner), 0, 1.78, -0.76);
  put(cab, rbox(0.22, 0.03, 0.12, 0.012, new THREE.MeshStandardMaterial({ color: '#e7e1d4', roughness: 0.4 })), 0, 1.785, -0.6);
  // rear-view mirror
  put(cab, new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.07, 8), M.plastic), 0, 1.745, -0.74);
  put(cab, rbox(0.24, 0.07, 0.035, 0.015, M.plastic), 0, 1.7, -0.73);
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.055), new THREE.MeshStandardMaterial({ color: '#7f8b94', roughness: 0.05, metalness: 1 })), 0, 1.7, -0.711);

  // windscreen: faint tint + PROPERTY MANAGER sun-strip banner across the top
  const ws0 = new THREE.Vector3(0, 1.165, -1.36), ws1 = new THREE.Vector3(0, 1.79, -0.77);
  const wsLen = ws0.distanceTo(ws1), tilt = Math.atan2(ws1.y - ws0.y, -(ws1.z - ws0.z));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.62, wsLen), new THREE.MeshStandardMaterial({ color: '#9fb6c4', transparent: true, opacity: 0.06, roughness: 0.05, metalness: 0.2, depthWrite: false }));
  glass.position.copy(ws0).add(ws1).multiplyScalar(0.5); glass.rotation.x = -(Math.PI / 2 - tilt); cab.add(glass);
  const stripTex = canvasTex(2048, 160, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(18,60,44,0.96)'); gr.addColorStop(1, 'rgba(18,60,44,0.55)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = '700 74px "DM Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('PROPERTY MANAGER   ·   URBAN HEAVEN SITE TOUR', w / 2, h / 2 - 4);
    g.fillStyle = '#d9b96a'; g.fillRect(0, h - 8, w, 4);
  });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.11), new THREE.MeshBasicMaterial({ map: stripTex, transparent: true, toneMapped: false }));
  const sp = ws1.clone().lerp(ws0, 0.12); strip.position.set(0, sp.y - 0.01, sp.z + 0.012); strip.rotation.x = -(Math.PI / 2 - tilt); cab.add(strip);

  // outside mirrors visible through the side glass
  for (const side of [-1, 1]) {
    put(cab, rbox(0.24, 0.15, 0.13, 0.04, M.piano), side * 1.06, 1.3, -1.22);
    put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), new THREE.MeshStandardMaterial({ color: '#8a96a0', roughness: 0.05, metalness: 1 })), side * 1.06, 1.3, -1.15);
    put(cab, rbox(0.12, 0.05, 0.05, 0.02, M.plastic), side * 0.95, 1.25, -1.22);
  }

  let tScreen = 0;
  return {
    group: cab,
    setRoute: path => screen.setRoute(path),
    update(dt, info) {
      gauges.draw(info.speedKmh, info.km);
      spin.rotation.z += ((info.steer || 0) * 6 - spin.rotation.z) * Math.min(1, dt * 4);
      tScreen -= dt; if (tScreen <= 0) { tScreen = 0.25; screen.draw(info); }
    },
  };
}
