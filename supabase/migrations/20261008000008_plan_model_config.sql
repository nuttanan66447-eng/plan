-- Admin settings for an uploaded .glb: cut height per floor and room labels
-- { "cuts": [number|null, ...], "rooms": [{ "floor", "x", "y", "z", "th", "en" }] }
alter table public.plans add column model_config jsonb;
