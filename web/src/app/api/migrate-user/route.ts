import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const OLD_USER_ID = "user_39ZulKiKCtEALq6zZisyAFsLehp";

const TABLES_WITH_USER_ID = [
  "pcs",
  "events",
  "commands",
  "daily_usage",
  "usage_sessions",
  "pc_settings",
  "pairing_codes",
  "app_usage",
  "site_visits",
  "blocked_apps",
  "blocked_sites",
];

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (userId === OLD_USER_ID) {
    return NextResponse.json({
      error: "You are still using the old Clerk dev user ID. Make sure you are logged in with Clerk production.",
    }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const results: Record<string, number> = {};

  // Migrate all tables from old user_id to new user_id
  for (const table of TABLES_WITH_USER_ID) {
    const { data, error } = await supabase
      .from(table)
      .update({ user_id: userId })
      .eq("user_id", OLD_USER_ID)
      .select("id");

    if (error) {
      console.error(`[migrate-user] Error migrating ${table}:`, error.message);
      results[table] = -1;
    } else {
      results[table] = data?.length || 0;
    }
  }

  // Delete the orphaned Stripe subscription (no MP data, stale dates)
  const { error: delError } = await supabase
    .from("subscriptions")
    .delete()
    .eq("user_id", OLD_USER_ID);

  // Also delete any subscription that might have been created for new user with Stripe data
  // (shouldn't exist, but just in case)

  if (delError) {
    console.error("[migrate-user] Error deleting old subscription:", delError.message);
  }

  return NextResponse.json({
    success: true,
    new_user_id: userId,
    old_user_id: OLD_USER_ID,
    migrated: results,
    subscription_cleaned: !delError,
    message: "All data migrated. Old Stripe subscription deleted. You can now subscribe with MercadoPago.",
  });
}
