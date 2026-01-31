import os
import subprocess
import ctypes
from pathlib import Path
from typing import Optional
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

class Actions:
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._internet_bloqueada = False
    
    def _get_assets_dir(self):
        """Retorna o diretório de assets, funciona tanto em dev quanto empacotado."""
        import sys
        if getattr(sys, 'frozen', False):
            base_path = Path(sys._MEIPASS)
        else:
            base_path = Path(__file__).parent.parent
        return base_path / "assets"
    
    def tocar_audio_volume_maximo(self, audio_path: Optional[str] = None):
        """Toca o áudio de aviso no volume máximo. Suporta .wav, .mp3, .ogg"""
        try:
            self._set_volume_maximo()
            
            caminho = None
            
            if audio_path and Path(audio_path).exists():
                caminho = audio_path
            else:
                caminho = self.config.get("audio_aviso_path", "")
                if not caminho or not Path(caminho).exists():
                    assets_dir = self._get_assets_dir() / "sounds"
                    print(f"Procurando áudio em: {assets_dir}")
                    if assets_dir.exists():
                        for ext in [".ogg", ".wav", ".mp3"]:
                            for f in assets_dir.glob(f"*{ext}"):
                                caminho = str(f)
                                print(f"Áudio encontrado: {caminho}")
                                break
                            if caminho:
                                break
            
            if not caminho or not Path(caminho).exists():
                print("Nenhum áudio encontrado, usando beep do sistema")
                import winsound
                winsound.MessageBeep(winsound.MB_ICONEXCLAMATION)
                return
            
            import pygame
            if not pygame.mixer.get_init():
                pygame.mixer.init()
            pygame.mixer.music.load(caminho)
            pygame.mixer.music.set_volume(1.0)
            pygame.mixer.music.play()
            print(f"Tocando áudio: {caminho}")
            
        except Exception as e:
            print(f"Erro ao tocar áudio: {e}")
            import traceback
            traceback.print_exc()
    
    def _set_volume_maximo(self):
        """Define o volume do sistema para 100%."""
        try:
            devices = AudioUtilities.GetSpeakers()
            interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
            volume = cast(interface, POINTER(IAudioEndpointVolume))
            volume.SetMasterVolumeLevelScalar(1.0, None)
            volume.SetMute(0, None)
        except Exception as e:
            print(f"Erro ao definir volume: {e}")
    
    def reiniciar_pc(self, delay_segundos: int = 5):
        """Reinicia o PC após um delay."""
        try:
            self._marcar_reinicio_pendente()
            subprocess.run(
                ["shutdown", "/r", "/t", str(delay_segundos), "/c", "Silêncio no PC: Reiniciando por excesso de barulho"],
                check=True
            )
        except Exception as e:
            print(f"Erro ao reiniciar PC: {e}")
    
    def _marcar_reinicio_pendente(self):
        """Marca que houve um reinício forçado para detectar reincidência."""
        flag_file = Path(os.environ.get("APPDATA", ".")) / "SilencioNoPC" / ".reinicio_pendente"
        flag_file.write_text("1")
    
    def verificar_reinicio_pendente(self) -> bool:
        """Verifica se o programa está iniciando após um reinício forçado."""
        flag_file = Path(os.environ.get("APPDATA", ".")) / "SilencioNoPC" / ".reinicio_pendente"
        if flag_file.exists():
            flag_file.unlink()
            return True
        return False
    
    def bloquear_internet(self, duracao_horas: float):
        """Bloqueia a internet desabilitando adaptadores de rede."""
        try:
            self.logger.bloqueio_internet(duracao_horas, 0)
            
            subprocess.run(
                ["netsh", "interface", "set", "interface", "Wi-Fi", "disable"],
                check=False, capture_output=True
            )
            subprocess.run(
                ["netsh", "interface", "set", "interface", "Ethernet", "disable"],
                check=False, capture_output=True
            )
            
            self._internet_bloqueada = True
            
        except Exception as e:
            print(f"Erro ao bloquear internet: {e}")
    
    def desbloquear_internet(self):
        """Reativa os adaptadores de rede."""
        try:
            subprocess.run(
                ["netsh", "interface", "set", "interface", "Wi-Fi", "enable"],
                check=False, capture_output=True
            )
            subprocess.run(
                ["netsh", "interface", "set", "interface", "Ethernet", "enable"],
                check=False, capture_output=True
            )
            self._internet_bloqueada = False
        except Exception as e:
            print(f"Erro ao desbloquear internet: {e}")
    
    def internet_bloqueada(self) -> bool:
        return self._internet_bloqueada
    
    def cancelar_reinicio(self):
        """Cancela um reinício agendado."""
        try:
            subprocess.run(["shutdown", "/a"], check=False, capture_output=True)
        except Exception:
            pass
