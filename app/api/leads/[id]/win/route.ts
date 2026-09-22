import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

// POST /api/leads/[id]/win — Convert lead to client + create initial project
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await request.json();
  const supabase = createServiceSupabaseClient();
  const today = new Date().toISOString().split("T")[0];

  // Build client record
  const clientRecord = {
    company_name: lead.companyName,
    logo: "",
    industry: lead.industry,
    website: `https://${lead.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
    location: lead.location,
    status: "Active",
    annual_value: Number(lead.budget || 0),
    health_score: 90,
    bdm: lead.assignedBDM || "Amit Patel",
    account_manager: "Account Manager",
    services: lead.interestedServices || [],
    joined_date: today,
    notes: lead.notes || "",
  };

  if (!supabase) {
    // No DB — return optimistic data
    const localClientId = `client-${Date.now()}`;
    return NextResponse.json({
      success: true,
      dbConnected: false,
      data: {
        client: {
          ...clientRecord,
          id: localClientId,
          joinedDate: today,
          primaryContact: {
            id: `cont-${Date.now()}`,
            name: lead.contactName,
            designation: "Key Contact",
            email: lead.email,
            phone: lead.phone,
            isPrimary: true,
          },
        },
        project: {
          id: `proj-${Date.now()}`,
          name: `${lead.companyName} Brand Retainer`,
          clientId: localClientId,
          clientName: lead.companyName,
          serviceCategory: (lead.interestedServices || [])[0] || "Brand & Digital Marketing",
          projectManager: "Project Lead",
          team: [],
          startDate: today,
          endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
          budget: lead.budget,
          priority: "High",
          status: "Planning",
          progress: 10,
          description: `Initial brand onboarding for ${lead.companyName}.`,
        },
      },
    });
  }

  // Insert client
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .insert(clientRecord)
    .select()
    .single();

  if (clientError) {
    console.error("[API/leads/win CLIENT INSERT]", clientError.message);
    return NextResponse.json({ success: false, error: clientError.message, dbConnected: true }, { status: 500 });
  }

  // Insert contact
  await supabase.from("client_contacts").insert({
    client_id: clientData.id,
    name: lead.contactName,
    designation: "Key Contact",
    email: lead.email,
    phone: lead.phone,
    is_primary: true,
  });

  // Insert project
  const projectRecord = {
    name: `${lead.companyName} Brand Retainer`,
    client_id: clientData.id,
    client_name: lead.companyName,
    service_category: (lead.interestedServices || [])[0] || "Brand & Digital Marketing",
    project_manager: "Project Lead",
    team: [],
    start_date: today,
    end_date: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    budget: Number(lead.budget || 0),
    priority: "High",
    status: "Planning",
    progress: 10,
    description: `Initial brand onboarding for ${lead.companyName}.`,
  };

  const { data: projData, error: projError } = await supabase
    .from("projects")
    .insert(projectRecord)
    .select()
    .single();

  // Mark lead as won with converted_client_id
  await supabase
    .from("leads")
    .update({ status: "Won", converted_client_id: clientData.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  const clientMapped = {
    id: clientData.id,
    companyName: clientData.company_name,
    logo: clientData.logo || "",
    industry: clientData.industry,
    website: clientData.website,
    location: clientData.location,
    status: clientData.status,
    annualValue: Number(clientData.annual_value || 0),
    healthScore: clientData.health_score || 90,
    bdm: clientData.bdm,
    accountManager: clientData.account_manager,
    services: clientData.services || [],
    joinedDate: clientData.joined_date || today,
    notes: clientData.notes || "",
    primaryContact: {
      id: `cont-${clientData.id}`,
      name: lead.contactName,
      designation: "Key Contact",
      email: lead.email,
      phone: lead.phone,
      isPrimary: true,
    },
  };

  const projectMapped = projData
    ? {
        id: projData.id,
        name: projData.name,
        clientId: projData.client_id,
        clientName: projData.client_name,
        serviceCategory: projData.service_category,
        projectManager: projData.project_manager,
        team: projData.team || [],
        startDate: projData.start_date,
        endDate: projData.end_date,
        budget: Number(projData.budget || 0),
        priority: projData.priority,
        status: projData.status,
        progress: projData.progress || 10,
        description: projData.description || "",
      }
    : null;

  return NextResponse.json({
    success: true,
    dbConnected: true,
    data: { client: clientMapped, project: projectMapped },
  });
}
