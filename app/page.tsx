import { Board } from "@/components/Board";
import { ConfigError, EmptyState, LoadError } from "@/components/States";
import {
  missingSettings,
  supabase,
  TABLE,
  type CandidateCard,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Page() {
  const missing = missingSettings();
  if (missing.length > 0) {
    return <ConfigError missing={missing} />;
  }

  try {
    const { data, error } = await supabase()
      .from(TABLE)
      .select("*")
      .is("archived_at", null)
      .order("last_contact_at", { ascending: true });

    if (error) {
      return <LoadError message={error.message} code={error.code} />;
    }

    const rows = (data ?? []) as CandidateCard[];
    if (rows.length === 0) {
      return <EmptyState />;
    }

    const renderedAt = Date.now();
    return <Board initialRows={rows} renderedAt={renderedAt} />;
  } catch (err) {
    return (
      <LoadError message={err instanceof Error ? err.message : String(err)} />
    );
  }
}
