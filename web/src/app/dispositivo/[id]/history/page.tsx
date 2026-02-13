"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { DailyUsage } from "@/lib/types";

function formatTime(minutes: number): string {
  if (minutes <= 0) return "0min";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}

export default function HistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/dispositivo/${id}/history?days=30`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const maxMinutes = Math.max(...history.map((d) => d.total_minutes), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-400 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dispositivo/${id}`} className="text-zinc-500 hover:text-white transition">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Histórico de Uso</h1>
      </div>

      {history.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">
          Nenhum dado de uso registrado ainda.
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="space-y-2">
            {history.map((day) => {
              const pct = (day.total_minutes / maxMinutes) * 100;
              const dateStr = new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              });
              return (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-28 text-right shrink-0">
                    {dateStr}
                  </span>
                  <div className="flex-1 h-6 bg-zinc-800 rounded-md overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-md transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 w-16 shrink-0">
                    {formatTime(day.total_minutes)}
                  </span>
                  <span className="text-xs text-zinc-600 w-12 shrink-0">
                    {day.sessions_count}x
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-6 text-sm text-zinc-400">
            <div>
              <span className="text-zinc-600">Média diária:</span>{" "}
              <span className="text-white font-medium">
                {formatTime(
                  Math.round(
                    history.reduce((sum, d) => sum + d.total_minutes, 0) / history.length
                  )
                )}
              </span>
            </div>
            <div>
              <span className="text-zinc-600">Total ({history.length} dias):</span>{" "}
              <span className="text-white font-medium">
                {formatTime(history.reduce((sum, d) => sum + d.total_minutes, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
