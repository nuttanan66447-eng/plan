-- ArchiPlan Studio schema
create extension if not exists pgcrypto;

-- House plans catalogue -------------------------------------------------------
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_en text not null,
  name_th text not null,
  series text,
  style text not null check (style in ('nordic','japandi','tropical','modern','minimal')),
  storeys smallint not null check (storeys between 1 and 4),
  area_sqm numeric(7,1) not null,
  floor_areas jsonb not null default '[]'::jsonb,
  bedrooms smallint not null,
  bathrooms smallint not null,
  parking smallint not null default 2,
  land_width numeric(5,1),
  land_depth numeric(5,1),
  min_land_sqwa numeric(6,1),
  build_cost_min numeric(6,2) not null, -- million THB
  build_cost_max numeric(6,2) not null,
  price integer not null,              -- blueprint set price THB
  price_original integer,
  badge text,
  tagline text,
  description text,
  image text not null,
  gallery text[] not null default '{}',
  features text[] not null default '{}', -- tour360 | dollhouse | universal | pool | narrow
  pages_arch smallint default 38,
  pages_struct smallint default 24,
  pages_mep smallint default 18,
  is_published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);
create index plans_published_idx on public.plans (is_published, sort_order);

-- Sample bill of quantities per plan ------------------------------------------
create table public.boq_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  section_no smallint not null,
  section_name text not null,
  item_no text not null,
  description text not null,
  spec text,
  qty numeric(10,2) not null,
  unit text not null,
  material_rate numeric(12,2) not null default 0,
  labor_rate numeric(12,2) not null default 0,
  sort_order integer not null default 0
);
create index boq_items_plan_idx on public.boq_items (plan_id, sort_order);

-- Built portfolio --------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  style_label text,
  district text not null,
  province text not null default 'ร้อยเอ็ด',
  plan_code text references public.plans(code) on update cascade on delete set null,
  area_sqm numeric(7,1),
  bedrooms smallint,
  bathrooms smallint,
  budget_million numeric(6,2),
  highlight text,
  description text,
  quote text,
  quote_by text,
  handover_on date,
  image text not null,
  before_image text,
  featured boolean not null default false,
  is_published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);
create index projects_plan_code_idx on public.projects (plan_code);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  district text,
  rating smallint not null default 5 check (rating between 1 and 5),
  body text not null,
  is_published boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

-- Leads / orders / bookings from every form on the site ------------------------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('consult','custom_design','inspection','turnkey','boq','order','callback')),
  status text not null default 'new' check (status in ('new','contacted','quoted','won','lost')),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  email text check (email is null or char_length(email) <= 200),
  line_id text check (line_id is null or char_length(line_id) <= 80),
  province text,
  district text,
  plan_code text,
  service_package text,
  land_width numeric(6,1),
  land_depth numeric(6,1),
  area_sqm numeric(7,1),
  budget text,
  estimate_thb integer,
  preferred_date date,
  preferred_slot text,
  message text check (message is null or char_length(message) <= 4000),
  meta jsonb not null default '{}'::jsonb,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_created_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);

-- Admins -----------------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- Row level security -------------------------------------------------------------
alter table public.plans enable row level security;
alter table public.boq_items enable row level security;
alter table public.projects enable row level security;
alter table public.reviews enable row level security;
alter table public.leads enable row level security;
alter table public.admins enable row level security;

create policy "plans readable" on public.plans for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "plans admin insert" on public.plans for insert to authenticated with check ((select public.is_admin()));
create policy "plans admin update" on public.plans for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "plans admin delete" on public.plans for delete to authenticated using ((select public.is_admin()));

create policy "boq readable" on public.boq_items for select to anon, authenticated using (true);
create policy "boq admin insert" on public.boq_items for insert to authenticated with check ((select public.is_admin()));
create policy "boq admin update" on public.boq_items for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "boq admin delete" on public.boq_items for delete to authenticated using ((select public.is_admin()));

create policy "projects readable" on public.projects for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "projects admin insert" on public.projects for insert to authenticated with check ((select public.is_admin()));
create policy "projects admin update" on public.projects for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "projects admin delete" on public.projects for delete to authenticated using ((select public.is_admin()));

create policy "reviews readable" on public.reviews for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "reviews admin insert" on public.reviews for insert to authenticated with check ((select public.is_admin()));
create policy "reviews admin update" on public.reviews for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "reviews admin delete" on public.reviews for delete to authenticated using ((select public.is_admin()));

-- anyone may submit a lead, but only as a fresh "new" lead without admin fields
create policy "leads public insert" on public.leads for insert to anon, authenticated
  with check (status = 'new' and admin_note is null);
create policy "leads admin read" on public.leads for select to authenticated
  using ((select public.is_admin()));
create policy "leads admin update" on public.leads for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "leads admin delete" on public.leads for delete to authenticated
  using ((select public.is_admin()));

create policy "admins self read" on public.admins for select to authenticated
  using (user_id = (select auth.uid()));
