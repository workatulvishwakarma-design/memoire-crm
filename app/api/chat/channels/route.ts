import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_CHANNELS } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("chat_channels").select("*");

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_CHANNELS });
    }

    const mapped = data.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      description: c.description,
      unreadCount: c.unread_count || 0,
      members: c.members || [],
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_CHANNELS });
  }
}
