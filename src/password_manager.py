from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, 
    QPushButton, QMessageBox
)
from PyQt5.QtCore import Qt

class PasswordDialog(QDialog):
    def __init__(self, parent=None, titulo="Digite a Senha", criar_senha=False):
        super().__init__(parent)
        self.setWindowTitle(titulo)
        self.setModal(True)
        self.setFixedSize(350, 180 if criar_senha else 130)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        
        self.criar_senha = criar_senha
        self.senha_valida = False
        self.senha = ""
        
        self._setup_ui()
    
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        
        self.label = QLabel("Senha:")
        layout.addWidget(self.label)
        
        self.input_senha = QLineEdit()
        self.input_senha.setEchoMode(QLineEdit.Password)
        self.input_senha.returnPressed.connect(self._on_confirmar)
        layout.addWidget(self.input_senha)
        
        if self.criar_senha:
            self.label_confirmar = QLabel("Confirmar Senha:")
            layout.addWidget(self.label_confirmar)
            
            self.input_confirmar = QLineEdit()
            self.input_confirmar.setEchoMode(QLineEdit.Password)
            self.input_confirmar.returnPressed.connect(self._on_confirmar)
            layout.addWidget(self.input_confirmar)
        
        btn_layout = QHBoxLayout()
        
        self.btn_cancelar = QPushButton("Cancelar")
        self.btn_cancelar.clicked.connect(self.reject)
        btn_layout.addWidget(self.btn_cancelar)
        
        self.btn_confirmar = QPushButton("Confirmar")
        self.btn_confirmar.clicked.connect(self._on_confirmar)
        self.btn_confirmar.setDefault(True)
        btn_layout.addWidget(self.btn_confirmar)
        
        layout.addLayout(btn_layout)
        
        self.input_senha.setFocus()
    
    def _on_confirmar(self):
        senha = self.input_senha.text()
        
        if not senha:
            QMessageBox.warning(self, "Erro", "Digite uma senha!")
            return
        
        if self.criar_senha:
            confirmar = self.input_confirmar.text()
            if senha != confirmar:
                QMessageBox.warning(self, "Erro", "As senhas não coincidem!")
                return
            if len(senha) < 4:
                QMessageBox.warning(self, "Erro", "A senha deve ter pelo menos 4 caracteres!")
                return
        
        self.senha = senha
        self.senha_valida = True
        self.accept()
    
    def get_senha(self) -> str:
        return self.senha


def solicitar_senha(parent, config, titulo="Digite a Senha") -> bool:
    """Abre diálogo de senha e retorna True se a senha estiver correta."""
    dialog = PasswordDialog(parent, titulo)
    if dialog.exec_() == QDialog.Accepted:
        return config.verificar_senha(dialog.get_senha())
    return False


def criar_senha(parent, config) -> bool:
    """Abre diálogo para criar nova senha. Retorna True se criada com sucesso."""
    dialog = PasswordDialog(parent, "Criar Senha dos Pais", criar_senha=True)
    if dialog.exec_() == QDialog.Accepted:
        config.set_senha(dialog.get_senha())
        return True
    return False
