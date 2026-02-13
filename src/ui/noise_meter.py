from PyQt5.QtWidgets import QWidget, QVBoxLayout, QHBoxLayout, QLabel, QProgressBar
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QPainter, QColor, QFont


class NoiseMeterWidget(QWidget):
    """Widget discreto flutuante que mostra tempo restante + indicador sutil de volume."""
    
    def __init__(self, config):
        super().__init__()
        self.config = config
        self._nivel_atual = 0
        self._strikes = 0
        self._remaining_minutes = 0
        self._drag_position = None
        self._pulse_state = False
        
        self._setup_ui()
        self._load_position()
        
        self._pulse_timer = QTimer(self)
        self._pulse_timer.timeout.connect(self._toggle_pulse)
        self._pulse_timer.setInterval(500)
    
    def _setup_ui(self):
        self.setWindowFlags(
            Qt.FramelessWindowHint | 
            Qt.WindowStaysOnTopHint | 
            Qt.Tool
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(100, 32)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 5, 8, 4)
        layout.setSpacing(2)
        
        top_row = QHBoxLayout()
        top_row.setSpacing(3)
        
        self.label_time = QLabel("--:--")
        self.label_time.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.label_time.setStyleSheet("background: transparent; color: rgba(255,255,255,200);")
        self.label_time.setAlignment(Qt.AlignCenter)
        top_row.addWidget(self.label_time, 1)
        
        self.label_strikes = QLabel("")
        self.label_strikes.setFont(QFont("Segoe UI Emoji", 7))
        self.label_strikes.setStyleSheet("background: transparent; color: #ff6b6b;")
        self.label_strikes.setAlignment(Qt.AlignRight | Qt.AlignVCenter)
        top_row.addWidget(self.label_strikes)
        
        layout.addLayout(top_row)
        
        self.barra_volume = QProgressBar()
        self.barra_volume.setRange(0, 100)
        self.barra_volume.setValue(0)
        self.barra_volume.setTextVisible(False)
        self.barra_volume.setFixedHeight(3)
        self.barra_volume.setStyleSheet("""
            QProgressBar {
                border: none;
                border-radius: 1px;
                background-color: rgba(255,255,255,20);
            }
            QProgressBar::chunk {
                background-color: #4CAF50;
                border-radius: 1px;
            }
        """)
        layout.addWidget(self.barra_volume)
    
    def _load_position(self):
        x = self.config.get("posicao_widget_x", 100)
        y = self.config.get("posicao_widget_y", 100)
        self.move(x, y)
    
    def _save_position(self):
        pos = self.pos()
        self.config.set("posicao_widget_x", pos.x())
        self.config.set("posicao_widget_y", pos.y())
    
    def _toggle_pulse(self):
        """Alterna pulso visual quando volume alto."""
        self._pulse_state = not self._pulse_state
        self.update()
    
    def _format_time(self, minutes: int) -> str:
        """Formata minutos em 'H:MM' ou 'Mm'."""
        if minutes <= 0:
            return "0:00"
        h = minutes // 60
        m = minutes % 60
        if h > 0:
            return f"{h}:{m:02d}"
        return f"{m}m"
    
    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self._drag_position = event.globalPos() - self.frameGeometry().topLeft()
            event.accept()
    
    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.LeftButton and self._drag_position:
            self.move(event.globalPos() - self._drag_position)
            event.accept()
    
    def mouseReleaseEvent(self, event):
        if event.button() == Qt.LeftButton:
            self._drag_position = None
            self._save_position()
            event.accept()
    
    def atualizar_tempo(self, remaining_minutes: int):
        """Atualiza o tempo restante exibido."""
        self._remaining_minutes = remaining_minutes
        self.label_time.setText(self._format_time(remaining_minutes))
        
        if remaining_minutes <= 5:
            self.label_time.setStyleSheet("background: transparent; color: #f44336;")
        elif remaining_minutes <= 15:
            self.label_time.setStyleSheet("background: transparent; color: #FFC107;")
        else:
            self.label_time.setStyleSheet("background: transparent; color: rgba(255,255,255,200);")
    
    def atualizar_nivel(self, nivel_db: float):
        """Atualiza indicador sutil de volume."""
        self._nivel_atual = nivel_db
        
        valor_normalizado = min(100, max(0, int(nivel_db)))
        self.barra_volume.setValue(valor_normalizado)
        
        limite_atencao = self.config.get("volume_atencao_db", 70)
        limite_perigo = self.config.get("volume_grito_db", 85)
        
        if nivel_db < limite_atencao:
            cor = "#4CAF50"
            if self._pulse_timer.isActive():
                self._pulse_timer.stop()
                self._pulse_state = False
        elif nivel_db < limite_perigo:
            cor = "#FFC107"
            if self._pulse_timer.isActive():
                self._pulse_timer.stop()
                self._pulse_state = False
        else:
            cor = "#f44336"
            if not self._pulse_timer.isActive():
                self._pulse_timer.start()
        
        self.barra_volume.setStyleSheet(f"""
            QProgressBar {{
                border: none;
                border-radius: 2px;
                background-color: rgba(255,255,255,30);
            }}
            QProgressBar::chunk {{
                background-color: {cor};
                border-radius: 2px;
            }}
        """)
    
    def atualizar_strikes(self, strikes: int):
        """Atualiza indicador discreto de strikes."""
        self._strikes = strikes
        if strikes > 0:
            cycle_pos = strikes % 3
            cycle_pos = cycle_pos if cycle_pos != 0 else 3
            self.label_strikes.setText(f"\u26a0 {strikes} ({cycle_pos}/3)")
        else:
            self.label_strikes.setText("")
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        alpha = 180 if not self._pulse_state else 200
        painter.setBrush(QColor(20, 20, 25, alpha))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(self.rect(), 8, 8)
        
        if self._pulse_state and self._nivel_atual > 0:
            painter.setBrush(QColor(244, 67, 54, 15))
            painter.drawRoundedRect(self.rect(), 8, 8)
