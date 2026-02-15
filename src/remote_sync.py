import time
from datetime import datetime, date, timezone
from threading import Thread, Event
from typing import Optional, Callable, Dict, Any

SUPABASE_URL = "https://hdabvnxtxzbfemnqwfyd.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkYWJ2bnh0eHpiZmVtbnF3ZnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDUxMjQsImV4cCI6MjA4NjQ4MTEyNH0.3WxyRo5T10_35Ire-Xvbp-gf1daq-HR7cS2sffB0V5I"


class RemoteSync:
    """Sincronização bidirecional com Supabase via polling.
    
    Sync de saída: heartbeat, usage, events, daily_usage
    Sync de entrada: commands, settings
    """
    
    def __init__(self, config, logger, activity_tracker, time_manager, 
                 strike_manager, screen_locker, actions,
                 on_command: Optional[Callable] = None,
                 app_blocker=None, site_blocker=None,
                 audio_monitor=None,
                 window_tracker=None, browser_history=None):
        self.config = config
        self.logger = logger
        self.activity_tracker = activity_tracker
        self.time_manager = time_manager
        self.strike_manager = strike_manager
        self.screen_locker = screen_locker
        self.actions = actions
        self.on_command = on_command
        self.app_blocker = app_blocker
        self.site_blocker = site_blocker
        self.audio_monitor = audio_monitor
        self.window_tracker = window_tracker
        self.browser_history = browser_history
        self._sync_count = 0
        
        self._running = Event()
        self._thread: Optional[Thread] = None
        self._supabase = None
        self._last_settings_hash = None
    
    def _get_client(self):
        """Lazy-init do Supabase client."""
        if self._supabase is None:
            try:
                from supabase import create_client
                self._supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
            except Exception as e:
                print(f"Erro ao criar Supabase client: {e}")
        return self._supabase
    
    def _get_pc_id(self) -> str:
        return self.config.get("pc_id", "")
    
    def _get_user_id(self) -> str:
        return self.config.get("user_id", "")
    
    def start(self):
        """Inicia sync em thread separada."""
        if not self.config.get("paired", False):
            print("RemoteSync: PC não pareado, sync desabilitado")
            return
        if not self.config.get("remote_sync_enabled", True):
            return
        if self._thread and self._thread.is_alive():
            return
        
        self._running.set()
        self._thread = Thread(target=self._sync_loop, daemon=True)
        self._thread.start()
    
    def stop(self):
        """Para o sync."""
        self._running.clear()
        if self._thread:
            self._thread.join(timeout=5)
    
    def _sync_loop(self):
        """Loop principal de sincronização com backoff exponencial."""
        base_interval = self.config.get("sync_interval_seconds", 30)
        max_interval = 300  # 5 minutes
        current_interval = base_interval
        consecutive_failures = 0
        
        while self._running.is_set():
            try:
                self._sync_outbound()
                self._sync_inbound()
                consecutive_failures = 0
                current_interval = base_interval
            except Exception as e:
                consecutive_failures += 1
                current_interval = min(base_interval * (2 ** consecutive_failures), max_interval)
                print(f"Erro no sync ({consecutive_failures}x, próximo em {current_interval}s): {e}")
            
            for _ in range(current_interval * 2):
                if not self._running.is_set():
                    break
                time.sleep(0.5)
    
    def _sync_outbound(self):
        """Envia dados para o Supabase."""
        client = self._get_client()
        if not client:
            return
        
        pc_id = self._get_pc_id()
        user_id = self._get_user_id()
        if not pc_id or not user_id:
            return
        
        try:
            noise_db = 0
            try:
                if self.audio_monitor:
                    noise_db = self.audio_monitor.get_nivel_atual()
            except Exception:
                pass
            
            client.table("pcs").update({
                "is_online": True,
                "app_running": True,
                "shutdown_type": None,
                "is_locked": self.screen_locker.is_enforcing(),
                "usage_today_minutes": self.activity_tracker.get_effective_usage_minutes(),
                "effective_limit_minutes": self.time_manager.get_daily_limit_minutes(),
                "current_noise_db": round(noise_db, 1),
                "strikes": self.strike_manager.get_strikes(),
                "last_heartbeat": datetime.now(timezone.utc).isoformat(),
                "last_activity": datetime.now(timezone.utc).isoformat() if self.activity_tracker.is_active() else None,
                "app_version": self.config.get("app_version", "2.0.0"),
            }).eq("id", pc_id).execute()
        except Exception as e:
            print(f"Erro ao atualizar pc_status: {e}")
        
        try:
            sessions = self.activity_tracker.get_pending_sessions()
            for session in sessions:
                client.table("usage_sessions").insert({
                    "user_id": user_id,
                    "pc_id": pc_id,
                    "started_at": session["started_at"],
                    "ended_at": session["ended_at"],
                    "duration_minutes": session["duration_minutes"],
                }).execute()
        except Exception as e:
            print(f"Erro ao enviar sessões: {e}")
        
        try:
            today = date.today().isoformat()
            usage_min = self.activity_tracker.get_effective_usage_minutes()
            sessions_today = len(self.activity_tracker.get_sessions_today())
            
            client.table("daily_usage").upsert({
                "user_id": user_id,
                "pc_id": pc_id,
                "date": today,
                "total_minutes": usage_min,
                "sessions_count": sessions_today,
            }, on_conflict="pc_id,date").execute()
        except Exception as e:
            print(f"Erro ao atualizar daily_usage: {e}")
        
        # Sync app usage and site visits (every 3rd cycle ~90s to reduce load)
        self._sync_count += 1
        if self._sync_count % 3 == 0:
            self._sync_app_usage(client, pc_id, user_id)
            self._sync_site_visits(client, pc_id, user_id)
        
        try:
            pending = self.logger.get_pending_eventos()
            if pending:
                rows = []
                timestamps = []
                for evt in pending[:50]:
                    rows.append({
                        "user_id": user_id,
                        "pc_id": pc_id,
                        "timestamp": evt["timestamp"],
                        "type": evt["tipo"],
                        "description": evt.get("descricao", ""),
                        "noise_db": evt.get("nivel_db", 0),
                    })
                    timestamps.append(evt["timestamp"])
                
                if rows:
                    client.table("events").upsert(
                        rows, on_conflict="pc_id,timestamp,type", ignore_duplicates=True
                    ).execute()
                    self.logger.mark_synced(timestamps)
        except Exception as e:
            print(f"Erro ao enviar eventos: {e}")
    
    def _sync_app_usage(self, client, pc_id: str, user_id: str):
        """Sync app usage data from WindowTracker to Supabase."""
        if not self.window_tracker:
            return
        try:
            today = date.today().isoformat()
            app_data = self.window_tracker.get_app_usage()
            for app in app_data:
                client.table("app_usage").upsert({
                    "user_id": user_id,
                    "pc_id": pc_id,
                    "date": today,
                    "app_name": app["app_name"],
                    "display_name": app["display_name"],
                    "minutes": app["minutes"],
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }, on_conflict="pc_id,date,app_name").execute()
        except Exception as e:
            print(f"Erro ao sincronizar app_usage: {e}")
    
    def _sync_site_visits(self, client, pc_id: str, user_id: str):
        """Sync site visits from WindowTracker + BrowserHistory to Supabase."""
        if not self.window_tracker:
            return
        try:
            today = date.today().isoformat()
            
            # Merge window title data + browser history
            sites: dict[str, dict] = {}
            
            # Window title tracking (has time data)
            for site in self.window_tracker.get_site_visits():
                domain = site["domain"]
                sites[domain] = {
                    "user_id": user_id,
                    "pc_id": pc_id,
                    "date": today,
                    "domain": domain,
                    "title": site.get("title", ""),
                    "visit_count": site.get("visit_count", 1),
                    "total_seconds": site.get("total_seconds", 0),
                    "source": "window_title",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }
            
            # Browser history (has visit counts, no time)
            if self.browser_history:
                try:
                    for entry in self.browser_history.read_today():
                        domain = entry["domain"]
                        if domain in sites:
                            # Merge: keep window_title time, add browser visit count
                            sites[domain]["visit_count"] = max(
                                sites[domain]["visit_count"],
                                entry.get("visit_count", 1),
                            )
                            if entry.get("title"):
                                sites[domain]["title"] = entry["title"]
                            sites[domain]["source"] = "both"
                        else:
                            sites[domain] = {
                                "user_id": user_id,
                                "pc_id": pc_id,
                                "date": today,
                                "domain": domain,
                                "title": entry.get("title", ""),
                                "visit_count": entry.get("visit_count", 1),
                                "total_seconds": 0,
                                "source": "browser_history",
                                "updated_at": datetime.now(timezone.utc).isoformat(),
                            }
                except Exception as e:
                    print(f"Erro ao ler browser history: {e}")
            
            for site_data in sites.values():
                client.table("site_visits").upsert(
                    site_data, on_conflict="pc_id,date,domain"
                ).execute()
        except Exception as e:
            print(f"Erro ao sincronizar site_visits: {e}")
    
    def _sync_inbound(self):
        """Busca comandos e settings do Supabase."""
        client = self._get_client()
        if not client:
            return
        
        pc_id = self._get_pc_id()
        if not pc_id:
            return
        
        try:
            result = client.table("commands").select("*").eq("pc_id", pc_id).eq("status", "pending").execute()
            
            for cmd in (result.data or []):
                self._execute_command(cmd)
        except Exception as e:
            print(f"Erro ao buscar comandos: {e}")
        
        try:
            result = client.table("pc_settings").select("*").eq("pc_id", pc_id).execute()
            
            if result.data:
                settings = result.data[0]
                self._apply_settings(settings)
                
                # Sync blocking rules
                self._sync_blocking_rules(client, pc_id, settings)
        except Exception as e:
            print(f"Erro ao buscar settings: {e}")
    
    def _execute_command(self, cmd: Dict[str, Any]):
        """Executa um comando remoto."""
        client = self._get_client()
        if not client:
            return
        
        command = cmd["command"]
        payload = cmd.get("payload", {}) or {}
        
        try:
            if command == "add_time":
                minutes = payload.get("minutes", 30)
                self.time_manager.add_time(minutes)
                if not self.time_manager.is_blocked():
                    self.screen_locker.stop_enforcement()
                self.logger.comando_remoto("add_time", payload)
            
            elif command == "remove_time":
                minutes = payload.get("minutes", 30)
                self.time_manager.remove_time(minutes)
                self.logger.comando_remoto("remove_time", payload)
            
            elif command == "lock":
                self.time_manager.force_lock()
                self.screen_locker.start_enforcement()
                self.logger.comando_remoto("lock")
            
            elif command == "unlock":
                self.time_manager.force_unlock()
                self.screen_locker.stop_enforcement()
                self.logger.comando_remoto("unlock")
            
            elif command == "shutdown":
                delay = payload.get("delay_seconds", 30)
                self.logger.comando_remoto("shutdown", payload)
                self.actions.shutdown_pc(delay)
            
            elif command == "reset_strikes":
                self.strike_manager.reset_strikes()
                self.logger.comando_remoto("reset_strikes")
            
            elif command == "update_settings":
                self.logger.comando_remoto("update_settings", payload)
            
            client.table("commands").update({
                "status": "executed",
                "executed_at": datetime.now(timezone.utc).isoformat(),
            }).eq("id", cmd["id"]).execute()
            
            if self.on_command:
                self.on_command(command, payload)
                
        except Exception as e:
            print(f"Erro ao executar comando {command}: {e}")
            try:
                client.table("commands").update({
                    "status": "failed",
                    "executed_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", cmd["id"]).execute()
            except Exception:
                pass
    
    def _sync_blocking_rules(self, client, pc_id: str, settings: Dict[str, Any]):
        """Busca e aplica regras de bloqueio de apps e sites."""
        try:
            if self.app_blocker:
                apps_result = client.table("blocked_apps").select("*").eq("pc_id", pc_id).execute()
                app_mode = settings.get("app_block_mode", "blacklist")
                self.app_blocker.update_rules(apps_result.data or [], app_mode)
        except Exception as e:
            print(f"Erro ao buscar blocked_apps: {e}")
        
        try:
            if self.site_blocker:
                sites_result = client.table("blocked_sites").select("*").eq("pc_id", pc_id).execute()
                self.site_blocker.update_rules(sites_result.data or [])
        except Exception as e:
            print(f"Erro ao buscar blocked_sites: {e}")

    def _apply_settings(self, settings: Dict[str, Any]):
        """Aplica settings remotas na config local."""
        sync_fields = [
            "daily_limit_minutes",
            "strike_penalty_minutes",
            "schedule",
            "password_hash",
        ]
        
        updates = {}
        for key in sync_fields:
            if key in settings and settings[key] is not None:
                current = self.config.get(key)
                new_val = settings[key]
                if current != new_val:
                    updates[key] = new_val
                    if key == "password_hash":
                        print("RemoteSync: password_hash atualizado via sync")
        
        if updates:
            self.config.set_batch(updates)
    
    def send_shutdown_event(self, shutdown_type: str = "graceful"):
        """Envia evento de encerramento (chamado no atexit)."""
        try:
            client = self._get_client()
            if not client:
                return
            
            pc_id = self._get_pc_id()
            if not pc_id:
                return
            
            client.table("pcs").update({
                "app_running": False,
                "is_online": False,
                "shutdown_type": shutdown_type,
            }).eq("id", pc_id).execute()
        except Exception:
            pass
