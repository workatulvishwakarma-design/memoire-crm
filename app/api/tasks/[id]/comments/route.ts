import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

// POST /api/tasks/[id]/comments — add comment to task
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { text, author } = await request.json();
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  // Fetch current comments
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("comments")
    .eq("id", id)
    .single();

  if (fetchError || !task) {
    return NextResponse.json({ success: false, error: fetchError?.message || "Task not found", dbConnected: true }, { status: 404 });
  }

  const newComment = { id: `tc-${Date.now()}`, author, text, createdAt: new Date().toISOString() };
  const comments = [...(task.comments || []), newComment];

  const { error } = await supabase
    .from("tasks")
    .update({ comments, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[API/tasks/comments POST]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { comment: newComment }, dbConnected: true }, { status: 201 });
}
