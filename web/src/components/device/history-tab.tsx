"use client";

import type { DailyUsage } from "@/lib/types";
import { formatTime } from "./usage-gauge";

interface HistoryTabProps {
  history: DailyUsage[];
}

export default function HistoryTab({ history }: HistoryTabProps) {
  if (history.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-6">Nenhum dado de uso registrado ainda.</p>;
  }

  const maxMin = Math.max(...history.map((d) => d.total_minutes), 1);

  return (
    <>
      <div className="space-y-1.5">
        {history.map((day) => {
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
  );
}
