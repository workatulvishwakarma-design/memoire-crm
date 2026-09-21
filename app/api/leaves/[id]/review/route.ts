import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, reviewedBy = "Priya Nair" } = await request.json();
    const supabase = await createServerSupabaseClient();

    try {
      await supabase
        .from("leave_requests")
        .update({ status, reviewed_by: reviewedBy })
        .eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, data: { id, status, reviewedBy } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
