import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { itemId } = await request.json();
    const supabase = await createServerSupabaseClient();

    // Fetch existing task checklist
    let checklist: any[] = [];
    try {
      const { data } = await supabase.from("tasks").select("checklist").eq("id", id).single();
      if (data && Array.isArray(data.checklist)) {
        checklist = data.checklist.map((item: any) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        await supabase.from("tasks").update({ checklist }).eq("id", id);
      }
    } catch {}

    return NextResponse.json({ success: true, itemId, checklist });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
