from PyQt5.QtWidgets import QSystemTrayIcon, QMenu, QAction, QApplication, QMessageBox
from PyQt5.QtGui import QIcon
from PyQt5.QtCore import QTimer
from pathlib import Path
import sys

class TrayApp:
    def __init__(self, config, logger, strike_manager, actions, audio_monitor, noise_meter):
        self.config = config
        self.logger = logger
        self.strike_manager = strike_manager
        self.actions = actions
        self.audio_monitor = audio_monitor
        self.noise_meter = noise_meter
        
        self._setup_tray()
        self._setup_timer()
    
    def _setup_tray(self):
        self.tray = QSystemTrayIcon()
        
        icon_path = Path(__file__).parent.parent / "assets" / "icons" / "icon.png"
        if icon_path.exists():
            self.tray.setIcon(QIcon(str(icon_path)))
        else:
            self.tray.setIcon(QApplication.style().standardIcon(QApplication.style().SP_MediaVolume))
        
        self.tray.setToolTip("Silêncio no PC - Monitorando...")
        
        self.menu = QMenu()
        
        self.action_status = QAction("🔊 Monitorando...")
        self.action_status.setEnabled(False)
        self.menu.addAction(self.action_status)
        
        self.menu.addSeparator()
        
        self.action_config = QAction("⚙️ Configurações")
        self.action_config.triggered.connect(self._on_config)
        self.menu.addAction(self.action_config)
        
        self.action_reset_strikes = QAction("🔄 Resetar Strikes")
        self.action_reset_strikes.triggered.connect(self._on_reset_strikes)
        self.menu.addAction(self.action_reset_strikes)
        
        self.menu.addSeparator()
        
        self.action_sair = QAction("❌ Sair")
        self.action_sair.triggered.connect(self._on_sair)
        self.menu.addAction(self.action_sair)
        
        self.tray.setContextMenu(self.menu)
        self.tray.show()
    
    def _setup_timer(self):
        self.timer_status = QTimer()
        self.timer_status.timeout.connect(self._atualizar_status)
        self.timer_status.start(1000)
    
    def _atualizar_status(self):
        nivel = self.audio_monitor.get_nivel_atual()
        strikes = self.strike_manager.get_strikes()
        self.action_status.setText(f"🔊 {nivel:.0f} dB | Strikes: {strikes}/4")
        self.tray.setToolTip(f"Silêncio no PC - {nivel:.0f} dB | Strikes: {strikes}/4")
    
    def _solicitar_senha(self, titulo="Digite a Senha") -> bool:
        from .password_manager import solicitar_senha
        return solicitar_senha(None, self.config, titulo)
    
    def _on_config(self):
        if not self._solicitar_senha("Senha para Configurações"):
            QMessageBox.warning(None, "Acesso Negado", "Senha incorreta!")
            return
        
        from .ui.config_dialog import ConfigDialog
        dialog = ConfigDialog(self.config, self.logger, self.audio_monitor)
        dialog.exec_()
    
    def _on_reset_strikes(self):
        if not self._solicitar_senha("Senha para Resetar Strikes"):
            QMessageBox.warning(None, "Acesso Negado", "Senha incorreta!")
            return
        
        self.strike_manager.reset_strikes()
        QMessageBox.information(None, "Strikes Resetados", "Os strikes foram zerados!")
    
    def _on_sair(self):
        if not self._solicitar_senha("Senha para Sair"):
            QMessageBox.warning(None, "Acesso Negado", "Senha incorreta!")
            return
        
        self.audio_monitor.stop()
        self.tray.hide()
        QApplication.quit()
