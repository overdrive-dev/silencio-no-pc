"""
Script para publicar uma nova versão do KidsPC.

Fluxo:
  1. Compila o .exe via build.py
  2. Compila o instalador via Inno Setup
  3. Cria uma GitHub Release com tag da versão
  4. Faz upload do .exe e do instalador como assets

Requisitos:
  - Token do GitHub com permissão 'repo' na variável GITHUB_TOKEN
  - Inno Setup 6 instalado (C:\Program Files (x86)\Inno Setup 6\ISCC.exe)

Uso:
  py publish.py                  # publica versão atual do main.py
  py publish.py --notes "fix X"  # com notas de release
"""
import subprocess
import sys
import re
import os
import json
import argparse
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError

GITHUB_REPO = "overdrive-dev/silencio-no-pc"
GITHUB_API = "https://api.github.com"
ISCC_PATH = r"C:\Program Files (x86)\Inno Setup 6\ISCC.exe"

PROJECT_DIR = Path(__file__).parent


def get_version() -> str:
    main_py = PROJECT_DIR / "src" / "main.py"
    content = main_py.read_text(encoding="utf-8")
    match = re.search(r'__version__\s*=\s*["\']([^"\']+)["\']', content)
    return match.group(1) if match else "1.0.0"


def get_token() -> str:
    token = os.environ.get("GITHUB_TOKEN", "")
    if not token:
        token_file = PROJECT_DIR / ".githubtoken"
        if token_file.exists():
            token = token_file.read_text().strip()
    if not token:
        print("❌ GITHUB_TOKEN não encontrado.")
        print("   Defina via: set GITHUB_TOKEN=ghp_seutoken")
        print(f"   Ou crie o arquivo: {PROJECT_DIR / '.github_token'}")
        sys.exit(1)
    return token


def github_request(method: str, endpoint: str, token: str, data=None, content_type="application/json"):
    url = f"{GITHUB_API}{endpoint}" if endpoint.startswith("/") else endpoint
    body = json.dumps(data).encode() if data and content_type == "application/json" else data
    req = Request(url, data=body, method=method)
    req.add_header("Authorization", f"token {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("Content-Type", content_type)
    try:
        with urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        error_body = e.read().decode()
        print(f"GitHub API error {e.code}: {error_body}")
        raise


def step_build() -> Path:
    print("\n📦 Etapa 1: Compilando .exe...")
    result = subprocess.run([sys.executable, "build.py"], cwd=PROJECT_DIR)
    if result.returncode != 0:
        print("❌ Build falhou!")
        sys.exit(1)
    
    version = get_version()
    exe_path = PROJECT_DIR / "dist" / f"KidsPC_v{version}.exe"
    if not exe_path.exists():
        print(f"❌ Executável não encontrado: {exe_path}")
        sys.exit(1)
    
    print(f"✅ .exe pronto: {exe_path}")
    return exe_path


def step_installer(version: str) -> Path | None:
    print("\n📦 Etapa 2: Compilando instalador...")
    iss_path = PROJECT_DIR / "installer" / "setup.iss"
    
    if not Path(ISCC_PATH).exists():
        print("⚠️ Inno Setup não encontrado, pulando instalador.")
        return None
    
    if not iss_path.exists():
        print("⚠️ setup.iss não encontrado, pulando instalador.")
        return None
    
    # Atualiza setup.iss com versão e source filename corretos
    original_content = iss_path.read_text(encoding="utf-8")
    updated_content = re.sub(
        r'AppVersion=.*', f'AppVersion={version}', original_content
    )
    updated_content = re.sub(
        r'Source: "\.\.\\dist\\KidsPC_v[\d.]+\.exe"',
        f'Source: "..\\\\dist\\\\KidsPC_v{version}.exe"',
        updated_content,
    )
    iss_path.write_text(updated_content, encoding="utf-8")
    
    try:
        result = subprocess.run([ISCC_PATH, str(iss_path)], cwd=PROJECT_DIR)
        if result.returncode != 0:
            print("⚠️ Instalador falhou, continuando sem ele.")
            return None
        
        # Output vai para dist/KidsPC_Setup.exe (definido no setup.iss)
        setup_path = PROJECT_DIR / "dist" / "KidsPC_Setup.exe"
        if setup_path.exists():
            print(f"✅ Instalador pronto: {setup_path}")
            return setup_path
        
        return None
    finally:
        # Restaura setup.iss original
        iss_path.write_text(original_content, encoding="utf-8")


def step_release(version: str, notes: str, token: str) -> dict:
    print(f"\n🚀 Etapa 3: Criando release v{version}...")
    tag = f"v{version}"
    
    try:
        release = github_request("POST", f"/repos/{GITHUB_REPO}/releases", token, {
            "tag_name": tag,
            "name": f"KidsPC v{version}",
            "body": notes or f"Release v{version}",
            "draft": False,
            "prerelease": False,
        })
        print(f"✅ Release criada: {release['html_url']}")
        return release
    except HTTPError as e:
        if e.code == 422:
            print(f"⚠️ Tag {tag} já existe, buscando release existente...")
            existing = github_request("GET", f"/repos/{GITHUB_REPO}/releases/tags/{tag}", token)
            print(f"✅ Release existente: {existing['html_url']}")
            return existing
        raise


def step_upload(release: dict, file_path: Path, token: str):
    upload_url = release["upload_url"].split("{")[0]
    name = file_path.name
    size = file_path.stat().st_size
    
    print(f"\n📤 Upload: {name} ({size / 1024 / 1024:.1f} MB)...")
    
    with open(file_path, "rb") as f:
        data = f.read()
    
    url = f"{upload_url}?name={name}"
    result = github_request("POST", url, token, data=data, content_type="application/octet-stream")
    print(f"✅ Upload concluído: {result['browser_download_url']}")


def main():
    parser = argparse.ArgumentParser(description="Publica nova versão do KidsPC")
    parser.add_argument("--notes", "-n", default="", help="Notas de release")
    parser.add_argument("--skip-build", action="store_true", help="Pula o build (usa .exe existente)")
    parser.add_argument("--skip-installer", action="store_true", help="Pula o instalador")
    args = parser.parse_args()
    
    version = get_version()
    token = get_token()
    
    print(f"🏷️  Versão: {version}")
    print(f"📂 Repo: {GITHUB_REPO}")
    
    # 1. Build
    if args.skip_build:
        exe_path = PROJECT_DIR / "dist" / f"KidsPC_v{version}.exe"
        if not exe_path.exists():
            print(f"❌ .exe não encontrado: {exe_path}")
            sys.exit(1)
        print(f"⏭️  Build pulado, usando: {exe_path}")
    else:
        exe_path = step_build()
    
    # 2. Instalador
    installer_path = None
    if not args.skip_installer:
        installer_path = step_installer(version)
    
    # 3. Criar release
    release = step_release(version, args.notes, token)
    
    # 4. Upload assets
    step_upload(release, exe_path, token)
    if installer_path:
        step_upload(release, installer_path, token)
    
    print(f"\n🎉 Versão {version} publicada com sucesso!")
    print(f"   {release['html_url']}")
    print(f"\n   Os apps vão detectar o update automaticamente.")


if __name__ == "__main__":
    main()
