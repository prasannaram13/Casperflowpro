import React from 'react';
import { GlassCard } from './GlassCard';
import { TxRow } from './TxRow';
import { useApp } from '../context/AppContext';
import { History, ExternalLink } from 'lucide-react';

export const TxHistory = () => {
  const { transactions } = useApp();

  return (
    <GlassCard className="p-5 flex-1 flex flex-col gap-4 border-white/35 min-h-[250px]">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <History size={14} className="text-[#00D4FF]" /> 
          Recent Ledger Operations
        </h2>
        <a 
          href="https://testnet.cspr.live" 
          target="_blank" 
          rel="noreferrer" 
          className="text-[10px] font-mono text-[#7B61FF] hover:underline flex items-center gap-1 font-bold"
        >
          <span>cspr.live Explorer</span>
          <ExternalLink size={10} />
        </a>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 flex flex-col gap-1 division-y division-white/10 scrollbar-none">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <TxRow key={tx.id} tx={tx} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <p className="text-xs font-mono">No operations on-chain yet</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
