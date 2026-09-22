import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase.from("work_reports").select("*").order("date", { ascending: false });
  if (error) {
    console.error("[API/reports GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((r: any) => ({
    id: r.id,
    employeeId: r.employee_id,
    employeeName: r.employee_name,
    type: r.type,
    date: r.date,
    tasksCompleted: r.tasks_completed || [],
    hoursWorked: Number(r.hours_worked || 8),
    achievements: r.achievements || "",
    challenges: r.challenges || "",
    nextPlan: r.next_plan || "",
    status: r.status,
    feedback: r.feedback || "",
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    employee_id: body.employeeId || "MEM-101",
    employee_name: body.employeeName || "Employee",
    type: body.type || "Daily",
    date: body.date || new Date().toISOString().split("T")[0],
    tasks_completed: body.tasksCompleted || [],
    hours_worked: Number(body.hoursWorked || 8),
    achievements: body.achievements || "",
    challenges: body.challenges || "",
    next_plan: body.nextPlan || "",
    status: "Submitted",
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: `rep-${Date.now()}`, status: "Submitted" },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("work_reports").insert(record).select().single();
  if (error) {
    console.error("[API/reports POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    dbConnected: true,
    data: { ...record, id: data.id, status: "Submitted" },
  }, { status: 201 });
}
