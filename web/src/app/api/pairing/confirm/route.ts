import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { getUserSubscription, getDeviceCount } from "@/lib/subscription";
import { BASE_DEVICES } from "@/lib/mercadopago";
import { signDeviceJwt } from "@/lib/device-jwt";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const code = ((body.code as string) || "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // 1. Find the pairing code
  const { data: pairing, error: findError } = await supabaseAdmin
    .from("pairing_codes")
    .select("id, used, expires_at, platform")
    .eq("code", code)
    .single();

  if (findError || !pairing) {
    return NextResponse.json({ error: "Código inválido." }, { status: 404 });
  }

  if (pairing.used) {
    return NextResponse.json({ error: "Código já utilizado." }, { status: 409 });
  }

  if (new Date(pairing.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Código expirado. Gere um novo no app." },
      { status: 410 }
    );
  }

  // 2. Check subscription
  const sub = await getUserSubscription(userId);
  const isActive = sub && (sub.status === "active" || sub.status === "authorized");
  if (!isActive) {
    return NextResponse.json(
      {
        error: "Assinatura ativa necessária para vincular dispositivos.",
        code: "NO_SUBSCRIPTION",
      },
      { status: 403 }
    );
  }

  // 3. Check device limit
  const deviceCount = await getDeviceCount(userId);
  const maxDevices = sub.max_devices ?? BASE_DEVICES;
  if (deviceCount >= maxDevices) {
    return NextResponse.json(
      {
        error: `Limite de ${maxDevices} dispositivo(s) atingido.`,
        code: "DEVICE_LIMIT_REACHED",
        device_count: deviceCount,
        max_devices: maxDevices,
      },
      { status: 403 }
    );
  }

  // 4. Create the device
  const { data: pc, error: pcError } = await supabaseAdmin
    .from("pcs")
    .insert({
      user_id: userId,
      name: "Novo PC",
      is_online: true,
      app_running: true,
      platform: pairing.platform || "windows",
      paired_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (pcError) {
    return NextResponse.json({ error: pcError.message }, { status: 500 });
  }

  // 5. Create default settings
  await supabaseAdmin.from("pc_settings").insert({
    user_id: userId,
    pc_id: pc.id,
  });

  // 6. Generate device JWT
  const deviceJwt = signDeviceJwt(pc.id, userId);

  // 7. Mark pairing code as used with credentials
  await supabaseAdmin
    .from("pairing_codes")
    .update({
      used: true,
      user_id: userId,
      pc_id: pc.id,
      device_jwt: deviceJwt,
    })
    .eq("id", pairing.id);

  return NextResponse.json({
    ok: true,
    pc_id: pc.id,
    device_name: pc.name,
  });
}
