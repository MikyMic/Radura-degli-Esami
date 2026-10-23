/* ============ Mondo a scorrimento: villaggio, mappa delle sessioni, scena di studio ============ */
const WORLD = (() => {
  const H = 184, GROUND = 150; // altezza logica e linea dei piedi
  const cache = new Map();
  const memo = (k, fn) => { if (!cache.has(k)) { cache.set(k, fn()); if (cache.size > 260) cache.delete(cache.keys().next().value); } return cache.get(k); };
  const rnd = Math.random;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- Font pixel 3x5 ---------- */
  const FONT = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110', ' ': '000000000000000', '.': '000000000000010', '/': '001001010100100', '-': '000000111000000', "'": '010010000000000', '°': '010101010000000', ':': '000010000010000', '!': '010010010000010', '+': '000010111010000', '?': '110001010000010', ',': '000000000010100', '·': '000000010000000', '♥': '000101111111010', '★': '010111010101000' };
  const norm = s => String(s).toUpperCase().replace(/[ÀÁ]/g, 'A').replace(/[ÈÉ]/g, 'E').replace(/[ÌÍ]/g, 'I').replace(/[ÒÓ]/g, 'O').replace(/[ÙÚ]/g, 'U');
  function textW(s, sc = 1) { return norm(s).length * 4 * sc - sc; }
  function text(g, s, x, y, col = '#fff', sc = 1, shadow = 'rgba(28,20,36,.85)') {
    s = norm(s); x = Math.round(x); y = Math.round(y);
    const draw = (ox, oy, c) => { g.fillStyle = c; for (let i = 0; i < s.length; i++) { const m = FONT[s[i]] || FONT['?']; for (let k = 0; k < 15; k++) if (m[k] === '1') g.fillRect(ox + i * 4 * sc + (k % 3) * sc, oy + Math.floor(k / 3) * sc, sc, sc); } };
    if (shadow) { draw(x + sc, y, shadow); draw(x, y + sc, shadow); draw(x + sc, y + sc, shadow); draw(x - sc, y, shadow); draw(x, y - sc, shadow); }
    draw(x, y, col);
  }

  /* ---------- Cielo e sfondi parallasse ---------- */
  function skyPal(season, tk) {
    if (tk === 'night') return ART.SKY.night;
    if (tk === 'sunset') return ART.SKY.sunset;
    if (season === 'lavanda') return ART.SKY.lavanda;
    if (season === 'inverno') return ART.SKY.dayWinter;
    if (season === 'autunno') return ART.SKY.dayAutumn;
    return ART.SKY.day;
  }
  function tint(hex, tk) { return tk === 'night' ? ART.mix(ART.mix(hex, '#2B2466', .58), '#000', .05) : tk === 'sunset' ? ART.mix(hex, '#FF8F7A', .22) : hex; }
  function skyTile(season, tk) {
    return memo('sky' + season + tk, () => {
      const pal = skyPal(season, tk); const c = ART.cv(16, H), g = c.getContext('2d');
      const bandH = 112 / pal.length;
      for (let y = 0; y < H; y++) {
        const f = Math.min(pal.length - 1, y / bandH); const i = Math.floor(f), fr = f - i;
        for (let x = 0; x < 16; x++) {
          const dither = fr > .78 && ((x + y) % 2 === 0) || fr > .9 && ((x * 3 + y) % 4 !== 0);
          g.fillStyle = pal[Math.min(pal.length - 1, i + (dither ? 1 : 0))]; g.fillRect(x, y, 1, 1);
        }
      }
      return c;
    });
  }
  function mountains(season, tk, seed = 7) {
    return memo('mt' + season + tk + seed, () => {
      const W = 512, Hh = 74, c = ART.cv(W, Hh), g = c.getContext('2d'); const R = ART.rng(seed);
      const S2 = ART.SEASON[season] || ART.SEASON.estate;
      const base = tint(season === 'inverno' ? '#9DB4D3' : season === 'autunno' ? '#B8A0B4' : season === 'lavanda' ? '#9C8CD8' : season === 'ciliegi' ? '#C4A2C8' : '#8FB5CF', tk);
      const shade = ART.mix(base, '#3A2F6A', .25), light = ART.mix(base, '#FFFFFF', .28), snow = tint('#FFFFFF', tk), snowSh = tint('#D8E4F2', tk);
      const peaks = []; let x = -40; while (x < W + 40) { peaks.push([x, 10 + R() * 34, 50 + R() * 50]); x += 60 + R() * 70; }
      const hAt = px => { let m = Hh; for (const [cx, top, w] of peaks) { const d = Math.abs(((px - cx + W * 1.5) % W) - W / 2 + (cx - cx)); const dd = Math.min(Math.abs(px - cx), Math.abs(px - cx - W), Math.abs(px - cx + W)); const y = top + dd * (Hh - top) / w * 1.25; if (y < m) m = y; } return m; };
      for (let px = 0; px < W; px++) {
        const top = Math.round(hAt(px));
        for (let y = top; y < Hh; y++) {
          const left = hAt(px - 1) > hAt(px + 1); // pendio illuminato a sinistra
          let col = left ? light : shade; if (y > top + 6) col = base; if (y > top + 6 && !left && (px + y) % 2 === 0 && y < top + 10) col = shade;
          if (season === 'inverno' ? y < top + 14 : y < top + 5 && top < 26) col = left ? snow : snowSh;
          g.fillStyle = col; g.fillRect(px, y, 1, 1);
        }
      }
      return c;
    });
  }
  function hills(season, tk, seed = 11) {
    return memo('hl' + season + tk + seed, () => {
      const W = 480, Hh = 56, c = ART.cv(W, Hh), g = c.getContext('2d'); const R = ART.rng(seed);
      const S2 = ART.SEASON[season] || ART.SEASON.estate;
      const col = tint(ART.mix(S2.far[1], S2.grass[2], .35), tk), top = tint(ART.mix(S2.far[0], S2.grass[1], .35), tk), dk = tint(ART.mix(S2.far[1], '#2F5A4E', .35), tk);
      const hs = []; let x = -30; while (x < W + 30) { hs.push([x, 10 + R() * 18, 40 + R() * 40]); x += 50 + R() * 50; }
      const hAt = px => { let m = Hh; for (const [cx, t, w] of hs) for (const o of [-W, 0, W]) { const d = (px - cx - o) / w; if (Math.abs(d) < 1) m = Math.min(m, t + (Hh - t) * (d * d)); } return m; };
      for (let px = 0; px < W; px++) { const t = Math.round(hAt(px)); for (let y = t; y < Hh; y++) { g.fillStyle = y < t + 2 ? top : (y > t + 10 && (px * 7 + y * 3) % 23 === 0) ? dk : col; g.fillRect(px, y, 1, 1); } }
      // alberelli lontani
      for (let i = 0; i < 40; i++) { const px = Math.floor(R() * W), t = Math.round(hAt(px)) + 3 + R() * 8; const tr = tint(season === 'inverno' ? '#7F9DB8' : S2.leaf[3], tk); g.fillStyle = tr; g.fillRect(px, t - 3, 3, 4); g.fillRect(px + 1, t - 5, 1, 2); }
      return c;
    });
  }
  function treeline(season, tk, seed = 23) {
    return memo('tl' + season + tk + seed, () => {
      const W = 420, Hh = 40, c = ART.cv(W, Hh), g = c.getContext('2d'); const R = ART.rng(seed);
      const S2 = ART.SEASON[season] || ART.SEASON.estate; const L = S2.leaf.map(x => tint(ART.mix(x, '#4A6A7A', .28), tk));
      for (let i = 0; i < 46; i++) {
        const cx = Math.floor(R() * W), r = 6 + Math.floor(R() * 7), cy = Hh - r - 2 - R() * 6;
        for (const o of [-W, 0, W]) for (let y = -r; y <= Hh; y++) for (let x = -r; x <= r; x++) {
          const yy = cy + y; if (yy >= Hh) continue; const inside = y <= 0 ? x * x + y * y <= r * r : Math.abs(x) <= r;
          if (!inside) continue; const lit = (x + y) / r; g.fillStyle = lit < -.7 ? L[1] : lit > .5 ? L[3] : L[2]; g.fillRect(cx + x + o, yy, 1, 1);
        }
      }
      return c;
    });
  }
  function groundTile(season, tk) {
    return memo('gr' + season + tk, () => {
      const W = 256, top = GROUND - 22, c = ART.cv(W, H - top), g = c.getContext('2d'); const R = ART.rng(5);
      const S2 = ART.SEASON[season] || ART.SEASON.estate; const G = S2.grass;
      const snow = season === 'inverno';
      const path = ['#E9CF9C', '#D8B67F', '#BE965F', '#9B7448'], pathW = snow ? ['#F4F8FB', '#DCE8F1', '#BCD0E0', '#9AB2C6'] : path;
      const hTop = x => Math.round(2 + Math.sin(x * .21) * 1.5 + Math.sin(x * .07 + 1) * 1.5);
      for (let x = 0; x < W; x++) {
        const t = hTop(x);
        for (let y = t; y < H - top; y++) {
          let col = G[2];
          if (y < t + 2) col = G[0]; else if (y < t + 4) col = G[1];
          else if ((x * 13 + y * 7) % 17 === 0) col = G[3]; else if ((x * 5 + y * 11) % 23 === 0) col = G[1];
          const py = y - (22 - 6); // banda del sentiero intorno a GROUND
          if (py >= 0 && py < 13) { col = pathW[py === 0 || py === 12 ? 2 : py < 3 ? 0 : py > 9 ? 2 : 1]; if ((x * 7 + py * 13) % 29 === 0) col = pathW[3]; if ((x * 3 + py * 5) % 31 === 0) col = pathW[0]; }
          if (py === -1 || py === 13) col = G[3];
          g.fillStyle = col; g.fillRect(x, y, 1, 1);
        }
        // ciuffi d'erba sul bordo
        if (x % 3 === 0 && R() < .7) { g.fillStyle = G[0]; g.fillRect(x, t - 1, 1, 1); if (R() < .4) g.fillRect(x + 1, t - 2, 1, 2); }
      }
      // sassolini sul sentiero
      for (let i = 0; i < 30; i++) { const x = Math.floor(R() * W), y = 22 - 6 + 3 + Math.floor(R() * 7); g.fillStyle = snow ? '#C9D8E4' : '#A88A66'; g.fillRect(x, y, 2, 1); g.fillStyle = snow ? '#FFFFFF' : '#F2DFB8'; g.fillRect(x, y - 1, 1, 1); }
      // fiori e dettagli nell'erba
      for (let i = 0; i < 70; i++) {
        const x = Math.floor(R() * W); const band = R() < .45 ? 4 + R() * 9 : 22 + 9 + R() * (H - top - 34); const y = Math.floor(band);
        const fc = S2.flower[Math.floor(R() * 4)];
        if (snow) { g.fillStyle = '#FFFFFF'; g.fillRect(x, y, 2, 1); continue; }
        if (season === 'autunno' && R() < .5) { g.fillStyle = S2.leaf[1 + Math.floor(R() * 3)]; g.fillRect(x, y, 2, 1); g.fillRect(x + 1, y - 1, 1, 1); continue; }
        g.fillStyle = G[3]; g.fillRect(x, y + 1, 1, 2); g.fillStyle = fc; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.fillStyle = '#FFE27A'; g.fillRect(x, y, 1, 1);
      }
      return c;
    });
  }
  function fgStrip(season, tk) {
    return memo('fg' + season + tk, () => {
      const W = 300, Hh = 26, c = ART.cv(W, Hh), g = c.getContext('2d'); const R = ART.rng(31);
      const S2 = ART.SEASON[season] || ART.SEASON.estate; const L = season === 'inverno' ? ['#FFFFFF', '#E3F1FA', '#B9D2E6', '#86A7C2'] : S2.leaf.map((x, i) => ART.mix(x, S2.grass[i], .4));
      let x = 0; while (x < W) {
        const r = 7 + Math.floor(R() * 8); const cx = x + r;
        for (const o of [-W, 0, W]) for (let y = -r; y <= r; y++) for (let xx = -r; xx <= r; xx++) { if (xx * xx + y * y > r * r + r * .4) continue; const py = Hh - r * .55 + y; if (py >= Hh) continue; const lit = (xx + y) / r; g.fillStyle = lit < -.7 ? L[0] : lit < 0 ? L[1] : lit > .6 ? L[3] : L[2]; g.fillRect(cx + xx + o, py, 1, 1); }
        if (season !== 'inverno' && R() < .5) { g.fillStyle = S2.flower[Math.floor(R() * 4)]; g.fillRect(cx, Hh - r * .55 - r + 3, 1, 1); }
        x += r * 2 + Math.floor(R() * 40);
      }
      return c;
    });
  }
  function drawTiled(g, tile, off, y, W) { const tw = tile.width; let x = -(((off % tw) + tw) % tw); for (; x < W; x += tw) g.drawImage(tile, Math.round(x), Math.round(y)); }

  /* ---------- Particelle ---------- */
  function P(o) { return Object.assign({ x: 0, y: 0, vx: 0, vy: 0, life: 2, age: 0, k: 'dot', c: '#fff', s: 1, ph: rnd() * 6.28, world: true }, o); }
  const HEART = ['01010', '11111', '11111', '01110', '00100'], NOTE = ['011', '011', '010', '110', '110'], STAR5 = ['00100', '01110', '11111', '01110', '01010'], ZZ = ['1111', '0010', '0100', '1111'];
  function pmap(g, m, x, y, c) { g.fillStyle = c; for (let j = 0; j < m.length; j++) for (let i = 0; i < m[j].length; i++) if (m[j][i] === '1') g.fillRect(x + i, y + j, 1, 1); }
  function drawPart(g, p, ox) {
    const x = Math.round(p.x - (p.world ? ox : 0)), y = Math.round(p.y); const a = 1 - p.age / p.life;
    g.globalAlpha = Math.min(1, a * 1.6) * (p.alpha || 1);
    switch (p.k) {
      case 'dot': g.fillStyle = p.c; g.fillRect(x, y, p.s, p.s); break;
      case 'spark': { const on = Math.sin(p.age * 14 + p.ph) > -.2; g.fillStyle = p.c; g.fillRect(x, y, 1, 1); if (on) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); } break; }
      case 'leaf': { const f = Math.floor(p.age * 6 + p.ph) % 4; g.fillStyle = p.c; if (f < 2) g.fillRect(x, y, 2, 1); else g.fillRect(x, y, 1, 2); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + (f < 2 ? 1 : 0), y + (f < 2 ? 0 : 1), 1, 1); break; }
      case 'petal': { const f = Math.floor(p.age * 5 + p.ph) % 3; g.fillStyle = p.c; g.fillRect(x, y, f === 1 ? 1 : 2, 1); if (f === 2) g.fillRect(x + 1, y + 1, 1, 1); break; }
      case 'snow': g.fillStyle = p.c; g.fillRect(x, y, p.s, p.s); break;
      case 'bubble': { g.fillStyle = p.c; const r = p.s; g.fillRect(x - r + 1, y - r, r * 2 - 1, 1); g.fillRect(x - r + 1, y + r, r * 2 - 1, 1); g.fillRect(x - r, y - r + 1, 1, r * 2 - 1); g.fillRect(x + r, y - r + 1, 1, r * 2 - 1); g.fillStyle = '#fff'; g.fillRect(x - r + 1, y - r + 1, 1, 1); break; }
      case 'heart': pmap(g, HEART, x - 2, y - 2, p.c); break;
      case 'note': pmap(g, NOTE, x - 1, y - 2, p.c); break;
      case 'star': { const on = Math.sin(p.age * 9 + p.ph) > 0; if (on) pmap(g, STAR5, x - 2, y - 2, p.c); else { g.fillStyle = p.c; g.fillRect(x, y, 1, 1); } break; }
      case 'fly': { g.globalCompositeOperation = 'lighter'; const b = (Math.sin(p.age * 3 + p.ph) + 1) / 2; g.globalAlpha = (.3 + b * .7) * Math.min(1, a * 2); g.fillStyle = p.c; g.fillRect(x, y, 1, 1); g.globalAlpha *= .35; g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); g.globalCompositeOperation = 'source-over'; break; }
      case 'flame': { const t = p.age / p.life; g.fillStyle = t < .3 ? '#FFF6B0' : t < .6 ? p.c : '#E8443F'; const s = t < .5 ? 2 : 1; g.fillRect(x, y, s, s); break; }
      case 'bolt': { g.fillStyle = p.c; let xx = x, yy = y; for (let i = 0; i < 6; i++) { g.fillRect(xx, yy, 1, 1); yy++; xx += (i % 2 ? 1 : -1) * (p.ph > 3 ? 1 : -1); } break; }
      case 'smoke': { g.fillStyle = p.c; const s = 1 + Math.floor(p.age / p.life * 4); g.globalAlpha = .55 * a; g.fillRect(x - (s >> 1), y - (s >> 1), s, s); break; }
      case 'zz': pmap(g, ZZ, x, y, p.c); break;
      case 'butterfly': { const f = Math.floor(p.age * 10) % 2; g.fillStyle = p.c; if (f) { g.fillRect(x - 2, y - 1, 2, 2); g.fillRect(x + 1, y - 1, 2, 2); } else { g.fillRect(x - 1, y - 2, 1, 3); g.fillRect(x + 1, y - 2, 1, 3); } g.fillStyle = '#3A2A3A'; g.fillRect(x, y - 1, 1, 3); break; }
      case 'bird': { const f = Math.floor(p.age * 6 + p.ph) % 2; g.fillStyle = p.c; if (f) { g.fillRect(x - 2, y - 1, 2, 1); g.fillRect(x + 1, y - 1, 2, 1); g.fillRect(x, y, 1, 1); } else { g.fillRect(x - 2, y + 1, 1, 1); g.fillRect(x - 1, y, 1, 1); g.fillRect(x, y, 1, 1); g.fillRect(x + 1, y, 1, 1); g.fillRect(x + 2, y + 1, 1, 1); } break; }
      case 'ring': { g.fillStyle = p.c; g.fillRect(x, y, 1, 1); break; }
      case 'ribbon': { g.globalCompositeOperation = 'lighter'; g.fillStyle = p.c; g.globalAlpha = .35 * a; g.fillRect(x, y, 1, p.s); g.globalCompositeOperation = 'source-over'; break; }
      case 'fish': { g.fillStyle = p.c; const t = p.age / p.life; g.fillRect(x, y, 3, 1); g.fillRect(x + (t < .5 ? -1 : 3), y - 1, 1, 1); break; }
      case 'drop': g.fillStyle = p.c; g.fillRect(x, y, 1, 2); break;
      case 'page': { g.fillStyle = '#FFFDF0'; g.fillRect(x, y, 3, 4); g.fillStyle = '#9C8C7A'; g.fillRect(x + 1, y + 1, 1, 1); g.fillRect(x + 1, y + 3 - (Math.floor(p.age * 4) % 2), 1, 1); break; }
    }
    g.globalAlpha = 1;
  }
  function stepParts(arr, dt) {
    for (let i = arr.length - 1; i >= 0; i--) {
      const p = arr[i]; p.age += dt; if (p.age >= p.life) { arr.splice(i, 1); continue; }
      if (p.k === 'leaf' || p.k === 'petal') { p.vx += Math.sin(p.age * 2 + p.ph) * 8 * dt; }
      if (p.k === 'butterfly') { p.vx += Math.sin(p.age * 1.3 + p.ph) * 30 * dt; p.vy = Math.sin(p.age * 4 + p.ph) * 10; }
      if (p.k === 'fly') { p.vx += (rnd() - .5) * 20 * dt; p.vy += (rnd() - .5) * 20 * dt; p.vx *= .98; p.vy *= .98; }
      if (p.orbit) { const o = p.orbit; o.a += o.w * dt; p.x = o.cx() + Math.cos(o.a) * o.rx; p.y = o.cy() + Math.sin(o.a) * o.ry; }
      else { p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; }
    }
  }
  function emitAura(arr, aura, cx, cy, dt, follow) {
    const A = AURA_BY[aura]; if (!A) return; const c = () => A.cols[Math.floor(rnd() * A.cols.length)];
    const rate = { rainbow: 10, galaxy: 9, aurora: 14, phoenix: 22, flame: 16 }[A.kind] || 7;
    let n = rate * dt; while (n > 0) { if (rnd() > n) break; n--;
      const x = cx + (rnd() - .5) * 26, y = cy + (rnd() - .5) * 34;
      switch (A.kind) {
        case 'sparkle': arr.push(P({ k: 'spark', x, y, vy: -6, life: 1.2, c: c() })); break;
        case 'leaf': arr.push(P({ k: 'leaf', x, y: cy - 20, vx: (rnd() - .5) * 10, vy: 10, life: 2, c: c() })); break;
        case 'bubble': arr.push(P({ k: 'bubble', x, y: cy + 8, vy: -10, vx: (rnd() - .5) * 4, life: 2.2, s: 1 + Math.floor(rnd() * 2), c: c() })); break;
        case 'heart': arr.push(P({ k: 'heart', x, y: cy - 6, vy: -12, vx: (rnd() - .5) * 6, life: 1.6, c: c() })); break;
        case 'note': arr.push(P({ k: 'note', x, y: cy - 10, vy: -11, vx: (rnd() - .5) * 10, life: 1.8, c: c() })); break;
        case 'petal': arr.push(P({ k: 'petal', x, y: cy - 24, vx: (rnd() - .5) * 8, vy: 9, life: 2.4, c: c() })); break;
        case 'firefly': arr.push(P({ k: 'fly', x, y, life: 2.6, c: c() })); break;
        case 'snow': arr.push(P({ k: 'snow', x, y: cy - 26, vy: 8, vx: (rnd() - .5) * 4, life: 3, s: rnd() < .3 ? 2 : 1, c: c() })); break;
        case 'flame': arr.push(P({ k: 'flame', x: cx + (rnd() - .5) * 18, y: cy + 14, vy: -22 - rnd() * 10, life: 1, c: c() })); break;
        case 'bolt': if (rnd() < .35) arr.push(P({ k: 'bolt', x, y: cy - 16, life: .18, c: c() })); else arr.push(P({ k: 'spark', x, y, life: .5, c: c() })); break;
        case 'star': arr.push(P({ k: 'star', x, y, vy: -3, life: 1.4, c: c() })); break;
        case 'rainbow': { const col = c(); arr.push(P({ k: 'ring', life: 1.6, c: col, orbit: { a: rnd() * 6.28, w: 2.4, rx: 15, ry: 6, cx: follow.cx, cy: () => follow.cy() + 14 } })); arr.push(P({ k: 'spark', x, y, life: .8, c: col })); break; }
        case 'galaxy': arr.push(P({ k: rnd() < .4 ? 'star' : 'ring', life: 2.2, c: c(), orbit: { a: rnd() * 6.28, w: 1.4 + rnd(), rx: 12 + rnd() * 8, ry: 18 + rnd() * 6, cx: follow.cx, cy: follow.cy } })); break;
        case 'phoenix': { const side = rnd() < .5 ? -1 : 1; arr.push(P({ k: 'flame', x: cx + side * (6 + rnd() * 16), y: cy - 6 + rnd() * 10, vx: side * 14, vy: -16 - rnd() * 14, life: .9, c: c() })); break; }
        case 'aurora': arr.push(P({ k: 'ribbon', x: cx - 18 + rnd() * 36, y: cy - 34 + Math.sin(performance.now() / 400 + x) * 3, vy: -2, life: 1.6, s: 6 + Math.floor(rnd() * 8), c: c() })); break;
      }
    }
  }

  /* ---------- Attori (personaggi LPC) ---------- */
  function Actor(o) {
    const a = Object.assign({ x: 0, y: GROUND, tx: null, dir: 1, speed: 26, comp: null, anim: 'walkR', f: 0, ft: 0, state: 'idle', wait: 1 + rnd() * 3, home: 0, range: 40, castT: 0, face: 0, bubble: null, bubT: 0 }, o);
    a.load = async look => { a.loading = true; try { a.comp = await SPR.compose(look); } catch (e) { } a.loading = false; };
    return a;
  }
  function stepActor(a, dt, isHero) {
    if (a.state === 'walk' && a.tx != null) {
      const d = a.tx - a.x; const st = Math.sign(d) * Math.min(Math.abs(d), a.speed * dt);
      a.x += st; a.dir = d >= 0 ? 1 : -1; a.ft += dt; if (a.ft > .09) { a.ft = 0; a.f = (a.f + 1) % 9; }
      if (Math.abs(a.tx - a.x) < .5) { a.state = 'idle'; a.f = 0; a.wait = isHero ? 99 : 1.5 + rnd() * 4; a.face = 0; if (a.onArrive) { const f = a.onArrive; a.onArrive = null; f(); } }
    } else if (a.state === 'cast') {
      a.ft += dt; if (a.ft > .11) { a.ft = 0; a.f++; if (a.f >= 7) { a.f = 0; a.castLoops = (a.castLoops || 0) + 1; if (!a.loopCast && a.castLoops >= 2) { a.state = 'idle'; a.castLoops = 0; a.wait = 2 + rnd() * 3; } } }
    } else {
      a.face += dt; a.wait -= dt;
      if (!isHero && a.wait <= 0) {
        const r = rnd();
        if (r < .22 && a.comp && a.comp.canCast) { a.state = 'cast'; a.f = 0; a.ft = 0; a.castLoops = 0; }
        else { a.tx = clamp(a.home + (rnd() * 2 - 1) * a.range, a.min ?? -1e9, a.max ?? 1e9); a.state = 'walk'; }
      }
    }
  }
  function drawActor(g, a, ox, sc = 1) {
    if (!a.comp) { // segnaposto mentre carica
      g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(Math.round(a.x - ox - 8), Math.round(a.y - 2), 16, 3); return;
    }
    let anim, fr, flip = false;
    if (a.state === 'walk') { anim = 'walkR'; fr = a.f; flip = a.dir < 0; }
    else if (a.state === 'cast') { anim = a.castSide ? 'castR' : 'castD'; fr = a.f; flip = a.dir < 0 && a.castSide; }
    else if (a.face > 1.6 || a.front) { anim = 'walkD'; fr = 0; }
    else { anim = 'walkR'; fr = 0; flip = a.dir < 0; }
    const x = Math.round(a.x - ox - 64 * sc), y = Math.round(a.y - 95 * sc);
    SPR.draw(g, a.comp, anim, fr, x, y, sc, flip);
  }
  const BUB = { happy: ['01010', '11111', '11111', '01110', '00100'], ok: ['00100', '01110', '11111', '01110', '00100'], sleepy: ZZ, sad: ['00100', '01110', '01110', '11111', '01110'], talk: ['11111', '10001', '11111', '01000', '10000'] };
  const BUBC = { happy: '#FF5C8A', ok: '#FFD34E', sleepy: '#7FB2FF', sad: '#6AA6E8', talk: '#FFFFFF' };
  function drawBubble(g, a, ox, t) {
    if (!a.mood) return; const k = a.mood === 'ok' ? null : a.mood; if (!k) return;
    const x = Math.round(a.x - ox - 4), y = Math.round(a.y - 70 + Math.sin(t * 3 + a.x) * 1.5);
    g.fillStyle = '#FFFFFF'; g.fillRect(x - 2, y - 2, 11, 10); g.fillRect(x - 1, y - 3, 9, 12); g.fillRect(x + 2, y + 9, 2, 2);
    g.fillStyle = '#2A1E3A'; g.fillRect(x - 2, y - 3, 1, 1); g.fillRect(x + 8, y - 3, 1, 1); g.fillRect(x - 2, y + 8, 1, 1); g.fillRect(x + 8, y + 8, 1, 1);
    pmap(g, BUB[k], x + 1, y, BUBC[k]);
  }

  /* ---------- Motore generico di una scena ---------- */
  function Stage(canvas, opts = {}) {
    const st = { canvas, ctx: canvas.getContext('2d'), buf: ART.cv(10, H), W: 10, K: 2, cam: 0, camV: 0, t: 0, last: 0, raf: 0, run: false, parts: [], fx: [], opts, worldW: 600, hidden: false };
    st.bg = st.buf.getContext('2d'); st.bg.imageSmoothingEnabled = false;
    st.resize = () => {
      const r = canvas.getBoundingClientRect(); const dpr = Math.min(3, window.devicePixelRatio || 1);
      const cw = Math.max(1, Math.round(r.width * dpr)), ch = Math.max(1, Math.round(r.height * dpr));
      let K = Math.max(1, Math.round(ch / (opts.h || H))); if (opts.minW) K = Math.max(1, Math.min(K, Math.floor(cw / opts.minW)));
      st.K = K; st.W = Math.ceil(cw / K); st.Hh = Math.ceil(ch / K);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      if (st.buf.width !== st.W || st.buf.height !== st.Hh) { st.buf.width = st.W; st.buf.height = st.Hh; st.bg.imageSmoothingEnabled = false; }
    };
    st.frame = now => {
      if (!st.run) return;
      st.raf = requestAnimationFrame(st.frame);
      if (document.hidden || !canvas.isConnected) { if (!canvas.isConnected) st.stop(); return; }
      const dt = Math.min(.05, (now - (st.last || now)) / 1000); st.last = now; st.t += dt;
      st.acc = (st.acc || 0) + dt; if (opts.fps30 && st.acc < 1 / 31) return; st.acc = 0;
      opts.update && opts.update(st, dt);
      const g = st.bg; g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, st.W, st.Hh);
      g.save(); g.translate(0, st.Hh - H); // ancorato in basso
      opts.draw && opts.draw(st, g);
      g.restore();
      const c = st.ctx; c.imageSmoothingEnabled = false; c.drawImage(st.buf, 0, 0, st.W * st.K, st.Hh * st.K);
    };
    st.start = () => { if (st.run) return; st.run = true; st.last = 0; st.resize(); st.raf = requestAnimationFrame(st.frame); };
    st.stop = () => { st.run = false; cancelAnimationFrame(st.raf); };
    st.toWorld = (cx, cy) => { const r = canvas.getBoundingClientRect(); const dpr = Math.min(3, window.devicePixelRatio || 1); return { x: (cx - r.left) * dpr / st.K + st.cam, y: (cy - r.top) * dpr / st.K - (st.Hh - H) }; };
    return st;
  }
  function drawBackdrop(st, g, season, tk, o = {}) {
    const W = st.W, cam = st.cam, top = -(st.Hh - H);
    // cielo
    const sky = skyTile(season, tk); for (let x = 0; x < W; x += 16) g.drawImage(sky, x, 0); if (top < 0) { g.fillStyle = skyPal(season, tk)[0]; g.fillRect(0, top, W, -top); }
    const t = st.t;
    // stelle
    if (tk === 'night') { const R = ART.rng(9); for (let i = 0; i < 70; i++) { const x = (R() * 900 - cam * .05) % W, y = R() * 100 + top * R(); const tw = Math.sin(t * (1 + R() * 2) + i) > .3; g.fillStyle = i % 9 === 0 ? '#FFE9A8' : '#FFFFFF'; g.fillRect(((x % W) + W) % W, y, 1, 1); if (tw && i % 4 === 0) { g.globalAlpha = .5; g.fillRect(((x % W) + W) % W - 1, y, 3, 1); g.fillRect(((x % W) + W) % W, y - 1, 1, 3); g.globalAlpha = 1; } } }
    // sole o luna
    const hr = new Date().getHours() + new Date().getMinutes() / 60;
    if (tk === 'night') {
      const mx = W * .78 - cam * .02, my = 30; glow(g, mx, my, 26, '#C7B8FF', .18); g.fillStyle = '#FFF6D6'; disc(g, mx, my, 9); g.fillStyle = skyPal(season, tk)[1]; disc(g, mx + 5, my - 3, 8); g.fillStyle = '#FFE9A8'; g.fillRect(mx - 6, my + 2, 2, 1); g.fillRect(mx - 4, my - 4, 1, 1);
    } else {
      const f = tk === 'sunset' ? .92 : clamp((hr - 6) / 14, 0, 1); const sx = W * (.12 + .76 * f) - cam * .02, sy = tk === 'sunset' ? 84 : 58 - Math.sin(f * Math.PI) * 32;
      glow(g, sx, sy, tk === 'sunset' ? 40 : 30, tk === 'sunset' ? '#FFB37A' : '#FFF4B0', .22);
      g.fillStyle = tk === 'sunset' ? '#FFC36B' : '#FFF4B8'; disc(g, sx, sy, tk === 'sunset' ? 13 : 10); g.fillStyle = tk === 'sunset' ? '#FFE1A0' : '#FFFFFF'; disc(g, sx - 2, sy - 2, tk === 'sunset' ? 8 : 6);
      if (tk === 'sunset') { g.fillStyle = 'rgba(255,170,140,.5)'; for (let i = 0; i < 4; i++) g.fillRect(sx - 14 + i * 2, sy + 4 + i * 3, 28 - i * 4, 1); }
    }
    // nuvole
    const R = ART.rng(4);
    for (let i = 0; i < 7; i++) {
      const w = 26 + R() * 34, y = 12 + R() * 56, sp = 2 + R() * 4; const span = W + 160;
      const x = ((R() * span + t * sp - cam * .08) % span + span) % span - 80;
      cloud(g, x, y, w, tk, season);
    }
    // montagne, colline, alberi lontani
    drawTiled(g, mountains(season, tk), cam * .15 + 30, 58, W);
    drawTiled(g, hills(season, tk), cam * .3, 88, W);
    drawTiled(g, treeline(season, tk), cam * .5, GROUND - 22 - 34, W);
    if (o.birds !== false && tk !== 'night' && rnd() < .004) st.parts.push(P({ k: 'bird', x: cam - 10, y: 20 + rnd() * 40, vx: 22 + rnd() * 10, life: 30, c: tk === 'sunset' ? '#5A3A5E' : '#3A3550', world: true }));
  }
  function disc(g, cx, cy, r) { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + r * .5)); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } }
  function glow(g, cx, cy, r, col, a) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 4; i >= 1; i--) { g.globalAlpha = a * (1 - i / 5); g.fillStyle = col; disc(g, cx, cy, Math.round(r * i / 4)); } g.restore(); }
  function cloud(g, x, y, w, tk, season) {
    const k = 'cl' + Math.round(w) + tk + season;
    const c = memo(k, () => {
      const W = Math.round(w) + 8, Hh = Math.round(w * .45) + 6, cc = ART.cv(W, Hh), gg = cc.getContext('2d');
      const base = tk === 'night' ? '#6E5FA8' : tk === 'sunset' ? '#FFD3C2' : '#FFFFFF', sh = tk === 'night' ? '#4F4290' : tk === 'sunset' ? '#E6A2B4' : '#D8E8F7', hi = tk === 'night' ? '#8E7CC8' : '#FFFFFF';
      const R = ART.rng(Math.round(w)); const blobs = [];
      for (let i = 0; i < 5; i++) blobs.push([4 + (W - 8) * (i + .5) / 5 + (R() - .5) * 4, Hh - 5 - (i === 2 || i === 1 ? Hh * .32 : Hh * .12) * (0.6 + R() * .6), (W / 7) * (0.8 + R() * .6)]);
      for (let yy = 0; yy < Hh; yy++) for (let xx = 0; xx < W; xx++) {
        let inside = false, lit = 0; for (const [bx, by, br] of blobs) { const d = ((xx - bx) ** 2 + (yy - by) ** 2) / (br * br); if (d < 1) { inside = true; lit = Math.max(lit, (by - yy) / br); } }
        if (!inside || yy > Hh - 4) continue; gg.fillStyle = yy > Hh - 7 ? sh : lit > .5 ? hi : base; gg.fillRect(xx, yy, 1, 1);
      }
      return cc;
    });
    g.drawImage(c, Math.round(x), Math.round(y));
  }
  function drawGround(st, g, season, tk) {
    drawTiled(g, groundTile(season, tk), st.cam, GROUND - 22, st.W);
    if (st.Hh > H) { /* niente */ }
  }
  function nightOverlay(st, g, tk) {
    if (tk === 'night') { g.fillStyle = 'rgba(28,22,78,.38)'; g.fillRect(0, GROUND - 120, st.W, H); }
    else if (tk === 'sunset') { g.fillStyle = 'rgba(255,120,90,.08)'; g.fillRect(0, 0, st.W, H); }
  }
  function lightAt(g, x, y, r, col, f = 1) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 3; i >= 1; i--) { g.globalAlpha = .13 * f * (1 - (i - 1) / 3); g.fillStyle = col; disc(g, x, y, Math.round(r * i / 3)); } g.restore(); }

  /* ================== VILLAGGIO ================== */
  const V = { st: null, ents: [], actors: [], hero: null, season: 'estate', tk: 'day', sig: '', dlg: null, keys: {}, decoFrames: {}, sel: null, water: null };
  const LIGHTS = {
    house0: [[26, 33, 9]], house1: [[18, 35, 10]], house2: [[18, 40, 9], [50, 40, 9], [18, 52, 9], [50, 52, 9]], house3: [[67, 41, 9], [67, 63, 8], [13, 55, 8], [46, 55, 8], [13, 72, 8], [46, 72, 8]], house4: [[10, 42, 9], [102, 42, 9], [33, 57, 9], [83, 57, 9], [57, 80, 14]],
    hall: [[53, 64, 16]], shop: [[30, 53, 12]], oracle: [[27, 58, 10], [28, 4, 12]], lanterna: [[7, 7, 14]], fungo: [[19, 34, 10]], falo: [[16, 20, 22]], torre: [[21, 78, 9]], mulino: [[32, 44, 8]], statua: [[16, 10, 16]], arco: [[31, 30, 22]]
  };
  function buildVillage() {
    const P0 = S.profile; const season = ART.themeKey(), tk = ART.timeKey();
    const exs = activeExams();
    const sig = JSON.stringify([season, tk, exs.map(e => [e.id, e.color, e.comp, compById(e.comp) && compBond(compById(e.comp)).L]), Object.keys(P0.owned.decos).filter(d => !P0.hiddenDecos[d]), S.profile.exams.filter(e => e.status === 'superato').length]);
    if (sig === V.sig && V.ents.length) return false;
    V.sig = sig; V.season = season; V.tk = tk; const night = tk === 'night';
    const ents = []; let x = 24;
    const add = (o) => { ents.push(o); return o; };
    const sprite = (key, fn) => memo(key, fn);
    const decos = Object.keys(P0.owned.decos).filter(d => !P0.hiddenDecos[d] && DECO_BY[d]);
    let di = 0; const nextDeco = () => decos[di++];
    const tree = (kind, seed, sc = 1) => { const c = sprite(`tree${kind}${season}${seed}${sc}`, () => ART.tree(kind, season, seed, sc)); add({ kind: 'tree', x, y: GROUND - 6 - c.height + 2, w: c.width, h: c.height, spr: c, z: 0 }); x += c.width - 10; };
    const bush = seed => { const c = sprite(`bush${season}${seed}`, () => ART.bush(season, seed)); add({ kind: 'bush', x, y: GROUND - 8 - c.height + 4, w: c.width, h: c.height, spr: c, z: 1 }); x += c.width + 2; };
    const placeDeco = id => {
      if (!id) return;
      if (id === 'statua') { add({ kind: 'deco', id, x, y: GROUND - 8 - 60, w: 34, h: 60, statue: true, lights: night ? LIGHTS.statua : null, act: { t: 'deco', id } }); x += 40; return; }
      const anim = ['falo', 'fontana', 'mulino', 'stendardo', 'arco'].includes(id);
      const first = sprite(`deco${id}${season}${night}0`, () => ART.deco(id, season, night, 0));
      if (!first) return;
      const o = add({ kind: 'deco', id, x, y: GROUND - 6 - first.height + 2, w: first.width, h: first.height, spr: first, anim, z: 0, lights: night ? LIGHTS[id] : (id === 'falo' ? LIGHTS.falo : null), act: { t: 'deco', id } });
      if (id === 'torre') o.clock = true;
      x += first.width + 6;
    };
    // ingresso: cartello verso la mappa
    tree('pine', 3); x -= 4;
    const sp = sprite('signpost' + season, () => ART.signpost(season));
    add({ kind: 'sign', x, y: GROUND - 6 - sp.height + 2, w: sp.width, h: sp.height, spr: sp, act: { t: 'map' }, label: 'MAPPA' }); x += sp.width + 6;
    bush(1);
    const shop = sprite('shop' + season + night, () => ART.shop(season, night));
    add({ kind: 'shop', x, y: GROUND - 8 - shop.height + 2, w: shop.width, h: shop.height, spr: shop, act: { t: 'shop' }, lights: night ? LIGHTS.shop : null, label: 'BOTTEGA' }); x += shop.width + 4;
    placeDeco(nextDeco()); tree('round', 5);
    // il ruscello con il ponte
    V.water = { x: x + 4, w: 34 }; x += 46;
    // case degli esami
    const homes = [];
    exs.forEach((e, i) => {
      const c = compById(e.comp); const L = c ? compBond(c).L : 0; const stg = ART.houseStage(L);
      const spr = sprite(`house${stg}${e.color}${season}${night}`, () => ART.house(stg, colorOf(e), season, night, i));
      const o = add({ kind: 'house', ex: e.id, comp: e.comp, stage: stg, L, x, y: GROUND - 8 - spr.height + 2, w: spr.width, h: spr.height, spr, lights: night ? LIGHTS['house' + stg] : null, smoke: stg === 2 ? [52, 2] : stg === 1 ? null : stg === 4 ? [56, 6] : null, flag: { dx: stg >= 3 ? (stg === 4 ? 56 : 67) : spr.width - 6, dy: stg >= 3 ? (stg === 4 ? 6 : 0) : 6, col: colorOf(e), pole: stg < 3 }, act: { t: 'house', ex: e.id } });
      homes.push({ e, x: o.x + o.w / 2, c });
      x += spr.width + 8;
      if (i % 2 === 0) bush(10 + i); else tree(i % 3 ? 'round' : 'pine', 20 + i, .9);
      const d = nextDeco(); if (d) placeDeco(d);
    });
    if (!exs.length) { tree('round', 41); bush(42); }
    // Torre dell'Oracolo
    const or = sprite('oracle' + season + night, () => ART.oracleTower(season, night));
    add({ kind: 'oracle', x, y: GROUND - 8 - or.height + 2, w: or.width, h: or.height, spr: or, act: { t: 'oracle' }, lights: night ? LIGHTS.oracle : [[28, 4, 12]], label: 'ORACOLO' }); x += or.width + 6;
    let d; while ((d = nextDeco())) { placeDeco(d); if (rnd() < .5) bush(60 + di); }
    tree('round', 77, 1.1);
    // Sala degli Eroi (Albo)
    const hall = sprite('hall' + season + night, () => ART.hall(season, night));
    const nPassed = S.profile.exams.filter(e => e.status === 'superato').length;
    add({ kind: 'hall', x, y: GROUND - 8 - hall.height + 2, w: hall.width, h: hall.height, spr: hall, act: { t: 'hall' }, lights: night ? LIGHTS.hall : null, label: 'ALBO', banners: S.profile.exams.filter(e => e.status === 'superato').slice(-6).map(e => colorOf(e)) }); x += hall.width + 2;
    tree('pine', 91); tree(season === 'inverno' ? 'bare' : 'round', 92, .95); tree('pine', 93, 1.1);
    V.worldW = x + 30; V.ents = ents;
    // attori
    const keep = new Map(V.actors.map(a => [a.who, a]));
    const actors = [];
    const hero = keep.get('avatar') || Actor({ who: 'avatar', x: homes[0] ? homes[0].x - 30 : 160, speed: 46, front: false });
    if (!hero.placed && homes.length) { hero.x = homes[0].x - 30; hero.placed = true; if (V.st) V.st.cam = clamp(hero.x - V.st.W / 2, 0, Math.max(0, x + 30 - V.st.W)); }
    hero.min = 20; hero.max = V.worldW - 20; hero.aura = S.profile.avatar.aura; hero.isHero = true;
    hero.load(lookOf('avatar').look);
    actors.push(hero);
    homes.forEach(h => {
      if (!h.c) return;
      const a = keep.get(h.c.id) || Actor({ who: h.c.id, x: h.x + (rnd() - .5) * 30, speed: 18 + rnd() * 8 });
      a.home = h.x; a.range = 34; a.min = 10; a.max = V.worldW - 10; a.ex = h.e.id; a.mood = moodOfExam(h.e); a.aura = h.c.aura;
      a.castSide = rnd() < .5;
      a.load(lookOf(h.c.id, a.mood).look);
      actors.push(a);
    });
    V.actors = actors; V.hero = hero;
    if (V.st) V.st.cam = clamp(hero.x - V.st.W / 2, 0, Math.max(0, V.worldW - V.st.W));
    return true;
  }
  function decoSprite(e, t) {
    if (!e.anim) { if (e.clock) { const m = new Date().getMinutes(); return memo(`deco${e.id}${V.season}${V.tk}c${m}`, () => ART.deco(e.id, V.season, V.tk === 'night', 0)); } return e.spr; }
    const n = e.id === 'mulino' ? 12 : 8, per = { falo: .6, fontana: 2.1, mulino: 1.31, stendardo: 2.1, arco: 3.14 }[e.id] || 1;
    const i = Math.floor((t % per) / per * n);
    return memo(`deco${e.id}${V.season}${V.tk === 'night'}a${i}`, () => ART.deco(e.id, V.season, V.tk === 'night', i / n * per));
  }
  function flagFrames(col, i) { return memo('flag' + col + i, () => ART.flag(col, i / 6 * Math.PI * 2 / 4)); }
  function statueSprite() {
    const look = lookOf('avatar').look; const key = 'statue' + JSON.stringify(look);
    if (cache.has(key)) return cache.get(key);
    cache.set(key, null);
    SPR.compose(look).then(comp => {
      const c = ART.cv(64, 64), g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(comp.canvas, SPR.frameIndex('walkD', 0) * 128 + 32, 32, 64, 64, 0, 0, 64, 64);
      const id = g.getImageData(0, 0, 64, 64), d = id.data;
      for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255; const v = 120 + l * 120; d[i] = v * .98; d[i + 1] = v * .96; d[i + 2] = v * 1.04; }
      g.putImageData(id, 0, 0); cache.set(key, c);
    }).catch(() => { });
    return null;
  }
  function villageUpdate(st, dt) {
    const hero = V.hero; if (!hero) return;
    // tastiera
    if (V.keys.l || V.keys.r) { hero.tx = clamp(hero.x + (V.keys.r ? 30 : -30), hero.min, hero.max); hero.state = 'walk'; hero.onArrive = null; V.follow = true; }
    V.actors.forEach(a => stepActor(a, dt, a === hero));
    // camera
    if (V.follow) { const target = clamp(hero.x - st.W / 2, 0, Math.max(0, V.worldW - st.W)); st.cam += (target - st.cam) * Math.min(1, dt * 4); }
    st.cam = clamp(st.cam, 0, Math.max(0, V.worldW - st.W));
    // particelle ambientali
    const ps = st.parts, W = st.W, s = V.season, night = V.tk === 'night';
    if (s === 'inverno' && rnd() < dt * 26) ps.push(P({ k: 'snow', x: st.cam + rnd() * (W + 40) - 20, y: -10 - (st.Hh - H), vy: 10 + rnd() * 12, vx: -3 + rnd() * 2, life: 14, s: rnd() < .25 ? 2 : 1, c: '#FFFFFF' }));
    if (s === 'autunno' && rnd() < dt * 5) ps.push(P({ k: 'leaf', x: st.cam + rnd() * W, y: 20 + rnd() * 50, vy: 9 + rnd() * 6, vx: -6, life: 12, c: ART.SEASON.autunno.leaf[Math.floor(rnd() * 4)] }));
    if ((s === 'primavera' || s === 'ciliegi') && rnd() < dt * (s === 'ciliegi' ? 7 : 3)) ps.push(P({ k: 'petal', x: st.cam + rnd() * W, y: 10 + rnd() * 60, vy: 7 + rnd() * 5, vx: -5, life: 14, c: ['#FFC2DA', '#FFE0EC', '#FF8FB8'][Math.floor(rnd() * 3)] }));
    if (s === 'lavanda' && rnd() < dt * 3) ps.push(P({ k: 'spark', x: st.cam + rnd() * W, y: 40 + rnd() * 90, vy: -3, life: 3, c: ['#E2D4FF', '#FFFFFF', '#C7A6FF'][Math.floor(rnd() * 3)] }));
    if ((night || s === 'estate') && rnd() < dt * (night ? 4 : 1.2)) ps.push(P({ k: 'fly', x: st.cam + rnd() * W, y: GROUND - 10 - rnd() * 60, life: 6 + rnd() * 4, c: '#F4FF8A' }));
    if (!night && (s === 'primavera' || s === 'estate' || s === 'ciliegi' || s === 'lavanda') && rnd() < dt * .5 && ps.filter(p => p.k === 'butterfly').length < 5) ps.push(P({ k: 'butterfly', x: st.cam + rnd() * W, y: GROUND - 20 - rnd() * 40, vx: (rnd() - .5) * 20, life: 12, c: ['#FFB0D9', '#FFE27A', '#9FDFFF', '#FFFFFF', '#C7A6FF'][Math.floor(rnd() * 5)] }));
    if (V.water && rnd() < dt * .25) ps.push(P({ k: 'fish', x: V.water.x + 6 + rnd() * (V.water.w - 12), y: GROUND + 20, vy: -18, g: 60, life: .6, c: '#FF9E5C' }));
    // fumo dai comignoli
    V.ents.forEach(e => { if (e.smoke && rnd() < dt * 3) ps.push(P({ k: 'smoke', x: e.x + e.smoke[0], y: e.y + e.smoke[1], vy: -7, vx: 3 + rnd() * 2, life: 3.2, c: V.tk === 'night' ? '#8A84A8' : '#E9E6F0' })); if (e.id === 'falo' && rnd() < dt * 10) ps.push(P({ k: 'flame', x: e.x + 12 + rnd() * 8, y: e.y + 8, vy: -16 - rnd() * 8, vx: (rnd() - .5) * 4, life: .9, c: '#FFB347' })); if (e.id === 'fontana' && rnd() < dt * 8) ps.push(P({ k: 'drop', x: e.x + 27 + (rnd() - .5) * 14, y: e.y + 6, vy: -10, vx: (rnd() - .5) * 18, g: 60, life: .7, c: '#BFEAFF' })); if (e.kind === 'oracle' && rnd() < dt * 2) ps.push(P({ k: 'spark', x: e.x + 28 + (rnd() - .5) * 14, y: e.y + 6 + (rnd() - .5) * 10, vy: -4, life: 1.2, c: '#BFEAFF' })); if (e.id === 'arco' && rnd() < dt * 6) ps.push(P({ k: 'star', x: e.x + 10 + rnd() * 40, y: e.y + 10 + rnd() * 40, vy: -4, life: 1.2, c: ['#C7A6FF', '#9FE3FF', '#FFFFFF'][Math.floor(rnd() * 3)] })); });
    // aure dei personaggi
    V.actors.forEach(a => { if (a.aura) emitAura(ps, a.aura, a.x, a.y - 30, dt, { cx: () => a.x, cy: () => a.y - 30 }); });
    stepParts(ps, dt);
    if (ps.length > 600) ps.splice(0, ps.length - 600);
  }
  function drawWater(st, g) {
    const w = V.water; if (!w) return; const x0 = Math.round(w.x - st.cam); if (x0 > st.W || x0 + w.w < 0) return;
    const t = st.t, night = V.tk === 'night', winter = V.season === 'inverno';
    const top = GROUND - 14, cols = winter ? ['#CFEAFB', '#A8D6F2', '#E8F6FF'] : night ? ['#3E4FA0', '#2E3A82', '#7C8EE0'] : ['#5CC8F2', '#3AA6DE', '#BFF0FF'];
    // argini
    g.fillStyle = '#8C6B4A'; g.fillRect(x0 - 2, top, 2, H - top); g.fillRect(x0 + w.w, top, 2, H - top);
    for (let y = top; y < H; y++) for (let x = 0; x < w.w; x++) {
      const k = Math.sin((x + y * 2) * .5 + t * 3) + Math.sin(y * .9 - t * 2);
      g.fillStyle = k > 1.4 ? cols[2] : (y - top) < 3 ? cols[1] : cols[0]; g.fillRect(x0 + x, y, 1, 1);
    }
    // ponte ad arco
    const bx = x0 - 6, bw = w.w + 12, by = GROUND - 2;
    for (let x = 0; x < bw; x++) { const arch = Math.round(Math.sin(x / bw * Math.PI) * 5); g.fillStyle = '#B07A48'; g.fillRect(bx + x, by - arch, 1, 4); g.fillStyle = x % 4 === 0 ? '#7A5232' : '#D49A5E'; g.fillRect(bx + x, by - arch, 1, 1); }
    g.fillStyle = '#7A5232'; for (let x = 0; x <= bw; x += 6) { const arch = Math.round(Math.sin(x / bw * Math.PI) * 5); g.fillRect(bx + x, by - arch - 8, 1, 8); }
    for (let x = 0; x < bw; x++) { const arch = Math.round(Math.sin(x / bw * Math.PI) * 5); g.fillStyle = '#C98B55'; g.fillRect(bx + x, by - arch - 8, 1, 1); }
    if (winter) { g.fillStyle = '#FFFFFF'; for (let x = 0; x < bw; x++) { const arch = Math.round(Math.sin(x / bw * Math.PI) * 5); g.fillRect(bx + x, by - arch - 9, 1, 1); } }
  }
  function villageDraw(st, g) {
    const s = V.season, tk = V.tk, cam = st.cam, t = st.t, night = tk === 'night';
    drawBackdrop(st, g, s, tk);
    drawGround(st, g, s, tk);
    drawWater(st, g);
    // edifici e decorazioni
    for (const e of V.ents) {
      const x = Math.round(e.x - cam); if (x > st.W + 10 || x + e.w < -10) continue;
      let spr = e.kind === 'deco' ? (e.statue ? null : decoSprite(e, t)) : e.spr;
      // ombra a terra
      g.fillStyle = 'rgba(40,30,60,.18)'; g.fillRect(x + 4, GROUND - 7, e.w - 8, 3);
      if (e.statue) {
        const sc = statueSprite(); g.fillStyle = '#BDB4CC'; g.fillRect(x + 2, GROUND - 22, 30, 14); g.fillStyle = '#E3DDEA'; g.fillRect(x, GROUND - 24, 34, 4); g.fillStyle = '#8E86A3'; g.fillRect(x + 2, GROUND - 10, 30, 2);
        if (sc) g.drawImage(sc, x - 15, GROUND - 24 - 60);
      } else if (spr) g.drawImage(spr, x, Math.round(e.y));
      if (e.flag) {
        const fx = x + e.flag.dx, fy = Math.round(e.y + e.flag.dy);
        if (e.flag.pole) { g.fillStyle = '#6E4226'; g.fillRect(fx, fy - 12, 1, 18 + (e.h - e.flag.dy) - 4); g.fillStyle = '#FFD34E'; g.fillRect(fx - 1, fy - 13, 3, 2); }
        g.drawImage(flagFrames(e.flag.col, Math.floor(t * 8) % 6), fx + 1, fy - 12);
      }
      if (e.banners) e.banners.forEach((c, i) => { const bx = x + 14 + i * 14; g.fillStyle = c; g.fillRect(bx, Math.round(e.y) + 40, 6, 12); g.fillStyle = '#FFE27A'; g.fillRect(bx, Math.round(e.y) + 40, 6, 1); g.fillRect(bx + 2, Math.round(e.y) + 44, 2, 2); g.fillStyle = c; g.fillRect(bx, Math.round(e.y) + 52, 2, 2); g.fillRect(bx + 4, Math.round(e.y) + 52, 2, 2); });
      if (e.kind === 'house' && V.sel === e.ex) { const yy = Math.round(e.y) - 10 + Math.sin(t * 4) * 2; g.fillStyle = '#FFE27A'; g.fillRect(x + e.w / 2 - 3, yy, 7, 2); g.fillRect(x + e.w / 2 - 2, yy + 2, 5, 2); g.fillRect(x + e.w / 2 - 1, yy + 4, 3, 2); }
    }
    // personaggi (ordinati per x per un'illusione di profondità)
    const acts = [...V.actors].sort((a, b) => (a === V.hero) - (b === V.hero));
    for (const a of acts) { g.fillStyle = 'rgba(40,30,60,.22)'; g.fillRect(Math.round(a.x - cam - 9), Math.round(a.y - 2), 18, 3); drawActor(g, a, cam); }
    for (const a of V.actors) if (a !== V.hero) drawBubble(g, a, cam, t);
    // particelle davanti
    for (const p of st.parts) drawPart(g, p, cam);
    nightOverlay(st, g, tk);
    // luci notturne sopra l'ombra
    for (const e of V.ents) { if (!e.lights) continue; const x = e.x - cam; if (x > st.W + 30 || x + e.w < -30) continue; const fl = .85 + Math.sin(t * 7 + e.x) * .12; e.lights.forEach(([dx, dy, r]) => lightAt(g, x + dx, e.y + dy, r, e.id === 'falo' ? '#FF9A4D' : e.kind === 'oracle' ? '#B7A6FF' : '#FFD27A', fl)); }
    if (night) for (const p of st.parts) if (p.k === 'fly') drawPart(g, p, cam);
    // primo piano
    drawTiled(g, fgStrip(s, tk), cam * 1.25, H - 22, st.W);
    // etichette sugli edifici speciali
    for (const e of V.ents) if (e.label && V.showLabels !== false) { const x = e.x - cam + e.w / 2 - textW(e.label) / 2; if (x > -40 && x < st.W) text(g, e.label, x, Math.round(e.y) - 9 - (e.kind === 'sign' ? -2 : 0), '#FFF6D6'); }
  }
  function villageTap(st, wx, wy) {
    // personaggi
    const a = V.actors.filter(a => a !== V.hero && Math.abs(a.x - wx) < 14 && wy > a.y - 58 && wy < a.y + 4).sort((p, q) => Math.abs(p.x - wx) - Math.abs(q.x - wx))[0];
    if (a) return walkThen(a.x + (V.hero.x < a.x ? -22 : 22), () => { V.hero.dir = a.x > V.hero.x ? 1 : -1; a.state = 'idle'; a.dir = -V.hero.dir; a.wait = 6; a.face = 0; talkComp(a); });
    if (Math.abs(V.hero.x - wx) < 12 && wy > V.hero.y - 58 && wy < V.hero.y + 4) return talkHero();
    const e = [...V.ents].reverse().find(e => e.act && wx >= e.x && wx <= e.x + e.w && wy >= e.y && wy <= GROUND);
    if (e) { V.sel = e.ex || null; return walkThen(e.x + e.w / 2, () => talkPlace(e)); }
    walkThen(wx, null);
  }
  function walkThen(x, fn) { const h = V.hero; h.tx = clamp(x, h.min, h.max); h.state = 'walk'; h.onArrive = fn; V.follow = true; closeDialog(); if (Math.abs(h.tx - h.x) < 1) { h.state = 'idle'; h.onArrive = null; fn && fn(); } }

  /* ---------- Dialoghi ---------- */
  let typeT = null;
  function closeDialog() { const d = $('#dlg'); if (d) { d.hidden = true; d.innerHTML = ''; } clearInterval(typeT); V.sel = null; }
  function dialog({ who, name, sub, text: txt, choices = [], portrait = null, color }) {
    const d = $('#dlg'); if (!d) return; clearInterval(typeT);
    d.hidden = false; d.style.setProperty('--c', color || 'var(--acc)');
    d.innerHTML = `<div class="dlg-in"><div class="dlg-face"><canvas width="80" height="80"></canvas></div><div class="dlg-body"><div class="dlg-name"><b>${esc(name)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div><p class="dlg-text" aria-live="polite"></p><div class="dlg-ch">${choices.map((c, i) => `<button class="btn small ${i === 0 ? 'primary' : ''}" data-dlg="${i}">${c.icon ? ART.pix(c.icon, '', 2) : ''}${esc(c.label)}</button>`).join('')}</div></div><button class="dlg-x" data-dlg="x" aria-label="Chiudi">${ART.pix('close', '', 2)}</button></div>`;
    const cvs = d.querySelector('canvas'), gg = cvs.getContext('2d'); gg.imageSmoothingEnabled = false;
    if (portrait && portrait.look) SPR.portrait(portrait.look).then(c => { gg.clearRect(0, 0, 80, 80); gg.drawImage(c, 0, 0); }).catch(() => { });
    else if (portrait && portrait.icon) { const im = new Image(); im.onload = () => { gg.drawImage(im, 16, 16, 48, 48); }; im.src = ART.iconURL(portrait.icon, 4); }
    const p = d.querySelector('.dlg-text'); let i = 0; const full = txt; SFX.play('talk');
    typeT = setInterval(() => { i += 2; p.textContent = full.slice(0, i); if (i % 12 === 0 && S.profile.sound.sfx) AUDIO.play('step'); if (i >= full.length) clearInterval(typeT); }, 22);
    d.onclick = ev => {
      const b = ev.target.closest('[data-dlg]'); if (!b) { if (i < full.length) { i = full.length; p.textContent = full; clearInterval(typeT); } return; }
      if (b.dataset.dlg === 'x') { closeDialog(); return; }
      const c = choices[Number(b.dataset.dlg)]; closeDialog(); c && c.fn && c.fn();
    };
  }
  function talkComp(a) {
    const c = compById(a.who); const e = exById(a.ex); if (!c || !e) return;
    const sp = SPECIES_BY[c.sp]; const b = compBond(c);
    const mood = moodOfExam(e);
    const nextR = bondRewards(c.sp, b.tier).find(r => r.L > b.L);
    const lines = [...sp.lines, MOOD_TEXT[mood] + '.', nextR ? `Al livello ${nextR.L} del nostro legame sbloccheremo ${rewardName(nextR)}.` : 'Abbiamo sbloccato tutto in questa avventura!'];
    const tg = examTarget(e); if (tg) lines.push(tg.kind === 'appello' ? `L'appello di ${e.name} è ${inDays(diffDays(today(), tg.date))}. Ci prepariamo?` : `La ${SESSIONI[e.ses].label.toLowerCase()} arriva ${inDays(diffDays(today(), tg.date))}.`);
    const txt = lines[Math.floor(rnd() * lines.length)];
    dialog({ name: c.name, sub: `${e.name} · legame Lv ${b.L}${b.tier ? ' · ' + TIER_NAMES[Math.min(b.tier, 4)] : ''}`, text: txt, color: colorOf(e), portrait: lookOf(c.id, mood), choices: [
      { label: 'Studiamo!', icon: 'play', fn: () => act('tm-go', { id: e.id }) },
      { label: 'Guardaroba', icon: 'guardaroba', fn: () => act('ward', { who: c.id }) },
      { label: 'Scheda', icon: 'esami', fn: () => act('exam-open', { id: e.id }) }
    ] });
  }
  function talkHero() {
    const L = IX.lv; const nx = Object.keys(AVATAR_REWARDS).map(Number).find(k => k > L.L);
    dialog({ name: S.profile.name || 'Tu', sub: `Livello ${L.L} · ${S.profile.avatar.title || L.title}`, text: nx ? `Al livello ${nx} otterrò ${AVATAR_REWARDS[nx].map(rewardName).join(' e ')}. Mancano ${num((30 * (nx - 1) * nx) - IX.xp > 0 ? (30 * (nx - 1) * nx) - IX.xp : 0)} XP.` : 'Ho sbloccato ogni premio dei livelli. Sono una leggenda!', portrait: lookOf('avatar'), choices: [{ label: 'Guardaroba', icon: 'guardaroba', fn: () => act('ward', { who: 'avatar' }) }, { label: 'Studia', icon: 'play', fn: () => act('nav', { v: 'studio' }) }] });
  }
  function talkPlace(e) {
    const t = e.act.t;
    if (t === 'shop') return dialog({ name: 'Bottega di Nonna Ghianda', sub: `${num(IX.wallet.coins)} monete nel borsellino`, text: 'Benvenuto! Abiti, ali, aure scintillanti, pozioni e decorazioni per la radura. Tutto si paga con le monete guadagnate studiando.', portrait: { icon: 'bottega' }, choices: [{ label: 'Entra', icon: 'bottega', fn: () => act('nav', { v: 'bottega' }) }] });
    if (t === 'oracle') { const o = oracle(weekStart(today())); const i = o.top[0]; return dialog({ name: 'Torre dell\'Oracolo', sub: 'Consigli della settimana', text: i ? `Le stelle dicono: dedica più tempo a ${i.e.name}. ${adviceLine(i)}` : 'Le stelle sono in equilibrio: continua così!', portrait: { icon: 'oracolo' }, choices: [{ label: 'Consulta', icon: 'oracolo', fn: () => act('nav', { v: 'oracolo' }) }, ...(i ? [{ label: 'Studia ' + i.e.name, icon: 'play', fn: () => act('tm-go', { id: i.e.id }) }] : [])] }); }
    if (t === 'hall') { const n = S.profile.exams.filter(e => e.status === 'superato').length; return dialog({ name: 'Sala degli Eroi', sub: `${n} ${n === 1 ? 'esame superato' : 'esami superati'}`, text: n ? 'Qui riposano le leggende di ogni esame superato: compagni, abiti, ali e trofei conquistati. Puoi richiamare un eroe per una nuova avventura.' : 'Le pareti attendono il primo eroe. Supera un esame e il tuo compagno entrerà nell\'Albo.', portrait: { icon: 'albo' }, choices: [{ label: 'Apri l\'Albo', icon: 'albo', fn: () => act('nav', { v: 'albo' }) }] }); }
    if (t === 'map') return dialog({ name: 'Cartello del viandante', sub: 'Verso le sessioni', text: 'Il sentiero porta attraverso l\'anno accademico: il Regno d\'Inverno, le Isole d\'Estate e il Bosco d\'Autunno, con i boss di ogni appello.', portrait: { icon: 'mappa' }, choices: [{ label: 'Apri la mappa', icon: 'mappa', fn: () => act('nav', { v: 'mappa' }) }] });
    if (t === 'house') {
      const ex = exById(e.act.ex); const c = ex && compById(ex.comp); if (!ex || !c) return;
      const b = compBond(c); const stg = ART.houseStage(b.L); const nextAt = [2, 6, 12, 18][stg];
      return dialog({ name: `${ART.HOUSE_NAMES[stg]} di ${c.name}`, sub: ex.name, color: colorOf(ex), text: nextAt ? `Legame livello ${b.L}. Al livello ${nextAt} la casa diventerà ${ART.HOUSE_NAMES[stg + 1].toLowerCase()}. Ogni minuto di studio insieme la fa crescere.` : 'Un castello degno di una leggenda! Il legame è al massimo splendore.', portrait: lookOf(c.id, moodOfExam(ex)), choices: [{ label: 'Studia', icon: 'play', fn: () => act('tm-go', { id: ex.id }) }, { label: 'Scheda', icon: 'esami', fn: () => act('exam-open', { id: ex.id }) }] });
    }
    if (t === 'deco') { const d = DECO_BY[e.act.id]; return dialog({ name: d.name, sub: RARITY[d.rar].name, text: d.desc, portrait: { icon: 'bottega' }, choices: [{ label: 'Bottega', icon: 'bottega', fn: () => act('nav', { v: 'bottega' }) }] }); }
  }
  function rewardName(r) {
    if (r.t === 'item') { const it = SPR.item(r.id); return it ? it.name.toLowerCase() : 'un oggetto'; }
    if (r.t === 'aura') return 'l\'aura ' + (AURA_BY[r.id] ? AURA_BY[r.id].name.toLowerCase() : '');
    if (r.t === 'title') return 'il titolo «' + r.name + '»';
    if (r.t === 'chest') return 'un forziere da ' + (r.coins || 0) + ' monete';
    if (r.t === 'cons') return CONS_BY[r.id] ? CONS_BY[r.id].name.toLowerCase() : 'una pozione';
    return '';
  }
  function act(name, data) { if (typeof runAct === 'function') runAct(name, data); }

  function mountVillage(canvas) {
    if (V.st) V.st.stop();
    const st = Stage(canvas, { update: villageUpdate, draw: villageDraw, minW: 250 });
    V.st = st; buildVillage(); st.resize(); st.cam = clamp(V.hero.x - st.W / 2, 0, Math.max(0, V.worldW - st.W)); V.follow = false;
    // input: trascina per scorrere, tocca per camminare
    let down = null;
    canvas.onpointerdown = ev => { down = { x: ev.clientX, y: ev.clientY, cam: st.cam, moved: false }; canvas.setPointerCapture(ev.pointerId); AUDIO.unlock(); };
    canvas.onpointermove = ev => { if (!down) return; const dx = ev.clientX - down.x; if (Math.abs(dx) > 6) down.moved = true; if (down.moved) { V.follow = false; const dpr = Math.min(3, window.devicePixelRatio || 1); st.cam = clamp(down.cam - dx * dpr / st.K, 0, Math.max(0, V.worldW - st.W)); } };
    canvas.onpointerup = ev => { if (!down) return; const d = down; down = null; if (!d.moved) { const w = st.toWorld(ev.clientX, ev.clientY); villageTap(st, w.x, w.y); } };
    canvas.onpointercancel = () => { down = null; };
    canvas.onwheel = ev => { if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY) || ev.shiftKey) { ev.preventDefault(); V.follow = false; st.cam = clamp(st.cam + (ev.deltaX || ev.deltaY) / st.K, 0, Math.max(0, V.worldW - st.W)); } };
    canvas.tabIndex = 0;
    canvas.onkeydown = ev => { if (ev.key === 'ArrowLeft') { V.keys.l = true; ev.preventDefault(); } if (ev.key === 'ArrowRight') { V.keys.r = true; ev.preventDefault(); } };
    canvas.onkeyup = ev => { if (ev.key === 'ArrowLeft') V.keys.l = false; if (ev.key === 'ArrowRight') V.keys.r = false; };
    canvas.onblur = () => { V.keys = {}; };
    st.start();
    return st;
  }
  function refreshVillage() { if (V.st && V.st.canvas.isConnected) { if (buildVillage()) { } else { V.actors.forEach(a => { if (a.who === 'avatar') { a.aura = S.profile.avatar.aura; a.load(lookOf('avatar').look); } else { const c = compById(a.who); const e = exById(a.ex); if (c && e) { a.mood = moodOfExam(e); a.aura = c.aura; a.load(lookOf(c.id, a.mood).look); } } }); } } }
  function focusExam(exId) { const e = V.ents.find(x => x.ex === exId); if (e && V.st) { V.sel = exId; V.follow = false; V.st.cam = clamp(e.x + e.w / 2 - V.st.W / 2, 0, Math.max(0, V.worldW - V.st.W)); } }

  /* ================== MAPPA DELLE SESSIONI ================== */
  const M = { st: null, ents: [], actors: [], hero: null, ay: null, dayW: 7, x0: 60 };
  function monthSeason(m) { return m <= 1 || m === 11 ? 'inverno' : m <= 4 ? 'primavera' : m <= 7 ? 'estate' : 'autunno'; }
  function buildMap() {
    const ay = S.profile.ay; M.ay = ay; const start = `${ay}-10-01`, end = `${ay + 1}-09-30`;
    const days = diffDays(start, end) + 1; M.start = start; M.worldW = M.x0 * 2 + days * M.dayW;
    const xOf = d => M.x0 + diffDays(start, d) * M.dayW; M.xOf = xOf;
    const ents = [];
    // alberi stagionali lungo il cammino
    const R = ART.rng(ay);
    for (let x = 10; x < M.worldW; x += 46 + R() * 50) { const d = addDays(start, clamp(Math.round((x - M.x0) / M.dayW), 0, days - 1)); const s = monthSeason(pd(d).getMonth()); const kind = s === 'inverno' ? (R() < .5 ? 'pine' : 'bare') : R() < .3 ? 'pine' : 'round'; const spr = memo(`tree${kind}${s}${Math.floor(R() * 9)}m`, () => ART.tree(kind, s, Math.floor(R() * 99), .8 + R() * .3)); ents.push({ kind: 'tree', x, y: GROUND - 8 - spr.height + 2, spr, w: spr.width, h: spr.height, back: true }); }
    // regni delle sessioni
    M.realms = SES_ORDER.map(s => { const r = sessionRange(s, ay); return { s, x1: xOf(r[0]), x2: xOf(r[1]) + M.dayW, name: SESSIONI[s].realm }; });
    M.sems = [{ name: '1° SEMESTRE', x1: xOf(`${ay}-10-01`), x2: xOf(`${ay}-12-22`) }, { name: '2° SEMESTRE', x1: xOf(`${ay + 1}-03-01`), x2: xOf(`${ay + 1}-05-31`) }];
    // boss agli appelli
    const bosses = [];
    for (const e of S.profile.exams.filter(e => e.ay === ay || (e.appelli || []).some(a => a.date >= start && a.date <= end))) {
      const apps = (e.appelli || []).filter(a => a.date >= start && a.date <= end);
      const spots = apps.length ? apps.map(a => ({ d: a.date, a })) : (() => { const r = sessionRange(e.ses, e.ay); return r && r[0] >= start && r[0] <= end ? [{ d: addDays(r[0], 3 + (hashStr(e.id) % 12)), a: null }] : []; })();
      spots.forEach(sp => { const b = bossFor(e); bosses.push({ e, b, x: xOf(sp.d), d: sp.d, a: sp.a, passed: e.status === 'superato' }); });
    }
    bosses.sort((a, b) => a.x - b.x);
    // separa boss sovrapposti
    for (let i = 1; i < bosses.length; i++) if (bosses[i].x - bosses[i - 1].x < 40) bosses[i].x = bosses[i - 1].x + 40;
    M.bosses = bosses;
    const keep = new Map(M.actors.map(a => [a.key, a]));
    M.actors = bosses.map(bb => { const k = bb.e.id + bb.d; const a = keep.get(k) || Actor({ key: k }); Object.assign(a, { x: bb.x, y: GROUND, home: bb.x, range: 0, boss: bb, dir: -1, front: true, state: 'idle', wait: 1e9 }); const look = { body: bb.b.body, skin: bb.b.skin, eyes: bb.b.eyes, hairColor: bb.b.hairColor || 'black', slots: { body: { id: 'body' }, shadow: { id: 'shadow' }, ...bb.b.slots } }; a.load(look); return a; });
    const tx = clamp(xOf(today()), M.x0, M.worldW - M.x0);
    const hero = keep.get('hero') || Actor({ key: 'hero', x: tx, speed: 60 }); hero.x = hero.x || tx; hero.home = tx; hero.isHero = true; hero.aura = S.profile.avatar.aura; hero.load(lookOf('avatar').look); hero.min = 20; hero.max = M.worldW - 20;
    M.hero = hero; M.ents = ents;
    // compagni attivi al seguito
    M.follow = activeExams().slice(0, 4).map((e, i) => { const c = compById(e.comp); if (!c) return null; const k = 'c' + c.id; const a = keep.get(k) || Actor({ key: k, x: tx - 24 * (i + 1), speed: 60 }); a.ex = e.id; a.mood = moodOfExam(e); a.load(lookOf(c.id, a.mood).look); a.aura = c.aura; a.idx = i; return a; }).filter(Boolean);
    M.allActors = [...M.actors, ...M.follow, hero];
  }
  function mapSeasonAt(x) { const d = clamp(Math.round((x - M.x0) / M.dayW), 0, 400); return monthSeason(pd(addDays(M.start, d)).getMonth()); }
  function mapUpdate(st, dt) {
    const h = M.hero; stepActor(h, dt, true);
    M.follow.forEach((a, i) => { const target = h.x - (h.dir || 1) * 27 * (i + 1); if (Math.abs(a.x - target) > 4) { a.tx = target; a.state = 'walk'; a.speed = h.state === 'walk' ? h.speed * 1.05 : 40; } stepActor(a, dt, true); });
    if (M.followCam) { const target = clamp(h.x - st.W / 2, 0, Math.max(0, M.worldW - st.W)); st.cam += (target - st.cam) * Math.min(1, dt * 4); }
    st.cam = clamp(st.cam, 0, Math.max(0, M.worldW - st.W));
    const s = mapSeasonAt(st.cam + st.W / 2); const ps = st.parts;
    if (s === 'inverno' && rnd() < dt * 22) ps.push(P({ k: 'snow', x: st.cam + rnd() * st.W, y: -(st.Hh - H) - 4, vy: 12 + rnd() * 10, life: 12, s: rnd() < .3 ? 2 : 1, c: '#FFFFFF' }));
    if (s === 'autunno' && rnd() < dt * 5) ps.push(P({ k: 'leaf', x: st.cam + rnd() * st.W, y: 20 + rnd() * 50, vy: 10, vx: -6, life: 10, c: ART.SEASON.autunno.leaf[Math.floor(rnd() * 4)] }));
    if (s === 'primavera' && rnd() < dt * 4) ps.push(P({ k: 'petal', x: st.cam + rnd() * st.W, y: 10 + rnd() * 50, vy: 8, vx: -5, life: 12, c: '#FFC2DA' }));
    if (s === 'estate' && rnd() < dt * .6) ps.push(P({ k: 'butterfly', x: st.cam + rnd() * st.W, y: GROUND - 30 - rnd() * 30, life: 8, c: ['#FFB0D9', '#FFE27A', '#9FDFFF'][Math.floor(rnd() * 3)] }));
    if (h.aura) emitAura(ps, h.aura, h.x, h.y - 30, dt, { cx: () => h.x, cy: () => h.y - 30 });
    M.actors.forEach(a => { if (a.boss && !a.boss.passed && rnd() < dt * 3) ps.push(P({ k: 'spark', x: a.x + (rnd() - .5) * 26, y: a.y - 20 - rnd() * 30, vy: -6, life: .9, c: '#B57CFF' })); });
    stepParts(ps, dt); if (ps.length > 500) ps.splice(0, ps.length - 500);
  }
  function mapDraw(st, g) {
    const cam = st.cam, tk = ART.timeKey() === 'night' ? 'night' : 'day';
    const sMid = mapSeasonAt(cam + st.W / 2);
    drawBackdrop(st, g, sMid, tk, { birds: true });
    // suolo per segmenti stagionali (tile diverse)
    for (let sx = 0; sx < st.W; sx += 8) { const s = mapSeasonAt(cam + sx); const tile = groundTile(s, tk); const off = ((cam + sx) % tile.width + tile.width) % tile.width; const w = Math.min(8, tile.width - off); g.drawImage(tile, off, 0, w, tile.height, sx, GROUND - 22, w, tile.height); if (w < 8) g.drawImage(tile, 0, 0, 8 - w, tile.height, sx + w, GROUND - 22, 8 - w, tile.height); }
    // regni: archi d'ingresso e stendardi
    for (const r of M.realms) {
      const col = r.s === 'inv' ? ['#BFE6FF', '#7FB8E8', '#FFFFFF'] : r.s === 'est' ? ['#FFD36E', '#FF9E5C', '#FFF4C8'] : ['#F7963C', '#C8572E', '#FFD25E'];
      // velo colorato sul regno
      const x1 = r.x1 - cam, x2 = r.x2 - cam; if (x2 < -60 || x1 > st.W + 60) continue;
      g.fillStyle = r.s === 'inv' ? 'rgba(200,232,255,.18)' : r.s === 'est' ? 'rgba(255,214,120,.14)' : 'rgba(247,150,60,.12)'; g.fillRect(x1, GROUND - 90, x2 - x1, 90);
      for (const gx of [x1, x2]) { // porte del regno
        g.fillStyle = '#6E5A7E'; g.fillRect(gx - 12, GROUND - 52, 5, 48); g.fillRect(gx + 7, GROUND - 52, 5, 48);
        g.fillStyle = col[1]; for (let i = 0; i < 26; i++) { const yy = GROUND - 56 - Math.round(Math.sin(i / 25 * Math.PI) * 10); g.fillRect(gx - 13 + i, yy, 1, 5); }
        g.fillStyle = col[2]; for (let i = 0; i < 26; i++) { const yy = GROUND - 56 - Math.round(Math.sin(i / 25 * Math.PI) * 10); g.fillRect(gx - 13 + i, yy, 1, 1); }
        for (let k = 0; k < 2; k++) { const fx = gx - 10 + k * 19, fy = GROUND - 46; g.fillStyle = col[0]; for (let yy = 0; yy < 14; yy++) g.fillRect(fx + Math.round(Math.sin(st.t * 3 + yy * .5) * .6), fy + yy, 2, 1); }
      }
      const label = r.name; const lx = Math.max(x1 + 16, Math.min(x2 - textW(label, 2) - 16, st.W / 2 - textW(label, 2) / 2));
      if (x2 - x1 > 120) text(g, label, lx, GROUND - 120, col[2], 2, 'rgba(40,24,60,.75)');
    }
    for (const s of M.sems) { const x1 = s.x1 - cam, x2 = s.x2 - cam; if (x2 < 0 || x1 > st.W) continue; const lx = clamp(st.W / 2 - textW(s.name) / 2, x1 + 6, x2 - textW(s.name) - 6); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x1, GROUND - 100, x2 - x1, 1); text(g, s.name, lx, GROUND - 108, '#FFFFFF'); }
    // alberi
    for (const e of M.ents) { const x = Math.round(e.x - cam); if (x > st.W || x + e.w < 0) continue; g.drawImage(e.spr, x, Math.round(e.y)); }
    // cartelli dei mesi
    for (let m = 0; m < 12; m++) {
      const d = iso(new Date(M.ay + (m >= 3 ? 1 : 0), (9 + m) % 12, 1)); const x = Math.round(M.xOf(d) - cam); if (x < -30 || x > st.W + 30) continue;
      g.fillStyle = '#6E4226'; g.fillRect(x, GROUND - 26, 2, 22); g.fillStyle = '#D99A5E'; g.fillRect(x - 12, GROUND - 32, 26, 10); g.fillStyle = '#B07A48'; g.fillRect(x - 12, GROUND - 23, 26, 1); g.fillStyle = '#2A1E3A'; g.fillRect(x - 13, GROUND - 33, 28, 1); g.fillRect(x - 13, GROUND - 22, 28, 1); g.fillRect(x - 13, GROUND - 32, 1, 10); g.fillRect(x + 14, GROUND - 32, 1, 10);
      const lab = MESI_S[(9 + m) % 12]; text(g, lab, x + 1 - textW(lab) / 2, GROUND - 30, '#2A1E3A', 1, null);
    }
    // segnalino di oggi
    const tx = Math.round(M.xOf(today()) - cam); if (tx > -20 && tx < st.W + 20) { g.fillStyle = 'rgba(255,226,122,.35)'; g.fillRect(tx - 1, GROUND - 140, 2, 140); text(g, 'OGGI', tx - textW('OGGI') / 2 + 1, GROUND - 148, '#FFE27A'); }
    // boss
    for (const a of M.actors) {
      const x = Math.round(a.x - cam); if (x < -60 || x > st.W + 60) continue; const bb = a.boss; const bs = bossState(bb.e);
      g.fillStyle = 'rgba(40,20,60,.3)'; g.fillRect(x - 12, GROUND - 2, 24, 3);
      if (bb.passed) g.globalAlpha = .45;
      // aura minacciosa
      if (!bb.passed) lightAt(g, x, GROUND - 28, 22, '#9B5CFF', .5 + Math.sin(st.t * 3 + a.x) * .2);
      drawActor(g, a, cam); g.globalAlpha = 1;
      // barra vita e bandiera dell'esame
      const hp = bb.passed ? 0 : bs.hp; const bw = 30; const by = GROUND - 78;
      g.fillStyle = '#2A1E3A'; g.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 5); g.fillStyle = '#5A2A3A'; g.fillRect(x - bw / 2, by, bw, 3); g.fillStyle = hp > .5 ? '#FF5C6A' : hp > .2 ? '#FFB347' : '#7BE27A'; g.fillRect(x - bw / 2, by, Math.round(bw * hp), 3); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - bw / 2, by, Math.round(bw * hp), 1);
      g.fillStyle = colorOf(bb.e); g.fillRect(x - bw / 2 - 1, by - 9, bw + 2, 7); g.fillStyle = '#FFFFFF'; const dd = pd(bb.d); const lab = `${dd.getDate()} ${MESI_S[dd.getMonth()]}`; text(g, lab, x - textW(lab) / 2, by - 8, '#FFFFFF', 1, 'rgba(0,0,0,.35)');
      if (bb.passed) { text(g, 'VINTO', x - textW('VINTO') / 2, by - 18, '#7BE27A'); }
    }
    // eroe e compagni
    for (const a of [...M.follow].reverse()) { g.fillStyle = 'rgba(40,30,60,.22)'; g.fillRect(Math.round(a.x - cam - 8), GROUND - 2, 16, 3); drawActor(g, a, cam); }
    const h = M.hero; g.fillStyle = 'rgba(40,30,60,.22)'; g.fillRect(Math.round(h.x - cam - 9), GROUND - 2, 18, 3); drawActor(g, h, cam);
    for (const p of st.parts) drawPart(g, p, cam);
    nightOverlay(st, g, tk);
    drawTiled(g, fgStrip(sMid, tk), cam * 1.25, H - 22, st.W);
  }
  function mapTap(st, wx, wy) {
    const a = M.actors.find(a => Math.abs(a.x - wx) < 16 && wy > GROUND - 90 && wy < GROUND + 4);
    if (a) { const bb = a.boss; M.followCam = true; const h = M.hero; h.tx = clamp(a.x - 30, h.min, h.max); h.state = 'walk'; h.onArrive = () => { h.dir = 1; act('boss', { id: bb.e.id, d: bb.d }); }; return; }
    const h = M.hero; h.tx = clamp(wx, h.min, h.max); h.state = 'walk'; h.onArrive = null; M.followCam = true;
  }
  function mountMap(canvas) {
    if (M.st) M.st.stop();
    const st = Stage(canvas, { update: mapUpdate, draw: mapDraw, minW: 250 }); M.st = st;
    buildMap(); st.resize(); st.cam = clamp(M.hero.x - st.W / 2, 0, Math.max(0, M.worldW - st.W)); M.followCam = false;
    let down = null;
    canvas.onpointerdown = ev => { down = { x: ev.clientX, cam: st.cam, moved: false }; canvas.setPointerCapture(ev.pointerId); AUDIO.unlock(); };
    canvas.onpointermove = ev => { if (!down) return; const dx = ev.clientX - down.x; if (Math.abs(dx) > 6) down.moved = true; if (down.moved) { M.followCam = false; const dpr = Math.min(3, window.devicePixelRatio || 1); st.cam = clamp(down.cam - dx * dpr / st.K, 0, Math.max(0, M.worldW - st.W)); } };
    canvas.onpointerup = ev => { if (!down) return; const d = down; down = null; if (!d.moved) { const w = st.toWorld(ev.clientX, ev.clientY); mapTap(st, w.x, w.y); } };
    canvas.onwheel = ev => { ev.preventDefault(); M.followCam = false; st.cam = clamp(st.cam + (ev.deltaX || ev.deltaY) / st.K, 0, Math.max(0, M.worldW - st.W)); };
    st.start(); return st;
  }
  function mapGoto(d) { if (!M.st) return; M.followCam = false; const target = clamp(M.xOf(d) - M.st.W / 2, 0, Math.max(0, M.worldW - M.st.W)); const from = M.st.cam; const t0 = performance.now(); const step = now => { const k = Math.min(1, (now - t0) / 600); M.st.cam = from + (target - from) * (1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }
  function mapHeroToday() { if (!M.st) return; const h = M.hero; h.tx = clamp(M.xOf(today()), h.min, h.max); h.state = 'walk'; M.followCam = true; }

  /* ================== SCENA DI STUDIO ================== */
  const SS = { st: null, hero: null, comp: null, sig: '' };
  function studyUpdate(st, dt) {
    const work = T.phase === 'work' && T.run, brk = T.phase === 'break';
    [SS.hero, SS.comp].forEach((a, i) => {
      if (!a) return;
      if (work) { if (a.state !== 'cast' && a.comp && a.comp.canCast) { a.state = 'cast'; a.f = 0; a.loopCast = true; a.castSide = true; } else if (!(a.comp && a.comp.canCast)) { a.state = 'idle'; a.face = 0; } }
      else { a.loopCast = false; if (a.state === 'cast') { a.state = 'idle'; } a.face = brk ? 9 : 0; }
      stepActor(a, dt, true);
    });
    const ps = st.parts; const cx = st.W / 2;
    if (work && rnd() < dt * 3) ps.push(P({ k: rnd() < .5 ? 'page' : 'spark', x: cx + st.cam + (rnd() - .5) * 20, y: GROUND - 24, vy: -10 - rnd() * 6, vx: (rnd() - .5) * 8, life: 2, c: ['#FFE27A', '#C7A6FF', '#9FDFFF'][Math.floor(rnd() * 3)] }));
    if (brk && rnd() < dt * 1.5) ps.push(P({ k: 'zz', x: (SS.comp ? SS.comp.x : cx + st.cam) + 6, y: GROUND - 62, vy: -6, vx: 3, life: 2.2, c: '#9FC3FF' }));
    if ((ART.timeKey() === 'night' || brk) && rnd() < dt * 2) ps.push(P({ k: 'fly', x: st.cam + rnd() * st.W, y: GROUND - 20 - rnd() * 60, life: 5, c: '#F4FF8A' }));
    if (SS.hero && SS.hero.aura) emitAura(ps, SS.hero.aura, SS.hero.x, SS.hero.y - 30, dt, { cx: () => SS.hero.x, cy: () => SS.hero.y - 30 });
    if (SS.comp && SS.comp.aura) emitAura(ps, SS.comp.aura, SS.comp.x, SS.comp.y - 30, dt, { cx: () => SS.comp.x, cy: () => SS.comp.y - 30 });
    const s = ART.themeKey(); if (s === 'inverno' && rnd() < dt * 14) ps.push(P({ k: 'snow', x: st.cam + rnd() * st.W, y: -(st.Hh - H), vy: 12, life: 12, c: '#FFFFFF' })); if (s === 'autunno' && rnd() < dt * 3) ps.push(P({ k: 'leaf', x: st.cam + rnd() * st.W, y: 20, vy: 9, vx: -4, life: 10, c: ART.SEASON.autunno.leaf[Math.floor(rnd() * 4)] }));
    stepParts(ps, dt); if (ps.length > 300) ps.splice(0, ps.length - 300);
    st.cam = 0;
  }
  function studyDraw(st, g) {
    const s = ART.themeKey(), tk = ART.timeKey();
    drawBackdrop(st, g, s, tk, { birds: false });
    drawGround(st, g, s, tk);
    const cx = Math.round(st.W / 2);
    // tappeto, libri e falò/lanterna tra i due
    g.fillStyle = '#B23A3A'; g.fillRect(cx - 34, GROUND - 3, 68, 5); g.fillStyle = '#E25C5C'; g.fillRect(cx - 34, GROUND - 3, 68, 1); for (let x = cx - 34; x < cx + 34; x += 4) { g.fillStyle = '#FFD34E'; g.fillRect(x, GROUND + 1, 2, 1); }
    const books = [['#4A9BD9', 8], ['#E0709A', 7], ['#3FAE8C', 9], ['#D9A62E', 6]]; let by = GROUND - 4; books.forEach(([c, w], i) => { g.fillStyle = c; g.fillRect(cx - 5 + (i % 2), by - 3, w + 2, 3); g.fillStyle = '#FFF4E0'; g.fillRect(cx - 4 + (i % 2), by - 2, w, 1); by -= 3; });
    const work = T.phase === 'work' && T.run;
    if (work) { const fl = Math.sin(st.t * 6) * .5 + .5; lightAt(g, cx + 1, by - 6, 14 + fl * 3, '#FFE27A', .9); g.fillStyle = '#FFF6B0'; g.fillRect(cx, by - 8 - Math.round(fl), 2, 3); }
    for (const a of [SS.hero, SS.comp]) if (a) { g.fillStyle = 'rgba(40,30,60,.22)'; g.fillRect(Math.round(a.x - 9), GROUND - 2, 18, 3); drawActor(g, a, 0); }
    for (const p of st.parts) drawPart(g, p, 0);
    nightOverlay(st, g, tk);
    if (tk === 'night' && work) lightAt(g, cx, GROUND - 20, 30, '#FFD27A', 1);
  }
  function mountStudy(canvas, exId) {
    if (SS.st) SS.st.stop();
    const st = Stage(canvas, { update: studyUpdate, draw: studyDraw, h: 100 }); SS.st = st; st.resize();
    const cx = st.W / 2;
    SS.hero = Actor({ x: cx - 30, dir: 1, castSide: true }); SS.hero.aura = S.profile.avatar.aura; SS.hero.load(lookOf('avatar').look);
    const e = exById(exId); const c = e && compById(e.comp);
    SS.comp = c ? Actor({ x: cx + 30, dir: -1, castSide: true }) : null;
    if (SS.comp) { SS.comp.aura = c.aura; SS.comp.load(lookOf(c.id, moodOfExam(e)).look); }
    st.start(); return st;
  }
  function resizeAll() { [V.st, M.st, SS.st].forEach(s => { if (s && s.run) s.resize(); }); }
  function stopAll() { [V.st, M.st, SS.st].forEach(s => s && s.stop()); }
  window.addEventListener('resize', () => { clearTimeout(WORLD._rt); WORLD._rt = setTimeout(resizeAll, 120); });

  /* ================== ANTEPRIMA (guardaroba, celebrazioni) ================== */
  function mountPreview(canvas, getLook, opts = {}) {
    const st = Stage(canvas, {
      h: opts.h || 110,
      update(st, dt) {
        const a = st.actor; if (!a) return; st.cam = 0; a.x = st.W / 2; a.y = GROUND;
        st.phaseT = (st.phaseT || 0) + dt; const ph = Math.floor(st.phaseT / 2.6) % 4;
        a.ft += dt; if (a.ft > (ph === 3 ? .11 : .1)) { a.ft = 0; a.f++; }
        a.view = ph === 0 ? ['walkD', 0, false] : ph === 1 ? ['walkR', a.f % 9, false] : ph === 2 ? ['walkR', a.f % 9, true] : ['castD', a.f % 7, false];
        if (a.aura) emitAura(st.parts, a.aura, a.x, a.y - 30, dt, { cx: () => a.x, cy: () => a.y - 30 });
        if (opts.burst && Math.random() < dt * 8) st.parts.push(P({ k: Math.random() < .5 ? 'star' : 'spark', x: a.x + (Math.random() - .5) * 70, y: a.y - 20 - Math.random() * 60, vy: -6, life: 1.2, c: ['#FFE27A', '#FFFFFF', opts.burst][Math.floor(Math.random() * 3)] }));
        stepParts(st.parts, dt);
      },
      draw(st, g) {
        const a = st.actor;
        if (opts.bg !== false) { const s = ART.themeKey(), tk = ART.timeKey(); drawBackdrop(st, g, s, tk, { birds: false }); drawGround(st, g, s, tk); nightOverlay(st, g, tk); }
        if (!a || !a.comp) return;
        g.fillStyle = 'rgba(40,30,60,.25)'; g.fillRect(Math.round(a.x - 10), GROUND - 2, 20, 3);
        const [anim, fr, flip] = a.view || ['walkD', 0, false];
        SPR.draw(g, a.comp, anim, fr, Math.round(a.x - 64), Math.round(a.y - 95), 1, flip);
        for (const p of st.parts) drawPart(g, p, 0);
      }
    });
    st.actor = Actor({});
    st.setLook = (look, aura) => { st.actor.aura = aura; st.actor.load(look); };
    const l = getLook(); st.setLook(l.look, l.aura);
    st.start(); return st;
  }

  return { mountVillage, refreshVillage, focusExam, mountMap, mapGoto, mapHeroToday, mountStudy, mountPreview, stopAll, closeDialog, rewardName, text, textW, H, GROUND, V, M };
})();
