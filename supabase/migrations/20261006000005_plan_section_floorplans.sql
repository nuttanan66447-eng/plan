-- Images per viewer tab: section (cut-away) render and real floor-plan drawings (one per storey)
alter table public.plans add column if not exists section_image text;
alter table public.plans add column if not exists floorplan_images text[] not null default '{}';

update public.plans
set section_image = '/images/section-cutaway.jpg',
    gallery = array_remove(gallery, '/images/section-cutaway.jpg')
where '/images/section-cutaway.jpg' = any(gallery) or image = '/images/section-cutaway.jpg';
