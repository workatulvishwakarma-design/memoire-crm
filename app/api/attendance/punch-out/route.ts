import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const employeeId = body.employeeId || "UNKNOWN";
    const workSummary = body.workSummary || "";
    const selfieUrl = body.selfieUrl || "";

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const supabase = createServiceSupabaseClient();

    if (supabase) {
      // Find today's punch-in record
      const { data: existing, error: findError } = await supabase
        .from("attendance")
        .select("id, punch_in_time")
        .eq("employee_id", employeeId)
        .eq("date", today)
        .maybeSingle();

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "NO_PUNCH_IN", message: "No punch-in record found for today.", dbConnected: true },
          { status: 400 }
        );
      }

      // Calculate working hours
      const punchInTime = existing.punch_in_time;
      let workingHours = "8h 0m";
      try {
        const [inHour, inMin] = punchInTime.replace(" AM", "").replace(" PM", "").split(":").map(Number);
        const [outHour, outMin] = timeStr.replace(" AM", "").replace(" PM", "").split(":").map(Number);
        const inTotal = inHour * 60 + inMin;
        const outTotal = outHour * 60 + outMin;
        const diff = outTotal - inTotal;
        if (diff > 0) {
          workingHours = `${Math.floor(diff / 60)}h ${diff % 60}m`;
        }
      } catch {}

      const { error: updateError } = await supabase
        .from("attendance")
        .update({
          punch_out_time: timeStr,
          working_hours: workingHours,
          work_summary: workSummary,
          selfie_out_url: selfieUrl,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("[API/attendance/punch-out]", updateError.message);
        return NextResponse.json({ success: false, error: updateError.message, dbConnected: true }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        dbConnected: true,
        data: {
          employeeId,
          punchOutTime: timeStr,
          workingHours,
          message: `Punched out at ${timeStr}. Total hours: ${workingHours}.`,
        },
      });
    }

    // No DB
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: {
        employeeId,
        punchOutTime: timeStr,
        workingHours: "8h 0m",
        message: `Punched out at ${timeStr} (offline mode).`,
      },
    });
  } catch (err: any) {
    console.error("[API/attendance/punch-out CRITICAL]", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
