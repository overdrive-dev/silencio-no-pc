from PyQt5.QtWidgets import (
    QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QLineEdit
)
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont
from src.ui.base_popup import BasePopup


class ParentAuthPopup(BasePopup):
    """Popup que pede senha do responsável antes de bloquear a tela.
    
    Se autenticado, ativa modo responsável até o próximo dia.
    Resultado: self.authenticated (bool) após exec_().
    """
    
    REASONS = {
        "daily_limit": {
            "icon": "\U0001f6ab",
            "title": "Tempo esgotado!",
            "subtitle": "O limite diário de uso foi atingido.",
        },
        "outside_hours": {
            "icon": "\U0001f319",
            "title": "Fora do horário!",
            "subtitle": "O horário de uso permitido acabou.",
        },
        "manual_lock": {
            "icon": "\U0001f512",
            "title": "Bloqueio manual",
            "subtitle": "Bloqueio remoto ativado.",
        },
    }
    
    def __init__(self, reason: str = "daily_limit", parent=None):
        super().__init__(420, 340, parent)
        self.reason = reason
        self.authenticated = False
        self._setup_ui()
    
    def _setup_ui(self):
        info = self.REASONS.get(self.reason, self.REASONS["daily_limit"])
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(28, 24, 28, 20)
        layout.setSpacing(6)
        
        # Icon + reason
        label_icon = QLabel(info["icon"])
        label_icon.setAlignment(Qt.AlignCenter)
        label_icon.setFont(QFont("Segoe UI Emoji", 30))
        label_icon.setStyleSheet("background: transparent;")
        layout.addWidget(label_icon)
        
        label_title = QLabel(info["title"])
        label_title.setAlignment(Qt.AlignCenter)
        label_title.setFont(QFont("Segoe UI", 15, QFont.Bold))
        label_title.setStyleSheet("color: #f44336; background: transparent;")
        layout.addWidget(label_title)
        
        label_sub = QLabel(info["subtitle"])
        label_sub.setAlignment(Qt.AlignCenter)
        label_sub.setFont(QFont("Segoe UI", 10))
        label_sub.setStyleSheet("color: #aaa; background: transparent;")
        layout.addWidget(label_sub)
        
        layout.addSpacing(10)
        
        # Divider
        divider = QLabel()
        divider.setFixedHeight(1)
        divider.setStyleSheet("background: rgba(255,255,255,0.08);")
        layout.addWidget(divider)
        
        layout.addSpacing(6)
        
        # Parent auth section
        label_auth = QLabel("É o responsável? Digite a senha para continuar:")
        label_auth.setAlignment(Qt.AlignCenter)
        label_auth.setWordWrap(True)
        label_auth.setFont(QFont("Segoe UI", 10))
        label_auth.setStyleSheet("color: #ddd; background: transparent;")
        layout.addWidget(label_auth)
        
        layout.addSpacing(4)
        
        # Password input
        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.Password)
        self.password_input.setPlaceholderText("Senha do responsável")
        self.password_input.setFixedHeight(36)
        self.password_input.setFont(QFont("Segoe UI", 11))
        self.password_input.setStyleSheet("""
            QLineEdit {
                background: rgba(255,255,255,0.07);
                color: white;
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 8px;
                padding: 0 12px;
            }
            QLineEdit:focus {
                border: 1px solid #6366f1;
            }
        """)
        self.password_input.returnPressed.connect(self._on_auth)
        layout.addWidget(self.password_input)
        
        # Error label (hidden by default)
        self.label_error = QLabel("")
        self.label_error.setAlignment(Qt.AlignCenter)
        self.label_error.setFont(QFont("Segoe UI", 9))
        self.label_error.setStyleSheet("color: #f44336; background: transparent;")
        self.label_error.setFixedHeight(18)
        layout.addWidget(self.label_error)
        
        # Buttons row
        btn_row = QHBoxLayout()
        btn_row.setSpacing(10)
        
        btn_block = QPushButton("Bloquear")
        btn_block.setFixedHeight(34)
        btn_block.setFont(QFont("Segoe UI", 10))
        btn_block.setStyleSheet("""
            QPushButton {
                background: rgba(255,255,255,0.06);
                color: #aaa;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 0 18px;
            }
            QPushButton:hover {
                background: rgba(255,255,255,0.1);
                color: #ccc;
            }
        """)
        btn_block.clicked.connect(self._on_block)
        btn_row.addWidget(btn_block)
        
        btn_auth = QPushButton("Entrar como responsável")
        btn_auth.setFixedHeight(34)
        btn_auth.setFont(QFont("Segoe UI", 10, QFont.Bold))
        btn_auth.setStyleSheet("""
            QPushButton {
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 0 18px;
            }
            QPushButton:hover {
                background: #4f46e5;
            }
        """)
        btn_auth.clicked.connect(self._on_auth)
        btn_row.addWidget(btn_auth)
        
        layout.addLayout(btn_row)
        
        # Info text
        label_info = QLabel("Modo responsável dura até o próximo dia.\nReverta a qualquer momento pelo painel web.")
        label_info.setAlignment(Qt.AlignCenter)
        label_info.setWordWrap(True)
        label_info.setFont(QFont("Segoe UI", 8))
        label_info.setStyleSheet("color: #666; background: transparent;")
        layout.addWidget(label_info)
        
        # Auto-block after 30s if no interaction
        self._timeout = QTimer(self)
        self._timeout.setSingleShot(True)
        self._timeout.timeout.connect(self._on_block)
        self._timeout.start(30000)
        
        # Focus password input
        QTimer.singleShot(100, self.password_input.setFocus)
    
    def _on_auth(self):
        self._timeout.stop()
        password = self.password_input.text().strip()
        if not password:
            self.label_error.setText("Digite a senha.")
            return
        self.authenticated = True
        self._entered_password = password
        self.accept()
    
    def _on_block(self):
        self._timeout.stop()
        self.authenticated = False
        self.accept()
    
    def get_password(self) -> str:
        return getattr(self, '_entered_password', '')
