import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientName = searchParams.get("clientName") || "UrbanNest Realty";

    const supabase = createServiceSupabaseClient();

    let clientInfo: any = null;
    let clientProjects: any[] = [];
    let clientTasks: any[] = [];
    let clientInvoices: any[] = [];
    let clientTickets: any[] = [];

    if (supabase) {
      try {
        const [cRes, pRes, tRes, iRes, tkRes] = await Promise.all([
          supabase.from("clients").select("*").ilike("company_name", clientName).single(),
          supabase.from("projects").select("*").ilike("client_name", clientName),
          supabase.from("tasks").select("*").ilike("client_name", clientName).eq("is_client_visible", true),
          supabase.from("invoices").select("*").ilike("client_name", clientName),
          supabase.from("support_tickets").select("*").ilike("submitted_by", clientName),
        ]);

        clientInfo = cRes.data;
        clientProjects = pRes.data || [];
        clientTasks = tRes.data || [];
        clientInvoices = iRes.data || [];
        clientTickets = tkRes.data || [];
      } catch {}
    }

    if (!clientInfo) {
      clientInfo = {
        id: "client-1",
        companyName: clientName,
        logo: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&auto=format&fit=crop&q=80",
        industry: "Real Estate & Luxury Housing",
        location: "Navi Mumbai & Thane",
        status: "Active",
        annualValue: 1800000,
        accountManager: "Rohan Mehta",
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        clientInfo,
        projects: clientProjects,
        tasks: clientTasks,
        invoices: clientInvoices,
        tickets: clientTickets,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
