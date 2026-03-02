import webpush from "web-push";

const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(
    "mailto:admin@basarim.co.il",
    vapidPublic,
    vapidPrivate
  );
}

export function isPushConfigured() {
  return Boolean(vapidPublic && vapidPrivate);
}

export function getVapidPublicKey() {
  return vapidPublic ?? null;
}

export async function sendAdminPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; url?: string }
) {
  if (!vapidPrivate) return;
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify(payload),
      { TTL: 60 }
    );
  } catch (err) {
    console.error("Push send error:", err);
  }
}
