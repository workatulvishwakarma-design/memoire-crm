import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase
    .from("leave_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API/leaves GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((l: any) => ({
    id: l.id,
    employeeId: l.employee_id,
    employeeName: l.employee_name,
    leaveType: l.leave_type,
    startDate: l.start_date,
    endDate: l.end_date,
    reason: l.reason,
    status: l.status,
    appliedOn: l.applied_on,
    reviewedBy: l.reviewed_by || "",
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    employee_id: body.employeeId || "MEM-101",
    employee_name: body.employeeName || "Employee",
    leave_type: body.leaveType,
    start_date: body.startDate,
    end_date: body.endDate,
    reason: body.reason,
    status: "Pending",
    applied_on: new Date().toISOString().split("T")[0],
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: `lv-${Date.now()}`, status: "Pending", appliedOn: record.applied_on },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("leave_requests").insert(record).select().single();
  if (error) {
    console.error("[API/leaves POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    dbConnected: true,
    data: {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee_name,
      leaveType: data.leave_type,
      startDate: data.start_date,
      endDate: data.end_date,
      reason: data.reason,
      status: data.status,
      appliedOn: data.applied_on,
    },
  }, { status: 201 });
}
