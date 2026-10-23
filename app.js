/* ============ Azioni, avvio e collegamento ============ */
function wardLookRef() { const who = wardWho(); return who === 'avatar' ? S.profile.avatar.look : compById(who).look; }
function wardSetAura(v) { const who = wardWho(); if (who === 'avatar') S.profile.avatar.aura = v || null; else compById(who).aura = v || null; }
function go(view) { closeAllSheets(); WORLD.closeDialog(); S.ui.view = view; try { history.replaceState(null, '', '#' + view); } catch { } render(); window.scrollTo({ top: 0 }); SFX.play('tab'); AUDIO.syncMusic(view === 'studio' ? 'focus' : 'world'); }
const A = {
  nav: el => go(el.dataset.v),
  'sheet-close': () => closeSheet(),
  settings: () => { closeAllSheets(); settingsForm(); },
  menu: () => { closeAllSheets(); menuSheet(); },
  sync: () => { closeAllSheets(); syncSheet(); },
  credits: () => { creditsSheet(); },
  'exam-new': () => { closeAllSheets(); examForm(); },
  'exam-open': el => examDetail(el.dataset.id),
  'exam-edit': el => { closeSheet(); examForm(el.dataset.id); },
  'exam-pass': el => passForm(el.dataset.id),
  boss: el => examDetail(el.dataset.id),
  reborn: el => examForm(null, { comp: el.dataset.id }),
  'app-book': el => { const e = exById(el.dataset.id); const a = e && e.appelli.find(x => x.id === el.dataset.a); if (!a) return; a.booked = !a.booked; commitProfile(); SFX.play('click'); },
  'log-new': () => logForm(),
  'log-exam': el => { closeSheet(); logForm({ ex: el.dataset.id }); },
  'log-day': el => logForm({ d: el.dataset.d }),
  'entry-del': el => {
    const en = IX.all.find(x => x.id === el.dataset.id); if (!en) return; const e = exById(en.ex);
    confirmSheet({ title: 'Eliminare la sessione?', text: `${fmtMin(en.m)} di ${esc(e ? e.name : 'studio')} del ${fmtDay(en.d)}.`, ok: 'Elimina', onOk: () => { removeEntry(en.id); toast('Sessione eliminata.'); } });
  },
  'en-adj': el => { const en = IX.all.find(x => x.id === el.dataset.id); if (!en) return; const m = en.m + Number(el.dataset.v); if (m <= 0) { A['entry-del'](el); return; } updateEntry(en.id, { m }); },
  'day-open': el => dayForm(el.dataset.d),
  cal: el => { const [y, m] = S.ui.calMonth.split('-').map(Number); const d = new Date(y, m - 1 + Number(el.dataset.v), 1); S.ui.calMonth = iso(d).slice(0, 7); render(); },
  'tm-exam': el => { if (T.phase !== 'idle') return; T.ex = el.dataset.id; tSave(); render(); SFX.play('click'); },
  'tm-mode': el => { if (T.phase !== 'idle') return; T.mode = el.dataset.v; S.profile.timer.mode = el.dataset.v; tSave(); commitProfile(); SFX.play('click'); },
  'tm-start': () => { tStart(); AUDIO.syncMusic('focus'); }, 'tm-pause': () => tPause(), 'tm-resume': () => tResume(),
  'tm-stop': () => { tStop(true); AUDIO.syncMusic('world'); }, 'tm-end': () => { tStop(false); AUDIO.syncMusic('world'); }, 'tm-next': () => tNext(),
  'tm-cancel': () => confirmSheet({ title: 'Annullare la sessione?', text: `I ${fmtMin(tElapsed() / 60000)} di questa sessione non verranno salvati.`, ok: 'Non salvare', onOk: () => tStop(false) }),
  'tm-go': el => {
    closeAllSheets(); WORLD.closeDialog();
    if (T.phase !== 'idle' && T.ex !== el.dataset.id) toast('Termina prima il timer in corso.');
    else { T.ex = el.dataset.id; tSave(); }
    go('studio');
  },
  'use-cons': el => { if (useConsumable(el.dataset.id)) toast(el.dataset.id === 'focus' ? 'Pozione bevuta: la prossima sessione da 20 minuti vale +50%.' : 'Elisir dorato: monete doppie per 24 ore!', 'gold'); },
  'f-sem': el => { S.ui.fSem = el.dataset.v; render(); },
  'f-ses': el => { S.ui.fSes = el.dataset.v; render(); },
  'f-passed': () => { S.ui.fPassed = !S.ui.fPassed; render(); },
  per: el => { S.ui.per = el.dataset.v; render(); },
  'o-mode': el => { S.ui.oMode = el.dataset.v; render(); },
  'o-day': el => { S.ui.oDay = Number(el.dataset.v); render(); },
  'blk-new': () => blockForm(),
  'blk-edit': el => blockForm({ id: el.dataset.id, per: el.dataset.per }),
  'per-copy': () => copyForm(),
  wk: el => { S.ui.wOff = Math.min(0, S.ui.wOff + Number(el.dataset.v)); S.ui.ai = null; render(); },
  'wk-set': el => { S.ui.wOff = Math.min(0, Math.round(diffDays(weekStart(today()), el.dataset.ws) / 7)); S.ui.ai = null; render(); },
  'oracle-week': el => { S.ui.wOff = Math.min(0, Math.round(diffDays(weekStart(today()), el.dataset.ws) / 7)); go('oracolo'); },
  'plan-study': el => { S.ui.per = null; go('orario'); blockForm({ type: 'studio', ex: el.dataset.id, start: 15 * 60, end: 17 * 60 }); },
  'demo-load': () => loadDemo(),
  'demo-clear': () => confirmSheet({ title: 'Cancellare gli esempi?', text: 'Elimino esami, compagni, studio e blocchi di esempio. I tuoi dati restano.', ok: 'Cancella esempi', onOk: clearDemo }),
  'ai-ask': () => aiAsk(),
  'ai-stop': () => { S.ui.aiCtl && S.ui.aiCtl.abort(); },
  // guardaroba
  ward: el => { const w = el.dataset.who || 'avatar'; closeAllSheets(); WORLD.closeDialog(); S.ui.ward.who = w; if (S.ui.view !== 'guardaroba') go('guardaroba'); else render(); },
  'ward-tab': el => { S.ui.ward.tab = el.dataset.v; const t = WARD_TABS.find(x => x.id === el.dataset.v); S.ui.ward.slot = t.slots.find(s => s !== 'skin' && s !== 'eyes' && wardLookRef().slots[s]) || t.slots[0]; wardRefresh(); SFX.play('tab'); },
  'ward-slot': el => { S.ui.ward.slot = el.dataset.v; wardRefresh(); SFX.play('click'); },
  'ward-item': el => { const L = wardLookRef(); const s = S.ui.ward.slot; const v = el.dataset.v; if (!v) delete L.slots[s]; else { const prev = L.slots[s]; L.slots[s] = { id: v }; const o = SPR.colorOptions(v); if (prev && prev.c && o && o.type === 'mats') { const c = {}; for (const m in prev.c) if (o.mats[m]) c[m] = prev.c[m]; if (Object.keys(c).length) L.slots[s].c = c; } } SFX.play('potion'); commitProfile(); },
  'ward-attr': el => { const L = wardLookRef(); L[el.dataset.k === 'skin' ? 'skin' : 'eyes'] = el.dataset.v; SFX.play('click'); commitProfile(); },
  'ward-body': el => { const L = wardLookRef(); L.body = el.dataset.v; for (const s in L.slots) if (!SPR.supports(L.slots[s].id, L.body)) delete L.slots[s]; if (!L.slots.head) L.slots.head = { id: 'head_human' }; SFX.play('potion'); commitProfile(); },
  'ward-aura': el => { wardSetAura(el.dataset.v); SFX.play('unlock'); commitProfile(); },
  'ward-color': el => { const L = wardLookRef(); const m = el.dataset.m; if (m === 'hair') L.hairColor = el.dataset.v; else { const e = L.slots[S.ui.ward.slot]; if (!e) return; e.c = { ...(e.c || {}), [m]: el.dataset.v }; } SFX.play('click'); commitProfile(); },
  'ward-var': el => { const e = wardLookRef().slots[S.ui.ward.slot]; if (!e) return; e.v = el.dataset.v; SFX.play('click'); commitProfile(); },
  'ward-locked': el => lockedSheet(el.dataset.kind || 'item', el.dataset.v, wardWho()),
  'avatar-wizard': () => { closeAllSheets(); avatarWizard(); },
  // bottega
  'shop-tab': el => { S.ui.shopTab = el.dataset.v; render(); SFX.play('tab'); },
  'shop-group': el => { S.ui.shopGroup = el.dataset.v; render(); },
  buy: el => { const r = buy(el.dataset.kind, el.dataset.id); if (!r.ok) { toast(r.msg, 'bad'); return; } const nm = el.dataset.kind === 'item' ? SPR.item(el.dataset.id).name : el.dataset.kind === 'aura' ? AURA_BY[el.dataset.id].name : el.dataset.kind === 'deco' ? DECO_BY[el.dataset.id].name : el.dataset.kind === 'cons' ? CONS_BY[el.dataset.id].name : el.dataset.kind === 'track' ? TRACKS.find(t => t.id === el.dataset.id).name : THEMES.find(t => t.id === el.dataset.id).name; toast(`${nm}: è tuo!`, 'gold'); },
  equip: el => { const it = SPR.item(el.dataset.id); if (!it) return; const L = S.profile.avatar.look; if (!SPR.supports(el.dataset.id, L.body)) { toast('Non adatto alla tua corporatura.'); return; } L.slots[it.slot] = { id: el.dataset.id }; commitProfile(); toast(`Indossi ${it.name}.`, 'good'); SFX.play('potion'); },
  'deco-toggle': el => { const h = S.profile.hiddenDecos; if (h[el.dataset.id]) delete h[el.dataset.id]; else h[el.dataset.id] = 1; commitProfile(); },
  track: el => { S.profile.sound.track = el.dataset.id; S.profile.sound.music = true; AUDIO.unlock(); commitProfile(); AUDIO.stopMusic(); AUDIO.syncMusic('world'); },
  theme: el => { S.profile.theme.world = el.dataset.id; commitProfile(); toast('Il villaggio cambia vestito!', 'good'); },
  music: () => { AUDIO.unlock(); S.profile.sound.music = !S.profile.sound.music; commitProfile(); AUDIO.syncMusic(S.ui.view === 'studio' ? 'focus' : 'world'); toast(S.profile.sound.music ? 'Musica accesa.' : 'Musica spenta.'); },
  'map-today': () => WORLD.mapHeroToday(),
  'map-go': el => WORLD.mapGoto(el.dataset.d),
  'onb-new': async () => { const k = makeSyncKey(); lsSet(LS_SYNC, { key: k, lastPull: null }); S.mode = 'loading'; mountApp(); await connectSupa(k); afterData(); afterReady(); setTimeout(() => syncSheet(), 600); },
  'onb-code': () => codeForm(true),
  'onb-local': () => { lsSet('radura.onb', 'local'); goLocal(); mountApp(); afterReady(); }
};
function runAct(name, data = {}) { const fn = A[name]; if (fn) fn({ dataset: data }); }
document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  if (el) { if (el.disabled) return; const fn = A[el.dataset.act]; if (fn) { ev.preventDefault(); fn(el, ev); } return; }
  const col = ev.target.closest('.tt-col');
  if (col && ev.target === col) {
    const r = col.getBoundingClientRect(); const y = ev.clientY - r.top; const h = S.profile.hours;
    const start = clamp(h.start * 60 + Math.floor(y / 52 * 2) * 30, 0, 23 * 60);
    blockForm({ day: Number(col.dataset.day), start, end: Math.min(start + 90, 23 * 60 + 45) });
  }
});
document.addEventListener('change', ev => {
  const t = ev.target;
  if (t.matches('[data-cfg]')) { const k = t.dataset.cfg; const lim = { work: [5, 180], brk: [1, 60], long: [1, 90], every: [1, 8] }[k]; S.profile.timer.custom[k] = clamp(Number(t.value) || lim[0], lim[0], lim[1]); commitProfile(); return; }
  if (t.id === 'wName' && S.ui.view === 'guardaroba') { const who = wardWho(); const v = t.value.trim(); if (who === 'avatar') S.profile.name = v; else if (v) compById(who).name = v.slice(0, 40); commitProfile(); return; }
  if (t.id === 'wTitle' && S.ui.view === 'guardaroba') { const who = wardWho(); if (who === 'avatar') S.profile.avatar.title = t.value || null; else compById(who).title = t.value || null; commitProfile(); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (SH.length) { e.preventDefault(); closeSheet(); } else WORLD.closeDialog(); } });
document.addEventListener('pointerdown', () => { AUDIO.unlock(); if (S.profile.sound.music) AUDIO.syncMusic(S.ui.view === 'studio' ? 'focus' : 'world'); }, { once: false, passive: true });

/* ---------- Timer nel DOM ---------- */
function updateTimerDom() {
  const d = timerDisplay();
  const tt = $('#tmTime'); if (tt) { if (tt.textContent !== d.text) tt.textContent = d.text; const l = $('#tmLabel'); if (l) l.textContent = d.label; const b = $('#tmBar'); if (b) b.style.width = (d.frac * 100).toFixed(2) + '%'; }
  const pill = $('#tmPill'); if (pill) { const show = T.phase !== 'idle' && S.ui.view !== 'studio'; const html = show ? `<button class="stat" data-act="nav" data-v="studio" title="Timer in corso">${pix(T.run ? 'clock' : 'pause')}<span class="num">${d.text}</span></button>` : ''; if (pill.dataset.h !== html) { pill.innerHTML = html; pill.dataset.h = html; } }
  const title = T.phase !== 'idle' && T.run ? `${d.text} · Radura degli Esami` : 'Radura degli Esami'; if (document.title !== title) document.title = title;
}

/* ---------- Tema chiaro/scuro dal dispositivo ---------- */
const MQ = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function applyMode() {
  const forced = document.documentElement.dataset.theme; const dark = forced === 'dark' || (forced !== 'light' && !!(MQ && MQ.matches));
  if (document.documentElement.dataset.mode === (dark ? 'dark' : 'light') && document.documentElement.style.getPropertyValue('--fr-panel')) return false;
  document.documentElement.dataset.mode = dark ? 'dark' : 'light';
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = dark ? '#1E1940' : '#9ADBFF';
  applyFrames(); return true;
}
try { new MutationObserver(() => { if (applyMode() !== false) { lastTopSig = null; if (S.mode !== 'onboarding' && $('#view')) render(); } }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }); } catch { }
if (MQ) (MQ.addEventListener ? MQ.addEventListener('change', onMode) : MQ.addListener(onMode));
function onMode() { applyMode(); lastTopSig = null; if (S.mode !== 'onboarding' && $('#view')) render(); }

/* ---------- Montaggio ---------- */
function mountApp() {
  $('#app').innerHTML = `<header id="hud"></header><nav id="side" aria-label="Sezioni"></nav><main id="view" tabindex="-1"></main><nav id="tabs" aria-label="Sezioni principali"></nav>`;
  lastTopSig = null; render();
}
function showOnboarding() {
  S.mode = 'onboarding';
  $('#app').innerHTML = `<div class="onb"><div class="logo"><canvas id="onbC" class="px" style="width:100%;height:210px;border:4px solid var(--line);display:block"></canvas><h1>Radura degli Esami</h1><p class="muted" style="max-width:440px">Studia con il timer, fai crescere i tuoi compagni fantasy, sconfiggi i boss degli appelli e organizza lezioni e sessioni.</p></div>
    <section class="card"><div class="stack">
      <button class="btn primary" data-act="onb-new">${pix('star')} Inizia una nuova avventura</button>
      <button class="btn" data-act="onb-code">${pix('sync')} Ho già un codice (altro dispositivo)</button>
      <button class="btn ghost" data-act="onb-local">Usa solo su questo dispositivo</button>
      <p class="hint">Con la nuova avventura ricevi un codice segreto: inseriscilo sull'iPhone, l'iPad e il Mac per avere gli stessi dati ovunque, sempre aggiornati.</p></div></section></div>`;
  const c = $('#onbC'); const sp = SPECIES[Math.floor(Math.random() * SPECIES.length)];
  if (c) WORLD.mountPreview(c, () => { const l = speciesLook(sp.id); return { look: { ...l, slots: { body: { id: 'body' }, shadow: { id: 'shadow' }, ...l.slots } }, aura: 'scintille' }; }, { h: 110, burst: '#FFE27A' });
}
let readyDone = false;
function afterReady() {
  if (readyDone) return; readyDone = true;
  autoShield(); checkAchievements();
  setTimeout(() => { if (!S.profile.avatar.made && !SH.length && S.mode === 'ready') avatarWizard(); }, 1400);
}

/* ---------- Avvio ---------- */
let lastDay = today(), lastTK = null;
function startLoops() {
  setInterval(() => {
    tick();
    if (today() !== lastDay) { lastDay = today(); autoShield(); render(); }
  }, 1000);
  setInterval(() => { const tk = ART.timeKey(); if (tk !== lastTK) { lastTK = tk; if (S.ui.view === 'radura') WORLD.refreshVillage(); } }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); if (T.run) wake(true); if (today() !== lastDay) { lastDay = today(); render(); } } });
}
async function boot(data) {
  SPR.setBase(window.RADURA_BASE || '');
  applyMode();
  const c = lsGet(LS_KEY);
  if (c && c.profile) { S.profile = normalizeProfile(c.profile); S.months = {}; for (const k in c.months || {}) { const a = normEntries(c.months[k]); if (a.length) S.months[k] = a; } }
  else { const v1 = lsGet(LS_V1); if (v1 && v1.profile) { S.profile = normalizeProfile(v1.profile); S.months = {}; for (const k in v1.months || {}) { const a = normEntries(v1.months[k]); if (a.length) S.months[k] = a; } } }
  const h = (location.hash || '').slice(1); if (VIEWS[h]) S.ui.view = h;
  if (data && VIEWS[data.view]) S.ui.view = data.view;
  rebuild(); lastTK = ART.timeKey();
  // gli sprite servono subito: precarico gli atlanti principali
  try { await SPR.portrait(lookOf('avatar').look); } catch { }
  startLoops();
  const inClaude = !!(window.claude && typeof window.claude.use === 'function') || window.RADURA_ARTIFACT === true;
  if (inClaude) {
    S.mode = 'loading'; mountApp(); setSync('loading');
    const ok = await connectClaude(); if (!ok) goLocal();
    const wait = setInterval(() => { if (S.mode === 'ready') { clearInterval(wait); afterReady(); } }, 300);
    return;
  }
  const st = lsGet(LS_SYNC);
  if (st && st.key) { S.mode = 'loading'; mountApp(); await connectSupa(st.key); afterData(); afterReady(); }
  else if (lsGet('radura.onb') === 'local' || (c && c.profile && c.backend === 'local')) { goLocal(); mountApp(); afterReady(); }
  else showOnboarding();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
}
const hot = window.claude && window.claude.hot;
if (hot && typeof hot.snapshot === 'function') { try { hot.snapshot(() => ({ view: S.ui.view })); } catch { } }
if (hot && typeof hot.ready === 'function') hot.ready(boot); else boot((hot && hot.data) || {});
