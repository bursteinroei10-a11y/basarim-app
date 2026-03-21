"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function AdminEnablePush() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

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
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await (reg as unknown as { ready: Promise<ServiceWorkerRegistration> }).ready;
      const res = await fetch("/api/admin/vapid-public");
      const { publicKey } = await res.json();
      if (!publicKey) {
        setLoading(false);
        return;
      }
      const base64 = publicKey.replace(/-/g, "+").replace(/_/g, "/");
      const keyBuf = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBuf,
      });
      await fetch("/api/admin/push-subscription", {
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
      setEnabled(true);
    } catch (err) {
      console.error(err);
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
