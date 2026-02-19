import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

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
    .from("pcs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "PC not found" }, { status: 404 });
  }

  return NextResponse.json({ pc: data });
}

export async function PATCH(
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

  const { error } = await supabaseAdmin
    .from("pcs")
    .update({ name: body.name })
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabaseAdmin = getSupabaseAdmin();

  // Soft delete: set deleted_at instead of removing the row
  const { error } = await supabaseAdmin
    .from("pcs")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) {
    console.error("DELETE PC error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send unpair command so the desktop/android app auto-unpairs
  await supabaseAdmin.from("commands").insert({
    user_id: userId,
    pc_id: id,
    command: "unpair",
    payload: {},
  });

  return NextResponse.json({ ok: true });
}
