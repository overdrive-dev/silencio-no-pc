from PyQt5.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QSlider
from PyQt5.QtCore import Qt, QTimer, pyqtSignal
from PyQt5.QtGui import QPainter, QColor, QLinearGradient, QPen, QFont

class LiveThresholdWidget(QWidget):
    """Widget visual para configurar limites com decibéis passando em tempo real."""
    
    threshold_changed = pyqtSignal(int, int)  # limite_media, limite_pico
    
    def __init__(self, audio_monitor, config, parent=None):
        super().__init__(parent)
        self.audio_monitor = audio_monitor
        self.config = config
        
        self._nivel_atual = 0
        self._media_atual = 0
        self._pico_atual = 0
        self._historico = []
        
        self._limite_media = config.get("offset_media_db", 30) + config.get("ruido_ambiente_db", 40)
        self._limite_pico = config.get("offset_pico_db", 45) + config.get("ruido_ambiente_db", 40)
        
        self.setMinimumHeight(200)
        self._setup_ui()
        self._start_monitoring()
    
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        
        self.label_instrucao = QLabel(
            "🎤 Fale normalmente e depois grite para ver a diferença.\n"
            "Arraste os sliders para definir os limites."
        )
        self.label_instrucao.setAlignment(Qt.AlignCenter)
        self.label_instrucao.setStyleSheet("color: #888; font-size: 11px;")
        layout.addWidget(self.label_instrucao)
        
        self.visualizer = AudioVisualizer(self)
        self.visualizer.setMinimumHeight(120)
        layout.addWidget(self.visualizer)
        
        media_layout = QHBoxLayout()
        media_layout.addWidget(QLabel("🟡 Limite Atenção:"))
        self.slider_media = QSlider(Qt.Horizontal)
        self.slider_media.setRange(30, 100)
        self.slider_media.setValue(int(self._limite_media))
        self.slider_media.valueChanged.connect(self._on_media_changed)
        media_layout.addWidget(self.slider_media)
        self.label_media_valor = QLabel(f"{int(self._limite_media)} dB")
        self.label_media_valor.setMinimumWidth(50)
        media_layout.addWidget(self.label_media_valor)
        layout.addLayout(media_layout)
        
        pico_layout = QHBoxLayout()
        pico_layout.addWidget(QLabel("🔴 Limite Grito:"))
        self.slider_pico = QSlider(Qt.Horizontal)
        self.slider_pico.setRange(50, 110)
        self.slider_pico.setValue(int(self._limite_pico))
        self.slider_pico.valueChanged.connect(self._on_pico_changed)
        pico_layout.addWidget(self.slider_pico)
        self.label_pico_valor = QLabel(f"{int(self._limite_pico)} dB")
        self.label_pico_valor.setMinimumWidth(50)
        pico_layout.addWidget(self.label_pico_valor)
        layout.addLayout(pico_layout)
        
        self.label_nivel = QLabel("Volume atual: -- dB")
        self.label_nivel.setAlignment(Qt.AlignCenter)
        self.label_nivel.setStyleSheet("font-size: 14px; font-weight: bold;")
        layout.addWidget(self.label_nivel)
    
    def _start_monitoring(self):
        self.timer = QTimer(self)
        self.timer.timeout.connect(self._atualizar_visualizacao)
        self.timer.start(50)  # 20 FPS
    
    def _atualizar_visualizacao(self):
        if self.audio_monitor:
            self._nivel_atual = self.audio_monitor.get_nivel_atual()
            self._media_atual = self.audio_monitor.get_media()
            self._pico_atual = self.audio_monitor.get_pico()
        
        self._historico.append(self._nivel_atual)
        if len(self._historico) > 100:
            self._historico.pop(0)
        
        if self._nivel_atual < self._limite_media:
            cor = "#4CAF50"
            status = "✅ OK"
        elif self._nivel_atual < self._limite_pico:
            cor = "#FFC107"
            status = "⚠️ Atenção"
        else:
            cor = "#f44336"
            status = "🚨 GRITO!"
        
        self.label_nivel.setText(f"Volume atual: {self._nivel_atual:.0f} dB - {status}")
        self.label_nivel.setStyleSheet(f"font-size: 14px; font-weight: bold; color: {cor};")
        
        self.visualizer.set_data(
            self._historico, 
            self._nivel_atual,
            self._limite_media, 
            self._limite_pico
        )
        self.visualizer.update()
    
    def _on_media_changed(self, value):
        self._limite_media = value
        self.label_media_valor.setText(f"{value} dB")
        self.threshold_changed.emit(value, self._limite_pico)
    
    def _on_pico_changed(self, value):
        self._limite_pico = value
        self.label_pico_valor.setText(f"{value} dB")
        self.threshold_changed.emit(self._limite_media, value)
    
    def get_limites(self):
        return self._limite_media, self._limite_pico
    
    def stop(self):
        if hasattr(self, 'timer'):
            self.timer.stop()


class AudioVisualizer(QWidget):
    """Visualizador de áudio com linhas de limite."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self._historico = []
        self._nivel_atual = 0
        self._limite_media = 70
        self._limite_pico = 85
        self.setMinimumHeight(100)
    
    def set_data(self, historico, nivel_atual, limite_media, limite_pico):
        self._historico = historico
        self._nivel_atual = nivel_atual
        self._limite_media = limite_media
        self._limite_pico = limite_pico
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        w = self.width()
        h = self.height()
        
        painter.fillRect(0, 0, w, h, QColor(30, 30, 30))
        
        db_min = 20
        db_max = 110
        
        def db_to_y(db):
            return h - ((db - db_min) / (db_max - db_min)) * h
        
        y_media = db_to_y(self._limite_media)
        y_pico = db_to_y(self._limite_pico)
        
        painter.fillRect(0, int(y_media), w, int(h - y_media), QColor(76, 175, 80, 30))
        painter.fillRect(0, int(y_pico), w, int(y_media - y_pico), QColor(255, 193, 7, 30))
        painter.fillRect(0, 0, w, int(y_pico), QColor(244, 67, 54, 30))
        
        pen_media = QPen(QColor(255, 193, 7), 2, Qt.DashLine)
        painter.setPen(pen_media)
        painter.drawLine(0, int(y_media), w, int(y_media))
        
        painter.setFont(QFont("Segoe UI", 8))
        painter.drawText(5, int(y_media) - 3, f"Atenção: {self._limite_media} dB")
        
        pen_pico = QPen(QColor(244, 67, 54), 2, Qt.DashLine)
        painter.setPen(pen_pico)
        painter.drawLine(0, int(y_pico), w, int(y_pico))
        painter.drawText(5, int(y_pico) - 3, f"Grito: {self._limite_pico} dB")
        
        if len(self._historico) > 1:
            pen_audio = QPen(QColor(100, 200, 255), 2)
            painter.setPen(pen_audio)
            
            step = w / max(1, len(self._historico) - 1)
            for i in range(1, len(self._historico)):
                x1 = int((i - 1) * step)
                x2 = int(i * step)
                y1 = int(db_to_y(self._historico[i - 1]))
                y2 = int(db_to_y(self._historico[i]))
                painter.drawLine(x1, y1, x2, y2)
        
        if self._nivel_atual > 0:
            y_atual = db_to_y(self._nivel_atual)
            
            if self._nivel_atual < self._limite_media:
                cor = QColor(76, 175, 80)
            elif self._nivel_atual < self._limite_pico:
                cor = QColor(255, 193, 7)
            else:
                cor = QColor(244, 67, 54)
            
            painter.setBrush(cor)
            painter.setPen(QPen(cor.darker(), 2))
            painter.drawEllipse(w - 15, int(y_atual) - 5, 10, 10)
        
        painter.setPen(QColor(100, 100, 100))
        painter.setFont(QFont("Segoe UI", 7))
        for db in range(30, 110, 20):
            y = int(db_to_y(db))
            painter.drawText(w - 35, y + 3, f"{db} dB")
            painter.drawLine(w - 40, y, w - 38, y)
