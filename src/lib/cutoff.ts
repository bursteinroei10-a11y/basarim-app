import { addDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const TZ = "Asia/Jerusalem";

export interface CutoffRule {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  hour: number;
  minute: number;
  timezone: string;
}

/**
 * Get the next cutoff datetime (nearest occurrence of dayOfWeek at hour:minute in timezone).
 */
export function getNextCutoff(rule: CutoffRule, from?: Date): Date {
  const now = from ?? new Date();
  const tz = rule.timezone || TZ;
  const nowInTz = toZonedTime(now, tz);

  const y = nowInTz.getFullYear();
  const m = nowInTz.getMonth();
  const d = nowInTz.getDate();
  const currentDow = nowInTz.getDay();
  const currentHour = nowInTz.getHours();
  const currentMin = nowInTz.getMinutes();

  let daysToAdd = (rule.dayOfWeek - currentDow + 7) % 7;
  const sameDay = daysToAdd === 0;
  const alreadyPassed =
    sameDay &&
    (currentHour > rule.hour || (currentHour === rule.hour && currentMin >= rule.minute));
  if (alreadyPassed) daysToAdd = 7;

  const targetDate = addDays(new Date(y, m, d), daysToAdd);
  const targetLocal = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
    rule.hour,
    rule.minute,
    0
  );
  return fromZonedTime(targetLocal, tz);
}

/**
 * Check if we're past the given cutoff (locked = orders closed for this period).
 */
export function isPastCutoff(cutoffAt: Date, now?: Date): boolean {
  const n = now ?? new Date();
  return n >= cutoffAt;
}

/**
 * Get the cutoff datetime for the batch an order belongs to.
 * Used to group orders by "big order" (weekly delivery batch).
 */
export function getOrderBatchCutoffAt(rule: CutoffRule, orderCreatedAt: Date): Date {
  return getNextCutoff(rule, orderCreatedAt);
}
