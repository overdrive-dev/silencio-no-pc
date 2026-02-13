import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserSubscription } from "@/lib/subscription";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getUserSubscription(userId);

  return NextResponse.json({
    subscribed: sub ? sub.status === "active" || sub.status === "trialing" : false,
    plan: sub?.plan || "free",
    status: sub?.status || "inactive",
    cancel_at_period_end: sub?.cancel_at_period_end || false,
    current_period_start: sub?.current_period_start || null,
    current_period_end: sub?.current_period_end || null,
    stripe_subscription_id: sub?.stripe_subscription_id || null,
  });
}
