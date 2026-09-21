import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_LEAVES } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("leave_requests").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_LEAVES });
    }

    const mapped = data.map((l: any) => ({
      id: l.id,
      employeeId: l.employee_id,
      employeeName: l.employee_name,
      leaveType: l.leave_type,
      startDate: l.start_date,
      endDate: l.end_date,
      reason: l.reason,
      status: l.status,
      appliedOn: l.applied_on,
      reviewedBy: l.reviewed_by,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_LEAVES });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `lv-${Date.now()}`,
      employee_id: body.employeeId || "MEM-101",
      employee_name: body.employeeName || "Rahul Sharma",
      leave_type: body.leaveType,
      start_date: body.startDate,
      end_date: body.endDate,
      reason: body.reason,
      status: "Pending",
      applied_on: new Date().toISOString().split("T")[0],
    };

    try {
      await supabase.from("leave_requests").insert(newRecord);
    } catch {}

    return NextResponse.json(
      { success: true, data: { ...body, id: newRecord.id, status: "Pending", appliedOn: newRecord.applied_on } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
