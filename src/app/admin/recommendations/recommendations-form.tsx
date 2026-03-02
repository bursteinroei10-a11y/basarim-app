"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FriendRecommendation {
  id: string;
  name: string;
  imageUrl: string;
  quote: string;
  sortOrder: number;
}

interface RecommendationsFormProps {
  items: FriendRecommendation[];
}

export function RecommendationsForm({ items }: RecommendationsFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [quote, setQuote] = useState("");
  const [sortOrder, setSortOrder] = useState(items.length);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<FriendRecommendation | null>(null);

  const resetForm = () => {
    setName("");
    setImageUrl("");
    setQuote("");
    setSortOrder(items.length);
    setEditing(null);
  };

  const startEdit = (item: FriendRecommendation) => {
    setEditing(item);
    setName(item.name);
    setImageUrl(item.imageUrl);
    setQuote(item.quote);
    setSortOrder(item.sortOrder);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { name: name.trim(), imageUrl: imageUrl.trim(), quote: quote.trim(), sortOrder };
      if (editing) {
        const res = await fetch(`/api/admin/recommendations/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          resetForm();
          router.refresh();
        }
      } else {
        const res = await fetch("/api/admin/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          resetForm();
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק את ההמלצה?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/recommendations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        resetForm();
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-xl border bg-white p-6"
      >
        <h2 className="font-medium">
          {editing ? "עריכת המלצה" : "הוספת המלצה"}
        </h2>
        <div>
          <Label htmlFor="name">שם</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="דני כהן"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="imageUrl">כתובת תמונה (URL)</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="quote">ציטוט</Label>
          <textarea
            id="quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="הבשר הכי טרי..."
            className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <Label htmlFor="sortOrder">סדר תצוגה</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            className="mt-1"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "שומר..." : editing ? "עדכן" : "הוסף"}
          </Button>
          {editing && (
            <Button type="button" variant="outline" onClick={resetForm}>
              ביטול
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 font-medium">ההמלצות הקיימות</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">אין המלצות עדיין.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    &quot;{item.quote}&quot;
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(item)}
                  >
                    ערוך
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={loading}
                  >
                    מחק
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
