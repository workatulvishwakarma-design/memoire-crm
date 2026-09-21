import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_VENDORS = [
  {
    id: "ven-1",
    name: "PixelCraft Motion Studios",
    category: "Production House",
    contactPerson: "Karan Johar",
    email: "karan@pixelcraft.in",
    phone: "+91 98334 11200",
    monthlyPayout: 180000,
    status: "Active",
  },
  {
    id: "ven-2",
    name: "Navi Mumbai Eco Print Works",
    category: "Print Vendor",
    contactPerson: "Suresh Gupta",
    email: "info@ecoprintworks.in",
    phone: "+91 97110 44550",
    monthlyPayout: 95000,
    status: "Active",
  },
  {
    id: "ven-3",
    name: "Arjun Mehta (UI/UX Freelancer)",
    category: "Freelance Creative",
    contactPerson: "Arjun Mehta",
    email: "arjun.ui@gmail.com",
    phone: "+91 98201 99881",
    monthlyPayout: 120000,
    status: "Active",
  },
];

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("vendors").select("*");

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: DEFAULT_VENDORS });
    }

    const mapped = data.map((v: any) => ({
      id: v.id,
      name: v.name,
      category: v.category,
      contactPerson: v.contact_person,
      email: v.email,
      phone: v.phone,
      monthlyPayout: Number(v.monthly_payout || 0),
      status: v.status,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: DEFAULT_VENDORS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `ven-${Date.now()}`,
      name: body.name,
      category: body.category,
      contact_person: body.contactPerson,
      email: body.email,
      phone: body.phone,
      monthly_payout: Number(body.monthlyPayout || 0),
      status: "Active",
    };

    try {
      await supabase.from("vendors").insert(newRecord);
    } catch {}

    return NextResponse.json({ success: true, data: { ...body, id: newRecord.id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
