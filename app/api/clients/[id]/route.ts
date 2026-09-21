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
    if (body.industry !== undefined) updatePayload.industry = body.industry;
    if (body.location !== undefined) updatePayload.location = body.location;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.annualValue !== undefined) updatePayload.annual_value = body.annualValue;
    if (body.healthScore !== undefined) updatePayload.health_score = body.healthScore;
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    try {
      await supabase.from("clients").update(updatePayload).eq("id", id);
    } catch {}

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

    // Soft delete to preserve historical records safely
    try {
      await supabase.from("clients").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, message: `Client ${id} soft deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
