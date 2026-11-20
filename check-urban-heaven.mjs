// Source test for the Urban Heaven Property Manager cab tour (route data and path maths).
// Not a visual test: it does not render the 3D drive.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const R = await import('./dist/urban-heaven/route.js');
// Bright's stop order from Thudiyalur.
assert.deepEqual(R.STOPS.map(s => s.id), ['thudiyalur', 'nggo', 'nnpalayam', 'pnpalayam', 'santhaimedu', 'karamadai', 'mettupalayam']);
for (let i = 1; i < R.STOPS.length; i++) assert(R.STOPS[i].km > R.STOPS[i - 1].km, 'stops increase along the highway');
assert.equal(R.STOPS.find(s => s.id === 'santhaimedu').km, R.JUNCTION_KM);
const turns = id => R.buildCarPath(id).events.filter(e => e.kind === 'turn').map(e => e.turn);
// Thudiyalur: left at KNM Mills, ~750 m right, ~500 m left. Mettupalayam approaches from the other side, so the first turn is right.
assert.deepEqual(turns('thudiyalur'), ['left', 'right', 'left']);
assert.deepEqual(turns('mettupalayam'), ['right', 'right', 'left']);
for (const id of ['thudiyalur', 'mettupalayam']) {
  const p = R.buildCarPath(id), ev = Object.fromEntries(p.events.map(e => [e.id, e]));
  // path is continuous (even spacing) and ends inside the site
  for (let i = 1; i < p.points.length; i++) assert(Math.hypot(p.points[i].x - p.points[i - 1].x, p.points[i].z - p.points[i - 1].z) <= p.step + 1e-6);
  assert.equal(p.points.at(-1).type, 'site');
  assert.equal(p.events[0].kind, 'pickup'); assert.equal(p.events.at(-1).kind, 'arrive');
  for (let i = 1; i < p.events.length; i++) assert(p.events[i].s >= p.events[i - 1].s, 'events in travel order');
  // side-road leg lengths ≈ 0.75 km and 0.5 km (fillets shave a few metres)
  assert(Math.abs(ev['turn-2'].km - ev['knm-turn'].km - 0.75) < 0.03, id + ' first leg');
  assert(Math.abs(ev['turn-3'].km - ev['turn-2'].km - 0.5) < 0.03, id + ' second leg');
  assert(Math.abs(ev['knm-turn'].km - Math.abs(R.PICKUPS[id].startKm - R.JUNCTION_KM)) < 0.03, id + ' highway leg');
}
assert.deepEqual(R.buildCarPath('thudiyalur').events.filter(e => e.kind === 'stop').map(e => e.id), ['nggo', 'nnpalayam', 'pnpalayam', 'santhaimedu']);
assert.deepEqual(R.buildCarPath('mettupalayam').events.filter(e => e.kind === 'stop').map(e => e.id), ['karamadai', 'santhaimedu']);
const t = R.buildCarPath('thudiyalur').totalKm, m = R.buildCarPath('mettupalayam').totalKm;
assert(t > 10.4 && t < 11, 'Thudiyalur ≈ 10.7 km'); assert(m > 18.4 && m < 19, 'Mettupalayam ≈ 18.7 km');
// page wiring
const html = fs.readFileSync('dist/urban-heaven/cab3d.html', 'utf8'), js = fs.readFileSync('dist/urban-heaven/tour.js', 'utf8');
assert(html.includes('PROPERTY MANAGER') && html.includes('data-pickup="thudiyalur"') && html.includes('data-pickup="mettupalayam"'));
assert(html.includes('tour.js?v=uh8') && js.includes("route.js?v=uh8"));
console.log('urban-heaven route checks passed', t.toFixed(2), m.toFixed(2));
// Map tour (default page since 19 Nov rev m1)
{
  const D = await import('./dist/urban-heaven/map-data.js');
  const len = r => r.reduce((s, p, i) => i ? s + Math.hypot((p[0] - r[i - 1][0]) * 111320, (p[1] - r[i - 1][1]) * 111320 * Math.cos(p[0] * Math.PI / 180)) : 0, 0);
  const t = len(D.ROUTES.thudiyalur) / 1000, m = len(D.ROUTES.mettupalayam) / 1000;
  assert(t > 10.4 && t < 11.1, 'Thudiyalur road leg ' + t); assert(m > 17.2 && m < 17.9, 'Mettupalayam road leg ' + m);
  for (const r of Object.values(D.ROUTES)) assert(Math.hypot(r.at(-1)[0] - D.JUNCTION[0], r.at(-1)[1] - D.JUNCTION[1]) < 0.001, 'route ends at KNM turn');
  assert.deepEqual(D.STOPS.thudiyalur.map(s => s.id), ['thudiyalur', 'nggo', 'nnpalayam', 'pnpalayam', 'knm']);
  assert.deepEqual(D.STOPS.mettupalayam.map(s => s.id), ['mettupalayam', 'teachers', 'karamadai', 'kalattiyur', 'knm']);
  assert.equal(D.STOPS.thudiyalur.at(-1).turn, 'left'); assert.equal(D.STOPS.mettupalayam.at(-1).turn, 'right');
  const html = fs.readFileSync('dist/urban-heaven/index.html', 'utf8');
  assert(html.includes('map.js?v=m13') && html.includes('../vendor/leaflet/leaflet.js') && html.includes('OLIVETREE BUILDERS'));
  console.log('map tour checks passed', t.toFixed(2), m.toFixed(2));
}
// Phase 2 3D layout (site3d.js) — traced from the PDF
{
  const { LAYOUT } = await import('./dist/urban-heaven/site-layout.js');
  assert.deepEqual(LAYOUT.plots.map(p => p.n), Array.from({ length: 46 }, (_, i) => i + 1));
  const cnt = c => LAYOUT.plots.filter(p => p.cat === c).length;
  assert.deepEqual([cnt('sunshine'), cnt('elegant'), cnt('ethnic'), cnt('early')], [10, 20, 10, 6]);
  for (const n of [45, 33, 20, 7]) assert(LAYOUT.plots[n - 1].c[0] < LAYOUT.plots[n + (n === 45 ? -4 : 4) - 1].c[0], 'row order west→east');
  const area = p => Math.abs(p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2);
  // The PDF drawing is indicative: corner/odd plots 1, 14, 27, 40 and 46 are not drawn to the table's areas
  // (plot 1 drawn ~14% small, 46 ~19% large). All others trace within 5%. Cards show the table figures.
  const DRAWN_OFF = new Set([1, 14, 27, 40, 46]);
  for (const p of LAYOUT.plots) assert(Math.abs(area(p.poly) - p.sqm) / p.sqm < (DRAWN_OFF.has(p.n) ? 0.2 : 0.05), `plot ${p.n} traced ${area(p.poly).toFixed(1)} vs ${p.sqm} sq.m`);
  assert.equal(LAYOUT.facts.sqft, 49494);
  assert.deepEqual(LAYOUT.extras.map(e => e.id).sort(), ['EB', 'P', 'park']);
  console.log('phase 2 layout checks passed');
}
