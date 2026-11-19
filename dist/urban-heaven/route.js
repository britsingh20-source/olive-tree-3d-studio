// Property Manager · Urban Heaven cab tour — route data and path maths (no Three.js here,
// so check-urban-heaven.mjs can test it in Node).
//
// Kilometre marks are APPROXIMATE (estimated from public locality coordinates and the
// ~26 km Thudiyalur–Mettupalayam highway length) until Bright confirms them. The three
// turns after KNM Mills (left, ~750 m then right, ~500 m then left) are Bright's own
// directions. The final straight to the gate has no confirmed length yet.

export const SCALE = { highway: 300, side: 400, site: 400 }; // world units per real km
export const HIGHWAY_KM = 26;      // Thudiyalur → Mettupalayam along NH-181 (approx.)
export const JUNCTION_KM = 9.0;    // KNM Mills turn-off, measured from Thudiyalur (approx.)
export const SIDE_KM = { first: 0.75, second: 0.5, final: 0.3, inside: 0.15 };

export const STOPS = [
  { id: 'thudiyalur', en: 'Thudiyalur', ta: 'துடியலூர்', km: 0 },
  { id: 'nggo', en: 'NGGO Colony', ta: 'என்.ஜி.ஜி.ஓ காலனி', km: 1.6 },
  { id: 'nnpalayam', en: 'Narasimhanaickenpalayam', ta: 'நரசிம்மநாயக்கன்பாளையம்', km: 4.0 },
  { id: 'pnpalayam', en: 'Periyanaickenpalayam', ta: 'பெரியநாயக்கன்பாளையம்', km: 7.0 },
  { id: 'santhaimedu', en: 'Santhaimedu · KNM Mills', ta: 'சந்தைமேடு', km: JUNCTION_KM },
  { id: 'karamadai', en: 'Karamadai', ta: 'காரமடை', km: 17.0 },
  { id: 'mettupalayam', en: 'Mettupalayam', ta: 'மேட்டுப்பாளையம்', km: HIGHWAY_KM },
];

export const PICKUPS = {
  thudiyalur: { id: 'thudiyalur', label: 'Thudiyalur', startKm: 0, dir: +1, junctionTurn: 'left' },
  mettupalayam: { id: 'mettupalayam', label: 'Mettupalayam', startKm: HIGHWAY_KM, dir: -1, junctionTurn: 'right' },
};

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Gentle bends so the highway is not a ruler line; perfectly straight around the junction
// and the two pickup points so the turn and the start read clearly.
export function highwayX(km) {
  const env = smooth(0.4, 1.4, Math.abs(km - JUNCTION_KM)) * smooth(0.2, 0.8, km) * smooth(0.2, 0.8, HIGHWAY_KM - km);
  return env * (34 * Math.sin(km * 0.71) * Math.sin(km * 0.23 + 0.6) + 9 * Math.sin(km * 2.1));
}
export const highwayPoint = km => ({ x: highwayX(km), z: -km * SCALE.highway });

// North is −Z, west is −X. The side road leaves the highway westward (left when
// travelling north from Thudiyalur, right when travelling south from Mettupalayam).
export function sideKeyPoints() {
  const j = highwayPoint(JUNCTION_KM);
  const t1 = { x: j.x - SIDE_KM.first * SCALE.side, z: j.z };          // then turn right → north
  const t2 = { x: t1.x, z: t1.z - SIDE_KM.second * SCALE.side };      // then turn left → west
  const gate = { x: t2.x - SIDE_KM.final * SCALE.side, z: t2.z };
  const end = { x: gate.x - SIDE_KM.inside * SCALE.site, z: gate.z };
  return { junction: j, turn1: t1, turn2: t2, gate, end };
}

const dist = (a, b) => Math.hypot(b.x - a.x, b.z - a.z);

function fillet(points, maxR = 12) {
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i], a = points[i - 1], b = points[i + 1];
    const la = dist(a, p), lb = dist(p, b);
    const ua = { x: (p.x - a.x) / la, z: (p.z - a.z) / la }, ub = { x: (b.x - p.x) / lb, z: (b.z - p.z) / lb };
    const turn = Math.abs(Math.atan2(ua.x * ub.z - ua.z * ub.x, ua.x * ub.x + ua.z * ub.z));
    if (turn < 0.26) { out.push(p); continue; }
    const r = Math.min(maxR, 0.45 * la, 0.45 * lb);
    const A = { ...p, x: p.x - ua.x * r, z: p.z - ua.z * r }, B = { ...b, x: p.x + ub.x * r, z: p.z + ub.z * r };
    for (let k = 0; k <= 8; k++) {
      const t = k / 8, u = 1 - t;
      out.push({ ...p, x: u * u * A.x + 2 * u * t * p.x + t * t * B.x, z: u * u * A.z + 2 * u * t * p.z + t * t * B.z });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

// Car path for one pickup: dense points {x,z,type,s,km,hwKm} plus the event list.
export function buildCarPath(pickupId, step = 1) {
  const P = PICKUPS[pickupId];
  if (!P) throw new Error('Unknown pickup ' + pickupId);
  const key = [];
  const n = Math.round(Math.abs(JUNCTION_KM - P.startKm) * SCALE.highway / 20);
  for (let i = 0; i <= n; i++) {
    const km = P.startKm + (JUNCTION_KM - P.startKm) * i / n;
    key.push({ ...highwayPoint(km), type: 'highway', hwKm: km });
  }
  const sk = sideKeyPoints();
  key.push({ ...sk.turn1, type: 'side' }, { ...sk.turn2, type: 'side' }, { ...sk.gate, type: 'side', tag: 'gate' }, { ...sk.end, type: 'site' });
  const smoothKey = fillet(key);

  // Resample to an even spacing in world units, keeping real-km and highway-km tallies.
  const pts = [];
  let s = 0, km = 0;
  const push = (x, z, src) => pts.push({ x, z, type: src.type, s, km, hwKm: src.hwKm });
  push(smoothKey[0].x, smoothKey[0].z, smoothKey[0]);
  let carry = 0;
  for (let i = 1; i < smoothKey.length; i++) {
    const a = smoothKey[i - 1], b = smoothKey[i], L = dist(a, b);
    if (L === 0) continue;
    let d = step - carry;
    while (d <= L) {
      const t = d / L, src = t < 0.5 ? a : b;
      const hw = a.hwKm !== undefined && b.hwKm !== undefined ? a.hwKm + (b.hwKm - a.hwKm) * t : undefined;
      s += step; km += step / SCALE[b.type === 'highway' ? 'highway' : b.type];
      push(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, { ...src, hwKm: hw });
      d += step;
    }
    carry = L - (d - step);
  }

  const sAtPoint = target => pts.reduce((best, p) => dist(p, target) < dist(best, target) ? p : best, pts[0]).s;
  const events = [];
  const onRoute = STOPS.filter(st => (P.dir > 0 ? st.km >= P.startKm && st.km <= JUNCTION_KM : st.km <= P.startKm && st.km >= JUNCTION_KM));
  for (const st of onRoute) {
    const p = pts.find(q => q.hwKm !== undefined && (P.dir > 0 ? q.hwKm >= st.km - 1e-9 : q.hwKm <= st.km + 1e-9)) || pts[pts.length - 1];
    events.push({ kind: st.km === P.startKm ? 'pickup' : 'stop', id: st.id, en: st.en, ta: st.ta, s: p.s });
  }
  const jS = events.find(e => e.id === 'santhaimedu').s;
  events.push({ kind: 'turn', id: 'knm-turn', turn: P.junctionTurn, en: `Turn ${P.junctionTurn} at KNM Mills`, s: jS + 0.5 });
  events.push({ kind: 'turn', id: 'turn-2', turn: 'right', en: 'Turn right', s: sAtPoint(sk.turn1) });
  events.push({ kind: 'turn', id: 'turn-3', turn: 'left', en: 'Turn left · straight road to the site', s: sAtPoint(sk.turn2) });
  events.push({ kind: 'arrive', id: 'gate', en: 'Urban Heaven', s: sAtPoint(sk.gate) });
  events.sort((a, b) => a.s - b.s);
  for (const e of events) e.km = pts[Math.min(pts.length - 1, Math.round(e.s / step))].km;
  return { pickup: P, points: pts, events, totalS: s, totalKm: km, step };
}
