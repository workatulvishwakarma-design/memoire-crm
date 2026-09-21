import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_NOTIFICATIONS } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_NOTIFICATIONS });
    }

    const mapped = data.map((n: any) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      timestamp: n.timestamp || "Just now",
      category: n.category,
      read: Boolean(n.read),
      link: n.link,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_NOTIFICATIONS });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    const supabase = await createServerSupabaseClient();

    try {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, id, read: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
