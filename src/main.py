import sys
import os
from pathlib import Path

__version__ = "1.1.0"

sys.path.insert(0, str(Path(__file__).parent.parent))

from PyQt5.QtWidgets import QApplication, QMessageBox
from PyQt5.QtCore import QTimer, QObject, pyqtSignal

from src.config import Config
from src.logger import EventLogger
from src.audio_monitor import AudioMonitor
from src.strike_manager import StrikeManager, StrikeAction
from src.actions import Actions
from src.password_manager import criar_senha
from src.ui.noise_meter import NoiseMeterWidget
from src.ui.warning_popup import mostrar_aviso_abaixe_volume, mostrar_aviso_ultimo
from src.tray_app import TrayApp


class AudioSignals(QObject):
    """Sinais para comunicação thread-safe entre AudioMonitor e UI."""
    audio_update = pyqtSignal(float, float, float)  # nivel_db, media_db, pico_db


class SilencioNoPC:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.app.setQuitOnLastWindowClosed(False)
        self.app.setApplicationName("Silêncio no PC")
        
        self.config = Config()
        self.logger = EventLogger()
        self.actions = Actions(self.config, self.logger)
        self.strike_manager = StrikeManager(self.config, self.logger)
        
        self.audio_signals = AudioSignals()
        self.audio_signals.audio_update.connect(self._on_audio_update_safe)
        
        janela = self.config.get("janela_media_segundos", 10)
        self.audio_monitor = AudioMonitor(janela, self._on_audio_update_thread)
        
        self.noise_meter = NoiseMeterWidget(self.config)
        
        self.tray = TrayApp(
            self.config, self.logger, self.strike_manager,
            self.actions, self.audio_monitor, self.noise_meter
        )
        
        self._verificar_reinicio_pendente()
    
    def _verificar_reinicio_pendente(self):
        if self.actions.verificar_reinicio_pendente():
            self.strike_manager.marcar_reinicio_recente()
            self.logger.reinicio(0)
    
    def _on_audio_update_thread(self, nivel_db: float, media_db: float, pico_db: float):
        """Chamado da thread do AudioMonitor - emite sinal para thread principal."""
        self.audio_signals.audio_update.emit(nivel_db, media_db, pico_db)
    
    def _on_audio_update_safe(self, nivel_db: float, media_db: float, pico_db: float):
        """Chamado na thread principal via sinal Qt - seguro para UI."""
        try:
            self.noise_meter.atualizar_nivel(nivel_db)
            self.noise_meter.atualizar_strikes(self.strike_manager.get_strikes())
            
            acao = self.strike_manager.processar_barulho(nivel_db, media_db, pico_db)
            
            if acao == StrikeAction.POPUP_ABAIXE:
                self._mostrar_popup_abaixe()
            
            elif acao == StrikeAction.AUDIO_AVISO:
                self.actions.tocar_audio_volume_maximo()
            
            elif acao == StrikeAction.POPUP_ULTIMO_AVISO:
                self._mostrar_popup_ultimo()
            
            elif acao == StrikeAction.REINICIAR_PC:
                self.logger.reinicio(nivel_db)
                self.actions.reiniciar_pc(10)
            
            elif acao == StrikeAction.BLOQUEAR_INTERNET:
                horas = self.config.get("bloqueio_internet_horas", 2)
                self.logger.bloqueio_internet(horas, nivel_db)
                self.actions.bloquear_internet(horas)
        except Exception as e:
            print(f"Erro no processamento de áudio: {e}")
    
    def _mostrar_popup_abaixe(self):
        """Mostra popup de abaixe o volume de forma segura."""
        try:
            mostrar_aviso_abaixe_volume()
        except Exception as e:
            print(f"Erro ao mostrar popup: {e}")
    
    def _mostrar_popup_ultimo(self):
        """Mostra popup de último aviso de forma segura."""
        try:
            mostrar_aviso_ultimo()
        except Exception as e:
            print(f"Erro ao mostrar popup: {e}")
    
    def _primeiro_uso(self):
        msg = QMessageBox()
        msg.setWindowTitle("Bem-vindo ao Silêncio no PC!")
        msg.setText(
            "Este programa monitora o volume do ambiente e aplica punições "
            "progressivas quando o barulho ultrapassa os limites.\n\n"
            "Primeiro, vamos criar a senha dos pais."
        )
        msg.exec_()
        
        if not criar_senha(None, self.config):
            QMessageBox.warning(None, "Erro", "É necessário criar uma senha para continuar!")
            sys.exit(1)
        
        resposta = QMessageBox.question(
            None, "Calibração",
            "Deseja calibrar o ruído ambiente agora?\n\n"
            "Isso ajuda a ajustar os limites automaticamente.",
            QMessageBox.Yes | QMessageBox.No
        )
        
        if resposta == QMessageBox.Yes:
            from src.ui.calibration_dialog import CalibrationDialog
            dialog = CalibrationDialog(self.config, self.logger)
            dialog.exec_()
        
        self.config.primeiro_uso = False
    
    def run(self):
        if self.config.primeiro_uso:
            self._primeiro_uso()
        
        self.noise_meter.show()
        
        self.audio_monitor.start()
        
        return self.app.exec_()


def adicionar_ao_startup():
    """Adiciona o programa à inicialização do Windows."""
    try:
        import winreg
        
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        exe_path = sys.executable
        
        if getattr(sys, 'frozen', False):
            app_path = sys.executable
        else:
            app_path = f'"{sys.executable}" "{Path(__file__).resolve()}"'
        
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(key, "SilencioNoPC", 0, winreg.REG_SZ, app_path)
        winreg.CloseKey(key)
        
    except Exception as e:
        print(f"Erro ao adicionar ao startup: {e}")


def main():
    adicionar_ao_startup()
    
    app = SilencioNoPC()
    sys.exit(app.run())


if __name__ == "__main__":
    main()
