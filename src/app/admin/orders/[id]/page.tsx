import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderStatusForm } from "./order-status-form";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  RECEIVED: "התקבל",
  AWAITING_PAYMENT: "ממתין לתשלום",
  PAID: "שולם",
  DELIVERED: "נמסר",
};

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { include: { profile: true } },
      items: { include: { meatProduct: true } },
    },
  });

  if (!order) notFound();

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
          <OrderStatusForm orderId={order.id} currentStatus={order.status} />
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
      </div>
    </div>
  );
}
