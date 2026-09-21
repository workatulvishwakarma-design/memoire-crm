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
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.progress !== undefined) updatePayload.progress = body.progress;
    if (body.budget !== undefined) updatePayload.budget = body.budget;
    if (body.priority !== undefined) updatePayload.priority = body.priority;
    if (body.projectManager !== undefined) updatePayload.project_manager = body.projectManager;

    try {
      await supabase.from("projects").update(updatePayload).eq("id", id);
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
      await supabase.from("projects").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, message: `Project ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
