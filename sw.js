// מטמון לעבודה בלי קליטה. לשנות את המספר בכל עדכון של האפליקציה.
const CACHE = 'lehman-kitchen-v1';
const FILES = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// מגיש מהמטמון מיד, ומעדכן ברקע כשיש רשת (העדכון נראה בפתיחה הבאה)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const key = e.request.mode === 'navigate' || url.pathname.endsWith('/index.html') ? new URL('./', self.registration.scope).href : url.origin + url.pathname;
  e.respondWith(caches.open(CACHE).then(c => c.match(key).then(hit => {
    const net = fetch(e.request, {cache: 'no-cache'}).then(res => {
      if (res.ok) c.put(key, res.clone());
      return res;
    }).catch(() => hit);
    return hit || net;
  })));
});
