import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../context/WalletContext';
import { playClick, playWin, playBigWin, playDeposit } from '../utils/sounds';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Task {
  id: string;
  type: 'ad' | 'telegram' | 'referral' | 'tiktok';
  title: string;
  desc: string;
  reward: number;
  currency: 'TON' | 'USDT' | 'STARS';
  icon: string;
  color: string;
  cooldown?: number; // seconds
  action: string;
  completed?: boolean;
  adUrl?: string; // external ad link — user is redirected here, reward after return
}

interface ReferralEntry {
  id: string;
  name: string;
  joined: string;
  reward: number;
  currency: 'TON' | 'STARS';
}

// ─── Ad Timer ────────────────────────────────────────────────────────────────
function AdWatchModal({ task, onComplete, onClose }: { task: Task; onComplete: () => void; onClose: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const duration = 15; // 15s ad

  useEffect(() => {
    rafRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + 100 / (duration * 10);
        if (next >= 100) {
          clearInterval(rafRef.current!);
          setDone(true);
          return 100;
        }
        return next;
      });
    }, 100);
    return () => { if (rafRef.current) clearInterval(rafRef.current); };
  }, []);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg,#0f0f1a,#0a0a0f)', border: '1px solid #1e1e3a' }}>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,#00f5ff,#bf00ff,transparent)' }} />

        {/* Ad placeholder */}
        <div className="relative overflow-hidden" style={{ height: 200, background: 'linear-gradient(135deg,#0a0a1e,#1a0a2e)' }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="text-6xl animate-bounce">📺</div>
            <p className="text-xs font-mono font-black" style={{ color: '#ffffff44' }}>ADVERTISEMENT</p>
            <div className="px-3 py-1.5 rounded-lg text-xs font-black font-mono"
              style={{ background: '#ffd70022', border: '1px solid #ffd70044', color: '#ffd700' }}>
              ⭐ Watching to earn {task.reward} {task.currency}
            </div>
          </div>
          {/* Simulated ad graphics */}
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #00f5ff 0%, transparent 40%), radial-gradient(circle at 80% 20%, #bf00ff 0%, transparent 40%)' }} />
        </div>

        {/* Progress bar */}
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span style={{ color: '#ffffff66' }}>Watch progress</span>
              <span style={{ color: '#00f5ff' }} className="font-black">{Math.min(100, Math.round(progress))}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e1e3a' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#00f5ff,#bf00ff)', boxShadow: '0 0 8px #00f5ff66' }} />
            </div>
            {!done && (
              <p className="text-center text-xs font-mono" style={{ color: '#ffffff33' }}>
                {Math.max(0, Math.ceil(duration - (progress / 100) * duration))}s remaining — stay on screen
              </p>
            )}
          </div>

          {done ? (
            <button onClick={() => { playWin(); onComplete(); }}
              className="w-full py-4 rounded-xl font-black font-mono text-sm transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#00ff88,#00cc66)', color: '#000', boxShadow: '0 0 20px #00ff8844' }}>
              ✅ Claim {task.reward} {task.currency} Reward!
            </button>
          ) : (
            <button onClick={onClose}
              className="w-full py-3 rounded-xl text-xs font-mono transition-all"
              style={{ background: '#ff003c11', border: '1px solid #ff003c33', color: '#ff003c55' }}>
              ✕ Close (reward lost)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TikTok Submission Modal ──────────────────────────────────────────────────
function TikTokModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (url: string, views: number) => void }) {
  const [url, setUrl] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!url) return;
    setVerifying(true);
    playClick();

    // Redirect user to Telegram channel post to submit their video in comments
    const telegramPostUrl = 'https://t.me/Crypto_BetCasino/3';

    // Try multiple methods to ensure it opens
    try {
      if ((window as any).Telegram?.WebApp?.openTelegramLink) {
        (window as any).Telegram.WebApp.openTelegramLink(telegramPostUrl);
      } else if ((window as any).Telegram?.WebApp?.openLink) {
        (window as any).Telegram.WebApp.openLink(telegramPostUrl);
      } else {
        window.open(telegramPostUrl, '_blank');
      }
    } catch (e) {
      window.location.href = telegramPostUrl;
    }

    setVerifying(false);
    onSubmit(url, 0); // 0 views = pending manual review
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg,#0f0f1a,#0a0a0f)', border: '1px solid #1e1e3a', borderBottom: 'none' }}
        onClick={e => e.stopPropagation()}>
        <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,#ff006e,#bf00ff,transparent)' }} />
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-[#1e1e3a]" />
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎵</span>
            <div>
              <p className="text-sm font-black font-mono text-white">SUBMIT TIKTOK</p>
              <p className="text-xs font-mono" style={{ color: '#ffffff33' }}>Paste your video link below</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="https://tiktok.com/@user/video/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#1e1e3a] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-[#ff006e]"
            />
          </div>

          <button onClick={handleVerify} disabled={verifying || !url}
            className="w-full py-4 rounded-xl font-black font-mono text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ background: verifying ? '#ff006e11' : 'linear-gradient(135deg,#ff006e,#bf00ff)', color: verifying ? '#ff006e' : 'white', border: verifying ? '1px solid #ff006e33' : 'none' }}>
            {verifying ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin" />
                Opening Telegram...
              </span>
            ) : '🎵 Submit Video in Telegram'}
          </button>

          <p className="text-center text-xs font-mono" style={{ color: '#ffffff22' }}>
            Post your video link in the comments of our Telegram channel post.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Referral Section ────────────────────────────────────────────────────────
function ReferralSection({ addBalance }: { addBalance: (amount: number, currency: 'TON' | 'USDT' | 'STARS') => void }) {
  const [copied, setCopied] = useState(false);
  const [referrals] = useState<ReferralEntry[]>([
    { id: '1', name: 'User_4821', joined: '2h ago', reward: 1.25, currency: 'STARS' },
    { id: '2', name: 'CryptoFan99', joined: '1d ago', reward: 1.25, currency: 'STARS' },
    { id: '3', name: 'DegenerateKing', joined: '3d ago', reward: 1.25, currency: 'STARS' },
  ]);

  // Simulated Telegram User ID for referral link
  const tgUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id ?? 123456789;
  const refLink = `https://t.me/Crypto_BetCasino?start=ref_${tgUserId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink).catch(() => {
      const el = document.createElement('textarea');
      el.value = refLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const msg = encodeURIComponent(`🎰 Play CryptoBet — the hottest Telegram crypto casino!\nUse my ref link and we both earn 1.25 Stars 🚀\n\n${refLink}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${msg}`, '_blank');
  };

  const tiers = [
    { refs: 1,   reward: '1.25 Stars',  color: '#00f5ff' },
    { refs: 5,   reward: '7.5 Stars',   color: '#ffd700' },
    { refs: 10,  reward: '18.75 Stars', color: '#bf00ff' },
    { refs: 25,  reward: '62.5 Stars',  color: '#ff006e' },
    { refs: 50,  reward: '150 Stars',   color: '#00ff88' },
    { refs: 100, reward: '375 Stars',   color: '#ff6600' },
  ];

  return (
    <div className="space-y-4">
      {/* Ref link */}
      <div className="rounded-2xl p-4 space-y-3 cyber-card" style={{ border: '1px solid #00f5ff33' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🔗</span>
          <div>
            <p className="text-sm font-black font-mono text-white">YOUR REFERRAL LINK</p>
            <p className="text-xs font-mono" style={{ color: '#00f5ff66' }}>Earn 1.25 Stars for each friend who plays</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: '#00f5ff08', border: '1px solid #00f5ff22' }}>
          <p className="flex-1 text-xs font-mono truncate" style={{ color: '#00f5ff' }}>{refLink}</p>
          <button onClick={handleCopy}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black font-mono transition-all active:scale-95"
            style={{ background: copied ? '#00ff8822' : '#00f5ff22', border: `1px solid ${copied ? '#00ff8855' : '#00f5ff44'}`, color: copied ? '#00ff88' : '#00f5ff' }}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
        <button onClick={handleShareTelegram}
          className="w-full py-3 rounded-xl font-black font-mono text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#2481cc22,#2481cc33)', border: '1px solid #2481cc55', color: '#2481cc', boxShadow: '0 0 15px #2481cc22' }}>
          ✈️ Share on Telegram
        </button>
      </div>

      {/* Tier rewards */}
      <div className="rounded-2xl p-4 cyber-card space-y-3" style={{ border: '1px solid #ffd70022' }}>
        <p className="text-xs font-black font-mono" style={{ color: '#ffd70088' }}>◈ REFERRAL TIERS</p>
        <div className="grid grid-cols-2 gap-2">
          {tiers.map(tier => (
            <div key={tier.refs} className="flex items-center justify-between p-2.5 rounded-xl"
              style={{ background: `${tier.color}08`, border: `1px solid ${tier.color}22` }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black font-mono"
                  style={{ background: `${tier.color}22`, color: tier.color }}>
                  {tier.refs}
                </div>
                <span className="text-[10px] font-mono" style={{ color: '#ffffff44' }}>refs</span>
              </div>
              <span className="text-xs font-black font-mono" style={{ color: tier.color }}>{tier.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent referrals */}
      {referrals.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black font-mono" style={{ color: '#00f5ff66' }}>
            ◈ YOUR REFERRALS ({referrals.length})
          </p>
          {referrals.map(ref => (
            <div key={ref.id} className="flex items-center justify-between p-3 rounded-xl cyber-card"
              style={{ border: '1px solid #00f5ff22', background: '#00f5ff05' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: '#00f5ff22', border: '1px solid #00f5ff44', color: '#00f5ff' }}>
                  {ref.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black font-mono text-white">{ref.name}</p>
                  <p className="text-[10px] font-mono" style={{ color: '#ffffff33' }}>{ref.joined}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black font-mono" style={{ color: '#00ff88' }}>+{ref.reward} TON</p>
                <button onClick={() => { addBalance(Number(ref.reward), 'TON'); playDeposit(); }}
                  className="text-[10px] font-black font-mono px-2 py-0.5 rounded transition-all"
                  style={{ background: '#00ff8811', color: '#00ff88', border: '1px solid #00ff8833' }}>
                  CLAIM
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main EarnPanel ───────────────────────────────────────────────────────────
export function EarnPanel() {
  const { addDeposit } = useWallet();
  const [activeTab, setActiveTab] = useState<'tasks' | 'referral' | 'tiktok'>('tasks');
  const [watchingAd, setWatchingAd] = useState<Task | null>(null);
  const [showTikTok, setShowTikTok] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [adCooldowns, setAdCooldowns] = useState<Record<string, number>>({});
  const [tgTaskDone, setTgTaskDone] = useState(false);
  const [tiktokResult, setTiktokResult] = useState<{ views: number; reward: number } | null>(null);
  const [claimedSuccess, setClaimedSuccess] = useState('');

  // Cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setAdCooldowns(prev => {
        const next = { ...prev };
        let changed = false;
        for (const [k, v] of Object.entries(next)) {
          if (v > 0) { next[k] = v - 1; changed = true; }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const TASKS: Task[] = [
    // ─── AD LINKS — replace these URLs with your real ad URLs ───────────────
    // To change an ad link, update the `adUrl` field below.
    // The user will be redirected to that URL when they click "Watch Now".
    {
      id: 'ad1',
      type: 'ad',
      title: 'Watch Ad #1',
      desc: 'Watch an ad to earn free Stars',
      reward: 10,
      currency: 'STARS',
      icon: '📺',
      color: '#00f5ff',
      cooldown: 300,
      action: 'Watch Now',
      adUrl: 'https://your-ad-link-1.com', // ← REPLACE WITH YOUR AD URL
    },
    {
      id: 'ad2',
      type: 'ad',
      title: 'Watch Ad #2',
      desc: 'Another ad, another reward',
      reward: 10,
      currency: 'STARS',
      icon: '📡',
      color: '#00f5ff',
      cooldown: 300,
      action: 'Watch Now',
      adUrl: 'https://your-ad-link-2.com', // ← REPLACE WITH YOUR AD URL
    },
    {
      id: 'ad3',
      type: 'ad',
      title: 'Watch Premium Ad',
      desc: 'Premium ad — higher reward',
      reward: 15,
      currency: 'STARS',
      icon: '🎬',
      color: '#bf00ff',
      cooldown: 600,
      action: 'Watch Now',
      adUrl: 'https://your-ad-link-3.com', // ← REPLACE WITH YOUR AD URL
    },
    {
      id: 'tg_channel',
      type: 'telegram',
      title: 'Subscribe to Channel',
      desc: 'Join @Crypto_BetCasino for news & bonuses',
      reward: 10,
      currency: 'STARS',
      icon: '✈️',
      color: '#2481cc',
      action: 'Subscribe',
    },
  ];

  const handleTaskAction = (task: Task) => {
    playClick();

    if (task.type === 'ad') {
      if (adCooldowns[task.id] > 0) return;
      // If task has a custom ad URL, open it and show the modal after return
      if (task.adUrl && task.adUrl !== `https://your-ad-link-${task.id.replace('ad','')}.com`) {
        window.open(task.adUrl, '_blank');
      }
      setWatchingAd(task);
    }

    if (task.type === 'telegram') {
      if (completedTasks.has(task.id)) return;
      const links: Record<string, string> = {
        tg_channel: 'https://t.me/Crypto_BetCasino',
      };
      window.open(links[task.id] || '#', '_blank');
      // Simulate verification delay
      setTimeout(() => {
        setCompletedTasks(prev => new Set([...prev, task.id]));
        addDeposit(task.reward, task.currency, 'Earn Task');
        setTgTaskDone(true);
        setClaimedSuccess(`+${task.reward} ${task.currency} earned for ${task.title}!`);
        playDeposit();
        setTimeout(() => { setTgTaskDone(false); setClaimedSuccess(''); }, 4000);
      }, 3000);
    }
  };

  const handleAdComplete = (task: Task) => {
    addDeposit(task.reward, task.currency, 'Earn Task');
    setWatchingAd(null);
    if (task.cooldown) {
      setAdCooldowns(prev => ({ ...prev, [task.id]: task.cooldown! }));
    }
    setClaimedSuccess(`+${task.reward} ${task.currency} earned for watching!`);
    playDeposit();
    setTimeout(() => setClaimedSuccess(''), 4000);
  };

  const handleTikTokSubmit = (url: string, views: number) => {


    setShowTikTok(false);
    setTiktokResult(null); // No immediate result/reward
    setClaimedSuccess('Video link sent for verification! Rewards will be added manually after review.');
    setTimeout(() => setClaimedSuccess(''), 5000);
    
    console.log('TikTok submitted URL (Email opened):', url);
  };

  const EARN_TABS = [
    { id: 'tasks' as const, label: 'Tasks', icon: '⚡', color: '#00f5ff' },
    { id: 'referral' as const, label: 'Referral', icon: '🔗', color: '#ffd700' },
    { id: 'tiktok' as const, label: 'TikTok', icon: '🎵', color: '#ff006e' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl p-4 cyber-card relative overflow-hidden"
        style={{ border: '1px solid #ffd70033', background: 'linear-gradient(135deg,#ffd70008,#00f5ff08)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #ffd700 0%, transparent 50%), radial-gradient(circle at 30% 70%, #00f5ff 0%, transparent 50%)' }} />
        <div className="relative flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 animate-float"
            style={{ background: 'linear-gradient(135deg,#ffd70022,#00f5ff22)', border: '1px solid #ffd70044' }}>
            💰
          </div>
          <div>
            <h2 className="text-base font-black font-mono text-white">EARN FREE CRYPTO</h2>
            <p className="text-xs mt-0.5 font-mono" style={{ color: '#ffd70088' }}>
              Watch ads · Join channels · Refer friends · Go viral on TikTok
            </p>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {(claimedSuccess || tgTaskDone) && claimedSuccess && (
        <div className="p-3 rounded-xl text-sm font-black font-mono text-center"
          style={{ background: '#00ff8811', border: '1px solid #00ff8855', color: '#00ff88' }}>
          🎉 {claimedSuccess}
        </div>
      )}

      {/* TikTok result */}
      {tiktokResult && (
        <div className="p-4 rounded-2xl space-y-2 cyber-card"
          style={{ border: `1px solid ${tiktokResult.reward > 0 ? '#00ff88' : '#ff003c'}33`, background: `${tiktokResult.reward > 0 ? '#00ff88' : '#ff003c'}08` }}>
          <p className="font-black font-mono text-white">
            {tiktokResult.reward > 0 ? '🎉 TikTok Video Verified!' : '😔 Not Enough Views Yet'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-2 text-center" style={{ background: '#00f5ff11', border: '1px solid #00f5ff22' }}>
              <p className="text-sm font-black font-mono" style={{ color: '#00f5ff' }}>
                {tiktokResult.views.toLocaleString()}
              </p>
              <p className="text-[9px] font-mono" style={{ color: '#00f5ff66' }}>VIEWS</p>
            </div>
            <div className="rounded-xl p-2 text-center"
              style={{ background: `${tiktokResult.reward > 0 ? '#00ff88' : '#ff003c'}11`, border: `1px solid ${tiktokResult.reward > 0 ? '#00ff88' : '#ff003c'}22` }}>
              <p className="text-sm font-black font-mono" style={{ color: tiktokResult.reward > 0 ? '#00ff88' : '#ff003c' }}>
                {tiktokResult.reward > 0 ? `+${tiktokResult.reward} Stars` : 'None'}
              </p>
              <p className="text-[9px] font-mono" style={{ color: '#ffffff44' }}>REWARD</p>
            </div>
          </div>
          {tiktokResult.views < 10000 && (
            <p className="text-xs font-mono" style={{ color: '#ffffff44' }}>
              Need 10,000+ views for a reward. Keep promoting! Resubmit when you reach the threshold.
            </p>
          )}
          <button onClick={() => setTiktokResult(null)}
            className="text-xs font-black font-mono px-3 py-1.5 rounded-lg transition-all"
            style={{ background: '#ffffff11', color: '#ffffff66', border: '1px solid #ffffff22' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: '#13131f' }}>
        {EARN_TABS.map(tab => (
          <button key={tab.id}
            onClick={() => { playClick(); setActiveTab(tab.id); }}
            className="py-2.5 rounded-lg text-xs font-black font-mono transition-all flex flex-col items-center gap-1"
            style={activeTab === tab.id ? {
              background: `${tab.color}22`, border: `1px solid ${tab.color}55`,
              color: tab.color, boxShadow: `0 0 12px ${tab.color}22`,
            } : { color: '#666', border: '1px solid transparent' }}>
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── TASKS TAB ─── */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          <p className="text-[10px] font-black font-mono" style={{ color: '#00f5ff66' }}>◈ ADS & SUBSCRIPTIONS</p>
          {TASKS.map(task => {
            const isAd = task.type === 'ad';
            const cooldown = adCooldowns[task.id] || 0;
            const isDone = completedTasks.has(task.id);
            const isOnCooldown = isAd && cooldown > 0;
            const mins = Math.floor(cooldown / 60);
            const secs = cooldown % 60;

            return (
              <div key={task.id}
                className="flex items-center gap-3 p-4 rounded-2xl cyber-card transition-all"
                style={{ border: `1px solid ${isDone ? '#00ff8833' : isOnCooldown ? '#ffffff11' : `${task.color}33`}` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${isDone ? '#00ff88' : task.color}22`, border: `1px solid ${isDone ? '#00ff88' : task.color}44` }}>
                  {isDone ? '✅' : task.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black font-mono text-white truncate">{task.title}</p>
                  <p className="text-[10px] font-mono mt-0.5 leading-tight" style={{ color: '#ffffff44' }}>{task.desc}</p>
                  {isOnCooldown && (
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: '#ffd70088' }}>
                      ⏳ Next in {mins}:{secs.toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-black font-mono" style={{ color: '#00ff88' }}>
                      +{task.reward}
                    </span>
                    <span className="text-[10px] font-mono ml-1" style={{ color: '#00ff8866' }}>{task.currency}</span>
                  </div>
                  {!isDone && (
                    <button
                      onClick={() => handleTaskAction(task)}
                      disabled={isOnCooldown}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-black font-mono transition-all active:scale-95 disabled:opacity-40"
                      style={isOnCooldown ? {
                        background: '#1e1e3a', color: '#ffffff33', border: '1px solid #1e1e3a',
                      } : {
                        background: `${task.color}22`, border: `1px solid ${task.color}55`,
                        color: task.color, boxShadow: `0 0 8px ${task.color}22`,
                      }}>
                      {isOnCooldown ? `${mins}:${secs.toString().padStart(2, '0')}` : task.action}
                    </button>
                  )}
                  {isDone && (
                    <span className="text-[10px] font-black font-mono px-2 py-1 rounded-lg"
                      style={{ background: '#00ff8811', color: '#00ff88', border: '1px solid #00ff8833' }}>
                      DONE ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── REFERRAL TAB ─── */}
      {activeTab === 'referral' && (
        <ReferralSection addBalance={(amount, currency) => addDeposit(amount, currency)} />
      )}

      {/* ─── TIKTOK TAB ─── */}
      {activeTab === 'tiktok' && (
        <div className="space-y-4">
          {/* Hero */}
          <div className="rounded-2xl p-5 cyber-card relative overflow-hidden"
            style={{ border: '1px solid #ff006e33', background: 'linear-gradient(135deg,#ff006e08,#bf00ff08)' }}>
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ff006e 0%, transparent 70%)' }} />
            <div className="relative text-center space-y-2">
              <div className="text-5xl">🎵</div>
              <h3 className="text-lg font-black font-mono text-white">TIKTOK CHALLENGE</h3>
              <p className="text-xs font-mono" style={{ color: '#ff006e88' }}>
                Go viral on TikTok with CryptoBet & earn massive rewards
              </p>
            </div>
          </div>

          {/* Reward tiers */}
          <div className="space-y-2">
            <p className="text-[10px] font-black font-mono" style={{ color: '#ff006e66' }}>◈ REWARD TIERS</p>
            {[
              { views: '10,000+', reward: '50 Stars', color: '#00f5ff', icon: '🥉' },
              { views: '100,000+', reward: '200 Stars', color: '#ffd700', icon: '🥈' },
              { views: '1,000,000+', reward: '1,000 Stars', color: '#ff006e', icon: '🥇' },
            ].map(tier => (
              <div key={tier.views} className="flex items-center justify-between p-4 rounded-2xl cyber-card"
                style={{ border: `1px solid ${tier.color}33`, background: `${tier.color}05` }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <div>
                    <p className="text-sm font-black font-mono text-white">{tier.views} views</p>
                    <p className="text-[10px] font-mono" style={{ color: '#ffffff33' }}>video with #CryptoBet</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black font-mono" style={{ color: tier.color }}>{tier.reward}</p>
                </div>
              </div>
            ))}
          </div>

          {/* How to */}
          <div className="rounded-2xl p-4 cyber-card space-y-2" style={{ border: '1px solid #bf00ff22' }}>
            <p className="text-[10px] font-black font-mono" style={{ color: '#bf00ff66' }}>◈ HOW TO PARTICIPATE</p>
            {[
              '1. Record a TikTok showing CryptoBet gameplay',
              '2. Add #CryptoBet #CryptoCasino #CryptoGaming',
              '3. Post publicly & wait for views',
              '4. Submit your video URL below',
              '5. We verify & credit your reward automatically',
            ].map((step, i) => (
              <p key={i} className="text-xs font-mono" style={{ color: '#ffffff55' }}>{step}</p>
            ))}
          </div>

          <button onClick={() => { playClick(); setShowTikTok(true); }}
            className="w-full py-4 rounded-xl font-black font-mono text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#ff006e,#bf00ff)', color: 'white', boxShadow: '0 0 20px #ff006e33' }}>
            🎵 Submit My TikTok Video
          </button>

          <div className="p-3 rounded-xl text-xs font-mono" style={{ background: '#ff006e08', border: '1px solid #ff006e22', color: '#ff006e66' }}>
            ⚠ Video must remain public for at least 30 days. Multiple submissions allowed — only highest reward paid. Fake views = permanent ban.
          </div>
        </div>
      )}

      {/* Ad modal */}
      {watchingAd && (
        <AdWatchModal
          task={watchingAd}
          onComplete={() => handleAdComplete(watchingAd)}
          onClose={() => setWatchingAd(null)}
        />
      )}

      {/* TikTok modal */}
      {showTikTok && (
        <TikTokModal
          onClose={() => setShowTikTok(false)}
          onSubmit={handleTikTokSubmit}
        />
      )}
    </div>
  );
}
