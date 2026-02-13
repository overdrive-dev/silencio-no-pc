import subprocess


class Actions:
    """Ações do sistema simplificadas. Apenas shutdown remoto."""
    
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
    
    def shutdown_pc(self, delay_segundos: int = 30):
        """Desliga o PC após um delay."""
        try:
            subprocess.run(
                ["shutdown", "/s", "/t", str(delay_segundos),
                 "/c", "KidsPC: Desligamento remoto solicitado."],
                check=True
            )
        except Exception as e:
            print(f"Erro ao desligar PC: {e}")
    
    def cancelar_shutdown(self):
        """Cancela um shutdown agendado."""
        try:
            subprocess.run(["shutdown", "/a"], check=False, capture_output=True)
        except Exception:
            pass
