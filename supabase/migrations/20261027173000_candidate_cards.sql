-- Candidate follow-up board schema and demo data.
-- Run once on a fresh Supabase project. The live demo project already has this applied.
-- The policies are open on purpose for the demo; see README.md before using real data.

create table if not exists public.candidate_cards (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  person_name           text not null check (length(trim(person_name)) > 0),
  role_title            text not null default '',
  client                text not null default '',
  stage                 text not null default 'new'
                          check (stage in ('new', 'screened', 'submitted', 'interview', 'placed')),
  placement_value_paise bigint not null default 0
                          check (placement_value_paise >= 0),
  currency              text not null default 'INR'
                          check (length(currency) = 3),
  last_contact_at       timestamptz not null default now(),
  last_outcome          text
                          check (last_outcome in ('called', 'left message', 'not interested', 'interview booked')),
  last_note             text,
  archived_at           timestamptz
);

create index if not exists candidate_cards_live_idx
  on public.candidate_cards (archived_at, stage, last_contact_at);

alter table public.candidate_cards enable row level security;

drop policy if exists "candidate_cards_select" on public.candidate_cards;
drop policy if exists "candidate_cards_insert" on public.candidate_cards;
drop policy if exists "candidate_cards_update" on public.candidate_cards;
drop policy if exists "candidate_cards_delete" on public.candidate_cards;

create policy "candidate_cards_select"
  on public.candidate_cards for select
  to anon, authenticated
  using (true);

create policy "candidate_cards_insert"
  on public.candidate_cards for insert
  to anon, authenticated
  with check (true);

create policy "candidate_cards_update"
  on public.candidate_cards for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "candidate_cards_delete"
  on public.candidate_cards for delete
  to anon, authenticated
  using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.candidate_cards to anon, authenticated;

-- Demo rows. Guarded so re-running the file does not duplicate them.
insert into public.candidate_cards
  (person_name, role_title, client, stage, placement_value_paise, last_contact_at, last_outcome, last_note)
select * from (values
  ('Aarav Mehta',     'Senior Data Engineer',      'Northwind Retail',     'new',       15000000::bigint, now() - interval '5 days' - interval '20 minutes', 'called',           'Left a voicemail; try again after lunch'),
  ('Kavya Reddy',     'Data Analyst',              'Lakemont Insurance',   'new',       12000000::bigint, now() - interval '7 days' - interval '20 minutes', null,               'New intro; send the role brief'),
  ('Ishan Gupta',     'Mechanical Engineer',       'Ironwood Projects',    'new',       14000000::bigint, now() - interval '9 days' - interval '20 minutes', 'left message',     'No reply to two messages'),
  ('Zoya Khan',       'Technical Recruiter',       'Brightlane Tech',      'new',       11000000::bigint, now() - interval '2 days' - interval '20 minutes', null,               'Sourced from a referral'),
  ('Priya Sharma',    'SAP FICO Consultant',       'Vertex Manufacturing', 'screened',  22000000::bigint, now() - interval '3 days',                           'called',           'Client is reviewing the shortlist'),
  ('Marcus Tan',      'Product Designer',          'Harbour Fintech',      'screened',  20000000::bigint, now() - interval '1 day',                            'called',           'Portfolio review booked'),
  ('Ananya Nair',     'HR Business Partner',       'Northwind Retail',     'screened',  16500000::bigint, now() - interval '4 days',                           'left message',     'Waiting on salary expectation'),
  ('Neel Verma',      'Site Reliability Engineer', 'Kestrel Mobility',     'screened',  21000000::bigint, now() - interval '4 hours',                          'called',           'Happy to proceed; send the job description'),
  ('Sneha Kulkarni',  'QA Automation Lead',        'Meridian Bank',        'submitted', 26000000::bigint, now() - interval '6 days',                           'interview booked', 'Client wants a technical round'),
  ('Oliver Bennett',  'Senior Backend Engineer',   'Helios Energy',        'submitted', 28000000::bigint, now() - interval '12 days',                          'left message',     'Went quiet after submission'),
  ('Fatima Al Zaabi', 'DevOps Engineer',           'Dune Systems',         'submitted', 30000000::bigint, now() - interval '2 days',                           'called',           'Rate card shared; awaiting reply'),
  ('Arjun Rao',       'Full Stack Developer',      'Brightlane Tech',      'submitted', 19500000::bigint, now() - interval '5 days',                           null,               'Submitted; no feedback yet'),
  ('Rohan Iyer',      'React Developer',           'Brightlane Tech',      'interview', 18000000::bigint, now() - interval '1 day',                            'interview booked', 'Interview confirmed for Thursday'),
  ('Meera Joshi',     'Embedded Systems Engineer', 'Kestrel Mobility',     'interview', 24000000::bigint, now() - interval '2 days',                           'interview booked', 'Panel feedback due today'),
  ('Daniel Okafor',   'Cloud Architect',           'Helios Energy',        'interview', 34000000::bigint, now() - interval '4 hours',                          'called',           'Final round went well'),
  ('Vikram Sethi',    'Engineering Manager',       'Meridian Bank',        'placed',    36000000::bigint, now() - interval '1 day',                            'called',           'Week 2 check-in done'),
  ('Nisha Pillai',    'Business Analyst',          'Lakemont Insurance',   'placed',    17500000::bigint, now() - interval '2 days',                           'left message',     'Timesheet reminder sent'),
  ('Sameer Khan',     'Cybersecurity Analyst',     'Vertex Manufacturing', 'placed',    25000000::bigint, now() - interval '4 hours',                          'called',           'Placement confirmed; onboarding Monday')
) as v(person_name, role_title, client, stage, placement_value_paise, last_contact_at, last_outcome, last_note)
where not exists (select 1 from public.candidate_cards);
