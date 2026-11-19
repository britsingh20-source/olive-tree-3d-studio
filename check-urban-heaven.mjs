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
const html = fs.readFileSync('dist/urban-heaven/index.html', 'utf8'), js = fs.readFileSync('dist/urban-heaven/tour.js', 'utf8');
assert(html.includes('PROPERTY MANAGER') && html.includes('data-pickup="thudiyalur"') && html.includes('data-pickup="mettupalayam"'));
assert(html.includes('tour.js?v=uh7') && js.includes("route.js?v=uh7"));
console.log('urban-heaven route checks passed', t.toFixed(2), m.toFixed(2));
