"use client";

import { useEffect, useState } from "react";
import { Board } from "./Board";
import { ConfigError, EmptyState, LoadError, LoadingState } from "./States";
import {
  missingSettings,
  supabase,
  TABLE,
  type CandidateCard,
} from "@/lib/supabase";

type View =
  | { kind: "loading" }
  | { kind: "ready"; rows: CandidateCard[]; renderedAt: number }
  | { kind: "empty" }
  | { kind: "error"; message: string; code?: string }
  | { kind: "config"; missing: string[] };

export function BoardLoader() {
  const [view, setView] = useState<View>({ kind: "loading" });

  useEffect(() => {
    const missing = missingSettings();
    if (missing.length > 0) {
      setView({ kind: "config", missing });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase()
          .from(TABLE)
          .select("*")
          .is("archived_at", null)
          .order("last_contact_at", { ascending: true });

        if (cancelled) return;

        if (error) {
          setView({ kind: "error", message: error.message, code: error.code });
          return;
        }

        const rows = (data ?? []) as CandidateCard[];
        setView(
          rows.length === 0
            ? { kind: "empty" }
            : { kind: "ready", rows, renderedAt: Date.now() }
        );
      } catch (err) {
        if (!cancelled) {
          setView({
            kind: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (view.kind === "config") return <ConfigError missing={view.missing} />;
  if (view.kind === "error") {
    return <LoadError message={view.message} code={view.code} />;
  }
  if (view.kind === "empty") return <EmptyState />;
  if (view.kind === "ready") {
    return <Board initialRows={view.rows} renderedAt={view.renderedAt} />;
  }
  return <LoadingState />;
}
