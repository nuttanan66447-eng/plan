-- Customers can submit reviews; they stay hidden until an admin publishes them
alter table public.reviews add column if not exists plan_code text;
alter table public.reviews add column if not exists project_type text;
create index if not exists reviews_plan_code_idx on public.reviews (plan_code);

create policy "reviews public submit" on public.reviews for insert to anon, authenticated
  with check (is_published = false and char_length(name) between 1 and 80 and char_length(body) between 10 and 1500
              and (role is null or char_length(role) <= 120) and (district is null or char_length(district) <= 80));
