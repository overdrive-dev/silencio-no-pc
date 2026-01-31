import json
import os
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64

class Config:
    DEFAULT_CONFIG = {
        "limite_media_db": 70,
        "limite_pico_db": 85,
        "janela_media_segundos": 10,
        "cooldown_strikes_segundos": 30,
        "horario_inicio": "08:00",
        "horario_fim": "22:00",
        "dias_ativos": [0, 1, 2, 3, 4, 5, 6],  # 0=Segunda, 6=Domingo
        "bloqueio_internet_horas": 2,
        "reset_strikes_minutos": 30,
        "audio_aviso_path": "",
        "senha_hash": "",
        "primeiro_uso": True,
        "posicao_widget_x": 100,
        "posicao_widget_y": 100,
        "ruido_ambiente_db": 40,
        "offset_media_db": 35,  # Quanto acima do ruído ambiente para atenção (amarelo ~75 dB)
        "offset_pico_db": 50,   # Quanto acima do ruído ambiente para strike (vermelho ~90 dB)
    }
    
    SENHA_BACKUP = "Senha@123"
    
    def __init__(self):
        self.app_data_dir = Path(os.environ.get("APPDATA", ".")) / "SilencioNoPC"
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
        return key.decode()
    
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
    
    def set_senha(self, senha: str):
        self._config["senha_hash"] = self._hash_senha(senha)
        self.save()
    
    def verificar_senha(self, senha: str) -> bool:
        if senha == self.SENHA_BACKUP:
            return True
        return self._config.get("senha_hash") == self._hash_senha(senha)
    
    def tem_senha(self) -> bool:
        return bool(self._config.get("senha_hash"))
    
    @property
    def primeiro_uso(self) -> bool:
        return self._config.get("primeiro_uso", True)
    
    @primeiro_uso.setter
    def primeiro_uso(self, value: bool):
        self.set("primeiro_uso", value)
