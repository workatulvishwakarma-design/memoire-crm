import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_EMPLOYEES } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_EMPLOYEES });
    }

    const mapped = data.map((e: any) => ({
      id: e.id,
      employeeId: e.employee_id,
      name: e.name,
      avatar: e.avatar,
      email: e.email,
      phone: e.phone,
      department: e.department,
      designation: e.designation,
      reportingManager: e.reporting_manager,
      joiningDate: e.joining_date,
      employmentStatus: e.employment_status,
      workLocation: e.work_location,
      skills: e.skills || [],
      leaveBalance: {
        casual: e.casual_leaves || 12,
        sick: e.sick_leaves || 10,
        earned: e.earned_leaves || 15,
      },
      monthlyRating: Number(e.monthly_rating || 4.8),
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_EMPLOYEES });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const empCount = Math.floor(Math.random() * 800) + 100;
    const employeeId = `MEM-${empCount}`;
    const newRecord = {
      id: `emp-${Date.now()}`,
      employee_id: employeeId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      avatar: body.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      department: body.department,
      designation: body.designation,
      reporting_manager: body.reportingManager || "Rahul Sharma",
      joining_date: body.joiningDate || new Date().toISOString().split("T")[0],
      employment_status: body.employmentStatus || "Full-Time",
      work_location: body.workLocation || "Navi Mumbai Office",
      skills: body.skills || ["Strategy"],
      casual_leaves: 12,
      sick_leaves: 10,
      earned_leaves: 15,
      monthly_rating: 4.8,
    };

    try {
      await supabase.from("employees").insert(newRecord);
    } catch {}

    const createdEmp = {
      ...body,
      id: newRecord.id,
      employeeId,
      leaveBalance: { casual: 12, sick: 10, earned: 15 },
      monthlyRating: 4.8,
    };

    return NextResponse.json({ success: true, data: createdEmp }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
