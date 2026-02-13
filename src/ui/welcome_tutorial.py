from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QStackedWidget, QWidget, QMessageBox
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont


class WelcomeTutorial(QDialog):
    """Tutorial de boas-vindas pós-pairing com 4 etapas.
    
    1. Boas-vindas — explica o que o KidsPC faz
    2. Calibração — inicia calibração automática do microfone
    3. Strikes — explica o sistema de strikes e que será ativado
    4. Pronto — confirma e ativa strikes
    """
    
    def __init__(self, config, logger, parent=None):
        super().__init__(parent)
        self.config = config
        self.logger = logger
        self.setWindowTitle("Tutorial KidsPC")
        self.setFixedSize(520, 420)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        
        self._calibration_done = False
        self._setup_ui()
    
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        layout.setContentsMargins(30, 25, 30, 25)
        
        # Step indicator
        self.label_step = QLabel("Etapa 1 de 4")
        self.label_step.setAlignment(Qt.AlignCenter)
        self.label_step.setFont(QFont("Segoe UI", 10))
        self.label_step.setStyleSheet("color: #6366f1;")
        layout.addWidget(self.label_step)
        
        # Stacked pages
        self.stack = QStackedWidget()
        self.stack.addWidget(self._page_welcome())
        self.stack.addWidget(self._page_calibration())
        self.stack.addWidget(self._page_strikes())
        self.stack.addWidget(self._page_done())
        layout.addWidget(self.stack)
        
        # Navigation buttons
        nav = QHBoxLayout()
        
        self.btn_back = QPushButton("← Voltar")
        self.btn_back.clicked.connect(self._go_back)
        self.btn_back.setVisible(False)
        nav.addWidget(self.btn_back)
        
        nav.addStretch()
        
        self.btn_next = QPushButton("Próximo →")
        self.btn_next.clicked.connect(self._go_next)
        self.btn_next.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.btn_next.setFixedHeight(40)
        self.btn_next.setFixedWidth(180)
        self.btn_next.setStyleSheet(
            "background-color: #4f46e5; color: white; border-radius: 8px;"
        )
        nav.addWidget(self.btn_next)
        
        layout.addLayout(nav)
    
    def _make_label(self, text, size=11, bold=False, center=False):
        lbl = QLabel(text)
        lbl.setWordWrap(True)
        weight = QFont.Bold if bold else QFont.Normal
        lbl.setFont(QFont("Segoe UI", size, weight))
        if center:
            lbl.setAlignment(Qt.AlignCenter)
        return lbl
    
    # ── Page 1: Welcome ──
    def _page_welcome(self):
        page = QWidget()
        lay = QVBoxLayout(page)
        lay.setSpacing(15)
        
        lay.addWidget(self._make_label("👋 Bem-vindo ao KidsPC!", 18, bold=True, center=True))
        lay.addWidget(self._make_label(
            "O KidsPC monitora o uso do computador e o volume do ambiente "
            "para ajudar no controle parental.\n\n"
            "Neste tutorial rápido vamos:\n"
            "• Calibrar o microfone para o ambiente\n"
            "• Ativar o sistema de strikes por barulho\n"
            "• Deixar tudo pronto para funcionar",
            11
        ))
        lay.addStretch()
        lay.addWidget(self._make_label(
            "O responsável pode ajustar tudo pelo painel web a qualquer momento.",
            9, center=True
        ))
        return page
    
    # ── Page 2: Calibration ──
    def _page_calibration(self):
        page = QWidget()
        lay = QVBoxLayout(page)
        lay.setSpacing(15)
        
        lay.addWidget(self._make_label("🎯 Calibração do Microfone", 18, bold=True, center=True))
        lay.addWidget(self._make_label(
            "Para que o sistema de strikes funcione corretamente, precisamos "
            "calibrar o microfone para o ambiente.\n\n"
            "A calibração automática monitora o som por 30 minutos e define "
            "os limites ideais entre som normal e barulho excessivo.",
            11
        ))
        
        self.btn_calibrar = QPushButton("▶️ Iniciar Calibração (30 min)")
        self.btn_calibrar.clicked.connect(self._start_calibration)
        self.btn_calibrar.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.btn_calibrar.setFixedHeight(45)
        self.btn_calibrar.setStyleSheet(
            "background-color: #059669; color: white; border-radius: 8px;"
        )
        lay.addWidget(self.btn_calibrar)
        
        self.label_calib_status = QLabel("")
        self.label_calib_status.setAlignment(Qt.AlignCenter)
        self.label_calib_status.setWordWrap(True)
        lay.addWidget(self.label_calib_status)
        
        lay.addStretch()
        lay.addWidget(self._make_label(
            "Você pode pular esta etapa e calibrar depois pelo ícone na barra de tarefas.",
            9, center=True
        ))
        return page
    
    # ── Page 3: Strikes ──
    def _page_strikes(self):
        page = QWidget()
        lay = QVBoxLayout(page)
        lay.setSpacing(15)
        
        lay.addWidget(self._make_label("⚠️ Sistema de Strikes", 18, bold=True, center=True))
        lay.addWidget(self._make_label(
            "O monitor de barulho funciona assim:\n\n"
            "• Strike 1 → Aviso leve na tela\n"
            "• Strike 2 → Aviso forte com som\n"
            "• Strike 3 → Penalidade de tempo\n\n"
            "Os strikes acumulam ao longo do dia. A cada 3 strikes, "
            "uma penalidade de tempo é aplicada. O ciclo se repete.\n\n"
            "O responsável pode resetar os strikes e ajustar a penalidade "
            "pelo painel web.",
            11
        ))
        lay.addStretch()
        
        if self._calibration_done:
            lay.addWidget(self._make_label(
                "✅ Calibração concluída! Os strikes serão ativados.",
                10, bold=True, center=True
            ))
        else:
            lay.addWidget(self._make_label(
                "Os strikes ficarão desativados até que a calibração seja feita.",
                10, center=True
            ))
        return page
    
    # ── Page 4: Done ──
    def _page_done(self):
        page = QWidget()
        lay = QVBoxLayout(page)
        lay.setSpacing(15)
        
        lay.addWidget(self._make_label("✅ Tudo Pronto!", 18, bold=True, center=True))
        
        self.label_resumo = QLabel()
        self.label_resumo.setWordWrap(True)
        self.label_resumo.setFont(QFont("Segoe UI", 11))
        self.label_resumo.setAlignment(Qt.AlignCenter)
        lay.addWidget(self.label_resumo)
        
        lay.addStretch()
        lay.addWidget(self._make_label(
            "O KidsPC está rodando em segundo plano.\n"
            "Acesse o ícone na barra de tarefas para opções.",
            10, center=True
        ))
        return page
    
    def _start_calibration(self):
        from .auto_calibration import AutoCalibrationDialog
        dialog = AutoCalibrationDialog(self.config, self.logger, self)
        result = dialog.exec_()
        
        if result == QDialog.Accepted:
            self._calibration_done = True
            self.config.set("calibration_done", True)
            self.config.set("strikes_enabled", True)
            self.label_calib_status.setText(
                "✅ Calibração concluída! Limites configurados automaticamente."
            )
            self.label_calib_status.setStyleSheet("color: #059669; font-weight: bold;")
            self.btn_calibrar.setText("✅ Calibração Concluída")
            self.btn_calibrar.setEnabled(False)
        else:
            self.label_calib_status.setText(
                "Calibração cancelada. Você pode fazê-la depois pelo ícone na barra de tarefas."
            )
            self.label_calib_status.setStyleSheet("color: #d97706;")
    
    def _update_nav(self):
        idx = self.stack.currentIndex()
        total = self.stack.count()
        
        self.label_step.setText(f"Etapa {idx + 1} de {total}")
        self.btn_back.setVisible(idx > 0)
        
        if idx == total - 1:
            self.btn_next.setText("Concluir ✓")
        else:
            self.btn_next.setText("Próximo →")
        
        # Refresh page 3 (strikes) text when navigating to it
        if idx == 2:
            page = self.stack.widget(2)
            # Rebuild page 3 to reflect calibration status
            pass
        
        # Update page 4 summary
        if idx == 3:
            calib = "✅ Calibração feita" if self._calibration_done else "⏳ Calibração pendente"
            strikes = "✅ Strikes ativados" if self._calibration_done else "❌ Strikes desativados (calibre primeiro)"
            self.label_resumo.setText(
                f"Resumo da configuração:\n\n"
                f"{calib}\n"
                f"{strikes}\n\n"
                f"O programa já está monitorando!"
            )
    
    def _go_next(self):
        idx = self.stack.currentIndex()
        if idx >= self.stack.count() - 1:
            self.accept()
            return
        self.stack.setCurrentIndex(idx + 1)
        self._update_nav()
    
    def _go_back(self):
        idx = self.stack.currentIndex()
        if idx > 0:
            self.stack.setCurrentIndex(idx - 1)
            self._update_nav()
