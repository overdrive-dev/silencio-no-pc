from PyQt5.QtWidgets import QDialog, QApplication
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QPainter, QColor


class BasePopup(QDialog):
    """Base class for all KidsPC popups — shared window flags, centering, and painting."""
    
    def __init__(self, width: int = 340, height: int = 180, parent=None):
        super().__init__(parent)
        self.setWindowFlags(
            Qt.FramelessWindowHint |
            Qt.WindowStaysOnTopHint |
            Qt.Dialog
        )
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setFixedSize(width, height)
        self._center_on_screen()
    
    def _center_on_screen(self):
        screen = QApplication.primaryScreen()
        if screen:
            geo = screen.geometry()
            self.move((geo.width() - self.width()) // 2,
                      (geo.height() - self.height()) // 2)
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(QColor(25, 25, 30, 240))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(self.rect(), 14, 14)
