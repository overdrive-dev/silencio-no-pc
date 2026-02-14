"use client";

import { useEffect, useState, useCallback } from "react";
import type { AppUsage, SiteVisit } from "@/lib/types";

interface ActivityTabProps {
  deviceId: string;
}

function formatMinutes(min: number): string {
  if (min <= 0) return "< 1min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

function formatSeconds(sec: number): string {
  if (sec <= 0) return "< 1min";
  const min = Math.round(sec / 60);
  return formatMinutes(min);
}

export default function ActivityTab({ deviceId }: ActivityTabProps) {
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(1); // default: today

  const fetchActivity = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const params = days === 1 ? `date=${today}` : `days=${days}`;
      const res = await fetch(`/api/dispositivo/${deviceId}/activity?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAppUsage(data.app_usage || []);
        setSiteVisits(data.site_visits || []);
      }
    } catch (err) {
      console.error("Erro ao buscar atividade:", err);
    } finally {
      setLoading(false);
    }
  }, [deviceId, days]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // Aggregate app usage across days if multi-day view
  const aggregatedApps = days === 1
    ? appUsage
    : Object.values(
        appUsage.reduce<Record<string, AppUsage>>((acc, app) => {
          if (!acc[app.app_name]) {
            acc[app.app_name] = { ...app, minutes: 0 };
          }
          acc[app.app_name].minutes += app.minutes;
          if (app.display_name) acc[app.app_name].display_name = app.display_name;
          return acc;
        }, {})
      ).sort((a, b) => b.minutes - a.minutes);

  const aggregatedSites = days === 1
    ? siteVisits
    : Object.values(
        siteVisits.reduce<Record<string, SiteVisit>>((acc, site) => {
          if (!acc[site.domain]) {
            acc[site.domain] = { ...site, visit_count: 0, total_seconds: 0 };
          }
          acc[site.domain].visit_count += site.visit_count;
          acc[site.domain].total_seconds += site.total_seconds;
          if (site.title) acc[site.domain].title = site.title;
          return acc;
        }, {})
      ).sort((a, b) => b.total_seconds - a.total_seconds);

  const totalAppMinutes = aggregatedApps.reduce((s, a) => s + a.minutes, 0);
  const maxAppMinutes = aggregatedApps.length > 0 ? aggregatedApps[0].minutes : 1;

  if (loading) {
    return <p className="text-center text-sm text-gray-400 py-6">Carregando atividade...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-1.5">
        {[
          { value: 1, label: "Hoje" },
          { value: 7, label: "7 dias" },
          { value: 30, label: "30 dias" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setDays(opt.value); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              days === opt.value
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* App Usage */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Aplicativos Usados</h3>
          {totalAppMinutes > 0 && (
            <span className="text-xs text-gray-400">
              Total: {formatMinutes(totalAppMinutes)}
            </span>
          )}
        </div>

        {aggregatedApps.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum dado de aplicativo registrado ainda.
          </p>
        ) : (
          <div className="space-y-1.5">
            {aggregatedApps.slice(0, 15).map((app) => {
              const pct = maxAppMinutes > 0 ? (app.minutes / maxAppMinutes) * 100 : 0;
              return (
                <div key={app.app_name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-700 font-medium w-32 truncate shrink-0">
                    {app.display_name || app.app_name}
                  </span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-md transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-16 text-right shrink-0">
                    {formatMinutes(app.minutes)}
                  </span>
                </div>
              );
            })}
            {aggregatedApps.length > 15 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                +{aggregatedApps.length - 15} outros aplicativos
              </p>
            )}
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Site Visits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Sites Visitados</h3>
          {aggregatedSites.length > 0 && (
            <span className="text-xs text-gray-400">
              {aggregatedSites.length} sites
            </span>
          )}
        </div>

        {aggregatedSites.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Nenhum site visitado registrado ainda.
          </p>
        ) : (
          <div className="space-y-1">
            {aggregatedSites.slice(0, 20).map((site) => (
              <div
                key={site.domain}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=16`}
                    alt=""
                    width={16}
                    height={16}
                    className="shrink-0 rounded-sm"
                  />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-700 truncate block">
                      {site.domain}
                    </span>
                    {site.title && (
                      <span className="text-xs text-gray-400 truncate block">
                        {site.title}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {site.total_seconds > 0 && (
                    <span className="text-xs text-indigo-600 font-medium">
                      {formatSeconds(site.total_seconds)}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {site.visit_count} visita{site.visit_count !== 1 ? "s" : ""}
                  </span>
                  {site.source === "both" && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-500">
                      verificado
                    </span>
                  )}
                </div>
              </div>
            ))}
            {aggregatedSites.length > 20 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                +{aggregatedSites.length - 20} outros sites
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
