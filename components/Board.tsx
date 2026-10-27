"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STAGES,
  supabase,
  TABLE,
  type CandidateCard,
  type Outcome,
  type Stage,
} from "@/lib/supabase";
import {
  daysLabel,
  daysSince,
  formatMoney,
  isOverdue,
  outcomeLabel,
  toPaise,
} from "@/lib/format";
import { OutcomeDialog } from "./OutcomeDialog";

type StageNumbers = Record<Stage, number>;
type LogResult = { ok: true } | { ok: false; message: string };

function emptyNumbers(): StageNumbers {
  return { new: 0, screened: 0, submitted: 0, interview: 0, placed: 0 };
}

function ClockIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function Board({
  initialRows,
  renderedAt,
}: {
  initialRows: CandidateCard[];
  renderedAt: number;
}) {
  const [rows, setRows] = useState(initialRows);
  const [selected, setSelected] = useState<CandidateCard | null>(null);
  const [activeStage, setActiveStage] = useState<Stage>("new");
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(renderedAt);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const closeDialog = useCallback(() => setSelected(null), []);

  const currency = rows[0]?.currency ?? "INR";

  const totals = useMemo(() => {
    const next = emptyNumbers();
    for (const row of rows) next[row.stage] += toPaise(row.placement_value_paise);
    return next;
  }, [rows]);

  const counts = useMemo(() => {
    const next = emptyNumbers();
    for (const row of rows) next[row.stage] += 1;
    return next;
  }, [rows]);

  const grouped = useMemo(() => {
    const next: Record<Stage, CandidateCard[]> = {
      new: [],
      screened: [],
      submitted: [],
      interview: [],
      placed: [],
    };
    for (const row of rows) next[row.stage]?.push(row);
    for (const stage of Object.keys(next) as Stage[]) {
      next[stage].sort(
        (a, b) =>
          new Date(a.last_contact_at).getTime() -
          new Date(b.last_contact_at).getTime()
      );
    }
    return next;
  }, [rows]);

  const overdueCount = useMemo(
    () =>
      rows.filter((row) =>
        isOverdue(daysSince(row.last_contact_at, now))
      ).length,
    [rows, now]
  );

  const summaryLine =
    rows.length === 0
      ? "No live candidates on the board"
      : `${rows.length} live ${rows.length === 1 ? "candidate" : "candidates"} · ${
          overdueCount === 0
            ? "everyone is up to date"
            : `${overdueCount} ${overdueCount === 1 ? "needs" : "need"} a nudge`
        }`;

  async function handleLog(outcome: Outcome, note: string): Promise<LogResult> {
    if (!selected) return { ok: false, message: "No card selected." };

    const card = selected;
    const stamp = new Date().toISOString();
    const removal = outcome === "not interested";
    const nextStage: Stage =
      outcome === "interview booked" && card.stage !== "placed"
        ? "interview"
        : card.stage;

    const patch: Partial<CandidateCard> = {
      last_contact_at: stamp,
      last_outcome: outcome,
      last_note: note.trim() ? note.trim() : card.last_note,
      updated_at: stamp,
      ...(removal ? { archived_at: stamp } : { stage: nextStage }),
    };

    const previous = rows;
    setRows((current) =>
      removal
        ? current.filter((row) => row.id !== card.id)
        : current.map((row) =>
            row.id === card.id ? ({ ...row, ...patch } as CandidateCard) : row
          )
    );

    const { error } = await supabase()
      .from(TABLE)
      .update(patch)
      .eq("id", card.id);

    if (error) {
      setRows(previous);
      return { ok: false, message: error.message };
    }

    setSelected(null);

    if (removal) {
      setToast("Removed from the board — not interested");
    } else if (
      outcome === "interview booked" &&
      card.stage !== "placed" &&
      card.stage !== "interview"
    ) {
      setActiveStage("interview");
      setToast("Interview booked — moved to Interview");
    } else {
      setToast(`${outcomeLabel(outcome) ?? "Saved"} — last contact updated`);
    }

    return { ok: true };
  }

  return (
    <main className="shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">Candidate desk · live pipeline</p>
          <h1>The follow-up board</h1>
          <p className="lede">{summaryLine}</p>
        </div>
        <div className="rule-note">
          <span className="rule-dot" aria-hidden="true" />
          <span>
            <strong>3 days</strong> without contact turns a card red
          </span>
        </div>
      </header>

      <section className="summary" aria-label="Money by stage">
        {STAGES.map(({ key, label }) => (
          <div key={key} className={`summary-card stage-${key}`}>
            <span className="summary-label">{label}</span>
            <span className="summary-value">
              {formatMoney(totals[key], currency)}
            </span>
            <span className="summary-meta">
              {counts[key]} {counts[key] === 1 ? "candidate" : "candidates"}
            </span>
          </div>
        ))}
      </section>

      <div className="stage-tabs" role="group" aria-label="Choose a stage">
        {STAGES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`stage-tab${activeStage === key ? " is-active" : ""}`}
            aria-pressed={activeStage === key}
            onClick={() => setActiveStage(key)}
          >
            {label}
            <span className="stage-tab-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      <section className="board" aria-label="Candidates by stage">
        {STAGES.map(({ key, label }) => {
          const cards = grouped[key];
          return (
            <section
              key={key}
              className={`column stage-${key}${
                activeStage === key ? " is-active" : ""
              }`}
              aria-labelledby={`column-${key}`}
            >
              <header className="column-head">
                <div className="column-title">
                  <span className="stage-dot" aria-hidden="true" />
                  <h2 id={`column-${key}`}>{label}</h2>
                  <span className="column-count">{counts[key]}</span>
                </div>
                <span className="column-total">
                  {formatMoney(totals[key], currency)}
                </span>
              </header>

              <div className="cards">
                {cards.length === 0 ? (
                  <p className="column-empty">No candidates here.</p>
                ) : (
                  cards.map((card) => {
                    const days = daysSince(card.last_contact_at, now);
                    const overdue = isOverdue(days);
                    const last =
                      card.last_note?.trim() ||
                      outcomeLabel(card.last_outcome);

                    return (
                      <button
                        key={card.id}
                        type="button"
                        className={`card${overdue ? " card--overdue" : ""}`}
                        onClick={() => setSelected(card)}
                      >
                        <span className="card-top">
                          <span className="card-name">{card.person_name}</span>
                          {overdue ? (
                            <span className="overdue-badge">
                              <ClockIcon />
                              Overdue
                            </span>
                          ) : null}
                        </span>

                        <span className="card-role">
                          {card.role_title}
                          {card.client ? (
                            <>
                              <span className="dot"> · </span>
                              {card.client}
                            </>
                          ) : null}
                        </span>

                        {last ? (
                          <span className="card-last">
                            <strong>Last:</strong> {last}
                          </span>
                        ) : null}

                        <span className="card-foot">
                          <span>
                            <span className="card-stat-label">
                              Since contact
                            </span>
                            <span
                              className={`card-days${
                                overdue ? " card-days--risk" : ""
                              }`}
                            >
                              {daysLabel(days)}
                            </span>
                          </span>
                          <span>
                            <span className="card-stat-label">Placement</span>
                            <span className="card-money">
                              {formatMoney(
                                toPaise(card.placement_value_paise),
                                card.currency
                              )}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </section>

      <footer className="board-foot">
        <span>
          Click any card to log a call, a message, a refusal or an interview.
        </span>
        <span>
          <strong>{overdueCount}</strong> overdue · <strong>{rows.length}</strong>{" "}
          live
        </span>
      </footer>

      {selected ? (
        <OutcomeDialog
          card={selected}
          onClose={closeDialog}
          onLog={handleLog}
        />
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </main>
  );
}
