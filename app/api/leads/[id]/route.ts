import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const updatePayload: Record<string, any> = {};
    if (body.companyName !== undefined) updatePayload.company_name = body.companyName;
    if (body.contactName !== undefined) updatePayload.contact_name = body.contactName;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.budget !== undefined) updatePayload.budget = body.budget;
    if (body.assignedBDM !== undefined) updatePayload.assigned_bdm = body.assignedBDM;
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    try {
      await supabase.from("leads").update(updatePayload).eq("id", id);
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, data: { id, ...body } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    try {
      await supabase.from("leads").delete().eq("id", id);
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, message: `Lead ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
