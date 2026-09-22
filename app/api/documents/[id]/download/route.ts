import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceSupabaseClient();
  if (!supabase) return NextResponse.json({ success: false, error: "DB not configured", dbConnected: false }, { status: 503 });

  const { data, error } = await supabase
    .from("documents")
    .select("file_url, name, file_type")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: error?.message || "Document not found", dbConnected: true }, { status: 404 });
  }

  // Increment download count
  await supabase.from("documents").update({ download_count: supabase.rpc("increment", { row_id: id }) }).eq("id", id);

  return NextResponse.json({ success: true, data: { url: data.file_url, name: data.name, type: data.file_type }, dbConnected: true });
}
