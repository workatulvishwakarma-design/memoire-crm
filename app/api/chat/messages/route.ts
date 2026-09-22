import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId") || "ch-general";

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("[API/chat/messages GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((m: any) => ({
    id: m.id,
    channelId: m.channel_id,
    senderName: m.sender_name,
    senderAvatar: m.sender_avatar || "",
    text: m.text,
    timestamp: m.timestamp || new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const record = {
    channel_id: body.channelId || "ch-general",
    sender_name: body.senderName || "User",
    sender_avatar: body.senderAvatar || "",
    text: body.text,
    timestamp: timeStr,
  };

  if (!supabase) {
    return NextResponse.json({
      success: true, dbConnected: false,
      data: { ...record, id: `msg-${Date.now()}` },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("chat_messages").insert(record).select().single();
  if (error) {
    console.error("[API/chat/messages POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { id: data.id, ...record }, dbConnected: true }, { status: 201 });
}
