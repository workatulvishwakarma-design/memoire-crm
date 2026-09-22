import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: true, data: [], dbConnected: false });

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API/documents GET]", error.message);
    return NextResponse.json({ success: false, error: error.message, data: [], dbConnected: true }, { status: 500 });
  }

  const mapped = (data || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    category: d.category || "General",
    size: d.size || "",
    uploadedBy: d.uploaded_by || "Admin",
    uploadedDate: d.uploaded_date || d.created_at?.split("T")[0] || "",
    tags: d.tags || [],
    fileType: d.file_type || "pdf",
    fileUrl: d.file_url || "",
    clientId: d.client_id || null,
    downloadCount: d.download_count || 0,
  }));

  return NextResponse.json({ success: true, data: mapped, dbConnected: true });
}

export async function POST(request: Request) {
  const supabase = createServiceSupabaseClient();
  const body = await request.json();

  const record = {
    name: body.name,
    category: body.category || "General",
    size: body.size || "",
    uploaded_by: body.uploadedBy || "Admin",
    uploaded_date: new Date().toISOString().split("T")[0],
    tags: body.tags || [],
    file_type: body.fileType || "pdf",
    file_url: body.fileUrl || "",
    client_id: body.clientId || null,
    download_count: 0,
  };

  if (!supabase) {
    return NextResponse.json({
      success: true, dbConnected: false,
      data: { ...body, id: `doc-${Date.now()}`, uploadedDate: record.uploaded_date },
    }, { status: 201 });
  }

  const { data, error } = await supabase.from("documents").insert(record).select().single();
  if (error) {
    console.error("[API/documents POST]", error.message);
    return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  }

  return NextResponse.json({
    success: true, dbConnected: true,
    data: { id: data.id, name: data.name, category: data.category, size: data.size, uploadedBy: data.uploaded_by, uploadedDate: data.uploaded_date, tags: data.tags || [], fileType: data.file_type, fileUrl: data.file_url },
  }, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = createServiceSupabaseClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
  if (!supabase) return NextResponse.json({ success: true, dbConnected: false });

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message, dbConnected: true }, { status: 500 });
  return NextResponse.json({ success: true, dbConnected: true });
}
