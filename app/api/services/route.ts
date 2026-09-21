import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SERVICES_CATALOG } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: SERVICES_CATALOG });
    }

    const mapped = data.map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
      pricingType: s.pricing_type,
      basePrice: Number(s.base_price || 0),
      activeProjectsCount: s.active_projects_count || 1,
      activeClientsCount: s.active_clients_count || 1,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: SERVICES_CATALOG });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `serv-${Date.now()}`,
      name: body.name,
      category: body.category,
      description: body.description,
      pricing_type: body.pricingType || "Retainer",
      base_price: Number(body.basePrice || 100000),
      active_projects_count: 1,
      active_clients_count: 1,
    };

    try {
      await supabase.from("services").insert(newRecord);
    } catch {}

    return NextResponse.json({ success: true, data: { ...body, id: newRecord.id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
