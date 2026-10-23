/* ============ Interfaccia: cornici, HUD, viste ============ */
const pix = (n, cls = '', sc = 2, pal) => ART.pix(n, cls, sc, pal);

/* ---------- Cornici pixel generate (border-image) ---------- */
function frameSVG(o) {
  const n = o.n || 9, cut = o.cut ?? 2; let rects = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const cx = x < cut ? cut - x : x > n - 1 - cut ? x - (n - 1 - cut) : 0, cy = y < cut ? cut - y : y > n - 1 - cut ? y - (n - 1 - cut) : 0;
    if (cx + cy > cut) continue;
    const dT = y, dL = x, dB = n - 1 - y, dR = n - 1 - x;
    let d = Math.min(dT, dL, dB, dR); if (cx + cy > 0) d = Math.min(d, cut - (cx + cy));
    let col;
    const shadeSide = Math.min(dB, dR) < Math.min(dT, dL);
    if (d === 0) col = o.out;
    else if (o.deep && dB === 1 && d === 1) col = o.deep;
    else if (o.deep && dB === 2 && d <= 2 && o.deep2) col = o.deep2;
    else if (d === 1) col = shadeSide ? o.sh : o.hi;
    else if (o.trim && d === 2) col = o.trim;
    else if (o.trim2 && d === 3) col = shadeSide ? (o.trim2sh || o.trim2) : o.trim2;
    else col = o.fill;
    if (o.grain && d >= 2 && y % 3 === 0 && y > 1 && y < n - 2) col = o.grain;
    rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${col}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges">${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')}")`;
}
function applyFrames() {
  const dark = document.documentElement.dataset.mode === 'dark';
  const K = dark ? '#0D0A1F' : '#2A1E3A';
  const P = dark ? { paper: '#2D2659', hi: '#4A3F86', sh: '#221C47', li: '#332B62', lihi: '#4B4185', lish: '#251F4D', inset: '#251F4B', insh: '#1B1638', inhi: '#3A3170', chip: '#3A3170', chiphi: '#55489A', chipsh: '#2A2356', chipdeep: '#1B1638' }
    : { paper: '#FFFCF2', hi: '#FFFFFF', sh: '#EAD7AE', li: '#FFF6E2', lihi: '#FFFFFF', lish: '#E7D2A6', inset: '#F6E7C6', insh: '#DCC497', inhi: '#FFF7E4', chip: '#FFF6E2', chiphi: '#FFFFFF', chipsh: '#E2CC9E', chipdeep: '#C7AC7A' };
  const btn = (fill, hi, sh, deep, n = 9) => frameSVG({ n, cut: 2, out: K, hi, sh, fill, deep });
  const F = {
    panel: frameSVG({ n: 11, cut: 2, out: K, hi: P.hi, sh: P.sh, fill: P.paper, trim: dark ? '#3A3170' : '#FFF6E0' }),
    sheet: frameSVG({ n: 13, cut: 2, out: K, hi: P.hi, sh: P.sh, trim: dark ? '#FFC64F' : '#F6B93B', trim2: dark ? '#3A3170' : '#FFF1D2', fill: P.paper }),
    legend: frameSVG({ n: 13, cut: 3, out: K, hi: '#FFE39A', sh: '#C98512', trim: '#F6B93B', trim2: dark ? '#4A3F86' : '#FFFFFF', trim2sh: dark ? '#2D2659' : '#F2E2BC', fill: dark ? '#2D2659' : '#FFF8E6' }),
    inset: frameSVG({ n: 9, cut: 1, out: dark ? '#120E2A' : '#B99B6A', hi: P.insh, sh: P.inhi, fill: P.inset }),
    input: frameSVG({ n: 9, cut: 1, out: K, hi: dark ? '#1A1536' : '#E8D7B4', sh: dark ? '#3A3170' : '#FFFFFF', fill: dark ? '#221C47' : '#FFFFFF' }),
    li: frameSVG({ n: 9, cut: 2, out: K, hi: P.lihi, sh: P.lish, fill: P.li }),
    'li-on': frameSVG({ n: 9, cut: 2, out: K, hi: '#FFF6C8', sh: '#E3A93A', fill: dark ? '#5A4A2A' : '#FFEDB5', trim: dark ? '#6E5A30' : '#FFF4CE' }),
    chip: btn(P.chip, P.chiphi, P.chipsh, P.chipdeep),
    'chip-on': btn(dark ? '#2ED3A3' : '#17B08A', dark ? '#8CF2D2' : '#7BE7C4', dark ? '#12977A' : '#0E8A6B', dark ? '#0A5E49' : '#0A5E49'),
    btn: btn(P.chip, P.chiphi, P.chipsh, P.chipdeep),
    'btn-dn': frameSVG({ n: 9, cut: 2, out: K, hi: P.chipsh, sh: P.chiphi, fill: P.chip }),
    'btn-acc': btn(dark ? '#2ED3A3' : '#17B08A', dark ? '#8CF2D2' : '#7BE7C4', dark ? '#12977A' : '#0E8A6B', '#0A5E49'),
    'btn-acc-dn': frameSVG({ n: 9, cut: 2, out: K, hi: '#0E8A6B', sh: '#7BE7C4', fill: dark ? '#2ED3A3' : '#17B08A' }),
    'btn-gold': btn('#F6B93B', '#FFE39A', '#C98512', '#8F5A08'),
    'btn-gold-dn': frameSVG({ n: 9, cut: 2, out: K, hi: '#C98512', sh: '#FFE39A', fill: '#F6B93B' }),
    'btn-rose': btn('#F0709A', '#FFB3CB', '#C24872', '#8E2C52'),
    'btn-lav': btn('#9C7CF0', '#CDBBFF', '#6E50C8', '#4A3194'),
    'btn-red': btn('#E8505B', '#FF9AA1', '#B32F3A', '#7E1C25'),
    'btn-dlg': btn('#4A3C86', '#6E5FB0', '#2E2560', '#1C1640'),
    'tab-on': btn('#FFD36E', '#FFF1B8', '#D99A1E', '#9A6410'),
    wood: frameSVG({ n: 11, cut: 2, out: K, hi: '#E2A066', sh: '#6E4226', trim: '#9A5E33', fill: '#B9763F', grain: '#A86A38' }),
    night: frameSVG({ n: 11, cut: 2, out: '#0D0A1F', hi: '#6E5FB0', sh: '#1E1844', trim: '#2E2560', fill: '#3A2F72' }),
    dialog: frameSVG({ n: 13, cut: 2, out: '#0D0A1F', hi: '#FFE39A', sh: '#C98512', trim: '#2A2158', trim2: '#3A2F72', fill: '#342A6A' }),
    portrait: frameSVG({ n: 7, cut: 1, out: K, hi: '#FFE39A', sh: '#C98512', fill: dark ? '#5E4FA8' : '#BFE8FF' })
  };
  const r = document.documentElement.style;
  for (const k in F) r.setProperty('--fr-' + k, F[k]);
  r.setProperty('--lock-ic', `url(${ART.iconURL('lock', 2)})`);
  // motivo di sfondo: fiorellini (giorno) o stelline (notte)
  const c = ART.cv(64, 64), g = c.getContext('2d'); const R = ART.rng(dark ? 3 : 8);
  for (let i = 0; i < 7; i++) { const x = Math.floor(R() * 60) + 2, y = Math.floor(R() * 60) + 2; g.globalAlpha = dark ? .55 : .22; g.fillStyle = dark ? ['#FFF6C8', '#C7B8FF', '#9FE3FF'][i % 3] : ['#F0709A', '#17B08A', '#F6B93B', '#9C7CF0'][i % 4]; g.fillRect(x, y, 1, 1); if (i % 2 === 0) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); } }
  r.setProperty('--bg-pat', `url(${c.toDataURL()})`);
}

/* ---------- Ritratti e miniature (idratati dopo il render) ---------- */
const ptCache = new Map();
function lookForKey(k) {
  const [t, a, b] = k.split(':');
  if (t === 'avatar') return lookOf('avatar', a && a !== 'x' ? a : null);
  if (t === 'c') return lookOf(a, b && b !== 'x' ? b : null);
  if (t === 'sp') { const sp = SPECIES_BY[a]; if (!sp) return null; const l = speciesLook(a); return { look: { ...l, slots: { body: { id: 'body' }, shadow: { id: 'shadow' }, ...l.slots } } }; }
  if (t === 'boss') { const bb = BOSSES.find(x => x.id === a); if (!bb) return null; return { look: { body: bb.body, skin: bb.skin, eyes: bb.eyes, hairColor: bb.hairColor || 'black', slots: { body: { id: 'body' }, shadow: { id: 'shadow' }, ...bb.slots } } }; }
  if (t === 'h') { const c = compById(a); const h = c && c.history[Number(b)]; if (!h || !h.look) return lookOf(a); return { look: { ...h.look, slots: { body: { id: 'body' }, shadow: { id: 'shadow' }, ...h.look.slots } } }; }
  return null;
}
function drawInto(el, src) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0); el.innerHTML = ''; el.appendChild(c); el.dataset.done = '1'; }
let thumbIO = null;
function hydrate(root = document) {
  root.querySelectorAll('[data-pt]:not([data-done])').forEach(el => {
    const k = el.dataset.pt; const L = lookForKey(k); if (!L) return;
    const key = JSON.stringify(L.look); el.dataset.done = '1';
    if (!ptCache.has(key)) ptCache.set(key, SPR.portrait(L.look));
    ptCache.get(key).then(c => { if (el.isConnected) drawInto(el, c); }).catch(() => { });
  });
  if (!thumbIO && 'IntersectionObserver' in window) thumbIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { thumbIO.unobserve(e.target); loadThumb(e.target); } }), { rootMargin: '200px' });
  root.querySelectorAll('[data-it]:not([data-done])').forEach(el => { el.dataset.done = '0'; if (thumbIO) thumbIO.observe(el); else loadThumb(el); });
}
const thCache = new Map();
function loadThumb(el) {
  const [id, body, ent] = el.dataset.it.split('|'); const entry = ent ? JSON.parse(decodeURIComponent(ent)) : {};
  const key = el.dataset.it;
  if (!thCache.has(key)) thCache.set(key, SPR.thumb(id, body || 'female', entry, entry._ctx || {}));
  thCache.get(key).then(c => { if (c && el.isConnected) drawInto(el, c); }).catch(() => { });
}
const ptAvatar = (cls = '', mood) => `<span class="pt ${cls}" data-pt="avatar:${mood || 'x'}"></span>`;
const ptComp = (id, mood, cls = '') => `<span class="pt ${cls}" data-pt="c:${id}:${mood || 'x'}"></span>`;
const ptExam = (e, cls = '') => e && e.comp ? ptComp(e.comp, moodOfExam(e), cls) : `<span class="pt ${cls}"></span>`;
const ptSp = (id, cls = '') => `<span class="pt ${cls}" data-pt="sp:${id}"></span>`;
const ptBoss = (id, cls = '') => `<span class="pt ${cls}" data-pt="boss:${id}"></span>`;
function itThumb(id, body, entry = {}) { return `<span class="ic" data-it="${esc(id)}|${body || 'female'}|${encodeURIComponent(JSON.stringify(entry))}"></span>`; }
function rewardIcon(r, body) {
  if (r.t === 'item') return itThumb(r.id, body);
  if (r.t === 'aura') { const A = AURA_BY[r.id]; return `<span class="ic">${pix('aura', '', 4, { Y: A ? A.cols[0] : '#FFE27A', W: A ? (A.cols[1] || '#fff') : '#fff' })}</span>`; }
  if (r.t === 'title') return `<span class="ic">${pix('crown', '', 4)}</span>`;
  if (r.t === 'chest') return `<span class="ic">${pix('chest', '', 4)}</span>`;
  if (r.t === 'cons') return `<span class="ic">${pix(CONS_BY[r.id] ? CONS_BY[r.id].icon : 'potion', '', 4)}</span>`;
  return '<span class="ic"></span>';
}
function rewardLabel(r) {
  if (r.t === 'item') { const it = SPR.item(r.id); return it ? it.name : 'Oggetto'; }
  if (r.t === 'aura') return AURA_BY[r.id] ? AURA_BY[r.id].name : 'Aura';
  if (r.t === 'title') return r.name;
  if (r.t === 'chest') return `${r.coins} monete`;
  if (r.t === 'cons') return CONS_BY[r.id] ? CONS_BY[r.id].name : 'Pozione';
  return '';
}
function heartsHTML(min, goal, big = false) {
  const n = Math.max(1, Math.round(goal / 30)), full = Math.floor(min / 30), half = (min % 30) >= 15 ? 1 : 0; let s = '';
  for (let i = 0; i < n; i++) s += `<img class="pxi ${big && i === Math.min(full, n - 1) && full < n ? 'beat' : ''}" src="${ART.iconURL(i < full ? 'heart' : i === full && half ? 'half' : 'empty', 3)}" alt="">`;
  return `<span class="${big ? 'big-hearts' : 'hearts'}" title="${fmtMin(min)} di ${fmtMin(goal)} oggi: un cuore ogni 30 minuti" aria-label="${Math.min(full, n)} cuori su ${n}">${s}${full > n ? `<b class="pix" style="font-size:18px;margin-left:4px">+${full - n}</b>` : ''}</span>`;
}
function medalURL(col, k) {
  const key = 'medal' + col + k; if (ptCache.has(key)) return ptCache.get(key);
  const c = ART.cv(24, 26), g = c.getContext('2d'); const R = ART.ramp(col);
  g.fillStyle = '#E25C5C'; g.fillRect(6, 0, 4, 9); g.fillStyle = '#3C8FEA'; g.fillRect(14, 0, 4, 9); g.fillStyle = '#B23A3A'; g.fillRect(9, 0, 1, 9); g.fillStyle = '#2B6FC2'; g.fillRect(17, 0, 1, 9);
  const cx = 12, cy = 16, r = 9;
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) { const d = x * x + y * y; if (d > r * r + r * .5) continue; const edge = d > (r - 1.4) ** 2; const lit = (x + y) / r; g.fillStyle = edge ? '#2A1E3A' : d > (r - 3) ** 2 ? (lit < 0 ? '#FFE39A' : '#C98512') : (lit < -.6 ? R.hi : lit < .2 ? R.lt : R.b); g.fillRect(cx + x, cy + y, 1, 1); }
  const map = ART.IC[{ hour: 'clock', scale: 'aura', bolt: 'star', tomato: 'heart', laurel: 'trophy' }[k] || k] || ART.IC.star;
  const w = Math.max(...map.map(r => r.length)), h = map.length; const pal = { K: '#2A1E3A', W: '#FFFFFF', Y: '#FFE27A', R: '#FF5C6A', D: '#B97A1F', O: '#FF8A3D', P: '#C77DFF', C: '#9FDFFF', G: '#5DBB4C', L: '#B6EC86', T: '#8C5634', B: '#B5793F', w: '#FFC2CC', e: '#E9DDF2' };
  const ox = Math.round(cx - w / 2), oy = Math.round(cy - h / 2);
  map.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch] && w <= 10) { g.fillStyle = pal[ch]; g.fillRect(ox + x, oy + y, 1, 1); } }));
  const big = ART.cv(48, 52), bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, 48, 52);
  const u = big.toDataURL(); ptCache.set(key, u); return u;
}

/* ---------- Guscio: HUD e navigazione ---------- */
const TABS = [['radura', 'Radura'], ['studio', 'Studio'], ['esami', 'Esami'], ['orario', 'Orario'], ['oracolo', 'Oracolo']];
const MORE = [['guardaroba', 'Guardaroba', 'Vesti avatar e compagni'], ['bottega', 'Bottega', 'Abiti, aure, pozioni'], ['mappa', 'Mappa', 'Le sessioni e i boss'], ['albo', 'Albo', 'Sala degli Eroi'], ['trofei', 'Trofei', 'Bacheca e carriera']];
const VIEW_ICON = { radura: 'radura', studio: 'studio', esami: 'esami', orario: 'orario', oracolo: 'oracolo', guardaroba: 'guardaroba', bottega: 'bottega', mappa: 'mappa', albo: 'albo', trofei: 'trophy' };
let lastCoins = null;
function renderShell() {
  const P = S.profile, lv = IX.lv, t = today(), m = dayMin(t), stk = streak();
  const hud = $('#hud');
  if (hud) {
    hud.innerHTML = `<div class="hud-in">
      <button class="hud-me" data-act="ward" data-who="avatar" aria-label="Il tuo avatar: apri il guardaroba">
        <span class="hud-pt">${`<span class="pt" data-pt="avatar:${m >= P.goals.day ? 'happy' : 'x'}" style="position:absolute;inset:-9px -9px -5px;width:auto;height:auto"></span>`}<span class="hud-lv">${lv.L}</span></span>
        <span class="hud-txt"><b>${esc(P.name || 'Viandante')}</b><small>${esc(P.avatar.title || lv.title)} · ${num(IX.xp - lv.lo)}/${num(lv.hi - lv.lo)} XP</small><span class="bar xp"><i style="width:${(lv.frac * 100).toFixed(1)}%"></i></span></span>
      </button>
      <div class="hud-stats">
        <span class="hide-xs">${heartsHTML(m, P.goals.day)}</span>
        <button class="stat" data-act="nav" data-v="bottega" title="Monete: spendile in bottega" id="coinStat">${pix('coin')}<span class="num">${num(IX.wallet.coins)}</span></button>
        <span class="stat" title="Giorni di fila con almeno un minuto di studio">${pix('flame')}<span class="num">${stk}</span></span>
        <span id="tmPill"></span>
        <button id="sync" data-act="sync" data-s="${S.syncState || 'loading'}"><span></span></button>
        <button class="btn icon small hud-menu" data-act="menu" aria-label="Zaino: altre sezioni e impostazioni">${pix('menu')}</button>
      </div></div>`;
    setSync(S.syncState || 'loading');
  }
  const cur = S.ui.view;
  const tabs = $('#tabs'); if (tabs) tabs.innerHTML = TABS.map(([v, l]) => `<button class="tab" data-act="nav" data-v="${v}" ${cur === v ? 'aria-current="page"' : ''}>${pix(VIEW_ICON[v], '', 2)}<span>${l}</span></button>`).join('') + `<button class="tab" data-act="menu" ${MORE.some(x => x[0] === cur) ? 'aria-current="page"' : ''}>${pix('chest', '', 3)}<span>Zaino</span></button>`;
  const side = $('#side'); if (side) side.innerHTML = `<div class="side-logo">${pix('radura', '', 4)}<b>Radura<br>degli Esami</b><small>a.a. ${ayLabel(P.ay)}</small></div>` + TABS.concat(MORE).map(([v, l]) => `<button class="side-link" data-act="nav" data-v="${v}" ${cur === v ? 'aria-current="page"' : ''}>${pix(VIEW_ICON[v], '', 2)}${l}</button>`).join('') + `<div class="side-sep"></div><button class="side-link" data-act="settings">${pix('gear', '', 2)}Impostazioni</button>`;
  // monete che volano
  const coins = IX.wallet.coins;
  if (lastCoins != null && coins > lastCoins) coinBurst(coins - lastCoins);
  lastCoins = coins;
}
function coinBurst(n) {
  const el = $('#coinStat'); const fx = $('#fx'); if (!el || !fx) return;
  const r = el.getBoundingClientRect(); const k = Math.min(10, 3 + Math.floor(n / 40));
  for (let i = 0; i < k; i++) { const im = document.createElement('img'); im.className = 'coinfly'; im.src = ART.iconURL('coin', 3); const sx = innerWidth / 2 + (Math.random() - .5) * 120, sy = innerHeight * .55 + (Math.random() - .5) * 80; im.style.left = sx + 'px'; im.style.top = sy + 'px'; im.style.setProperty('--dx', (r.left + r.width / 2 - sx) + 'px'); im.style.setProperty('--dy', (r.top + r.height / 2 - sy) + 'px'); im.style.animationDelay = (i * 60) + 'ms'; fx.appendChild(im); setTimeout(() => im.remove(), 1200 + i * 60); }
  setTimeout(() => SFX.play('coin'), 600);
}

/* ---------- Render ---------- */
let lastTopSig = null, lastView = null;
function render() {
  if (!IX) rebuild();
  if (S.mode === 'onboarding') return;
  renderShell();
  const v = VIEWS[S.ui.view] || VIEWS.radura;
  const topSig = v.topSig ? S.ui.view + '|' + v.topSig() : null;
  const root = $('#view');
  const keep = {}; ['#ttwrap', '#tmchips', '.chips.scroll'].forEach(s => { const el = $(s); if (el) keep[s] = el.scrollLeft; });
  if (topSig && topSig === lastTopSig && lastView === S.ui.view && $('#vtop')) {
    $('#vbody').innerHTML = v.body(); v.refresh && v.refresh();
  } else {
    WORLD.stopAll();
    root.innerHTML = (demoBanner()) + (v.top ? `<div id="vtop">${v.top()}</div>` : '') + `<div id="vbody">${v.body()}</div>`;
    root.style.animation = 'none'; void root.offsetWidth; root.style.animation = '';
    v.mount && v.mount();
  }
  lastTopSig = topSig; lastView = S.ui.view;
  for (const s in keep) { const el = $(s); if (el) el.scrollLeft = keep[s]; }
  hydrate(document); v.after && v.after();
  updateTimerDom();
}
function demoBanner() {
  const has = S.profile.exams.some(e => e.demo) || Object.values(S.months).some(a => a.some(e => e.demo));
  return has ? `<div class="banner"><span>${pix('star')} Stai esplorando dati di esempio. Quando vuoi, cancellali e inserisci i tuoi esami.</span><button class="btn small" data-act="demo-clear">${pix('trash')} Cancella esempi</button></div>` : '';
}

/* ================= RADURA ================= */
function vRaduraTop() {
  return `<section class="world-wrap" aria-label="Il villaggio della radura: tocca per camminare, trascina per esplorare, tocca case e compagni per parlare">
    <canvas id="world" class="px" aria-hidden="true"></canvas>
    <div class="world-tip"><span>${fmtDayLong(today())}</span><span>${cap(ART.themeKey() === 'auto' ? seasonOf() : ART.themeKey())}</span></div>
    <div class="world-act"><button class="btn small icon" data-act="music" aria-label="Musica">${pix(S.profile.sound.music ? 'music' : 'note')}</button></div>
    <div id="dlg" hidden></div></section>`;
}
function vRaduraBody() {
  const P = S.profile;
  let out = '';
  if (!P.avatar.made) out += `<div class="banner" style="margin-top:12px"><span>${pix('user')} Crea il tuo avatar: scegli corpo, volto, capelli e vestiti.</span><button class="btn small primary" data-act="avatar-wizard">${pix('pencil')} Crea avatar</button></div>`;
  if (!P.exams.length) return out + welcomeCards();
  out += `<div class="grid2 gap">${todayCard()}${missionCard()}</div>`;
  out += `<section class="card gap"><div class="card-h"><span class="rib lav">${pix('egg')} I tuoi compagni</span><button class="btn small" data-act="nav" data-v="albo">${pix('albo')} Albo</button></div>${compRow()}</section>`;
  out += `<div class="grid2 gap">${upcomingCard()}${todayScheduleCard()}</div>`;
  out += `<div class="gap">${todayLogCard()}</div>`;
  return out;
}
function welcomeCards() {
  const r = SES_ORDER.map(s => { const rr = sessionRange(s, S.profile.ay); return `<div class="li"><span class="datepill" style="--dp:${s === 'inv' ? 'var(--sky)' : s === 'est' ? 'var(--gold-d)' : 'var(--warn)'}"><b>${pd(rr[0]).getDate()}</b><small>${MESI_S[pd(rr[0]).getMonth()]}</small></span><span class="grow"><b>${SESSIONI[s].label} · ${SESSIONI[s].realm}</b><small>${SESSIONI[s].months} ${pd(rr[0]).getFullYear()}</small></span><span class="val muted" style="font-size:16px">${inDays(diffDays(today(), rr[0]))}</span></div>`; }).join('');
  return `<section class="card gap"><div class="welcome"><span class="rib">${pix('star')} Benvenuto nella radura</span>
      <p style="max-width:560px">Ogni esame porta con sé un <b>compagno</b>: un elfo, una fata, un orco, una volpe dei templi… Studiate insieme, il vostro legame sale di livello, la sua casa cresce da tenda a castello e sblocchi abiti, ali, aure e poteri. Quando superi l'esame, il compagno entra nell'<b>Albo degli Eroi</b> con tutto ciò che avete conquistato.</p>
      <div class="row"><button class="btn primary" data-act="exam-new">${pix('plus')} Aggiungi il primo esame</button><button class="btn" data-act="demo-load">${pix('star')} Esplora con esempi</button></div></div></section>
    <div class="grid2 gap"><section class="card"><div class="card-h"><span class="rib sky">${pix('studio')} Come funziona</span></div><ol class="steps">
      <li><span><b>Inserisci gli esami</b> con semestre, sessione, appelli, docente, aula, ricevimento, note e link.</span></li>
      <li><span><b>Studia con il timer</b>: sessione libera, pomodoro 25/5 o 50/10, concentrazione 90/20 o su misura. Oppure segna a mano.</span></li>
      <li><span><b>Organizza l'orario</b> di lezioni e studio per ogni semestre e sessione.</span></li>
      <li><span><b>Ogni settimana l'Oracolo</b> ti dice cosa hai studiato di più e cosa hai trascurato.</span></li></ol></section>
      <section class="card"><div class="card-h"><span class="rib gold">${pix('mappa')} Le sessioni</span></div><div class="list">${r}</div></section></div>`;
}
function todayCard() {
  const t = today(), m = dayMin(t), g = S.profile.goals.day; const wk = weekStats(weekStart(t)).total, gw = S.profile.goals.week;
  const te = timerExam();
  return `<section class="card"><div class="card-h"><span class="rib rose">${pix('heart')} Oggi</span><span class="pill ${m >= g ? 'good' : ''}">${m >= g ? pix('check') + ' Obiettivo raggiunto' : fmtMin(Math.max(0, g - m)) + ' al traguardo'}</span></div>
    <div class="today"><div style="display:grid;gap:6px">${heartsHTML(m, g, true)}<p class="pix" style="font-size:24px">${fmtMin(m)} <span class="muted" style="font-size:18px">di ${fmtMin(g)}</span></p></div>
    <div class="row" style="margin-left:auto"><button class="btn primary" data-act="nav" data-v="studio">${pix('play')} ${T.phase !== 'idle' ? 'Torna al timer' : 'Studia ora'}</button><button class="btn" data-act="log-new">${pix('hand')} Segna</button></div></div>
    <div style="margin-top:12px;display:grid;gap:4px"><div class="row" style="justify-content:space-between"><small class="muted" style="font-weight:800">Settimana</small><small class="muted" style="font-weight:800">${fmtMin(wk)} / ${fmtMin(gw)}</small></div><span class="bar" style="--c:var(--rose)"><i style="width:${Math.min(100, wk / gw * 100).toFixed(1)}%"></i></span></div>
    ${T.phase !== 'idle' && te ? `<p class="hint" style="margin-top:8px">${pix('clock')} Timer in corso con ${esc(compName(te))} (${esc(te.name)}).</p>` : ''}</section>`;
}
function missionCard() {
  const t = today(), d = dow(t);
  const vws = d === 6 ? weekStart(t) : d === 0 ? addDays(weekStart(t), -7) : null;
  if (vws) { const o = oracle(vws); if (o.st.total > 0) return verdictCard(o, d === 6 ? 'Verdetto della settimana' : 'Verdetto della settimana scorsa'); }
  const o = oracle(weekStart(t)); const i = o.top[0] || o.items.filter(x => x.w > 0)[0];
  if (!i) return `<section class="card"><div class="card-h"><span class="rib lav">${pix('oracolo')} Missione</span></div><p class="muted">Hai superato tutti gli esami in elenco. Aggiungine di nuovi quando vuoi!</p></section>`;
  const left = 7 - d; const sug = i.def > 0 ? clamp(Math.round(i.def / left / 5) * 5, 25, 120) : 45;
  const c = compById(i.e.comp);
  return `<section class="card" style="--c:${colorOf(i.e)}"><div class="card-h"><span class="rib lav">${pix('oracolo')} Missione del giorno</span><span class="pill lav">consiglio dell'Oracolo</span></div>
    <div class="mission">${ptExam(i.e, 'framed lg')}<div style="min-width:0"><b class="pix" style="font-size:22px">${esc(c ? c.name : i.e.name)}</b><p class="muted" style="font-weight:800;font-size:13px">${esc(i.e.name)}</p><p style="margin-top:4px;font-size:13.5px">${adviceLine(i)}</p><p class="hint" style="margin-top:2px">${whyLine(i)}</p></div></div>
    <div class="row" style="margin-top:12px"><button class="btn primary small" data-act="tm-go" data-id="${i.e.id}">${pix('play')} Studia ${fmtMin(sug)}</button><button class="btn small" data-act="nav" data-v="oracolo">${pix('oracolo')} Settimana</button></div></section>`;
}
function verdictCard(o, title) {
  return `<section class="card"><div class="card-h"><span class="rib lav">${pix('oracolo')} ${title}</span><span class="pill">${fmtWeek(o.st.ws)}</span></div>
    <p>Hai studiato <b>${fmtMin(o.st.total)}</b> in ${o.st.active} ${o.st.active === 1 ? 'giorno' : 'giorni'}${o.fav && o.fav.act ? `; più tempo a <b>${esc(o.fav.e.name)}</b> (${pct(o.fav.actShare)})` : ''}.</p>
    <div class="row" style="margin-top:8px;flex-wrap:nowrap"><small class="muted" style="font-weight:800;white-space:nowrap">${balanceWord(o.balance)}</small><span class="bar grow" style="--c:var(--lav)"><i style="width:${o.balance}%"></i></span><b class="pix" style="font-size:20px">${o.balance}%</b></div>
    ${o.top.length ? `<p style="margin-top:10px"><b>La prossima settimana dai più spazio a:</b></p><div class="list" style="margin-top:6px">${o.top.map(i => `<button class="li" data-act="tm-go" data-id="${i.e.id}">${ptExam(i.e, 'sm')}<span class="grow"><b>${esc(i.e.name)}</b><small>${whyLine(i) || adviceLine(i)}</small></span><span class="val">${fmtMin(i.next)}</span></button>`).join('')}</div>` : `<p class="muted" style="margin-top:10px">Hai dato a ogni esame lo spazio giusto. Continua così!</p>`}
    <div class="row" style="margin-top:12px"><button class="btn small" data-act="oracle-week" data-ws="${o.st.ws}">${pix('oracolo')} Apri l'Oracolo</button></div></section>`;
}
function compRow() {
  const ex = activeExams(); if (!ex.length) return `<p class="muted">Nessun esame in corso. Aggiungine uno per accogliere un nuovo compagno.</p>`;
  return `<div class="comp-row">${ex.map(e => { const c = compById(e.comp); if (!c) return ''; const b = compBond(c); const stg = ART.houseStage(b.L); const mood = moodOfExam(e);
    return `<button class="comp-card" data-act="exam-open" data-id="${e.id}" style="--c:${colorOf(e)}"><span class="lvb">Lv ${b.L}</span>${ptComp(c.id, mood)}<b>${esc(c.name)}</b><small>${esc(e.name)}</small><span class="bar thin" style="--c:${colorOf(e)}"><i style="width:${(b.prog * 100).toFixed(1)}%"></i></span><small>${ART.HOUSE_NAMES[stg]}${b.tier ? ' · ' + TIER_NAMES[Math.min(4, b.tier)].replace('Rinascita ', '') : ''} · ${MOOD_TEXT[mood].split(':')[0]}</small></button>`; }).join('')}</div>`;
}
function upcomingItems(limit = 6) {
  const t = today(); const rows = [];
  for (const e of activeExams()) {
    const fut = (e.appelli || []).filter(a => a.date && a.date >= t);
    fut.forEach(a => rows.push({ date: a.date, e, a }));
    if (!fut.length) { const r = sessionRange(e.ses, e.ay); if (r && r[1] >= t) rows.push({ date: r[0] >= t ? r[0] : t, e, ses: true, r }); }
  }
  rows.sort((a, b) => a.date.localeCompare(b.date)); return rows.slice(0, limit);
}
function upcomingCard() {
  const rows = upcomingItems(); const t = today();
  return `<section class="card"><div class="card-h"><span class="rib red">${pix('skull')} Prossime prove</span><button class="btn small" data-act="nav" data-v="mappa">${pix('mappa')} Mappa</button></div>
    ${rows.length ? `<div class="list">${rows.map(r => {
      const d = pd(r.date), n = diffDays(t, r.date); const bs = bossState(r.e);
      const sub = r.a ? [APP_TYPES[r.a.type], r.a.time, r.a.place].filter(Boolean).map(esc).join(' · ') : (r.date > t ? `${SESSIONI[r.e.ses].label}: data da inserire` : 'Sessione in corso: aggiungi la data');
      return `<button class="li" data-act="exam-open" data-id="${r.e.id}"><span class="datepill" style="--dp:${colorOf(r.e)}"><b>${d.getDate()}</b><small>${MESI_S[d.getMonth()]}</small></span><span class="grow"><b>${esc(r.e.name)}</b><small>${sub}${r.a && r.a.booked ? ' · prenotato' : ''}</small><span class="bar hp thin" style="margin-top:3px" title="Vita del boss: scende mentre studi"><i style="width:${(bs.hp * 100).toFixed(0)}%"></i></span></span><span class="val ${n <= 14 ? '' : 'muted'}" style="font-size:16px">${inDays(n)}</span></button>`;
    }).join('')}</div>` : `<p class="muted">Nessuna prova in vista. Aggiungi gli appelli dalla scheda di ogni esame.</p>`}</section>`;
}
function todayScheduleCard() {
  const t = today(); const per = periodOf(t); const blocks = (S.profile.schedule[`${S.profile.ay}-${per}`] || []).filter(b => b.day === dow(t)).sort((a, b) => a.start - b.start);
  const nowM = new Date().getHours() * 60 + new Date().getMinutes();
  return `<section class="card"><div class="card-h"><span class="rib sky">${pix('orario')} Oggi in orario</span><button class="btn small" data-act="nav" data-v="orario">Orario</button></div>
    ${blocks.length ? `<div class="list">${blocks.map(b => { const e = exById(b.ex); const past = b.end < nowM; const now = b.start <= nowM && nowM < b.end; return `<button class="li" data-act="blk-edit" data-id="${b.id}" data-per="${per}" style="${past ? 'opacity:.55' : ''}"><span class="datepill" style="width:58px;--dp:${e ? colorOf(e) : 'var(--lav)'}"><b style="font-size:17px">${hm(b.start)}</b><small>${hm(b.end)}</small></span><span class="grow"><b>${esc(e ? e.name : (b.label || BLOCK_TYPES[b.type].label))}</b><small>${now ? '● adesso · ' : ''}${BLOCK_TYPES[b.type].label}${b.place ? ' · ' + esc(b.place) : ''}</small></span>${e ? ptExam(e, 'sm') : ''}</button>`; }).join('')}</div>`
      : `<p class="muted">Niente in orario oggi (${PERIODS.find(p => p.id === per).label}). Organizza lezioni e studio nella sezione Orario.</p>`}</section>`;
}
function todayLogCard() {
  const t = today(); const list = (IX.byDay.get(t) || []).slice().sort((a, b) => (b.t || 0) - (a.t || 0));
  return `<section class="card"><div class="card-h"><span class="rib">${pix('check')} Oggi hai studiato</span><button class="btn small" data-act="log-new">${pix('plus')} Aggiungi</button></div>
    ${list.length ? `<div class="list">${list.map(en => entryRow(en)).join('')}</div>` : `<p class="muted">Ancora niente oggi. I tuoi compagni ti aspettano nella radura.</p>`}</section>`;
}
const SRC_LABEL = { timer: 'sessione libera', pomodoro: 'pomodoro', manuale: 'a mano' };
function entryRow(en, withDate = false) {
  const e = exById(en.ex);
  return `<div class="li">${e ? ptExam(e, 'sm') : '<span class="pt sm"></span>'}<span class="grow"><b>${esc(e ? e.name : 'Esame eliminato')}</b><small>${withDate ? fmtDay(en.d) + ' · ' : ''}${SRC_LABEL[en.src] || en.src}${en.b ? ' · pozione ×1,5' : ''}${en.g ? ' · elisir ×2' : ''}${en.note ? ' · ' + esc(en.note) : ''}</small></span><span class="val">${fmtMin(en.m)}</span><button class="x" data-act="entry-del" data-id="${en.id}" aria-label="Elimina questa sessione">${pix('trash')}</button></div>`;
}

/* ================= STUDIO ================= */
function vStudioTop() {
  return `<section class="card" style="padding:4px"><canvas id="studyScene" class="px" aria-hidden="true"></canvas></section>`;
}
function vStudioBody() {
  const ex = activeExams();
  if ((!T.ex || !exById(T.ex) || exById(T.ex).status === 'superato') && ex[0] && T.phase === 'idle') { T.ex = ex[0].id; tSave(); }
  const busy = T.phase !== 'idle'; const curMode = T.mode || S.profile.timer.mode; const e = timerExam(); const d = timerDisplay();
  const cfg = S.profile.timer.custom; const W = IX.wallet.cons; const bst = activeBoost();
  let btns;
  if (!busy) btns = `<button class="btn primary" data-act="tm-start" ${ex.length ? '' : 'disabled'}>${pix('play')} Inizia</button>`;
  else if (T.phase === 'work') btns = (T.run ? `<button class="btn gold" data-act="tm-pause">${pix('pause')} Pausa</button>` : `<button class="btn primary" data-act="tm-resume">${pix('play')} Riprendi</button>`) + `<button class="btn" data-act="tm-stop">${pix('check')} Termina e salva</button>` + (!T.run ? `<button class="btn ghost small" data-act="tm-cancel">Annulla</button>` : '');
  else if (T.phase === 'break') btns = `<button class="btn primary" data-act="tm-next">${pix('play')} Salta la pausa</button>` + (T.run ? `<button class="btn gold" data-act="tm-pause">${pix('pause')} Pausa</button>` : `<button class="btn" data-act="tm-resume">${pix('play')} Riprendi</button>`) + `<button class="btn" data-act="tm-end">${pix('stop')} Fine</button>`;
  else btns = `<button class="btn primary" data-act="tm-next">${pix('play')} Prossimo giro</button><button class="btn" data-act="tm-end">${pix('stop')} Fine</button>`;
  const modeHint = curMode === 'free' ? 'Avvii, metti in pausa quando vuoi e termini: salvo il tempo trascorso.' : `Ogni giro completato si registra da solo (+10 monete). Pausa lunga ogni ${curMode === 'custom' ? cfg.every : TIMER_MODES[curMode].every} giri. Se termini prima, salvo i minuti fatti.`;
  const timer = `<section class="card timer-card" style="--c:${e ? colorOf(e) : 'var(--acc)'}">
    <div class="card-h"><span class="rib">${pix('clock')} Timer</span><span class="pill ${bst.focusArmed ? 'lav' : ''}">${bst.focusArmed ? pix('potion') + ' Pozione pronta' : bst.oro ? pix('elixir') + ' Monete ×2 attive' : 'Modalità ' + TIMER_MODES[curMode].name}</span></div>
    <div class="modes" role="group" aria-label="Modalità del timer">${Object.entries(TIMER_MODES).map(([k, v]) => `<button class="mode" data-act="tm-mode" data-v="${k}" aria-pressed="${curMode === k}" ${busy ? 'disabled' : ''}><b>${k === 'free' ? 'Libera' : k === 'custom' ? `${cfg.work}/${cfg.brk}` : v.name}</b><small>${k === 'free' ? 'avvia · pausa · stop' : k === 'custom' ? 'su misura' : v.desc}</small></button>`).join('')}</div>
    ${curMode === 'custom' && !busy ? `<div class="custom-cfg"><label>Studio (min)<input type="number" min="5" max="180" value="${cfg.work}" data-cfg="work" inputmode="numeric"></label><label>Pausa<input type="number" min="1" max="60" value="${cfg.brk}" data-cfg="brk" inputmode="numeric"></label><label>Pausa lunga<input type="number" min="1" max="90" value="${cfg.long}" data-cfg="long" inputmode="numeric"></label><label>Ogni (giri)<input type="number" min="1" max="8" value="${cfg.every}" data-cfg="every" inputmode="numeric"></label></div>` : ''}
    ${ex.length ? `<div class="chips scroll" id="tmchips">${ex.map(x => `<button class="chip" data-act="tm-exam" data-id="${x.id}" aria-pressed="${x.id === T.ex}" ${busy && x.id !== T.ex ? 'disabled' : ''}>${ptExam(x)}${esc(x.name)}</button>`).join('')}</div>` : `<p class="muted">Aggiungi un esame per iniziare.</p>`}
    <div class="tdigits" id="tmTime">${d.text}</div><div class="tlabel" id="tmLabel">${d.label}</div>
    <span class="bar tbar" style="--c:${e ? colorOf(e) : 'var(--acc)'}"><i id="tmBar" style="width:${(d.frac * 100).toFixed(2)}%"></i></span>
    <div class="row tctl">${btns}</div>
    <p class="hint" style="margin-top:10px">${modeHint}</p>
    <div class="boost">${CONSUMABLES.map(c => `<button class="btn small ${c.id === 'focus' && bst.focusArmed ? 'lav' : c.id === 'oro' && bst.oro ? 'gold' : ''}" data-act="use-cons" data-id="${c.id}" ${W[c.id] > 0 ? '' : 'disabled'} title="${esc(c.desc)}">${pix(c.icon)} ${W[c.id] || 0}</button>`).join('')}<button class="btn small ghost" data-act="nav" data-v="bottega">Altre in bottega</button></div></section>`;
  return `<div class="study-grid gap">${timer}${calendarCard()}</div>
    <section class="card gap"><div class="card-h"><span class="rib sky">${pix('note')} Ultime sessioni</span><div class="row"><span class="muted num" style="font-weight:800;font-size:13px">${IX.all.length} in tutto</span><button class="btn small" data-act="log-new">${pix('hand')} Segna a mano</button></div></div>
    ${IX.all.length ? `<div class="list">${IX.all.slice(0, 12).map(en => entryRow(en, true)).join('')}</div>` : `<p class="muted">Le sessioni che registri compaiono qui.</p>`}</section>`;
}
function calendarCard() {
  const [y, mo] = S.ui.calMonth.split('-').map(Number); const first = new Date(y, mo - 1, 1);
  const padN = (first.getDay() + 6) % 7, nD = new Date(y, mo, 0).getDate(), t = today();
  let cells = GIORNI_X.map(g => `<span class="wd">${g}</span>`).join('') + '<span class="cd out"></span>'.repeat(padN); let tot = 0;
  for (let i = 1; i <= nD; i++) {
    const d = `${y}-${pad(mo)}-${pad(i)}`; const m = dayMin(d); tot += m;
    const lv = m === 0 ? 0 : m < 30 ? 1 : m < 60 ? 2 : m < 120 ? 3 : m < 180 ? 4 : 5;
    const exs = [...new Set((IX.byDay.get(d) || []).map(e => e.ex))].slice(0, 4).map(id => exById(id)).filter(Boolean);
    const fut = d > t; const sh = S.profile.shields.includes(d);
    cells += `<button class="cd lv${lv} ${d === t ? 'today' : ''} ${fut ? 'fut' : ''}" data-act="day-open" data-d="${d}" ${fut ? 'disabled' : ''} aria-label="${fmtDayLong(d)}: ${fmtMin(m)}" title="${fmtDayLong(d)} · ${fmtMin(m)}${sh ? ' · protetto dallo scudo' : ''}"><b>${i}</b><span class="dots">${sh ? `<img src="${ART.iconURL('shield', 1)}" alt="" style="width:8px;height:8px">` : ''}${exs.map(e => `<i style="--c:${colorOf(e)}"></i>`).join('')}</span></button>`;
  }
  const isCur = S.ui.calMonth >= ymOf(t);
  return `<section class="card"><div class="card-h"><div><span class="rib gold">${pix('orario')} ${cap(MESI[mo - 1])} ${y}</span><p class="hint" style="margin-top:6px">${fmtMin(tot)} nel mese · tocca un giorno per vedere o aggiungere</p></div>
    <div class="row nowrap"><button class="btn icon small" data-act="cal" data-v="-1" aria-label="Mese precedente">${pix('left')}</button><button class="btn icon small" data-act="cal" data-v="1" ${isCur ? 'disabled' : ''} aria-label="Mese successivo">${pix('right')}</button></div></div>
    <div class="cal">${cells}</div>
    <div class="row" style="justify-content:space-between;margin-top:10px"><span class="legend-scale">meno <i style="background:var(--paper2)"></i><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i><i class="lv4"></i><i class="lv5"></i> più</span><span class="hint">quadratini = esami studiati</span></div></section>`;
}

/* ================= ESAMI ================= */
function vEsami() {
  const f = S.ui, all = S.profile.exams;
  const act = all.filter(e => e.status !== 'superato'), passed = all.length - act.length;
  const head = `<div class="vhead"><div><h1>Grimorio degli esami</h1><p class="sub">${act.length} da preparare · ${passed} superati · ${act.reduce((s, e) => s + (e.cfu || 0), 0)} CFU in gioco</p></div><button class="btn primary" data-act="exam-new">${pix('plus')} Nuovo esame</button></div>`;
  if (!all.length) return head + `<section class="card empty">${ptSp('mago', 'xl')}<h2>Il grimorio è vuoto</h2><p>Aggiungi il primo esame: scegli il compagno che ti accompagnerà, il semestre e la sessione.</p><div class="row" style="justify-content:center"><button class="btn primary" data-act="exam-new">${pix('plus')} Aggiungi esame</button><button class="btn" data-act="demo-load">Esplora con esempi</button></div></section>`;
  const list = all.filter(e => (f.fSem === 'all' || String(e.sem) === f.fSem) && (f.fSes === 'all' || e.ses === f.fSes) && (f.fPassed || e.status !== 'superato'));
  const filters = `<div class="filters">
    <div class="chips scroll">${[['all', 'Tutti i semestri'], ['1', '1° semestre'], ['2', '2° semestre'], ['0', 'Annuali']].map(([v, l]) => `<button class="chip" data-act="f-sem" data-v="${v}" aria-pressed="${f.fSem === v}">${l}</button>`).join('')}</div>
    <div class="chips scroll">${[['all', 'Tutte le sessioni'], ['inv', 'Invernale · gen–feb'], ['est', 'Estiva · giu–lug'], ['aut', 'Autunnale · set']].map(([v, l]) => `<button class="chip" data-act="f-ses" data-v="${v}" aria-pressed="${f.fSes === v}">${l}</button>`).join('')}<button class="chip" data-act="f-passed" aria-pressed="${f.fPassed}">${pix('check')} Superati</button></div></div>`;
  if (!list.length) return head + filters + `<section class="card empty"><p>Nessun esame con questi filtri.</p></section>`;
  const groups = new Map(); list.forEach(e => { const k = e.ay + '-' + e.ses; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); });
  const keys = [...groups.keys()].sort((a, b) => { const [ya, sa] = a.split('-'), [yb, sb] = b.split('-'); return sessionRange(sa, +ya)[0].localeCompare(sessionRange(sb, +yb)[0]); });
  const wk = weekStats(weekStart(today()));
  return head + filters + keys.map(k => {
    const [y, s] = k.split('-'); const es = groups.get(k).sort(sortExams); const r = sessionRange(s, +y); const n = diffDays(today(), r[0]);
    return `<div class="group-h"><span class="rib ${s === 'inv' ? 'sky' : s === 'est' ? 'gold' : 'red'}">${SESSIONI[s].label} ${+y + 1}</span><span class="muted">${SESSIONI[s].realm} · ${SESSIONI[s].months} · a.a. ${ayLabel(+y)} · ${es.length} ${es.length === 1 ? 'esame' : 'esami'}${n > 0 ? ' · inizia ' + inDays(n) : r[1] >= today() ? ' · in corso' : ' · conclusa'}</span></div>
      <div class="exams">${es.map(e => examCard(e, wk)).join('')}</div>`;
  }).join('');
}
function targetText(e) {
  if (e.status === 'superato') return `Superato${e.grade ? ` con ${e.grade}${e.lode ? ' e lode' : ''}` : ''}${e.passedOn ? ' il ' + fmtDay(e.passedOn) : ''}`;
  const tg = examTarget(e); const t = today();
  if (!tg) return 'Sessione passata: scegline una nuova';
  if (tg.kind === 'appello') return `${APP_TYPES[tg.a.type]} ${fmtDay(tg.date)} · ${inDays(diffDays(t, tg.date))}`;
  return tg.inSession ? 'Sessione in corso: aggiungi l\'appello' : `${SESSIONI[e.ses].label} ${inDays(diffDays(t, tg.date))}`;
}
function examCard(e, wk) {
  const c = compById(e.comp); const st = STATUS[e.status]; const m = examMin(e.id);
  const passed = e.status === 'superato';
  const hist = passed && c ? c.history.findIndex(h => h.ex === e.id) : -1;
  const b = c && !passed ? compBond(c) : null; const lvl = passed && hist >= 0 ? c.history[hist].level : b ? b.L : 0;
  const bs = bossState(e);
  return `<button class="exam-card" data-act="exam-open" data-id="${e.id}" style="--c:${colorOf(e)}">
    <span class="ec-side">${passed && hist >= 0 ? `<span class="pt" data-pt="h:${c.id}:${hist}"></span>` : ptExam(e)}<span class="ec-lv">Lv ${lvl}</span></span>
    <span class="ec-body"><span class="ec-top"><b>${esc(e.name)}</b><span class="pill ${st.cls}">${st.label}</span></span>
      <span class="ec-meta">${[c ? c.name : '', SEMESTRI[e.sem], e.cfu ? e.cfu + ' CFU' : '', e.teacher].filter(Boolean).map(esc).join(' · ')}</span>
      <span class="ec-next">${pix(passed ? 'trophy' : 'skull')} ${esc(targetText(e))}</span>
      ${passed ? '' : `<span class="ec-row"><span>Legame</span><span class="bar thin" style="--c:${colorOf(e)}"><i style="width:${((b ? b.prog : 0) * 100).toFixed(1)}%"></i></span><span>${ART.HOUSE_NAMES[ART.houseStage(lvl)]}</span></span>
      <span class="ec-row"><span>${esc(bs.boss.name)}</span><span class="bar hp thin"><i style="width:${(bs.hp * 100).toFixed(0)}%"></i></span><span>${Math.round(bs.hp * 100)}%</span></span>`}
      <span class="ec-meta">${fmtMin(m)} in tutto · ${fmtMin(wk.per.get(e.id) || 0)} questa settimana</span></span></button>`;
}

/* ================= ORARIO ================= */
function curPer() { return S.ui.per || periodOf(today()); }
function vOrario() {
  const p = S.profile, t = today(), per = curPer(), ay = p.ay; const key = `${ay}-${per}`; const blocks = p.schedule[key] || [];
  const days = p.hours.sunday ? 7 : 6; const narrow = window.innerWidth < 700; const mode = S.ui.oMode || (narrow ? 'day' : 'week');
  const tdow = dow(t); let cd = S.ui.oDay ?? (tdow < days ? tdow : 0); if (cd >= days) cd = 0;
  const isNowPer = per === periodOf(t) && ay === currentAY(t);
  const pex = p.exams.filter(e => examInPeriod(e, per) && e.ay === ay);
  const head = `<div class="vhead"><div><h1>Orario</h1><p class="sub">La settimana tipo di lezioni e studio per semestre e sessione · a.a. ${ayLabel(ay)}</p></div>
    <div class="row"><button class="btn small" data-act="per-copy">${pix('copy')} Copia da…</button><button class="btn primary small" data-act="blk-new">${pix('plus')} Blocco</button></div></div>`;
  const periods = `<div class="periods">${PERIODS.map(pp => `<button class="per" data-act="per" data-v="${pp.id}" aria-pressed="${pp.id === per}"><b>${pp.label}</b><small>${pp.id === periodOf(t) && ay === currentAY(t) ? '<span class="now">● adesso</span> · ' : ''}${pp.sub} · ${(p.schedule[ay + '-' + pp.id] || []).length} blocchi</small></button>`).join('')}</div>`;
  const toolbar = `<div class="row" style="justify-content:space-between;margin:14px 0 10px"><div class="seg" role="group" aria-label="Vista"><button data-act="o-mode" data-v="week" aria-pressed="${mode === 'week'}">Settimana</button><button data-act="o-mode" data-v="day" aria-pressed="${mode === 'day'}">Giorno</button></div><span class="hint">${pex.length} ${pex.length === 1 ? 'esame' : 'esami'} in questo periodo · tocca uno spazio vuoto per aggiungere</span></div>`;
  const daypick = mode === 'day' ? `<div class="daypick" style="--days:${days}">${[...Array(days)].map((_, i) => `<button data-act="o-day" data-v="${i}" aria-pressed="${i === cd}" class="${isNowPer && i === tdow ? 'today' : ''}">${GIORNI_S[i]}</button>`).join('')}</div>` : '';
  const cols = mode === 'day' ? [cd] : [...Array(days).keys()];
  const legend = `<div class="tt-legend">${Object.entries(BLOCK_TYPES).map(([k, v]) => `<span><i class="blk ${v.cls}" style="position:static;padding:0;display:inline-block"></i>${v.label}</span>`).join('')}</div>`;
  return head + periods + toolbar + daypick + ttGrid(blocks, cols, isNowPer ? tdow : -1) + legend + `<div class="grid2 gap">${plannedCard(per, ay, pex)}${periodExamsCard(per, ay, pex)}</div>`;
}
function layoutLanes(bs) {
  const out = []; let cluster = [], end = -1;
  const flush = () => { const ends = []; const part = cluster.map(b => { let l = ends.findIndex(x => x <= b.start); if (l < 0) { l = ends.length; ends.push(b.end); } else ends[l] = b.end; return { b, l }; }); part.forEach(o => { o.n = ends.length; out.push(o); }); cluster = []; end = -1; };
  for (const b of bs) { if (cluster.length && b.start >= end) flush(); cluster.push(b); end = Math.max(end, b.end); }
  if (cluster.length) flush(); return out;
}
function ttGrid(blocks, cols, tday) {
  const h = S.profile.hours, st = h.start * 60, en = h.end * 60, HH = 52, Hh = (en - st) / 60 * HH;
  const nowD = new Date(), nowM = nowD.getHours() * 60 + nowD.getMinutes();
  let out = `<div class="tt-wrap" id="ttwrap"><div class="tt" style="--days:${cols.length};--h:${Hh}px;${cols.length === 1 ? '--colw:220px' : ''}"><div class="tt-hd"></div>`;
  out += cols.map(d => `<div class="tt-hd ${d === tday ? 'today' : ''}">${cols.length === 1 ? GIORNI[d] : GIORNI_S[d]}</div>`).join('');
  out += `<div class="tt-times">${[...Array(Math.max(0, h.end - h.start - 1))].map((_, i) => `<span style="top:${(i + 1) * HH}px">${pad(h.start + i + 1)}:00</span>`).join('')}</div>`;
  for (const d of cols) {
    const bs = blocks.filter(b => b.day === d && b.end > st && b.start < en).sort((a, b) => a.start - b.start || b.end - a.end);
    out += `<div class="tt-col ${d === tday ? 'today' : ''}" data-day="${d}">`;
    if (d === tday && nowM >= st && nowM <= en) out += `<div class="now-line" style="top:${(nowM - st) / 60 * HH}px"></div>`;
    for (const { b, l, n } of layoutLanes(bs)) {
      const e = exById(b.ex); const c = e ? colorOf(e) : '#8E7CD6';
      const top = (Math.max(b.start, st) - st) / 60 * HH, ht = Math.max(24, (Math.min(b.end, en) - Math.max(b.start, st)) / 60 * HH - 3);
      const title = e ? e.name : (b.label || BLOCK_TYPES[b.type].label);
      out += `<button class="blk ${BLOCK_TYPES[b.type].cls}" data-act="blk-edit" data-id="${b.id}" style="--c:${c};top:${top + 1}px;height:${ht}px;left:calc(${(l / n * 100).toFixed(3)}% + 3px);width:calc(${(100 / n).toFixed(3)}% - 6px)" title="${esc(title)} · ${hm(b.start)}–${hm(b.end)}"><b>${esc(title)}</b><small>${hm(b.start)}–${hm(b.end)} · ${BLOCK_TYPES[b.type].label}</small>${b.place ? `<small>${esc(b.place)}</small>` : ''}</button>`;
    }
    out += `</div>`;
  }
  return out + `</div></div>`;
}
function plannedCard(per, ay, pex) {
  const pl = plannedWeek(per, ay); const ids = [...new Set([...pex.map(e => e.id), ...pl.keys()])].filter(id => exById(id));
  if (!ids.length) return `<section class="card"><span class="rib">${pix('clock')} Ore pianificate</span><p class="muted" style="margin-top:10px">Aggiungi esami a questo periodo o blocchi all'orario per vedere le ore della settimana tipo.</p></section>`;
  let tl = 0, ts = 0;
  const rows = ids.map(id => { const e = exById(id); const o = pl.get(id) || { lez: 0, stu: 0 }; tl += o.lez; ts += o.stu; return `<tr><td><span class="row nowrap" style="gap:8px"><span class="dot" style="--c:${colorOf(e)}"></span>${esc(e.name)}</span></td><td class="n">${o.lez ? fmtMin(o.lez) : '–'}</td><td class="n">${o.stu ? fmtMin(o.stu) : '–'}</td></tr>`; }).join('');
  return `<section class="card"><div class="card-h"><span class="rib">${pix('clock')} Ore pianificate</span><span class="pill">${fmtMin(tl + ts)} a settimana</span></div>
    <div class="tablewrap"><table class="mini-t"><thead><tr><th>Esame</th><th class="n">Lezioni</th><th class="n">Studio</th></tr></thead><tbody>${rows}<tr><td><b>Totale</b></td><td class="n"><b>${fmtMin(tl)}</b></td><td class="n"><b>${fmtMin(ts)}</b></td></tr></tbody></table></div>
    ${ts < S.profile.goals.week * .6 ? `<p class="hint" style="margin-top:10px">Lo studio pianificato è sotto il tuo obiettivo di ${fmtMin(S.profile.goals.week)}: aggiungi qualche blocco di studio.</p>` : ''}</section>`;
}
function periodExamsCard(per, ay, pex) {
  if (SESSIONI[per]) {
    const r = sessionRange(per, ay); const rows = [];
    S.profile.exams.forEach(e => (e.appelli || []).forEach(a => { if (a.date >= r[0] && a.date <= r[1]) rows.push({ e, a }); }));
    rows.sort((x, y) => x.a.date.localeCompare(y.a.date));
    return `<section class="card"><div class="card-h"><span class="rib red">${pix('skull')} Appelli della sessione</span><span class="pill">${fmtDay(r[0])} – ${fmtDay(r[1])}</span></div>
      ${rows.length ? `<div class="list">${rows.map(({ e, a }) => { const d = pd(a.date); return `<button class="li" data-act="exam-open" data-id="${e.id}"><span class="datepill" style="--dp:${colorOf(e)}"><b>${d.getDate()}</b><small>${MESI_S[d.getMonth()]}</small></span><span class="grow"><b>${esc(e.name)}</b><small>${[APP_TYPES[a.type], a.time, a.place].filter(Boolean).map(esc).join(' · ')}</small></span>${a.booked ? '<span class="pill good">Prenotato</span>' : '<span class="pill">Da prenotare</span>'}</button>`; }).join('')}</div>` : `<p class="muted">Nessun appello in questa sessione. Inseriscili dalla scheda di ogni esame.</p>`}</section>`;
  }
  return `<section class="card"><div class="card-h"><span class="rib sky">${pix('esami')} Esami del semestre</span></div>
    ${pex.length ? `<div class="list">${pex.map(e => `<button class="li" data-act="exam-open" data-id="${e.id}">${ptExam(e, 'sm')}<span class="grow"><b>${esc(e.name)}</b><small>${esc(targetText(e))}</small></span></button>`).join('')}</div>` : `<p class="muted">Nessun esame assegnato a questo semestre per l'a.a. ${ayLabel(ay)}.</p>`}</section>`;
}

/* ================= ORACOLO ================= */
function vOracolo() {
  const ws = addDays(weekStart(today()), S.ui.wOff * 7); const o = oracle(ws); const prev = weekStats(addDays(ws, -7)); const st = o.st;
  const head = `<div class="vhead"><div><h1>L'Oracolo</h1><p class="sub">Com'è andata la settimana, cosa hai studiato di più e cosa ti consiglio.</p></div>
    <div class="weeknav"><button class="btn icon small" data-act="wk" data-v="-1" aria-label="Settimana precedente">${pix('left')}</button><b>${o.current ? 'Questa settimana' : fmtWeek(ws)}</b><button class="btn icon small" data-act="wk" data-v="1" ${S.ui.wOff >= 0 ? 'disabled' : ''} aria-label="Settimana successiva">${pix('right')}</button></div></div>`;
  const dlt = st.total - prev.total;
  const touched = o.items.filter(i => i.act > 0).length, actN = o.items.filter(i => i.w > 0).length;
  const kpis = `<div class="kpi-row">
    <div class="kpi"><small>Studio</small><b>${fmtMin(st.total)}</b><span>di ${fmtMin(o.goal)} · <span class="delta ${dlt >= 0 ? 'up' : 'down'}">${dlt >= 0 ? '▲' : '▼'} ${fmtMin(Math.abs(dlt))}</span></span></div>
    <div class="kpi"><small>Giorni attivi</small><b>${st.active}/7</b><span>${st.active ? 'media ' + fmtMin(st.total / st.active) + ' al giorno' : 'nessun giorno ancora'}</span></div>
    <div class="kpi"><small>Materie toccate</small><b>${touched}/${actN}</b><span>${actN - touched > 0 ? (actN - touched) + ' trascurate' : 'nessuna trascurata'}</span></div>
    <div class="kpi"><small>Equilibrio</small><b>${st.total ? o.balance + '%' : '–'}</b><span>${st.total ? balanceWord(o.balance) : 'studia per misurarlo'}</span></div></div>`;
  return head + kpis + `<div class="grid2 gap">${rankCard(o)}${adviceCard(o)}${daysCard(o)}${planVsDoneCard(o)}</div><div class="grid2 gap">${trendCard()}${totalsCard()}</div>`;
}
function rankCard(o) {
  const items = [...o.items].sort((a, b) => b.act - a.act || b.share - a.share);
  if (!items.length) return `<section class="card"><span class="rib">${pix('star')} Cosa hai studiato</span><p class="muted" style="margin-top:10px">Aggiungi esami per vedere la classifica.</p></section>`;
  const max = Math.max(1, ...items.map(i => Math.max(i.act, i.exp)));
  return `<section class="card"><div class="card-h"><span class="rib">${pix('star')} Cosa hai studiato di più</span><span class="pill">${fmtWeek(o.st.ws)}</span></div>
    <div class="ranks">${items.map((i, k) => `<div class="rank" title="${esc(i.e.name)}: ${fmtMin(i.act)} studiati, circa ${fmtMin(i.exp)} consigliati">${ptExam(i.e, 'sm')}<div style="min-width:0;display:grid;gap:3px"><div class="rank-top"><b>${k === 0 && i.act ? pix('crown') + ' ' : ''}${esc(i.e.name)}</b><span>${fmtMin(i.act)} · ${pct(i.actShare)}</span></div>
      <span class="bar" style="--c:${colorOf(i.e)}"><i style="width:${(i.act / max * 100).toFixed(1)}%"></i>${i.w > 0 ? `<em style="left:${Math.min(99, i.exp / max * 100).toFixed(1)}%"></em>` : ''}</span></div></div>`).join('')}</div>
    <p class="hint" style="margin-top:12px">La tacca scura indica quanto tempo l'Oracolo avrebbe dato a ogni esame, in base a vicinanza dell'appello e CFU.</p>
    <details class="more"><summary>Vedi come tabella</summary><div class="tablewrap"><table class="mini-t"><thead><tr><th>Esame</th><th class="n">Studiato</th><th class="n">Quota</th><th class="n">Consigliato</th></tr></thead><tbody>${items.map(i => `<tr><td>${esc(i.e.name)}</td><td class="n">${fmtMin(i.act)}</td><td class="n">${pct(i.actShare)}</td><td class="n">${fmtMin(i.exp)}</td></tr>`).join('')}</tbody></table></div></details></section>`;
}
function adviceCard(o) {
  const title = o.ended ? 'Il verdetto' : o.current ? 'Anteprima del verdetto' : 'Il verdetto';
  const ai = S.ui.ai; const busy = ai && (ai.state === 'thinking' || ai.state === 'writing');
  const recs = o.top.length ? o.top : o.items.filter(i => i.w > 0).slice(0, 1);
  return `<section class="card"><div class="card-h"><span class="rib lav">${pix('oracolo')} ${title}</span>${o.current ? '<span class="pill">completo domenica</span>' : '<span class="pill lav">consiglio</span>'}</div>
    ${o.st.total ? `<p>${o.fav && o.fav.act ? `Il tuo preferito è stato <b>${esc(o.fav.e.name)}</b> con ${fmtMin(o.fav.act)} (${pct(o.fav.actShare)}). ` : ''}${o.top.length ? 'Ecco chi ha bisogno di te' + (o.ended ? ' la prossima settimana' : ' nei prossimi giorni') + ':' : 'Hai distribuito bene il tempo tra gli esami.'}</p>` : `<p>${o.current ? 'Questa settimana non hai ancora studiato. Ecco da dove partire:' : 'In questa settimana non hai registrato studio.'}</p>`}
    <div class="advice">${recs.map(i => `<div class="adv">${ptExam(i.e, 'framed')}<div style="min-width:0"><b>${esc(compName(i.e))} · ${esc(i.e.name)}</b><p>${adviceLine(i)}</p><p>${whyLine(i)}${whyLine(i) ? ' · ' : ''}consigliate <b>${fmtMin(i.next)}</b> la prossima settimana</p>
      <div class="row"><button class="btn small primary" data-act="tm-go" data-id="${i.e.id}">${pix('play')} Studia ora</button><button class="btn small" data-act="plan-study" data-id="${i.e.id}">${pix('orario')} In orario</button></div></div></div>`).join('')}</div>
    ${S.sample ? `<div class="row" style="margin-top:14px"><button class="btn lav small" data-act="ai-ask" ${busy ? 'disabled' : ''}>${pix('wand')} Chiedi all'Oracolo un piano su misura</button>${busy ? `<button class="btn small ghost" data-act="ai-stop">${pix('stop')} Ferma</button>` : ''}</div>
      ${ai ? `<div class="ai-box" id="aiBox">${esc(aiShown())}</div>` : ''}` : ''}</section>`;
}
function aiShown() { const ai = S.ui.ai; if (!ai) return ''; if (ai.state === 'thinking') return 'L\'Oracolo consulta le stelle…'; return (ai.text || '').replace(/\*\*/g, '') + (ai.msg ? '\n\n' + ai.msg : '') + (ai.truncated ? '\n\n(Risposta interrotta: chiedi di nuovo per il resto.)' : ''); }
function daysCard(o) {
  const st = o.st, g = S.profile.goals.day; const totals = st.perDay.map(m => [...m.values()].reduce((a, b) => a + b, 0));
  const max = Math.max(g * 1.15, ...totals, 30); const t = today();
  const exIds = [...st.per.keys()].filter(id => exById(id));
  return `<section class="card"><div class="card-h"><span class="rib sky">${pix('orario')} Giorno per giorno</span><span class="hint">linea rossa = ${fmtMin(g)}</span></div>
    <div class="dchart"><div class="goal-line" style="bottom:calc(22px + (100% - 40px) * ${(g / max).toFixed(3)})"></div>
    ${st.days.map((d, i) => { const segs = [...st.perDay[i].entries()].filter(([id]) => exById(id)); const h = totals[i] / max * 100;
      return `<div class="dcol"><span class="v">${totals[i] ? fmtMin(totals[i]) : ''}</span><div class="dstack" style="height:${h.toFixed(1)}%;align-self:end;${totals[i] ? '' : 'border:0'}">${segs.map(([id, m]) => `<i style="--c:${colorOf(exById(id))};flex:${m} 1 0" title="${esc(exById(id).name)}: ${fmtMin(m)}"></i>`).join('')}</div><span class="d ${d === t ? 'today' : ''}">${GIORNI_X[i]}</span></div>`;
    }).join('')}</div>
    ${exIds.length ? `<div class="legend">${exIds.map(id => `<span><i style="--c:${colorOf(exById(id))}"></i>${esc(exById(id).name)}</span>`).join('')}</div>` : '<p class="hint" style="margin-top:8px">Nessuna sessione registrata in questa settimana.</p>'}</section>`;
}
function planVsDoneCard(o) {
  const per = periodOf(o.st.ws); const pl = plannedWeek(per, S.profile.ay);
  const rows = [...pl.entries()].filter(([id, v]) => v.stu > 0 && exById(id));
  if (!rows.length) return `<section class="card"><span class="rib gold">${pix('check')} Pianificato e fatto</span><p class="muted" style="margin-top:10px">Aggiungi blocchi di <b>studio</b> all'orario per confrontare il piano con quello che fai davvero.</p><div class="row" style="margin-top:12px"><button class="btn small" data-act="nav" data-v="orario">${pix('orario')} Vai all'orario</button></div></section>`;
  const max = Math.max(...rows.map(([id, v]) => Math.max(v.stu, o.st.per.get(id) || 0)), 1);
  return `<section class="card"><div class="card-h"><span class="rib gold">${pix('check')} Pianificato e fatto</span><span class="hint">studio in orario vs registrato</span></div>
    <div class="ranks">${rows.map(([id, v]) => { const e = exById(id), done = o.st.per.get(id) || 0; return `<div class="rank">${ptExam(e, 'sm')}<div style="min-width:0;display:grid;gap:3px"><div class="rank-top"><b>${esc(e.name)}</b><span>${fmtMin(done)} di ${fmtMin(v.stu)}</span></div><span class="bar" style="--c:${colorOf(e)}"><i style="width:${(done / max * 100).toFixed(1)}%"></i><em style="left:${Math.min(99, v.stu / max * 100).toFixed(1)}%"></em></span></div></div>`; }).join('')}</div>
    <p class="hint" style="margin-top:10px">La tacca indica lo studio pianificato nell'orario del periodo.</p></section>`;
}
function trendCard() {
  const wks = weeksBack(12); const tots = wks.map(w => weekStats(w).total); const g = S.profile.goals.week;
  const max = Math.max(g * 1.1, ...tots, 60); const sel = addDays(weekStart(today()), S.ui.wOff * 7);
  return `<section class="card"><div class="card-h"><span class="rib">${pix('star')} Ultime 12 settimane</span><span class="hint">linea = ${fmtMin(g)}</span></div>
    <div class="weeks"><div class="goal-line" style="bottom:calc(18px + (100% - 18px) * ${(g / max).toFixed(3)})"></div>${wks.map((w, i) => `<button class="wc ${w === sel ? 'cur' : ''}" data-act="wk-set" data-ws="${w}" title="${fmtWeek(w)}: ${fmtMin(tots[i])}" aria-label="Settimana ${fmtWeek(w)}: ${fmtMin(tots[i])}"><span class="wb" style="height:${(tots[i] / max * 100).toFixed(1)}%"></span><small>${pd(w).getDate()}/${pd(w).getMonth() + 1}</small></button>`).join('')}</div>
    <p class="hint" style="margin-top:8px">Media: ${fmtMin(tots.reduce((a, b) => a + b, 0) / 12)} a settimana · tocca una barra per aprirla.</p></section>`;
}
function totalsCard() {
  const ex = S.profile.exams.filter(e => examMin(e.id) > 0).sort((a, b) => examMin(b.id) - examMin(a.id));
  const max = Math.max(1, ...ex.map(e => examMin(e.id)));
  return `<section class="card"><div class="card-h"><span class="rib gold">${pix('chest')} Da sempre</span><span class="pill">${fmtMin(IX.total)} totali</span></div>
    ${ex.length ? `<div class="ranks">${ex.map(e => { const m = examMin(e.id); return `<div class="rank">${ptExam(e, 'sm')}<div style="min-width:0;display:grid;gap:3px"><div class="rank-top"><b>${esc(e.name)}</b><span>${fmtMin(m)}</span></div><span class="bar" style="--c:${colorOf(e)}"><i style="width:${(m / max * 100).toFixed(1)}%"></i></span></div></div>`; }).join('')}</div>
      <p class="hint" style="margin-top:10px">Record di giorni di fila: ${bestStreak()} · pomodori completati: ${IX.pomos}</p>` : '<p class="muted">Qui vedrai le ore totali per ogni esame.</p>'}</section>`;
}

/* ================= TROFEI ================= */
function vTrofei() {
  const a = achievements(); const n = a.filter(x => x.ok).length; const c = career();
  return `<div class="vhead"><div><h1>Bacheca dei trofei</h1><p class="sub">${n} trofei su ${a.length} · ogni trofeo vale ${ACH_COINS} monete</p></div></div>
    <div class="grid2"><section class="card"><div class="card-h"><span class="rib gold">${pix('trophy')} Carriera</span></div>
      <div class="kv"><div><small>Esami superati</small><b>${c.passed}</b></div><div><small>CFU ottenuti</small><b>${c.cfu}${c.totalCfu ? ` / ${c.totalCfu}` : ''}</b></div>
      <div><small>Media ponderata</small><b>${c.avg ? c.avg.toFixed(2).replace('.', ',') : '–'}</b></div><div><small>Base di laurea</small><b>${c.base ? c.base.toFixed(1).replace('.', ',') + '/110' : '–'}</b></div></div>
      <p class="hint" style="margin-top:10px">La media usa voti e CFU degli esami superati (la lode conta 30).</p></section>
      <section class="card"><div class="card-h"><span class="rib">${pix('flame')} Statistiche</span></div><div class="kv">
        <div><small>Studio totale</small><b>${fmtMin(IX.total)}</b></div><div><small>Serie attuale</small><b>${streak()} gg</b></div><div><small>Serie record</small><b>${bestStreak()} gg</b></div><div><small>Pomodori</small><b>${IX.pomos}</b></div>
        <div><small>Livello</small><b>${IX.lv.L}</b></div><div><small>Monete guadagnate</small><b>${num(IX.wallet.earned)}</b></div><div><small>Obiettivi giornalieri</small><b>${IX.wallet.goalDays}</b></div><div><small>Settimane piene</small><b>${IX.wallet.goalWeeks}</b></div></div></section></div>
    <section class="card gap"><div class="card-h"><span class="rib">${pix('star')} Trofei</span><span class="pill gold">${n}/${a.length}</span></div>
    <div class="trophies">${a.map(x => `<div class="tro ${x.ok ? '' : 'locked'}" title="${esc(x.d)}"><img class="medal" src="${medalURL(x.c, x.k)}" alt=""><b>${x.t}</b><small>${x.d}${x.ok && S.profile.seen.ach && S.profile.seen.ach[x.id] ? '<br>' + fmtDay(S.profile.seen.ach[x.id]) : ''}</small></div>`).join('')}</div></section>`;
}

/* ================= MAPPA ================= */
function vMappaTop() {
  return `<div class="vhead"><div><h1>Mappa delle sessioni</h1><p class="sub">Il cammino dell'anno accademico ${ayLabel(S.profile.ay)}: trascina per esplorare, tocca un boss per aprire l'esame.</p></div></div>
    <section class="map-wrap"><canvas id="mapc" class="px" aria-label="Mappa a scorrimento dell'anno accademico con i boss degli appelli"></canvas><div class="map-ctl"><button class="btn small gold" data-act="map-today">${pix('user')} Oggi</button></div></section>`;
}
function vMappaBody() {
  const ay = S.profile.ay; const t = today();
  const jumps = [['Ott', `${ay}-10-01`], ['1° sem.', `${ay}-10-15`], ['Inverno', sessionRange('inv', ay)[0]], ['2° sem.', `${ay + 1}-03-01`], ['Estate', sessionRange('est', ay)[0]], ['Autunno', sessionRange('aut', ay)[0]]];
  const rows = []; for (const e of S.profile.exams) for (const a of e.appelli || []) if (a.date >= t) rows.push({ e, a });
  rows.sort((x, y) => x.a.date.localeCompare(y.a.date));
  return `<div class="chips scroll gap">${jumps.map(([l, d]) => `<button class="chip" data-act="map-go" data-d="${d}">${l}</button>`).join('')}</div>
    <div class="grid2 gap"><section class="card"><div class="card-h"><span class="rib red">${pix('skull')} Boss in arrivo</span></div>
      ${rows.length ? `<div class="list">${rows.slice(0, 10).map(({ e, a }) => { const bs = bossState(e); const d = pd(a.date); return `<button class="li" data-act="map-go" data-d="${a.date}">${ptBoss(bs.boss.id, 'sm')}<span class="grow"><b>${esc(bs.boss.name)} · ${esc(e.name)}</b><small>${APP_TYPES[a.type]} ${d.getDate()} ${MESI_S[d.getMonth()]} · ${inDays(diffDays(t, a.date))}</small><span class="bar hp thin" style="margin-top:3px"><i style="width:${(bs.hp * 100).toFixed(0)}%"></i></span></span><span class="val" style="font-size:16px">${Math.round(bs.hp * 100)}%</span></button>`; }).join('')}</div>` : `<p class="muted">Nessun appello futuro inserito. Aggiungili dalla scheda di ogni esame: ogni appello diventa un boss sulla mappa.</p>`}</section>
      <section class="card"><div class="card-h"><span class="rib sky">${pix('mappa')} Come si legge</span></div><ol class="steps">
        <li><span><b>Il cammino</b> va da ottobre a settembre: autunno, il Regno d'Inverno (gen–feb), primavera, le Isole d'Estate (giu–lug) e il Bosco d'Autunno (set).</span></li>
        <li><span><b>Ogni appello è un boss</b> con una barra di vita: scende man mano che studi quell'esame, fino all'obiettivo di ore (CFU × 8h, oppure quello che scegli).</span></li>
        <li><span><b>Il tuo avatar</b> sta sul giorno di oggi, con i compagni degli esami in corso al seguito.</span></li></ol></section></div>`;
}

/* ================= ALBO DEGLI EROI ================= */
function vAlbo() {
  const P = S.profile; const entries = [];
  P.companions.forEach(c => c.history.forEach((h, i) => entries.push({ c, h, i })));
  entries.sort((a, b) => (b.h.passedOn || '').localeCompare(a.h.passedOn || ''));
  const c = career();
  const head = `<div class="vhead"><div><h1>Albo degli Eroi</h1><p class="sub">La sala dove riposano le leggende: ogni esame superato con il suo compagno, gli abiti, le ali, le aure e i poteri conquistati.</p></div></div>
    <div class="kpi-row"><div class="kpi"><small>Eroi nell'Albo</small><b>${entries.length}</b><span>${c.cfu} CFU conquistati</span></div><div class="kpi"><small>Media</small><b>${c.avg ? c.avg.toFixed(2).replace('.', ',') : '–'}</b><span>${c.base ? 'base ' + c.base.toFixed(1).replace('.', ',') + '/110' : 'nessun voto ancora'}</span></div><div class="kpi"><small>Ore leggendarie</small><b>${fmtMin(entries.reduce((s, x) => s + (x.h.min || 0), 0))}</b><span>studiate per gli esami superati</span></div><div class="kpi"><small>Rinascite</small><b>${P.companions.filter(x => x.history.length && IX.active.has(x.id)).length}</b><span>compagni in una nuova avventura</span></div></div>`;
  if (!entries.length) return head + `<section class="card gap empty">${pix('albo', '', 6)}<h2>La sala attende il primo eroe</h2><p style="max-width:520px">Quando segni un esame come superato, il suo compagno entra qui con il voto, le ore, i giorni di studio e tutto ciò che avete sbloccato. Potrai poi richiamarlo per un nuovo esame: ripartirà dal livello 0 con nuovi premi da sbloccare.</p></section>`;
  return head + `<div class="hall-grid gap">${entries.map(({ c, h, i }) => legendCard(c, h, i)).join('')}</div>`;
}
function legendCard(c, h, i) {
  const sp = SPECIES_BY[c.sp]; const loot = bondRewards(c.sp, h.tier || 0).filter(r => r.L <= (h.level || 0));
  const boss = BOSSES.find(b => b.id === h.boss);
  const active = IX.active.get(c.id);
  const months = Object.entries(h.months || {}).sort((a, b) => a[0].localeCompare(b[0])); const mx = Math.max(1, ...months.map(m => m[1]));
  return `<article class="legend-card"><div class="lg-top"><span class="pt framed" data-pt="h:${c.id}:${i}" style="width:110px;height:110px"></span>
    <div style="min-width:0;display:grid;gap:4px"><div class="row"><span class="tier-badge tier-${Math.min(4, h.tier || 0)}">${TIER_NAMES[Math.min(4, h.tier || 0)]}</span>${h.lode ? '<span class="pill gold">Lode</span>' : ''}</div>
      <h2 style="font-size:26px;overflow-wrap:anywhere">${esc(h.name)}</h2><p class="muted" style="font-weight:800">${esc(c.name)} · ${esc(sp ? sp.name : '')}</p>
      <div class="row"><span class="lg-grade">${h.grade || '–'}${h.lode ? '<small>L</small>' : ''}<small>/30</small></span><span class="hint">${h.passedOn ? 'il ' + fmtDayYear(h.passedOn) : ''}${h.cfu ? ' · ' + h.cfu + ' CFU' : ''}</span></div></div></div>
    <div class="lg-stats"><div><b>${fmtMin(h.min || 0)}</b><small>studio</small></div><div><b>${h.sessions || 0}</b><small>sessioni</small></div><div><b>${h.days || 0}</b><small>giorni</small></div><div><b>Lv ${h.level || 0}</b><small>legame</small></div></div>
    ${months.length ? `<div><div class="mbars" style="--c:${COLORS[h.color] || 'var(--acc)'}">${months.map(([k, v]) => `<i style="height:${(v / mx * 100).toFixed(0)}%" title="${MESI[Number(k.slice(5)) - 1]}: ${fmtMin(v)}"></i>`).join('')}</div><div class="mbars-l">${months.map(([k]) => `<span>${MESI_S[Number(k.slice(5)) - 1]}</span>`).join('')}</div></div>` : ''}
    <p class="hint">${h.bestDay ? `Giorno record: ${fmtDay(h.bestDay)} con ${fmtMin(h.bestMin)}` : ''}${h.firstDay ? ` · dal ${fmtDay(h.firstDay)} al ${fmtDay(h.lastDay)}` : ''}${boss ? ` · ha sconfitto ${boss.name}` : ''}</p>
    <div><p class="lbl" style="margin-bottom:6px">Bottino sbloccato (${loot.length})</p>${loot.length ? `<div class="loot">${loot.map(r => `<div class="rw got" title="${esc(rewardLabel(r))} · livello ${r.L}">${rewardIcon(r, sp ? sp.body : 'female')}<small>${esc(rewardLabel(r))}</small></div>`).join('')}</div>` : '<p class="hint">Nessun premio sbloccato in questa avventura.</p>'}</div>
    <div class="row">${active ? `<span class="pill acc">${pix('egg')} In avventura con ${esc(active.name)}</span>` : `<button class="btn primary small" data-act="reborn" data-id="${c.id}">${pix('egg')} Riprendi per un nuovo esame</button>`}<button class="btn small" data-act="ward" data-who="${c.id}">${pix('guardaroba')} Guardaroba</button></div></article>`;
}

/* ================= GUARDAROBA ================= */
function wardWho() { const w = S.ui.ward.who; if (w !== 'avatar' && !compById(w)) S.ui.ward.who = 'avatar'; return S.ui.ward.who; }
function vWardTop() {
  const who = wardWho(); const P = S.profile;
  const comps = P.companions.slice().sort((a, b) => (IX.active.has(b.id) - IX.active.has(a.id)) || b.history.length - a.history.length);
  return `<div class="vhead"><div><h1>Guardaroba</h1><p class="sub">Vesti il tuo avatar e i compagni con tutto ciò che avete sbloccato studiando o comprato in bottega.</p></div><button class="btn gold small" data-act="nav" data-v="bottega">${pix('coin')} ${num(IX.wallet.coins)} · Bottega</button></div>
    <div class="ward"><div class="ward-left"><div class="chips scroll ward-who"><button class="chip" data-act="ward" data-who="avatar" aria-pressed="${who === 'avatar'}">${ptAvatar()}Tu</button>${comps.map(c => `<button class="chip" data-act="ward" data-who="${c.id}" aria-pressed="${who === c.id}">${ptComp(c.id)}${esc(c.name)}</button>`).join('')}</div>
    <section class="card" style="padding:4px"><canvas id="wardPrev" class="px" aria-label="Anteprima animata"></canvas></section></div><div><div id="wardRight"></div><div id="wardInfo"></div></div></div>`;
}
function wardInfoHTML() {
  const who = wardWho(); const P = S.profile;
  if (who === 'avatar') {
    const titles = AVATAR_TITLES.filter(([l]) => IX.lv.L >= l).map(x => x[1]).concat(...P.companions.map(compTitles));
    return `<section class="card gap"><div class="card-h"><span class="rib lav">${pix('user')} Tu · Lv ${IX.lv.L}</span><span class="pill">${num(IX.xp)} XP</span></div>
      <div class="form"><div class="field"><label class="lbl" for="wName">Nome</label><input type="text" id="wName" maxlength="30" value="${esc(P.name)}" placeholder="Come ti chiami?"></div>
      <div class="field"><label class="lbl" for="wTitle">Titolo</label><select id="wTitle"><option value="">${esc(IX.lv.title)} (livello)</option>${[...new Set(titles)].map(t => `<option ${P.avatar.title === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div></div>
      ${avatarNext()}</section>`;
  }
  const c = compById(who); const b = compBond(c); const sp = SPECIES_BY[c.sp];
  const tl = compTitles(c);
  return `<section class="card gap"><div class="card-h"><span class="rib">${pix('egg')} ${esc(sp.name)}</span><span class="tier-badge tier-${Math.min(4, b.tier)}">${TIER_NAMES[Math.min(4, b.tier)]}</span></div>
    <p class="hint" style="margin-bottom:8px">«${esc(sp.motto)}» · ${b.e ? `legame Lv ${b.L} con ${esc(b.e.name)}` : 'a riposo nell\'Albo'}</p>
    <div class="form"><div class="field"><label class="lbl" for="wName">Nome del compagno</label><input type="text" id="wName" maxlength="40" value="${esc(c.name)}"></div>
    ${tl.length ? `<div class="field"><label class="lbl" for="wTitle">Titolo</label><select id="wTitle"><option value="">Nessun titolo</option>${[...new Set(tl)].map(t => `<option ${c.title === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>` : ''}</div>
    ${b.e ? `<div style="margin-top:10px"><div class="row" style="justify-content:space-between"><small class="muted" style="font-weight:800">Verso il livello ${Math.min(BOND_MAX, b.L + 1)}</small><small class="muted" style="font-weight:800">${fmtMin(b.min)}</small></div><span class="bar" style="--c:${colorOf(b.e)}"><i style="width:${(b.prog * 100).toFixed(1)}%"></i></span></div>` : ''}</section>`;
}
function avatarNext() {
  const ks = Object.keys(AVATAR_REWARDS).map(Number).sort((a, b) => a - b);
  return `<p class="lbl" style="margin:12px 0 6px">Premi dei livelli</p><div class="track20">${ks.map(k => AVATAR_REWARDS[k].map(r => { const got = IX.lv.L >= k; return `<div class="rw ${got ? 'got' : 'lock'} ${!got && k === ks.find(x => x > IX.lv.L) ? 'next' : ''}" title="${esc(rewardLabel(r))}"><span class="lvn">${k}</span>${rewardIcon(r, S.profile.avatar.look.body)}<small>${esc(rewardLabel(r))}</small></div>`; }).join('')).join('')}</div>`;
}
function curLook(who) { return who === 'avatar' ? S.profile.avatar.look : compById(who).look; }
function wardRightHTML() {
  const who = wardWho(); const W = S.ui.ward; const look = curLook(who); const body = look.body;
  const tab = WARD_TABS.find(t => t.id === W.tab) || WARD_TABS[0]; if (!tab.slots.includes(W.slot)) W.slot = tab.slots[0];
  const tabs = `<div class="seg" role="tablist">${WARD_TABS.map(t => `<button data-act="ward-tab" data-v="${t.id}" aria-pressed="${t.id === tab.id}">${t.name}</button>`).join('')}</div>`;
  const slotIcon = s => { const e = look.slots[s]; if (s === 'skin' || s === 'eyes') return `<span class="ic" style="display:grid;place-items:center"><span class="sw sm" style="--c:${swatchHex(s === 'skin' ? 'body' : 'eye', s === 'skin' ? look.skin : look.eyes)};pointer-events:none"></span></span>`; if (s === 'aura') { const a = who === 'avatar' ? S.profile.avatar.aura : compById(who).aura; return `<span class="ic" style="display:grid;place-items:center">${a ? pix('aura', '', 3, { Y: AURA_BY[a].cols[0] }) : pix('close', '', 2)}</span>`; } return e ? itThumb(e.id, body, { ...(e.c ? { c: e.c } : {}), ...(e.v ? { v: e.v } : {}), _ctx: { hairColor: look.hairColor, skin: look.skin, eyes: look.eyes } }) : `<span class="ic" style="display:grid;place-items:center;opacity:.35">${pix('close', '', 2)}</span>`; };
  const slots = `<div class="slots">${tab.slots.map(s => `<button class="slot-b" data-act="ward-slot" data-v="${s}" aria-pressed="${s === W.slot}">${slotIcon(s)}<small>${s === 'skin' ? 'Pelle' : s === 'eyes' ? 'Occhi' : SLOT_NAMES[s] || s}</small></button>`).join('')}</div>`;
  let content = '';
  const s = W.slot;
  if (s === 'skin' || s === 'eyes') {
    const list = s === 'skin' ? [...SKINS_HUMAN, ...SKINS_FANTASY] : EYES; const cur = s === 'skin' ? look.skin : look.eyes;
    content = `<div class="swatches">${list.map(k => `<button class="sw" data-act="ward-attr" data-k="${s}" data-v="${k}" style="--c:${swatchHex(s === 'skin' ? 'body' : 'eye', k)}" aria-pressed="${k === cur}" title="${esc(colorName(k))}" aria-label="${esc(colorName(k))}"></button>`).join('')}</div>`;
    if (s === 'skin' && who === 'avatar') content = `<div class="field" style="margin-bottom:10px"><span class="lbl">Corporatura</span><div class="seg">${[['female', 'Snella'], ['male', 'Classica'], ['muscular', 'Robusta'], ['child', 'Minuta']].map(([k, l]) => `<button data-act="ward-body" data-v="${k}" aria-pressed="${body === k}">${l}</button>`).join('')}</div><p class="hint" style="margin-top:4px">Alcuni abiti esistono solo per certe corporature: quelli non adatti spariscono quando cambi.</p></div>` + content;
  } else if (s === 'aura') {
    const owned = aurasFor(who); const cur = who === 'avatar' ? S.profile.avatar.aura : compById(who).aura;
    content = `<div class="items"><button class="it" data-act="ward-aura" data-v="" aria-pressed="${!cur}"><span class="ic" style="display:grid;place-items:center">${pix('close', '', 3)}</span><span>Nessuna</span></button>${AURAS.map(a => { const has = owned.has(a.id); return `<button class="it rar-${a.rar} ${has ? '' : 'lock'}" data-act="${has ? 'ward-aura' : 'ward-locked'}" data-v="${a.id}" data-kind="aura" aria-pressed="${cur === a.id}"><span class="rdot"></span><span class="ic" style="display:grid;place-items:center">${pix('aura', '', 4, { Y: a.cols[0], W: a.cols[1] || '#fff' })}</span><span>${esc(a.name)}</span>${has ? `<small>${RARITY[a.rar].name}</small>` : lockHint(who, 'aura', a.id)}</button>`; }).join('')}</div>`;
  } else {
    const owned = itemsFor(who); const eq = look.slots[s];
    const all = Object.entries(SPR.CAT.items).filter(([id, it]) => it.slot === s && SPR.supports(id, body) && !(s === 'head' && who !== 'avatar' && !owned.has(id) && !lockable(who, id)));
    const has = all.filter(([id]) => owned.has(id)), lock = all.filter(([id]) => !owned.has(id) && lockable(who, id));
    const rk = { c: 0, r: 1, e: 2, l: 3 };
    lock.sort((a, b) => (lockLevel(who, a[0]) || 99) - (lockLevel(who, b[0]) || 99) || rk[a[1].rar] - rk[b[1].rar]);
    const none = OPTIONAL_SLOTS.has(s) ? `<button class="it" data-act="ward-item" data-v="" aria-pressed="${!eq}"><span class="ic" style="display:grid;place-items:center">${pix('close', '', 3)}</span><span>Nessuno</span></button>` : '';
    content = `<div class="items">${none}${has.map(([id, it]) => `<button class="it rar-${it.rar}" data-act="ward-item" data-v="${id}" aria-pressed="${eq && eq.id === id}"><span class="rdot"></span>${itThumb(id, body, { _ctx: { hairColor: look.hairColor, skin: look.skin, eyes: look.eyes } })}<span>${esc(it.name)}</span><small>${RARITY[it.rar].name}</small></button>`).join('')}${lock.map(([id, it]) => `<button class="it rar-${it.rar} lock" data-act="ward-locked" data-v="${id}" data-kind="item"><span class="rdot"></span>${itThumb(id, body, { _ctx: { hairColor: look.hairColor, skin: look.skin, eyes: look.eyes } })}<span>${esc(it.name)}</span>${lockHint(who, 'item', id)}</button>`).join('')}</div>`;
    if (!all.length) content = `<p class="muted">Nessun oggetto di questo tipo per questa corporatura.</p>`;
    if (eq) content += colorPanel(who, s, eq, look);
  }
  return `<section class="card"><div class="card-h">${tabs}</div>${slots}${content}</section>`;
}
function lockable(who, id) { const it = SPR.item(id); if (!it || CORE_SLOTS.has(it.slot)) return false; return true; }
function lockLevel(who, id) { if (who === 'avatar') { for (const k in AVATAR_REWARDS) if (AVATAR_REWARDS[k].some(r => r.t === 'item' && r.id === id)) return Number(k); return null; } const c = compById(who); const r = bondRewards(c.sp, compTier(c)).find(r => r.t === 'item' && r.id === id); return r ? r.L : null; }
function lockHint(who, kind, id) {
  if (who === 'avatar') { for (const k in AVATAR_REWARDS) if (AVATAR_REWARDS[k].some(r => r.t === kind && r.id === id)) return `<small>Livello ${k}</small>`; }
  else { const c = compById(who); const r = bondRewards(c.sp, compTier(c)).find(r => r.t === kind && r.id === id); if (r) return `<small>Legame Lv ${r.L}</small>`; for (let t = compTier(c) + 1; t <= compTier(c) + 3; t++) { const r2 = bondRewards(c.sp, t).find(r => r.t === kind && r.id === id); if (r2) return `<small>Rinascita ${t}</small>`; } }
  const p = priceOf(kind, id); return `<small class="price">${pix('coin', '', 1)} ${num(p)}</small>`;
}
function swatchHex(mat, name) { const p = SPR.PAL[mat]; const c = p && p.colors[name]; if (!c) return '#999'; const m = c[Math.floor(c.length / 2)] || c[0]; return '#' + m.map(x => x.toString(16).padStart(2, '0')).join(''); }
function colorName(k) { return (SPR.CAT.colorNames && SPR.CAT.colorNames[k]) || cap(k.replace(/_/g, ' ')); }
function colorPanel(who, s, eq, look) {
  const o = SPR.colorOptions(eq.id); if (!o) return '';
  if (o.type === 'bake') return `<div class="colors"><span class="lbl">Variante</span><div class="chips">${o.list.map(v => `<button class="chip" data-act="ward-var" data-v="${v}" aria-pressed="${(eq.v || o.list[0]) === v}">${esc(colorName(v))}</button>`).join('')}</div></div>`;
  const mats = Object.entries(o.mats).filter(([m]) => m !== 'body' && m !== 'eye');
  if (!mats.length) return '';
  const label = { hair: 'Colore dei capelli (vale per tutto)', cloth: 'Tessuto', metal: 'Metallo', wood: 'Legno' };
  return `<div class="colors">${mats.map(([m, list]) => { const cur = m === 'hair' ? look.hairColor : (eq.c && eq.c[m]) || SPR.PAL[m].base; return `<div class="field"><span class="lbl">${label[m] || m}</span><div class="swatches">${list.map(k => `<button class="sw sm" data-act="ward-color" data-m="${m}" data-v="${k}" style="--c:${swatchHex(m, k)}" aria-pressed="${k === cur}" title="${esc(colorName(k))}" aria-label="${esc(colorName(k))}"></button>`).join('')}</div></div>`; }).join('')}</div>`;
}

/* ================= BOTTEGA ================= */
const SHOP_TABS = [['abiti', 'Abiti e armi'], ['aure', 'Aure'], ['pozioni', 'Pozioni'], ['deco', 'Decorazioni'], ['musica', 'Musica'], ['temi', 'Temi']];
const SHOP_GROUPS = [['tutti', 'Tutto'], ['testa', 'Testa e capelli'], ['vesti', 'Vestiti'], ['magia', 'Ali e mantelli'], ['armi', 'Armi e scudi'], ['acc', 'Accessori']];
const GROUP_SLOTS = { testa: ['head', 'hair', 'beard', 'ears', 'horns', 'hat'], vesti: ['torso', 'torso2', 'legs', 'feet', 'belt', 'arms', 'shoulders'], magia: ['wings', 'cape', 'tail'], armi: ['weapon', 'shield'], acc: ['face_acc', 'ears_acc', 'neck', 'back'] };
function vBottega() {
  const tab = S.ui.shopTab || 'abiti'; const W = IX.wallet;
  const head = `<div class="vhead"><div><h1>Bottega di Nonna Ghianda</h1><p class="sub">Monete guadagnate studiando: ${num(W.earned)} · spese: ${num(W.spent)}. Gli abiti comprati valgono per te e per tutti i compagni.</p></div><span class="wallet">${pix('coin', '', 3)}${num(W.coins)}</span></div>
    <div class="chips scroll" style="margin-bottom:12px">${SHOP_TABS.map(([k, l]) => `<button class="chip" data-act="shop-tab" data-v="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  const buyBtn = (kind, id, owned, extra = '') => owned ? `<span class="pill good">${pix('check')} Tuo</span>${extra}` : `<button class="btn small gold" data-act="buy" data-kind="${kind}" data-id="${id}" ${W.coins < priceOf(kind, id) ? 'disabled' : ''}>${pix('coin')} ${num(priceOf(kind, id))}</button>`;
  if (tab === 'abiti') {
    const g = S.ui.shopGroup || 'tutti'; const body0 = S.profile.avatar.look.body;
    const rk = { c: 0, r: 1, e: 2, l: 3 };
    const list = Object.entries(SPR.CAT.items).filter(([id, it]) => !CORE_SLOTS.has(it.slot) && it.slot !== 'face' && it.slot !== 'body' && (g === 'tutti' || (GROUP_SLOTS[g] || []).includes(it.slot)) && !STARTER.includes(id))
      .sort((a, b) => owns('item', a[0]) - owns('item', b[0]) || rk[a[1].rar] - rk[b[1].rar] || a[1].name.localeCompare(b[1].name));
    body = `<div class="chips scroll" style="margin-bottom:12px">${SHOP_GROUPS.map(([k, l]) => `<button class="chip" data-act="shop-group" data-v="${k}" aria-pressed="${g === k}">${l}</button>`).join('')}</div>
      <div class="shop-grid">${list.map(([id, it]) => { const o = owns('item', id); const fits = SPR.supports(id, body0); return `<div class="ware rar-${it.rar} ${o ? 'owned' : ''}"><span class="rar">${RARITY[it.rar].name}</span>${itThumb(id, fits ? body0 : null)}<b>${esc(it.name)}</b><p>${SLOT_NAMES[it.slot] || it.slot}${fits ? '' : ' · non per la tua corporatura'}</p>${buyBtn('item', id, o, o && fits ? `<button class="btn small" data-act="equip" data-id="${id}">Indossa</button>` : '')}</div>`; }).join('')}</div>`;
  } else if (tab === 'aure') {
    body = `<div class="shop-grid">${AURAS.map(a => { const o = owns('aura', a.id); return `<div class="ware rar-${a.rar} ${o ? 'owned' : ''}"><span class="rar">${RARITY[a.rar].name}</span><span class="ic">${pix('aura', '', 6, { Y: a.cols[0], W: a.cols[1] || '#fff' })}</span><b>${esc(a.name)}</b><p>Particelle animate intorno al personaggio, nella radura e nello studio.</p>${buyBtn('aura', a.id, o)}</div>`; }).join('')}</div>`;
  } else if (tab === 'pozioni') {
    body = `<div class="shop-grid">${CONSUMABLES.map(c => `<div class="ware"><span class="ic">${pix(c.icon, '', 6)}</span><b>${esc(c.name)}</b><p>${esc(c.desc)}</p><p class="pix" style="font-size:18px;color:var(--ink)">Ne hai ${W.cons[c.id] || 0}</p><button class="btn small gold" data-act="buy" data-kind="cons" data-id="${c.id}" ${W.coins < c.price ? 'disabled' : ''}>${pix('coin')} ${num(c.price)}</button></div>`).join('')}</div><p class="hint gap">Le pozioni si usano dal timer, nella sezione Studio. Lo scudo si attiva da solo se salti un giorno.</p>`;
  } else if (tab === 'deco') {
    const s = ART.themeKey();
    body = `<div class="shop-grid">${DECOS.map(d => { const o = owns('deco', d.id); const hidden = S.profile.hiddenDecos[d.id]; return `<div class="ware rar-${d.rar} ${o ? 'owned' : ''}"><span class="rar">${RARITY[d.rar].name}</span><span class="ic" data-deco="${d.id}"></span><b>${esc(d.name)}</b><p>${esc(d.desc)}</p>${buyBtn('deco', d.id, o, o ? `<button class="btn small" data-act="deco-toggle" data-id="${d.id}">${hidden ? pix('eye') + ' Mostra' : 'Nascondi'}</button>` : '')}</div>`; }).join('')}</div><p class="hint gap">Le decorazioni compaiono nel villaggio della radura, tra le case dei compagni.</p>`;
  } else if (tab === 'musica') {
    body = `<div class="shop-grid">${TRACKS.map(t => { const o = owns('track', t.id); const cur = S.profile.sound.track === t.id; return `<div class="ware ${o ? 'owned' : ''}"><span class="ic">${pix('music', '', 6)}</span><b>${esc(t.name)}</b><p>Brano chiptune 8-bit${t.price ? '' : ' · incluso'}</p><div class="row" style="justify-content:center">${o ? `<button class="btn small ${cur ? 'primary' : ''}" data-act="track" data-id="${t.id}">${cur ? pix('check') + ' In uso' : pix('play') + ' Ascolta'}</button>` : ''}${o ? '' : buyBtn('track', t.id, false)}</div></div>`; }).join('')}</div>`;
  } else if (tab === 'temi') {
    body = `<div class="shop-grid">${THEMES.map(t => { const o = owns('theme', t.id); const cur = S.profile.theme.world === t.id; return `<div class="ware ${o ? 'owned' : ''}"><span class="ic">${pix(t.id === 'inverno' ? 'moon' : 'sun', '', 6)}</span><b>${esc(t.name)}</b><p>${esc(t.desc || 'Colori, cielo e particelle del villaggio')}</p><div class="row" style="justify-content:center">${o ? `<button class="btn small ${cur ? 'primary' : ''}" data-act="theme" data-id="${t.id}">${cur ? pix('check') + ' Attivo' : 'Usa'}</button>` : buyBtn('theme', t.id, false)}</div></div>`; }).join('')}</div>`;
  }
  return head + body;
}
function hydrateDecos(root = document) {
  const s = ART.themeKey(), night = ART.timeKey() === 'night';
  root.querySelectorAll('[data-deco]:not([data-done])').forEach(el => { el.dataset.done = '1'; const id = el.dataset.deco; let c = id === 'statua' ? null : ART.deco(id, s, night, 0); if (!c) { el.innerHTML = pix('user', '', 6); return; } const sc = Math.max(1, Math.floor(Math.min(72 / c.width, 72 / c.height))); const k = Math.min(sc, 72 / c.width, 72 / c.height); const out = document.createElement('canvas'); out.width = Math.round(c.width * k); out.height = Math.round(c.height * k); const g = out.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, out.width, out.height); el.appendChild(out); });
}

/* ---------- Registro delle viste ---------- */
const VIEWS = {
  radura: { top: vRaduraTop, topSig: () => 'w', body: vRaduraBody, mount: () => { const c = $('#world'); if (c) WORLD.mountVillage(c); }, refresh: () => WORLD.refreshVillage() },
  studio: { top: vStudioTop, topSig: () => T.ex || '', body: vStudioBody, mount: () => { const c = $('#studyScene'); if (c) WORLD.mountStudy(c, T.ex); } },
  esami: { body: vEsami },
  orario: { body: vOrario },
  oracolo: { body: vOracolo },
  trofei: { body: vTrofei },
  mappa: { top: vMappaTop, topSig: () => 'm' + S.profile.ay, body: vMappaBody, mount: () => { const c = $('#mapc'); if (c) WORLD.mountMap(c); } },
  albo: { body: vAlbo },
  guardaroba: { top: vWardTop, topSig: () => wardWho() + '|' + S.profile.companions.length, body: () => '', mount: wardMount, refresh: wardRefresh },
  bottega: { body: vBottega, after: hydrateDecos }
};
let wardStage = null;
function wardMount() {
  const c = $('#wardPrev'); const who = wardWho();
  if (c) wardStage = WORLD.mountPreview(c, () => lookOf(who, who === 'avatar' ? 'happy' : null), { h: 120 });
  wardRefresh();
}
function wardRefresh() {
  const who = wardWho();
  const info = $('#wardInfo'), right = $('#wardRight'); if (info) info.innerHTML = wardInfoHTML(); if (right) right.innerHTML = wardRightHTML();
  if (wardStage) { const l = lookOf(who, who === 'avatar' ? 'happy' : null); if (l) wardStage.setLook(l.look, l.aura); }
  hydrate(document);
}
