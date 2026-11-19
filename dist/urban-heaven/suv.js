// Property Manager cab — an ORIGINAL full-size 7-seater SUV (Fortuner-class proportions:
// ~4.8 m long, ~1.86 m wide, ~1.83 m tall, high ground clearance). Styling, grille,
// lamps and badging are our own; it deliberately copies no manufacturer's design.
import * as THREE from 'three';

const L = 4.8, W = 1.86;
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.1, ...o });

function textTex(lines, bg, fg, w = 1024, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } else g.clearRect(0, 0, w, h);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fg;
  lines.forEach((ln, i) => { g.font = `${ln.bold ? 700 : 500} ${ln.size}px "DM Sans", sans-serif`; g.fillText(ln.t, w / 2, h * (i + 1) / (lines.length + 1)); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// Profile drawn in (u = forward, v = up); extruded across the width, then turned so forward is −Z.
function profileMesh(shape, depth, material, bevel = 0.06) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * bevel, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 18 });
  g.translate(0, 0, -(depth - 2 * bevel) / 2);
  const m = new THREE.Mesh(g, material); m.rotation.y = Math.PI / 2; // +u → −Z
  return m;
}

export function buildSUV({ body = '#eef0ee', roof = '#1b1d20' } = {}) {
  const car = new THREE.Group();
  const paint = std(body, { roughness: 0.28, metalness: 0.35 }), dark = std('#17191c', { roughness: 0.7 }), chrome = std('#c9ced3', { roughness: 0.2, metalness: 0.9 });
  const glass = std('#1d2a33', { roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.88 });
  const R = 0.4, frontAxle = 1.45, rearAxle = -1.4, arch = 0.5;

  // ---- lower body with wheel arches ----
  const s = new THREE.Shape();
  s.moveTo(-2.36, 0.46);
  s.lineTo(rearAxle - arch, 0.46); s.absarc(rearAxle, R + 0.02, arch, Math.PI, 0, true);
  s.lineTo(frontAxle - arch, 0.46); s.absarc(frontAxle, R + 0.02, arch, Math.PI, 0, true);
  s.lineTo(2.33, 0.46);
  s.quadraticCurveTo(2.43, 0.5, 2.42, 0.72);   // front bumper
  s.quadraticCurveTo(2.42, 0.98, 2.3, 1.04);    // upright nose
  s.lineTo(1.4, 1.17);                          // long flat bonnet
  s.lineTo(-2.25, 1.2);                         // belt line
  s.quadraticCurveTo(-2.4, 1.18, -2.41, 1.0);   // tailgate
  s.lineTo(-2.42, 0.62); s.quadraticCurveTo(-2.42, 0.47, -2.36, 0.46);
  car.add(profileMesh(s, W, paint, 0.07));

  // ---- glasshouse: dark glass band + body-colour pillars + black roof ----
  const gh = new THREE.Shape();
  gh.moveTo(-2.24, 1.19); gh.lineTo(-2.17, 1.74); gh.quadraticCurveTo(-2.12, 1.8, -1.95, 1.8);
  gh.lineTo(0.55, 1.8); gh.quadraticCurveTo(0.7, 1.79, 0.78, 1.72); gh.lineTo(1.38, 1.18); gh.lineTo(-2.24, 1.19);
  const house = profileMesh(gh, W - 0.16, glass, 0.04); car.add(house);
  const roofS = new THREE.Shape();
  roofS.moveTo(-2.14, 1.76); roofS.lineTo(0.62, 1.76); roofS.quadraticCurveTo(0.72, 1.78, 0.66, 1.85); roofS.lineTo(-2.05, 1.86); roofS.quadraticCurveTo(-2.17, 1.84, -2.14, 1.76);
  car.add(profileMesh(roofS, W - 0.12, std(roof, { roughness: 0.3, metalness: 0.4 }), 0.04));
  for (const side of [-1, 1]) {
    const x = side * (W / 2 - 0.075);
    for (const [z, wdt, mat] of [[-0.2, 0.12, dark], [0.95, 0.1, dark], [1.85, 0.16, dark]]) { // B, C, D pillars (blacked out)
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.56, wdt), mat); p.position.set(x + side * 0.012, 1.48, z); car.add(p);
    }
    // chrome window line, roof rail, side step, door handles, cladding strip
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 3.5), chrome); line.position.set(side * (W / 2 - 0.05), 1.21, 0.4); car.add(line);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.5), chrome); rail.position.set(side * (W / 2 - 0.2), 1.9, 0.7); car.add(rail);
    for (const z of [-0.2, 1.45]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.12), dark); leg.position.set(side * (W / 2 - 0.2), 1.86, z); car.add(leg); }
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 1.8), chrome); step.position.set(side * (W / 2 + 0.03), 0.42, 0.05); car.add(step);
    const clad = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.14, 2.4), dark); clad.position.set(side * (W / 2 + 0.005), 0.56, 0.05); car.add(clad);
    for (const z of [-0.45, 0.55]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.2), chrome); h.position.set(side * (W / 2 + 0.01), 1.07, z); car.add(h); }
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.12), paint); mirror.position.set(side * (W / 2 + 0.12), 1.3, -1.22); car.add(mirror);
    // door decal
    const dec = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.28), new THREE.MeshBasicMaterial({ map: textTex([{ t: 'PROPERTY MANAGER', size: 92, bold: true }, { t: 'Urban Heaven site tour', size: 58 }], null, '#2e6b4f', 1024, 300), transparent: true }));
    dec.position.set(side * (W / 2 + 0.012), 0.82, 0.05); dec.rotation.y = side * Math.PI / 2; car.add(dec);
    // wheel-arch cladding
    for (const z of [-frontAxle, -rearAxle]) {
      const a = new THREE.Mesh(new THREE.TorusGeometry(arch + 0.02, 0.05, 6, 20, Math.PI), dark); a.rotation.y = side * Math.PI / 2; a.position.set(side * (W / 2 + 0.01), R + 0.02, z); car.add(a);
    }
  }

  // ---- front: our own grille (horizontal chrome bars on a gloss-black frame), thin LED lamps ----
  const zF = -L / 2 - 0.09, zR = L / 2 + 0.1;
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.34, 0.05), std('#0d0e10', { roughness: 0.15 })); grille.position.set(0, 0.86, zF); car.add(grille);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.025, 0.03), chrome); b.position.set(0, 0.74 + i * 0.08, zF - 0.03); car.add(b); }
  const lamp = std('#e9f4ff', { emissive: '#cfe6ff', emissiveIntensity: 0.9, roughness: 0.1 });
  for (const sx of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.05), lamp); hl.position.set(sx * 0.67, 0.97, zF + 0.01); hl.rotation.z = sx * 0.08; car.add(hl);
    const drl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.04), lamp); drl.position.set(sx * 0.68, 0.9, zF + 0.0); car.add(drl);
    const fog = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12), lamp); fog.rotation.x = Math.PI / 2; fog.position.set(sx * 0.72, 0.58, zF + 0.03); car.add(fog);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.1, 0.04), std('#b3121b', { emissive: '#7a0a10', emissiveIntensity: 0.8 })); tl.position.set(sx * 0.7, 1.05, zR); car.add(tl);
  }
  const skid = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.06), chrome); skid.position.set(0, 0.52, zF + 0.04); car.add(skid);
  const intake = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 0.05), dark); intake.position.set(0, 0.65, zF + 0.02); car.add(intake);
  const rearBar = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 0.08), dark); rearBar.position.set(0, 0.56, zR); car.add(rearBar);
  const plateTex = textTex([{ t: 'URBAN HEAVEN', size: 120, bold: true }], '#f6c519', '#111', 1024, 220);
  for (const [z, ry] of [[zF - 0.04, Math.PI], [zR + 0.03, 0]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.12), new THREE.MeshBasicMaterial({ map: plateTex })); p.position.set(0, z < 0 ? 0.66 : 0.76, z); p.rotation.y = ry; car.add(p); }
  // roof sign
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.2, 0.26), std('#f6c519')); sign.position.set(0, 2.02, -0.2); car.add(sign);
  const signTex = textTex([{ t: 'PROPERTY MANAGER', size: 118, bold: true }], '#f6c519', '#1d1f22', 1024, 230);
  for (const f of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.17), new THREE.MeshBasicMaterial({ map: signTex })); p.position.set(0, 2.02, -0.2 + f * 0.135); if (f > 0) p.rotation.y = Math.PI; car.add(p); }

  // ---- 18-inch-look alloy wheels ----
  const tyre = std('#141414', { roughness: 0.9 }), rim = std('#b9bec4', { roughness: 0.25, metalness: 0.85 });
  const wheels = [];
  for (const z of [-frontAxle, -rearAxle]) for (const side of [-1, 1]) {
    const wg = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.27, 28), tyre); t.rotation.z = Math.PI / 2; wg.add(t);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.66, R * 0.66, 0.28, 24), rim); disc.rotation.z = Math.PI / 2; wg.add(disc);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12), dark); hub.rotation.z = Math.PI / 2; wg.add(hub);
    for (let k = 0; k < 6; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.05, R * 1.2), dark); sp.rotation.x = k * Math.PI / 6; sp.scale.set(1, 1, 0.98); sp.position.x = side * 0.003; wg.add(sp); }
    wg.position.set(side * (W / 2 - 0.13), R, z); car.add(wg); wheels.push(wg);
  }
  car.userData.wheels = wheels; car.userData.wheelRadius = R;
  return car;
}

// Passenger's view from the front-left seat (right-hand drive): high SUV seating, two-tone dash,
// centre touchscreen, long bonnet ahead.
export function buildSUVInterior({ body = '#eef0ee' } = {}) {
  const g = new THREE.Group();
  const black = std('#1c1d20', { roughness: 0.8 }), tan = std('#8a6a4c', { roughness: 0.7 }), paint = std(body, { roughness: 0.28, metalness: 0.35 });
  const bonnet = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 1.9), paint); bonnet.position.set(0, 1.14, -2.25); g.add(bonnet);
  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.55), black); dash.position.set(0, 1.12, -1.15); g.add(dash);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.05), tan); trim.position.set(0, 1.05, -0.88); g.add(trim);
  const screenTex = textTex([{ t: 'PROPERTY MANAGER', size: 112, bold: true }, { t: 'Urban Heaven site tour', size: 66 }], '#0e1114', '#f6c519', 1024, 320);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.11), new THREE.MeshBasicMaterial({ map: screenTex })); screen.position.set(0.05, 1.27, -0.92); screen.rotation.x = -0.2; g.add(screen);
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.14, 0.02), black); bezel.position.set(0.05, 1.27, -0.93); bezel.rotation.x = -0.2; g.add(bezel);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.028, 10, 32), black); wheel.position.set(0.42, 1.2, -0.72); wheel.rotation.x = -0.4; g.add(wheel);
  const hubW = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), tan); hubW.rotation.x = Math.PI / 2 - 0.4; hubW.position.set(0.42, 1.2, -0.72); g.add(hubW);
  for (const sx of [-0.88, 0.88]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.75, 0.045), black); p.position.set(sx, 1.55, -1.02); p.rotation.x = -0.65; g.add(p); }
  const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.02), black); mirror.position.set(0, 1.82, -0.85); g.add(mirror);
  return g;
}
