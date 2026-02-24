import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';

const CURRENCY_COLORS: Record<string, string> = {
  BTC: '#f7931a', ETH: '#627eea', TON: '#00f5ff', USDT: '#26a17b',
};

export function HistoryPanel() {
  const { transactions } = useWallet();
  const { t } = useLanguage();

  const gameTxs = transactions.filter(tx => tx.type !== 'deposit' && tx.game !== 'Withdrawal');
  const deposits = transactions.filter(tx => tx.type === 'deposit');
  const withdrawals = transactions.filter(tx => tx.game === 'Withdrawal');

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4"
          style={{ background: '#13131f', border: '1px solid #1e1e3a' }}>
          ◫
        </div>
        <p className="font-black font-mono" style={{ color: '#00f5ff' }}>{t.noBetsYet}</p>
        <p className="text-sm mt-1 font-mono" style={{ color: '#ffffff33' }}>{t.noBetsDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      {gameTxs.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'TOTAL', value: gameTxs.length, color: '#00f5ff' },
            { label: 'WINS', value: gameTxs.filter(t => t.won).length, color: '#00ff88' },
            { label: 'LOSSES', value: gameTxs.filter(t => !t.won).length, color: '#ff003c' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center cyber-card"
              style={{ border: `1px solid ${s.color}33` }}>
              <p className="text-xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] font-mono mt-0.5" style={{ color: `${s.color}66` }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Withdrawals */}
      {withdrawals.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black font-mono" style={{ color: '#ff006e66' }}>◈ WITHDRAWALS</p>
          {withdrawals.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl cyber-card"
              style={{ border: '1px solid #ff006e22', background: '#ff006e08' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: '#ff006e22', border: '1px solid #ff006e44' }}>💸</div>
                <div>
                  <p className="text-xs font-black font-mono text-white">WITHDRAWAL</p>
                  <p className="text-[10px] font-mono" style={{ color: '#ffffff33' }}>
                    {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <p className="text-sm font-black font-mono" style={{ color: '#ff006e' }}>
                -{tx.amount.toFixed(4)} {tx.currency}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Deposits */}
      {deposits.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black font-mono" style={{ color: '#00f5ff66' }}>◈ DEPOSITS</p>
          {deposits.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl cyber-card"
              style={{ border: '1px solid #00f5ff22', background: '#00f5ff08' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: '#00f5ff22', border: '1px solid #00f5ff44' }}>💳</div>
                <div>
                  <p className="text-xs font-black font-mono text-white">DEPOSIT</p>
                  <p className="text-[10px] font-mono" style={{ color: '#ffffff33' }}>
                    {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <p className="text-sm font-black font-mono" style={{ color: '#00f5ff' }}>
                +{tx.amount.toFixed(4)} {tx.currency}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Game History */}
      {gameTxs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black font-mono" style={{ color: '#bf00ff66' }}>◈ BET HISTORY</p>
            <span className="text-[10px] font-mono" style={{ color: '#ffffff22' }}>{gameTxs.length} {t.bets}</span>
          </div>
          {gameTxs.map(tx => {
            const color = tx.won ? '#00ff88' : '#ff003c';
            const currColor = CURRENCY_COLORS[tx.currency] || '#00f5ff';
            return (
              <div key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl cyber-card"
                style={{ border: `1px solid ${color}22`, background: `${color}05` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                    {tx.won ? '🏆' : '💸'}
                  </div>
                  <div>
                    <p className="text-xs font-black font-mono text-white">{tx.game.toUpperCase()}</p>
                    <p className="text-[10px] font-mono" style={{ color: '#ffffff33' }}>
                      {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black font-mono" style={{ color: currColor }}>
                    {tx.won ? '+' : '-'}{tx.amount.toFixed(4)} {tx.currency}
                  </p>
                  <p className="text-[10px] font-mono" style={{ color: `${color}88` }}>
                    {tx.won ? t.win.toUpperCase() : t.loss.toUpperCase()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
