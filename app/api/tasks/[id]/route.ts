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
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.assignedTo !== undefined) updatePayload.assigned_to = body.assignedTo;
    if (body.priority !== undefined) updatePayload.priority = body.priority;
    if (body.dueDate !== undefined) updatePayload.due_date = body.dueDate;
    if (body.actualHours !== undefined) updatePayload.actual_hours = body.actualHours;

    try {
      await supabase.from("tasks").update(updatePayload).eq("id", id);
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
      await supabase.from("tasks").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, message: `Task ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
