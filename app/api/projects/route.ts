import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

function mapProject(p: any) {
  return {
    id: p.id,
    name: p.name,
    clientId: p.client_id || "",
    clientName: p.client_name,
    serviceCategory: p.service_category,
    projectManager: p.project_manager,
    team: p.team || [],
    startDate: p.start_date,
    endDate: p.end_date,
    budget: Number(p.budget || 0),
    priority: p.priority || "Medium",
    status: p.status || "In Progress",
    progress: p.progress || 0,
    description: p.description || "",
  };
}

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error("[API/projects GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: (data || []).map(mapProject), dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    name: body.name,
    client_id: body.clientId || null,
    client_name: body.clientName || "",
    service_category: body.serviceCategory || "Brand & Creative",
    project_manager: body.projectManager || "",
    team: body.team || [],
    start_date: body.startDate || new Date().toISOString().split("T")[0],
    end_date: body.endDate || null,
    budget: Number(body.budget || 0),
    priority: body.priority || "Medium",
    status: body.status || "Planning",
    progress: 0,
    description: body.description || "",
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: `proj-${Date.now()}`, progress: 0 },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("projects").insert(record).select().single();

  if (error) {
    console.error("[API/projects POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: mapProject(data), dbConnected: true }, { status: 201 });
}
