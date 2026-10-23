/* ============ Azioni sui dati ============ */
function addEntry({ d, ex, m, src = 'manuale', note = '', pomo = false }) {
  if (!ex || !(m > 0)) return null;
  const e = exById(ex);
  const before = e && e.comp ? compBond(compById(e.comp)).L : 0;
  const lvBefore = IX.lv.L;
  const en = { id: uid(), d, ex, m: Math.round(m), src, note, t: Date.now() };
  if (pomo) en.p = 1;
  const P = S.profile; let profTouched = false;
  const armed = P.used.find(u => u.k === 'focus' && !u.done);
  if (armed && m >= 20) { en.b = 1.5; armed.done = Date.now(); profTouched = true; }
  if (activeBoost().oro) en.g = 2;
  const k = ymOf(d); (S.months[k] ||= []).push(en);
  commit(profTouched ? ['log-' + k, 'profile'] : ['log-' + k]);
  if (e && e.comp) {
    const c = compById(e.comp); const after = compBond(c).L;
    if (after > before) setTimeout(() => celebrateBond(c, before, after), 400);
  }
  if (IX.lv.L > lvBefore) setTimeout(() => celebrateAvatar(lvBefore, IX.lv.L), 900);
  checkAchievements();
  return en;
}
function removeEntry(id) {
  for (const k in S.months) {
    const i = S.months[k].findIndex(e => e.id === id);
    if (i >= 0) { S.months[k].splice(i, 1); if (!S.months[k].length) delete S.months[k]; S.profile.tomb.push(id); commit(['log-' + k, 'profile']); return true; }
  }
  return false;
}
function updateEntry(id, patch) { for (const k in S.months) { const en = S.months[k].find(e => e.id === id); if (en) { Object.assign(en, patch); commit(['log-' + k]); return; } } }

/* Esame superato: il legame finisce nell'Albo */
function snapshotBond(e) {
  const c = compById(e.comp); if (!c) return;
  const min = examMin(e.id), tier = compTier(c);
  const entries = IX.all.filter(x => x.ex === e.id);
  const days = [...new Set(entries.map(x => x.d))].sort();
  const months = {}; entries.forEach(x => { const k = ymOf(x.d); months[k] = (months[k] || 0) + x.m; });
  let bestDay = null, bestMin = 0; const perDay = {}; entries.forEach(x => { perDay[x.d] = (perDay[x.d] || 0) + x.m; });
  for (const d in perDay) if (perDay[d] > bestMin) { bestMin = perDay[d]; bestDay = d; }
  c.history = c.history.filter(h => h.ex !== e.id);
  c.history.push({ ex: e.id, name: e.name, color: e.color, cfu: e.cfu, sem: e.sem, ses: e.ses, ay: e.ay, grade: e.grade, lode: e.lode, passedOn: e.passedOn || today(), min, tier, level: bondLevel(min, tier), sessions: entries.length, firstDay: days[0] || null, lastDay: days[days.length - 1] || null, days: days.length, months, bestDay, bestMin, boss: bossFor(e).id, look: clone(c.look), aura: c.aura });
}
function passExam(e, grade, lode, date) {
  Object.assign(e, { status: 'superato', grade, lode: grade === 30 && lode, passedOn: date || today() });
  rebuild(); snapshotBond(e);
  commitProfile(); checkAchievements();
}
function unpassFix(e) { // l'esame torna attivo: tolgo la scheda dall'Albo
  const c = compById(e.comp); if (c) c.history = c.history.filter(h => h.ex !== e.id);
}

/* Boss */
function bossFor(e) { return BOSSES[hashStr(e.id) % BOSSES.length]; }
function bossState(e) {
  const need = examTargetMin(e), done = examMin(e.id);
  const pow = clamp(done / need, 0, 1);
  return { boss: bossFor(e), need, done, pow, hp: 1 - pow };
}

/* ============ Negozio ============ */
function priceOf(kind, id) {
  if (kind === 'item') { const it = SPR.item(id); return it ? RARITY[it.rar].price : 0; }
  if (kind === 'aura') return RARITY[AURA_BY[id].rar].price;
  if (kind === 'deco') return DECO_BY[id].price;
  if (kind === 'cons') return CONS_BY[id].price;
  if (kind === 'track') return (TRACKS.find(t => t.id === id) || {}).price || 0;
  if (kind === 'theme') return (THEMES.find(t => t.id === id) || {}).price || 0;
  return 0;
}
function owns(kind, id) {
  const o = S.profile.owned;
  if (kind === 'item') return sharedItems().has(id);
  if (kind === 'aura') return !!o.auras[id];
  if (kind === 'deco') return !!o.decos[id];
  if (kind === 'track') return !!o.tracks[id] || priceOf('track', id) === 0;
  if (kind === 'theme') return !!o.themes[id] || priceOf('theme', id) === 0;
  return false;
}
function buy(kind, id) {
  const p = priceOf(kind, id);
  if (kind !== 'cons' && owns(kind, id)) return { ok: false, msg: 'Ce l\'hai già.' };
  if (IX.wallet.coins < p) return { ok: false, msg: `Ti mancano ${num(p - IX.wallet.coins)} monete.` };
  const P = S.profile;
  P.purchases.push({ k: kind + ':' + id, p, t: Date.now() });
  const map = { item: 'items', aura: 'auras', deco: 'decos', track: 'tracks', theme: 'themes' }[kind];
  if (map) P.owned[map][id] = 1;
  commitProfile(); SFX.play('coin');
  return { ok: true };
}
function useConsumable(id) {
  const n = IX.wallet.cons[id] || 0; if (n <= 0) return false;
  const P = S.profile;
  if (id === 'focus' && P.used.some(u => u.k === 'focus' && !u.done)) { toast('Hai già una pozione attiva: vale per la prossima sessione.'); return false; }
  if (id === 'scudo') { toast('Lo scudo si attiva da solo quando salti un giorno.'); return false; }
  P.used.push({ k: id, t: Date.now() }); commitProfile(); SFX.play('potion');
  return true;
}
function autoShield() { // salva la serie se ieri non hai studiato
  const P = S.profile; const y = addDays(today(), -1), y2 = addDays(today(), -2);
  if (dayMin(y) > 0 || P.shields.includes(y)) return;
  if (!(dayMin(y2) > 0 || P.shields.includes(y2))) return;
  if ((IX.wallet.cons.scudo || 0) <= 0) return;
  P.shields.push(y); P.used.push({ k: 'scudo', t: Date.now() }); commitProfile();
  setTimeout(() => toast('Lo scudo della fiamma ha protetto la tua serie di ieri!'), 1200);
}

/* ============ Statistiche & Oracolo ============ */
function weekStats(ws) {
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const per = new Map(); const perDay = days.map(() => new Map()); let total = 0, active = 0;
  days.forEach((d, i) => { let dm = 0; for (const en of IX.byDay.get(d) || []) { per.set(en.ex, (per.get(en.ex) || 0) + en.m); perDay[i].set(en.ex, (perDay[i].get(en.ex) || 0) + en.m); dm += en.m; } total += dm; if (dm > 0) active++; });
  return { ws, days, per, perDay, total, active };
}
function oracle(ws) {
  const t = today(), we = addDays(ws, 6);
  const ended = we < t, current = ws <= t && t <= we;
  const st = weekStats(ws);
  const ref = ended ? addDays(we, 1) : current ? t : ws;
  const goal = S.profile.goals.week;
  const frac = ended ? 1 : current ? (dow(t) + 1) / 7 : 0;
  const base = Math.max(st.total, goal * frac);
  const ex = S.profile.exams.filter(e => e.status !== 'superato' || st.per.has(e.id));
  const items = ex.map(e => {
    const tg = examTarget(e, ref); const dl = tg ? Math.max(0, diffDays(ref, tg.date)) : 150;
    const u = clamp(90 / (dl + 15), .35, 3); const w = e.status === 'superato' ? 0 : ((e.cfu || 6) / 6) * u;
    return { e, tg, dl, u, w, act: st.per.get(e.id) || 0 };
  });
  const sw = items.reduce((s, i) => s + i.w, 0) || 1;
  items.forEach(i => { i.share = i.w / sw; i.exp = i.share * base; i.def = i.exp - i.act; i.actShare = st.total ? i.act / st.total : 0; i.next = Math.max(30, Math.round((i.share * goal + Math.max(0, i.def) * .5) / 30) * 30); const l = IX.last.get(i.e.id); i.since = l ? diffDays(l, ref) : null; });
  items.sort((a, b) => b.def - a.def);
  const balance = st.total ? clamp(Math.round(100 - items.reduce((s, i) => s + Math.abs(i.actShare - i.share), 0) * 50), 0, 100) : 0;
  const top = items.filter(i => i.def > 20).slice(0, 3);
  const fav = [...items].sort((a, b) => b.act - a.act)[0];
  return { st, items, balance, ended, current, ref, base, goal, top, fav };
}
function whyLine(i) { const p = []; if (i.tg) p.push(i.tg.kind === 'appello' ? `appello ${inDays(i.dl)}` : i.tg.inSession ? 'sessione in corso' : `sessione ${inDays(i.dl)}`); if (i.e.cfu) p.push(`${i.e.cfu} CFU`); return p.join(' · '); }
function adviceLine(i) {
  if (i.act === 0) return i.since === null ? 'Non avete ancora studiato insieme.' : `Nessun minuto questa settimana: l'ultima volta è stata ${i.since <= 1 ? 'ieri' : i.since + ' giorni fa'}.`;
  return `Ha avuto ${fmtMin(i.act)} (${pct(i.actShare)}), ma merita circa il ${pct(i.share)} del tuo tempo.`;
}
function balanceWord(b) { return b >= 85 ? 'Equilibrio da elfo saggio' : b >= 65 ? 'Buon equilibrio' : b >= 40 ? 'Un po\' sbilanciato' : 'Molto sbilanciato'; }
function weeksBack(n) { const ws0 = weekStart(today()); return [...Array(n)].map((_, i) => addDays(ws0, -7 * (n - 1 - i))); }
function plannedWeek(period, ay) {
  const blocks = S.profile.schedule[`${ay}-${period}`] || []; const per = new Map();
  for (const b of blocks) { if (!b.ex) continue; const o = per.get(b.ex) || { lez: 0, stu: 0 }; const d = b.end - b.start; if (b.type === 'studio') o.stu += d; else if (b.type === 'lezione' || b.type === 'eserc') o.lez += d; per.set(b.ex, o); }
  return per;
}
function career() {
  const passed = S.profile.exams.filter(e => e.status === 'superato');
  const cfu = passed.reduce((s, e) => s + (e.cfu || 0), 0);
  const graded = passed.filter(e => e.grade >= 18 && e.cfu > 0); const w = graded.reduce((s, e) => s + e.cfu, 0);
  const avg = w ? graded.reduce((s, e) => s + e.grade * e.cfu, 0) / w : null;
  return { passed: passed.length, cfu, avg, base: avg ? avg * 110 / 30 : null, totalCfu: S.profile.exams.reduce((s, e) => s + (e.cfu || 0), 0) };
}

/* Trofei */
function achievements() {
  const best = bestStreak(), total = IX.total;
  let maxDay = 0; for (const d of IX.byDay.keys()) maxDay = Math.max(maxDay, dayMin(d));
  const bonds = S.profile.companions.map(c => compBond(c).L);
  const maxBond = Math.max(0, ...bonds, ...S.profile.companions.flatMap(c => (c.history || []).map(h => h.level || 0)));
  let balanced = false;
  for (const ws of weeksBack(12)) { const st = weekStats(ws); const act = S.profile.exams.filter(e => e.status !== 'superato'); if (act.length >= 2 && act.every(e => (st.per.get(e.id) || 0) >= 60)) { balanced = true; break; } }
  const early = IX.all.some(e => e.t && new Date(e.t).getHours() < 9 && new Date(e.t).getHours() >= 5);
  const night = IX.all.some(e => e.t && new Date(e.t).getHours() >= 22);
  const passed = S.profile.exams.filter(e => e.status === 'superato');
  const reborn = S.profile.companions.some(c => c.history.length >= 1 && IX.active.has(c.id));
  return [
    { id: 'primo', k: 'star', c: '#E0709A', t: 'Primo passo', d: 'Registra la prima sessione', ok: total > 0 },
    { id: 'fiamma3', k: 'flame', c: '#F08A5D', t: 'Fiamma accesa', d: '3 giorni di fila', ok: best >= 3 },
    { id: 'fiamma7', k: 'flame', c: '#E25C5C', t: 'Fuoco sacro', d: '7 giorni di fila', ok: best >= 7 },
    { id: 'fiamma30', k: 'flame', c: '#B05FB0', t: 'Fiamma eterna', d: '30 giorni di fila', ok: best >= 30 },
    { id: 'ore10', k: 'hour', c: '#4A9BD9', t: 'Dieci ore', d: '10 ore totali', ok: total >= 600 },
    { id: 'ore50', k: 'hour', c: '#8E7CD6', t: 'Cinquanta ore', d: '50 ore totali', ok: total >= 3000 },
    { id: 'ore100', k: 'hour', c: '#0FA5B5', t: 'Cento ore', d: '100 ore totali', ok: total >= 6000 },
    { id: 'ore300', k: 'hour', c: '#D9A62E', t: 'Trecento ore', d: '300 ore totali', ok: total >= 18000 },
    { id: 'legame5', k: 'heart', c: '#3FAE8C', t: 'Amicizia', d: 'Un compagno al livello 5', ok: maxBond >= 5 },
    { id: 'legame10', k: 'heart', c: '#E0709A', t: 'Legame forte', d: 'Un compagno al livello 10', ok: maxBond >= 10 },
    { id: 'legame20', k: 'crown', c: '#D9A62E', t: 'Leggenda', d: 'Un compagno al livello 20', ok: maxBond >= 20 },
    { id: 'equilibrio', k: 'scale', c: '#7FA35B', t: 'Equilibrista', d: 'Una settimana con 1h+ per ogni esame', ok: balanced },
    { id: 'maratona', k: 'bolt', c: '#E25C5C', t: 'Maratona', d: '5 ore in un giorno', ok: maxDay >= 300 },
    { id: 'pomodori', k: 'tomato', c: '#E25C5C', t: 'Orto di pomodori', d: '10 pomodori completati', ok: IX.pomos >= 10 },
    { id: 'pomodori100', k: 'tomato', c: '#B05FB0', t: 'Raccolto d\'oro', d: '100 pomodori completati', ok: IX.pomos >= 100 },
    { id: 'allodola', k: 'sun', c: '#D9A62E', t: 'Allodola', d: 'Studia prima delle 9', ok: early },
    { id: 'gufo', k: 'moon', c: '#4A5FC8', t: 'Gufo notturno', d: 'Studia dopo le 22', ok: night },
    { id: 'vittoria', k: 'laurel', c: '#3FAE8C', t: 'Vittoria!', d: 'Supera un esame', ok: passed.length > 0 },
    { id: 'lode', k: 'laurel', c: '#D9A62E', t: 'Trenta e lode', d: 'Prendi la lode', ok: passed.some(e => e.lode) },
    { id: 'rinascita', k: 'egg', c: '#8E7CD6', t: 'Rinascita', d: 'Riprendi un compagno dall\'Albo', ok: reborn },
    { id: 'collezione', k: 'chest', c: '#F08A5D', t: 'Collezionista', d: 'Possiedi 25 oggetti in bottega', ok: Object.keys(S.profile.owned.items).length >= 25 }
  ];
}
let achChecking = false;
function checkAchievements() {
  if (achChecking || S.mode === 'loading') return; achChecking = true;
  try {
    const P = S.profile; P.seen.ach ||= {};
    const fresh = achievements().filter(a => a.ok && !P.seen.ach[a.id]);
    if (fresh.length) {
      fresh.forEach(a => { P.seen.ach[a.id] = today(); });
      commitProfile();
      fresh.forEach((a, i) => setTimeout(() => toast(`Trofeo sbloccato: ${a.t} (+${ACH_COINS} monete)`, 'gold'), 1500 + i * 1800));
    }
  } finally { achChecking = false; }
}

/* ============ Timer con 5 modalità ============ */
let T = Object.assign({ ex: null, mode: null, phase: 'idle', start: 0, acc: 0, run: false, n: 0, day: null, cfg: null }, lsGet(LS_TIMER) || {});
const tSave = () => lsSet(LS_TIMER, T);
const tElapsed = () => T.acc + (T.run ? Date.now() - T.start : 0);
function tCfg() {
  const m = T.mode || S.profile.timer.mode;
  if (m === 'free') return { mode: 'free' };
  if (m === 'custom') return { mode: 'custom', ...S.profile.timer.custom };
  return { mode: m, ...TIMER_MODES[m] };
}
let WL = null;
async function wake(on) {
  try {
    if (on && !WL && navigator.wakeLock) { WL = await navigator.wakeLock.request('screen'); WL.addEventListener && WL.addEventListener('release', () => { WL = null; }); }
    else if (!on && WL) { const w = WL; WL = null; await w.release(); }
  } catch { WL = null; }
}
function timerExam() { return T.ex && exById(T.ex) ? exById(T.ex) : null; }
function tStart() {
  if (!timerExam()) { const a = activeExams()[0]; if (!a) { toast('Aggiungi prima un esame da studiare.'); return; } T.ex = a.id; }
  AUDIO.unlock();
  T.mode = T.mode || S.profile.timer.mode; T.cfg = tCfg();
  Object.assign(T, { phase: 'work', start: Date.now(), acc: 0, run: true, day: today(), n: 0 }); tSave(); wake(true); SFX.play('start'); render();
}
function tPause() { T.acc = tElapsed(); T.run = false; tSave(); SFX.play('click'); render(); }
function tResume() { AUDIO.unlock(); T.start = Date.now(); T.run = true; tSave(); wake(true); SFX.play('click'); render(); }
function tLog(m, pomo) { const e = timerExam(); if (!e || m < 1) return; addEntry({ d: T.day || today(), ex: e.id, m, src: T.cfg && T.cfg.mode !== 'free' ? 'pomodoro' : 'timer', pomo }); toast(`+${fmtMin(m)} con ${compName(e)}`, 'good'); }
function tStop(save = true) {
  if (save && T.phase === 'work') { const m = Math.floor(tElapsed() / 60000); if (m >= 1) tLog(m, false); else toast('Meno di un minuto: niente da registrare.'); }
  Object.assign(T, { phase: 'idle', run: false, acc: 0, start: 0, n: 0, mode: null, cfg: null }); tSave(); wake(false); render();
}
function tNext() { AUDIO.unlock(); Object.assign(T, { phase: 'work', start: Date.now(), acc: 0, run: true, day: today() }); tSave(); wake(true); render(); }
function tBreakLen() { const c = T.cfg || tCfg(); return ((c.every && T.n % c.every === 0) ? c.long : c.brk) * 60000; }
function tick() {
  const c = T.cfg;
  if (T.phase !== 'idle' && c && c.mode !== 'free' && T.run) {
    const el = tElapsed(), W = c.work * 60000;
    if (T.phase === 'work' && el >= W) {
      tLog(c.work, true); T.n++; const B = tBreakLen();
      Object.assign(T, { phase: 'break', acc: Math.min(el - W, B - 1000), start: Date.now() }); tSave(); SFX.play('bell');
      notifyUser(`Pomodoro completato! Pausa di ${Math.round(B / 60000)} minuti.`);
      render();
    } else if (T.phase === 'break' && el >= tBreakLen()) {
      Object.assign(T, { phase: 'ready', run: false, acc: 0 }); tSave(); SFX.play('bell2');
      notifyUser('Pausa finita: pronto per il prossimo giro?'); render();
    }
  }
  if (typeof updateTimerDom === 'function') updateTimerDom();
}
function timerDisplay() {
  const el = tElapsed(); const c = T.cfg || tCfg();
  let ms = el, frac = 0, label = 'Pronto';
  if (c.mode !== 'free') {
    const W = c.work * 60000, B = tBreakLen();
    if (T.phase === 'work') { ms = Math.max(0, W - el); frac = el / W; label = T.run ? `Concentrazione · giro ${T.n + 1}` : 'In pausa'; }
    else if (T.phase === 'break') { ms = Math.max(0, B - el); frac = el / B; label = (B > c.brk * 60000 ? 'Pausa lunga' : 'Pausa') + ': respira e bevi'; }
    else if (T.phase === 'ready') { ms = W; frac = 0; label = `Giri completati: ${T.n}`; }
    else { ms = W; label = `${c.work} min di studio · ${c.brk} di pausa`; }
  } else {
    frac = (el % 3600000) / 3600000;
    label = T.phase === 'work' ? (T.run ? 'Sessione libera' : 'In pausa') : 'Avvia e termina quando vuoi';
  }
  const s = Math.floor(ms / 1000); const h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  return { text: h ? `${h}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`, frac: clamp(frac, 0, 1), label };
}
function notifyUser(msg) {
  toast(msg, 'gold');
  try { if (document.hidden && 'Notification' in window && Notification.permission === 'granted') new Notification('Radura degli Esami', { body: msg, icon: 'icons/icon-192.png' }); } catch { }
}
function compName(e) { const c = e && compById(e.comp); return c ? c.name : 'il tuo compagno'; }
