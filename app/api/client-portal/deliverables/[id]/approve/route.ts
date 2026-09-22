import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, approved: true, dbConnected: false });

  const { error } = await supabase
    .from("deliverables")
    .update({ status: "Approved", approved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[API/client-portal/deliverables/approve]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, approved: true, dbConnected: true });
}
