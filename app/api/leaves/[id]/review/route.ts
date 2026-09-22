import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await request.json();
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const { error } = await supabase
    .from("leave_requests")
    .update({ status, reviewed_by: "HR Manager", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[API/leaves/review POST]", id, error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }
  return NextResponse.json({ success: true, dbConnected: true });
}
