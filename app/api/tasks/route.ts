import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

function mapTask(t: any) {
  return {
    id: t.id,
    title: t.title,
    description: t.description || "",
    projectId: t.project_id || "",
    projectName: t.project_name || "",
    clientName: t.client_name || "",
    assignedTo: t.assigned_to,
    assignedToAvatar: t.assigned_to_avatar || "",
    assignedBy: t.assigned_by || "",
    priority: t.priority || "Medium",
    status: t.status || "To Do",
    startDate: t.start_date,
    dueDate: t.due_date,
    estimatedHours: Number(t.estimated_hours || 0),
    actualHours: Number(t.actual_hours || 0),
    checklist: t.checklist || [],
    comments: t.comments || [],
    tags: t.tags || [],
  };
}

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[API/tasks GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: (data || []).map(mapTask), dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    title: body.title,
    description: body.description || "",
    project_id: body.projectId || null,
    project_name: body.projectName || "",
    client_name: body.clientName || "",
    assigned_to: body.assignedTo,
    assigned_to_avatar: body.assignedToAvatar || "",
    assigned_by: body.assignedBy || "",
    priority: body.priority || "Medium",
    status: body.status || "To Do",
    start_date: body.startDate || new Date().toISOString().split("T")[0],
    due_date: body.dueDate,
    estimated_hours: Number(body.estimatedHours || 0),
    actual_hours: 0,
    checklist: [],
    comments: [],
    tags: body.tags || [],
    is_client_visible: body.isClientVisible ?? true,
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: `task-${Date.now()}`, actualHours: 0, checklist: [], comments: [] },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("tasks").insert(record).select().single();
  if (error) {
    console.error("[API/tasks POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: mapTask(data), dbConnected: true }, { status: 201 });
}
