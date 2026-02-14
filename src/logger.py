import json
import os
import threading
from pathlib import Path
from datetime import datetime
from typing import List, Dict

class EventLogger:
    def __init__(self):
        self.app_data_dir = Path(os.environ.get("APPDATA", ".")) / "KidsPC"
        self.app_data_dir.mkdir(parents=True, exist_ok=True)
        self.log_file = self.app_data_dir / "eventos.json"
        self._eventos = []
        self._dirty = False
        self._lock = threading.Lock()
        self.load()
        self._flush_timer = threading.Timer(5.0, self._flush_loop)
        self._flush_timer.daemon = True
        self._flush_timer.start()
    
    def load(self):
        if self.log_file.exists():
            try:
                self._eventos = json.loads(self.log_file.read_text(encoding="utf-8"))
            except Exception:
                self._eventos = []
        else:
            self._eventos = []
    
    def _flush_loop(self):
        """Periodic flush — writes to disk every 5s if dirty."""
        self.flush()
        self._flush_timer = threading.Timer(5.0, self._flush_loop)
        self._flush_timer.daemon = True
        self._flush_timer.start()
    
    def save(self):
        self.log_file.write_text(json.dumps(self._eventos, ensure_ascii=False, indent=2), encoding="utf-8")
        self._dirty = False
    
    def flush(self):
        """Write to disk only if there are pending changes."""
        with self._lock:
            if self._dirty:
                self.save()
    
    def registrar(self, tipo: str, descricao: str, nivel_db: float = 0):
        evento = {
            "timestamp": datetime.now().isoformat(),
            "tipo": tipo,
            "descricao": descricao,
            "nivel_db": round(nivel_db, 1)
        }
        with self._lock:
            self._eventos.append(evento)
            if len(self._eventos) > 1000:
                self._eventos = self._eventos[-1000:]
            self._dirty = True
    
    def strike(self, numero: int, nivel_db: float):
        self.registrar("strike", f"Strike {numero} aplicado", nivel_db)
    
    def reinicio(self, nivel_db: float):
        self.registrar("reinicio", "PC reiniciado por excesso de barulho", nivel_db)
    
    def bloqueio_internet(self, duracao_horas: float, nivel_db: float):
        self.registrar("bloqueio_internet", f"Internet bloqueada por {duracao_horas}h", nivel_db)
    
    def calibracao(self, ruido_ambiente: float):
        self.registrar("calibracao", f"Calibração realizada: ruído ambiente = {ruido_ambiente} dB", ruido_ambiente)
    
    def penalidade_tempo(self, minutos: int, nivel_db: float):
        self.registrar("penalidade_tempo", f"Penalidade de {minutos} minutos por barulho", nivel_db)
    
    def uso_bloqueado(self, motivo: str):
        self.registrar("bloqueio", f"Uso bloqueado: {motivo}")
    
    def uso_desbloqueado(self, motivo: str):
        self.registrar("desbloqueio", f"Uso desbloqueado: {motivo}")
    
    def comando_remoto(self, comando: str, payload: dict = None):
        desc = f"Comando remoto: {comando}"
        if payload:
            desc += f" ({payload})"
        self.registrar("command", desc)
    
    def sessao_iniciada(self):
        self.registrar("sessao_inicio", "Sessão de uso iniciada")
    
    def sessao_encerrada(self, duracao_min: int):
        self.registrar("sessao_fim", f"Sessão encerrada ({duracao_min} min)")
    
    def app_iniciado(self):
        self.registrar("app_started", "Programa iniciado")
    
    def app_encerrado(self):
        self.registrar("app_closed", "Programa encerrado normalmente")
    
    def get_eventos(self, limite: int = 100) -> List[Dict]:
        return self._eventos[-limite:][::-1]
    
    def get_eventos_hoje(self) -> List[Dict]:
        hoje = datetime.now().date().isoformat()
        return [e for e in self._eventos if e["timestamp"].startswith(hoje)][::-1]
    
    def get_pending_eventos(self) -> List[Dict]:
        """Retorna eventos ainda não sincronizados."""
        pending = [e for e in self._eventos if not e.get("synced", False)]
        return pending
    
    def mark_synced(self, timestamps: List[str]):
        """Marca eventos como sincronizados."""
        ts_set = set(timestamps)
        with self._lock:
            for e in self._eventos:
                if e["timestamp"] in ts_set:
                    e["synced"] = True
            self._dirty = True
