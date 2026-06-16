import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  await supabase
    .from("newsletter_subscribers")
    .update({ active: false })
    .eq("email", email.toLowerCase().trim());

  return NextResponse.json({ success: true });
}
