import { useApp } from '../context/AppContext';

export const useWallet = () => {
  const { account, balance, isConnected, connect, disconnect, walletProvider, isIframe } = useApp();
  
  // Format Casper public key: 017a3f...8e2d
  const truncatedAddress = account 
    ? `${account.slice(0, 6)}...${account.slice(-4)}` 
    : '';

  return {
    account,
    balance: balance.toLocaleString(),
    isConnected,
    connect,
    disconnect,
    walletProvider,
    truncatedAddress,
    isIframe
  };
};
