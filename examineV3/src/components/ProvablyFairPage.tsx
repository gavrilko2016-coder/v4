import { useMemo, useState } from 'react';
import { verifyDiceRoll } from '../utils/pfVerify';

export function ProvablyFairPage() {
  const [serverSeed, setServerSeed] = useState('');
  const [clientSeed, setClientSeed] = useState('');
  const [nonce, setNonce] = useState('0');
  const [out, setOut] = useState<{ random: number; d1: number; d2: number; roll: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const nonceNum = useMemo(() => Number(nonce), [nonce]);

  const canVerify = serverSeed.length > 0 && clientSeed.length > 0 && Number.isInteger(nonceNum) && nonceNum >= 0;

  const run = async () => {
    if (!canVerify) return;
    setLoading(true);
    try {
      const res = await verifyDiceRoll({ serverSeed, clientSeed, nonce: nonceNum });
      setOut(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 lg:p-8" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'var(--font-heading)' }}>Provably Fair</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Server створює <span className="font-mono">serverSeed</span> і показує його хеш <span className="font-mono">serverSeedHash</span> до ставки.
            Після ставки сервер розкриває <span className="font-mono">serverSeed</span>. Результат визначається HMAC-SHA256(serverSeed, `${'{'}clientSeed{'}'}:${'{'}nonce{'}'}`) і детерміновано перетворюється на outcome.
          </p>
        </div>

        <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid gap-3">
            <div>
              <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>serverSeed</div>
              <input value={serverSeed} onChange={e => setServerSeed(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0a0a0f] border border-[#1e1e3a] font-mono text-sm" />
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>clientSeed</div>
              <input value={clientSeed} onChange={e => setClientSeed(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0a0a0f] border border-[#1e1e3a] font-mono text-sm" />
            </div>
            <div>
              <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>nonce</div>
              <input value={nonce} onChange={e => setNonce(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0a0a0f] border border-[#1e1e3a] font-mono text-sm" />
            </div>
          </div>

          <button
            onClick={run}
            disabled={!canVerify || loading}
            className="w-full py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
            style={{ background: '#00FFAA', color: '#000' }}
          >
            {loading ? 'VERIFYING...' : 'VERIFY DICE'}
          </button>

          {out && (
            <div className="rounded-xl p-4 font-mono text-sm" style={{ background: 'rgba(0,255,170,0.06)', border: '1px solid rgba(0,255,170,0.18)' }}>
              <div>random: {out.random}</div>
              <div>d1: {out.d1} / d2: {out.d2}</div>
              <div>roll: {out.roll}</div>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" className="text-sm font-semibold" style={{ color: '#00FFAA' }}>← Back</a>
        </div>
      </div>
    </div>
  );
}
