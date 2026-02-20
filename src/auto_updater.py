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
            is_installer = False
            for asset in release.get("assets", []):
                if asset["name"].endswith(".exe"):
                    if "setup" in asset["name"].lower():
                        download_url = asset["browser_download_url"]
                        is_installer = True
                        break
                    fallback_url = asset["browser_download_url"]
            if not download_url:
                download_url = fallback_url
            
            return {
                "version": version,
                "download_url": download_url,
                "changelog": release.get("body", ""),
                "force_update": False,
                "is_installer": is_installer,
            }
        except Exception as e:
            print(f"AutoUpdater: erro ao verificar: {e}")
            return None
    
    def download_update(self, download_url: str, on_progress: Optional[Callable] = None,
                        cancel_check: Optional[Callable] = None) -> Optional[str]:
        """Baixa o update para pasta temporária. Retorna caminho do arquivo.
        
        on_progress(downloaded_bytes, total_bytes) — chamado a cada chunk.
        cancel_check() — retorna True se download deve ser cancelado.
        """
        try:
            import httpx
            
            temp_dir = tempfile.gettempdir()
            temp_path = os.path.join(temp_dir, "KidsPC_update.exe")
            
            print(f"AutoUpdater: baixando de {download_url}...")
            
            timeout = httpx.Timeout(connect=30, read=300, write=300, pool=300)
            with httpx.stream("GET", download_url, follow_redirects=True, timeout=timeout) as response:
                response.raise_for_status()
                total = int(response.headers.get("content-length", 0))
                downloaded = 0
                with open(temp_path, "wb") as f:
                    for chunk in response.iter_bytes(chunk_size=65536):
                        if cancel_check and cancel_check():
                            print("AutoUpdater: download cancelado pelo usuário")
                            return None
                        f.write(chunk)
                        downloaded += len(chunk)
                        if on_progress:
                            on_progress(downloaded, total)
            
            print(f"AutoUpdater: download concluído: {temp_path}")
            return temp_path
        except Exception as e:
            print(f"AutoUpdater: erro ao baixar: {e}")
            return None
    
    def apply_update(self, installer_path: str, is_installer: bool = False):
        """Aplica a atualização via script .bat temporário.
        
        Se is_installer=True (Inno Setup):
        1. Espera o processo atual encerrar
        2. Executa o instalador em modo silencioso (/VERYSILENT)
        3. O instalador substitui os arquivos e reinicia o app via [Run]
        
        Se is_installer=False (exe avulso):
        1. Espera o processo atual encerrar
        2. Copia o novo exe sobre o antigo
        3. Reinicia o app
        """
        try:
            current_exe = sys.executable if getattr(sys, 'frozen', False) else None
            
            if not current_exe:
                # Dev mode — apenas abre o instalador/exe
                subprocess.Popen(
                    [installer_path],
                    creationflags=subprocess.DETACHED_PROCESS,
                )
                print("AutoUpdater: novo executável iniciado (dev mode)")
                sys.exit(0)
                return
            
            bat_path = os.path.join(tempfile.gettempdir(), "kidspc_update.bat")
            with open(bat_path, "w") as f:
                f.write('@echo off\n')
                f.write('echo Atualizando KidsPC...\n')
                f.write('timeout /t 5 /nobreak >nul\n')
                f.write('taskkill /F /IM KidsPC.exe >nul 2>&1\n')
                f.write('timeout /t 2 /nobreak >nul\n')
                
                if is_installer:
                    # Executa o Inno Setup installer silenciosamente.
                    # O instalador fecha o app via CloseApplications=force,
                    # instala os novos arquivos e reinicia via seção [Run].
                    f.write(f'"{installer_path}" /VERYSILENT /SUPPRESSMSGBOXES /CLOSEAPPLICATIONS\n')
                else:
                    # Exe avulso — copia sobre o atual e reinicia
                    f.write(f'copy /Y "{installer_path}" "{current_exe}"\n')
                    f.write(f'start "" "{current_exe}"\n')
                
                f.write(f'del "{installer_path}"\n')
                f.write('del "%~f0"\n')
            
            subprocess.Popen(
                ["cmd", "/c", bat_path],
                creationflags=subprocess.DETACHED_PROCESS | subprocess.CREATE_NO_WINDOW,
            )
            
            print("AutoUpdater: script de update iniciado, encerrando app...")
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
        
        self.apply_update(exe_path, is_installer=update.get("is_installer", False))
        return True
