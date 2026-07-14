import { NextRequest, NextResponse } from "next/server";

// This route now simply redirects to the Orinlabi listen page.
// Previously it sent fans directly to Ditto — now fans always land on
// orinlabi.com/listen/[id] where they can choose their platform.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://orinlabi.com";
  return NextResponse.redirect(new URL(`/listen/${id}`, base), { status: 302 });
}
