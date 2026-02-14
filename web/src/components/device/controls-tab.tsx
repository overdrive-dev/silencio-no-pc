"use client";

import { useState } from "react";

interface BlockedApp { id: string; name: string; display_name: string | null; }
interface BlockedSite { id: string; domain: string; display_name: string | null; }

const POPULAR_APPS = [
  { name: "chrome.exe", display_name: "Google Chrome" },
  { name: "msedge.exe", display_name: "Microsoft Edge" },
  { name: "firefox.exe", display_name: "Firefox" },
  { name: "robloxplayerbeta.exe", display_name: "Roblox" },
  { name: "minecraft.exe", display_name: "Minecraft" },
  { name: "fortnite.exe", display_name: "Fortnite" },
  { name: "discord.exe", display_name: "Discord" },
  { name: "steam.exe", display_name: "Steam" },
];

const POPULAR_SITES = [
  { domain: "youtube.com", display_name: "YouTube" },
  { domain: "tiktok.com", display_name: "TikTok" },
  { domain: "instagram.com", display_name: "Instagram" },
  { domain: "twitter.com", display_name: "Twitter/X" },
  { domain: "roblox.com", display_name: "Roblox" },
  { domain: "discord.com", display_name: "Discord" },
  { domain: "twitch.tv", display_name: "Twitch" },
  { domain: "reddit.com", display_name: "Reddit" },
];

interface ControlsTabProps {
  deviceId: string;
  blockedApps: BlockedApp[];
  blockedSites: BlockedSite[];
  appBlockMode: string;
  siteBlockMode: string;
  setAppBlockMode: (m: string) => void;
  setSiteBlockMode: (m: string) => void;
  addBlockedApp: (name: string, display_name: string) => void;
  removeBlockedApp: (id: string) => void;
  addBlockedSite: (domain: string, display_name: string) => void;
  removeBlockedSite: (id: string) => void;
  saveBlockMode: (field: string, value: string) => void;
}

export default function ControlsTab({
  blockedApps, blockedSites,
  appBlockMode, siteBlockMode,
  setAppBlockMode, addBlockedApp, removeBlockedApp,
  addBlockedSite, removeBlockedSite, saveBlockMode,
}: ControlsTabProps) {
  const [newAppName, setNewAppName] = useState("");
  const [newAppDisplay, setNewAppDisplay] = useState("");
  const [newSiteDomain, setNewSiteDomain] = useState("");
  const [newSiteDisplay, setNewSiteDisplay] = useState("");

  return (
    <div className="space-y-8">
      {/* ── Blocked Apps ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Aplicativos</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Modo:</span>
            <button
              onClick={() => {
                const next = appBlockMode === "blacklist" ? "whitelist" : "blacklist";
                setAppBlockMode(next);
                saveBlockMode("app_block_mode", next);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                appBlockMode === "blacklist"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {appBlockMode === "blacklist" ? "Bloquear listados" : "Permitir apenas listados"}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {appBlockMode === "blacklist"
            ? "Apps na lista serão fechados automaticamente. Todos os outros são permitidos."
            : "Apenas apps na lista poderão rodar. Todos os outros serão fechados."}
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Processo (ex: chrome.exe)"
            value={newAppName}
            onChange={(e) => setNewAppName(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Nome (ex: Chrome)"
            value={newAppDisplay}
            onChange={(e) => setNewAppDisplay(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (newAppName) {
                addBlockedApp(newAppName, newAppDisplay || newAppName);
                setNewAppName("");
                setNewAppDisplay("");
              }
            }}
            disabled={!newAppName}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition shrink-0"
          >
            Adicionar
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {POPULAR_APPS.filter(
            (p) => !blockedApps.some((a) => a.name === p.name)
          ).map((app) => (
            <button
              key={app.name}
              onClick={() => addBlockedApp(app.name, app.display_name)}
              className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              + {app.display_name}
            </button>
          ))}
        </div>

        {blockedApps.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">Nenhum aplicativo na lista.</p>
        ) : (
          <div className="space-y-1">
            {blockedApps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{app.display_name || app.name}</span>
                  <span className="text-xs text-gray-400">{app.name}</span>
                </div>
                <button
                  onClick={() => removeBlockedApp(app.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* ── Blocked Sites ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Sites</h3>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Bloquear listados
          </span>
        </div>

        <p className="text-xs text-gray-400">
          Sites na lista serão bloqueados no navegador via hosts file. Funciona em todos os navegadores.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Domínio (ex: youtube.com)"
            value={newSiteDomain}
            onChange={(e) => setNewSiteDomain(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Nome (ex: YouTube)"
            value={newSiteDisplay}
            onChange={(e) => setNewSiteDisplay(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (newSiteDomain) {
                addBlockedSite(newSiteDomain, newSiteDisplay || newSiteDomain);
                setNewSiteDomain("");
                setNewSiteDisplay("");
              }
            }}
            disabled={!newSiteDomain}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 disabled:opacity-40 transition shrink-0"
          >
            Adicionar
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SITES.filter(
            (p) => !blockedSites.some((s) => s.domain === p.domain)
          ).map((site) => (
            <button
              key={site.domain}
              onClick={() => addBlockedSite(site.domain, site.display_name)}
              className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              + {site.display_name}
            </button>
          ))}
        </div>

        {blockedSites.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">Nenhum site na lista.</p>
        ) : (
          <div className="space-y-1">
            {blockedSites.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{site.display_name || site.domain}</span>
                  <span className="text-xs text-gray-400">{site.domain}</span>
                </div>
                <button
                  onClick={() => removeBlockedSite(site.id)}
                  className="text-xs text-red-500 hover:text-red-700 transition"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-700">
        As regras são sincronizadas automaticamente com o dispositivo a cada 30 segundos.
      </div>
    </div>
  );
}
