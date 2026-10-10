-- Order tracking: order number + fulfilment status + parcel tracking on "order" leads
alter table public.leads
  add column order_no text unique check (order_no is null or order_no ~ '^NB[0-9]{6}-[A-Z0-9]{4}$'),
  add column order_status text check (order_status is null or order_status in ('pending_payment','paid','preparing','shipped','delivered','cancelled')),
  add column carrier text check (carrier is null or carrier in ('thaipost','kerry','flash','jt','other')),
  add column tracking_no text check (tracking_no is null or char_length(tracking_no) <= 60),
  add column order_updated_at timestamptz;

-- visitors may only create a fresh order (no fulfilment fields)
alter policy "leads public insert" on public.leads
  with check (
    status = 'new' and admin_note is null
    and carrier is null and tracking_no is null and order_updated_at is null
    and (order_status is null or order_status = 'pending_payment')
    and (order_no is null or type = 'order')
  );

-- Customers look up their own order with the order number + the phone used to order (no account needed).
create or replace function public.track_order(p_order_no text, p_phone text)
returns table (order_no text, plan_code text, service_package text, estimate_thb integer, order_status text,
               carrier text, tracking_no text, created_at timestamptz, order_updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select l.order_no, l.plan_code, l.service_package, l.estimate_thb, l.order_status,
         l.carrier, l.tracking_no, l.created_at, l.order_updated_at
  from public.leads l
  where l.type = 'order'
    and l.order_no = upper(trim(p_order_no))
    and length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) >= 9
    and regexp_replace(l.phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g')
  limit 1;
$$;
revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;
