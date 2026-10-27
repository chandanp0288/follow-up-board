import type { Outcome, Stage } from "./supabase";

export const STALE_AFTER_DAYS = 3;

export function toPaise(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(
  paise: number,
  currency: string = "INR"
): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(paise / 100);
  } catch {
    return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
  }
}

/** Whole elapsed days since the ISO timestamp. Stable on server and client. */
export function daysSince(iso: string, now: number = Date.now()): number {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 0;
  return Math.max(0, Math.floor((now - then) / 86_400_000));
}

export function isOverdue(days: number): boolean {
  return days >= STALE_AFTER_DAYS;
}

export function daysLabel(days: number): string {
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

const STAGE_LABELS: Record<Stage, string> = {
  new: "New",
  screened: "Screened",
  submitted: "Submitted",
  interview: "Interview",
  placed: "Placed",
};

const OUTCOME_LABELS: Record<Outcome, string> = {
  called: "Called",
  "left message": "Left message",
  "not interested": "Not interested",
  "interview booked": "Interview booked",
};

export function stageLabel(stage: Stage): string {
  return STAGE_LABELS[stage] ?? "New";
}

export function outcomeLabel(outcome: Outcome | null): string | null {
  return outcome ? OUTCOME_LABELS[outcome] ?? outcome : null;
}
