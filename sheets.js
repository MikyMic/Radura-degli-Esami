/* ============ Fogli (modali), celebrazioni, moduli ============ */
const SH = [];
function openSheet(html, { refresh = null, onClose = null, wide = false } = {}) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="sheet ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
  let down = false;
  ov.addEventListener('pointerdown', e => { down = e.target === ov; });
  ov.addEventListener('click', e => { if (e.target === ov && down) closeSheet(); down = false; });
  $('#sheets').appendChild(ov); SH.push({ ov, refresh, onClose });
  document.body.style.overflow = 'hidden';
  const sh = ov.firstElementChild; hydrate(sh);
  setTimeout(() => { const f = sh.querySelector('[data-autofocus]'); (f || sh).focus({ preventScroll: true }); }, 60);
  SFX.play('whoosh');
  return sh;
}
function closeSheet() { const s = SH.pop(); if (!s) return; s.ov.remove(); s.onClose && s.onClose(); if (!SH.length) document.body.style.overflow = ''; }
function closeAllSheets() { while (SH.length) closeSheet(); }
function refreshSheets() { SH.forEach(s => { if (s.refresh) { try { s.refresh(s.ov.firstElementChild); hydrate(s.ov.firstElementChild); } catch (e) { console.error(e); } } }); }
const sheetHead = (title, sub = '') => `<div class="sheet-h"><div style="min-width:0"><h2>${title}</h2>${sub ? `<p class="hint" style="margin-top:3px">${sub}</p>` : ''}</div><button class="btn icon small" data-act="sheet-close" aria-label="Chiudi">${pix('close')}</button></div>`;
function confirmSheet({ title, text, ok = 'Conferma', danger = true, onOk }) {
  const sh = openSheet(`${sheetHead(title)}<p>${text}</p><div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Annulla</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cfOk" data-autofocus>${ok}</button></div>`);
  sh.querySelector('#cfOk').onclick = () => { closeSheet(); onOk(); };
}
let toastT = null;
function toast(msg, kind = '') {
  const r = $('#toastRoot'); if (!r) return; clearTimeout(toastT);
  const ic = kind === 'gold' ? 'trophy' : kind === 'bad' ? 'close' : kind === 'good' ? 'check' : 'star';
  r.innerHTML = `<div class="toast ${kind}" role="status">${pix(ic)}<span>${esc(msg)}</span></div>`;
  if (kind === 'gold') SFX.play('unlock'); else if (kind === 'bad') SFX.play('error');
  toastT = setTimeout(() => { r.innerHTML = ''; }, kind === 'bad' ? 5200 : 3400);
}
function afterData() { rebuild(); render(); refreshSheets(); }

/* ---------- Scheda dell'esame ---------- */
function rewardTrack(c, tier, level, body, compact = false) {
  const list = bondRewards(c.sp, tier); const next = list.find(r => r.L > level);
  return `<div class="track20">${list.map(r => `<div class="rw ${r.L <= level ? 'got' : 'lock'} ${next && r.L === next.L ? 'next' : ''}" title="Livello ${r.L}: ${esc(rewardLabel(r))}"><span class="lvn">${r.L}</span>${rewardIcon(r, body)}<small>${esc(rewardLabel(r))}</small></div>`).join('')}</div>`;
}
function detailHTML(id) {
  const e = exById(id); if (!e) return sheetHead('Esame non trovato');
  const c = compById(e.comp); const sp = c ? SPECIES_BY[c.sp] : null; const m = examMin(e.id), mood = moodOfExam(e), tg = examTarget(e), t = today();
  const wk = weekStats(weekStart(t)).per.get(e.id) || 0, last = IX.last.get(e.id);
  const passed = e.status === 'superato'; const hi = passed && c ? c.history.findIndex(h => h.ex === e.id) : -1; const h = hi >= 0 ? c.history[hi] : null;
  const b = c && !passed ? compBond(c) : null; const tier = h ? h.tier : b ? b.tier : 0; const level = h ? h.level : b ? b.L : 0;
  const stg = ART.houseStage(level); const bs = bossState(e);
  const apps = (e.appelli || []).slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const links = (e.links || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
  const info = [['user', 'Docente', e.teacher], ['pin', 'Aula', e.room], ['clock', 'Ricevimento', e.office]].filter(x => x[2]);
  const nextAt = [2, 6, 12, 18][stg];
  return `${sheetHead(esc(e.name), `${SEMESTRI[e.sem]} · ${SESSIONI[e.ses].label} ${e.ay + 1}${e.cfu ? ' · ' + e.cfu + ' CFU' : ''}`)}
    ${c ? `<div class="ex-hero" style="--c:${colorOf(e)}"><canvas class="preview px" id="exPrev" width="120" height="120"></canvas><div style="min-width:0;display:grid;gap:4px">
      <div class="row"><span class="tier-badge tier-${Math.min(4, tier)}">${TIER_NAMES[Math.min(4, tier)]}</span><span class="pill" style="background:rgba(255,255,255,.14);color:#fff">Lv ${level}/${BOND_MAX}</span></div>
      <h3>${esc(c.name)}${c.title ? ` <small class="hint">«${esc(c.title)}»</small>` : ''}</h3><p class="muted" style="font-size:13px">${esc(sp ? sp.name : '')} · «${esc(sp ? sp.motto : '')}»</p>
      <p class="hint">${passed ? 'Leggenda dell\'Albo degli Eroi' : MOOD_TEXT[mood]}</p>
      ${b ? `<span class="bar" style="--c:${colorOf(e)}"><i style="width:${(b.prog * 100).toFixed(1)}%"></i></span><p class="hint">${b.L < BOND_MAX ? `${fmtMin(bondNeed(b.L + 1, b.tier) - b.min)} al livello ${b.L + 1}` : 'Legame al massimo!'} · ${ART.HOUSE_NAMES[stg]}${nextAt ? ` (diventa ${ART.HOUSE_NAMES[stg + 1].toLowerCase()} al Lv ${nextAt})` : ''}</p>` : ''}
    </div></div>` : ''}
    <div class="row" style="margin-top:12px"><span class="pill ${STATUS[e.status].cls}">${STATUS[e.status].label}</span>${passed && e.grade ? `<span class="pill gold">Voto ${e.grade}${e.lode ? ' e lode' : ''}</span>` : ''}<span class="pill">a.a. ${ayLabel(e.ay)}</span><span class="pill">Obiettivo ${fmtMin(examTargetMin(e))}</span></div>
    <div class="kv" style="margin-top:12px"><div><small>Totale</small><b>${fmtMin(m)}</b></div><div><small>Settimana</small><b>${fmtMin(wk)}</b></div><div><small>Ultima volta</small><b>${last ? (last === t ? 'oggi' : fmtDay(last)) : '–'}</b></div><div><small>Prossima prova</small><b>${passed ? '–' : tg ? cap(inDays(diffDays(t, tg.date))) : '–'}</b></div></div>
    ${!passed ? `<div class="sec-t"><span class="rib red">${pix('skull')} Il boss</span></div><div class="boss-box">${ptBoss(bs.boss.id, 'framed lg')}<div style="display:grid;gap:4px"><b class="pix" style="font-size:22px">${esc(bs.boss.name)}</b><span class="bar hp"><i style="width:${(bs.hp * 100).toFixed(1)}%"></i></span><p class="hint">Vita ${Math.round(bs.hp * 100)}% · ogni minuto di studio lo indebolisce: ${fmtMin(bs.done)} di ${fmtMin(bs.need)}.</p></div></div>` : ''}
    ${c ? `<div class="sec-t"><span class="rib lav">${pix('chest')} Sbloccabili del legame</span><span class="hint">${bondRewards(c.sp, tier).filter(r => r.L <= level).length}/20</span></div>${rewardTrack(c, tier, level, sp ? sp.body : 'female')}<p class="hint" style="margin-top:6px">Superato l'esame, ${esc(c.name)} entra nell'Albo con tutto il bottino. Richiamandolo per un nuovo esame riparte dal livello 0 con <b>nuovi premi più rari</b>.</p>` : ''}
    <div class="sec-t"><span class="rib">${pix('orario')} Appelli</span></div>
    ${apps.length ? `<div class="list">${apps.map(a => { const d = a.date ? pd(a.date) : null; const past = a.date && a.date < t; return `<div class="li" style="${past ? 'opacity:.55' : ''}"><span class="datepill" style="--dp:${colorOf(e)}">${d ? `<b>${d.getDate()}</b><small>${MESI_S[d.getMonth()]}</small>` : '<b>?</b>'}</span><span class="grow"><b>${APP_TYPES[a.type]}${a.time ? ' · ' + esc(a.time) : ''}</b><small>${a.date ? (past ? 'concluso' : inDays(diffDays(t, a.date))) : 'data da definire'}${a.place ? ' · ' + esc(a.place) : ''}</small></span>${past ? '' : `<button class="chip" data-act="app-book" data-id="${e.id}" data-a="${a.id}" aria-pressed="${a.booked}">${a.booked ? pix('check') + ' Prenotato' : 'Da prenotare'}</button>`}</div>`; }).join('')}</div>` : `<p class="muted">Nessun appello inserito. ${!passed ? `La ${SESSIONI[e.ses].label.toLowerCase()} va dal ${fmtDay(sessionRange(e.ses, e.ay)[0])} al ${fmtDay(sessionRange(e.ses, e.ay)[1])} ${e.ay + 1}.` : ''}</p>`}
    ${info.length ? `<div class="sec-t"><span class="rib sky">${pix('user')} Informazioni</span></div><div class="list">${info.map(([ic, l, v]) => `<div class="li">${pix(ic, '', 3)}<span class="grow"><small>${l}</small><b style="white-space:normal">${esc(v)}</b></span></div>`).join('')}</div>` : ''}
    ${e.notes ? `<div class="sec-t"><span class="rib gold">${pix('pencil')} Note</span></div><div class="notes">${esc(e.notes)}</div>` : ''}
    ${links.length ? `<div class="sec-t"><span class="rib sky">${pix('link')} Link</span></div><div class="links">${links.map(l => /^https?:\/\//i.test(l) ? `<a href="${esc(l)}" target="_blank" rel="noopener noreferrer">${esc(l)}</a>` : `<span>${esc(l)}</span>`).join('')}</div>` : ''}
    <div class="sheet-f"><button class="btn" data-act="exam-edit" data-id="${e.id}">${pix('pencil')} Modifica</button>${!passed ? `<button class="btn gold" data-act="exam-pass" data-id="${e.id}">${pix('trophy')} Superato</button>` : `<button class="btn" data-act="nav" data-v="albo">${pix('albo')} Albo</button>`}<button class="btn" data-act="log-exam" data-id="${e.id}">${pix('hand')} Segna</button>${!passed ? `<button class="btn primary" data-act="tm-go" data-id="${e.id}">${pix('play')} Studia</button>` : ''}</div>`;
}
function mountExPrev(sh, id) {
  const cv = sh.querySelector('#exPrev'); const e = exById(id); if (!cv || !e) return;
  const c = compById(e.comp); if (!c) return;
  const passed = e.status === 'superato'; const h = passed ? c.history.find(x => x.ex === e.id) : null;
  WORLD.mountPreview(cv, () => h && h.look ? { look: { ...h.look, slots: { body: { id: 'body' }, shadow: { id: 'shadow' }, ...h.look.slots } }, aura: h.aura } : lookOf(c.id, moodOfExam(e)), { h: 104 });
}
function examDetail(id) { const sh = openSheet(detailHTML(id), { refresh: sh => { sh.innerHTML = detailHTML(id); mountExPrev(sh, id); } }); mountExPrev(sh, id); }

/* ---------- Esame: modulo con scelta del compagno ---------- */
function examForm(id, preset = {}) {
  const ex = id ? exById(id) : null; const P = S.profile;
  const used = P.exams.map(e => e.color);
  const nextColor = COLOR_ORDER.find(c => !used.includes(c)) || COLOR_ORDER[P.exams.length % COLOR_ORDER.length];
  const per = periodOf(today()); const defSem = (per === 's1' || per === 'inv') ? 1 : 2;
  const F = ex ? clone(ex) : normExam({ color: nextColor, ay: P.ay, sem: defSem, ses: defSem === 1 ? 'inv' : 'est' });
  const usedSp = new Set(P.companions.map(c => c.sp));
  let pick = ex ? { kind: 'keep', comp: ex.comp } : preset.comp ? { kind: 'reuse', comp: preset.comp } : { kind: 'new', sp: (SPECIES.find(s => !usedSp.has(s.id)) || SPECIES[0]).id };
  let compTab = pick.kind === 'reuse' ? 'albo' : 'new';
  const canChange = !ex || examMin(ex.id) === 0;
  let sesTouched = !!ex; let spName = '';
  const resting = () => P.companions.filter(c => !IX.active.has(c.id) || (ex && c.id === ex.comp));
  const ays = [...Array(6)].map((_, i) => currentAY() - 3 + i);
  const html = `${sheetHead(ex ? 'Modifica esame' : 'Nuovo esame', ex ? '' : 'Scegli il compagno che crescerà con il tuo studio')}
    <form class="form" id="exF" autocomplete="off" novalidate>
      <div class="field"><label class="lbl" for="exName">Nome dell'esame</label><input type="text" id="exName" maxlength="90" placeholder="Es. Analisi Matematica I" value="${ex ? esc(F.name) : ''}" ${ex ? '' : 'data-autofocus'}></div>
      <div class="field"><span class="lbl">Compagno</span><div id="exComp"></div></div>
      <div class="field"><span class="lbl">Colore della casa e della bandiera</span><div class="swatches" id="exColors"></div></div>
      <div class="cols2"><div class="field"><span class="lbl">Semestre delle lezioni</span><div class="seg" id="exSem" role="group" aria-label="Semestre"></div></div>
        <div class="field"><label class="lbl" for="exCfu">CFU</label><input type="number" id="exCfu" min="0" max="30" inputmode="numeric" placeholder="6" value="${F.cfu || ''}"></div></div>
      <div class="field"><span class="lbl">Sessione in cui darlo</span><div class="seg" id="exSes" role="group" aria-label="Sessione"></div><p class="hint" id="exSesHint"></p></div>
      <div class="cols2"><div class="field"><label class="lbl" for="exAy">Anno accademico</label><select id="exAy">${ays.map(a => `<option value="${a}" ${a === F.ay ? 'selected' : ''}>${ayLabel(a)}</option>`).join('')}</select></div>
        <div class="field"><label class="lbl" for="exTarget">Ore di studio previste</label><input type="number" id="exTarget" min="0" max="600" inputmode="numeric" placeholder="auto: CFU × 8" value="${F.target || ''}"></div></div>
      <div class="field"><label class="lbl" for="exStatus">Stato</label><select id="exStatus">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${k === F.status ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
      <div class="cols3" id="exPassed" ${F.status === 'superato' ? '' : 'hidden'}><div class="field"><label class="lbl" for="exGrade">Voto</label><input type="number" id="exGrade" min="18" max="30" inputmode="numeric" placeholder="28" value="${F.grade ?? ''}"></div>
        <div class="field"><span class="lbl">Lode</span><label class="check" style="min-height:44px"><input type="checkbox" id="exLode" ${F.lode ? 'checked' : ''}> e lode</label></div>
        <div class="field"><label class="lbl" for="exPassedOn">Data</label><input type="date" id="exPassedOn" value="${F.passedOn}"></div></div>
      <div class="field"><div class="row" style="justify-content:space-between"><span class="lbl">Appelli</span><button type="button" class="btn small" id="exAddApp">${pix('plus')} Appello</button></div><div class="stack" id="exApps" style="gap:8px"></div></div>
      <div class="cols2"><div class="field"><label class="lbl" for="exTeacher">Docente</label><input type="text" id="exTeacher" placeholder="Es. Prof.ssa Rossi" value="${esc(F.teacher)}"></div>
        <div class="field"><label class="lbl" for="exRoom">Aula</label><input type="text" id="exRoom" placeholder="Es. Aula 4, edificio B" value="${esc(F.room)}"></div></div>
      <div class="field"><label class="lbl" for="exOffice">Ricevimento</label><input type="text" id="exOffice" placeholder="Es. martedì 14–16, studio 3B" value="${esc(F.office)}"></div>
      <div class="field"><label class="lbl" for="exNotes">Note</label><textarea id="exNotes" placeholder="Programma, libri, modalità d'esame, argomenti da ripassare…">${esc(F.notes)}</textarea></div>
      <div class="field"><label class="lbl" for="exLinks">Link utili</label><textarea id="exLinks" style="min-height:64px" placeholder="Un link per riga: pagina del corso, materiale, prenotazione appelli">${esc(F.links)}</textarea></div>
    </form>
    <div class="sheet-f">${ex ? `<button class="btn danger" id="exDel">${pix('trash')} Elimina</button><span style="flex:1"></span>` : ''}<button class="btn ghost" data-act="sheet-close">Annulla</button><button class="btn primary" id="exSave">${pix('check')} Salva</button></div>`;
  const sh = openSheet(html, { wide: true });
  const q = s => sh.querySelector(s);
  const rComp = () => {
    const el = q('#exComp');
    if (ex && !canChange) { const c = compById(ex.comp); el.innerHTML = c ? `<div class="li">${ptComp(c.id, null, 'sm')}<span class="grow"><b>${esc(c.name)}</b><small>Il compagno resta lo stesso: avete già studiato insieme.</small></span></div>` : ''; hydrate(el); return; }
    const rest = resting().filter(c => !ex || c.id !== ex.comp || true);
    const tabs = `<div class="seg" style="margin-bottom:8px"><button type="button" data-ct="new" aria-pressed="${compTab === 'new'}">Nuovo compagno</button><button type="button" data-ct="albo" aria-pressed="${compTab === 'albo'}" ${rest.length ? '' : 'disabled'}>Dall'Albo (${rest.length})</button></div>`;
    let body;
    if (compTab === 'new') {
      body = `<div class="species">${SPECIES.map(s => `<button type="button" class="sp ${usedSp.has(s.id) ? 'taken' : ''}" data-sp="${s.id}" aria-pressed="${pick.kind === 'new' && pick.sp === s.id}">${ptSp(s.id)}<span>${esc(s.name)}</span></button>`).join('')}</div>`;
      const s = SPECIES_BY[pick.sp] || SPECIES[0];
      body += `<div class="cols2" style="margin-top:8px"><div class="field"><label class="lbl" for="spName">Nome del compagno</label><input type="text" id="spName" maxlength="40" value="${esc(spName || s.name)}"></div><p class="hint" style="align-self:center">«${esc(s.motto)}»</p></div>`;
    } else {
      body = `<div class="list">${rest.map(c => { const tier = compTier(c) - (ex && c.id === ex.comp ? 0 : 0); return `<button type="button" class="li" data-reuse="${c.id}" style="${pick.comp === c.id ? 'border-image:var(--fr-li-on) 4 fill / 7px stretch' : ''}">${ptComp(c.id, null, 'sm')}<span class="grow"><b>${esc(c.name)}</b><small>${c.history.length ? `${c.history.length} ${c.history.length === 1 ? 'esame superato' : 'esami superati'} · ripartirà dal Lv 0 come ${TIER_NAMES[Math.min(4, compTier(c))]}` : 'a riposo'}</small></span>${pick.comp === c.id ? pix('check', '', 3) : ''}</button>`; }).join('')}</div><p class="hint" style="margin-top:6px">Il compagno conserva abiti e premi conquistati. Le nuove avventure richiedono più ore per livello ma sbloccano oggetti più rari.</p>`;
    }
    el.innerHTML = tabs + body; hydrate(el);
    const nm = el.querySelector('#spName'); if (nm) nm.addEventListener('input', () => { spName = nm.value; });
  };
  const rColors = () => { q('#exColors').innerHTML = COLOR_ORDER.map(c => `<button type="button" class="sw" data-c="${c}" style="--c:${COLORS[c]}" aria-pressed="${c === F.color}" aria-label="${COLOR_NAMES[c]}" title="${COLOR_NAMES[c]}"></button>`).join(''); };
  const rSem = () => { q('#exSem').innerHTML = [[1, '1°'], [2, '2°'], [0, 'Annuale']].map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${F.sem === v}">${l}</button>`).join(''); };
  const rSes = () => {
    q('#exSes').innerHTML = SES_ORDER.map(s => `<button type="button" data-v="${s}" aria-pressed="${F.ses === s}">${SESSIONI[s].short}</button>`).join('');
    const r = sessionRange(F.ses, F.ay); const n = diffDays(today(), r[0]);
    q('#exSesHint').textContent = `${SESSIONI[F.ses].label} (${SESSIONI[F.ses].realm}): ${fmtDay(r[0])} – ${fmtDay(r[1])} ${pd(r[0]).getFullYear()} · ${r[1] < today() ? 'già conclusa' : n > 0 ? 'inizia ' + inDays(n) : 'in corso'}`;
  };
  const rApps = () => {
    q('#exApps').innerHTML = F.appelli.length ? F.appelli.map((a, i) => `<div class="app-row" data-i="${i}">
      <div class="field"><label class="lbl" for="ad${i}">Data</label><input type="date" id="ad${i}" data-k="date" value="${a.date}"></div>
      <div class="field"><label class="lbl" for="at${i}">Ora</label><input type="time" id="at${i}" data-k="time" value="${a.time}"></div>
      <div class="field"><label class="lbl" for="ay${i}">Tipo</label><select id="ay${i}" data-k="type">${Object.entries(APP_TYPES).map(([k, v]) => `<option value="${k}" ${k === a.type ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
      <button type="button" class="btn icon small" data-rm="${i}" aria-label="Rimuovi appello">${pix('trash')}</button>
      <div class="row nowrap" style="grid-column:1/-1"><input type="text" data-k="place" placeholder="Aula o note" value="${esc(a.place)}" aria-label="Aula o note" style="flex:1"><label class="check" style="white-space:nowrap"><input type="checkbox" data-k="booked" ${a.booked ? 'checked' : ''}> Prenotato</label></div></div>`).join('')
      : `<p class="hint">Nessun appello per ora. Aggiungi le date quando escono: diventano boss sulla mappa e l'Oracolo le usa per i consigli.</p>`;
  };
  rComp(); rColors(); rSem(); rSes(); rApps();
  q('#exComp').addEventListener('click', e => {
    const t = e.target.closest('[data-ct]'); if (t && !t.disabled) { compTab = t.dataset.ct; if (compTab === 'new' && pick.kind !== 'new') pick = { kind: 'new', sp: (SPECIES.find(s => !usedSp.has(s.id)) || SPECIES[0]).id }; rComp(); return; }
    const s = e.target.closest('[data-sp]'); if (s) { pick = { kind: 'new', sp: s.dataset.sp }; spName = ''; rComp(); SFX.play('click'); return; }
    const r = e.target.closest('[data-reuse]'); if (r) { pick = { kind: 'reuse', comp: r.dataset.reuse }; rComp(); SFX.play('click'); }
  });
  q('#exColors').addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (!b) return; F.color = b.dataset.c; rColors(); });
  q('#exSem').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; F.sem = Number(b.dataset.v); if (!sesTouched) F.ses = F.sem === 1 ? 'inv' : 'est'; rSem(); rSes(); });
  q('#exSes').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; F.ses = b.dataset.v; sesTouched = true; rSes(); });
  q('#exAy').addEventListener('change', e => { F.ay = Number(e.target.value); rSes(); });
  q('#exStatus').addEventListener('change', e => { F.status = e.target.value; q('#exPassed').hidden = F.status !== 'superato'; if (F.status === 'superato' && !q('#exPassedOn').value) q('#exPassedOn').value = today(); });
  const appSync = e => { const row = e.target.closest('.app-row'); const k = e.target.dataset.k; if (!row || !k) return; const a = F.appelli[Number(row.dataset.i)]; a[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; };
  q('#exApps').addEventListener('input', appSync); q('#exApps').addEventListener('change', appSync);
  q('#exApps').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (!b) return; F.appelli.splice(Number(b.dataset.rm), 1); rApps(); });
  q('#exAddApp').addEventListener('click', () => { const r = sessionRange(F.ses, F.ay); F.appelli.push({ id: uid(), date: r && r[1] >= today() ? '' : '', time: '', type: 'scritto', place: '', booked: false, note: '' }); rApps(); const ins = sh.querySelectorAll('#exApps input[type=date]'); ins[ins.length - 1]?.focus(); });
  q('#exF').addEventListener('submit', e => e.preventDefault());
  q('#exSave').addEventListener('click', () => {
    const name = q('#exName').value.trim(); if (!name) { toast('Scrivi il nome dell\'esame.', 'bad'); q('#exName').focus(); return; }
    const grade = q('#exGrade').value ? Number(q('#exGrade').value) : null;
    if (F.status === 'superato' && grade != null && (grade < 18 || grade > 30)) { toast('Il voto deve essere tra 18 e 30.', 'bad'); return; }
    if (pick.kind === 'reuse' && !compById(pick.comp)) { toast('Scegli un compagno.', 'bad'); return; }
    const wasPassed = ex && ex.status === 'superato';
    Object.assign(F, { name, cfu: Number(q('#exCfu').value) || 0, target: Number(q('#exTarget').value) || 0, teacher: q('#exTeacher').value.trim(), room: q('#exRoom').value.trim(), office: q('#exOffice').value.trim(), notes: q('#exNotes').value, links: q('#exLinks').value, grade: F.status === 'superato' ? grade : null, lode: F.status === 'superato' && grade === 30 && q('#exLode').checked, passedOn: F.status === 'superato' ? (q('#exPassedOn').value || today()) : '' });
    F.appelli = F.appelli.filter(a => a.date).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    // compagno
    let newComp = null; const oldComp = ex ? ex.comp : null;
    if (canChange) {
      if (pick.kind === 'new' && !(ex && compById(ex.comp) && compById(ex.comp).sp === pick.sp && !compById(ex.comp).history.length)) { newComp = newCompanion(pick.sp, (spName || SPECIES_BY[pick.sp].name).trim().slice(0, 40)); P.companions.push(newComp); F.comp = newComp.id; }
      else if (pick.kind === 'reuse') F.comp = pick.comp;
      else if (pick.kind === 'new' && ex) { const c = compById(ex.comp); if (c && spName) c.name = spName.trim().slice(0, 40); }
    }
    if (F.comp && IX.active.has(F.comp) && IX.active.get(F.comp).id !== (ex && ex.id) && F.status !== 'superato') { toast('Questo compagno è già impegnato con un altro esame.', 'bad'); if (newComp) P.companions = P.companions.filter(c => c !== newComp); return; }
    const n = normExam(F); n.demo = ex ? ex.demo : false;
    if (ex) { const i = P.exams.findIndex(x => x.id === ex.id); P.exams[i] = n; } else P.exams.push(n);
    // il vecchio compagno senza storia e non più usato se ne va
    if (oldComp && oldComp !== n.comp) { const oc = compById(oldComp); if (oc && !oc.history.length && !P.exams.some(e => e.comp === oldComp)) P.companions = P.companions.filter(c => c.id !== oldComp); }
    if (wasPassed && n.status !== 'superato') unpassFix(n);
    rebuild();
    if (n.status === 'superato' && !wasPassed) { snapshotBond(n); }
    closeSheet(); commitProfile(); checkAchievements();
    const c = compById(n.comp);
    if (n.status === 'superato' && !wasPassed) celebrateWin(n);
    else toast(ex ? 'Esame aggiornato.' : `${c ? c.name : 'Il compagno'} è arrivato nella radura!`, 'good');
    if (!ex) SFX.play('unlock');
  });
  if (ex) q('#exDel').addEventListener('click', () => confirmSheet({
    title: 'Eliminare l\'esame?', text: `Elimino <b>${esc(ex.name)}</b>, ${fmtMin(examMin(ex.id))} di studio registrato e i suoi blocchi nell'orario. ${compById(ex.comp) && compById(ex.comp).history.length ? 'Il compagno resta nell\'Albo.' : 'Anche il compagno se ne andrà.'} Non si può annullare.`, ok: 'Elimina esame',
    onOk: () => { closeAllSheets(); deleteExam(ex.id); toast('Esame eliminato.'); }
  }));
}
function deleteExam(id) {
  const P = S.profile; const e = exById(id);
  P.exams = P.exams.filter(x => x.id !== id);
  if (e && e.comp) { const c = compById(e.comp); if (c) { c.history = c.history.filter(h => h.ex !== id); if (!c.history.length && !P.exams.some(x => x.comp === c.id)) P.companions = P.companions.filter(x => x.id !== c.id); } }
  for (const k in P.schedule) P.schedule[k] = P.schedule[k].filter(b => b.ex !== id);
  const touched = [];
  for (const k in S.months) { const n = S.months[k].length; S.months[k] = S.months[k].filter(x => x.ex !== id); if (S.months[k].length !== n) touched.push(k); if (!S.months[k].length) delete S.months[k]; }
  if (T.ex === id && T.phase === 'idle') { T.ex = null; tSave(); }
  rebuild(); render(); Sync.mark('profile'); touched.forEach(k => Sync.mark('log-' + k));
}
function passForm(id) {
  const e = exById(id); if (!e) return;
  const sh = openSheet(`${sheetHead('Esame superato!', esc(e.name))}<div class="form"><div class="cols3"><div class="field"><label class="lbl" for="psG">Voto</label><input type="number" id="psG" min="18" max="30" inputmode="numeric" placeholder="28" data-autofocus></div><div class="field"><span class="lbl">Lode</span><label class="check" style="min-height:44px"><input type="checkbox" id="psL"> e lode</label></div><div class="field"><label class="lbl" for="psD">Data</label><input type="date" id="psD" value="${today()}" max="${today()}"></div></div><p class="hint">Il voto serve per la media ponderata e per le monete del premio (più alto il voto, più monete). Puoi lasciarlo vuoto.</p></div>
    <div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Annulla</button><button class="btn gold" id="psOk">${pix('trophy')} Conferma</button></div>`);
  sh.querySelector('#psOk').onclick = () => {
    const g = sh.querySelector('#psG').value ? Number(sh.querySelector('#psG').value) : null;
    if (g != null && (g < 18 || g > 30)) { toast('Il voto deve essere tra 18 e 30.', 'bad'); return; }
    closeAllSheets(); passExam(e, g, sh.querySelector('#psL').checked, sh.querySelector('#psD').value || today()); celebrateWin(e);
  };
}

/* ---------- Registrazione manuale ---------- */
function logForm({ ex, d } = {}) {
  const all = [...activeExams(), ...S.profile.exams.filter(e => e.status === 'superato')];
  if (!all.length) { toast('Aggiungi prima un esame.'); return; }
  const F = { ex: ex || (T.ex && exById(T.ex) && exById(T.ex).status !== 'superato' ? T.ex : all[0].id), d: d || today(), m: 60 };
  const presets = [15, 30, 45, 60, 90, 120, 180, 240];
  const sh = openSheet(`${sheetHead('Segna studio', 'Aggiungi il tempo passato su un esame')}
    <div class="form">
      <div class="field"><span class="lbl">Esame</span><div class="chips scroll" id="lgEx">${all.map(e => `<button type="button" class="chip" data-id="${e.id}" aria-pressed="${e.id === F.ex}">${ptExam(e)}${esc(e.name)}</button>`).join('')}</div></div>
      <div class="field"><label class="lbl" for="lgD">Giorno</label><input type="date" id="lgD" value="${F.d}" max="${today()}"></div>
      <div class="field"><span class="lbl">Durata</span><div class="chips" id="lgP">${presets.map(p => `<button type="button" class="chip" data-m="${p}" aria-pressed="${p === F.m}">${fmtMin(p)}</button>`).join('')}</div>
        <div class="cols2" style="margin-top:6px"><div class="field"><label class="lbl" for="lgH">Ore</label><input type="number" id="lgH" min="0" max="16" inputmode="numeric" value="1"></div><div class="field"><label class="lbl" for="lgM">Minuti</label><input type="number" id="lgM" min="0" max="59" step="5" inputmode="numeric" value="0"></div></div></div>
      <div class="field"><label class="lbl" for="lgN">Argomento (facoltativo)</label><input type="text" id="lgN" maxlength="120" placeholder="Es. integrali per parti, capitolo 4"></div>
    </div>
    <div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Annulla</button><button class="btn primary" id="lgOk">${pix('check')} Salva</button></div>`);
  const q = s => sh.querySelector(s);
  const sync = () => { q('#lgH').value = Math.floor(F.m / 60); q('#lgM').value = F.m % 60; sh.querySelectorAll('#lgP .chip').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.m) === F.m))); };
  q('#lgEx').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (!b) return; F.ex = b.dataset.id; sh.querySelectorAll('#lgEx .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.id === F.ex))); });
  q('#lgP').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; F.m = Number(b.dataset.m); sync(); });
  const fromInputs = () => { F.m = clamp((Number(q('#lgH').value) || 0) * 60 + (Number(q('#lgM').value) || 0), 0, 16 * 60); sh.querySelectorAll('#lgP .chip').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.m) === F.m))); };
  q('#lgH').addEventListener('input', fromInputs); q('#lgM').addEventListener('input', fromInputs);
  q('#lgOk').onclick = () => {
    const d = q('#lgD').value || today(); if (d > today()) { toast('Non puoi segnare studio nel futuro.', 'bad'); return; }
    if (!(F.m > 0)) { toast('Indica quanto hai studiato.', 'bad'); return; }
    const e = exById(F.ex); closeSheet(); addEntry({ d, ex: F.ex, m: F.m, src: 'manuale', note: q('#lgN').value.trim() });
    toast(`+${fmtMin(F.m)} con ${compName(e)}${d !== today() ? ' (' + fmtDay(d) + ')' : ''}`, 'good');
  };
}
function dayHTML(d) {
  const list = (IX.byDay.get(d) || []).slice().sort((a, b) => (a.t || 0) - (b.t || 0));
  return `${sheetHead(fmtDayLong(d) + ' ' + pd(d).getFullYear(), `${fmtMin(dayMin(d))} di studio${S.profile.shields.includes(d) ? ' · serie protetta dallo scudo' : ''}`)}
    ${list.length ? `<div class="list">${list.map(en => { const e = exById(en.ex); return `<div class="li">${e ? ptExam(e, 'sm') : ''}<span class="grow"><b>${esc(e ? e.name : 'Esame eliminato')}</b><small>${SRC_LABEL[en.src] || en.src}${en.note ? ' · ' + esc(en.note) : ''}</small></span>
      <span class="row nowrap" style="gap:4px"><button class="btn icon small" data-act="en-adj" data-id="${en.id}" data-v="-15" aria-label="Togli 15 minuti">−</button><span class="val" style="min-width:58px;text-align:center">${fmtMin(en.m)}</span><button class="btn icon small" data-act="en-adj" data-id="${en.id}" data-v="15" aria-label="Aggiungi 15 minuti">+</button></span>
      <button class="x" data-act="entry-del" data-id="${en.id}" aria-label="Elimina">${pix('trash')}</button></div>`; }).join('')}</div>` : `<p class="muted">Nessuna sessione in questo giorno.</p>`}
    <div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Chiudi</button><button class="btn primary" data-act="log-day" data-d="${d}">${pix('plus')} Aggiungi studio</button></div>`;
}
function dayForm(d) { openSheet(dayHTML(d), { refresh: sh => { sh.innerHTML = dayHTML(d); } }); }

/* ---------- Orario: blocchi ---------- */
function blockForm({ id, day, start, end, type, ex, per } = {}) {
  const p = S.profile; per = per || curPer(); const key = `${p.ay}-${per}`;
  const b = id ? (p.schedule[key] || []).find(x => x.id === id) : null;
  if (id && !b) return;
  const maxDay = p.hours.sunday ? 6 : 5; const s0 = start ?? 600;
  const F = b ? clone(b) : normBlock({ day: day ?? Math.min(S.ui.oDay ?? dow(today()), maxDay), start: s0, end: end ?? Math.min(s0 + 90, 23 * 60 + 45), type: type || 'lezione', ex: ex || '' });
  const days = new Set([F.day]);
  const pex = p.exams.filter(e => examInPeriod(e, per) && e.ay === p.ay), others = p.exams.filter(e => !pex.includes(e));
  const opt = e => `<option value="${e.id}" ${e.id === F.ex ? 'selected' : ''}>${esc(e.name)}</option>`;
  const sh = openSheet(`${sheetHead(b ? 'Modifica blocco' : 'Nuovo blocco', `${PERIODS.find(x => x.id === per).label} · a.a. ${ayLabel(p.ay)}`)}
    <div class="form">
      <div class="field"><span class="lbl">Tipo</span><div class="chips" id="bkT">${Object.entries(BLOCK_TYPES).map(([k, v]) => `<button type="button" class="chip" data-v="${k}" aria-pressed="${k === F.type}">${v.label}</button>`).join('')}</div></div>
      <div class="field"><label class="lbl" for="bkE">Esame</label><select id="bkE"><option value="">Nessun esame (attività libera)</option>${pex.length ? `<optgroup label="In questo periodo">${pex.map(opt).join('')}</optgroup>` : ''}${others.length ? `<optgroup label="Altri esami">${others.map(opt).join('')}</optgroup>` : ''}</select></div>
      <div class="field"><label class="lbl" for="bkL">Titolo (facoltativo)</label><input type="text" id="bkL" maxlength="60" placeholder="Es. laboratorio, ripasso generale, palestra" value="${esc(F.label)}"></div>
      <div class="field"><span class="lbl">${b ? 'Giorno' : 'Giorni (anche più di uno)'}</span><div class="chips" id="bkD">${[...Array(maxDay + 1)].map((_, i) => `<button type="button" class="chip" data-v="${i}" aria-pressed="${days.has(i)}">${GIORNI_S[i]}</button>`).join('')}</div></div>
      <div class="cols2"><div class="field"><label class="lbl" for="bkS">Inizio</label><input type="time" id="bkS" step="900" value="${hm(F.start)}"></div><div class="field"><label class="lbl" for="bkF">Fine</label><input type="time" id="bkF" step="900" value="${hm(F.end)}"></div></div>
      <div class="field"><label class="lbl" for="bkP">Luogo</label><input type="text" id="bkP" maxlength="60" placeholder="Es. Aula 4, biblioteca, casa" value="${esc(F.place)}"></div>
      <div class="field"><label class="lbl" for="bkN">Note</label><input type="text" id="bkN" maxlength="120" value="${esc(F.note)}"></div>
    </div>
    <div class="sheet-f">${b ? `<button class="btn danger" id="bkDel">${pix('trash')} Elimina</button><span style="flex:1"></span>` : ''}<button class="btn ghost" data-act="sheet-close">Annulla</button><button class="btn primary" id="bkOk">${pix('check')} Salva</button></div>`);
  const q = s => sh.querySelector(s);
  q('#bkT').addEventListener('click', e => { const t = e.target.closest('[data-v]'); if (!t) return; F.type = t.dataset.v; sh.querySelectorAll('#bkT .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.v === F.type))); });
  q('#bkD').addEventListener('click', e => {
    const t = e.target.closest('[data-v]'); if (!t) return; const v = Number(t.dataset.v);
    if (b) { days.clear(); days.add(v); } else if (days.has(v) && days.size > 1) days.delete(v); else days.add(v);
    sh.querySelectorAll('#bkD .chip').forEach(c => c.setAttribute('aria-pressed', String(days.has(Number(c.dataset.v)))));
  });
  q('#bkOk').onclick = () => {
    const s = toMin(q('#bkS').value), f = toMin(q('#bkF').value);
    if (s == null || f == null || f <= s) { toast('L\'orario di fine deve venire dopo l\'inizio.', 'bad'); return; }
    const base = { type: F.type, ex: q('#bkE').value, label: q('#bkL').value.trim(), start: s, end: f, place: q('#bkP').value.trim(), note: q('#bkN').value.trim() };
    const list = (p.schedule[key] ||= []);
    if (b) Object.assign(b, base, { day: [...days][0] });
    else [...days].sort().forEach(dd => list.push(normBlock({ ...base, day: dd })));
    if (s < p.hours.start * 60 || f > p.hours.end * 60) toast(`Il blocco esce dalla griglia (${p.hours.start}–${p.hours.end}): puoi allargarla nelle impostazioni.`);
    closeSheet(); commitProfile();
  };
  if (b) q('#bkDel').onclick = () => { p.schedule[key] = p.schedule[key].filter(x => x.id !== b.id); closeSheet(); commitProfile(); toast('Blocco eliminato.'); };
}
function copyForm() {
  const p = S.profile, per = curPer(), key = `${p.ay}-${per}`, cur = (p.schedule[key] || []).length;
  const srcs = [];
  PERIODS.forEach(pp => { const k = `${p.ay}-${pp.id}`; if (pp.id !== per && (p.schedule[k] || []).length) srcs.push({ k, label: pp.label + ' ' + ayLabel(p.ay), n: p.schedule[k].length }); });
  const pk = `${p.ay - 1}-${per}`; if ((p.schedule[pk] || []).length) srcs.push({ k: pk, label: PERIODS.find(x => x.id === per).label + ' ' + ayLabel(p.ay - 1), n: p.schedule[pk].length });
  const sh = openSheet(`${sheetHead('Copia l\'orario', `In: ${PERIODS.find(x => x.id === per).label} · ${cur} blocchi ora`)}
    ${srcs.length ? `<div class="list">${srcs.map(s => `<div class="li"><span class="grow"><b>${s.label}</b><small>${s.n} blocchi</small></span><span class="row" style="gap:6px"><button class="btn small" data-src="${s.k}" data-m="add">Aggiungi</button>${cur ? `<button class="btn small danger" data-src="${s.k}" data-m="rep">Sostituisci</button>` : ''}</span></div>`).join('')}</div>` : `<p class="muted">Non ci sono altri orari da copiare. Crea prima i blocchi in un altro periodo.</p>`}
    <div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Chiudi</button></div>`);
  sh.addEventListener('click', e => {
    const b = e.target.closest('[data-src]'); if (!b) return;
    const copy = (p.schedule[b.dataset.src] || []).map(x => normBlock({ ...x, id: uid(), demo: x.demo }));
    p.schedule[key] = b.dataset.m === 'rep' ? copy : [...(p.schedule[key] || []), ...copy];
    closeSheet(); commitProfile(); toast(`Copiati ${copy.length} blocchi.`, 'good');
  });
}

/* ---------- Zaino (menu) ---------- */
function menuSheet() {
  openSheet(`${sheetHead('Zaino', 'Tutte le sezioni della radura')}
    <div class="menu-grid">${[...MORE, ['oracolo', 'Oracolo', 'Statistiche e consigli'], ['orario', 'Orario', 'Lezioni e studio']].map(([v, l, d]) => `<button class="menu-b" data-act="nav" data-v="${v}">${pix(VIEW_ICON[v], '', 3)}<b>${l}</b><small>${d}</small></button>`).join('')}
    <button class="menu-b" data-act="settings">${pix('gear', '', 3)}<b>Impostazioni</b><small>Obiettivi, suoni, orari</small></button>
    <button class="menu-b" data-act="sync">${pix('sync', '', 3)}<b>Dispositivi</b><small>Sincronizza iPhone, iPad, Mac</small></button>
    <button class="menu-b" data-act="avatar-wizard">${pix('user', '', 3)}<b>Il tuo avatar</b><small>Crea o ricrea il tuo eroe</small></button>
    <button class="menu-b" data-act="credits">${pix('star', '', 3)}<b>Crediti</b><small>Artisti della grafica</small></button></div>`);
}

/* ---------- Impostazioni ---------- */
function settingsForm() {
  const p = S.profile; const ays = [...Array(6)].map((_, i) => currentAY() - 3 + i); const hrs = [...Array(24).keys()];
  const hasDemo = p.exams.some(e => e.demo) || Object.values(S.months).some(a => a.some(e => e.demo));
  const sh = openSheet(`${sheetHead('Impostazioni')}
    <div class="form">
      <div class="field"><label class="lbl" for="stN">Come ti chiami?</label><input type="text" id="stN" maxlength="30" placeholder="Per il saluto nella radura" value="${esc(p.name)}"></div>
      <div class="field"><label class="lbl" for="stAy">Anno accademico attivo</label><select id="stAy">${ays.map(a => `<option value="${a}" ${a === p.ay ? 'selected' : ''}>${ayLabel(a)}${a === currentAY() ? ' (in corso)' : ''}</option>`).join('')}</select><p class="hint">Decide l'orario mostrato, la mappa e l'anno dei nuovi esami.</p></div>
      <div class="cols2"><div class="field"><label class="lbl" for="stGd">Obiettivo al giorno (min)</label><input type="number" id="stGd" min="30" max="900" step="30" inputmode="numeric" value="${p.goals.day}"><p class="hint">Un cuore ogni 30 minuti</p></div>
        <div class="field"><label class="lbl" for="stGw">Obiettivo a settimana (ore)</label><input type="number" id="stGw" min="1" max="100" step="1" inputmode="numeric" value="${Math.round(p.goals.week / 60)}"></div></div>
      <div class="cols2"><div class="field"><label class="lbl" for="stHs">Orario: dalle</label><select id="stHs">${hrs.slice(5, 14).map(h => `<option value="${h}" ${h === p.hours.start ? 'selected' : ''}>${pad(h)}:00</option>`).join('')}</select></div>
        <div class="field"><label class="lbl" for="stHe">alle</label><select id="stHe">${hrs.slice(14).concat([24]).map(h => `<option value="${h}" ${h === p.hours.end ? 'selected' : ''}>${pad(h)}:00</option>`).join('')}</select></div></div>
      <label class="check"><input type="checkbox" id="stSun" ${p.hours.sunday ? 'checked' : ''}> Mostra la domenica nell'orario</label>
      <div class="sec-t"><span class="rib lav">${pix('music')} Suoni e musica</span></div>
      <label class="check"><input type="checkbox" id="stSfx" ${p.sound.sfx ? 'checked' : ''}> Effetti 8-bit (passi, monete, campanella del pomodoro)</label>
      <label class="check"><input type="checkbox" id="stMus" ${p.sound.music ? 'checked' : ''}> Musica chiptune di sottofondo</label>
      <div class="cols2"><div class="field"><label class="lbl" for="stVol">Volume</label><input type="range" id="stVol" min="0" max="1" step=".05" value="${p.sound.vol}"></div>
        <div class="field"><label class="lbl" for="stTr">Brano</label><select id="stTr">${TRACKS.filter(t => owns('track', t.id)).map(t => `<option value="${t.id}" ${t.id === p.sound.track ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div></div>
      <div class="field"><label class="lbl" for="stTh">Tema del mondo</label><select id="stTh">${THEMES.filter(t => owns('theme', t.id)).map(t => `<option value="${t.id}" ${t.id === p.theme.world ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select><p class="hint">Chiaro e scuro seguono il tuo dispositivo; di sera il villaggio si accende di lanterne.</p></div>
      ${'Notification' in window ? `<button type="button" class="btn small" id="stNot">${pix('bell')} ${Notification.permission === 'granted' ? 'Notifiche attive' : 'Avvisami a fine pomodoro'}</button>` : ''}
    </div>
    <div class="sec-t"><span class="rib gold">${pix('chest')} I tuoi dati</span></div>
    <p class="hint">${S.backend === 'claude' ? 'Salvati nel tuo account Claude.' : S.backend === 'supa' ? 'Sincronizzati tra i tuoi dispositivi con il codice segreto.' : 'Salvati solo su questo dispositivo.'} Esporta un backup ogni tanto.</p>
    <div class="row" style="margin-top:10px"><button class="btn small" id="stExp">${pix('down')} Esporta backup</button><button class="btn small" id="stImp">${pix('up')} Importa</button><button class="btn small" data-act="sync">${pix('sync')} Dispositivi</button>${hasDemo ? `<button class="btn small" data-act="demo-clear">${pix('trash')} Cancella esempi</button>` : `<button class="btn small" data-act="demo-load">Carica esempi</button>`}<button class="btn small danger" id="stWipe">Cancella tutto</button></div>
    <div class="sheet-f"><button class="btn ghost" data-act="credits">Crediti</button><span style="flex:1"></span><button class="btn ghost" data-act="sheet-close">Annulla</button><button class="btn primary" id="stOk">${pix('check')} Salva</button></div>`);
  const q = s => sh.querySelector(s);
  q('#stVol').addEventListener('input', e => { p.sound.vol = Number(e.target.value); AUDIO.applyVol(); });
  const nb = q('#stNot'); if (nb) nb.onclick = async () => { try { const r = await Notification.requestPermission(); toast(r === 'granted' ? 'Ti avviserò a fine pomodoro.' : 'Notifiche non attive.'); } catch { } };
  q('#stOk').onclick = () => {
    const hs = Number(q('#stHs').value), he = Number(q('#stHe').value);
    Object.assign(p, { name: q('#stN').value.trim(), ay: Number(q('#stAy').value) });
    p.goals = { day: clamp(Number(q('#stGd').value) || 120, 30, 900), week: clamp(Math.round(Number(q('#stGw').value) || 15), 1, 100) * 60 };
    p.hours = { start: hs, end: he > hs ? he : hs + 8, sunday: q('#stSun').checked };
    p.sound = { sfx: q('#stSfx').checked, music: q('#stMus').checked, vol: Number(q('#stVol').value), track: q('#stTr').value || 'radura' };
    p.theme = { world: q('#stTh').value || 'auto' };
    AUDIO.unlock(); AUDIO.applyVol(); AUDIO.syncMusic(S.ui.view === 'studio' ? 'focus' : 'world');
    closeSheet(); commitProfile(); toast('Impostazioni salvate.', 'good');
  };
  q('#stExp').onclick = exportBackup;
  q('#stImp').onclick = importForm;
  q('#stWipe').onclick = () => confirmSheet({
    title: 'Cancellare tutto?', text: 'Elimino esami, compagni, studio, orari, acquisti e impostazioni. Prima, se vuoi, esporta un backup.', ok: 'Cancella tutto',
    onOk: () => { const old = Object.keys(S.months); S.profile = defaultProfile(); S.months = {}; closeAllSheets(); markAll(old); afterData(); toast('Radura svuotata. Si ricomincia!'); }
  });
}
async function exportBackup() {
  const data = JSON.stringify({ app: 'radura-degli-esami', v: 2, exportedAt: new Date().toISOString(), profile: S.profile, months: S.months }, null, 1);
  if (S.downloads) {
    try { const r = await S.downloads.save({ filename: `radura-backup-${today()}.json`, data }); if (r && r.status === 'saved') toast('Backup salvato.', 'good'); return; }
    catch (e) { if (e && e.code === 'declined') return; if (e && e.code === 'rate_limited') { toast('C\'è già una richiesta aperta: riprova tra poco.'); return; } }
  }
  try {
    const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `radura-backup-${today()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    if (!/iP(hone|ad)/.test(navigator.userAgent)) { toast('Backup scaricato.', 'good'); return; }
  } catch { }
  const sh = openSheet(`${sheetHead('Copia il backup', 'Incollalo in una nota o in un file .json per conservarlo')}<textarea id="bkTxt" readonly style="min-height:220px;font:500 12px ui-monospace,Menlo,monospace">${esc(data)}</textarea><div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Chiudi</button><button class="btn primary" id="bkCopy">${pix('copy')} Copia</button></div>`);
  sh.querySelector('#bkCopy').onclick = () => { const ta = sh.querySelector('#bkTxt'); const p = navigator.clipboard && navigator.clipboard.writeText(data); if (p) p.then(() => toast('Backup copiato.', 'good'), () => { ta.focus(); ta.select(); toast('Seleziona e copia il testo.'); }); else { ta.focus(); ta.select(); } };
}
function importForm() {
  const sh = openSheet(`${sheetHead('Importa un backup', 'Scegli il file .json esportato o incolla il suo testo')}
    <div class="form"><div class="field"><label class="lbl" for="imF">File di backup</label><input type="file" id="imF" accept=".json,application/json"></div>
    <div class="field"><label class="lbl" for="imT">Oppure incolla il testo</label><textarea id="imT" style="min-height:120px;font:500 12px ui-monospace,Menlo,monospace" placeholder='{"app":"radura-degli-esami", …}'></textarea></div></div>
    <div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Annulla</button><button class="btn primary" id="imOk">${pix('up')} Importa</button></div>`);
  const q = s => sh.querySelector(s);
  q('#imF').addEventListener('change', () => { const f = q('#imF').files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { q('#imT').value = String(r.result || ''); }; r.readAsText(f); });
  q('#imOk').onclick = () => {
    let d; try { d = JSON.parse(q('#imT').value); } catch { toast('Il testo non è un backup valido.', 'bad'); return; }
    if (!d || d.app !== 'radura-degli-esami' || !d.profile) { toast('Questo file non è un backup della Radura.', 'bad'); return; }
    const nEx = (d.profile.exams || []).length, nEn = Object.values(d.months || {}).reduce((s, a) => s + (Array.isArray(a) ? a.length : 0), 0);
    confirmSheet({
      title: 'Sostituire i dati attuali?', text: `Il backup contiene ${nEx} esami e ${nEn} sessioni di studio. I dati attuali verranno sostituiti.`, ok: 'Importa', danger: false,
      onOk: () => { const old = Object.keys(S.months); S.profile = normalizeProfile(d.profile); S.months = {}; for (const k in d.months || {}) { const a = normEntries(d.months[k]); if (a.length) S.months[k] = a; } closeAllSheets(); markAll(old); afterData(); toast('Backup importato.', 'good'); }
    });
  };
}
async function creditsSheet() {
  const sh = openSheet(`${sheetHead('Crediti', 'Personaggi e oggetti in pixel art')}<p>I personaggi sono composti dal <b>Liberated Pixel Cup (LPC)</b> e dall'<b>Universal LPC Spritesheet Character Generator</b>, opere di molti artisti con licenze CC-BY-SA 3.0, GPL 3.0 e OGA-BY 3.0. Edifici, paesaggi, icone, musica ed effetti sono creati apposta per la Radura.</p><div class="credits" id="crList" style="margin-top:10px">Carico l'elenco degli artisti…</div><div class="sheet-f"><a class="btn small" href="https://github.com/LiberatedPixelCup/Universal-LPC-Spritesheet-Character-Generator" target="_blank" rel="noopener noreferrer">${pix('link')} Progetto LPC</a><button class="btn primary" data-act="sheet-close">Chiudi</button></div>`);
  try {
    const r = await fetch((window.RADURA_BASE || '') + 'assets/credits.json'); const j = await r.json();
    const authors = new Map(); (Array.isArray(j) ? j : j.credits || []).forEach(c => (c.authors || []).forEach(a => authors.set(a, (authors.get(a) || 0) + 1)));
    const lic = new Set(); (Array.isArray(j) ? j : j.credits || []).forEach(c => (c.licenses || []).forEach(l => lic.add(l)));
    sh.querySelector('#crList').textContent = `Artisti (${authors.size}): ${[...authors.keys()].sort((a, b) => a.localeCompare(b)).join(', ')}\n\nLicenze: ${[...lic].join(', ')}\n\nL'elenco completo file per file è in assets/credits.json.`;
  } catch { sh.querySelector('#crList').textContent = 'L\'elenco completo degli autori si trova nel file assets/credits.json dell\'app.'; }
}

/* ---------- Dispositivi e sincronizzazione ---------- */
function syncSheet() {
  if (S.backend === 'claude') { openSheet(`${sheetHead('Dispositivi', 'Dove sono salvati i tuoi dati')}<p>In questa pagina di Claude i dati sono salvati nel tuo account: li ritrovi uguali aprendo la pagina da telefono, tablet o computer.</p><p class="hint" style="margin-top:8px">Per l'app installabile su iPhone, iPad e Mac puoi esportare un backup e importarlo lì.</p><div class="sheet-f"><button class="btn" id="syExp">${pix('down')} Esporta backup</button><button class="btn primary" data-act="sheet-close">Ok</button></div>`).querySelector('#syExp').onclick = exportBackup; return; }
  const key = S.syncKey;
  const html = key ? `${sheetHead('Dispositivi sincronizzati', 'Un codice segreto collega iPhone, iPad e Mac')}
      <p>Questo è il tuo <b>codice della radura</b>. Inseriscilo nell'app sugli altri dispositivi per ritrovare tutto: esami, compagni, studio, orari e acquisti.</p>
      <div class="code" style="margin-top:10px">${esc(key)}</div>
      <p class="hint" style="margin-top:8px">Tienilo segreto come una password: chi lo conosce vede i tuoi dati. Salvalo in un posto sicuro (es. le password del telefono).</p>
      <div class="row" style="margin-top:10px"><button class="btn primary small" id="syCopy">${pix('copy')} Copia codice</button>${navigator.share ? `<button class="btn small" id="syShare">${pix('link')} Condividi</button>` : ''}<button class="btn small" id="syOther">${pix('sync')} Usa un altro codice</button><button class="btn small danger" id="syOff">Scollega</button></div>
      <div class="sec-t"><span class="rib sky">${pix('studio')} Installa l'app</span></div><ol class="steps"><li><span><b>iPhone e iPad</b>: apri il sito in Safari, tocca Condividi e poi «Aggiungi alla schermata Home».</span></li><li><span><b>Mac</b>: in Safari scegli File → «Aggiungi al Dock» (in Chrome: icona di installazione nella barra degli indirizzi).</span></li><li><span>Apri l'app installata, scegli «Ho già un codice» e incolla il codice.</span></li></ol>
      <div class="sheet-f"><button class="btn primary" data-act="sheet-close">Fatto</button></div>`
    : `${sheetHead('Sincronizza i dispositivi', 'Ora i dati sono salvati solo qui')}<p>Attiva la sincronizzazione per usare la radura su iPhone, iPad e Mac con gli stessi dati. Ti darò un codice segreto da inserire sugli altri dispositivi.</p>
      <div class="row" style="margin-top:12px"><button class="btn primary" id="syNew">${pix('sync')} Attiva con un nuovo codice</button><button class="btn" id="syOther">Ho già un codice</button></div><div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Chiudi</button></div>`;
  const sh = openSheet(html);
  const q = s => sh.querySelector(s);
  q('#syCopy') && (q('#syCopy').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(key).then(() => toast('Codice copiato.', 'good'), () => toast('Seleziona e copia il codice.')); });
  q('#syShare') && (q('#syShare').onclick = () => { navigator.share({ title: 'Radura degli Esami', text: `Il mio codice della radura: ${key}` }).catch(() => { }); });
  q('#syNew') && (q('#syNew').onclick = async () => { closeSheet(); const k = makeSyncKey(); lsSet(LS_SYNC, { key: k, lastPull: null }); await connectSupa(k); toast('Sincronizzazione attiva!', 'good'); syncSheet(); });
  q('#syOff') && (q('#syOff').onclick = () => confirmSheet({ title: 'Scollegare questo dispositivo?', text: 'I dati restano qui e online, ma questo dispositivo smette di sincronizzarsi. Potrai ricollegarlo con il codice.', ok: 'Scollega', onOk: () => { try { localStorage.removeItem(LS_SYNC); } catch { } S.syncKey = null; clearInterval(Sync.pollT); goLocal(); closeAllSheets(); render(); } }));
  q('#syOther') && (q('#syOther').onclick = () => codeForm());
}
function codeForm(fromOnboarding = false) {
  const sh = openSheet(`${sheetHead('Inserisci il codice', 'Lo trovi nelle impostazioni dell\'app sull\'altro dispositivo')}<div class="form"><div class="field"><label class="lbl" for="cdIn">Codice della radura</label><input type="text" id="cdIn" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" data-autofocus style="font-family:var(--f-pix);font-size:22px;letter-spacing:.08em"></div><p class="hint">I dati di questo dispositivo verranno uniti a quelli collegati al codice (il profilo online ha la precedenza).</p></div><div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Annulla</button><button class="btn primary" id="cdOk">${pix('sync')} Collega</button></div>`);
  sh.querySelector('#cdOk').onclick = async () => {
    const raw = sh.querySelector('#cdIn').value.toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (raw.length !== 24) { toast('Il codice ha 24 caratteri (6 gruppi da 4).', 'bad'); return; }
    const k = raw.match(/.{4}/g).join('-');
    closeAllSheets(); lsSet(LS_SYNC, { key: k, lastPull: null }); Sync.lastPull = null;
    if (fromOnboarding) { S.mode = 'loading'; mountApp(); }
    await connectSupa(k); afterData(); toast('Dispositivo collegato!', 'good');
  };
}

/* ---------- Avatar: creazione ---------- */
const OUTFITS = [
  { id: 'avv', name: 'Avventuriera', slots: { torso: { id: 'tunic', c: { cloth: 'teal' } }, legs: { id: 'pants', c: { cloth: 'brown' } }, feet: { id: 'boots', c: { cloth: 'brown' } }, back: { id: 'backpack', v: 'leather' }, belt: { id: 'belt_leather' } } },
  { id: 'stud', name: 'Studentessa', slots: { torso: { id: 'cardigan', c: { cloth: 'rose' } }, legs: { id: 'skirt', c: { cloth: 'navy' } }, feet: { id: 'shoes', c: { cloth: 'black' } }, face_acc: { id: 'glasses_round' }, neck: { id: 'scarf', c: { cloth: 'red' } } } },
  { id: 'ranger', name: 'Ranger', slots: { torso: { id: 'longsleeve', c: { cloth: 'forest' } }, legs: { id: 'pants', c: { cloth: 'leather' } }, feet: { id: 'boots', c: { cloth: 'brown' } }, hat: { id: 'hat_leather', c: { cloth: 'tan' } }, weapon: { id: 'dagger' } } },
  { id: 'bardo', name: 'Bardo', slots: { torso: { id: 'shirt_buttoned', c: { cloth: 'white' } }, torso2: { id: 'vest', c: { cloth: 'maroon' } }, legs: { id: 'formal_pants', c: { cloth: 'black' } }, feet: { id: 'boots', c: { cloth: 'black' } }, neck: { id: 'bowtie', c: { cloth: 'red' } } } },
  { id: 'mago', name: 'Apprendista mago', slots: { torso: { id: 'tunic', c: { cloth: 'purple' } }, legs: { id: 'leggings', c: { cloth: 'navy' } }, feet: { id: 'slippers', c: { cloth: 'purple' } }, weapon: { id: 'staff_simple' } } },
  { id: 'casual', name: 'Casual', slots: { torso: { id: 'tshirt', c: { cloth: 'sky' } }, legs: { id: 'shorts', c: { cloth: 'blue' } }, feet: { id: 'shoes', c: { cloth: 'white' } } } }
];
function avatarWizard() {
  const P = S.profile; const L = clone(P.avatar.look); let name = P.name;
  const HAIRS = STARTER.filter(id => SPR.item(id) && SPR.item(id).slot === 'hair');
  const HAIRC = ['chestnut', 'dark_brown', 'black', 'raven', 'blonde', 'gold', 'redhead', 'ginger', 'platinum', 'white', 'gray', 'pink', 'rose', 'purple', 'blue', 'green'];
  let stage = null;
  const fits = () => { for (const s in L.slots) if (!SPR.supports(L.slots[s].id, L.body)) delete L.slots[s]; if (!L.slots.head) L.slots.head = { id: 'head_human' }; };
  const html = () => `${sheetHead(P.avatar.made ? 'Il tuo avatar' : 'Crea il tuo avatar', 'Potrai cambiare tutto nel guardaroba, e sbloccare molto altro studiando')}
    <div class="ward" style="grid-template-columns:1fr"><canvas id="avPrev" class="px" style="width:100%;height:200px;border:4px solid var(--line);display:block"></canvas></div>
    <div class="form" style="margin-top:12px">
      <div class="field"><label class="lbl" for="avN">Nome</label><input type="text" id="avN" maxlength="30" value="${esc(name)}" placeholder="Come ti chiami?"></div>
      <div class="field"><span class="lbl">Corporatura</span><div class="seg" id="avB">${[['female', 'Snella'], ['male', 'Classica'], ['muscular', 'Robusta'], ['child', 'Minuta']].map(([k, l]) => `<button type="button" data-v="${k}" aria-pressed="${L.body === k}">${l}</button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Pelle</span><div class="swatches" id="avS">${[...SKINS_HUMAN, ...SKINS_FANTASY].map(k => `<button type="button" class="sw sm" data-v="${k}" style="--c:${swatchHex('body', k)}" aria-pressed="${L.skin === k}" title="${esc(colorName(k))}" aria-label="${esc(colorName(k))}"></button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Volto</span><div class="seg" id="avH"><button type="button" data-v="head_human" aria-pressed="${L.slots.head.id === 'head_human'}">Deciso</button><button type="button" data-v="head_human_soft" aria-pressed="${L.slots.head.id === 'head_human_soft'}">Dolce</button><button type="button" data-v="ears" aria-pressed="${!!L.slots.ears}">Orecchie da elfo</button></div></div>
      <div class="field"><span class="lbl">Occhi</span><div class="swatches" id="avE">${EYES.map(k => `<button type="button" class="sw sm" data-v="${k}" style="--c:${swatchHex('eye', k)}" aria-pressed="${L.eyes === k}" title="${esc(colorName(k))}" aria-label="${esc(colorName(k))}"></button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Capelli</span><div class="items" id="avHair" style="grid-template-columns:repeat(auto-fill,minmax(70px,1fr))">${HAIRS.filter(id => SPR.supports(id, L.body)).map(id => `<button type="button" class="it" data-v="${id}" aria-pressed="${L.slots.hair && L.slots.hair.id === id}">${itThumb(id, L.body)}<span>${esc(SPR.item(id).name)}</span></button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Colore dei capelli</span><div class="swatches" id="avHC">${HAIRC.map(k => `<button type="button" class="sw sm" data-v="${k}" style="--c:${swatchHex('hair', k)}" aria-pressed="${L.hairColor === k}" title="${esc(colorName(k))}" aria-label="${esc(colorName(k))}"></button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Stile di partenza</span><div class="chips" id="avO">${OUTFITS.map(o => `<button type="button" class="chip" data-v="${o.id}">${esc(o.name)}</button>`).join('')}</div></div>
    </div>
    <div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Più tardi</button><button class="btn primary" id="avOk">${pix('check')} È il mio avatar!</button></div>`;
  const sh = openSheet(html(), { wide: true });
  const look = () => ({ look: { ...L, slots: { body: { id: 'body' }, shadow: { id: 'shadow' }, ...L.slots } }, aura: P.avatar.aura });
  const mount = () => { const c = sh.querySelector('#avPrev'); stage = WORLD.mountPreview(c, look, { h: 110 }); };
  const redraw = (full) => { if (full) { const sc = sh.scrollTop; name = sh.querySelector('#avN').value; sh.innerHTML = html(); hydrate(sh); bind(); mount(); sh.scrollTop = sc; } else { stage && stage.setLook(look().look, P.avatar.aura); } };
  const bind = () => {
    const q = s => sh.querySelector(s);
    q('#avB').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; L.body = b.dataset.v; fits(); if (!L.slots.torso) Object.assign(L.slots, Object.fromEntries(Object.entries(OUTFITS[0].slots).filter(([s, v]) => SPR.supports(v.id, L.body)))); if (!L.slots.hair) { const h = HAIRS.find(id => SPR.supports(id, L.body)); if (h) L.slots.hair = { id: h }; } redraw(true); };
    q('#avS').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; L.skin = b.dataset.v; sh.querySelectorAll('#avS .sw').forEach(x => x.setAttribute('aria-pressed', String(x === b))); redraw(); };
    q('#avE').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; L.eyes = b.dataset.v; sh.querySelectorAll('#avE .sw').forEach(x => x.setAttribute('aria-pressed', String(x === b))); redraw(); };
    q('#avHC').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; L.hairColor = b.dataset.v; sh.querySelectorAll('#avHC .sw').forEach(x => x.setAttribute('aria-pressed', String(x === b))); redraw(); };
    q('#avH').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; if (b.dataset.v === 'ears') { if (L.slots.ears) delete L.slots.ears; else if (SPR.supports('ears_elven', L.body)) L.slots.ears = { id: 'ears_elven' }; } else L.slots.head = { id: b.dataset.v }; redraw(true); };
    q('#avHair').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; L.slots.hair = { id: b.dataset.v }; sh.querySelectorAll('#avHair .it').forEach(x => x.setAttribute('aria-pressed', String(x === b))); redraw(); SFX.play('click'); };
    q('#avO').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; const o = OUTFITS.find(x => x.id === b.dataset.v); ['torso', 'torso2', 'legs', 'feet', 'back', 'belt', 'hat', 'face_acc', 'neck', 'weapon'].forEach(s => delete L.slots[s]); for (const s in o.slots) if (SPR.supports(o.slots[s].id, L.body)) L.slots[s] = clone(o.slots[s]); redraw(); SFX.play('potion'); };
    q('#avN').oninput = e => { name = e.target.value; };
    q('#avOk').onclick = () => { P.avatar.look = normLook(L, defaultLook()); P.avatar.made = true; P.name = (q('#avN').value || '').trim(); closeSheet(); commitProfile(); SFX.play('win'); toast(`Benvenuto nella radura${P.name ? ', ' + P.name : ''}!`, 'gold'); };
  };
  bind(); mount();
}

/* ---------- Oggetto bloccato: info e acquisto ---------- */
function lockedSheet(kind, id, who) {
  const it = kind === 'item' ? SPR.item(id) : AURA_BY[id]; if (!it) return;
  const price = priceOf(kind, id); const W = IX.wallet;
  let how = '';
  if (who === 'avatar') { for (const k in AVATAR_REWARDS) if (AVATAR_REWARDS[k].some(r => r.t === kind && r.id === id)) how = `Si sblocca gratis al <b>livello ${k}</b> del tuo avatar (sei al ${IX.lv.L}).`; }
  else { const c = compById(who); const r = bondRewards(c.sp, compTier(c)).find(r => r.t === kind && r.id === id); if (r) how = `Si sblocca gratis al <b>livello ${r.L} del legame</b> con ${esc(c.name)}.`; else for (let t = compTier(c) + 1; t <= compTier(c) + 3 && !how; t++) { const r2 = bondRewards(c.sp, t).find(r => r.t === kind && r.id === id); if (r2) how = `${esc(c.name)} lo sblocca nella <b>${TIER_NAMES[Math.min(4, t)]}</b> (livello ${r2.L}): supera l'esame e richiamalo dall'Albo.`; } }
  const body = who === 'avatar' ? S.profile.avatar.look.body : (compById(who) ? compById(who).look.body : 'female');
  const sh = openSheet(`${sheetHead(esc(it.name), `${RARITY[it.rar].name}${kind === 'item' ? ' · ' + (SLOT_NAMES[it.slot] || '') : ' · aura'}`)}
    <div class="row nowrap" style="align-items:center;gap:14px"><div class="ware rar-${it.rar}" style="width:120px"><span class="rar">${RARITY[it.rar].name}</span>${kind === 'item' ? itThumb(id, body) : `<span class="ic">${pix('aura', '', 6, { Y: it.cols[0], W: it.cols[1] || '#fff' })}</span>`}</div>
    <div style="display:grid;gap:6px"><p>${how || 'Non è tra i premi dei livelli.'}</p><p>Oppure compralo in bottega per <b>${num(price)} monete</b>: ${kind === 'item' ? 'varrà per te e per tutti i compagni.' : 'potrai usarla con chiunque.'}</p><p class="hint">Hai ${num(W.coins)} monete.</p></div></div>
    <div class="sheet-f"><button class="btn ghost" data-act="sheet-close">Chiudi</button><button class="btn gold" id="lkBuy" ${W.coins < price ? 'disabled' : ''}>${pix('coin')} Compra per ${num(price)}</button></div>`);
  sh.querySelector('#lkBuy').onclick = () => { const r = buy(kind, id); if (!r.ok) { toast(r.msg, 'bad'); return; } closeSheet(); toast(`${it.name}: è tuo!`, 'gold'); };
}

/* ---------- Celebrazioni ---------- */
function celebrateBond(c, before, after) {
  const e = compActiveExam(c); const tier = compTier(c);
  const got = bondRewards(c.sp, tier).filter(r => r.L > before && r.L <= after);
  const s0 = ART.houseStage(before), s1 = ART.houseStage(after);
  const sh = openSheet(`<div class="celebrate"><canvas class="cele px" id="celeC"></canvas><p class="eyebrow">Legame più forte!</p><h2>${esc(c.name)} è al livello ${after}</h2>
    ${s1 > s0 ? `<p class="pill gold">${pix('radura')} La sua casa è diventata: ${ART.HOUSE_NAMES[s1]}!</p>` : ''}
    ${got.length ? `<p class="muted">Hai sbloccato:</p><div class="loot-row">${got.map(r => `<div class="rw got">${rewardIcon(r, c.look.body)}<small>${esc(rewardLabel(r))}</small></div>`).join('')}</div>` : ''}
    <div class="row" style="justify-content:center"><button class="btn" data-act="ward" data-who="${c.id}">${pix('guardaroba')} Vestilo subito</button><button class="btn primary" data-act="sheet-close" data-autofocus>Evviva!</button></div></div>`);
  WORLD.mountPreview(sh.querySelector('#celeC'), () => lookOf(c.id, 'happy'), { h: 120, burst: e ? colorOf(e) : '#FFE27A' });
  SFX.play('level');
}
function celebrateAvatar(before, after) {
  const got = []; for (let L = before + 1; L <= after; L++) (AVATAR_REWARDS[L] || []).forEach(r => got.push(r));
  const sh = openSheet(`<div class="celebrate"><canvas class="cele px" id="celeC"></canvas><p class="eyebrow">Livello ${after}!</p><h2>${esc(S.profile.name || 'Il tuo avatar')} sale di livello</h2><p class="muted">${esc(IX.lv.title)} · +${30 * after} monete</p>
    ${got.length ? `<div class="loot-row">${got.map(r => `<div class="rw got">${rewardIcon(r, S.profile.avatar.look.body)}<small>${esc(rewardLabel(r))}</small></div>`).join('')}</div>` : ''}
    <div class="row" style="justify-content:center"><button class="btn" data-act="ward" data-who="avatar">${pix('guardaroba')} Guardaroba</button><button class="btn primary" data-act="sheet-close" data-autofocus>Fantastico!</button></div></div>`);
  WORLD.mountPreview(sh.querySelector('#celeC'), () => lookOf('avatar', 'happy'), { h: 120, burst: '#C7A6FF' });
  SFX.play('level');
}
function celebrateWin(e) {
  const c = compById(e.comp); rebuild();
  const coins = 250 + (e.grade ? (e.grade - 18) * 15 : 0) + (e.lode ? 150 : 0);
  const h = c ? c.history.find(x => x.ex === e.id) : null;
  const sh = openSheet(`<div class="celebrate"><canvas class="cele px" id="celeC"></canvas><p class="eyebrow">Vittoria!</p><h2>Hai superato ${esc(e.name)}${e.grade ? ` con ${e.grade}${e.lode ? ' e lode' : ''}` : ''}</h2>
    <p class="muted">${c ? `${esc(c.name)} entra nell'Albo degli Eroi${h ? ` con ${fmtMin(h.min)} di studio e il legame al livello ${h.level}` : ''}.` : ''} Il boss ${esc(bossFor(e).name)} è sconfitto. +${coins} monete.</p>
    <div class="row" style="justify-content:center"><button class="btn gold" data-act="nav" data-v="albo">${pix('albo')} Vai all'Albo</button><button class="btn primary" data-act="sheet-close" data-autofocus>Evviva!</button></div></div>`);
  if (c) WORLD.mountPreview(sh.querySelector('#celeC'), () => lookOf(c.id, 'happy'), { h: 120, burst: colorOf(e) });
  SFX.play('win');
}

/* ---------- Esempi ---------- */
function loadDemo() {
  const P = S.profile; const ay = P.ay, y = ay + 1, t = today(), created = Date.now() - 40 * 86400000;
  const mk = (o, sp) => { const c = newCompanion(sp); c.demo = true; P.companions.push(c); return normExam({ ay, demo: true, created, comp: c.id, ...o }); };
  const ex = [
    mk({ name: 'Analisi Matematica I', color: 'cielo', cfu: 9, sem: 1, ses: 'inv', status: 'in_corso', teacher: 'Prof.ssa Bianchi', room: 'Aula Magna', office: 'Martedì 14–16, studio 3B', notes: 'Scritto con esercizi su limiti, derivate, integrali e serie. Orale facoltativo per alzare il voto.', links: 'https://www.example.org/analisi-1', appelli: [{ date: `${y}-01-19`, time: '09:00', type: 'scritto', place: 'Aula 3' }, { date: `${y}-02-12`, time: '09:00', type: 'scritto', place: 'Aula 3' }] }, 'gnomo'),
    mk({ name: 'Chimica Generale', color: 'oro', cfu: 6, sem: 1, ses: 'inv', status: 'da_iniziare', teacher: 'Prof. Russo', appelli: [{ date: `${y}-01-27`, time: '14:30', type: 'orale', place: 'Studio 2B' }] }, 'strega'),
    mk({ name: 'Inglese B2', color: 'rosa', cfu: 3, sem: 1, ses: 'inv', status: 'pronto', appelli: [{ date: `${y}-02-03`, time: '10:00', type: 'scritto', booked: true }] }, 'fata'),
    mk({ name: 'Programmazione', color: 'lavanda', cfu: 12, sem: 0, ses: 'est', status: 'in_corso', teacher: 'Prof. Conti', notes: 'Progetto in Python da consegnare 10 giorni prima dell\'orale.', appelli: [{ date: `${y}-06-16`, type: 'progetto' }, { date: `${y}-06-26`, time: '09:30', type: 'orale' }] }, 'draconide'),
    mk({ name: 'Fisica I', color: 'corallo', cfu: 6, sem: 2, ses: 'est', status: 'da_iniziare' }, 'kitsune'),
    mk({ name: 'Geometria', color: 'menta', cfu: 6, sem: 1, ses: 'inv', status: 'in_corso' }, 'elfo')
  ];
  P.exams.push(...ex);
  const [an, ch, en, pr, fi, ge] = ex.map(e => e.id);
  const plan = [[an, 70], [pr, 90], [an, 45], [en, 30], [pr, 60], [an, 95], [fi, 40], [pr, 75], [an, 50], [ch, 35], [pr, 50], [an, 80], [en, 25], [pr, 100], [an, 60], [ge, 90]];
  const touched = new Set();
  for (let i = 1; i <= 26; i++) {
    if (i % 6 === 5) continue;
    const d = addDays(t, -i); const a = plan[i % plan.length], b = plan[(i * 3 + 1) % plan.length];
    [[a, 0], [b, 1]].forEach(([[exid, m], j]) => { if (!m || (j === 1 && i % 3 === 0)) return; const k = ymOf(d); (S.months[k] ||= []).push({ id: uid(), d, ex: exid, m, src: (i + j) % 3 === 0 ? 'manuale' : 'pomodoro', p: (i + j) % 3 ? 1 : undefined, note: '', t: pd(d).getTime() + (9 + j * 5) * 3600000, demo: true }); touched.add(k); });
  }
  for (let i = 30; i < 70; i += 3) { const d = addDays(t, -i); const k = ymOf(d); (S.months[k] ||= []).push({ id: uid(), d, ex: ge, m: 80 + (i % 5) * 15, src: 'pomodoro', p: 1, note: '', t: pd(d).getTime() + 10 * 3600000, demo: true }); touched.add(k); }
  const k0 = ymOf(t); (S.months[k0] ||= []).push({ id: uid(), d: t, ex: an, m: 50, src: 'pomodoro', p: 1, note: 'Integrali per parti', t: Date.now() - 3600000, demo: true }); touched.add(k0);
  for (const k of touched) S.months[k] = normEntries(S.months[k]).map(e => ({ ...e, demo: true }));
  const B = (day, h1, h2, type, ex, place = '') => normBlock({ day, start: Math.round(h1 * 60), end: Math.round(h2 * 60), type, ex, place, demo: true });
  const s1 = `${ay}-s1`, inv = `${ay}-inv`;
  P.schedule[s1] = [...(P.schedule[s1] || []),
    B(0, 9, 11, 'lezione', an, 'Aula Magna'), B(2, 9, 11, 'lezione', an, 'Aula Magna'), B(4, 11, 13, 'eserc', an, 'Aula 3'),
    B(1, 11, 13, 'lezione', ch, 'Aula 5'), B(3, 11, 13, 'lezione', ch, 'Aula 5'), B(1, 9, 10.5, 'lezione', en, 'Lab lingue'),
    B(0, 14, 16, 'lezione', pr, 'Lab 1'), B(3, 14, 17, 'eserc', pr, 'Lab 1'), B(1, 14, 15, 'ricev', an, 'Studio 3B'),
    B(1, 15.5, 17.5, 'studio', an, 'Biblioteca'), B(2, 15, 16.5, 'studio', ch, 'Biblioteca'), B(4, 15, 17, 'studio', pr, 'Casa'), B(5, 10, 12, 'studio', an, 'Casa')];
  P.schedule[inv] = [...(P.schedule[inv] || []), B(0, 9, 12, 'studio', an), B(0, 15, 17, 'studio', ch), B(1, 9, 12, 'studio', an), B(2, 9, 11, 'studio', en), B(2, 15, 18, 'studio', ch), B(3, 9, 12, 'studio', an), B(4, 9, 12, 'studio', ch)];
  // Geometria è già superata: entra nell'Albo
  rebuild(); const g = exById(ge); Object.assign(g, { status: 'superato', grade: 28, lode: false, passedOn: addDays(t, -25) }); rebuild(); snapshotBond(g);
  closeAllSheets(); rebuild(); render(); Sync.mark('profile'); touched.forEach(k => Sync.mark('log-' + k));
  toast('Ecco una radura di esempio da esplorare.', 'good');
}
function clearDemo() {
  const P = S.profile; const demoIds = new Set(P.exams.filter(e => e.demo).map(e => e.id));
  P.exams = P.exams.filter(e => !e.demo);
  P.companions = P.companions.filter(c => !c.demo || P.exams.some(e => e.comp === c.id));
  P.companions.forEach(c => { c.history = c.history.filter(h => !demoIds.has(h.ex)); });
  for (const k in P.schedule) P.schedule[k] = P.schedule[k].filter(b => !b.demo && !demoIds.has(b.ex));
  const touched = [];
  for (const k in S.months) { const n = S.months[k].length; S.months[k] = S.months[k].filter(e => !e.demo && !demoIds.has(e.ex)); if (S.months[k].length !== n) touched.push(k); if (!S.months[k].length) delete S.months[k]; }
  if (T.ex && demoIds.has(T.ex)) { if (T.phase !== 'idle') { T.phase = 'idle'; T.run = false; wake(false); } T.ex = null; tSave(); }
  closeAllSheets(); rebuild(); render(); Sync.mark('profile'); touched.forEach(k => Sync.mark('log-' + k));
  toast('Esempi cancellati: ora tocca ai tuoi esami.');
}

/* ---------- Oracolo magico (solo nella pagina di Claude) ---------- */
async function aiAsk() {
  if (!S.sample) return;
  const ws = addDays(weekStart(today()), S.ui.wOff * 7); const o = oracle(ws);
  const four = weeksBack(4).map(weekStats);
  const lines = o.items.filter(i => i.w > 0).map(i => `- ${i.e.name}: ${i.e.cfu || '?'} CFU, ${SESSIONI[i.e.ses].label.toLowerCase()} ${i.e.ay + 1}, prossima prova: ${i.tg ? fmtDayYear(i.tg.date) + ' (' + inDays(i.dl) + ')' : 'non definita'}, studiato nella settimana: ${fmtMin(i.act)}, ultime 4 settimane: ${fmtMin(four.reduce((s, w) => s + (w.per.get(i.e.id) || 0), 0))}, quota consigliata ${pct(i.share)}, stato: ${STATUS[i.e.status].label.toLowerCase()}, compagno: ${compName(i.e)}`).join('\n');
  const per = periodOf(o.ended ? addDays(ws, 7) : today());
  const blocks = (S.profile.schedule[`${S.profile.ay}-${per}`] || []).slice().sort((a, b) => a.day - b.day || a.start - b.start).map(b => { const e = exById(b.ex); return `${GIORNI_S[b.day]} ${hm(b.start)}-${hm(b.end)} ${BLOCK_TYPES[b.type].label.toLowerCase()}${e ? ' ' + e.name : b.label ? ' ' + b.label : ''}`; }).join('; ');
  const prompt = `Sei l'Oracolo della Radura, un consigliere di studio gentile e pratico per uno studente universitario italiano, in un mondo fantasy a pixel con elfi, fate, orchi e compagni d'avventura.

Oggi è ${fmtDayLong(today())} ${pd(today()).getFullYear()}.
Settimana analizzata: ${fmtWeek(ws)} (${o.ended ? 'conclusa' : 'in corso'}). Studio totale: ${fmtMin(o.st.total)} in ${o.st.active} giorni. Obiettivo settimanale: ${fmtMin(o.goal)}; obiettivo giornaliero: ${fmtMin(S.profile.goals.day)}.

Esami da preparare:
${lines || '- nessuno'}

Orario della settimana tipo (${PERIODS.find(x => x.id === per).label}): ${blocks || 'nessun blocco inserito'}.

Scrivi in italiano:
1) Due frasi di verdetto sulla settimana, sincere ma gentili.
2) Un piano per la ${o.ended ? 'prossima settimana' : 'parte restante di questa settimana e la prossima'}, una riga per giorno nel formato "Lunedì: …", con materie e durate realistiche che rispettino le lezioni dell'orario e l'obiettivo settimanale. Dai più spazio agli esami trascurati e a quelli più vicini e lascia almeno mezza giornata libera.
3) Un consiglio di metodo in una frase.
Usa testo semplice: niente tabelle, niente grassetto, niente titoli. Massimo 220 parole. Tono incoraggiante con un leggero sapore fantasy, senza esagerare.`;
  S.ui.aiCtl = new AbortController(); S.ui.ai = { state: 'thinking', text: '' }; render();
  try {
    const r = await S.sample(prompt, { signal: S.ui.aiCtl.signal, onText: ({ text }) => { S.ui.ai = { state: 'writing', text }; const b = $('#aiBox'); if (b) b.textContent = aiShown(); } });
    S.ui.ai = { state: 'done', text: r.text, truncated: r.truncated };
  } catch (e) {
    const c = e && e.code;
    if (c === 'cancelled') S.ui.ai = { state: 'done', text: e.text || '', msg: 'Hai fermato l\'Oracolo.' };
    else if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(c)) { S.sample = null; S.ui.ai = null; toast('L\'Oracolo magico non è disponibile qui: restano i consigli automatici.'); }
    else if (c === 'refused') S.ui.ai = { state: 'err', text: '', msg: 'L\'Oracolo non ha risposto a questa domanda.' };
    else if (c === 'rate_limited') S.ui.ai = { state: 'err', text: e.text || '', msg: 'Troppe richieste in poco tempo: riprova più tardi.' };
    else if (c === 'session_expired') S.ui.ai = { state: 'err', text: '', msg: 'Accedi di nuovo a Claude e riprova.' };
    else S.ui.ai = { state: 'err', text: e.text || '', msg: 'L\'Oracolo si è distratto: riprova.' };
  }
  S.ui.aiCtl = null; if (S.ui.view === 'oracolo') render();
}
