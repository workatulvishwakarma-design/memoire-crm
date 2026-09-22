import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_ASSETS = [
  {
    id: "asset-1",
    name: "Apple MacBook Pro M3 Max 16\"",
    category: "Laptop / Mac",
    serialNumber: "C02G8912MD6R",
    assignedTo: "Rahul Sharma",
    issueDate: "2026-01-10",
    condition: "Brand New",
    status: "Active",
  },
  {
    id: "asset-2",
    name: "Sony Alpha A7 IV 4K Cinema Camera",
    category: "Camera & Video",
    serialNumber: "S01-449102-CAM",
    assignedTo: "Vikram Singh",
    issueDate: "2026-03-15",
    condition: "Good",
    status: "Active",
  },
  {
    id: "asset-3",
    name: "Dell UltraSharp 27\" 4K USB-C Monitor",
    category: "Monitor / Display",
    serialNumber: "CN-09812-DEL",
    assignedTo: "Ananya Iyer",
    issueDate: "2026-02-01",
    condition: "Good",
    status: "Active",
  },
];

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });
    const { data, error } = await supabase.from("company_assets").select("*");

    

    const mapped = (data || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      serialNumber: a.serial_number,
      assignedTo: a.assigned_to,
      issueDate: a.issue_date,
      condition: a.condition,
      status: a.status,
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
      id: `asset-${Date.now()}`,
      name: body.name,
      category: body.category,
      serial_number: body.serialNumber || `MEM-SN-${Date.now().toString().slice(-6)}`,
      assigned_to: body.assignedTo || "Rahul Sharma",
      issue_date: body.issueDate || new Date().toISOString().split("T")[0],
      condition: body.condition || "Good",
      status: "Active",
    };

    try {
      await supabase.from("company_assets").insert(newRecord);
    } catch {}

    return NextResponse.json({ success: true, data: { ...body, id: newRecord.id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
