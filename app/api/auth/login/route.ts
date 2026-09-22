import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email, password, role = "FOUNDER" } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    // Attempt Supabase Auth sign-in if real DB is configured
    let user = null;
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || "password123",
        });
        if (!error && data?.user) {
          user = data.user;
        }
      } catch {
        // Auth unavailable — fall through to demo login
      }
    }

    const resolvedRole = role || (email.includes("client") ? "CLIENT" : "FOUNDER");

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user?.id || "usr-101",
          email,
          name: email.split("@")[0].replace(".", " ").toUpperCase(),
          role: resolvedRole,
        },
        sessionToken: "memoire_live_session_" + Date.now(),
        dbConnected: !!supabase && !!user,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
