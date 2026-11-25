// Echo client notifications. Receives pushes from /api/notify and opens the
// client's dashboard when a notification is tapped.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Echo", body: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Echo", {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      // Android draws the status-bar badge from the alpha channel only: it must be
      // a white shape on transparency, or it shows as a plain white square.
      badge: "/icons/badge-96.png",
      dir: data.dir || "auto",
      lang: data.lang || "ar",
      tag: data.tag,
      data: { url: data.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/dashboard", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Reuse an open tab of the site if there is one.
      for (const w of windows) {
        if (w.url.startsWith(self.location.origin) && "focus" in w) {
          w.navigate(url);
          return w.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
