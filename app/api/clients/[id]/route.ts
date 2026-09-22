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
  if (body.companyName !== undefined) updateData.company_name = body.companyName;
  if (body.logo !== undefined) updateData.logo = body.logo;
  if (body.industry !== undefined) updateData.industry = body.industry;
  if (body.website !== undefined) updateData.website = body.website;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.annualValue !== undefined) updateData.annual_value = Number(body.annualValue);
  if (body.healthScore !== undefined) updateData.health_score = body.healthScore;
  if (body.bdm !== undefined) updateData.bdm = body.bdm;
  if (body.accountManager !== undefined) updateData.account_manager = body.accountManager;
  if (body.services !== undefined) updateData.services = body.services;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const { error } = await supabase.from("clients").update(updateData).eq("id", id);

  if (error) {
    console.error("[API/clients PATCH]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  // Update primary contact if provided
  if (body.primaryContact) {
    await supabase
      .from("client_contacts")
      .upsert({
        client_id: id,
        name: body.primaryContact.name,
        designation: body.primaryContact.designation,
        email: body.primaryContact.email,
        phone: body.primaryContact.phone,
        is_primary: true,
      }, { onConflict: "client_id,is_primary" });
  }

  return NextResponse.json({ success: true, dbConnected: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ success: true, dbConnected: false });
  }

  // Soft delete
  const { error } = await supabase
    .from("clients")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[API/clients DELETE]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, dbConnected: true });
}
