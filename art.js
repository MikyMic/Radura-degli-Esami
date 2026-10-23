/* ============ Pixel art procedurale: edifici, alberi, decorazioni, icone ============ */
const ART = (() => {
  const OUT = [28, 20, 36];
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  function rng(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const toHex = a => '#' + a.map(x => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const ramp = b => ({ hi: mix(mix(b, '#FFF6D8', .5), '#FFFFFF', .15), lt: mix(b, '#FFF1C8', .25), b, dk: mix(mix(b, '#3A2A6B', .3), '#000000', .08), xd: mix(mix(b, '#2A1B4F', .52), '#000000', .15) });
  function outline(src, col = OUT) {
    const w = src.width, h = src.height, c = cv(w + 2, h + 2), g = c.getContext('2d'); g.drawImage(src, 1, 1);
    const id = g.getImageData(0, 0, w + 2, h + 2), d = id.data, o = new Uint8ClampedArray(d);
    for (let y = 0; y < h + 2; y++) for (let x = 0; x < w + 2; x++) {
      const i = (y * (w + 2) + x) * 4; if (d[i + 3] > 40) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w + 2 || yy >= h + 2) continue; if (d[(yy * (w + 2) + xx) * 4 + 3] > 40) { o[i] = col[0]; o[i + 1] = col[1]; o[i + 2] = col[2]; o[i + 3] = 255; break; } }
    }
    id.data.set(o); g.putImageData(id, 0, 0); return c;
  }
  function P(g) { // helper di disegno a pixel
    return {
      g,
      px(x, y, c) { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); },
      r(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); },
      disc(cx, cy, r, c) { g.fillStyle = c; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + r * .6)); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } },
      ell(cx, cy, rx, ry, c) { g.fillStyle = c; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + .01)))); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } },
      ball(cx, cy, r, base) { const R = ramp(base); for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const dd = x * x + y * y; if (dd > r * r + r * .6) continue; const lit = (x + y * 1.2) / r; g.fillStyle = lit < -.95 && dd < r * r * .45 ? R.hi : lit < -.35 ? R.lt : lit > .75 ? R.dk : R.b; g.fillRect(cx + x, cy + y, 1, 1); } },
      tri(x1, y1, x2, y2, x3, y3, c) { g.fillStyle = c; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x3, y3); g.closePath(); g.fill(); },
      line(x0, y0, x1, y1, c) { g.fillStyle = c; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1); }
    };
  }
  function snapAlpha(c) { const g = c.getContext('2d'); const id = g.getImageData(0, 0, c.width, c.height); const d = id.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.putImageData(id, 0, 0); return c; }
  function make(w, h, fn, ol = true) { const c = cv(w, h); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(P(g), g); snapAlpha(c); return ol ? outline(c) : c; }

  /* ---------- Palette stagionali ---------- */
  const SEASON = {
    primavera: { leaf: ['#C6F08A', '#7FCB5A', '#4FA348', '#2F7A3E'], grass: ['#B6EC86', '#86D065', '#5DB04E', '#3C8E3F'], flower: ['#FF8FB8', '#FFFFFF', '#FFD34E', '#C7A6FF'], blossom: '#FFC2DA', trunk: ['#A87A54', '#6E4A32'], ground: '#E9D3A5', far: ['#A9D9C8', '#8CC6B2'] },
    estate: { leaf: ['#A8E26A', '#5DBB4C', '#3A9140', '#246A36'], grass: ['#A6E073', '#74C451', '#4FA142', '#337D36'], flower: ['#FF6F91', '#FFD34E', '#FFFFFF', '#5CC8FF'], blossom: null, trunk: ['#9C6B44', '#64412A'], ground: '#EBCB8F', far: ['#9ECFB8', '#7FBBA2'] },
    autunno: { leaf: ['#FFD25E', '#F7963C', '#D9572E', '#8E3328'], grass: ['#CFD879', '#A9BE5A', '#869C45', '#62773A'], flower: ['#FF9E5C', '#FFD34E', '#E85C6A', '#FFFFFF'], blossom: null, trunk: ['#8C5B3A', '#5A3A26'], ground: '#E2BE85', far: ['#D8B98E', '#C39E77'] },
    inverno: { leaf: ['#F4FAFF', '#CFE6F5', '#9FC3DB', '#5F84A6'], grass: ['#FFFFFF', '#E3F1FA', '#C3DCEC', '#9DBBD3'], flower: ['#FFFFFF', '#CFEFFF', '#FFE27A', '#FF8FB8'], blossom: null, trunk: ['#7C6658', '#4E3E36'], ground: '#DCE9F2', far: ['#C8D9E8', '#A9C0D6'], snow: true },
    ciliegi: { leaf: ['#FFE0EC', '#FFB7D0', '#F07AA6', '#B84A7A'], grass: ['#C9F09A', '#93D46C', '#68B556', '#438F44'], flower: ['#FF8FB8', '#FFFFFF', '#FFD1E3', '#FFD34E'], blossom: '#FFD1E3', trunk: ['#9A6A5C', '#5E3F3A'], ground: '#F2D9B8', far: ['#E7C6D9', '#CFA6C4'] },
    lavanda: { leaf: ['#C9F2E0', '#82D6B6', '#4FB094', '#2E7F72'], grass: ['#B5E9D2', '#86D2B6', '#5EB89C', '#3D9480'], flower: ['#C7A6FF', '#FF9EE5', '#FFFFFF', '#8FD3FF'], blossom: '#D8C6FF', trunk: ['#8D6A8E', '#5A4362'], ground: '#EBD8F0', far: ['#C1B2EA', '#A596DB'] }
  };
  const SKY = {
    day: ['#5FB7F2', '#79C4F5', '#94D0F7', '#AFDCF9', '#C9E8FA', '#E2F2F8', '#F4F6E9'],
    dayWinter: ['#8FC3E8', '#A3CFEC', '#B7DBF0', '#CAE5F3', '#DCEEF6', '#ECF5F8', '#F6F9FA'],
    dayAutumn: ['#6FB4E6', '#88C1EA', '#A2CEEC', '#BEDBEA', '#D9E4E2', '#EEE8D6', '#F8EAD0'],
    sunset: ['#6C5BC8', '#9A6BD0', '#C77DCB', '#EE90B8', '#FDA9A0', '#FFC59A', '#FFE0A8'],
    lavanda: ['#9E8CF2', '#B3A3F7', '#C9BCFB', '#DCD2FD', '#ECE4FD', '#F7EDFB', '#FFF0F4'],
    night: ['#1E1A55', '#29236B', '#35297F', '#463191', '#5A3A9E', '#7546A6', '#9A58AE']
  };
  function themeKey() {
    const t = S.profile.theme.world;
    if (t === 'auto') return seasonOf();
    if (t === 'tramonto') return seasonOf();
    return t;
  }
  function timeKey() {
    const dark = document.documentElement.dataset.mode === 'dark';
    if (dark) return 'night';
    if (S.profile.theme.world === 'tramonto') return 'sunset';
    const h = new Date().getHours(); if (h >= 21 || h < 6) return 'night'; if (h >= 18 || h < 7) return 'sunset';
    return 'day';
  }

  /* ---------- Alberi ---------- */
  function tree(kind, season, seed = 1, scale = 1) {
    const S2 = SEASON[season] || SEASON.estate; const R = rng(seed);
    const W = Math.round(46 * scale), H = Math.round(60 * scale);
    return make(W, H, p => {
      const [t1, t2] = S2.trunk; const cx = W / 2 | 0;
      if (kind === 'pine') {
        p.r(cx - 2, H - 14, 5, 14, t2); p.r(cx - 2, H - 14, 2, 14, t1);
        const L = season === 'inverno' ? ['#E9F4FB', '#BFD7E8', '#6E9AB3', '#3E6A86'] : season === 'autunno' ? ['#9ACB6A', '#4E9A50', '#2F7442', '#1F5136'] : ['#9ADB72', '#4FA352', '#2F7A44', '#1E5536'];
        for (let i = 0; i < 4; i++) {
          const y0 = Math.round(H * .08 + i * H * .17), hh = Math.round(H * .3), w = Math.round(W * (.24 + i * .1));
          for (let k = 0; k < hh; k++) { const ww = Math.round(w * k / hh); p.r(cx - ww, y0 + k, ww * 2 + 1, 1, L[2]); p.r(cx - ww, y0 + k, Math.max(1, ww), 1, L[1]); if (k < 2) p.r(cx - ww, y0 + k, ww * 2 + 1, 1, L[0]); }
          if (season === 'inverno') for (let k = 0; k < w; k += 2) p.px(cx - w + k + 1, y0 + hh - 1 - (k % 4 === 0 ? 1 : 0), '#FFFFFF');
        }
        p.r(cx - 1, Math.round(H * .04), 3, 3, L[0]);
      } else if (kind === 'bare') {
        p.r(cx - 2, H * .45, 5, H * .55, t2); p.r(cx - 2, H * .45, 2, H * .55, t1);
        const br = (x, y, dx, dy, n) => { for (let i = 0; i < n; i++) { p.px(x, y, t2); x += dx; y += dy; if (R() < .3) dx = -dx * .5 + (R() - .5); } };
        for (let i = 0; i < 7; i++) br(cx, H * .5 - i * 3, (R() < .5 ? -1 : 1) * (0.6 + R()), -1, 8 + R() * 8 | 0);
        for (let i = 0; i < 26; i++) p.px(cx - 14 + R() * 28, H * .1 + R() * H * .35, '#FFFFFF');
      } else {
        const [l0, l1, l2, l3] = S2.leaf;
        p.r(cx - 3, H - 22, 7, 22, t2); p.r(cx - 3, H - 22, 3, 22, t1); p.px(cx - 5, H - 1, t2); p.px(cx + 4, H - 1, t2);
        const blobs = [[cx - 11, H * .45, 11], [cx + 11, H * .45, 11], [cx, H * .3, 15], [cx - 4, H * .5, 10], [cx + 5, H * .2, 8]];
        blobs.forEach(([x, y, r]) => { const rr = Math.round(r * scale * .95); for (let yy = -rr; yy <= rr; yy++) for (let xx = -rr; xx <= rr; xx++) { const dd = xx * xx + yy * yy; if (dd > rr * rr + rr * .5) continue; const lit = (xx + yy * 1.15) / rr; p.px(x + xx, y + yy, lit < -.9 && dd < rr * rr * .4 ? l0 : lit < -.2 ? l1 : lit > .7 ? l3 : l2); } });
        for (let i = 0; i < 40; i++) { const a = R() * 6.28, r = R() * 14 * scale; const x = cx + Math.cos(a) * r * 1.2, y = H * .35 + Math.sin(a) * r * .8; p.px(x, y, R() < .5 ? l3 : l0); }
        if (S2.blossom || season === 'primavera') for (let i = 0; i < 22; i++) { const a = R() * 6.28, r = R() * 15 * scale; p.px(cx + Math.cos(a) * r * 1.2, H * .35 + Math.sin(a) * r * .8, S2.blossom || '#FFC2DA'); }
        if (season === 'estate' && R() < .5) for (let i = 0; i < 6; i++) { const a = R() * 6.28, r = R() * 12; const x = cx + Math.cos(a) * r, y = H * .38 + Math.sin(a) * r * .7; p.px(x, y, '#E8443F'); p.px(x + 1, y, '#FF8A80'); }
      }
    });
  }
  function bush(season, seed = 2) {
    const S2 = SEASON[season] || SEASON.estate; const R = rng(seed);
    return make(22, 13, p => {
      const [l0, l1, l2, l3] = S2.leaf;
      [[6, 7, 6], [14, 6, 7], [10, 5, 5]].forEach(([x, y, r]) => { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const dd = xx * xx + yy * yy; if (dd > r * r) continue; if (y + yy > 12) continue; const lit = (xx + yy) / r; p.px(x + xx, y + yy, lit < -.8 ? l0 : lit < -.1 ? l1 : lit > .6 ? l3 : l2); } });
      for (let i = 0; i < 6; i++) p.px(3 + R() * 16, 3 + R() * 7, S2.flower[i % 4]);
    });
  }

  /* ---------- Case che crescono ---------- */
  const HOUSE_NAMES = ['Tenda', 'Capanna', 'Casetta', 'Villa con torre', 'Castello'];
  function houseStage(L) { return L >= 18 ? 4 : L >= 12 ? 3 : L >= 6 ? 2 : L >= 2 ? 1 : 0; }
  function house(stage, roofHex, season, night, seed = 3) {
    const roof = ramp(roofHex); const snow = season === 'inverno';
    const wall = ['#FFF4E0', '#F2DDBB', '#D9BC93'], wood = ['#C98B55', '#9A6236', '#6B4226'], stone = ['#E3DDEA', '#BDB4CC', '#8E86A3'];
    const win = night ? ['#FFE7A3', '#FFC94D'] : ['#BDEBFF', '#7FC8EE'];
    const R = rng(seed);
    if (stage === 0) return make(52, 40, p => { // tenda
      for (let y = 0; y < 34; y++) { const w = Math.round(y * .78); p.r(26 - w, y + 4, w * 2 + 1, 1, y % 7 === 6 ? roof.dk : roof.b); p.r(26, y + 4, w + 1, 1, y % 7 === 6 ? roof.xd : roof.dk); }
      for (let y = 4; y < 38; y += 7) p.line(26, 4, 26 - 26, 38, roof.lt);
      p.tri(19, 38, 26, 18, 33, 38, '#3E2B3A'); p.tri(21, 38, 26, 22, 31, 38, night ? '#FFB84D' : '#5A4252');
      p.r(25, 0, 2, 6, wood[2]); p.tri(27, 0, 34, 2, 27, 4, roof.lt);
      if (snow) for (let y = 4; y < 20; y++) { const w = Math.round(y * .78); p.px(26 - w, y + 4, '#FFFFFF'); p.px(26 + w, y + 4, '#FFFFFF'); }
      p.r(2, 38, 48, 2, '#00000000');
    });
    if (stage === 1) return make(60, 52, p => { // capanna
      p.r(8, 26, 44, 24, wood[0]); for (let y = 26; y < 50; y += 4) p.r(8, y, 44, 1, wood[1]); p.r(8, 26, 3, 24, wood[1]); p.r(49, 26, 3, 24, wood[2]);
      p.r(25, 33, 11, 17, wood[2]); p.r(26, 34, 9, 16, '#4A2E22'); p.px(33, 42, '#FFD34E');
      p.r(13, 31, 8, 7, wood[2]); p.r(14, 32, 6, 5, win[0]); p.r(14, 32, 3, 2, win[1]);
      for (let y = 0; y < 26; y++) { const inset = Math.max(0, 22 - y); p.r(inset + 3, y + 2, 54 - inset * 2, 1, y % 5 === 4 ? roof.dk : roof.b); if (y % 5 === 4) for (let x = inset + 5; x < 54 - inset; x += 4) p.px(x, y + 2, roof.xd); }
      for (let y = 0; y < 26; y++) p.px(Math.max(0, 22 - y) + 3, y + 2, roof.lt);
      if (snow) { for (let x = 5; x < 56; x++) { const yy = 2 + Math.max(0, 22 - Math.min(x - 3, 54 - x + 3)); } p.r(4, 26, 52, 2, '#FFFFFF'); for (let y = 0; y < 22; y++) { p.px(Math.max(0, 22 - y) + 3, y + 2, '#FFFFFF'); p.px(57 - Math.max(0, 22 - y), y + 2, '#FFFFFF'); } }
    });
    if (stage === 2) return make(70, 64, p => { // casetta
      p.r(8, 30, 54, 32, wall[0]); p.r(8, 56, 54, 6, wall[1]); p.r(8, 30, 3, 32, wood[1]); p.r(59, 30, 3, 32, wood[1]); p.r(8, 42, 54, 2, wood[1]);
      p.r(29, 40, 12, 22, wood[2]); p.r(30, 41, 10, 21, wood[0]); p.r(30, 41, 10, 3, wood[1]); p.px(38, 52, '#FFD34E'); p.r(29, 62, 12, 2, stone[2]);
      [[14, 36], [46, 36], [14, 48], [46, 48]].forEach(([x, y]) => { p.r(x - 1, y - 1, 11, 9, wood[2]); p.r(x, y, 9, 7, win[0]); p.r(x, y, 4, 3, win[1]); p.r(x + 4, y, 1, 7, wood[2]); p.r(x - 2, y + 7, 13, 2, wood[1]); p.r(x, y + 9, 9, 2, '#FF8FB8'); p.px(x + 2, y + 9, '#FFFFFF'); p.px(x + 6, y + 10, '#FFD34E'); });
      for (let y = 0; y < 30; y++) { const inset = Math.max(0, 26 - y); p.r(inset + 2, y + 2, 66 - inset * 2, 1, y % 5 === 4 ? roof.dk : (y < 10 ? roof.lt : roof.b)); if (y % 5 === 2) for (let x = inset + 4 + (y % 10 === 2 ? 2 : 0); x < 66 - inset; x += 5) p.r(x, y + 2, 1, 2, roof.dk); }
      p.r(48, 4, 7, 14, stone[1]); p.r(48, 4, 7, 2, stone[2]); p.r(48, 4, 2, 14, stone[0]);
      if (snow) { p.r(2, 30, 66, 2, '#FFFFFF'); for (let y = 0; y < 26; y++) { const inset = Math.max(0, 26 - y); p.px(inset + 2, y + 2, '#FFFFFF'); p.px(67 - inset, y + 2, '#FFFFFF'); } p.r(47, 3, 9, 2, '#FFFFFF'); }
    });
    if (stage === 3) return make(84, 92, p => { // villa con torre
      // torre
      p.r(56, 22, 22, 68, stone[0]); for (let y = 24; y < 90; y += 6) for (let x = (y / 6) % 2 ? 57 : 60; x < 77; x += 7) p.r(x, y, 5, 1, stone[1]); p.r(75, 22, 3, 68, stone[2]);
      p.r(62, 34, 9, 12, wood[2]); p.r(63, 35, 7, 10, win[0]); p.ell(66, 35, 3, 3, win[0]); p.r(63, 39, 7, 1, wood[2]);
      p.r(62, 58, 9, 10, wood[2]); p.r(63, 59, 7, 8, win[0]);
      for (let y = 0; y < 22; y++) { const w = Math.round(y * .62); p.r(67 - w, y, w * 2 + 1, 1, y % 5 === 4 ? roof.dk : roof.b); p.r(67, y, w + 1, 1, roof.dk); }
      p.r(66, 0, 2, 2, '#FFD34E');
      // casa
      p.r(4, 46, 54, 44, wall[0]); p.r(4, 84, 54, 6, wall[1]); p.r(4, 46, 3, 44, wood[1]); p.r(4, 60, 54, 2, wood[1]);
      p.r(24, 64, 13, 26, wood[2]); p.ell(30, 64, 6, 4, wood[2]); p.r(25, 65, 11, 25, wood[0]); p.ell(30, 65, 5, 3, wood[0]); p.px(34, 77, '#FFD34E');
      [[9, 51], [42, 51], [9, 68], [42, 68]].forEach(([x, y]) => { p.r(x - 1, y - 1, 11, 9, wood[2]); p.r(x, y, 9, 7, win[0]); p.r(x, y, 4, 3, win[1]); p.r(x + 4, y, 1, 7, wood[2]); p.r(x - 2, y + 7, 13, 2, wood[1]); });
      for (let y = 0; y < 24; y++) { const inset = Math.max(0, 22 - y); p.r(inset, y + 24, 60 - inset * 2, 1, y % 5 === 4 ? roof.dk : (y < 8 ? roof.lt : roof.b)); }
      // bandiera
      p.r(66, -2, 1, 1, wood[2]);
      if (snow) { p.r(0, 46, 60, 2, '#FFFFFF'); for (let y = 0; y < 22; y++) { const w = Math.round(y * .62); p.px(67 - w, y, '#FFFFFF'); p.px(67 + w, y, '#FFFFFF'); } }
    });
    return make(112, 104, p => { // castello
      const st = stone;
      p.r(14, 40, 84, 62, st[0]); for (let y = 42; y < 102; y += 6) for (let x = (y / 6) % 2 ? 15 : 18; x < 97; x += 7) p.r(x, y, 5, 1, st[1]); p.r(95, 40, 3, 62, st[2]);
      for (let x = 14; x < 98; x += 8) p.r(x, 34, 5, 6, st[0]);
      [[0, 22], [92, 22]].forEach(([x, y]) => { p.r(x, y, 20, 80, st[0]); for (let yy = y + 2; yy < 102; yy += 6) for (let xx = x + ((yy / 6) % 2 ? 1 : 4); xx < x + 19; xx += 7) p.r(xx, yy, 5, 1, st[1]); p.r(x + 17, y, 3, 80, st[2]); for (let i = 0; i < 4; i++) p.r(x + i * 5, y - 6, 3, 6, st[0]); p.r(x + 6, y + 18, 7, 11, '#3E2B4A'); p.ell(x + 9, y + 18, 3, 3, '#3E2B4A'); p.r(x + 7, y + 19, 5, 10, win[0]); });
      [[0, 0], [92, 0]].forEach(([x]) => { for (let y = 0; y < 16; y++) { const w = Math.round(y * .66); p.r(x + 10 - w, y, w * 2 + 1, 1, y % 5 === 4 ? roof.dk : roof.b); p.r(x + 10, y, w + 1, 1, roof.dk); } });
      p.r(42, 66, 28, 36, '#3E2B4A'); p.ell(56, 66, 14, 10, '#3E2B4A'); p.r(45, 68, 22, 34, wood[1]); p.ell(56, 68, 11, 8, wood[1]); for (let x = 47; x < 66; x += 4) p.r(x, 62, 1, 40, wood[2]);
      [[28, 50], [78, 50]].forEach(([x, y]) => { p.r(x, y, 8, 12, '#3E2B4A'); p.ell(x + 4, y, 4, 3, '#3E2B4A'); p.r(x + 1, y + 1, 6, 11, win[0]); });
      p.r(54, 8, 4, 26, st[1]); p.r(56, 6, 1, 4, wood[2]);
      if (snow) { p.r(14, 34, 84, 1, '#FFFFFF'); for (let x = 14; x < 98; x += 8) p.r(x, 33, 5, 1, '#FFFFFF'); [[0], [92]].forEach(([x]) => { for (let i = 0; i < 4; i++) p.r(x + i * 5, 15, 3, 1, '#FFFFFF'); }); }
    });
  }
  function flag(col, t) { // bandierina animata
    return make(14, 10, p => { const R = ramp(col); for (let x = 0; x < 12; x++) { const dy = Math.round(Math.sin(t * 4 + x * .6) * 1.2); p.r(x, 1 + dy, 1, 6, x % 3 === 0 ? R.dk : R.b); p.px(x, 1 + dy, R.lt); } }, true);
  }

  /* ---------- Edifici speciali ---------- */
  function hall(season, night) { // Sala degli Eroi (Albo)
    const st = ['#F3EEF9', '#D2C8E6', '#A396C2'], gold = ['#FFE27A', '#F2B33D', '#B97A1F'], snow = season === 'inverno';
    return make(104, 84, p => {
      p.r(6, 76, 92, 8, st[1]); p.r(2, 80, 100, 4, st[2]);
      p.r(12, 34, 80, 44, st[0]);
      for (let i = 0; i < 6; i++) { const x = 16 + i * 14; p.r(x, 38, 7, 38, '#FFFFFF'); p.r(x + 5, 38, 2, 38, st[1]); p.r(x - 1, 36, 9, 3, st[1]); p.r(x - 1, 74, 9, 3, st[1]); }
      p.r(44, 52, 16, 26, '#4B3366'); p.ell(52, 52, 8, 6, '#4B3366'); p.r(46, 54, 12, 24, night ? '#FFD86E' : '#7A5AA0'); p.ell(52, 54, 6, 4, night ? '#FFD86E' : '#7A5AA0');
      p.tri(4, 34, 52, 6, 100, 34, gold[1]); p.tri(10, 32, 52, 10, 94, 32, gold[0]); p.r(4, 32, 96, 4, gold[2]);
      p.disc(52, 22, 5, '#FFFFFF'); p.disc(52, 22, 3, gold[1]); p.px(51, 21, '#FFFFFF');
      if (snow) { for (let x = 4; x < 100; x++) { const y = 34 - Math.round((48 - Math.abs(x - 52)) * 28 / 48); p.px(x, y, '#FFFFFF'); p.px(x, y + 1, '#FFFFFF'); } }
    });
  }
  function shop(season, night) { // Bottega
    const wood = ['#D99A5E', '#A86A3A', '#6E4226'], snow = season === 'inverno';
    return make(86, 76, p => {
      p.r(6, 30, 74, 44, wood[0]); for (let y = 30; y < 74; y += 5) p.r(6, y, 74, 1, wood[1]);
      p.r(6, 30, 3, 44, wood[2]); p.r(77, 30, 3, 44, wood[2]);
      p.r(14, 44, 30, 18, wood[2]); p.r(15, 45, 28, 16, night ? '#FFD98A' : '#BDEBFF');
      for (let i = 0; i < 5; i++) { p.ball(19 + i * 5, 57, 2, ['#E25C5C', '#FFD34E', '#5ED86A', '#8E7CD6', '#5CC8FF'][i]); }
      p.r(52, 42, 18, 32, wood[2]); p.r(53, 43, 16, 31, '#8C5634'); p.px(66, 58, '#FFD34E');
      for (let i = 0; i < 9; i++) { const c = i % 2 ? '#FFFFFF' : '#E25C5C'; p.tri(4 + i * 9, 26, 13 + i * 9, 26, 8.5 + i * 9, 34, c); }
      p.r(2, 22, 82, 5, '#B23A3A'); p.r(2, 22, 82, 1, '#E86A6A');
      for (let y = 0; y < 20; y++) { const inset = Math.max(0, 18 - y); p.r(inset + 2, y + 2, 82 - inset * 2, 1, y % 4 === 3 ? '#4E7A3A' : '#6FA84F'); }
      p.r(30, 6, 26, 12, wood[2]); p.r(31, 7, 24, 10, '#F7E6C4'); p.disc(43, 12, 3, '#FFD34E'); p.px(42, 11, '#FFF6B0');
      if (snow) { p.r(2, 20, 82, 2, '#FFFFFF'); for (let y = 0; y < 18; y++) { const inset = Math.max(0, 18 - y); p.px(inset + 2, y + 2, '#FFFFFF'); p.px(83 - inset, y + 2, '#FFFFFF'); } }
    });
  }
  function oracleTower(season, night) {
    const st = ['#E9E4F5', '#C3B8DD', '#9184B5'], snow = season === 'inverno';
    return make(54, 104, p => {
      p.r(10, 34, 34, 68, st[0]); for (let y = 36; y < 102; y += 6) for (let x = (y / 6) % 2 ? 11 : 14; x < 42; x += 7) p.r(x, y, 5, 1, st[1]); p.r(41, 34, 3, 68, st[2]);
      p.r(20, 78, 14, 24, '#4B3366'); p.ell(27, 78, 7, 5, '#4B3366'); p.r(22, 80, 10, 22, '#7A5AA0');
      p.r(20, 50, 12, 14, '#4B3366'); p.ell(26, 50, 6, 4, '#4B3366'); p.r(21, 51, 10, 13, night ? '#C7A6FF' : '#9FD9FF');
      for (let y = 0; y < 30; y++) { const w = Math.round(y * .72); p.r(27 - w, y + 4, w * 2 + 1, 1, y % 5 === 4 ? '#4B3E9E' : '#6C5BD0'); p.r(27, y + 4, w + 1, 1, y % 5 === 4 ? '#3A2F82' : '#5446B5'); }
      for (let i = 0; i < 5; i++) p.px(18 + i * 4, 16 + (i % 2) * 6, '#FFE27A');
      p.disc(27, 4, 4, '#BFEAFF'); p.disc(26, 3, 2, '#FFFFFF');
      if (snow) for (let y = 0; y < 30; y++) { const w = Math.round(y * .72); p.px(27 - w, y + 4, '#FFFFFF'); }
    });
  }
  function signpost(season) {
    return make(30, 34, p => { p.r(13, 8, 4, 26, '#8C5634'); p.r(13, 8, 1, 26, '#B07A48'); p.tri(2, 6, 24, 6, 28, 11, '#D99A5E'); p.r(2, 6, 22, 10, '#D99A5E'); p.tri(24, 6, 29, 11, 24, 16, '#D99A5E'); p.r(5, 9, 15, 1, '#8C5634'); p.r(5, 12, 11, 1, '#8C5634'); p.r(3, 18, 20, 7, '#C98B55'); p.tri(3, 18, 0, 21, 3, 25, '#C98B55'); p.r(6, 21, 12, 1, '#8C5634'); if (season === 'inverno') p.r(2, 5, 22, 1, '#FFFFFF'); });
  }

  /* ---------- Decorazioni ---------- */
  function deco(id, season, night, t = 0) {
    const R = rng(hashStr(id));
    switch (id) {
      case 'lanterna': return make(12, 30, p => { p.r(5, 8, 2, 22, '#4E4A5E'); p.r(1, 2, 10, 9, '#3E3A4E'); p.r(2, 3, 8, 7, night ? '#FFE27A' : '#FFF4C8'); p.r(5, 0, 2, 3, '#3E3A4E'); p.r(3, 28, 6, 2, '#4E4A5E'); });
      case 'aiuola': { const S2 = SEASON[season] || SEASON.estate; return make(30, 12, p => { p.r(0, 6, 30, 6, '#8C5634'); p.r(1, 5, 28, 2, '#5A3A26'); for (let i = 0; i < 9; i++) { const x = 2 + i * 3, c = S2.flower[i % 4]; p.r(x, 2, 1, 4, '#3C8E3F'); p.px(x - 1, 1, c); p.px(x + 1, 1, c); p.px(x, 0, c); p.px(x, 2, c); p.px(x, 1, '#FFE27A'); } }); }
      case 'panchina': return make(30, 16, p => { p.r(1, 6, 28, 3, '#C98B55'); p.r(1, 6, 28, 1, '#E9B27A'); p.r(1, 1, 28, 3, '#C98B55'); p.r(1, 1, 28, 1, '#E9B27A'); p.r(3, 4, 2, 2, '#8C5634'); p.r(25, 4, 2, 2, '#8C5634'); p.r(3, 9, 2, 7, '#6E4226'); p.r(25, 9, 2, 7, '#6E4226'); });
      case 'cartello': return signpost(season);
      case 'pozzo': return make(34, 36, p => { p.r(4, 20, 26, 16, '#BDB4CC'); for (let y = 22; y < 36; y += 4) for (let x = (y / 4) % 2 ? 5 : 8; x < 29; x += 6) p.r(x, y, 4, 1, '#8E86A3'); p.r(4, 18, 26, 3, '#E3DDEA'); p.r(6, 4, 2, 15, '#8C5634'); p.r(26, 4, 2, 15, '#8C5634'); p.tri(2, 6, 17, -2, 32, 6, '#B23A3A'); p.r(2, 5, 30, 2, '#E25C5C'); p.r(8, 9, 18, 1, '#6E4226'); p.r(16, 10, 1, 6, '#C9B49A'); p.r(14, 15, 5, 4, '#8C5634'); });
      case 'fungo': return make(36, 40, p => { p.r(12, 22, 12, 18, '#FFF1DF'); p.r(12, 22, 3, 18, '#FFFFFF'); p.r(21, 22, 3, 18, '#E9D3B9'); p.r(16, 30, 5, 8, '#8C5634'); p.px(19, 34, '#FFD34E'); p.ell(18, 16, 17, 10, '#E8443F'); p.ell(16, 13, 13, 6, '#FF6F6A'); p.r(1, 21, 34, 3, '#B32F2F'); [[9, 11, 3], [22, 9, 3], [28, 15, 2], [14, 17, 2]].forEach(([x, y, r]) => p.disc(x, y, r, '#FFFFFF')); if (night) { p.r(16, 30, 5, 8, '#FFD86E'); } });
      case 'falo': return make(30, 30, p => { p.r(3, 24, 24, 4, '#6E4226'); p.r(5, 22, 20, 3, '#8C5634'); p.line(4, 27, 26, 21, '#5A3A26'); p.line(4, 21, 26, 27, '#5A3A26'); for (let i = 0; i < 12; i++) p.disc(15, 26, 1, '#7C7486'); const fl = (s, c) => { for (let y = 0; y < 16 * s; y++) { const w = Math.round((1 - y / (16 * s)) * 6 * s + Math.sin(t * 10 + y) * .8); p.r(15 - w, 21 - y, w * 2, 1, c); } }; fl(1, '#FF7A3D'); fl(.75, '#FFC94D'); fl(.45, '#FFF6B0'); }, true);
      case 'stendardo': return make(36, 46, p => { for (const x of [4, 26]) { p.r(x, 4, 2, 42, '#6E4226'); p.disc(x + 1, 3, 2, '#FFD34E'); const c = x === 4 ? '#3C8FEA' : '#E25C5C'; for (let xx = 0; xx < 9; xx++) { const dy = Math.round(Math.sin(t * 3 + xx * .7)); p.r(x + 2 + xx, 7 + dy, 1, 16 - (xx > 6 ? xx - 6 : 0) * 2, c); p.px(x + 2 + xx, 7 + dy, '#FFFFFF'); } p.r(x + 4, 12, 3, 3, '#FFE27A'); } }, true);
      case 'ciliegio': { const c = tree('round', 'ciliegi', 77, 1.25); return c; }
      case 'fontana': return make(54, 40, p => { p.ell(27, 32, 26, 7, '#C3B8DD'); p.ell(27, 31, 23, 5, '#5CC8FF'); p.ell(25, 30, 15, 2, '#9FE3FF'); p.r(24, 12, 6, 20, '#E3DDEA'); p.r(24, 12, 2, 20, '#FFFFFF'); p.ell(27, 13, 10, 3, '#C3B8DD'); p.ell(27, 12, 8, 2, '#5CC8FF'); for (let i = 0; i < 7; i++) { const a = t * 3 + i; const x = 27 + Math.round(Math.cos(i * .9) * (6 + (a % 1) * 8)); const y = 8 - Math.round(Math.sin((a % 1) * 3.14) * 6); p.px(x, y, '#BFEAFF'); p.px(x, y + 1, '#FFFFFF'); } p.r(26, 2, 2, 8, '#9FE3FF'); }, true);
      case 'mulino': return make(64, 80, p => { p.tri(14, 80, 22, 30, 42, 80, '#F2DDBB'); p.r(20, 30, 24, 50, '#F2DDBB'); p.r(38, 30, 6, 50, '#D9BC93'); p.r(27, 62, 10, 18, '#8C5634'); p.r(28, 40, 7, 8, '#6E4226'); p.r(29, 41, 5, 6, night ? '#FFE27A' : '#BDEBFF'); p.tri(16, 32, 32, 14, 48, 32, '#B23A3A'); const cx = 32, cy = 26; for (let k = 0; k < 4; k++) { const a = t * 1.2 + k * Math.PI / 2; for (let i = 3; i < 26; i++) { const x = cx + Math.cos(a) * i, y = cy + Math.sin(a) * i; p.px(x, y, '#6E4226'); const nx = -Math.sin(a), ny = Math.cos(a); if (i > 8) for (let j = 1; j < 6; j++) p.px(x + nx * j, y + ny * j, j === 5 ? '#C9B49A' : '#FFF7E3'); } } p.disc(cx, cy, 2, '#4E3E36'); }, true);
      case 'statua': return null; // disegnata dal motore con l'aspetto dell'avatar
      case 'torre': return make(40, 110, p => { const st = ['#F0E8DC', '#CFC2AE', '#A39580']; p.r(6, 30, 28, 80, st[0]); for (let y = 32; y < 110; y += 6) for (let x = (y / 6) % 2 ? 7 : 10; x < 32; x += 7) p.r(x, y, 5, 1, st[1]); p.r(31, 30, 3, 80, st[2]); p.disc(20, 46, 10, '#FFFFFF'); p.disc(20, 46, 9, '#FFF7E3'); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; p.px(20 + Math.round(Math.sin(a) * 7), 46 - Math.round(Math.cos(a) * 7), '#4E3E36'); } const now = new Date(); const ha = (now.getHours() % 12 + now.getMinutes() / 60) / 12 * Math.PI * 2, ma = now.getMinutes() / 60 * Math.PI * 2; p.line(20, 46, 20 + Math.round(Math.sin(ha) * 4), 46 - Math.round(Math.cos(ha) * 4), '#2A1E3A'); p.line(20, 46, 20 + Math.round(Math.sin(ma) * 7), 46 - Math.round(Math.cos(ma) * 7), '#B23A3A'); for (let y = 0; y < 28; y++) { const w = Math.round(y * .62); p.r(20 - w, y + 2, w * 2 + 1, 1, y % 5 === 4 ? '#2F6F9E' : '#3C8FEA'); } p.r(14, 70, 12, 16, '#4B3366'); p.r(15, 71, 10, 15, night ? '#FFE27A' : '#7A5AA0'); p.r(15, 96, 10, 14, '#6E4226'); }, true);
      case 'arco': return make(60, 64, p => { for (let a = 0; a <= 180; a += 1) { const r = a * Math.PI / 180; for (let w = 0; w < 6; w++) { const x = 30 + Math.cos(r) * (26 - w), y = 60 - Math.sin(r) * (52 - w); p.px(x, y, ['#C7A6FF', '#9FE3FF', '#FFFFFF', '#9FE3FF', '#C7A6FF', '#8E7CD6'][w]); } } for (let i = 0; i < 10; i++) { const a = t * 2 + i; p.px(30 + Math.cos(a) * 16, 40 + Math.sin(a * 1.3) * 16, '#FFFFFF'); } }, true);
    }
    return null;
  }

  /* ---------- Icone pixel 12-16px ---------- */
  const IC = {
    radura: ['....GGGG....', '..GGLLGGGG..', '.GLLGGGGGGG.', 'GLGGGGGGGDGG', 'GGGGGGGGDDGG', '.GGGGGGDDGG.', '..GGDDDDGG..', '....GTTD....', '.....TT.....', '.....TT.....', '...WWTTWW...', '..WWWWWWWW..'],
    studio: ['.KKKKKKKKKK.', '.KBBBBBBBBK.', '..KYYYYYYK..', '...KYYYYK...', '....KYYK....', '.....KK.....', '....K.YK....', '...K..Y.K...', '..K..YYY.K..', '.KBBBBBBBBK.', '.KKKKKKKKKK.', '............'],
    esami: ['.KKKKKKKKKK.', 'KRRRRKWWWWWK', 'KRLRRKWLLLWK', 'KRRRRKWWWWWK', 'KRRRRKWLLWWK', 'KRRRRKWWWWWK', 'KRRRRKWLLLWK', 'KRRRRKWWWWWK', 'KRRRRKWWWWWK', 'KDDDDKKKKKKK', '.KKKKK......', '............'],
    orario: ['.KK....KK...', 'KKKKKKKKKKK.', 'KRRRRRRRRRK.', 'KKKKKKKKKKK.', 'KWWWWWWWWWK.', 'KWBWWBWWBWK.', 'KWWWWWWWWWK.', 'KWBWWBWWGWK.', 'KWWWWWWWWWK.', 'KKKKKKKKKKK.', '............', '............'],
    oracolo: ['....KKKK....', '..KKCCCCKK..', '.KCWWCCCCCK.', '.KCWCCCCCCK.', 'KCCCCCCCCCCK', 'KCCCCCCCDCCK', '.KCCCCCDDCK.', '.KKCCCCCCKK.', '..KKKKKKKK..', '.KYYYYYYYYK.', 'KYYYYYYYYYYK', 'KKKKKKKKKKKK'],
    mappa: ['KKKKKKKKKKKK', 'KYYYGYYYBYYK', 'KYGGGYYYBBYK', 'KYYGYYRYYBYK', 'KYYYYRRYYYYK', 'KBBYYYRYYGYK', 'KYBYYYYYGGGK', 'KYBBYYYYYGYK', 'KKKKKKKKKKKK', '............', '............', '............'],
    albo: ['KKK.KKKK.KKK', 'KYYKYYYYKYYK', 'KYKYYYYYYKYK', '.KKYYYYYYKK.', '..KYYYYYYK..', '...KYYYYK...', '....KYYK....', '.....KK.....', '....KYYK....', '...KYYYYK...', '..KKKKKKKK..', '............'],
    guardaroba: ['....KKKK....', '..KK.KK.KK..', '.KRRK..KRRK.', 'KRRRRKKRRRRK', 'KKKRRRRRRKKK', '..KRRRRRRK..', '..KRLRRRRK..', '..KRRRRRRK..', '..KRRRRRRK..', '..KKKKKKKK..', '............', '............'],
    bottega: ['...KKKKKK...', '..K......K..', '.KKKKKKKKKK.', 'KYYYYYYYYYYK', 'KYYYKKKKYYYK', 'KYYYKWWKYYYK', 'KYYYKKKKYYYK', 'KYYYYYYYYYYK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.', '............', '............'],
    menu: ['............', 'KKKKKKKKKKKK', 'KWWWWWWWWWWK', 'KKKKKKKKKKKK', '............', 'KKKKKKKKKKKK', 'KWWWWWWWWWWK', 'KKKKKKKKKKKK', '............', 'KKKKKKKKKKKK', 'KWWWWWWWWWWK', 'KKKKKKKKKKKK'],
    gear: ['....KKKK....', '.KK.KWWK.KK.', 'KWWKKWWKKWWK', 'KWWWWWWWWWWK', '.KWWWKKWWWK.', 'KKWWK..KWWKK', 'KKWWK..KWWKK', '.KWWWKKWWWK.', 'KWWWWWWWWWWK', 'KWWKKWWKKWWK', '.KK.KWWK.KK.', '....KKKK....'],
    heart: ['.KK.KK.', 'KwRKRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'],
    half: ['.KK.KK.', 'KwRKeeK', 'KRRReeK', '.KRReK.', '..KRK..', '...K...'],
    empty: ['.KK.KK.', 'KeeKeeK', 'KeeeeeK', '.KeeeK.', '..KeK..', '...K...'],
    coin: ['..KKKK..', '.KYYYYK.', 'KYWYYDYK', 'KYYYYDYK', 'KYYYYDYK', 'KYYDDDYK', '.KYYYYK.', '..KKKK..'],
    flame: ['...K....', '..KOK...', '..KOOK..', '.KOYOK..', '.KOYYOK.', 'KOYWYOK.', 'KOYWWYOK', '.KOYYOK.', '..KKKK..'],
    lock: ['..KKKK..', '.K....K.', '.K....K.', 'KKKKKKKK', 'KYYYYYYK', 'KYYKKYYK', 'KYYKKYYK', 'KYYYYYYK', 'KKKKKKKK'],
    star: ['....K....', '...KYK...', 'KKKKYKKKK', 'KYYYYYYYK', '.KYYYYYK.', '..KYYYK..', '.KYYKYYK.', '.KYK.KYK.', '.KK...KK.'],
    potion: ['..KKK...', '...K....', '..KWK...', '.KPPPK..', 'KPWPPPK.', 'KPPPPPK.', 'KPPPPDK.', '.KKKKK..'],
    elixir: ['..KKK...', '...K....', '..KWK...', '.KYYYK..', 'KYWYYYK.', 'KYYYYYK.', 'KYYYYDK.', '.KKKKK..'],
    shield: ['KKKKKKKK', 'KRRWWRRK', 'KRRWWRRK', 'KWWWWWWK', 'KRRWWRRK', '.KRWWRK.', '..KRRK..', '...KK...'],
    play: ['K.......', 'KWK.....', 'KWWWK...', 'KWWWWWK.', 'KWWWWWK.', 'KWWWK...', 'KWK.....', 'K.......'],
    pause: ['KKK.KKK.', 'KWK.KWK.', 'KWK.KWK.', 'KWK.KWK.', 'KWK.KWK.', 'KWK.KWK.', 'KWK.KWK.', 'KKK.KKK.'],
    stop: ['KKKKKKK.', 'KWWWWWK.', 'KWWWWWK.', 'KWWWWWK.', 'KWWWWWK.', 'KWWWWWK.', 'KKKKKKK.', '........'],
    plus: ['..KKK...', '..KWK...', 'KKKWKKK.', 'KWWWWWK.', 'KKKWKKK.', '..KWK...', '..KKK...', '........'],
    check: ['......KK', '.....KWK', 'KK..KWK.', 'KWKKWK..', '.KWWK...', '..KK....', '........', '........'],
    close: ['KK...KK.', 'KWK.KWK.', '.KWKWK..', '..KWK...', '.KWKWK..', 'KWK.KWK.', 'KK...KK.', '........'],
    pencil: ['.....KK.', '....KYYK', '...KYYK.', '..KYYK..', '.KYYK...', 'KWYK....', 'KKK.....', '........'],
    trash: ['..KKKK..', 'KKKKKKKK', '.KWWWWK.', '.KWKWKK.', '.KWKWKK.', '.KWKWKK.', '.KWWWWK.', '..KKKK..'],
    left: ['...KK...', '..KWK...', '.KWK....', 'KWWWWWK.', '.KWK....', '..KWK...', '...KK...', '........'],
    right: ['...KK...', '...KWK..', '....KWK.', '.KWWWWWK', '....KWK.', '...KWK..', '...KK...', '........'],
    note: ['....KKK.', '....KWWK', '....KKWK', '....K.KK', '....K...', '.KKKK...', 'KWWWK...', '.KKK....'],
    sync: ['..KKKK..', '.KCCCCK.', 'KCWWCCCK', 'KCCCCCCK', '.KKKKKK.', '...KK...', '..KCCK..', '...KK...'],
    hand: ['...KK...', '..KWWK..', '..KWWK.K', 'KKKWWKKW', 'KWKWWKWK', 'KWWWWWWK', '.KWWWWK.', '..KKKK..'],
    egg: ['..KKK...', '.KWWWK..', 'KWPWWWK.', 'KWWWPWK.', 'KWPWWWK.', 'KWWWWWK.', '.KWWWK..', '..KKK...'],
    crown: ['K..K..K.', 'KYKYKYK.', 'KYYYYYK.', 'KYRYBYK.', 'KYYYYYK.', 'KKKKKKK.', '........', '........'],
    chest: ['.KKKKKK.', 'KDDDDDDK', 'KYYYYYYK', 'KKKYYKKK', 'KDDKKDDK', 'KDDDDDDK', 'KKKKKKKK', '........'],
    sword: ['......KK', '.....KWK', '....KWK.', 'KK.KWK..', '.KKWK...', '..KK....', '.KDKK...', 'KK..K...'],
    bell: ['...KK...', '..KYYK..', '.KYYYYK.', '.KYWYYK.', '.KYYYYK.', 'KYYYYYYK', 'KKKKKKKK', '...KK...'],
    moon: ['..KKK...', '.KYYKK..', 'KYYK....', 'KYYK....', 'KYYK....', 'KYYYK..K', '.KYYYKKK', '..KKKK..'],
    trophy: ['KKKKKKKKKK', 'KYKYYYYKYK', 'KYKYWYYKYK', '.KKYYYYKK.', '..KYYYYK..', '...KYYK...', '....KK....', '...KYYK...', '..KDDDDK..', '..KKKKKK..'],
    clock: ['..KKKK..', '.KWWWWK.', 'KWWKWWWK', 'KWWKWWWK', 'KWWKKKWK', 'KWWWWWWK', '.KWWWWK.', '..KKKK..'],
    pin: ['.KKKK...', 'KRRRRK..', 'KRWRRK..', 'KRRRRK..', '.KRRK...', '..KK....', '..KK....', '...K....'],
    user: ['..KKKK..', '.KWWWWK.', '.KWWWWK.', '..KKKK..', '.KCCCCK.', 'KCCCCCCK', 'KCCCCCCK', 'KKKKKKKK'],
    link: ['....KKK.', '...KWWWK', '...KWKWK', '..KWWWK.', '.KWWWK..', 'KWKWK...', 'KWWWK...', '.KKK....'],
    copy: ['.KKKKK..', '.KWWWK..', 'KKKKKWK.', 'KWWWKWK.', 'KWWWKKK.', 'KWWWK...', 'KKKKK...', '........'],
    down: ['..KKK...', '..KWK...', '..KWK...', 'KKKWKKK.', '.KWWWK..', '..KWK...', '...K....', 'KKKKKKK.'],
    up: ['...K....', '..KWK...', '.KWWWK..', 'KKKWKKK.', '..KWK...', '..KWK...', '..KKK...', 'KKKKKKK.'],
    wand: ['.....Y.Y', '......Y.', '.....KYK', '....KWK.', '...KWK..', '..KWK...', '.KWK....', 'KKK.....'],
    music: ['...KKKKK', '...KWWWK', '...KKKKK', '...K...K', '...K...K', '.KKK.KKK', 'KWWKKWWK', '.KK..KK.'],
    sun: ['...Y....', '.Y.Y.Y..', '..KKK...', 'YKYYYKY.', '..KYK...', '.Y.K.Y..', '...Y....', '........'],
    skull: ['.KKKKK..', 'KWWWWWK.', 'KWKWKWK.', 'KWKWKWK.', 'KWWWWWK.', '.KWKWK..', '.KKKKK..', '........'],
    tree: ['..KKKK..', '.KGGLGK.', 'KGGGGLGK', 'KGDGGGGK', '.KGGDGK.', '..KTTK..', '...TT...', '..KKKK..'],
    aura: ['...Y....', '.Y.W.Y..', '..WYW...', 'YWYWYWY.', '..WYW...', '.Y.W.Y..', '...Y....', '........'],
    eye: ['........', '..KKKK..', '.KWWWWK.', 'KWWKKWWK', 'KWWKKWWK', '.KWWWWK.', '..KKKK..', '........']
  };
  const ICPAL = { K: '#1C1424', G: '#5DBB4C', L: '#B6EC86', D: '#2F7A3E', T: '#8C5634', W: '#FFFFFF', B: '#B5793F', Y: '#FFD34E', R: '#E8553E', C: '#9FDFFF', O: '#FF8A3D', P: '#C77DFF', w: '#FFC2CC', e: '#E9DDF2' };
  const iconCache = {};
  function iconURL(name, scale = 2, palOver) {
    const key = name + scale + (palOver ? JSON.stringify(palOver) : '');
    if (iconCache[key]) return iconCache[key];
    const map = IC[name]; if (!map) return '';
    const w = Math.max(...map.map(r => r.length)), h = map.length; const c = cv(w * scale, h * scale), g = c.getContext('2d');
    const pal = { ...ICPAL, ...(palOver || {}) };
    map.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x * scale, y * scale, scale, scale); } }));
    return (iconCache[key] = c.toDataURL());
  }
  const pix = (name, cls = '', scale = 2, pal) => `<img class="pxi ${cls}" src="${iconURL(name, scale, pal)}" alt="" aria-hidden="true">`;
  return { IC, tree, bush, house, houseStage, HOUSE_NAMES, hall, shop, oracleTower, signpost, deco, flag, SEASON, SKY, themeKey, timeKey, ramp, mix, make, outline, rng, iconURL, pix, cv };
})();
