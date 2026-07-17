import { NextRequest, NextResponse } from "next/server";

const DOMAIN_ID = "9d6fc290-85f5-4953-af62-3165914254f9";
const WEBHOOK_URL = "https://orinlabi.com/api/email/inbound";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function POST(req: NextRequest) {
  const callerEmail = req.headers.get("x-admin-email")?.toLowerCase() ?? "";
  if (!ADMIN_EMAILS.includes(callerEmail)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use a full-access key for inbound route creation (RESEND_API_KEY may be send-only)
  const apiKey = process.env.RESEND_ADMIN_KEY ?? process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_ADMIN_KEY not set in Vercel env vars" }, { status: 500 });
  }

  const res = await fetch("https://api.resend.com/inbound-routes", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain_id: DOMAIN_ID, webhook_url: WEBHOOK_URL }),
  });

  const data = await res.json();
  console.log("Setup inbound route response:", res.status, data);

  if (!res.ok) {
    return NextResponse.json({ error: "Resend API error", detail: data }, { status: res.status });
  }

  return NextResponse.json({ success: true, route: data });
}
