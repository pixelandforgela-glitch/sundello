/* Sundello Workforce - site fit (CONCEPT). Pure function, no dependencies.
 * Input: buildable site in FEET (width = along the street/front edge, depth = away from it).
 * Output: unit placements in site feet + lanes + totals. Rows face a shared lane door-to-door.
 * Rotation: degrees CCW about vertical; 0 = door faces the site front (-y).
 * All spacing values are placeholders - VERIFY fire separation, setbacks and access with the AHJ.
 */
(function (root) {
  function productIndex(catalog) {
    const m = {};
    for (const p of catalog.products) m[p.code] = p;
    return m;
  }
  function dims(p) {
    const a = p.access_ft; const sw = a.side_west || 0, se = a.side_east || 0;
    return { w: p.exterior_ft[0], d: p.exterior_ft[1], front: a.front, back: a.back, sw, se, side: sw + se };
  }

  // fill one row of length A with a queue of codes; facing -v (rot 0) puts ramp side at -u, +v flips it
  function fillRow(A, queue, P, gap, facingUp) {
    const units = []; let pos = 0;
    while (queue.length) {
      const k = dims(P[queue[0]]); const need = k.w + k.side;
      if (pos + need > A + 1e-6) break;
      const u0 = pos + (facingUp ? k.se : k.sw); // rot 180 flips east to -u
      units.push({ code: queue.shift(), u0, w: k.w });
      pos += need + gap;
    }
    return units;
  }

  function rowDepth(codes, P) {
    let r = 0;
    for (const c of codes) { const k = dims(P[c]); r = Math.max(r, k.d + k.front + k.back); }
    return r;
  }

  // plan a band sequence along depth D; kind: 'single' | 'row' | 'double'
  function plan(A, D, kind, laneW, gap, queueCodes, P) {
    const rows = [], lanes = []; const q = queueCodes.slice();
    const rAll = rowDepth([...new Set(queueCodes)], P);
    let v = 0;
    if (kind === 'single') {
      const k = dims(P[q[0]]); const r = k.d + k.front + k.back;
      if (k.w + k.side <= A && r <= D) {
        const u0 = (A - k.w - k.side) / 2 + k.sw;
        rows.push({ v0: (D - r) / 2, r, facingUp: false, units: [{ code: q[0], u0, w: k.w }] });
      }
      return { rows, lanes };
    }
    while (q.length) {
      if (kind === 'double' && v + 2 * rAll + laneW <= D + 1e-6) {
        const top = fillRow(A, q, P, gap, true);
        rows.push({ v0: v, r: rAll, facingUp: true, units: top });
        lanes.push({ v0: v + rAll, v1: v + rAll + laneW });
        const bot = fillRow(A, q, P, gap, false);
        rows.push({ v0: v + rAll + laneW, r: rAll, facingUp: false, units: bot });
        v += 2 * rAll + laneW + gap;
        if (!top.length && !bot.length) break;
      } else if (v + rAll + laneW <= D + 1e-6) {
        lanes.push({ v0: v, v1: v + laneW });
        const row = fillRow(A, q, P, gap, false);
        rows.push({ v0: v + laneW, r: rAll, facingUp: false, units: row });
        v += rAll + laneW + gap;
        if (!row.length) break;
      } else break;
    }
    return { rows, lanes };
  }

  function count(res) { return res.rows.reduce((n, r) => n + r.units.length, 0); }

  function buildQueue(code, n, nSA) {
    const q = [];
    for (let i = 0; i < nSA; i++) q.push('S-A');
    for (let i = 0; i < n - nSA; i++) q.push(code);
    return q;
  }

  function fitSite(opts, catalog) {
    const P = productIndex(catalog);
    const o = Object.assign({ setback: 0, gap: 6, lane: 20, courtyard: 30, path: 4, layout: 'auto', product: 'S1', count: null, accessible: true }, opts);
    const W = o.siteW - 2 * o.setback, L = o.siteL - 2 * o.setback;
    const warnings = [];
    if (W <= 0 || L <= 0) return { ok: false, placements: [], lanes: [], warnings: ['Setbacks use up the whole site.'], totals: {} };
    const want = o.count && o.count > 0 ? Math.floor(o.count) : 100000;
    const kinds = o.layout === 'auto' ? ['double', 'row', 'single'] : [o.layout === 'courtyard' ? 'double' : o.layout];
    const lanes = o.layout === 'courtyard' ? [Math.max(o.courtyard, o.lane)] : (o.layout === 'single' ? [0] : [o.lane, o.path]);

    function tryAll(qCodes) {
      let best = null;
      const consider = (kind, laneW) => {
        for (const axis of ['x', 'y']) {
          const A = axis === 'x' ? W : L, D = axis === 'x' ? L : W;
          const res = plan(A, D, kind, laneW, o.gap, qCodes, P);
          const n = count(res);
          if (!best || n > best.n) best = { n, res, kind, laneW, axis, A, D };
        }
      };
      // clusters: keep the requested lane if anything fits with it; only then fall back to a path
      for (const laneW of lanes) {
        for (const kind of kinds) if (kind !== 'single') consider(kind, laneW);
        if (best && best.n > 1) return best;
      }
      // one unit (or nothing) - lay it out as a single unit, centered, no lane
      if (kinds.includes('single') || !best || best.n <= 1) {
        const prev = best; best = null; consider('single', 0);
        if (prev && prev.n > best.n) best = prev;
      }
      return best;
    }
    // pass 1: capacity with the chosen product only
    let best = tryAll(buildQueue(o.product, want, 0));
    let nSA = 0;
    if (o.accessible && o.product !== 'S-A' && best.n > 1) {
      nSA = Math.max(1, Math.ceil(0.05 * best.n));
      const b2 = tryAll(buildQueue(o.product, Math.min(want, best.n), nSA));
      if (b2.n > 0) best = b2;
    }
    if (best.n === 0) {
      const k = dims(P[o.product]);
      warnings.push(`Nothing fits. One ${P[o.product].name} needs about ${(k.w + k.side).toFixed(1)} x ${(k.d + k.front + k.back).toFixed(1)} ft including steps/ramp.`);
    }
    if (best.kind !== 'single' && best.laneW > 0 && best.laneW < o.lane) warnings.push(`No room for a ${o.lane} ft vehicle lane - using a ${best.laneW} ft path.`);
    if (o.count && best.n < o.count) warnings.push(`Only ${best.n} of the ${o.count} units requested fit.`);

    // map to site coordinates
    const placements = [], laneRects = [];
    for (const row of best.res.rows) for (const un of row.units) {
      const k = dims(P[un.code]);
      const vBody = row.facingUp ? row.v0 + k.back + (row.r - k.d - k.front - k.back) : row.v0 + k.front;
      const cu = un.u0 + k.w / 2, cv = vBody + k.d / 2;
      let x, y, rot;
      if (best.axis === 'x') { x = o.setback + cu; y = o.setback + cv; rot = row.facingUp ? 180 : 0; }
      else { x = o.setback + cv; y = o.setback + cu; rot = row.facingUp ? 90 : 270; }
      placements.push({ code: un.code, x: +x.toFixed(3), y: +y.toFixed(3), rot });
    }
    for (const ln of best.res.lanes) {
      if (best.axis === 'x') laneRects.push({ x0: o.setback, x1: o.setback + W, y0: o.setback + ln.v0, y1: o.setback + ln.v1 });
      else laneRects.push({ x0: o.setback + ln.v0, x1: o.setback + ln.v1, y0: o.setback, y1: o.setback + L });
    }
    const tally = {};
    for (const p of placements) tally[p.code] = (tally[p.code] || 0) + 1;
    const sum = (f) => Object.entries(tally).reduce((s, [c, n]) => s + n * f(P[c]), 0);
    const totals = {
      units: placements.length, byProduct: tally, beds: sum(p => p.beds), keys: sum(p => p.keys),
      grossSf: +sum(p => p.gross_sf).toFixed(0),
      panels: sum(p => p.takeoff.panels), piles: sum(p => p.takeoff.piles),
      podsSB8C: sum(p => p.takeoff['SB-8C']), podsSB12A: sum(p => p.takeoff['SB-12A']),
      siteSf: +(o.siteW * o.siteL).toFixed(0),
    };
    totals.coverage = totals.siteSf ? +(100 * totals.grossSf / totals.siteSf).toFixed(1) : 0;
    return { ok: placements.length > 0, layout: best.kind === 'double' && o.layout === 'courtyard' ? 'courtyard' : best.kind,
             axis: best.axis, laneW: best.laneW, placements, lanes: laneRects, warnings, totals,
             site: { w: o.siteW, l: o.siteL, setback: o.setback } };
  }

  root.fitSite = fitSite;
  if (typeof module !== 'undefined') module.exports = { fitSite };
})(typeof window !== 'undefined' ? window : globalThis);
