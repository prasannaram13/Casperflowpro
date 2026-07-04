/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { ClickProvider, ClickUI, ThemeModeType, buildTheme, DefaultThemes } from '@make-software/csprclick-ui';
import { ThemeProvider } from 'styled-components';
import { CONTENT_MODE } from '@make-software/csprclick-core-types';
import { TopBar } from './components/TopBar';
import { RebalanceProposalModal } from './components/RebalanceProposalModal';
import { LogsConsoleModal } from './components/LogsConsoleModal';
import { DefiPoolsPage } from './components/DefiPoolsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { AgentTerminal } from './components/AgentTerminal';
import { LandingPage } from './components/LandingPage';
import { ContractPage } from './components/ContractPage';
import { SettingsPage } from './components/SettingsPage';
import { ToastContainer } from './components/ToastContainer';
import { TransactionProducerModal } from './components/TransactionProducerModal';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, HardDrive, Cpu } from 'lucide-react';

function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const { activeTab, selectedCategory, setSelectedCategory, isConnected, connect } = useApp();

  if (!isConnected) {
    return <LandingPage connect={connect} />;
  }

  return (
    <div className="relative min-h-screen p-4 md:p-6 lg:p-8 flex flex-col justify-between max-w-7xl mx-auto">
      
      {/* Mesh Lights */}
      <div className="mesh-bubble-1" />
      <div className="mesh-bubble-2" />

      <div className="flex flex-col gap-6">
        {/* Top Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-40"
        >
          <TopBar
            onSearchChange={setSearchQuery}
          />
        </motion.div>

        {/* Master Workspace Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Side floating menu */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full lg:w-20 shrink-0 self-stretch relative z-20"
          >
            <Sidebar />
          </motion.aside>

          {/* Core Interactive Area */}
          <div className="flex-1 w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'pools' && (
                <motion.div
                  key="pools"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.99 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="w-full"
                >
                  <DefiPoolsPage />
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.99 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="w-full"
                >
                  <AnalyticsPage />
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.99 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="w-full"
                >
                  <AgentTerminal />
                </motion.div>
              )}

              {activeTab === 'contract' && (
                <motion.div
                  key="contract"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.99 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="w-full"
                >
                  <ContractPage />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.99 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="w-full"
                >
                  <SettingsPage />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer Network metadata lines */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-10 pt-4 border-t border-black/5 text-xs flex flex-col sm:flex-row justify-between items-center gap-3 text-secondary font-medium"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#00C853]" />
          <span>Casper Smart Contract hashes: Deployed & Active</span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-1">
            <Cpu size={12} className="text-[#7B61FF]" /> Node: Testnet-4
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <HardDrive size={12} className="text-[#00D4FF]" /> Block: #4,231,009
          </span>
          <span>•</span>
          <span>Gas Limit: 0.0001 CSPR</span>
        </div>
      </motion.footer>

      {/* Modals */}
      <RebalanceProposalModal />
      <LogsConsoleModal />
      <ToastContainer />
      <TransactionProducerModal />
    </div>
  );
}

const isIframeMode = typeof window !== 'undefined' && window.self !== window.top;

const clickOptions = {
  appName: 'CasperFlow',
  appId: 'casperflow-agent',
  contentMode: isIframeMode ? CONTENT_MODE.IFRAME : CONTENT_MODE.POPUP,
  providers: [
    'casper-wallet',
    'ledger',
    'metamask-snap',
    'casperdash',
    'google',
    'apple'
  ],
};

const clickTheme = buildTheme(DefaultThemes.csprclick);

export default function App() {
  return (
    <ThemeProvider theme={clickTheme.dark}>
      <ClickProvider options={clickOptions}>
        <ClickUI themeMode={ThemeModeType.dark} />
        <AppProvider>
          <DashboardContent />
        </AppProvider>
      </ClickProvider>
    </ThemeProvider>
  );
}
