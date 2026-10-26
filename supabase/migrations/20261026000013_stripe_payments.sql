-- Online payment (Stripe Checkout) for blueprint orders, shop orders and course enrolments
alter table public.leads
  add column stripe_session_id text,
  add column paid_amount integer check (paid_amount is null or paid_amount >= 0),
  add column paid_at timestamptz;

-- course enrolments get an order number too, so they can be paid and tracked
alter policy "leads public insert" on public.leads
  with check (
    status = 'new' and admin_note is null
    and carrier is null and tracking_no is null and order_updated_at is null
    and stripe_session_id is null and paid_amount is null and paid_at is null
    and (order_status is null or order_status = 'pending_payment')
    and (order_no is null or type in ('order', 'course'))
  );

create or replace function public.track_order(p_order_no text, p_phone text)
returns table (order_no text, plan_code text, service_package text, estimate_thb integer, order_status text,
               carrier text, tracking_no text, created_at timestamptz, order_updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select l.order_no, l.plan_code, l.service_package, l.estimate_thb, l.order_status,
         l.carrier, l.tracking_no, l.created_at, l.order_updated_at
  from public.leads l
  where l.type in ('order', 'course')
    and l.order_no = upper(trim(p_order_no))
    and length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) >= 9
    and regexp_replace(l.phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g')
  limit 1;
$$;

-- Secrets the database checks itself; not exposed through the API
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.app_secrets (name text primary key, value text not null);
revoke all on private.app_secrets from public, anon, authenticated;

-- Called by the site's Stripe webhook (after it verified Stripe's signature) to mark an order paid.
-- p_token must match private.app_secrets 'payment_webhook'; the amount must cover the order total.
create or replace function public.mark_order_paid(p_token text, p_order_no text, p_session text, p_amount integer)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  expected text;
  n integer;
begin
  select value into expected from private.app_secrets where name = 'payment_webhook';
  if expected is null or p_token is distinct from expected then
    return false;
  end if;
  update public.leads l
     set order_status = 'paid',
         stripe_session_id = p_session,
         paid_amount = p_amount,
         paid_at = now(),
         order_updated_at = now()
   where l.order_no = upper(trim(p_order_no))
     and l.type in ('order', 'course')
     and coalesce(l.order_status, 'pending_payment') = 'pending_payment'
     and p_amount >= coalesce(l.estimate_thb, 0);
  get diagnostics n = row_count;
  return n > 0;
end;
$$;
revoke all on function public.mark_order_paid(text, text, text, integer) from public;
grant execute on function public.mark_order_paid(text, text, text, integer) to anon, authenticated;
-- the token itself is inserted separately (not stored in git):
-- insert into private.app_secrets values ('payment_webhook', '<random>') on conflict (name) do update set value = excluded.value;
