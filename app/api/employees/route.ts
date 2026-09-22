import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

function mapEmployee(e: any) {
  return {
    id: e.id,
    employeeId: e.employee_id,
    name: e.name,
    avatar: e.avatar || "",
    email: e.email,
    phone: e.phone || "",
    alternatePhone: e.alternate_phone || "",
    dob: e.dob || "",
    gender: e.gender || "",
    maritalStatus: e.marital_status || "",
    bloodGroup: e.blood_group || "",
    address: e.address || "",
    city: e.city || "",
    state: e.state || "",
    pincode: e.pincode || "",
    emergencyContact: e.emergency_contact || null,
    department: e.department,
    designation: e.designation,
    role: e.role || "EMPLOYEE",
    reportingManager: e.reporting_manager || "",
    joiningDate: e.joining_date || new Date().toISOString().split("T")[0],
    employmentStatus: e.employment_status || "Full-Time",
    workLocation: e.work_location || "Navi Mumbai Office",
    skills: e.skills || [],
    leaveBalance: {
      casual: e.casual_leaves ?? 12,
      sick: e.sick_leaves ?? 10,
      earned: e.earned_leaves ?? 15,
    },
    salary: e.salary || null,
    bankDetails: e.bank_details || null,
    loginCredentials: e.login_credentials || null,
    monthlyRating: Number(e.monthly_rating || 4.8),
  };
}

export async function GET() {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ success: true, data: [], dbConnected: false });
  }

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[API/employees GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: (data || []).map(mapEmployee), dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    employee_id: body.employeeId || `MEM-EMP-${Date.now()}`,
    name: body.name,
    email: body.email,
    phone: body.phone || "",
    alternate_phone: body.alternatePhone || "",
    dob: body.dob || null,
    gender: body.gender || null,
    marital_status: body.maritalStatus || null,
    blood_group: body.bloodGroup || null,
    address: body.address || null,
    city: body.city || null,
    state: body.state || null,
    pincode: body.pincode || null,
    emergency_contact: body.emergencyContact || null,
    avatar: body.avatar || "",
    department: body.department || "Management",
    designation: body.designation || "Employee",
    role: body.role || "EMPLOYEE",
    reporting_manager: body.reportingManager || "",
    joining_date: body.joiningDate || new Date().toISOString().split("T")[0],
    employment_status: body.employmentStatus || "Full-Time",
    work_location: body.workLocation || "Navi Mumbai Office",
    skills: body.skills || [],
    casual_leaves: body.leaveBalance?.casual ?? 12,
    sick_leaves: body.leaveBalance?.sick ?? 10,
    earned_leaves: body.leaveBalance?.earned ?? 15,
    salary: body.salary || null,
    bank_details: body.bankDetails || null,
    login_credentials: body.loginCredentials || null,
    monthly_rating: 5.0,
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: {
        ...body,
        id: `emp-${Date.now()}`,
        employeeId: record.employee_id,
        leaveBalance: { casual: record.casual_leaves, sick: record.sick_leaves, earned: record.earned_leaves },
        monthlyRating: 5.0,
      },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("employees").insert(record).select().single();

  if (error) {
    console.error("[API/employees POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: mapEmployee(data), dbConnected: true }, { status: 201 });
}
