// Property Manager cab — passenger's view inside an original full-size 7-seater SUV (right-hand
// drive, customer in the front-left seat). Car-local axes: forward −Z, driver side +X, up +Y.
// Materials/colour scheme follow Bright's reference photos of a premium Indian-market SUV
// (dark chocolate leather with light stitching, piano black, chrome, dark wood, beige roof);
// shapes are generic and carry no manufacturer logos or names.
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8; return t;
}
function grain(g, w, h, base, amp, n, size) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const v = (rnd() - 0.5) * amp; g.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; g.fillRect(rnd() * w, rnd() * h, size, size); }
}
const BROWN = '#4a2c22', BROWN_DARK = '#3a221b';
// leather with a stitched border (RoundedBox faces map 0..1, so every face gets a stitched edge)
function stitched(base, perforated = false, inset = 0.07) {
  return canvasTex(512, 512, (g, w, h) => {
    grain(g, w, h, base, 0.035, 9000, 3);
    if (perforated) { g.fillStyle = 'rgba(15,8,5,0.5)'; for (let y = 40; y < h - 40; y += 14) for (let x = (y / 14) % 2 ? 40 : 47; x < w - 40; x += 14) { g.beginPath(); g.arc(x, y, 1.8, 0, 7); g.fill(); } }
    const m = w * inset;
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 6; g.strokeRect(m - 8, m - 8, w - 2 * m + 16, h - 2 * m + 16);
    g.strokeStyle = 'rgba(214,196,170,0.85)'; g.lineWidth = 3; g.setLineDash([12, 7]); g.strokeRect(m, m, w - 2 * m, h - 2 * m);
  });
}
const leatherPlain = canvasTex(256, 256, (g, w, h) => grain(g, w, h, BROWN, 0.035, 6000, 3), [3, 3]);
const softTouch = canvasTex(256, 256, (g, w, h) => grain(g, w, h, '#1f2022', 0.06, 16000, 1), [6, 6]);
const carpet = canvasTex(256, 256, (g, w, h) => grain(g, w, h, '#151516', 0.2, 30000, 1), [8, 8]);
const headliner = canvasTex(256, 256, (g, w, h) => grain(g, w, h, '#d8d1c4', 0.06, 20000, 1), [6, 6]);
const woodTrim = canvasTex(512, 128, (g, w, h) => {
  g.fillStyle = '#24160f'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(${70 + rnd() * 30},${44 + rnd() * 18},${26 + rnd() * 10},${0.18 + rnd() * 0.2})`; g.lineWidth = 1 + rnd() * 1.5; g.beginPath(); const y = rnd() * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.015 + i) * 5 + (rnd() - .5) * 2); g.stroke(); }
}, [1, 1]);
const std = (o) => new THREE.MeshStandardMaterial(o);
const M = {
  dash: std({ map: softTouch, roughness: 0.85 }),
  leather: std({ map: leatherPlain, roughness: 0.45 }),
  stitch: std({ map: stitched(BROWN), roughness: 0.42 }),
  stitchPerf: std({ map: stitched(BROWN_DARK, true, 0.09), roughness: 0.5 }),
  piano: std({ color: '#0a0a0b', roughness: 0.07, metalness: 0.35 }),
  chrome: std({ color: '#d4d8dc', roughness: 0.12, metalness: 1 }),
  satin: std({ color: '#a9aeb3', roughness: 0.3, metalness: 0.9 }),
  wood: std({ map: woodTrim, roughness: 0.18, metalness: 0.1 }),
  carpet: std({ map: carpet, roughness: 1 }),
  liner: std({ map: headliner, color: '#ece6da', roughness: 0.95, side: THREE.DoubleSide }),
  rubber: std({ color: '#121212', roughness: 0.9 }),
  plastic: std({ color: '#1b1c1e', roughness: 0.65 }),
  lcd: std({ color: '#1a6cff', emissive: '#2d7bff', emissiveIntensity: 1.2, roughness: 0.3 }),
  dome: std({ color: '#f3efe6', emissive: '#fff4dc', emissiveIntensity: 0.35, roughness: 0.4 }),
};

const rbox = (w, h, d, r, mat, seg = 3) => new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) - 1e-4), mat);
const put = (parent, mesh, x, y, z, rx = 0, ry = 0, rz = 0) => { mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz); parent.add(mesh); return mesh; };
function profile(points, x0, x1, mat, bevel = 0.02) {
  const s = new THREE.Shape(); s.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) { const p = points[i]; p.length === 4 ? s.quadraticCurveTo(p[0], p[1], p[2], p[3]) : s.lineTo(p[0], p[1]); }
  const g = new THREE.ExtrudeGeometry(s, { depth: x1 - x0 - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 16 });
  const m = new THREE.Mesh(g, mat); m.rotation.y = Math.PI / 2; m.position.x = x0 + bevel; // local +u → −Z, extrusion → +X
  return m;
}
function stitchLine(parent, len, x, y, z, ry = 0, rx = 0) { // a visible contrast seam on large surfaces
  const t = canvasTex(1024, 8, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(214,196,170,0.9)'; g.lineWidth = 4; g.setLineDash([14, 9]); g.beginPath(); g.moveTo(0, 4); g.lineTo(w, 4); g.stroke(); });
  return put(parent, new THREE.Mesh(new THREE.PlaneGeometry(len, 0.006), new THREE.MeshBasicMaterial({ map: t, transparent: true })), x, y, z, rx, ry);
}

// ---------- seat (brown leather, perforated stitched inserts, black side trim) ----------
function seat(width = 0.54, outer = -1) {
  const g = new THREE.Group();
  put(g, rbox(width, 0.13, 0.52, 0.05, M.stitch), 0, 0.86, 0.12);
  put(g, rbox(width * 0.6, 0.035, 0.42, 0.015, M.stitchPerf), 0, 0.935, 0.11);
  for (const sx of [-1, 1]) put(g, rbox(0.1, 0.1, 0.5, 0.045, M.stitch), sx * (width / 2 - 0.05), 0.95, 0.12);
  const b = new THREE.Group(); b.position.set(0, 0.92, 0.38); b.rotation.x = 0.22; g.add(b);
  put(b, rbox(width, 0.74, 0.16, 0.06, M.stitch), 0, 0.37, 0);
  put(b, rbox(width * 0.56, 0.56, 0.03, 0.015, M.stitchPerf), 0, 0.33, -0.08);
  for (const sx of [-1, 1]) put(b, rbox(0.11, 0.64, 0.13, 0.05, M.stitch), sx * (width / 2 - 0.06), 0.34, -0.05);
  put(b, rbox(width * 0.7, 0.1, 0.12, 0.04, M.stitch), 0, 0.68, -0.03);
  for (const sx of [-0.07, 0.07]) put(b, new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), M.satin), sx, 0.78, 0);
  put(b, rbox(0.28, 0.2, 0.11, 0.05, M.stitch), 0, 0.9, 0);
  put(g, rbox(width * 0.92, 0.18, 0.46, 0.03, M.plastic), 0, 0.71, 0.12);        // base
  put(g, rbox(0.03, 0.12, 0.42, 0.02, M.plastic), outer * (width / 2 + 0.01), 0.8, 0.12); // side trim
  for (const z of [0.02, 0.2]) put(g, rbox(0.012, 0.025, 0.06, 0.008, M.satin), outer * (width / 2 + 0.03), 0.8, z);
  return g;
}

function makeGauges() {
  const c = document.createElement('canvas'); c.width = 768; c.height = 256; const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  function dial(cx, cy, r, max, step, val, label, unit) {
    g.strokeStyle = '#2f7dff'; g.lineWidth = 5; g.shadowColor = '#2f7dff'; g.shadowBlur = 12; g.beginPath(); g.arc(cx, cy, r, 0.75 * Math.PI, 2.25 * Math.PI); g.stroke(); g.shadowBlur = 0;
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
export function buildCabin({ body = '#0c0d0f' } = {}) {
  const cab = new THREE.Group();
  const paint = std({ color: body, roughness: 0.16, metalness: 0.55 });
  const HW = 0.78;

  // bonnet seen through the windscreen
  cab.add(profile([[1.36, 1.15], [2.28, 1.04], [2.4, 0.98, 2.42, 0.85], [2.42, 0.7], [1.36, 0.7]], -0.93, 0.93, paint, 0.06));
  put(cab, new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.04, 2.6), M.carpet), 0, 0.53, 0.05);
  put(cab, new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.05), M.carpet), 0, 0.72, -1.02, -0.8);
  put(cab, rbox(0.5, 0.012, 0.42, 0.01, M.rubber), -0.4, 0.556, -0.6);

  // ---- dashboard: black soft-touch top, stitched brown leather band, brown lower ----
  cab.add(profile([[1.36, 1.14], [1.0, 1.2], [0.86, 1.2, 0.83, 1.13], [0.825, 1.07], [1.36, 1.07]], -HW, HW, M.dash, 0.03));
  cab.add(profile([[1.36, 1.07], [0.83, 1.07], [0.815, 0.98], [1.36, 0.98]], -HW, HW, M.leather, 0.015));
  stitchLine(cab, HW * 2 - 0.1, 0, 1.055, -0.818); stitchLine(cab, HW * 2 - 0.1, 0, 0.995, -0.806);
  cab.add(profile([[1.36, 0.98], [0.815, 0.98], [0.8, 0.9, 0.86, 0.8], [1.0, 0.62], [1.36, 0.62]], -HW, HW, M.dash, 0.03));
  // passenger-side stitched leather panel with chrome badge strip (no lettering)
  put(cab, rbox(0.5, 0.13, 0.04, 0.03, M.stitch), -0.44, 0.93, -0.795, -0.3);
  put(cab, rbox(0.07, 0.012, 0.01, 0.004, M.chrome), -0.28, 0.91, -0.77, -0.3);

  // vents with chrome bezels: two outer, two centre with a small clock between
  function vent(x, y, z, w, h) {
    const v = new THREE.Group(); put(v, rbox(w + 0.025, h + 0.025, 0.04, 0.02, M.chrome), 0, 0, 0.004); put(v, rbox(w, h, 0.05, 0.015, M.piano), 0, 0, 0);
    for (let i = 0; i < 4; i++) put(v, new THREE.Mesh(new THREE.BoxGeometry(w - 0.02, 0.005, 0.03), M.satin), 0, -h / 2 + 0.012 + i * (h - 0.024) / 3, 0.014);
    put(cab, v, x, y, z); return v;
  }
  vent(-0.68, 1.1, -0.81, 0.14, 0.08); vent(0.69, 1.1, -0.81, 0.14, 0.08); vent(-0.12, 1.12, -0.812, 0.11, 0.05); vent(0.12, 1.12, -0.812, 0.11, 0.05);
  put(cab, rbox(0.07, 0.03, 0.01, 0.006, M.lcd), 0, 1.12, -0.81);

  // centre stack: piano-black panel framed by stitched leather pillars
  const stackPivot = new THREE.Group(); stackPivot.position.set(0, 0.9, -0.765); stackPivot.rotation.x = -0.12; cab.add(stackPivot);
  const stack = new THREE.Group(); stack.position.y = -0.9; stackPivot.add(stack);
  put(stack, rbox(0.3, 0.42, 0.05, 0.02, M.piano), 0, 0.88, 0);
  for (const sx of [-1, 1]) { put(stack, rbox(0.05, 0.52, 0.09, 0.02, M.stitch), sx * 0.175, 0.84, 0.01); put(stack, rbox(0.006, 0.5, 0.01, 0.003, M.chrome), sx * 0.148, 0.85, 0.03); }
  const screen = makeScreen();
  put(stack, rbox(0.25, 0.155, 0.012, 0.006, M.chrome), 0, 1.0, 0.026);
  put(stack, new THREE.Mesh(new THREE.PlaneGeometry(0.235, 0.14), new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false })), 0, 1.0, 0.033);
  put(stack, rbox(0.12, 0.025, 0.006, 0.004, M.lcd), 0, 0.88, 0.03);
  for (const sx of [-1, 1]) { put(stack, new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.025, 24), M.chrome), sx * 0.095, 0.88, 0.035, Math.PI / 2); put(stack, new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 24), M.piano), sx * 0.095, 0.88, 0.04, Math.PI / 2); }
  for (let i = 0; i < 6; i++) put(stack, rbox(0.03, 0.015, 0.008, 0.004, M.satin), -0.09 + i * 0.036, 0.83, 0.03);
  for (const sx of [-1, 1]) put(stack, new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 20), M.chrome), sx * 0.07, 0.75, 0.03, Math.PI / 2);
  put(stack, rbox(0.03, 0.02, 0.008, 0.004, std({ color: '#b3121b', roughness: 0.4 })), 0, 0.75, 0.03);

  // centre console: wood top, chrome gate, gear lever, cupholders, stitched armrest
  put(cab, rbox(0.3, 0.32, 1.0, 0.04, M.plastic), 0, 0.71, -0.3);
  put(cab, rbox(0.28, 0.015, 0.6, 0.01, M.wood), 0, 0.875, -0.42);
  put(cab, rbox(0.11, 0.02, 0.17, 0.01, M.chrome), 0.035, 0.885, -0.5);
  put(cab, rbox(0.08, 0.022, 0.14, 0.008, M.piano), 0.035, 0.89, -0.5);
  put(cab, new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 10), M.chrome), 0.035, 0.95, -0.52);
  put(cab, rbox(0.045, 0.09, 0.06, 0.02, M.leather), 0.035, 1.03, -0.53, 0.15);
  for (const z of [-0.27, -0.18]) put(cab, new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.01, 24), M.rubber), -0.05, 0.884, z);
  put(cab, rbox(0.27, 0.11, 0.38, 0.04, M.stitch), 0, 0.97, 0.12);

  // ---- driver side: cluster with blue-ringed dials, steering wheel ----
  const gauges = makeGauges();
  const hoodM = M.dash.clone(); hoodM.side = THREE.DoubleSide;
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 24, 1, true, -Math.PI / 2, Math.PI), hoodM);
  put(cab, hood, 0.42, 1.18, -0.92, 0, 0, Math.PI / 2); hood.scale.set(0.55, 1.5, 1);
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.14), new THREE.MeshBasicMaterial({ map: gauges.tex, toneMapped: false })), 0.42, 1.14, -0.93, -0.1);
  const wheel = new THREE.Group(); wheel.position.set(0.42, 1.05, -0.62); wheel.rotation.x = -0.42; cab.add(wheel);
  const spin = new THREE.Group(); wheel.add(spin);
  spin.add(new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.028, 16, 56), std({ color: '#151515', roughness: 0.5 })));
  put(spin, rbox(0.15, 0.12, 0.05, 0.035, M.plastic), 0, 0.005, 0.012);
  put(spin, new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.004, 8, 24), M.chrome), 0, 0.01, 0.04);
  for (const sx of [-1, 1]) {
    put(spin, rbox(0.1, 0.05, 0.025, 0.012, M.plastic), sx * 0.12, 0.01, 0.005);
    for (let i = 0; i < 4; i++) put(spin, rbox(0.016, 0.012, 0.006, 0.003, M.satin), sx * (0.1 + (i % 2) * 0.024), 0.0 + Math.floor(i / 2) * 0.022, 0.02);
    put(spin, rbox(0.03, 0.09, 0.02, 0.008, M.satin), sx * 0.045, -0.1, 0, 0, 0, sx * 0.55);   // silver lower V
  }
  put(spin, rbox(0.06, 0.025, 0.02, 0.008, M.satin), 0, -0.145, 0);
  put(wheel, new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.3, 14), M.plastic), 0, 0, -0.16, Math.PI / 2);
  put(cab, new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 8, 24), M.chrome), 0.66, 0.98, -0.82);

  // ---- seats: driver (right), ours (left), split second row with fold-down armrest ----
  put(cab, seat(0.54, 1), 0.4, -0.1, 0.0);
  put(cab, seat(0.54, -1), -0.4, -0.1, 0.0);
  const bench = new THREE.Group(); put(cab, bench, 0, -0.02, 1.05);
  for (const [x, w] of [[-0.42, 0.62], [0.3, 0.86]]) {
    put(bench, rbox(w, 0.14, 0.5, 0.05, M.stitch), x, 0.84, 0.1);
    const bb = new THREE.Group(); bb.position.set(x, 0.9, 0.36); bb.rotation.x = 0.2; bench.add(bb);
    put(bb, rbox(w, 0.66, 0.15, 0.06, M.stitch), 0, 0.33, 0);
    put(bb, rbox(w * 0.6, 0.48, 0.03, 0.015, M.stitchPerf), 0, 0.3, -0.075);
  }
  for (const x of [-0.42, 0.12, 0.5]) { const hb = new THREE.Group(); hb.position.set(x, 0.9, 0.36); hb.rotation.x = 0.2; bench.add(hb); put(hb, rbox(0.26, 0.18, 0.1, 0.05, M.stitch), 0, 0.78, 0); }
  put(bench, rbox(0.2, 0.08, 0.36, 0.03, M.stitch), -0.02, 1.02, 0.2);

  // ---- doors, pillars, roof ----
  for (const side of [-1, 1]) {
    const d = new THREE.Group(); put(cab, d, side * (HW + 0.03), 0, 0);
    put(d, rbox(0.06, 0.42, 1.25, 0.03, M.plastic), 0, 0.77, -0.2);
    put(d, rbox(0.07, 0.2, 1.1, 0.04, M.stitch), -side * 0.012, 1.02, -0.22);
    put(d, rbox(0.07, 0.09, 1.25, 0.03, M.dash), -side * 0.005, 1.19, -0.2);
    put(d, new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 1.0), M.chrome), -side * 0.048, 1.13, -0.22);
    put(d, rbox(0.11, 0.05, 0.42, 0.02, M.stitch), -side * 0.07, 0.93, -0.05);
    put(d, rbox(0.06, 0.02, 0.16, 0.008, M.piano), -side * 0.07, 0.96, 0.08);
    for (const z of [0.04, 0.1]) put(d, rbox(0.02, 0.012, 0.03, 0.004, M.satin), -side * 0.08, 0.975, z);
    put(d, rbox(0.02, 0.04, 0.13, 0.01, M.chrome), -side * 0.04, 1.1, -0.58);
    put(d, new THREE.Mesh(new THREE.CircleGeometry(0.075, 28), M.piano), -side * 0.032, 0.68, -0.6, 0, -side * Math.PI / 2);
    put(d, new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 1.15), M.plastic), 0, 1.76, -0.15);
    put(cab, rbox(0.06, 0.58, 0.12, 0.02, M.liner), side * HW, 1.5, 0.48);
    const a0 = new THREE.Vector3(side * (HW - 0.01), 1.17, -1.33), a1 = new THREE.Vector3(side * (HW - 0.05), 1.78, -0.76);
    const ap = rbox(0.055, a0.distanceTo(a1), 0.075, 0.025, M.liner);
    ap.position.copy(a0).add(a1).multiplyScalar(0.5); ap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a1.clone().sub(a0).normalize()); cab.add(ap);
    put(cab, rbox(0.38, 0.018, 0.17, 0.008, M.liner), side * 0.38, 1.765, -0.66);
    for (const z of [0.05, 1.1]) { // grab handles
      const gh = new THREE.Group(); put(cab, gh, side * (HW - 0.04), 1.72, z);
      put(gh, rbox(0.025, 0.025, 0.2, 0.012, M.liner), 0, -0.03, 0); for (const dz of [-0.09, 0.09]) put(gh, rbox(0.025, 0.05, 0.025, 0.01, M.liner), 0, 0, dz);
    }
  }
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(1.62, 2.6), M.liner), 0, 1.8, 0.5, Math.PI / 2);
  put(cab, rbox(1.62, 0.05, 0.12, 0.02, M.liner), 0, 1.78, -0.76);
  put(cab, rbox(0.3, 0.035, 0.16, 0.015, M.liner), 0, 1.775, -0.6);
  for (const sx of [-1, 1]) put(cab, rbox(0.08, 0.01, 0.06, 0.005, M.dome), sx * 0.07, 1.757, -0.6);
  put(cab, rbox(0.26, 0.02, 0.14, 0.008, M.dome), 0, 1.788, 0.65);
  put(cab, new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.07, 8), M.plastic), 0, 1.745, -0.74);
  put(cab, rbox(0.26, 0.07, 0.035, 0.02, M.plastic), 0, 1.7, -0.73);
  put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.055), std({ color: '#7f8b94', roughness: 0.05, metalness: 1 })), 0, 1.7, -0.711);

  // windscreen tint + PROPERTY MANAGER sun-strip banner
  const ws0 = new THREE.Vector3(0, 1.165, -1.36), ws1 = new THREE.Vector3(0, 1.79, -0.77);
  const tilt = Math.atan2(ws1.y - ws0.y, -(ws1.z - ws0.z));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.62, ws0.distanceTo(ws1)), std({ color: '#9fb6c4', transparent: true, opacity: 0.06, roughness: 0.05, metalness: 0.2, depthWrite: false }));
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

  // outside mirrors (gloss black caps) seen through the side glass
  for (const side of [-1, 1]) {
    put(cab, rbox(0.25, 0.16, 0.13, 0.05, paint), side * 1.06, 1.3, -1.22);
    put(cab, new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.13), std({ color: '#8a96a0', roughness: 0.05, metalness: 1 })), side * 1.06, 1.3, -1.15);
    put(cab, rbox(0.12, 0.05, 0.05, 0.02, M.plastic), side * 0.95, 1.25, -1.22);
  }

  let tScreen = 0;
  return {
    group: cab,
    screenCanvas: screen.tex.image,
    setRoute: path => screen.setRoute(path),
    update(dt, info) {
      gauges.draw(info.speedKmh, info.km);
      spin.rotation.z += ((info.steer || 0) * 6 - spin.rotation.z) * Math.min(1, dt * 4);
      tScreen -= dt; if (tScreen <= 0) { tScreen = 0.25; screen.draw(info); }
    },
  };
}
