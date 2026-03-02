"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DAYS = [
  { value: 0, label: "ראשון" },
  { value: 1, label: "שני" },
  { value: 2, label: "שלישי" },
  { value: 3, label: "רביעי" },
  { value: 4, label: "חמישי" },
  { value: 5, label: "שישי" },
  { value: 6, label: "שבת" },
];

export function CutoffForm() {
  const router = useRouter();
  const [dayOfWeek, setDayOfWeek] = useState(2);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/cutoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek,
          hour,
          minute,
          timezone: "Asia/Jerusalem",
          label: label.trim() || undefined,
        }),
      });
      if (res.ok) {
        setLabel("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-xl border bg-white p-6">
      <div>
        <Label>יום בשבוע</Label>
        <select
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          {DAYS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hour">שעה (0-23)</Label>
          <Input
            id="hour"
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => setHour(parseInt(e.target.value, 10) || 0)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="minute">דקות (0-59)</Label>
          <Input
            id="minute"
            type="number"
            min={0}
            max={59}
            value={minute}
            onChange={(e) => setMinute(parseInt(e.target.value, 10) || 0)}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="label">תווית (אופציונלי)</Label>
        <Input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="למשל: הזמנות שבועיות"
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "שומר..." : "הגדר סגירה חוזרת"}
      </Button>
    </form>
  );
}
