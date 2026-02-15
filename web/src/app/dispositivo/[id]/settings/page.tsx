"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { PCSettings, WeekSchedule } from "@/lib/types";

const DAYS = [
  { key: "0", label: "Segunda" },
  { key: "1", label: "Terça" },
  { key: "2", label: "Quarta" },
  { key: "3", label: "Quinta" },
  { key: "4", label: "Sexta" },
  { key: "5", label: "Sábado" },
  { key: "6", label: "Domingo" },
];

const DEFAULT_SCHEDULE: WeekSchedule = {
  "0": { start: "08:00", end: "22:00" },
  "1": { start: "08:00", end: "22:00" },
  "2": { start: "08:00", end: "22:00" },
  "3": { start: "08:00", end: "22:00" },
  "4": { start: "08:00", end: "22:00" },
  "5": { start: "09:00", end: "23:00" },
  "6": { start: "09:00", end: "23:00" },
};

export default function SettingsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [settings, setSettings] = useState<PCSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [showUnpairModal, setShowUnpairModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dangerLoading, setDangerLoading] = useState(false);
  const [dangerError, setDangerError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/dispositivo/${id}/settings`);
      const data = await res.json();
      setSettings(data.settings);
      setHasPassword(!!data.settings?.password_hash);
    } catch (err) {
      console.error("Erro ao buscar configurações:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateField = (field: keyof PCSettings, value: unknown) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const schedule = settings?.schedule ?? DEFAULT_SCHEDULE;

  const toggleDay = (dayKey: string) => {
    const newSchedule = { ...schedule };
    if (newSchedule[dayKey]) {
      delete newSchedule[dayKey];
    } else {
      newSchedule[dayKey] = { start: "08:00", end: "22:00" };
    }
    updateField("schedule", newSchedule);
  };

  const updateDayTime = (dayKey: string, field: "start" | "end", value: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[dayKey]) return;
    newSchedule[dayKey] = { ...newSchedule[dayKey], [field]: value };
    updateField("schedule", newSchedule);
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/dispositivo/${id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daily_limit_minutes: settings.daily_limit_minutes,
          strike_penalty_minutes: settings.strike_penalty_minutes,
          schedule: settings.schedule,
          ...(password ? { password } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Erro ao salvar: ${data.error || "Erro desconhecido"}`);
        return;
      }
      setSaved(true);
      if (password) {
        setHasPassword(true);
        setPassword("");
        setConfirmPassword("");
      }
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUnpair = async () => {
    setDangerLoading(true);
    setDangerError(null);
    try {
      const res = await fetch(`/api/dispositivo/${id}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "unpair" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDangerError(data.error || "Erro ao desvincular.");
        return;
      }
      setShowUnpairModal(false);
      router.push("/dispositivos");
    } catch {
      setDangerError("Erro de conexão. Tente novamente.");
    } finally {
      setDangerLoading(false);
    }
  };

  const handleDelete = async () => {
    setDangerLoading(true);
    setDangerError(null);
    try {
      const res = await fetch(`/api/dispositivo/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDangerError(data.error || "Erro ao excluir dispositivo.");
        return;
      }
      setShowDeleteModal(false);
      router.push("/dispositivos");
    } catch {
      setDangerError("Erro de conexão. Tente novamente.");
    } finally {
      setDangerLoading(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <Link href="/dispositivos" className="hover:text-gray-700 transition">Dispositivos</Link>
        <span className="mx-2">/</span>
        <Link href={`/dispositivo/${id}`} className="hover:text-gray-700 transition">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Configurações</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">Configurações do Dispositivo</h1>

      {/* ── Tempo ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">⏱</span>
          <h3 className="font-semibold text-gray-900 text-lg">Tempo de uso</h3>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Limite diário</label>
          <p className="text-xs text-gray-400">Tempo máximo de uso do PC por dia.</p>
          <div className="flex items-center gap-4 pt-1">
            <input
              type="range"
              min={15}
              max={720}
              step={15}
              value={settings.daily_limit_minutes ?? 120}
              onChange={(e) => updateField("daily_limit_minutes", parseInt(e.target.value))}
              className="flex-1 accent-indigo-500"
            />
            <span className="text-lg font-mono w-24 text-right text-gray-900">
              {Math.floor((settings.daily_limit_minutes ?? 120) / 60)}h{" "}
              {String((settings.daily_limit_minutes ?? 120) % 60).padStart(2, "0")}min
            </span>
          </div>
        </div>
      </div>

      {/* ── Strikes ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <h3 className="font-semibold text-gray-900 text-lg">Strikes e penalidades</h3>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">Como funciona:</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-amber-50 p-2">
              <div className="text-lg mb-1">1️⃣</div>
              <span className="text-amber-700 font-medium">Aviso leve</span>
              <p className="text-gray-500 mt-0.5">Popup na tela</p>
            </div>
            <div className="rounded-lg bg-orange-50 p-2">
              <div className="text-lg mb-1">2️⃣</div>
              <span className="text-orange-700 font-medium">Aviso forte</span>
              <p className="text-gray-500 mt-0.5">Áudio alto</p>
            </div>
            <div className="rounded-lg bg-red-50 p-2">
              <div className="text-lg mb-1">3️⃣</div>
              <span className="text-red-700 font-medium">Penalidade</span>
              <p className="text-gray-500 mt-0.5">Perde tempo</p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Penalidade por ciclo de 3 strikes</label>
          <p className="text-xs text-gray-400">Minutos removidos do tempo diário quando atinge 3 strikes.</p>
          <div className="flex items-center gap-4 pt-1">
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={settings.strike_penalty_minutes ?? 30}
              onChange={(e) => updateField("strike_penalty_minutes", parseInt(e.target.value))}
              className="flex-1 accent-red-500"
            />
            <span className="text-lg font-mono w-24 text-right text-red-600 font-bold">
              -{settings.strike_penalty_minutes ?? 30}min
            </span>
          </div>
        </div>
      </div>

      {/* ── Horários ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h3 className="font-semibold text-gray-900 text-lg">Horário de funcionamento</h3>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Defina o horário permitido para cada dia da semana. Desative os dias que o PC não pode ser usado.
          </p>
        </div>
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const dayEnabled = !!schedule[key];
            const day = schedule[key];
            return (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-lg p-3 transition ${
                  dayEnabled
                    ? "bg-gray-50"
                    : "bg-gray-100/50 opacity-60"
                }`}
              >
                <button
                  onClick={() => toggleDay(key)}
                  className={`w-8 h-5 rounded-full relative transition-colors ${
                    dayEnabled ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      dayEnabled ? "translate-x-3" : ""
                    }`}
                  />
                </button>
                <span className={`w-20 text-sm font-medium ${dayEnabled ? "text-gray-900" : "text-gray-400"}`}>
                  {label}
                </span>
                {dayEnabled && day ? (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="time"
                      value={day.start}
                      onChange={(e) => updateDayTime(key, "start", e.target.value)}
                      className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900"
                    />
                    <span className="text-gray-400 text-xs">até</span>
                    <input
                      type="time"
                      value={day.end}
                      onChange={(e) => updateDayTime(key, "end", e.target.value)}
                      className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm text-gray-900"
                    />
                  </div>
                ) : (
                  <span className="ml-auto text-xs text-gray-400">Desativado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Senha ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <h3 className="font-semibold text-gray-900 text-lg">Senha do programa</h3>
            {hasPassword ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Definida</span>
            ) : (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Não definida</span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Senha exigida para abrir configurações, adicionar tempo ou sair do programa no PC.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">{hasPassword ? "Nova senha" : "Senha"}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setSaved(false); }}
              placeholder="Mín. 4 caracteres"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Confirmar senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setSaved(false); }}
              placeholder="Repetir senha"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            />
          </div>
        </div>
        {password && password.length < 4 && (
          <p className="text-xs text-red-500">A senha deve ter pelo menos 4 caracteres.</p>
        )}
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-500">As senhas não coincidem.</p>
        )}
      </div>

      {/* Sync note */}
      <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-4 text-sm text-indigo-700">
        💡 As configurações são sincronizadas automaticamente com o programa a cada 30 segundos.
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <button
          onClick={saveSettings}
          disabled={saving || (!!password && (password.length < 4 || password !== confirmPassword))}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 rounded-xl text-white font-medium transition"
        >
          {saving ? "Salvando..." : "Salvar Configurações"}
        </button>
        {saved && (
          <span className="text-green-600 text-sm">✓ Salvo com sucesso!</span>
        )}
      </div>

      {/* ── Zona de perigo ── */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗑</span>
            <h3 className="font-semibold text-red-900 text-lg">Zona de perigo</h3>
          </div>
          <p className="text-sm text-red-700/70 mt-1">
            Ações irreversíveis sobre este dispositivo.
          </p>
        </div>

        {dangerError && (
          <div className="rounded-lg bg-red-100 border border-red-200 p-3 text-sm text-red-800">
            {dangerError}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-white border border-red-100 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Desvincular dispositivo</p>
              <p className="text-xs text-gray-500">O programa no PC será desvinculado e precisará de novo pareamento. O histórico é mantido.</p>
            </div>
            <button
              onClick={() => setShowUnpairModal(true)}
              className="shrink-0 ml-4 px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-300 rounded-lg hover:bg-red-50 transition"
            >
              Desvincular
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white border border-red-100 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Excluir dispositivo</p>
              <p className="text-xs text-gray-500">Remove o dispositivo e todo o histórico (eventos, uso, sessões). Irreversível.</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 ml-4 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      {/* Unpair confirmation modal */}
      {showUnpairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => !dangerLoading && setShowUnpairModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Desvincular dispositivo?</h3>
            <p className="text-sm text-gray-500 mb-1">O programa KidsPC no computador será desvinculado.</p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>• O programa mostrará a tela de pareamento novamente</li>
              <li>• Todo o histórico de uso e eventos será mantido</li>
              <li>• Você pode vincular novamente com um novo token</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUnpairModal(false)}
                disabled={dangerLoading}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleUnpair}
                disabled={dangerLoading}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition"
              >
                {dangerLoading ? "Desvinculando..." : "Sim, desvincular"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => !dangerLoading && setShowDeleteModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Excluir dispositivo permanentemente?</h3>
            <p className="text-sm text-gray-500 mb-1">Esta ação não pode ser desfeita.</p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1">
              <li>• O dispositivo será removido do painel</li>
              <li>• Todo o histórico de eventos, uso e sessões será apagado</li>
              <li>• O programa no PC será desvinculado automaticamente</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={dangerLoading}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={dangerLoading}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition"
              >
                {dangerLoading ? "Excluindo..." : "Excluir permanentemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
