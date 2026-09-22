import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

function mapInvoice(i: any) {
  return {
    id: i.id,
    invoiceNumber: i.invoice_number,
    clientName: i.client_name,
    projectName: i.project_name,
    amount: Number(i.amount || 0),
    tax: Number(i.tax || 0),
    total: Number(i.total || 0),
    dueDate: i.due_date,
    issueDate: i.issue_date,
    status: i.status || "Pending",
  };
}

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[API/invoices GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: (data || []).map(mapInvoice), dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();
  const today = new Date().toISOString().split("T")[0];

  const amount = Number(body.amount || 0);
  const tax = Math.round(amount * 0.18 * 100) / 100;
  const total = amount + tax;
  const invNum = `MEM-INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

  const record = {
    invoice_number: invNum,
    client_name: body.clientName,
    client_id: body.clientId || null,
    project_name: body.projectName,
    project_id: body.projectId || null,
    amount,
    tax,
    total,
    issue_date: body.issueDate || today,
    due_date: body.dueDate || today,
    status: "Pending",
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: `inv-${Date.now()}`, invoiceNumber: invNum, amount, tax, total, status: "Pending" },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("invoices").insert(record).select().single();
  if (error) {
    console.error("[API/invoices POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: mapInvoice(data), dbConnected: true }, { status: 201 });
}
