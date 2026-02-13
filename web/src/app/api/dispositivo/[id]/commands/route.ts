import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabaseAdmin = getSupabaseAdmin();

  const pcCheck = await supabaseAdmin
    .from("pcs")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!pcCheck.data) {
    return NextResponse.json({ error: "PC not found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin.from("commands").insert({
    user_id: userId,
    pc_id: id,
    command: body.command,
    payload: body.payload || {},
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  const { data, error } = await supabaseAdmin
    .from("commands")
    .select("*")
    .eq("pc_id", id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ commands: data });
}
