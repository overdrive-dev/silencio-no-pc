"use client";

import type { AppEvent } from "@/lib/types";

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

interface EventsTabProps {
  events: AppEvent[];
  eventsTotal: number;
  eventsOffset: number;
  eventsLimit: number;
  eventFilter: string;
  setEventFilter: (f: string) => void;
  setEventsOffset: (o: number) => void;
}

export default function EventsTab({
  events, eventsTotal, eventsOffset, eventsLimit,
  eventFilter, setEventFilter, setEventsOffset,
}: EventsTabProps) {
  return (
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
  );
}
