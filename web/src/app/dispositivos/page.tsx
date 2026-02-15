"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { PC } from "@/lib/types";
import { useSubscription } from "@/hooks/use-subscription";
import PaymentBanner from "@/components/payment-banner";
import { PlusIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

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

function PlatformIcon({ platform }: { platform?: string }) {
  if (platform === "android") {
    return <DevicePhoneMobileIcon className="size-5 text-emerald-500" />;
  }
  return <ComputerDesktopIcon className="size-5 text-violet-500" />;
}

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, (used / limit) * 100);
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-violet-500";
  return (
    <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PcsPage() {
  const { user } = useUser();
  const { hasAccess, loading: subLoading } = useSubscription();
  const [pcs, setPcs] = useState<PC[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPcName, setNewPcName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [regenPcId, setRegenPcId] = useState<string | null>(null);
  const [regenToken, setRegenToken] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchPcs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/dispositivos");
      const data = await res.json();
      setPcs(data.pcs || []);
    } catch (err) {
      console.error("Erro ao buscar dispositivos:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPcs();
    const interval = setInterval(fetchPcs, 30_000);
    return () => clearInterval(interval);
  }, [fetchPcs]);

  const createPc = async () => {
    if (!newPcName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/dispositivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPcName.trim() }),
      });
      const data = await res.json();
      if (data.sync_token) {
        setNewToken(data.sync_token);
        fetchPcs();
      }
    } catch (err) {
      console.error("Erro ao criar dispositivo:", err);
    } finally {
      setCreating(false);
    }
  };

  const regenerateToken = async (pcId: string) => {
    setRegenerating(true);
    setRegenPcId(pcId);
    try {
      const res = await fetch(`/api/dispositivo/${pcId}/token`, { method: "POST" });
      const data = await res.json();
      if (data.sync_token) setRegenToken(data.sync_token);
    } catch (err) {
      console.error("Erro ao regenerar token:", err);
    } finally {
      setRegenerating(false);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewPcName("");
    setNewToken(null);
  };

  if (loading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-2 text-slate-400">
          <ArrowPathIcon className="size-5 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-slate-900">
            Dispositivos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {pcs.length === 0
              ? "Nenhum dispositivo vinculado ainda."
              : `${pcs.length} dispositivo${pcs.length > 1 ? "s" : ""} vinculado${pcs.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {hasAccess ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5"
          >
            <PlusIcon className="size-4" />
            Adicionar
          </button>
        ) : (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-lg transition"
          >
            Assinar
          </Link>
        )}
      </div>

      <PaymentBanner />

      {/* Add PC Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            {!newToken ? (
              <>
                <h2 className="text-lg font-display font-bold text-slate-900">Adicionar Dispositivo</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Dê um nome para identificar o dispositivo.
                </p>
                <input
                  type="text"
                  value={newPcName}
                  onChange={(e) => setNewPcName(e.target.value)}
                  placeholder="Ex: PC do Quarto, Notebook da Sala..."
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && createPc()}
                />
                <div className="mt-5 flex gap-3 justify-end">
                  <button
                    onClick={closeAddModal}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createPc}
                    disabled={creating || !newPcName.trim()}
                    className="rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {creating ? "Criando..." : "Criar"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-emerald-50">
                  <svg className="size-7 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <h2 className="text-lg font-display font-bold text-slate-900">
                  Dispositivo criado!
                </h2>
                <p className="text-sm text-slate-500">
                  Cole este token no app KidsPC para vincular:
                </p>
                <div
                  onClick={() => copyToken(newToken)}
                  className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 cursor-pointer hover:bg-zinc-100 transition group"
                  title="Clique para copiar"
                >
                  <code className="text-lg font-mono font-bold text-violet-600 break-all group-hover:text-violet-500 transition">
                    {newToken}
                  </code>
                </div>
                <p className="text-xs text-amber-600 font-medium">
                  Válido por 30 minutos. Uso único.
                </p>
                <button
                  onClick={closeAddModal}
                  className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 py-2.5 text-sm font-semibold text-white hover:shadow-lg transition"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regenerate token modal */}
      {regenToken && regenPcId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-display font-bold text-slate-900">Novo Token</h2>
              <p className="text-sm text-slate-500">Cole no programa KidsPC:</p>
              <div
                onClick={() => copyToken(regenToken)}
                className="rounded-xl bg-slate-50 border border-slate-200 p-4 cursor-pointer hover:bg-slate-100 transition"
                title="Clique para copiar"
              >
                <code className="text-lg font-mono font-bold text-violet-600 break-all">
                  {regenToken}
                </code>
              </div>
              <p className="text-xs text-amber-600 font-medium">Válido por 30 minutos. Uso único.</p>
              <button
                onClick={() => { setRegenToken(null); setRegenPcId(null); }}
                className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {pcs.length === 0 && !showAddModal && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-violet-50 mb-4">
            <ComputerDesktopIcon className="size-7 text-violet-500" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Nenhum dispositivo vinculado</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Adicione um dispositivo, instale o app e vincule com o token de pareamento.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {hasAccess && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-lg transition"
              >
                <PlusIcon className="size-4" />
                Adicionar Dispositivo
              </button>
            )}
            <Link
              href="/download"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition"
            >
              Baixar app
            </Link>
          </div>
        </div>
      )}

      {/* Device grid */}
      {pcs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pcs.map((pc) => {
            const online = isOnline(pc);
            const blocked = !hasAccess;
            const pendingSetup = !pc.paired_at && !online;
            return (
              <div key={pc.id} className="relative group">
                {blocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-zinc-900/60 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center size-10 rounded-xl bg-white/10 mb-2">
                        <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                      </div>
                      <p className="text-sm text-white font-medium">Assine para controlar</p>
                    </div>
                  </div>
                )}
                {pendingSetup ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={pc.platform} />
                        <h3 className="font-semibold text-zinc-900">{pc.name}</h3>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        Aguardando
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-3">
                      Instale o app e cole o token para vincular.
                    </p>
                    <button
                      onClick={() => regenerateToken(pc.id)}
                      disabled={regenerating && regenPcId === pc.id}
                      className="text-sm font-medium text-violet-600 hover:text-violet-500 transition disabled:opacity-50"
                    >
                      {regenerating && regenPcId === pc.id ? "Gerando..." : "Gerar novo token"}
                    </button>
                  </div>
                ) : (
                  <Link
                    href={blocked ? "/pricing" : `/dispositivo/${pc.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5 group-hover:border-violet-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center size-9 rounded-xl bg-zinc-50 border border-zinc-100">
                          <PlatformIcon platform={pc.platform} />
                        </div>
                        <h3 className="font-semibold text-zinc-900">{pc.name}</h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                          online
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-zinc-50 text-zinc-500 border border-zinc-200"
                        }`}
                      >
                        <span className={`size-1.5 rounded-full ${online ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                        {online ? "Online" : "Offline"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-zinc-500">Uso hoje</span>
                          <span className="text-zinc-900 font-semibold">{formatTime(pc.usage_today_minutes)}</span>
                        </div>
                        <UsageBar used={pc.usage_today_minutes} limit={pc.effective_limit_minutes || 120} />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Strikes</span>
                        <span className={`font-semibold ${pc.strikes > 0 ? "text-amber-500" : "text-zinc-900"}`}>
                          {pc.strikes}{pc.strikes > 0 ? ` (${(pc.strikes % 3) || 3}/3)` : ""}
                        </span>
                      </div>

                      {pc.is_locked && (
                        <div className="flex items-center gap-1.5 text-red-600 font-medium text-sm pt-2 border-t border-zinc-100">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                          Tela bloqueada
                        </div>
                      )}
                      {!pc.app_running && online && (
                        <div className="flex items-center gap-1.5 text-amber-600 font-medium text-sm pt-2 border-t border-zinc-100">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" /></svg>
                          Programa encerrado
                        </div>
                      )}
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
