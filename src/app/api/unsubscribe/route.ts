import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let email: string;
  try { ({ email } = await req.json()); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  await supabase
    .from("newsletter_subscribers")
    .update({ active: false })
    .eq("email", email.toLowerCase().trim());

  return NextResponse.json({ success: true });
}
