import io
import requests
import qrcode
from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QMessageBox, QApplication)
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont, QPixmap, QImage

from src.auto_updater import AutoUpdater

WEB_API_URL_CUSTOM = "https://www.kidspc.com.br"
WEB_API_URL_VERCEL = "https://kidspc.vercel.app"
WEB_API_URL_LOCAL = "http://localhost:3000"

VINCULAR_PATH = "/vincular?code="


class PairingDialog(QDialog):
    """Diálogo para vincular o PC via QR code escaneado pelo responsável."""
    
    def __init__(self, config, parent=None):
        super().__init__(parent)
        self.config = config
        self._paired = False
        self._code = None
        self._poll_timer = None
        self._setup_ui()
        self._request_code()
    
    def _setup_ui(self):
        self.setWindowTitle("KidsPC — Vincular Conta")
        self.setWindowFlags(Qt.WindowStaysOnTopHint | Qt.Dialog)
        self.setFixedSize(420, 560)
        self._center_on_screen()
        
        self.setStyleSheet("background-color: #1e1e22; color: white;")
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 24, 32, 20)
        layout.setSpacing(10)
        
        # Title
        label_title = QLabel("Vincular a uma conta")
        label_title.setAlignment(Qt.AlignCenter)
        label_title.setFont(QFont("Segoe UI", 17, QFont.Bold))
        label_title.setStyleSheet("color: white; background: transparent;")
        layout.addWidget(label_title)
        
        label_desc = QLabel(
            "Escaneie o QR code com o celular\n"
            "do responsável para vincular:"
        )
        label_desc.setAlignment(Qt.AlignCenter)
        label_desc.setWordWrap(True)
        label_desc.setFont(QFont("Segoe UI", 11))
        label_desc.setStyleSheet("color: #999; background: transparent;")
        layout.addWidget(label_desc)
        
        layout.addSpacing(4)
        
        # QR Code container
        self.qr_label = QLabel()
        self.qr_label.setAlignment(Qt.AlignCenter)
        self.qr_label.setFixedSize(200, 200)
        self.qr_label.setStyleSheet(
            "background: white; border-radius: 12px; padding: 8px;"
        )
        qr_container = QHBoxLayout()
        qr_container.addStretch()
        qr_container.addWidget(self.qr_label)
        qr_container.addStretch()
        layout.addLayout(qr_container)
        
        layout.addSpacing(6)
        
        # Or type code manually
        label_or = QLabel("Ou acesse e digite o código:")
        label_or.setAlignment(Qt.AlignCenter)
        label_or.setFont(QFont("Segoe UI", 9))
        label_or.setStyleSheet("color: #777; background: transparent;")
        layout.addWidget(label_or)
        
        # Code display
        self.code_label = QLabel("---")
        self.code_label.setAlignment(Qt.AlignCenter)
        self.code_label.setFont(QFont("Consolas", 22, QFont.Bold))
        self.code_label.setStyleSheet(
            "color: #6C63FF; background: #2a2a2e; border: 2px solid #444; "
            "border-radius: 8px; padding: 8px 16px; letter-spacing: 3px;"
        )
        layout.addWidget(self.code_label)
        
        # URL hint
        label_url = QLabel("www.kidspc.com.br/vincular")
        label_url.setAlignment(Qt.AlignCenter)
        label_url.setFont(QFont("Segoe UI", 9))
        label_url.setStyleSheet("color: #6C63FF; background: transparent;")
        layout.addWidget(label_url)
        
        layout.addSpacing(4)
        
        # Status
        self.label_status = QLabel("Gerando código...")
        self.label_status.setAlignment(Qt.AlignCenter)
        self.label_status.setFont(QFont("Segoe UI", 10))
        self.label_status.setStyleSheet("color: #FFC107; background: transparent;")
        layout.addWidget(self.label_status)
        
        # Retry button (hidden initially)
        self.btn_retry = QPushButton("Gerar novo código")
        self.btn_retry.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.btn_retry.setStyleSheet("""
            QPushButton {
                background-color: #6C63FF;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px 30px;
            }
            QPushButton:hover {
                background-color: #5A52D5;
            }
        """)
        self.btn_retry.clicked.connect(self._request_code)
        self.btn_retry.hide()
        layout.addWidget(self.btn_retry)
        
        layout.addStretch()
        
        # Version + update link at the bottom
        version = self.config.get("app_version", "?")
        self.btn_update = QPushButton(f"v{version} — Buscar atualização")
        self.btn_update.setFont(QFont("Segoe UI", 9))
        self.btn_update.setCursor(Qt.PointingHandCursor)
        self.btn_update.setStyleSheet("""
            QPushButton {
                background: transparent;
                color: #6C63FF;
                border: none;
                text-decoration: underline;
            }
            QPushButton:hover { color: #8B83FF; }
            QPushButton:disabled { color: #555; }
        """)
        self.btn_update.clicked.connect(self._on_check_update)
        layout.addWidget(self.btn_update, alignment=Qt.AlignCenter)
    
    def _center_on_screen(self):
        screen = QApplication.primaryScreen()
        if screen:
            geo = screen.geometry()
            self.move((geo.width() - self.width()) // 2,
                      (geo.height() - self.height()) // 2)
    
    def _get_api_url(self) -> str:
        """Try custom domain first, then vercel, then localhost."""
        for url in [WEB_API_URL_CUSTOM, WEB_API_URL_VERCEL, WEB_API_URL_LOCAL]:
            try:
                requests.head(url, timeout=5)
                return url
            except Exception:
                continue
        return WEB_API_URL_CUSTOM
    
    def _request_code(self):
        """Request a new pairing code from the API."""
        self.btn_retry.hide()
        self.label_status.setStyleSheet("color: #FFC107; background: transparent;")
        self.label_status.setText("Gerando código...")
        self.code_label.setText("---")
        # Clear QR
        self.qr_label.clear()
        QApplication.processEvents()
        
        urls = [WEB_API_URL_CUSTOM, WEB_API_URL_VERCEL, WEB_API_URL_LOCAL]
        for base_url in urls:
            try:
                resp = requests.post(
                    f"{base_url}/api/pairing/request",
                    json={"platform": "windows"},
                    timeout=15,
                )
                data = resp.json()
                if resp.status_code == 200 and "code" in data:
                    self._code = data["code"]
                    self._api_base = base_url
                    self._show_code(self._code)
                    self._start_polling()
                    return
            except Exception:
                continue
        
        self.label_status.setStyleSheet("color: #f44336; background: transparent;")
        self.label_status.setText("Sem conexão com o servidor.")
        self.btn_retry.show()
    
    def _show_code(self, code: str):
        """Display QR code and text code."""
        # Generate QR
        url = f"{WEB_API_URL_CUSTOM}{VINCULAR_PATH}{code}"
        qr = qrcode.QRCode(version=1, box_size=10, border=2)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert PIL image to QPixmap
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        qimage = QImage()
        qimage.loadFromData(buffer.read())
        pixmap = QPixmap.fromImage(qimage)
        self.qr_label.setPixmap(pixmap.scaled(
            184, 184, Qt.KeepAspectRatio, Qt.SmoothTransformation
        ))
        
        # Show code text
        self.code_label.setText(code)
        
        # Status
        self.label_status.setStyleSheet("color: #FFC107; background: transparent;")
        self.label_status.setText("⏳ Aguardando confirmação do responsável...")
        self.btn_retry.hide()
    
    def _start_polling(self):
        """Start polling every 4 seconds to check if code was confirmed."""
        if self._poll_timer:
            self._poll_timer.stop()
        self._poll_timer = QTimer(self)
        self._poll_timer.timeout.connect(self._poll_check)
        self._poll_timer.start(4000)
    
    def _poll_check(self):
        """Check if the pairing code has been confirmed."""
        if not self._code:
            return
        
        try:
            resp = requests.get(
                f"{self._api_base}/api/pairing/check",
                params={"code": self._code},
                timeout=10,
            )
            data = resp.json()
            status = data.get("status")
            
            if status == "confirmed":
                self._poll_timer.stop()
                # Save credentials
                self.config.set("pc_id", data["pc_id"])
                self.config.set("user_id", data["user_id"])
                self.config.set("device_jwt", data.get("device_jwt", ""))
                self.config.set("paired", True)
                self._paired = True
                
                self.label_status.setStyleSheet("color: #4CAF50; background: transparent;")
                self.label_status.setText("✅ Vinculado com sucesso!")
                QMessageBox.information(self, "Sucesso",
                    "PC vinculado com sucesso!\nO monitoramento remoto está ativo.")
                self.accept()
                
            elif status == "expired":
                self._poll_timer.stop()
                self.label_status.setStyleSheet("color: #f44336; background: transparent;")
                self.label_status.setText("Código expirado.")
                self.btn_retry.show()
                
            elif status == "invalid":
                self._poll_timer.stop()
                self.label_status.setStyleSheet("color: #f44336; background: transparent;")
                self.label_status.setText("Código inválido.")
                self.btn_retry.show()
                
            # "pending" — keep polling
        except Exception:
            pass  # Silently retry on next poll
    
    def _on_check_update(self):
        """Verifica e aplica atualização a partir do diálogo de pareamento."""
        from src.ui.update_progress import run_update_flow
        version = self.config.get("app_version", "?")
        run_update_flow(version, parent=self)
    
    def is_paired(self) -> bool:
        return self._paired
    
    def closeEvent(self, event):
        if self._poll_timer:
            self._poll_timer.stop()
        if not self._paired:
            QMessageBox.warning(
                self, "Pareamento obrigatório",
                "É necessário vincular a uma conta para usar o app.\n"
                "O app será encerrado."
            )
            event.accept()
            QApplication.instance().quit()
            return
        super().closeEvent(event)
