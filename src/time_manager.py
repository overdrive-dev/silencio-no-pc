from datetime import datetime, time as dtime
from typing import Optional, Callable
from enum import Enum


class TimeAction(Enum):
    NONE = 0
    WARNING_15MIN = 1
    WARNING_5MIN = 2
    BLOCK = 3
    OUTSIDE_HOURS = 4


class TimeManager:
    """Gerencia limites de tempo diário e horários permitidos.
    
    Consome dados do ActivityTracker e decide quando avisar/bloquear.
    """
    
    def __init__(self, config, activity_tracker):
        self.config = config
        self.activity_tracker = activity_tracker
        
        self._blocked = False
        self._warned_15 = False
        self._warned_5 = False
        self._extra_minutes_today = 0
        self._removed_minutes_today = 0
        self._last_check_date = datetime.now().date()
    
    def _check_day_reset(self):
        """Reseta flags se mudou de dia."""
        today = datetime.now().date()
        if today != self._last_check_date:
            self._blocked = False
            self._warned_15 = False
            self._warned_5 = False
            self._extra_minutes_today = 0
            self._removed_minutes_today = 0
            self._last_check_date = today
    
    def _is_within_allowed_hours(self) -> bool:
        """Verifica se estamos dentro do horário permitido usando schedule jsonb."""
        now = datetime.now()
        dia_semana = str(now.weekday())  # "0"=Monday .. "6"=Sunday
        
        schedule = self.config.get("schedule", {})
        if not schedule:
            return True
        if dia_semana not in schedule:
            return False
        
        day_config = schedule[dia_semana]
        horario_inicio = day_config.get("start", "08:00")
        horario_fim = day_config.get("end", "22:00")
        
        try:
            inicio = datetime.strptime(horario_inicio, "%H:%M").time()
            fim = datetime.strptime(horario_fim, "%H:%M").time()
            hora_atual = now.time()
            
            if inicio <= fim:
                return inicio <= hora_atual <= fim
            else:
                return hora_atual >= inicio or hora_atual <= fim
        except Exception:
            return True
    
    def get_daily_limit_minutes(self) -> int:
        """Retorna limite diário efetivo (base + extras - removidos)."""
        base = self.config.get("daily_limit_minutes", 120)
        return base + self._extra_minutes_today - self._removed_minutes_today
    
    def get_remaining_minutes(self) -> int:
        """Retorna minutos restantes do dia."""
        limit = self.get_daily_limit_minutes()
        used = self.activity_tracker.get_effective_usage_minutes()
        return max(0, limit - used)
    
    def get_usage_percent(self) -> float:
        """Retorna porcentagem de uso (0.0 a 1.0+)."""
        limit = self.get_daily_limit_minutes()
        if limit <= 0:
            return 1.0
        used = self.activity_tracker.get_effective_usage_minutes()
        return used / limit
    
    def add_time(self, minutes: int):
        """Adiciona tempo extra ao dia (comando remoto)."""
        self._extra_minutes_today += minutes
        if self._blocked:
            remaining = self.get_remaining_minutes()
            if remaining > 0:
                self._blocked = False
                self._warned_15 = False
                self._warned_5 = False
    
    def remove_time(self, minutes: int):
        """Remove tempo do dia (comando remoto)."""
        self._removed_minutes_today += minutes
    
    def force_lock(self):
        """Força bloqueio da tela (comando remoto)."""
        self._blocked = True
    
    def force_unlock(self):
        """Desbloqueia (comando remoto)."""
        self._blocked = False
        self._warned_15 = False
        self._warned_5 = False
    
    def is_blocked(self) -> bool:
        """Retorna se o uso está bloqueado."""
        return self._blocked
    
    def check(self) -> TimeAction:
        """Verifica estado atual e retorna ação necessária.
        
        Deve ser chamado periodicamente (a cada ~30s-60s).
        """
        self._check_day_reset()
        
        if not self._is_within_allowed_hours():
            if not self._blocked:
                self._blocked = True
                return TimeAction.OUTSIDE_HOURS
            return TimeAction.NONE
        
        remaining = self.get_remaining_minutes()
        
        if remaining <= 0 and not self._blocked:
            self._blocked = True
            return TimeAction.BLOCK
        
        if self._blocked and remaining > 0:
            self._blocked = False
            self._warned_15 = False
            self._warned_5 = False
            return TimeAction.NONE
        
        if self._blocked:
            return TimeAction.NONE
        
        warn_15 = 15
        warn_5 = 5
        
        if remaining <= warn_5 and not self._warned_5:
            self._warned_5 = True
            return TimeAction.WARNING_5MIN
        
        if remaining <= warn_15 and not self._warned_15:
            self._warned_15 = True
            return TimeAction.WARNING_15MIN
        
        return TimeAction.NONE
    
    def get_status(self) -> dict:
        """Retorna status completo para sync/display."""
        return {
            "daily_limit_minutes": self.get_daily_limit_minutes(),
            "usage_minutes": self.activity_tracker.get_effective_usage_minutes(),
            "remaining_minutes": self.get_remaining_minutes(),
            "is_blocked": self._blocked,
            "usage_percent": self.get_usage_percent(),
            "extra_minutes": self._extra_minutes_today,
            "penalty_minutes": self.activity_tracker.get_time_penalty_minutes(),
        }
