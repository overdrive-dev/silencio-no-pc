import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

function generateSyncToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const syncToken = generateSyncToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const supabaseAdmin = getSupabaseAdmin();

  // Reset online/pairing flags so the polling won't false-positive from stale data
  const { error } = await supabaseAdmin
    .from("pcs")
    .update({
      sync_token: syncToken,
      sync_token_expires_at: expiresAt,
      is_online: false,
      app_running: false,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sync_token: syncToken, expires_at: expiresAt });
}
