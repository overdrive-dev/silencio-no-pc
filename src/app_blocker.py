"""Módulo de bloqueio de aplicativos.

Monitora processos ativos e encerra os que estão na lista de bloqueio (blacklist)
ou fora da lista de permissão (whitelist).
"""

import psutil
from typing import List, Dict, Any


# Processos do sistema que NUNCA devem ser encerrados
SYSTEM_PROCESSES = {
    "system", "system idle process", "registry", "smss.exe",
    "csrss.exe", "wininit.exe", "winlogon.exe", "lsass.exe",
    "services.exe", "svchost.exe", "dwm.exe", "explorer.exe",
    "taskhostw.exe", "taskhost.exe", "conhost.exe", "dllhost.exe",
    "sihost.exe", "fontdrvhost.exe", "searchindexer.exe",
    "searchhost.exe", "runtimebroker.exe", "spoolsv.exe",
    "ctfmon.exe", "audiodg.exe", "shellexperiencehost.exe",
    "startmenuexperiencehost.exe", "textinputhost.exe",
    "applicationframehost.exe", "securityhealthservice.exe",
    "securityhealthsystray.exe", "msmpeng.exe", "nissrv.exe",
    "smartscreen.exe", "sgrmbroker.exe", "comppkgsrv.exe",
    "msiexec.exe", "trustedinstaller.exe", "tiworker.exe",
    "wmiprvse.exe", "wudfhost.exe", "dashost.exe",
    "lsaiso.exe", "memory compression", "idle",
    # Python / KidsPC próprio
    "python.exe", "pythonw.exe", "python3.exe",
    # Rede e drivers
    "networkservice.exe", "localservice.exe",
}


class AppBlocker:
    """Monitora e bloqueia aplicativos baseado em regras do painel web."""
    
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._rules: List[str] = []  # lista de nomes de processo (lowercase)
        self._mode: str = "blacklist"  # 'blacklist' ou 'whitelist'
        self._enabled: bool = False
    
    def update_rules(self, apps: List[Dict[str, Any]], mode: str):
        """Atualiza regras de bloqueio. Chamado pelo RemoteSync."""
        self._rules = [a.get("name", "").lower().strip() for a in apps if a.get("name")]
        self._mode = mode if mode in ("blacklist", "whitelist") else "blacklist"
        self._enabled = len(self._rules) > 0
        
        if self._enabled:
            print(f"AppBlocker: {len(self._rules)} regras ({self._mode})")
    
    def check(self):
        """Verifica processos e encerra os bloqueados.
        
        Deve ser chamado periodicamente (a cada 3-5 segundos).
        """
        if not self._enabled:
            return
        
        for proc in psutil.process_iter(["name", "pid"]):
            try:
                pname = (proc.info.get("name") or "").lower()
                if not pname:
                    continue
                
                # Nunca matar processos do sistema
                if pname in SYSTEM_PROCESSES:
                    continue
                
                should_kill = False
                
                if self._mode == "blacklist":
                    # Blacklist: matar se está na lista
                    should_kill = pname in self._rules
                elif self._mode == "whitelist":
                    # Whitelist: matar se NÃO está na lista e NÃO é sistema
                    should_kill = pname not in self._rules
                
                if should_kill:
                    proc.terminate()
                    display = proc.info.get("name", pname)
                    print(f"AppBlocker: encerrado '{display}' (pid={proc.info['pid']})")
                    try:
                        self.logger.registrar_evento(
                            tipo="app_bloqueado",
                            descricao=f"Aplicativo bloqueado: {display}",
                        )
                    except Exception:
                        pass
                    
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
            except Exception as e:
                print(f"AppBlocker: erro ao verificar processo: {e}")
