const CACHE_NAME = "revTask-cache-v1";
const ASSETS_TO_CACHE = ["/", "/favicon.ico", "/manifest.json", "/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => caches.match("/offline"))
      );
    }),
  );
});

// Push event listener
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  console.log(data);
  const title = data.title || "RevTask Notification";
  const options = {
    image: data.image || "/web-app-manifest-512x512.png",
    body: data.body || "You have a new notification",
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png",
    data: data.data,
    tag: data.tag || "default",
    actions: data.actions,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  const promiseChain = self.clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      const matchingClient = windowClients.find((client) => {
        return client.url === urlToOpen;
      });

      if (matchingClient) {
        return matchingClient.focus();
      }
      return self.clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
});
