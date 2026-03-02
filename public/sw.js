self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? "הזמנה חדשה";
  const options = {
    body: data.body ?? "",
    data: { url: data.url ?? "/admin" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/admin";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      if (list[0]) list[0].navigate(url).then((c) => c?.focus());
      else if (clients.openWindow) clients.openWindow(url);
    })
  );
});
