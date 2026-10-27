# PRD — Candidate Follow-Up Board

**DRAFT — not signed, not validated with a client.**
**Answers exactly one question: what are we building, and for whom. No build instructions, no technology names.**
**Written from one sentence supplied by the client. Every gap is marked `[A#]` and listed at the end.**

---

> ## READ THESE FIRST
> The questions below are unresolved on purpose. Each one changes what gets built, and each one is the client's to answer, not mine. Until they are answered this document can describe a board but cannot be accepted as the board. Read the one-line list here, then Section 2 for what each answer costs.

| # | The open question, in one line |
|---|---|
| Q1 | What counts as "contact" for the days counter? |
| Q2 | Do "called" and "left message" move the card, or only record a touch? |
| Q3 | Where does a candidate go when they are "not interested"? There is no column for it. |
| Q4 | Is one candidate one card, even when they are put forward for several roles? |
| Q5 | What exactly is the "placement value" — fee, expected fee, salary, or margin? |
| Q6 | Which money do the column totals include, and does placed money stay on the board? |
| Q7 | Does "3 days" mean calendar days or working days, and counted from what event? |
| Q8 | One recruiter, or a team looking at the same board and the same money? |
| Q9 | How does a candidate get onto the board in the first place? |
| Q10 | What does clicking a card open, beyond the four outcomes? |
| Q11 | Can a card move backwards, and can a logged outcome be corrected? |
| Q12 | Is "Placed" the end of the card's life, or does it stay forever? |
| Q13 | Currency, rounding, and what the red state is for. |
| Q14 | Which action marks a placement? None of the four outcomes moves a card to "Placed". |

---

## Source note

This PRD is written from a single sentence: the client's own description of a candidate follow-up board. No interview, no sample data, no current tracker, no process notes and no brand material were supplied. The sentence is quoted exactly where it matters. Everything a real client would normally have told us — the fee rule, the meaning of contact, the working week, the number of users, the destination of a candidate who declines — is missing, and is marked inline as `[A#]` and repeated in the assumptions list at the end.

The document is deliberately narrow. It describes the board in the sentence and nothing around it. Where the sentence implies something it does not state, that implication is written down and then challenged in Section 2 rather than resolved.

---

# 1. What was said, and what it means for the build

Each phrase below is the client's, quoted. Each is followed by what it actually commits us to, and what that commitment costs.

**"Candidate follow-up board"**
A board organised around *people*, not around jobs, clients or roles `[A1]`. "Follow-up" says the job to be done is chasing, not matching or placing `[A2]`. So the unit on screen is a candidate, and the question the screen answers is "who have I not spoken to?" — not "which role is open?".

**What it implies:** every card is a person, and the board's value comes from the chasing rhythm, not from a record of everything known about them.
**What it costs:** the moment a candidate is put forward for two roles, a person-shaped board has to decide whether it shows one card or two (Q4). That decision is structural and cannot be deferred past the first build `[A5]`.

**"small web app"**
One screen, opened from a link, reachable on the desk and on a phone. "Small" is a scope instruction as much as a size instruction: it rules out a suite, and it rules out a product that needs training.

**What it implies:** the whole job fits on one page, and a new user should understand it without being shown.
**What it costs:** "small" is only true if we refuse the things that would make it large. Every addition in Section 5 is refused on the strength of this word. It also means there is no separate admin area, no settings maze `[A13]`.

**"each candidate sits in one column"**
One card, one place. A candidate is in exactly one of the five states at any moment, never two, and never duplicated by hand.

**What it implies:** moving a card is the only way its state changes, and the same person cannot be counted twice in the column totals.
**What it costs:** a single-column model has no room for a candidate who is in two processes at once — screened for one role, interviewing for another — unless each process gets its own card, which breaks the "one candidate" rule (Q4). It also means every state the business actually uses must exist as a column, or cards will be parked in the wrong one (Q3, Q12).

**"New, Screened, Submitted, Interview, Placed"**
Five states, named, and evidently in order. The board is a pipeline, and progress reads left to right `[A8]`.

**What it implies:** those five words are the whole vocabulary of the pipeline. There is no "Offer", no "Rejected", no "On hold", no "Placed elsewhere".
**What it costs:** the list as given has no exit. A candidate who is not interested, or who is rejected by a client, has nowhere to go, and the "not interested" outcome in the sentence has no matching column (Q3). "Placed" is both a stage and a money event, which is why the totals question cannot be separated from the stages (Q6). And none of the four outcomes named later moves a card into it: the column exists, but the logging action has no way to reach it (Q14).

**"Every card shows the days since last contact"**
Each card carries one number, derived from a date, and the number is the board's main signal.

**What it implies:** the board must know when contact last happened, for every card, including cards that have never been contacted.
**What it costs:** the number is only as honest as the logging habit behind it. If the recruiter records contact by hand, a busy day produces a card that looks warm but is not `[A10]`. The sentence does not say what a "contact" is, whether an unanswered call counts, or whether messages count (Q1). It also does not say what happens to a card that has never been contacted — a number that cannot be calculated is not the same as zero (Q7).

**"and the placement value"**
Each card carries money. The word "placement" ties that money to a successful placement, but the card is on the board before the placement happens, so the number on most cards is a *possible* fee, not an earned one.

**What it implies:** one money figure per card, visible at card level, and comparable across cards.
**What it costs:** "placement value" is not a definition. It could be the fee the agency will earn, the expected fee at a standard rate, the candidate's salary, or the margin. Each gives a different number on the same card and a different total at the top (Q5). If the number is typed by hand it will be stale and inconsistent; if it is calculated, we need the rate rule, which has not been supplied `[A3][A4]`.

**"the top of the page adds up the money sitting in each column"**
Five sums, one per column, visible at the top, and each card counted once in exactly one of them.

**What it implies:** the top strip is the board's headline: money waiting in New, in Screened, in Submitted, in Interview, in Placed.
**What it costs:** the phrase treats all five columns as the same kind of money, but they are not. Money in New and Screened is speculative; money in Submitted and Interview is at risk; money in Placed is earned or earning. Adding them into one mental picture flatters the pipeline. The sentence does not say whether a grand total is shown, whether empty cards count as zero, or whether placed money should sit alongside unplaced money at all (Q6). This is the number the owner will quote, so it must be defined before it is drawn `[A15]`.

**"A recruiter clicks a card"**
One role, one gesture. The recruiter is the user, the card is the object, and clicking is the beginning of the only interaction the board has.

**What it implies:** the primary loop is open a card, act, close. Nothing else on the page competes with it.
**What it costs:** "clicks" is written for a desk. The same gesture has to work under a thumb, which is a design commitment rather than a feature `[A14]`. It also leaves open what the click reveals: four buttons, or the candidate's details, notes and history as well (Q10).

**"logs what happened (called, left message, not interested, interview booked)"**
Four outcomes, treated as one list. They are not one kind of thing: two are attempts to reach someone, one is a refusal, one is progress.

**What it implies:** the card offers exactly these four, in these words, and logging one is how the board learns anything `[A21]`.
**What it costs:** the four outcomes need four different effects, and none is given. "Called" and "left message" are touches that may not change state. "Not interested" needs a destination that does not exist. "Interview booked" is the only one that plainly moves a card forward, and even then the move is to "Interview" — not to "Submitted" (Q2, Q3). If all four simply move the card on, the board will lie about progress by the end of the first week.

**"and the card moves on"**
Logging an outcome changes the card's column, without a separate drag or edit.

**What it implies:** the outcome and the stage are linked, and the recruiter should not have to do two actions.
**What it costs:** "moves on" assumes every logged outcome is progress. If a call with no answer also moves the card, the pipeline inflates and the totals inflate with it. If it does not move, then "the card moves on" is only true for some outcomes, and the sentence is describing one case as if it were all (Q2). The mapping from four outcomes to five columns is a business rule we have not been given `[A9]`.

**"with the totals changing at once"**
The column sums update in the same moment as the move. No refresh, no re-count, no waiting.

**What it implies:** the number at the top and the card in the column never disagree, and one action produces one visible result.
**What it costs:** "at once" is easy for one viewer and a real question for several. If two people have the board open, "at once" has to mean they see the same number at the same time, or it means nothing (Q8). It also raises the question of what happens when a move is made by mistake: if totals change instantly, is there a way back (Q11)? `[A22]`

**"Cards untouched for 3 days turn red"**
A visible warning, on the card, driven by elapsed time. The board is meant to be scanned for red rather than read.

**What it implies:** red is the board's alert, and it has to be accurate enough to be trusted; a card that is red when it was in fact touched yesterday trains the recruiter to ignore red.
**What it costs:** "untouched" is not defined. It could mean no logged outcome, no contact, or no stage change — three different cards would turn red on three different days (Q1, Q7). "3 days" is ambiguous across a weekend: a card touched on Friday is untouched for three calendar days by Monday, which is the normal working gap, not neglect. The rule also needs a threshold direction (exactly three days, or more than three) and a decision on never-contacted cards. Finally, colour alone is not readable by everyone, so red needs a second signal `[A11]`.

---

# 2. Check these first

The gaps and contradictions, listed. Each is the client's decision. I have not chosen a side in any of them, and the build cannot be accepted until each is answered.

**Q1 — What counts as "contact" for the days counter?**
The sentence counts days since last contact but never defines contact. The options are at least: any logged outcome, including an unanswered call; only a two-way conversation; only a substantive conversation that changed something. Each produces a different red list on the same day, and each sets a different logging habit. **You have to decide** which events reset the counter, and whether a message left counts as contact when nobody replied. `[A10]`

**Q2 — Do "called" and "left message" move the card?**
The sentence says logging an outcome moves the card on, but two of the four outcomes are attempts, not progress. **You have to decide** whether an attempt records a touch and leaves the card where it is, or advances it. If it advances, state to which column; "Interview" is plainly wrong for a call that was not answered.

**Q3 — Where does "not interested" go?**
There are five columns and no destination for a refusal. **You have to decide** whether the card is deleted, hidden, moved to a new column, or left in place with a marker. Deleting loses the record that the person was approached; leaving it in place distorts the column total and keeps a dead card on the board. This is the clearest contradiction in the sentence and it blocks the "not interested" outcome entirely.

**Q4 — Is one candidate one card, even across several roles?**
"Each candidate sits in one column" says one card per person. But a candidate can be submitted to two clients, or interviewing for one role while newly screened for another, and each may carry a different placement value. **You have to decide** whether the board is one card per candidate — in which case it shows only the furthest-along process and loses the others — or one card per candidate-per-role, in which case a person can appear twice and the "one candidate, one column" rule is false. `[A5]`

**Q5 — What exactly is the "placement value"?**
The card shows a value before a placement exists, so most values are expectations. **You have to decide** whether the number is the fee the agency will earn, an estimated fee from a rate, the candidate's salary, or the margin; whether it is entered per card or derived from a rule; and whether it can be edited after a card is created. Each choice changes the definition of every total on the page. `[A3][A4]`

**Q6 — Which money do the column totals include?**
"The money sitting in each column" treats speculative, at-risk and earned money as one kind. **You have to decide** whether the five sums are shown as five separate figures (as written), whether a grand total is also shown, and whether the Placed column's money — already earned — sits in the same strip as money that may never arrive. You also have to decide whether cards with no value count as zero and drag the average down. `[A15]`

**Q7 — Does "3 days" mean calendar days or working days, and from what event?**
Three calendar days spans a weekend; three working days does not. **You have to decide** the counting rule, whether the clock starts at the last logged outcome or the last actual contact, and what a card that has never been contacted shows. A New card with no contact at all will otherwise be red from the day it is created, which makes red meaningless on the busiest column.

**Q8 — One recruiter, or a team?**
"A recruiter" is singular, but "the top of the page" and "the totals changing at once" imply a shared view. **You have to decide** how many people open the board, whether they share one pipeline or own separate ones, who may see the money totals, and whether two people editing the same card is a real scenario. This decides whether the first build is a personal tool or a small team tool. `[A6][A7]`

**Q9 — How does a candidate get onto the board?**
The sentence starts with candidates already on the board. **You have to decide** whether candidates are typed in one at a time, brought in from the current tracker, or both; and whether there is an existing list, with existing columns and history, that must appear on day one `[A23]`. If there is, the board has to match it or the recruiter will keep both. `[A12]`

**Q10 — What does clicking a card open?**
Four outcomes are named, but a card probably also needs a name, a role, a value, a last-contact date and somewhere to write what was said. **You have to decide** the minimum a recruiter can see and edit on a card: only the four outcomes, or the record behind them as well. This is the difference between a status board and a working list. `[A16]`

**Q11 — Can a card move backwards, and can a logged outcome be corrected?**
Pipelines go backwards: an interview falls through, a submission is withdrawn. The sentence only moves cards on. **You have to decide** whether a card can be dragged or returned to an earlier column, and whether a logged outcome can be edited or removed. If it cannot, the first mistake permanently distorts the totals.

**Q12 — Is "Placed" the end?**
**You have to decide** whether a placed card stays in the Placed column indefinitely, moves off the board after a period, or is archived. If placed cards accumulate, the Placed total becomes a running history rather than a working figure, and the board grows until it is no longer scannable.

**Q13 — Currency, rounding, and what red is for.**
The sentence names no currency and no precision. **You have to decide** the single currency (or what happens with more than one), whether values are whole amounts or have decimals, and whether red is only a visual warning or also sorts cards, counts them, or triggers a reminder. Colour alone is not readable by every user, so a second signal is needed; that is a design consequence, not a choice about what red means.

**Q14 — Which action marks a placement?**
The board has a "Placed" column, but the only four outcomes are called, left message, not interested and interview booked. None of them is a placement. **You have to decide** whether a placement is a fifth outcome, a separate action on the card, or a stage that only an import or an admin can set. Until it is decided, the Placed column can hold cards that were seeded into it, but the product cannot record a new placement. `[A21]`

**The two that block everything else:** Q3 (no destination for a refusal) and Q5 (no definition of the money). A board can be drawn with the rest open; it cannot be correct with those two open. Q14 blocks the Placed column from being usable, not the rest of the board.

---

# 3. Who this is for

Three humans are involved. Only one of them is confirmed by the sentence.

**The recruiter — the primary user.** `[A6]`
Confirmed by the word "recruiter". They work a desk, carry a list of candidates, and are judged on how many conversations turn into placements. Their day is interrupted, so the board has to be readable in the seconds between calls.
*Trying to get done:* know, without thinking, who has gone quiet and who is closest to earning; record what just happened in a few seconds; trust that the money at the top is right.
*What they need from the board:* a scan that surfaces the neglected cards first, one obvious action per card, and totals that do not require re-counting.
*What will make them abandon it:* logging that takes longer than the call, red cards that are red for the wrong reason, and a total they have to check by hand.

**The owner or desk lead — the buyer, and possibly a viewer.** `[A7]`
Not named in the sentence. Usually the person who pays for the tool and asks "how much is in the pipeline?" They may never log an outcome; they may open the board once a day, or ask the recruiter for a screenshot.
*Trying to get done:* see where the money is concentrated and whether the desk is working its warmest candidates.
*What they need:* the five column sums, honest and current, and a board that can be understood without an explanation.
*What is unresolved:* whether they are a user at all, and whether they may see individual candidates or only totals (Q8).

**The person who loads the first candidates.** `[A12]`
Could be the recruiter, could be an assistant. This person exists in every real deployment and is named in no sentence.
*Trying to get done:* get the existing list onto the board once, correctly, without retyping everything or losing history.
*What they need:* a defined starting set — which candidates, which columns, which values, which last-contact dates.

**The candidate — the subject, not a user.**
They never open the board, but their name, status and expected fee are on it. That makes their data the client's responsibility, not a design detail (Q8, Section 8). `[A18]`

---

# 4. Scope, locked

What is in. Each item is a capability, not an implementation. Where an item cannot be finished without an answer, the question is named.

**S1 — One board with exactly five columns**, in the order given: New, Screened, Submitted, Interview, Placed. Every candidate on the board is in exactly one of them at any moment. `[A8]` "Placed" keeps the card on the board rather than removing it `[A25]`.
*Depends on:* Q3 (refusals have no column), Q4 (one card per candidate or per process).

**S2 — One card per candidate in the agreed sense**, carrying the candidate's name and the two facts the sentence asks for: days since last contact, and placement value. The method of creating and editing a candidate's core details is in scope only to the extent needed to keep the board populated. `[A5][A16]`
*Depends on:* Q4, Q5, Q9, Q10.

**S3 — Five money totals at the top of the page**, one for each column, each the sum of the values on the cards in that column. No card is counted in two columns. A grand total is **not** in scope until Q6 is answered. `[A15]`
*Depends on:* Q5, Q6, Q13.

**S4 — Clicking a card opens the logging action**, offering exactly the four outcomes in the client's words: called, left message, not interested, interview booked. No other outcome is invented, and nothing on the board is editable in bulk. `[A21][A24]`
*Depends on:* Q2, Q3, Q10.

**S5 — Logging an outcome updates the card and the totals in the same interaction**, using the outcome-to-stage and outcome-to-last-contact rules agreed in Q1, Q2 and Q7. The recruiter does not move the card separately. `[A9][A22]`
*Depends on:* Q1, Q2, Q7.

**S6 — A card untouched beyond the agreed threshold turns red**, using the counting rule agreed in Q7, with a second non-colour signal so the warning survives for users who cannot distinguish red.
*Depends on:* Q1, Q7, Q13.

**S7 — The board is usable on a desk screen and on a phone**, one column visible at a time on a narrow screen or a layout that keeps a single card readable without sideways scrolling, with tap targets large enough to use one-handed. `[A14]`

**S8 — The board opens with the working set already on it**, not an empty page: the candidates the client names as live at cutover, in the columns and with the values the client confirms. `[A12]`
*Depends on:* Q9, and the client's existing list.

**S9 — A single currency is displayed consistently on cards and totals**, with the client's chosen rounding. `[A17]`
*Depends on:* Q13.

Not in this scope, and the reason for each, is the next section.

---

# 5. Not building, and why

This is the list to read back to the client. Each line is something the sentence does not ask for, and something that would change the size of the project if it were added.

| Not building | Why |
|---|---|
| Candidate sourcing, matching, or pulling names from job listings | The sentence starts with candidates already known. Sourcing is a different product and a different buying decision. |
| Calling, mailing or messaging from the board | "Logs what happened" is a record of an action taken elsewhere. Sending is a channel product, with its own compliance and failure modes. |
| Calendar booking or interview scheduling | "Interview booked" is an outcome to record, not a booking to make. Booking is a separate connection to another service, with its own set of conflicts. |
| Role, client and vacancy records | The card is on the candidate and the sentence names no role object. This is out for now; if Q4 is answered "one card per candidate-per-role", a minimal role reference comes back into scope. Not a silent omission. |
| Offers, contracts, invoicing, payroll, commission calculation | The board holds a value, not a fee engine. Computing fees from rates and guarantees is a back-office product. |
| More than five pipeline stages | The five are named. "Offer", "Rejected", "On hold" and "Placed elsewhere" are refused here as scope, even though Q3 may force one of them back in. |
| Reporting, exports, charts, and historical trends | The only number the sentence asks for is the sum per column. Anything else is a reporting product and invites comparisons the data cannot yet support. |
| Reminders and alerts outside the page | Red is on the card. Notifications are a new channel, a new permission, and a new reason for the board to be ignored. |
| Search, filtering and sorting | Five columns and a small list do not need it yet; adding it early hides the real problem, which is cards in the wrong column. Revisit in Phase 3 if volume proves otherwise. |
| Team roles, permissions, and separate desks | Out until Q8 is answered. Building permissions before the user model is known is the most expensive way to guess. |
| Importing or continually refreshing from the current tracker | Out of Phase 1 by decision, not by oversight. The first loading is by hand or by a one-off agreed transfer (Q9). Keeping the two in step permanently is a much larger piece of work. |
| A full history of every edit | Out until Q11 is answered. If outcomes must be correctable, the minimum history needed to support that comes back in. |
| A native phone app or offline use | "Web app" plus a phone-readable board is the commitment. Store installs and offline work are not implied. |
| Automated suggestions, next-step advice, or scoring | Nothing in the sentence asks the board to advise. The board remembers; it does not recommend. |
| A candidate-facing portal or status page | The candidate is the subject of the record, not a user. |

---

# 6. Phasing

**Phase 0 — Answers.** No build work starts until Q3, Q5 and Q6 are answered, because they define what a card means and what the top of the page is counting. Q1, Q2, Q7, Q9 and Q13 are needed before the first card is logged. This phase costs the client an hour, not us a sprint.

**Phase 1 — The board, with the loop closed.**
S1 to S9, with the working set loaded and the four outcomes live. The board is drawn, cards move, totals change in the same interaction, and red appears on the agreed rule.
*Pass condition:* the recruiter runs one full working day from this board and never consults the old tracker; every column total is checked by hand against the cards at the end of that day and matches exactly; no card past the red threshold is unmarked.
*Still open at the end of Phase 1:* Q3's destination for refusals, if the client chooses "new column"; Q11's correction path, if mistakes are common.

**Phase 2 — Trust and correction.**
Whatever the answers to Q3, Q9, Q11 and Q12 require: the destination for a refusal, the first loading of the real list, a way to correct a logged outcome, and the rule for placed cards leaving or staying. `[A19]`
*Pass condition:* a refusal can be recorded without losing the person's history; a mistaken log can be corrected and the totals return to the hand-counted figure; the Placed column is still scannable after a month of use.

**Phase 3 — Widen only if Q8 says so.**
An owner's view, the agreed visibility rules, and search or filtering if the live board has outgrown five columns.
*Pass condition:* two people look at the same board and read the same totals; the owner can answer "where is the money?" without asking the recruiter.

Phases 2 and 3 do not begin until their questions are answered. Phase 1 does not begin until Q3, Q5 and Q6 are answered.

---

# 7. Success metrics

How we will know it worked, in numbers. Every target below is a proposal. Every baseline is unknown and must be captured from how the desk works today, before cutover, or there is nothing to compare against. `[A20]`

| Measure | Proposed target | Baseline needed |
|---|---|---|
| Time to log one outcome, from click to a moved card | Under 15 seconds | Time the same update takes in the current tracker |
| Share of cards whose last contact is accurate when spot-checked | 100% on a sample of 20, once a week | None — this is a trust floor |
| Column totals reconciled by hand at end of day | 100% match, every working day | Current hand-count error rate |
| Time to answer "who do I chase today?" from opening the board | Under 10 seconds to a first name | Time to answer it today |
| Red cards actioned on the day they turn red | At least 80% | Current share of overdue candidates chased same day |
| Cards with no logged outcome in the last agreed window | Falling week on week | Current count of neglected candidates |
| Days from cutover to the old tracker being closed for good | Within the first month | How long the last tool change took |
| Share of cards with a placement value recorded | 100% of live cards | Current share of records with a fee noted |

The single number that matters most is the reconciliation row: if the totals at the top cannot be matched to the cards by hand, the board has failed at the only thing the owner will look at.

---

# 8. Open dependencies

What I am waiting on, and from whom.

1. **Answers to Q1–Q13.** The client, before Phase 1.
2. **The fee rule behind "placement value"** — how the number is arrived at and when it changes (Q5).
3. **The definition of a touch** and whether attempts count (Q1).
4. **The working week and any public holidays** that affect the three-day rule (Q7).
5. **The current tracker and a list of live candidates** — names, stages, values, last-contact dates — as it exists today (Q9, S8).
6. **A decision on refusals** — where a "not interested" candidate goes, and whether their record is kept (Q3).
7. **The user model** — how many people, whether they share one desk, and who may see money (Q8).
8. **The currency and rounding** used on the desk today (Q13).
9. **Permission to hold candidate personal data**, and any retention rule the client already follows `[A18]`.
10. **Brand material** — colours, logo, type — for anything shown outside the desk. None is present in the project folder `[A19]`.
11. **Baseline numbers** for Section 7, from the current way of working.
12. **The path into Placed** — which action marks a placement (Q14), and whether it is one of the four outcomes or a separate one.
13. **A deadline and a budget** for Phase 1. Neither has been supplied `[A19]`.

---

# Assumptions

Every place a real client would normally have told us and did not. Referenced inline as `[A#]`.

- **A1** — The client is a recruitment or staffing agency, and a "placement" is a successful hire that earns the agency a fee.
- **A2** — "Follow-up" means chasing the candidate, not the client or the role.
- **A3** — "Placement value" is one money amount attached to a candidate, visible on the card, not a rate or a formula.
- **A4** — The amount is the fee the agency expects or earns, not the candidate's salary or the agency's margin. This is unconfirmed and is Q5.
- **A5** — "Each candidate sits in one column" means one card per candidate, and a person cannot appear twice on the board.
- **A6** — There is one primary recruiter using the board, on one desk.
- **A7** — At least one other person (owner or desk lead) may view the board and the totals.
- **A8** — The five columns are in the order given and that order is the working order of the pipeline.
- **A9** — Each outcome has a defined effect on stage and on last contact, but the mapping has not been supplied.
- **A10** — Last contact is recorded by the recruiter when they log an outcome; the board does not observe calls or messages by itself.
- **A11** — "Untouched" means no logged outcome, and "3 days" is a placeholder pending Q1 and Q7. Red needs a non-colour signal alongside it.
- **A12** — Candidates are entered or transferred into the board once at the start; no live two-way link with the current tracker is expected.
- **A13** — The board has no settings, preferences or configuration area in Phase 1.
- **A14** — The board is used on a desk screen and a phone. This comes from the harness's design rules, not from the client.
- **A15** — The five column sums sit on one line at the top; a grand total is not assumed.
- **A16** — A card shows at least a name, the days since contact and the value; the rest of the record is undecided (Q10).
- **A17** — One currency, matching the client's existing records. The currency itself is unknown.
- **A18** — The client already holds the candidate data lawfully and is permitted to keep and display it to its recruiters.
- **A19** — No deadline, budget, or brand material has been supplied, and every Section 7 target is a proposal.
- **A20** — No baseline exists yet for any Section 7 measure.
- **A21** — The four outcomes are the vocabulary the client named. The sentence gives no outcome that reaches "Placed" (Q14); that is a contradiction in the idea, not an assumption.
- **A22** — "At once" means the card and the totals update within the same interaction, with no manual refresh.
- **A23** — There is an existing tracker, with live candidates in it, that the board is meant to take over from.
- **A24** — The board is read-only outside the logging action; there is no bulk edit.
- **A25** — "Placed" is a stage a card reaches while still on the board; what happens to it afterwards is Q12.

---

*End of DRAFT. Section 2 is the client's to answer. Nothing in this document should be treated as a decision that has been made.*
