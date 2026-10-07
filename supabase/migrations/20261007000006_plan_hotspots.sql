-- Numbered info points (01, 02, 03 ...) placed on the plan's cover photo.
-- null = use the site's default points; [] = no points.
alter table public.plans add column hotspots jsonb;
