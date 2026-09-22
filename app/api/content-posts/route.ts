import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase
    .from("content_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API/content-posts GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((p: any) => ({
    id: p.id,
    clientName: p.client_name,
    platform: p.platform,
    title: p.title,
    caption: p.caption || "",
    creativeUrl: p.creative_url || "",
    scheduledDate: p.scheduled_date || "",
    status: p.status,
    hashtags: p.hashtags || "",
    contentType: p.content_type || "Static Post",
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    client_name: body.clientName,
    platform: body.platform,
    title: body.title,
    caption: body.caption || "",
    creative_url: body.creativeUrl || "",
    scheduled_date: body.scheduledDate || null,
    status: body.status || "DRAFT",
    hashtags: body.hashtags || "",
    content_type: body.contentType || "Static Post",
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: `post-${Date.now()}` },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("content_posts").insert(record).select().single();
  if (error) {
    console.error("[API/content-posts POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    dbConnected: true,
    data: {
      id: data.id,
      clientName: data.client_name,
      platform: data.platform,
      title: data.title,
      caption: data.caption || "",
      creativeUrl: data.creative_url || "",
      scheduledDate: data.scheduled_date || "",
      status: data.status,
      hashtags: data.hashtags || "",
      contentType: data.content_type || "Static Post",
    },
  }, { status: 201 });
}
