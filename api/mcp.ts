type VercelRequest = { method?: string; body?: any };
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => VercelResponse };

const RPC = 'https://node.testnet.casper.network/rpc';

async function rpc(method: string, params: Record<string, unknown>) {
  const response = await fetch(RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  });
  const data: any = await response.json().catch(() => null);
  if (!response.ok || data?.error) throw new Error(data?.error?.message || `Casper RPC ${response.status}`);
  return data?.result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'MCP requires POST' });
  const body = req.body || {};
  const method = body.method;
  if (method === 'tools/list') {
    return res.status(200).json({ jsonrpc: '2.0', id: body.id, result: { tools: [
      { name: 'casper_get_account_balance', description: 'Read a Casper Testnet account balance.', inputSchema: { type: 'object', properties: { publicKey: { type: 'string' } }, required: ['publicKey'] } },
      { name: 'odra_read_contract_state', description: 'Read a named Odra contract state item.', inputSchema: { type: 'object', properties: { contractHash: { type: 'string' }, variableName: { type: 'string' } }, required: ['contractHash', 'variableName'] } },
      { name: 'cspr_trade_swap_pools', description: 'Prepare a swap request; signing and broadcast remain wallet-approved.', inputSchema: { type: 'object', properties: { fromPool: { type: 'string' }, toPool: { type: 'string' }, amountMot: { type: 'string' } }, required: ['fromPool', 'toPool', 'amountMot'] } },
    ] } });
  }
  if (method !== 'tools/call') return res.status(400).json({ jsonrpc: '2.0', id: body.id, error: { code: -32601, message: 'Unsupported MCP method' } });
  const name = body.params?.name;
  const args = body.params?.arguments || {};
  try {
    if (name === 'casper_get_account_balance') {
      const publicKey = String(args.publicKey || '');
      if (!/^(01|02)[0-9a-f]{64}$/i.test(publicKey)) throw new Error('Invalid Casper public key');
      const cloudKey = process.env.CSPR_CLOUD_API_KEY || '';
      const cloud = await fetch(`https://api.testnet.cspr.cloud/accounts/${publicKey}`, { headers: cloudKey ? { Authorization: cloudKey, 'X-API-KEY': cloudKey } : {} });
      const data: any = await cloud.json().catch(() => null);
      const motes = data?.data?.liquid_balance ?? data?.data?.balance ?? data?.liquid_balance ?? data?.balance;
      if (motes === undefined) throw new Error('CSPR.cloud did not return a balance');
      return res.status(200).json({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: JSON.stringify({ publicKey, balanceMotes: String(motes), balanceCspr: Number(motes) / 1e9, source: 'CSPR.cloud Testnet' }) }] } });
    }
    if (name === 'odra_read_contract_state') {
      const contractHash = String(args.contractHash || '').replace(/^hash-/, 'hash-');
      const variableName = String(args.variableName || '');
      if (!/^hash-[0-9a-f]{64}$/i.test(contractHash) || !variableName) throw new Error('Valid contractHash and variableName are required');
      const root = await rpc('chain_get_state_root_hash', { state_identifier: null });
      const result = await rpc('state_get_item', { state_root_hash: root, key: contractHash, path: variableName.split('.').filter(Boolean) });
      return res.status(200).json({ jsonrpc: '2.0', id: body.id, result: { content: [{ type: 'text', text: JSON.stringify(result) }] } });
    }
    if (name === 'cspr_trade_swap_pools') throw new Error('Swap execution requires a configured contract call and wallet signature; no unsigned trade is broadcast by MCP.');
    throw new Error(`Unknown MCP tool: ${name}`);
  } catch (error: any) {
    return res.status(502).json({ jsonrpc: '2.0', id: body.id, error: { code: -32000, message: error?.message || 'MCP blockchain request failed' } });
  }
}
