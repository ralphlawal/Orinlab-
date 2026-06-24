import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const ADMIN_PIN = process.env.ADMIN_PIN ?? "";

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [keys.join(","), ...rows.map(r => keys.map(k => escape(r[k])).join(","))].join("\n");
}

export async function POST(req: NextRequest) {
  const { pin, type } = await req.json();
  if (!pin || pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  let csv = "";
  let filename = "export.csv";

  if (type === "releases") {
    const { data } = await supabase.from("releases").select("*").order("submitted_at", { ascending: false });
    csv = toCsv((data ?? []) as Record<string, unknown>[]);
    filename = `orinlabi-releases-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === "artists") {
    const { data } = await supabase.from("artist_profiles").select("*").order("created_at", { ascending: false });
    csv = toCsv((data ?? []) as Record<string, unknown>[]);
    filename = `orinlabi-artists-${new Date().toISOString().slice(0, 10)}.csv`;
  } else if (type === "labels") {
    const { data } = await supabase.from("label_profiles").select("*").order("created_at", { ascending: false });
    csv = toCsv((data ?? []) as Record<string, unknown>[]);
    filename = `orinlabi-labels-${new Date().toISOString().slice(0, 10)}.csv`;
  } else {
    return NextResponse.json({ error: "Unknown export type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
