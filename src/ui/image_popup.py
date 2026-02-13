from PyQt5.QtWidgets import QDialog, QVBoxLayout, QLabel, QApplication
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QPixmap
import ctypes


class ImagePopup(QDialog):
    """Popup fullscreen que exibe uma imagem durante o áudio de alerta."""
    
    def __init__(self, image_path: str, duracao_segundos: int = 10):
        super().__init__()
        self.duracao_segundos = duracao_segundos
        print(f"ImagePopup: imagem={image_path}, duração={duracao_segundos}s")
        
        self.setWindowTitle("ALERTA")
        self.setModal(True)
        
        self.setWindowFlags(
            Qt.FramelessWindowHint | 
            Qt.WindowStaysOnTopHint |
            Qt.X11BypassWindowManagerHint |
            Qt.Tool
        )
        
        screen = QApplication.primaryScreen().geometry()
        self.setGeometry(screen)
        
        self.setStyleSheet("background-color: black;")
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.label_imagem = QLabel()
        self.label_imagem.setAlignment(Qt.AlignCenter)
        
        pixmap = QPixmap(image_path)
        if not pixmap.isNull():
            scaled_pixmap = pixmap.scaled(
                screen.width(), screen.height(),
                Qt.KeepAspectRatio,
                Qt.SmoothTransformation
            )
            self.label_imagem.setPixmap(scaled_pixmap)
            print(f"ImagePopup: imagem carregada OK")
        else:
            print(f"ImagePopup: ERRO ao carregar imagem!")
        
        layout.addWidget(self.label_imagem)
        
        self.timer = QTimer(self)
        self.timer.setSingleShot(True)
        self.timer.timeout.connect(self._fechar)
        
    def showEvent(self, event):
        super().showEvent(event)
        self._forcar_primeiro_plano()
        self.activateWindow()
        self.raise_()
        ms = self.duracao_segundos * 1000
        print(f"ImagePopup: iniciando timer de {ms}ms")
        self.timer.start(ms)
    
    def _fechar(self):
        print("ImagePopup: timer expirou, fechando")
        self.accept()
    
    def _forcar_primeiro_plano(self):
        """Força a janela a ficar na frente de TUDO."""
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
    
    def keyPressEvent(self, event):
        pass
    
    def mousePressEvent(self, event):
        pass
    
    def closeEvent(self, event):
        self.timer.stop()
        super().closeEvent(event)
