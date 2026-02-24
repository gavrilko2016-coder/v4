import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { playClick, playDeposit, playLoss } from '../utils/sounds';
import type { Currency } from '../types';
import { IconUSDT, IconBitcoin, IconTON, IconStars, IconHistory, IconEthereum } from './Icons';

type WithdrawTab = 'metamask' | 'ton' | 'history';
type WithdrawStatus = 'idle' | 'processing' | 'success' | 'failed';

interface WithdrawRecord {
  id: string;
  amount: number;
  currency: Currency;
  address: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
}

const CURRENCY_ICONS: Record<Currency, React.ReactNode> = {
  BTC: <IconBitcoin className="w-5 h-5" />,
  ETH: <IconEthereum className="w-5 h-5" />,
  TON: <IconTON className="w-5 h-5" />,
  USDT: <IconUSDT className="w-5 h-5" />,
  STARS: <IconStars className="w-5 h-5" />
};
const CURRENCY_COLORS: Record<Currency, string> = { BTC: '#f7931a', ETH: '#627eea', TON: '#00f5ff', USDT: '#26a17b', STARS: '#ffd700' };

// Minimum withdrawal ≈ 1000 Stars equivalent
// 1000 Stars ≈ 50 TON ≈ 20 USDT ≈ 0.005 ETH ≈ 0.00015 BTC
const MIN_WITHDRAW: Record<Currency, number> = { BTC: 0.00015, ETH: 0.005, TON: 50, USDT: 20, STARS: 1000 };
const STARS_EQUIV: Record<Currency, string> = { BTC: '0.00015 BTC', ETH: '0.005 ETH', TON: '50 TON', USDT: '20 USDT', STARS: '1000 ⭐' };
const MIN_STARS = 1000; // minimum 1000 Stars worth to withdraw
const FEES: Record<Currency, { flat: number; pct: number }> = {
  BTC:   { flat: 0.00002, pct: 0 },
  ETH:   { flat: 0.002,   pct: 0 },
  TON:   { flat: 0.05,    pct: 0 },
  USDT:  { flat: 1,       pct: 0 },
  STARS: { flat: 50,      pct: 0 },
};

function formatBal(n: number, c: Currency) {
  return c === 'BTC' ? n.toFixed(5) : c === 'ETH' ? n.toFixed(4) : n.toFixed(2);
}

function feeFor(amount: number, currency: Currency) {
  const f = FEES[currency];
  return +(f.flat + amount * f.pct).toFixed(8);
}

function youReceive(amount: number, currency: Currency) {
  return Math.max(0, +(amount - feeFor(amount, currency)).toFixed(8));
}

// ─── Address validator helpers ─────────────────────────────────────────────
function validateEthAddress(addr: string) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}
function validateTonAddress(addr: string) {
  // EQ/UQ prefix (user-friendly TON address)
  return /^[EU]Q[A-Za-z0-9_-]{46}$/.test(addr) || /^[0-9a-fA-F]{64}$/.test(addr);
}

// ─── Success Animation ─────────────────────────────────────────────────────
function SuccessOverlay({ amount, currency, address, onClose }: {
  amount: number; currency: Currency; address: string; onClose: () => void;
}) {
  const color = CURRENCY_COLORS[currency];
  return (
    <motion.div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className="w-full max-w-sm rounded-3xl overflow-hidden text-center p-8 relative"
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: `1px solid ${color}44`,
          boxShadow: `0 0 60px ${color}22`,
        }}
        initial={{ scale: 0.5, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 30%, ${color}18 0%, transparent 65%)` }} />

        {[...Array(8)].map((_, i) => (
          <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full"
            style={{ background: '#ffd700', top: `${15 + (i * 11) % 70}%`, left: `${8 + (i * 13) % 84}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.8, 0], y: [0, -30, -60] }}
            transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatDelay: 1 }} />
        ))}

        <motion.div className="text-6xl mb-5"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}>
          🚀
        </motion.div>

        <motion.p className="text-lg font-black font-mono mb-1"
          style={{ color: '#00ff88' }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          WITHDRAWAL SUBMITTED
        </motion.p>

        <motion.div className="rounded-2xl p-4 my-4"
          style={{ background: `${color}08`, border: `1px solid ${color}25` }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <p className="text-3xl font-black font-mono" style={{ color }}>
            {CURRENCY_ICONS[currency]} {formatBal(amount, currency)} {currency}
          </p>
          <p className="text-xs font-mono mt-2 truncate" style={{ color: `${color}66` }}>
            → {address.slice(0, 12)}...{address.slice(-6)}
          </p>
        </motion.div>

        <motion.div className="text-xs font-mono mb-5 space-y-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <p style={{ color: '#ffd700' }}>⏳ Estimated: 5–30 minutes</p>
          <p style={{ color: '#ffffff33' }}>You will receive a confirmation when processed</p>
        </motion.div>

        <motion.button onClick={onClose}
          className="w-full py-4 rounded-2xl font-black font-mono text-black"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)`, boxShadow: `0 0 25px ${color}44` }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          ✅ Done
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────
export function WithdrawModal({ onClose }: { onClose: () => void }) {
  const { wallet, withdraw, transactions } = useWallet();

  const [activeTab, setActiveTab] = useState<WithdrawTab>('ton');
  const [currency, setCurrency] = useState<Currency>('TON');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<WithdrawStatus>('idle');
  const [showSuccess, setShowSuccess] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState<WithdrawRecord[]>([]);
  const [addrError, setAddrError] = useState('');
  const [amtError, setAmtError] = useState('');

  const balance = wallet[currency];
  const numAmt = parseFloat(amount) || 0;
  const fee = feeFor(numAmt, currency);
  const receives = youReceive(numAmt, currency);
  const minW = MIN_WITHDRAW[currency];

  const isEthTab = activeTab === 'metamask';
  const activeCurrency: Currency = isEthTab ? 'ETH' : currency;

  const validateAddress = (addr: string) => {
    if (!addr) return 'Address is required';
    if (activeTab === 'metamask' && !validateEthAddress(addr)) return 'Invalid Ethereum address (must start with 0x)';
    if (activeTab === 'ton' && !validateTonAddress(addr)) return 'Invalid TON address (EQ.../UQ... format)';
    return '';
  };

  const validateAmount = (amt: string) => {
    const n = parseFloat(amt);
    if (!n || n <= 0) return 'Enter a valid amount';
    if (n > balance) return `Insufficient balance (max: ${formatBal(balance, currency)})`;
    if (n < minW) return `Minimum withdrawal: ${minW} ${currency}`;
    return '';
  };

  const handleWithdraw = async () => {
    // Only allow withdrawal if there is at least one REAL deposit (not daily bonus or tasks)
    const hasDeposit = transactions.some((t: any) => t.type === 'deposit' && t.game === 'Deposit');
    if (!hasDeposit) {
      setAmtError('Withdrawal locked: You must make a deposit first!');
      return;
    }

    const ae = validateAddress(address);
    const ame = validateAmount(amount);
    setAddrError(ae);
    setAmtError(ame);
    if (ae || ame) return;

    setStatus('processing');
    playClick();

    // Deduct from wallet immediately (optimistic)
    const ok = withdraw(numAmt, activeCurrency);
    if (!ok) {
      setAmtError('Insufficient balance');
      setStatus('idle');
      return;
    }

    // Simulate blockchain confirmation delay (2–4s)
    await new Promise(r => setTimeout(r, 2500 + Math.random() * 1500));

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const record: WithdrawRecord = {
      id: crypto.randomUUID(),
      amount: numAmt,
      currency: activeCurrency,
      address,
      status: 'pending',
      timestamp: new Date(),
      txHash,
    };

    setWithdrawHistory(prev => [record, ...prev]);

    // Simulate on-chain confirmation (would be real in prod)
    setTimeout(() => {
      setWithdrawHistory(prev =>
        prev.map(r => r.id === record.id ? { ...r, status: 'confirmed' } : r)
      );
    }, 15000);

    setStatus('success');
    playDeposit();
    setShowSuccess(true);
    setAmount('');
  };

  const handleFailed = () => {
    setStatus('failed');
    playLoss();
    setTimeout(() => setStatus('idle'), 3000);
  };
  void handleFailed;

  const TABS = [
    { id: 'ton' as WithdrawTab,      label: 'TON',     icon: <IconTON className="w-5 h-5" />, color: '#00f5ff' },
    { id: 'metamask' as WithdrawTab, label: 'ETH',     icon: <IconEthereum className="w-5 h-5" />, color: '#f6851b' },
    { id: 'history' as WithdrawTab,  label: 'History', icon: <IconHistory className="w-5 h-5" />, color: '#bf00ff' },
  ];

  const CURRENCIES: Currency[] = ['TON', 'USDT', 'ETH', 'BTC', 'STARS'];

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}>
        <motion.div
          className="w-full max-w-md rounded-t-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg,#0f0f1a,#0a0a0f)',
            border: '1px solid #1e1e3a',
            borderBottom: 'none',
            maxHeight: '92vh',
            overflowY: 'auto',
          }}
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          onClick={e => e.stopPropagation()}>

          {/* Top accent */}
          <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,#ff006e,#bf00ff,#00f5ff,transparent)' }} />
          <div className="flex justify-center pt-3">
            <div className="w-10 h-1 rounded-full bg-[#1e1e3a]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-lg font-black text-white font-mono flex items-center gap-2">
                <span className="text-xl">💸</span> WITHDRAW
              </h2>
              <p className="text-xs mt-0.5 font-mono" style={{ color: '#ff006e66' }}>
                Instant crypto withdrawals
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: '#1e1e3a', color: '#ff006e', border: '1px solid #ff006e33' }}>
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: '#13131f' }}>
              {TABS.map(tab => (
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
          </div>

          <div className="px-5 pb-8 space-y-4">

            {/* ═══ TON / USDT / BTC TAB ═══ */}
            {(activeTab === 'ton') && (
              <div className="space-y-4">

                {/* Currency selector */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black font-mono" style={{ color: '#00f5ff66' }}>SELECT CURRENCY</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CURRENCIES.filter(c => c !== 'ETH').map(c => (
                      <button key={c}
                        onClick={() => { playClick(); setCurrency(c); setAmount(''); setAddress(''); setAmtError(''); setAddrError(''); }}
                        className="flex items-center gap-2 p-3 rounded-xl transition-all"
                        style={currency === c ? {
                          background: `${CURRENCY_COLORS[c]}22`,
                          border: `1px solid ${CURRENCY_COLORS[c]}55`,
                          boxShadow: `0 0 10px ${CURRENCY_COLORS[c]}22`,
                        } : { background: '#13131f', border: '1px solid #1e1e3a' }}>
                        <span className="text-lg font-black" style={{ color: CURRENCY_COLORS[c] }}>
                          {CURRENCY_ICONS[c]}
                        </span>
                        <div className="text-left">
                          <p className="text-xs font-black font-mono" style={{ color: currency === c ? CURRENCY_COLORS[c] : 'white' }}>
                            {c}
                          </p>
                          <p className="text-[10px] font-mono" style={{ color: '#ffffff33' }}>
                            {formatBal(wallet[c], c)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono" style={{ color: CURRENCY_COLORS[currency] }}>
                    {currency === 'TON' || currency === 'USDT' ? 'TON WALLET ADDRESS' : 'BTC ADDRESS'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={e => { setAddress(e.target.value); setAddrError(''); }}
                      placeholder={currency === 'TON' || currency === 'USDT' ? 'EQC... or UQC...' : 'bc1q...'}
                      className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none pr-20"
                      style={{
                        background: '#13131f',
                        border: `1px solid ${addrError ? '#ff003c' : CURRENCY_COLORS[currency] + '44'}`,
                        color: 'white',
                      }} />
                    <button
                      onClick={async () => {
                        try {
                          const txt = await navigator.clipboard.readText();
                          setAddress(txt); setAddrError('');
                        } catch { /* ignore */ }
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-black font-mono"
                      style={{ background: `${CURRENCY_COLORS[currency]}22`, color: CURRENCY_COLORS[currency] }}>
                      PASTE
                    </button>
                  </div>
                  {addrError && <p className="text-xs font-mono" style={{ color: '#ff003c' }}>⚠ {addrError}</p>}
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black font-mono" style={{ color: CURRENCY_COLORS[currency] }}>
                      AMOUNT
                    </label>
                    <span className="text-[10px] font-mono" style={{ color: '#ffffff44' }}>
                      Balance: {formatBal(balance, currency)} {currency}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={e => { setAmount(e.target.value); setAmtError(''); }}
                      placeholder={`Min ${minW}`}
                      className="w-full rounded-xl px-4 py-3 text-sm font-mono font-black outline-none pr-28"
                      style={{
                        background: '#13131f',
                        border: `1px solid ${amtError ? '#ff003c' : CURRENCY_COLORS[currency] + '44'}`,
                        color: 'white',
                      }} />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      {['½', 'MAX'].map(l => (
                        <button key={l}
                          onClick={() => {
                            setAmtError('');
                            if (l === '½') setAmount(formatBal(balance / 2, currency));
                            else setAmount(formatBal(balance, currency));
                          }}
                          className="px-2 py-1 rounded text-[10px] font-black font-mono"
                          style={{ background: `${CURRENCY_COLORS[currency]}22`, color: CURRENCY_COLORS[currency] }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  {amtError && <p className="text-xs font-mono" style={{ color: '#ff003c' }}>⚠ {amtError}</p>}
                </div>

                {/* Fee breakdown */}
                {numAmt > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-3 space-y-2"
                    style={{ background: `${CURRENCY_COLORS[currency]}08`, border: `1px solid ${CURRENCY_COLORS[currency]}22` }}>
                    {[
                      { label: 'Amount', val: `${formatBal(numAmt, currency)} ${currency}` },
                      { label: 'Network fee', val: `-${formatBal(fee, currency)} ${currency}` },
                      { label: 'You receive', val: `${formatBal(receives, currency)} ${currency}`, highlight: true },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="text-xs font-mono" style={{ color: '#ffffff44' }}>{row.label}</span>
                        <span className="text-xs font-black font-mono"
                          style={{ color: row.highlight ? CURRENCY_COLORS[currency] : '#ffffff88' }}>
                          {row.val}
                        </span>
                      </div>
                    ))}
                    <div className="h-px" style={{ background: `${CURRENCY_COLORS[currency]}22` }} />
                    <p className="text-[10px] font-mono text-center" style={{ color: '#ffffff33' }}>
                      ⏱ Estimated arrival: 5–30 minutes
                    </p>
                  </motion.div>
                )}

                {/* Withdraw button */}
                <motion.button
                  onClick={handleWithdraw}
                  disabled={status === 'processing' || !amount || !address}
                  className="w-full py-4 rounded-xl font-black font-mono text-sm transition-all disabled:opacity-50"
                  style={{
                    background: status === 'success'
                      ? 'linear-gradient(135deg,#00ff88,#00cc66)'
                      : `linear-gradient(135deg,${CURRENCY_COLORS[currency]}33,${CURRENCY_COLORS[currency]}55)`,
                    border: `1px solid ${CURRENCY_COLORS[currency]}66`,
                    color: status === 'success' ? '#000' : CURRENCY_COLORS[currency],
                    boxShadow: `0 0 20px ${CURRENCY_COLORS[currency]}22`,
                  }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  {status === 'processing' ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-t-transparent rounded-full"
                        style={{ borderColor: CURRENCY_COLORS[currency] }}
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                      Processing withdrawal...
                    </span>
                  ) : status === 'failed' ? '❌ Failed — try again'
                    : `💸 Withdraw ${numAmt > 0 ? formatBal(numAmt, currency) + ' ' + currency : ''}`}
                </motion.button>

                {/* Minimum Stars notice */}
                <div className="p-3 rounded-xl text-xs font-mono space-y-1.5"
                  style={{ background: '#ffd70008', border: '1px solid #ffd70022' }}>
                  <p style={{ color: '#ffd700' }}>⭐ Minimum withdrawal: {MIN_STARS} Stars equivalent</p>
                  <p style={{ color: '#ffffff55' }}>= {STARS_EQUIV[currency]} · Equivalent to 1000 Telegram Stars</p>
                  <p style={{ color: '#ffffff33' }}>🔒 Always double-check the recipient address. Crypto transactions are irreversible.</p>
                </div>
              </div>
            )}

            {/* ═══ ETH/METAMASK TAB ═══ */}
            {activeTab === 'metamask' && (
              <div className="space-y-4">
                <div className="rounded-2xl p-4 cyber-card space-y-4" style={{ border: '1px solid #f6851b33' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ background: '#f6851b22', border: '1px solid #f6851b55' }}>🦊</div>
                    <div>
                      <p className="font-black text-white font-mono">Withdraw to MetaMask</p>
                      <p className="text-xs mt-0.5 font-mono" style={{ color: '#f6851b88' }}>
                        Send ETH to any Ethereum address
                      </p>
                    </div>
                  </div>

                  {/* ETH Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black font-mono" style={{ color: '#f6851b' }}>ETHEREUM ADDRESS</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={address}
                        onChange={e => { setAddress(e.target.value); setAddrError(''); }}
                        placeholder="0x742d35Cc..."
                        className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none pr-20"
                        style={{ background: '#13131f', border: `1px solid ${addrError ? '#ff003c' : '#f6851b44'}`, color: 'white' }} />
                      <button
                        onClick={async () => {
                          try { const t = await navigator.clipboard.readText(); setAddress(t); setAddrError(''); } catch { /* ignore */ }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-black font-mono"
                        style={{ background: '#f6851b22', color: '#f6851b' }}>
                        PASTE
                      </button>
                    </div>
                    {addrError && <p className="text-xs font-mono" style={{ color: '#ff003c' }}>⚠ {addrError}</p>}
                  </div>

                  {/* ETH Amount */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-black font-mono" style={{ color: '#f6851b' }}>AMOUNT (ETH)</label>
                      <span className="text-[10px] font-mono" style={{ color: '#ffffff44' }}>
                        Balance: {wallet.ETH.toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={e => { setAmount(e.target.value); setAmtError(''); setCurrency('ETH'); }}
                        placeholder="0.01"
                        className="w-full rounded-xl px-4 py-3 text-sm font-mono font-black outline-none pr-28"
                        style={{ background: '#13131f', border: `1px solid ${amtError ? '#ff003c' : '#f6851b44'}`, color: 'white' }} />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        {['0.01','0.05','MAX'].map(v => (
                          <button key={v}
                            onClick={() => { setAmtError(''); setCurrency('ETH'); setAmount(v === 'MAX' ? wallet.ETH.toFixed(4) : v); }}
                            className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono"
                            style={{ background: '#f6851b22', color: '#f6851b' }}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    {amtError && <p className="text-xs font-mono" style={{ color: '#ff003c' }}>⚠ {amtError}</p>}
                  </div>
                </div>

                <motion.button
                  onClick={handleWithdraw}
                  disabled={status === 'processing' || !amount || !address}
                  className="w-full py-4 rounded-xl font-black font-mono text-sm disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#f6851b,#e5761b)', color: '#000', boxShadow: '0 0 20px #f6851b33' }}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  {status === 'processing' ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                      Sending ETH...
                    </span>
                  ) : `🦊 Withdraw ETH`}
                </motion.button>
              </div>
            )}

            {/* ═══ HISTORY TAB ═══ */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {withdrawHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="font-black font-mono text-white">No withdrawals yet</p>
                    <p className="text-xs mt-1 font-mono" style={{ color: '#ffffff33' }}>
                      Your withdrawal history will appear here
                    </p>
                  </div>
                ) : withdrawHistory.map(w => {
                  const color = CURRENCY_COLORS[w.currency];
                  const statusColor = w.status === 'confirmed' ? '#00ff88' : w.status === 'failed' ? '#ff003c' : '#ffd700';
                  return (
                    <motion.div key={w.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-4 cyber-card space-y-2"
                      style={{ border: `1px solid ${color}22` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black" style={{ color }}>{CURRENCY_ICONS[w.currency]}</span>
                          <div>
                            <p className="text-sm font-black font-mono" style={{ color }}>
                              {formatBal(w.amount, w.currency)} {w.currency}
                            </p>
                            <p className="text-[10px] font-mono" style={{ color: '#ffffff33' }}>
                              {w.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black font-mono px-2 py-1 rounded-lg"
                          style={{ background: `${statusColor}11`, border: `1px solid ${statusColor}33`, color: statusColor }}>
                          {w.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono truncate" style={{ color: '#ffffff33' }}>
                        → {w.address}
                      </p>
                      {w.txHash && (
                        <p className="text-[10px] font-mono truncate" style={{ color: '#00f5ff44' }}>
                          TX: {w.txHash.slice(0, 16)}...
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            amount={youReceive(numAmt || 0, activeCurrency)}
            currency={activeCurrency}
            address={address}
            onClose={() => { setShowSuccess(false); onClose(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
