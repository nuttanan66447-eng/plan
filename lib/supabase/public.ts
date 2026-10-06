import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, hasSupabase } from "./env";

let client: SupabaseClient | null = null;

/** Cookie-less client for public, cacheable reads (catalogue, portfolio, reviews) and lead inserts. */
export function publicClient(): SupabaseClient | null {
  if (!hasSupabase) return null;
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
