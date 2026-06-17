import { NextRequest, NextResponse } from "next/server";

const ADMIN_PIN = process.env.ADMIN_PIN ?? "";

export async function POST(req: NextRequest) {
  if (!ADMIN_PIN) {
    return NextResponse.json(
      { ok: false, error: "No admin PIN configured on the server." },
      { status: 500 }
    );
  }

  let pin: string;
  try {
    const body = await req.json();
    pin = typeof body.pin === "string" ? body.pin.trim() : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!pin) return NextResponse.json({ ok: false }, { status: 400 });

  const ok = pin === ADMIN_PIN;
  return NextResponse.json({ ok });
}
