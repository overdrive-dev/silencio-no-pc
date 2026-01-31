import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict

class EventLogger:
    def __init__(self):
        self.app_data_dir = Path(os.environ.get("APPDATA", ".")) / "SilencioNoPC"
        self.app_data_dir.mkdir(parents=True, exist_ok=True)
        self.log_file = self.app_data_dir / "eventos.json"
        self._eventos = []
        self.load()
    
    def load(self):
        if self.log_file.exists():
            try:
                self._eventos = json.loads(self.log_file.read_text(encoding="utf-8"))
            except Exception:
                self._eventos = []
        else:
            self._eventos = []
    
    def save(self):
        self.log_file.write_text(json.dumps(self._eventos, ensure_ascii=False, indent=2), encoding="utf-8")
    
    def registrar(self, tipo: str, descricao: str, nivel_db: float = 0):
        evento = {
            "timestamp": datetime.now().isoformat(),
            "tipo": tipo,
            "descricao": descricao,
            "nivel_db": round(nivel_db, 1)
        }
        self._eventos.append(evento)
        if len(self._eventos) > 1000:
            self._eventos = self._eventos[-1000:]
        self.save()
    
    def strike(self, numero: int, nivel_db: float):
        self.registrar("strike", f"Strike {numero} aplicado", nivel_db)
    
    def reinicio(self, nivel_db: float):
        self.registrar("reinicio", "PC reiniciado por excesso de barulho", nivel_db)
    
    def bloqueio_internet(self, duracao_horas: float, nivel_db: float):
        self.registrar("bloqueio_internet", f"Internet bloqueada por {duracao_horas}h", nivel_db)
    
    def calibracao(self, ruido_ambiente: float):
        self.registrar("calibracao", f"Calibração realizada: ruído ambiente = {ruido_ambiente} dB", ruido_ambiente)
    
    def get_eventos(self, limite: int = 100) -> List[Dict]:
        return self._eventos[-limite:][::-1]
    
    def get_eventos_hoje(self) -> List[Dict]:
        hoje = datetime.now().date().isoformat()
        return [e for e in self._eventos if e["timestamp"].startswith(hoje)][::-1]
