-- More house styles common in Thailand
alter table public.plans drop constraint if exists plans_style_check;
alter table public.plans add constraint plans_style_check
  check (style in ('modern','contemporary','minimal','nordic','japandi','muji','tropical','loft','thai','classic'));
