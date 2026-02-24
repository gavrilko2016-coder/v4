import { useEffect, useState } from 'react';

export function CryptoBetLogo({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg_circle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d1b2e" />
          <stop offset="100%" stopColor="#060d18" />
        </radialGradient>
        <linearGradient id="ring_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" />
          <stop offset="50%" stopColor="#00ffcc" />
          <stop offset="100%" stopColor="#bf00ff" />
        </linearGradient>
        <linearGradient id="ring_grad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bf00ff" />
          <stop offset="100%" stopColor="#00ff88" />
        </linearGradient>
        <linearGradient id="btc_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ccddff" />
        </linearGradient>
        <linearGradient id="slash_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" />
          <stop offset="100%" stopColor="#bf00ff" />
        </linearGradient>
        <filter id="glow_green">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow_purple">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow_white">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="circle_clip">
          <circle cx="100" cy="100" r="90" />
        </clipPath>
      </defs>

      {/* Main circle background */}
      <circle cx="100" cy="100" r="90" fill="url(#bg_circle)" />
      <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Outer neon ring — green arc (left/bottom) */}
      <path
        d="M 100 18 A 82 82 0 1 0 168 140"
        fill="none"
        stroke="url(#ring_grad)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#glow_green)"
      />

      {/* Outer neon ring — purple arc (right) */}
      <path
        d="M 168 140 A 82 82 0 0 0 100 18"
        fill="none"
        stroke="url(#ring_grad2)"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#glow_purple)"
        opacity="0.7"
      />

      {/* Inner ring */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(0,255,136,0.12)" strokeWidth="1.5" />

      {/* Speed slash lines */}
      <line x1="55" y1="115" x2="155" y2="75" stroke="url(#slash_grad)" strokeWidth="3" strokeLinecap="round" filter="url(#glow_green)" opacity="0.8" />
      <line x1="60" y1="125" x2="155" y2="85" stroke="url(#slash_grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Playing card (left) */}
      <g opacity="0.85" filter="url(#glow_white)">
        <rect x="28" y="58" width="36" height="50" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" transform="rotate(-15 46 83)" />
        {/* Spade symbol */}
        <text x="34" y="88" fontSize="14" fill="white" opacity="0.9" fontFamily="serif" transform="rotate(-15 46 83)">♠</text>
      </g>

      {/* Dice top-left */}
      <g opacity="0.8" filter="url(#glow_white)" transform="translate(68, 22) rotate(15)">
        <rect x="0" y="0" width="22" height="22" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
        <circle cx="6" cy="6" r="2" fill="white" opacity="0.9" />
        <circle cx="16" cy="6" r="2" fill="white" opacity="0.9" />
        <circle cx="6" cy="16" r="2" fill="white" opacity="0.9" />
        <circle cx="16" cy="16" r="2" fill="white" opacity="0.9" />
        <circle cx="11" cy="11" r="2" fill="white" opacity="0.9" />
      </g>

      {/* Dice top-right */}
      <g opacity="0.75" filter="url(#glow_white)" transform="translate(118, 16) rotate(-10)">
        <rect x="0" y="0" width="26" height="26" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <circle cx="7" cy="7" r="2.2" fill="white" opacity="0.9" />
        <circle cx="19" cy="7" r="2.2" fill="white" opacity="0.9" />
        <circle cx="7" cy="19" r="2.2" fill="white" opacity="0.9" />
        <circle cx="19" cy="19" r="2.2" fill="white" opacity="0.9" />
        <circle cx="13" cy="13" r="2.2" fill="white" opacity="0.9" />
        <circle cx="7" cy="13" r="2.2" fill="white" opacity="0.9" />
      </g>

      {/* Casino chip right */}
      <g opacity="0.8" transform="translate(148, 108)">
        <circle cx="14" cy="14" r="14" fill="#1a1a4a" stroke="#6666cc" strokeWidth="2" />
        <circle cx="14" cy="14" r="10" fill="none" stroke="#4444aa" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="14" cy="14" r="5" fill="#2222aa" />
      </g>

      {/* Casino chip right-bottom */}
      <g opacity="0.65" transform="translate(140, 138)">
        <circle cx="12" cy="12" r="12" fill="#1a1a4a" stroke="#5555bb" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="8" fill="none" stroke="#3333aa" strokeWidth="1" strokeDasharray="2 2" />
      </g>

      {/* Bitcoin B symbol — center */}
      <g filter="url(#glow_white)">
        {/* Vertical stem */}
        <rect x="88" y="62" width="6" height="76" rx="3" fill="url(#btc_grad)" />
        {/* Top serif */}
        <rect x="84" y="62" width="14" height="5" rx="2.5" fill="url(#btc_grad)" />
        {/* Bottom serif */}
        <rect x="84" y="133" width="14" height="5" rx="2.5" fill="url(#btc_grad)" />
        {/* Upper bump */}
        <path d="M94 62 Q120 62 120 78 Q120 95 94 95" fill="none" stroke="url(#btc_grad)" strokeWidth="7" strokeLinecap="round" />
        {/* Lower bump */}
        <path d="M94 95 Q124 95 124 113 Q124 132 94 132" fill="none" stroke="url(#btc_grad)" strokeWidth="7" strokeLinecap="round" />
        {/* Top tick */}
        <rect x="96" y="56" width="5" height="10" rx="2.5" fill="url(#btc_grad)" />
        <rect x="104" y="56" width="5" height="10" rx="2.5" fill="url(#btc_grad)" />
        {/* Bottom tick */}
        <rect x="96" y="134" width="5" height="10" rx="2.5" fill="url(#btc_grad)" />
        <rect x="104" y="134" width="5" height="10" rx="2.5" fill="url(#btc_grad)" />
      </g>

      {/* Spade symbol bottom-left */}
      <text x="32" y="148" fontSize="20" fill="white" opacity="0.5" fontFamily="serif" filter="url(#glow_white)">♠</text>

      {/* Diamond dot */}
      <polygon points="82,118 86,122 82,126 78,122" fill="white" opacity="0.7" />
    </svg>
  );
}

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400);
    const t2 = setTimeout(() => setPhase('out'), 2200);
    const t3 = setTimeout(() => onDone(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: '#060d18',
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out' ? 'opacity 0.6s ease-out' : phase === 'in' ? 'opacity 0.4s ease-in' : 'none',
        pointerEvents: phase === 'out' ? 'none' : 'all',
      }}
    >
      {/* Ambient glow behind logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div style={{
          width: 320, height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, rgba(191,0,255,0.06) 50%, transparent 70%)',
          filter: 'blur(40px)',
          transform: phase === 'hold' || phase === 'out' ? 'scale(1)' : 'scale(0.6)',
          transition: 'transform 0.8s ease-out',
        }} />
      </div>

      {/* Logo */}
      <div style={{
        transform: phase === 'in' ? 'scale(0.7) translateY(20px)' : 'scale(1) translateY(0)',
        opacity: phase === 'in' ? 0 : 1,
        transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease-out',
      }}>
        <CryptoBetLogo size={180} />
      </div>

      {/* Brand name */}
      <div style={{
        marginTop: 24,
        opacity: phase === 'in' ? 0 : 1,
        transform: phase === 'in' ? 'translateY(12px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease-out 0.15s, transform 0.5s ease-out 0.15s',
      }}>
        <p style={{
          fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '0.08em',
          background: 'linear-gradient(135deg, #00ff88, #00ffcc, #bf00ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          lineHeight: 1,
        }}>
          CryptoBet
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
          marginTop: 6,
          textTransform: 'uppercase',
        }}>
          Premium Casino
        </p>
      </div>

      {/* Loading bar */}
      <div style={{
        marginTop: 40,
        width: 160,
        height: 2,
        borderRadius: 2,
        background: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        opacity: phase === 'in' ? 0 : 1,
        transition: 'opacity 0.4s ease-out 0.3s',
      }}>
        <div style={{
          height: '100%',
          borderRadius: 2,
          background: 'linear-gradient(90deg, #00ff88, #bf00ff)',
          width: phase === 'hold' || phase === 'out' ? '100%' : '0%',
          transition: 'width 1.6s ease-out',
          boxShadow: '0 0 8px rgba(0,255,136,0.6)',
        }} />
      </div>
    </div>
  );
}
