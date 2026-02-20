"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { PC, PCSettings, AppEvent, DailyUsage } from "@/lib/types";
import { useSubscription } from "@/hooks/use-subscription";
import PaymentBanner from "@/components/payment-banner";
import UsageGauge, { formatTime } from "@/components/device/usage-gauge";
import HistoryTab from "@/components/device/history-tab";
import EventsTab from "@/components/device/events-tab";
import ControlsTab from "@/components/device/controls-tab";
import ActivityTab from "@/components/device/activity-tab";

interface BlockedApp { id: string; name: string; display_name: string | null; }
interface BlockedSite { id: string; domain: string; display_name: string | null; }

function isOnline(pc: PC): boolean {
  if (!pc.app_running || pc.is_online === false) return false;
  if (!pc.last_heartbeat) return false;
  return Date.now() - new Date(pc.last_heartbeat).getTime() < 90_000;
}

export default function PcDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasAccess } = useSubscription();
  const [pc, setPc] = useState<PC | null>(null);
  const [settings, setSettings] = useState<PCSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [cmdLoading, setCmdLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "events" | "activity" | "controls">("history");
  const [history, setHistory] = useState<DailyUsage[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [eventsOffset, setEventsOffset] = useState(0);
  const [eventFilter, setEventFilter] = useState<string>("");
  const eventsLimit = 20;
  const [blockedApps, setBlockedApps] = useState<BlockedApp[]>([]);
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [appBlockMode, setAppBlockMode] = useState<string>("blacklist");
  const [siteBlockMode, setSiteBlockMode] = useState<string>("blacklist");
  const deletePc = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/dispositivo/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        router.push("/dispositivos");
      } else {
        alert(`Erro ao remover: ${data.error || "Erro desconhecido"}`);
      }
    } catch (err) {
      console.error("Erro ao remover PC:", err);
      alert("Erro de conexão ao remover PC.");
    } finally {
      setDeleting(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [pcRes, settingsRes, histRes] = await Promise.all([
        fetch(`/api/dispositivo/${id}`),
        fetch(`/api/dispositivo/${id}/settings`),
        fetch(`/api/dispositivo/${id}/history?days=14`),
      ]);
      const pcData = await pcRes.json();
      const settingsData = await settingsRes.json();
      const histData = await histRes.json();
      setPc(pcData.pc);
      setSettings(settingsData.settings);
      setHistory(histData.history || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchControls = useCallback(async () => {
    try {
      const [appsRes, sitesRes, settingsRes] = await Promise.all([
        fetch(`/api/dispositivo/${id}/blocked-apps`),
        fetch(`/api/dispositivo/${id}/blocked-sites`),
        fetch(`/api/dispositivo/${id}/settings`),
      ]);
      const appsData = await appsRes.json();
      const sitesData = await sitesRes.json();
      const settData = await settingsRes.json();
      setBlockedApps(appsData.apps || []);
      setBlockedSites(sitesData.sites || []);
      if (settData.settings) {
        setAppBlockMode(settData.settings.app_block_mode || "blacklist");
        setSiteBlockMode(settData.settings.site_block_mode || "blacklist");
      }
    } catch (err) {
      console.error("Erro ao buscar controles:", err);
    }
  }, [id]);

  const addBlockedApp = async (name: string, display_name: string) => {
    try {
      await fetch(`/api/dispositivo/${id}/blocked-apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, display_name }),
      });
      fetchControls();
    } catch (err) {
      console.error("Erro ao adicionar app:", err);
    }
  };

  const removeBlockedApp = async (appId: string) => {
    try {
      await fetch(`/api/dispositivo/${id}/blocked-apps?appId=${appId}`, { method: "DELETE" });
      fetchControls();
    } catch (err) {
      console.error("Erro ao remover app:", err);
    }
  };

  const addBlockedSite = async (domain: string, display_name: string) => {
    try {
      await fetch(`/api/dispositivo/${id}/blocked-sites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, display_name }),
      });
      fetchControls();
    } catch (err) {
      console.error("Erro ao adicionar site:", err);
    }
  };

  const removeBlockedSite = async (siteId: string) => {
    try {
      await fetch(`/api/dispositivo/${id}/blocked-sites?siteId=${siteId}`, { method: "DELETE" });
      fetchControls();
    } catch (err) {
      console.error("Erro ao remover site:", err);
    }
  };

  const saveBlockMode = async (field: string, value: string) => {
    try {
      await fetch(`/api/dispositivo/${id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (err) {
      console.error("Erro ao salvar modo:", err);
    }
  };

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        limit: String(eventsLimit),
        offset: String(eventsOffset),
      });
      if (eventFilter) params.set("type", eventFilter);
      const res = await fetch(`/api/dispositivo/${id}/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
      setEventsTotal(data.total || 0);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
    }
  }, [id, eventFilter, eventsOffset]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === "events") fetchEvents();
    if (activeTab === "controls") fetchControls();
  }, [activeTab, fetchEvents, fetchControls]);

  useEffect(() => {
    setEventsOffset(0);
  }, [eventFilter]);

  const sendCommand = async (command: string, payload: Record<string, unknown> = {}) => {
    if (!hasAccess) return;
    setCmdLoading(command);
    try {
      await fetch(`/api/dispositivo/${id}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, payload }),
      });
      setTimeout(fetchData, 2000);
    } catch (err) {
      console.error("Erro ao enviar comando:", err);
    } finally {
      setCmdLoading(null);
    }
  };

  if (loading || !pc) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="size-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Carregando...
        </div>
      </div>
    );
  }

  const online = isOnline(pc);
  const limit = pc.effective_limit_minutes || settings?.daily_limit_minutes || 120;
  const remaining = Math.max(0, limit - pc.usage_today_minutes);
  const usagePct = Math.min(100, (pc.usage_today_minutes / limit) * 100);
  const actionsDisabled = cmdLoading !== null || !hasAccess;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-500">
        <Link href="/dispositivos" className="hover:text-slate-900 transition">Dispositivos</Link>
        <svg className="size-4 mx-1 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        <span className="text-slate-900 font-medium">{pc.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-violet-50 border border-violet-100">
            <svg className="size-5 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-slate-900">{pc.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${online ? "text-emerald-600" : "text-slate-400"}`}>
                <span className={`size-1.5 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {online ? "Online" : "Offline"}
              </span>
              {pc.app_version && <span className="text-xs text-slate-400">v{pc.app_version}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dispositivo/${id}/settings`}
            className="rounded-lg bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition"
          >
            Configurações
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 ring-1 ring-inset ring-red-200 transition"
          >
            Remover
          </button>
        </div>
      </div>

      <PaymentBanner />

      {/* Alerts */}
      {!pc.app_running && pc.shutdown_type === "graceful" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3 text-sm text-amber-800">
          <svg className="size-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" /></svg>
          Programa encerrado normalmente às {pc.last_heartbeat ? new Date(pc.last_heartbeat).toLocaleTimeString("pt-BR") : "--"}
        </div>
      )}
      {!pc.app_running && pc.shutdown_type === "unexpected" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-sm text-red-800">
          <svg className="size-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" /></svg>
          Programa encerrado inesperadamente! Último sinal às {pc.last_heartbeat ? new Date(pc.last_heartbeat).toLocaleTimeString("pt-BR") : "--"}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Usage */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500">Uso Hoje</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              usagePct >= 90 ? "bg-red-50 text-red-600" : usagePct >= 70 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              {Math.round(usagePct)}%
            </span>
          </div>
          <UsageGauge used={pc.usage_today_minutes} limit={limit} />
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">Restam</span>
            <span className={`font-bold ${remaining <= 5 ? "text-red-500" : remaining <= 15 ? "text-amber-500" : "text-emerald-500"}`}>
              {formatTime(remaining)}
            </span>
          </div>
        </div>

        {/* Strikes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Strikes</h3>
          <div className="flex items-center justify-center gap-3 mb-3">
            {[0, 1, 2].map((i) => {
              const cyclePos = pc.strikes % 3;
              const filled = cyclePos === 0 && pc.strikes > 0 ? 3 : cyclePos;
              return (
                <div key={i} className={`size-10 rounded-xl flex items-center justify-center transition ${i < filled ? "bg-amber-100 border border-amber-200" : "bg-slate-50 border border-slate-200"}`}>
                  <svg className={`size-5 ${i < filled ? "text-amber-500" : "text-slate-300"}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" /></svg>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <span className={`text-2xl font-bold ${pc.strikes > 0 ? "text-amber-500" : "text-slate-900"}`}>
              {pc.strikes}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {pc.strikes > 0
                ? `${(pc.strikes % 3) || 3}/3 para penalidade`
                : "Nenhum strike"}
            </p>
          </div>
          {pc.is_locked && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-red-600 text-sm font-medium">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Tela Bloqueada
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Ações Rápidas</h3>
          {!hasAccess && (
            <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
              Assinatura necessária
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "+15min", cmd: "add_time", payload: { minutes: 15 } },
              { label: "+30min", cmd: "add_time", payload: { minutes: 30 } },
              { label: "+1h", cmd: "add_time", payload: { minutes: 60 } },
            ].map(({ label, cmd, payload }) => (
              <button
                key={label}
                onClick={() => sendCommand(cmd, payload)}
                disabled={actionsDisabled}
                className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl py-2 text-sm font-semibold transition disabled:opacity-40"
              >
                {cmdLoading === cmd ? "..." : label}
              </button>
            ))}
          </div>
          <button
            onClick={() => sendCommand("remove_time", { minutes: 15 })}
            disabled={actionsDisabled}
            className="w-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl py-2 text-sm font-semibold transition disabled:opacity-40 mb-3"
          >
            {cmdLoading === "remove_time" ? "..." : "-15min"}
          </button>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => sendCommand("lock")}
              disabled={actionsDisabled}
              className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-xl py-2 text-sm font-semibold transition disabled:opacity-40"
            >
              Bloquear
            </button>
            <button
              onClick={() => sendCommand("unlock")}
              disabled={actionsDisabled}
              className="bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 rounded-xl py-2 text-sm font-semibold transition disabled:opacity-40"
            >
              Desbloquear
            </button>
            <button
              onClick={() => sendCommand("reset_strikes")}
              disabled={actionsDisabled}
              className="bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl py-2 text-sm font-medium transition disabled:opacity-40"
            >
              Resetar Strikes
            </button>
            <button
              onClick={() => { if (confirm("Desligar o PC?")) sendCommand("shutdown"); }}
              disabled={actionsDisabled}
              className="bg-slate-50 text-red-600 border border-slate-200 hover:bg-slate-100 rounded-xl py-2 text-sm font-medium transition disabled:opacity-40"
            >
              Desligar
            </button>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="text-xs text-slate-400 flex gap-4">
        {pc.last_heartbeat && (
          <span>Último ping: {new Date(pc.last_heartbeat).toLocaleString("pt-BR")}</span>
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          {(["history", "events", "activity", "controls"] as const).map((tab) => {
            const labels = { history: "Histórico", events: "Eventos", activity: "Atividade", controls: "Controles" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-sm font-medium transition-all relative ${
                  activeTab === tab
                    ? "text-violet-600"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {labels[tab]}{tab === "events" && eventsTotal > 0 ? ` (${eventsTotal})` : ""}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-violet-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {activeTab === "history" && <HistoryTab history={history} />}
          {activeTab === "events" && (
            <EventsTab events={events} eventsTotal={eventsTotal} eventsOffset={eventsOffset} eventsLimit={eventsLimit} eventFilter={eventFilter} setEventFilter={setEventFilter} setEventsOffset={setEventsOffset} />
          )}
          {activeTab === "activity" && <ActivityTab deviceId={id} />}
          {activeTab === "controls" && (
            <ControlsTab deviceId={id} blockedApps={blockedApps} blockedSites={blockedSites} appBlockMode={appBlockMode} siteBlockMode={siteBlockMode} setAppBlockMode={setAppBlockMode} setSiteBlockMode={setSiteBlockMode} addBlockedApp={addBlockedApp} removeBlockedApp={removeBlockedApp} addBlockedSite={addBlockedSite} removeBlockedSite={removeBlockedSite} saveBlockMode={saveBlockMode} />
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && pc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-red-50 mb-3">
                <svg className="size-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </div>
              <h2 className="text-lg font-display font-bold text-slate-900">
                Remover &ldquo;{pc.name}&rdquo;?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Todas as configurações, histórico e eventos serão apagados.
              </p>
            </div>
            {pc.paired_at && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700 font-medium">Dispositivo vinculado</p>
                <p className="text-xs text-red-600/80 mt-0.5">O app será desvinculado até um novo pareamento.</p>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowDeleteModal(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition">
                Cancelar
              </button>
              <button onClick={() => deletePc()} disabled={deleting} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition">
                {deleting ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
