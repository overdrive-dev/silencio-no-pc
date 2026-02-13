from PyQt5.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QSlider,
    QPushButton, QGroupBox, QTabWidget, QWidget, QTableWidget, QTableWidgetItem,
    QHeaderView, QMessageBox
)
from PyQt5.QtCore import Qt


class ConfigDialog(QDialog):
    def __init__(self, config, logger, audio_monitor=None, parent=None):
        super().__init__(parent)
        self.config = config
        self.logger = logger
        self.audio_monitor = audio_monitor
        self.setWindowTitle("⚙️ Configurações - KidsPC")
        self.setMinimumSize(450, 500)
        self.setWindowFlags(self.windowFlags() | Qt.WindowStaysOnTopHint)
        
        self._setup_ui()
        self._load_config()
    
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
        btn_layout.addWidget(self.btn_salvar)
        
        layout.addLayout(btn_layout)
    
    def _setup_tab_volume(self):
        layout = QVBoxLayout(self.tab_volume)
        
        info = QLabel(
            "Configure os limites de volume.\n"
            "Atenção: aviso visual na tela.\n"
            "Grito: gera um strike (3 strikes = penalidade)."
        )
        info.setWordWrap(True)
        info.setStyleSheet("color: #888; margin-bottom: 8px;")
        layout.addWidget(info)
        
        # Atenção slider
        grupo_atencao = QGroupBox("⚠️ Nível de Atenção")
        atencao_layout = QVBoxLayout(grupo_atencao)
        
        self.label_atencao = QLabel()
        atencao_layout.addWidget(self.label_atencao)
        
        self.slider_atencao = QSlider(Qt.Horizontal)
        self.slider_atencao.setRange(40, 100)
        self.slider_atencao.valueChanged.connect(self._on_atencao_changed)
        atencao_layout.addWidget(self.slider_atencao)
        
        layout.addWidget(grupo_atencao)
        
        # Grito slider
        grupo_grito = QGroupBox("🔴 Nível de Grito (Strike)")
        grito_layout = QVBoxLayout(grupo_grito)
        
        self.label_grito = QLabel()
        grito_layout.addWidget(self.label_grito)
        
        self.slider_grito = QSlider(Qt.Horizontal)
        self.slider_grito.setRange(50, 110)
        self.slider_grito.valueChanged.connect(self._on_grito_changed)
        grito_layout.addWidget(self.slider_grito)
        
        layout.addWidget(grupo_grito)
        
        note = QLabel("Horários, horas por dia, penalidades e senha são configurados pelo painel web.")
        note.setWordWrap(True)
        note.setStyleSheet("color: #666; font-size: 11px; margin-top: 12px;")
        layout.addWidget(note)
        
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
    
    def _on_atencao_changed(self, value):
        self.label_atencao.setText(f"Limite: {value} dB")
    
    def _on_grito_changed(self, value):
        self.label_grito.setText(f"Limite: {value} dB")
    
    def _load_config(self):
        atencao = self.config.get("volume_atencao_db", 70)
        grito = self.config.get("volume_grito_db", 85)
        
        self.slider_atencao.setValue(atencao)
        self.slider_grito.setValue(grito)
        self.label_atencao.setText(f"Limite: {atencao} dB")
        self.label_grito.setText(f"Limite: {grito} dB")
    
    def _on_salvar(self):
        atencao = self.slider_atencao.value()
        grito = self.slider_grito.value()
        
        if atencao >= grito:
            QMessageBox.warning(self, "Erro", "O nível de atenção deve ser menor que o de grito.")
            return
        
        self.config.set("volume_atencao_db", atencao)
        self.config.set("volume_grito_db", grito)
        
        self.accept()
