"""
Lê o histórico de navegadores (Chrome, Edge, Firefox) no Windows.
Copia o banco SQLite para evitar locks e extrai URLs visitadas recentemente.
"""
import os
import sqlite3
import shutil
import tempfile
import glob
from datetime import datetime, timedelta, date
from collections import defaultdict
from urllib.parse import urlparse


# Browser history database paths (Windows)
def _chrome_history_paths() -> list[str]:
    local = os.environ.get("LOCALAPPDATA", "")
    if not local:
        return []
    paths = []
    # Default profile
    default = os.path.join(local, "Google", "Chrome", "User Data", "Default", "History")
    if os.path.exists(default):
        paths.append(default)
    # Additional profiles
    for p in glob.glob(os.path.join(local, "Google", "Chrome", "User Data", "Profile *", "History")):
        paths.append(p)
    return paths


def _edge_history_paths() -> list[str]:
    local = os.environ.get("LOCALAPPDATA", "")
    if not local:
        return []
    paths = []
    default = os.path.join(local, "Microsoft", "Edge", "User Data", "Default", "History")
    if os.path.exists(default):
        paths.append(default)
    for p in glob.glob(os.path.join(local, "Microsoft", "Edge", "User Data", "Profile *", "History")):
        paths.append(p)
    return paths


def _firefox_history_paths() -> list[str]:
    appdata = os.environ.get("APPDATA", "")
    if not appdata:
        return []
    profiles_dir = os.path.join(appdata, "Mozilla", "Firefox", "Profiles")
    if not os.path.isdir(profiles_dir):
        return []
    paths = []
    for p in glob.glob(os.path.join(profiles_dir, "*", "places.sqlite")):
        paths.append(p)
    return paths


def _chromium_epoch_to_datetime(microseconds: int) -> datetime:
    """Convert Chromium timestamp (microseconds since 1601-01-01) to Python datetime."""
    # Chromium epoch is 1601-01-01, Unix epoch is 1970-01-01
    # Difference is 11644473600 seconds
    seconds = (microseconds / 1_000_000) - 11644473600
    try:
        return datetime.fromtimestamp(seconds)
    except (OSError, ValueError):
        return datetime.min


def _read_chromium_history(db_path: str, since: datetime) -> list[dict]:
    """Read history from a Chromium-based browser (Chrome, Edge)."""
    results = []
    tmp_path = None
    try:
        # Copy to temp to avoid lock
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".sqlite")
        os.close(tmp_fd)
        shutil.copy2(db_path, tmp_path)

        conn = sqlite3.connect(tmp_path, timeout=5)
        conn.execute("PRAGMA journal_mode=WAL")
        cursor = conn.cursor()

        # Chromium timestamp for 'since'
        chrome_since = int((since.timestamp() + 11644473600) * 1_000_000)

        cursor.execute("""
            SELECT url, title, visit_count, last_visit_time
            FROM urls
            WHERE last_visit_time > ?
            ORDER BY last_visit_time DESC
            LIMIT 500
        """, (chrome_since,))

        for url, title, visit_count, last_visit_time in cursor.fetchall():
            try:
                parsed = urlparse(url)
                domain = parsed.netloc.lower()
                if domain.startswith("www."):
                    domain = domain[4:]
                if not domain or domain in ("newtab", "extensions", "settings"):
                    continue
                # Skip chrome:// and edge:// internal URLs
                if parsed.scheme in ("chrome", "edge", "about", "chrome-extension"):
                    continue
                results.append({
                    "domain": domain,
                    "title": (title or "")[:200],
                    "visit_count": visit_count or 1,
                    "last_visit": _chromium_epoch_to_datetime(last_visit_time),
                })
            except Exception:
                continue

        conn.close()
    except Exception as e:
        print(f"Error reading Chromium history {db_path}: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
    return results


def _read_firefox_history(db_path: str, since: datetime) -> list[dict]:
    """Read history from Firefox places.sqlite."""
    results = []
    tmp_path = None
    try:
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=".sqlite")
        os.close(tmp_fd)
        shutil.copy2(db_path, tmp_path)

        conn = sqlite3.connect(tmp_path, timeout=5)
        cursor = conn.cursor()

        # Firefox uses microseconds since Unix epoch
        ff_since = int(since.timestamp() * 1_000_000)

        cursor.execute("""
            SELECT p.url, p.title, p.visit_count, p.last_visit_date
            FROM moz_places p
            WHERE p.last_visit_date > ?
              AND p.hidden = 0
            ORDER BY p.last_visit_date DESC
            LIMIT 500
        """, (ff_since,))

        for url, title, visit_count, last_visit_date in cursor.fetchall():
            try:
                parsed = urlparse(url)
                domain = parsed.netloc.lower()
                if domain.startswith("www."):
                    domain = domain[4:]
                if not domain:
                    continue
                if parsed.scheme in ("about", "moz-extension", "resource"):
                    continue
                results.append({
                    "domain": domain,
                    "title": (title or "")[:200],
                    "visit_count": visit_count or 1,
                    "last_visit": datetime.fromtimestamp(last_visit_date / 1_000_000) if last_visit_date else datetime.min,
                })
            except Exception:
                continue

        conn.close()
    except Exception as e:
        print(f"Error reading Firefox history {db_path}: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
    return results


class BrowserHistory:
    """Reads browser history from Chrome, Edge, and Firefox."""

    def __init__(self):
        self._last_read: datetime | None = None

    def read_today(self) -> list[dict]:
        """
        Read today's browser history from all detected browsers.
        Returns aggregated list of {domain, title, visit_count, total_seconds=0, source='browser_history'}.
        """
        since = datetime.combine(date.today(), datetime.min.time())

        all_entries: list[dict] = []

        # Chrome
        for path in _chrome_history_paths():
            all_entries.extend(_read_chromium_history(path, since))

        # Edge
        for path in _edge_history_paths():
            all_entries.extend(_read_chromium_history(path, since))

        # Firefox
        for path in _firefox_history_paths():
            all_entries.extend(_read_firefox_history(path, since))

        # Aggregate by domain
        domain_data: dict[str, dict] = {}
        for entry in all_entries:
            domain = entry["domain"]
            if domain not in domain_data:
                domain_data[domain] = {
                    "domain": domain,
                    "title": entry["title"],
                    "visit_count": 0,
                    "total_seconds": 0,
                    "source": "browser_history",
                }
            domain_data[domain]["visit_count"] += entry["visit_count"]
            # Keep the most recent title
            if entry.get("title"):
                domain_data[domain]["title"] = entry["title"]

        self._last_read = datetime.now()

        return sorted(
            domain_data.values(),
            key=lambda x: x["visit_count"],
            reverse=True,
        )
