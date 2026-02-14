import { getSupabaseAdmin } from "./supabase-server";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  mp_payer_id: string | null;
  mp_subscription_id: string | null;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function isUserSubscribed(userId: string): Promise<boolean> {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;
  return sub.status === "active" || sub.status === "trialing";
}

export async function upsertSubscription(
  userId: string,
  data: Partial<Subscription>
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const existing = await getUserSubscription(userId);

  if (existing) {
    await supabase
      .from("subscriptions")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  } else {
    await supabase.from("subscriptions").insert({
      user_id: userId,
      ...data,
    });
  }
}
