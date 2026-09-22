import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const upd: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) upd.name = body.name;
  if (body.description !== undefined) upd.description = body.description;
  if (body.category !== undefined) upd.category = body.category;
  if (body.price !== undefined) upd.price = Number(body.price);
  if (body.status !== undefined) upd.status = body.status;

  const { error } = await supabase.from("agency_services").update(upd).eq("id", id);
  if (error) {
    console.error("[API/services PATCH]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const { error } = await supabase.from("agency_services").delete().eq("id", id);
  if (error) {
    console.error("[API/services DELETE]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}
