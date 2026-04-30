-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email        text not null default '',
  avatar_url   text,
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: own row only"
  on public.profiles for all
  using  (auth.uid() = id)
  with check (auth.uid() = id);

-- auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- evidence_records
-- ============================================================
create table if not exists public.evidence_records (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references auth.users(id) on delete cascade,
  jurisdiction    text not null,
  statute         text not null,
  article_section text not null,
  pillar          text not null,
  confidence      float not null,
  status          text not null,
  excerpt         text not null default '',
  rationale       text not null default '',
  source_url      text not null default '',
  extracted_at    timestamptz not null default now()
);

alter table public.evidence_records enable row level security;

create policy "evidence_records: own rows"
  on public.evidence_records for select
  using (auth.uid() = workspace_id);

-- ============================================================
-- mapping_activity
-- ============================================================
create table if not exists public.mapping_activity (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references auth.users(id) on delete cascade,
  jurisdiction text not null,
  detail       text not null,
  occurred_at  timestamptz not null default now()
);

alter table public.mapping_activity enable row level security;

create policy "mapping_activity: own rows"
  on public.mapping_activity for select
  using (auth.uid() = workspace_id);

-- ============================================================
-- newsletter_signups
-- ============================================================
create table if not exists public.newsletter_signups (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  signed_up_at timestamptz not null default now()
);

alter table public.newsletter_signups enable row level security;

-- anon can insert only; nobody can select via client
create policy "newsletter_signups: insert only"
  on public.newsletter_signups for insert
  with check (true);

-- ============================================================
-- Seed data (evidence_records + mapping_activity)
-- NOTE: Replace the workspace_id below with your real user UUID
-- after signing in for the first time, or run this as a function
-- that inserts for all existing users.
--
-- To find your UUID: SELECT id FROM auth.users LIMIT 5;
-- Then replace '00000000-0000-0000-0000-000000000000' below.
-- ============================================================

-- Uncomment and replace UUID to seed for a specific user:
/*
do $$
declare
  wid uuid := '00000000-0000-0000-0000-000000000000'; -- replace with your auth.users id
begin
  insert into public.evidence_records
    (workspace_id, jurisdiction, statute, article_section, pillar, confidence, status, excerpt, rationale, source_url, extracted_at)
  values
    (wid,'Singapore','Personal Data Protection Act 2012 (PDPA)','Section 26','pillar_7',0.94,'verified',
     'An organisation shall not transfer any personal data to a country or territory outside Singapore except in accordance with requirements prescribed under this Act.',
     'Imposes restrictions on cross-border personal data transfers, requiring compliance with prescribed safeguards before data leaves Singapore.',
     'https://sso.agc.gov.sg/Act/PDPA2012','2026-04-24T14:22:00Z'),
    (wid,'Kenya','Data Protection Act 2019','Section 48','pillar_6',0.91,'verified',
     'A data controller or data processor shall not transfer personal data to another country unless that country or territory has commensurate data protection safeguards or the transfer is necessary for the performance of a contract.',
     'Establishes cross-border data transfer conditions requiring adequacy or contractual necessity, directly mapping to Pillar 6 cross-border data policies.',
     'http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/2019/TheDataProtectionAct__No24of2019.pdf','2026-04-24T15:08:00Z'),
    (wid,'Nigeria','Nigeria Data Protection Act 2023 (NDPA)','Section 43(1)','pillar_6',0.88,'verified',
     'A data controller shall not transfer personal data to a foreign country unless the Commission has determined that the foreign country ensures an adequate level of protection of personal data.',
     'Requires adequacy determination by the Nigeria Data Protection Commission before cross-border transfers, a core Pillar 6 restriction.',
     'https://ndpc.gov.ng/Files/Nigeria_Data_Protection_Act_2023.pdf','2026-04-24T16:45:00Z'),
    (wid,'Singapore','Personal Data Protection Act 2012 (PDPA)','Section 24','pillar_7',0.92,'verified',
     'An organisation shall make, on or before collecting personal data, a reasonable effort to ensure that the individual is aware of the purposes for the collection, use or disclosure of the personal data.',
     'Establishes consent and notification obligations for personal data collection, a core Pillar 7 domestic data protection requirement.',
     'https://sso.agc.gov.sg/Act/PDPA2012','2026-04-24T14:35:00Z'),
    (wid,'Kenya','Data Protection Act 2019','Section 30','pillar_7',0.86,'needs_review',
     'A data controller or data processor shall ensure that personal data is not kept for longer than is necessary for the purpose for which it was collected.',
     'Imposes data retention limits, mapping to Pillar 7 domestic data protection. Flagged for review due to broad scope language.',
     'http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/2019/TheDataProtectionAct__No24of2019.pdf','2026-04-24T15:22:00Z');

  insert into public.mapping_activity (workspace_id, jurisdiction, detail, occurred_at)
  values
    (wid,'Nigeria','3 new Pillar 6 clauses extracted from NDPA 2023','2026-04-24T16:50:00Z'),
    (wid,'Singapore','Section 26 PDPA verified — cross-border transfer restriction confirmed','2026-04-24T14:30:00Z');
end $$;
*/
