import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to log out" }, { status: 500 });
  }
}