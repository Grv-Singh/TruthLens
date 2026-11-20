// TruthLens PWA Service Worker + Web Share Target (v2.3.1)
const CACHE_NAME = 'truthlens-shell-v2.3.1';
const SHARE_CACHE = 'truthlens-share-data';
const CORE_ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== SHARE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname.endsWith('/share-target')) {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const mediaFile = formData.get('media');
          const sharedText =
            formData.get('text') ||
            formData.get('url') ||
            formData.get('title') ||
            '';

          const shareCache = await caches.open(SHARE_CACHE);

          if (mediaFile && mediaFile instanceof File) {
            await shareCache.put(
              '/_shared_file',
              new Response(mediaFile, {
                headers: {
                  'Content-Type': mediaFile.type || 'application/octet-stream',
                  'X-File-Name': encodeURIComponent(mediaFile.name || 'shared_media.jpg'),
                },
              })
            );
          }

          if (sharedText) {
            await shareCache.put(
              '/_shared_text',
              new Response(String(sharedText), {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
              })
            );
          }
        } catch (err) {
          console.error('[TruthLens SW] Share Target capture failed:', err);
        }

        return Response.redirect('/?shared=1&tab=detect', 303);
      })()
    );
    return;
  }

  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const match = await caches.match(event.request);
      if (match) return match;
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
