import { prisma } from "@/lib/db";
import { CutoffForm } from "./cutoff-form";
import { getNextCutoff } from "@/lib/cutoff";

export const dynamic = "force-dynamic";

const DAYS: Record<number, string> = {
  0: "ראשון",
  1: "שני",
  2: "שלישי",
  3: "רביעי",
  4: "חמישי",
  5: "שישי",
  6: "שבת",
};

export default async function AdminCutoffPage() {
  const rules = await prisma.orderCutoff.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const activeRule = rules[0] ?? null;
  const nextCutoffAt = activeRule
    ? getNextCutoff({
        dayOfWeek: activeRule.dayOfWeek,
        hour: activeRule.hour,
        minute: activeRule.minute,
        timezone: activeRule.timezone,
      })
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">הגדרת סגירת הזמנות</h1>
      <p className="text-muted-foreground">
        קבע סגירה חוזרת (למשל: כל יום שלישי 09:00). עד השעה הזו לקוחות יכולים לערוך ההזמנות.
      </p>

      {activeRule && nextCutoffAt && (
        <div className="rounded-xl border bg-white p-4 max-w-md">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">סגירה הבאה (ניתן לערוך עד מועד זה)</h2>
          <p className="text-lg font-semibold" dir="ltr">
            {nextCutoffAt.toLocaleString("he-IL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}

      <CutoffForm />

      {rules.length > 0 && (
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-4 font-medium">הגדרות סגירה (האחרונה פעילה)</h2>
          <ul className="space-y-2 text-sm">
            {rules.map((c) => (
              <li key={c.id}>
                כל יום {DAYS[c.dayOfWeek]} בשעה {String(c.hour).padStart(2, "0")}:
                {String(c.minute).padStart(2, "0")}
                {c.label && <span className="mr-2 text-muted-foreground">({c.label})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
