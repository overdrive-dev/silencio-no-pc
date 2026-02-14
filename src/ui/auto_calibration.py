from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QProgressBar,
    QPushButton, QMessageBox, QStackedWidget, QWidget
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt5.QtGui import QFont
import time
import statistics

from .config_dialog import AudioLevelWidget


class AutoCalibrationThread(QThread):
    """Thread que roda calibração automática."""

    progress = pyqtSignal(float, float, dict)  # progresso, nivel_atual, stats
    finished_calibration = pyqtSignal(dict)  # resultado final

    def __init__(self, audio_monitor, duracao_segundos=60):
        super().__init__()
        self.audio_monitor = audio_monitor
        self.duracao_segundos = duracao_segundos
        self._running = True

    def stop(self):
        self._running = False

    def run(self):
        import pyaudio
        import numpy as np

        amostras = []
        picos = []
        duracao_segundos = self.duracao_segundos

        CHUNK = 1024
        FORMAT = pyaudio.paInt16
        CHANNELS = 1
        RATE = 44100

        try:
            pa = pyaudio.PyAudio()
            stream = pa.open(
                format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK
            )

            inicio = time.time()
            ultimo_pico_time = 0
            janela_pico = []

            while self._running and (time.time() - inicio) < duracao_segundos:
                data = stream.read(CHUNK, exception_on_overflow=False)
                audio_data = np.frombuffer(data, dtype=np.int16).astype(np.float64)

                if len(audio_data) > 0:
                    rms = np.sqrt(np.mean(audio_data ** 2))
                    if rms > 0:
                        db = 20 * np.log10(rms / 32768.0) + 96
                        db = max(0, min(120, db))
                    else:
                        db = 0
                else:
                    db = 0

                amostras.append(db)
                janela_pico.append(db)

                if len(janela_pico) > 10:
                    janela_pico.pop(0)

                if len(janela_pico) >= 3:
                    media_janela = statistics.mean(janela_pico[:-1]) if len(janela_pico) > 1 else 0
                    if db > media_janela + 15 and (time.time() - ultimo_pico_time) > 2:
                        picos.append(db)
                        ultimo_pico_time = time.time()

                tempo_decorrido = time.time() - inicio
                progresso = tempo_decorrido / duracao_segundos

                stats = self._calcular_stats(amostras, picos)
                self.progress.emit(progresso, db, stats)

                time.sleep(0.1)

            stream.stop_stream()
            stream.close()
            pa.terminate()

            resultado = self._calcular_resultado_final(amostras, picos)
            self.finished_calibration.emit(resultado)

        except Exception as e:
            print(f"Erro na calibração automática: {e}")
            self.finished_calibration.emit({
                "erro": str(e),
                "ruido_ambiente": 40,
                "limite_atencao": 75,
                "limite_pico": 90
            })

    def _calcular_stats(self, amostras, picos):
        if not amostras:
            return {}
        return {
            "amostras": len(amostras),
            "media": statistics.mean(amostras),
            "minimo": min(amostras),
            "maximo": max(amostras),
            "desvio": statistics.stdev(amostras) if len(amostras) > 1 else 0,
            "picos_detectados": len(picos),
            "media_picos": statistics.mean(picos) if picos else 0,
        }

    def _calcular_resultado_final(self, amostras, picos):
        if not amostras:
            return {
                "ruido_ambiente": 40,
                "limite_atencao": 75,
                "limite_pico": 90
            }

        ruido_ambiente = statistics.median(amostras)
        percentil_75 = sorted(amostras)[int(len(amostras) * 0.75)]
        percentil_95 = sorted(amostras)[int(len(amostras) * 0.95)]

        if picos:
            media_picos = statistics.mean(picos)
            limite_pico = min(media_picos - 5, percentil_95 + 10)
        else:
            limite_pico = percentil_95 + 15

        limite_atencao = ruido_ambiente + (limite_pico - ruido_ambiente) * 0.6
        limite_atencao = max(limite_atencao, ruido_ambiente + 20)
        limite_pico = max(limite_pico, limite_atencao + 10)

        return {
            "ruido_ambiente": round(ruido_ambiente, 1),
            "limite_atencao": round(limite_atencao, 1),
            "limite_pico": round(limite_pico, 1),
            "stats": {
                "total_amostras": len(amostras),
                "picos_detectados": len(picos),
                "media_geral": round(statistics.mean(amostras), 1),
                "maximo_detectado": round(max(amostras), 1),
            }
        }


class AutoCalibrationDialog(QDialog):
    """Diálogo de calibração automática com visualização realtime e ajuste manual."""

    DURACAO = 60  # 1 minuto

    def __init__(self, config, logger, parent=None, auto_start=False):
        super().__init__(parent)
        self.config = config
        self.logger = logger
        self._auto_start = auto_start
        self.setWindowTitle("🎯 Calibração Automática")
        self.setFixedSize(540, 500)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)

        self._thread = None
        self._resultado = None
        self._poll_timer = None
        self._setup_ui()

        if auto_start:
            QTimer.singleShot(300, self._iniciar_calibracao)

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(8)
        layout.setContentsMargins(20, 16, 20, 16)

        self.label_titulo = QLabel("Calibração Automática")
        self.label_titulo.setAlignment(Qt.AlignCenter)
        self.label_titulo.setFont(QFont("Segoe UI", 15, QFont.Bold))
        layout.addWidget(self.label_titulo)

        self.label_instrucao = QLabel(
            "Use o computador normalmente por 1 minuto.\n"
            "O sistema irá aprender os níveis de som do ambiente."
        )
        self.label_instrucao.setAlignment(Qt.AlignCenter)
        self.label_instrucao.setWordWrap(True)
        self.label_instrucao.setStyleSheet("color: #666; font-size: 11px;")
        layout.addWidget(self.label_instrucao)

        # Audio visualization (reuses the same widget from config_dialog)
        atencao = self.config.get("volume_atencao_db", 70)
        strike = self.config.get("volume_grito_db", 85)
        self.audio_widget = AudioLevelWidget(atencao, strike)
        self.audio_widget.setMinimumSize(480, 240)
        # Disable dragging during calibration
        self.audio_widget.setMouseTracking(False)
        layout.addWidget(self.audio_widget, 1)

        # Progress row
        progress_row = QHBoxLayout()
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setValue(0)
        self.progress_bar.setFixedHeight(18)
        self.progress_bar.setStyleSheet(
            "QProgressBar { border: 1px solid #ccc; border-radius: 4px; text-align: center; font-size: 10px; }"
            "QProgressBar::chunk { background: qlineargradient(x1:0,y1:0,x2:1,y2:0, stop:0 #4f46e5, stop:1 #7c3aed); border-radius: 3px; }"
        )
        progress_row.addWidget(self.progress_bar, 1)

        self.label_tempo = QLabel("1:00")
        self.label_tempo.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.label_tempo.setFixedWidth(50)
        self.label_tempo.setAlignment(Qt.AlignCenter)
        progress_row.addWidget(self.label_tempo)
        layout.addLayout(progress_row)

        # Buttons
        btn_layout = QHBoxLayout()

        self.btn_iniciar = QPushButton("▶  Iniciar Calibração")
        self.btn_iniciar.clicked.connect(self._iniciar_calibracao)
        self.btn_iniciar.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.btn_iniciar.setFixedHeight(38)
        self.btn_iniciar.setStyleSheet(
            "background-color: #059669; color: white; border-radius: 6px; padding: 0 20px;"
        )
        btn_layout.addWidget(self.btn_iniciar)

        self.btn_cancelar = QPushButton("Cancelar")
        self.btn_cancelar.clicked.connect(self._cancelar)
        self.btn_cancelar.setFixedHeight(38)
        btn_layout.addWidget(self.btn_cancelar)

        layout.addLayout(btn_layout)

        self.btn_aplicar = QPushButton("✅  Aplicar Configurações")
        self.btn_aplicar.clicked.connect(self._aplicar_resultado)
        self.btn_aplicar.setVisible(False)
        self.btn_aplicar.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.btn_aplicar.setFixedHeight(40)
        self.btn_aplicar.setStyleSheet(
            "background-color: #4f46e5; color: white; border-radius: 6px;"
        )
        layout.addWidget(self.btn_aplicar)

        if self._auto_start:
            self.btn_iniciar.setVisible(False)

    def _iniciar_calibracao(self):
        self.btn_iniciar.setEnabled(False)
        self.btn_iniciar.setText("Calibrando...")
        self.btn_iniciar.setStyleSheet(
            "background-color: #6b7280; color: white; border-radius: 6px; padding: 0 20px;"
        )

        from ..audio_monitor import AudioMonitor
        monitor = AudioMonitor()

        self._thread = AutoCalibrationThread(monitor, duracao_segundos=self.DURACAO)
        self._thread.progress.connect(self._on_progress)
        self._thread.finished_calibration.connect(self._on_finished)
        self._thread.start()

    def _on_progress(self, progresso: float, nivel_db: float, stats: dict):
        self.progress_bar.setValue(int(progresso * 100))
        self.audio_widget.push_sample(nivel_db)

        total_seg = (1 - progresso) * self.DURACAO
        mins = int(total_seg) // 60
        secs = int(total_seg) % 60
        self.label_tempo.setText(f"{mins}:{secs:02d}")

    def _on_finished(self, resultado: dict):
        self._resultado = resultado

        if "erro" in resultado:
            QMessageBox.warning(self, "Erro", f"Erro na calibração: {resultado['erro']}")
            self.btn_iniciar.setEnabled(True)
            self.btn_iniciar.setText("▶  Tentar Novamente")
            self.btn_iniciar.setStyleSheet(
                "background-color: #059669; color: white; border-radius: 6px; padding: 0 20px;"
            )
            return

        # Set suggested thresholds on the widget
        self.audio_widget.atencao_db = resultado["limite_atencao"]
        self.audio_widget.strike_db = resultado["limite_pico"]

        # Enable dragging for manual adjustment
        self.audio_widget.setMouseTracking(True)

        # Start polling audio monitor for continued realtime display
        self._start_live_polling()

        self.label_titulo.setText("✅ Ajuste os Limites")
        self.label_instrucao.setText(
            "Calibração concluída! Arraste as linhas para ajustar:\n"
            "⚠ Atenção (amarela) = aviso visual  |  🔴 Strike (vermelha) = gera strike"
        )
        self.progress_bar.setValue(100)
        self.label_tempo.setText("✓")

        self.btn_iniciar.setVisible(False)
        self.btn_aplicar.setVisible(True)

    def _start_live_polling(self):
        """Continua mostrando áudio ao vivo após calibração para ajuste visual."""
        from ..audio_monitor import AudioMonitor
        self._live_monitor = AudioMonitor()
        self._live_monitor.start()
        self._poll_timer = QTimer(self)
        self._poll_timer.timeout.connect(self._poll_live)
        self._poll_timer.start(100)

    def _poll_live(self):
        if hasattr(self, '_live_monitor'):
            db = self._live_monitor.get_nivel_atual()
            self.audio_widget.push_sample(db)

    def _aplicar_resultado(self):
        if not self._resultado:
            return

        atencao = int(self.audio_widget.atencao_db)
        strike = int(self.audio_widget.strike_db)
        ruido = self._resultado["ruido_ambiente"]

        self.config.set("ruido_ambiente_db", ruido)
        self.config.set("volume_atencao_db", atencao)
        self.config.set("volume_grito_db", strike)
        self.config.set("offset_media_db", int(atencao - ruido))
        self.config.set("offset_pico_db", int(strike - ruido))

        self.logger.calibracao(ruido)
        self.accept()

    def _cancelar(self):
        if self._thread and self._thread.isRunning():
            self._thread.stop()
            self._thread.wait(2000)
        self._stop_live()
        self.reject()

    def _stop_live(self):
        if self._poll_timer:
            self._poll_timer.stop()
        if hasattr(self, '_live_monitor'):
            self._live_monitor.stop()

    def closeEvent(self, event):
        self._cancelar()
        super().closeEvent(event)
