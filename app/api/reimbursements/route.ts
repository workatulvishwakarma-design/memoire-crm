import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";


export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });
    const { data, error } = await supabase.from("reimbursements").select("*").order("created_at", { ascending: false });

    

    const mapped = (data || []).map((r: any) => ({
      id: r.id,
      employeeName: r.employee_name,
      expenseType: r.expense_type,
      amount: Number(r.amount || 0),
      date: r.date,
      description: r.description,
      project: r.project,
      status: r.status,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) { console.error("[API] Unhandled:", err.message); return NextResponse.json({ success: false, error: err.message }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createServiceSupabaseClient();

  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });
    const newRecord = {
      id: `reimb-${Date.now()}`,
      employee_name: body.employeeName || "Rahul Sharma",
      expense_type: body.expenseType,
      amount: Number(body.amount || 0),
      date: body.date || new Date().toISOString().split("T")[0],
      description: body.description || "",
      project: body.project || "General",
      status: "Submitted",
    };

    try {
      await supabase.from("reimbursements").insert(newRecord);
    } catch {}

    return NextResponse.json(
      { success: true, data: { ...body, id: newRecord.id, status: "Submitted" } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
