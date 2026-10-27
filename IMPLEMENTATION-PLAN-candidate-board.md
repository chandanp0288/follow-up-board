# IMPLEMENTATION-PLAN — Candidate Follow-Up Board

**Answers one question: in what order, and what is demonstrable at each step.**
**Inputs: `PRD-candidate-board.md`, `TECH-STACK-candidate-board.md`, and one number — 50 users.**
**Status: DRAFT for tonight. It inherits the PRD's open questions; the defaults used when an answer is missing are named in §3.**

---

## 0. The rule this plan obeys

**Every numbered step ends with something you can open on a phone and look at.** Not "the schema is migrated". Not "the action is wired". A URL, a screen, a card moving, a total changing.

A step is done only when all five of these are true:

- [ ] The screen is reachable at a URL (a Vercel preview, the live URL, or a LAN address from `npm run dev -- --hostname 0.0.0.0`).
- [ ] It opens at **375 px** without sideways scrolling, and at **1440 px** as a desk board.
- [ ] The **test written into that step** has run, and its real output is in `WORKLOG.md`.
- [ ] For a UI step, a screenshot at 375 and 1440 has been **looked at**, not just captured.
- [ ] No test was skipped, deleted or weakened to make the step pass.

"Built" without "tested" is not done. A step with a failing test stays open; the next step does not start on top of it. If a dependency is missing, the step is marked `BLOCKED` with the exact command and error, and the next step that does not depend on it proceeds.

Estimates are **agent minutes**, not calendar time, and assume the decision at that step has been answered. Add 20% for the unexpected.

---

## 1. The order at a glance

| # | What is on the screen at the end | Minutes | Phase |
|---|---|---|---|
| 1 | A five-column board with cards, days and per-column totals — static data, no saving — at 375 and 1440 | 45 | A |
| 2 | The same board, now from the real schema, behind a sign-in, on your phone | 75 | A |
| 3 | Tap a card, log "interview booked", watch the card move and two totals change | 70 | B |
| 4 | An overdue card is red **and** says "3d overdue"; a 2-day card is not | 25 | B |
| 5 | The real working set is on the board, and an empty board is a calm, real screen | 45 | B |
| 6 | Phone and desk screenshots you would show a client; keyboard and tap targets work | 30 | C |
| 7 | The live URL on your phone, signed in, with one real outcome logged | 40 | C |
| 8 | Two devices show the same total after one logs an outcome (optional) | 35 | C |

**Total: 365 minutes, about 6 hours, plus buffer.** Phase A is 120 minutes, Phase B is 140, Phase C is 105.

**Why this order:**

- **Step 1 proves the screen before anything is wired.** The expensive UI decisions — five columns, the totals strip, what a card shows, and what a phone does with five columns — are visible in 45 minutes. Only the data source is thrown away.
- **Step 2 proves the data model and the access model before any business logic.** The card identity, tenancy, money type and auth all land here. A mistake found here costs two seed files. The same mistake found at Step 5 costs the client's real list.
- **Step 3 proves the one loop the product exists for.** If the outcome-to-stage mapping is wrong, it is wrong before real data and before polish. It is also the step where the PRD's missing path into "Placed" (Q14) becomes visible.
- **Step 4 adds the second signal** — red — only after the loop works.
- **Step 5 adds volume.** The import is deliberately after the loop so a wrong data model is caught on 18 rows, not 150.
- **Steps 6–8 are polish and production.** They are the first things dropped.

---

## 2. Decisions most expensive to reverse, and where they happen

These are ordered by what it would cost to undo them, not by when they occur. Every one is made **before** the thing built on top of it.

| Decision | Where | Why it must be then | If it is answered late |
|---|---|---|---|
| **What a card is** — one person, or one person per role (PRD Q4) | **Step 2**, before `0001_init.sql` | Every query, total, and red rule is written against the card's identity | A second central table, a backfill of every card, and a rewrite of every total. The `people` + `cards` split in the tech stack makes the *table* change a migration; the *meaning* still has to be backfilled |
| **Tenancy and auth** — one shared desk, or 50 desks; who may see money (Q8) | **Step 2**, before the first RLS policy | `desk_id` and the policy are in every read and write | Every query and every policy changes. This is why `desk_id` exists in Step 2 even though there is one desk |
| **Money representation** — integer minor units, one currency (Q5, Q13) | **Step 2**, before the first value is stored | A float total is wrong eventually, and stored values have to be converted | Every amount, total, formatter and test. The column type is cheap now and a data migration later |
| **The stage vocabulary** — five values, text + check | **Step 2**, before seed and import | Stage is the column a card lives in and the grouping key for every total | Adding a sixth value is cheap; changing what an existing value *means* is a data and reporting rewrite |
| **The phone interaction model** — five columns become stage tabs at 375 | **Step 1**, before the board component is finished | The harness rule forbids sideways scrolling; a five-column board cannot shrink to 375 | The board component is rebuilt, and every layout test is redone |
| **Outcome → stage mapping** — attempts do not move; "interview booked" does (Q2) | **Step 3**, in one function | The totals are only true if the mapping is true; every logged event depends on it | Every historical event has to be interpreted against a new rule, and totals are re-explained to the client |
| **Where a refusal goes** — archive, keep the event (Q3) | **Step 3**, before the first "not interested" | Deleting a person is irreversible; archiving is not | Adding a visible column later is additive. Recovering deleted rows is not |
| **How a card reaches "Placed"** (Q14) | **Step 3**, before the loop is called complete | None of the four outcomes moves a card to Placed; the column is otherwise unreachable from the UI | A fifth action later is additive; a placement recorded by hand in the database is not auditable |
| **Days and red** — calendar days in the desk's timezone, threshold at 3 (Q1, Q7) | **Step 4**, in one function | It is a presentation rule, not stored data | One function and one constant. No data migration — this is the cheapest of the expensive list |
| **The first real list** — import with a dry-run, idempotent by external id (Q9) | **Step 5**, before real data | A bad import is the client's data, not a demo | Re-import is possible because the external id is stable; a one-off manual load is not |

**The three to settle before Step 2's migration:** card identity (Q4), tenancy (Q8), money type. If the client cannot answer Q4 or Q8 in time, the defaults in §3 keep the build moving **and** keep the answer cheap to apply later. They are not the client's answer; they are the shape that survives it.

**The one that is a release blocker, not a build blocker:** Q14. The board can be built, but a recruiter cannot record a new placement until it is answered. The plan keeps "Placed" as a stage that seed and import can set, and does **not** invent a fifth outcome to hide the gap.

---

## 3. Pre-flight, and the defaults if an answer is missing

This is not a numbered step because it does not end on a screen. It happens before Step 1 and takes about 15 minutes.

- **Confirm the Supabase project in `.env.local` is this app's.** If it belongs to another brief, stop and ask; do not mix two clients' data in one project. `BLOCKED` is the correct state here, not a workaround.
- **Get the service-role key for the import** (Step 5). It goes in `.env.local` only, never in a `NEXT_PUBLIC_` variable, and is never printed. It is not in the repo today.
- **Confirm the Vercel project or account** for the phone-openable URL. If none is available, the fallback is `npm run dev -- --hostname 0.0.0.0` plus the laptop's LAN address on the phone.
- **Ask for the client's working list** (CSV or JSON). If it is not supplied, Step 5 uses a generated 150-row set and says so.
- **Put the four answers on the table**: Q4, Q5, Q8, Q14. If they are not answered, use the defaults below, and record the default in `WORKLOG.md` so nobody later mistakes it for the client's answer.

| Question | Default used if unanswered | Where it lives | What changes when the answer arrives |
|---|---|---|---|
| Q4 card identity | One active card per person; `people` + `cards` | Partial unique index | Drop the index, add role/client fields; migration, not a rewrite |
| Q5 placement value | One money amount entered per card; label "Placement value" | `value_minor` + UI label | The label and any calculation; the column survives |
| Q8 users | One desk, 50 named accounts, every account on it | `desk_id` + RLS | More desk rows and assignment; policies already scoped |
| Q14 placement path | Placed is seeded/imported only; no fifth outcome | No UI action | Add a fifth action or a move rule; additive |
| Q2 outcome mapping | "Called" and "left message" touch only; "interview booked" → Interview; "not interested" → archive | `log_outcome` | One function edit; events already recorded |
| Q3 refusal | Archive the card, keep its events | `archived_at` | A visible sixth stage later; additive |
| Q1 contact | Any logged outcome resets last contact | `log_outcome` | One function edit |
| Q7 days | Calendar days in the desk's timezone; red at 3 or more | `is_overdue()` | One function edit |
| Q13 currency | INR, because the sample data is INR | `currency` column + seed | Change the seed and the formatter; one column |
| Q6 totals | Five per-column totals, no grand total | Board header | Add a grand total in the UI |
| Q9 first list | Import script if a list exists; otherwise 150 generated rows | `scripts/import.mjs` | Re-run the import; the id is stable |

---

## 4. Phase A — It looks like the product (Steps 1–2)

### Step 1 — The five-column board, in 45 minutes

**Build.**
- `lib/types.ts`: `Stage` as the five PRD values — `new`, `screened`, `submitted`, `interview`, `placed` — plus a `Card` type with `name`, `stage`, `valueMinor`, `currency`, `lastContactAt`.
- `lib/demo-data.ts`: 18 cards, at least 3 per stage and 2 in Placed, values varied, last contact spread from today to 7 days ago. Fake names only.
- Rewrite `components/Board.tsx` from the current row list into **five columns at 1440 px**. Reuse the existing CSS tokens, fonts and card/row styling from `app/globals.css`.
- At widths under 1024 px: a **stage tab bar** (New / Screened / Submitted / Interview / Placed) and one column of cards at a time. Five totals stay visible in a compact strip. This is forced by the harness rule: 375 px, one column, nothing scrolling sideways.
- Each card shows: name, days since last contact, placement value. No red yet. Within a column, oldest last contact first, so the cards that need chasing surface; no sort control.
- Header: five column totals, one per stage. **No grand total** — Q6 is open.
- A visible banner: **"Prototype — nothing is saved"** until Step 2.
- Deploy: Vercel preview, or `vercel deploy --temporary`, or LAN. The phone must reach it.

**What you see at the end.** On a phone: the board in one column, a tab bar to switch stage, five totals at the top, cards with "4d ago" and a money value. On a desk: five columns side by side. Neither scrolls sideways. This is the first thing you can show the client.

**Test before done.**
- Add Vitest as a dev dependency and a `test` script.
- `npx tsc --noEmit` → exit 0.
- `npm run build` → exit 0.
- `npm run test` → the five totals equal the sum of the demo cards per stage; the money formatter handles zero and a large value; `daysSince` returns 0, 1 and 3 for fixed timestamps.
- In the browser at 375: `document.documentElement.scrollWidth === document.documentElement.clientWidth`; every tab switches the visible column; every tap target is at least 44 × 44.
- At 1440: five columns are visible at once and the totals line up with them.
- Screenshots at 375 and 1440, looked at.

**If it fails.** Fix the layout before Step 2. A phone layout that needs a rewrite after auth is a Step 2 rewrite, not a Step 6 polish.

**Decision made here:** the phone interaction model (stage tabs). See §2.

---

### Step 2 — Real rows, real sign-in, 75 minutes

**Build.**
- `supabase/migrations/0001_init.sql`: `desks`, `profiles`, `people`, `cards`, `card_events`, as outlined in the tech stack. `stage` text + check for the five values. `value_minor bigint` + `currency char(3)`. `last_contact_at timestamptz`. `archived_at`. `external_id`. Indexes. `desk_id` on cards and profiles. Append-only `card_events`.
- Row Level Security on every table, `authenticated` only. No `anon` policy. A `get_board()` function, `security invoker`, that derives the desk from the session and returns cards + five totals.
- Seed: one desk, 18 cards, at least 3 per stage, 2 Placed, ages spread. Use fake names.
- Auth: `@supabase/ssr`; email + password; public sign-up disabled; two accounts created by hand (owner/recruiter), each with a matching `profiles` row on the demo desk. `app/login/page.tsx`, sign-out, and a redirect for signed-out users.
- Replace the static array with `get_board()`. Keep the banner only until the first signed-in load succeeds.
- Revoke `anon` access to the old `followups` table with a one-off SQL statement, after a dump, and leave the table in place until the client confirms it can be dropped. Do not drop it in this build; the new app never reads it.
- Deploy with the Supabase URL and publishable key in the hosting environment.

**What you see at the end.** On your phone: a sign-in screen, then the same board, now showing rows from the database. Sign out, and the board disappears.

**Test before done.**
- `npx supabase start`, then `npx supabase db reset` → migrations apply cleanly; seed count is 18.
- SQL check: `select stage, count(*), sum(value_minor) from cards where archived_at is null group by stage order by stage;` → matches the five totals on screen exactly.
- Signed out: `/` redirects to `/login`.
- Signed in: the board loads; sign out returns to `/login`.
- Anon REST check: `curl "$SUPABASE_URL/rest/v1/cards?select=id" -H "apikey: $PUBLISHABLE_KEY"` → `[]` (zero rows), not candidate rows. If it returns rows, the policies are wrong; stop.
- Cross-desk check locally: a second desk + user sees only their own cards, and a direct `get_board()` call as user B does not include user A's desk.
- `npm run build` → exit 0.
- Phone: sign in at 375 and look at the board.

**If it fails.** Do not proceed to Step 3. An open board with auth half-wired is the one state that must never be deployed. Fix or mark `BLOCKED`.

**Decisions made here:** Q4, Q5, Q8, Q13, the money type, the region, and the auth model. If any is unknown, apply §3's default and record it in `WORKLOG.md`. This is the last cheap moment for all of them.

---

### Phase A exit criteria — tick these

- [ ] A phone at 375 px opens the board with no sideways scroll, and the stage tabs switch columns.
- [ ] A desk at 1440 px shows five columns and five per-column totals.
- [ ] A card shows a name, days since contact and a placement value.
- [ ] The board requires sign-in; sign-out works; a signed-out request never shows candidate rows.
- [ ] Anon REST returns zero rows.
- [ ] The five totals on screen equal the SQL sums to the minor unit.
- [ ] The old four-stage table is not readable by `anon`, and the new tables have no `anon` policy.
- [ ] `WORKLOG.md` has the command and real output for both steps.

---

## 5. Phase B — It does the job (Steps 3–5)

### Step 3 — The loop: log an outcome, the card moves, the totals change (70 minutes)

**Build.**
- Add Playwright as a dev dependency, install Chromium (`npx playwright install chromium`), one spec, and a `test:e2e` script.
- `supabase/migrations/0002_log_outcome.sql`: one function, `security invoker`, that:
  - takes `card_id`, `outcome`, optional `note`;
  - rejects anything not in the four outcomes, a card from another desk, or an archived card;
  - writes one `card_events` row and updates the card in one transaction;
  - returns the updated card and the five totals.
- The mapping, in one place:
  - `called` → touch only; stage unchanged; `last_contact_at = now()`.
  - `left message` → touch only; stage unchanged; `last_contact_at = now()`.
  - `not interested` → `archived_at = now()`; the card leaves the board; the event stays.
  - `interview booked` → `stage = 'interview'`; `last_contact_at = now()`.
  - A card already in Placed is not moved by an outcome in this build.
- `app/actions/log-outcome.ts`: validates the inputs again, calls the function, revalidates the board.
- `components/OutcomeDialog.tsx`: exactly four buttons, optional note, disabled while saving, a visible reason on failure.
- Optimistic UI: the card moves and the two affected totals change immediately; on error, both roll back and the real message is shown.
- No fifth outcome. **Placed remains seeded/imported only until Q14 is answered.**

**What you see at the end.** On a phone: tap a card in Screened, tap **Interview booked**, the dialog closes, the card is in Interview, and the Interview total has risen by that card's value while Screened has fallen. Tap **Called** on another card: its "days" resets and it stays in its column.

**Test before done.**
- For each of the four outcomes, a database test asserts: stage, `last_contact_at`, exactly one new event, and the expected totals.
- Negative: outcome `"placed"` → error, **zero** new events, totals unchanged. Same for another desk's card, an archived card, and an empty card id.
- UI test (Playwright): open a card, choose **Interview booked**, assert the card is in the Interview column and the two totals moved by the card's value. Assert the button is disabled while saving and a second rapid click does not create a second event.
- `npm run build` → exit 0.
- Phone: run the same action with a thumb, not a mouse.

**If it fails.** Fix the function, not the test. Do not weaken the assertion that an invalid outcome writes nothing. Do not let the UI compute totals on its own; the returned totals are the truth.

**Decisions made here:** Q2 (mapping), Q3 (archive), Q14 (flagged, not resolved).

---

### Step 4 — Days and red (25 minutes)

**Build.**
- `lib/overdue.ts`: one `STALE_AFTER_DAYS = 3`, one `isOverdue(lastContactAt, now, timeZone)` using **calendar days in the desk's timezone**, and one `overdueLabel()`.
- Red card style plus a **non-colour signal**: a small "3d overdue" label and an icon. Red alone is not readable by every user.
- The rule applies to every column, including Placed, unless the client says otherwise. It is one predicate.
- No sort change, no filter. Red is the signal; the PRD does not ask for sorting.
- Seed three cards at 2, 3 and 4 days for the test.

**What you see at the end.** On the phone: one card is red and says "3d overdue"; the card at 2 days is not red.

**Test before done.**
- Vitest at fixed timestamps: 2 days → not overdue; 3 days → overdue; 4 days → overdue.
- Timezone: a card touched at 23:30 in the desk's timezone is one calendar day old, not two, when the server is in UTC. Assert the function, not the browser clock.
- `npm run build` → exit 0.
- Screenshot at 375; the red card carries the text label, not only colour.

**If it fails.** Fix the function, not the seed dates. If the client has answered Q7 as working days, change the function now — it is the cheap moment.

**Decisions made here:** Q1 and Q7 (or their defaults).

---

### Step 5 — The real working set, and the states around it (45 minutes)

**Build.**
- Before the first real import, take a dump (Free has no automatic backups) or upgrade to Pro. Real candidate data does not go in without one.
- `scripts/import.mjs`: reads a CSV or JSON, validates every row (name required, value non-negative integer, stage in the five, date parseable), prints a dry-run report of rejects **with reasons**, and only writes when run with `--commit`. Upsert by `external_id`, so a second run does not duplicate.
- The dry run reports two different things: **invalid rows**, which are rejected with a reason, and **duplicate people** (the same external id or the same exact name), which are flagged so the one-card-per-person default is not silently broken. A duplicate external id is an update, not a second card.
- The service key is read from `.env.local`; the script runs on the developer machine and is never deployed.
- Empty state: zero cards → a calm screen that says the board is empty and names the next action (the import), not a blank grid.
- Load-error state: if the board query fails, a screen that says so with the real message, distinct from empty.
- If the client's list is not supplied, generate 150 realistic rows with the same shape and label them as sample data.
- If the working set is over 200 active cards, cap each column at 100 with a "show more" control; the totals still cover every card. This adds about 10 minutes and is only done when the real set triggers it.

**What you see at the end.** The board on your phone with the real (or 150-row) working set; and, on a test desk with zero rows, the empty state.

**Test before done.**
- Dry-run with three bad rows — one missing name, one negative value, one stage `"hired"` — → exactly three rejects with three reasons, **zero writes**.
- Commit the good set → count matches the input; totals match a hand sum of three sample rows.
- Run the same import again → the count does not change and no person is duplicated.
- A duplicate external id updates the existing card; two different rows with the same name are reported, not merged.
- Empty desk → the empty state, totals show zero (not `NaN`, not a blank strip).
- Force a load failure (revoke select locally, reload, restore) → the error state names the real error.
- `npm run build` → exit 0; phone screenshot of the real board and the empty state.

**If it fails.** Fix the validator, not the input. A row that would be saved with a missing name is the pilot failure this harness exists to prevent.

**Decision made here:** Q9 (how the first list arrives).

---

### Phase B exit criteria — tick these

- [ ] All four outcomes behave as the mapping says, and each writes exactly one event.
- [ ] "Interview booked" moves the card and changes the two affected totals in the same interaction.
- [ ] "Called" resets days and does **not** move the card.
- [ ] "Not interested" removes the card from the board and keeps its event.
- [ ] An invalid outcome, an empty card, an archived card or another desk's card writes nothing and leaves totals unchanged.
- [ ] Red appears at 3 calendar days, not at 2, in the desk's timezone, and carries a text label.
- [ ] The import rejects bad rows with reasons, writes nothing on a dry run, and is idempotent on a re-run.
- [ ] An empty board and a failed board are two different, readable screens.
- [ ] `WORKLOG.md` has the tests and the real output for all three steps.

---

## 6. Phase C — It can be used for real (Steps 6–8)

### Step 6 — Phone and desk polish, accessibility (30 minutes)

**Build.**
- 375 px: sticky stage tabs, a compact totals strip, 44 px targets, focus rings, the dialog usable one-handed, no sideways scroll.
- 1440 px: five columns aligned, totals above their columns, a readable line length.
- Red: colour plus "3d overdue" text, with contrast that survives a colour-blind check.
- Empty and error states readable at both widths.
- No animation library. No new component system. Use the existing tokens.

**What you see at the end.** The same board, open on your phone, that you would put in front of the client without apologising. The 375 and 1440 screenshots are the evidence, and keyboard focus is visible on every control.

**Test before done.**
- At 375: `scrollWidth === clientWidth`; every button and tab is at least 44 px in both dimensions.
- Keyboard: Tab reaches a card, Enter opens it, Tab reaches all four outcomes, Escape closes without logging.
- The red card is announced/labelled "overdue"; removing colour does not remove the signal (inspect with a grayscale toggle or forced-colours mode).
- Screenshots at both widths, looked at.

**If it fails.** Fix the layout; do not hide the problem with a smaller font or a horizontal scroll.

---

### Step 7 — Production, with the boring parts done (40 minutes)

**Build.**
- Vercel environment variables for the Supabase URL and publishable key; a production deploy; the domain if one exists (otherwise the Vercel URL).
- Supabase Pro if real candidate data is going in: daily backups, no pause. If it stays on Free, take a manual dump before the first real import and say plainly that there are no automatic backups.
- RLS audit: every table has RLS, no `anon` policy, a second-desk test passes.
- Service-key scan of the client bundle.
- Error logging: the Server Action logs the card id and outcome on failure; no note text, no names.
- A 375 px pass on the live URL, signed in.

**What you see at the end.** The live URL on your phone, signed in, with one outcome logged on the real deployment.

**Test before done.**
- `npm run build` → exit 0.
- `curl -I https://<live-url>` → `HTTP/2 200` (paste the status line).
- Sign in on the phone; log one outcome; confirm the new `card_events` row and the moved card.
- Anon REST → `[]`.
- `rg -l "service_role|SERVICE_ROLE" .next/static` → no files. Do not print the key itself.
- Backup: Pro backup policy visible, or a `pg_dump` file exists and opens (`pg_restore --list`).
- `WORKLOG.md` has the status line and the sign-in evidence.

**If it fails.** A 404 or 500 means the deploy failed, whatever the CLI said. Fix it before calling the step done.

---

### Step 8 — A second viewer sees the change (35 minutes, optional)

**Build.**
- Supabase Realtime on `cards`, filtered to the desk, only if Q8 says more than one person watches the same board.
- On an event, re-fetch the affected card and the five totals. Never trust the event payload as the new truth.
- Reconnect: on reconnect, re-fetch the board once; do not replay missed events.
- Keep the optimistic path for the person clicking; Realtime is for the other viewers.

**What you see at the end.** Two devices, same desk. Log "interview booked" on one; the card and the total move on the other within about two seconds.

**Test before done.**
- Two browser contexts; log on A; assert B's card and total change within 2 seconds.
- Disconnect B, log on A, reconnect B; B catches up without duplicates.
- Rapid changes on A do not create duplicate events or double-counted totals.
- With Realtime off, the board still loads correctly on refresh.

**If it fails.** Drop the step (see §7). The clicking user's board already updates at once; this step is for the second viewer only.

---

### Phase C exit criteria — tick these

- [ ] The production build passes and the live URL returns 200.
- [ ] The live URL opens on a phone at 375 px, signed in, and can log an outcome.
- [ ] Anon REST returns zero rows; every table has RLS; a second desk is isolated.
- [ ] The service key appears nowhere in `.next/static`.
- [ ] A backup exists (automatic on Pro, or a dump that opens), and it was taken after the last schema change.
- [ ] No sideways scroll; tap targets ≥ 44 px; keyboard path reaches all four outcomes.
- [ ] If Step 8 was built: two devices agree within 2 seconds and reconnect cleanly.
- [ ] `WORKLOG.md` has every command and its real output.

---

## 7. What we drop if we run short tonight

Dropped in this order. Each line says what still works after the drop.

1. **Step 8, the second viewer.** The clicking recruiter still sees the card and totals change immediately. Only the passive second screen is missing.
2. **The automated import (Step 5).** Seed 20 rows by hand and keep the empty state. The board is demonstrable; the client's real list waits.
3. **Step 6 polish.** Fix only the two things that break the phone rule — sideways scroll and tap targets. Defer the rest of the visual pass.
4. **The custom domain.** Use the Vercel URL. The product is the board, not the address.
5. **Card detail and notes (Q10).** Four buttons only. The event note is optional and can wait.
6. **A placement action (Q14).** Keep seeded/imported Placed cards. Do not invent a fifth outcome; the column is visible, not writable.
7. **Multi-desk management.** One desk, all accounts on it. The schema still has `desk_id`.
8. **Animations and skeleton loaders.** Static layout, instant states. No motion.

**Do not drop, even at 3 a.m.:**

- Sign-in and RLS. An open board with candidate names is not a demo; it is a breach.
- The transactional loop and its boundary test. A total that can drift is the product failing.
- The phone check at 375. The client opens it on a phone first.
- The live URL check (fetch it, paste the status). A deploy that was not fetched is not live.
- The backup, the moment real candidate data enters. Free has no automatic backups.

---

## 8. Verification, written per step and enforced

The rule is simple: **the test is part of the build, not a later phase.** A step's test is written in that step, run before the step is marked complete, and its real output goes into `WORKLOG.md` as one line:

```
<what I did> -> <the command I ran> -> <what it actually printed>
```

What "tested" means per kind of step:

| Step type | Minimum evidence |
|---|---|
| UI | 375 and 1440 screenshots, both looked at; `scrollWidth === clientWidth` at 375 |
| Database / RPC | The SQL assertion and its result, including the negative case that writes nothing |
| Import | Dry-run reject report, committed count, second-run count unchanged |
| Auth / RLS | Signed-out redirect, anon REST `[]`, cross-desk attempt fails |
| Deploy | `curl -I` status line, sign-in on the phone, one live outcome |
| Realtime | Two contexts, elapsed time, reconnect with no duplicates |

Rules that override looking good:

- **Never weaken a test to pass.** If the test says bad data must be rejected, and the code saves it, the code is wrong.
- **Never delete or skip a failing test** to finish. Mark the step open and report it.
- **A passing test you did not run is not evidence.** If it was not run now, write `UNVERIFIED`.
- **A screenshot you did not look at is not evidence.** The 375 px pass is a person looking, not a file existing.
- **One mistake, three guesses.** If a failure survives three wrong hypotheses, stop and report what was ruled out. Do not paper over it.

---

## 9. What changes in the repo

| File / area | Step | What happens |
|---|---|---|
| `components/Board.tsx` | 1 | Rewritten from a row list to five columns + phone stage tabs |
| `app/globals.css` | 1, 6 | Reused tokens; responsive rules added; no new styling system |
| `lib/format.ts` | 1 | Currency from the card, not hard-coded INR; days function shared |
| `lib/demo-data.ts` | 1 | Added for the static board; deleted at Step 2 |
| `lib/types.ts` | 1 | `Stage` is the five PRD values |
| `app/page.tsx` | 2 | Signed-in board from `get_board()` |
| `app/login/page.tsx`, `middleware.ts` | 2 | Sign-in and redirect |
| `supabase/migrations/0001_init.sql` | 2 | New schema, RLS, `get_board()` |
| `supabase/migrations/0002_log_outcome.sql` | 3 | Transactional outcome function |
| `app/actions/log-outcome.ts` | 3 | Server Action |
| `components/OutcomeDialog.tsx` | 3 | Four outcomes, saving and error states |
| `lib/overdue.ts` | 4 | One threshold, one timezone rule, one label |
| `scripts/import.mjs` | 5 | Dry-run + idempotent import |
| `components/States.tsx` | 5 | Empty and named error states |
| `supabase-setup.sql` | 2 | Superseded by migrations; old table left in place, its `anon` access revoked after a dump |
| `screens/` | 1, 6 | 375 and 1440 evidence, looked at |

The old `PRD.md`, `TECH-STACK.md` and `IMPLEMENTATION-PLAN.md` cover the earlier brief. They are not edited. The new documents are the ones this plan follows.

---

*End of IMPLEMENTATION-PLAN. The first screen is 45 minutes away; the loop is 190 minutes away; the live phone is 330 minutes away; the optional second viewer is 365. If the night ends early, stop after Step 3 — a board that moves a card and changes the total is the product.*
