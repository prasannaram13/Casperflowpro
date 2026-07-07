import React, { useState, useEffect } from 'react';
import { Wallet, FileSignature, HardDrive, Mail, X, ArrowRight, AlertTriangle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

interface CsprClickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProvider: (provider: string) => Promise<void>;
}

export const CsprClickModal: React.FC<CsprClickModalProps> = ({
  isOpen,
  onClose,
  onSelectProvider,
}) => {
  const { } = useApp();
  const [isWalletDetected, setIsWalletDetected] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      const detected = typeof window !== 'undefined' && (
        !!window.CasperWalletProvider || 
        !!window.casperWalletHelper || 
        (window as any).casperWallet || 
        (window as any).casperDash
      );
      setIsWalletDetected(!!detected);
    }
  }, [isOpen]);

  const providers = [
    {
      id: 'Casper Wallet',
      name: 'Casper Wallet',
      description: 'The standard self-custody browser extension',
      icon: Wallet,
      tag: 'Recommended',
      color: 'from-[#7B61FF]/20 to-[#00D4FF]/10',
      borderColor: 'border-[#7B61FF]/30 hover:border-[#00D4FF]/60',
      iconColor: 'text-[#7B61FF]',
    },
    {
      id: 'Casper Signer',
      name: 'Casper Signer',
      description: 'Legacy desktop signing tool',
      icon: FileSignature,
      tag: 'Legacy',
      color: 'from-blue-500/10 to-cyan-500/5',
      borderColor: 'border-blue-500/20 hover:border-blue-500/50',
      iconColor: 'text-blue-500',
    },
    {
      id: 'Ledger',
      name: 'Ledger',
      description: 'Secure hardware cold storage key manager',
      icon: HardDrive,
      tag: 'High Security',
      color: 'from-green-500/10 to-emerald-500/5',
      borderColor: 'border-green-500/20 hover:border-green-500/50',
      iconColor: 'text-green-500',
    },
    {
      id: 'Torus',
      name: 'Torus (Google / Email)',
      description: 'Social web-wallet with Google or email auth',
      icon: Mail,
      tag: 'Social Login',
      color: 'from-[#FF007A]/10 to-[#FF9100]/5',
      borderColor: 'border-[#FF007A]/20 hover:border-[#FF007A]/50',
      iconColor: 'text-[#FF007A]',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1A2E]/60 backdrop-blur-md"
            id="cspr-click-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden bg-white/70 border border-white/50 backdrop-blur-[30px] rounded-[32px] p-6 shadow-2xl z-50"
            id="cspr-click-modal"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#1A1A2E] flex items-center justify-center text-white text-[10px] font-bold">
                    C
                  </div>
                  <h3 className="text-lg font-display font-bold text-[#1A1A2E]" id="cspr-modal-title">
                    CSPR.click Wallet Portal
                  </h3>
                </div>
                <p className="text-xs text-secondary mt-1">
                  Connect your preferred Casper Network secure account.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer text-[#1A1A2E]"
                id="cspr-close-btn"
              >
                <X size={16} />
              </button>
            </div>



            {/* Wallet Detection Warning inside Modal */}
            {!isWalletDetected && (
              <div className="mb-4 p-4 rounded-2xl bg-red-500/[0.04] border border-red-500/15 text-xs text-red-800 leading-relaxed space-y-2">
                <div className="flex gap-2 font-bold items-center">
                  <AlertTriangle size={16} className="text-red-600 animate-pulse" />
                  <span>Casper Wallet Extension Not Detected</span>
                </div>
                <p className="text-[11px] leading-normal text-secondary">
                  No compatible Casper extension was detected in this browser. To authorize securely, please install the official wallet or connect with Torus.
                </p>
                <a
                  href="https://casperwallet.io/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-[#7B61FF] hover:underline cursor-pointer"
                >
                  <Download size={12} />
                  <span>Download Casper Wallet</span>
                </a>
              </div>
            )}

            {/* Wallet Selection Grid */}
            <div className="flex flex-col gap-3">
              {providers.map((p) => {
                const IconComp = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProvider(p.id)}
                    className={`group w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r ${p.color} border ${p.borderColor} text-left transition-all cursor-pointer`}
                    id={`cspr-provider-btn-${p.id.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-white/80 ${p.iconColor} shadow-sm group-hover:scale-105 transition-transform`}>
                        <IconComp size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1A1A2E]">
                            {p.name}
                          </span>
                          {p.tag && (
                            <span className="text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-[#1A1A2E]/5 text-secondary">
                              {p.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-secondary mt-0.5 line-clamp-1">
                          {p.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-[#1A1A2E]/40 group-hover:translate-x-1 group-hover:text-[#1A1A2E] transition-all" />
                  </button>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="mt-5 pt-4 border-t border-[#1A1A2E]/5 text-center">
              <p className="text-[10px] text-secondary/70">
                New to Casper?{' '}
                <a
                  href="https://casperwallet.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#7B61FF] hover:underline"
                >
                  Create Casper Wallet
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
