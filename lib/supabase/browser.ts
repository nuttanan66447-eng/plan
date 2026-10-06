import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Browser client that shares the admin session cookie; used for direct uploads to Storage. */
export const browserClient = () => createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
