import React from 'react';
import { GlassCard } from './GlassCard';
import { StrategyAllocation } from '../types';
import { ArrowUpRight, ShieldCheck, Timer } from 'lucide-react';

interface StrategyCardProps {
  allocation: StrategyAllocation;
  gradient: string;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ allocation, gradient }) => {
  const { poolName, allocationPercent, apy } = allocation;

  return (
    <GlassCard className="min-w-[220px] p-4 flex flex-col justify-between hover:translate-y-[-4px] active:scale-98 transition-all hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] border-white/40 cursor-pointer">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-mono uppercase bg-white/40 border border-white/50 px-2 py-0.5 rounded-full text-[#1A1A2E]/80 font-bold">
            {poolName.includes('Lending') ? 'Lending' : poolName.includes('AMM') ? 'AMM' : poolName.includes('RWA') ? 'RWA' : 'Vault'}
          </span>
          <ArrowUpRight size={14} className="opacity-60 text-[#1A1A2E]" />
        </div>
        
        <h3 className="text-sm font-display font-bold text-[#1A1A2E] truncate">
          {poolName.split('(')[0].trim()}
        </h3>
        <p className="text-xs text-secondary font-medium">Casper Pool</p>
      </div>

      <div className="my-3">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-2xl font-bold font-display text-[#1A1A2E]">{apy}%</span>
          <span className="text-xs font-semibold text-[#1A1A2E]/60">APY</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#1A1A2E]/10 h-1.5 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${gradient}`} 
            style={{ width: `${allocationPercent}%` }} 
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono mt-1 opacity-75">
          <span>Allocated</span>
          <span className="font-bold">{allocationPercent}%</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-t border-white/20 pt-2 text-[10px] opacity-60 font-mono">
        <Timer size={10} />
        <span>Re-eval in 4h</span>
      </div>
    </GlassCard>
  );
};
