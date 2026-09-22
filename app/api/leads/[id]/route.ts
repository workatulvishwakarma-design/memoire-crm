import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ success: true, dbConnected: false });
  }

  const updateData: Record<string, any> = {};
  if (body.companyName !== undefined) updateData.company_name = body.companyName;
  if (body.contactName !== undefined) updateData.contact_name = body.contactName;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
  if (body.industry !== undefined) updateData.industry = body.industry;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.source !== undefined) updateData.source = body.source;
  if (body.interestedServices !== undefined) updateData.interested_services = body.interestedServices;
  if (body.budget !== undefined) updateData.budget = Number(body.budget);
  if (body.expectedClosing !== undefined) updateData.expected_closing = body.expectedClosing;
  if (body.assignedBDM !== undefined) updateData.assigned_bdm = body.assignedBDM;
  if (body.leadScore !== undefined) updateData.lead_score = body.leadScore;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.nextFollowUp !== undefined) updateData.next_follow_up = body.nextFollowUp;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase.from("leads").update(updateData).eq("id", id).select().single();

  if (error) {
    console.error("[API/leads PATCH]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data, dbConnected: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ success: true, dbConnected: false });
  }

  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) {
    console.error("[API/leads DELETE]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, dbConnected: true });
}
