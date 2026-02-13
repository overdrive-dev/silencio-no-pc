"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { PC, PCSettings, AppEvent, DailyUsage } from "@/lib/types";
import { useSubscription } from "@/hooks/use-subscription";
import PaymentBanner from "@/components/payment-banner";

function formatTime(minutes: number): string {
  if (minutes <= 0) return "0min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

function isOnline(pc: PC): boolean {
  if (!pc.app_running || pc.is_online === false) return false;
  if (!pc.last_heartbeat) return false;
  return Date.now() - new Date(pc.last_heartbeat).getTime() < 90_000;
}

function UsageGauge({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 100;
  const color = pct >= 100 ? "#ef4444" : pct >= 75 ? "#f59e0b" : "#22c55e";
  const trackColor = "rgba(0,0,0,0.1)";
  const darkTrackColor = "rgba(255,255,255,0.1)";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" className="stroke-gray-200" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{formatTime(used)}</span>
        <span className="text-xs text-gray-500">de {formatTime(limit)}</span>
      </div>
    </div>
  );
}

interface BlockedApp { id: string; name: string; display_name: string | null; }
interface BlockedSite { id: string; domain: string; display_name: string | null; }

const POPULAR_APPS = [
  { name: "chrome.exe", display_name: "Google Chrome" },
  { name: "msedge.exe", display_name: "Microsoft Edge" },
  { name: "firefox.exe", display_name: "Firefox" },
  { name: "robloxplayerbeta.exe", display_name: "Roblox" },
  { name: "minecraft.exe", display_name: "Minecraft" },
  { name: "fortnite.exe", display_name: "Fortnite" },
  { name: "discord.exe", display_name: "Discord" },
  { name: "steam.exe", display_name: "Steam" },
];

const POPULAR_SITES = [
  { domain: "youtube.com", display_name: "YouTube" },
  { domain: "tiktok.com", display_name: "TikTok" },
  { domain: "instagram.com", display_name: "Instagram" },
  { domain: "twitter.com", display_name: "Twitter/X" },
  { domain: "roblox.com", display_name: "Roblox" },
  { domain: "discord.com", display_name: "Discord" },
  { domain: "twitch.tv", display_name: "Twitch" },
  { domain: "reddit.com", display_name: "Reddit" },
];

const EVENT_BADGES: Record<string, { label: string; color: string }> = {
  strike: { label: "Strike", color: "bg-amber-100 text-amber-700" },
  penalidade_tempo: { label: "Penalidade", color: "bg-red-100 text-red-700" },
  bloqueio: { label: "Bloqueio", color: "bg-red-100 text-red-700" },
  desbloqueio: { label: "Desbloqueio", color: "bg-green-100 text-green-700" },
  command: { label: "Comando", color: "bg-blue-100 text-blue-700" },
  app_started: { label: "Iniciado", color: "bg-green-100 text-green-700" },
  app_closed: { label: "Encerrado", color: "bg-amber-100 text-amber-700" },
  app_killed: { label: "Forçado", color: "bg-red-100 text-red-700" },
  sessao_inicio: { label: "Sessão", color: "bg-indigo-100 text-indigo-700" },
  sessao_fim: { label: "Sessão Fim", color: "bg-gray-100 text-gray-600" },
  calibracao: { label: "Calibração", color: "bg-gray-100 text-gray-600" },
};

const EVENT_TYPES = [
  "strike", "penalidade_tempo", "bloqueio", "desbloqueio", "command",
  "app_started", "app_closed", "app_killed", "sessao_inicio", "sessao_fim",
];

export default function PcDashboard() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hasAccess } = useSubscription();
  const [pc, setPc] = useState<PC | null>(null);
  const [settings, setSettings] = useState<PCSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [cmdLoading, setCmdLoading] = useState<string | null>(null);
  const [tokenModal, setTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [tokenClaimed, setTokenClaimed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "events" | "controls">("history");
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
  const [newAppName, setNewAppName] = useState("");
  const [newAppDisplay, setNewAppDisplay] = useState("");
  const [newSiteDomain, setNewSiteDomain] = useState("");
  const [newSiteDisplay, setNewSiteDisplay] = useState("");

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

  const generateToken = async () => {
    setTokenLoading(true);
    try {
      const res = await fetch(`/api/dispositivo/${id}/token`, { method: "POST" });
      const data = await res.json();
      if (data.sync_token) {
        setGeneratedToken(data.sync_token);
        setTokenModal(true);
      }
    } catch (err) {
      console.error("Erro ao gerar token:", err);
    } finally {
      setTokenLoading(false);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setTokenCopied(true);
    setTimeout(() => setTokenCopied(false), 2000);
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
      setNewAppName("");
      setNewAppDisplay("");
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
      setNewSiteDomain("");
      setNewSiteDisplay("");
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

  // Fast polling when token modal is open — detect claim
  useEffect(() => {
    if (!tokenModal || tokenClaimed) return;
    const fast = setInterval(async () => {
      try {
        const res = await fetch(`/api/dispositivo/${id}`);
        const data = await res.json();
        if (data.pc) {
          setPc(data.pc);
          if (data.pc.paired_at && data.pc.is_online) {
            setTokenClaimed(true);
          }
        }
      } catch {}
    }, 3000);
    return () => clearInterval(fast);
  }, [tokenModal, tokenClaimed, id]);

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
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  const online = isOnline(pc);
  const limit = settings?.daily_limit_minutes || 120;
  const remaining = Math.max(0, limit - pc.usage_today_minutes);
  const actionsDisabled = cmdLoading !== null || !hasAccess;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <Link href="/dispositivos" className="hover:text-gray-700 transition">Dispositivos</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{pc.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{pc.name}</h1>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
              online
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${online ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            {online ? "Online" : "Offline"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateToken}
            disabled={tokenLoading}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {tokenLoading ? "Gerando..." : "🔗 Vincular"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 ring-1 ring-inset ring-red-200 transition"
          >
            Remover
          </button>
          <Link
            href={`/dispositivo/${id}/settings`}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
          >
            Configurações
          </Link>
        </div>
      </div>

      {/* Payment banner */}
      <PaymentBanner />

      {/* Alerts */}
      {!pc.app_running && pc.shutdown_type === "graceful" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠ Programa foi encerrado normalmente às {pc.last_heartbeat ? new Date(pc.last_heartbeat).toLocaleTimeString("pt-BR") : "--"}
        </div>
      )}
      {!pc.app_running && pc.shutdown_type === "unexpected" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          🚨 Programa foi encerrado inesperadamente! Último sinal às {pc.last_heartbeat ? new Date(pc.last_heartbeat).toLocaleTimeString("pt-BR") : "--"}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Usage gauge */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Uso Hoje</h3>
          <UsageGauge used={pc.usage_today_minutes} limit={limit} />
          <p className="text-sm text-gray-500 mt-3">
            Restam <span className={`font-bold ${remaining <= 5 ? "text-red-500" : remaining <= 15 ? "text-amber-500" : "text-green-500"}`}>
              {formatTime(remaining)}
            </span>
          </p>
        </div>

        {/* Strikes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center space-y-3">
          <h3 className="text-sm font-medium text-gray-500">Strikes</h3>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => {
              const cyclePos = pc.strikes % 3;
              const filled = cyclePos === 0 && pc.strikes > 0 ? 3 : cyclePos;
              return (
                <span key={i} className={`text-3xl ${i < filled ? "opacity-100" : "opacity-20"}`}>⚠️</span>
              );
            })}
          </div>
          <span className={`text-2xl font-bold ${pc.strikes > 0 ? "text-amber-500" : "text-gray-900"}`}>
            {pc.strikes}
          </span>
          <p className="text-xs text-gray-400">
            {pc.strikes > 0
              ? `${(pc.strikes % 3) || 3}/3 para penalidade • ${Math.floor(pc.strikes / 3)} penalidade${Math.floor(pc.strikes / 3) !== 1 ? "s" : ""}`
              : "Nenhum strike ainda"}
          </p>
          {pc.is_locked && (
            <div className="text-red-500 font-medium text-sm">🔒 Tela Bloqueada</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Ações Rápidas</h3>
          {!hasAccess && (
            <p className="text-xs text-red-500 mb-2">🔒 Assinatura necessária para usar ações</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "+15min", cmd: "add_time", payload: { minutes: 15 }, cls: "bg-green-600 hover:bg-green-500 text-white" },
              { label: "+30min", cmd: "add_time", payload: { minutes: 30 }, cls: "bg-green-600 hover:bg-green-500 text-white" },
              { label: "+1hora", cmd: "add_time", payload: { minutes: 60 }, cls: "bg-green-600 hover:bg-green-500 text-white" },
              { label: "-15min", cmd: "remove_time", payload: { minutes: 15 }, cls: "bg-amber-600 hover:bg-amber-500 text-white" },
            ].map(({ label, cmd, payload, cls }) => (
              <button
                key={label}
                onClick={() => sendCommand(cmd, payload)}
                disabled={actionsDisabled}
                className={`${cls} rounded-lg py-2 text-sm font-medium transition disabled:opacity-40`}
              >
                {cmdLoading === cmd ? "..." : label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={() => sendCommand("lock")}
              disabled={actionsDisabled}
              className="bg-red-600 hover:bg-red-500 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-40"
            >
              🔒 Bloquear
            </button>
            <button
              onClick={() => sendCommand("unlock")}
              disabled={actionsDisabled}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition disabled:opacity-40"
            >
              🔓 Desbloquear
            </button>
            <button
              onClick={() => sendCommand("reset_strikes")}
              disabled={actionsDisabled}
              className="rounded-lg py-2 text-sm font-medium transition disabled:opacity-40 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Resetar Strikes
            </button>
            <button
              onClick={() => { if (confirm("Desligar o PC?")) sendCommand("shutdown"); }}
              disabled={actionsDisabled}
              className="rounded-lg py-2 text-sm font-medium transition disabled:opacity-40 bg-gray-100 text-red-600 hover:bg-gray-200"
            >
              ⏻ Desligar
            </button>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="text-xs text-gray-400 flex gap-4">
        <span>Versão: {pc.app_version}</span>
        {pc.last_heartbeat && (
          <span>Último ping: {new Date(pc.last_heartbeat).toLocaleString("pt-BR")}</span>
        )}
      </div>

      {/* ── History & Events tabs ── */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === "history"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Histórico (14 dias)
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === "events"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Eventos {eventsTotal > 0 && `(${eventsTotal})`}
          </button>
          <button
            onClick={() => setActiveTab("controls")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === "controls"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Controles
          </button>
        </div>

        <div className="p-5">
          {activeTab === "history" && (
            <>
              {history.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Nenhum dado de uso registrado ainda.</p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    {history.map((day) => {
                      const maxMin = Math.max(...history.map((d) => d.total_minutes), 1);
                      const pct = (day.total_minutes / maxMin) * 100;
                      const dateStr = new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      });
                      return (
                        <div key={day.date} className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 w-24 text-right shrink-0">{dateStr}</span>
                          <div className="flex-1 h-5 bg-gray-100 rounded-md overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-md transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-14 shrink-0">{formatTime(day.total_minutes)}</span>
                          <span className="text-xs text-gray-400 w-8 shrink-0">{day.sessions_count}x</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex gap-6 text-sm text-gray-500">
                    <div>
                      <span className="text-gray-400">Média:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {formatTime(Math.round(history.reduce((s, d) => s + d.total_minutes, 0) / history.length))}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Total ({history.length}d):</span>{" "}
                      <span className="font-medium text-gray-900">
                        {formatTime(history.reduce((s, d) => s + d.total_minutes, 0))}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === "events" && (
            <>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button
                  onClick={() => setEventFilter("")}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    !eventFilter ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                {EVENT_TYPES.map((type) => {
                  const badge = EVENT_BADGES[type] || { label: type, color: "" };
                  return (
                    <button
                      key={type}
                      onClick={() => setEventFilter(type)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        eventFilter === type ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {badge.label}
                    </button>
                  );
                })}
              </div>

              {events.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-6">Nenhum evento encontrado.</p>
              ) : (
                <div className="space-y-1.5">
                  {events.map((evt) => {
                    const badge = EVENT_BADGES[evt.type] || { label: evt.type, color: "bg-gray-100 text-gray-600" };
                    return (
                      <div
                        key={evt.id}
                        className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 flex items-center gap-3"
                      >
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-sm text-gray-700 flex-1 truncate">{evt.description}</span>
                        {evt.noise_db > 0 && (
                          <span className="text-xs text-gray-400 shrink-0">{evt.noise_db.toFixed(0)} dB</span>
                        )}
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(evt.timestamp).toLocaleString("pt-BR", {
                            day: "2-digit", month: "2-digit",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {eventsTotal > eventsLimit && (
                <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setEventsOffset(Math.max(0, eventsOffset - eventsLimit))}
                    disabled={eventsOffset === 0}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded-lg text-xs font-medium transition"
                  >
                    ← Anterior
                  </button>
                  <span className="text-xs text-gray-400">
                    {eventsOffset + 1}–{Math.min(eventsOffset + eventsLimit, eventsTotal)} de {eventsTotal}
                  </span>
                  <button
                    onClick={() => setEventsOffset(eventsOffset + eventsLimit)}
                    disabled={eventsOffset + eventsLimit >= eventsTotal}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded-lg text-xs font-medium transition"
                  >
                    Próximo →
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === "controls" && (
            <div className="space-y-8">
              {/* ── Blocked Apps ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Aplicativos</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Modo:</span>
                    <button
                      onClick={() => {
                        const next = appBlockMode === "blacklist" ? "whitelist" : "blacklist";
                        setAppBlockMode(next);
                        saveBlockMode("app_block_mode", next);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        appBlockMode === "blacklist"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {appBlockMode === "blacklist" ? "Bloquear listados" : "Permitir apenas listados"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  {appBlockMode === "blacklist"
                    ? "Apps na lista serão fechados automaticamente. Todos os outros são permitidos."
                    : "Apenas apps na lista poderão rodar. Todos os outros serão fechados."}
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Processo (ex: chrome.exe)"
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Nome (ex: Chrome)"
                    value={newAppDisplay}
                    onChange={(e) => setNewAppDisplay(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => newAppName && addBlockedApp(newAppName, newAppDisplay || newAppName)}
                    disabled={!newAppName}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition shrink-0"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_APPS.filter(
                    (p) => !blockedApps.some((a) => a.name === p.name)
                  ).map((app) => (
                    <button
                      key={app.name}
                      onClick={() => addBlockedApp(app.name, app.display_name)}
                      className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      + {app.display_name}
                    </button>
                  ))}
                </div>

                {blockedApps.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-3">Nenhum aplicativo na lista.</p>
                ) : (
                  <div className="space-y-1">
                    {blockedApps.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{app.display_name || app.name}</span>
                          <span className="text-xs text-gray-400">{app.name}</span>
                        </div>
                        <button
                          onClick={() => removeBlockedApp(app.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-gray-100" />

              {/* ── Blocked Sites ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Sites</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Bloquear listados
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Sites na lista serão bloqueados no navegador via hosts file. Funciona em todos os navegadores.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Domínio (ex: youtube.com)"
                    value={newSiteDomain}
                    onChange={(e) => setNewSiteDomain(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Nome (ex: YouTube)"
                    value={newSiteDisplay}
                    onChange={(e) => setNewSiteDisplay(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => newSiteDomain && addBlockedSite(newSiteDomain, newSiteDisplay || newSiteDomain)}
                    disabled={!newSiteDomain}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition shrink-0"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SITES.filter(
                    (p) => !blockedSites.some((s) => s.domain === p.domain)
                  ).map((site) => (
                    <button
                      key={site.domain}
                      onClick={() => addBlockedSite(site.domain, site.display_name)}
                      className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      + {site.display_name}
                    </button>
                  ))}
                </div>

                {blockedSites.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-3">Nenhum site na lista.</p>
                ) : (
                  <div className="space-y-1">
                    {blockedSites.map((site) => (
                      <div
                        key={site.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{site.display_name || site.domain}</span>
                          <span className="text-xs text-gray-400">{site.domain}</span>
                        </div>
                        <button
                          onClick={() => removeBlockedSite(site.id)}
                          className="text-xs text-red-500 hover:text-red-700 transition"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-700">
                As regras são sincronizadas automaticamente com o dispositivo a cada 30 segundos.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete PC modal */}
      {showDeleteModal && pc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="text-center">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 text-3xl">🗑️</span>
              <h2 className="mt-3 text-lg font-semibold text-gray-900">
                Remover dispositivo &ldquo;{pc.name}&rdquo;?
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Isso vai apagar todas as configurações, histórico e eventos deste dispositivo.
              </p>
            </div>

            {pc.paired_at && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Este dispositivo está vinculado ao app
                </p>
                <p className="text-xs text-red-600/80 mt-1">
                  O app no dispositivo será desvinculado e deixará de funcionar até ser pareado novamente com um novo token.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => deletePc()}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition"
              >
                {deleting ? "Removendo..." : "Remover Dispositivo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token modal */}
      {tokenModal && generatedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-5">
            {tokenClaimed ? (
              <>
                <div className="text-center space-y-3">
                  <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-4xl">✅</span>
                  <h2 className="text-xl font-bold text-gray-900">Dispositivo Vinculado!</h2>
                  <p className="text-sm text-gray-500">
                    O app KidsPC se conectou com sucesso.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Online agora
                </div>
                <button
                  onClick={() => { setTokenModal(false); setGeneratedToken(null); setTokenCopied(false); setTokenClaimed(false); fetchData(); }}
                  className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition"
                >
                  Fechar
                </button>
              </>
            ) : (
              <>
                <div className="text-center">
                  <span className="text-4xl">🔗</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-2">Token de Vinculação</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Cole este token no app KidsPC para vincular.
                  </p>
                </div>
                <div
                  onClick={() => copyToken(generatedToken)}
                  className="bg-gray-100 rounded-xl p-4 text-center font-mono text-sm tracking-wide text-gray-900 cursor-pointer hover:bg-gray-200 transition select-all break-all"
                >
                  {generatedToken}
                </div>
                <p className="text-center text-xs text-amber-600 font-medium">
                  {tokenCopied ? "✓ Copiado!" : "Clique no token para copiar. Válido por 30 minutos. Uso único."}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                  Aguardando vinculação...
                </div>
                <button
                  onClick={() => { setTokenModal(false); setGeneratedToken(null); setTokenCopied(false); setTokenClaimed(false); }}
                  className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
