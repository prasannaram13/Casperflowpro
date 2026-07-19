type VercelRequest = { method?: string; headers?: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type VercelResponse = { status: (code: number) => VercelResponse; setHeader: (name: string, value: string) => VercelResponse; json: (body: unknown) => VercelResponse };

const RPC_NODES = ['https://node.testnet.casper.network/rpc', 'https://rpc.testnet.casperlabs.io/rpc'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'x402 resource requires GET' });
  const resource = String(req.query?.resource || '/api/x402');
  const raw = req.headers?.['x-402-payment-receipt'];
  if (!raw) {
    res.setHeader('WWW-Authenticate', `x402 network="casper-test", resource="${resource}", scheme="deploy"`);
    return res.status(402).json({ error: 'Payment Required', protocol: 'x402', network: 'casper-test', resource, accepts: [{ scheme: 'deploy', asset: 'CSPR', description: 'Provide a finalized Casper deploy hash in X-402-Payment-Receipt.' }] });
  }
  try {
    const receipt = JSON.parse(Array.isArray(raw) ? raw[0] : raw);
    const deployHash = String(receipt.deploy_hash || '').replace(/^0x/, '');
    if (!/^[0-9a-f]{64}$/i.test(deployHash)) throw new Error('Invalid deploy_hash in X-402-Payment-Receipt');
    for (const node of RPC_NODES) {
      try {
        const response = await fetch(node, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method: 'info_get_deploy', params: { deploy_hash: deployHash } }) });
        const data: any = await response.json().catch(() => null);
        if (response.ok && data?.result?.deploy) {
          const proof = { protocol: 'x402', deploy_hash: deployHash, network: 'casper-test', verified_by: node, verified_at: new Date().toISOString() };
          res.setHeader('X-402-Payment-Receipt', JSON.stringify(proof));
          return res.status(200).json({ resource, payment: proof, data: { status: 'paid', proof: 'Casper deploy exists on Testnet' } });
        }
      } catch { /* try next node */ }
    }
    return res.status(402).json({ error: 'Payment proof was not found on Casper Testnet', deploy_hash: deployHash });
  } catch (error: any) {
    return res.status(400).json({ error: error?.message || 'Invalid x402 payment receipt' });
  }
}
