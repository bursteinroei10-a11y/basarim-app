"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AdminOrderDeleteButtonProps {
  orderId: string;
  variant?: "detail" | "row";
}

export function AdminOrderDeleteButton({ orderId, variant = "detail" }: AdminOrderDeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    if (variant === "detail" && !confirm) {
      setConfirm(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "שגיאה במחיקה");
      }
    } catch {
      alert("שגיאה במחיקה");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm("למחוק את ההזמנה? לא ניתן לשחזר.")) {
            handleDelete();
          }
        }}
        disabled={loading}
        className="text-destructive hover:underline text-xs disabled:opacity-50"
      >
        {loading ? "..." : "מחיקה"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {confirm ? (
        <>
          <span className="text-sm text-muted-foreground">למחוק? לא ניתן לשחזר.</span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "..." : "מחיקה"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirm(false)}
            disabled={loading}
          >
            ביטול
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/50 hover:bg-destructive/10"
          onClick={() => setConfirm(true)}
        >
          מחק הזמנה
        </Button>
      )}
    </div>
  );
}
