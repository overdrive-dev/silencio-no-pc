# Build & Deploy Skill

Reference guide for building, packaging, publishing, and deploying KidsPC. Use when modifying the build pipeline, release process, or deployment configuration.

## Version Management

**Single source of truth**: `__version__` in `src/main.py`

```python
__version__ = "2.2.0"  # current
```

All build scripts read this value. When bumping version:
1. Update `__version__` in `src/main.py`
2. Run `publish.py` (handles everything else)
3. **Always** update `app_version` table in Supabase (id=1) — required for auto-updater

## Desktop Build (`build.py`)

### What it does
1. Reads `__version__` from `src/main.py`
2. Runs PyInstaller with `--onefile` flag
3. Includes `assets/` folder (icons, images, sounds, manifest)
4. Adds hidden imports for PyQt5, pycaw, comtypes, supabase dependencies
5. Sets Windows version info and icon
6. Optionally signs the exe with a code-signing certificate

### Output
```
dist/KidsPC_v{version}.exe
```

### Command
```bash
python build.py
```

### Key PyInstaller Options
- `--onefile` — single executable
- `--noconsole` — no terminal window
- `--uac-admin` — requests admin privileges (needed for hosts file modification)
- `--add-data "assets;assets"` — bundles asset files
- `--icon "assets/icons/kidspc.ico"` — app icon
- Hidden imports: `PyQt5.sip`, `pycaw`, `comtypes`, `numpy`, `supabase`, `httpx`, etc.

### Code Signing (Optional)
If `SIGN_CERT` and `SIGN_PASSWORD` env vars are set, the exe is signed using `signtool.exe`:
```bash
signtool sign /f cert.pfx /p password /tr http://timestamp.digicert.com /td sha256 KidsPC_v1.5.0.exe
```

## Installer (`installer/setup.iss`)

### What it does
- Creates a Windows installer using **Inno Setup 6**
- Installs to `C:\Program Files\KidsPC\`
- Creates Start Menu shortcut
- Adds to startup (auto-run on login)
- Sets uninstaller

### Requirements
- Inno Setup 6 installed at `C:\Program Files (x86)\Inno Setup 6\ISCC.exe`
- Pre-built exe at `dist/KidsPC_v{version}.exe`

### Output
```
dist/KidsPC_Setup.exe
```

### Manual Build
```bash
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" installer\setup.iss
```

The `publish.py` script automatically updates the version and source filename in `setup.iss` before compilation and restores the original after.

## Publishing (`publish.py`)

### Full Pipeline
```
publish.py
  ├── Step 1: build.py → dist/KidsPC_v{version}.exe
  ├── Step 2: ISCC.exe → dist/KidsPC_Setup.exe (optional)
  ├── Step 3: GitHub API → Create Release (tag: v{version})
  └── Step 4: GitHub API → Upload exe + installer as release assets
```

### Command
```bash
python publish.py                    # full publish
python publish.py --notes "fix X"    # with release notes
python publish.py --skip-build       # reuse existing exe
python publish.py --skip-installer   # skip Inno Setup
```

### Requirements
- `GITHUB_TOKEN` env var (or `.githubtoken` file in project root)
- Token needs `repo` permission
- GitHub repo: `overdrive-dev/silencio-no-pc`

### Error Handling
- If tag already exists (HTTP 422), fetches existing release instead of failing
- If Inno Setup not installed, skips installer step gracefully
- Restores `setup.iss` to original content after compilation (even on failure)

## Auto-Updater (`src/auto_updater.py`)

### Desktop-Side Update Flow
```
AutoUpdater.check_for_update()
  │
  ├── GET https://api.github.com/repos/overdrive-dev/silencio-no-pc/releases/latest
  │     → Compare tag version with local __version__
  │     → Prefer "setup" asset (is_installer=True), fallback to raw .exe
  │
  ├── If newer version found:
  │     ├── Download asset to temp directory
  │     ├── Create temp .bat script:
  │     │
  │     │   If is_installer (Inno Setup):
  │     │     1. Wait 3s for current process to exit
  │     │     2. Run installer: /VERYSILENT /SUPPRESSMSGBOXES /CLOSEAPPLICATIONS
  │     │     3. Installer's [Run] section starts the new app (nowait postinstall)
  │     │     4. Clean up temp files
  │     │
  │     │   If raw exe (fallback):
  │     │     1. Wait 3s for current process to exit
  │     │     2. Copy new exe over old exe
  │     │     3. Start new exe
  │     │     4. Clean up temp files
  │     │
  │     └── Execute .bat (DETACHED_PROCESS) and sys.exit(0)
  │
  └── If no update or error → silently continue
```

### Inno Setup Silent Install Requirements
- `setup.iss` `[Run]` section must NOT have `skipifsilent` flag — otherwise app won't restart after silent update
- `setup.iss` `[Run]` section MUST have `runascurrentuser` flag — otherwise app launches as admin (broken UI, wrong user context)
- `CloseApplications=force` handles closing the running app before install
- `RestartApplications=yes` uses Windows Restart Manager (backup mechanism)
- The `.bat` script's 3s timeout gives the app time to exit gracefully before installer runs

### Version Comparison
Uses semantic versioning comparison. Tag format: `v1.5.0` → strips `v` prefix → split by `.` → compare numerically.

### Supabase Version Table
The `app_version` table (single row, id=1) stores `latest_version` and `download_url`. This is an alternative check mechanism but the primary check is GitHub API.

## Web Deployment

### Platform
- **Vercel** (auto-deploy from git)
- **Domain**: `kidspc.vercel.app`
- **Framework**: Next.js (auto-detected by Vercel)

### Environment Variables (Vercel Dashboard)
All env vars listed in `AGENTS.md` must be set in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `MELI_ACCESS_TOKEN`
- `NEXT_PUBLIC_MELI_PUBLIC_KEY`
- `MELI_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

### Deploy Triggers
- Push to `main` branch → auto-deploy to production
- Pull requests → preview deployments

### Build Command
```bash
cd web && npm run build
```

### No Custom Build Config
Uses default Next.js build. No `vercel.json` customization needed.

## Release Checklist

1. **Bump version** in `src/main.py` (`__version__ = "x.y.z"`)
2. **Test locally** — run desktop app, verify all features
3. **Publish desktop**: `python publish.py --notes "changelog here"`
4. **Update Supabase** (optional): `UPDATE app_version SET latest_version = 'x.y.z', updated_at = now() WHERE id = 1;`
5. **Deploy web**: Push to `main` (auto-deployed by Vercel)
6. **Update landing page changelog** in `web/src/app/page.tsx` (changelogData array)
7. **Verify auto-update**: Run old version → confirm it detects and applies update

## Dependencies

### Python (`requirements.txt`)
```
PyQt5>=5.15
pyaudio>=0.2.14
numpy>=1.24
cryptography>=41.0
psutil>=5.9
supabase>=2.0
httpx>=0.25
```

### Node.js (`web/package.json`)
```
next: 16.x
react: 19.x
@clerk/nextjs: ^6
@supabase/supabase-js: ^2
mercadopago: ^2
tailwindcss: ^4
@heroicons/react: ^2
@headlessui/react: ^2
recharts: ^2
lucide-react: ^0.468
```

## Anti-Patterns

- **Don't edit `__version__` in multiple places** — only `src/main.py`
- **Don't forget to restore `setup.iss`** — `publish.py` handles this, but manual edits must be reverted
- **Don't publish without testing** — no CI/CD for desktop, manual testing required
- **Don't hardcode GitHub token** — use env var or `.githubtoken` file (gitignored)
- **Don't skip admin manifest** — desktop app needs admin for hosts file and screen lock
- **Don't use `--windowed` without `--uac-admin`** — app won't have permission for core features
