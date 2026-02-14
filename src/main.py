import sys
import os
import atexit
import signal
from pathlib import Path

__version__ = "2.0.6"

sys.path.insert(0, str(Path(__file__).parent.parent))

from PyQt5.QtWidgets import QApplication, QMessageBox
from PyQt5.QtCore import QTimer, QObject, pyqtSignal

from src.config import Config
from src.logger import EventLogger
from src.audio_monitor import AudioMonitor
from src.strike_manager import StrikeManager, StrikeAction
from src.actions import Actions
from src.activity_tracker import ActivityTracker
from src.time_manager import TimeManager, TimeAction
from src.screen_locker import ScreenLocker
from src.ui.noise_meter import NoiseMeterWidget
from src.ui.warning_popup import mostrar_aviso_leve, mostrar_aviso_forte
from src.ui.time_warning_popup import TimeWarningPopup, TimePenaltyPopup, TimeBlockedPopup
from src.tray_app import TrayApp
from src.remote_sync import RemoteSync
from src.auto_updater import AutoUpdater
from src.app_blocker import AppBlocker
from src.site_blocker import SiteBlocker


class AudioSignals(QObject):
    """Sinais para comunicação thread-safe entre AudioMonitor e UI."""
    audio_update = pyqtSignal(float, float, float)
    command_executed = pyqtSignal(str, dict)


class KidsPC:
    def __init__(self):
        self.app = QApplication(sys.argv)
        self.app.setQuitOnLastWindowClosed(False)
        self.app.setApplicationName("KidsPC")
        
        self.config = Config()
        self.config.set("app_version", __version__)
        self.logger = EventLogger()
        self.actions = Actions(self.config, self.logger)
        self.strike_manager = StrikeManager(self.config, self.logger)
        
        self.activity_tracker = ActivityTracker(
            idle_timeout_seconds=self.config.get("idle_timeout_seconds", 300),
            on_session_change=self._on_session_change,
        )
        
        self.time_manager = TimeManager(self.config, self.activity_tracker)
        self.screen_locker = ScreenLocker()
        self.auto_updater = AutoUpdater(current_version=__version__)
        self.app_blocker = AppBlocker(self.config, self.logger)
        self.site_blocker = SiteBlocker(self.config, self.logger)
        
        self.audio_signals = AudioSignals()
        self.audio_signals.audio_update.connect(self._on_audio_update_safe)
        self.audio_signals.command_executed.connect(self._on_command_executed)
        
        self.audio_monitor = AudioMonitor(callback=self._on_audio_update_thread)
        
        self.noise_meter = None
        self.tray = None
        self.remote_sync = None
        
        self._setup_shutdown_hooks()
    
    def _setup_time_check_timer(self):
        """Timer que verifica limites de tempo a cada 30s."""
        self.time_check_timer = QTimer()
        self.time_check_timer.timeout.connect(self._check_time)
        self.time_check_timer.start(30000)
    
    def _setup_shutdown_hooks(self):
        """Registra hooks de encerramento gracioso."""
        atexit.register(self._on_graceful_shutdown)
        signal.signal(signal.SIGTERM, self._signal_handler)
        signal.signal(signal.SIGINT, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        self._on_graceful_shutdown()
        sys.exit(0)
    
    def _on_graceful_shutdown(self):
        """Chamado quando o programa encerra normalmente."""
        try:
            self.activity_tracker.stop()
            self.site_blocker.cleanup()
            self.logger.app_encerrado()
            if self.remote_sync:
                self.remote_sync.send_shutdown_event("graceful")
                self.remote_sync.stop()
        except Exception:
            pass
    
    def _on_session_change(self, event_type: str, timestamp):
        """Callback do ActivityTracker quando sessão inicia/encerra."""
        if event_type == "started":
            self.logger.sessao_iniciada()
        elif event_type == "ended":
            pass
    
    def _check_time(self):
        """Verifica limites de tempo periodicamente."""
        try:
            remaining = self.time_manager.get_remaining_minutes()
            if self.noise_meter:
                self.noise_meter.atualizar_tempo(remaining)
            
            action = self.time_manager.check()
            
            if action == TimeAction.WARNING_15MIN:
                popup = TimeWarningPopup(15)
                popup.exec_()
            
            elif action == TimeAction.WARNING_5MIN:
                popup = TimeWarningPopup(5)
                popup.exec_()
            
            elif action == TimeAction.BLOCK:
                self.logger.uso_bloqueado("Limite di\u00e1rio atingido")
                popup = TimeBlockedPopup()
                popup.exec_()
                self.screen_locker.start_enforcement()
            
            elif action == TimeAction.OUTSIDE_HOURS:
                self.logger.uso_bloqueado("Fora do hor\u00e1rio permitido")
                popup = TimeBlockedPopup()
                popup.exec_()
                self.screen_locker.start_enforcement()
            
            if self.time_manager.is_blocked() and not self.screen_locker.is_enforcing():
                self.screen_locker.start_enforcement()
            elif not self.time_manager.is_blocked() and self.screen_locker.is_enforcing():
                self.screen_locker.stop_enforcement()
                
        except Exception as e:
            print(f"Erro no check de tempo: {e}")
    
    def _on_audio_update_thread(self, nivel_db: float, media_db: float, pico_db: float):
        """Chamado da thread do AudioMonitor - emite sinal para thread principal."""
        self.audio_signals.audio_update.emit(nivel_db, media_db, pico_db)
    
    def _on_audio_update_safe(self, nivel_db: float, media_db: float, pico_db: float):
        """Chamado na thread principal via sinal Qt - seguro para UI."""
        if not self.noise_meter:
            return
        try:
            self.noise_meter.atualizar_nivel(nivel_db)
            self.noise_meter.atualizar_strikes(self.strike_manager.get_strikes())
            
            acao = self.strike_manager.processar_barulho(nivel_db)
            
            if acao == StrikeAction.POPUP_AVISO:
                try:
                    mostrar_aviso_leve()
                except Exception as e:
                    print(f"Erro ao mostrar popup: {e}")
            
            elif acao == StrikeAction.POPUP_FORTE:
                try:
                    mostrar_aviso_forte()
                except Exception as e:
                    print(f"Erro ao mostrar popup: {e}")
            
            elif acao == StrikeAction.PENALIDADE_TEMPO:
                penalty = self.strike_manager.get_penalty_minutes()
                self.activity_tracker.apply_time_penalty(penalty)
                self.logger.penalidade_tempo(penalty, nivel_db)
                try:
                    popup = TimePenaltyPopup(penalty)
                    popup.exec_()
                except Exception as e:
                    print(f"Erro ao mostrar popup penalidade: {e}")
                self._check_time()
                
        except Exception as e:
            print(f"Erro no processamento de áudio: {e}")
    
    def _primeiro_uso(self):
        from src.ui.welcome_tutorial import WelcomeTutorial
        tutorial = WelcomeTutorial(self.config, self.logger)
        tutorial.exec_()
        
        self.config.primeiro_uso = False
    
    def _check_pairing(self):
        """Verifica se o PC está pareado. Se não, mostra diálogo. App fecha se não parear."""
        if not self.config.get("paired", False):
            from src.pairing import PairingDialog
            dialog = PairingDialog(self.config)
            dialog.exec_()
            if not dialog.is_paired():
                sys.exit(0)
    
    def _setup_app_blocker_timer(self):
        """Timer que verifica apps bloqueados a cada 3s."""
        self.app_blocker_timer = QTimer()
        self.app_blocker_timer.timeout.connect(self.app_blocker.check)
        self.app_blocker_timer.start(3000)

    def _start_remote_sync(self):
        """Inicia sync remoto se pareado."""
        if self.config.get("paired", False):
            self.remote_sync = RemoteSync(
                config=self.config,
                logger=self.logger,
                activity_tracker=self.activity_tracker,
                time_manager=self.time_manager,
                strike_manager=self.strike_manager,
                screen_locker=self.screen_locker,
                actions=self.actions,
                app_blocker=self.app_blocker,
                site_blocker=self.site_blocker,
                on_command=self._on_remote_command,
            )
            self.remote_sync.start()
    
    def _on_remote_command(self, command: str, payload: dict):
        """Callback do RemoteSync (thread separada) — emite sinal Qt."""
        self.audio_signals.command_executed.emit(command, payload or {})

    def _on_command_executed(self, command: str, payload: dict):
        """Slot Qt (main thread) — atualiza UI imediatamente após comando remoto."""
        self._check_time()

    def _init_ui(self):
        """Cria widgets de UI após o pairing estar completo."""
        self.noise_meter = NoiseMeterWidget(self.config)
        
        self.tray = TrayApp(
            self.config, self.logger, self.strike_manager,
            self.actions, self.audio_monitor, self.noise_meter,
            time_manager=self.time_manager,
            activity_tracker=self.activity_tracker,
            auto_updater=self.auto_updater,
            screen_locker=self.screen_locker,
        )
        
        self._setup_time_check_timer()
    
    def run(self):
        if self.config.primeiro_uso:
            self._primeiro_uso()
        
        self._check_pairing()
        
        self._init_ui()
        
        self.logger.app_iniciado()
        
        self.noise_meter.show()
        
        self.audio_monitor.start()
        self.activity_tracker.start()
        self._start_remote_sync()
        self._setup_app_blocker_timer()
        
        remaining = self.time_manager.get_remaining_minutes()
        self.noise_meter.atualizar_tempo(remaining)
        
        return self.app.exec_()


def adicionar_ao_startup():
    """Adiciona o programa \u00e0 inicializa\u00e7\u00e3o do Windows."""
    try:
        import winreg
        
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        
        if getattr(sys, 'frozen', False):
            app_path = sys.executable
        else:
            app_path = f'"{sys.executable}" "{Path(__file__).resolve()}"'
        
        key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
        winreg.SetValueEx(key, "KidsPC", 0, winreg.REG_SZ, app_path)
        winreg.CloseKey(key)
        
    except Exception as e:
        print(f"Erro ao adicionar ao startup: {e}")


def main():
    adicionar_ao_startup()
    
    app = KidsPC()
    sys.exit(app.run())


if __name__ == "__main__":
    main()
