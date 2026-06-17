import { NextRequest, NextResponse } from "next/server";

const ADMIN_PIN   = process.env.ADMIN_PIN   ?? "";
const NOTIFY_URL  = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/notify`
  : null;

export async function POST(req: NextRequest) {
  if (!ADMIN_PIN) {
    return NextResponse.json(
      { ok: false, error: "No admin PIN configured on the server." },
      { status: 500 }
    );
  }

  let pin: string;
  let adminEmail: string;
  try {
    const body = await req.json();
    pin        = typeof body.pin         === "string" ? body.pin.trim()         : "";
    adminEmail = typeof body.admin_email === "string" ? body.admin_email.trim() : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!pin) return NextResponse.json({ ok: false }, { status: 400 });

  const ok = pin === ADMIN_PIN;

  if (ok && adminEmail) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined;

    const notifyBase = NOTIFY_URL ?? `${req.nextUrl.origin}/api/notify`;
    fetch(notifyBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "admin-action",
        data: { email: adminEmail, ip },
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok });
}
