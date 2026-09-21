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
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.department !== undefined) updatePayload.department = body.department;
    if (body.designation !== undefined) updatePayload.designation = body.designation;
    if (body.workLocation !== undefined) updatePayload.work_location = body.workLocation;
    if (body.monthlyRating !== undefined) updatePayload.monthly_rating = body.monthlyRating;

    try {
      await supabase.from("employees").update(updatePayload).eq("id", id);
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

    try {
      await supabase.from("employees").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, message: `Employee ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
