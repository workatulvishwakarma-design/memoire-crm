import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

function mapVendor(v: any) {
  return {
    id: v.id,
    name: v.name,
    category: v.category,
    contactPerson: v.contact_person,
    email: v.email,
    phone: v.phone,
    monthlyPayout: Number(v.monthly_payout || 0),
    status: v.status || "Active",
    notes: v.notes || "",
    createdAt: v.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
  };
}

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[API/vendors GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: (data || []).map(mapVendor), dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    name: body.name,
    category: body.category || "General",
    contact_person: body.contactPerson || body.name,
    email: body.email || "",
    phone: body.phone || "",
    monthly_payout: Number(body.monthlyPayout || 0),
    status: body.status || "Active",
    notes: body.notes || "",
  };

  if (!supabase) {
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: `vendor-${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("vendors").insert(record).select().single();
  if (error) {
    console.error("[API/vendors POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: mapVendor(data), dbConnected: true }, { status: 201 });
}
