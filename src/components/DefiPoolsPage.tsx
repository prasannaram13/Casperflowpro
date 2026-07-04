import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Pool } from '../types';
import { GlassCard } from './GlassCard';
import { 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Clock, 
  Coins, 
  TrendingUp, 
  X, 
  ShieldCheck, 
  HelpCircle, 
  Info, 
  Percent, 
  History, 
  User, 
  CheckCircle2,
  AlertTriangle,
  Settings,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DefiPoolsPage = () => {
  const { 
    pools, 
    isConnected, 
    connect, 
    balance, 
    investInPool, 
    withdrawFromPool, 
    overrideAgent,
    activeTab,
    selectedCategory,
    setSelectedCategory
  } = useApp();

  // Filter and Sort states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Highest APY');
  
  // Selected pool for details
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  
  // Modal states for Invest and Withdraw
  const [investPool, setInvestPool] = useState<Pool | null>(null);
  const [withdrawPool, setWithdrawPool] = useState<Pool | null>(null);
  
  // Invest/Withdraw input values
  const [amountInput, setAmountInput] = useState<string>('');
  const [txStep, setTxStep] = useState<'idle' | 'signing' | 'confirming' | 'success'>('idle');

  const categories = ['All', 'Lending', 'AMM', 'RWA', 'Options', 'Stablecoin'];

  // Filtered and sorted pools
  const filteredAndSortedPools = useMemo(() => {
    let result = pools.filter((pool) => {
      const matchesSearch = 
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        pool.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = 
        selectedCategory === 'All' || 
        pool.type.toUpperCase() === selectedCategory.toUpperCase();
      return matchesSearch && matchesCategory;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'Highest APY':
          return b.apy - a.apy;
        case 'Lowest Risk':
          const riskWeight = { Low: 1, Medium: 2, High: 3 };
          return riskWeight[a.risk] - riskWeight[b.risk];
        case 'Highest TVL':
          return b.tvl - a.tvl;
        case 'Newest':
          return (a.createdDaysAgo || 0) - (b.createdDaysAgo || 0); // smaller days ago is newer
        case 'Oldest':
          return (b.createdDaysAgo || 0) - (a.createdDaysAgo || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [pools, searchQuery, selectedCategory, sortBy]);

  // Generate 30 days APY history for a pool
  const apyHistoryData = useMemo(() => {
    if (!selectedPool) return [];
    const baseApy = selectedPool.apy;
    const data = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // Create random wave around base APY
      const randomOffset = Math.sin(i / 3) * (baseApy * 0.1) + (Math.sin(i / 1.5) * 2);
      data.push({
        date: dayStr,
        apy: parseFloat((baseApy + randomOffset).toFixed(1))
      });
    }
    return data;
  }, [selectedPool]);

  // Get composition of tokens based on category
  const poolComposition = useMemo(() => {
    if (!selectedPool) return [];
    switch (selectedPool.type) {
      case 'Lending':
        return [
          { token: 'CSPR (Casper)', percent: 60, color: 'bg-[#7B61FF]' },
          { token: 'USDC (Stable)', percent: 30, color: 'bg-[#00D4FF]' },
          { token: 'USDT (Stable)', percent: 10, color: 'bg-[#00C853]' }
        ];
      case 'AMM':
        return [
          { token: 'CSPR (Casper)', percent: 50, color: 'bg-[#7B61FF]' },
          { token: 'wETH (Ethereum)', percent: 40, color: 'bg-[#FF007A]' },
          { token: 'LP Fees Reinvested', percent: 10, color: 'bg-[#FF9100]' }
        ];
      case 'RWA':
        return [
          { token: 'Tokenized Treasury Bills', percent: 70, color: 'bg-[#7B61FF]' },
          { token: 'CSPR Collateral', percent: 20, color: 'bg-[#00C853]' },
          { token: 'Liquidity Reserve', percent: 10, color: 'bg-[#00D4FF]' }
        ];
      case 'Options':
        return [
          { token: 'Hedging Collateral', percent: 55, color: 'bg-[#FF007A]' },
          { token: 'CSPR Calls', percent: 35, color: 'bg-[#7B61FF]' },
          { token: 'Premium Reserve', percent: 10, color: 'bg-[#FF9100]' }
        ];
      case 'Stablecoin':
        return [
          { token: 'USDC (Casper Native)', percent: 50, color: 'bg-[#00D4FF]' },
          { token: 'USDT (Bridged)', percent: 40, color: 'bg-[#00C853]' },
          { token: 'DAI (Multi-collateral)', percent: 10, color: 'bg-[#7B61FF]' }
        ];
      default:
        return [];
    }
  }, [selectedPool]);

  // Trigger deposit process
  const handleOpenInvest = (pool: Pool, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnected) {
      connect();
      return;
    }
    setInvestPool(pool);
    setAmountInput('');
    setTxStep('idle');
  };

  // Trigger withdraw process
  const handleOpenWithdraw = (pool: Pool, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isConnected) {
      connect();
      return;
    }
    setWithdrawPool(pool);
    setAmountInput('');
    setTxStep('idle');
  };

  const executeInvest = () => {
    if (!investPool) return;
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0 || amount > balance) return;

    // Direct invocation of the standard Transaction Studio Modal!
    investInPool(investPool.id, amount);
    setInvestPool(null);
    setAmountInput('');
  };

  const executeWithdraw = () => {
    if (!withdrawPool) return;
    const amount = parseFloat(amountInput);
    const maxWithdraw = withdrawPool.userAllocation || 0;
    if (isNaN(amount) || amount <= 0 || amount > maxWithdraw) return;

    withdrawFromPool(withdrawPool.id, amount);
    setWithdrawPool(null);
    setAmountInput('');
  };

  const applyPercentInput = (percent: number, maxVal: number) => {
    const val = (maxVal * (percent / 100)).toFixed(1);
    setAmountInput(val);
  };

  const getRiskColor = (r: Pool['risk']) => {
    switch (r) {
      case 'Low': return 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/20';
      case 'Medium': return 'text-[#FF9100] bg-[#FF9100]/10 border-[#FF9100]/20';
      case 'High': return 'text-[#FF007A] bg-[#FF007A]/10 border-[#FF007A]/20';
    }
  };

  return (
    <div className="w-full">
      {/* Title block with count badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-[#1A1A2E] tracking-tight">
              Yield Pools
            </h1>
            <span className="bg-[#7B61FF] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(123,97,255,0.4)]">
              {filteredAndSortedPools.length} Active Pools
            </span>
          </div>
          <p className="text-sm text-secondary mt-0.5">
            Deploy capital into autonomous smart contract pools on the Casper Network.
          </p>
        </div>

        {/* Search & Sort combo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/60" />
            <input
              type="text"
              placeholder="Search pools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/40 border border-white/50 rounded-2xl text-xs font-semibold placeholder-secondary/50 focus:outline-none focus:ring-1 focus:ring-[#7B61FF]/40 focus:bg-white/70 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary/60 hover:text-secondary cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full sm:w-48 pl-4 pr-10 py-2 bg-white/40 border border-white/50 rounded-2xl text-xs font-bold text-[#1A1A2E]/80 focus:outline-none focus:ring-1 focus:ring-[#7B61FF]/40 cursor-pointer shadow-sm"
            >
              <option value="Highest APY">Highest APY</option>
              <option value="Lowest Risk">Lowest Risk</option>
              <option value="Highest TVL">Highest TVL</option>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
            <SlidersHorizontal size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary/60 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* STEP 3 Filter Pill Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map((cat) => {
            const isActive = selectedCategory.toUpperCase() === cat.toUpperCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 relative cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A2E] text-white shadow-[0_0_12px_rgba(26,26,46,0.3)] ring-1 ring-[#7B61FF]/40'
                    : 'bg-white/45 border border-white/40 text-[#1A1A2E]/75 hover:bg-white/80 hover:text-[#1A1A2E]'
                }`}
              >
                {cat}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-[#7B61FF] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Clear Filters indicator */}
        {(selectedCategory !== 'All' || searchQuery !== '') && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#7B61FF] hover:text-[#7B61FF]/80 flex items-center gap-1 cursor-pointer transition-colors"
          >
            Clear Filters
            <X size={12} />
          </button>
        )}
      </div>

      {/* Grid Layout of pools */}
      {filteredAndSortedPools.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAndSortedPools.map((pool) => {
            const isInvested = (pool.userAllocation || 0) > 0;
            const isAgent = pool.isAgentManaged;
            const isPaused = pool.isPaused;
            const isFull = pool.isFull;

            // Determine card styling based on state
            let borderStyle = 'border-white/35';
            let glowBadge = null;
            let containerOpacity = 'opacity-100';

            if (isPaused || isFull) {
              containerOpacity = 'opacity-60 hover:opacity-80';
              borderStyle = 'border-amber-500/20';
              glowBadge = (
                <span className="bg-amber-500/10 text-amber-600 text-[9px] font-bold px-2 py-0.5 rounded-md border border-amber-500/20">
                  {isPaused ? 'Paused' : 'Pool Full'}
                </span>
              );
            } else if (isAgent) {
              borderStyle = 'border-purple-500/30 shadow-[0_0_15px_rgba(123,97,255,0.08)]';
              glowBadge = (
                <span className="bg-[#7B61FF]/10 text-[#7B61FF] text-[9px] font-bold px-2 py-0.5 rounded-md border border-[#7B61FF]/20 flex items-center gap-1">
                  🤖 Agent Managed
                </span>
              );
            } else if (isInvested) {
              borderStyle = 'border-cyan-500/30 shadow-[0_0_15px_rgba(0,212,255,0.08)]';
              glowBadge = (
                <span className="bg-[#00D4FF]/10 text-cyan-600 text-[9px] font-bold px-2 py-0.5 rounded-md border border-[#00D4FF]/20">
                  Active Allocation
                </span>
              );
            }

            return (
              <motion.div
                layout
                key={pool.id}
                onClick={() => setSelectedPool(pool)}
                className={`group relative overflow-hidden p-5 flex flex-col justify-between h-64 bg-white/45 border backdrop-blur-md rounded-[24px] hover:translate-y-[-4px] active:scale-98 hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-all cursor-pointer ${borderStyle} ${containerOpacity}`}
              >
                {/* Gradient bubble behind card */}
                <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-tr ${pool.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-secondary">
                      {pool.type} Pool
                    </span>
                    <div className="flex items-center gap-1.5">
                      {glowBadge}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${getRiskColor(pool.risk)}`}>
                        {pool.risk} Risk
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-display font-bold text-[#1A1A2E] leading-tight group-hover:text-[#7B61FF] transition-colors">
                    {pool.name}
                  </h3>
                  
                  {/* TVL */}
                  <p className="text-[11px] text-secondary font-medium mt-0.5">
                    TVL: ${(pool.tvl / 1e6).toFixed(1)}M USD
                  </p>
                </div>

                {/* Main numbers and actions */}
                <div className="mt-4">
                  {/* Allocation Info if invested */}
                  {isInvested && (
                    <div className="mb-2 bg-black/5 rounded-xl px-3 py-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-secondary">
                        <span>Your Allocation</span>
                        <span className="text-[#1A1A2E]">${pool.userAllocation} USD</span>
                      </div>
                      <div className="w-full bg-[#1A1A2E]/10 h-1 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400" 
                          style={{ width: `${Math.min(100, (pool.userAllocation || 0) / 15)}%` }} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Agent target allocation if agent managed */}
                  {isAgent && (
                    <div className="mb-2 bg-[#7B61FF]/5 rounded-xl px-3 py-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-[#7B61FF]">
                        <span>Agent Strategy Allocation</span>
                        <span>{pool.agentAllocationPercent}%</span>
                      </div>
                      <div className="w-full bg-[#7B61FF]/10 h-1 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-[#7B61FF]" 
                          style={{ width: `${pool.agentAllocationPercent}%` }} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between gap-2 mt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-display font-bold text-[#1A1A2E] tracking-tight">
                        {pool.apy}%
                      </span>
                      <span className="text-[10px] font-semibold text-[#1A1A2E]/60 uppercase tracking-widest">
                        APY
                      </span>
                      <span className={`flex items-center gap-0.5 text-xs font-bold ${pool.trend === 'up' ? 'text-[#00C853]' : pool.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                        {pool.trend === 'up' && <ArrowUp size={12} />}
                        {pool.trend === 'down' && <ArrowDown size={12} />}
                        {pool.trend === 'stable' && <span className="text-sm">~</span>}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {isInvested ? (
                        <button
                          onClick={(e) => handleOpenWithdraw(pool, e)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#1A1A2E]/10 text-[#1A1A2E] hover:bg-[#1A1A2E]/20 transition-all cursor-pointer"
                        >
                          Manage
                        </button>
                      ) : null}

                      <button
                        disabled={isPaused || isFull}
                        onClick={(e) => handleOpenInvest(pool, e)}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isPaused || isFull
                            ? 'bg-black/5 text-secondary/40 cursor-not-allowed'
                            : isInvested 
                              ? 'bg-[#1A1A2E] text-white hover:bg-black' 
                              : 'bg-white border border-[#1A1A2E] text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-white'
                        }`}
                      >
                        <Plus size={10} />
                        Invest
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* Empty Filters State */
        <div className="flex flex-col items-center justify-center p-12 backdrop-blur-md bg-white/20 rounded-[32px] border border-white/30 text-center max-w-md mx-auto mt-6">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 border border-amber-500/20">
            <AlertTriangle size={24} />
          </div>
          <p className="text-sm font-bold text-secondary">0 pools match your filters</p>
          <p className="text-xs text-secondary/60 mt-1 mb-4">
            Try adjusting your search criteria or reset filters to explore all Casper Network vaults.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#1A1A2E] hover:bg-black transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* DETAIL MODAL OVERLAY (STEP 6) */}
      <AnimatePresence>
        {selectedPool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPool(null)}
              className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="relative w-full max-w-3xl bg-white/95 border border-white/50 backdrop-blur-xl rounded-[32px] shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-black/5 bg-white/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedPool.gradient} flex items-center justify-center text-white shadow-md`}>
                    <Coins size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-display font-bold text-[#1A1A2E]">
                        {selectedPool.name}
                      </h2>
                      <span className="bg-[#1A1A2E]/5 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedPool.type}
                      </span>
                    </div>
                    <p className="text-xs text-secondary">ID: pool-{selectedPool.id} • Smart Contract Hash Active</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPool(null)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-secondary hover:text-black cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-none flex flex-col gap-6">
                {/* Stats Bento Layout */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/5 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Current APY</span>
                    <div className="text-xl font-display font-bold text-[#1A1A2E] flex items-baseline gap-1 mt-1">
                      {selectedPool.apy}%
                      <span className={`text-[10px] font-bold ${selectedPool.trend === 'up' ? 'text-[#00C853]' : selectedPool.trend === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
                        {selectedPool.trend === 'up' ? '▲' : selectedPool.trend === 'down' ? '▼' : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/5 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total TVL</span>
                    <div className="text-xl font-display font-bold text-[#1A1A2E] mt-1">
                      ${(selectedPool.tvl / 1e6).toFixed(2)}M
                    </div>
                  </div>

                  <div className="bg-black/5 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Risk Rating</span>
                    <div className="mt-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getRiskColor(selectedPool.risk)}`}>
                        {selectedPool.risk} Risk
                      </span>
                    </div>
                  </div>

                  <div className="bg-black/5 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Lock Period</span>
                    <div className="text-sm font-bold text-[#1A1A2E] mt-1.5 flex items-center gap-1.5">
                      <Clock size={14} className="text-secondary" />
                      <span>7 Days Epoch</span>
                    </div>
                  </div>
                </div>

                {/* Left Column (APY CHART) & Right Column (ALLOCATION) */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Left chart side (3 cols) */}
                  <div className="md:col-span-3 flex flex-col gap-2">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp size={12} className="text-[#00D4FF]" /> APY History (30 Days)
                    </h3>
                    <div className="h-44 bg-black/5 rounded-2xl p-2.5">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={apyHistoryData}>
                          <XAxis dataKey="date" hide />
                          <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'rgba(26, 26, 46, 0.9)', 
                              border: 'none', 
                              borderRadius: '12px',
                              color: 'white',
                              fontSize: '10px'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="apy" 
                            stroke="#00D4FF" 
                            strokeWidth={2.5} 
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0, fill: '#7B61FF' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right allocation control (2 cols) */}
                  <div className="md:col-span-2 flex flex-col justify-between bg-black/5 rounded-2xl p-5 border border-black/5">
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1A2E]/70 uppercase tracking-wider">Your Position</h4>
                      
                      <div className="mt-4">
                        <span className="text-xs text-secondary">Allocated Capital</span>
                        <p className="text-2xl font-display font-bold text-[#1A1A2E] tracking-tight mt-1">
                          ${selectedPool.userAllocation || 0} USD
                        </p>
                      </div>

                      {selectedPool.isAgentManaged && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#7B61FF] font-bold bg-[#7B61FF]/5 p-2 rounded-xl">
                          <Sparkles size={12} />
                          <span>Managed by CasperFlow Yield Agent</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-6">
                      {selectedPool.isAgentManaged && (
                        <button
                          onClick={() => {
                            overrideAgent(selectedPool.id);
                            setSelectedPool((prev) => prev ? { ...prev, isAgentManaged: false } : null);
                          }}
                          className="w-full py-2 bg-transparent hover:bg-black/5 border border-[#7B61FF] text-[#7B61FF] rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                        >
                          <Settings size={12} />
                          Override Agent
                        </button>
                      )}

                      {(selectedPool.userAllocation || 0) > 0 ? (
                        <button
                          onClick={(e) => {
                            setSelectedPool(null);
                            handleOpenWithdraw(selectedPool, e);
                          }}
                          className="w-full py-2 bg-[#1A1A2E]/10 hover:bg-[#1A1A2E]/15 text-[#1A1A2E] rounded-xl text-xs font-bold cursor-pointer transition-all"
                        >
                          Withdraw Assets
                        </button>
                      ) : null}

                      <button
                        disabled={selectedPool.isPaused || selectedPool.isFull}
                        onClick={(e) => {
                          setSelectedPool(null);
                          handleOpenInvest(selectedPool, e);
                        }}
                        className="w-full py-2 bg-[#1A1A2E] hover:bg-black disabled:bg-black/10 disabled:text-secondary/40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={14} />
                        Invest Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pool Composition */}
                <div>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Pool Asset Composition</h3>
                  <div className="flex flex-col gap-2">
                    {poolComposition.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-[11px] font-bold text-secondary">
                          <span>{item.token}</span>
                          <span>{item.percent}%</span>
                        </div>
                        <div className="w-full bg-black/5 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Pool Activity Feed */}
                <div>
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Recent Pool Activity</h3>
                  <div className="flex flex-col gap-2 bg-black/5 p-4 rounded-2xl border border-black/5 text-[11px] font-mono font-medium text-secondary">
                    <div className="flex justify-between py-1 border-b border-black/5">
                      <span className="text-[#1A1A2E]">User 0x7a3f... deposited $5,000</span>
                      <span>Just now</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/5">
                      <span className="text-[#1A1A2E]">User 0x9b1c... withdrew $2,100</span>
                      <span>15 min ago</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#1A1A2E]">Agent rebalanced $8,400</span>
                      <span>1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INVESTMENT ACTION MODAL (STEP 7) */}
      <AnimatePresence>
        {investPool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInvestPool(null)}
              className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white/95 border border-white/50 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-display font-bold text-[#1A1A2E]">
                    Invest in {investPool.name}
                  </h3>
                  <p className="text-[11px] text-secondary">Direct Deposit into yield router contract</p>
                </div>
                <button
                  onClick={() => setInvestPool(null)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-secondary hover:text-black cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {txStep === 'idle' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-black/5 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Available Balance</span>
                      <p className="text-lg font-display font-bold text-[#1A1A2E] mt-0.5">{balance} CSPR</p>
                    </div>
                    <span className="text-[10px] font-bold text-secondary bg-white/50 border border-white px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1">
                      <ShieldCheck size={12} className="text-[#00C853]" /> Connected
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1.5">
                      Amount to Invest (CSPR)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-1 focus:ring-[#7B61FF]/40 shadow-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">
                        CSPR
                      </span>
                    </div>
                  </div>

                  {/* Quick percentage tags */}
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((p) => (
                      <button
                        key={p}
                        onClick={() => applyPercentInput(p, balance)}
                        className="py-1.5 bg-black/5 hover:bg-black/10 border border-black/5 text-[10px] font-bold text-secondary rounded-lg transition-all cursor-pointer"
                      >
                        {p === 100 ? 'MAX' : `${p}%`}
                      </button>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-2xl text-xs">
                    <div className="flex justify-between py-1 text-secondary font-medium">
                      <span>Est. Annual Return APY</span>
                      <span className="text-[#1A1A2E] font-bold">{investPool.apy}%</span>
                    </div>
                    <div className="flex justify-between py-1 text-secondary font-medium">
                      <span>Est. Yield Earning</span>
                      <span className="text-[#00C853] font-bold">
                        ~{amountInput ? (parseFloat(amountInput) * (investPool.apy / 100)).toFixed(1) : '0'} CSPR/year
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-cyan-500/10 mt-2 pt-2 text-secondary font-medium">
                      <span>Gas Limit fee</span>
                      <span className="text-[#1A1A2E] font-mono font-bold">0.0001 CSPR</span>
                    </div>
                  </div>

                  <button
                    disabled={!amountInput || parseFloat(amountInput) <= 0 || parseFloat(amountInput) > balance}
                    onClick={executeInvest}
                    className="w-full py-3 mt-2 bg-[#1A1A2E] hover:bg-black text-white rounded-2xl text-xs font-bold transition-all disabled:bg-black/5 disabled:text-secondary/40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#1A1A2E]/15"
                  >
                    <span>Confirm Investment</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* SIG STEPS */}
              {txStep === 'signing' && (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <Sparkles size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1A1A2E]">Approve on CSPR.click Wallet</h4>
                  <p className="text-xs text-secondary/80 max-w-xs">
                    Please approve the cryptographic signature request in your CSPR.click extension popup window...
                  </p>
                </div>
              )}

              {txStep === 'confirming' && (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 border-4 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
                  <h4 className="text-sm font-bold text-[#1A1A2E]">Confirming on blockchain...</h4>
                  <p className="text-xs text-secondary/80 max-w-xs">
                    Broadcasting deposit transaction hash on Casper Network blockchain nodes. Please hold...
                  </p>
                </div>
              )}

              {txStep === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(80,200,120,0.2)]">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-base font-display font-bold text-[#1A1A2E]">Investment Confirmed!</h4>
                    <p className="text-xs text-[#00C853] font-semibold mt-0.5">Success receipt broadcasted</p>
                  </div>
                  <p className="text-xs text-secondary/80 max-w-xs">
                    You have successfully allocated <strong>{amountInput} CSPR</strong> to <strong>{investPool.name}</strong>. Yield harvesting will resume shortly.
                  </p>
                  <button
                    onClick={() => {
                      setInvestPool(null);
                      setTxStep('idle');
                    }}
                    className="w-full mt-4 py-2.5 bg-[#1A1A2E] text-white rounded-xl text-xs font-bold hover:bg-black transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WITHDRAWAL ACTION MODAL (STEP 8) */}
      <AnimatePresence>
        {withdrawPool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWithdrawPool(null)}
              className="absolute inset-0 bg-[#1A1A2E]/40 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white/95 border border-white/50 backdrop-blur-xl rounded-[32px] p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-display font-bold text-[#1A1A2E]">
                    Withdraw from {withdrawPool.name}
                  </h3>
                  <p className="text-[11px] text-secondary">Withdraw allocated funds back to your wallet</p>
                </div>
                <button
                  onClick={() => setWithdrawPool(null)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-secondary hover:text-black cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {txStep === 'idle' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-black/5 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Your Invested Allocation</span>
                      <p className="text-lg font-display font-bold text-[#1A1A2E] mt-0.5">{withdrawPool.userAllocation || 0} USD</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1.5">
                      Amount to Withdraw (USD value)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-black/10 rounded-2xl text-sm font-bold text-[#1A1A2E] focus:outline-none focus:ring-1 focus:ring-[#7B61FF]/40 shadow-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary">
                        USD
                      </span>
                    </div>
                  </div>

                  {/* Quick percentage tags */}
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((p) => (
                      <button
                        key={p}
                        onClick={() => applyPercentInput(p, withdrawPool.userAllocation || 0)}
                        className="py-1.5 bg-black/5 hover:bg-black/10 border border-black/5 text-[10px] font-bold text-secondary rounded-lg transition-all cursor-pointer"
                      >
                        {p === 100 ? 'MAX' : `${p}%`}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={!amountInput || parseFloat(amountInput) <= 0 || parseFloat(amountInput) > (withdrawPool.userAllocation || 0)}
                    onClick={executeWithdraw}
                    className="w-full py-3 mt-2 bg-[#1A1A2E] hover:bg-black text-white rounded-2xl text-xs font-bold transition-all disabled:bg-black/5 disabled:text-secondary/40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#1A1A2E]/15"
                  >
                    <span>Confirm Withdrawal</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* SIG STEPS */}
              {txStep === 'signing' && (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <Sparkles size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500" />
                  </div>
                  <h4 className="text-sm font-bold text-[#1A1A2E]">Approve on CSPR.click Wallet</h4>
                  <p className="text-xs text-secondary/80 max-w-xs">
                    Confirm withdrawal transaction signature request via CSPR.click portal popup secure window...
                  </p>
                </div>
              )}

              {txStep === 'confirming' && (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 border-4 border-[#7B61FF] border-t-transparent rounded-full animate-spin" />
                  <h4 className="text-sm font-bold text-[#1A1A2E]">Confirming on blockchain...</h4>
                  <p className="text-xs text-secondary/80 max-w-xs">
                    Broadcasting withdrawal transaction receipt... Removing capital from pool vault contract.
                  </p>
                </div>
              )}

              {txStep === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(80,200,120,0.2)]">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-base font-display font-bold text-[#1A1A2E]">Withdrawal Completed!</h4>
                    <p className="text-xs text-[#00C853] font-semibold mt-0.5">Funds Returned Successfully</p>
                  </div>
                  <p className="text-xs text-secondary/80 max-w-xs">
                    You have successfully withdrawn <strong>{amountInput} USD</strong> worth of CSPR from <strong>{withdrawPool.name}</strong>. Your wallet balances are updated.
                  </p>
                  <button
                    onClick={() => {
                      setWithdrawPool(null);
                      setTxStep('idle');
                    }}
                    className="w-full mt-4 py-2.5 bg-[#1A1A2E] text-white rounded-xl text-xs font-bold hover:bg-black transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
