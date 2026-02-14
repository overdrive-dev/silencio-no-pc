import json
import os
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

class Config:
    DEFAULT_CONFIG = {
        "primeiro_uso": True,
        "password_hash": "",
        "posicao_widget_x": 100,
        "posicao_widget_y": 100,
        # Volume (local config - criança não muda, pai ajusta no programa)
        "volume_atencao_db": 70,   # nível de atenção (aviso visual)
        "volume_grito_db": 85,     # nível de strike (grito)
        # Controle de tempo (vem da web via sync)
        "daily_limit_minutes": 120,
        "strike_penalty_minutes": 30,
        "schedule": {
            "0": {"start": "08:00", "end": "22:00"},
            "1": {"start": "08:00", "end": "22:00"},
            "2": {"start": "08:00", "end": "22:00"},
            "3": {"start": "08:00", "end": "22:00"},
            "4": {"start": "08:00", "end": "22:00"},
            "5": {"start": "09:00", "end": "23:00"},
            "6": {"start": "09:00", "end": "23:00"},
        },
        "idle_timeout_seconds": 300,
        # Strikes & calibração
        "strikes_enabled": False,
        "calibration_done": False,
        # Pareamento remoto
        "paired": False,
        "pc_id": "",
        "user_id": "",
        # Sync remoto
        "remote_sync_enabled": True,
        "sync_interval_seconds": 30,
    }
    
    def __init__(self):
        self.app_data_dir = Path(os.environ.get("APPDATA", ".")) / "KidsPC"
        self.app_data_dir.mkdir(parents=True, exist_ok=True)
        self.config_file = self.app_data_dir / "config.json"
        self.key_file = self.app_data_dir / ".key"
        self._config = None
        self._fernet = None
        self._init_encryption()
        self.load()
    
    def _init_encryption(self):
        if not self.key_file.exists():
            key = Fernet.generate_key()
            self.key_file.write_bytes(key)
        key = self.key_file.read_bytes()
        self._fernet = Fernet(key)
    
    def _hash_senha(self, senha: str) -> str:
        salt = b'silencio_no_pc_salt'
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=480000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(senha.encode()))
        return key.decode().rstrip("=")  # strip padding to match Node.js base64url
    
    def load(self):
        if self.config_file.exists():
            try:
                encrypted_data = self.config_file.read_bytes()
                decrypted_data = self._fernet.decrypt(encrypted_data)
                self._config = json.loads(decrypted_data.decode())
                for key, value in self.DEFAULT_CONFIG.items():
                    if key not in self._config:
                        self._config[key] = value
            except Exception:
                self._config = self.DEFAULT_CONFIG.copy()
        else:
            self._config = self.DEFAULT_CONFIG.copy()
    
    def save(self):
        data = json.dumps(self._config).encode()
        encrypted_data = self._fernet.encrypt(data)
        self.config_file.write_bytes(encrypted_data)
    
    def get(self, key: str, default=None):
        return self._config.get(key, default)
    
    def set(self, key: str, value):
        self._config[key] = value
        self.save()
    
    def set_batch(self, updates: dict):
        """Apply multiple config updates with a single disk write."""
        for key, value in updates.items():
            self._config[key] = value
        self.save()
    
    def verificar_senha(self, senha: str) -> bool:
        stored = self._config.get("password_hash", "")
        if not stored:
            return False
        return stored == self._hash_senha(senha)
    
    def tem_senha(self) -> bool:
        return bool(self._config.get("password_hash"))
    
    @property
    def primeiro_uso(self) -> bool:
        return self._config.get("primeiro_uso", True)
    
    @primeiro_uso.setter
    def primeiro_uso(self, value: bool):
        self.set("primeiro_uso", value)
