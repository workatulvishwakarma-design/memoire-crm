import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { text, author } = await request.json();
    const supabase = await createServerSupabaseClient();

    const newComment = {
      id: `tc-${Date.now()}`,
      author: author || "Rahul Sharma",
      text,
      createdAt: "Just now",
    };

    try {
      const { data } = await supabase.from("tasks").select("comments").eq("id", id).single();
      const comments = data?.comments ? [...data.comments, newComment] : [newComment];
      await supabase.from("tasks").update({ comments }).eq("id", id);
    } catch {}

    return NextResponse.json({ success: true, data: newComment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
