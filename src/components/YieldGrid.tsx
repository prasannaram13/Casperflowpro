import React from 'react';
import { PoolCard } from './PoolCard';
import { useApp } from '../context/AppContext';
import { Sparkles, TrendingUp, ShieldAlert, Heart } from 'lucide-react';

interface YieldGridProps {
  searchQuery: string;
  selectedCategory: string;
}

export const YieldGrid: React.FC<YieldGridProps> = ({ searchQuery, selectedCategory }) => {
  const { pools, simulateMarketEvent } = useApp();

  // Filter pools
  const filteredPools = pools.filter((pool) => {
    const matchesSearch = pool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pool.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || pool.type.toUpperCase() === selectedCategory.toUpperCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header section with trigger tests */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <TrendingUp size={14} className="text-[#00D4FF]" /> 
            Casper Network Yield Opportunities
          </h2>
          <p className="text-xs text-secondary/70">
            Real-time oracle yields broadcasted on-chain via Odra contract hashes.
          </p>
        </div>

        {/* Market APY simulator buttons to test the state machine */}
        <div className="flex items-center gap-1.5 bg-white/30 border border-white/40 p-1 rounded-full backdrop-blur-md self-start sm:self-auto">
          <span className="text-[10px] font-bold px-2 text-[#1A1A2E]/70 uppercase tracking-wider">
            Simulate APY:
          </span>
          <button
            onClick={() => simulateMarketEvent('surge')}
            className="px-2.5 py-1 rounded-full bg-green-500/10 hover:bg-green-500/20 text-[#00C853] text-[10px] font-bold transition-all cursor-pointer"
            title="Spikes Options and AMM pool APYs to trigger auto-rebalancing"
          >
            Surge APY
          </button>
          <button
            onClick={() => simulateMarketEvent('crash')}
            className="px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 text-[10px] font-bold transition-all cursor-pointer"
            title="Drastically reduces pool APYs"
          >
            Market Drop
          </button>
          <button
            onClick={() => simulateMarketEvent('stable')}
            className="px-2.5 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 text-[10px] font-bold transition-all cursor-pointer"
            title="Restores stable yields"
          >
            Re-align
          </button>
        </div>
      </div>

      {filteredPools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 backdrop-blur-md bg-white/20 rounded-[24px] border border-white/30 text-center">
          <p className="text-sm font-bold text-secondary">No yield pools found matching "{searchQuery}"</p>
          <p className="text-xs text-secondary/60 mt-1">Try switching the quick-tab filter above back to "All".</p>
        </div>
      )}
    </div>
  );
};
