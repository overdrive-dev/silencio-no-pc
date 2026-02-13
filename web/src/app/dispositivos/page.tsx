"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { PC } from "@/lib/types";
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
  const diff = Date.now() - new Date(pc.last_heartbeat).getTime();
  return diff < 90_000;
}

export default function PcsPage() {
  const { user } = useUser();
  const { hasAccess, loading: subLoading } = useSubscription();
  const [pcs, setPcs] = useState<PC[]>([]);
  const [loading, setLoading] = useState(true);

  // Add PC modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPcName, setNewPcName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);

  // Regenerate token state
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
      if (data.sync_token) {
        setRegenToken(data.sync_token);
      }
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
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Meus Dispositivos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {pcs.length === 0
              ? "Nenhum dispositivo vinculado. Adicione um para começar."
              : `${pcs.length} dispositivo${pcs.length > 1 ? "s" : ""} vinculado${pcs.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          {hasAccess ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              <svg className="mr-1.5 -ml-0.5 size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Adicionar Dispositivo
            </button>
          ) : (
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
            >
              Assinar para adicionar
            </Link>
          )}
        </div>
      </div>

      <PaymentBanner />

      {/* Add PC Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            {!newToken ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900">Adicionar Dispositivo</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Dê um nome para identificar o dispositivo do seu filho.
                </p>
                <input
                  type="text"
                  value={newPcName}
                  onChange={(e) => setNewPcName(e.target.value)}
                  placeholder="Ex: PC do Quarto, Notebook da Sala..."
                  className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && createPc()}
                />
                <div className="mt-4 flex gap-3 justify-end">
                  <button
                    onClick={closeAddModal}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createPc}
                    disabled={creating || !newPcName.trim()}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
                  >
                    {creating ? "Criando..." : "Criar"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <div className="text-3xl">✅</div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Dispositivo &ldquo;{newPcName}&rdquo; criado!
                  </h2>
                  <p className="text-sm text-gray-500">
                    Cole este token no app KidsPC para vincular:
                  </p>
                  <div
                    onClick={() => copyToken(newToken)}
                    className="rounded-lg bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition"
                    title="Clique para copiar"
                  >
                    <code className="text-lg font-mono font-bold text-indigo-600 break-all">
                      {newToken}
                    </code>
                  </div>
                  <p className="text-xs text-amber-600 font-medium">
                    Válido por 30 minutos. Uso único.
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={closeAddModal}
                    className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Regenerate token modal */}
      {regenToken && regenPcId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Novo Token</h2>
              <p className="text-sm text-gray-500">
                Cole este token no programa KidsPC:
              </p>
              <div
                onClick={() => copyToken(regenToken)}
                className="rounded-lg bg-gray-100 p-4 cursor-pointer hover:bg-gray-200 transition"
                title="Clique para copiar"
              >
                <code className="text-lg font-mono font-bold text-indigo-600 break-all">
                  {regenToken}
                </code>
              </div>
              <p className="text-xs text-amber-600 font-medium">
                Válido por 30 minutos. Uso único.
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => { setRegenToken(null); setRegenPcId(null); }}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blank state */}
      {pcs.length === 0 && !showAddModal && (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <svg className="mx-auto size-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">Nenhum dispositivo vinculado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Adicione um dispositivo, instale o app e vincule com o token.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {hasAccess && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                <svg className="mr-1.5 -ml-0.5 size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Adicionar Dispositivo
              </button>
            )}
            <Link
              href="/download"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition"
            >
              Baixar app
            </Link>
          </div>
        </div>
      )}

      {/* PC grid */}
      {pcs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pcs.map((pc) => {
            const online = isOnline(pc);
            const blocked = !hasAccess;
            const pendingSetup = !pc.paired_at && !online;
            return (
              <div key={pc.id} className="relative">
                {blocked && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-gray-900/60 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔒</div>
                      <p className="text-sm text-white font-medium">Assine para controlar</p>
                    </div>
                  </div>
                )}
                {pendingSetup ? (
                  <div className="block rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{pc.name}</h3>
                      <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                        Aguardando conexão
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Instale o app KidsPC e cole o token para vincular.
                    </p>
                    <button
                      onClick={() => regenerateToken(pc.id)}
                      disabled={regenerating && regenPcId === pc.id}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition disabled:opacity-50"
                    >
                      {regenerating && regenPcId === pc.id ? "Gerando..." : "Gerar novo token"}
                    </button>
                  </div>
                ) : (
                  <Link
                    href={blocked ? "/pricing" : `/dispositivo/${pc.id}`}
                    className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{pc.name}</h3>
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
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex justify-between">
                        <span>Uso hoje</span>
                        <span className="text-gray-900 font-medium">{formatTime(pc.usage_today_minutes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Strikes</span>
                        <span className={pc.strikes > 0 ? "text-amber-500" : "text-gray-900"}>
                          {pc.strikes}{pc.strikes > 0 ? ` (${(pc.strikes % 3) || 3}/3)` : ""}
                        </span>
                      </div>
                      {pc.is_locked && (
                        <div className="text-red-500 font-medium text-center mt-2 pt-2 border-t border-gray-100">
                          🔒 Bloqueado
                        </div>
                      )}
                      {!pc.app_running && online && (
                        <div className="text-amber-500 font-medium text-center mt-2 pt-2 border-t border-gray-100">
                          ⚠ Programa encerrado
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
