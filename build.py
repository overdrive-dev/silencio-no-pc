"""
Script para criar o executável instalável do Silêncio no PC
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
    exe_name = f"SilencioNoPC_v{version}"
    
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--windowed",
        f"--name={exe_name}",
        f"--add-data={assets_dir};assets",
        "--hidden-import=pycaw",
        "--hidden-import=comtypes",
        "--hidden-import=numpy",
        str(src_dir / "main.py")
    ]
    
    icon_path = assets_dir / "icons" / "icon.ico"
    if icon_path.exists():
        cmd.insert(-1, f"--icon={icon_path}")
    
    print(f"Gerando executável v{version}...")
    print(" ".join(cmd))
    
    subprocess.run(cmd, cwd=project_dir)
    
    print(f"\n✅ Build concluído! Versão: {version}")
    print(f"Executável em: {project_dir / 'dist' / f'{exe_name}.exe'}")

if __name__ == "__main__":
    build()
