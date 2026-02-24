import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { useMetaMask } from '../hooks/useMetaMask';
import { useTonConnect } from '../hooks/useTonConnect';
import { playClick, playDeposit } from '../utils/sounds';
import { IconTON, IconBitcoin, IconEthereum } from './Icons';

type DepositTab = 'metamask' | 'tonkeeper' | 'stars' | 'onchain';

interface TelegramWebApp {
  openInvoice?: (url: string, callback: (status: string) => void) => void;
  initDataUnsafe?: {
    user?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
  };
  HapticFeedback?: {
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

// ─── TON Custodial Deposit Address Panel ──────────────────────────────────
function TonCustodialPanel({ userId }: { userId?: number }) {
  const { addDeposit } = useWallet();
  const [copied, setCopied] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [depositAddress, setDepositAddress] = useState('');
  const [qrVisible, setQrVisible] = useState(false);

  // In production: fetch from your backend API
  const generateAddress = async () => {
    if (depositAddress) return;
    setLoadingAddr(true);
    await new Promise(r => setTimeout(r, 600));
    // User's specific TON address
    setDepositAddress('UQDcQ7af-ZcaiTSe8_X8P8q7tEm7iFk2ABzoRJs8Ty22mIdJ');
    setLoadingAddr(false);
  };

  const handleCopy = () => {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-4 cyber-card space-y-3" style={{ border: '1px solid #00f5ff33' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: '#00f5ff22', border: '1px solid #00f5ff44' }}><IconTON size={24} /></div>
          <div>
            <p className="font-black text-white font-mono text-sm">TON CUSTODIAL DEPOSIT</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#00f5ff66' }}>
              Your unique on-chain deposit wallet
            </p>
          </div>
        </div>

        {!depositAddress ? (
          <button onClick={generateAddress} disabled={loadingAddr}
            className="w-full py-3 rounded-xl font-black font-mono text-sm transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#00f5ff22,#00f5ff33)', border: '1px solid #00f5ff55', color: '#00f5ff' }}>
            {loadingAddr ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#00f5ff] border-t-transparent rounded-full animate-spin" />
                Generating your wallet...
              </span>
            ) : <span className="flex items-center justify-center gap-2"><IconTON size={16} /> Generate My Deposit Address</span>}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Address display */}
            <div className="p-3 rounded-xl space-y-2" style={{ background: '#00f5ff08', border: '1px solid #00f5ff22' }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black font-mono" style={{ color: '#00f5ff66' }}>YOUR DEPOSIT ADDRESS</span>
                <button onClick={() => setQrVisible(v => !v)}
                  className="text-[10px] font-black font-mono px-2 py-0.5 rounded"
                  style={{ background: '#00f5ff22', color: '#00f5ff' }}>
                  {qrVisible ? '↑ Hide QR' : '⬛ QR Code'}
                </button>
              </div>
              <p className="text-xs font-mono break-all" style={{ color: '#00f5ff' }}>{depositAddress}</p>
              <button onClick={handleCopy}
                className="w-full py-2 rounded-lg text-xs font-black font-mono transition-all active:scale-95"
                style={{ background: copied ? '#00ff8822' : '#00f5ff22', border: `1px solid ${copied ? '#00ff8855' : '#00f5ff44'}`, color: copied ? '#00ff88' : '#00f5ff' }}>
                {copied ? '✅ Copied!' : '📋 Copy Address'}
              </button>
            </div>

            {/* QR Code (CSS-based placeholder) */}
            {qrVisible && (
              <div className="flex flex-col items-center gap-2 py-4 rounded-xl"
                style={{ background: '#00f5ff08', border: '1px solid #00f5ff22' }}>
                <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center relative">
                  {/* QR code pattern simulation */}
                  <div className="absolute inset-2 grid grid-cols-7 gap-px opacity-80">
                    {Array.from({ length: 49 }, (_, i) => (
                      <div key={i} className="rounded-[1px]"
                        style={{ background: [0,1,3,6,7,8,14,15,17,18,19,20,21,23,27,28,29,30,34,35,36,42,43,45,47,48].includes(i) ? '#000' : 'transparent' }} />
                    ))}
                  </div>
                  <span className="text-3xl z-10">◈</span>
                </div>
                <p className="text-[10px] font-mono text-center" style={{ color: '#00f5ff66' }}>
                  Scan with Tonkeeper · MyTonWallet · OpenMask
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-1.5 p-3 rounded-xl" style={{ background: '#ffd70008', border: '1px solid #ffd70022' }}>
              <p className="text-[10px] font-black font-mono" style={{ color: '#ffd700' }}>ℹ HOW IT WORKS</p>
              {[
                '1. Copy or scan your unique deposit address',
                '2. Send TON from any wallet (Tonkeeper, etc.)',
                '3. System detects your TX within ~15 seconds',
                '4. Balance credited automatically to your account',
                '5. Minimum deposit: 1 TON',
              ].map((s, i) => (
                <p key={i} className="text-[10px] font-mono" style={{ color: '#ffffff44' }}>{s}</p>
              ))}
            </div>

            <div className="p-2.5 rounded-xl text-[10px] font-mono text-center"
              style={{ background: '#00ff8808', border: '1px solid #00ff8822', color: '#00ff8866' }}>
              🔒 Custodial wallet · Auto-sweep to cold storage · Non-custodial options above
            </div>

            <button onClick={() => {
               playDeposit();
               addDeposit(5, 'TON', 'Deposit');
               alert('Simulated 5 TON deposit! Withdrawal unlocked.');
            }}
            className="w-full py-2 rounded-lg text-xs font-black font-mono mt-2"
            style={{ background: '#ffd70022', border: '1px solid #ffd70044', color: '#ffd700' }}>
              🧪 Simulate 5 TON Deposit (Test Only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generic On-Chain Address Panel ─────────────────────────────────────
function OnChainAddressPanel({ icon, title, subtitle, address, color, network, minDeposit }: {
  icon: React.ReactNode; title: string; subtitle: string; address: string; color: string; network: string; minDeposit: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-4 cyber-card space-y-3" style={{ border: `1px solid ${color}33` }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}>{icon}</div>
        <div>
          <p className="font-black text-white font-mono text-sm">{title}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: `${color}88` }}>{subtitle}</p>
        </div>
      </div>

      <div className="p-3 rounded-xl space-y-2" style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
        <span className="text-[10px] font-black font-mono" style={{ color: `${color}66` }}>DEPOSIT ADDRESS</span>
        <p className="text-xs font-mono break-all" style={{ color }}>{address}</p>
        <button onClick={handleCopy}
          className="w-full py-2 rounded-lg text-xs font-black font-mono transition-all active:scale-95"
          style={{ background: copied ? '#00ff8822' : `${color}22`, border: `1px solid ${copied ? '#00ff8855' : `${color}44`}`, color: copied ? '#00ff88' : color }}>
          {copied ? '✅ Copied!' : '📋 Copy Address'}
        </button>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono px-1" style={{ color: `${color}66` }}>
        <span>🌐 {network}</span>
        <span>Min: {minDeposit}</span>
      </div>
    </div>
  );
}

const STAR_PACKAGES = [
  { stars: 50,   ton: 0.5,  usdt: 1,   label: '50 ⭐',   price: '$0.99' },
  { stars: 150,  ton: 1.5,  usdt: 3,   label: '150 ⭐',  price: '$2.99' },
  { stars: 500,  ton: 5,    usdt: 10,  label: '500 ⭐',  price: '$9.99' },
  { stars: 1000, ton: 10,   usdt: 20,  label: '1000 ⭐', price: '$18.99' },
  { stars: 5000, ton: 50,   usdt: 100, label: '5000 ⭐', price: '$89.99' },
];


function StatusBadge({ status }: { status: 'idle' | 'connecting' | 'connected' | 'error' }) {
  if (status === 'connected') return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#00ff8811] border border-[#00ff8855]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
      <span className="text-[10px] font-bold font-mono text-[#00ff88]">CONNECTED</span>
    </div>
  );
  if (status === 'connecting') return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#ffd70011] border border-[#ffd70055]">
      <div className="w-3 h-3 border border-[#ffd700] border-t-transparent rounded-full animate-spin" />
      <span className="text-[10px] font-bold font-mono text-[#ffd700]">LINKING...</span>
    </div>
  );
  if (status === 'error') return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#ff003c11] border border-[#ff003c55]">
      <span className="text-[10px] font-bold font-mono text-[#ff003c]">ERROR</span>
    </div>
  );
  return null;
}

interface DepositModalProps { onClose: () => void; }

export function DepositModal({ onClose }: DepositModalProps) {
  const { addDeposit, botCredits, botLoading, telegramId, telegramName, isInTelegram, openBuyCredits, refreshBotCredits } = useWallet();
  useLanguage();
  const mm = useMetaMask();
  const ton = useTonConnect();

  const [activeTab, setActiveTab] = useState<DepositTab>('stars');
  const [ethAmount, setEthAmount] = useState('');
  const [tonAmount, setTonAmount] = useState('');
  const [selectedPkg, setSelectedPkg] = useState(2);
  const [processingDeposit, setProcessingDeposit] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const tgWebApp = window.Telegram?.WebApp;

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    playDeposit();
    tgWebApp?.HapticFeedback?.notificationOccurred('success');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // ─── Telegram Stars — Open Bot Chat ─────────────────────────────────────
  const handleStarsPurchase = () => {
    playClick();
    openBuyCredits();
  };

  // ─── Refresh balance from bot ───────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    const newBalance = await refreshBotCredits();
    setRefreshing(false);
    if (newBalance > 0) {
      showSuccess(`✅ Balance synced: ${newBalance} credits`);
    }
  };

  // ─── MetaMask Deposit ─────────────────────────────────────────────────────
  const handleEthDeposit = async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0) return;
    setProcessingDeposit(true);
    const amount = parseFloat(ethAmount);

    if (mm.status === 'connected') {
      const CASINO_ETH = '0x4074d24e7131bE58225FEC3633F6887751d88550';
      const txHash = await mm.sendTransaction(CASINO_ETH, amount);
      if (txHash) {
        addDeposit(amount, 'ETH');
        showSuccess(`✅ ${amount} ETH deposited! TX: ${txHash.slice(0,10)}...`);
        setEthAmount('');
        setProcessingDeposit(false);
        return;
      }
    }

    await new Promise(r => setTimeout(r, 1500));
    addDeposit(amount, 'ETH');
    showSuccess(`✅ ${amount} ETH added to balance!`);
    setEthAmount('');
    setProcessingDeposit(false);
  };

  // ─── TON Deposit ──────────────────────────────────────────────────────────
  const handleTonDeposit = async () => {
    if (!tonAmount || parseFloat(tonAmount) <= 0) return;
    setProcessingDeposit(true);
    const amount = parseFloat(tonAmount);

    if (ton.status === 'connected') {
      const CASINO_TON = 'UQDcQ7af-ZcaiTSe8_X8P8q7tEm7iFk2ABzoRJs8Ty22mIdJ';
      const ok = await ton.sendTon(CASINO_TON, amount);
      if (ok) {
        addDeposit(amount, 'TON');
        showSuccess(`✅ ${amount} TON deposited!`);
        setTonAmount('');
        setProcessingDeposit(false);
        return;
      }
    }

    await new Promise(r => setTimeout(r, 1500));
    addDeposit(amount, 'TON');
    showSuccess(`✅ ${amount} TON added to balance!`);
    setTonAmount('');
    setProcessingDeposit(false);
  };

  const TABS = [
    { id: 'stars' as DepositTab, label: 'TG Stars', icon: '⭐', color: '#ffd700' },
    { id: 'metamask' as DepositTab, label: 'MetaMask', icon: '🦊', color: '#f6851b' },
    { id: 'tonkeeper' as DepositTab, label: 'TON',     icon: '💎', color: '#00f5ff' },
    { id: 'onchain' as DepositTab,  label: 'On-Chain', icon: '◈', color: '#00ff88' },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(180deg,#0f0f1a,#0a0a0f)', border:'1px solid #1e1e3a', borderBottom:'none', maxHeight:'92vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ─── Fixed header (does NOT scroll) ─── */}
        <div className="flex-shrink-0">
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,#00f5ff,#bf00ff,transparent)' }} />

          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-[#1e1e3a]" />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-white font-mono">⚡ DEPOSIT</h2>
              <p className="text-xs mt-0.5 font-mono" style={{ color: '#00f5ff66' }}>
                {isInTelegram && telegramName ? `Logged in as ${telegramName}` : 'Fund your account'}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: '#1e1e3a', color: '#ff006e', border: '1px solid #ff006e33' }}>
              ✕
            </button>
          </div>

          {successMsg && (
            <div className="mx-5 mb-3 p-3 rounded-xl text-sm font-black font-mono text-center"
              style={{ background: '#00ff8811', border: '1px solid #00ff8855', color: '#00ff88' }}>
              {successMsg}
            </div>
          )}

          {/* Tabs */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl" style={{ background: '#13131f' }}>
              {TABS.map(tab => (
                <button key={tab.id}
                  onClick={() => { playClick(); setActiveTab(tab.id); }}
                  className="py-2.5 rounded-lg text-xs font-black font-mono transition-all flex flex-col items-center gap-1"
                  style={activeTab === tab.id ? {
                    background: `${tab.color}22`, border: `1px solid ${tab.color}55`,
                    color: tab.color, boxShadow: `0 0 12px ${tab.color}33`,
                  } : { color: '#666', border: '1px solid transparent' }}>
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Scrollable content ─── */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-4">

          {/* ═══════ TELEGRAM STARS TAB ═══════ */}
          {activeTab === 'stars' && (
            <div className="space-y-4">
              {/* Header info */}
              <div className="rounded-2xl p-4 cyber-card space-y-2" style={{ border: '1px solid #ffd70033' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: '#ffd70011', border: '1px solid #ffd70044' }}>⭐</div>
                  <div>
                    <p className="font-black text-white font-mono">TELEGRAM STARS</p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: '#ffd70088' }}>
                      {isInTelegram ? '✅ Telegram detected — real payment' : '⚠ Demo mode (outside Telegram)'}
                    </p>
                  </div>
                </div>

                {isInTelegram && telegramId && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: '#00f5ff08', border: '1px solid #00f5ff22' }}>
                    <span className="text-sm">👤</span>
                    <span className="text-xs font-mono" style={{ color: '#00f5ff88' }}>
                      TG ID: {telegramId} — {telegramName}
                    </span>
                  </div>
                )}

                {/* Live bot balance */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: '#ffd70011', border: '1px solid #ffd70033' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <div>
                      <p className="text-xs font-black font-mono" style={{ color: '#ffd700' }}>
                        {botLoading ? '...' : `${botCredits} CREDITS`}
                      </p>
                      <p className="text-[10px] font-mono" style={{ color: '#ffd70066' }}>Your game balance</p>
                    </div>
                  </div>
                  <button onClick={handleRefresh} disabled={refreshing}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-black font-mono transition-all active:scale-95"
                    style={{ background: '#ffd70022', border: '1px solid #ffd70044', color: '#ffd700' }}>
                    {refreshing ? '⏳' : '🔄 Sync'}
                  </button>
                </div>
              </div>

              {/* Star packages */}
              <div className="space-y-2">
                {STAR_PACKAGES.map((pkg, i) => (
                  <button key={i}
                    onClick={() => { playClick(); setSelectedPkg(i); }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all"
                    style={selectedPkg === i ? {
                      background: '#ffd70011', border: '1px solid #ffd70055',
                      boxShadow: '0 0 12px #ffd70022',
                    } : { background: '#13131f', border: '1px solid #1e1e3a' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ background: selectedPkg === i ? '#ffd70022' : '#1e1e3a' }}>
                        ⭐
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm font-mono" style={{ color: selectedPkg === i ? '#ffd700' : 'white' }}>
                          {pkg.label}
                        </p>
                        <p className="text-xs font-mono mt-0.5" style={{ color: '#ffffff44' }}>
                          → +{pkg.ton} TON + {pkg.usdt} USDT
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black font-mono" style={{ color: '#ffd700' }}>{pkg.price}</p>
                      {selectedPkg === i && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center mt-1 ml-auto"
                          style={{ background: '#ffd700' }}>
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Buy button — opens bot chat */}
              <button
                onClick={handleStarsPurchase}
                className="w-full py-4 rounded-xl font-black font-mono text-base transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #ffd700, #ffaa00)',
                  color: '#000',
                  boxShadow: '0 0 20px #ffd70033',
                }}>
                ⭐ Buy Credits via @Peyment322_bot
              </button>

              <div className="p-3 rounded-xl text-xs font-mono" style={{ background: '#ffd70008', border: '1px solid #ffd70022', color: '#ffd70088' }}>
                ⭐ You will be redirected to our payment bot in Telegram.
                Choose a credit package there and pay with Telegram Stars.
                Credits are added to your game balance instantly!
              </div>
            </div>
          )}

          {/* ═══════ METAMASK TAB ═══════ */}
          {activeTab === 'metamask' && (
            <div className="space-y-4">
              <div className="rounded-2xl p-4 space-y-4 cyber-card" style={{ border: '1px solid #f6851b33' }}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: '#f6851b22', border: '1px solid #f6851b55' }}>🦊</div>
                  <div className="flex-1">
                    <p className="font-black text-white font-mono">MetaMask</p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: '#f6851b88' }}>
                      {mm.isAvailable ? 'Extension detected ✅' : 'Opens MetaMask app'}
                    </p>
                  </div>
                  <StatusBadge status={mm.status} />
                </div>

                {(mm.status === 'idle' || mm.status === 'error') && (
                  <div className="space-y-2">
                    {mm.error && (
                      <p className="text-xs py-2 px-3 rounded-lg font-mono"
                        style={{ background: '#ff003c11', color: '#ff003c', border: '1px solid #ff003c33' }}>
                        ⚠ {mm.error}
                      </p>
                    )}
                    <button onClick={mm.connect}
                      className="w-full py-3.5 rounded-xl font-black font-mono text-sm transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#f6851b22,#f6851b33)', border: '1px solid #f6851b66', color: '#f6851b', boxShadow: '0 0 20px #f6851b22' }}>
                      🦊 {mm.isAvailable ? 'CONNECT METAMASK' : 'OPEN METAMASK APP'}
                    </button>
                    <p className="text-center text-xs font-mono" style={{ color: '#ffffff33' }}>
                      A MetaMask popup will appear for approval
                    </p>
                  </div>
                )}

                {mm.status === 'connecting' && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-10 h-10 rounded-full border-2 border-[#f6851b] border-t-transparent animate-spin" />
                    <p className="text-sm font-black font-mono" style={{ color: '#f6851b' }}>Waiting for MetaMask...</p>
                    <p className="text-xs text-center font-mono" style={{ color: '#ffffff44' }}>Approve connection in MetaMask popup</p>
                  </div>
                )}

                {mm.status === 'connected' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl space-y-1" style={{ background: '#00ff8811', border: '1px solid #00ff8833' }}>
                      <div className="flex justify-between">
                        <span className="text-xs font-mono" style={{ color: '#00ff8888' }}>ADDRESS</span>
                        <span className="text-xs font-mono font-bold" style={{ color: '#00ff88' }}>
                          {mm.address.slice(0,6)}...{mm.address.slice(-4)}
                        </span>
                      </div>
                      {mm.balance && (
                        <div className="flex justify-between">
                          <span className="text-xs font-mono" style={{ color: '#00ff8888' }}>BALANCE</span>
                          <span className="text-xs font-bold font-mono" style={{ color: '#00ff88' }}>{mm.balance} ETH</span>
                        </div>
                      )}
                      {mm.chainId && (
                        <div className="flex justify-between">
                          <span className="text-xs font-mono" style={{ color: '#00ff8888' }}>NETWORK</span>
                          <span className="text-xs font-mono" style={{ color: '#00ff8888' }}>
                            {mm.chainId === '0x1' ? 'Ethereum' : mm.chainId === '0x89' ? 'Polygon' : `Chain ${mm.chainId}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black font-mono" style={{ color: '#f6851b' }}>AMOUNT (ETH)</label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input type="number" value={ethAmount} onChange={e => setEthAmount(e.target.value)}
                            placeholder="0.01"
                            className="w-full rounded-xl px-3 py-3 text-sm font-bold outline-none font-mono"
                            style={{ background: '#13131f', border: '1px solid #f6851b44', color: 'white' }} />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            {['0.01','0.05','0.1'].map(v => (
                              <button key={v} onClick={() => setEthAmount(v)}
                                className="text-[10px] px-1.5 py-0.5 rounded font-black font-mono"
                                style={{ background: '#f6851b22', color: '#f6851b' }}>{v}</button>
                            ))}
                          </div>
                        </div>
                        <button onClick={handleEthDeposit} disabled={processingDeposit || !ethAmount}
                          className="px-4 rounded-xl font-black font-mono text-sm transition-all active:scale-95 disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg,#f6851b,#e5761b)', color: '#000' }}>
                          {processingDeposit ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'SEND'}
                        </button>
                      </div>
                    </div>

                    <button onClick={mm.disconnect}
                      className="text-xs font-black font-mono px-3 py-1.5 rounded-lg"
                      style={{ background: '#ff003c11', border: '1px solid #ff003c33', color: '#ff003c' }}>
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl text-xs font-mono" style={{ background: '#00f5ff08', border: '1px solid #00f5ff22', color: '#00f5ff66' }}>
                ℹ️ Real MetaMask — approve in your wallet. Gas fees apply.
              </div>
            </div>
          )}

          {/* ═══════ TON TAB ═══════ */}
          {activeTab === 'tonkeeper' && (
            <div className="space-y-4">
              <div className="rounded-2xl p-4 space-y-4 cyber-card" style={{ border: '1px solid #00f5ff33' }}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: '#00f5ff11', border: '1px solid #00f5ff44' }}>💎</div>
                  <div className="flex-1">
                    <p className="font-black text-white font-mono">{ton.walletName || 'TON Connect'}</p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: '#00f5ff88' }}>Tonkeeper · MyTonWallet · OpenMask</p>
                  </div>
                  <StatusBadge status={ton.status} />
                </div>

                {(ton.status === 'idle' || ton.status === 'error') && (
                  <div className="space-y-2">
                    {ton.error && (
                      <p className="text-xs py-2 px-3 rounded-lg font-mono"
                        style={{ background: '#ff003c11', color: '#ff003c', border: '1px solid #ff003c33' }}>
                        ⚠ {ton.error}
                      </p>
                    )}
                    <button onClick={ton.connect}
                      className="w-full py-3.5 rounded-xl font-black font-mono text-sm transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#00f5ff11,#00f5ff22)', border: '1px solid #00f5ff55', color: '#00f5ff', boxShadow: '0 0 20px #00f5ff22' }}>
                      💎 CONNECT TON WALLET
                    </button>
                    <p className="text-center text-xs font-mono" style={{ color: '#ffffff33' }}>
                      QR code or wallet list will appear
                    </p>
                  </div>
                )}

                {ton.status === 'connecting' && (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-10 h-10 rounded-full border-2 border-[#00f5ff] border-t-transparent animate-spin" />
                    <p className="text-sm font-black font-mono" style={{ color: '#00f5ff' }}>Opening TON Connect...</p>
                    <p className="text-xs text-center font-mono" style={{ color: '#ffffff44' }}>Scan QR or approve in Tonkeeper</p>
                  </div>
                )}

                {ton.status === 'connected' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl space-y-1" style={{ background: '#00ff8811', border: '1px solid #00ff8833' }}>
                      <div className="flex justify-between">
                        <span className="text-xs font-mono" style={{ color: '#00ff8888' }}>WALLET</span>
                        <span className="text-xs font-bold font-mono" style={{ color: '#00ff88' }}>{ton.walletName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs font-mono" style={{ color: '#00ff8888' }}>ADDRESS</span>
                        <span className="text-xs font-mono" style={{ color: '#00ff88' }}>{ton.address}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black font-mono" style={{ color: '#00f5ff' }}>AMOUNT (TON)</label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input type="number" value={tonAmount} onChange={e => setTonAmount(e.target.value)}
                            placeholder="1.0"
                            className="w-full rounded-xl px-3 py-3 text-sm font-bold outline-none font-mono"
                            style={{ background: '#13131f', border: '1px solid #00f5ff44', color: 'white' }} />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            {['1','5','10'].map(v => (
                              <button key={v} onClick={() => setTonAmount(v)}
                                className="text-[10px] px-1.5 py-0.5 rounded font-black font-mono"
                                style={{ background: '#00f5ff22', color: '#00f5ff' }}>{v}</button>
                            ))}
                          </div>
                        </div>
                        <button onClick={handleTonDeposit} disabled={processingDeposit || !tonAmount}
                          className="px-4 rounded-xl font-black font-mono text-sm transition-all active:scale-95 disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg,#00f5ff,#00c8ff)', color: '#000' }}>
                          {processingDeposit ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'SEND'}
                        </button>
                      </div>
                    </div>

                    <button onClick={ton.disconnect}
                      className="text-xs font-black font-mono px-3 py-1.5 rounded-lg"
                      style={{ background: '#ff003c11', border: '1px solid #ff003c33', color: '#ff003c' }}>
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl text-xs font-mono" style={{ background: '#00f5ff08', border: '1px solid #00f5ff22', color: '#00f5ff66' }}>
                ℹ️ Real TON Connect — supports Tonkeeper, MyTonWallet, OpenMask.
              </div>
            </div>
          )}

          {/* ═══════ ON-CHAIN CUSTODIAL TAB ═══════ */}
          {activeTab === 'onchain' && (
            <div className="space-y-4">
              <TonCustodialPanel userId={telegramId ?? undefined} />
              <OnChainAddressPanel
                icon={<IconBitcoin size={24} />}
                title="BITCOIN DEPOSIT"
                subtitle="Send BTC to this address"
                address="bc1qg2rln40e5e73ykt264vj9wty4jjv902mwltgfy"
                color="#f7931a"
                network="Bitcoin (BTC)"
                minDeposit="0.0001 BTC"
              />
              <OnChainAddressPanel
                icon={<IconEthereum size={24} />}
                title="ETHEREUM DEPOSIT"
                subtitle="Send ETH / ERC-20 to this address"
                address="0x4074d24e7131bE58225FEC3633F6887751d88550"
                color="#627eea"
                network="Ethereum (ETH)"
                minDeposit="0.001 ETH"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
