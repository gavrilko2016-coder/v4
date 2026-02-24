import { useState, useEffect } from 'react';

export function OnlineCounter() {
  const [count, setCount] = useState(3847);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        const delta = Math.floor(Math.random() * 24) - 10;
        const next = Math.max(1200, Math.min(9999, prev + delta));
        setTrend(delta > 2 ? 'up' : delta < -2 ? 'down' : 'stable');
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl flex-shrink-0"
      style={{
        background: '#00ff8811',
        border: '1px solid #00ff8833',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse flex-shrink-0" />
      <span className="text-xs font-black font-mono" style={{ color: '#00ff88' }}>
        {count.toLocaleString()}
      </span>
      <span className="text-[10px] hidden sm:inline" style={{ color: '#00ff8866', fontFamily: 'monospace' }}>
        {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '◆'}
      </span>
    </div>
  );
}
