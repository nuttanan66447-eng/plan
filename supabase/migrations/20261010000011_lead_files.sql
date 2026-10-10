-- Customer attachments on orders (e.g. land deed / โฉนด for site adaptation).
-- Visitors may upload into deeds/ only; nobody but admins can list, read or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lead-files', 'lead-files', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'])
on conflict (id) do nothing;

create policy "lead files public upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'lead-files' and (storage.foldername(name))[1] = 'deeds');
create policy "lead files admin select" on storage.objects for select to authenticated
  using (bucket_id = 'lead-files' and (select public.is_admin()));
create policy "lead files admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'lead-files' and (select public.is_admin()));
