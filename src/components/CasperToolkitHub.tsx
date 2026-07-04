import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { GlassCard } from './GlassCard';
import { 
  Coins, 
  Server, 
  Wallet, 
  Cloud, 
  FileCode2, 
  Cpu, 
  ArrowUpRight, 
  MessageSquare, 
  Terminal, 
  Activity, 
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface ToolDetails {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  status: 'Connected' | 'Active' | 'Secure' | 'Syncing' | 'Listening';
  statusColor: string;
  description: string;
  useCase: string;
  codeSample: string;
  aiPrompt: string;
}

export const CasperToolkitHub = () => {
  const { setActiveTab, sendChatMessage, addLog } = useApp();
  const [activeToolId, setActiveToolId] = useState<string>('odra');

  const toolkit: ToolDetails[] = [
    {
      id: 'x402',
      name: 'x402 Micropayments',
      tagline: 'HTTP-Native Payment Protocol',
      icon: Coins,
      status: 'Connected',
      statusColor: 'text-[#00C853] bg-[#00C853]/10',
      description: 'The x402 Micropayments protocol enables autonomous AI agents to pay per API request using Casper-native micro-transfers with cryptographic receipt proof.',
      useCase: 'CasperFlow’s background agent utilizes x402 headers to pay for premium real-time DeFi oracle aggregations and node indexing. Instead of monthly subscriptions, the agent pays fractions of a cent per on-chain query directly to data providers.',
      codeSample: `// x402 Micropayments HTTP Header Integration
const headers = {
  "X-402-Payment-Required": "true",
  "X-402-Payment-Receipt": "tx-hash-019f0c65-8223-7f30-a82d-57cb90e31feb",
  "Authorization": "Bearer " + process.env.CSPR_CLOUD_API_KEY
};
const response = await fetch("https://api.cspr.cloud/v1/pools/oracle", { headers });`,
      aiPrompt: 'Explain how x402 Micropayments protect APIs and how CasperFlow integrates them for agent-to-agent transactions.'
    },
    {
      id: 'mcp',
      name: 'MCP Servers',
      tagline: 'Model Context Protocol Integrator',
      icon: Server,
      status: 'Active',
      statusColor: 'text-[#7B61FF] bg-[#7B61FF]/10',
      description: 'Model Context Protocol (MCP) servers (Casper MCP, CSPR.trade MCP) provide our Gemini model with direct, secure context injection and on-chain action interfaces.',
      useCase: 'Enables our Gemini model to query live accounts, read contract states, and suggest trades by interacting with standardized JSON-RPC bridges, bypassing fragile bespoke web scrapers.',
      codeSample: `// Casper MCP Server Schema Definition
{
  "name": "casper-query-balance",
  "description": "Queries Casper balance of a public key via MCP JSON-RPC",
  "input_schema": {
    "type": "object",
    "properties": {
      "publicKey": { "type": "string" }
    },
    "required": ["publicKey"]
  }
}`,
      aiPrompt: 'How do Casper MCP and CSPR.trade MCP servers provide the AI Agent with secure, direct read-write access to the blockchain?'
    },
    {
      id: 'click',
      name: 'CSPR.click AI Agent Skill',
      tagline: 'Cryptographic Wallet & Signer Skill',
      icon: Wallet,
      status: 'Secure',
      statusColor: 'text-[#00D4FF] bg-[#00D4FF]/10',
      description: 'The CSPR.click AI Agent Skill provides seamless user onboarding, wallet creation, and standard browser extension transaction signing.',
      useCase: 'Integrated inside our front-end, allowing you to connect via Google W3A or Casper Wallet, restoring session data, and safely requesting signatures whenever the agent suggests an Odra contract rebalance.',
      codeSample: `// CSPR.click Event Handler for Handshake & Signature
window.addEventListener('csprclick:signed_in', async (event) => {
  const activeAccount = await clickRef.getActiveAccountAsync({ withBalance: true });
  setAccount(activeAccount.publicKey);
  setBalance(activeAccount.balance / 1e9);
});`,
      aiPrompt: 'Describe how CSPR.click enables safe, non-custodial transaction authorization for the CasperFlow yield agent.'
    },
    {
      id: 'cloud',
      name: 'CSPR.cloud APIs',
      tagline: 'Enterprise-Grade Middleware & Indexer',
      icon: Cloud,
      status: 'Syncing',
      statusColor: 'text-amber-500 bg-amber-500/10',
      description: 'Enterprise middleware providing REST, Streaming, and event node logs. Allows fast indexing and retrieval of account histories and balance changes.',
      useCase: 'Powers the background synchronization of user assets, fetches real-time pool TVL parameters, and tracks yield trends dynamically to inform our AI logic.',
      codeSample: `// Fetching account details using authenticated CSPR.cloud API
const url = "https://api.testnet.cspr.cloud/accounts/" + pubKey;
const response = await fetch(url, {
  headers: { "X-API-KEY": process.env.CSPR_CLOUD_API_KEY }
});
const data = await response.json();
const balance = data.balance / 1e9;`,
      aiPrompt: 'How does CSPR.cloud REST and Streaming APIs fuel the real-time intelligence of the CasperFlow dashboard?'
    },
    {
      id: 'odra',
      name: 'Odra Framework',
      tagline: 'DeFi Smart Contract Framework',
      icon: FileCode2,
      status: 'Listening',
      statusColor: 'text-pink-500 bg-pink-500/10',
      description: 'The premier smart contract framework for Casper. Odra allows developer-friendly Rust code compilation, testing, and built-in support for llms.txt.',
      useCase: 'Powers our on-chain Yield Router Proxy contract. When a rebalance is approved, it sends transactions directly targeting our deployed Odra module to shift liquidity pools autonomously.',
      codeSample: `// Odra Smart Contract Definition snippet in Rust
#[odra::module]
pub struct YieldRouter {
    min_rebalance_interval: Var<u32>,
    allocations: Mapping<String, u32>,
}
#[odra::module_impl]
impl YieldRouter {
    pub fn rebalance(&mut self, pool: String, amount: Balance) {
        // Safe pool transfer logic
    }
}`,
      aiPrompt: 'Explain how the Odra Framework makes smart contract development on Casper safe, elegant, and perfectly structured for AI agents.'
    }
  ];

  const handleConsultAI = async (prompt: string, toolName: string) => {
    addLog(`Redirecting to AI Agent with prompt regarding ${toolName}...`, 'info');
    setActiveTab('chat');
    // Allow animation to complete before calling sendChatMessage
    setTimeout(async () => {
      await sendChatMessage(prompt);
    }, 300);
  };

  const activeTool = toolkit.find(t => t.id === activeToolId) || toolkit[0];

  return (
    <div className="w-full flex flex-col gap-4 mt-6" id="casper-toolkit-hub">
      {/* Title */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
          <Cpu size={14} className="text-[#7B61FF]" /> 
          Casper AI Toolkit & Developer Resources
        </h2>
        <span className="text-[10px] bg-gradient-to-tr from-[#7B61FF]/10 to-[#00D4FF]/10 text-[#7B61FF] px-2.5 py-1 rounded-full font-bold border border-[#7B61FF]/10">
          Agent Companion Hub
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Buttons / Hub Grid - col span 5 */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          {toolkit.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === activeToolId;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveToolId(tool.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A2E] text-white border-transparent shadow-[0_4px_20px_rgba(123,97,255,0.2)]'
                    : 'bg-white/40 hover:bg-white/70 text-[#1A1A2E] border-white/40 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/10 text-[#00D4FF]' : 'bg-[#7B61FF]/10 text-[#7B61FF]'}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="font-sans font-bold text-xs block">{tool.name}</span>
                    <span className={`text-[9px] font-mono block ${isActive ? 'text-white/60' : 'text-secondary font-medium'}`}>
                      {tool.tagline}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`text-[8px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${tool.statusColor}`}>
                    {tool.status}
                  </span>
                  <ArrowUpRight size={12} className={isActive ? 'text-white/40' : 'text-[#1A1A2E]/30'} />
                </div>
              </button>
            );
          })}

          <div className="p-3.5 rounded-2xl bg-indigo-500/[0.04] border border-indigo-500/10 text-[10px] text-indigo-800 leading-relaxed mt-1 flex gap-2">
            <HelpCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Developer Notice</span>
              The Casper AI Developer Toolkit provides the foundational blocks for secure, high-scale, HTTP-native autonomous systems. Click any tool to view its codebase structure, usage context, and invoke the AI Consultant.
            </div>
          </div>
        </div>

        {/* Right Side: Active Tool Details Console - col span 7 */}
        <div className="lg:col-span-7">
          <GlassCard className="p-5 flex flex-col justify-between h-full relative overflow-hidden">
            {/* Background graphics */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-tr from-[#7B61FF]/5 to-[#00D4FF]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-black/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-[#7B61FF] to-[#00D4FF] text-white">
                    {React.createElement(activeTool.icon, { size: 16 })}
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#1A1A2E] flex items-center gap-2">
                      {activeTool.name}
                      <span className="text-[10px] text-secondary font-mono">({activeTool.tagline})</span>
                    </h3>
                    <p className="text-[10px] text-secondary">
                      Active Integration Layer • Status: <span className="font-bold">{activeTool.status}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[9px] font-mono bg-black/5 text-[#1A1A2E] px-2 py-0.5 rounded">
                  {activeTool.id.toUpperCase()}_MOD
                </span>
              </div>

              {/* Description & Use Case */}
              <div className="space-y-2.5 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[#1A1A2E]/50 uppercase tracking-wider block">Description</span>
                  <p className="text-[#1A1A2E] leading-relaxed font-sans">{activeTool.description}</p>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-black/[0.03]">
                  <span className="text-[9px] font-bold text-[#1A1A2E]/50 uppercase tracking-wider block">Use-Case in CasperFlow</span>
                  <p className="text-secondary leading-relaxed font-sans italic">{activeTool.useCase}</p>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="space-y-1.5 pt-2 border-t border-black/[0.03]">
                <div className="flex justify-between items-center text-[9px] text-[#1A1A2E]/50 uppercase tracking-wider font-bold">
                  <span>Integration Reference Code</span>
                  <span className="font-mono text-[8px] bg-black/5 px-1.5 py-0.5 rounded">
                    {activeTool.id === 'odra' ? 'Rust' : 'TypeScript'}
                  </span>
                </div>
                <div className="p-3 bg-[#1A1A2E] text-white/90 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto shadow-inner border border-white/5 max-h-[140px] scrollbar-thin">
                  <pre>{activeTool.codeSample}</pre>
                </div>
              </div>
            </div>

            {/* Footer Interactive Actions */}
            <div className="flex gap-2 pt-4 mt-4 border-t border-black/5">
              <button
                onClick={() => handleConsultAI(activeTool.aiPrompt, activeTool.name)}
                className="flex-1 py-2.5 bg-[#1A1A2E] hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <MessageSquare size={14} className="text-[#00D4FF]" />
                <span>Ask AI Agent about {activeTool.name}</span>
              </button>
              
              <a 
                href="https://www.casper.network/ai" 
                target="_blank" 
                referrerPolicy="no-referrer"
                className="px-4 py-2.5 bg-white border border-black/10 hover:bg-gray-50 text-secondary hover:text-[#1A1A2E] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <BookOpen size={14} />
                <span>Docs</span>
              </a>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
