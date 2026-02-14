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
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "7");
  const date = url.searchParams.get("date"); // optional: specific date

  const supabaseAdmin = getSupabaseAdmin();

  // Verify ownership
  const { data: pc } = await supabaseAdmin
    .from("pcs")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (!pc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Build date filter
  let dateFilter: string;
  if (date) {
    dateFilter = date;
  } else {
    const since = new Date();
    since.setDate(since.getDate() - days);
    dateFilter = since.toISOString().split("T")[0];
  }

  // Fetch app usage
  let appQuery = supabaseAdmin
    .from("app_usage")
    .select("*")
    .eq("pc_id", id)
    .order("minutes", { ascending: false });

  if (date) {
    appQuery = appQuery.eq("date", dateFilter);
  } else {
    appQuery = appQuery.gte("date", dateFilter);
  }

  const { data: appUsage, error: appError } = await appQuery;

  if (appError) {
    return NextResponse.json({ error: appError.message }, { status: 500 });
  }

  // Fetch site visits
  let siteQuery = supabaseAdmin
    .from("site_visits")
    .select("*")
    .eq("pc_id", id)
    .order("total_seconds", { ascending: false });

  if (date) {
    siteQuery = siteQuery.eq("date", dateFilter);
  } else {
    siteQuery = siteQuery.gte("date", dateFilter);
  }

  const { data: siteVisits, error: siteError } = await siteQuery;

  if (siteError) {
    return NextResponse.json({ error: siteError.message }, { status: 500 });
  }

  return NextResponse.json({
    app_usage: appUsage || [],
    site_visits: siteVisits || [],
  });
}
