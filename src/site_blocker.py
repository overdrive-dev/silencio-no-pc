"""Módulo de bloqueio de sites via hosts file do Windows.

Adiciona entradas no hosts file redirecionando domínios bloqueados para 127.0.0.1.
Marcadores delimitam a seção do KidsPC para fácil limpeza.
"""

import os
from typing import List, Dict, Any

HOSTS_PATH = r"C:\Windows\System32\drivers\etc\hosts"
MARKER_START = "# === KidsPC Blocked Sites START ==="
MARKER_END = "# === KidsPC Blocked Sites END ==="


class SiteBlocker:
    """Gerencia bloqueio de sites via hosts file."""
    
    def __init__(self, config, logger):
        self.config = config
        self.logger = logger
        self._domains: List[str] = []
        self._enabled: bool = False
    
    def update_rules(self, sites: List[Dict[str, Any]]):
        """Atualiza lista de sites bloqueados. Chamado pelo RemoteSync."""
        new_domains = sorted([
            s.get("domain", "").lower().strip()
            for s in sites
            if s.get("domain")
        ])
        
        if new_domains == sorted(self._domains):
            return
        
        self._domains = new_domains
        self._enabled = len(self._domains) > 0
        
        if self._enabled:
            print(f"SiteBlocker: {len(self._domains)} domínios bloqueados")
        
        self._apply()
    
    def _apply(self):
        """Reescreve a seção KidsPC no hosts file."""
        try:
            # Ler conteúdo atual do hosts
            current = ""
            if os.path.exists(HOSTS_PATH):
                with open(HOSTS_PATH, "r", encoding="utf-8") as f:
                    current = f.read()
            
            # Remover seção KidsPC existente
            cleaned = self._strip_kidspc_section(current)
            
            # Se não há domínios, apenas limpar
            if not self._domains:
                if MARKER_START in current:
                    # Havia seção antes, remover
                    self._write_hosts(cleaned)
                return
            
            # Gerar novas entradas
            lines = [MARKER_START]
            for domain in self._domains:
                lines.append(f"127.0.0.1 {domain}")
                # Também bloquear variante www
                if not domain.startswith("www."):
                    lines.append(f"127.0.0.1 www.{domain}")
            lines.append(MARKER_END)
            
            new_section = "\n".join(lines)
            
            # Garantir newline antes da seção
            if cleaned and not cleaned.endswith("\n"):
                cleaned += "\n"
            
            final = cleaned + "\n" + new_section + "\n"
            
            self._write_hosts(final)
            
            print(f"SiteBlocker: hosts file atualizado ({len(self._domains)} domínios)")
            
        except PermissionError:
            print("SiteBlocker: sem permissão para editar hosts file (precisa de admin)")
        except Exception as e:
            print(f"SiteBlocker: erro ao atualizar hosts: {e}")
    
    def _strip_kidspc_section(self, content: str) -> str:
        """Remove a seção KidsPC do conteúdo do hosts file."""
        lines = content.split("\n")
        result = []
        inside_section = False
        
        for line in lines:
            if line.strip() == MARKER_START:
                inside_section = True
                continue
            if line.strip() == MARKER_END:
                inside_section = False
                continue
            if not inside_section:
                result.append(line)
        
        # Remover linhas em branco extras no final
        while result and result[-1].strip() == "":
            result.pop()
        
        return "\n".join(result)
    
    def _write_hosts(self, content: str):
        """Escreve conteúdo no hosts file."""
        with open(HOSTS_PATH, "w", encoding="utf-8") as f:
            f.write(content)
    
    def cleanup(self):
        """Remove entradas do KidsPC do hosts file.
        
        Chamado no shutdown gracioso do app.
        """
        try:
            if not os.path.exists(HOSTS_PATH):
                return
            
            with open(HOSTS_PATH, "r", encoding="utf-8") as f:
                current = f.read()
            
            if MARKER_START not in current:
                return
            
            cleaned = self._strip_kidspc_section(current)
            self._write_hosts(cleaned)
            
            print("SiteBlocker: hosts file limpo")
            
        except Exception as e:
            print(f"SiteBlocker: erro ao limpar hosts: {e}")
