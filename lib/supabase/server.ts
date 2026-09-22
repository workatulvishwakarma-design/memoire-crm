import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ─── Server client for API routes — uses service role key to bypass RLS ──────
export function createServiceSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    supabaseUrl.includes("demo.supabase.co") ||
    !serviceRoleKey ||
    serviceRoleKey.includes(".demo")
  ) {
    return null; // Signal: DB not configured
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// ─── Server client for auth-aware SSR pages ──────────────────────────────────
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    supabaseUrl.includes("demo.supabase.co") ||
    !supabaseAnonKey ||
    supabaseAnonKey.includes(".demo")
  ) {
    return null; // Signal: DB not configured
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from Server Component — safe to ignore
        }
      },
    },
  });
}
