import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_REPORTS } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("work_reports").select("*").order("date", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_REPORTS });
    }

    const mapped = data.map((r: any) => ({
      id: r.id,
      employeeId: r.employee_id,
      employeeName: r.employee_name,
      type: r.type,
      date: r.date,
      tasksCompleted: r.tasks_completed || [],
      hoursWorked: Number(r.hours_worked || 8),
      achievements: r.achievements,
      challenges: r.challenges,
      nextPlan: r.next_plan,
      status: r.status,
      feedback: r.feedback,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_REPORTS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `rep-${Date.now()}`,
      employee_id: body.employeeId || "MEM-101",
      employee_name: body.employeeName || "Rahul Sharma",
      type: body.type || "Daily",
      date: body.date || new Date().toISOString().split("T")[0],
      tasks_completed: body.tasksCompleted || [],
      hours_worked: Number(body.hoursWorked || 8),
      achievements: body.achievements,
      challenges: body.challenges || "None",
      next_plan: body.nextPlan || "Continue task execution.",
      status: "Submitted",
    };

    try {
      await supabase.from("work_reports").insert(newRecord);
    } catch {}

    return NextResponse.json(
      { success: true, data: { ...body, id: newRecord.id, status: "Submitted" } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
