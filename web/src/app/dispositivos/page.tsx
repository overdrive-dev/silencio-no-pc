"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { PC } from "@/lib/types";
import { useSubscription } from "@/hooks/use-subscription";
import { calculateSubscriptionAmount } from "@/lib/mercadopago";
import PaymentBanner from "@/components/payment-banner";
import { PlusIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, ArrowPathIcon, LinkIcon } from "@heroicons/react/24/outline";
import { QRCodeSVG } from "qrcode.react";
import { QrCodeIcon } from "@heroicons/react/24/outline";

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
  const { hasAccess, loading: subLoading, maxDevices, deviceCount, invalidate } = useSubscription();
  const [pcs, setPcs] = useState<PC[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

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

  const handleUpgrade = async () => {
    setUpgrading(true);
    setUpgradeError(null);
    try {
      const res = await fetch("/api/dispositivos/upgrade", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setUpgradeError(data.error || "Erro ao fazer upgrade.");
        return;
      }
      // Upgrade successful — refresh subscription data
      invalidate();
      setShowUpgradeModal(false);
    } catch (err) {
      console.error("Erro ao fazer upgrade:", err);
      setUpgradeError("Erro de conexão. Tente novamente.");
    } finally {
      setUpgrading(false);
    }
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
        <div className="flex items-center gap-2">
          <Link
            href="/download"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Baixar app
          </Link>
        </div>
      </div>

      <PaymentBanner />

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#EDF2FF]">
                <PlusIcon className="size-7 text-[#4A7AFF]" />
              </div>
              <h2 className="text-lg font-display font-bold text-slate-900">
                Limite de dispositivos atingido
              </h2>
              <p className="text-sm text-slate-500">
                Você já tem <strong>{deviceCount}/{maxDevices}</strong> dispositivos no seu plano.
                Para adicionar mais, um valor extra de <strong>R$ 14,90/mês</strong> será adicionado à sua assinatura.
              </p>
              <div className="rounded-xl bg-[#EDF2FF]/60 border border-[#DAE5FF] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Plano atual ({maxDevices} dispositivos)</span>
                  <span className="font-semibold text-slate-900">
                    R$ {calculateSubscriptionAmount(maxDevices).toFixed(2).replace(".", ",")}/mês
                  </span>
                </div>
                <div className="border-t border-[#DAE5FF] my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Novo plano ({maxDevices + 1} dispositivos)</span>
                  <span className="font-semibold text-[#4A7AFF]">
                    R$ {calculateSubscriptionAmount(maxDevices + 1).toFixed(2).replace(".", ",")}/mês
                  </span>
                </div>
              </div>
              {upgradeError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {upgradeError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="flex-1 rounded-lg bg-[#4A7AFF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3A6AEF] disabled:opacity-50 transition"
                >
                  {upgrading ? "Atualizando..." : "Fazer upgrade"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {pcs.length === 0 && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Ghost device slots */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative rounded-2xl border-2 border-dashed border-[#DAE5FF] bg-[#EDF2FF]/30 p-6 flex flex-col items-center justify-center text-center min-h-[160px] group">
              <div className="absolute inset-0 rounded-2xl bg-[#4A7AFF]/5 animate-pulse" />
              <div className="relative">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#EDF2FF] mb-3 ring-4 ring-[#EDF2FF]/50">
                  <ComputerDesktopIcon className="size-7 text-[#4A7AFF]" />
                </div>
                <p className="text-sm font-semibold text-[#1a1a2e]">Computador</p>
                <p className="text-xs text-gray-400 mt-0.5">Windows</p>
              </div>
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF3D6] text-amber-600 border border-amber-200">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Aguardando
                </span>
              </div>
            </div>
            <div className="relative rounded-2xl border-2 border-dashed border-[#D6F5E0] bg-[#D6F5E0]/20 p-6 flex flex-col items-center justify-center text-center min-h-[160px] group">
              <div className="absolute inset-0 rounded-2xl bg-[#51CF66]/5 animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="relative">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#D6F5E0] mb-3 ring-4 ring-[#D6F5E0]/50">
                  <DevicePhoneMobileIcon className="size-7 text-[#51CF66]" />
                </div>
                <p className="text-sm font-semibold text-[#1a1a2e]">Celular</p>
                <p className="text-xs text-gray-400 mt-0.5">Android</p>
              </div>
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#FFF3D6] text-amber-600 border border-amber-200">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  Aguardando
                </span>
              </div>
            </div>
          </div>

          {/* Main content card */}
          <div className="rounded-2xl border border-[#e8e0d8] bg-white p-8 shadow-sm">
            <div className="text-center mb-8">
              <h3 className="text-xl font-display font-bold text-[#1a1a2e]">
                Seus dispositivos aparecerão aqui
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                Baixe o KidsPC no dispositivo do seu filho e vincule pelo painel. Você acompanha tudo daqui.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Download card */}
              <div className="rounded-xl border border-[#e8e0d8] bg-[#FAF7F2] p-5 flex flex-col items-center text-center">
                <div className="mb-4 p-2 rounded-xl bg-white border border-[#e8e0d8] shadow-sm">
                  <QRCodeSVG
                    value="https://kidspc.com.br/download"
                    size={120}
                    bgColor="#FFFFFF"
                    fgColor="#1a1a2e"
                    level="M"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-gray-400 mb-3">Escaneie ou clique para baixar</p>
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-full bg-[#4A7AFF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#4A7AFF]/20 hover:bg-[#3A6AEF] hover:shadow-md hover:shadow-[#4A7AFF]/30 transition-all w-full justify-center"
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Baixar o app
                </Link>
              </div>

              {/* Vincular card */}
              <div className="rounded-xl border border-[#e8e0d8] bg-[#FAF7F2] p-5 flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#EDF2FF] mb-3">
                  <QrCodeIcon className="size-7 text-[#4A7AFF]" />
                </div>
                <h4 className="text-sm font-semibold text-[#1a1a2e] mb-1">Vincular via QR Code</h4>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Abra o app KidsPC no dispositivo do seu filho e escaneie o QR code com seu celular.
                </p>
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-full bg-[#4A7AFF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#4A7AFF]/20 hover:bg-[#3A6AEF] hover:shadow-md hover:shadow-[#4A7AFF]/30 transition-all w-full justify-center"
                >
                  <LinkIcon className="size-4" />
                  Como vincular
                </Link>
              </div>
            </div>

            {/* How it works — compact */}
            <div className="mt-6 pt-6 border-t border-[#F0EBE5]">
              <div className="flex items-center gap-6 justify-center">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center justify-center size-5 rounded-full bg-[#EDF2FF] text-[#4A7AFF] text-[10px] font-bold">1</span>
                  Baixe o app
                </div>
                <svg className="size-4 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center justify-center size-5 rounded-full bg-[#FFE0E0] text-[#FF6B6B] text-[10px] font-bold">2</span>
                  Escaneie o QR
                </div>
                <svg className="size-4 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="flex items-center justify-center size-5 rounded-full bg-[#D6F5E0] text-[#51CF66] text-[10px] font-bold">3</span>
                  Pronto!
                </div>
              </div>
            </div>
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
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center size-10 rounded-xl bg-[#EDF2FF] mb-2">
                        <svg className="size-5 text-[#4A7AFF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                      </div>
                      <p className="text-sm text-slate-600 font-medium">Assinatura necessária</p>
                      <Link href="/pricing" className="text-xs text-[#4A7AFF] font-medium hover:underline mt-1 inline-block">Ver planos</Link>
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
                    <p className="text-sm text-zinc-500">
                      Abra o app no dispositivo e escaneie o QR code.
                    </p>
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
