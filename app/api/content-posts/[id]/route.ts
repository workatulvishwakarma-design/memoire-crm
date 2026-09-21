import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const updatePayload: Record<string, any> = {};
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.caption !== undefined) updatePayload.caption = body.caption;
    if (body.scheduledDate !== undefined) updatePayload.scheduled_date = body.scheduledDate;

    try {
      await supabase.from("content_posts").update(updatePayload).eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, data: { id, ...body } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    try {
      await supabase.from("content_posts").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, message: `Post ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
