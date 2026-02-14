from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel,
    QPushButton, QTabWidget, QWidget, QTableWidget, QTableWidgetItem,
    QHeaderView, QMessageBox
)
from PyQt5.QtCore import Qt, QTimer, QRectF
from PyQt5.QtGui import QPainter, QColor, QFont, QPen, QLinearGradient
from collections import deque


# ── Real-time audio visualizer with draggable thresholds ──

class AudioLevelWidget(QWidget):
    """Widget que mostra histórico de áudio em tempo real com marcadores arrastáveis."""

    DB_MIN = 0
    DB_MAX = 110
    HISTORY_LEN = 80  # barras visíveis
    HANDLE_H = 8      # altura da zona de arraste dos marcadores

    def __init__(self, atencao_db=70, grito_db=85, parent=None):
        super().__init__(parent)
        self.atencao_db = atencao_db
        self.grito_db = grito_db
        self._history = deque([0.0] * self.HISTORY_LEN, maxlen=self.HISTORY_LEN)
        self._current_db = 0.0
        self._dragging = None  # "atencao" | "grito" | None
        self.setMinimumSize(400, 260)
        self.setMouseTracking(True)

    # ── public API ──

    def push_sample(self, db: float):
        self._current_db = db
        self._history.append(db)
        self.update()

    # ── coordinate helpers ──

    def _db_to_y(self, db: float) -> float:
        frac = (db - self.DB_MIN) / (self.DB_MAX - self.DB_MIN)
        frac = max(0.0, min(1.0, frac))
        return self.height() * (1.0 - frac)

    def _y_to_db(self, y: float) -> int:
        frac = 1.0 - y / self.height()
        db = self.DB_MIN + frac * (self.DB_MAX - self.DB_MIN)
        return max(self.DB_MIN, min(self.DB_MAX, int(round(db))))

    # ── paint ──

    def paintEvent(self, event):
        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing)
        w, h = self.width(), self.height()

        # Background
        p.fillRect(0, 0, w, h, QColor(18, 18, 24))

        # dB grid lines
        p.setPen(QPen(QColor(255, 255, 255, 25), 1, Qt.DotLine))
        small_font = QFont("Segoe UI", 7)
        p.setFont(small_font)
        for db in range(10, self.DB_MAX, 10):
            y = self._db_to_y(db)
            p.drawLine(0, int(y), w, int(y))
            p.setPen(QColor(255, 255, 255, 60))
            p.drawText(4, int(y) - 2, f"{db}")
            p.setPen(QPen(QColor(255, 255, 255, 25), 1, Qt.DotLine))

        # Bars
        bar_count = len(self._history)
        if bar_count == 0:
            p.end()
            return
        bar_w = max(2, (w - 10) / bar_count)
        gap = 1

        for i, db in enumerate(self._history):
            x = int(5 + i * bar_w)
            bw = max(1, int(bar_w - gap))
            bar_y = self._db_to_y(db)
            bar_h = h - bar_y

            if db >= self.grito_db:
                color = QColor(239, 68, 68)    # red
            elif db >= self.atencao_db:
                color = QColor(250, 204, 21)   # yellow
            else:
                color = QColor(74, 222, 128)   # green

            # Gradient bar
            grad = QLinearGradient(x, bar_y, x, h)
            grad.setColorAt(0, color)
            grad.setColorAt(1, QColor(color.red(), color.green(), color.blue(), 80))
            p.fillRect(QRectF(x, bar_y, bw, bar_h), grad)

        # ── Threshold lines ──
        self._draw_threshold(p, self.atencao_db, QColor(250, 204, 21), "⚠ Atenção", w)
        self._draw_threshold(p, self.grito_db, QColor(239, 68, 68), "🔴 Grito", w)

        # Current dB readout
        p.setFont(QFont("Segoe UI", 14, QFont.Bold))
        p.setPen(QColor(255, 255, 255, 220))
        p.drawText(w - 90, 28, f"{self._current_db:.0f} dB")
        p.end()

    def _draw_threshold(self, p: QPainter, db: float, color: QColor, label: str, w: int):
        y = int(self._db_to_y(db))
        # Line
        pen = QPen(color, 2, Qt.DashLine)
        p.setPen(pen)
        p.drawLine(0, y, w, y)
        # Label bg
        label_text = f"{label}: {int(db)} dB"
        fm = p.fontMetrics()
        p.setFont(QFont("Segoe UI", 9, QFont.Bold))
        fm = p.fontMetrics()
        tw = fm.horizontalAdvance(label_text) + 12
        th = fm.height() + 6
        lx = w - tw - 6
        ly = y - th - 2
        if ly < 2:
            ly = y + 4
        p.setPen(Qt.NoPen)
        p.setBrush(QColor(color.red(), color.green(), color.blue(), 180))
        p.drawRoundedRect(lx, ly, tw, th, 4, 4)
        p.setPen(QColor(0, 0, 0, 220))
        p.drawText(lx + 6, ly + fm.ascent() + 3, label_text)

    # ── mouse interaction ──

    def _hit_test(self, y: int):
        if abs(y - self._db_to_y(self.atencao_db)) < self.HANDLE_H:
            return "atencao"
        if abs(y - self._db_to_y(self.grito_db)) < self.HANDLE_H:
            return "grito"
        return None

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self._dragging = self._hit_test(event.y())
            if self._dragging:
                self.setCursor(Qt.SizeVerCursor)

    def mouseMoveEvent(self, event):
        if self._dragging:
            db = self._y_to_db(event.y())
            if self._dragging == "atencao":
                self.atencao_db = min(db, self.grito_db - 5)
            else:
                self.grito_db = max(db, self.atencao_db + 5)
            self.update()
        else:
            hit = self._hit_test(event.y())
            self.setCursor(Qt.SizeVerCursor if hit else Qt.ArrowCursor)

    def mouseReleaseEvent(self, event):
        self._dragging = None
        self.setCursor(Qt.ArrowCursor)


# ── Config Dialog ──

class ConfigDialog(QDialog):
    def __init__(self, config, logger, audio_monitor=None, parent=None):
        super().__init__(parent)
        self.config = config
        self.logger = logger
        self.audio_monitor = audio_monitor
        self.setWindowTitle("⚙️ Configurações - KidsPC")
        self.setMinimumSize(520, 540)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)

        self._setup_ui()
        self._load_config()
        self._start_polling()

    def _setup_ui(self):
        layout = QVBoxLayout(self)

        self.tabs = QTabWidget()
        layout.addWidget(self.tabs)

        self.tab_volume = QWidget()
        self.tabs.addTab(self.tab_volume, "Volume")
        self._setup_tab_volume()

        self.tab_log = QWidget()
        self.tabs.addTab(self.tab_log, "Log de Eventos")
        self._setup_tab_log()

        btn_layout = QHBoxLayout()
        btn_layout.addStretch()

        self.btn_cancelar = QPushButton("Cancelar")
        self.btn_cancelar.clicked.connect(self.reject)
        btn_layout.addWidget(self.btn_cancelar)

        self.btn_salvar = QPushButton("Salvar")
        self.btn_salvar.clicked.connect(self._on_salvar)
        self.btn_salvar.setDefault(True)
        self.btn_salvar.setStyleSheet(
            "background-color: #4f46e5; color: white; padding: 6px 20px; border-radius: 6px;"
        )
        btn_layout.addWidget(self.btn_salvar)

        layout.addLayout(btn_layout)

    def _setup_tab_volume(self):
        layout = QVBoxLayout(self.tab_volume)
        layout.setSpacing(10)

        info = QLabel(
            "Arraste as linhas horizontais para ajustar os limites.\n"
            "⚠ Atenção: aviso visual  |  🔴 Grito: gera strike (3 = penalidade)"
        )
        info.setWordWrap(True)
        info.setStyleSheet("color: #888; font-size: 11px;")
        layout.addWidget(info)

        atencao = self.config.get("volume_atencao_db", 70)
        grito = self.config.get("volume_grito_db", 85)
        self.audio_widget = AudioLevelWidget(atencao, grito)
        layout.addWidget(self.audio_widget, 1)

        note = QLabel("Horários, horas por dia, penalidades e senha são configurados pelo painel web.")
        note.setWordWrap(True)
        note.setStyleSheet("color: #666; font-size: 11px; margin-top: 4px;")
        layout.addWidget(note)

    def _setup_tab_log(self):
        layout = QVBoxLayout(self.tab_log)

        self.tabela_log = QTableWidget()
        self.tabela_log.setColumnCount(4)
        self.tabela_log.setHorizontalHeaderLabels(["Data/Hora", "Tipo", "Descrição", "dB"])
        self.tabela_log.horizontalHeader().setSectionResizeMode(2, QHeaderView.Stretch)
        self.tabela_log.setEditTriggers(QTableWidget.NoEditTriggers)
        self.tabela_log.setAlternatingRowColors(True)
        layout.addWidget(self.tabela_log)

        self._carregar_log()

    def _carregar_log(self):
        eventos = self.logger.get_eventos(100)
        self.tabela_log.setRowCount(len(eventos))

        for i, evento in enumerate(eventos):
            timestamp = evento.get("timestamp", "")[:19].replace("T", " ")
            self.tabela_log.setItem(i, 0, QTableWidgetItem(timestamp))
            self.tabela_log.setItem(i, 1, QTableWidgetItem(evento.get("tipo", "")))
            self.tabela_log.setItem(i, 2, QTableWidgetItem(evento.get("descricao", "")))
            self.tabela_log.setItem(i, 3, QTableWidgetItem(str(evento.get("nivel_db", 0))))

    # ── real-time polling ──

    def _start_polling(self):
        self._poll_timer = QTimer(self)
        self._poll_timer.timeout.connect(self._poll_audio)
        self._poll_timer.start(100)  # 10 fps

    def _poll_audio(self):
        if self.audio_monitor:
            db = self.audio_monitor.get_nivel_atual()
            self.audio_widget.push_sample(db)

    # ── config ──

    def _load_config(self):
        self.audio_widget.atencao_db = self.config.get("volume_atencao_db", 70)
        self.audio_widget.grito_db = self.config.get("volume_grito_db", 85)

    def _on_salvar(self):
        atencao = int(self.audio_widget.atencao_db)
        grito = int(self.audio_widget.grito_db)

        if atencao >= grito:
            QMessageBox.warning(self, "Erro", "O nível de atenção deve ser menor que o de grito.")
            return

        self.config.set("volume_atencao_db", atencao)
        self.config.set("volume_grito_db", grito)

        self.accept()

    def closeEvent(self, event):
        self._poll_timer.stop()
        super().closeEvent(event)

    def reject(self):
        self._poll_timer.stop()
        super().reject()
