/* ============ Sprite engine: composes LPC layers into animated characters ============ */
const SPR = (() => {
  const CAT = window.RADURA_CAT;
  const FR = CAT.frames; // walkR, walkD, castR, castD
  const NF = 32; // frames per composite
  const CELL = 128; // composite frame size; the 64px body sits at (32,32)
  const atlasImgs = {}; // key -> Promise<Image>
  const stripCache = new Map(); // layer|colorkey -> canvas
  const compCache = new Map(); // lookKey -> {canvas, canCast}
  const FALLBACK_CHILD = new Set(['hat', 'beard', 'face_acc', 'ears_acc', 'horns', 'ears']);
  let BASE = '';

  function setBase(b) { BASE = b; }
  function img(kind, i) {
    const key = kind + i;
    if (!atlasImgs[key]) atlasImgs[key] = new Promise((res, rej) => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => res(im); im.onerror = () => rej(new Error('atlas ' + key));
      im.src = `${BASE}assets/atlas/${kind}${String(i).padStart(2, '0')}.png`;
    });
    return atlasImgs[key];
  }
  const hex2 = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const PAL = {};
  for (const m in CAT.pal) { PAL[m] = { base: CAT.pal[m].base, colors: {} }; for (const k in CAT.pal[m].colors) PAL[m].colors[k] = CAT.pal[m].colors[k].map(hex2); }

  function item(id) { return CAT.items[id]; }
  function itemBodies(id) { const it = item(id); return it ? Object.keys(it.b) : []; }
  function supports(id, body) {
    const it = item(id); if (!it) return false;
    if (it.b[body]) return true;
    return body === 'child' && FALLBACK_CHILD.has(it.slot) && !!it.b.male;
  }
  function colorOptions(id) {
    const it = item(id); if (!it) return null;
    if (it.bake) return { type: 'bake', list: it.bake };
    const out = {};
    for (const m of it.mats || []) out[m] = Object.keys(PAL[m].colors);
    return { type: 'mats', mats: out };
  }
  // resolve one equipped slot into [{layer, recolor:{mat:[src,dst]}}]
  function resolve(look, slotEntry) {
    const it = item(slotEntry.id); if (!it) return [];
    let body = look.body;
    let L = it.b[body];
    let childFallback = false;
    if (!L && body === 'child' && FALLBACK_CHILD.has(it.slot)) { L = it.b.male; childFallback = true; }
    if (!L) return [];
    if (it.bake) {
      const v = (slotEntry.v && L[slotEntry.v]) ? slotEntry.v : it.bake[0];
      return (L[v] || []).map(li => ({ li, rc: null, cf: childFallback }));
    }
    const rc = {};
    for (const m of it.mats || []) {
      const src = (m === (it.mats[0]) && it.basevar) ? it.basevar : PAL[m].base;
      let dst = slotEntry.c && slotEntry.c[m];
      if (!dst) {
        if (m === 'body') dst = look.skin;
        else if (m === 'eye') dst = look.eyes;
        else if (m === 'hair') dst = look.hairColor || 'chestnut';
        else dst = src;
      }
      if (dst && dst !== src && PAL[m].colors[dst]) rc[m] = [src, dst];
    }
    return L.map(li => ({ li, rc, cf: childFallback }));
  }
  function lookKey(look) { return JSON.stringify(look); }

  async function layerCanvas(li, rc) {
    const key = li + '|' + JSON.stringify(rc || {});
    if (stripCache.has(key)) return stripCache.get(key);
    const p = (async () => {
      const [a, r, z, cast, big] = CAT.layers[li];
      const im = await img(big ? 'b' : 'a', a);
      const w = big ? 1152 : 2048, h = big ? 256 : 64;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: !!(rc && Object.keys(rc).length) });
      g.drawImage(im, 0, r * h, w, h, 0, 0, w, h);
      if (rc && Object.keys(rc).length) {
        const id = g.getImageData(0, 0, w, h), d = id.data;
        const map = new Map();
        for (const m in rc) {
          const S = PAL[m].colors[rc[m][0]], D = PAL[m].colors[rc[m][1]];
          if (!S || !D) continue;
          S.forEach((s, i) => { if (D[i]) map.set((s[0] << 16) | (s[1] << 8) | s[2], D[i]); });
        }
        for (let i = 0; i < d.length; i += 4) {
          if (!d[i + 3]) continue;
          const t = map.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
          if (t) { d[i] = t[0]; d[i + 1] = t[1]; d[i + 2] = t[2]; }
        }
        g.putImageData(id, 0, 0);
      }
      return c;
    })();
    stripCache.set(key, p);
    return p;
  }

  // look = {body, skin, eyes, hairColor, slots:{slot:{id, c:{mat:color}, v:variant}}, mood}
  async function compose(look) {
    const key = lookKey(look);
    if (compCache.has(key)) return compCache.get(key);
    const p = (async () => {
      const entries = [];
      for (const s in look.slots) {
        const e = look.slots[s]; if (!e || !e.id) continue;
        if (s === 'face' && look.noFace) continue;
        for (const r of resolve(look, e)) entries.push({ ...r, slot: s });
      }
      const canvases = await Promise.all(entries.map(e => layerCanvas(e.li, e.rc)));
      entries.forEach((e, i) => { e.cv = canvases[i]; const L = CAT.layers[e.li]; e.z = L[2]; e.cast = !!L[3]; e.big = !!L[4]; });
      entries.sort((a, b) => a.z - b.z);
      const OPTIONAL = new Set(['weapon', 'shield', 'face', 'back']);
      const canCast = entries.every(e => e.cast || OPTIONAL.has(e.slot) || e.big || e.cf);
      const out = document.createElement('canvas'); out.width = NF * CELL; out.height = CELL;
      const g = out.getContext('2d'); g.imageSmoothingEnabled = false;
      const childDy = look.body === 'child' ? 0 : 0;
      for (let f = 0; f < NF; f++) {
        const isCast = f >= 18;
        for (const e of entries) {
          if (e.big) {
            if (isCast) continue;
            const row = f < 9 ? 0 : 1, col = f % 9;
            g.drawImage(e.cv, col * 128, row * 128, 128, 128, f * CELL, 0, 128, 128);
          } else {
            if (isCast && !e.cast) continue;
            if (e.slot === 'face' && isCast) continue;
            g.drawImage(e.cv, f * 64, 0, 64, 64, f * CELL + 32, 32 + (e.cf ? childDy : 0), 64, 64);
          }
        }
      }
      return { canvas: out, canCast };
    })();
    compCache.set(key, p);
    if (compCache.size > 36) compCache.delete(compCache.keys().next().value);
    return p;
  }
  // draw a frame of a composed sprite onto ctx; anim in walkR/walkD/castR/castD; flip for left
  function frameIndex(anim, i) { const [s, n] = FR[anim]; return s + (((i % n) + n) % n); }
  function draw(ctx, comp, anim, i, x, y, scale = 2, flip = false) {
    if (!comp) return;
    if ((anim === 'castR' || anim === 'castD') && !comp.canCast) { anim = anim === 'castR' ? 'walkR' : 'walkD'; i = 0; }
    const f = frameIndex(anim, i);
    ctx.save();
    if (flip) { ctx.translate(x + CELL * scale / 2, 0); ctx.scale(-1, 1); ctx.translate(-(x + CELL * scale / 2), 0); }
    ctx.drawImage(comp.canvas, f * CELL, 0, CELL, CELL, x, y, CELL * scale, CELL * scale);
    ctx.restore();
  }
  // un singolo fotogramma (128x128) senza comporre l'intera striscia: leggero per miniature e ritratti
  const stillCache = new Map();
  async function still(look, anim = 'walkD', frame = 0) {
    const key = anim + frame + lookKey(look);
    if (stillCache.has(key)) return stillCache.get(key);
    const p = (async () => {
      const f = frameIndex(anim, frame), isCast = f >= 18;
      const entries = [];
      for (const s in look.slots) { const e = look.slots[s]; if (!e || !e.id) continue; for (const r of resolve(look, e)) entries.push({ ...r, slot: s }); }
      entries.forEach(e => { const L = CAT.layers[e.li]; e.z = L[2]; e.cast = !!L[3]; e.big = !!L[4]; e.a = L[0]; e.r = L[1]; });
      entries.sort((a, b) => a.z - b.z);
      const ims = await Promise.all(entries.map(e => img(e.big ? 'b' : 'a', e.a)));
      const out = document.createElement('canvas'); out.width = CELL; out.height = CELL;
      const g = out.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = false;
      const tmp = document.createElement('canvas'); tmp.width = 128; tmp.height = 128; const tg = tmp.getContext('2d', { willReadFrequently: true });
      entries.forEach((e, i) => {
        if (e.big && isCast) return; if (!e.big && isCast && !e.cast) return;
        tg.clearRect(0, 0, 128, 128);
        let w, h, dx, dy;
        if (e.big) { const row = f < 9 ? 0 : 1, col = f % 9; tg.drawImage(ims[i], col * 128, e.r * 256 + row * 128, 128, 128, 0, 0, 128, 128); w = h = 128; dx = dy = 0; }
        else { tg.drawImage(ims[i], f * 64, e.r * 64, 64, 64, 0, 0, 64, 64); w = h = 64; dx = dy = 32; }
        if (e.rc && Object.keys(e.rc).length) {
          const id = tg.getImageData(0, 0, w, h), d = id.data; const map = new Map();
          for (const m in e.rc) { const S = PAL[m].colors[e.rc[m][0]], D = PAL[m].colors[e.rc[m][1]]; if (!S || !D) continue; S.forEach((s, k) => { if (D[k]) map.set((s[0] << 16) | (s[1] << 8) | s[2], D[k]); }); }
          for (let k = 0; k < d.length; k += 4) { if (!d[k + 3]) continue; const t = map.get((d[k] << 16) | (d[k + 1] << 8) | d[k + 2]); if (t) { d[k] = t[0]; d[k + 1] = t[1]; d[k + 2] = t[2]; } }
          tg.putImageData(id, 0, 0);
        }
        g.drawImage(tmp, 0, 0, w, h, dx, dy, w, h);
      });
      return out;
    })();
    stillCache.set(key, p);
    if (stillCache.size > 400) stillCache.delete(stillCache.keys().next().value);
    return p;
  }
  // ritratto frontale ritagliato (80x80)
  async function portrait(look, size = 96, anim = 'walkD', frame = 0) {
    const s = await still(look, anim, frame);
    const c = document.createElement('canvas'); c.width = 80; c.height = 80;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.drawImage(s, 24, 22, 80, 80, 0, 0, 80, 80);
    return c;
  }
  // miniatura di un singolo oggetto
  async function thumb(id, body = 'female', entry = {}, ctx = {}) {
    const it = item(id); if (!it) return null;
    const b = supports(id, body) ? body : (Object.keys(it.b)[0]);
    const look = { body: b, skin: ctx.skin || 'light', eyes: ctx.eyes || 'blue', hairColor: ctx.hairColor || 'chestnut', slots: { [it.slot]: { id, ...(entry.c ? { c: entry.c } : {}), ...(entry.v ? { v: entry.v } : {}) } } };
    if (it.slot === 'face') look.slots.head = { id: 'head_human' };
    const side = ['weapon', 'shield', 'tail', 'back', 'cape'].includes(it.slot); const s = await still(look, side ? 'walkR' : 'walkD', 0);
    // ritaglio automatico sui pixel visibili
    const g = s.getContext('2d', { willReadFrequently: true }); const d = g.getImageData(0, 0, 128, 128).data;
    let x0 = 128, y0 = 128, x1 = -1, y1 = -1;
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) if (d[(y * 128 + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const c = document.createElement('canvas'); c.width = 48; c.height = 48; const cg = c.getContext('2d'); cg.imageSmoothingEnabled = false;
    if (x1 < 0) return c;
    const w = x1 - x0 + 1, h = y1 - y0 + 1; const kk = Math.min(44 / w, 44 / h); const k = kk >= 1 ? Math.min(4, Math.floor(kk)) : kk;
    cg.drawImage(s, x0, y0, w, h, Math.round(24 - w * k / 2), Math.round(24 - h * k / 2), Math.round(w * k), Math.round(h * k));
    return c;
  }
  return { CAT, PAL, setBase, compose, draw, portrait, still, thumb, item, supports, colorOptions, itemBodies, frameIndex, CELL, NF, FR };
})();
