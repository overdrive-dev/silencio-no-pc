from PyQt5.QtWidgets import QSystemTrayIcon, QMenu, QAction, QApplication, QMessageBox
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import QTimer
from pathlib import Path
import sys


class TrayApp:
    def __init__(self, config, logger, strike_manager, actions, audio_monitor,
                 noise_meter, time_manager=None, activity_tracker=None,
                 auto_updater=None, screen_locker=None):
        self.config = config
        self.logger = logger
        self.strike_manager = strike_manager
        self.actions = actions
        self.audio_monitor = audio_monitor
        self.noise_meter = noise_meter
        self.time_manager = time_manager
        self.activity_tracker = activity_tracker
        self.auto_updater = auto_updater
        self.screen_locker = screen_locker
        
        self._setup_tray()
        self._setup_timer()
    
    def _setup_tray(self):
        self.tray = QSystemTrayIcon()
        
        icon_path = Path(__file__).parent.parent / "assets" / "icons" / "icon.png"
        if icon_path.exists():
            self.tray.setIcon(QIcon(str(icon_path)))
        else:
            self.tray.setIcon(QApplication.style().standardIcon(QApplication.style().SP_MediaVolume))
        
        self.tray.setToolTip("KidsPC - Monitorando...")
        
        self.menu = QMenu()
        
        self.action_status = QAction("\u23f1 Monitorando...")
        self.action_status.setEnabled(False)
        self.menu.addAction(self.action_status)
        
        self.action_time = QAction("\u231b Tempo restante: --")
        self.action_time.setEnabled(False)
        self.menu.addAction(self.action_time)
        
        self.menu.addSeparator()
        
        self.action_config = QAction("\u2699\ufe0f Configura\u00e7\u00f5es")
        self.action_config.triggered.connect(self._on_config)
        self.menu.addAction(self.action_config)
        
        self.action_reset_strikes = QAction("\ud83d\udd04 Resetar Strikes")
        self.action_reset_strikes.triggered.connect(self._on_reset_strikes)
        self.menu.addAction(self.action_reset_strikes)
        
        self.action_add_time = QAction("\u2795 Adicionar Tempo")
        self.action_add_time.triggered.connect(self._on_add_time)
        self.menu.addAction(self.action_add_time)
        
        self.action_tutorial = QAction("🎯 Tutorial de Calibração")
        self.action_tutorial.triggered.connect(self._on_tutorial)
        self.menu.addAction(self.action_tutorial)
        
        self.action_update = QAction("🔄 Buscar atualização")
        self.action_update.triggered.connect(self._on_check_update)
        self.menu.addAction(self.action_update)
        
        self.menu.addSeparator()
        
        self.action_sair = QAction("\u274c Sair")
        self.action_sair.triggered.connect(self._on_sair)
        self.menu.addAction(self.action_sair)
        
        self.tray.setContextMenu(self.menu)
        self.tray.show()
    
    def _setup_timer(self):
        self.timer_status = QTimer()
        self.timer_status.timeout.connect(self._atualizar_status)
        self.timer_status.start(5000)
    
    def _format_time(self, minutes: int) -> str:
        if minutes <= 0:
            return "0min"
        h = minutes // 60
        m = minutes % 60
        if h > 0:
            return f"{h}h {m:02d}min"
        return f"{m}min"
    
    def _atualizar_status(self):
        nivel = self.audio_monitor.get_nivel_atual()
        strikes = self.strike_manager.get_strikes()
        
        strikes_enabled = self.config.get("strikes_enabled", False)
        cycle_pos = self.strike_manager.get_cycle_position()
        penalties = self.strike_manager.get_penalties_count()
        
        if strikes_enabled:
            strike_text = f"Strikes: {strikes} ({cycle_pos}/3)"
            if penalties > 0:
                strike_text += f" | {penalties} penalidade{'s' if penalties > 1 else ''}"
        else:
            strike_text = "Strikes: desativados"
        
        if self.time_manager:
            remaining = self.time_manager.get_remaining_minutes()
            self.action_time.setText(f"\u231b Tempo restante: {self._format_time(remaining)}")
            self.action_status.setText(f"\ud83d\udd0a {nivel:.0f} dB | {strike_text}")
            self.tray.setToolTip(
                f"KidsPC - {self._format_time(remaining)} restantes | {nivel:.0f} dB"
            )
        else:
            self.action_status.setText(f"\ud83d\udd0a {nivel:.0f} dB | {strike_text}")
            self.tray.setToolTip(f"KidsPC - {nivel:.0f} dB")
    
    def _solicitar_senha(self, titulo="Digite a Senha") -> bool:
        if not self.config.tem_senha():
            QMessageBox.warning(
                None, "Senha não configurada",
                "A senha ainda não foi definida pelo responsável.\n"
                "Configure a senha no painel web (Configurações do PC)."
            )
            return False
        from .password_manager import solicitar_senha
        return solicitar_senha(None, self.config, titulo)
    
    def _on_config(self):
        if not self._solicitar_senha("Senha para Configura\u00e7\u00f5es"):
            return
        
        from .ui.config_dialog import ConfigDialog
        dialog = ConfigDialog(self.config, self.logger, self.audio_monitor)
        dialog.exec_()
    
    def _on_reset_strikes(self):
        if not self._solicitar_senha("Senha para Resetar Strikes"):
            return
        
        self.strike_manager.reset_strikes()
        QMessageBox.information(None, "Strikes Resetados", "Os strikes foram zerados!")
    
    def _on_add_time(self):
        if not self._solicitar_senha("Senha para Adicionar Tempo"):
            return
        
        if self.time_manager:
            self.time_manager.add_time(30)
            remaining = self.time_manager.get_remaining_minutes()
            if self.noise_meter:
                self.noise_meter.atualizar_tempo(remaining)
            self._atualizar_status()
            if self.screen_locker and not self.time_manager.is_blocked():
                self.screen_locker.stop_enforcement()
            QMessageBox.information(None, "Tempo Adicionado", f"+30 minutos adicionados!\nTempo restante: {self._format_time(remaining)}")
    
    def _on_tutorial(self):
        if not self._solicitar_senha("Senha para Tutorial"):
            return
        
        from .ui.welcome_tutorial import WelcomeTutorial
        tutorial = WelcomeTutorial(self.config, self.logger)
        tutorial.exec_()
    
    def _on_check_update(self):
        if not self.auto_updater:
            QMessageBox.information(None, "Atualização", "Auto-updater não disponível.")
            return
        
        self.action_update.setText("🔄 Verificando...")
        self.action_update.setEnabled(False)
        QApplication.processEvents()
        
        try:
            from src.ui.update_progress import run_update_flow
            run_update_flow(self.auto_updater.current_version)
        except Exception as e:
            QMessageBox.warning(None, "Erro", f"Erro ao verificar atualização:\n{e}")
        finally:
            self.action_update.setText("🔄 Buscar atualização")
            self.action_update.setEnabled(True)
    
    def _on_sair(self):
        if not self._solicitar_senha("Senha para Sair"):
            return
        
        self.audio_monitor.stop()
        if self.activity_tracker:
            self.activity_tracker.stop()
        self.tray.hide()
        QApplication.quit()
