"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { OrderStatusForm } from "@/components/order-status-form";
import { AdminOrderDeleteButton } from "@/components/admin-order-delete-button";
import { AdminOrderEditForm } from "@/components/admin-order-edit-form";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  RECEIVED: "התקבל",
  AWAITING_PAYMENT: "ממתין לתשלום",
  PAID: "שולם",
  DELIVERED: "נמסר",
};

export type OrderForView = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
  lastEditedBy?: string | null;
  lastEditedAt?: Date | string | null;
  user: {
    email: string;
    profile?: { name?: string; phone?: string | null } | null;
  };
  items: {
    id: string;
    quantityKg: number;
    unitPrice: number;
    lineTotal: number;
    meatProduct: { id: string; nameHe: string; pricePerKg: number };
  }[];
};

export type ProductForView = {
  id: string;
  nameHe: string;
  pricePerKg: number;
  category?: { nameHe: string } | null;
};

interface AdminOrderDetailViewProps {
  order: OrderForView;
  products: ProductForView[];
}

export function AdminOrderDetailView({ order, products }: AdminOrderDetailViewProps) {
  const createdAt = typeof order.createdAt === "string" ? order.createdAt : order.createdAt.toISOString();
  const lastEditedAt = order.lastEditedAt
    ? typeof order.lastEditedAt === "string"
      ? order.lastEditedAt
      : (order.lastEditedAt as Date).toISOString()
    : null;

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
              {new Date(createdAt).toLocaleDateString("he-IL", {
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
            <p className="font-medium">{order.user?.profile?.name ?? "—"}</p>
            <p className="text-sm">{order.user?.email ?? "—"}</p>
            {order.user?.profile?.phone && (
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
            {(order.items ?? []).map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-3">{item.meatProduct?.nameHe ?? "—"}</td>
                <td className="py-3">{item.quantityKg} ק״ג</td>
                <td className="py-3">₪{item.unitPrice}</td>
                <td className="py-3">₪{item.lineTotal?.toLocaleString() ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-lg font-bold">סה״כ: ₪{order.totalAmount?.toLocaleString() ?? "0"}</p>

        {lastEditedAt && (
          <p className="mt-3 text-sm text-muted-foreground">
            עדכון אחרון: {order.lastEditedBy === "admin" ? "מנהל" : "לקוח"} •{" "}
            {new Date(lastEditedAt).toLocaleDateString("he-IL", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}

        <AdminOrderEditForm
          orderId={order.id}
          initialItems={(order.items ?? [])
            .filter((i): i is typeof i & { meatProduct: NonNullable<typeof i.meatProduct> } => !!i?.meatProduct)
            .map((i) => ({ meatProduct: i.meatProduct, quantityKg: i.quantityKg }))}
          canEdit={order.status !== "DELIVERED"}
          products={(products ?? []).map((p) => ({ ...p, category: p.category ?? undefined }))}
        />
      </div>
    </div>
  );
}
