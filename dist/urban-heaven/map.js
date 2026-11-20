// Property Manager · Urban Heaven — top-view map tour. A cab drives the real road from the chosen
// pickup, through each stop, takes the three turns to the site, enters it, then the map zooms in.
import { JUNCTION, ROUTES, STOPS, SIDE_ROUTE, SITE } from './map-data.js?v=m14';
const L = window.L, $ = id => document.getElementById(id);

// ---------- geometry helpers ----------
const R = 6371000, rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
function dist(a, b) {
  const p1 = rad(a[0]), p2 = rad(b[0]), dp = p2 - p1, dl = rad(b[1] - a[1]);
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h));
}
function bearing(a, b) {
  const p1 = rad(a[0]), p2 = rad(b[0]), dl = rad(b[1] - a[1]);
  return (deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))) + 360) % 360;
}
function dest(a, brg, m) {
  const d = m / R, b = rad(brg), p1 = rad(a[0]), l1 = rad(a[1]);
  const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
  return [deg(p2), deg(l2)];
}
// side road from the KNM turn, per Bright's directions (west side of the highway)
// side road: real road geometry from the KNM turn to the Panchayat road, then into the site (map-data.js)
const SIDE_PATH = SIDE_ROUTE.slice(1), GATE = SITE.gate;

function buildPath(id) {
  const pts = ROUTES[id].map(p => [p[0], p[1]]).concat(SIDE_PATH);
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
  const hwLen = cum[ROUTES[id].length - 1];
  const nearest = at => { let bi = 0, bd = 1e9; for (let i = 0; i < ROUTES[id].length; i++) { const d = dist(pts[i], at); if (d < bd) { bd = d; bi = i; } } return cum[bi]; };
  const events = STOPS[id].map(st => ({ kind: st.pickup ? 'pickup' : 'stop', ...st, m: st.id === 'knm' ? hwLen : nearest(st.at) }));
  const knm = events.find(e => e.id === 'knm');
  const nearSide = at => { let bi = ROUTES[id].length - 1, bd = 1e9; for (let i = bi; i < pts.length; i++) { const d = dist(pts[i], at); if (d < bd) { bd = d; bi = i; } } return cum[bi]; };
  SITE.turns.forEach((t, k) => events.push({ kind: 'turn', id: 'turn' + (k + 2), en: t.en, turn: t.turn, m: nearSide(t.at) }));
  events.push({ kind: 'arrive', id: 'gate', en: 'Urban Heaven', m: nearSide(GATE) + 8 });
  knm.kind = 'turn'; knm.en = `Turn ${knm.turn} at KNM Mills`; knm.stopName = 'Santhaimedu · KNM Mills';
  events.sort((a, b) => a.m - b.m);
  return { id, pts, cum, total: cum[cum.length - 1], hwLen, events };
}
function pointAt(path, m) {
  const { pts, cum } = path; m = Math.max(0, Math.min(path.total, m));
  let i = 1; while (i < cum.length - 1 && cum[i] < m) i++;
  const t = (m - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1), a = pts[i - 1], b = pts[i];
  return { ll: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], brg: bearing(a, b), i };
}

// ---------- map ----------
const map = L.map('map', { zoomControl: false, attributionControl: true, zoomSnap: 0.25 }).setView([11.19, 76.945], 12);
L.control.zoom({ position: 'topright' }).addTo(map);
const sat = L.layerGroup([
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' }),
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, opacity: 0.85 }),
]);
const street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' });
let baseIsSat = true; sat.addTo(map);
$('layerBtn').onclick = () => { baseIsSat = !baseIsSat; if (baseIsSat) { map.removeLayer(street); sat.addTo(map); } else { map.removeLayer(sat); street.addTo(map); } $('layerBtn').textContent = baseIsSat ? 'Map view' : 'Satellite view'; };

const routeLayer = L.layerGroup().addTo(map), signLayer = L.layerGroup().addTo(map);
const carIcon = L.divIcon({ className: 'car-icon', iconSize: [34, 34], iconAnchor: [17, 17], html: `<div class="car-rot"><svg viewBox="0 0 40 72" width="20" height="36" aria-hidden="true">
  <rect x="3" y="3" width="34" height="66" rx="11" fill="#111418" stroke="#f6c519" stroke-width="2.5"/>
  <rect x="7" y="14" width="26" height="12" rx="4" fill="#5b6f7d"/><rect x="8" y="50" width="24" height="9" rx="3" fill="#5b6f7d"/>
  <rect x="12" y="31" width="16" height="9" rx="2" fill="#f6c519"/><circle cx="9" cy="6" r="2.4" fill="#fff8d8"/><circle cx="31" cy="6" r="2.4" fill="#fff8d8"/>
  <rect x="6" y="66" width="7" height="2.5" fill="#e0303a"/><rect x="27" y="66" width="7" height="2.5" fill="#e0303a"/></svg></div>` });
const car = L.marker(JUNCTION, { icon: carIcon, interactive: false, zIndexOffset: 1000 });
let doneLine, todoLine, siteBox;

function signHtml(e, kmLeft) {
  if (e.kind === 'turn' && e.id !== 'knm') return `<div class="sign turn"><b>${e.turn === 'left' ? '↰' : '↱'}</b><span>${e.turn === 'left' ? 'Left' : 'Right'}</span></div>`;
  const name = e.stopName || e.en;
  const extra = e.id === 'knm' ? `<i>${e.turn === 'left' ? '↰' : '↱'} Urban Heaven</i>` : `<i>Urban Heaven ${kmLeft} km</i>`;
  return `<div class="sign${e.pickup ? ' pickup' : ''}">${e.ta ? `<small>${e.ta}</small>` : ''}<strong>${name.toUpperCase()}</strong>${e.pickup ? '<i>PICKUP POINT</i>' : extra}</div>`;
}
function drawRoute(path) {
  routeLayer.clearLayers(); signLayer.clearLayers();
  const all = path.pts;
  L.polyline(all, { color: '#0d1b14', weight: 11, opacity: 0.55 }).addTo(routeLayer);
  todoLine = L.polyline(all, { color: '#ffffff', weight: 5, opacity: 0.95, dashArray: '10 10' }).addTo(routeLayer);
  doneLine = L.polyline([all[0]], { color: '#f6c519', weight: 7, opacity: 1 }).addTo(routeLayer);
  for (const e of path.events) {
    if (e.kind === 'arrive') continue;
    const at = pointAt(path, e.m).ll, kmLeft = ((path.total - e.m) / 1000).toFixed(1);
    e.marker = L.marker(at, { interactive: false, icon: L.divIcon({ className: 'sign-wrap', iconSize: [0, 0], html: signHtml(e, kmLeft) }) }).addTo(signLayer);
    L.circleMarker(at, { radius: 6, color: '#0d1b14', weight: 2, fillColor: e.kind === 'turn' ? '#4f8dff' : '#ffffff', fillOpacity: 1 }).addTo(signLayer);
  }
  // site: placeholder plot area beyond the gate (replace with the real layout when supplied)
  // site outline: Phase 2 boundary placed from Bright's pin (north-up as drawn)
  siteBox = L.polygon(SITE.outline, { color: '#d9b96a', weight: 3, fillColor: '#2e6b4f', fillOpacity: 0.22, dashArray: '6 6' }).addTo(signLayer);
  L.marker(SITE.center, { interactive: false, icon: L.divIcon({ className: 'sign-wrap', iconSize: [0, 0], html: '<div class="sign site"><small>OLIVETREE BUILDERS</small><strong>URBAN HEAVEN</strong><i>Veerapandi · Mettupalayam Road</i></div>' }) }).addTo(signLayer);
  car.addTo(map);
}

// ---------- tour ----------
let path = null, m = 0, playing = false, speedMul = 1, fired = new Set(), finished = false, follow = true, intro = 0, hold = 0;
// Displayed road speed in km/h (Bright, 19 Nov 11:52): 150–160 on the highway, no slowing at stops (the
// stop's board is highlighted instead); speed limit 80 from the KNM Mills turn to the site.
// The ride is shown TIME_SCALE× faster than real time so a whole trip takes about a minute.
const TIME_SCALE = 10;
const ease = t => t * t * (3 - 2 * t);
function kmhAt(mm) {
  const onHighway = mm < path.hwLen;
  let v = onHighway ? 155 + 5 * Math.sin(mm / 1500) : 80; // 150–160 on the highway, 80 after the KNM Mills turn
  for (const e of path.events) {
    const d = e.m - mm; // >0 before the event
    if (e.kind === 'turn' && e.id === 'knm') { const t = d >= 0 ? Math.min(1, d / 600) : 0; if (d >= 0 && t < 1) v = Math.min(v, 80 + (v - 80) * ease(t)); } // ease 155→80 into the KNM turn
    if (e.kind === 'arrive' && d > -100) v = Math.min(v, 20 + Math.max(0, d) * 0.4);
  }
  v = Math.min(v, 20 + mm * 0.5, 8 + (path.total - mm) * 0.5); // pull away / roll in
  return v;
}
const speedAt = mm => kmhAt(mm) / 3.6 * TIME_SCALE;
function banner(t, s) { $('bannerTitle').textContent = t; $('bannerSub').textContent = s || ''; $('stopBanner').hidden = false; clearTimeout(banner.t); banner.t = setTimeout(() => $('stopBanner').hidden = true, 2800); }
function buildStrip() {
  const strip = $('strip'); strip.innerHTML = '<div class="strip-line"></div><div id="stripFill" class="strip-fill"></div><div id="stripCar" class="strip-car" aria-hidden="true">🚕</div>';
  const last = path.events[path.events.length - 1];
  for (const e of path.events) {
    if (e.kind === 'turn' && e.id !== 'knm') continue;
    const d = document.createElement('div'); d.className = 'tick ' + e.kind + (e === last ? ' last' : '');
    d.style.left = (e.m / path.total * 100) + '%';
    d.innerHTML = `<i></i><span>${e.kind === 'arrive' ? 'Urban Heaven' : e.id === 'knm' ? 'KNM Mills' : e.en}</span>`; strip.appendChild(d);
  }
}
// highlight the board of the area the cab is passing (from 600 m before to 400 m after)
function highlightBoards() {
  for (const e of path.events) {
    if (!e.marker) continue; const el = e.marker.getElement(); if (!el) continue;
    const d = e.m - m, on = d < 600 && d > -400;
    const sign = el.querySelector('.sign'); if (sign && sign.classList.contains('hot') !== on) { sign.classList.toggle('hot', on); e.marker.setZIndexOffset(on ? 900 : 0); }
  }
}
function updateHud() {
  highlightBoards();
  $('kmDone').textContent = (m / 1000).toFixed(1); $('kmLeft').textContent = Math.max(0, (path.total - m) / 1000).toFixed(1);
  const pct = (m / path.total * 100) + '%'; $('stripFill').style.width = pct; $('stripCar').style.left = pct;
  const next = path.events.find(e => e.m > m + 1 && e.kind !== 'pickup');
  if (next) {
    const d = next.m - m, txt = d >= 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d / 10) * 10 + ' m';
    $('nextIcon').textContent = next.kind === 'turn' ? (next.turn === 'left' ? '↰' : '↱') : next.kind === 'arrive' ? '🏁' : '⦿';
    $('nextText').textContent = next.kind === 'stop' ? `Next stop · ${next.en}` : next.kind === 'arrive' ? 'Urban Heaven site entrance' : next.en;
    $('nextDist').textContent = 'in ' + txt;
  } else { $('nextIcon').textContent = '🏁'; $('nextText').textContent = 'You have arrived at Urban Heaven'; $('nextDist').textContent = ''; }
  for (const e of path.events) {
    if (fired.has(e.id) || m < e.m) continue; fired.add(e.id);
    // stops: the highlighted board on the map is the announcement (no banner covering it)
    if (e.kind === 'turn') banner(e.en, e.id === 'knm' ? 'Leaving Mettupalayam Road · about 1.5 km to the site' : '');
    if (e.kind === 'arrive') banner('Welcome to Urban Heaven', 'Entering the site');
  }
}
function placeCar() {
  const p = pointAt(path, m), ahead = pointAt(path, m + 25);
  car.setLatLng(p.ll);
  const el = car.getElement(); if (el) el.firstElementChild.style.transform = `rotate(${bearing(p.ll, ahead.ll) || p.brg}deg)`;
  doneLine.setLatLngs(path.pts.slice(0, p.i).concat([p.ll]));
  if (follow && !intro) map.panTo(p.ll, { animate: false });
}
function startTour(id) {
  path = buildPath(id); m = 0; fired = new Set(); finished = false; follow = true; hold = 0;
  drawRoute(path); buildStrip(); placeCar(); updateHud();
  $('pickup').hidden = true; $('arrived').hidden = true; $('hud').hidden = false; $('kmBox').hidden = false;
  $('routeName').textContent = `${STOPS[id][0].en} → Urban Heaven · ≈ ${(path.total / 1000).toFixed(1)} km`;
  try { localStorage.setItem('urban-heaven-pickup', id); } catch (e) {}
  // overview of the whole route first, then drop down to the cab
  intro = 1; setPlaying(false);
  map.fitBounds(L.latLngBounds(path.pts), { padding: [60, 60], animate: true, duration: 1 });
  banner(`Pickup · ${STOPS[id][0].en}`, 'Your Property Manager cab is on its way');
  setTimeout(() => { map.flyTo(path.pts[0], 16, { duration: 1.8 }); setTimeout(() => { intro = 0; setPlaying(true); }, 1900); }, 1800);
}
function finish() {
  finished = true; $('speedVal').textContent = '0'; setPlaying(false); $('playBtn').textContent = 'Ride again';
  if (!baseIsSat) $('layerBtn').click();
  map.flyToBounds(siteBox.getBounds(), { padding: [40, 40], maxZoom: 18.5, duration: 2.2 });
  setTimeout(() => { if (finished) openSite3d(); }, 2800);
}
// After arrival: the Phase 2 layout opens in 3D (falls back to the arrival card if WebGL is missing)
async function openSite3d(direct = false) {
  try {
    const mod = await import('./site3d.js?v=s29');
    $('hud').hidden = true; $('arrived').hidden = true; $('pickup').hidden = true;
    mod.openSite({ center: SITE.center, onBack: direct ? showPicker : () => { $('hud').hidden = false; $('arrived').hidden = false; } });
  } catch (err) { console.error(err); $('arrived').hidden = false; }
}
$('openSite').onclick = () => openSite3d();
// Direct site view: no cab ride — zoom the map into the site, then open the 3D layout
function directSite() {
  setPlaying(false); $('kmBox').hidden = true; path = null; $('pickup').hidden = true; $('hud').hidden = true; $('arrived').hidden = true;
  routeLayer.clearLayers(); signLayer.clearLayers(); map.removeLayer(car); drawOverview();
  if (!baseIsSat) $('layerBtn').click();
  map.flyToBounds(L.latLngBounds(SITE.outline), { padding: [60, 60], maxZoom: 18.5, duration: 2.4 });
  setTimeout(() => openSite3d(true), 2700);
}
$('directBtn').onclick = directSite;
function setPlaying(v) { playing = v; $('playBtn').textContent = v ? 'Pause' : 'Play'; }
$('playBtn').onclick = () => { if (finished) return startTour(path.id); follow = true; setPlaying(!playing); };
function showPicker() { setPlaying(false); $('kmBox').hidden = true; $('pickup').hidden = false; $('arrived').hidden = true; $('hud').hidden = true; if (!path) { drawOverview(); map.flyToBounds(OVERVIEW, { padding: [40, 40], duration: 1.2 }); } }
$('changeBtn').onclick = showPicker; $('againPick').onclick = showPicker; $('again').onclick = () => startTour(path.id);
$('recenter').onclick = () => { follow = true; if (path) map.setView(pointAt(path, m).ll, 16); };
map.on('dragstart', () => { follow = false; });
for (const b of document.querySelectorAll('[data-pickup]')) b.onclick = () => startTour(b.dataset.pickup);
for (const id of Object.keys(ROUTES)) { const el = document.querySelector(`[data-km="${id}"]`); if (el) el.textContent = `Cab ride · ≈ ${(buildPath(id).total / 1000).toFixed(1)} km`; }

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (path && playing && !finished) {
    m = Math.min(path.total, m + speedAt(m) * dt);
    $('speedVal').textContent = Math.round(kmhAt(m));
    placeCar(); updateHud();
    if (m >= path.total - 0.5) finish();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// overview behind the chooser: both routes, both pickup points and the site
const OVERVIEW = L.latLngBounds(ROUTES.thudiyalur.concat(ROUTES.mettupalayam));
function drawOverview() {
  routeLayer.clearLayers(); signLayer.clearLayers();
  for (const id of Object.keys(ROUTES)) L.polyline(buildPath(id).pts, { color: '#f6c519', weight: 4, opacity: 0.85 }).addTo(routeLayer);
  for (const id of Object.keys(ROUTES)) { const st = STOPS[id][0]; L.marker(st.at, { interactive: false, icon: L.divIcon({ className: 'sign-wrap', iconSize: [0, 0], html: `<div class="sign pickup"><strong>${st.en.toUpperCase()}</strong><i>PICKUP POINT</i></div>` }) }).addTo(signLayer); }
  L.polygon(SITE.outline, { color: '#d9b96a', weight: 3, fillColor: '#2e6b4f', fillOpacity: 0.3 }).addTo(signLayer);
  L.marker(SITE.center, { interactive: false, icon: L.divIcon({ className: 'sign-wrap', iconSize: [0, 0], html: '<div class="sign site"><small>OLIVETREE BUILDERS</small><strong>URBAN HEAVEN</strong><i>Veerapandi</i></div>' }) }).addTo(signLayer);
}
drawOverview();
map.fitBounds(OVERVIEW, { padding: [40, 40], paddingBottomRight: [40, 200] });
$('loading').hidden = true;
const q = new URLSearchParams(location.search), want = q.get('from'); if (want && ROUTES[want]) startTour(want); else if (q.get('view') === 'site') directSite();
window.__map = { map, get m() { return m; }, set m(v) { m = v; }, get path() { return path; }, startTour, finish };
