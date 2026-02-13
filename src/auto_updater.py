import os
import sys
import tempfile
import subprocess
from typing import Optional, Callable

GITHUB_REPO = "overdrive-dev/silencio-no-pc"
GITHUB_API = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"


class AutoUpdater:
    """Verifica e aplica atualizações automáticas via GitHub Releases."""
    
    def __init__(self, current_version: str, on_update_available: Optional[Callable] = None):
        self.current_version = current_version
        self.on_update_available = on_update_available
    
    def _compare_versions(self, v1: str, v2: str) -> int:
        """Compara versões. Retorna >0 se v1>v2, <0 se v1<v2, 0 se iguais."""
        parts1 = [int(x) for x in v1.strip("v").split(".")]
        parts2 = [int(x) for x in v2.strip("v").split(".")]
        for a, b in zip(parts1, parts2):
            if a != b:
                return a - b
        return len(parts1) - len(parts2)
    
    def check_for_update(self) -> Optional[dict]:
        """Verifica se há atualização no GitHub Releases.
        
        Retorna dict com info da versão nova ou None se não há update.
        """
        try:
            import httpx
            
            resp = httpx.get(GITHUB_API, timeout=10, follow_redirects=True)
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            
            release = resp.json()
            tag = release.get("tag_name", "")
            version = tag.strip("v")
            
            if not version or self._compare_versions(version, self.current_version) <= 0:
                return None
            
            # Prioriza instalador Setup, fallback para qualquer .exe
            download_url = None
            fallback_url = None
            for asset in release.get("assets", []):
                if asset["name"].endswith(".exe"):
                    if "setup" in asset["name"].lower():
                        download_url = asset["browser_download_url"]
                        break
                    fallback_url = asset["browser_download_url"]
            if not download_url:
                download_url = fallback_url
            
            return {
                "version": version,
                "download_url": download_url,
                "changelog": release.get("body", ""),
                "force_update": False,
            }
        except Exception as e:
            print(f"AutoUpdater: erro ao verificar: {e}")
            return None
    
    def download_update(self, download_url: str) -> Optional[str]:
        """Baixa o update para pasta temporária. Retorna caminho do arquivo."""
        try:
            import httpx
            
            temp_dir = tempfile.gettempdir()
            temp_path = os.path.join(temp_dir, "KidsPC_update.exe")
            
            print(f"AutoUpdater: baixando de {download_url}...")
            
            with httpx.stream("GET", download_url, follow_redirects=True) as response:
                response.raise_for_status()
                with open(temp_path, "wb") as f:
                    for chunk in response.iter_bytes(chunk_size=8192):
                        f.write(chunk)
            
            print(f"AutoUpdater: download concluído: {temp_path}")
            return temp_path
        except Exception as e:
            print(f"AutoUpdater: erro ao baixar: {e}")
            return None
    
    def apply_update(self, installer_path: str):
        """Aplica a atualização executando o instalador Inno Setup silencioso.
        
        O instalador lida com:
        - Substituição de arquivos em uso
        - Permissões de admin
        - Reinício do app
        """
        try:
            subprocess.Popen(
                [installer_path, "/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART"],
                creationflags=subprocess.DETACHED_PROCESS,
            )
            
            print("AutoUpdater: instalador iniciado, encerrando app...")
            sys.exit(0)
            
        except Exception as e:
            print(f"AutoUpdater: erro ao aplicar update: {e}")
    
    def check_and_apply(self, force: bool = False) -> bool:
        """Fluxo completo: verifica, baixa e aplica (se force_update ou force=True).
        
        Retorna True se update foi aplicado (app vai reiniciar).
        """
        update = self.check_for_update()
        if not update:
            return False
        
        print(f"AutoUpdater: versão {update['version']} disponível (atual: {self.current_version})")
        
        if not update["force_update"] and not force:
            if self.on_update_available:
                self.on_update_available(update)
            return False
        
        if not update["download_url"]:
            print("AutoUpdater: sem URL de download")
            return False
        
        exe_path = self.download_update(update["download_url"])
        if not exe_path:
            return False
        
        self.apply_update(exe_path)
        return True
