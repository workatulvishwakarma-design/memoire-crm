import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const upd: Record<string, any> = {};
  if (body.name !== undefined) upd.name = body.name;
  if (body.category !== undefined) upd.category = body.category;
  if (body.contactPerson !== undefined) upd.contact_person = body.contactPerson;
  if (body.email !== undefined) upd.email = body.email;
  if (body.phone !== undefined) upd.phone = body.phone;
  if (body.monthlyPayout !== undefined) upd.monthly_payout = Number(body.monthlyPayout);
  if (body.status !== undefined) upd.status = body.status;
  if (body.notes !== undefined) upd.notes = body.notes;

  const { error } = await supabase.from("vendors").update(upd).eq("id", id);
  if (error) {
    console.error("[API/vendors PATCH]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) {
    console.error("[API/vendors DELETE]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}
