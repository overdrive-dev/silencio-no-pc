from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QSlider, QSpinBox,
    QPushButton, QGroupBox, QFormLayout, QTimeEdit, QCheckBox,
    QFileDialog, QTabWidget, QWidget, QTableWidget, QTableWidgetItem,
    QHeaderView, QLineEdit, QMessageBox
)
from PyQt5.QtCore import Qt, QTime
from pathlib import Path

class ConfigDialog(QDialog):
    def __init__(self, config, logger, audio_monitor=None, parent=None):
        super().__init__(parent)
        self.config = config
        self.logger = logger
        self.audio_monitor = audio_monitor
        self.setWindowTitle("⚙️ Configurações - Silêncio no PC")
        self.setMinimumSize(550, 650)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        
        self._setup_ui()
        self._load_config()
    
    def _setup_ui(self):
        layout = QVBoxLayout(self)
        
        self.tabs = QTabWidget()
        layout.addWidget(self.tabs)
        
        self.tab_geral = QWidget()
        self.tabs.addTab(self.tab_geral, "Geral")
        self._setup_tab_geral()
        
        self.tab_horarios = QWidget()
        self.tabs.addTab(self.tab_horarios, "Horários")
        self._setup_tab_horarios()
        
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
        btn_layout.addWidget(self.btn_salvar)
        
        layout.addLayout(btn_layout)
    
    def _setup_tab_geral(self):
        layout = QVBoxLayout(self.tab_geral)
        
        grupo_limites = QGroupBox("🎚️ Configurar Limites (visualização em tempo real)")
        limites_layout = QVBoxLayout(grupo_limites)
        
        from .live_threshold_widget import LiveThresholdWidget
        self.live_widget = LiveThresholdWidget(self.audio_monitor, self.config, self)
        self.live_widget.threshold_changed.connect(self._on_threshold_changed)
        limites_layout.addWidget(self.live_widget)
        
        layout.addWidget(grupo_limites)
        
        grupo_calibracao = QGroupBox("Calibração")
        calib_layout = QVBoxLayout(grupo_calibracao)
        
        ruido_atual = self.config.get("ruido_ambiente_db", 40)
        self.label_ruido_ambiente = QLabel(f"Ruído ambiente: {ruido_atual:.1f} dB")
        calib_layout.addWidget(self.label_ruido_ambiente)
        
        btn_calib_layout = QHBoxLayout()
        
        self.btn_recalibrar = QPushButton("🎤 Rápida (30s)")
        self.btn_recalibrar.clicked.connect(self._on_calibrar)
        btn_calib_layout.addWidget(self.btn_recalibrar)
        
        self.btn_auto_calibrar = QPushButton("🎯 Automática (30 min)")
        self.btn_auto_calibrar.clicked.connect(self._on_auto_calibrar)
        self.btn_auto_calibrar.setToolTip("Monitora o uso normal por 30 minutos e define os limites automaticamente")
        btn_calib_layout.addWidget(self.btn_auto_calibrar)
        
        calib_layout.addLayout(btn_calib_layout)
        
        layout.addWidget(grupo_calibracao)
        
        grupo_tempo = QGroupBox("Tempos")
        form_tempo = QFormLayout(grupo_tempo)
        
        self.spin_janela = QSpinBox()
        self.spin_janela.setRange(5, 60)
        self.spin_janela.setSuffix(" segundos")
        form_tempo.addRow("Janela Média Móvel:", self.spin_janela)
        
        self.spin_cooldown = QSpinBox()
        self.spin_cooldown.setRange(10, 120)
        self.spin_cooldown.setSuffix(" segundos")
        form_tempo.addRow("Cooldown entre Strikes:", self.spin_cooldown)
        
        self.spin_reset = QSpinBox()
        self.spin_reset.setRange(5, 120)
        self.spin_reset.setSuffix(" minutos")
        form_tempo.addRow("Reset Strikes após:", self.spin_reset)
        
        self.spin_bloqueio = QSpinBox()
        self.spin_bloqueio.setRange(1, 24)
        self.spin_bloqueio.setSuffix(" horas")
        form_tempo.addRow("Bloqueio Internet:", self.spin_bloqueio)
        
        layout.addWidget(grupo_tempo)
        
        grupo_audio = QGroupBox("Áudio de Aviso (2º Strike)")
        audio_layout = QHBoxLayout(grupo_audio)
        
        self.input_audio = QLineEdit()
        self.input_audio.setPlaceholderText("Selecione um arquivo de áudio...")
        self.input_audio.setReadOnly(True)
        audio_layout.addWidget(self.input_audio)
        
        self.btn_audio = QPushButton("📁 Escolher")
        self.btn_audio.clicked.connect(self._on_escolher_audio)
        audio_layout.addWidget(self.btn_audio)
        
        layout.addWidget(grupo_audio)
        
        grupo_senha = QGroupBox("Alterar Senha")
        senha_layout = QHBoxLayout(grupo_senha)
        
        self.btn_alterar_senha = QPushButton("🔐 Alterar Senha dos Pais")
        self.btn_alterar_senha.clicked.connect(self._on_alterar_senha)
        senha_layout.addWidget(self.btn_alterar_senha)
        
        layout.addWidget(grupo_senha)
        
        layout.addStretch()
    
    def _setup_tab_horarios(self):
        layout = QVBoxLayout(self.tab_horarios)
        
        grupo_horario = QGroupBox("Horário de Funcionamento")
        form_horario = QFormLayout(grupo_horario)
        
        self.time_inicio = QTimeEdit()
        self.time_inicio.setDisplayFormat("HH:mm")
        form_horario.addRow("Início:", self.time_inicio)
        
        self.time_fim = QTimeEdit()
        self.time_fim.setDisplayFormat("HH:mm")
        form_horario.addRow("Fim:", self.time_fim)
        
        layout.addWidget(grupo_horario)
        
        grupo_dias = QGroupBox("Dias Ativos")
        dias_layout = QVBoxLayout(grupo_dias)
        
        self.checks_dias = []
        dias_nomes = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
        
        for i, nome in enumerate(dias_nomes):
            check = QCheckBox(nome)
            self.checks_dias.append(check)
            dias_layout.addWidget(check)
        
        layout.addWidget(grupo_dias)
        layout.addStretch()
    
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
    
    def _on_threshold_changed(self, limite_media, limite_pico):
        ruido = self.config.get("ruido_ambiente_db", 40)
        self._limite_media_temp = limite_media
        self._limite_pico_temp = limite_pico
    
    def _load_config(self):
        ruido = self.config.get("ruido_ambiente_db", 40)
        offset_media = self.config.get("offset_media_db", 30)
        offset_pico = self.config.get("offset_pico_db", 45)
        self._limite_media_temp = ruido + offset_media
        self._limite_pico_temp = ruido + offset_pico
        
        self.spin_janela.setValue(self.config.get("janela_media_segundos", 10))
        self.spin_cooldown.setValue(self.config.get("cooldown_strikes_segundos", 30))
        self.spin_reset.setValue(self.config.get("reset_strikes_minutos", 30))
        self.spin_bloqueio.setValue(self.config.get("bloqueio_internet_horas", 2))
        
        audio_path = self.config.get("audio_aviso_path", "")
        self.input_audio.setText(audio_path)
        
        horario_inicio = self.config.get("horario_inicio", "08:00")
        horario_fim = self.config.get("horario_fim", "22:00")
        self.time_inicio.setTime(QTime.fromString(horario_inicio, "HH:mm"))
        self.time_fim.setTime(QTime.fromString(horario_fim, "HH:mm"))
        
        dias_ativos = self.config.get("dias_ativos", [0, 1, 2, 3, 4, 5, 6])
        for i, check in enumerate(self.checks_dias):
            check.setChecked(i in dias_ativos)
    
    def closeEvent(self, event):
        if hasattr(self, 'live_widget'):
            self.live_widget.stop()
        super().closeEvent(event)
    
    def _on_escolher_audio(self):
        arquivo, _ = QFileDialog.getOpenFileName(
            self, "Escolher Áudio de Aviso",
            "", "Arquivos de Áudio (*.wav *.mp3 *.ogg);;Todos (*.*)"
        )
        if arquivo:
            self.input_audio.setText(arquivo)
    
    def _on_calibrar(self):
        from .calibration_dialog import CalibrationDialog
        dialog = CalibrationDialog(self.config, self.logger, self)
        dialog.exec_()
        self._atualizar_apos_calibracao()
    
    def _on_auto_calibrar(self):
        from .auto_calibration import AutoCalibrationDialog
        dialog = AutoCalibrationDialog(self.config, self.logger, self)
        dialog.exec_()
        self._atualizar_apos_calibracao()
    
    def _atualizar_apos_calibracao(self):
        ruido = self.config.get("ruido_ambiente_db", 40)
        self.label_ruido_ambiente.setText(f"Ruído ambiente: {ruido:.1f} dB")
        if hasattr(self, 'live_widget'):
            offset_media = self.config.get("offset_media_db", 35)
            offset_pico = self.config.get("offset_pico_db", 50)
            self.live_widget.slider_media.setValue(int(ruido + offset_media))
            self.live_widget.slider_pico.setValue(int(ruido + offset_pico))
    
    def _on_alterar_senha(self):
        from ..password_manager import criar_senha
        if criar_senha(self, self.config):
            QMessageBox.information(self, "Sucesso", "Senha alterada com sucesso!")
    
    def _on_salvar(self):
        ruido = self.config.get("ruido_ambiente_db", 40)
        limite_media, limite_pico = self.live_widget.get_limites()
        self.config.set("offset_media_db", int(limite_media - ruido))
        self.config.set("offset_pico_db", int(limite_pico - ruido))
        
        self.live_widget.stop()
        self.config.set("janela_media_segundos", self.spin_janela.value())
        self.config.set("cooldown_strikes_segundos", self.spin_cooldown.value())
        self.config.set("reset_strikes_minutos", self.spin_reset.value())
        self.config.set("bloqueio_internet_horas", self.spin_bloqueio.value())
        self.config.set("audio_aviso_path", self.input_audio.text())
        self.config.set("horario_inicio", self.time_inicio.time().toString("HH:mm"))
        self.config.set("horario_fim", self.time_fim.time().toString("HH:mm"))
        
        dias_ativos = [i for i, check in enumerate(self.checks_dias) if check.isChecked()]
        self.config.set("dias_ativos", dias_ativos)
        
        self.accept()
