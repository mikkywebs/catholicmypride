// Catholic My Pride service worker: shows a friendly offline page when there is no internet.
// It saves only the offline page and the logo; every other page always comes fresh from the network.
const CACHE = 'cmp-offline-v2'
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

// Prayer-time reminders: show the notification, and open the prayer when it is tapped.
self.addEventListener('push', (e) => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch {}
  e.waitUntil(self.registration.showNotification(d.title || 'Time to pray', {
    body: d.body || 'Tap to pray with us.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: d.tag || 'cmp-prayer',
    data: { url: d.url || '/' },
    requireInteraction: true,
  }))
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) if (new URL(c.url).origin === self.location.origin && 'navigate' in c) return c.navigate(url).then((w) => (w || c).focus())
    return self.clients.openWindow(url)
  }))
})
