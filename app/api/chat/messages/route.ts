import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_MESSAGES } from "@/data/mockData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");

    const supabase = await createServerSupabaseClient();
    let query = supabase.from("chat_messages").select("*").order("created_at", { ascending: true });
    if (channelId) {
      query = query.eq("channel_id", channelId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      const fallback = channelId ? INITIAL_MESSAGES.filter((m) => m.channelId === channelId) : INITIAL_MESSAGES;
      return NextResponse.json({ success: true, data: fallback });
    }

    const mapped = data.map((m: any) => ({
      id: m.id,
      channelId: m.channel_id,
      senderName: m.sender_name,
      senderAvatar: m.sender_avatar,
      text: m.text,
      timestamp: m.timestamp,
      isPinned: m.is_pinned,
      attachments: m.attachments || [],
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_MESSAGES });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newRecord = {
      id: `msg-${Date.now()}`,
      channel_id: body.channelId || "ch-general",
      sender_name: body.senderName || "Rahul Sharma",
      sender_avatar: body.senderAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      text: body.text,
      timestamp: timeStr,
      is_pinned: false,
      attachments: body.attachments || [],
    };

    try {
      await supabase.from("chat_messages").insert(newRecord);
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        id: newRecord.id,
        channelId: newRecord.channel_id,
        senderName: newRecord.sender_name,
        senderAvatar: newRecord.sender_avatar,
        text: newRecord.text,
        timestamp: newRecord.timestamp,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
