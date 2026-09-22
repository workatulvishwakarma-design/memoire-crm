import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const upd: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) upd.status = body.status;
  if (body.title !== undefined) upd.title = body.title;
  if (body.description !== undefined) upd.description = body.description;
  if (body.assignedTo !== undefined) upd.assigned_to = body.assignedTo;
  if (body.assignedToAvatar !== undefined) upd.assigned_to_avatar = body.assignedToAvatar;
  if (body.priority !== undefined) upd.priority = body.priority;
  if (body.dueDate !== undefined) upd.due_date = body.dueDate;
  if (body.startDate !== undefined) upd.start_date = body.startDate;
  if (body.estimatedHours !== undefined) upd.estimated_hours = body.estimatedHours;
  if (body.actualHours !== undefined) upd.actual_hours = body.actualHours;
  if (body.checklist !== undefined) upd.checklist = body.checklist;
  if (body.comments !== undefined) upd.comments = body.comments;
  if (body.tags !== undefined) upd.tags = body.tags;

  const { error } = await supabase.from("tasks").update(upd).eq("id", id);
  if (error) {
    console.error("[API/tasks PATCH]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) {
    console.error("[API/tasks DELETE]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}
