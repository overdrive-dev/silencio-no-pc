from PyQt5.QtWidgets import QDialog, QVBoxLayout, QLabel, QPushButton, QApplication
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont, QPainter, QColor
import ctypes

class FullScreenWarning(QDialog):
    """Popup GIGANTE em tela cheia que fica por cima de TUDO."""
    
    def __init__(self, mensagem: str, icone: str = "⚠️", cor_fundo: str = "#B71C1C", 
                 auto_fechar_segundos: int = 10):
        super().__init__()
        self.setWindowTitle("AVISO")
        self.setModal(True)
        
        self.setWindowFlags(
            Qt.FramelessWindowHint | 
            Qt.WindowStaysOnTopHint |
            Qt.X11BypassWindowManagerHint |
            Qt.Tool
        )
        self.setAttribute(Qt.WA_TranslucentBackground, False)
        
        self._forcar_primeiro_plano()
        
        screen = QApplication.primaryScreen().geometry()
        self.setGeometry(screen)
        
        self.cor_fundo = cor_fundo
        self.auto_fechar_segundos = auto_fechar_segundos
        self._segundos_restantes = auto_fechar_segundos
        
        self._setup_ui(mensagem, icone)
        
        self.timer = QTimer(self)
        self.timer.timeout.connect(self._atualizar_contador)
        self.timer.start(1000)
    
    def _forcar_primeiro_plano(self):
        """Força a janela a ficar na frente de TUDO, incluindo jogos fullscreen."""
        try:
            hwnd = int(self.winId())
            ctypes.windll.user32.SetWindowPos(
                hwnd, -1, 0, 0, 0, 0, 
                0x0001 | 0x0002 | 0x0040
            )
            ctypes.windll.user32.SetForegroundWindow(hwnd)
            ctypes.windll.user32.BringWindowToTop(hwnd)
        except Exception:
            pass
    
    def _setup_ui(self, mensagem: str, icone: str):
        self.setStyleSheet(f"""
            QDialog {{
                background-color: {self.cor_fundo};
            }}
            QLabel {{
                color: white;
            }}
            QPushButton {{
                background-color: rgba(255, 255, 255, 0.2);
                color: white;
                border: 3px solid white;
                padding: 20px 60px;
                border-radius: 15px;
                font-size: 24px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: rgba(255, 255, 255, 0.3);
            }}
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(50, 50, 50, 50)
        layout.setSpacing(30)
        
        layout.addStretch(1)
        
        self.label_icone = QLabel(icone)
        self.label_icone.setAlignment(Qt.AlignCenter)
        self.label_icone.setFont(QFont("Segoe UI Emoji", 150))
        layout.addWidget(self.label_icone)
        
        self.label_mensagem = QLabel(mensagem)
        self.label_mensagem.setAlignment(Qt.AlignCenter)
        self.label_mensagem.setFont(QFont("Arial Black", 72, QFont.Black))
        self.label_mensagem.setWordWrap(True)
        self.label_mensagem.setStyleSheet("color: white; text-shadow: 4px 4px 8px black;")
        layout.addWidget(self.label_mensagem)
        
        layout.addStretch(1)
        
        self.btn_ok = QPushButton(f"ENTENDI ({self.auto_fechar_segundos}s)")
        self.btn_ok.clicked.connect(self.accept)
        self.btn_ok.setFont(QFont("Arial", 24, QFont.Bold))
        layout.addWidget(self.btn_ok, alignment=Qt.AlignCenter)
        
        layout.addStretch(1)
    
    def _atualizar_contador(self):
        self._segundos_restantes -= 1
        self.btn_ok.setText(f"ENTENDI ({self._segundos_restantes}s)")
        
        self._forcar_primeiro_plano()
        
        if self._segundos_restantes <= 0:
            self.timer.stop()
            self.accept()
    
    def showEvent(self, event):
        super().showEvent(event)
        self._forcar_primeiro_plano()
        self.activateWindow()
        self.raise_()
    
    def closeEvent(self, event):
        self.timer.stop()
        super().closeEvent(event)


def mostrar_aviso_abaixe_volume(parent=None):
    popup = FullScreenWarning(
        mensagem="ABAIXE\nO VOLUME!",
        icone="🔊",
        cor_fundo="#E65100",
        auto_fechar_segundos=10
    )
    popup.exec_()


def mostrar_aviso_ultimo(parent=None):
    popup = FullScreenWarning(
        mensagem="ÚLTIMO AVISO!\n\nO PRÓXIMO\nDESLIGA A INTERNET!",
        icone="🚨",
        cor_fundo="#B71C1C",
        auto_fechar_segundos=15
    )
    popup.exec_()


WarningPopup = FullScreenWarning
