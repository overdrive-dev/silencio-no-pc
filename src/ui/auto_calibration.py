from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QProgressBar, 
    QPushButton, QMessageBox, QGroupBox
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt5.QtGui import QFont
import time
import statistics

class AutoCalibrationThread(QThread):
    """Thread que roda calibração automática por X minutos."""
    
    progress = pyqtSignal(float, float, dict)  # progresso, nivel_atual, stats
    finished_calibration = pyqtSignal(dict)  # resultado final
    
    def __init__(self, audio_monitor, duracao_segundos=30):
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
    """Diálogo de calibração automática de 30 segundos."""
    
    def __init__(self, config, logger, parent=None):
        super().__init__(parent)
        self.config = config
        self.logger = logger
        self.setWindowTitle("🎯 Calibração Automática")
        self.setFixedSize(500, 400)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        
        self._thread = None
        self._resultado = None
        self._setup_ui()
    
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(15)
        layout.setContentsMargins(25, 25, 25, 25)
        
        self.label_titulo = QLabel("Calibração Automática Inteligente")
        self.label_titulo.setAlignment(Qt.AlignCenter)
        self.label_titulo.setFont(QFont("Segoe UI", 16, QFont.Bold))
        layout.addWidget(self.label_titulo)
        
        self.label_instrucao = QLabel(
            "O programa irá monitorar o ambiente por 30 segundos.\n\n"
            "Use o computador normalmente durante a calibração.\n"
            "O sistema irá aprender o que é volume normal\n"
            "e o que são picos/gritos para definir os limites ideais."
        )
        self.label_instrucao.setAlignment(Qt.AlignCenter)
        self.label_instrucao.setWordWrap(True)
        layout.addWidget(self.label_instrucao)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setValue(0)
        self.progress_bar.setFixedHeight(25)
        layout.addWidget(self.progress_bar)
        
        self.label_tempo = QLabel("Tempo restante: 0:30")
        self.label_tempo.setAlignment(Qt.AlignCenter)
        self.label_tempo.setFont(QFont("Segoe UI", 12))
        layout.addWidget(self.label_tempo)
        
        grupo_stats = QGroupBox("Estatísticas em Tempo Real")
        stats_layout = QVBoxLayout(grupo_stats)
        
        self.label_nivel_atual = QLabel("Nível atual: -- dB")
        self.label_nivel_atual.setFont(QFont("Segoe UI", 11))
        stats_layout.addWidget(self.label_nivel_atual)
        
        self.label_media = QLabel("Média: -- dB")
        stats_layout.addWidget(self.label_media)
        
        self.label_picos = QLabel("Picos detectados: 0")
        stats_layout.addWidget(self.label_picos)
        
        self.label_maximo = QLabel("Máximo: -- dB")
        stats_layout.addWidget(self.label_maximo)
        
        layout.addWidget(grupo_stats)
        
        btn_layout = QHBoxLayout()
        
        self.btn_iniciar = QPushButton("▶️ Iniciar Calibração (30s)")
        self.btn_iniciar.clicked.connect(self._iniciar_calibracao)
        self.btn_iniciar.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.btn_iniciar.setFixedHeight(40)
        btn_layout.addWidget(self.btn_iniciar)
        
        self.btn_cancelar = QPushButton("Cancelar")
        self.btn_cancelar.clicked.connect(self._cancelar)
        btn_layout.addWidget(self.btn_cancelar)
        
        layout.addLayout(btn_layout)
        
        self.btn_aplicar = QPushButton("✅ Aplicar Configurações")
        self.btn_aplicar.clicked.connect(self._aplicar_resultado)
        self.btn_aplicar.setVisible(False)
        self.btn_aplicar.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.btn_aplicar.setFixedHeight(40)
        self.btn_aplicar.setStyleSheet("background-color: #4CAF50; color: white;")
        layout.addWidget(self.btn_aplicar)
    
    def _iniciar_calibracao(self):
        self.btn_iniciar.setEnabled(False)
        self.btn_iniciar.setText("Calibrando...")
        
        from ..audio_monitor import AudioMonitor
        monitor = AudioMonitor()
        
        self._thread = AutoCalibrationThread(monitor, duracao_segundos=30)
        self._thread.progress.connect(self._on_progress)
        self._thread.finished_calibration.connect(self._on_finished)
        self._thread.start()
    
    def _on_progress(self, progresso: float, nivel_db: float, stats: dict):
        self.progress_bar.setValue(int(progresso * 100))
        
        total_seg = (1 - progresso) * self._thread.duracao_segundos
        segundos_restantes = int(total_seg)
        self.label_tempo.setText(f"Tempo restante: 0:{segundos_restantes:02d}")
        
        if nivel_db < 60:
            cor = "#4CAF50"
        elif nivel_db < 80:
            cor = "#FFC107"
        else:
            cor = "#f44336"
        
        self.label_nivel_atual.setText(f"Nível atual: <span style='color:{cor}'>{nivel_db:.0f} dB</span>")
        
        if stats:
            self.label_media.setText(f"Média: {stats.get('media', 0):.1f} dB")
            self.label_picos.setText(f"Picos detectados: {stats.get('picos_detectados', 0)}")
            self.label_maximo.setText(f"Máximo: {stats.get('maximo', 0):.1f} dB")
    
    def _on_finished(self, resultado: dict):
        self._resultado = resultado
        
        if "erro" in resultado:
            QMessageBox.warning(self, "Erro", f"Erro na calibração: {resultado['erro']}")
            self.btn_iniciar.setEnabled(True)
            self.btn_iniciar.setText("▶️ Tentar Novamente")
            return
        
        self.label_instrucao.setText(
            f"✅ Calibração concluída!\n\n"
            f"📊 Resultados:\n"
            f"• Ruído ambiente: {resultado['ruido_ambiente']:.1f} dB\n"
            f"• Limite atenção sugerido: {resultado['limite_atencao']:.1f} dB\n"
            f"• Limite grito sugerido: {resultado['limite_pico']:.1f} dB\n\n"
            f"Amostras analisadas: {resultado['stats']['total_amostras']}\n"
            f"Picos detectados: {resultado['stats']['picos_detectados']}"
        )
        
        self.btn_iniciar.setVisible(False)
        self.btn_aplicar.setVisible(True)
        self.label_tempo.setText("Calibração concluída!")
    
    def _aplicar_resultado(self):
        if not self._resultado:
            return
        
        ruido = self._resultado["ruido_ambiente"]
        limite_atencao = self._resultado["limite_atencao"]
        limite_pico = self._resultado["limite_pico"]
        
        self.config.set("ruido_ambiente_db", ruido)
        self.config.set("offset_media_db", int(limite_atencao - ruido))
        self.config.set("offset_pico_db", int(limite_pico - ruido))
        
        self.logger.calibracao(ruido)
        
        QMessageBox.information(
            self, "Configurações Aplicadas",
            f"Os limites foram configurados:\n\n"
            f"• Ruído ambiente: {ruido:.1f} dB\n"
            f"• Limite atenção: {limite_atencao:.1f} dB\n"
            f"• Limite grito: {limite_pico:.1f} dB"
        )
        
        self.accept()
    
    def _cancelar(self):
        if self._thread and self._thread.isRunning():
            self._thread.stop()
            self._thread.wait(2000)
        self.reject()
    
    def closeEvent(self, event):
        self._cancelar()
        super().closeEvent(event)
