import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ success: true, data: [], dbConnected: false });
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*, client_contacts(*)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API/clients GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((c: any) => {
    const primaryContact = (c.client_contacts || []).find((cc: any) => cc.is_primary) || (c.client_contacts || [])[0];
    return {
      id: c.id,
      companyName: c.company_name,
      logo: c.logo || "",
      industry: c.industry,
      website: c.website || "",
      location: c.location,
      status: c.status,
      annualValue: Number(c.annual_value || 0),
      healthScore: c.health_score || 90,
      bdm: c.bdm || "Amit Patel",
      accountManager: c.account_manager || "Account Manager",
      services: c.services || [],
      joinedDate: c.joined_date || c.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
      notes: c.notes || "",
      primaryContact: primaryContact
        ? {
            id: primaryContact.id,
            name: primaryContact.name,
            designation: primaryContact.designation || "Key Contact",
            email: primaryContact.email,
            phone: primaryContact.phone || "",
            isPrimary: true,
          }
        : {
            id: `cont-${c.id}`,
            name: "Contact",
            designation: "Key Representative",
            email: `contact@${c.company_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
            phone: "",
            isPrimary: true,
          },
    };
  });

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();
  const today = new Date().toISOString().split("T")[0];

  const record = {
    company_name: body.companyName,
    logo: body.logo || "",
    industry: body.industry || "General",
    website: body.website || "",
    location: body.location || "Mumbai",
    status: body.status || "Active",
    annual_value: Number(body.annualValue || 0),
    health_score: body.healthScore || 90,
    bdm: body.bdm || "Amit Patel",
    account_manager: body.accountManager || "Account Manager",
    services: body.services || [],
    joined_date: today,
    notes: body.notes || "",
  };

  if (!supabase) {
    const localId = `client-${Date.now()}`;
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: { ...body, id: localId, joinedDate: today },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("clients").insert(record).select().single();

  if (error) {
    console.error("[API/clients POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  // Insert primary contact if provided
  if (body.primaryContact) {
    await supabase.from("client_contacts").insert({
      client_id: data.id,
      name: body.primaryContact.name,
      designation: body.primaryContact.designation || "Key Contact",
      email: body.primaryContact.email,
      phone: body.primaryContact.phone || "",
      is_primary: true,
    });
  }

  const created = {
    id: data.id,
    companyName: data.company_name,
    logo: data.logo || "",
    industry: data.industry,
    website: data.website || "",
    location: data.location,
    status: data.status,
    annualValue: Number(data.annual_value || 0),
    healthScore: data.health_score || 90,
    bdm: data.bdm,
    accountManager: data.account_manager,
    services: data.services || [],
    joinedDate: data.joined_date || today,
    notes: data.notes || "",
    primaryContact: body.primaryContact || {
      id: `cont-${data.id}`,
      name: "Contact",
      designation: "Key Contact",
      email: body.primaryContact?.email || `contact@${data.company_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
      phone: "",
      isPrimary: true,
    },
  };

  return NextResponse.json({ success: true, data: created, dbConnected: true }, { status: 201 });
}
