from datetime import datetime
from typing import Optional
from enum import Enum


class StrikeAction(Enum):
    NONE = 0
    POPUP_AVISO = 1
    POPUP_FORTE = 2
    PENALIDADE_TEMPO = 3


class StrikeManager:
    """Sistema cumulativo de strikes por barulho.
    
    Volume acima do limite de grito = strike.
    Strikes acumulam infinitamente. A cada 3 strikes: aviso leve → aviso forte → penalidade de tempo.
    Penalidade configurável pela web (strike_penalty_minutes).
    """
    
    COOLDOWN_SECONDS = 10  # mínimo entre strikes para evitar spam
    
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._strikes = 0
        self._ultimo_strike_time: Optional[datetime] = None
    
    def get_penalty_minutes(self) -> int:
        return self.config.get("strike_penalty_minutes", 30)
    
    def processar_barulho(self, nivel_db: float) -> StrikeAction:
        """Processa nível de áudio atual. Retorna ação se strike ocorreu."""
        if not self.config.get("strikes_enabled", False):
            return StrikeAction.NONE
        
        limite_grito = self.config.get("volume_grito_db", 85)
        
        if nivel_db < limite_grito:
            return StrikeAction.NONE
        
        # Mini-cooldown para evitar múltiplos strikes no mesmo grito
        if self._ultimo_strike_time:
            elapsed = (datetime.now() - self._ultimo_strike_time).total_seconds()
            if elapsed < self.COOLDOWN_SECONDS:
                return StrikeAction.NONE
        
        self._strikes += 1
        self._ultimo_strike_time = datetime.now()
        
        self.logger.strike(self._strikes, nivel_db)
        
        posicao_ciclo = self._strikes % 3  # 1, 2, 0 (0 = penalidade)
        if posicao_ciclo == 1:
            return StrikeAction.POPUP_AVISO
        elif posicao_ciclo == 2:
            return StrikeAction.POPUP_FORTE
        else:  # posicao_ciclo == 0, múltiplo de 3
            return StrikeAction.PENALIDADE_TEMPO
    
    def get_strikes(self) -> int:
        return self._strikes
    
    def get_cycle_position(self) -> int:
        """Posição dentro do ciclo atual (1, 2 ou 3). Ex: 7 strikes = posição 1."""
        mod = self._strikes % 3
        return mod if mod != 0 else (3 if self._strikes > 0 else 0)
    
    def get_penalties_count(self) -> int:
        """Quantidade de penalidades já aplicadas."""
        return self._strikes // 3
    
    def reset_strikes(self):
        self._strikes = 0
        self._ultimo_strike_time = None
