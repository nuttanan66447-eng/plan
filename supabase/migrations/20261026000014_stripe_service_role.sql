-- The Stripe webhook marks orders paid with the service-role key, so the token-based RPC is not needed
revoke all on function public.mark_order_paid(text, text, text, integer) from anon, authenticated;
drop function public.mark_order_paid(text, text, text, integer);
drop table private.app_secrets;
drop schema private;
