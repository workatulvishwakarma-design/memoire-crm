import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_MEETINGS = [
  { id: "m-1", title: "UrbanNest Tower A Kickoff Sync", time: "11:30 AM", client: "UrbanNest Realty", type: "Client Meeting", link: "https://meet.google.com/xyz-abc" },
  { id: "m-2", title: "Design Team Figma Review", time: "02:00 PM", client: "Internal", type: "Design Review", link: "https://meet.google.com/des-rev" },
  { id: "m-3", title: "BluePeak Q3 Lead Gen Pitch", time: "04:30 PM", client: "BluePeak Finance", type: "Sales Pitch", link: "https://meet.google.com/sales-bp" },
];

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("calendar_events").select("*").order("start_time", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: DEFAULT_MEETINGS });
    }

    const mapped = data.map((m: any) => ({
      id: m.id,
      title: m.title,
      time: new Date(m.start_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      client: m.client || "Client",
      type: m.meeting_type || "Client Meeting",
      link: m.meeting_link || "https://meet.google.com/xyz-abc",
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: DEFAULT_MEETINGS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newMeeting = {
      id: `m-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      start_time: body.startTime || new Date().toISOString(),
      end_time: body.endTime || new Date(Date.now() + 3600000).toISOString(),
      client: body.client || "Agency Partner",
      meeting_link: body.link || "https://meet.google.com/memoire-meet",
      meeting_type: body.type || "Client Meeting",
      status: "Scheduled",
    };

    try {
      await supabase.from("calendar_events").insert(newMeeting);
    } catch {}

    return NextResponse.json({ success: true, data: newMeeting }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
