/* ============ Audio chiptune: musica ed effetti ============ */
const AUDIO = (() => {
  let ctx = null, master = null, musicGain = null, sfxGain = null, comp = null;
  let noiseBuf = null;
  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC();
      comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
      master = ctx.createGain(); musicGain = ctx.createGain(); sfxGain = ctx.createGain();
      musicGain.connect(master); sfxGain.connect(master); master.connect(comp); comp.connect(ctx.destination);
      const len = ctx.sampleRate * 1; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      applyVol();
    } catch { ctx = null; }
    return ctx;
  }
  function applyVol() {
    if (!ctx) return; const s = (S.profile && S.profile.sound) || { vol: .5 };
    master.gain.value = s.vol ?? .5; musicGain.gain.value = .32; sfxGain.gain.value = .55;
  }
  function unlock() { const c = ensure(); if (c && c.state === 'suspended') c.resume(); }
  const NOTE = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  function freq(n) { if (typeof n === 'number') return 440 * Math.pow(2, (n - 69) / 12); const m = /^([A-G][#b]?)(\d)$/.exec(n); if (!m) return 0; return 440 * Math.pow(2, ((NOTE[m[1]] + (Number(m[2]) + 1) * 12) - 69) / 12); }
  function midi(n) { const m = /^([A-G][#b]?)(\d)$/.exec(n); return m ? NOTE[m[1]] + (Number(m[2]) + 1) * 12 : 0; }
  function tone(dest, { f, t, d, type = 'square', vol = .2, a = .005, r = .08, slide = 0, duty = null, vib = 0 }) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    if (type === 'pulse' && duty) {
      const real = new Float32Array(32), imag = new Float32Array(32);
      for (let k = 1; k < 32; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
      o.setPeriodicWave(ctx.createPeriodicWave(real, imag));
    } else o.type = type === 'pulse' ? 'square' : type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d);
    if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = f * vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + d + r + .05); }
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a);
    g.gain.setValueAtTime(vol, Math.max(t + a, t + d - r * .3)); g.gain.exponentialRampToValueAtTime(.0005, t + d + r);
    o.connect(g).connect(dest); o.start(t); o.stop(t + d + r + .02);
  }
  function noise(dest, { t, d = .05, vol = .15, hp = 4000, lp = 12000 }) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const h = ctx.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp;
    const l = ctx.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = lp;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + d);
    s.connect(h).connect(l).connect(g).connect(dest); s.start(t); s.stop(t + d + .02);
  }
  function kick(dest, t, vol = .5) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + .12); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .16); o.connect(g).connect(dest); o.start(t); o.stop(t + .2); }

  /* ---------- Effetti ---------- */
  const SFXDEF = {
    click: t => tone(sfxGain, { f: 1320, t, d: .03, type: 'square', vol: .08, r: .02 }),
    tab: t => { tone(sfxGain, { f: 880, t, d: .03, vol: .07, r: .02 }); tone(sfxGain, { f: 1320, t: t + .035, d: .03, vol: .06, r: .02 }); },
    coin: t => { tone(sfxGain, { f: 988, t, d: .06, vol: .12, r: .03 }); tone(sfxGain, { f: 1319, t: t + .06, d: .22, vol: .12, r: .15 }); },
    start: t => [523, 659, 784].forEach((f, i) => tone(sfxGain, { f, t: t + i * .07, d: .07, vol: .1, type: 'pulse', duty: .25 })),
    bell: t => [1047, 1319, 1568, 2093].forEach((f, i) => tone(sfxGain, { f, t: t + i * .12, d: .4, type: 'triangle', vol: .2, r: .6 })),
    bell2: t => [1568, 1319, 1047].forEach((f, i) => tone(sfxGain, { f, t: t + i * .14, d: .35, type: 'triangle', vol: .18, r: .5 })),
    level: t => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(sfxGain, { f, t: t + i * .08, d: i === 6 ? .5 : .08, type: 'pulse', duty: .5, vol: .1, r: i === 6 ? .4 : .04 })),
    unlock: t => { [784, 988, 1175, 1568, 1976].forEach((f, i) => tone(sfxGain, { f, t: t + i * .06, d: .12, type: 'triangle', vol: .14, r: .2 })); for (let i = 0; i < 6; i++) noise(sfxGain, { t: t + .3 + i * .05, d: .04, vol: .03, hp: 8000 }); },
    potion: t => { for (let i = 0; i < 6; i++) tone(sfxGain, { f: 400 + Math.random() * 500, t: t + i * .05, d: .05, type: 'sine', vol: .1, slide: 1.6 }); },
    error: t => tone(sfxGain, { f: 180, t, d: .18, type: 'square', vol: .08, slide: .6 }),
    talk: t => tone(sfxGain, { f: 600 + Math.random() * 300, t, d: .025, type: 'pulse', duty: .125, vol: .045, r: .01 }),
    step: t => noise(sfxGain, { t, d: .03, vol: .025, hp: 1500, lp: 4000 }),
    whoosh: t => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3000, t + .25); const g = ctx.createGain(); g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); s.connect(f).connect(g).connect(sfxGain); s.start(t); s.stop(t + .32); },
    win: t => { const seq = [[523, 0], [659, .12], [784, .24], [1047, .36], [988, .6], [1047, .72], [1319, .84]]; seq.forEach(([f, dt], i) => tone(sfxGain, { f, t: t + dt, d: i === 6 ? .8 : .1, type: 'pulse', duty: .25, vol: .12, r: i === 6 ? .6 : .05 })); [262, 330, 392].forEach(f => tone(sfxGain, { f, t: t + .84, d: .8, type: 'triangle', vol: .12, r: .6 })); kick(sfxGain, t + .84, .3); }
  };
  function play(name) {
    const s = S.profile && S.profile.sound; if (!s || !s.sfx) return;
    const c = ensure(); if (!c || c.state !== 'running') return;
    try { SFXDEF[name] && SFXDEF[name](c.currentTime + .01); } catch { }
  }

  /* ---------- Musica ---------- */
  // Notazione: "nota:durata" con durate in sedicesimi; "-" = pausa
  const SONGS = {
    radura: { bpm: 92, lead: 'pulse', duty: .25, chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G'],
      mel: 'E5:4 G5:2 E5:2 D5:4 C5:4 | C5:4 E5:2 A5:2 G5:6 E5:2 | F5:4 A5:2 F5:2 E5:4 C5:4 | D5:6 E5:2 D5:4 B4:4 | E5:4 G5:2 C6:2 B5:4 G5:4 | A5:4 G5:2 E5:2 C5:8 | D5:4 F5:2 A5:2 G5:4 F5:4 | E5:4 D5:4 C5:8',
      arp: 'up', bass: 'root8', drums: 'soft' },
    focus: { bpm: 70, lead: 'triangle', chords: ['Am7', 'Fmaj7', 'Cmaj7', 'G6', 'Am7', 'Dm7', 'Fmaj7', 'E7'],
      mel: '- :8 E5:4 C5:4 | A4:8 - :4 C5:4 | E5:4 G5:4 E5:4 D5:4 | D5:12 - :4 | - :8 C5:4 E5:4 | F5:6 E5:2 D5:8 | C5:4 A4:4 C5:4 F5:4 | E5:12 - :4',
      arp: 'slow', bass: 'root4', drums: 'shaker' },
    taverna: { bpm: 128, lead: 'pulse', duty: .5, chords: ['D', 'D', 'G', 'A', 'D', 'Bm', 'G', 'A'],
      mel: 'F#5:2 A5:2 F#5:2 D5:2 A4:2 D5:2 F#5:4 | E5:2 F#5:2 E5:2 D5:2 C#5:2 D5:2 E5:4 | D5:2 G5:2 B5:2 G5:2 D5:2 G5:2 B5:4 | A5:2 G5:2 F#5:2 E5:2 C#5:2 E5:2 A5:4 | F#5:2 A5:2 D6:2 A5:2 F#5:2 A5:2 D6:4 | B5:2 A5:2 F#5:2 D5:2 B4:2 D5:2 F#5:4 | G5:2 F#5:2 E5:2 D5:2 B4:2 D5:2 G5:4 | A5:4 E5:4 D5:8',
      arp: 'oompa', bass: 'oompa', drums: 'folk' },
    notte: { bpm: 66, lead: 'sine', chords: ['Am', 'F', 'C', 'E', 'Am', 'Dm', 'E', 'Am'],
      mel: 'A5:4 C6:4 E6:4 C6:4 | A5:4 F5:4 C6:8 | G5:4 E5:4 G5:4 C6:4 | B5:12 G#5:4 | A5:4 E6:4 D6:4 C6:4 | D6:4 F5:4 A5:8 | G#5:4 B5:4 E6:4 D6:4 | C6:8 A5:8',
      arp: 'box', bass: 'root8', drums: 'none' },
    eroe: { bpm: 112, lead: 'pulse', duty: .25, chords: ['G', 'G', 'C', 'D', 'Em', 'C', 'D', 'G'],
      mel: 'G4:3 G4:1 B4:4 D5:4 G5:4 | F#5:2 E5:2 D5:4 B4:8 | C5:3 C5:1 E5:4 G5:4 C6:4 | B5:2 A5:2 G5:4 A5:8 | B5:4 G5:4 E5:4 B4:4 | C5:4 E5:4 G5:4 E5:4 | A5:3 A5:1 G5:4 F#5:4 A5:4 | G5:12 - :4',
      arp: 'march', bass: 'march', drums: 'march' },
    neve: { bpm: 96, lead: 'triangle', beats: 3, chords: ['F', 'C', 'Dm', 'Bb', 'F', 'Gm', 'C', 'F'],
      mel: 'A5:4 C6:4 A5:4 | G5:8 E5:4 | F5:4 A5:4 D6:4 | D6:8 C6:4 | A5:4 C6:4 F6:4 | E6:4 D6:4 Bb5:4 | G5:4 C6:4 E5:4 | F5:12',
      arp: 'waltz', bass: 'waltz', drums: 'none' }
  };
  const CH = {
    C: ['C', 'E', 'G'], Am: ['A', 'C', 'E'], F: ['F', 'A', 'C'], G: ['G', 'B', 'D'], Dm: ['D', 'F', 'A'], Em: ['E', 'G', 'B'], E: ['E', 'G#', 'B'], E7: ['E', 'G#', 'D'],
    Am7: ['A', 'C', 'G'], Fmaj7: ['F', 'A', 'E'], Cmaj7: ['C', 'E', 'B'], G6: ['G', 'B', 'E'], Dm7: ['D', 'F', 'C'], D: ['D', 'F#', 'A'], A: ['A', 'C#', 'E'], Bm: ['B', 'D', 'F#'], Bb: ['Bb', 'D', 'F'], Gm: ['G', 'Bb', 'D']
  };
  function parseMel(s) { const out = []; s.split('|').forEach(bar => bar.trim().split(/\s+(?=[A-G-])/).forEach(tok => { const [n, d] = tok.replace(' ', '').split(':'); out.push({ n: n === '-' ? null : n, d: Number(d) }); })); return out; }
  let playing = null, schedT = null, nextT = 0, step = 0, songKey = null;
  function stopMusic() { clearInterval(schedT); schedT = null; playing = null; songKey = null; }
  function startMusic(key) {
    const c = ensure(); if (!c) return;
    if (songKey === key && schedT) return;
    stopMusic(); const song = SONGS[key] || SONGS.radura; songKey = key;
    const mel = parseMel(song.mel); const beats = song.beats || 4; const stepsPerBar = beats * 4;
    const melSteps = []; let pos = 0; mel.forEach(m => { melSteps.push({ at: pos, ...m }); pos += m.d; });
    const total = Math.max(pos, song.chords.length * stepsPerBar);
    playing = { song, melSteps, total, stepsPerBar };
    step = 0; nextT = c.currentTime + .1;
    const sixteenth = 60 / song.bpm / 4;
    schedT = setInterval(() => {
      if (!playing) return;
      while (nextT < c.currentTime + .25) { scheduleStep(step, nextT, sixteenth); step = (step + 1) % playing.total; nextT += sixteenth; }
    }, 40);
  }
  function scheduleStep(st, t, six) {
    const { song, melSteps, stepsPerBar } = playing;
    const bar = Math.floor(st / stepsPerBar), inBar = st % stepsPerBar;
    const chord = CH[song.chords[bar % song.chords.length]] || CH.C;
    const m = melSteps.find(x => x.at === st);
    if (m && m.n) tone(musicGain, { f: freq(m.n), t, d: m.d * six * .92, type: song.lead, duty: song.duty, vol: song.lead === 'sine' ? .16 : song.lead === 'triangle' ? .2 : .09, r: .08, vib: m.d >= 8 ? .006 : 0 });
    // basso
    const root = chord[0];
    const bassNote = n => freq(n + '2');
    if (song.bass === 'root8' && inBar % 8 === 0) tone(musicGain, { f: bassNote(root), t, d: six * 7, type: 'triangle', vol: .22, r: .05 });
    if (song.bass === 'root4' && inBar % 16 === 0) tone(musicGain, { f: bassNote(root), t, d: six * 15, type: 'triangle', vol: .2, r: .2 });
    if (song.bass === 'oompa' && inBar % 4 === 0) tone(musicGain, { f: bassNote(inBar % 8 === 0 ? root : chord[2]), t, d: six * 2, type: 'triangle', vol: .24, r: .03 });
    if (song.bass === 'march' && inBar % 4 === 0) tone(musicGain, { f: bassNote(inBar % 8 === 0 ? root : chord[2]), t, d: six * 3, type: 'triangle', vol: .24, r: .03 });
    if (song.bass === 'waltz' && inBar === 0) tone(musicGain, { f: bassNote(root), t, d: six * 3, type: 'triangle', vol: .24, r: .05 });
    // arpeggi
    const ar = (n, o, v = .05, ty = 'pulse', du = .125, d = 1) => tone(musicGain, { f: freq(n + o), t, d: six * d * .9, type: ty, duty: du, vol: v, r: .03 });
    if (song.arp === 'up' && inBar % 2 === 0) ar(chord[(inBar / 2) % 3], '4', .045);
    if (song.arp === 'slow' && inBar % 4 === 0) ar(chord[(inBar / 4) % 3], '4', .06, 'triangle', null, 3);
    if (song.arp === 'oompa' && inBar % 4 === 2) { ar(chord[1], '4', .05); ar(chord[2], '4', .04); }
    if (song.arp === 'box' && inBar % 2 === 0) ar(chord[[0, 1, 2, 1][(inBar / 2) % 4]], '5', .05, 'triangle', null, 2);
    if (song.arp === 'march' && inBar % 4 === 2) { ar(chord[1], '4', .05, 'pulse', .25, 2); ar(chord[2], '4', .04, 'pulse', .25, 2); }
    if (song.arp === 'waltz' && (inBar === 4 || inBar === 8)) { ar(chord[1], '4', .06, 'triangle', null, 3); ar(chord[2], '4', .05, 'triangle', null, 3); }
    // batteria
    if (song.drums === 'soft') { if (inBar % 8 === 0) kick(musicGain, t, .25); if (inBar % 8 === 4) noise(musicGain, { t, d: .06, vol: .05, hp: 2500 }); if (inBar % 2 === 1) noise(musicGain, { t, d: .02, vol: .02, hp: 9000 }); }
    if (song.drums === 'shaker' && inBar % 2 === 0) noise(musicGain, { t, d: .03, vol: inBar % 4 === 0 ? .02 : .012, hp: 7000 });
    if (song.drums === 'folk') { if (inBar % 4 === 0) kick(musicGain, t, .3); if (inBar % 4 === 2) noise(musicGain, { t, d: .05, vol: .05, hp: 3000 }); }
    if (song.drums === 'march') { if (inBar % 8 === 0) kick(musicGain, t, .35); if (inBar % 2 === 0) noise(musicGain, { t, d: .04, vol: inBar % 4 === 0 ? .03 : .06, hp: 2000 }); }
  }
  function syncMusic(context) {
    const s = S.profile.sound;
    if (!s.music) { stopMusic(); return; }
    const want = context === 'focus' && T.phase === 'work' ? (s.track === 'radura' ? 'focus' : s.track) : s.track;
    if (!ctx || ctx.state !== 'running') return;
    startMusic(want);
  }
  return { unlock, play, startMusic, stopMusic, syncMusic, applyVol, ensure, SONGS };
})();
const SFX = { play: n => AUDIO.play(n) };
