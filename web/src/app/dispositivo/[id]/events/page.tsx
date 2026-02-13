"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { AppEvent } from "@/lib/types";

const EVENT_BADGES: Record<string, { label: string; color: string }> = {
  strike: { label: "Strike", color: "bg-amber-500/10 text-amber-400" },
  penalidade_tempo: { label: "Penalidade", color: "bg-red-500/10 text-red-400" },
  bloqueio: { label: "Bloqueio", color: "bg-red-500/10 text-red-400" },
  desbloqueio: { label: "Desbloqueio", color: "bg-green-500/10 text-green-400" },
  command: { label: "Comando", color: "bg-blue-500/10 text-blue-400" },
  app_started: { label: "Iniciado", color: "bg-green-500/10 text-green-400" },
  app_closed: { label: "Encerrado", color: "bg-amber-500/10 text-amber-400" },
  app_killed: { label: "Forçado", color: "bg-red-500/10 text-red-400" },
  sessao_inicio: { label: "Sessão", color: "bg-indigo-500/10 text-indigo-400" },
  sessao_fim: { label: "Sessão Fim", color: "bg-zinc-700 text-zinc-400" },
  calibracao: { label: "Calibração", color: "bg-zinc-700 text-zinc-400" },
};

const EVENT_TYPES = [
  "strike", "penalidade_tempo", "bloqueio", "desbloqueio", "command",
  "app_started", "app_closed", "app_killed", "sessao_inicio", "sessao_fim",
];

export default function EventsPage() {
  const { id } = useParams<{ id: string }>();
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 30;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (filter) params.set("type", filter);
      const res = await fetch(`/api/dispositivo/${id}/events?${params}`);
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
    } finally {
      setLoading(false);
    }
  }, [id, filter, offset]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setOffset(0);
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dispositivo/${id}`} className="text-zinc-500 hover:text-white transition">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Eventos</h1>
        <span className="text-zinc-500 text-sm">({total} total)</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
            !filter ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Todos
        </button>
        {EVENT_TYPES.map((type) => {
          const badge = EVENT_BADGES[type] || { label: type, color: "bg-zinc-700 text-zinc-400" };
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filter === type ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {badge.label}
            </button>
          );
        })}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="text-zinc-400 text-center py-8">Carregando...</div>
      ) : events.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
          Nenhum evento encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((evt) => {
            const badge = EVENT_BADGES[evt.type] || { label: evt.type, color: "bg-zinc-700 text-zinc-400" };
            return (
              <div
                key={evt.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-4"
              >
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${badge.color}`}>
                  {badge.label}
                </span>
                <span className="text-sm text-zinc-300 flex-1 truncate">
                  {evt.description}
                </span>
                {evt.noise_db > 0 && (
                  <span className="text-xs text-zinc-500 shrink-0">{evt.noise_db.toFixed(0)} dB</span>
                )}
                <span className="text-xs text-zinc-600 shrink-0">
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

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-sm transition"
          >
            ← Anterior
          </button>
          <span className="text-sm text-zinc-500">
            {offset + 1}–{Math.min(offset + limit, total)} de {total}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded-lg text-sm transition"
          >
            Próximo →
          </button>
        </div>
      )}
    </div>
  );
}
