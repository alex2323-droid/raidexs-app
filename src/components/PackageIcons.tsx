import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 3D Isometric Gold Ingots (matching Screenshot 1: Blood Strike Golds)
export function GoldBarsIcon({ className = '', size = 56 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_4px_12px_rgba(234,179,8,0.4)] ${className}`}
    >
      <defs>
        {/* Gold Gradients */}
        <linearGradient id="goldTop1" x1="20" y1="30" x2="60" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff7a1" />
          <stop offset="40%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#e6a100" />
        </linearGradient>
        <linearGradient id="goldFront1" x1="20" y1="50" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="goldSide1" x1="50" y1="40" x2="85" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        <linearGradient id="goldTop2" x1="35" y1="20" x2="75" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#ffe66d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="goldFront2" x1="35" y1="40" x2="75" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="goldSide2" x1="65" y1="30" x2="90" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Ambient Glow */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="78" rx="38" ry="12" fill="#000000" fillOpacity="0.45" filter="url(#goldGlow)" />

      {/* Bottom Left Ingot */}
      <g transform="translate(-10, 8)">
        {/* Top Face */}
        <polygon points="26,38 56,22 74,31 44,47" fill="url(#goldTop1)" stroke="#ffe57f" strokeWidth="0.75" />
        {/* Front Face */}
        <polygon points="26,38 44,47 44,60 26,51" fill="url(#goldFront1)" />
        {/* Right Face */}
        <polygon points="44,47 74,31 74,44 44,60" fill="url(#goldSide1)" />
        {/* Specular Highlight Line */}
        <line x1="28" y1="39" x2="43" y2="47" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />
      </g>

      {/* Bottom Right Ingot */}
      <g transform="translate(18, 12)">
        {/* Top Face */}
        <polygon points="26,38 56,22 74,31 44,47" fill="url(#goldTop1)" stroke="#ffe57f" strokeWidth="0.75" />
        {/* Front Face */}
        <polygon points="26,38 44,47 44,60 26,51" fill="url(#goldFront1)" />
        {/* Right Face */}
        <polygon points="44,47 74,31 74,44 44,60" fill="url(#goldSide1)" />
        <line x1="28" y1="39" x2="43" y2="47" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />
      </g>

      {/* Top Stack Ingot */}
      <g transform="translate(5, -6)">
        {/* Top Face */}
        <polygon points="26,38 56,22 74,31 44,47" fill="url(#goldTop2)" stroke="#fff" strokeWidth="0.75" />
        {/* Front Face */}
        <polygon points="26,38 44,47 44,60 26,51" fill="url(#goldFront2)" />
        {/* Right Face */}
        <polygon points="44,47 74,31 74,44 44,60" fill="url(#goldSide2)" />
        {/* Top Bevel Highlight */}
        <line x1="27" y1="38.5" x2="43.5" y2="46.5" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.9" />
        <line x1="44" y1="46.5" x2="73" y2="31.5" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
        {/* Sparkle */}
        <circle cx="34" cy="42" r="1.5" fill="#ffffff" />
      </g>
    </svg>
  );
}

// 3D Silver / Cyan Elite Pass Shield (matching Screenshot 2: Pase Elite)
export function ElitePassIcon({ className = '', size = 56 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_4px_14px_rgba(6,182,212,0.45)] ${className}`}
    >
      <defs>
        <linearGradient id="eliteShieldBg" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0e3a47" />
          <stop offset="50%" stopColor="#082029" />
          <stop offset="100%" stopColor="#031015" />
        </linearGradient>
        <linearGradient id="eliteBorder" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="eliteStripe1" x1="30" y1="25" x2="70" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="eliteStripe2" x1="25" y1="40" x2="65" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="85" rx="28" ry="8" fill="#000000" fillOpacity="0.5" />

      {/* Hexagonal Shield Body */}
      <path
        d="M50 14 L78 28 L78 62 L50 84 L22 62 L22 28 Z"
        fill="url(#eliteShieldBg)"
        stroke="url(#eliteBorder)"
        strokeWidth="2.5"
      />

      {/* Inner Metallic Bevel */}
      <path
        d="M50 20 L72 32 L72 58 L50 76 L28 58 L28 32 Z"
        fill="none"
        stroke="#0ea5e9"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      {/* Chevron Stripes (S-style logo) */}
      <g>
        {/* Top Diagonal Segment */}
        <polygon points="34,36 50,26 66,36 58,42 50,37 42,42" fill="url(#eliteStripe1)" />
        {/* Center Diagonal Slanted Stripe */}
        <polygon points="32,48 46,38 68,52 64,59 48,47 34,56" fill="url(#eliteStripe2)" />
        {/* Bottom Chevron Segment */}
        <polygon points="34,60 50,49 66,60 58,66 50,60 42,66" fill="url(#eliteStripe1)" />
      </g>

      {/* Metallic Specular Highlight */}
      <path d="M50 16 L76 29" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
    </svg>
  );
}

// 3D Golden Premium Pass Shield (matching Screenshot 2: Pase Premium)
export function PremiumPassIcon({ className = '', size = 56 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_4px_14px_rgba(234,179,8,0.5)] ${className}`}
    >
      <defs>
        <linearGradient id="premShieldBg" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="50%" stopColor="#291104" />
          <stop offset="100%" stopColor="#140700" />
        </linearGradient>
        <linearGradient id="premBorder" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#a16207" />
        </linearGradient>
        <linearGradient id="premStripe1" x1="30" y1="25" x2="70" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="premStripe2" x1="25" y1="40" x2="65" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="85" rx="28" ry="8" fill="#000000" fillOpacity="0.5" />

      {/* Hexagonal Shield Body */}
      <path
        d="M50 14 L78 28 L78 62 L50 84 L22 62 L22 28 Z"
        fill="url(#premShieldBg)"
        stroke="url(#premBorder)"
        strokeWidth="2.5"
      />

      {/* Inner Metallic Bevel */}
      <path
        d="M50 20 L72 32 L72 58 L50 76 L28 58 L28 32 Z"
        fill="none"
        stroke="#facc15"
        strokeWidth="1"
        strokeOpacity="0.45"
      />

      {/* Golden Chevron Stripes (S-style logo) */}
      <g>
        <polygon points="34,36 50,26 66,36 58,42 50,37 42,42" fill="url(#premStripe1)" />
        <polygon points="32,48 46,38 68,52 64,59 48,47 34,56" fill="url(#premStripe2)" />
        <polygon points="34,60 50,49 66,60 58,66 50,60 42,66" fill="url(#premStripe1)" />
      </g>

      {/* Highlight Line */}
      <path d="M50 16 L76 29" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9" />
    </svg>
  );
}

// 3D Treasure Chest (matching Screenshot 2: Cofre Suerte Ultra Skin)
export function TreasureChestIcon({ className = '', size = 56 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_4px_14px_rgba(245,158,11,0.45)] ${className}`}
    >
      <defs>
        <linearGradient id="chestWood" x1="20" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="50%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#291104" />
        </linearGradient>
        <linearGradient id="chestGold" x1="15" y1="20" x2="85" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <linearGradient id="chestLoot" x1="30" y1="35" x2="70" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="84" rx="34" ry="9" fill="#000000" fillOpacity="0.5" />

      {/* Chest Base */}
      <path
        d="M20 50 L80 50 L75 80 L25 80 Z"
        fill="url(#chestWood)"
        stroke="url(#chestGold)"
        strokeWidth="2"
      />

      {/* Glowing Loot inside opened lid */}
      <ellipse cx="50" cy="48" rx="26" ry="8" fill="url(#chestLoot)" />
      <circle cx="44" cy="46" r="3" fill="#38bdf8" />
      <circle cx="56" cy="45" r="3.5" fill="#facc15" />
      <circle cx="50" cy="43" r="2.5" fill="#ec4899" />

      {/* Chest Lid (Tilted Open) */}
      <path
        d="M18 46 L82 46 L76 28 C70 22 30 22 24 28 Z"
        fill="url(#chestWood)"
        stroke="url(#chestGold)"
        strokeWidth="2"
      />

      {/* Gold Trim Bands on Lid */}
      <path d="M34 25 L32 46" stroke="url(#chestGold)" strokeWidth="3" />
      <path d="M66 25 L68 46" stroke="url(#chestGold)" strokeWidth="3" />

      {/* Gold Trim Bands on Base */}
      <path d="M33 50 L35 79" stroke="url(#chestGold)" strokeWidth="3" />
      <path d="M67 50 L65 79" stroke="url(#chestGold)" strokeWidth="3" />

      {/* Center Golden Lock */}
      <rect x="44" y="44" width="12" height="12" rx="3" fill="url(#chestGold)" stroke="#fef08a" strokeWidth="1" />
      <circle cx="50" cy="49" r="2" fill="#451a03" />
      <rect x="49" y="50" width="2" height="3" fill="#451a03" />

      {/* Sparkles */}
      <circle cx="38" cy="36" r="1.5" fill="#ffffff" />
      <circle cx="62" cy="38" r="1.5" fill="#ffffff" />
    </svg>
  );
}

// 3D Diamond Cluster (for Free Fire, MLBB, etc.)
export function DiamondClusterIcon({ className = '', size = 56 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_4px_14px_rgba(6,182,212,0.5)] ${className}`}
    >
      <defs>
        <linearGradient id="diaTop" x1="30" y1="20" x2="70" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="diaFront1" x1="20" y1="40" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="diaFront2" x1="50" y1="40" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="diaFrontMid" x1="35" y1="40" x2="65" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="84" rx="28" ry="8" fill="#000000" fillOpacity="0.45" />

      {/* Main Diamond Facets */}
      <polygon points="32,32 68,32 50,42" fill="url(#diaTop)" />
      <polygon points="20,42 32,32 50,42" fill="#7dd3fc" />
      <polygon points="80,42 68,32 50,42" fill="#0284c7" />

      {/* Lower Facets converging to bottom tip */}
      <polygon points="20,42 50,42 38,78" fill="url(#diaFront1)" />
      <polygon points="80,42 50,42 62,78" fill="url(#diaFront2)" />
      <polygon points="38,78 50,42 62,78 50,82" fill="url(#diaFrontMid)" />

      {/* Highlights */}
      <line x1="32" y1="32" x2="68" y2="32" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
      <line x1="20" y1="42" x2="50" y2="82" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.6" />
      <circle cx="34" cy="35" r="1.5" fill="#ffffff" />
    </svg>
  );
}

// Master Icon Renderer
export function PackageIcon({
  pkg,
  gameCurrency = '',
  size = 56,
  className = '',
}: {
  pkg: { id?: string; currency?: string; title?: string; iconUrl?: string; amount?: number };
  gameCurrency?: string;
  size?: number;
  className?: string;
}) {
  const currencyLower = (pkg.currency || gameCurrency || '').toLowerCase();
  const titleLower = (pkg.title || '').toLowerCase();
  const idLower = (pkg.id || '').toLowerCase();

  // 1. If it's a pass
  if (titleLower.includes('elite') || idLower.includes('elite')) {
    return <ElitePassIcon size={size} className={className} />;
  }
  if (titleLower.includes('premium') || idLower.includes('premium')) {
    return <PremiumPassIcon size={size} className={className} />;
  }
  if (titleLower.includes('cofre') || titleLower.includes('suerte') || titleLower.includes('chest') || idLower.includes('cofre')) {
    return <TreasureChestIcon size={size} className={className} />;
  }

  // 2. If it's gold/golds
  if (currencyLower.includes('gold') || currencyLower.includes('oro') || idLower.includes('gold')) {
    return <GoldBarsIcon size={size} className={className} />;
  }

  // 3. If diamonds
  if (currencyLower.includes('diamond') || currencyLower.includes('diamante') || idLower.includes('diamond')) {
    return <DiamondClusterIcon size={size} className={className} />;
  }

  // 4. Fallback to image or gold bars if custom URL
  if (pkg.iconUrl && pkg.iconUrl.startsWith('http')) {
    return (
      <img
        src={pkg.iconUrl}
        alt={pkg.currency || 'Package'}
        style={{ width: size, height: size }}
        className={`object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] ${className}`}
      />
    );
  }

  // Default to Gold bars
  return <GoldBarsIcon size={size} className={className} />;
}
