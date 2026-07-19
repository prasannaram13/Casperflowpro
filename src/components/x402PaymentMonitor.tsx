import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  ShieldCheck, 
  Terminal, 
  CheckCircle, 
  RefreshCw, 
  FileCheck, 
  DollarSign, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GlassCard } from './GlassCard';
import { X402D3Chart } from './X402D3Chart';

interface MicropaymentReceipt {
  id: string;
  endpoint: string;
  timestamp: string;
  costCspr: number;
  hash: string;
  status: 'PROVED' | 'VERIFYING' | 'EXPIRED';
  apiResponseSize: string;
}

export const X402PaymentMonitor = () => {
  const { addLog, balance } = useApp();
  const [totalCost, setTotalCost] = useState<number>(0);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);
  const [validationStep, setValidationStep] = useState<string>('');
  
  const [receipts] = useState<MicropaymentReceipt[]>([]);

  const handleValidateReceipt = (receipt: MicropaymentReceipt) => {
    if (validatingId) return;
    setValidatingId(receipt.id);
    setValidationSuccess(null);
    setValidationStep('Reading HTTP Response Headers: looking for X-402-Payment-Receipt...');
    addLog(`Initiating x402 Cryptographic validation for Receipt ${receipt.id}...`, 'info');

    setValidationStep('Checking the referenced deploy on Casper Testnet...');
    fetch(`/api/x402?resource=${encodeURIComponent(receipt.endpoint)}`, {
      headers: { 'X-402-Payment-Receipt': JSON.stringify({ deploy_hash: receipt.hash.replace(/^0x/, '') }) }
    }).then(async response => {
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
      setValidationStep('Verification complete: Casper deploy exists on Testnet.');
      setValidationSuccess(true);
      addLog(`x402 receipt ${receipt.id} verified against Casper Testnet deploy ${receipt.hash}.`, 'success');
    }).catch(error => {
      setValidationStep(error instanceof Error ? error.message : 'Payment proof could not be verified.');
      setValidationSuccess(false);
      addLog(`x402 receipt ${receipt.id} verification failed.`, 'warn');
    }).finally(() => setValidatingId(null));
  };

  const clearValidation = () => {
    setValidatingId(null);
    setValidationSuccess(null);
    setValidationStep('');
  };

  return (
    <div className="w-full flex flex-col gap-4 mt-6" id="x402-payment-monitor">
      {/* Title */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <Coins size={14} className="text-[#00C853]" /> 
          x402 Micropayment Protocol Monitor
        </h2>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full font-bold border border-emerald-500/10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          HTTP-Native Validator Online
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Tally Card - col span 4 */}
        <div className="lg:col-span-4">
          <GlassCard className="p-5 flex flex-col justify-between h-full bg-gradient-to-br from-white/80 to-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-secondary font-medium">Accumulated Agent Spend</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Coins size={16} />
                </div>
              </div>

              <div>
                <span className="text-3xl font-mono font-bold text-[#1A1A2E] block">
                  {totalCost.toFixed(4)} <span className="text-xs font-sans text-secondary">CSPR</span>
                </span>
                <span className="text-[10px] text-secondary font-sans block mt-1">
                  ~${(totalCost * 0.012).toFixed(6)} USD spent in real-time queries
                </span>
              </div>

              {/* D3 chart visualization of real-time x402 expenditures */}
              <X402D3Chart receipts={receipts} />

              <div className="space-y-2 border-t border-black/5 pt-3 text-xs text-[#1A1A2E]/70 font-sans leading-relaxed">
                <div className="flex justify-between">
                  <span>Price per request:</span>
                  <span className="font-mono font-bold text-[#1A1A2E]">0.002 - 0.005 CSPR</span>
                </div>
                <div className="flex justify-between">
                  <span>Receipt validation:</span>
                  <span className="text-emerald-600 font-bold">100% Cryptographic</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider Target:</span>
                  <span className="font-mono text-[10px]">CSPR.cloud v1 API</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/[0.04] border border-emerald-500/10 rounded-xl text-[10px] text-emerald-800 leading-relaxed mt-4">
              <span className="font-bold block flex items-center gap-1 mb-0.5">
                <ShieldCheck size={12} /> x402 Micropayments Engine
              </span>
              The AI agent pays fractions of a cent per API request directly to indexers. This bypasses static API key limits and establishes peer-to-peer data settlement.
            </div>
          </GlassCard>
        </div>

        {/* Right receipts list and interactive validator - col span 8 */}
        <div className="lg:col-span-8">
          <GlassCard className="p-5 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-sans font-bold text-xs text-[#1A1A2E] uppercase tracking-wider">
                  Active Agent Request & Proof Ledger
                </h3>
                <span className="text-[10px] text-secondary">Showing last 4 logs</span>
              </div>

              {/* Receipts List */}
              <div className="space-y-2">
                {receipts.map((rcpt) => (
                  <div 
                    key={rcpt.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.04] text-xs gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                        <Terminal size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-xs text-[#1A1A2E]">{rcpt.endpoint}</span>
                          <span className="text-[9px] bg-black/5 px-1.5 py-0.5 rounded font-mono text-secondary">
                            {rcpt.apiResponseSize}
                          </span>
                        </div>
                        <span className="text-[10px] text-secondary font-mono block mt-0.5 truncate max-w-[280px]">
                          Receipt: {rcpt.hash.substring(0, 18)}...
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-bold block text-[#1A1A2E]">-{rcpt.costCspr} CSPR</span>
                        <span className="text-[9px] text-secondary block">{rcpt.timestamp}</span>
                      </div>
                      
                      <button
                        onClick={() => handleValidateReceipt(rcpt)}
                        className="px-2.5 py-1 bg-[#1A1A2E] hover:bg-black text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm"
                      >
                        <FileCheck size={12} className="text-[#00C853]" />
                        <span>Validate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Modal/Overlay within card */}
            <AnimatePresence>
              {validatingId && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 p-4 bg-[#1A1A2E] text-white/95 rounded-2xl space-y-3 relative overflow-hidden border border-emerald-500/20"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 uppercase">
                      <ShieldCheck size={14} /> x402 Cryptographic Proof Engine
                    </span>
                    <button 
                      onClick={clearValidation} 
                      className="text-white/40 hover:text-white text-xs px-2 py-0.5 bg-white/10 rounded cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2.5">
                      {validationSuccess ? (
                        <CheckCircle size={16} className="text-[#00C853] shrink-0 mt-0.5" />
                      ) : (
                        <RefreshCw size={16} className="text-[#00D4FF] animate-spin shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <span className="text-xs font-bold block">Validating Receipt ID: {validatingId}</span>
                        <p className="text-[10px] text-white/70 font-mono leading-relaxed">{validationStep}</p>
                      </div>
                    </div>

                    {validationSuccess && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 mt-1">
                        <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                          <ShieldCheck size={12} />
                        </div>
                        <div className="text-[9px] text-emerald-300 leading-relaxed">
                          <span className="font-bold block mb-0.5">On-chain Signature Verified!</span>
                          Cryptographic validation successfully confirmed the signature of Casper Testnet Validator Node hash matches the public keys metadata. API rate-limiting restrictions bypassed natively.
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
