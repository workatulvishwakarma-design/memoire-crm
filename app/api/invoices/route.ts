import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_INVOICES } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_INVOICES });
    }

    const mapped = data.map((i: any) => ({
      id: i.id,
      invoiceNumber: i.invoice_number,
      clientName: i.client_name,
      projectName: i.project_name,
      amount: Number(i.amount || 0),
      dueDate: i.due_date,
      issueDate: i.issue_date,
      status: i.status,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_INVOICES });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const invNum = `MEM-INV-2026-0${Math.floor(Math.random() * 800) + 100}`;
    const newRecord = {
      id: `inv-${Date.now()}`,
      invoice_number: invNum,
      client_name: body.clientName,
      project_name: body.projectName,
      amount: Number(body.amount || 0),
      tax: Number(body.amount || 0) * 0.18,
      total: Number(body.amount || 0) * 1.18,
      due_date: body.dueDate || "2026-08-30",
      issue_date: body.issueDate || new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    try {
      await supabase.from("invoices").insert(newRecord);
    } catch {}

    return NextResponse.json(
      { success: true, data: { ...body, id: newRecord.id, invoiceNumber: invNum, status: "Pending" } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
