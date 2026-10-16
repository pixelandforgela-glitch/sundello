/* Sundello Workforce builder - vanilla ES module. Needs: three (import map), window.fitSite, catalog.
 * Catalog comes from window.SUNDELLO_CATALOG or ./catalog.json. Submit uses window.SundelloLead
 * (sundello-config.js) when present; otherwise it shows the inquiry so it can be copied. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v; else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
};

const CAT = window.SUNDELLO_CATALOG || await (await fetch(new URL('catalog.json', import.meta.url))).json();
const P = Object.fromEntries(CAT.products.map(p => [p.code, p]));
const O = CAT.options;

const USES = {
  backyard: { label: 'Backyard / single lot', hint: 'One unit behind a house or on a small lot.', site: { w: 20, l: 30, setback: 0, gap: 6, lane: 4 }, layout: 'single', qty: 1, accessible: false, interior: 'haven' },
  cluster: { label: 'Operator cluster', hint: 'A group of units around a shared lane or courtyard.', site: { w: 120, l: 100, setback: 5, gap: 6, lane: 20 }, layout: 'auto', qty: 0, accessible: true, interior: 'haven' },
  camp: { label: 'Crew camp', hint: 'Rows of units for a jobsite, plant or field crew.', site: { w: 1000, l: 40, setback: 0, gap: 6, lane: 12 }, layout: 'auto', qty: 0, accessible: true, interior: 'crew' },
};
const STATE_PKG = { H: 'FL LA MS HI PR VI GU', HD: 'AZ NV NM', C: 'AK ND SD MN WI MI MT WY ID UT CO ME VT NH NY IA NE' };
const LAYOUTS = [['auto', 'Best fit'], ['single', 'Single unit'], ['row', 'Rows on a lane'], ['double', 'Facing rows'], ['courtyard', 'Courtyard']];
const STEPS = [['project', 'Project'], ['site', 'Site'], ['unit', 'Unit'], ['layout', 'Layout'], ['exterior', 'Exterior'], ['interior', 'Interior'], ['package', 'Climate'], ['review', 'Review']];

const def = (arr) => (arr.find(x => x.default) || arr[0]).id;
const st = {
  step: 0, use: 'backyard', addr: { street: '', city: '', state: '', zip: '' },
  site: { ...USES.backyard.site }, product: 'S1', qty: 1, layout: 'single', accessible: false,
  clad: def(O.cladding), trim: def(O.trim), accent: def(O.accent), interior: 'haven', pkg: 'B', pkgTouched: false,
  cut: false, contact: { name: '', email: '', phone: '', org: '', notes: '' },
};
// restore from share link
try {
  const h = location.hash.slice(1);
  if (h.startsWith('c=')) Object.assign(st, JSON.parse(decodeURIComponent(escape(atob(h.slice(2).replace(/-/g, '+').replace(/_/g, '/'))))), { step: 0 });
} catch (e) { /* ignore a bad link */ }

/* ------------------------------------------------------------------ viewer */
const host = $('#sb-viewer');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#EEF0E8');
const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 20000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI * 0.495;
scene.add(new THREE.HemisphereLight('#ffffff', '#b8b2a2', 1.6));
const sun = new THREE.DirectionalLight('#fff6e6', 2.2); sun.position.set(-60, 120, 80); scene.add(sun);
const fill = new THREE.DirectionalLight('#dfe8f2', 0.6); fill.position.set(80, 40, -60); scene.add(fill);
const world = new THREE.Group(); scene.add(world);
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const mats = {};
function mat(key) {
  if (!mats[key]) mats[key] = new THREE.MeshStandardMaterial({ color: '#cccccc', roughness: key === 'glass' ? 0.25 : 0.85, metalness: key === 'steel' || key === 'glass' ? 0.25 : 0 });
  return mats[key];
}
function shade(hex, f) { const c = new THREE.Color(hex); c.offsetHSL(0, 0, f); return '#' + c.getHexString(); }
function palette() {
  const m = { ...O.materials };
  const clad = O.cladding.find(c => c.id === st.clad).hex, trim = O.trim.find(c => c.id === st.trim).hex;
  Object.assign(m, { clad, trim, skirt: trim, joint: shade(clad, -0.07) });
  const acc = O.accent.find(a => a.id === st.accent); m.accent = acc && acc.hex ? acc.hex : clad;
  Object.assign(m, (O.interior.find(i => i.id === st.interior) || {}).colors || {});
  const pk = O.package.find(p => p.id === st.pkg); if (pk && pk.roof) m.roof = pk.roof;
  return m;
}
function recolor() { const m = palette(); for (const [k, v] of Object.entries(mats)) v.color.set(m[k] || '#cccccc'); }

let fit = null, siteMeshes = [];
const CUT_Z = 33 + 60; // cutaway height, inches above grade
function partsFor(code) {
  const p = P[code], out = [...p.parts.shell, ...p.parts.access];
  if (st.cut) out.push(...p.parts.pod, ...p.parts.interior[st.interior]); else out.push(...p.parts.roof);
  return out;
}
function rebuild() {
  for (const m of siteMeshes) { world.remove(m); if (m.isInstancedMesh) m.dispose(); else m.geometry.dispose(); }
  siteMeshes = [];
  const opts = { siteW: +st.site.w, siteL: +st.site.l, setback: +st.site.setback, gap: +st.site.gap, lane: +st.site.lane,
    path: Math.min(4, +st.site.lane), courtyard: 30, layout: st.layout, product: st.product, count: st.qty || null, accessible: st.accessible };
  fit = window.fitSite(opts, CAT);
  const W = opts.siteW, L = opts.siteL;
  // ground, buildable outline, lanes
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(W, L), new THREE.MeshStandardMaterial({ color: '#DCE3CF', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, 0, -L / 2); siteMeshes.push(ground);
  const edge = (x0, y0, x1, y1, color) => {
    const g = new THREE.BufferGeometry().setFromPoints([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]].map(([x, y]) => new THREE.Vector3(x, 0.05, -y)));
    const line = new THREE.Line(g, new THREE.LineDashedMaterial({ color, dashSize: Math.max(1, W / 120), gapSize: Math.max(0.6, W / 200) }));
    line.computeLineDistances(); siteMeshes.push(line);
  };
  edge(0, 0, W, L, '#193E34');
  if (opts.setback > 0) edge(opts.setback, opts.setback, W - opts.setback, L - opts.setback, '#8a8f94');
  for (const ln of fit.lanes) {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(ln.x1 - ln.x0, ln.y1 - ln.y0), new THREE.MeshStandardMaterial({ color: O.materials.lane, roughness: 1 }));
    g.rotation.x = -Math.PI / 2; g.position.set((ln.x0 + ln.x1) / 2, 0.03, -(ln.y0 + ln.y1) / 2); siteMeshes.push(g);
  }
  // units: one instanced mesh per material slot
  const buckets = {};
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  for (const pl of fit.placements) {
    const p = P[pl.code], cx = p.interior_in[0] / 2, cy = 96, th = pl.rot * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    q.setFromAxisAngle(up, th);
    for (const part of partsFor(pl.code)) {
      let [x0, x1, y0, y1, z0, z1] = part.b;
      if (st.cut && part.c) { if (z0 >= CUT_Z) continue; z1 = Math.min(z1, CUT_Z); }
      const key = part.s === 'W' && st.accent !== 'none' ? 'accent' : part.m;
      const dx = ((x0 + x1) / 2 - cx) / 12, dy = ((y0 + y1) / 2 - cy) / 12;
      pos.set(pl.x + dx * c - dy * s, (z0 + z1) / 24, -(pl.y + dx * s + dy * c));
      scl.set(Math.max(0.01, (x1 - x0) / 12), Math.max(0.01, (z1 - z0) / 12), Math.max(0.01, (y1 - y0) / 12));
      (buckets[key] = buckets[key] || []).push(m4.compose(pos, q, scl).clone());
    }
  }
  for (const [key, list] of Object.entries(buckets)) {
    const im = new THREE.InstancedMesh(unitBox, mat(key), list.length);
    list.forEach((m, i) => im.setMatrixAt(i, m));
    im.instanceMatrix.needsUpdate = true; siteMeshes.push(im);
  }
  for (const m of siteMeshes) world.add(m);
  recolor(); renderSummary();
}
let framed = '';
function frame(force) {
  const key = `${st.site.w}x${st.site.l}`;
  if (!force && key === framed) return; framed = key;
  const W = +st.site.w, L = +st.site.l, r = Math.max(W, L, 30);
  controls.target.set(W / 2, 0, -L / 2);
  camera.position.set(W / 2 - r * 0.55, r * 0.75, -L / 2 + r * 0.95);
  controls.update();
}
function closeUp() {
  if (!fit || !fit.placements.length) return;
  const pl = fit.placements[0];
  controls.target.set(pl.x, 4, -pl.y);
  camera.position.set(pl.x - 26, 30, -pl.y + 30); controls.update();
}
function resize() {
  const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });

/* ------------------------------------------------------------------ panel */
const panel = $('#sb-panel');
let timer = 0;
function changed(geo = true) {
  if (geo) { clearTimeout(timer); timer = setTimeout(() => { rebuild(); frame(); }, 60); } else { recolor(); renderSummary(); }
  try { history.replaceState(null, '', '#c=' + share()); } catch (e) { /* sandboxed */ }
}
function share() {
  const { contact, step, addr, cut, pkgTouched, ...rest } = st; // never put the address or contact in a link
  return btoa(unescape(encodeURIComponent(JSON.stringify(rest)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function num(label, obj, key, attrs = {}, geo = true) {
  const id = 'f-' + key + '-' + Math.random().toString(36).slice(2, 6);
  return el('label', { class: 'sb-field', for: id }, el('span', { text: label }),
    el('input', { id, type: 'number', inputmode: 'decimal', value: obj[key], ...attrs,
      oninput: (e) => { obj[key] = e.target.value === '' ? '' : +e.target.value; if (e.target.value !== '') changed(geo); } }));
}
function txt(label, obj, key, attrs = {}) {
  const id = 'f-' + key;
  return el('label', { class: 'sb-field', for: id }, el('span', { text: label }),
    el('input', { id, value: obj[key], ...attrs, oninput: (e) => { obj[key] = e.target.value; if (key === 'state') suggestPkg(); } }));
}
function choice(name, items, current, onPick, cls = '') {
  return el('div', { class: 'sb-choices ' + cls, role: 'radiogroup', 'aria-label': name }, items.map(it =>
    el('button', { type: 'button', role: 'radio', 'aria-checked': String(it.id === current), class: 'sb-choice' + (it.id === current ? ' on' : ''),
      onclick: () => { onPick(it.id); render(); } },
      it.hex !== undefined ? el('span', { class: 'sb-swatch', style: `background:${it.hex || 'transparent'}` }) : null,
      el('span', { class: 'sb-choice-text' }, el('strong', { text: it.name }), it.desc ? el('small', { text: it.desc }) : null))));
}
function suggestPkg() {
  if (st.pkgTouched) return;
  const s = (st.addr.state || '').trim().toUpperCase();
  st.pkg = Object.entries(STATE_PKG).find(([, list]) => list.split(' ').includes(s))?.[0] || 'B';
  changed(false);
}
function applyUse(id) {
  const u = USES[id]; st.use = id; st.site = { ...u.site }; st.layout = u.layout; st.qty = u.qty; st.accessible = u.accessible; st.interior = u.interior;
  changed(); frame(true);
}
const fmt = (n) => Number(n).toLocaleString('en-US');

const stepViews = {
  project: () => [
    el('h2', { text: 'Where is the project?' }),
    el('p', { class: 'sb-hint', text: 'We use the address to follow up and to suggest a climate package.' }),
    txt('Street address', st.addr, 'street', { autocomplete: 'street-address' }),
    el('div', { class: 'sb-row3' }, txt('City', st.addr, 'city', { autocomplete: 'address-level2' }),
      txt('State', st.addr, 'state', { autocomplete: 'address-level1', maxlength: 2, placeholder: 'TX' }),
      txt('ZIP', st.addr, 'zip', { autocomplete: 'postal-code', inputmode: 'numeric', maxlength: 12 })),
    el('h3', { text: 'What are you planning?' }),
    choice('Project type', Object.entries(USES).map(([id, u]) => ({ id, name: u.label, desc: u.hint })), st.use, applyUse, 'stack'),
  ],
  site: () => [
    el('h2', { text: 'How much room do you have?' }),
    el('p', { class: 'sb-hint', text: 'Enter the area you can build on, in feet. Width runs along the front edge.' }),
    el('div', { class: 'sb-row2' }, num('Width (ft)', st.site, 'w', { min: 10, max: 5000 }), num('Depth (ft)', st.site, 'l', { min: 10, max: 5000 })),
    el('details', { class: 'sb-more' }, el('summary', { text: 'Setbacks and spacing' }),
      el('div', { class: 'sb-row3' }, num('Setback (ft)', st.site, 'setback', { min: 0, max: 100 }),
        num('Between units (ft)', st.site, 'gap', { min: 0, max: 60 }), num('Lane / path (ft)', st.site, 'lane', { min: 0, max: 60 })),
      el('p', { class: 'sb-hint', text: 'Check setbacks, fire separation and access with your local building department.' })),
  ],
  unit: () => [
    el('h2', { text: 'Choose a unit' }),
    choice('Unit', CAT.products.map(p => ({ id: p.code, name: p.name, desc: `${p.desc} · ${fmtFt(p.exterior_ft)} · ${p.gross_sf} sq ft` })), st.product,
      (id) => { st.product = id; changed(); }, 'stack'),
    el('div', { class: 'sb-row2' }, num('How many? (0 = as many as fit)', st, 'qty', { min: 0, max: 2000 })),
  ],
  layout: () => [
    el('h2', { text: 'Layout' }),
    choice('Layout', LAYOUTS.map(([id, name]) => ({ id, name })), st.layout, (id) => { st.layout = id; changed(); }),
    el('label', { class: 'sb-check' }, el('input', { type: 'checkbox', checked: st.accessible, onchange: (e) => { st.accessible = e.target.checked; changed(); } }),
      el('span', { text: 'Include accessible units in groups (at least 1, about 5%)' })),
    el('p', { class: 'sb-hint', text: 'Doors and steps face the shared lane. Rows mirror door to door.' }),
  ],
  exterior: () => [
    el('h2', { text: 'Exterior' }),
    el('h3', { text: 'Siding' }), choice('Siding', O.cladding, st.clad, (id) => { st.clad = id; changed(false); }, 'swatches'),
    el('h3', { text: 'Trim, doors and skirt' }), choice('Trim', O.trim, st.trim, (id) => { st.trim = id; changed(false); }, 'swatches'),
    el('h3', { text: 'Accent end wall' }), choice('Accent', O.accent, st.accent, (id) => { st.accent = id; changed(); }, 'swatches'),
  ],
  interior: () => [
    el('h2', { text: 'Interior' }),
    choice('Interior', O.interior, st.interior, (id) => { st.interior = id; changed(); }, 'stack'),
    el('button', { type: 'button', class: 'sb-btn ghost', onclick: () => { st.cut = true; changed(); closeUp(); render(); }, text: 'Look inside a unit' }),
  ],
  package: () => [
    el('h2', { text: 'Climate package' }),
    el('p', { class: 'sb-hint', text: st.addr.state ? `Suggested for ${st.addr.state.toUpperCase()}. Change it if your site is different.` : 'Add your state on the first step for a suggestion.' }),
    choice('Package', O.package, st.pkg, (id) => { st.pkg = id; st.pkgTouched = true; changed(false); }, 'stack'),
  ],
  review: () => {
    const t = fit ? fit.totals : {};
    const c = st.contact;
    const f = (label, key, attrs = {}) => {
      const id = 'c-' + key;
      return el('label', { class: 'sb-field', for: id }, el('span', { text: label }),
        el(attrs.rows ? 'textarea' : 'input', { id, name: key, value: attrs.rows ? false : c[key], ...attrs, oninput: (e) => { c[key] = e.target.value; } },
          attrs.rows ? c[key] : null));
    };
    return [
      el('h2', { text: 'Send us your project' }),
      el('ul', { class: 'sb-review' }, reviewLines().map(([k, v]) => el('li', {}, el('span', { text: k }), el('strong', { text: v })))),
      f('Your name', 'name', { autocomplete: 'name', required: true }),
      el('div', { class: 'sb-row2' }, f('Email', 'email', { type: 'email', autocomplete: 'email' }), f('Phone', 'phone', { type: 'tel', autocomplete: 'tel' })),
      f('Organization (optional)', 'org', { autocomplete: 'organization' }),
      f('Anything else? (optional)', 'notes', { rows: 3 }),
      el('input', { type: 'text', name: 'company', class: 'sb-hp', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' }),
      el('p', { class: 'sb-msg', id: 'sb-msg', role: 'status' }),
      el('button', { type: 'button', class: 'sb-btn', id: 'sb-submit', onclick: submit, disabled: !t.units, text: 'Submit project' }),
    ];
  },
};
const fmtFt = ([a, b]) => `${ftIn(a)} × ${ftIn(b)}`;
function ftIn(v) { const i = Math.round(v * 12), f = Math.floor(i / 12), r = i % 12; return r ? `${f}′-${r}″` : `${f}′`; }

function reviewLines() {
  const t = fit ? fit.totals : { byProduct: {} }, a = st.addr;
  const by = Object.entries(t.byProduct || {}).map(([c, n]) => `${n} × ${P[c].name}`).join(', ') || 'none';
  return [
    ['Project', [a.street, a.city, a.state && a.state.toUpperCase(), a.zip].filter(Boolean).join(', ') || 'Address not entered'],
    ['Type', USES[st.use].label],
    ['Site', `${st.site.w} × ${st.site.l} ft` + (st.site.setback ? `, ${st.site.setback} ft setback` : '')],
    ['Units', by],
    ['Layout', layoutName()],
    ['Beds', `${t.beds || 0} beds · ${t.keys || 0} private entries`],
    ['Exterior', `${nm(O.cladding, st.clad)} siding · ${nm(O.trim, st.trim)} trim` + (st.accent !== 'none' ? ' · accent end wall' : '')],
    ['Interior', nm(O.interior, st.interior)],
    ['Climate', nm(O.package, st.pkg)],
  ];
}
const nm = (arr, id) => (arr.find(x => x.id === id) || {}).name || id;
function layoutName() {
  if (!fit || !fit.totals.units) return '—';
  const name = { single: 'Single unit', row: 'Rows on a lane', double: 'Facing rows', courtyard: 'Courtyard' }[fit.layout] || fit.layout;
  return fit.totals.units > 1 && fit.laneW ? `${name} · ${fit.laneW} ft lane` : name;
}

function renderSummary() {
  const box = $('#sb-summary'); if (!box || !fit) return;
  const t = fit.totals;
  box.replaceChildren(
    el('div', { class: 'sb-stats' },
      stat(fmt(t.units || 0), t.units === 1 ? 'unit' : 'units'), stat(fmt(t.beds || 0), 'beds'),
      stat(fmt(t.grossSf || 0), 'sq ft'), stat((t.coverage || 0) + '%', 'of site')),
    ...fit.warnings.map(w => el('p', { class: 'sb-warn', text: w })));
}
const stat = (v, l) => el('div', {}, el('strong', { text: v }), el('span', { text: l }));

function render() {
  const [id, title] = STEPS[st.step];
  panel.replaceChildren(
    el('ol', { class: 'sb-steps' }, STEPS.map(([sid, t], i) => el('li', {},
      el('button', { type: 'button', class: i === st.step ? 'on' : (i < st.step ? 'done' : ''), 'aria-current': i === st.step ? 'step' : false,
        onclick: () => { st.step = i; render(); } }, el('span', { text: String(i + 1) }), t)))),
    el('section', { class: 'sb-step', 'aria-label': title }, ...stepViews[id]()),
    el('div', { class: 'sb-summary', id: 'sb-summary' }),
    el('div', { class: 'sb-nav' },
      el('button', { type: 'button', class: 'sb-btn ghost', disabled: st.step === 0, onclick: () => { st.step--; render(); }, text: 'Back' }),
      st.step < STEPS.length - 1 ? el('button', { type: 'button', class: 'sb-btn', onclick: () => { st.step++; render(); }, text: 'Next: ' + STEPS[st.step + 1][1] }) : null),
  );
  renderSummary();
  $('#sb-cut').setAttribute('aria-pressed', String(st.cut));
  $('#sb-cut').textContent = st.cut ? 'Show roof' : 'Cutaway';
}

/* ------------------------------------------------------------------ submit */
function inquiry() {
  const t = fit.totals, a = st.addr;
  const lines = ['Sundello Workforce builder', ...reviewLines().map(([k, v]) => `${k}: ${v}`),
    `Pods: ${t.podsSB8C} SB-8C, ${t.podsSB12A} SB-12A · Panels ${t.panels} · Piles ${t.piles}`,
    `Spacing: ${st.site.gap} ft between units, ${st.site.lane} ft lane/path`];
  if (st.contact.org) lines.push(`Organization: ${st.contact.org}`);
  if (st.contact.notes) lines.push('', st.contact.notes);
  const main = Object.entries(t.byProduct).sort((x, y) => y[1] - x[1])[0];
  return {
    name: st.contact.name, email: st.contact.email, phone: st.contact.phone, zip: (a.zip || '').trim(),
    notes: lines.join('\n').slice(0, 2000),
    collection: main ? P[main[0]].name : 'Outpost',
    layout: `${layoutName()} · ${t.units} units`.slice(0, 120),
    roof: `Flat roof · ${nm(O.package, st.pkg)} package`.slice(0, 120),
    finishes: `${nm(O.cladding, st.clad)} · ${nm(O.trim, st.trim)} · ${nm(O.interior, st.interior)}`.slice(0, 120),
    shareLink: location.href.startsWith('http') ? location.origin + location.pathname + '#c=' + share() : '',
    company: ($('.sb-hp') || {}).value || '',
  };
}
async function submit() {
  const msg = $('#sb-msg'), btn = $('#sb-submit');
  const fields = inquiry();
  const L = window.SundelloLead;
  if (!fields.zip) { msg.textContent = 'Add the project ZIP on the first step.'; return; }
  if (L) {
    const b = L.body(fields);
    if (!b.ok) { msg.textContent = b.message; return; }
    btn.disabled = true; msg.textContent = 'Sending…';
    const res = await L.post(b.body);
    btn.disabled = false;
    if (res.ok) { msg.textContent = 'Thanks - we have your project and will be in touch.'; btn.textContent = 'Sent'; btn.disabled = true; return; }
  }
  msg.replaceChildren('We could not send this from here. Copy your project and send it to us: ',
    el('button', { type: 'button', class: 'sb-link', onclick: () => navigator.clipboard && navigator.clipboard.writeText(fields.notes), text: 'Copy project' }));
  const pre = el('pre', { class: 'sb-payload', text: JSON.stringify(fields, null, 2) });
  msg.after(pre);
}

/* ------------------------------------------------------------------ boot */
$('#sb-cut').addEventListener('click', () => { st.cut = !st.cut; changed(); render(); });
$('#sb-overview').addEventListener('click', () => frame(true));
$('#sb-close').addEventListener('click', closeUp);
resize(); rebuild(); frame(true); render();
window.__sb = { st, fitNow: () => fit, rebuild };
