"""
Rastreia a janela ativa (foreground) do Windows.
Registra tempo por aplicativo e extrai domínios de navegadores pelo título da janela.
"""
import ctypes
import ctypes.wintypes
import threading
import time
import re
from datetime import date
from collections import defaultdict

import psutil


# Browsers: process name → title pattern to extract domain
BROWSER_PROCESSES = {
    "chrome.exe", "msedge.exe", "firefox.exe", "brave.exe",
    "opera.exe", "vivaldi.exe", "iexplore.exe",
}

# Regex to extract domain from browser title like "YouTube - Google Chrome"
# Most browsers show "Page Title - Browser Name" or "Page Title — Browser Name"
_TITLE_SEPARATOR_RE = re.compile(r"\s[-–—]\s(?:Google Chrome|Microsoft\u200b? Edge|Mozilla Firefox|Brave|Opera|Vivaldi|Internet Explorer)$", re.IGNORECASE)

# Common URL patterns that might appear in title
_URL_IN_TITLE_RE = re.compile(r"https?://([^/\s]+)")

# Known site patterns from page titles
_SITE_FROM_TITLE = {
    "youtube": "youtube.com",
    "google": "google.com",
    "facebook": "facebook.com",
    "instagram": "instagram.com",
    "twitter": "twitter.com",
    "x.com": "x.com",
    "reddit": "reddit.com",
    "tiktok": "tiktok.com",
    "twitch": "twitch.tv",
    "discord": "discord.com",
    "whatsapp": "web.whatsapp.com",
    "telegram": "web.telegram.org",
    "netflix": "netflix.com",
    "amazon": "amazon.com",
    "mercado livre": "mercadolivre.com.br",
    "github": "github.com",
    "stackoverflow": "stackoverflow.com",
    "chatgpt": "chatgpt.com",
    "gmail": "mail.google.com",
    "outlook": "outlook.live.com",
    "wikipedia": "wikipedia.org",
    "spotify": "open.spotify.com",
    "globo": "globo.com",
    "uol": "uol.com.br",
}


user32 = ctypes.windll.user32


def _get_foreground_window_info():
    """Returns (process_name, window_title) of the foreground window, or (None, None)."""
    try:
        hwnd = user32.GetForegroundWindow()
        if not hwnd:
            return None, None

        # Get window title
        length = user32.GetWindowTextLengthW(hwnd)
        if length == 0:
            return None, None
        buf = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buf, length + 1)
        title = buf.value

        # Get process ID
        pid = ctypes.wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))

        # Get process name
        try:
            proc = psutil.Process(pid.value)
            name = proc.name().lower()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return None, title

        return name, title
    except Exception:
        return None, None


def _extract_domain_from_title(title: str) -> str | None:
    """Try to extract a domain from a browser window title."""
    if not title:
        return None

    # Check for URL in title
    url_match = _URL_IN_TITLE_RE.search(title)
    if url_match:
        return url_match.group(1).lower()

    # Strip browser name suffix
    clean = _TITLE_SEPARATOR_RE.sub("", title).strip().lower()

    # Check known site patterns
    for keyword, domain in _SITE_FROM_TITLE.items():
        if keyword in clean:
            return domain

    return None


def _friendly_app_name(process_name: str) -> str:
    """Convert process name to a friendly display name."""
    mapping = {
        "chrome.exe": "Google Chrome",
        "msedge.exe": "Microsoft Edge",
        "firefox.exe": "Mozilla Firefox",
        "brave.exe": "Brave",
        "opera.exe": "Opera",
        "vivaldi.exe": "Vivaldi",
        "explorer.exe": "Explorador de Arquivos",
        "code.exe": "Visual Studio Code",
        "devenv.exe": "Visual Studio",
        "notepad.exe": "Bloco de Notas",
        "winword.exe": "Microsoft Word",
        "excel.exe": "Microsoft Excel",
        "powerpnt.exe": "PowerPoint",
        "teams.exe": "Microsoft Teams",
        "slack.exe": "Slack",
        "discord.exe": "Discord",
        "spotify.exe": "Spotify",
        "steam.exe": "Steam",
        "epicgameslauncher.exe": "Epic Games",
        "robloxplayerbeta.exe": "Roblox",
        "minecraft.exe": "Minecraft",
        "javaw.exe": "Minecraft (Java)",
        "fortnite.exe": "Fortnite",
        "vlc.exe": "VLC",
        "whatsapp.exe": "WhatsApp",
        "telegram.exe": "Telegram",
        "obs64.exe": "OBS Studio",
        "photoshop.exe": "Photoshop",
        "acrobat.exe": "Adobe Acrobat",
    }
    return mapping.get(process_name, process_name.replace(".exe", "").title())


# Processes to ignore (system, background)
_IGNORED_PROCESSES = {
    "idle", "system", "svchost.exe", "csrss.exe", "dwm.exe",
    "taskhostw.exe", "sihost.exe", "ctfmon.exe", "runtimebroker.exe",
    "searchhost.exe", "startmenuexperiencehost.exe", "shellexperiencehost.exe",
    "textinputhost.exe", "lockapp.exe", "logonui.exe", "fontdrvhost.exe",
    "applicationframehost.exe", "systemsettings.exe", "searchui.exe",
    "securityhealthsystray.exe", "widgets.exe", "widgetservice.exe",
    "python.exe", "pythonw.exe", "py.exe",
}


class WindowTracker:
    """Tracks foreground window, aggregating time per app and extracting browser domains."""

    def __init__(self, poll_interval: int = 5):
        self._poll_interval = poll_interval
        self._running = threading.Event()
        self._thread = None
        self._lock = threading.Lock()

        # Aggregated data for today
        self._today = date.today()
        self._app_seconds: dict[str, int] = defaultdict(int)      # app_name → seconds
        self._app_display: dict[str, str] = {}                     # app_name → display_name
        self._site_seconds: dict[str, int] = defaultdict(int)      # domain → seconds
        self._site_titles: dict[str, str] = {}                     # domain → last title
        self._site_visits: dict[str, int] = defaultdict(int)       # domain → visit count
        self._last_domain: str | None = None

    def start(self):
        if self._thread and self._thread.is_alive():
            return
        self._running.set()
        self._thread = threading.Thread(target=self._track_loop, daemon=True)
        self._thread.start()

    def stop(self):
        self._running.clear()
        if self._thread:
            self._thread.join(timeout=3)

    def _reset_if_new_day(self):
        today = date.today()
        if today != self._today:
            with self._lock:
                self._today = today
                self._app_seconds.clear()
                self._app_display.clear()
                self._site_seconds.clear()
                self._site_titles.clear()
                self._site_visits.clear()
                self._last_domain = None

    def _track_loop(self):
        while self._running.is_set():
            try:
                self._reset_if_new_day()
                proc_name, title = _get_foreground_window_info()

                if proc_name and proc_name not in _IGNORED_PROCESSES:
                    with self._lock:
                        self._app_seconds[proc_name] += self._poll_interval
                        if proc_name not in self._app_display:
                            self._app_display[proc_name] = _friendly_app_name(proc_name)

                        # Browser domain extraction
                        if proc_name in BROWSER_PROCESSES and title:
                            domain = _extract_domain_from_title(title)
                            if domain:
                                self._site_seconds[domain] += self._poll_interval
                                # Strip browser suffix for cleaner title
                                clean_title = _TITLE_SEPARATOR_RE.sub("", title).strip()
                                self._site_titles[domain] = clean_title[:200]

                                if domain != self._last_domain:
                                    self._site_visits[domain] += 1
                                    self._last_domain = domain
                            else:
                                self._last_domain = None
                        else:
                            self._last_domain = None

            except Exception as e:
                print(f"WindowTracker error: {e}")

            # Interruptible sleep
            for _ in range(self._poll_interval * 2):
                if not self._running.is_set():
                    break
                time.sleep(0.5)

    def get_app_usage(self) -> list[dict]:
        """Returns list of {app_name, display_name, minutes} for today."""
        with self._lock:
            result = []
            for app_name, seconds in self._app_seconds.items():
                minutes = seconds // 60
                if minutes > 0:
                    result.append({
                        "app_name": app_name,
                        "display_name": self._app_display.get(app_name, app_name),
                        "minutes": minutes,
                    })
            return sorted(result, key=lambda x: x["minutes"], reverse=True)

    def get_site_visits(self) -> list[dict]:
        """Returns list of {domain, title, visit_count, total_seconds} for today."""
        with self._lock:
            result = []
            for domain, seconds in self._site_seconds.items():
                result.append({
                    "domain": domain,
                    "title": self._site_titles.get(domain, ""),
                    "visit_count": self._site_visits.get(domain, 1),
                    "total_seconds": seconds,
                })
            return sorted(result, key=lambda x: x["total_seconds"], reverse=True)
