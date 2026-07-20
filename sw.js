// Service worker: the receiving end of the Web Push doorbell.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = { title: "Voice", body: "Your reply is ready." };
  try { data = { ...data, ...event.data.json() }; } catch { /* keep defaults */ }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "./icon.svg",
      tag: "voice-turn", // collapse repeats
      data: { url: "./" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const scopeUrl = self.registration.scope;
    for (const w of wins) {
      if (w.url.startsWith(scopeUrl)) { await w.focus(); return; }
    }
    await self.clients.openWindow(scopeUrl);
  })());
});
