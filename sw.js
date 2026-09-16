const CACHE_NAME = 'novel-reader-v1';
const APP_SHELL = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './pwa.js',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key.startsWith('novel-reader-') && key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const requestUrl = new URL(event.request.url);
    const scopeUrl = new URL(self.registration.scope);
    if (requestUrl.origin !== scopeUrl.origin || !requestUrl.pathname.startsWith(scopeUrl.pathname)) return;

    event.respondWith((async () => {
        try {
            const response = await fetch(event.request);
            if (response && response.ok) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, response.clone());
            }
            return response;
        } catch (error) {
            const cached = await caches.match(event.request);
            if (cached) return cached;

            if (event.request.mode === 'navigate') {
                const fallback = await caches.match('./index.html');
                if (fallback) return fallback;
            }

            throw error;
        }
    })());
});
