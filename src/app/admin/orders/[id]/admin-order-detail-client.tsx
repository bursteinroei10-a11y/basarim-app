"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { OrderStatusForm } from "./order-status-form";
import { AdminOrderDeleteButton } from "@/components/admin-order-delete-button";
import { AdminOrderEditForm } from "@/components/admin-order-edit-form";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  RECEIVED: "התקבל",
  AWAITING_PAYMENT: "ממתין לתשלום",
  PAID: "שולם",
  DELIVERED: "נמסר",
};

type OrderData = {
  order: {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    lastEditedBy: string | null;
    lastEditedAt: string | null;
    user: {
      email: string;
      profile: { name: string; phone: string | null } | null;
    };
    items: {
      id: string;
      quantityKg: number;
      unitPrice: number;
      lineTotal: number;
      meatProduct: { id: string; nameHe: string; pricePerKg: number };
    }[];
  };
  products: {
    id: string;
    nameHe: string;
    pricePerKg: number;
    category: { nameHe: string };
  }[];
};

export function AdminOrderDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/admin/api/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("הזמנה לא נמצאה");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "שגיאה"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        טוען...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-8">
        <h2 className="text-xl font-semibold text-amber-900">שגיאה בטעינת ההזמנה</h2>
        <p className="text-sm text-amber-800">{error ?? "הזמנה לא נמצאה"}</p>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            נסה שוב
          </button>
          <Link
            href="/admin"
            className="rounded-lg border border-amber-600 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            חזרה להזמנות
          </Link>
        </div>
      </div>
    );
  }

  const { order, products } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← חזרה להזמנות
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">הזמנה #{order.id.slice(-6)}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("he-IL", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
            <AdminOrderDeleteButton orderId={order.id} variant="detail" />
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">לקוח</h3>
            <p className="font-medium">{order.user.profile?.name ?? "—"}</p>
            <p className="text-sm">{order.user.email}</p>
            {order.user.profile?.phone && (
              <p className="text-sm">{order.user.profile.phone}</p>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">סטטוס</h3>
            <Badge variant="secondary" className="text-base">
              {STATUS_LABELS[order.status] ?? order.status}
            </Badge>
          </div>
        </div>

        <h3 className="mb-3 font-medium">פריטים</h3>
        <table className="w-full text-right text-sm">
          <thead className="border-b">
            <tr>
              <th className="pb-2">מוצר</th>
              <th className="pb-2">כמות</th>
              <th className="pb-2">מחיר</th>
              <th className="pb-2">סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">{item.meatProduct.nameHe}</td>
                <td className="py-3">{item.quantityKg} ק״ג</td>
                <td className="py-3">₪{item.unitPrice}</td>
                <td className="py-3">₪{item.lineTotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-lg font-bold">סה״כ: ₪{order.totalAmount.toLocaleString()}</p>

        {order.lastEditedAt && (
          <p className="mt-3 text-sm text-muted-foreground">
            עדכון אחרון: {order.lastEditedBy === "admin" ? "מנהל" : "לקוח"} •{" "}
            {new Date(order.lastEditedAt).toLocaleDateString("he-IL", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}

        <AdminOrderEditForm
          orderId={order.id}
          initialItems={order.items.map((i) => ({
            meatProduct: i.meatProduct,
            quantityKg: i.quantityKg,
          }))}
          canEdit={order.status !== "DELIVERED"}
          products={products}
        />
      </div>
    </div>
  );
}
