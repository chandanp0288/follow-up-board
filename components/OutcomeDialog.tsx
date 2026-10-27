"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { CandidateCard, Outcome } from "@/lib/supabase";
import {
  daysLabel,
  daysSince,
  formatMoney,
  isOverdue,
  stageLabel,
  toPaise,
} from "@/lib/format";

type LogResult = { ok: true } | { ok: false; message: string };

const OUTCOMES: { key: Outcome; label: string; tone?: "primary" | "danger" }[] =
  [
    { key: "called", label: "Called" },
    { key: "left message", label: "Left message" },
    { key: "interview booked", label: "Interview booked", tone: "primary" },
    { key: "not interested", label: "Not interested", tone: "danger" },
  ];

function hintFor(outcome: Outcome, card: CandidateCard): string {
  if (outcome === "called") return "Spoke to them; keep the stage";
  if (outcome === "left message") return "No answer; keep the stage";
  if (outcome === "interview booked") {
    return card.stage === "placed"
      ? "Already placed; just log contact"
      : "Move to Interview";
  }
  return "Remove from the board";
}

export function OutcomeDialog({
  card,
  onClose,
  onLog,
}: {
  card: CandidateCard;
  onClose: () => void;
  onLog: (outcome: Outcome, note: string) => Promise<LogResult>;
}) {
  const [busy, setBusy] = useState<Outcome | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    busyRef.current = busy !== null;
  }, [busy]);

  useEffect(() => {
    firstButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function keepFocusInside(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), textarea:not([disabled])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function choose(outcome: Outcome) {
    if (busy) return;
    setBusy(outcome);
    setError(null);
    const result = await onLog(outcome, note);
    if (!result.ok) {
      setError(result.message || "Could not save. Try again.");
      setBusy(null);
    }
  }

  const days = daysSince(card.last_contact_at);
  const overdue = isOverdue(days);
  const busyNow = busy !== null;

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busyNow) onClose();
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="outcome-title"
        aria-busy={busyNow}
        ref={panelRef}
        onKeyDown={keepFocusInside}
      >
        <div className="dialog-head">
          <div>
            <p className="eyebrow">Log what happened</p>
            <h2 id="outcome-title">{card.person_name}</h2>
            <p className="dialog-sub">
              {card.role_title}
              {card.client ? ` · ${card.client}` : ""}
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={busyNow}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="dialog-facts">
          <div>
            <span>Stage</span>
            <strong>{stageLabel(card.stage)}</strong>
          </div>
          <div>
            <span>Last contact</span>
            <strong className={overdue ? "is-risk" : undefined}>
              {daysLabel(days)}
            </strong>
          </div>
          <div>
            <span>Placement</span>
            <strong>
              {formatMoney(
                toPaise(card.placement_value_paise),
                card.currency
              )}
            </strong>
          </div>
        </div>

        <label className="note-field">
          <span>
            Note <em>optional</em>
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            maxLength={500}
            disabled={busyNow}
            placeholder="What was said, or what happens next?"
          />
        </label>

        <div className="outcome-grid">
          {OUTCOMES.map(({ key, label, tone }, index) => (
            <button
              key={key}
              ref={index === 0 ? firstButtonRef : undefined}
              type="button"
              className={`outcome-card${tone ? ` outcome-card--${tone}` : ""}`}
              disabled={busyNow}
              onClick={() => choose(key)}
            >
              <span className="outcome-label">
                {busy === key ? "Saving…" : label}
              </span>
              <span className="outcome-hint">{hintFor(key, card)}</span>
            </button>
          ))}
        </div>

        {error ? (
          <p className="dialog-error" role="alert">
            Could not save: {error}
          </p>
        ) : null}

        <p className="dialog-note">
          The card moves and the column totals update the moment you choose.
        </p>
      </div>
    </div>
  );
}
