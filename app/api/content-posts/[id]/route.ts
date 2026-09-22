import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const upd: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) upd.status = body.status;
  if (body.platform !== undefined) upd.platform = body.platform;
  if (body.title !== undefined) upd.title = body.title;
  if (body.caption !== undefined) upd.caption = body.caption;
  if (body.scheduledDate !== undefined) upd.scheduled_date = body.scheduledDate;
  if (body.hashtags !== undefined) upd.hashtags = body.hashtags;
  if (body.creativeUrl !== undefined) upd.creative_url = body.creativeUrl;
  if (body.contentType !== undefined) upd.content_type = body.contentType;

  const { error } = await supabase.from("content_posts").update(upd).eq("id", id);
  if (error) {
    console.error("[API/content-posts PATCH]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const { error } = await supabase.from("content_posts").delete().eq("id", id);
  if (error) {
    console.error("[API/content-posts DELETE]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}
