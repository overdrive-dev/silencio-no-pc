"use client";

import { useParallax, parallaxStyle } from "@/hooks/use-parallax";
import { useRef, useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   HERO — Kid at desk with giant floating dashboard
   Multiple parallax layers for depth
   ───────────────────────────────────────────── */
export function HeroScene({ className }: { className?: string }) {
  const scrollY = useParallax();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (ref.current) setOffset(ref.current.offsetTop);
  }, []);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} style={{ minHeight: 520 }}>
      {/* Layer 0 — Background blobs (slowest) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={parallaxStyle(scrollY, -0.04, offset)}
      >
        <div className="absolute -top-8 -right-12 w-80 h-80 rounded-full bg-[#DAE5FF] opacity-40 blur-xl" />
        <div className="absolute bottom-0 -left-8 w-48 h-48 rounded-full bg-[#FFE0E0] opacity-30 blur-lg" />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 rounded-full bg-[#FFF3D6] opacity-40 blur-md" />
      </div>

      {/* Layer 1 — The giant phone/dashboard (medium speed) */}
      <div
        className="absolute right-0 top-4 w-[280px] sm:w-[320px]"
        style={parallaxStyle(scrollY, -0.07, offset)}
      >
        <svg viewBox="0 0 300 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-2xl">
          {/* Phone frame */}
          <rect x="10" y="10" width="280" height="500" rx="32" fill="#1a1a2e" />
          <rect x="22" y="50" width="256" height="420" rx="8" fill="#FAF7F2" />
          {/* Notch */}
          <rect x="105" y="18" width="90" height="24" rx="12" fill="#2a2a3e" />
          <circle cx="150" cy="30" r="5" fill="#3a3a4e" />

          {/* Status bar */}
          <text x="42" y="42" fill="#ffffff" fontSize="11" fontFamily="system-ui" fontWeight="600">9:41</text>
          <circle cx="230" cy="36" r="3" fill="#51CF66" />
          <rect x="240" y="33" width="18" height="6" rx="2" fill="#ffffff" opacity="0.5" />

          {/* Dashboard header */}
          <rect x="34" y="62" width="60" height="8" rx="4" fill="#4A7AFF" opacity="0.6" />
          <text x="34" y="90" fill="#1a1a2e" fontSize="16" fontWeight="bold" fontFamily="system-ui">Dispositivos</text>

          {/* Device card 1 — active */}
          <rect x="34" y="108" width="232" height="100" rx="14" fill="#ffffff" stroke="#e8e0d8" strokeWidth="1" />
          <circle cx="62" cy="138" r="16" fill="#EDF2FF" />
          <rect x="52" y="131" width="20" height="14" rx="3" fill="#4A7AFF" opacity="0.6" />
          <text x="88" y="135" fill="#1a1a2e" fontSize="12" fontWeight="600" fontFamily="system-ui">PC do João</text>
          <circle cx="245" cy="130" r="5" fill="#51CF66" />
          <text x="88" y="152" fill="#6B7280" fontSize="9" fontFamily="system-ui">Online agora · 47min restantes</text>

          {/* Progress bar */}
          <rect x="88" y="162" width="160" height="8" rx="4" fill="#EDF2FF" />
          <rect x="88" y="162" width="96" height="8" rx="4" fill="#4A7AFF" />

          {/* Timer display */}
          <text x="88" y="190" fill="#4A7AFF" fontSize="20" fontWeight="bold" fontFamily="system-ui">0:47</text>
          <text x="138" y="190" fill="#9CA3AF" fontSize="10" fontFamily="system-ui">/ 1:30</text>

          {/* Device card 2 — offline */}
          <rect x="34" y="220" width="232" height="80" rx="14" fill="#ffffff" stroke="#e8e0d8" strokeWidth="1" />
          <circle cx="62" cy="250" r="16" fill="#FFE0E0" />
          <rect x="52" y="243" width="20" height="14" rx="3" fill="#FF6B6B" opacity="0.5" />
          <text x="88" y="248" fill="#1a1a2e" fontSize="12" fontWeight="600" fontFamily="system-ui">PC da Maria</text>
          <circle cx="245" cy="243" r="5" fill="#e8e0d8" />
          <text x="88" y="265" fill="#6B7280" fontSize="9" fontFamily="system-ui">Offline · Tempo esgotado</text>
          <rect x="88" y="275" width="160" height="8" rx="4" fill="#FFE0E0" />
          <rect x="88" y="275" width="160" height="8" rx="4" fill="#FF6B6B" opacity="0.5" />

          {/* Quick actions */}
          <rect x="34" y="316" width="110" height="44" rx="12" fill="#EDF2FF" />
          <text x="56" y="342" fill="#4A7AFF" fontSize="10" fontWeight="600" fontFamily="system-ui">+ 30 min</text>
          <rect x="156" y="316" width="110" height="44" rx="12" fill="#FFE0E0" />
          <text x="173" y="342" fill="#FF6B6B" fontSize="10" fontWeight="600" fontFamily="system-ui">Bloquear</text>

          {/* Activity chart */}
          <rect x="34" y="376" width="232" height="80" rx="14" fill="#ffffff" stroke="#e8e0d8" strokeWidth="1" />
          <text x="48" y="398" fill="#1a1a2e" fontSize="10" fontWeight="600" fontFamily="system-ui">Uso semanal</text>
          {/* Bar chart */}
          <rect x="50" y="430" width="20" height="16" rx="3" fill="#DAE5FF" />
          <rect x="80" y="420" width="20" height="26" rx="3" fill="#DAE5FF" />
          <rect x="110" y="412" width="20" height="34" rx="3" fill="#DAE5FF" />
          <rect x="140" y="424" width="20" height="22" rx="3" fill="#DAE5FF" />
          <rect x="170" y="416" width="20" height="30" rx="3" fill="#DAE5FF" />
          <rect x="200" y="434" width="20" height="12" rx="3" fill="#D6F5E0" />
          <rect x="230" y="408" width="20" height="38" rx="3" fill="#4A7AFF" />
        </svg>
      </div>

      {/* Layer 2 — Kid at desk (foreground, slightly faster parallax) */}
      <div
        className="absolute left-0 bottom-0 w-[340px] sm:w-[380px]"
        style={parallaxStyle(scrollY, -0.02, offset)}
      >
        <svg viewBox="0 0 400 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          {/* Desk */}
          <rect x="80" y="260" width="300" height="14" rx="7" fill="#E8E0D8" />
          <rect x="120" y="274" width="10" height="90" rx="5" fill="#D4CCC4" />
          <rect x="350" y="274" width="10" height="90" rx="5" fill="#D4CCC4" />
          <rect x="95" y="355" width="60" height="8" rx="4" fill="#D4CCC4" />
          <rect x="325" y="355" width="60" height="8" rx="4" fill="#D4CCC4" />

          {/* Monitor */}
          <rect x="140" y="140" width="200" height="120" rx="12" fill="#1a1a2e" />
          <rect x="150" y="150" width="180" height="92" rx="6" fill="#4A7AFF" opacity="0.12" />
          <rect x="225" y="255" width="30" height="10" rx="3" fill="#D4CCC4" />
          <rect x="210" y="260" width="60" height="5" rx="2.5" fill="#E8E0D8" />

          {/* Screen content — game scene */}
          <rect x="160" y="158" width="160" height="76" rx="4" fill="#1e1e3a" />
          {/* Mini game elements */}
          <rect x="175" y="200" width="24" height="24" rx="4" fill="#51CF66" opacity="0.7" />
          <rect x="210" y="190" width="20" height="34" rx="3" fill="#4A7AFF" opacity="0.5" />
          <rect x="245" y="195" width="30" height="20" rx="3" fill="#FF6B6B" opacity="0.5" />
          <rect x="290" y="205" width="18" height="14" rx="3" fill="#FFA94D" opacity="0.6" />
          {/* Health bar */}
          <rect x="170" y="168" width="80" height="6" rx="3" fill="#2a2a4e" />
          <rect x="170" y="168" width="52" height="6" rx="3" fill="#51CF66" />

          {/* Timer overlay on screen */}
          <rect x="260" y="158" width="56" height="22" rx="6" fill="#1a1a2e" opacity="0.85" />
          <text x="288" y="173" textAnchor="middle" fill="#FF6B6B" fontSize="11" fontWeight="bold" fontFamily="system-ui">0:47</text>

          {/* Keyboard */}
          <rect x="170" y="266" width="140" height="8" rx="4" fill="#E8E0D8" />
          <rect x="200" y="275" width="80" height="4" rx="2" fill="#F0EBE5" />

          {/* Kid — sitting (larger, more detailed) */}
          {/* Chair */}
          <path d="M30 270 C30 250 130 250 130 270 L130 350 L30 350Z" fill="#F0EBE5" />
          <rect x="25" y="240" width="110" height="16" rx="8" fill="#E8E0D8" />
          <rect x="20" y="220" width="12" height="40" rx="6" fill="#D4CCC4" />
          <rect x="128" y="220" width="12" height="40" rx="6" fill="#D4CCC4" />

          {/* Body/torso — hoodie */}
          <path d="M45 218 C45 198 115 198 115 218 L118 290 L42 290Z" fill="#4A7AFF" />
          {/* Hoodie pocket */}
          <rect x="58" y="255" width="44" height="18" rx="9" fill="#3A6AEF" opacity="0.4" />
          {/* Hood strings */}
          <line x1="70" y1="218" x2="68" y2="235" stroke="#3A6AEF" strokeWidth="1.5" />
          <line x1="90" y1="218" x2="92" y2="235" stroke="#3A6AEF" strokeWidth="1.5" />

          {/* Head */}
          <circle cx="80" cy="180" r="28" fill="#FFA94D" />
          {/* Hair — messy kid hair */}
          <path d="M52 175 C52 148 108 148 108 175 C108 158 52 158 52 175Z" fill="#1a1a2e" />
          <path d="M52 165 C48 155 55 148 60 155Z" fill="#1a1a2e" />
          <path d="M105 168 C110 155 108 148 100 155Z" fill="#1a1a2e" />

          {/* Headphones */}
          <path d="M50 172 C48 155 112 155 110 172" stroke="#FF6B6B" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="44" y="168" width="12" height="18" rx="6" fill="#FF6B6B" />
          <rect x="104" y="168" width="12" height="18" rx="6" fill="#FF6B6B" />

          {/* Face */}
          <circle cx="70" cy="182" r="3" fill="#1a1a2e" />
          <circle cx="90" cy="182" r="3" fill="#1a1a2e" />
          {/* Focused expression — slightly open mouth */}
          <ellipse cx="80" cy="195" rx="5" ry="3" fill="#e8915a" />

          {/* Arms reaching to keyboard */}
          <path d="M115 230 L155 265 L150 270 L110 240" fill="#FFA94D" />
          <path d="M45 230 L30 255 L35 260 L50 240" fill="#FFA94D" />

          {/* Legs dangling (kid on chair) */}
          <rect x="52" y="288" width="16" height="50" rx="8" fill="#1a1a2e" />
          <rect x="88" y="288" width="16" height="50" rx="8" fill="#1a1a2e" />
          {/* Sneakers */}
          <path d="M48 332 L72 332 C74 332 76 336 72 338 L48 338 C44 338 44 332 48 332Z" fill="#FF6B6B" />
          <path d="M84 332 L108 332 C110 332 112 336 108 338 L84 338 C80 338 80 332 84 332Z" fill="#FF6B6B" />
          {/* Shoe details */}
          <line x1="52" y1="335" x2="68" y2="335" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
          <line x1="88" y1="335" x2="104" y2="335" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
        </svg>
      </div>

      {/* Layer 3 — Floating notification badges (fastest, most parallax) */}
      <div
        className="absolute pointer-events-none"
        style={{ ...parallaxStyle(scrollY, -0.12, offset), top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {/* "Volume alto!" badge */}
        <div className="absolute top-8 right-[45%] bg-white rounded-2xl shadow-xl border border-[#FFE0E0] px-4 py-2.5 flex items-center gap-2 animate-float">
          <div className="size-8 rounded-full bg-[#FFE0E0] flex items-center justify-center">
            <svg className="size-4 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-[#FF6B6B]">Volume alto!</p>
            <p className="text-[10px] text-gray-400">Strike 2/3</p>
          </div>
        </div>

        {/* "Tempo acabou" badge */}
        <div className="absolute bottom-24 right-[30%] bg-white rounded-2xl shadow-xl border border-[#DAE5FF] px-4 py-2.5 flex items-center gap-2 animate-float-delay">
          <div className="size-8 rounded-full bg-[#EDF2FF] flex items-center justify-center">
            <svg className="size-4 text-[#4A7AFF]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A7AFF]">Tempo acabou</p>
            <p className="text-[10px] text-gray-400">Tela bloqueada</p>
          </div>
        </div>

        {/* Checkmark bubble */}
        <div className="absolute top-[60%] left-[5%] bg-white rounded-full shadow-lg border border-[#D6F5E0] size-12 flex items-center justify-center animate-float-slow">
          <svg className="size-5 text-[#51CF66]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOW IT WORKS — Isometric phone with notification trail
   ───────────────────────────────────────────── */
export function StepsScene({ className }: { className?: string }) {
  const scrollY = useParallax();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (ref.current) setOffset(ref.current.offsetTop);
  }, []);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`} style={{ minHeight: 460 }}>
      {/* Background shape */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={parallaxStyle(scrollY, -0.03, offset)}
      >
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-[#EDF2FF] opacity-50 blur-2xl" />
      </div>

      {/* Main phone — tilted/isometric feel */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={parallaxStyle(scrollY, -0.05, offset)}
      >
        <svg viewBox="0 0 260 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 sm:w-64 drop-shadow-2xl" style={{ transform: "rotate(-6deg)" }}>
          {/* Phone body */}
          <rect x="8" y="8" width="244" height="444" rx="28" fill="#1a1a2e" />
          <rect x="18" y="44" width="224" height="370" rx="6" fill="#FAF7F2" />
          <rect x="90" y="14" width="80" height="22" rx="11" fill="#2a2a3e" />

          {/* App header */}
          <rect x="30" y="56" width="80" height="10" rx="5" fill="#4A7AFF" opacity="0.3" />
          <text x="30" y="84" fill="#1a1a2e" fontSize="14" fontWeight="bold" fontFamily="system-ui">KidsPC</text>

          {/* Step 1 — Account created ✓ */}
          <rect x="30" y="100" width="200" height="64" rx="12" fill="#ffffff" stroke="#D6F5E0" strokeWidth="1.5" />
          <circle cx="56" cy="132" r="14" fill="#D6F5E0" />
          <path d="M50 132 L54 136 L62 128" stroke="#51CF66" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="78" y="126" fill="#1a1a2e" fontSize="10" fontWeight="600" fontFamily="system-ui">Conta criada</text>
          <text x="78" y="140" fill="#51CF66" fontSize="8" fontFamily="system-ui">✓ Completo</text>

          {/* Step 2 — Device connected ✓ */}
          <rect x="30" y="176" width="200" height="64" rx="12" fill="#ffffff" stroke="#D6F5E0" strokeWidth="1.5" />
          <circle cx="56" cy="208" r="14" fill="#D6F5E0" />
          <path d="M50 208 L54 212 L62 204" stroke="#51CF66" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="78" y="202" fill="#1a1a2e" fontSize="10" fontWeight="600" fontFamily="system-ui">PC do João vinculado</text>
          <text x="78" y="216" fill="#51CF66" fontSize="8" fontFamily="system-ui">✓ Conectado</text>

          {/* Step 3 — Controls active (highlighted) */}
          <rect x="30" y="252" width="200" height="80" rx="12" fill="#EDF2FF" stroke="#4A7AFF" strokeWidth="1.5" />
          <circle cx="56" cy="280" r="14" fill="#4A7AFF" />
          <text x="56" y="284" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="system-ui">3</text>
          <text x="78" y="276" fill="#1a1a2e" fontSize="10" fontWeight="600" fontFamily="system-ui">Configurar limites</text>
          <text x="78" y="290" fill="#4A7AFF" fontSize="8" fontFamily="system-ui">Em andamento...</text>
          {/* Slider */}
          <rect x="78" y="302" width="140" height="6" rx="3" fill="#DAE5FF" />
          <rect x="78" y="302" width="84" height="6" rx="3" fill="#4A7AFF" />
          <circle cx="162" cy="305" r="8" fill="#4A7AFF" />
          <text x="162" y="308" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold" fontFamily="system-ui">1h</text>
          <text x="78" y="322" fill="#6B7280" fontSize="7" fontFamily="system-ui">Limite diário: 1h30min</text>

          {/* Bottom nav */}
          <rect x="18" y="386" width="224" height="28" rx="4" fill="#ffffff" />
          <circle cx="70" cy="400" r="4" fill="#4A7AFF" />
          <circle cx="130" cy="400" r="4" fill="#e8e0d8" />
          <circle cx="190" cy="400" r="4" fill="#e8e0d8" />

          {/* Home indicator */}
          <rect x="95" y="424" width="70" height="4" rx="2" fill="#D4CCC4" />
        </svg>
      </div>

      {/* Floating cards around the phone — different parallax speeds */}
      <div
        className="absolute top-4 left-0 sm:left-4"
        style={parallaxStyle(scrollY, -0.1, offset)}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-[#e8e0d8] p-3 w-44 animate-float-slow">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-6 rounded-full bg-[#EDF2FF] flex items-center justify-center">
              <svg className="size-3 text-[#4A7AFF]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <span className="text-[10px] font-bold text-[#1a1a2e]">Cadastro rápido</span>
          </div>
          <p className="text-[9px] text-gray-400 leading-relaxed">Nome e e-mail. Pronto em 30 segundos.</p>
        </div>
      </div>

      <div
        className="absolute bottom-12 left-0 sm:left-8"
        style={parallaxStyle(scrollY, -0.08, offset)}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-[#D6F5E0] p-3 w-48 animate-float-delay">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-6 rounded-full bg-[#D6F5E0] flex items-center justify-center">
              <svg className="size-3 text-[#51CF66]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
            </div>
            <span className="text-[10px] font-bold text-[#51CF66]">Tudo conectado!</span>
          </div>
          <p className="text-[9px] text-gray-400 leading-relaxed">PC do João vinculado ao seu painel.</p>
        </div>
      </div>

      <div
        className="absolute top-1/3 right-0 sm:right-4"
        style={parallaxStyle(scrollY, -0.12, offset)}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-[#FFE0E0] p-3 w-40 animate-float">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-6 rounded-full bg-[#FFE0E0] flex items-center justify-center text-[10px]">🔒</div>
            <span className="text-[10px] font-bold text-[#FF6B6B]">Protegido</span>
          </div>
          <p className="text-[9px] text-gray-400 leading-relaxed">Criança não desinstala</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CTA — Cozy family scene (parent + child + board game)
   Large, warm, emotional
   ───────────────────────────────────────────── */
export function FamilyScene({ className }: { className?: string }) {
  const scrollY = useParallax();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (ref.current) setOffset(ref.current.offsetTop);
  }, []);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {/* Background warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={parallaxStyle(scrollY, -0.02, offset)}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#FFF3D6] opacity-40 blur-3xl" />
      </div>

      <svg
        viewBox="0 0 600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`relative w-full max-w-xl mx-auto ${className ?? ""}`}
        style={parallaxStyle(scrollY, -0.03, offset)}
      >
        {/* Floor/rug */}
        <ellipse cx="300" cy="350" rx="250" ry="30" fill="#FFF3D6" opacity="0.6" />

        {/* Couch background */}
        <rect x="100" y="180" width="400" height="120" rx="20" fill="#E8E0D8" />
        <rect x="90" y="170" width="420" height="40" rx="16" fill="#F0EBE5" />
        {/* Couch cushions */}
        <rect x="110" y="178" width="120" height="30" rx="10" fill="#EDF2FF" opacity="0.5" />
        <rect x="370" y="178" width="120" height="30" rx="10" fill="#FFE0E0" opacity="0.5" />
        {/* Couch arms */}
        <rect x="80" y="175" width="30" height="110" rx="12" fill="#D4CCC4" />
        <rect x="490" y="175" width="30" height="110" rx="12" fill="#D4CCC4" />

        {/* Table */}
        <rect x="200" y="290" width="200" height="10" rx="5" fill="#E8E0D8" />
        <rect x="230" y="300" width="8" height="50" rx="4" fill="#D4CCC4" />
        <rect x="362" y="300" width="8" height="50" rx="4" fill="#D4CCC4" />

        {/* Board game on table */}
        <rect x="230" y="270" width="140" height="24" rx="6" fill="#ffffff" stroke="#e8e0d8" strokeWidth="1" />
        <rect x="238" y="275" width="16" height="14" rx="2" fill="#4A7AFF" opacity="0.4" />
        <rect x="258" y="275" width="16" height="14" rx="2" fill="#FF6B6B" opacity="0.4" />
        <rect x="278" y="275" width="16" height="14" rx="2" fill="#51CF66" opacity="0.4" />
        <rect x="298" y="275" width="16" height="14" rx="2" fill="#FFA94D" opacity="0.4" />
        <circle cx="330" cy="282" r="5" fill="#9775FA" opacity="0.5" />
        <circle cx="346" cy="282" r="5" fill="#4A7AFF" opacity="0.5" />
        <circle cx="358" cy="282" r="3" fill="#FF6B6B" opacity="0.5" />

        {/* Snacks */}
        <rect x="355" y="260" width="30" height="18" rx="4" fill="#FFA94D" opacity="0.3" />
        <circle cx="362" cy="262" r="3" fill="#FFA94D" opacity="0.5" />
        <circle cx="372" cy="264" r="3" fill="#FFA94D" opacity="0.5" />

        {/* Parent sitting on couch */}
        {/* Head */}
        <circle cx="190" cy="140" r="30" fill="#FFA94D" />
        {/* Hair */}
        <path d="M160 135 C160 108 220 108 220 135 C220 118 160 118 160 135Z" fill="#1a1a2e" />
        <path d="M218 128 C222 120 224 112 218 118Z" fill="#1a1a2e" />
        {/* Face */}
        <circle cx="178" cy="140" r="3" fill="#1a1a2e" />
        <circle cx="202" cy="140" r="3" fill="#1a1a2e" />
        {/* Big smile */}
        <path d="M180 152 Q190 162 200 152" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Body */}
        <path d="M158 178 C158 165 222 165 222 178 L224 270 L156 270Z" fill="#4A7AFF" />
        {/* Arm around (reaching toward child) */}
        <path d="M222 195 Q280 180 310 195" stroke="#FFA94D" strokeWidth="14" fill="none" strokeLinecap="round" />
        {/* Other arm on couch */}
        <path d="M158 200 L130 230 L138 235 L160 210" fill="#FFA94D" />
        {/* Legs */}
        <rect x="168" y="268" width="18" height="50" rx="9" fill="#1a1a2e" />
        <rect x="194" y="268" width="18" height="50" rx="9" fill="#1a1a2e" />

        {/* Child sitting on couch (smaller) */}
        {/* Head */}
        <circle cx="340" cy="155" r="24" fill="#FFA94D" />
        {/* Pigtails/fun hair */}
        <path d="M316 150 C316 128 364 128 364 150 C364 136 316 136 316 150Z" fill="#1a1a2e" />
        <circle cx="316" cy="138" r="8" fill="#1a1a2e" />
        <circle cx="364" cy="138" r="8" fill="#1a1a2e" />
        {/* Hair ties */}
        <circle cx="316" cy="138" r="3" fill="#FF6B6B" />
        <circle cx="364" cy="138" r="3" fill="#FF6B6B" />
        {/* Face */}
        <circle cx="332" cy="155" r="2.5" fill="#1a1a2e" />
        <circle cx="348" cy="155" r="2.5" fill="#1a1a2e" />
        {/* Big happy grin */}
        <path d="M332 166 Q340 176 348 166" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Blush */}
        <circle cx="325" cy="162" r="5" fill="#FF6B6B" opacity="0.2" />
        <circle cx="355" cy="162" r="5" fill="#FF6B6B" opacity="0.2" />
        {/* Body — cute t-shirt */}
        <path d="M318 185 C318 175 362 175 362 185 L364 260 L316 260Z" fill="#FF6B6B" />
        {/* Star on shirt */}
        <path d="M340 210 L342 216 L348 216 L343 220 L345 226 L340 222 L335 226 L337 220 L332 216 L338 216Z" fill="#ffffff" opacity="0.5" />
        {/* Arms */}
        <path d="M318 195 L290 215 L295 220 L320 205" fill="#FFA94D" />
        <path d="M362 195 L380 220 L375 225 L358 205" fill="#FFA94D" />
        {/* Legs */}
        <rect x="324" y="258" width="14" height="42" rx="7" fill="#1a1a2e" />
        <rect x="346" y="258" width="14" height="42" rx="7" fill="#1a1a2e" />
        {/* Sneakers */}
        <path d="M320 295 L342 295 C344 295 346 299 342 301 L320 301 C316 301 316 295 320 295Z" fill="#4A7AFF" />
        <path d="M342 295 L364 295 C366 295 368 299 364 301 L342 301 C338 301 338 295 342 295Z" fill="#4A7AFF" />

        {/* Computer in background — OFF with lock screen */}
        <rect x="450" y="110" width="90" height="60" rx="6" fill="#1a1a2e" opacity="0.3" />
        <rect x="456" y="116" width="78" height="42" rx="3" fill="#2a2a3e" opacity="0.3" />
        {/* Lock icon on screen */}
        <rect x="485" y="128" width="16" height="14" rx="3" fill="#4A7AFF" opacity="0.2" />
        <path d="M489 128 L489 124 C489 120 497 120 497 124 L497 128" stroke="#4A7AFF" strokeWidth="1.5" opacity="0.3" fill="none" />
        <rect x="480" y="168" width="26" height="4" rx="2" fill="#D4CCC4" opacity="0.3" />

        {/* "Tempo esgotado" on computer */}
        <text x="493" y="150" textAnchor="middle" fill="#4A7AFF" fontSize="5" opacity="0.3" fontFamily="system-ui">Bloqueado</text>

        {/* Hearts floating above the scene */}
        <g className="animate-float-slow" opacity="0.5">
          <path d="M285 95 C285 85 295 80 300 88 C305 80 315 85 315 95 C315 108 300 115 300 115 C300 115 285 108 285 95Z" fill="#FF6B6B" opacity="0.3" />
        </g>
        <g className="animate-float" opacity="0.4">
          <path d="M255 70 C255 63 262 60 265 65 C268 60 275 63 275 70 C275 79 265 83 265 83 C265 83 255 79 255 70Z" fill="#FF6B6B" opacity="0.3" />
        </g>
        <g className="animate-float-delay" opacity="0.3">
          <path d="M335 80 C335 74 341 72 343 76 C345 72 351 74 351 80 C351 87 343 90 343 90 C343 90 335 87 335 80Z" fill="#FF6B6B" opacity="0.3" />
        </g>

        {/* Sparkles */}
        <circle cx="140" cy="120" r="3" fill="#FFA94D" opacity="0.3" />
        <circle cx="460" cy="90" r="2" fill="#4A7AFF" opacity="0.3" />
        <circle cx="520" cy="200" r="3" fill="#51CF66" opacity="0.2" />
      </svg>
    </div>
  );
}
