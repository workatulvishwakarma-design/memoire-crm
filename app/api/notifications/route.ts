import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";


export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });

    

    const mapped = (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      timestamp: n.timestamp || "Just now",
      category: n.category,
      read: Boolean(n.read),
      link: n.link,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) { console.error("[API] Unhandled:", err.message); return NextResponse.json({ success: false, error: err.message }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    const supabase = createServiceSupabaseClient();

  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, id, read: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
