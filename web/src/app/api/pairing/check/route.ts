import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30; // Higher limit — desktop polls every 4s
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") || "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("pairing_codes")
    .select("id, used, expires_at, pc_id, user_id, device_jwt")
    .eq("code", code)
    .single();

  if (error || !data) {
    return NextResponse.json({ status: "invalid" });
  }

  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ status: "expired" });
  }

  // Not yet confirmed
  if (!data.used || !data.pc_id) {
    return NextResponse.json({ status: "pending" });
  }

  // Confirmed — return credentials
  return NextResponse.json({
    status: "confirmed",
    pc_id: data.pc_id,
    user_id: data.user_id,
    device_jwt: data.device_jwt,
  });
}
