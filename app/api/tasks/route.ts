import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_TASKS } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_TASKS });
    }

    const mapped = data.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      projectId: t.project_id,
      projectName: t.project_name,
      clientName: t.client_name,
      assignedTo: t.assigned_to,
      assignedToAvatar: t.assigned_to_avatar,
      assignedBy: t.assigned_by,
      priority: t.priority,
      status: t.status,
      startDate: t.start_date,
      dueDate: t.due_date,
      estimatedHours: Number(t.estimated_hours || 0),
      actualHours: Number(t.actual_hours || 0),
      checklist: t.checklist || [],
      comments: t.comments || [],
      tags: t.tags || [],
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_TASKS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `task-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      project_id: body.projectId || null,
      project_name: body.projectName || "General",
      client_name: body.clientName || "Agency Client",
      assigned_to: body.assignedTo,
      assigned_to_avatar: body.assignedToAvatar,
      assigned_by: body.assignedBy || "Rohan Mehta",
      priority: body.priority || "Medium",
      status: body.status || "To Do",
      start_date: body.startDate || new Date().toISOString().split("T")[0],
      due_date: body.dueDate,
      estimated_hours: Number(body.estimatedHours || 0),
      actual_hours: 0,
      checklist: [],
      comments: [],
      tags: body.tags || ["Deliverable"],
    };

    try {
      await supabase.from("tasks").insert(newRecord);
    } catch {}

    return NextResponse.json(
      { success: true, data: { ...body, id: newRecord.id, actualHours: 0, checklist: [], comments: [] } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
