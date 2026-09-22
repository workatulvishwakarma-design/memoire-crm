import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .order("date", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[API/attendance GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((a: any) => ({
    id: a.id,
    employeeId: a.employee_id,
    employeeName: a.employee_name,
    date: a.date,
    punchInTime: a.punch_in_time,
    punchOutTime: a.punch_out_time || "",
    workingHours: a.working_hours || "0h 0m",
    breakDuration: a.break_duration || "0m",
    location: a.location || "Navi Mumbai Office",
    gpsStatus: a.gps_status || "Verified",
    selfieUrl: a.selfie_url || "",
    latitude: a.latitude || null,
    longitude: a.longitude || null,
    status: a.status || "Present",
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}
