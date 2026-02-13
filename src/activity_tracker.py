import ctypes
import time
from datetime import datetime, date
from threading import Thread, Event
from typing import Optional, Callable, List, Dict


class LASTINPUTINFO(ctypes.Structure):
    _fields_ = [
        ('cbSize', ctypes.c_uint),
        ('dwTime', ctypes.c_uint),
    ]


class ActivityTracker:
    """Rastreia atividade do usuário (mouse/teclado) via Windows API.
    
    Mede tempo de uso ativo do PC. Pausa automaticamente quando idle > threshold.
    """
    
    def __init__(self, idle_timeout_seconds: int = 300, on_session_change: Optional[Callable] = None):
        self.idle_timeout_seconds = idle_timeout_seconds
        self.on_session_change = on_session_change
        
        self._running = Event()
        self._thread: Optional[Thread] = None
        
        self._is_active = False
        self._current_session_start: Optional[datetime] = None
        self._today_accumulated_seconds: float = 0.0
        self._today_date: date = date.today()
        
        self._sessions_today: List[Dict] = []
        self._pending_sessions: List[Dict] = []
        
        self._time_penalty_seconds: float = 0.0
    
    def _get_idle_seconds(self) -> float:
        """Retorna segundos desde a última atividade de mouse/teclado."""
        lii = LASTINPUTINFO()
        lii.cbSize = ctypes.sizeof(LASTINPUTINFO)
        if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lii)):
            tick_count = ctypes.windll.kernel32.GetTickCount()
            idle_ms = tick_count - lii.dwTime
            return idle_ms / 1000.0
        return 0.0
    
    def _check_day_reset(self):
        """Reseta contadores se mudou de dia."""
        today = date.today()
        if today != self._today_date:
            if self._is_active and self._current_session_start:
                self._end_session()
            self._today_accumulated_seconds = 0.0
            self._today_date = today
            self._sessions_today = []
            self._time_penalty_seconds = 0.0
    
    def _start_session(self):
        """Inicia uma nova sessão de uso ativo."""
        self._is_active = True
        self._current_session_start = datetime.now()
        if self.on_session_change:
            self.on_session_change("started", self._current_session_start)
    
    def _end_session(self):
        """Encerra a sessão atual e contabiliza o tempo."""
        if not self._current_session_start:
            return
        
        now = datetime.now()
        duration_seconds = (now - self._current_session_start).total_seconds()
        
        session = {
            "started_at": self._current_session_start.isoformat(),
            "ended_at": now.isoformat(),
            "duration_minutes": int(duration_seconds / 60),
        }
        self._sessions_today.append(session)
        self._pending_sessions.append(session)
        
        self._today_accumulated_seconds += duration_seconds
        self._is_active = False
        self._current_session_start = None
        
        if self.on_session_change:
            self.on_session_change("ended", now)
    
    def _monitor_loop(self):
        """Loop principal de monitoramento de atividade."""
        while self._running.is_set():
            try:
                self._check_day_reset()
                idle_seconds = self._get_idle_seconds()
                
                if self._is_active:
                    if idle_seconds >= self.idle_timeout_seconds:
                        self._end_session()
                else:
                    if idle_seconds < self.idle_timeout_seconds:
                        self._start_session()
                
                time.sleep(5)
            except Exception as e:
                print(f"Erro no activity tracker: {e}")
                time.sleep(5)
    
    def start(self):
        """Inicia o monitoramento de atividade."""
        if self._thread and self._thread.is_alive():
            return
        self._running.set()
        self._start_session()
        self._thread = Thread(target=self._monitor_loop, daemon=True)
        self._thread.start()
    
    def stop(self):
        """Para o monitoramento."""
        self._running.clear()
        if self._is_active:
            self._end_session()
        if self._thread:
            self._thread.join(timeout=2)
    
    def get_usage_today_minutes(self) -> int:
        """Retorna minutos de uso ativo hoje (incluindo sessão atual)."""
        total = self._today_accumulated_seconds
        if self._is_active and self._current_session_start:
            total += (datetime.now() - self._current_session_start).total_seconds()
        return int(total / 60)
    
    def get_usage_today_seconds(self) -> float:
        """Retorna segundos de uso ativo hoje (incluindo sessão atual)."""
        total = self._today_accumulated_seconds
        if self._is_active and self._current_session_start:
            total += (datetime.now() - self._current_session_start).total_seconds()
        return total
    
    def is_active(self) -> bool:
        """Retorna se o usuário está ativo."""
        return self._is_active
    
    def get_current_session_minutes(self) -> int:
        """Retorna duração da sessão atual em minutos."""
        if not self._is_active or not self._current_session_start:
            return 0
        return int((datetime.now() - self._current_session_start).total_seconds() / 60)
    
    def apply_time_penalty(self, minutes: int):
        """Aplica penalidade de tempo (ex: por barulho)."""
        self._time_penalty_seconds += minutes * 60
    
    def get_time_penalty_minutes(self) -> int:
        """Retorna total de minutos de penalidade aplicados hoje."""
        return int(self._time_penalty_seconds / 60)
    
    def get_effective_usage_minutes(self) -> int:
        """Retorna uso efetivo = uso real + penalidades."""
        return self.get_usage_today_minutes() + self.get_time_penalty_minutes()
    
    def get_pending_sessions(self) -> List[Dict]:
        """Retorna sessões ainda não sincronizadas e limpa a lista."""
        sessions = self._pending_sessions.copy()
        self._pending_sessions.clear()
        return sessions
    
    def get_sessions_today(self) -> List[Dict]:
        """Retorna todas as sessões de hoje."""
        sessions = self._sessions_today.copy()
        if self._is_active and self._current_session_start:
            sessions.append({
                "started_at": self._current_session_start.isoformat(),
                "ended_at": None,
                "duration_minutes": self.get_current_session_minutes(),
            })
        return sessions
