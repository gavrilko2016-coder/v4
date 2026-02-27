import React from 'react';

// Common props for icons
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const DefaultIcon: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <rect width="24" height="24" rx="4" fill="currentColor" fillOpacity="0.2"/>
  </svg>
);

// ─── Game Icons ─────────────────────────────────────────────────────────────

export const IconCrash: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="crash_body" x1="20" y1="10" x2="45" y2="50" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff66aa"/>
        <stop offset="1" stopColor="#cc0055"/>
      </linearGradient>
      <linearGradient id="crash_flame" x1="22" y1="48" x2="22" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffdd00"/>
        <stop offset="0.5" stopColor="#ff6600"/>
        <stop offset="1" stopColor="#ff2200"/>
      </linearGradient>
      <filter id="crash_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Rocket body */}
    <path d="M32 6C32 6 22 18 22 32C22 40 26 46 32 46C38 46 42 40 42 32C42 18 32 6 32 6Z" fill="url(#crash_body)" filter="url(#crash_glow)"/>
    {/* Window */}
    <circle cx="32" cy="24" r="5" fill="#1a0033" stroke="#ff99cc" strokeWidth="1.5"/>
    <circle cx="32" cy="24" r="3" fill="#4400aa" opacity="0.6"/>
    {/* Fins */}
    <path d="M22 36L14 44L22 42Z" fill="#cc0066"/>
    <path d="M42 36L50 44L42 42Z" fill="#cc0066"/>
    {/* Nose tip */}
    <ellipse cx="32" cy="8" rx="3" ry="4" fill="#ffaacc"/>
    {/* Flame */}
    <path d="M28 46C28 46 26 54 22 60C26 56 32 58 32 58C32 58 38 56 42 60C38 54 36 46 36 46" fill="url(#crash_flame)" filter="url(#crash_glow)"/>
    <path d="M30 46C30 46 29 52 28 56C30 53 32 54 32 54C32 54 34 53 36 56C35 52 34 46 34 46" fill="#ffee44" opacity="0.8"/>
    {/* Sparkles */}
    <circle cx="16" cy="18" r="1.5" fill="#ff66ff" opacity="0.7"/>
    <circle cx="48" cy="14" r="1" fill="#ff99ff" opacity="0.6"/>
    <circle cx="12" cy="30" r="1" fill="#ffaaff" opacity="0.5"/>
    <circle cx="50" cy="28" r="1.5" fill="#ff77ff" opacity="0.6"/>
    {/* Star sparkles */}
    <path d="M14 12L15 14L17 13L15.5 15L14 12Z" fill="#ffffff" opacity="0.5"/>
    <path d="M50 20L51 22L53 21L51.5 23L50 20Z" fill="#ffffff" opacity="0.4"/>
  </svg>
);

export const IconMines: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="mines_bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00cc88"/>
        <stop offset="1" stopColor="#008866"/>
      </linearGradient>
      <filter id="mines_glow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Board background */}
    <rect x="6" y="6" width="52" height="52" rx="8" fill="url(#mines_bg)" stroke="#00ffaa" strokeWidth="2" filter="url(#mines_glow)"/>
    {/* Grid cells - 4x4 */}
    {[0,1,2,3].map(row => [0,1,2,3].map(col => (
      <circle key={`${row}-${col}`} cx={16 + col * 12} cy={16 + row * 12} r="4" fill="#004433" stroke="#00ffaa" strokeWidth="1" opacity="0.8"/>
    )))}
    {/* Some revealed gems */}
    <circle cx="16" cy="16" r="3" fill="#00ffcc" opacity="0.9"/>
    <circle cx="40" cy="28" r="3" fill="#00ffcc" opacity="0.9"/>
    <circle cx="28" cy="40" r="3" fill="#00ffcc" opacity="0.9"/>
  </svg>
);

export const IconDice: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="dice_face" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffaa00"/>
        <stop offset="1" stopColor="#ff7700"/>
      </linearGradient>
      <filter id="dice_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* 3D dice - top face */}
    <path d="M32 6L56 18V42L32 54L8 42V18L32 6Z" fill="url(#dice_face)" stroke="#ffcc44" strokeWidth="1.5" filter="url(#dice_glow)"/>
    {/* Top face */}
    <path d="M32 6L56 18L32 30L8 18L32 6Z" fill="#ffcc44" opacity="0.4"/>
    {/* Right face */}
    <path d="M56 18L32 30V54L56 42V18Z" fill="#cc7700" opacity="0.6"/>
    {/* Left face */}
    <path d="M8 18L32 30V54L8 42V18Z" fill="#ff9900" opacity="0.5"/>
    {/* Dots on top face */}
    <circle cx="24" cy="16" r="2.5" fill="#fff8e0"/>
    <circle cx="32" cy="20" r="2.5" fill="#fff8e0"/>
    <circle cx="40" cy="16" r="2.5" fill="#fff8e0"/>
    {/* Dots on right face */}
    <circle cx="44" cy="30" r="2" fill="#fff8e0" opacity="0.7"/>
    <circle cx="44" cy="38" r="2" fill="#fff8e0" opacity="0.7"/>
    {/* Dots on left face */}
    <circle cx="20" cy="30" r="2" fill="#fff8e0" opacity="0.7"/>
    <circle cx="20" cy="38" r="2" fill="#fff8e0" opacity="0.7"/>
    <circle cx="20" cy="34" r="2" fill="#fff8e0" opacity="0.7"/>
  </svg>
);

export const IconBlackjack: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="bj_card" x1="10" y1="8" x2="50" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff4400"/>
        <stop offset="1" stopColor="#cc0000"/>
      </linearGradient>
      <filter id="bj_glow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Card */}
    <rect x="12" y="6" width="40" height="52" rx="4" fill="url(#bj_card)" stroke="#ff6633" strokeWidth="2" filter="url(#bj_glow)"/>
    {/* Inner border */}
    <rect x="16" y="10" width="32" height="44" rx="2" fill="none" stroke="#ff9966" strokeWidth="0.5" opacity="0.5"/>
    {/* A letter top-left */}
    <text x="19" y="22" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="12" fill="#ffcc88">A</text>
    {/* Spade symbol center */}
    <path d="M32 22C32 22 24 30 24 35C24 38 27 40 30 38C28 42 26 44 26 44H38C38 44 36 42 34 38C37 40 40 38 40 35C40 30 32 22 32 22Z" fill="#ff8844"/>
    {/* A letter bottom-right (inverted) */}
    <text x="41" y="52" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="12" fill="#ffcc88" transform="rotate(180 43 48)">A</text>
  </svg>
);

export const IconCoinFlip: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="coin_grad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffcc00"/>
        <stop offset="0.5" stopColor="#ff9900"/>
        <stop offset="1" stopColor="#cc7700"/>
      </linearGradient>
      <filter id="coin_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Main coin */}
    <circle cx="32" cy="32" r="24" fill="url(#coin_grad)" stroke="#ffdd44" strokeWidth="2" filter="url(#coin_glow)"/>
    {/* Inner ring */}
    <circle cx="32" cy="32" r="19" fill="none" stroke="#ffee88" strokeWidth="1.5" opacity="0.5"/>
    {/* Bitcoin B symbol */}
    <path d="M28 20V44M28 20H35C38.3 20 41 22.7 41 26C41 29.3 38.3 32 35 32H28M28 32H36C39.3 32 42 34.7 42 38C42 41.3 39.3 44 36 44H28" stroke="#553300" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M31 17V20M35 17V20M31 44V47M35 44V47" stroke="#553300" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Shine */}
    <ellipse cx="24" cy="22" rx="6" ry="8" fill="white" opacity="0.15" transform="rotate(-30 24 22)"/>
    {/* Small sparkles */}
    <circle cx="10" cy="16" r="2" fill="#ffdd00" opacity="0.6"/>
    <circle cx="54" cy="48" r="1.5" fill="#ffcc00" opacity="0.5"/>
    {/* Second smaller coin behind */}
    <circle cx="22" cy="48" r="10" fill="#cc8800" opacity="0.4" stroke="#ffaa00" strokeWidth="1"/>
  </svg>
);

export const IconSlots: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="slots_bg" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4444ff"/>
        <stop offset="1" stopColor="#2222aa"/>
      </linearGradient>
      <linearGradient id="slots_seven" x1="20" y1="20" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff4466"/>
        <stop offset="1" stopColor="#cc0033"/>
      </linearGradient>
      <filter id="slots_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Machine body */}
    <rect x="6" y="4" width="52" height="56" rx="8" fill="url(#slots_bg)" stroke="#6666ff" strokeWidth="2" filter="url(#slots_glow)"/>
    {/* Screen area */}
    <rect x="12" y="10" width="40" height="32" rx="4" fill="#0a0a2a" stroke="#4444cc" strokeWidth="1"/>
    {/* Reel dividers */}
    <line x1="25" y1="12" x2="25" y2="40" stroke="#333366" strokeWidth="1"/>
    <line x1="39" y1="12" x2="39" y2="40" stroke="#333366" strokeWidth="1"/>
    {/* 7s on reels */}
    <text x="18.5" y="31" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="16" fill="url(#slots_seven)" textAnchor="middle">7</text>
    <text x="32" y="31" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="16" fill="url(#slots_seven)" textAnchor="middle">7</text>
    <text x="45.5" y="31" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="16" fill="url(#slots_seven)" textAnchor="middle">7</text>
    {/* Win line */}
    <line x1="12" y1="26" x2="52" y2="26" stroke="#ffdd00" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 2"/>
    {/* Bottom panel */}
    <rect x="14" y="46" width="36" height="8" rx="3" fill="#1a1a44" stroke="#4444aa" strokeWidth="1"/>
    {/* Lights on top */}
    <circle cx="18" cy="8" r="2" fill="#ff4466" opacity="0.8"/>
    <circle cx="28" cy="8" r="2" fill="#ffdd00" opacity="0.8"/>
    <circle cx="38" cy="8" r="2" fill="#00ff88" opacity="0.8"/>
    <circle cx="48" cy="8" r="2" fill="#ff4466" opacity="0.8"/>
    {/* Sparkle effects */}
    <circle cx="8" cy="14" r="3" fill="#ffdd00" opacity="0.3"/>
    <circle cx="56" cy="14" r="3" fill="#ffdd00" opacity="0.3"/>
  </svg>
);

export const IconLimbo: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="limbo_grad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8b5cf6"/>
        <stop offset="1" stopColor="#6d28d9"/>
      </linearGradient>
      <filter id="limbo_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Outer target ring */}
    <circle cx="32" cy="32" r="24" stroke="url(#limbo_grad)" strokeWidth="3" fill="none" filter="url(#limbo_glow)" opacity="0.8"/>
    <circle cx="32" cy="32" r="24" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.2"/>
    
    {/* Middle ring segments */}
    <path d="M32 16 A16 16 0 0 1 48 32" stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M32 48 A16 16 0 0 1 16 32" stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round"/>
    
    {/* Center bullseye */}
    <circle cx="32" cy="32" r="6" fill="#00ff88" filter="url(#limbo_glow)"/>
    <circle cx="32" cy="32" r="3" fill="#ffffff"/>
    
    {/* Crosshairs */}
    <line x1="32" y1="4" x2="32" y2="12" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
    <line x1="32" y1="52" x2="32" y2="60" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4" y1="32" x2="12" y2="32" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
    <line x1="52" y1="32" x2="60" y2="32" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── Currency Icons ──────────────────────────────────────────────────────────

export const IconUSDT: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="usdt_bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00e88a"/>
        <stop offset="1" stopColor="#00aa66"/>
      </linearGradient>
      <filter id="usdt_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <circle cx="32" cy="32" r="26" fill="url(#usdt_bg)" filter="url(#usdt_glow)"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#aaffcc" strokeWidth="1.5" opacity="0.3"/>
    <text x="32" y="42" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="28" fill="#ffffff" textAnchor="middle">$</text>
    <ellipse cx="24" cy="20" rx="6" ry="8" fill="white" opacity="0.12" transform="rotate(-30 24 20)"/>
  </svg>
);

export const IconBitcoin: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="btc_bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffaa00"/>
        <stop offset="1" stopColor="#ee7700"/>
      </linearGradient>
      <filter id="btc_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <circle cx="32" cy="32" r="26" fill="url(#btc_bg)" filter="url(#btc_glow)"/>
    <circle cx="32" cy="32" r="22" fill="none" stroke="#ffdd88" strokeWidth="1.5" opacity="0.3"/>
    <path d="M28 18V46M28 18H36C40 18 43 21 43 25C43 29 40 32 36 32H28M28 32H37C41 32 44 35 44 39C44 43 41 46 37 46H28" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M31 15V18M36 15V18M31 46V49M36 46V49" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="24" cy="20" rx="6" ry="8" fill="white" opacity="0.12" transform="rotate(-30 24 20)"/>
  </svg>
);

export const IconEthereum: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="eth_bg" x1="16" y1="4" x2="48" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#88aaff"/>
        <stop offset="1" stopColor="#5566dd"/>
      </linearGradient>
      <filter id="eth_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <path d="M32 4L32 28L52 20L32 4Z" fill="url(#eth_bg)" opacity="0.8" filter="url(#eth_glow)"/>
    <path d="M32 4L12 20L32 28V4Z" fill="#7799ee"/>
    <path d="M32 34L32 60L52 26L32 34Z" fill="url(#eth_bg)" opacity="0.7"/>
    <path d="M32 60V34L12 26L32 60Z" fill="#7799ee"/>
    <path d="M32 28L12 20L52 20L32 28Z" fill="#aabbff" opacity="0.3"/>
  </svg>
);

export const IconSolana: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="sol_g1" x1="8" y1="48" x2="56" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
      <linearGradient id="sol_g2" x1="8" y1="32" x2="56" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
      <linearGradient id="sol_g3" x1="8" y1="16" x2="56" y2="16" gradientUnits="userSpaceOnUse"><stop stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
      <filter id="sol_glow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <path d="M8 44H56L48 54H16L8 44Z" fill="url(#sol_g1)" filter="url(#sol_glow)"/>
    <path d="M8 28H56L48 38H16L8 28Z" fill="url(#sol_g2)" filter="url(#sol_glow)"/>
    <path d="M8 10H56L48 20H16L8 10Z" fill="url(#sol_g3)" filter="url(#sol_glow)"/>
  </svg>
);

export const IconBNB: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <filter id="bnb_glow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <path d="M32 10L42 20L32 30L22 20L32 10Z" fill="#F3BA2F" filter="url(#bnb_glow)"/>
    <path d="M12 30L22 40L32 30L22 20L12 30Z" fill="#F3BA2F" filter="url(#bnb_glow)"/>
    <path d="M52 30L42 40L32 30L42 20L52 30Z" fill="#F3BA2F" filter="url(#bnb_glow)"/>
    <path d="M32 50L42 40L32 30L22 40L32 50Z" fill="#F3BA2F" filter="url(#bnb_glow)"/>
  </svg>
);

export const IconTON: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="ton_bg" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#44ccff"/>
        <stop offset="1" stopColor="#0088dd"/>
      </linearGradient>
      <filter id="ton_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Diamond shape */}
    <path d="M32 6L54 32L32 58L10 32L32 6Z" fill="url(#ton_bg)" filter="url(#ton_glow)"/>
    <path d="M32 6L54 32L32 32L10 32L32 6Z" fill="#66ddff" opacity="0.4"/>
    <path d="M32 32L54 32L32 58Z" fill="#0066aa" opacity="0.3"/>
    {/* Inner facets */}
    <path d="M32 14L46 32L32 50L18 32L32 14Z" fill="none" stroke="#aaeeff" strokeWidth="1" opacity="0.4"/>
    <line x1="32" y1="14" x2="32" y2="50" stroke="#aaeeff" strokeWidth="0.8" opacity="0.3"/>
    <line x1="18" y1="32" x2="46" y2="32" stroke="#aaeeff" strokeWidth="0.8" opacity="0.3"/>
    {/* Shine */}
    <ellipse cx="24" cy="22" rx="6" ry="8" fill="white" opacity="0.15" transform="rotate(-20 24 22)"/>
  </svg>
);

export const IconStars: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="stars_grad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffdd00"/>
        <stop offset="1" stopColor="#ffaa00"/>
      </linearGradient>
      <filter id="stars_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Main star */}
    <path d="M32 4L38 22L56 22L42 34L47 52L32 42L17 52L22 34L8 22L26 22Z" fill="url(#stars_grad)" filter="url(#stars_glow)"/>
    {/* Inner highlight */}
    <path d="M32 12L36 24L48 24L38 32L42 44L32 36L22 44L26 32L16 24L28 24Z" fill="#ffee66" opacity="0.4"/>
    {/* Small sparkle stars */}
    <path d="M52 8L54 12L56 8L54 10Z" fill="#ffdd44" opacity="0.7"/>
    <path d="M10 44L12 48L14 44L12 46Z" fill="#ffdd44" opacity="0.6"/>
    {/* Telegram paper plane hint */}
    <path d="M28 28L36 24L32 32L30 30Z" fill="#ffaa00" opacity="0.5"/>
  </svg>
);

// ─── Navigation Icons ────────────────────────────────────────────────────────

export const IconHistory: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="hist_ring" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#44aaff"/>
        <stop offset="1" stopColor="#0066dd"/>
      </linearGradient>
      <filter id="hist_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Outer ring */}
    <circle cx="32" cy="32" r="26" fill="none" stroke="url(#hist_ring)" strokeWidth="4" filter="url(#hist_glow)"/>
    {/* Inner fill */}
    <circle cx="32" cy="32" r="23" fill="#0a1a3a" opacity="0.6"/>
    {/* Tick marks */}
    <line x1="32" y1="8" x2="32" y2="14" stroke="#44aaff" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="50" x2="32" y2="56" stroke="#44aaff" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="8" y1="32" x2="14" y2="32" stroke="#44aaff" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="50" y1="32" x2="56" y2="32" stroke="#44aaff" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Small tick marks */}
    <line x1="49" y1="15" x2="46" y2="18" stroke="#44aaff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <line x1="15" y1="49" x2="18" y2="46" stroke="#44aaff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <line x1="49" y1="49" x2="46" y2="46" stroke="#44aaff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <line x1="15" y1="15" x2="18" y2="18" stroke="#44aaff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    {/* Clock hands */}
    <line x1="32" y1="32" x2="32" y2="18" stroke="#66ccff" strokeWidth="3" strokeLinecap="round"/>
    <line x1="32" y1="32" x2="42" y2="40" stroke="#66ccff" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Center dot */}
    <circle cx="32" cy="32" r="3" fill="#44aaff"/>
    <circle cx="32" cy="32" r="1.5" fill="#aaddff"/>
  </svg>
);

export const IconWallet: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="wallet_bg" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#bb44ff"/>
        <stop offset="1" stopColor="#7700cc"/>
      </linearGradient>
      <filter id="wallet_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Safe body */}
    <rect x="10" y="12" width="44" height="40" rx="6" fill="url(#wallet_bg)" stroke="#cc66ff" strokeWidth="2" filter="url(#wallet_glow)"/>
    {/* Top handle */}
    <path d="M22 12V8C22 6 24 4 26 4H38C40 4 42 6 42 8V12" stroke="#cc66ff" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Inner panel */}
    <rect x="16" y="18" width="32" height="28" rx="3" fill="#2a0055" opacity="0.5" stroke="#9944dd" strokeWidth="1"/>
    {/* Lock dial */}
    <circle cx="32" cy="32" r="8" fill="none" stroke="#ffaa44" strokeWidth="2.5"/>
    <circle cx="32" cy="32" r="3" fill="#ffaa44"/>
    {/* Keyhole */}
    <rect x="30.5" y="33" width="3" height="5" rx="1" fill="#ffaa44"/>
    {/* Corner bolts */}
    <circle cx="18" cy="20" r="1.5" fill="#9944dd" opacity="0.6"/>
    <circle cx="46" cy="20" r="1.5" fill="#9944dd" opacity="0.6"/>
    <circle cx="18" cy="44" r="1.5" fill="#9944dd" opacity="0.6"/>
    <circle cx="46" cy="44" r="1.5" fill="#9944dd" opacity="0.6"/>
  </svg>
);

export const IconEarn: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="earn_arrow" x1="16" y1="48" x2="52" y2="12" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00cc44"/>
        <stop offset="1" stopColor="#00ff88"/>
      </linearGradient>
      <filter id="earn_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Coin base */}
    <circle cx="26" cy="38" r="18" fill="#cc7700" opacity="0.3" stroke="#ffaa00" strokeWidth="1.5"/>
    <circle cx="26" cy="38" r="14" fill="#ffaa00" opacity="0.2"/>
    <text x="26" y="44" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="16" fill="#ffcc44" textAnchor="middle" opacity="0.7">$</text>
    {/* Rising arrow */}
    <path d="M16 48L28 32L36 38L52 16" stroke="url(#earn_arrow)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#earn_glow)"/>
    {/* Arrow head */}
    <path d="M46 12L54 10L52 20" stroke="#00ff88" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Sparkles */}
    <circle cx="54" cy="10" r="2" fill="#00ff88" opacity="0.6"/>
    <circle cx="44" cy="8" r="1.5" fill="#00ffaa" opacity="0.5"/>
  </svg>
);

export const IconProfile: React.FC<IconProps> = ({ size = 24, className, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
    <defs>
      <linearGradient id="prof_ring" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ff4488"/>
        <stop offset="1" stopColor="#cc0044"/>
      </linearGradient>
      <filter id="prof_glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    {/* Outer ring */}
    <circle cx="32" cy="32" r="26" fill="none" stroke="url(#prof_ring)" strokeWidth="3.5" filter="url(#prof_glow)"/>
    {/* Inner background */}
    <circle cx="32" cy="32" r="23" fill="#1a0022" opacity="0.5"/>
    {/* Head */}
    <circle cx="32" cy="24" r="8" fill="#44aaff" opacity="0.8"/>
    <circle cx="32" cy="24" r="6" fill="#66ccff" opacity="0.5"/>
    {/* Body */}
    <path d="M16 50C16 42 23 36 32 36C41 36 48 42 48 50" stroke="#44aaff" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8"/>
    <path d="M18 48C18 42 24 38 32 38C40 38 46 42 46 48" fill="#44aaff" opacity="0.2"/>
    {/* Glow accent */}
    <circle cx="32" cy="24" r="4" fill="#aaddff" opacity="0.3"/>
  </svg>
);
