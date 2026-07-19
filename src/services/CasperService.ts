/**
 * @file CasperService.ts
 * @package CasperFlow Production-ready Casper Network Investment & Transaction Service
 * @description Provides robust on-chain interaction including validation, transaction building, 
 * signing, broadcasting via JSON-RPC, and polling status check-loops.
 */

export class CasperService {
  private nodeUrl: string;
  private contractHash: string;

  constructor(
    nodeUrl = 'https://node.testnet.casper.network/rpc',
    contractHash = ''
  ) {
    this.nodeUrl = nodeUrl;
    this.contractHash = contractHash;
  }

  /**
   * Validates state before compiling/broadcasting a transaction
   */
  public async validateInvestment(
    account: string | null,
    amountCSPR: number,
    poolId: string
  ): Promise<{ valid: boolean; reason?: string }> {
    if (!account) {
      return { valid: false, reason: 'Please connect your CSPR wallet (CSPR.click) first.' };
    }
    if (isNaN(amountCSPR) || amountCSPR <= 0) {
      return { valid: false, reason: 'Investment amount must be a positive integer above zero.' };
    }
    
    try {
      // Query Casper Cloud or live Node RPC to verify real-time balance
      const response = await fetch(`/api/casper/balance/${account}`);
      if (response.ok) {
        const data = await response.json();
        const balance = Number(data.balance) || 0;
        if (balance < amountCSPR + 4) { // Deposit amount + 4 CSPR estimated gas buffer
          return { 
            valid: false, 
            reason: `Insufficient balance on-chain. Current: ${balance.toFixed(2)} CSPR. Required: ${amountCSPR} CSPR + 4 CSPR gas fee.` 
          };
        }
      }
    } catch (e) {
      console.log('[CasperService] Network balance bypass: proceeding with client-side signature handshake');
    }

    return { valid: true };
  }

  /**
   * Dispatches a signed deploy payload to Casper Testnet RPC node via the Express backend
   */
  public async broadcastDeploy(signedDeploy: any): Promise<string> {
    console.log('EXACT PAYLOAD SENT TO BACKEND:', JSON.stringify(signedDeploy, null, 2));
    const response = await fetch('/api/casper/put-deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signedDeploy)
    });
    
    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) {
          message = errJson.error;
          if (errJson.details && Array.isArray(errJson.details)) {
            message += ` Details: ${errJson.details.join(' | ')}`;
          }
        }
      } catch (e) {
        const rawText = await response.text().catch(() => '');
        if (rawText) {
          message += `: ${rawText}`;
        }
      }
      throw new Error(message);
    }
    
    const data = await response.json();
    if (data && data.deployHash) {
      console.log('[CasperService] Broadcast success, deploy hash:', data.deployHash);
      return data.deployHash;
    }
    throw new Error(data.error || 'Server did not return a deploy hash');
  }

  /**
   * Polls Casper Testnet Node via Express backend until the transaction is successfully finalized in a block
   */
  public async pollDeployStatus(
    deployHash: string,
    onStep?: (msg: string) => void,
    maxAttempts = 15
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (onStep) {
        onStep(`[Polling Nodes] Checking block finalization (Attempt ${attempt}/${maxAttempts})...`);
      }
      
      await new Promise((resolve) => setTimeout(resolve, 2500));

      try {
        // Query status endpoint
        const response = await fetch(`/api/casper/deploy-status/${deployHash}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.finalized) {
            if (data.hasError) {
              let errMsg = data.errorMessage || 'Execution reverted';
              if (errMsg.toLowerCase().includes('invalid purse')) {
                errMsg = "Invalid purse (This usually indicates that your wallet's main purse has insufficient CSPR balance to cover the transaction amount and the required 0.1 CSPR gas fee limit).";
              }
              if (onStep) {
                onStep(`[On-Chain Error] Transaction reverted: ${errMsg}`);
              }
              throw new Error(`Transaction reverted: ${errMsg}`);
            }
            if (onStep) {
              onStep(`[On-Chain Finalization] Deploy hash finalized on-chain! Block resources verified.`);
            }
            return true;
          }
        }
      } catch (e: any) {
        console.log('[CasperService] Polling check failed', e);
        if (e instanceof Error && e.message.includes('Transaction reverted')) {
          throw e;
        }
      }
    }
    return false;
  }
}
