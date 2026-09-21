import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, feedback } = await request.json(); // action: "APPROVE" | "REVISION"
    const supabase = await createServerSupabaseClient();

    const status = action === "APPROVE" ? "Approved for Launch" : "Revision Requested";

    try {
      await supabase.from("audit_logs").insert({
        action: action === "APPROVE" ? "CLIENT_APPROVED" : "CLIENT_REVISION_REQUESTED",
        entity: "Deliverable",
        entity_id: id,
        metadata: { feedback: feedback || "Client portal action" },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      deliverableId: id,
      status,
      message: action === "APPROVE" ? "Deliverable approved successfully." : "Revision request dispatched to agency team.",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
