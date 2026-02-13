import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json();
  const token = (body.token || "").trim();

  if (!token) {
    return NextResponse.json({ error: "Token é obrigatório" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  // Find PC by sync_token
  const { data: pc, error: findError } = await supabaseAdmin
    .from("pcs")
    .select("id, user_id, sync_token_expires_at")
    .eq("sync_token", token)
    .single();

  if (findError || !pc) {
    return NextResponse.json({ error: "Token inválido." }, { status: 404 });
  }

  // Check expiry
  if (pc.sync_token_expires_at) {
    const expiresAt = new Date(pc.sync_token_expires_at);
    if (Date.now() > expiresAt.getTime()) {
      return NextResponse.json({ error: "Token expirado. Solicite um novo no painel." }, { status: 410 });
    }
  }

  // Consume token (clear it so it can't be reused)
  const { error: updateError } = await supabaseAdmin
    .from("pcs")
    .update({
      sync_token: null,
      sync_token_expires_at: null,
      is_online: true,
      app_running: true,
      paired_at: new Date().toISOString(),
    })
    .eq("id", pc.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    pc_id: pc.id,
    user_id: pc.user_id,
  });
}
