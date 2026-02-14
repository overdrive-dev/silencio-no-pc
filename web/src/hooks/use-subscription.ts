"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export interface SubscriptionStatus {
  subscribed: boolean;
  plan: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  mp_subscription_id: string | null;
  stripe_subscription_id: string | null;
}

const CACHE_KEY = "kidspc_sub_status";

function getCached(): SubscriptionStatus | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function setCache(data: SubscriptionStatus) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function clearSubscriptionCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {}
}

export function useSubscription() {
  const { isSignedIn } = useUser();
  const initialCache = useRef(typeof window !== "undefined" ? getCached() : null);
  const [sub, setSub] = useState<SubscriptionStatus | null>(initialCache.current);
  const [loading, setLoading] = useState(!initialCache.current);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/mercadopago/status");
      const data: SubscriptionStatus = await res.json();

      // If no active sub found, try syncing directly from MercadoPago
      if (!data.subscribed && data.status === "inactive") {
        const syncRes = await fetch("/api/mercadopago/sync", { method: "POST" });
        const syncData = await syncRes.json();
        if (syncData.synced) {
          const res2 = await fetch("/api/mercadopago/status");
          const data2: SubscriptionStatus = await res2.json();
          setSub(data2);
          setCache(data2);
          setLoading(false);
          return;
        }
      }

      setSub(data);
      setCache(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    // If we have a cache hit, skip fetching — show instantly
    if (initialCache.current) {
      setLoading(false);
      return;
    }

    refresh();
  }, [isSignedIn, refresh]);

  const invalidate = useCallback(() => {
    clearSubscriptionCache();
    refresh();
  }, [refresh]);

  const isActive = sub?.subscribed ?? false;

  // Grace period: allow access for 7 days after subscription expires
  const isInGracePeriod = !isActive && sub?.current_period_end
    ? new Date(sub.current_period_end).getTime() + 7 * 24 * 60 * 60 * 1000 > Date.now()
    : false;

  const hasAccess = isActive || isInGracePeriod;

  const daysUntilBlock = isInGracePeriod && sub?.current_period_end
    ? Math.max(0, Math.ceil((new Date(sub.current_period_end).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  return {
    subscription: sub,
    loading,
    isActive,
    isInGracePeriod,
    hasAccess,
    daysUntilBlock,
    isPastDue: sub?.status === "past_due",
    isCanceled: sub?.cancel_at_period_end ?? false,
    invalidate,
  };
}
