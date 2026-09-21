import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const body = await request.json().catch(() => ({}));

    // Update lead
    try {
      await supabase.from("leads").update({ status: "Won" }).eq("id", id);
    } catch {}

    const clientId = `client-${Date.now()}`;
    const projectId = `proj-${Date.now()}`;

    const newClient = {
      id: clientId,
      companyName: body.companyName || "Won Client Ltd",
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80",
      industry: body.industry || "Enterprise",
      website: body.website || "https://company.in",
      location: body.location || "Mumbai",
      status: "Active",
      annualValue: Number(body.budget || 1200000),
      healthScore: 95,
      bdm: body.assignedBDM || "Amit Patel",
      accountManager: "Rohan Mehta",
      services: body.interestedServices || ["Brand & Digital Marketing"],
      joinedDate: new Date().toISOString().split("T")[0],
      notes: "Auto-onboarded deal from BDM pipeline.",
    };

    const newProject = {
      id: projectId,
      name: `${newClient.companyName} Brand Retainer`,
      clientId: newClient.id,
      clientName: newClient.companyName,
      serviceCategory: "Brand & Digital Marketing",
      projectManager: "Rohan Mehta",
      team: ["Ananya Iyer", "Sneha Kulkarni"],
      startDate: new Date().toISOString().split("T")[0],
      endDate: "2026-12-31",
      budget: newClient.annualValue,
      priority: "High",
      status: "Planning",
      progress: 10,
      description: `Client onboarding and launch deliverables for ${newClient.companyName}.`,
    };

    try {
      await supabase.from("clients").insert({
        id: newClient.id,
        company_name: newClient.companyName,
        logo: newClient.logo,
        industry: newClient.industry,
        website: newClient.website,
        location: newClient.location,
        status: newClient.status,
        annual_value: newClient.annualValue,
        health_score: newClient.healthScore,
        bdm: newClient.bdm,
        account_manager: newClient.accountManager,
        services: newClient.services,
        notes: newClient.notes,
      });

      await supabase.from("projects").insert({
        id: newProject.id,
        name: newProject.name,
        client_id: newClient.id,
        client_name: newClient.companyName,
        service_category: newProject.serviceCategory,
        project_manager: newProject.projectManager,
        team: newProject.team,
        start_date: newProject.startDate,
        end_date: newProject.endDate,
        budget: newProject.budget,
        priority: newProject.priority,
        status: newProject.status,
        progress: newProject.progress,
        description: newProject.description,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        leadId: id,
        client: newClient,
        project: newProject,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
