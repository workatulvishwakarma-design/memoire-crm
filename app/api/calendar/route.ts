import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .order("start_datetime", { ascending: true });

  if (error) {
    console.error("[API/calendar GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description || "",
    startDatetime: e.start_datetime,
    endDatetime: e.end_datetime,
    location: e.location || "",
    type: e.type || "Meeting",
    attendees: e.attendees || [],
    createdBy: e.created_by || "",
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    title: body.title,
    description: body.description || "",
    start_datetime: body.startDatetime,
    end_datetime: body.endDatetime,
    location: body.location || "",
    type: body.type || "Meeting",
    attendees: body.attendees || [],
    created_by: body.createdBy || "Admin",
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: `evt-${Date.now()}` },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("calendar_events").insert(record).select().single();
  if (error) {
    console.error("[API/calendar POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({
    success: true, dbConnected: true,
    data: { id: data.id, title: data.title, description: data.description, startDatetime: data.start_datetime, endDatetime: data.end_datetime, location: data.location, type: data.type, attendees: data.attendees || [] },
  }, { status: 201 });
}
