"""Shared utilities for the KidsPC desktop app."""


def format_time(minutes: int) -> str:
    """Format minutes as 'H:MM' or 'Mm'."""
    if minutes <= 0:
        return "0:00"
    h = minutes // 60
    m = minutes % 60
    if h > 0:
        return f"{h}:{m:02d}"
    return f"{m}m"


class EventTypes:
    """Centralized event type constants — single source of truth."""
    STRIKE = "strike"
    PENALTY_TIME = "penalidade_tempo"
    BLOCK = "bloqueio"
    UNBLOCK = "desbloqueio"
    COMMAND = "command"
    SESSION_START = "sessao_inicio"
    SESSION_END = "sessao_fim"
    APP_STARTED = "app_started"
    APP_CLOSED = "app_closed"
    CALIBRATION = "calibracao"
    REBOOT = "reinicio"
    INTERNET_BLOCK = "bloqueio_internet"
    APP_KILLED = "app_killed"
