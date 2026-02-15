export interface PC {
  id: string;
  user_id: string;
  name: string;
  paired_at: string | null;
  is_online: boolean;
  is_locked: boolean;
  responsible_mode: boolean;
  app_running: boolean;
  shutdown_type: string | null;
  usage_today_minutes: number;
  effective_limit_minutes: number;
  current_noise_db: number;
  strikes: number;
  last_heartbeat: string | null;
  last_activity: string | null;
  app_version: string;
}

export interface PairingCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  pc_id: string | null;
}

export interface UsageSession {
  id: string;
  user_id: string;
  pc_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
}

export interface DailyUsage {
  id: string;
  user_id: string;
  pc_id: string;
  date: string;
  total_minutes: number;
  sessions_count: number;
}

export interface AppEvent {
  id: string;
  user_id: string;
  pc_id: string;
  timestamp: string;
  type: string;
  description: string;
  noise_db: number;
}

export interface Command {
  id: string;
  user_id: string;
  pc_id: string;
  created_at: string;
  command: string;
  payload: Record<string, unknown>;
  status: "pending" | "executed" | "failed";
  executed_at: string | null;
}

export interface DaySchedule {
  start: string;
  end: string;
}

/** Keys are weekday numbers: "0"=Monday .. "6"=Sunday. Missing key = day disabled. */
export type WeekSchedule = Record<string, DaySchedule>;

export interface AppUsage {
  id: string;
  user_id: string;
  pc_id: string;
  date: string;
  app_name: string;
  display_name: string | null;
  minutes: number;
  category: string | null;
}

export interface SiteVisit {
  id: string;
  user_id: string;
  pc_id: string;
  date: string;
  domain: string;
  title: string | null;
  visit_count: number;
  total_seconds: number;
  source: string;
}

export interface PCSettings {
  id: string;
  user_id: string;
  pc_id: string;
  daily_limit_minutes: number;
  strike_penalty_minutes: number;
  schedule: WeekSchedule;
}
