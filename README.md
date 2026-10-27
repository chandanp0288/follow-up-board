# Candidate follow-up board

A small recruitment desk board. Every candidate sits in exactly one column — **New, Screened, Submitted, Interview, Placed** — with the days since last contact and the placement value on the card. The top of the page totals the money in each column. Clicking a card logs one of four outcomes and the card moves, with the totals changing immediately. Cards untouched for three days turn red.

Built with Next.js 15 and Supabase. One screen, no login, no background jobs.

**Live demo:** https://info-wires-changing-reg.trycloudflare.com
This is a temporary Cloudflare tunnel to the local dev server; it stops when that server stops.

## What is on the screen

- Five columns, one card per candidate, with per-column money totals at the top.
- **Called** and **Left message** record the touch and keep the card in its stage.
- **Interview booked** moves the card to Interview.
- **Not interested** archives the card and removes it from the board; the row stays in the table.
- **Red** means three or more days since the last contact, with an "Overdue" label as well as colour.
- The board is a five-column grid on a laptop and one stage at a time on a phone, with the five totals always visible.

## Run locally

```bash
npm install
cp .env.example .env.local
# set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Open http://localhost:3000.

Node 20 or newer is required. The app uses only the publishable (browser) key. There is no service-role key in the app.

## Database

The demo project already has the table and the 18 demo rows. For a fresh Supabase project, apply:

```
supabase/migrations/20261027173000_candidate_cards.sql
```

That creates `candidate_cards`, enables RLS, adds the four policies and table grants, and inserts the demo rows once.

## Deploying

The app is a standard Next.js app. Import this repository into Vercel, set the two `NEXT_PUBLIC_` environment variables from `.env.local`, and deploy. No code changes are required.

## Security note

The four policies are intentionally open to `anon` and `authenticated` so the publishable key alone can run the demo:

- **Anyone with the publishable key can read, add, edit and delete every candidate card.**

That is fine for demo data and **not** fine for real candidate data. Before production, add authentication and scope the policies to the signed-in user or desk.

## Project documents

- `PRD-candidate-board.md` — what is being built and for whom, with the open questions.
- `TECH-STACK-candidate-board.md` — the stack, the rejected alternatives and the cost at 50 users.
- `IMPLEMENTATION-PLAN-candidate-board.md` — the build order, tests and exit criteria.
