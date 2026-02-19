import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { signDeviceJwt } from "@/lib/device-jwt";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
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

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const token = (body.token || "").trim();
  const platform = (body.platform || "windows").trim();
  const deviceName = (body.name || "").trim();

  if (!token) {
    return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Find PC by sync_token
  const { data: pc, error: findError } = await supabaseAdmin
    .from("pcs")
    .select("id, user_id, sync_token_expires_at, paired_at")
    .eq("sync_token", token)
    .is("deleted_at", null)
    .single();

  if (findError || !pc) {
    return NextResponse.json({ error: "Token inválido." }, { status: 404 });
  }

  // Check expiry — skip if device is already paired (idempotent retry)
  const isRetry = !!pc.paired_at;
  if (pc.sync_token_expires_at && !isRetry) {
    const expiresAt = new Date(pc.sync_token_expires_at);
    if (Date.now() > expiresAt.getTime()) {
      return NextResponse.json({ error: "Token expirado. Solicite um novo no painel." }, { status: 410 });
    }
  }

  // Keep sync_token for idempotent retries — expire it immediately instead of clearing
  const updateData: Record<string, unknown> = {
    sync_token_expires_at: new Date().toISOString(),
    is_online: true,
    app_running: true,
    paired_at: isRetry ? pc.paired_at : new Date().toISOString(),
    platform,
  };
  if (deviceName) updateData.name = deviceName;

  const { error: updateError } = await supabaseAdmin
    .from("pcs")
    .update(updateData)
    .eq("id", pc.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    pc_id: pc.id,
    user_id: pc.user_id,
    device_jwt: signDeviceJwt(pc.id, pc.user_id),
  });
}
