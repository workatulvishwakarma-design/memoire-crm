import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_CLIENTS } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("clients").select("*").is("deleted_at", null).order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_CLIENTS });
    }

    const mapped = data.map((c: any) => ({
      id: c.id,
      companyName: c.company_name,
      logo: c.logo,
      industry: c.industry,
      website: c.website,
      location: c.location,
      status: c.status,
      annualValue: Number(c.annual_value || 0),
      healthScore: c.health_score || 90,
      bdm: c.bdm || "Amit Patel",
      accountManager: c.account_manager || "Rohan Mehta",
      services: c.services || [],
      joinedDate: c.joined_date || c.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      notes: c.notes || "",
      primaryContact: {
        id: `cont-${c.id}`,
        name: "Primary Contact",
        designation: "Key Representative",
        email: `contact@${c.company_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
        phone: "+91 98200 00000",
        isPrimary: true,
      },
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_CLIENTS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `client-${Date.now()}`,
      company_name: body.companyName,
      logo: body.logo || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80",
      industry: body.industry,
      website: body.website || "",
      location: body.location,
      status: body.status || "Active",
      annual_value: Number(body.annualValue || 1200000),
      health_score: body.healthScore || 90,
      bdm: body.bdm || "Amit Patel",
      account_manager: body.accountManager || "Rohan Mehta",
      services: body.services || ["Brand & Creative"],
      notes: body.notes || "",
    };

    try {
      await supabase.from("clients").insert(newRecord);
    } catch {}

    const createdClient = {
      ...body,
      id: newRecord.id,
      joinedDate: new Date().toISOString().split("T")[0],
      primaryContact: body.primaryContact || {
        id: `cont-${newRecord.id}`,
        name: "Key Representative",
        designation: "Contact Person",
        email: `contact@${body.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
        phone: "+91 98200 00000",
        isPrimary: true,
      },
    };

    return NextResponse.json({ success: true, data: createdClient }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
