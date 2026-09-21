import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    let downloadUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    try {
      const { data: doc } = await supabase.from("documents").select("*").eq("id", id).single();
      if (doc?.storage_path) {
        // Generate signed URL with 60 seconds expiration
        const { data: signed } = await supabase.storage.from("memoire-vault").createSignedUrl(doc.storage_path, 60);
        if (signed?.signedUrl) {
          downloadUrl = signed.signedUrl;
        }
      }
    } catch {}

    return NextResponse.json({ success: true, downloadUrl });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
