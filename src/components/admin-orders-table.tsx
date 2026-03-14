"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AdminOrderDeleteButton } from "@/components/admin-order-delete-button";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "ממתין" },
  { value: "RECEIVED", label: "התקבל" },
  { value: "AWAITING_PAYMENT", label: "ממתין לתשלום" },
  { value: "PAID", label: "שולם" },
  { value: "DELIVERED", label: "נמסר" },
];

type OrderRow = {
  id: string;
  status: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  itemsSummary: string;
  totalAmount: number;
};

interface AdminOrdersTableProps {
  orders: OrderRow[];
}

function OrderStatusCell({
  orderId,
  currentStatus,
  onUpdated,
}: {
  orderId: string;
  currentStatus: string;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setStatus(newStatus);
    setLoading(true);
    try {
      const res = await fetch(`/admin/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onUpdated();
      } else {
        setStatus(currentStatus);
      }
    } catch {
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()} className="cursor-default">
      <Select
        value={status}
        onValueChange={handleChange}
        disabled={loading}
      >
        <SelectTrigger className="h-8 min-w-[140px] cursor-pointer">
          <SelectValue placeholder="בחר סטטוס" />
        </SelectTrigger>
        <SelectContent position="popper" className="z-[100]">
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="cursor-pointer text-right">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && <span className="ml-1 text-xs text-muted-foreground">...</span>}
    </div>
  );
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  const router = useRouter();

  const handleRowClick = (orderId: string) => {
    router.push(`/admin/orders/${orderId}`);
  };

  const handleStatusUpdated = () => {
    router.refresh();
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center text-muted-foreground">
        אין הזמנות
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3">תאריך</th>
            <th className="p-3">לקוח</th>
            <th className="p-3">פריטים</th>
            <th className="p-3">סטטוס</th>
            <th className="p-3">סכום</th>
            <th className="p-3 w-16">מחיקה</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => handleRowClick(order.id)}
              className="cursor-pointer border-t hover:bg-muted/30 transition-colors"
            >
              <td className="p-3">
                {new Date(order.createdAt).toLocaleDateString("he-IL")}
              </td>
              <td className="p-3">
                <span className="font-medium">{order.customerName}</span>
                <span className="block text-xs text-muted-foreground">{order.customerEmail}</span>
              </td>
              <td className="p-3 max-w-[220px] text-muted-foreground">
                {order.itemsSummary}
              </td>
              <td className="p-3">
                <OrderStatusCell
                  orderId={order.id}
                  currentStatus={order.status}
                  onUpdated={handleStatusUpdated}
                />
              </td>
              <td className="p-3 font-medium">
                ₪{order.totalAmount.toLocaleString()}
              </td>
              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                <AdminOrderDeleteButton orderId={order.id} variant="row" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
