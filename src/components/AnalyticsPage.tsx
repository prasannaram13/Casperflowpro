import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GlassCard } from './GlassCard';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  ComposedChart, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Share2, 
  Activity, 
  Cpu, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Percent, 
  Flame, 
  Award,
  BookOpen,
  PieChart as PieIcon,
  HardDrive,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AnalyticsPage = () => {
  const { isConnected, connect, transactions } = useApp();
  
  // Date range state
  const [dateRange, setDateRange] = useState<'24H' | '7D' | '30D' | '90D' | 'All Time'>('30D');
  
  // Chart toggles
  const [showNoAgentLine, setShowNoAgentLine] = useState<boolean>(true);
  const [rebalanceFilter, setRebalanceFilter] = useState<'All' | 'Auto' | 'Manual' | 'Success' | 'Failed'>('All');
  
  // State for expanded table rows
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  
  // Page load animating state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [dateRange]);

  // Date range dependent stats
  const stats = useMemo(() => {
    switch (dateRange) {
      case '24H':
        return {
          totalValue: 12150,
          totalValueChange: 0.4,
          netProfit: 48,
          netProfitChange: 1.2,
          avgApy: 27.9,
          avgApyChange: -0.1,
          rebalancesCount: 2,
        };
      case '7D':
        return {
          totalValue: 12280,
          totalValueChange: 1.8,
          netProfit: 210,
          netProfitChange: 3.5,
          avgApy: 28.1,
          avgApyChange: 0.3,
          rebalancesCount: 7,
        };
      case '30D':
        return {
          totalValue: 12450,
          totalValueChange: 3.2,
          netProfit: 840,
          netProfitChange: 7.2,
          avgApy: 28.4,
          avgApyChange: 1.1,
          rebalancesCount: 23,
        };
      case '90D':
        return {
          totalValue: 13100,
          totalValueChange: 8.5,
          netProfit: 2240,
          netProfitChange: 12.4,
          avgApy: 29.0,
          avgApyChange: 2.3,
          rebalancesCount: 68,
        };
      case 'All Time':
        return {
          totalValue: 15800,
          totalValueChange: 21.4,
          netProfit: 4950,
          netProfitChange: 32.1,
          avgApy: 29.4,
          avgApyChange: 4.5,
          rebalancesCount: 147,
        };
    }
  }, [dateRange]);

  // Portfolio value timeline data
  const portfolioTimelineData = useMemo(() => {
    const dataPoints: Record<string, any[]> = {
      '24H': [
        { time: '00:00', value: 12102, noAgent: 12102 },
        { time: '04:00', value: 12115, noAgent: 12109 },
        { time: '08:00', value: 12130, noAgent: 12112 },
        { time: '12:00', value: 12118, noAgent: 12095 },
        { time: '16:00', value: 12140, noAgent: 12105 },
        { time: '20:00', value: 12144, noAgent: 12102 },
        { time: '24:00', value: 12150, noAgent: 12100 },
      ],
      '7D': [
        { time: 'Mon', value: 12070, noAgent: 12070 },
        { time: 'Tue', value: 12110, noAgent: 12090 },
        { time: 'Wed', value: 12150, noAgent: 12105 },
        { time: 'Thu', value: 12130, noAgent: 12080 },
        { time: 'Fri', value: 12210, noAgent: 12110 },
        { time: 'Sat', value: 12240, noAgent: 12120 },
        { time: 'Sun', value: 12280, noAgent: 12132 },
      ],
      '30D': [
        { time: 'Jun 01', value: 11610, noAgent: 11610 },
        { time: 'Jun 05', value: 11750, noAgent: 11690 },
        { time: 'Jun 10', value: 11840, noAgent: 11740 },
        { time: 'Jun 15', value: 11990, noAgent: 11810 },
        { time: 'Jun 20', value: 12180, noAgent: 11890 },
        { time: 'Jun 25', value: 12340, noAgent: 11950 },
        { time: 'Jun 27', value: 12450, noAgent: 11995 },
      ],
      '90D': [
        { time: 'Apr W1', value: 10850, noAgent: 10850 },
        { time: 'Apr W3', value: 11210, noAgent: 11090 },
        { time: 'May W1', value: 11500, noAgent: 11210 },
        { time: 'May W3', value: 11840, noAgent: 11400 },
        { time: 'Jun W1', value: 12250, noAgent: 11640 },
        { time: 'Jun W3', value: 12890, noAgent: 11850 },
        { time: 'Jun End', value: 13100, noAgent: 11980 },
      ],
      'All Time': [
        { time: 'Jan', value: 10000, noAgent: 10000 },
        { time: 'Feb', value: 10750, noAgent: 10450 },
        { time: 'Mar', value: 11200, noAgent: 10700 },
        { time: 'Apr', value: 11900, noAgent: 11100 },
        { time: 'May', value: 13200, noAgent: 11600 },
        { time: 'Jun', value: 15800, noAgent: 12200 },
      ]
    };
    return dataPoints[dateRange];
  }, [dateRange]);

  // Allocation Donut data
  const allocationDonutData = [
    { name: 'Lending Alpha', value: 40, color: '#00D4FF' },
    { name: 'AMM Beta', value: 35, color: '#7B61FF' },
    { name: 'RWA Gamma', value: 25, color: '#00C853' },
  ];

  // APY individual pool vs Average APY
  const poolApyComparisonData = [
    { name: 'Lending Alpha', APY: 32.4, Avg: 28.4 },
    { name: 'AMM Beta', APY: 28.1, Avg: 28.4 },
    { name: 'RWA Gamma', APY: 24.3, Avg: 28.4 },
    { name: 'DeFi Options Delta', APY: 45.2, Avg: 28.4 },
    { name: 'Liquid Staking Epsilon', APY: 18.5, Avg: 28.4 },
    { name: 'Casper Stable Yield', APY: 12.2, Avg: 28.4 },
  ];

  // Yield vs Benchmarks
  const yieldComparisonData = useMemo(() => {
    const base = portfolioTimelineData;
    return base.map((item) => {
      const pVal = item.value;
      // create benchmarks relative to start
      const startVal = base[0].value;
      const progress = (pVal - startVal) / startVal;
      
      return {
        time: item.time,
        'Your Portfolio': pVal,
        'Lending Benchmark': Math.round(startVal * (1 + progress * 0.5)),
        'AMM Benchmark': Math.round(startVal * (1 + progress * 0.7)),
        'RWA Benchmark': Math.round(startVal * (1 + progress * 0.4)),
      };
    });
  }, [portfolioTimelineData]);

  // Rebalance history records
  const rebalanceHistoryRecords = [
    { id: '1', date: 'Jun 27 14:30', type: 'Auto', fromTo: 'Lending Alpha → AMM Beta', gain: '+2.4%', gas: '0.004 CSPR', status: 'Success', hash: '0x81da30f7b19283f124018274acfe719283ad1c12' },
    { id: '2', date: 'Jun 27 09:15', type: 'Auto', fromTo: 'AMM Beta → RWA Gamma', gain: '+1.1%', gas: '0.004 CSPR', status: 'Success', hash: '0x92fca30f7b19283f124018274acfe719283ad4e42' },
    { id: '3', date: 'Jun 26 22:00', type: 'Manual', fromTo: 'Deposit: Lending Alpha', gain: '—', gas: '0.003 CSPR', status: 'Success', hash: '0x3dfba30f7b19283f124018274acfe719283ad9c05' },
    { id: '4', date: 'Jun 26 18:45', type: 'Auto', fromTo: 'RWA Gamma → Lending Alpha', gain: '+0.8%', gas: '0.004 CSPR', status: 'Success', hash: '0x09da30f7b19283f124018274acfe719283adffaa' },
    { id: '5', date: 'Jun 25 11:20', type: 'Auto', fromTo: 'AMM Beta → DeFi Options', gain: '+3.1%', gas: '0.004 CSPR', status: 'Success', hash: '0x82da40f7b19283f124018274acfe719283adf821d' },
    { id: '6', date: 'Jun 24 16:10', type: 'Auto', fromTo: 'Lending Alpha → AMM Beta', gain: '-0.2%', gas: '0.004 CSPR', status: 'Success', hash: '0x55da30f7b19283f124018274acfe719283ade89a1' },
    { id: '7', date: 'Jun 23 08:30', type: 'Manual', fromTo: 'Withdrawal: AMM Beta', gain: '—', gas: '0.003 CSPR', status: 'Success', hash: '0x12fa30f7b19283f124018274acfe719283adcc7b1' },
    { id: '8', date: 'Jun 22 10:45', type: 'Auto', fromTo: 'Options → Lending Alpha', gain: '+1.4%', gas: '0.004 CSPR', status: 'Failed', hash: '0xeeea30f7b19283f124018274acfe719283ad0090' },
  ];

  // Filtered rebalances
  const filteredRebalances = useMemo(() => {
    return rebalanceHistoryRecords.filter((rec) => {
      if (rebalanceFilter === 'All') return true;
      if (rebalanceFilter === 'Auto') return rec.type === 'Auto';
      if (rebalanceFilter === 'Manual') return rec.type === 'Manual';
      if (rebalanceFilter === 'Success') return rec.status === 'Success';
      if (rebalanceFilter === 'Failed') return rec.status === 'Failed';
      return true;
    });
  }, [rebalanceFilter]);

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTxId(id);
    setTimeout(() => setCopiedTxId(null), 1500);
  };

  // Simulated export actions
  const [exportingReport, setExportingReport] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const handleExportPDF = () => {
    setExportingReport(true);
    setTimeout(() => {
      setExportingReport(false);
      alert('PDF Report generated successfully and downloading! (Portfolio_Performance_Report_June_2026.pdf)');
    }, 1500);
  };

  const handleDownloadCSV = () => {
    setDownloadingCsv(true);
    setTimeout(() => {
      setDownloadingCsv(false);
      
      // Simulate raw download trigger
      const headers = 'Date,Type,From_To,Gain,Gas_Cost,Status,Transaction_Hash\n';
      const rows = rebalanceHistoryRecords.map(r => 
        `"${r.date}","${r.type}","${r.fromTo}","${r.gain}","${r.gas}","${r.status}","${r.hash}"`
      ).join('\n');
      
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `CasperFlow_Rebalance_History_${dateRange}.csv`);
      a.click();
    }, 1000);
  };

  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const handleSharePerformance = () => {
    const text = `My CasperFlow AI yield agent is outperforming the market! 🚀 APY: ${stats.avgApy}%, Net Profit: +$${stats.netProfit} USD this month. Built on @Casper_Network with Odra Contract agents!`;
    navigator.clipboard.writeText(text);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
    alert(`Twitter/X performance template copied to clipboard:\n\n"${text}"`);
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] backdrop-blur-md bg-white/20 rounded-[32px] border border-white/30 text-center max-w-md mx-auto mt-6">
        <div className="w-16 h-16 rounded-full bg-[#7B61FF]/10 flex items-center justify-center text-[#7B61FF] mb-6 border border-[#7B61FF]/20 animate-pulse">
          <PieIcon size={32} />
        </div>
        <h3 className="text-lg font-display font-bold text-[#1A1A2E]">Connect Wallet to View Analytics</h3>
        <p className="text-xs text-secondary/70 mt-2 mb-6">
          Real-time on-chain portfolio diagnostics, historical returns and AI rebalancing telemetry are secured. Please unlock your wallet.
        </p>
        <button
          onClick={connect}
          className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-[#1A1A2E] hover:bg-black transition-all shadow-md shadow-[#1A1A2E]/20 flex items-center gap-2 cursor-pointer"
        >
          <HardDrive size={14} />
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Header (STEP 1) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#1A1A2E] tracking-tight">
            Portfolio Analytics
          </h1>
          <p className="text-sm text-secondary mt-0.5">
            Monitor autonomous agent intelligence, performance indices, and yield comparisons.
          </p>
        </div>

        {/* Date Range Selector & Actions (STEP 2) */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex bg-white/40 border border-white/50 p-1 rounded-2xl backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
            {(['24H', '7D', '30D', '90D', 'All Time'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  dateRange === range
                    ? 'bg-[#1A1A2E] text-white shadow-sm'
                    : 'text-secondary hover:text-[#1A1A2E] hover:bg-white/30'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="p-2.5 bg-white/45 hover:bg-white/75 border border-white/40 rounded-xl text-secondary hover:text-[#1A1A2E] transition-all cursor-pointer shadow-sm"
              title="Export Report PDF"
            >
              <Download size={14} className={exportingReport ? 'animate-bounce' : ''} />
            </button>
            <button
              onClick={handleSharePerformance}
              className="p-2.5 bg-white/45 hover:bg-white/75 border border-white/40 rounded-xl text-secondary hover:text-[#1A1A2E] transition-all cursor-pointer shadow-sm"
              title="Share Performance"
            >
              <Share2 size={14} className={copiedShareLink ? 'text-green-500' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* STEP 3 Portfolio Overview Bento Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Value */}
        <GlassCard className="p-4 flex flex-col justify-between h-28 border-white/40">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Total Value</span>
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={stats.totalValue}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-2xl font-display font-bold text-[#1A1A2E]"
              >
                ${stats.totalValue.toLocaleString()}
              </motion.div>
            </AnimatePresence>
            <span className="text-[10px] text-[#00C853] font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={12} /> +{stats.totalValueChange}% vs last period
            </span>
          </div>
        </GlassCard>

        {/* Card 2: Net Profit */}
        <GlassCard className="p-4 flex flex-col justify-between h-28 border-white/40">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Net Profit</span>
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={stats.netProfit}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-2xl font-display font-bold text-[#00C853]"
              >
                +${stats.netProfit}
              </motion.div>
            </AnimatePresence>
            <span className="text-[10px] text-[#00C853] font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={12} /> +{stats.netProfitChange}% vs last period
            </span>
          </div>
        </GlassCard>

        {/* Card 3: Average APY */}
        <GlassCard className="p-4 flex flex-col justify-between h-28 border-white/40">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Avg APY</span>
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={stats.avgApy}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-2xl font-display font-bold text-[#1A1A2E]"
              >
                {stats.avgApy}%
              </motion.div>
            </AnimatePresence>
            <span className={`text-[10px] font-semibold flex items-center gap-0.5 mt-0.5 ${stats.avgApyChange >= 0 ? 'text-[#00C853]' : 'text-red-500'}`}>
              {stats.avgApyChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {stats.avgApyChange >= 0 ? '+' : ''}{stats.avgApyChange}% vs last period
            </span>
          </div>
        </GlassCard>

        {/* Card 4: Rebalances */}
        <GlassCard className="p-4 flex flex-col justify-between h-28 border-white/40">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">Gas-optimized Rebalances</span>
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={stats.rebalancesCount}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-2xl font-display font-bold text-[#7B61FF]"
              >
                {stats.rebalancesCount}
              </motion.div>
            </AnimatePresence>
            <span className="text-[10px] text-secondary font-medium block mt-0.5">
              Autonomous Odra smart contracts executions
            </span>
          </div>
        </GlassCard>
      </div>

      {/* MAIN PORTFOLIO VALUE TIMELINE CHART (STEP 4) */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <GlassCard className="p-5 md:p-6 border-white/45">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A2E] flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-500" />
                Portfolio Asset Growth Index
              </h2>
              <p className="text-xs text-secondary">Timeline evaluation comparing real-time yield harvesting versus idle hold.</p>
            </div>

            {/* Hold comparison toggle */}
            <button
              onClick={() => setShowNoAgentLine(!showNoAgentLine)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                showNoAgentLine
                  ? 'bg-[#7B61FF]/10 border-[#7B61FF]/30 text-[#7B61FF]'
                  : 'bg-transparent border-black/10 text-secondary hover:bg-black/5'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showNoAgentLine ? 'bg-[#7B61FF]' : 'bg-gray-400'}`} />
              Show "Hold No Agent" Benchmark
            </button>
          </div>

          <div className="h-72 w-full">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-secondary font-semibold">Updating indexes...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioTimelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,26,46,0.04)" />
                  <XAxis 
                    dataKey="time" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#1A1A2E', opacity: 0.6, fontSize: '10px', fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#1A1A2E', opacity: 0.6, fontSize: '10px', fontWeight: 'bold' }} 
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(26, 26, 46, 0.95)',
                      border: 'none',
                      borderRadius: '16px',
                      color: 'white',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '11px', color: '#00D4FF' }}
                    itemStyle={{ fontSize: '10px', padding: '1px 0' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name="Your Portfolio"
                    stroke="#00D4FF" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#valueGrad)" 
                  />
                  {showNoAgentLine && (
                    <Line 
                      type="monotone" 
                      dataKey="noAgent" 
                      name="Hold (No Agent)"
                      stroke="#88889b" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={false} 
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>

      {/* MID SECTION: ALLOCATION DONUT (STEP 5) & APY PERFORMANCE BARS (STEP 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Left Allocation Donut (2 cols) */}
        <GlassCard className="lg:col-span-2 p-5 flex flex-col justify-between border-white/45">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A2E] flex items-center gap-1.5 mb-1">
              <PieIcon size={14} className="text-[#7B61FF]" />
              Current Asset Allocation
            </h3>
            <p className="text-xs text-secondary">Asset distribution across smart contract yield strategies.</p>
          </div>

          <div className="h-56 relative flex items-center justify-center my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(26, 26, 46, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '10px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Total value label in center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block leading-none">Capital</span>
              <span className="text-xl font-display font-bold text-[#1A1A2E] mt-1 block">
                ${stats.totalValue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Custom legend with pills */}
          <div className="flex flex-col gap-2 mt-2">
            {allocationDonutData.map((item) => (
              <div key={item.name} className="flex justify-between items-center bg-black/5 p-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-secondary">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-[#1A1A2E]">
                  {item.value}% (${((stats.totalValue * item.value) / 100).toLocaleString()})
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Right APY Grouped bar chart (3 cols) */}
        <GlassCard className="lg:col-span-3 p-5 border-white/45 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A2E] flex items-center gap-1.5 mb-1">
              <Percent size={14} className="text-[#00C853]" />
              APY Yield Driving Index
            </h3>
            <p className="text-xs text-secondary">Individual vault APY compared with total portfolio weighted average.</p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={poolApyComparisonData} margin={{ top: 10, right: -10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,26,46,0.04)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#1A1A2E', opacity: 0.6, fontSize: '9px', fontWeight: 'bold' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#1A1A2E', opacity: 0.6, fontSize: '10px', fontWeight: 'bold' }} 
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 46, 0.95)',
                    border: 'none',
                    borderRadius: '16px',
                    color: 'white',
                  }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Bar dataKey="APY" fill="#7B61FF" radius={[6, 6, 0, 0]} barSize={28}>
                  {poolApyComparisonData.map((entry, index) => {
                    const colors = ['#7B61FF', '#00D4FF', '#00C853', '#FF007A', '#FF9100', '#00C853'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
                <Line 
                  type="monotone" 
                  dataKey="Avg" 
                  name="Weighted Average"
                  stroke="#1A1A2E" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <span className="text-[10px] text-secondary font-medium mt-3 text-center block">
            *Dashed average shows the optimized threshold of {stats.avgApy}% APY.
          </span>
        </GlassCard>
      </div>

      {/* YIELD COMPARISON VS BENCHMARKS (STEP 9) */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <GlassCard className="p-5 border-white/45">
          <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A2E] flex items-center gap-1.5 mb-1">
              <Award size={14} className="text-[#FF9100]" />
              Agent outperformance vs Market Benchmarks
            </h3>
            <p className="text-xs text-secondary">Historical returns of your active agent compared to holding standard indexes.</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(26,26,46,0.04)" />
                <XAxis 
                  dataKey="time" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#1A1A2E', opacity: 0.6, fontSize: '10px', fontWeight: 'bold' }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#1A1A2E', opacity: 0.6, fontSize: '10px', fontWeight: 'bold' }} 
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 46, 0.95)',
                    border: 'none',
                    borderRadius: '16px',
                    color: 'white',
                  }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="Your Portfolio" stroke="#00D4FF" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Lending Benchmark" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="AMM Benchmark" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                <Line type="monotone" dataKey="RWA Benchmark" stroke="#E2E8F0" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* STEP 8: AGENT PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <GlassCard className="p-5 border-purple-500/20 bg-purple-500/[0.02]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[#7B61FF] uppercase tracking-wider block">Agent Intelligence</span>
              <h4 className="text-xl font-display font-bold text-[#1A1A2E] mt-2">Decisions Made</h4>
            </div>
            <Cpu className="text-[#7B61FF]" size={20} />
          </div>
          <div className="text-3xl font-display font-bold text-[#1A1A2E] mt-4">
            47 <span className="text-xs text-secondary font-medium">Rebalance checkouts</span>
          </div>
          <p className="text-xs text-secondary mt-2">
            Odra contract listeners actively evaluating on-chain events on Casper Network block intervals.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-green-500/20 bg-green-500/[0.01]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-[#00C853] uppercase tracking-wider block">Agent Intelligence</span>
              <h4 className="text-xl font-display font-bold text-[#1A1A2E] mt-2">Accuracy Rate</h4>
            </div>
            <Flame className="text-[#00C853]" size={20} />
          </div>
          <div className="text-3xl font-display font-bold text-[#1A1A2E] mt-4">
            89% <span className="text-xs text-secondary font-medium">(42/47 profitable)</span>
          </div>
          <p className="text-xs text-secondary mt-2">
            Only 5 rebalances executed as neutral/negative buffer adjustments for defensive capital protection.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-cyan-500/20 bg-cyan-500/[0.01] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider block">Agent Intelligence</span>
              <h4 className="text-xl font-display font-bold text-[#1A1A2E] mt-2">Gas Efficiency</h4>
            </div>
            <Clock className="text-cyan-500" size={20} />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-[#1A1A2E] mt-4">
              0.004 CSPR <span className="text-xs text-secondary font-medium">/ avg rebalance</span>
            </div>
            <div className="mt-2 bg-[#7B61FF]/10 text-[#7B61FF] text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-[#7B61FF]/10">
              💡 Outperformance: +12.4% earned vs manual holding!
            </div>
          </div>
        </GlassCard>
      </div>

      {/* STEP 7 Rebalance History list/table */}
      <GlassCard className="p-5 border-white/45">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A2E] flex items-center gap-1.5">
              <History size={14} className="text-secondary" />
              Rebalance Transaction Registry
            </h3>
            <p className="text-xs text-secondary">Historical ledger of the smart contract events processed on-chain.</p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap bg-white/40 border border-white/50 p-0.5 rounded-xl backdrop-blur-md">
            {(['All', 'Auto', 'Manual', 'Success', 'Failed'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setRebalanceFilter(filter)}
                className={`px-3 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                  rebalanceFilter === filter
                    ? 'bg-[#1A1A2E] text-white shadow-sm'
                    : 'text-secondary hover:text-[#1A1A2E] hover:bg-white/20'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable table container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-[9px] font-bold uppercase tracking-wider text-secondary opacity-70">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">From → To / Event</th>
                <th className="py-3 px-4 text-right">Yield Gain</th>
                <th className="py-3 px-4 text-right">Gas Limit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="text-xs font-medium text-[#1A1A2E]/80">
              {filteredRebalances.length > 0 ? (
                filteredRebalances.map((row) => {
                  const isExpanded = expandedRowId === row.id;
                  const isSuccess = row.status === 'Success';
                  
                  return (
                    <React.Fragment key={row.id}>
                      {/* Standard row */}
                      <tr 
                        onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                        className="border-b border-black/5 hover:bg-black/[0.015] hover:border-l-4 hover:border-l-[#00D4FF] transition-all cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono text-[10px] text-secondary">
                          {row.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            row.type === 'Auto' 
                              ? 'bg-purple-500/10 text-[#7B61FF]' 
                              : 'bg-blue-500/10 text-blue-600'
                          }`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#1A1A2E]">
                          {row.fromTo}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-bold ${
                          row.gain.startsWith('+') 
                            ? 'text-[#00C853]' 
                            : row.gain.startsWith('-') 
                              ? 'text-red-500' 
                              : 'text-secondary'
                        }`}>
                          {row.gain}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[10px] text-secondary">
                          {row.gas}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            isSuccess ? 'bg-[#00C853]' : 'bg-red-500'
                          }`} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="p-0 bg-black/[0.015]">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden px-4 py-4 border-b border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-secondary">Transaction Hash:</span>
                                    <span className="font-mono text-[10px] bg-white border px-2 py-0.5 rounded-md text-secondary">
                                      {row.hash}
                                    </span>
                                    <button
                                      onClick={() => handleCopyHash(row.hash, row.id)}
                                      className="p-1 hover:bg-black/5 rounded cursor-pointer transition-colors"
                                      title="Copy Tx Hash"
                                    >
                                      {copiedTxId === row.id ? (
                                        <Check size={12} className="text-green-500" />
                                      ) : (
                                        <Copy size={12} className="text-secondary" />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-[10px] text-secondary mt-1">
                                    Contracts targets: Odra dynamic router proxy • Verified and secured on Casper Flow blocks.
                                  </p>
                                </div>

                                <a
                                  href={`https://testnet.cspr.live/deploy/${row.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-white border hover:bg-black/5 rounded-lg text-[10px] font-bold text-[#1A1A2E] flex items-center gap-1 transition-all"
                                >
                                  View on CSpr.live
                                </a>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-secondary">
                    No transactions matching filter "{rebalanceFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Export trigger helper */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleDownloadCSV}
            className="px-3 py-1.5 bg-transparent border border-black/10 hover:bg-black/5 rounded-xl text-[10px] font-bold text-secondary flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Download size={12} />
            Download raw CSV Ledger
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
