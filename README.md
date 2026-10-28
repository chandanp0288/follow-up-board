# Candidate follow-up board

A small recruitment desk board. Every candidate sits in exactly one column — **New, Screened, Submitted, Interview, Placed** — with the days since last contact and the placement value on the card. The top of the page totals the money in each column. Clicking a card logs one of four outcomes and the card moves, with the totals changing immediately. Cards untouched for three days turn red.

Built with Next.js 15 and Supabase. One screen, no login, no background jobs.

**Live demo:** https://chandanp0288.github.io/follow-up-board/
The site is built as a static export and deployed to GitHub Pages by `.github/workflows/deploy-pages.yml` on every push to `main`. It has no dependency on a local computer.

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

The `gh-pages` branch holds the built static export, and GitHub Pages serves it. The live URL is https://chandanp0288.github.io/follow-up-board/ and it works independently of any local machine.

To update it: run `npm run build`, copy the contents of `out/` to the `gh-pages` branch, and push. The two Supabase settings are compiled into the static bundle at build time — they are the browser-safe URL and publishable key, not a secret.

### The rule for future projects

A `trycloudflare.com` quick tunnel is tied to the computer running the dev server. It is useful for a 10-minute preview, but it is not a deployment. Never give a client a quick-tunnel URL. Put the app on a cloud host:
- static or client-rendered Next.js: GitHub Pages or Vercel;
- server-rendered Next.js: Vercel;
- anything with a database: put the database on a managed service (Supabase) and the frontend on a host that stays up.

## Security note

The four policies are intentionally open to `anon` and `authenticated` so the publishable key alone can run the demo:

- **Anyone with the publishable key can read, add, edit and delete every candidate card.**

That is fine for demo data and **not** fine for real candidate data. Before production, add authentication and scope the policies to the signed-in user or desk.

## Project documents

- `PRD-candidate-board.md` — what is being built and for whom, with the open questions.
- `TECH-STACK-candidate-board.md` — the stack, the rejected alternatives and the cost at 50 users.
- `IMPLEMENTATION-PLAN-candidate-board.md` — the build order, tests and exit criteria.
