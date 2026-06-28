import { NextRequest, NextResponse } from "next/server";

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function rateLimitResponse(req: NextRequest, limit: number, windowMs: number): NextResponse | null {
  const ip = getIp(req);
  const key = `${req.nextUrl.pathname}:${ip}`;
  if (!checkRateLimit(key, limit, windowMs)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  return null;
}
