from datetime import datetime, timedelta
from typing import Optional, Callable
from enum import Enum

class StrikeAction(Enum):
    NONE = 0
    POPUP_ABAIXE = 1
    AUDIO_AVISO = 2
    POPUP_ULTIMO_AVISO = 3
    REINICIAR_PC = 4
    BLOQUEAR_INTERNET = 5

class StrikeManager:
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._strikes = 0
        self._ultimo_strike_time: Optional[datetime] = None
        self._em_cooldown = False
        self._pc_reiniciado_recentemente = False
        self._ciclo_completo_apos_reinicio = False
        
        self._on_action_callback: Optional[Callable] = None
    
    def set_action_callback(self, callback: Callable):
        self._on_action_callback = callback
    
    def _esta_em_horario_ativo(self) -> bool:
        agora = datetime.now()
        dia_semana = agora.weekday()
        
        dias_ativos = self.config.get("dias_ativos", [0, 1, 2, 3, 4, 5, 6])
        if dia_semana not in dias_ativos:
            return False
        
        horario_inicio = self.config.get("horario_inicio", "08:00")
        horario_fim = self.config.get("horario_fim", "22:00")
        
        try:
            inicio = datetime.strptime(horario_inicio, "%H:%M").time()
            fim = datetime.strptime(horario_fim, "%H:%M").time()
            hora_atual = agora.time()
            
            if inicio <= fim:
                return inicio <= hora_atual <= fim
            else:
                return hora_atual >= inicio or hora_atual <= fim
        except Exception:
            return True
    
    def _verificar_cooldown(self) -> bool:
        if self._ultimo_strike_time is None:
            return False
        
        cooldown_segundos = self.config.get("cooldown_strikes_segundos", 30)
        tempo_desde_ultimo = (datetime.now() - self._ultimo_strike_time).total_seconds()
        
        return tempo_desde_ultimo < cooldown_segundos
    
    def _verificar_reset_strikes(self):
        if self._ultimo_strike_time is None:
            return
        
        reset_minutos = self.config.get("reset_strikes_minutos", 30)
        tempo_desde_ultimo = (datetime.now() - self._ultimo_strike_time).total_seconds() / 60
        
        if tempo_desde_ultimo >= reset_minutos:
            self._strikes = 0
            self._pc_reiniciado_recentemente = False
            self._ciclo_completo_apos_reinicio = False
    
    def processar_barulho(self, nivel_db: float, media_db: float, pico_db: float) -> StrikeAction:
        if not self._esta_em_horario_ativo():
            return StrikeAction.NONE
        
        self._verificar_reset_strikes()
        
        if self._verificar_cooldown():
            return StrikeAction.NONE
        
        ruido_ambiente = self.config.get("ruido_ambiente_db", 40)
        offset_media = self.config.get("offset_media_db", 30)
        offset_pico = self.config.get("offset_pico_db", 45)
        
        limite_media_ajustado = ruido_ambiente + offset_media
        limite_pico_ajustado = ruido_ambiente + offset_pico
        
        ultrapassou_media = media_db > limite_media_ajustado
        ultrapassou_pico = pico_db > limite_pico_ajustado
        
        if not ultrapassou_media and not ultrapassou_pico:
            return StrikeAction.NONE
        
        if self._strikes >= 4:
            return StrikeAction.NONE
        
        self._strikes += 1
        self._ultimo_strike_time = datetime.now()
        
        self.logger.strike(self._strikes, nivel_db)
        
        if self._strikes == 1:
            return StrikeAction.POPUP_ABAIXE
        elif self._strikes == 2:
            return StrikeAction.AUDIO_AVISO
        elif self._strikes == 3:
            return StrikeAction.POPUP_ULTIMO_AVISO
        elif self._strikes == 4:
            if self._pc_reiniciado_recentemente:
                return StrikeAction.BLOQUEAR_INTERNET
            else:
                self._pc_reiniciado_recentemente = True
                return StrikeAction.REINICIAR_PC
        
        return StrikeAction.NONE
    
    def get_strikes(self) -> int:
        return self._strikes
    
    def reset_strikes(self):
        self._strikes = 0
        self._ultimo_strike_time = None
        self._pc_reiniciado_recentemente = False
        self._ciclo_completo_apos_reinicio = False
    
    def marcar_reinicio_recente(self):
        """Chamado quando o programa inicia após um reinício forçado."""
        self._pc_reiniciado_recentemente = True
        self._strikes = 0
