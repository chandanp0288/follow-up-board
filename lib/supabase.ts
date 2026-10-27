import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const TABLE = "candidate_cards";

export type Stage = "new" | "screened" | "submitted" | "interview" | "placed";

export type Outcome =
  | "called"
  | "left message"
  | "not interested"
  | "interview booked";

export interface CandidateCard {
  id: string;
  created_at: string;
  updated_at: string;
  person_name: string;
  role_title: string;
  client: string;
  stage: Stage;
  placement_value_paise: number | string;
  currency: string;
  last_contact_at: string;
  last_outcome: Outcome | null;
  last_note: string | null;
  archived_at: string | null;
}

export const STAGES: { key: Stage; label: string; short: string }[] = [
  { key: "new", label: "New", short: "New" },
  { key: "screened", label: "Screened", short: "Screened" },
  { key: "submitted", label: "Submitted", short: "Submitted" },
  { key: "interview", label: "Interview", short: "Interview" },
  { key: "placed", label: "Placed", short: "Placed" },
];

/** Names of the settings that are missing, for the "setup incomplete" screen. */
export function missingSettings(): string[] {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_PUBLISHABLE_KEY) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  return missing;
}

let cached: SupabaseClient | null = null;

/**
 * Browser-safe Supabase client. The publishable key is public by design; the
 * table's Row Level Security policies decide what it may read or change.
 */
export function supabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase settings are missing");
  }
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
