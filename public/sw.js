/*
 * Service Worker — Victoria Line Soft
 * - تنقلات التطبيق: الشبكة أولاً ثم غلاف مخزّن عند انقطاع الاتصال (PWA offline).
 * - الأصول المُبصمة والمشاريع: Cache-First (لا تتغير بين النشرات).
 * - بقية الملفات: Stale-While-Revalidate.
 */
const CACHE = 'vls-cache-v3';
const CORE = [
  '/index.html',
  '/theme-init.js',
  '/favicon.svg',
  '/site.webmanifest',
  '/icons/favicon-32x32.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // تنقلات SPA: الشبكة أولاً مع سقوط آمن للغلاف المخزّن
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  const immutable =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/projects/');

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached && immutable) return cached;
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    })
  );
});
