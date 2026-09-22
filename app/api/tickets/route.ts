import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";


export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });
    const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });

    

    const mapped = (data || []).map((t: any) => ({
      id: t.id,
      ticketNumber: t.ticket_number,
      submittedBy: t.submitted_by,
      category: t.category,
      priority: t.priority,
      subject: t.subject,
      description: t.description,
      status: t.status,
      createdAt: t.created_at?.split("T")[0] || "Just now",
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) { console.error("[API] Unhandled:", err.message); return NextResponse.json({ success: false, error: err.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceSupabaseClient();

  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });
    const tktNum = `MEM-TKT-${Math.floor(Math.random() * 800) + 100}`;
    const newRecord = {
      id: `tkt-${Date.now()}`,
      ticket_number: tktNum,
      submitted_by: body.submittedBy || "Client Representative",
      category: body.category || "General Issue",
      priority: body.priority || "High",
      subject: body.subject,
      description: body.description || "",
      status: "Open",
    };

    try {
      await supabase.from("support_tickets").insert(newRecord);
    } catch {}

    return NextResponse.json(
      { success: true, data: { ...body, id: newRecord.id, ticketNumber: tktNum, status: "Open", createdAt: "Just now" } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
