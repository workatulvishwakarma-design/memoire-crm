import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: {
          id: "usr-founder",
          email: "rahul@memoire.co.in",
          name: "Rahul Sharma",
          role: "FOUNDER",
        },
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split("@")[0],
        role: user.user_metadata?.role || "FOUNDER",
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      authenticated: false,
      user: {
        id: "usr-founder",
        email: "rahul@memoire.co.in",
        name: "Rahul Sharma",
        role: "FOUNDER",
      },
    });
  }
}
