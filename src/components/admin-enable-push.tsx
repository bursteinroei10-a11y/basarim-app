"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function AdminEnablePush() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window
    );
  }, []);

  const handleEnable = async () => {
    if (!supported) return;
    setLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await (reg as unknown as { ready: Promise<ServiceWorkerRegistration> }).ready;

      const vapidRes = await fetch("/api/admin/vapid-public");
      const vapidData = await vapidRes.json();
      if (!vapidRes.ok || !vapidData.publicKey) {
        setError("מפתחות VAPID לא הוגדרו. הוסף VAPID_PUBLIC_KEY ו-VAPID_PRIVATE_KEY ב-Vercel.");
        return;
      }
      const publicKey = vapidData.publicKey;

      const base64 = publicKey.replace(/-/g, "+").replace(/_/g, "/");
      const keyBuf = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBuf,
      });

      const saveRes = await fetch("/api/admin/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
          },
        }),
      });

      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({}));
        setError(errData?.error ?? "שגיאה בשמירת ההרשאה. נסו שוב.");
        return;
      }
      setEnabled(true);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("Permission") || msg.includes("denied")
        ? "התראות בוטלו. נסו שוב ואשרו כשהדפדפן מבקש."
        : "שגיאה. וודא ש־VAPID מוגדרים ב-Vercel ועשו Redeploy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="mb-2 text-sm font-medium">התראות על הזמנות חדשות</p>
      {enabled ? (
        <p className="text-sm text-green-600">התראות מופעלות</p>
      ) : supported ? (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            קבלו התראה בדפדפן בכל הזמנה חדשה.
          </p>
          {error && (
            <p className="mb-2 text-xs text-red-600">{error}</p>
          )}
          <Button size="sm" onClick={handleEnable} disabled={loading}>
            {loading ? "מפעיל..." : "הפעל התראות"}
          </Button>
        </>
      ) : (
        <p className="text-xs text-amber-700">
          באייפון: הוסיפו את האתר למסך הבית (Share → Add to Home Screen) ופתחו משם. באנדרואיד: השתמשו ב-Chrome.
        </p>
      )}
    </div>
  );
}
