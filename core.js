'use strict';
/* ============ Utilità ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = n => String(n).padStart(2, '0');
const clone = o => JSON.parse(JSON.stringify(o));
const pct = f => Math.round((f || 0) * 100) + '%';
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const num = n => Math.round(n).toLocaleString('it-IT');

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MESI_S = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const GIORNI = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const GIORNI_S = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const GIORNI_X = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function today() { return iso(new Date()); }
function pd(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = pd(s); d.setDate(d.getDate() + n); return iso(d); }
function diffDays(a, b) { return Math.round((pd(b) - pd(a)) / 86400000); }
function dow(s) { return (pd(s).getDay() + 6) % 7; }
function weekStart(s) { return addDays(s, -dow(s)); }
function ymOf(s) { return s.slice(0, 7); }
function fmtDay(s) { const d = pd(s); return d.getDate() + ' ' + MESI_S[d.getMonth()]; }
function fmtDayLong(s) { const d = pd(s); return GIORNI[dow(s)] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()]; }
function fmtDayYear(s) { const d = pd(s); return d.getDate() + ' ' + MESI[d.getMonth()] + ' ' + d.getFullYear(); }
function fmtMin(m) { m = Math.round(m || 0); if (m < 60) return m + 'm'; const h = Math.floor(m / 60), r = m % 60; return r ? h + 'h ' + pad(r) + 'm' : h + 'h'; }
function fmtWeek(ws) { const we = addDays(ws, 6); const a = pd(ws), b = pd(we); return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MESI_S[b.getMonth()]}` : `${a.getDate()} ${MESI_S[a.getMonth()]} – ${b.getDate()} ${MESI_S[b.getMonth()]}`; }
function hm(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }
function toMin(t) { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); }
function inDays(n) { return n === 0 ? 'oggi' : n === 1 ? 'domani' : n < 0 ? `${-n} giorni fa` : `tra ${n} giorni`; }

/* ============ Calendario accademico ============ */
function currentAY(s = today()) { const d = pd(s); return d.getMonth() >= 9 ? d.getFullYear() : d.getFullYear() - 1; }
const ayLabel = ay => `${ay}/${String(ay + 1).slice(2)}`;
const SESSIONI = {
  inv: { label: 'Sessione invernale', short: 'Invernale', months: 'gen–feb', m: [0, 1], realm: 'Regno d\'Inverno' },
  est: { label: 'Sessione estiva', short: 'Estiva', months: 'giu–lug', m: [5, 6], realm: 'Isole d\'Estate' },
  aut: { label: 'Sessione autunnale', short: 'Autunnale', months: 'set', m: [8, 8], realm: 'Bosco d\'Autunno' }
};
const SES_ORDER = ['inv', 'est', 'aut'];
function sessionRange(ses, ay) { const s = SESSIONI[ses]; if (!s) return null; const y = ay + 1; return [`${y}-${pad(s.m[0] + 1)}-01`, iso(new Date(y, s.m[1] + 1, 0))]; }
const SEMESTRI = { 1: '1° semestre', 2: '2° semestre', 0: 'Annuale' };
const PERIODS = [
  { id: 's1', label: '1° semestre', sub: 'lezioni ott–dic' },
  { id: 'inv', label: 'Sessione invernale', sub: 'esami gen–feb' },
  { id: 's2', label: '2° semestre', sub: 'lezioni mar–mag' },
  { id: 'est', label: 'Sessione estiva', sub: 'esami giu–lug' },
  { id: 'aut', label: 'Sessione autunnale', sub: 'esami ago–set' }
];
function periodOf(s) { const m = pd(s).getMonth(); if (m >= 9) return 's1'; if (m <= 1) return 'inv'; if (m <= 4) return 's2'; if (m <= 6) return 'est'; return 'aut'; }
function examInPeriod(e, p) { if (p === 's1') return e.sem === 1 || e.sem === 0; if (p === 's2') return e.sem === 2 || e.sem === 0; return e.ses === p; }
function seasonOf(s = today()) { const m = pd(s).getMonth(); if (m <= 1 || m === 11) return 'inverno'; if (m <= 4) return 'primavera'; if (m <= 7) return 'estate'; return 'autunno'; }

const STATUS = {
  da_iniziare: { label: 'Da iniziare', cls: '' },
  in_corso: { label: 'In preparazione', cls: 'acc' },
  pronto: { label: 'Quasi pronto', cls: 'good' },
  rimandato: { label: 'Rimandato', cls: 'warn' },
  superato: { label: 'Superato', cls: 'good' }
};
const APP_TYPES = { scritto: 'Scritto', orale: 'Orale', progetto: 'Progetto', parziale: 'Parziale', altro: 'Altro' };
const BLOCK_TYPES = { lezione: { label: 'Lezione', cls: 'lez' }, studio: { label: 'Studio', cls: 'studio' }, eserc: { label: 'Esercitazione', cls: 'eserc' }, ricev: { label: 'Ricevimento', cls: 'ricev' }, altro: { label: 'Altro', cls: 'altro' } };

const COLORS = { rosa: '#E0709A', cielo: '#4A9BD9', oro: '#D9A62E', lavanda: '#8E7CD6', menta: '#3FAE8C', corallo: '#E25C5C', laguna: '#0FA5B5', pesca: '#F08A5D', prugna: '#B05FB0', salvia: '#7FA35B' };
const COLOR_ORDER = Object.keys(COLORS);
const COLOR_NAMES = { rosa: 'Rosa', cielo: 'Cielo', oro: 'Oro', lavanda: 'Lavanda', menta: 'Menta', corallo: 'Corallo', laguna: 'Laguna', pesca: 'Pesca', prugna: 'Prugna', salvia: 'Salvia' };
const colorOf = e => COLORS[e && e.color] || COLORS.rosa;

/* ============ Modello dati ============ */
const TIMER_MODES = {
  free: { name: 'Libera', desc: 'Avvii, metti in pausa, termini quando vuoi' },
  p25: { name: '25 / 5', work: 25, brk: 5, long: 15, every: 4, desc: 'Pomodoro classico' },
  p50: { name: '50 / 10', work: 50, brk: 10, long: 20, every: 3, desc: 'Pomodoro lungo' },
  p90: { name: '90 / 20', work: 90, brk: 20, long: 30, every: 2, desc: 'Concentrazione profonda' },
  custom: { name: 'Su misura', desc: 'Scegli tu studio, pausa e giri' }
};
function defaultLook(body = 'female') {
  return body === 'male'
    ? { body: 'male', skin: 'light', eyes: 'brown', hairColor: 'dark_brown', slots: { head: { id: 'head_human' }, hair: { id: 'hair_messy' }, torso: { id: 'longsleeve', c: { cloth: 'teal' } }, legs: { id: 'pants', c: { cloth: 'brown' } }, feet: { id: 'boots', c: { cloth: 'brown' } }, back: { id: 'backpack', v: 'leather' } } }
    : { body: 'female', skin: 'light', eyes: 'green', hairColor: 'chestnut', slots: { head: { id: 'head_human' }, hair: { id: 'hair_long' }, torso: { id: 'tunic', c: { cloth: 'teal' } }, legs: { id: 'pants', c: { cloth: 'brown' } }, feet: { id: 'boots', c: { cloth: 'brown' } }, back: { id: 'backpack', v: 'leather' } } };
}
function defaultProfile() {
  return {
    v: 2, name: '', ay: currentAY(), goals: { day: 120, week: 900 },
    timer: { mode: 'p25', custom: { work: 40, brk: 8, long: 20, every: 3 } },
    hours: { start: 8, end: 20, sunday: false },
    sound: { sfx: true, music: false, vol: .55, track: 'radura' }, theme: { world: 'auto' },
    avatar: { look: defaultLook('female'), aura: null, title: null, made: false },
    exams: [], companions: [], schedule: {},
    owned: { items: {}, auras: {}, decos: {}, tracks: {}, themes: {} },
    hiddenDecos: {}, purchases: [], used: [], shields: [], tomb: [], seen: {},
    created: Date.now(), t: Date.now()
  };
}
const KIND_TO_SPECIES = { fata: 'fata', gnomo: 'gnomo', elfo: 'elfo', orco: 'orco', draghetto: 'draconide', unicorno: 'angelo', folletto: 'maga', gufo: 'mago', fungo: 'druido', driade: 'druido' };
function speciesLook(spId) {
  const sp = SPECIES_BY[spId] || SPECIES[0];
  return { body: sp.body, skin: sp.skin, eyes: sp.eyes || 'blue', hairColor: sp.hairColor || 'chestnut', slots: clone(sp.slots) };
}
function newCompanion(spId, name) {
  const sp = SPECIES_BY[spId] || SPECIES[0];
  return { id: uid(), sp: sp.id, name: name || sp.name, look: speciesLook(sp.id), aura: null, title: null, history: [], created: Date.now() };
}
function normLook(l, fallback) {
  const d = fallback || defaultLook();
  if (!l || typeof l !== 'object') return clone(d);
  const out = { body: ['female', 'male', 'muscular', 'child'].includes(l.body) ? l.body : d.body, skin: l.skin || d.skin, eyes: l.eyes || d.eyes, hairColor: l.hairColor || d.hairColor, slots: {} };
  const src = l.slots && typeof l.slots === 'object' ? l.slots : d.slots;
  for (const k in src) { const e = src[k]; if (e && e.id && SPR.item(e.id)) out.slots[k] = { id: e.id, ...(e.c ? { c: { ...e.c } } : {}), ...(e.v ? { v: e.v } : {}) }; }
  if (!out.slots.head) out.slots.head = { id: 'head_human' };
  return out;
}
function normExam(e) {
  return {
    id: e.id || uid(), name: String(e.name || 'Esame senza nome').slice(0, 90),
    color: COLORS[e.color] ? e.color : 'rosa', comp: e.comp || null,
    cfu: Math.max(0, Number(e.cfu) || 0), target: Math.max(0, Number(e.target) || 0),
    sem: [0, 1, 2].includes(Number(e.sem)) ? Number(e.sem) : 1, ses: SESSIONI[e.ses] ? e.ses : 'inv', ay: Number(e.ay) || currentAY(),
    status: STATUS[e.status] ? e.status : 'da_iniziare', grade: e.grade == null || e.grade === '' ? null : Number(e.grade), lode: !!e.lode, passedOn: e.passedOn || '',
    teacher: e.teacher || '', room: e.room || '', office: e.office || '', notes: e.notes || '', links: e.links || '',
    appelli: Array.isArray(e.appelli) ? e.appelli.map(a => ({ id: a.id || uid(), date: a.date || '', time: a.time || '', type: APP_TYPES[a.type] ? a.type : 'scritto', place: a.place || '', booked: !!a.booked, note: a.note || '' })) : [],
    demo: !!e.demo, created: e.created || Date.now(), kind: e.kind
  };
}
function normCompanion(c) {
  const sp = SPECIES_BY[c.sp] ? c.sp : 'fata';
  return { id: c.id || uid(), sp, name: String(c.name || SPECIES_BY[sp].name).slice(0, 40), look: normLook(c.look, speciesLook(sp)), aura: AURA_BY[c.aura] ? c.aura : null, title: c.title || null, history: Array.isArray(c.history) ? c.history : [], created: c.created || Date.now(), demo: !!c.demo };
}
function normBlock(b) { return { id: b.id || uid(), day: clamp(Number(b.day) || 0, 0, 6), start: Number(b.start) || 540, end: Number(b.end) || 600, type: BLOCK_TYPES[b.type] ? b.type : 'lezione', ex: b.ex || '', label: b.label || '', place: b.place || '', note: b.note || '', demo: !!b.demo }; }
function normalizeProfile(p) {
  const d = defaultProfile(); p = p || {};
  const out = Object.assign(d, {
    name: typeof p.name === 'string' ? p.name : '', ay: Number(p.ay) || d.ay,
    goals: { day: Number(p.goals?.day) || d.goals.day, week: Number(p.goals?.week) || d.goals.week },
    hours: { start: Number.isFinite(Number(p.hours?.start)) ? Number(p.hours.start) : 8, end: Number(p.hours?.end) || 20, sunday: !!p.hours?.sunday },
    created: p.created || d.created, t: p.t || d.t
  });
  if (p.timer && TIMER_MODES[p.timer.mode]) out.timer.mode = p.timer.mode;
  if (p.timer && p.timer.custom) out.timer.custom = { work: clamp(Number(p.timer.custom.work) || 40, 5, 180), brk: clamp(Number(p.timer.custom.brk) || 8, 1, 60), long: clamp(Number(p.timer.custom.long) || 20, 1, 90), every: clamp(Number(p.timer.custom.every) || 3, 1, 8) };
  if (p.pomo && !p.timer) { out.timer.mode = 'custom'; out.timer.custom.work = Number(p.pomo.work) || 25; out.timer.custom.brk = Number(p.pomo.brk) || 5; }
  if (typeof p.sound === 'object' && p.sound) out.sound = { sfx: p.sound.sfx !== false, music: !!p.sound.music, vol: clamp(Number(p.sound.vol ?? .55), 0, 1), track: p.sound.track || 'radura' };
  else if (p.sound === false) out.sound.sfx = false;
  if (p.theme && THEMES.some(t => t.id === p.theme.world)) out.theme.world = p.theme.world;
  if (p.avatar) out.avatar = { look: normLook(p.avatar.look, defaultLook()), aura: AURA_BY[p.avatar.aura] ? p.avatar.aura : null, title: p.avatar.title || null, made: !!p.avatar.made };
  out.companions = Array.isArray(p.companions) ? p.companions.map(normCompanion) : [];
  out.exams = Array.isArray(p.exams) ? p.exams.map(normExam) : [];
  // migrazione v1: ogni esame riceve un compagno
  for (const e of out.exams) {
    if (!e.comp || !out.companions.some(c => c.id === e.comp)) {
      const c = newCompanion(KIND_TO_SPECIES[e.kind] || SPECIES[out.companions.length % SPECIES.length].id);
      c.demo = e.demo; out.companions.push(c); e.comp = c.id;
    }
    delete e.kind;
  }
  out.schedule = {};
  if (p.schedule && typeof p.schedule === 'object') for (const k in p.schedule) if (Array.isArray(p.schedule[k])) out.schedule[k] = p.schedule[k].map(normBlock);
  if (p.owned) for (const k of ['items', 'auras', 'decos', 'tracks', 'themes']) out.owned[k] = { ...(p.owned[k] || {}) };
  out.hiddenDecos = { ...(p.hiddenDecos || {}) };
  out.purchases = Array.isArray(p.purchases) ? p.purchases.filter(x => x && x.k && x.p >= 0) : [];
  out.used = Array.isArray(p.used) ? p.used.filter(x => x && x.k) : [];
  out.shields = Array.isArray(p.shields) ? p.shields.filter(x => typeof x === 'string') : [];
  out.tomb = Array.isArray(p.tomb) ? p.tomb.slice(-400) : [];
  out.seen = p.seen && typeof p.seen === 'object' ? { ...p.seen } : {};
  return out;
}
function normEntries(arr) {
  return (Array.isArray(arr) ? arr : []).filter(e => e && /^\d{4}-\d{2}-\d{2}$/.test(e.d) && e.m > 0).map(e => ({ id: e.id || uid(), d: e.d, ex: e.ex, m: Math.round(e.m), src: e.src || 'manuale', note: e.note || '', t: e.t || 0, ...(e.b ? { b: e.b } : {}), ...(e.g ? { g: e.g } : {}), ...(e.p ? { p: 1 } : {}), ...(e.demo ? { demo: true } : {}) }));
}

const S = {
  profile: defaultProfile(), months: {}, mode: 'loading', backend: null, db: null, uid: null, sample: null, downloads: null, unsub: null,
  ui: { view: 'radura', wOff: 0, calMonth: ymOf(today()), fSem: 'all', fSes: 'all', fPassed: false, per: null, oMode: null, oDay: null, ai: null, aiCtl: null, ward: { who: 'avatar', tab: 'aspetto', slot: 'hair' }, shopTab: 'abiti' }
};
let IX = null;

/* ============ Indici derivati ============ */
function rebuild() {
  const P = S.profile;
  const byDay = new Map(), byExam = new Map(), last = new Map(), count = new Map(); let total = 0, pomos = 0, xp = 0, coinEntries = 0; const all = [];
  for (const k in S.months) for (const en of S.months[k]) {
    all.push(en); total += en.m; xp += en.m * (en.b || 1); coinEntries += en.m * (en.b || 1) * (en.g || 1);
    if (!byDay.has(en.d)) byDay.set(en.d, []); byDay.get(en.d).push(en);
    byExam.set(en.ex, (byExam.get(en.ex) || 0) + en.m);
    if (!last.has(en.ex) || last.get(en.ex) < en.d) last.set(en.ex, en.d);
    count.set(en.ex, (count.get(en.ex) || 0) + 1);
    if (en.p) pomos++;
  }
  all.sort((a, b) => b.d.localeCompare(a.d) || (b.t || 0) - (a.t || 0));
  const ex = new Map(P.exams.map(e => [e.id, e]));
  const comp = new Map(P.companions.map(c => [c.id, c]));
  IX = { byDay, byExam, last, count, total, pomos, xp, coinEntries, all, ex, comp };
  // compagno -> esame attivo
  IX.active = new Map();
  for (const e of P.exams) if (e.comp && e.status !== 'superato') IX.active.set(e.comp, e);
  IX.lv = levelInfo(xp);
  IX.wallet = computeWallet();
}
const exById = id => IX.ex.get(id);
const compById = id => IX.comp.get(id);
const dayMin = d => (IX.byDay.get(d) || []).reduce((s, e) => s + e.m, 0);
const examMin = id => IX.byExam.get(id) || 0;
const activeExams = () => S.profile.exams.filter(e => e.status !== 'superato').sort(sortExams);
function sortExams(a, b) { const ta = examTarget(a), tb = examTarget(b); return (ta ? ta.date : '9999').localeCompare(tb ? tb.date : '9999') || a.name.localeCompare(b.name); }
function nextAppello(e, from = today()) { return (e.appelli || []).filter(a => a.date && a.date >= from).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0] || null; }
function examTarget(e, from = today()) {
  const a = nextAppello(e, from); if (a) return { date: a.date, kind: 'appello', a };
  const r = sessionRange(e.ses, e.ay); if (r && r[1] >= from) return { date: r[0] >= from ? r[0] : from, kind: 'sessione', range: r, inSession: r[0] < from };
  return null;
}
function examTargetMin(e) { return (e.target || (e.cfu ? e.cfu * 8 : 40)) * 60; }
function moodOfExam(e) {
  if (!e) return 'ok';
  if (e.status === 'superato') return 'happy';
  const l = IX.last.get(e.id); if (!l) return 'ok';
  const ds = diffDays(l, today()); if (ds <= 0) return 'happy'; if (ds <= 3) return 'ok'; if (ds <= 7) return 'sleepy'; return 'sad';
}
const MOOD_TEXT = { happy: 'Raggiante: avete studiato insieme oggi', ok: 'Sereno e pronto a studiare', sleepy: 'Sonnecchia: non studiate insieme da qualche giorno', sad: 'Malinconico: non studiate insieme da più di una settimana' };
function streak() {
  const sh = new Set(S.profile.shields);
  let d = today(); if (dayMin(d) === 0) d = addDays(d, -1); let n = 0;
  while (dayMin(d) > 0 || sh.has(d)) { n++; d = addDays(d, -1); }
  return n;
}
function bestStreak() { const sh = new Set(S.profile.shields); const days = [...new Set([...IX.byDay.keys()].filter(d => dayMin(d) > 0).concat([...sh]))].sort(); let best = 0, cur = 0, prev = null; for (const d of days) { cur = prev && diffDays(prev, d) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; } return best; }

/* ============ Livelli, compagni, premi ============ */
function levelInfo(m) {
  let L = 1; while (30 * L * (L + 1) <= m) L++;
  const lo = 30 * (L - 1) * L, hi = 30 * L * (L + 1);
  let title = AVATAR_TITLES[0][1]; AVATAR_TITLES.forEach(([l, t]) => { if (L >= l) title = t; });
  return { L, lo, hi, frac: (m - lo) / (hi - lo), title };
}
function compTier(c) { return (c.history || []).length; }
function compActiveExam(c) { return IX.active.get(c.id) || null; }
function compBond(c) { // stato del legame corrente
  const e = compActiveExam(c); const tier = compTier(c);
  if (!e) return { e: null, tier, min: 0, L: 0, prog: 0 };
  const min = examMin(e.id); return { e, tier, min, L: bondLevel(min, tier), prog: bondProgress(min, tier) };
}
function compUnlocks(c) { // tutte le ricompense ottenute
  const out = [];
  (c.history || []).forEach((h, t) => bondRewards(c.sp, t).filter(r => r.L <= (h.level || 0)).forEach(r => out.push({ ...r, tier: t, ex: h.name })));
  const b = compBond(c); if (b.e) bondRewards(c.sp, b.tier).filter(r => r.L <= b.L).forEach(r => out.push({ ...r, tier: b.tier, ex: b.e.name }));
  return out;
}
function compOwnedItems(c) {
  const s = new Set(Object.values(SPECIES_BY[c.sp].slots).map(x => x.id));
  compUnlocks(c).forEach(r => { if (r.t === 'item') s.add(r.id); });
  return s;
}
function compOwnedAuras(c) { const s = new Set(); compUnlocks(c).forEach(r => { if (r.t === 'aura') s.add(r.id); }); return s; }
function compTitles(c) { return compUnlocks(c).filter(r => r.t === 'title').map(r => r.name); }
function avatarRewardsUpTo(L) { const out = []; for (const k in AVATAR_REWARDS) if (Number(k) <= L) AVATAR_REWARDS[k].forEach(r => out.push({ ...r, L: Number(k) })); return out; }
function sharedItems() { return new Set([...STARTER, ...Object.keys(S.profile.owned.items)]); }
function avatarItems() { const s = sharedItems(); avatarRewardsUpTo(IX.lv.L).forEach(r => { if (r.t === 'item') s.add(r.id); }); return s; }
function avatarAuras() { const s = new Set(Object.keys(S.profile.owned.auras)); avatarRewardsUpTo(IX.lv.L).forEach(r => { if (r.t === 'aura') s.add(r.id); }); return s; }
function itemsFor(who) {
  if (who === 'avatar') return avatarItems();
  const c = compById(who); if (!c) return new Set();
  const s = compOwnedItems(c); sharedItems().forEach(x => s.add(x)); return s;
}
function aurasFor(who) {
  if (who === 'avatar') return avatarAuras();
  const c = compById(who); if (!c) return new Set();
  const s = compOwnedAuras(c); Object.keys(S.profile.owned.auras).forEach(x => s.add(x)); return s;
}
function lookOf(who, mood) {
  let look, aura;
  if (who === 'avatar') { look = S.profile.avatar.look; aura = S.profile.avatar.aura; }
  else { const c = compById(who); if (!c) return null; look = c.look; aura = c.aura; }
  const l = { ...look, slots: { body: { id: 'body' }, shadow: { id: 'shadow' }, ...look.slots } };
  if (l.slots.body && l.slots.body.id !== 'body') { /* corpo speciale */ }
  const human = ['head_human', 'head_human_soft'].includes(l.slots.head && l.slots.head.id) && l.body !== 'child';
  if (human && mood) { const f = { happy: 'face_happy', sleepy: 'face_closed', sad: 'face_sad' }[mood]; if (f) l.slots = { ...l.slots, face: { id: f } }; }
  return { look: l, aura };
}

/* ============ Economia (deterministica, sincronizzabile) ============ */
const ACH_COINS = 120;
function computeWallet() {
  const P = S.profile; let earned = Math.round(IX.coinEntries);
  earned += IX.pomos * 10;
  // obiettivi giornalieri e settimanali raggiunti
  let goalDays = 0; for (const d of IX.byDay.keys()) if (dayMin(d) >= P.goals.day) goalDays++;
  earned += goalDays * 25;
  const weeks = new Map(); for (const [d, list] of IX.byDay) { const w = weekStart(d); weeks.set(w, (weeks.get(w) || 0) + list.reduce((s, e) => s + e.m, 0)); }
  let goalWeeks = 0; for (const v of weeks.values()) if (v >= P.goals.week) goalWeeks++;
  earned += goalWeeks * 100;
  for (let L = 2; L <= IX.lv.L; L++) earned += 30 * L;
  for (const c of P.companions) for (const r of compUnlocks(c)) if (r.t === 'chest') earned += r.coins; else if (r.t === 'item' || r.t === 'aura') earned += 15;
  for (const e of P.exams) if (e.status === 'superato') earned += 250 + (e.grade ? (e.grade - 18) * 15 : 0) + (e.lode ? 150 : 0);
  earned += (P.seen.ach ? Object.keys(P.seen.ach).length : 0) * ACH_COINS;
  const spent = P.purchases.reduce((s, x) => s + x.p, 0);
  // pozioni: acquistate + premiate - usate
  const cons = { focus: 0, oro: 0, scudo: 0 };
  P.purchases.forEach(x => { if (x.k.startsWith('cons:')) cons[x.k.slice(5)] = (cons[x.k.slice(5)] || 0) + 1; });
  P.companions.forEach(c => compUnlocks(c).forEach(r => { if (r.t === 'cons') cons[r.id]++; }));
  avatarRewardsUpTo(IX.lv.L).forEach(r => { if (r.t === 'cons') cons[r.id]++; });
  P.used.forEach(u => { if (cons[u.k] != null) cons[u.k]--; });
  return { earned, spent, coins: Math.max(0, earned - spent), cons, goalDays, goalWeeks };
}
function activeBoost() {
  const P = S.profile, now = Date.now();
  const oro = P.used.some(u => u.k === 'oro' && now - u.t < 86400000);
  const focusArmed = P.used.some(u => u.k === 'focus' && !u.done);
  return { oro, focusArmed };
}

/* ============ Persistenza: Claude, Supabase o dispositivo ============ */
const LS_KEY = 'radura.v2', LS_TIMER = 'radura.timer2', LS_SYNC = 'radura.sync', LS_V1 = 'radura.v1';
function lsGet(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } }
let localTimer = null;
function scheduleLocalSave() { clearTimeout(localTimer); localTimer = setTimeout(() => lsSet(LS_KEY, { backend: S.backend, profile: S.profile, months: S.months, at: Date.now() }), 250); }
function docBody(id) {
  if (id === 'profile') return clone(S.profile);
  const k = id.slice(4); const arr = S.months[k];
  return arr && arr.length ? { ym: k, entries: clone(arr) } : null;
}
function applyRemoteDoc(id, raw) {
  if (id === 'profile') { if (raw) { S.profile = normalizeProfile(clone(raw)); if (raw.v !== 2) setTimeout(() => Sync.mark('profile'), 50); } return true; }
  if (id.startsWith('log-')) {
    const k = id.slice(4); const arr = raw ? normEntries(clone(raw.entries)) : [];
    const tomb = new Set(S.profile.tomb);
    const fin = arr.filter(e => !tomb.has(e.id));
    if (fin.length) S.months[k] = fin; else delete S.months[k];
    return true;
  }
  return false;
}
function mergeLog(id, raw) { // unione delle voci locali e remote (per modifiche su due dispositivi)
  const k = id.slice(4); const tomb = new Set(S.profile.tomb);
  const loc = S.months[k] || []; const rem = raw ? normEntries(raw.entries) : [];
  const m = new Map(); [...rem, ...loc].forEach(e => { if (!tomb.has(e.id)) m.set(e.id, e); });
  const arr = [...m.values()]; if (arr.length) S.months[k] = arr; else delete S.months[k];
}

const SUPA = { url: 'https://gsnkhmtcarbutchjrvvd.supabase.co', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbmtobXRjYXJidXRjaGpydnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MDk5NTksImV4cCI6MjEwODI4NTk1OX0.yszcc9BVypA_zOG42vSxcvSNAjD0MQ7B0_NNoquyqUY' };
async function supaRpc(fn, body) {
  const r = await fetch(`${SUPA.url}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: SUPA.key, Authorization: 'Bearer ' + SUPA.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) { const t = await r.text().catch(() => ''); const e = new Error('sync ' + r.status + ' ' + t.slice(0, 120)); e.status = r.status; throw e; }
  return r.json();
}
function makeSyncKey() {
  const A = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; const b = new Uint8Array(24); crypto.getRandomValues(b);
  const s = [...b].map(x => A[x % 32]).join(''); return s.match(/.{4}/g).join('-');
}
const Sync = {
  dirty: new Set(), busy: new Set(), timers: {}, chain: {}, tries: {}, lastPull: null, pulling: false, pollT: null,
  mark(id) { this.dirty.add(id); clearTimeout(this.timers[id]); this.timers[id] = setTimeout(() => this.flush(id), 700); if (id === 'profile') S.profile.t = Date.now(); scheduleLocalSave(); if (S.backend !== 'local') setSync('saving'); },
  isBusy(id) { return this.dirty.has(id) || this.busy.has(id); },
  flush(id) {
    if (S.mode === 'loading') { this.timers[id] = setTimeout(() => this.flush(id), 1200); return; }
    if (S.backend === 'local' || !S.backend) { this.dirty.delete(id); return; }
    const run = async () => {
      if (!this.dirty.has(id)) return;
      this.dirty.delete(id); this.busy.add(id);
      const body = docBody(id);
      try {
        if (body && JSON.stringify(body).length > 250000) throw { code: 'too_big' };
        if (S.backend === 'claude') { const ref = S.db.doc(`data/users/${S.uid}/${id}`); if (body) await ref.set(body); else await ref.delete(); }
        else if (S.backend === 'supa') { await supaRpc('radura_push', { p_key: S.syncKey, p_id: id, p_body: body, p_deleted: !body }); }
        this.tries[id] = 0;
      } catch (e) { await this.fail(e, id); }
      finally { this.busy.delete(id); if (!this.dirty.size && !this.busy.size && S.backend !== 'local') setSync('ok'); }
    };
    this.chain[id] = (this.chain[id] || Promise.resolve()).then(run, run);
  },
  async fail(e, id) {
    const code = e && e.code;
    if (code === 'too_big') { toast('Questo blocco di dati è troppo grande: esporta un backup e alleggerisci le note.', 'bad'); setSync('err'); return; }
    if (code === 'quota_exceeded') { toast('Lo spazio online è pieno: esporta un backup.', 'bad'); setSync('err'); return; }
    if (['invalid_argument', 'revoked', 'not_granted', 'capability_disabled', 'capability_removed'].includes(code)) { goLocal('Non riesco a salvare nel tuo account: da ora salvo su questo dispositivo.'); return; }
    this.tries[id] = (this.tries[id] || 0) + 1; setSync(navigator.onLine === false ? 'offline' : 'err');
    this.dirty.add(id); this.timers[id] = setTimeout(() => this.flush(id), Math.min(60000, 5000 * this.tries[id]));
  },
  flushAll() { for (const id of [...this.dirty]) { clearTimeout(this.timers[id]); this.flush(id); } },
  async pull(first = false) { // solo Supabase
    if (S.backend !== 'supa' || this.pulling) return;
    this.pulling = true;
    try {
      const rows = await supaRpc('radura_pull', { p_key: S.syncKey, p_since: first ? null : this.lastPull });
      let changed = false;
      for (const r of rows) {
        this.lastPull = r.updated_at > (this.lastPull || '') ? r.updated_at : this.lastPull;
        if (this.isBusy(r.id)) { if (r.id.startsWith('log-') && !r.deleted) { mergeLog(r.id, r.body); changed = true; } continue; }
        if (r.id === 'profile' && r.body && r.body.t && S.profile.t > r.body.t && !first) { this.mark('profile'); continue; }
        changed = applyRemoteDoc(r.id, r.deleted ? null : r.body) || changed;
      }
      if (first) {
        const ids = new Set(rows.filter(r => !r.deleted).map(r => r.id));
        if (!ids.size) { markAll(); } // spazio nuovo: carico i dati locali
        else { for (const k of Object.keys(S.months)) if (!ids.has('log-' + k)) this.mark('log-' + k); }
        S.mode = 'ready';
      }
      lsSet(LS_SYNC, { key: S.syncKey, lastPull: this.lastPull });
      if (changed) { afterData(); scheduleLocalSave(); }
      if (!this.dirty.size && !this.busy.size) setSync('ok');
    } catch (e) { setSync(navigator.onLine === false ? 'offline' : 'err'); if (first) S.mode = 'ready'; }
    finally { this.pulling = false; }
  },
  startPolling() {
    clearInterval(this.pollT);
    this.pollT = setInterval(() => { if (!document.hidden) this.pull(); }, 20000);
    addEventListener('online', () => { this.pull(); this.flushAll(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.pull(); else this.flushAll(); });
  }
};
function setSync(s) {
  S.syncState = s;
  const el = $('#sync'); if (!el) return;
  const txt = { loading: 'Collego…', ok: 'Salvato', saving: 'Salvo…', local: 'Solo qui', err: 'Riprovo…', offline: 'Offline' }[s] || '';
  el.dataset.s = s; const t = el.querySelector('span'); if (t) t.textContent = txt;
  el.title = s === 'local' ? 'Salvato solo su questo dispositivo' : s === 'ok' ? 'Sincronizzato: uguale su tutti i tuoi dispositivi' : s === 'offline' ? 'Sei offline: salvo qui e sincronizzo appena torni online' : '';
}
function goLocal(msg) { S.backend = 'local'; S.mode = 'ready'; try { S.unsub && S.unsub(); } catch { } S.unsub = null; scheduleLocalSave(); setSync('local'); if (msg) toast(msg, 'bad'); }
function markAll(extraKeys = []) { Sync.mark('profile'); new Set([...Object.keys(S.months), ...extraKeys]).forEach(k => Sync.mark('log-' + k)); }

function commit(docs) { afterData(); docs.forEach(id => Sync.mark(id)); }
const commitProfile = () => commit(['profile']);

/* Connessione */
async function connectClaude() {
  let db = null, user = null;
  for (let i = 0; i < 30 && !(window.claude && typeof window.claude.use === 'function'); i++) await new Promise(r => setTimeout(r, 100));
  try { const c = window.claude; if (c && typeof c.use === 'function') { [db, user] = await Promise.all([c.use('db'), c.use('user')]); c.use('sample').then(x => { S.sample = x; if (S.ui.view === 'oracolo') render(); }).catch(() => { }); c.use('downloads').then(x => { S.downloads = x; }).catch(() => { }); } } catch { }
  let id = null; if (user) { try { id = await user.id(); } catch { } }
  if (!db || !id) return false;
  S.db = db; S.uid = id; S.backend = 'claude'; setSync('loading');
  let first = true; const seen = {};
  try {
    S.unsub = db.collection(`data/users/${id}`).onSnapshot(snap => {
      let changed = false;
      for (const d of snap.docs) {
        if (Sync.isBusy(d.id)) continue;
        const raw = d.data(); const sig = JSON.stringify(raw); if (seen[d.id] === sig) continue; seen[d.id] = sig;
        changed = applyRemoteDoc(d.id, raw) || changed;
      }
      for (const ch of snap.docChanges()) if (ch.type === 'removed' && !Sync.isBusy(ch.doc.id)) { delete seen[ch.doc.id]; if (ch.doc.id.startsWith('log-')) { delete S.months[ch.doc.id.slice(4)]; changed = true; } }
      if (first) {
        first = false; S.mode = 'ready';
        const ids = new Set(snap.docs.map(d => d.id));
        if (snap.empty) { markAll(); changed = true; }
        else {
          if (!ids.has('profile') && !Sync.isBusy('profile')) Sync.mark('profile');
          for (const k of Object.keys(S.months)) if (!ids.has('log-' + k) && !Sync.isBusy('log-' + k)) Sync.mark('log-' + k);
        }
        if (!Sync.dirty.size) setSync('ok');
      }
      if (changed) { afterData(); scheduleLocalSave(); }
    }, err => {
      if (err && err.code === 'unavailable') { setTimeout(() => { if (S.backend === 'claude') connectClaude(); }, 3000); return; }
      goLocal('Il salvataggio online non è disponibile: continuo su questo dispositivo.');
    });
  } catch { return false; }
  return true;
}
async function connectSupa(key) {
  S.syncKey = key; S.backend = 'supa'; setSync('loading');
  const st = lsGet(LS_SYNC); Sync.lastPull = st && st.key === key ? st.lastPull : null;
  await Sync.pull(true); Sync.startPolling();
}
