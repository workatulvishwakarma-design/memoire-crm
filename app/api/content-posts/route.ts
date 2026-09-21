import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_POSTS = [
  {
    id: "post-1",
    clientName: "UrbanNest Realty",
    platform: "Instagram",
    title: "UrbanNest Tower A Penthouse Reel Preview",
    contentType: "Reel",
    caption: "Experience 360-degree sunset views from the luxury penthouse suites at Kharghar. Book your exclusive site tour today! 🌆✨",
    creativeUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
    scheduledDate: "2026-08-15 18:00",
    status: "CLIENT_REVIEW",
    hashtags: "#UrbanNest #NaviMumbaiRealEstate #LuxuryHomes #KhargharPenthouses",
  },
  {
    id: "post-2",
    clientName: "Aarav Foods",
    platform: "Facebook",
    title: "Organic Banana Chips Launch Carousel",
    contentType: "Carousel",
    caption: "Crafted with 100% natural coconut oil and zero preservatives. Taste authentic South Indian crunch in every bite! 🍌",
    creativeUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80",
    scheduledDate: "2026-08-16 12:30",
    status: "APPROVED",
    hashtags: "#AaravFoods #OrganicSnacks #HealthySnacking #CleanEating",
  },
  {
    id: "post-3",
    clientName: "Bombay Spice Co.",
    platform: "LinkedIn",
    title: "Artisanal Spice Export Story B2B",
    contentType: "Static Post",
    caption: "From farm to global kitchens: How Bombay Spice Co. preserves single-origin spice aromas through sustainable vacuum packaging.",
    creativeUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80",
    scheduledDate: "2026-08-18 10:00",
    status: "SCHEDULED",
    hashtags: "#BombaySpice #SpiceExporter #B2BFood #FoodInnovation",
  },
];

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("content_posts").select("*").order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ success: true, data: DEFAULT_POSTS });
    }

    const mapped = data.map((p: any) => ({
      id: p.id,
      clientName: p.client_name,
      platform: p.platform,
      title: p.title,
      caption: p.caption,
      creativeUrl: p.creative_url,
      scheduledDate: p.scheduled_date,
      status: p.status,
      hashtags: p.hashtags,
      contentType: p.content_type || "Static Post",
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: DEFAULT_POSTS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    const newRecord = {
      id: `post-${Date.now()}`,
      client_name: body.clientName,
      platform: body.platform,
      title: body.title,
      caption: body.caption || "",
      creative_url: body.creativeUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
      scheduled_date: body.scheduledDate,
      status: body.status || "DRAFT",
      hashtags: body.hashtags || "",
      content_type: body.contentType || "Static Post",
    };

    try {
      await supabase.from("content_posts").insert(newRecord);
    } catch {}

    return NextResponse.json({ success: true, data: { ...body, id: newRecord.id } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
