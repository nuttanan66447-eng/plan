-- Optional uploaded 3D model (.glb) per plan; falls back to the generated massing model
alter table public.plans add column if not exists model_url text;

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','model/gltf-binary','application/octet-stream']
where id = 'plan-images';
