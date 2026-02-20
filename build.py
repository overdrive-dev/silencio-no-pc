"""
Script para criar o executável instalável do KidsPC
"""
import subprocess
import sys
import re
from pathlib import Path

def get_version():
    """Lê a versão do main.py"""
    main_py = Path(__file__).parent / "src" / "main.py"
    content = main_py.read_text(encoding="utf-8")
    match = re.search(r'__version__\s*=\s*["\']([^"\']+)["\']', content)
    if match:
        return match.group(1)
    return "1.0.0"

def build():
    project_dir = Path(__file__).parent
    src_dir = project_dir / "src"
    assets_dir = project_dir / "assets"
    
    version = get_version()
    exe_name = f"KidsPC_v{version}"
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--windowed",
        f"--name={exe_name}",
        f"--add-data={assets_dir};assets",
        "--hidden-import=pycaw",
        "--hidden-import=comtypes",
        "--hidden-import=numpy",
        "--hidden-import=supabase",
        "--hidden-import=httpx",
        "--hidden-import=qrcode",
        str(src_dir / "main.py")
    ]
    
    icon_path = assets_dir / "icons" / "icon.ico"
    if icon_path.exists():
        cmd.insert(-1, f"--icon={icon_path}")
    
    manifest_path = assets_dir / "app.manifest"
    if manifest_path.exists():
        cmd.insert(-1, f"--manifest={manifest_path}")
    
    print(f"Gerando executável v{version}...")
    print(" ".join(cmd))
    
    subprocess.run(cmd, cwd=project_dir)
    
    exe_path = project_dir / "dist" / f"{exe_name}.exe"
    print(f"\n\u2705 Build conclu\u00eddo! Vers\u00e3o: {version}")
    print(f"Execut\u00e1vel em: {exe_path}")
    
    # Code signing (opcional — requer .pfx na pasta installer/)
    pfx_path = project_dir / "installer" / "KidsPC.pfx"
    if pfx_path.exists() and exe_path.exists():
        sign_exe(exe_path, pfx_path)
    else:
        print("\u26a0\ufe0f Certificado n\u00e3o encontrado, pulando assinatura.")
        print(f"  Para assinar, coloque KidsPC.pfx em: {pfx_path.parent}")


def sign_exe(exe_path: Path, pfx_path: Path, password: str = ""):
    """Assina o .exe com signtool usando o certificado .pfx."""
    import shutil
    signtool = shutil.which("signtool")
    if not signtool:
        print("\u26a0\ufe0f signtool n\u00e3o encontrado no PATH. Instale o Windows SDK.")
        return
    
    cmd = [
        signtool, "sign",
        "/f", str(pfx_path),
        "/fd", "SHA256",
        "/t", "http://timestamp.digicert.com",
    ]
    if password:
        cmd.extend(["/p", password])
    cmd.append(str(exe_path))
    
    print(f"\n\U0001f510 Assinando {exe_path.name}...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print("\u2705 Assinatura aplicada com sucesso!")
    else:
        print(f"\u274c Erro ao assinar: {result.stderr}")


if __name__ == "__main__":
    build()
