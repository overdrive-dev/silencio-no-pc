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
  const [tokenModal, setTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [tokenClaimed, setTokenClaimed] = useState(false);
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
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              activeTab === "activity"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Atividade
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
          {activeTab === "history" && <HistoryTab history={history} />}

          {activeTab === "events" && (
            <EventsTab
              events={events}
              eventsTotal={eventsTotal}
              eventsOffset={eventsOffset}
              eventsLimit={eventsLimit}
              eventFilter={eventFilter}
              setEventFilter={setEventFilter}
              setEventsOffset={setEventsOffset}
            />
          )}

          {activeTab === "activity" && <ActivityTab deviceId={id} />}

          {activeTab === "controls" && (
            <ControlsTab
              deviceId={id}
              blockedApps={blockedApps}
              blockedSites={blockedSites}
              appBlockMode={appBlockMode}
              siteBlockMode={siteBlockMode}
              setAppBlockMode={setAppBlockMode}
              setSiteBlockMode={setSiteBlockMode}
              addBlockedApp={addBlockedApp}
              removeBlockedApp={removeBlockedApp}
              addBlockedSite={addBlockedSite}
              removeBlockedSite={removeBlockedSite}
              saveBlockMode={saveBlockMode}
            />
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
