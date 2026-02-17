import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getUserSubscription, getDeviceCount } from "@/lib/subscription";
import { BASE_DEVICES } from "@/lib/mercadopago";
import crypto from "crypto";

function generateSyncToken(): string {
  return crypto.randomBytes(16).toString("hex"); // 32 hex chars = 128 bits
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("pcs")
    .select("*")
    .eq("user_id", userId)
    .order("paired_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pcs: data });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Require active subscription
  const sub = await getUserSubscription(userId);
  const isActive = sub && (sub.status === "active" || sub.status === "authorized");
  if (!isActive) {
    return NextResponse.json(
      { error: "Assinatura ativa necessária para adicionar dispositivos.", code: "NO_SUBSCRIPTION" },
      { status: 403 }
    );
  }

  // 2. Check device limit
  const deviceCount = await getDeviceCount(userId);
  const maxDevices = sub.max_devices ?? BASE_DEVICES;
  if (deviceCount >= maxDevices) {
    return NextResponse.json(
      {
        error: `Limite de ${maxDevices} dispositivo(s) atingido. Faça upgrade para adicionar mais.`,
        code: "DEVICE_LIMIT_REACHED",
        device_count: deviceCount,
        max_devices: maxDevices,
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const syncToken = generateSyncToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

  const supabaseAdmin = getSupabaseAdmin();

  const { data: pc, error: pcError } = await supabaseAdmin
    .from("pcs")
    .insert({
      user_id: userId,
      name,
      sync_token: syncToken,
      sync_token_expires_at: expiresAt,
      is_online: false,
      app_running: false,
    })
    .select()
    .single();

  if (pcError) {
    return NextResponse.json({ error: pcError.message }, { status: 500 });
  }

  // Create default settings for this PC
  await supabaseAdmin.from("pc_settings").insert({
    user_id: userId,
    pc_id: pc.id,
  });

  return NextResponse.json({ pc, sync_token: syncToken });
}
