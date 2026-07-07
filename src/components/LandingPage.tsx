import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, 
  TrendingUp, 
  Lock, 
  Wallet, 
  ChevronRight, 
  Coins, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Percent, 
  Flame, 
  Zap,
  ArrowRight,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';

interface LandingPageProps {
  connect: () => Promise<void>;
}

export const LandingPage: React.FC<LandingPageProps> = ({ connect }) => {
  const [sliderAmount, setSliderAmount] = useState<number>(5000);
  const [selectedStrategy, setSelectedStrategy] = useState<'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');
  const [isWalletDetected, setIsWalletDetected] = useState<boolean>(true);

  useEffect(() => {
    const checkWallet = () => {
      const detected = typeof window !== 'undefined' && (
        !!window.CasperWalletProvider || 
        !!window.casperWalletHelper || 
        (window as any).casperWallet || 
        (window as any).casperDash
      );
      setIsWalletDetected(!!detected);
    };
    checkWallet();
    // Re-check after 1s just in case of script injection latency
    const t = setTimeout(checkWallet, 1000);
    return () => clearTimeout(t);
  }, []);

  // Interactive mock data based on strategy selected
  const strategyDetails = {
    CONSERVATIVE: {
      apy: 15.2,
      riskLevel: 'LOW',
      description: 'Focuses heavily on collateralized lending protocols and stablecoin reserves on Casper.',
      allocation: [
        { name: 'Casper Stable Yield', share: 50 },
        { name: 'Lending Alpha', share: 30 },
        { name: 'RWA Gamma', share: 20 },
      ],
      color: 'from-emerald-400 to-teal-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    BALANCED: {
      apy: 28.5,
      riskLevel: 'MEDIUM',
      description: 'Optimized index allocation balanced symmetrically between lending pools and AMM liquidity vaults.',
      allocation: [
        { name: 'AMM Beta', share: 40 },
        { name: 'Lending Alpha', share: 30 },
        { name: 'RWA Gamma', share: 20 },
        { name: 'Liquid Staking Epsilon', share: 10 },
      ],
      color: 'from-cyan-400 to-indigo-500',
      textColor: 'text-cyan-700',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20'
    },
    AGGRESSIVE: {
      apy: 45.2,
      riskLevel: 'HIGH',
      description: 'Maximizes yield by exposure to high-volume market-maker vaults, leverage lending, and options Hedging.',
      allocation: [
        { name: 'DeFi Options Delta', share: 45 },
        { name: 'Arbitrage AMM Vault', share: 35 },
        { name: 'Volatility Hedge Options', share: 20 },
      ],
      color: 'from-pink-500 to-rose-600',
      textColor: 'text-pink-700',
      bgColor: 'bg-pink-500/10 border-pink-500/20'
    }
  };

  const currentDetails = strategyDetails[selectedStrategy];
  const yearlyReturn = Math.round((sliderAmount * currentDetails.apy) / 100);

  return (
    <div className="relative min-h-screen p-4 md:p-6 lg:p-12 flex flex-col justify-between max-w-7xl mx-auto overflow-hidden">
      {/* Mesh Lights Background */}
      <div className="mesh-bubble-1" />
      <div className="mesh-bubble-2" />

      {/* Top Navigation Frame */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between p-4 mb-10 backdrop-blur-md bg-white/10 rounded-[24px] border border-white/20 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7B61FF] to-[#00D4FF] flex items-center justify-center text-white shadow-md">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight text-[#1A1A2E] block">CasperFlow</span>
            <span className="text-[10px] uppercase tracking-widest text-[#1A1A2E]/50 font-bold">Autonomous Yield Agent</span>
          </div>
        </div>

        <button
          onClick={connect}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#1A1A2E] text-xs font-bold border border-white/80 shadow-[0_4px_16px_rgba(255,255,255,0.45)] hover:shadow-[0_4px_24px_rgba(255,255,255,0.65)] hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
        >
          <Wallet size={14} />
          <span>Connect Wallet</span>
        </button>
      </motion.header>

      {/* Main Hero & Split Portal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-grow my-auto">
        
        {/* Left Side: Gated Copy & Hero Introduction */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-6 space-y-6"
        >
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 text-xs font-semibold">
            <Lock size={12} />
            <span>Secure Gated Vault Interface</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-[#1A1A2E] leading-[1.1] tracking-tight">
            Next-Gen Yield <span className="bg-gradient-to-r from-[#7B61FF] to-[#00D4FF] bg-clip-text text-transparent">Automation</span> on Casper
          </h1>

          <p className="text-[#1A1A2E]/70 text-sm md:text-base leading-relaxed max-w-xl">
            CasperFlow is a non-custodial, AI-driven quantitative optimization protocol. 
            Connect your wallet to let our autonomous agent model, execute, and automatically rebalance your positions across high-yield smart contracts, AMMs, and tokenized real-world assets.
          </p>

          {/* Quick Real-Time Network Info Teasers */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="p-3.5 backdrop-blur-md bg-white/20 rounded-2xl border border-white/30">
              <span className="text-[10px] text-[#1A1A2E]/50 font-bold block uppercase tracking-wider">Total Staked TVL</span>
              <span className="text-sm font-display font-bold text-[#1A1A2E]">14,845,210 CSPR</span>
            </div>
            <div className="p-3.5 backdrop-blur-md bg-white/20 rounded-2xl border border-white/30">
              <span className="text-[10px] text-[#1A1A2E]/50 font-bold block uppercase tracking-wider">Current Avg APY</span>
              <span className="text-sm font-display font-bold text-[#1A1A2E]">28.5% APY</span>
            </div>
            <div className="p-3.5 backdrop-blur-md bg-white/20 rounded-2xl border border-white/30">
              <span className="text-[10px] text-[#1A1A2E]/50 font-bold block uppercase tracking-wider">Automated Tasks</span>
              <span className="text-sm font-display font-bold text-[#1A1A2E]">143,842 Tasks</span>
            </div>
          </div>

          {/* Wallet Connection / Download Status */}
          {!isWalletDetected ? (
            <div className="p-5 rounded-2xl bg-red-500/[0.04] border border-red-500/20 flex flex-col gap-4 text-xs max-w-xl shadow-sm">
              <div className="flex gap-3 text-red-800 leading-relaxed">
                <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm block mb-1">Casper Wallet Extension Not Detected</span>
                  We could not detect the official Casper Wallet browser extension. To access CasperFlow's autonomous yield optimization agent and safeguard vaults on the Casper Network, please download the official wallet extension.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://casperwallet.io/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer decoration-none"
                  id="download-casper-wallet-btn"
                >
                  <Download size={14} />
                  <span>Download Casper Wallet</span>
                </a>
                <button
                  onClick={() => {
                    const detected = typeof window !== 'undefined' && (
                      !!window.CasperWalletProvider || 
                      !!window.casperWalletHelper || 
                      (window as any).casperWallet || 
                      (window as any).casperDash
                    );
                    setIsWalletDetected(!!detected);
                    connect();
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-gray-50 text-[#1A1A2E] border border-black/10 text-xs font-bold transition-all cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Retry / Connect Anyway</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 flex gap-3 text-xs text-amber-800 leading-relaxed max-w-xl">
              <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Authorization Gated Access Only</span>
                To protect on-chain vaults and leverage real-time Casper smart contract routing, you must connect a valid Casper Network account. No gas is consumed on initial handshake.
              </div>
            </div>
          )}

          {/* Connect Button Big Call */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={connect}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#1A1A2E] hover:bg-black text-white text-sm font-bold transition-all shadow-[0_8px_32px_rgba(26,26,46,0.25)] active:scale-98 group cursor-pointer"
            >
              <Wallet size={16} />
              <span>Connect Casper Wallet to Enter</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* Right Side: Interactive Strategy Simulator */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-6"
        >
          <div className="backdrop-blur-md bg-white/40 border border-white/50 p-6 rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-[#7B61FF]" />
                <h3 className="font-display font-bold text-[#1A1A2E] text-base">Strategy Performance Simulator</h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-700">
                AI Simulated
              </span>
            </div>

            {/* Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#1A1A2E]/60 uppercase tracking-wider block">
                Select Asset Allocation Matrix:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as const).map((strat) => (
                  <button
                    key={strat}
                    onClick={() => setSelectedStrategy(strat)}
                    className={`py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                      selectedStrategy === strat
                        ? 'bg-[#1A1A2E] text-white shadow-sm'
                        : 'bg-white/50 text-[#1A1A2E]/70 hover:bg-white border border-white/50'
                    }`}
                  >
                    {strat}
                  </button>
                ))}
              </div>
            </div>

            {/* CSPR Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#1A1A2E]/60 uppercase tracking-wider text-[11px]">Simulated Investment CSPR:</span>
                <span className="font-mono font-bold text-[#1A1A2E] text-sm bg-white/80 px-3 py-1 rounded-lg border border-black/5">
                  {sliderAmount.toLocaleString()} CSPR
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="50000"
                step="100"
                value={sliderAmount}
                onChange={(e) => setSliderAmount(Number(e.target.value))}
                className="w-full h-1.5 bg-black/10 rounded-lg appearance-none cursor-pointer accent-[#7B61FF]"
              />
              <div className="flex justify-between text-[10px] text-[#1A1A2E]/40 font-mono">
                <span>100 CSPR</span>
                <span>50,000 CSPR</span>
              </div>
            </div>

            {/* Estimated Output Result */}
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-white/90 to-white/70 border border-white/60 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-[#1A1A2E]/50 font-bold uppercase tracking-wider block">Estimated Annual Return</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-display font-bold bg-gradient-to-r from-[#7B61FF] to-[#00D4FF] bg-clip-text text-transparent">
                      +{yearlyReturn.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-[#1A1A2E]/60">CSPR</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#1A1A2E]/50 font-bold uppercase tracking-wider block">Target yield</span>
                  <span className="text-lg font-display font-bold text-[#1A1A2E] block">
                    {currentDetails.apy}% APY
                  </span>
                </div>
              </div>

              {/* Dynamic Progress/Alloc Bar */}
              <div className="space-y-2 pt-2 border-t border-black/5">
                <span className="text-[10px] font-bold text-[#1A1A2E]/50 uppercase tracking-wider block">
                  Optimized Vault Distribution
                </span>
                <div className="flex h-3 rounded-full overflow-hidden w-full bg-black/5">
                  {currentDetails.allocation.map((alloc, idx) => {
                    const colors = [
                      'bg-[#7B61FF]', 
                      'bg-[#00D4FF]', 
                      'bg-emerald-400', 
                      'bg-pink-400'
                    ];
                    return (
                      <div 
                        key={idx}
                        style={{ width: `${alloc.share}%` }} 
                        className={`${colors[idx % colors.length]} transition-all duration-300`} 
                        title={`${alloc.name}: ${alloc.share}%`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
                  {currentDetails.allocation.map((alloc, idx) => {
                    const colors = [
                      'bg-[#7B61FF]', 
                      'bg-[#00D4FF]', 
                      'bg-emerald-400', 
                      'bg-pink-400'
                    ];
                    return (
                      <div key={idx} className="flex items-center gap-1 text-[10px] text-[#1A1A2E]/70">
                        <span className={`w-2 h-2 rounded-full ${colors[idx % colors.length]}`} />
                        <span className="font-medium">{alloc.name}</span>
                        <span className="font-bold text-[#1A1A2E]">{alloc.share}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Strategy text */}
            <div className="text-xs text-[#1A1A2E]/70 italic leading-relaxed">
              &ldquo;{currentDetails.description}&rdquo;
            </div>

            {/* Quick Trigger within Card */}
            <button
              onClick={connect}
              className="w-full py-3.5 bg-gradient-to-r from-[#7B61FF] to-[#6348f2] hover:from-[#6c51ef] hover:to-[#553bdf] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wallet size={14} />
              <span>Deploy Strategy on {selectedStrategy}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Network Core Details Gated Info Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-12 pt-6 border-t border-black/5 text-[11px] text-secondary flex flex-col md:flex-row justify-between items-center gap-4 font-medium"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#00C853]" />
          <span>Casper Network Audited Vault Security Enforced</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span className="flex items-center gap-1">
            <Cpu size={12} className="text-[#7B61FF]" /> Node: Testnet-4
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers size={12} className="text-[#00D4FF]" /> Block: #4,231,009
          </span>
          <span>•</span>
          <span>Gas Limit: 0.0001 CSPR</span>
        </div>
      </motion.footer>
    </div>
  );
};
