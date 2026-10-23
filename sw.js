/* Radura degli Esami: funziona anche offline */
const V = 'radura-v2-202610230708';
const SHELL = [
  './',
  'assets/atlas/a00.png',
  'assets/atlas/a01.png',
  'assets/atlas/a02.png',
  'assets/atlas/a03.png',
  'assets/atlas/a04.png',
  'assets/atlas/a05.png',
  'assets/atlas/a06.png',
  'assets/atlas/a07.png',
  'assets/atlas/a08.png',
  'assets/atlas/a09.png',
  'assets/atlas/a10.png',
  'assets/atlas/a11.png',
  'assets/atlas/a12.png',
  'assets/atlas/a13.png',
  'assets/atlas/a14.png',
  'assets/atlas/a15.png',
  'assets/atlas/a16.png',
  'assets/atlas/a17.png',
  'assets/atlas/b00.png',
  'assets/atlas/b01.png',
  'assets/atlas/b02.png',
  'assets/atlas/b03.png',
  'assets/atlas/b04.png',
  'assets/atlas/b05.png',
  'assets/credits.json',
  'css/app.css',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-32.png',
  'icons/icon-512.png',
  'index.html',
  'js/app.js',
  'js/art.js',
  'js/audio.js',
  'js/catalog.js',
  'js/core.js',
  'js/data.js',
  'js/logic.js',
  'js/sheets.js',
  'js/sprites.js',
  'js/ui.js',
  'js/world.js',
  'manifest.webmanifest',
];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname.endsWith('supabase.co')) return;
  if (u.hostname.includes('fonts.googleapis.com') || u.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(V).then(async c => { const hit = await c.match(r); if (hit) return hit; try { const res = await fetch(r); c.put(r, res.clone()); return res; } catch { return hit || Response.error(); } }));
    return;
  }
  if (u.origin !== location.origin) return;
  // rete prima (per avere sempre l'ultima versione), cache se offline
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r).then(h => h || caches.match('./index.html'))));
});
