-- FitDesk cloud storage for ONE owner account across multiple devices.
-- Run in the SQL Editor of the user's own Supabase project.
-- IMPORTANT: Never place a secret/service_role key in public GitHub code.

create table if not exists public.fitdesk_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now()
);

alter table public.fitdesk_state enable row level security;
revoke all on table public.fitdesk_state from anon, authenticated;
grant select, insert, update on public.fitdesk_state to authenticated;

drop policy if exists "fitdesk_select_own" on public.fitdesk_state;
drop policy if exists "fitdesk_insert_own" on public.fitdesk_state;
drop policy if exists "fitdesk_update_own" on public.fitdesk_state;

create policy "fitdesk_select_own" on public.fitdesk_state
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "fitdesk_insert_own" on public.fitdesk_state
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "fitdesk_update_own" on public.fitdesk_state
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Each user sees only one private JSON document. To avoid accidental
-- overwrites across devices, the web app does conditional updates
-- WHERE user_id = auth.uid() AND revision = last_known_revision.
-- There is intentionally no anonymous SELECT/INSERT/UPDATE grant.
