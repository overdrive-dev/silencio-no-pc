from PyQt5.QtWidgets import QDialog, QVBoxLayout, QLabel, QPushButton
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont, QPainter, QColor


class TimeWarningPopup(QDialog):
    """Popup moderno de aviso de tempo restante."""
    
    def __init__(self, minutes_remaining: int, parent=None):
        super().__init__(parent)
        self.minutes_remaining = minutes_remaining
        self._setup_ui()
        
        QTimer.singleShot(10000, self.accept)
    
    def _setup_ui(self):
        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint |
            Qt.Dialog
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(340, 180)
        
        self._center_on_screen()
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 20, 24, 20)
        layout.setSpacing(8)
        
        if self.minutes_remaining <= 5:
            icon = "\u23f0"
            color = "#f44336"
            title = "Tempo quase esgotado!"
            message = f"Restam apenas {self.minutes_remaining} minutos."
        else:
            icon = "\u231b"
            color = "#FFC107"
            title = "Aviso de tempo"
            message = f"Restam {self.minutes_remaining} minutos de uso hoje."
        
        label_icon = QLabel(icon)
        label_icon.setAlignment(Qt.AlignCenter)
        label_icon.setFont(QFont("Segoe UI Emoji", 28))
        label_icon.setStyleSheet("background: transparent;")
        layout.addWidget(label_icon)
        
        label_title = QLabel(title)
        label_title.setAlignment(Qt.AlignCenter)
        label_title.setFont(QFont("Segoe UI", 14, QFont.Bold))
        label_title.setStyleSheet(f"color: {color}; background: transparent;")
        layout.addWidget(label_title)
        
        label_msg = QLabel(message)
        label_msg.setAlignment(Qt.AlignCenter)
        label_msg.setFont(QFont("Segoe UI", 11))
        label_msg.setStyleSheet("color: #ccc; background: transparent;")
        layout.addWidget(label_msg)
        
        btn = QPushButton("OK")
        btn.setFixedWidth(80)
        btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {color};
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 16px;
                font-size: 12px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                opacity: 0.9;
            }}
        """)
        btn.clicked.connect(self.accept)
        layout.addWidget(btn, alignment=Qt.AlignCenter)
    
    def _center_on_screen(self):
        from PyQt5.QtWidgets import QApplication
        screen = QApplication.primaryScreen()
        if screen:
            geo = screen.geometry()
            x = (geo.width() - self.width()) // 2
            y = (geo.height() - self.height()) // 2
            self.move(x, y)
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(QColor(25, 25, 30, 240))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(self.rect(), 14, 14)


class TimePenaltyPopup(QDialog):
    """Popup informando penalidade de tempo por barulho."""
    
    def __init__(self, penalty_minutes: int = 10, parent=None):
        super().__init__(parent)
        self.penalty_minutes = penalty_minutes
        self._setup_ui()
        
        QTimer.singleShot(8000, self.accept)
    
    def _setup_ui(self):
        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint |
            Qt.Dialog
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(340, 180)
        
        self._center_on_screen()
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 20, 24, 20)
        layout.setSpacing(8)
        
        label_icon = QLabel("\u26a0\ufe0f")
        label_icon.setAlignment(Qt.AlignCenter)
        label_icon.setFont(QFont("Segoe UI Emoji", 28))
        label_icon.setStyleSheet("background: transparent;")
        layout.addWidget(label_icon)
        
        label_title = QLabel(f"-{self.penalty_minutes} minutos!")
        label_title.setAlignment(Qt.AlignCenter)
        label_title.setFont(QFont("Segoe UI", 16, QFont.Bold))
        label_title.setStyleSheet("color: #f44336; background: transparent;")
        layout.addWidget(label_title)
        
        label_msg = QLabel(f"Voc\u00ea perdeu {self.penalty_minutes} minutos por excesso de barulho.")
        label_msg.setAlignment(Qt.AlignCenter)
        label_msg.setWordWrap(True)
        label_msg.setFont(QFont("Segoe UI", 11))
        label_msg.setStyleSheet("color: #ccc; background: transparent;")
        layout.addWidget(label_msg)
        
        btn = QPushButton("Entendi")
        btn.setFixedWidth(100)
        btn.setStyleSheet("""
            QPushButton {
                background-color: #f44336;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 6px 16px;
                font-size: 12px;
                font-weight: bold;
            }
        """)
        btn.clicked.connect(self.accept)
        layout.addWidget(btn, alignment=Qt.AlignCenter)
    
    def _center_on_screen(self):
        from PyQt5.QtWidgets import QApplication
        screen = QApplication.primaryScreen()
        if screen:
            geo = screen.geometry()
            x = (geo.width() - self.width()) // 2
            y = (geo.height() - self.height()) // 2
            self.move(x, y)
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(QColor(25, 25, 30, 240))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(self.rect(), 14, 14)


class TimeBlockedPopup(QDialog):
    """Popup informando que o tempo acabou."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self._setup_ui()
        
        QTimer.singleShot(5000, self.accept)
    
    def _setup_ui(self):
        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint |
            Qt.Dialog
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(340, 180)
        
        self._center_on_screen()
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 20, 24, 20)
        layout.setSpacing(8)
        
        label_icon = QLabel("\ud83d\udeab")
        label_icon.setAlignment(Qt.AlignCenter)
        label_icon.setFont(QFont("Segoe UI Emoji", 28))
        label_icon.setStyleSheet("background: transparent;")
        layout.addWidget(label_icon)
        
        label_title = QLabel("Tempo esgotado!")
        label_title.setAlignment(Qt.AlignCenter)
        label_title.setFont(QFont("Segoe UI", 14, QFont.Bold))
        label_title.setStyleSheet("color: #f44336; background: transparent;")
        layout.addWidget(label_title)
        
        label_msg = QLabel("Seu tempo de uso acabou por hoje.\nO computador ser\u00e1 bloqueado.")
        label_msg.setAlignment(Qt.AlignCenter)
        label_msg.setFont(QFont("Segoe UI", 11))
        label_msg.setStyleSheet("color: #ccc; background: transparent;")
        layout.addWidget(label_msg)
    
    def _center_on_screen(self):
        from PyQt5.QtWidgets import QApplication
        screen = QApplication.primaryScreen()
        if screen:
            geo = screen.geometry()
            x = (geo.width() - self.width()) // 2
            y = (geo.height() - self.height()) // 2
            self.move(x, y)
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(QColor(25, 25, 30, 240))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(self.rect(), 14, 14)
