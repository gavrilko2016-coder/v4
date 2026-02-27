import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { playClick, playDeposit, playLoss } from '../utils/sounds';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const { transactions, updateTransactionStatus } = useWallet();
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  const withdrawals = transactions.filter(t => t.type === 'withdrawal');
  const filtered = filter === 'all' 
    ? withdrawals 
    : withdrawals.filter(t => t.status === 'pending');

  const handleAction = (id: string, action: 'confirmed' | 'failed') => {
    if (action === 'confirmed') playDeposit();
    else playLoss();
    updateTransactionStatus(id, action);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}>
      
      <motion.div 
        className="w-full max-w-2xl bg-[#0f172a] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}>
        
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#1e293b]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h2 className="text-lg font-bold text-white">Admin Moderation</h2>
              <p className="text-xs text-gray-400">Manage withdrawal requests</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-4 bg-[#0f172a]">
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              Pending ({withdrawals.filter(t => t.status === 'pending').length})
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              All History
            </button>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No {filter} withdrawals found.
              </div>
            ) : (
              filtered.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-[#1e293b] rounded-xl border border-gray-700">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        tx.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {tx.status?.toUpperCase() || 'PENDING'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white font-mono font-bold text-lg">
                      {tx.amount} {tx.currency}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1 break-all">
                      To: {tx.address || 'Unknown Address'}
                    </p>
                  </div>

                  {tx.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(tx.id, 'failed')}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold transition-colors">
                        Reject
                      </button>
                      <button
                        onClick={() => handleAction(tx.id, 'confirmed')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg text-xs font-bold transition-colors shadow-lg shadow-green-500/20">
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
