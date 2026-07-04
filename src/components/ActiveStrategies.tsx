import React from 'react';
import { StrategyCard } from './StrategyCard';
import { useApp } from '../context/AppContext';
import { Layers } from 'lucide-react';

export const ActiveStrategies = () => {
  const { allocations, pools, isDeployed } = useApp();

  const getGradient = (poolId: string) => {
    const pool = pools.find(p => p.id === poolId);
    return pool?.gradient || 'from-[#7B61FF] to-[#00D4FF]';
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <Layers size={14} className="text-[#7B61FF]" /> 
          Active Portfolio Breakdown
        </h2>
        <span className="text-[10px] font-mono px-2 py-0.5 bg-white/30 border border-white/40 rounded-full">
          {isDeployed ? 'Actively Balancing' : 'Idle Portfolio'}
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
        {allocations.map((alloc) => (
          <div key={alloc.poolId} className="snap-start">
            <StrategyCard
              allocation={alloc}
              gradient={getGradient(alloc.poolId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
