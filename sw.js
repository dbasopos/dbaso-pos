// Service worker DBASO Kasir: aplikasi tetap terbuka tanpa internet.
// Ganti VERSI setiap kali file aplikasi diperbarui supaya tablet mengambil versi baru.
const VERSI = 'dbaso-kasir-v7';
const FILE = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// file aplikasi: coba internet dulu (maks 4 detik) supaya pembaruan cepat sampai, kalau gagal pakai simpanan.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // server Google (POST) tidak disentuh
  e.respondWith((async () => {
    const c = await caches.open(VERSI);
    try {
      const r = await Promise.race([fetch(e.request), new Promise((_, no) => setTimeout(() => no(new Error('lambat')), 4000))]);
      if (r && r.ok) c.put(e.request, r.clone());
      return r;
    } catch (x) {
      return (await c.match(e.request, { ignoreSearch: true })) || (await c.match('./index.html')) || Response.error();
    }
  })());
});
