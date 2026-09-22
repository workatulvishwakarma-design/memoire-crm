import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    // DB not configured — return empty with dbConnected: false so store
    // knows NOT to overwrite localStorage data
    return NextResponse.json({ success: true, data: [], dbConnected: false });
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API/leads GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((l: any) => ({
    id: l.id,
    companyName: l.company_name,
    contactName: l.contact_name,
    email: l.email,
    phone: l.phone,
    whatsapp: l.whatsapp,
    industry: l.industry,
    location: l.location,
    source: l.source,
    interestedServices: l.interested_services || [],
    budget: Number(l.budget || 0),
    expectedClosing: l.expected_closing,
    assignedBDM: l.assigned_bdm,
    leadScore: l.lead_score || 80,
    status: l.status,
    notes: l.notes || "",
    createdAt: l.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    nextFollowUp: l.next_follow_up,
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const today = new Date().toISOString().split("T")[0];

  const record = {
    company_name: body.companyName,
    contact_name: body.contactName,
    email: body.email,
    phone: body.phone,
    whatsapp: body.whatsapp || null,
    industry: body.industry || "General",
    location: body.location || "Mumbai",
    source: body.source || "Inbound Website",
    interested_services: body.interestedServices || [],
    budget: Number(body.budget || 0),
    expected_closing: body.expectedClosing || null,
    assigned_bdm: body.assignedBDM || "Amit Patel",
    lead_score: body.leadScore || 80,
    status: body.status || "New",
    notes: body.notes || "",
    next_follow_up: body.nextFollowUp || null,
  };

  if (!supabase) {
    // No DB — return optimistic local record
    return NextResponse.json({
      success: true,
      data: { ...body, id: `lead-${Date.now()}`, createdAt: today },
      dbConnected: false,
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("leads").insert(record).select().single();

  if (error) {
    console.error("[API/leads POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  const created = {
    id: data.id,
    companyName: data.company_name,
    contactName: data.contact_name,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp,
    industry: data.industry,
    location: data.location,
    source: data.source,
    interestedServices: data.interested_services || [],
    budget: Number(data.budget || 0),
    expectedClosing: data.expected_closing,
    assignedBDM: data.assigned_bdm,
    leadScore: data.lead_score || 80,
    status: data.status,
    notes: data.notes || "",
    createdAt: data.created_at?.split("T")[0] || today,
    nextFollowUp: data.next_follow_up,
  };

  return NextResponse.json({ success: true, data: created, dbConnected: true }, { status: 201 });
}
