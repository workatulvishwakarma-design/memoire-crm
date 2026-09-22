import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase
    .from("chat_channels")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[API/chat/channels GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description || "",
    isPrivate: c.is_private || false,
    memberCount: c.member_count || 1,
    unread: c.unread || 0,
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}
