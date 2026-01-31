from PyQt5.QtWidgets import QWidget, QVBoxLayout, QLabel, QProgressBar, QFrame
from PyQt5.QtCore import Qt, QPoint, QTimer, QSize
from PyQt5.QtGui import QPainter, QColor, QFont


class NivelInfoOverlay(QWidget):
    """Overlay separado que mostra a tabela de níveis de dB."""
    
    NIVEIS_DB = [
        (30, 50, "Sussurro", "#4CAF50"),
        (50, 65, "Conversa normal", "#8BC34A"),
        (65, 80, "Conversa alta / TV", "#FFC107"),
        (80, 95, "GRITO / Música alta", "#FF5722"),
        (95, 120, "Muito alto!", "#f44336"),
    ]
    
    def __init__(self, parent_widget):
        super().__init__()
        self.parent_widget = parent_widget
        self._nivel_atual = 0
        
        self.setWindowFlags(
            Qt.FramelessWindowHint | 
            Qt.WindowStaysOnTopHint | 
            Qt.Tool
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(220, 160)
        
        self._setup_ui()
        
        self._hide_timer = QTimer(self)
        self._hide_timer.setSingleShot(True)
        self._hide_timer.timeout.connect(self.hide)
    
    def _setup_ui(self):
        self.setStyleSheet("""
            QWidget {
                background-color: rgba(30, 30, 30, 230);
                border-radius: 10px;
            }
            QLabel {
                color: white;
                font-size: 10px;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(12, 10, 12, 10)
        layout.setSpacing(3)
        
        titulo = QLabel("📊 Níveis de Referência")
        titulo.setAlignment(Qt.AlignCenter)
        titulo.setFont(QFont("Segoe UI", 10, QFont.Bold))
        layout.addWidget(titulo)
        
        self.labels_niveis = []
        for min_db, max_db, descricao, cor in self.NIVEIS_DB:
            label = QLabel(f"  {min_db}-{max_db} dB: {descricao}")
            label.setStyleSheet(f"color: {cor}; font-size: 10px; padding: 3px; border-radius: 4px;")
            layout.addWidget(label)
            self.labels_niveis.append((min_db, max_db, label, cor))
    
    def mostrar_com_nivel(self, nivel_db: float):
        """Mostra o overlay e destaca o nível atual."""
        self._nivel_atual = nivel_db
        
        for min_db, max_db, label, cor_original in self.labels_niveis:
            if min_db <= nivel_db < max_db:
                label.setStyleSheet(f"""
                    background-color: {cor_original}; 
                    color: white; 
                    font-size: 11px; 
                    font-weight: bold;
                    padding: 4px; 
                    border-radius: 5px;
                """)
            else:
                label.setStyleSheet(f"color: {cor_original}; font-size: 10px; padding: 3px;")
        
        parent_pos = self.parent_widget.pos()
        parent_size = self.parent_widget.size()
        self.move(parent_pos.x(), parent_pos.y() + parent_size.height() + 5)
        
        self.show()
        self.raise_()
        
        self._hide_timer.stop()
        self._hide_timer.start(5000)
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(QColor(30, 30, 30, 230))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(self.rect(), 10, 10)


class NoiseMeterWidget(QWidget):
    def __init__(self, config):
        super().__init__()
        self.config = config
        self._nivel_atual = 0
        self._strikes = 0
        self._drag_position = None
        self._ultimo_estado_atencao = False
        
        self._setup_ui()
        self._load_position()
        
        self._overlay = NivelInfoOverlay(self)
    
    def _setup_ui(self):
        self.setWindowFlags(
            Qt.FramelessWindowHint | 
            Qt.WindowStaysOnTopHint | 
            Qt.Tool
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(140, 85)
        
        self.setStyleSheet("""
            QWidget {
                background-color: rgba(30, 30, 30, 220);
                border-radius: 10px;
            }
            QLabel {
                color: white;
                font-size: 11px;
            }
            QProgressBar {
                border: 1px solid #555;
                border-radius: 3px;
                background-color: #333;
                text-align: center;
            }
            QProgressBar::chunk {
                border-radius: 2px;
            }
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 8, 10, 8)
        layout.setSpacing(4)
        
        self.label_titulo = QLabel("🔊 Volume")
        self.label_titulo.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.label_titulo)
        
        self.barra_volume = QProgressBar()
        self.barra_volume.setRange(0, 100)
        self.barra_volume.setValue(0)
        self.barra_volume.setTextVisible(False)
        self.barra_volume.setFixedHeight(15)
        layout.addWidget(self.barra_volume)
        
        self.label_db = QLabel("0 dB")
        self.label_db.setAlignment(Qt.AlignCenter)
        self.label_db.setFont(QFont("Arial", 12, QFont.Bold))
        layout.addWidget(self.label_db)
        
        self.label_strikes = QLabel("")
        self.label_strikes.setAlignment(Qt.AlignCenter)
        self.label_strikes.setStyleSheet("color: #ff6b6b; font-size: 10px;")
        layout.addWidget(self.label_strikes)
    
    def _load_position(self):
        x = self.config.get("posicao_widget_x", 100)
        y = self.config.get("posicao_widget_y", 100)
        self.move(x, y)
    
    def _save_position(self):
        pos = self.pos()
        self.config.set("posicao_widget_x", pos.x())
        self.config.set("posicao_widget_y", pos.y())
    
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
    
    def atualizar_nivel(self, nivel_db: float):
        self._nivel_atual = nivel_db
        
        valor_normalizado = min(100, max(0, int(nivel_db)))
        self.barra_volume.setValue(valor_normalizado)
        
        self.label_db.setText(f"{nivel_db:.0f} dB")
        
        ruido_ambiente = self.config.get("ruido_ambiente_db", 40)
        offset_media = self.config.get("offset_media_db", 35)
        offset_pico = self.config.get("offset_pico_db", 50)
        
        limite_atencao = ruido_ambiente + offset_media
        limite_perigo = ruido_ambiente + offset_pico
        
        if nivel_db < limite_atencao:
            cor = "#4CAF50"  # Verde
            self._contrair_widget()
        elif nivel_db < limite_perigo:
            cor = "#FFC107"  # Amarelo
            self._expandir_widget()
        else:
            cor = "#f44336"  # Vermelho
            self._expandir_widget()
        
        self._atualizar_tabela_destaque(nivel_db)
        
        self.barra_volume.setStyleSheet(f"""
            QProgressBar {{
                border: 1px solid #555;
                border-radius: 3px;
                background-color: #333;
            }}
            QProgressBar::chunk {{
                background-color: {cor};
                border-radius: 2px;
            }}
        """)
    
    def _expandir_widget(self):
        if not self._expandido:
            self._expandido = True
            self.setFixedSize(self._tamanho_expandido)
            self.frame_tabela.setVisible(True)
    
    def _contrair_widget(self):
        if self._expandido:
            self._expandido = False
            self.setFixedSize(self._tamanho_normal)
            self.frame_tabela.setVisible(False)
    
    def _atualizar_tabela_destaque(self, nivel_db: float):
        for min_db, max_db, label, cor_original in self.labels_niveis:
            if min_db <= nivel_db <= max_db:
                label.setStyleSheet(f"""
                    background-color: {cor_original}; 
                    color: white; 
                    font-size: 11px; 
                    font-weight: bold;
                    padding: 4px; 
                    border-radius: 5px;
                """)
            else:
                label.setStyleSheet(f"color: {cor_original}; font-size: 10px; padding: 2px;")
    
    def atualizar_strikes(self, strikes: int):
        self._strikes = strikes
        if strikes > 0:
            avisos = "⚠️" * strikes
            self.label_strikes.setText(f"{avisos} ({strikes}/4)")
        else:
            self.label_strikes.setText("")
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(QColor(30, 30, 30, 200))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(self.rect(), 10, 10)
