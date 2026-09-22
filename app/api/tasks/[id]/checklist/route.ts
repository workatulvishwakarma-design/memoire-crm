import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

// PATCH /api/tasks/[id]/checklist — toggle checklist item
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { itemId } = await request.json();
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  // Fetch current checklist
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("checklist")
    .eq("id", id)
    .single();

  if (fetchError || !task) {
    return NextResponse.json({ success: false, error: fetchError?.message || "Task not found", dbConnected: true }, { status: 404 });
  }

  const checklist = (task.checklist || []).map((item: any) =>
    item.id === itemId ? { ...item, completed: !item.completed } : item
  );

  const { error } = await supabase
    .from("tasks")
    .update({ checklist, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[API/tasks/checklist PATCH]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: { checklist }, dbConnected: true });
}
