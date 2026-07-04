import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { 
  Wallet, 
  ChevronDown, 
  Eye, 
  Copy, 
  LogOut, 
  Check, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ConnectButton = () => {
  const { 
    isConnected, 
    account, 
    balance, 
    connect, 
    disconnect, 
    walletProvider, 
    truncatedAddress 
  } = useWallet();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && account) {
    return (
      <div className="relative" id="cspr-wallet-container">
        {/* CONNECTED STATE: Glass pill, cyan border, green dot */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-cyan-400/40 text-[#1A1A2E] text-xs font-semibold hover:border-cyan-400/70 transition-all shadow-[0_4px_20px_rgba(0,212,255,0.06)] cursor-pointer"
          id="cspr-connected-btn"
        >
          <div className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
          <span className="font-mono">{truncatedAddress}</span>
          <span className="opacity-40">|</span>
          <span className="font-bold text-[#1A1A2E]">{parseFloat(balance).toLocaleString()} CSPR</span>
          <ChevronDown size={14} className={`opacity-60 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* DROPDOWN MENU */}
        <AnimatePresence>
          {dropdownOpen && (
            <>
              {/* Click outside backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-56 backdrop-blur-[35px] bg-white/90 border border-white/50 rounded-2xl p-2 shadow-xl z-50 overflow-hidden"
                id="cspr-wallet-dropdown"
              >
                {/* Header indicating provider */}
                <div className="px-3 py-1.5 text-[9px] text-secondary font-bold tracking-wider uppercase border-b border-black/5 flex justify-between items-center">
                  <span>Connected Wallet</span>
                  <span className="text-[8px] bg-cyan-500/10 text-cyan-600 px-1.5 py-0.5 rounded-md font-bold">
                    {walletProvider || 'CSPR.click'}
                  </span>
                </div>

                <div className="p-1 flex flex-col gap-0.5 mt-1">
                  {/* Option 1: View on Explorer */}
                  <a
                    href={`https://testnet.cspr.live/account/${account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs text-[#1A1A2E] hover:bg-black/5 rounded-xl transition-all font-medium cursor-pointer"
                    id="cspr-dropdown-explorer"
                  >
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-secondary/70" />
                      <span>View on Explorer</span>
                    </div>
                    <ExternalLink size={10} className="text-secondary/40" />
                  </a>

                  {/* Option 2: Copy Address */}
                  <button
                    onClick={handleCopyAddress}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#1A1A2E] hover:bg-black/5 rounded-xl transition-all font-medium cursor-pointer text-left"
                    id="cspr-dropdown-copy"
                  >
                    <div className="flex items-center gap-2">
                      <Copy size={14} className="text-secondary/70" />
                      <span>Copy Address</span>
                    </div>
                    {copied ? (
                      <Check size={12} className="text-green-500" />
                    ) : (
                      <span className="text-[10px] text-secondary/40 font-mono">CSPR</span>
                    )}
                  </button>

                  {/* Faucet Link */}
                  <a
                    href="https://testnet.cspr.live/tools/faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 rounded-xl transition-all font-semibold cursor-pointer"
                    id="cspr-dropdown-faucet"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Get Free Testnet CSPR</span>
                    </div>
                    <ExternalLink size={10} className="text-amber-500" />
                  </a>

                  {/* Option 3: Disconnect */}
                  <button
                    onClick={() => {
                      disconnect();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all font-semibold text-left cursor-pointer"
                    id="cspr-dropdown-disconnect"
                  >
                    <LogOut size={14} className="text-red-500" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    /* DISCONNECTED STATE: White pill, dark text, subtle border glow */
    <button
      onClick={connect}
      className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#1A1A2E] text-xs font-bold border border-white/80 shadow-[0_0_12px_rgba(255,255,255,0.45)] hover:shadow-[0_0_16px_rgba(255,255,255,0.6)] hover:bg-gray-50 active:scale-98 transition-all cursor-pointer"
      id="cspr-connect-btn"
    >
      <Wallet size={14} />
      <span>Connect</span>
    </button>
  );
};
