import requests
from PyQt5.QtWidgets import (QDialog, QVBoxLayout, QLabel, QLineEdit, 
                              QPushButton, QMessageBox, QApplication)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont

from src.auto_updater import AutoUpdater

WEB_API_URL_CUSTOM = "https://www.kidspc.com.br"
WEB_API_URL_VERCEL = "https://kidspc.vercel.app"
WEB_API_URL_LOCAL = "http://localhost:3000"


class PairingDialog(QDialog):
    """Diálogo para vincular o PC a uma conta de pai via token de sincronização."""
    
    def __init__(self, config, parent=None):
        super().__init__(parent)
        self.config = config
        self._paired = False
        self._setup_ui()
    
    def _setup_ui(self):
        self.setWindowTitle("KidsPC — Vincular Conta")
        self.setWindowFlags(
            Qt.WindowStaysOnTopHint | Qt.Dialog
        )
        self.setFixedSize(420, 460)
        self._center_on_screen()
        
        self.setStyleSheet("background-color: #1e1e22; color: white;")
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(32, 30, 32, 30)
        layout.setSpacing(14)
        
        label_icon = QLabel("\U0001f517")
        label_icon.setAlignment(Qt.AlignCenter)
        label_icon.setFont(QFont("Segoe UI Emoji", 40))
        label_icon.setStyleSheet("background: transparent;")
        layout.addWidget(label_icon)
        
        label_title = QLabel("Vincular a uma conta")
        label_title.setAlignment(Qt.AlignCenter)
        label_title.setFont(QFont("Segoe UI", 17, QFont.Bold))
        label_title.setStyleSheet("color: white; background: transparent;")
        layout.addWidget(label_title)
        
        label_desc = QLabel(
            "Cole o token de sincronização gerado\n"
            "no painel web pelo responsável."
        )
        label_desc.setAlignment(Qt.AlignCenter)
        label_desc.setWordWrap(True)
        label_desc.setFont(QFont("Segoe UI", 11))
        label_desc.setStyleSheet("color: #999; background: transparent;")
        layout.addWidget(label_desc)
        
        layout.addSpacing(8)
        
        self.input_token = QLineEdit()
        self.input_token.setPlaceholderText("Cole o token aqui...")
        self.input_token.setAlignment(Qt.AlignCenter)
        self.input_token.setFont(QFont("Consolas", 13))
        self.input_token.setMaxLength(64)
        self.input_token.setStyleSheet("""
            QLineEdit {
                border: 2px solid #555;
                border-radius: 8px;
                padding: 10px;
                background-color: #2a2a2e;
                color: white;
                letter-spacing: 1px;
            }
            QLineEdit:focus {
                border: 2px solid #6C63FF;
            }
        """)
        layout.addWidget(self.input_token)
        
        label_hint = QLabel("O token expira em 30 minutos e só pode ser usado uma vez.")
        label_hint.setAlignment(Qt.AlignCenter)
        label_hint.setFont(QFont("Segoe UI", 8))
        label_hint.setStyleSheet("color: #666; background: transparent;")
        layout.addWidget(label_hint)
        
        layout.addSpacing(4)
        
        self.btn_vincular = QPushButton("Vincular")
        self.btn_vincular.setFont(QFont("Segoe UI", 12, QFont.Bold))
        self.btn_vincular.setStyleSheet("""
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
            QPushButton:disabled {
                background-color: #444;
                color: #888;
            }
        """)
        self.btn_vincular.clicked.connect(self._on_vincular)
        layout.addWidget(self.btn_vincular)
        
        self.label_status = QLabel("")
        self.label_status.setAlignment(Qt.AlignCenter)
        self.label_status.setFont(QFont("Segoe UI", 9))
        layout.addWidget(self.label_status)
        
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
            QPushButton:hover {
                color: #8B83FF;
            }
            QPushButton:disabled {
                color: #555;
            }
        """)
        self.btn_update.clicked.connect(self._on_check_update)
        layout.addWidget(self.btn_update, alignment=Qt.AlignCenter)
    
    def _center_on_screen(self):
        screen = QApplication.primaryScreen()
        if screen:
            geo = screen.geometry()
            self.move((geo.width() - self.width()) // 2,
                      (geo.height() - self.height()) // 2)
    
    def _on_vincular(self):
        token = self.input_token.text().strip()
        if not token:
            self.label_status.setStyleSheet("color: #f44336;")
            self.label_status.setText("Cole o token de sincronização.")
            return
        
        self.btn_vincular.setEnabled(False)
        self.label_status.setStyleSheet("color: #FFC107;")
        self.label_status.setText("Verificando token...")
        
        QApplication.processEvents()
        
        try:
            success, message = self._claim_token(token)
            if success:
                self._paired = True
                self.label_status.setStyleSheet("color: #4CAF50;")
                self.label_status.setText("Vinculado com sucesso!")
                QMessageBox.information(self, "Sucesso", 
                    "PC vinculado com sucesso!\nO monitoramento remoto está ativo.")
                self.accept()
            else:
                self.label_status.setStyleSheet("color: #f44336;")
                self.label_status.setText(message)
                self.btn_vincular.setEnabled(True)
        except Exception as e:
            self.label_status.setStyleSheet("color: #f44336;")
            self.label_status.setText(f"Erro de conexão: {e}")
            self.btn_vincular.setEnabled(True)
    
    def _claim_token(self, token: str) -> tuple:
        """Envia token para a API de claim e vincula o PC.
        Tenta domínio customizado, depois vercel, depois localhost.
        Claim é idempotente — retries são seguros."""
        urls = [WEB_API_URL_CUSTOM, WEB_API_URL_VERCEL, WEB_API_URL_LOCAL]
        last_error = ""
        
        for base_url in urls:
            try:
                resp = requests.post(
                    f"{base_url}/api/dispositivos/claim",
                    json={"token": token},
                    timeout=30,
                )
                data = resp.json()
                
                if resp.status_code == 200 and "pc_id" in data:
                    self.config.set("pc_id", data["pc_id"])
                    self.config.set("user_id", data["user_id"])
                    self.config.set("device_jwt", data.get("device_jwt", ""))
                    self.config.set("paired", True)
                    return True, "OK"
                
                # Got a real response (not connection error) — use this error
                error_msg = data.get("error", "Token inválido ou expirado.")
                return False, error_msg
                
            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout):
                last_error = f"Sem conexão ({base_url})"
                continue
            except Exception as e:
                last_error = f"Erro: {e}"
                continue
        
        return False, "Sem conexão com o servidor."
    
    def _on_check_update(self):
        """Verifica e aplica atualização a partir do diálogo de pareamento."""
        version = self.config.get("app_version", "?")
        self.btn_update.setText(f"v{version} — Verificando...")
        self.btn_update.setEnabled(False)
        QApplication.processEvents()
        
        try:
            updater = AutoUpdater(current_version=version)
            update = updater.check_for_update()
            
            if not update:
                QMessageBox.information(
                    self, "Atualização",
                    f"Você já está na versão mais recente (v{version})."
                )
                return
            
            msg = (
                f"Nova versão disponível: v{update['version']}\n"
                f"Versão atual: v{version}\n"
            )
            changelog = update.get("changelog", "")
            if changelog:
                msg += f"\n{changelog}\n"
            msg += "\nDeseja atualizar agora?"
            
            reply = QMessageBox.question(
                self, "Atualização disponível", msg,
                QMessageBox.Yes | QMessageBox.No, QMessageBox.Yes
            )
            
            if reply != QMessageBox.Yes:
                return
            
            if not update.get("download_url"):
                QMessageBox.warning(self, "Erro", "URL de download não disponível.")
                return
            
            self.btn_update.setText(f"v{version} — Baixando...")
            QApplication.processEvents()
            
            exe_path = updater.download_update(update["download_url"])
            if not exe_path:
                QMessageBox.warning(self, "Erro", "Falha ao baixar a atualização.")
                return
            
            QMessageBox.information(
                self, "Atualização",
                f"Download concluído!\nO programa vai reiniciar para aplicar a v{update['version']}."
            )
            updater.apply_update(exe_path, is_installer=update.get("is_installer", False))
        except Exception as e:
            QMessageBox.warning(self, "Erro", f"Erro ao verificar atualização:\n{e}")
        finally:
            self.btn_update.setText(f"v{version} — Buscar atualização")
            self.btn_update.setEnabled(True)
    
    def is_paired(self) -> bool:
        return self._paired
    
    def closeEvent(self, event):
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
