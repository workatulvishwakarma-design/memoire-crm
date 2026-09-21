import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_PROJECTS } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_PROJECTS });
    }

    const mapped = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      clientId: p.client_id,
      clientName: p.client_name,
      serviceCategory: p.service_category,
      projectManager: p.project_manager,
      team: p.team || [],
      startDate: p.start_date,
      endDate: p.end_date,
      budget: Number(p.budget || 0),
      priority: p.priority,
      status: p.status,
      progress: p.progress || 0,
      description: p.description,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_PROJECTS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `proj-${Date.now()}`,
      name: body.name,
      client_id: body.clientId,
      client_name: body.clientName,
      service_category: body.serviceCategory,
      project_manager: body.projectManager || "Rohan Mehta",
      team: body.team || ["Ananya Iyer"],
      start_date: body.startDate || new Date().toISOString().split("T")[0],
      end_date: body.endDate,
      budget: Number(body.budget || 500000),
      priority: body.priority || "Medium",
      status: body.status || "Planning",
      progress: Number(body.progress || 0),
      description: body.description || "",
    };

    try {
      await supabase.from("projects").insert(newRecord);
    } catch {}

    return NextResponse.json({ success: true, data: { ...body, id: newRecord.id, progress: newRecord.progress } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
