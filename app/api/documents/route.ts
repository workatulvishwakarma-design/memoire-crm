import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { INITIAL_DOCUMENTS } from "@/data/mockData";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_DOCUMENTS });
    }

    const mapped = data.map((d: any) => ({
      id: d.id,
      name: d.name,
      category: d.category,
      size: d.size,
      uploadedBy: d.uploaded_by,
      uploadedDate: d.uploaded_date,
      tags: d.tags || [],
      fileType: d.file_type || "pdf",
      fileUrl: d.file_url,
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_DOCUMENTS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `doc-${Date.now()}`,
      name: body.name,
      category: body.category || "Brand Assets",
      size: body.size || "2.4 MB",
      uploaded_by: body.uploadedBy || "Rahul Sharma",
      uploaded_date: new Date().toISOString().split("T")[0],
      tags: body.tags || ["Memoire Vault"],
      file_type: body.fileType || "pdf",
      visibility: "internal",
    };

    try {
      await supabase.from("documents").insert(newRecord);
    } catch {}

    return NextResponse.json(
      { success: true, data: { ...body, id: newRecord.id, uploadedDate: newRecord.uploaded_date } },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing document id" }, { status: 400 });

    const supabase = await createServerSupabaseClient();
    try {
      await supabase.from("documents").delete().eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, message: `Document ${id} deleted` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
