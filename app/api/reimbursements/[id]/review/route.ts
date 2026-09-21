import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const supabase = await createServerSupabaseClient();

    try {
      await supabase.from("reimbursements").update({ status }).eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, data: { id, status } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
