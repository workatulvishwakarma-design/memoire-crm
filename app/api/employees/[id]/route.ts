import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ success: true, dbConnected: false });
  }

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updateData.name = body.name;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.alternatePhone !== undefined) updateData.alternate_phone = body.alternatePhone;
  if (body.dob !== undefined) updateData.dob = body.dob;
  if (body.gender !== undefined) updateData.gender = body.gender;
  if (body.maritalStatus !== undefined) updateData.marital_status = body.maritalStatus;
  if (body.bloodGroup !== undefined) updateData.blood_group = body.bloodGroup;
  if (body.address !== undefined) updateData.address = body.address;
  if (body.city !== undefined) updateData.city = body.city;
  if (body.state !== undefined) updateData.state = body.state;
  if (body.pincode !== undefined) updateData.pincode = body.pincode;
  if (body.emergencyContact !== undefined) updateData.emergency_contact = body.emergencyContact;
  if (body.avatar !== undefined) updateData.avatar = body.avatar;
  if (body.department !== undefined) updateData.department = body.department;
  if (body.designation !== undefined) updateData.designation = body.designation;
  if (body.role !== undefined) updateData.role = body.role;
  if (body.reportingManager !== undefined) updateData.reporting_manager = body.reportingManager;
  if (body.joiningDate !== undefined) updateData.joining_date = body.joiningDate;
  if (body.employmentStatus !== undefined) updateData.employment_status = body.employmentStatus;
  if (body.workLocation !== undefined) updateData.work_location = body.workLocation;
  if (body.skills !== undefined) updateData.skills = body.skills;
  if (body.leaveBalance !== undefined) {
    updateData.casual_leaves = body.leaveBalance.casual;
    updateData.sick_leaves = body.leaveBalance.sick;
    updateData.earned_leaves = body.leaveBalance.earned;
  }
  if (body.salary !== undefined) updateData.salary = body.salary;
  if (body.bankDetails !== undefined) updateData.bank_details = body.bankDetails;
  if (body.loginCredentials !== undefined) updateData.login_credentials = body.loginCredentials;
  if (body.monthlyRating !== undefined) updateData.monthly_rating = body.monthlyRating;

  const { error } = await supabase.from("employees").update(updateData).eq("id", id);

  if (error) {
    console.error("[API/employees PATCH]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, dbConnected: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ success: true, dbConnected: false });
  }

  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    console.error("[API/employees DELETE]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, dbConnected: true });
}
