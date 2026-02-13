import ctypes
import time
from threading import Thread, Event
from typing import Optional


class ScreenLocker:
    """Controla bloqueio da tela do Windows.
    
    Quando ativado, bloqueia a tela e re-bloqueia se o usuário desbloquear manualmente.
    """
    
    def __init__(self):
        self._enforce_lock = False
        self._running = Event()
        self._thread: Optional[Thread] = None
    
    def lock(self):
        """Bloqueia a tela do Windows."""
        try:
            ctypes.windll.user32.LockWorkStation()
        except Exception as e:
            print(f"Erro ao bloquear tela: {e}")
    
    def start_enforcement(self):
        """Inicia enforcement: bloqueia e re-bloqueia se desbloqueado."""
        self._enforce_lock = True
        self.lock()
        if not self._thread or not self._thread.is_alive():
            self._running.set()
            self._thread = Thread(target=self._enforce_loop, daemon=True)
            self._thread.start()
    
    def stop_enforcement(self):
        """Para o enforcement de bloqueio."""
        self._enforce_lock = False
        self._running.clear()
        if self._thread:
            self._thread.join(timeout=2)
            self._thread = None
    
    def is_enforcing(self) -> bool:
        """Retorna se está em modo enforcement."""
        return self._enforce_lock
    
    def _is_session_locked(self) -> bool:
        """Detecta se a sessão do Windows está bloqueada.
        
        Usa OpenInputDesktop - se retorna NULL, a sessão está bloqueada.
        """
        try:
            hdesk = ctypes.windll.user32.OpenInputDesktop(0, False, 0x0100)
            if hdesk:
                ctypes.windll.user32.CloseDesktop(hdesk)
                return False
            return True
        except Exception:
            return False
    
    def _enforce_loop(self):
        """Loop que re-bloqueia a tela se o usuário desbloquear."""
        while self._running.is_set() and self._enforce_lock:
            try:
                if not self._is_session_locked():
                    time.sleep(2)
                    if self._enforce_lock and not self._is_session_locked():
                        self.lock()
                time.sleep(10)
            except Exception as e:
                print(f"Erro no enforce loop: {e}")
                time.sleep(10)
