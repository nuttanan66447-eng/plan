-- 1) Public preview: sample sheet images and a sample PDF shown on the plan page
alter table public.plans add column sheet_images jsonb not null default '[]'::jsonb;
alter table public.plans add column sample_pdf text;
update storage.buckets
  set allowed_mime_types = array['image/jpeg','image/png','image/webp','model/gltf-binary','application/octet-stream','application/pdf']
  where id = 'plan-images';

-- 2) Private deliverables (full drawing set, structural calcs, BOQ, BIM/SKP/DWG): only paid customers get them,
--    through the order-files edge function which hands out short-lived signed links.
insert into storage.buckets (id, name, public, file_size_limit)
values ('plan-files', 'plan-files', false, 52428800)
on conflict (id) do nothing;

create policy "plan files admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'plan-files' and (select public.is_admin()));
create policy "plan files admin select" on storage.objects for select to authenticated
  using (bucket_id = 'plan-files' and (select public.is_admin()));
create policy "plan files admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'plan-files' and (select public.is_admin()));

create table public.plan_files (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  kind text not null check (kind in ('blueprint','structural','boq','cad','render','other')),
  name text not null check (char_length(name) between 1 and 200),
  path text not null unique,
  size bigint,
  created_at timestamptz not null default now()
);
create index plan_files_plan_idx on public.plan_files (plan_id);
alter table public.plan_files enable row level security;
create policy "plan files rows admin" on public.plan_files for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
