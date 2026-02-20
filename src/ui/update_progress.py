from PyQt5.QtWidgets import QProgressDialog, QApplication, QMessageBox
from PyQt5.QtCore import Qt

from src.auto_updater import AutoUpdater


class UpdateProgressDialog(QProgressDialog):
    """Diálogo de progresso para download de atualizações."""
    
    def __init__(self, version: str, parent=None):
        super().__init__("Baixando atualização...", "Cancelar", 0, 100, parent)
        self.setWindowTitle(f"Atualização — v{version}")
        self.setWindowModality(Qt.WindowModal)
        self.setMinimumWidth(350)
        self.setAutoClose(False)
        self.setAutoReset(False)
        self._cancelled = False
        self.canceled.connect(self._on_cancel)
    
    def _on_cancel(self):
        self._cancelled = True
    
    def is_cancelled(self) -> bool:
        return self._cancelled
    
    def on_progress(self, downloaded: int, total: int):
        """Callback chamado pelo AutoUpdater a cada chunk."""
        if total > 0:
            pct = int((downloaded / total) * 100)
            mb_down = downloaded / (1024 * 1024)
            mb_total = total / (1024 * 1024)
            self.setLabelText(f"Baixando atualização... {mb_down:.1f} / {mb_total:.1f} MB")
            self.setValue(pct)
        else:
            mb_down = downloaded / (1024 * 1024)
            self.setLabelText(f"Baixando atualização... {mb_down:.1f} MB")
        QApplication.processEvents()


def run_update_flow(current_version: str, parent=None):
    """Fluxo completo de verificação e atualização com barra de progresso.
    
    Reutilizável por: pairing.py, tray_app.py, main.py.
    """
    updater = AutoUpdater(current_version=current_version)
    
    update = updater.check_for_update()
    if not update:
        QMessageBox.information(
            parent, "Atualização",
            f"Você já está na versão mais recente (v{current_version})."
        )
        return
    
    msg = (
        f"Nova versão disponível: v{update['version']}\n"
        f"Versão atual: v{current_version}\n"
    )
    changelog = update.get("changelog", "")
    if changelog:
        msg += f"\n{changelog}\n"
    msg += "\nDeseja atualizar agora?"
    
    reply = QMessageBox.question(
        parent, "Atualização disponível", msg,
        QMessageBox.Yes | QMessageBox.No, QMessageBox.Yes
    )
    
    if reply != QMessageBox.Yes:
        return
    
    if not update.get("download_url"):
        QMessageBox.warning(parent, "Erro", "URL de download não disponível.")
        return
    
    # Show progress dialog
    progress = UpdateProgressDialog(update["version"], parent)
    progress.show()
    QApplication.processEvents()
    
    exe_path = updater.download_update(
        update["download_url"],
        on_progress=progress.on_progress,
        cancel_check=progress.is_cancelled,
    )
    
    progress.close()
    
    if not exe_path:
        if not progress.is_cancelled():
            QMessageBox.warning(parent, "Erro", "Falha ao baixar a atualização.")
        return
    
    QMessageBox.information(
        parent, "Atualização",
        f"Download concluído!\nO programa vai reiniciar para aplicar a v{update['version']}."
    )
    updater.apply_update(exe_path, is_installer=update.get("is_installer", False))
