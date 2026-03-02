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

const STATUS_OPTIONS = [
  { value: "PENDING", label: "ממתין" },
  { value: "RECEIVED", label: "התקבל" },
  { value: "AWAITING_PAYMENT", label: "ממתין לתשלום" },
  { value: "PAID", label: "שולם" },
  { value: "DELIVERED", label: "נמסר" },
];

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setStatus(newStatus);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        router.refresh();
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
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">שינוי סטטוס:</span>
      <Select
        value={status}
        onValueChange={handleChange}
        disabled={loading}
      >
        <SelectTrigger className="min-w-[160px] cursor-pointer">
          <SelectValue placeholder="בחר סטטוס" />
        </SelectTrigger>
        <SelectContent position="popper" className="z-[100]">
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="cursor-pointer text-right"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && <span className="text-xs text-muted-foreground">מעדכן...</span>}
    </div>
  );
}
