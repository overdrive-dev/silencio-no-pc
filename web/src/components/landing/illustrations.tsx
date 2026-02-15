export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Desk */}
      <rect x="120" y="260" width="260" height="12" rx="6" fill="#E8E0D8" />
      <rect x="160" y="272" width="8" height="80" rx="4" fill="#D4CCC4" />
      <rect x="332" y="272" width="8" height="80" rx="4" fill="#D4CCC4" />

      {/* Monitor */}
      <rect x="170" y="160" width="160" height="100" rx="10" fill="#1a1a2e" />
      <rect x="178" y="168" width="144" height="76" rx="4" fill="#4A7AFF" opacity="0.15" />
      <rect x="235" y="252" width="30" height="12" rx="2" fill="#D4CCC4" />

      {/* Screen content - time display */}
      <text x="250" y="210" textAnchor="middle" fill="#4A7AFF" fontSize="22" fontWeight="bold" fontFamily="system-ui">1:30</text>
      <text x="250" y="228" textAnchor="middle" fill="#6B7280" fontSize="9" fontFamily="system-ui">restante</text>

      {/* Shield on screen */}
      <path d="M220 190 L220 198 C220 204 224 208 230 210 L220 190Z" fill="#51CF66" opacity="0.4" />

      {/* Person sitting - body */}
      <circle cx="100" cy="195" r="22" fill="#FFA94D" /> {/* Head */}
      <path d="M78 230 C78 215 122 215 122 230 L122 280 L78 280Z" fill="#4A7AFF" /> {/* Torso/shirt */}

      {/* Arms */}
      <path d="M122 240 L158 230 L165 240 L125 252" fill="#FFA94D" /> {/* Right arm reaching to keyboard */}
      <path d="M78 240 L60 260 L68 265 L82 250" fill="#FFA94D" /> {/* Left arm */}

      {/* Legs */}
      <rect x="82" y="278" width="14" height="40" rx="7" fill="#1a1a2e" />
      <rect x="104" y="278" width="14" height="40" rx="7" fill="#1a1a2e" />

      {/* Chair */}
      <path d="M65 260 C65 240 135 240 135 260 L135 290 L65 290Z" fill="#E8E0D8" opacity="0.5" />

      {/* Hair */}
      <path d="M78 190 C78 172 122 172 122 190 C122 180 78 180 78 190Z" fill="#1a1a2e" />

      {/* Face */}
      <circle cx="93" cy="195" r="2" fill="#1a1a2e" /> {/* Left eye */}
      <circle cx="107" cy="195" r="2" fill="#1a1a2e" /> {/* Right eye */}
      <path d="M95 202 Q100 206 105 202" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" /> {/* Smile */}

      {/* Phone floating - parent controlling */}
      <g className="animate-float">
        <rect x="370" y="180" width="55" height="90" rx="10" fill="#1a1a2e" />
        <rect x="376" y="188" width="43" height="66" rx="4" fill="#EDF2FF" />
        <circle cx="397" cy="262" r="3" fill="#4A7AFF" opacity="0.3" />

        {/* Phone screen content */}
        <rect x="382" y="194" width="31" height="6" rx="3" fill="#4A7AFF" opacity="0.3" />
        <rect x="382" y="204" width="20" height="4" rx="2" fill="#51CF66" opacity="0.4" />
        <rect x="382" y="212" width="31" height="4" rx="2" fill="#E8E0D8" />
        <rect x="382" y="220" width="31" height="4" rx="2" fill="#E8E0D8" />
        <rect x="382" y="232" width="31" height="12" rx="6" fill="#4A7AFF" opacity="0.2" />
      </g>

      {/* Decorative dots */}
      <circle cx="340" cy="170" r="4" fill="#4A7AFF" opacity="0.2" />
      <circle cx="360" cy="155" r="3" fill="#FF6B6B" opacity="0.2" />
      <circle cx="380" cy="165" r="2" fill="#FFA94D" opacity="0.3" />

      {/* Connection line from phone to monitor */}
      <path d="M370 225 Q320 200 330 195" stroke="#4A7AFF" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.3" fill="none" />
    </svg>
  );
}

export function ParentPhoneIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person standing */}
      <circle cx="150" cy="80" r="30" fill="#FFA94D" /> {/* Head */}
      <path d="M120 120 C120 105 180 105 180 120 L180 200 L120 200Z" fill="#4A7AFF" /> {/* Shirt */}

      {/* Hair */}
      <path d="M122 75 C122 55 178 55 178 75 C178 62 122 62 122 75Z" fill="#1a1a2e" />
      <path d="M175 68 C178 75 180 85 175 80Z" fill="#1a1a2e" />

      {/* Face */}
      <circle cx="140" cy="78" r="2.5" fill="#1a1a2e" />
      <circle cx="160" cy="78" r="2.5" fill="#1a1a2e" />
      <path d="M143 88 Q150 93 157 88" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Right arm holding phone */}
      <path d="M180 130 L205 155 L200 160 L175 140" fill="#FFA94D" />

      {/* Phone in hand */}
      <rect x="195" y="140" width="40" height="65" rx="8" fill="#1a1a2e" />
      <rect x="200" y="147" width="30" height="44" rx="3" fill="#EDF2FF" />
      <circle cx="215" cy="198" r="2.5" fill="#4A7AFF" opacity="0.3" />

      {/* Phone screen - checkmark */}
      <circle cx="215" cy="165" r="10" fill="#51CF66" opacity="0.2" />
      <path d="M210 165 L213 168 L220 161" stroke="#51CF66" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Left arm */}
      <path d="M120 130 L95 160 L100 165 L125 140" fill="#FFA94D" />

      {/* Legs */}
      <rect x="128" y="198" width="18" height="55" rx="9" fill="#1a1a2e" />
      <rect x="154" y="198" width="18" height="55" rx="9" fill="#1a1a2e" />

      {/* Shoes */}
      <ellipse cx="137" cy="255" rx="14" ry="6" fill="#FF6B6B" />
      <ellipse cx="163" cy="255" rx="14" ry="6" fill="#FF6B6B" />

      {/* Notification bubbles floating */}
      <g className="animate-float-delay">
        <circle cx="245" cy="120" r="16" fill="#DAE5FF" />
        <text x="245" y="124" textAnchor="middle" fill="#4A7AFF" fontSize="14" fontFamily="system-ui">✓</text>
      </g>
      <g className="animate-float">
        <circle cx="80" cy="100" r="12" fill="#FFE0E0" />
        <text x="80" y="104" textAnchor="middle" fill="#FF6B6B" fontSize="10" fontFamily="system-ui">♡</text>
      </g>
    </svg>
  );
}

export function FamilyIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Parent */}
      <circle cx="160" cy="90" r="28" fill="#FFA94D" />
      <path d="M132 125 C132 110 188 110 188 125 L188 200 L132 200Z" fill="#4A7AFF" />
      <path d="M134 85 C134 65 186 65 186 85 C186 73 134 73 134 85Z" fill="#1a1a2e" />
      <circle cx="150" cy="88" r="2.5" fill="#1a1a2e" />
      <circle cx="170" cy="88" r="2.5" fill="#1a1a2e" />
      <path d="M153 98 Q160 103 167 98" stroke="#1a1a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="140" y="198" width="16" height="50" rx="8" fill="#1a1a2e" />
      <rect x="164" y="198" width="16" height="50" rx="8" fill="#1a1a2e" />

      {/* Child */}
      <circle cx="260" cy="120" r="22" fill="#FFA94D" />
      <path d="M238 148 C238 136 282 136 282 148 L282 210 L238 210Z" fill="#FF6B6B" />
      <path d="M240 116 C240 100 280 100 280 116 C280 106 240 106 240 116Z" fill="#1a1a2e" />
      <circle cx="252" cy="118" r="2" fill="#1a1a2e" />
      <circle cx="268" cy="118" r="2" fill="#1a1a2e" />
      <path d="M255 127 Q260 131 265 127" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="245" y="208" width="13" height="40" rx="6.5" fill="#1a1a2e" />
      <rect x="263" y="208" width="13" height="40" rx="6.5" fill="#1a1a2e" />

      {/* Parent arm around child */}
      <path d="M188 140 Q220 135 240 148" stroke="#FFA94D" strokeWidth="12" fill="none" strokeLinecap="round" />

      {/* Book in child's hand */}
      <rect x="285" y="170" width="30" height="38" rx="3" fill="#FFA94D" opacity="0.3" />
      <rect x="287" y="173" width="26" height="32" rx="2" fill="#ffffff" />
      <rect x="291" y="179" width="18" height="2" rx="1" fill="#E8E0D8" />
      <rect x="291" y="185" width="14" height="2" rx="1" fill="#E8E0D8" />
      <rect x="291" y="191" width="18" height="2" rx="1" fill="#E8E0D8" />

      {/* Decorative elements */}
      <circle cx="80" cy="150" r="30" fill="#DAE5FF" opacity="0.5" />
      <circle cx="340" cy="80" r="20" fill="#FFE0E0" opacity="0.5" />
      <circle cx="320" cy="250" r="15" fill="#FFF3D6" opacity="0.5" />

      {/* Stars/sparkles */}
      <path d="M100 80 L103 88 L111 88 L105 93 L107 101 L100 96 L93 101 L95 93 L89 88 L97 88Z" fill="#FFA94D" opacity="0.3" />
      <path d="M350 140 L352 145 L357 145 L353 148 L354 153 L350 150 L346 153 L347 148 L343 145 L348 145Z" fill="#4A7AFF" opacity="0.3" />
    </svg>
  );
}
