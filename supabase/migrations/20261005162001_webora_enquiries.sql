-- Public intake uses the Edge Function. There is deliberately no direct anon
-- INSERT policy: allowing that would bypass validation, rate limits and emails.
create table public.project_enquiries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  payload_hash text not null check (length(payload_hash) = 64),
  created_at timestamptz not null default now(),
  consent_at timestamptz not null default now(),
  full_name text not null check (length(full_name) between 2 and 100),
  business_name text not null check (length(business_name) between 2 and 150),
  email text not null check (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null check (length(phone) between 7 and 30),
  instagram text not null default '' check (length(instagram) <= 500),
  business_category text not null check (business_category in ('Retail / fashion','Restaurant / café','Real estate','Automotive','Professional services','Health / beauty','Personal brand','Startup','Other')),
  business_description text not null check (length(business_description) between 15 and 2000),
  existing_website boolean not null default false,
  existing_website_url text not null default '' check (length(existing_website_url) <= 500),
  project_type text not null check (project_type in ('Business website','Landing page','E-commerce','Portfolio','Website redesign','Custom interactive website','Not sure')),
  estimated_pages text not null check (estimated_pages in ('1','2–5','6–10','10+','Not sure')),
  features text[] not null check (cardinality(features) between 1 and 16 and features <@ array['Enquiry forms','WhatsApp','Payments','E-commerce','Booking','Product catalogue','Blog / CMS','Maps','Customer accounts','Admin / dashboard','Animations','Interactive 3D','SEO foundations','Analytics','Other','Not sure']::text[]),
  budget_range text not null check (budget_range in ('Recommend a budget','I have a budget in mind','Let’s discuss the scope first')),
  timeline text not null check (timeline in ('ASAP','2–4 weeks','1–2 months','2+ months','Flexible / unsure')),
  additional_requirements text not null default '' check (length(additional_requirements) <= 4000),
  source text not null default 'direct' check (source in ('instagram','direct','referral','google','other')),
  utm jsonb not null default '{}'::jsonb check (jsonb_typeof(utm) = 'object' and octet_length(utm::text) <= 2000),
  status text not null default 'new' check (status in ('new','reviewing','contacted','qualified','proposal_sent','won','lost','spam')),
  check (not existing_website or existing_website_url ~ '^https?://[^[:space:]]+$')
);
create index project_enquiries_status_created on public.project_enquiries (status, created_at desc);

create table public.enquiry_rate_limits (
  rate_key text primary key check (length(rate_key) = 64),
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts > 0)
);

create table public.enquiry_email_jobs (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.project_enquiries(id) on delete cascade,
  kind text not null check (kind in ('client','studio')),
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  next_attempt_at timestamptz not null default now(),
  lease_token uuid,
  lease_until timestamptz,
  sent_at timestamptz,
  unique (enquiry_id, kind)
);
create index enquiry_email_jobs_pending on public.enquiry_email_jobs (next_attempt_at) where status in ('pending','processing');

alter table public.project_enquiries enable row level security;
alter table public.enquiry_rate_limits enable row level security;
alter table public.enquiry_email_jobs enable row level security;
revoke all on public.project_enquiries, public.enquiry_rate_limits, public.enquiry_email_jobs from public, anon, authenticated;
grant select, insert, update, delete on public.project_enquiries, public.enquiry_rate_limits, public.enquiry_email_jobs to service_role;

create function public.intake_project_enquiry(p_lead jsonb, p_rate_key text, p_payload_hash text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_submission uuid := (p_lead->>'submission_id')::uuid;
  v_existing public.project_enquiries%rowtype;
  v_attempts integer;
  v_id uuid;
begin
  -- Serialize identical keys across concurrent requests; retries commit once.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_submission::text, 0));
  select * into v_existing from public.project_enquiries where submission_id = v_submission;
  if found then
    if v_existing.payload_hash <> p_payload_hash then return jsonb_build_object('conflict', true); end if;
    return jsonb_build_object('id', v_existing.id);
  end if;
  insert into public.enquiry_rate_limits as current (rate_key) values (p_rate_key)
  on conflict (rate_key) do update set
    attempts = case when current.window_started_at < now() - interval '10 minutes' then 1 else current.attempts + 1 end,
    window_started_at = case when current.window_started_at < now() - interval '10 minutes' then now() else current.window_started_at end
  returning attempts into v_attempts;
  if v_attempts > 5 then return jsonb_build_object('rate_limited', true); end if;
  insert into public.project_enquiries (submission_id, payload_hash, full_name, business_name, email, phone, instagram, business_category, business_description, existing_website, existing_website_url, project_type, estimated_pages, features, budget_range, timeline, additional_requirements, source, utm)
  values (v_submission, p_payload_hash, p_lead->>'full_name', p_lead->>'business_name', p_lead->>'email', p_lead->>'phone', coalesce(p_lead->>'instagram',''), p_lead->>'business_category', p_lead->>'business_description', (p_lead->>'existing_website')::boolean, coalesce(p_lead->>'existing_website_url',''), p_lead->>'project_type', p_lead->>'estimated_pages', array(select jsonb_array_elements_text(p_lead->'features')), p_lead->>'budget_range', p_lead->>'timeline', coalesce(p_lead->>'additional_requirements',''), coalesce(p_lead->>'source','direct'), coalesce(p_lead->'utm','{}'::jsonb))
  returning id into v_id;
  insert into public.enquiry_email_jobs (enquiry_id, kind) values (v_id, 'client'), (v_id, 'studio');
  return jsonb_build_object('id', v_id);
end;
$$;
revoke all on function public.intake_project_enquiry(jsonb,text,text) from public, anon, authenticated;
grant execute on function public.intake_project_enquiry(jsonb,text,text) to service_role;

create function public.claim_enquiry_emails(p_enquiry_id uuid default null, p_limit integer default 8)
returns table(id uuid, enquiry_id uuid, kind text, lease_token uuid, attempts integer, enquiry jsonb)
language plpgsql security invoker set search_path = '' as $$
begin
  update public.enquiry_email_jobs j set status = 'failed', lease_token = null, lease_until = null
  where j.status = 'processing' and j.lease_until < now() and j.attempts >= 8;
  return query
  with picked as (
    select j.id from public.enquiry_email_jobs j
    where (p_enquiry_id is null or j.enquiry_id = p_enquiry_id) and j.attempts < 8 and
      ((j.status = 'pending' and j.next_attempt_at <= now()) or (j.status = 'processing' and j.lease_until < now()))
    order by j.next_attempt_at limit least(greatest(p_limit,1),20) for update skip locked
  ), leased as (
    update public.enquiry_email_jobs j set status = 'processing', attempts = j.attempts + 1,
      lease_token = gen_random_uuid(), lease_until = now() + interval '3 minutes'
    from picked where j.id = picked.id
    returning j.id, j.enquiry_id, j.kind, j.lease_token, j.attempts
  )
  select l.id, l.enquiry_id, l.kind, l.lease_token, l.attempts, to_jsonb(e) - 'payload_hash'
  from leased l join public.project_enquiries e on e.id = l.enquiry_id;
end;
$$;
revoke all on function public.claim_enquiry_emails(uuid,integer) from public, anon, authenticated;
grant execute on function public.claim_enquiry_emails(uuid,integer) to service_role;

-- Server-side maintenance. Schedule daily through a trusted scheduler.
create function public.cleanup_enquiry_rate_limits() returns void
language sql security invoker set search_path = '' as $$
  delete from public.enquiry_rate_limits where window_started_at < now() - interval '1 day';
$$;
revoke all on function public.cleanup_enquiry_rate_limits() from public, anon, authenticated;
grant execute on function public.cleanup_enquiry_rate_limits() to service_role;
