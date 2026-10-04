-- RME anonymous usage events (lib/eventStore.ts, app/api/events/route.ts).
-- Run once in Supabase → SQL Editor. Then set in Netlify:
--   RME_EVENTS_SUPABASE_URL = https://<project>.supabase.co
--   RME_EVENTS_SUPABASE_KEY = the project's anon (public) key
-- The anon key can only INSERT a known event with small props; it can never
-- read, change or delete a row. Read the table in the Supabase dashboard.
-- No personal data: props are cleaned by lib/rmeEvents.ts (no e-mail, no
-- phone, no IP address, no cookie).

create table if not exists public.rme_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  event text not null,
  props jsonb not null default '{}'::jsonb
);

create index if not exists rme_events_created_at on public.rme_events (created_at);
create index if not exists rme_events_event on public.rme_events (event, created_at);

alter table public.rme_events enable row level security;

drop policy if exists rme_events_insert_only on public.rme_events;
create policy rme_events_insert_only on public.rme_events
  for insert to anon
  with check (
    event in ('page_view', 'partner_click', 'route_computed', 'reality_check_used', 'reality_check_cta', 'remittance_result_viewed', 'hadak_next_action', 'hadak_trust_why', 'hadak_voice_listen', 'hadak_voice_input')
    and jsonb_typeof(props) = 'object'
    and pg_column_size(props) < 2048
  );

-- Keep this list in sync with RME_EVENTS in lib/rmeEvents.ts
-- (__tests__/eventStore.test.ts checks it).

-- Useful queries (dashboard):
-- Partner clicks per partner, last 30 days:
--   select props->>'partner' as partner, props->>'product' as product, count(*)
--   from rme_events where event = 'partner_click' and created_at > now() - interval '30 days'
--   group by 1, 2 order by 3 desc;
-- Funnel per day:
--   select date_trunc('day', created_at) as day,
--          count(*) filter (where event = 'page_view') as views,
--          count(*) filter (where event = 'route_computed') as routes,
--          count(*) filter (where event = 'partner_click') as partner_clicks
--   from rme_events group by 1 order by 1 desc;
