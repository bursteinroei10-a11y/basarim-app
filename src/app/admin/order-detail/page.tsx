"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import Link from "next/link";
import { AdminOrderDetailClient } from "@/components/admin-order-detail-client";

/**
 * Order detail at /admin/order-detail?id=xxx
 * Uses query param instead of dynamic segment to avoid Vercel server-side errors
 * with /admin/orders/[id].
 */
function OrderDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    if (!id) {
      router.replace("/admin");
    }
  }, [id, router]);

  if (!id) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        טוען...
      </div>
    );
  }

  return <AdminOrderDetailClient orderId={id} />;
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">טוען...</div>}>
      <OrderDetailContent />
    </Suspense>
  );
}
