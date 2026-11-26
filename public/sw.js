// Catholic My Pride service worker: shows a friendly offline page when there is no internet.
// It saves only the offline page and the logo; every other page always comes fresh from the network.
const CACHE = 'cmp-offline-v1'
const SAVED = ['/offline.html', '/logo.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SAVED)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('cmp-offline-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  // Page visits: try the network; with no connection, show the offline page.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/offline.html')))
    return
  }
  // The logo on the offline page.
  if (new URL(req.url).pathname === '/logo.png') {
    e.respondWith(fetch(req).catch(() => caches.match('/logo.png')))
  }
})
