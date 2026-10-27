# TECH-STACK — Candidate Follow-Up Board

**Answers one question: what do we build it with, and why that.**
**Inputs: `PRD-candidate-board.md` (requirements) and one number — 50 users.**
**Status: DRAFT. It inherits every open question in the PRD. Section 12 names the one choice that must be settled before the first migration.**

Plan limits quoted below were read from supabase.com/pricing and vercel.com/pricing on **27 Oct 2026**. Pricing changes; the shape of the argument does not.

> The whole stack: **Next.js 15 on Vercel, one Supabase project (Postgres + Auth + Row Level Security), Server Actions calling one transactional database function.** One deployable, one database, no queue, no cache, no background worker. Roughly **$0/month on free tiers, $45/month once real agency data lives in it** ($20 Vercel Pro + $25 Supabase Pro).

---

## 0. What "50 users" actually means

50 users is not a scaling target. It is a **boredom** target. The app is one screen, the data is one table of cards per desk, and the only expensive query is a sum over a few thousand rows. Nothing here needs a cache, a queue, a replica, a second service, or a background job.

The numbers below are sizing assumptions, not PRD facts. They are written down so the design can be checked against them, and so the first real measurement can replace them.

| Quantity | Assumption | Working |
|---|---|---|
| Named users | 50 | Given |
| Concurrent users at peak | 10–15 | A recruitment desk works office hours; 50 people do not click at once `[S1]` |
| Active cards per user | 150 | A busy desk's live list `[S1]` |
| Total active cards | 7,500 | 50 × 150 |
| Outcomes logged per user per working day | 30 | Calls, messages, decisions `[S1]` |
| Writes per month | 33,000 | 50 × 30 × 22 |
| Board loads per month | 11,000 | 50 × 10 × 22 |
| Event rows per year | ~400,000 | One row per logged outcome |
| Database size after a year | roughly 100–150 MB | Cards + events + indexes |
| Board payload per desk | ~20 KB | 150 cards |
| Supabase egress per month, per-desk board | ~0.2 GB | 11,000 × 20 KB |

`[S1]` Sizing assumption, not a client fact: the PRD says 50 users, not how they work. If the real number is 500 active cards per user, reload the table before the schema is final. `[S2]` The sample data in the folder is INR/India; the PRD leaves currency open (Q13). Treat the region as a proposal until the client confirms.

**The one number that can actually reach a free limit is egress — and only if the board is built wrong.** If all 7,500 cards are loaded on one shared board, a single load is roughly 1 MB of JSON; 11,000 loads is ~11 GB/month, against Supabase Free's 5 GB. That is not a scaling problem, it is a design smell: a recruiter cannot read 7,500 cards either. The design answer is to load one desk at a time and never load a column the user cannot see (§7). At 150 cards per desk, the same traffic is ~0.2 GB and the free tier is not close.

**What this rules out, before any layer is chosen:** read replicas, Redis, a message queue, a separate search service, a data warehouse, horizontal sharding, multi-region deployment, Kubernetes, and a dedicated API server. None of them has a job to do at 50 users. Every one of them adds a thing to operate, and there is no ops staff.

---

## 1. The shape of the system

```
Browser (one page, phone + desk)
   │  cookie session
   ▼
Next.js 15 on Vercel
   ├── Server Components: read the board (user-scoped database client)
   └── Server Action: log an outcome ──► Postgres function: one transaction
                                              │
                                              ▼
                              Supabase project (one)
                              Postgres + RLS + Auth
                              (Realtime only when a second viewer exists)
```

There is no second deployable. There is no API layer separate from the framework. There is no scheduled job. The only thing that runs outside a request is a one-off import script on the developer's machine, and it never ships to the browser (§7).

---

## 2. Database

| | |
|---|---|
| **MVP** | Supabase Postgres, one project, Free plan |
| **Production** | Same project, Pro plan (backups, no pause) |
| **Change type** | Billing switch. No code, no schema, no data migration |

**Constraint that forced it.** The product is a **sum over rows plus a state change**: one click has to insert an outcome, move a card, reset its last-contact time, and change five totals. That is a transaction, and Postgres has done transactions and sums for decades. The same product also needs per-user access rules on candidate data, an identity provider, and (only if a second viewer exists) a change feed. Supabase gives all four in **one project on one free allowance**, which is the rule set for this build. One vendor, one dashboard, one backup story.

**Rejected, and why:**

- **Firebase / Firestore.** A document store has no relational sums worth trusting and no real constraints. The headline number would be computed client-side over documents, which is exactly how totals drift. Per-read billing also punishes the one query the product lives on.
- **MongoDB.** Same problem, less free-tier convenience. The schema is small and known; schemalessness buys nothing and risks the money field.
- **Airtable, Notion databases, a spreadsheet.** This is the thing the PRD replaces. No transactions, weak validation, and a second row edit can clobber the first.
- **Neon / plain Postgres.** Technically excellent and cheaper at idle, but then authentication and row-level access are a second vendor (Clerk, Auth0, custom). At 50 users that is more moving parts, not fewer.
- **SQLite / Turso.** The genuinely cheapest engine, and a legitimate road not taken. It has no equivalent of row-level policies tied to an identity provider, and a single-region file still leaves someone owning backups and uptime. There is no ops staff.
- **MySQL / PlanetScale.** No row-level security, no bundled auth, and no advantage for this query shape.

### Schema, in outline

Names are indicative; the shape is the decision.

```
desks(id, name)                                  -- one row in MVP; Q8 insurance
profiles(id → auth.users, desk_id, display_name, role)
people(id, full_name, created_at)                -- one row per human
cards(id, person_id, desk_id,
      stage,                                     -- new|screened|submitted|interview|placed
      value_minor bigint, currency char(3),
      last_contact_at timestamptz,
      created_at, updated_at,
      archived_at timestamptz)
card_events(id, card_id, actor_id,
            outcome, from_stage, to_stage,
            note, occurred_at)                   -- append-only
```

Decisions inside that outline, each with its reason:

- **`stage` is text with a check constraint, not a Postgres enum.** Adding "Not interested" (Q3) later is then a one-line constraint change, not a type migration. The existing table already does this; keep it.
- **Money is `bigint` minor units plus a currency code.** Never a float. The existing column is `integer` paise (`lib/supabase.ts:21`), which caps a fee at about ₹21.4 million; `bigint` removes the cap for free. Q5 decides what the number *means* and what the UI calls it — not its type. Every possible answer (fee, salary, margin) is money, so the column survives the answer.
- **`last_contact_at` is stored; "days since" and "red" are not.** Both are derived at read time. Q7 (calendar vs working days) then changes one function, not 7,500 rows. The existing client-side `STALE_AFTER_DAYS = 3` (`components/Board.tsx:12`) survives as a display rule; the *definition* of untouched must come from the PRD.
- **One active card per person, enforced by a partial unique index** (`on cards(person_id) where archived_at is null`) in MVP. This is the Q4 insurance: if the answer is one card per candidate-per-role, the change is dropping that index and adding role/client fields — **not** rebuilding the board, because the card was already the unit of every query and total.
- **`desk_id` exists from day one, with one desk row.** This is the Q8 insurance. If 50 users turn out to be several desks, the column is already there; what changes is the policies and the filters, not the table.
- **`card_events` is append-only from day one**, even though the MVP UI has no undo. It is the only cheap insurance for Q11 (corrections) and Q12 (what happens to placed cards), and it is the audit trail for a number the owner will argue about.
- **Totals are never stored.** They are `sum(value_minor) group by stage` over the desk's unarchived cards. A stored counter is a second source of truth and the classic way for the headline to drift. At 7,500 rows with an index, the aggregate is milliseconds.

Indexes: `cards(desk_id, archived_at, stage)` for totals, `cards(desk_id, archived_at, last_contact_at)` for the red ordering, `card_events(card_id, occurred_at desc)` for a card's history.

### Access rules

Row Level Security on every table, **`authenticated` only**. No `anon` access at all. A user may read and write cards on their own desk; the policy is `desk_id = (select desk_id from profiles where id = auth.uid())`.

**This is not optional, and the current repo is the counter-example.** `supabase-setup.sql:43-63` creates four policies that grant `anon` select, insert, update and delete on every row, with `using (true)` — and the file says so in plain words. With a publishable key in the browser, that is the whole table open to anyone who has the key. It was acceptable for a demo with no login; it is not acceptable for 50 users and candidate names. Those policies are replaced, not extended, before any real data enters.

### What already exists, and what cannot be reused

The repo contains a working board for the **previous** brief: four stages (`candidate`, `submittal`, `interview`, `contractor`), a `dropped` status, `fee_at_risk_paise`, and no authentication (`lib/supabase.ts`, `supabase-setup.sql`). The new PRD has five different stages, a different money meaning, 50 named users and an open refusal case. **The layout, the CSS tokens and the money formatting are reusable. The table and its policies are not.**

---

## 3. Authentication

| | |
|---|---|
| **MVP** | Supabase Auth, email + password, public sign-up disabled, accounts created by an admin |
| **Production** | Same, plus custom mail for password resets and email branding |
| **Change type** | Config switch plus one small reset flow. No schema change |

**Constraint that forced it.** 50 known recruiters, not an open market. Candidate names and fees are personal data, so every read needs an identity and every write needs an actor. The database already enforces access per user (§2), so the identity provider has to be the one that issues that user's token. Supabase Auth is in the same project, on the same free allowance, and its 50,000 monthly-active-user free limit is three orders of magnitude above 50.

**Rejected, and why:**

- **One shared login.** No actor on an event, no way to answer "who moved this card", and no safe path to Q8. It also makes Q11 (corrections) unattributable. This is the current demo's model, and it is the one thing that must not survive.
- **Magic links as the MVP login.** The built-in mailer is documented by Supabase as development-only and rate-limited per project per hour; 50 people signing in for the first time on a Monday would hit `over_email_send_rate_limit` (HTTP 429). Magic links are fine *after* custom mail is configured — that is a production config switch, not a reason to make email the only way in.
- **Clerk / Auth0.** Better dashboards, but a second vendor, a second bill, and a second place user data lives, for 50 users who are provisioned by hand anyway.
- **Custom password handling.** A security liability with no upside. Password hashing, reset tokens, session rotation and rate limits are exactly what a managed provider is for.
- **SSO / SAML.** No IT department, no directory, 50 users. Revisit only if the client says otherwise.

**Provisioning in practice.** The admin creates each account (dashboard or a one-off admin call); the user signs in and changes the password. Password reset: MVP resets by admin; production enables a custom mail provider (Resend's free tier — 3,000/month, 100/day — is more than enough) so users can reset themselves. The reset flow is the only place the app sends mail, and mail is not a product feature in the PRD.

**Session handling.** `@supabase/ssr` cookie helpers, because Server Components and Server Actions need to read the session on the server. The current `lib/supabase.ts` creates a client with `persistSession: false` (`lib/supabase.ts:46-47`), which is fine for an anonymous read and wrong for a logged-in user. Add the SSR package; keep the publishable key in the browser (it is public by design, protected by RLS).

---

## 4. Frontend framework

| | |
|---|---|
| **MVP** | Next.js 15 (App Router) + React 19 + TypeScript, already in the repo |
| **Production** | Same |
| **Change type** | None |

**Constraint that forced it.** The working scaffold is already Next.js 15 / React 19 with Supabase JS installed, and the house deploy path is one Vercel project. The screen needs the user's session and the desk's cards on first paint, and the write needs a server-side action. Next gives both in one deployable, with no separate API to build, deploy, secure and monitor.

**Rejected, and why:**

- **Vite + React SPA.** Genuinely simpler in isolation, and it would work: the database call can carry the user's token and RLS can enforce access. Rejected because it replaces a working scaffold, loses server-side route gating and first-paint data, and reintroduces the session and loading plumbing the current setup already solves — a rewrite for no gain at 50 users. If the project were starting from an empty folder, this would be a closer call.
- **SvelteKit / Remix / Nuxt.** Capable frameworks, but a rewrite of the scaffold and a second ecosystem for the same one screen.
- **A native phone app.** The PRD says web; the phone requirement is satisfied by responsive layout, and a store release is a second product to ship and update.
- **A drag-and-drop library (`dnd-kit`, `react-beautiful-dnd`).** The PRD moves a card by **logging an outcome**, not by dragging. Adding drag would create a second way to change stage, bypass the outcome audit, and add keyboard/accessibility work for no requested feature. Refused on the strength of the PRD's interaction.
- **Redux / Zustand / React Query.** There is one screen and the server owns the data. Server Components read it, `useOptimistic` makes the card and total move immediately, and the Server Action response reconciles. A client cache would be a second copy of the totals.
- **Tailwind / shadcn.** A preference, not a constraint. The repo already has a token-based stylesheet and two fonts (`app/globals.css`, `app/layout.tsx`), and the product is one screen. Revisit only if the client's brand kit arrives with a component system attached.
- **Infinite scroll or virtualised lists.** Not needed at 150 cards per desk. At the shared-board extreme (7,500), the answer is per-column pagination (§7), not a virtualisation library.

**What is already usable.** The CSS custom properties (paper, ink, accent, risk), the two-font pairing and the card/row layout in `components/Board.tsx` are a coherent direction and a head start. They are **not** the client's brand; the PRD says no brand kit was supplied. The 375 px pass is still owed — the current stylesheet has one breakpoint, and the PRD requires the board to work at phone width.

---

## 5. Hosting

| | |
|---|---|
| **MVP** | Vercel Hobby, $0 |
| **Production** | Vercel Pro, $20/month per developer seat |
| **Change type** | Billing switch. No code change |

**Constraint that forced it.** The app is already a Next.js project and the deploy path is one push to one project. 50 users generate roughly 11,000 page loads and 44,000 function invocations a month, against Hobby's 1,000,000 invocations, 100 GB transfer and 4 hours of active CPU. The request and transfer allowances are barely touched; active CPU is the tightest meter, at roughly a third of the free 4 hours if every request spent 100 ms of CPU.

**The exact limit that forces the upgrade is not traffic. It is the licence.** Vercel's own pricing page says the Hobby plan is for "personal, non-commercial use" and Pro is for businesses. The moment the client's agency runs its pipeline on it, the plan is wrong, whatever the meters say. That is **$20/month**, and it is a billing switch.

**Rejected, and why:**

- **Cloudflare Pages / Workers.** Commercially usable on the free plan, which is a real advantage. Rejected because Next.js on Cloudflare needs an adapter, cookie-based Supabase sessions need extra care at the edge, and the result is a different deploy path for the same app. This is a rewrite of deployment for a saving of $20/month — not worth it at this scale, worth reconsidering only if cost becomes the deciding constraint.
- **A self-managed virtual machine.** Cheapest sticker price, but you own TLS, restarts, backups and patching. There is no ops staff.
- **Netlify / Render / Railway.** Equivalent products, no advantage, and a migration of the existing scaffold.
- **Static export on object storage.** Would make every route guard client-side and every first paint a loading state, and loses Server Actions.

**Region.** Create the Supabase project in one region close to the desks (Mumbai if the client is the INR agency the sample data implies `[S2]`). Changing region later means a new project, a dump and restore, and downtime — one of the few setup choices that is not a config switch. Decide it at creation, with the client's location confirmed.

---

## 6. Server functions and the write path

| | |
|---|---|
| **MVP** | One Next.js Server Action per outcome → one Postgres function (`log_outcome`) in a single transaction |
| **Production** | Same |
| **Change type** | None |

**Constraint that forced it.** "Logs what happened … and the card moves on, with the totals changing at once" is three changes that must all happen or none: insert the event, update the card's stage and last-contact time, and return the new totals. If the browser makes those calls separately, a dropped connection leaves a card moved with no event, or an event with no move. A single database function is the smallest thing that guarantees all three, and it returns the fresh totals in the same response so the UI never needs a second round trip to learn the truth.

**The function's contract** (shape, not final SQL):

```
log_outcome(card_id, outcome, note)
  → validates: outcome is one of the four; card belongs to the caller's desk;
    card is not archived; note within length
  → computes: from_stage, to_stage, whether last_contact_at moves (Q1, Q2)
  → writes: one card_events row + one cards update, in one transaction
  → returns: the updated card + the five column totals
```

Run it as the caller (the default, `security invoker`) so the row policies still apply. Never mark it `security definer` just to make the write easier; that would route around the access rules the rest of the design depends on.

Every rejection returns a reason and writes **nothing** — the boundary rule from the harness's own pilot. An invalid outcome, a missing card, or a cross-desk id must leave the totals exactly as they were.

**Rejected, and why:**

- **Direct writes from the browser (`insert` then `update`).** The two calls can diverge, and the validation lives in two places. This is the failure the PRD's "at once" promise is least able to survive.
- **Supabase Edge Functions.** A second runtime, a second deploy, cold starts, and duplicated business logic — for a function that is already sitting next to the data it must change atomically.
- **A separate Express/Nest API.** A second deployable to build, secure, host and monitor, for 50 users and four outcomes.
- **Business logic in a database trigger.** Triggers are hard to return a useful reason from and easy to forget when the rules change. Keep the decision explicit in one function; a trigger can be added later for audit if needed.
- **A background job to mark cards red.** Red is derivable from `last_contact_at` at read time. A scheduled job adds a moving part (and a scheduler on the free tier) and would be stale between runs. No cron exists in this design.

**Reads.** A single `get_board()` function derives the desk from the session (it does not accept a desk id from the browser) and returns that desk's cards and the five totals from one snapshot, so the cards and the money can never disagree because they were read a millisecond apart. At ~150 cards and ~20 KB, one call is simpler than two and gives a consistent picture. If the shared-board case arrives, the same function returns totals over **all** the desk's cards and only the first page per column; the totals never depend on what is scrolled into view.

**If a second viewer is real (Q8).** Add Supabase Realtime on `cards`, filtered to the desk, and on an event re-fetch the affected card and the totals. Do not trust the event payload as the new truth. The free tier allows 200 concurrent peak connections and 2 million messages/month; at 33,000 writes × 50 subscribers the fan-out is 1.65 million — under the cap but close enough that per-desk channels (not one global channel) are the correct design. This is **additive code plus a config switch**, not a rewrite. It is deliberately out of the MVP because the PRD's "at once" is about the person clicking, and optimistic UI already delivers that.

---

## 7. What the PRD's features specifically demand

| PRD feature | What it forces | Decision |
|---|---|---|
| Five fixed columns | A stage vocabulary and no duplicate placement | `cards.stage` text + check; one row per card; totals group by stage |
| One card per candidate (Q4) | A rule that a person appears once | Partial unique index on active cards; removable without a schema rewrite |
| Days since last contact | A trustworthy timestamp and one definition | `last_contact_at` stored; days computed by one function; Q7 changes the function, not the data |
| Placement value | Exact money, one currency | `bigint` minor units + `currency`; format with `Intl`; no floats |
| Column totals at the top | One source of truth, updated in the same action | SQL aggregate per read, returned by the same function as the write; no stored counters |
| Click a card, four outcomes | Validation at the edge and an auditable record | Server Action → function; exactly four outcomes; one event row per log. **No outcome reaches Placed (Q14):** the column can be seeded/imported, but a real placement needs a fifth action or a move rule before it can be recorded |
| The card moves on | An outcome-to-stage mapping, not a drag | One mapping function, tested against the four cases; Q2 decides attempts |
| Red after 3 days | A derived flag, not a stored one | `is_overdue(last_contact_at, policy)`; colour **plus** a text/icon label |
| 50 users, shared or per-desk (Q8) | Identity and isolation on every row | Auth + RLS + `desk_id` from day one |
| Works on a phone | One responsive layout, no second product | CSS only; 375 px and 1440 px passes before "done" |
| Load the working set | A validated, repeatable first import | Local Node script with a dry-run report; service key never in the app |
| Corrections / placed cards (Q11, Q12) | History that outlives the current card state | Append-only `card_events`; `archived_at` for removal |
| Not interested (Q3) | Somewhere for a refusal to go | `archived_at` now; a sixth stage value later is additive, not structural |
| Single currency (Q13) | No FX, no mixed totals | One `currency` value enforced per board; multi-currency is out of scope |

**On the red state.** The rule is `days >= threshold`, evaluated when the board is read, with the threshold in one place. If Q7 answers "working days", the function gains a working-day calendar (and a small holiday table if the client has one) — again, no data migration. The card must carry a non-colour signal, because "turn red" alone is not readable by every user.

**On the totals.** Whether the Placed column's money sits in the same strip as pipeline money (Q6) is a grouping decision in the UI, not a schema decision. The data supports either; the five sums are computed independently, and a card is counted once because it lives in exactly one column. A grand total is not shown until Q6 is answered.

**On loading the first candidates.** One local script (not a browser upload, not an admin screen): read the client's list, validate every row with the same rules as the app, print a dry-run report of rejects with reasons, then upsert in one transaction keyed by an external id. It runs on a developer machine with the service key, never in the deployed app. This is the only place the service key is used, and it never reaches the browser.

---

## 8. One Supabase project: how development and production coexist

The rule for this build: **one Supabase project only.** The free plan holds two; the second is deliberately left unused, not spent on a clone.

| Environment | What it is | Counts against the two? |
|---|---|---|
| Local development | Supabase CLI + Docker on the developer's machine, seeded, reset freely | No — it is not a hosted project |
| Production | The single remote Supabase project | One of two |
| Staging clone | None | — |

How this works without a second project:

1. Schema lives in `supabase/migrations`, not in a paste-into-the-dashboard script. Applied locally with `supabase db reset`; applied to the one remote project with `supabase db push`.
2. Tests run against the local stack. **Nothing experimental touches the remote project.**
3. Before any destructive migration, take a dump. On the free plan there are **no automatic backups**, so the dump is the backup.
4. If the client later buys Pro, database branching exists as an add-on, but it is still not required. One project remains the rule until the client says otherwise.

This is a real trade-off, stated plainly: there is no staging environment, so a bad migration is caught by the local reset and the tests or it is caught in production. The mitigations are the dump, small migrations, and the fact that the schema is five tables.

---

## 9. MVP versus production

| Layer | MVP (free) | Production (real agency data) | Change |
|---|---|---|---|
| Frontend | Next.js 15, same repo | Same | None |
| Hosting | Vercel Hobby ($0) | Vercel Pro ($20/mo, 1 developer seat) | **Billing switch** |
| Database | Supabase Free (500 MB, 5 GB egress) | Supabase Pro ($25/mo, 8 GB, 250 GB egress, daily backups) | **Billing switch** |
| Auth | Email + password, admin-created accounts | Same + custom mail (Resend free) for resets | **Config + small code** |
| Realtime | None; optimistic UI covers the clicking user | Supabase Realtime per desk, only if Q8 says team | **Additive code + config** |
| Server functions | Server Actions + `log_outcome` | Same | None |
| Backups | Manual dump before migrations | Daily, 7 days, automatic | Billing switch |
| Observability | Vercel/Supabase logs (1 hour / 1 day) | Same + Pro log retention; `card_events` is the money-level audit | Billing switch |
| Import | Local script | Same | None |
| Domain | `*.vercel.app` | Client domain | Config |
| Region | Chosen once, at project creation | Same | **Project migration if changed** |

**The exact limits that force the upgrade:**

1. **Supabase Free has no automatic backups.** Not size, not speed — backups. The first day the board holds a real pipeline, a deleted card or a bad migration is unrecoverable. $25/month buys daily backups and 7-day logs. That is the trigger.
2. **Supabase Free pauses a project after a week of inactivity.** A quiet holiday week could take the board offline until someone opens the dashboard. Pro does not pause.
3. **Vercel Hobby is non-commercial.** The meters are nowhere near their limits at 50 users; the licence is. $20/month.
4. **Supabase's built-in mailer is development-only and rate-limited.** It does not force a Supabase upgrade; it forces a custom mail provider (or admin-set passwords) before self-serve resets. Resend's free tier covers it.

**Config switches, not rewrites:** plan upgrades, custom mail, custom domain, log retention, environment variables, a second Vercel seat.

**Rewrites, if the insurance is skipped:**

- **Adding authentication after an anonymous build.** Every query, every policy and every write changes. This is why auth is in the MVP.
- **Changing what a card is** (person → person-per-role). The schema insurance makes this a migration; without it, it is a new central table.
- **Adding tenancy** (one shared board → per-desk). `desk_id` makes it policies and filters; without it, it is every table and every query.
- **Money as a float.** Every amount, every total, every formatter. Avoided by the integer column.

**The happy path has no planned rewrites.** That is the whole purpose of `people` + `cards`, `desk_id`, `card_events` and integer money being in the MVP even though the MVP does not need them yet.

---

## 10. Tests and evidence

**Constraint that forced it.** The two things that would make the product fail are a wrong total and a saved record that should have been rejected. Both are cheap to prove and neither needs a browser farm, a load generator or a second environment.

- **Pure functions, Vitest:** outcome → stage, days/red threshold (calendar and working-day variants), money formatting, validation. These are the rules the PRD leaves open, so they get the most tests.
- **Database, against the local stack:** each of the four outcomes produces the right stage, one event, and the right totals; an invalid outcome returns an error and leaves zero rows and unchanged totals; a user from another desk cannot read or write a card.
- **One browser loop, Playwright:** log "interview booked" → the card is in Interview and the two affected column totals have changed by the right amount. Plus the negative case: submit with nothing chosen → a visible reason, no new event, no total change.
- **Manual, before done:** screenshots at 375 px and 1440 px, as the harness's design rule requires.
- **Not tested:** load, concurrency beyond a handful of tabs, multi-region, disaster recovery. At 50 users those are theatre; the backup is the disaster plan.

No load test is a deliberate omission, not an oversight. If the client later claims hundreds of concurrent users, that is a different document.

---

## 11. The bill, in one table

| Item | MVP | Production |
|---|---|---|
| Vercel | $0 (Hobby) | $20/mo (Pro, one developer seat) |
| Supabase | $0 (Free) | $25/mo (Pro) |
| Mail (resets only) | $0 (admin-set) | $0 (Resend free: 100/day, 3,000/mo) |
| Domain | $0 (`*.vercel.app`) | ~$12/year |
| **Total** | **$0** | **~$45/month**, under $1 per user |

At 50 users the production bill is less than a single lunch per user per year. The expensive thing in this project is not infrastructure; it is a wrong data model.

---

## Appendix — the road not taken, in one place

| Rejected | The constraint it failed |
|---|---|
| Firebase / Firestore | No trustworthy relational sums; totals would drift; per-read billing |
| MongoDB | No relational constraints; the money field at risk |
| Airtable / Notion / spreadsheet | No transactions or edge validation; it is the thing being replaced |
| Neon + Clerk/Auth0 | Two vendors for what one project already bundles |
| SQLite / Turso | No RLS tied to auth; you own the machine and its backups |
| One shared login | No actor, no audit, no path to Q8 |
| Magic-link-only auth at MVP | Built-in mailer is development-only and rate-limited |
| Custom password auth | Security liability with no benefit |
| Vite SPA | Replaces a working scaffold; client-side guards; second deploy path |
| SvelteKit / Remix / Nuxt | Rewrite for no scale advantage |
| Native phone app | Web is the brief; responsive layout is enough |
| Drag-and-drop | The PRD moves cards by logging outcomes, not dragging |
| Redux / Zustand / React Query | Server owns the data; a client cache duplicates the totals |
| Tailwind / component kit | Preference, not constraint; existing tokens are enough for one screen |
| Vercel Hobby for production | Non-commercial licence, not a meter |
| Self-managed VM | Ops, TLS, patching, backups with no ops staff |
| Cloudflare Pages | Commercially free, but a Next.js adapter and a deploy rewrite for $20/month |
| Separate API server | A second deployable for four outcomes |
| Edge Functions for the write | Second runtime and duplicated logic; the transaction belongs in Postgres |
| Stored totals / counters | A second source of truth; drift is the product failing |
| Stored "days since" or "red" flags | Derived values; storing them needs a scheduler and goes stale |
| A scheduled job for red | Same, plus a moving part on the free tier |
| Realtime in the MVP | Only the clicking user needs "at once"; Q8 may never ask for more |
| A second Supabase project for dev | The brief's rule; local CLI covers development |
| Float money | A wrong total is the product failing |

---

## 12. The decision most expensive to reverse

**What a card represents — one person, or one person's candidacy for one role.**

Every other choice here is cheap to undo. Hosting is a billing switch. The Supabase plan is a billing switch. The framework is already installed and the screen is one page. Realtime is additive. Even the region, painful as a project migration, is a contained move.

But the card is the unit of the product: **the thing that sits in a column, carries one last-contact time, carries one placement value, and is summed by the five totals.** If the client's real world is "a candidate can be in two processes at once" (Q4), then a one-card-per-person model can only ever show one of them, with one value and one contact clock. The two-table shape in §2 (`people` + `cards`) makes the *table* change cheap — drop the unique index, add role fields — but it does not make the *meaning* cheap: every total, every red rule and every "days since" answer was written against one card per person, and the backfill has to decide which process the existing card was actually about. That is the six-month bill.

The insurance costs one join today. The decision itself still belongs to the client, and the PRD's Q4 is the question to answer **before the first migration**. If Q4 is still open when the build starts, build the `people` + `cards` shape and keep the unique index removable — then the answer is a migration, not a rewrite.

**Runner-up, named so it is not re-litigated:** whether the 50 users share one pipeline or work separate desks. That is `desk_id`, and it is in the schema from day one for exactly this reason. Without it, Q8 is a rewrite of every policy and every query rather than a filter.

**The one thing that must not be carried over from the current repo:** the anonymous access policies in `supabase-setup.sql:43-63`. They are the difference between a demo and a data breach, and they are not a technical detail to clean up later.

---

*End of TECH-STACK. Buildable on free tiers today; the only forced spend is $45/month once the data is real. Blocked on PRD Q4 for the card's meaning and Q14 for the Placed column, not for the table.*
