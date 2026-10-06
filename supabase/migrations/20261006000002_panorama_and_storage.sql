-- Keep the 360° interior panorama separate from the exterior gallery
alter table public.plans add column if not exists panorama text;

-- Public bucket for plan images uploaded from /admin (only admins may write)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('plan-images', 'plan-images', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "plan images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'plan-images' and (select public.is_admin()));
create policy "plan images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'plan-images' and (select public.is_admin()));
create policy "plan images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'plan-images' and (select public.is_admin()));
create policy "plan images admin select" on storage.objects for select to authenticated
  using (bucket_id = 'plan-images' and (select public.is_admin()));
