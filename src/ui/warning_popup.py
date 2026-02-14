from PyQt5.QtWidgets import QVBoxLayout, QLabel, QPushButton
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont
from src.ui.base_popup import BasePopup


class NoiseWarningPopup(BasePopup):
    """Popup moderno centralizado para avisos de barulho."""
    
    def __init__(self, titulo: str, mensagem: str, icone: str = "\u26a0\ufe0f",
                 cor_destaque: str = "#FFC107", auto_fechar_segundos: int = 8,
                 parent=None):
        super().__init__(360, 200, parent)
        self.cor_destaque = cor_destaque
        self._setup_ui(titulo, mensagem, icone, auto_fechar_segundos)
        QTimer.singleShot(auto_fechar_segundos * 1000, self.accept)
    
    def _setup_ui(self, titulo, mensagem, icone, auto_fechar):
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 22, 28, 18)
        layout.setSpacing(8)
        
        label_icon = QLabel(icone)
        label_icon.setAlignment(Qt.AlignCenter)
        label_icon.setFont(QFont("Segoe UI Emoji", 32))
        label_icon.setStyleSheet("background: transparent;")
        layout.addWidget(label_icon)
        
        label_title = QLabel(titulo)
        label_title.setAlignment(Qt.AlignCenter)
        label_title.setFont(QFont("Segoe UI", 15, QFont.Bold))
        label_title.setStyleSheet(f"color: {self.cor_destaque}; background: transparent;")
        layout.addWidget(label_title)
        
        label_msg = QLabel(mensagem)
        label_msg.setAlignment(Qt.AlignCenter)
        label_msg.setWordWrap(True)
        label_msg.setFont(QFont("Segoe UI", 11))
        label_msg.setStyleSheet("color: #ccc; background: transparent;")
        layout.addWidget(label_msg)
        
        layout.addSpacing(6)
        
        btn = QPushButton("OK")
        btn.setFixedWidth(90)
        btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {self.cor_destaque};
                color: white;
                border: none;
                border-radius: 6px;
                padding: 7px 20px;
                font-size: 12px;
                font-weight: bold;
            }}
            QPushButton:hover {{ opacity: 0.9; }}
        """)
        btn.clicked.connect(self.accept)
        layout.addWidget(btn, alignment=Qt.AlignCenter)
    

def mostrar_aviso_leve(parent=None):
    """Strike 1: aviso leve."""
    popup = NoiseWarningPopup(
        titulo="Abaixe o volume!",
        mensagem="O barulho est\u00e1 alto demais.\nPor favor, reduza o volume.",
        icone="\ud83d\udd0a",
        cor_destaque="#FFC107",
        auto_fechar_segundos=8,
    )
    popup.exec_()


def mostrar_aviso_forte(parent=None):
    """Strike 2: aviso forte."""
    popup = NoiseWarningPopup(
        titulo="\u00daltimo aviso!",
        mensagem="Pr\u00f3ximo strike remove 10 minutos\ndo seu tempo dispon\u00edvel!",
        icone="\ud83d\udea8",
        cor_destaque="#f44336",
        auto_fechar_segundos=10,
    )
    popup.exec_()
