from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QLabel, QProgressBar, QPushButton, QMessageBox
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal
from PyQt5.QtGui import QFont

class CalibrationThread(QThread):
    progress = pyqtSignal(float, float)  # progresso, nivel_db
    finished_calibration = pyqtSignal(float)  # ruido_ambiente
    
    def __init__(self, audio_monitor):
        super().__init__()
        self.audio_monitor = audio_monitor
    
    def run(self):
        def callback(progresso, db):
            self.progress.emit(progresso, db)
        
        ruido = self.audio_monitor.calibrar(30, callback)
        self.finished_calibration.emit(ruido)


class CalibrationDialog(QDialog):
    def __init__(self, config, logger, parent=None):
        super().__init__(parent)
        self.config = config
        self.logger = logger
        self.setWindowTitle("🎤 Calibração")
        self.setFixedSize(400, 250)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        
        self._thread = None
        self._setup_ui()
    
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(20)
        layout.setContentsMargins(30, 30, 30, 30)
        
        self.label_titulo = QLabel("Calibração de Ruído Ambiente")
        self.label_titulo.setAlignment(Qt.AlignCenter)
        self.label_titulo.setFont(QFont("Segoe UI", 14, QFont.Bold))
        layout.addWidget(self.label_titulo)
        
        self.label_instrucao = QLabel(
            "Mantenha o ambiente em silêncio normal.\n"
            "O programa irá medir o ruído de fundo por 30 segundos."
        )
        self.label_instrucao.setAlignment(Qt.AlignCenter)
        self.label_instrucao.setWordWrap(True)
        layout.addWidget(self.label_instrucao)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setValue(0)
        layout.addWidget(self.progress_bar)
        
        self.label_db = QLabel("-- dB")
        self.label_db.setAlignment(Qt.AlignCenter)
        self.label_db.setFont(QFont("Segoe UI", 20, QFont.Bold))
        layout.addWidget(self.label_db)
        
        self.btn_iniciar = QPushButton("▶️ Iniciar Calibração")
        self.btn_iniciar.clicked.connect(self._iniciar_calibracao)
        layout.addWidget(self.btn_iniciar)
        
        self.btn_fechar = QPushButton("Fechar")
        self.btn_fechar.clicked.connect(self.reject)
        self.btn_fechar.setVisible(False)
        layout.addWidget(self.btn_fechar)
    
    def _iniciar_calibracao(self):
        self.btn_iniciar.setEnabled(False)
        self.btn_iniciar.setText("Calibrando...")
        
        from ..audio_monitor import AudioMonitor
        monitor = AudioMonitor()
        
        self._thread = CalibrationThread(monitor)
        self._thread.progress.connect(self._on_progress)
        self._thread.finished_calibration.connect(self._on_finished)
        self._thread.start()
    
    def _on_progress(self, progresso: float, db: float):
        self.progress_bar.setValue(int(progresso * 100))
        self.label_db.setText(f"{db:.1f} dB")
    
    def _on_finished(self, ruido_ambiente: float):
        self.config.set("ruido_ambiente_db", round(ruido_ambiente, 1))
        self.logger.calibracao(ruido_ambiente)
        
        self.label_instrucao.setText(
            f"✅ Calibração concluída!\n\n"
            f"Ruído ambiente detectado: {ruido_ambiente:.1f} dB\n"
            f"Os limites serão ajustados automaticamente."
        )
        self.btn_iniciar.setVisible(False)
        self.btn_fechar.setVisible(True)
        
        if self.parent() and hasattr(self.parent(), 'label_ruido_ambiente'):
            self.parent().label_ruido_ambiente.setText(f"Ruído ambiente atual: {ruido_ambiente:.1f} dB")
            if hasattr(self.parent(), '_atualizar_labels_offset'):
                self.parent()._atualizar_labels_offset()
        
        QMessageBox.information(
            self, "Calibração Concluída",
            f"Ruído ambiente: {ruido_ambiente:.1f} dB\n\n"
            f"Os limites de detecção foram ajustados automaticamente."
        )
    
    def closeEvent(self, event):
        if self._thread and self._thread.isRunning():
            self._thread.terminate()
            self._thread.wait()
        super().closeEvent(event)
