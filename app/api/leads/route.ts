import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_LEADS } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_LEADS });
    }

    // Map database snake_case to frontend camelCase
    const mapped = data.map((l: any) => ({
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
      notes: l.notes,
      createdAt: l.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_LEADS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `lead-${Date.now()}`,
      company_name: body.companyName,
      contact_name: body.contactName,
      email: body.email,
      phone: body.phone,
      whatsapp: body.whatsapp,
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
    };

    try {
      await supabase.from("leads").insert(newRecord);
    } catch {
      // Fallback
    }

    const createdLead = {
      ...body,
      id: newRecord.id,
      createdAt: new Date().toISOString().split("T")[0],
    };

    return NextResponse.json({ success: true, data: createdLead }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
