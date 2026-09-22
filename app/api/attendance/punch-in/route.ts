import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

// Office geofence (Navi Mumbai HQ)
const OFFICE_LAT = 19.076;
const OFFICE_LNG = 72.9982;
const OFFICE_RADIUS_METERS = 200; // Allow up to 200m radius

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const employeeId = body.employeeId || "UNKNOWN";
    const employeeName = body.employeeName || "Employee";
    const latitude: number | null = body.latitude ?? null;
    const longitude: number | null = body.longitude ?? null;
    const selfieUrl: string = body.selfieUrl || "";
    const workLocation: string = body.workLocation || "Remote";

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // Calculate geofence
    let gpsStatus = "GPS Not Available";
    let isWithinGeofence = false;
    let distanceMeters: number | null = null;

    if (latitude !== null && longitude !== null) {
      distanceMeters = haversineDistance(OFFICE_LAT, OFFICE_LNG, latitude, longitude);
      isWithinGeofence = distanceMeters <= OFFICE_RADIUS_METERS;
      gpsStatus = isWithinGeofence
        ? `Geofence Verified (${Math.round(distanceMeters)}m from office)`
        : `Outside Geofence (${Math.round(distanceMeters)}m from office)`;
    }

    const status = isWithinGeofence || workLocation === "Remote" || workLocation === "Hybrid" ? "Present" : "Present";

    const supabase = createServiceSupabaseClient();

    if (supabase) {
      // Check for duplicate punch-in
      const { data: existing } = await supabase
        .from("attendance")
        .select("id, punch_in_time")
        .eq("employee_id", employeeId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: "ALREADY_PUNCHED_IN",
            message: `You already punched in today at ${existing.punch_in_time}.`,
            dbConnected: true,
          },
          { status: 400 }
        );
      }

      const { data: insertedRow, error: insertError } = await supabase
        .from("attendance")
        .insert({
          employee_id: employeeId,
          employee_name: employeeName,
          date: today,
          punch_in_time: timeStr,
          punch_out_time: null,
          working_hours: "0h 0m",
          break_duration: "0m",
          location: workLocation,
          gps_status: gpsStatus,
          latitude,
          longitude,
          selfie_url: selfieUrl,
          status,
        })
        .select()
        .single();

      if (insertError) {
        console.error("[API/attendance/punch-in]", insertError.message);
        return NextResponse.json(
          { success: false, error: insertError.message, dbConnected: true },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        dbConnected: true,
        data: {
          id: insertedRow.id,
          employeeId,
          employeeName,
          date: today,
          punchInTime: timeStr,
          gpsStatus,
          isWithinGeofence,
          distanceMeters,
          selfieUrl,
          status,
          message: isWithinGeofence
            ? `Punched in successfully at ${timeStr}. Geofence verified.`
            : `Punched in at ${timeStr}. You are ${Math.round(distanceMeters || 0)}m from the office.`,
        },
      });
    }

    // No DB — return optimistic response
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: {
        id: `att-${Date.now()}`,
        employeeId,
        employeeName,
        date: today,
        punchInTime: timeStr,
        gpsStatus,
        isWithinGeofence,
        distanceMeters,
        selfieUrl,
        status,
        message: `Punched in at ${timeStr} (offline mode — database not configured).`,
      },
    });
  } catch (err: any) {
    console.error("[API/attendance/punch-in CRITICAL]", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
