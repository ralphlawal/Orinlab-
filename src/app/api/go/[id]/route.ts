import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data } = await supabase
    .from("releases")
    .select("ditto_smart_link, store_links, status")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (!data) {
    return NextResponse.redirect(new URL(`/listen/${id}`, process.env.NEXT_PUBLIC_SITE_URL ?? "https://orinlabi.com"));
  }

  // Prefer the ditto smart link as the all-platform router
  if (data.ditto_smart_link) {
    return NextResponse.redirect(data.ditto_smart_link, { status: 302 });
  }

  // Fall back to the listen page itself
  return NextResponse.redirect(new URL(`/listen/${id}`, process.env.NEXT_PUBLIC_SITE_URL ?? "https://orinlabi.com"));
}
