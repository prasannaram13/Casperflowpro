const TESTNET_RPC_NODES = [
  "https://node.testnet.casper.network/rpc",
  "https://node-clarity-testnet.make.services/rpc",
  "https://rpc.testnet.casperlabs.io/rpc",
];

type RequestLike = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  json: (value: unknown) => void;
};

function endpointFrom(req: RequestLike): string {
  const raw = req.query?.endpoint;
  return Array.isArray(raw) ? raw.join("/") : raw || "";
}

function jsonBody(body: unknown): any {
  if (typeof body === "string") {
    return JSON.parse(body);
  }
  return body && typeof body === "object" ? body : {};
}

async function rpcRequest(url: string, payload: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  return { response, data };
}

/**
 * Dedicated Casper serverless relay. It deliberately has no Express, AI, or
 * frontend imports so Vercel can start it reliably for real wallet-signed
 * transaction broadcasts.
 */
export default async function handler(req: RequestLike, res: ResponseLike) {
  const endpoint = endpointFrom(req).replace(/^\/+|\/+$/g, "");

  if (req.method === "POST" && endpoint === "put-deploy") {
    try {
      let payload = jsonBody(req.body);
      const deploy =
        payload?.params?.deploy ||
        payload?.deploy ||
        (Array.isArray(payload?.params)
          ? payload.params.find((item: any) => item?.name === "deploy")?.value
          : undefined);

      if (!deploy?.header?.account || !Array.isArray(deploy?.approvals) || deploy.approvals.length === 0) {
        return res.status(400).json({
          error: "A signed Casper deploy with a header account and approval is required.",
          isSimulated: false,
        });
      }

      const signature = String(deploy.approvals[0]?.signature || "").toLowerCase();
      if (signature.startsWith("01aaa") || signature.startsWith("02aaa")) {
        return res.status(400).json({
          error: "A real Casper wallet signature is required. Mock signatures are disabled.",
          isSimulated: false,
        });
      }

      // Casper Testnet's live sidecar expects the legacy deploy wrapper here.
      // Its params shape is { deploy }, not a named array.
      payload = {
        jsonrpc: "2.0",
        id: payload?.id || Date.now(),
        method: "account_put_deploy",
        params: { deploy },
      };

      const failures: string[] = [];
      for (const rpcUrl of TESTNET_RPC_NODES) {
        try {
          const { response, data } = await rpcRequest(rpcUrl, payload);
          const deployHash = data?.result?.deploy_hash || data?.result?.value?.deploy_hash;
          if (response.ok && deployHash) {
            return res.status(200).json({
              success: true,
              deployHash,
              result: data.result,
              source: rpcUrl,
              isSimulated: false,
            });
          }
          const nodeError = data?.error
            ? `${data.error.message || "RPC rejected deploy"}${data.error.data ? ` (${data.error.data})` : ""}`
            : `HTTP ${response.status}`;
          failures.push(`${rpcUrl}: ${nodeError}`);
        } catch (error: any) {
          failures.push(`${rpcUrl}: ${error?.message || "connection failed"}`);
        }
      }

      return res.status(400).json({
        error: "Casper Testnet rejected the signed deploy or the RPC nodes are unavailable.",
        details: failures,
        isSimulated: false,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error?.message || "Invalid deploy payload", isSimulated: false });
    }
  }

  if (req.method === "GET" && endpoint.startsWith("deploy-status/")) {
    const hash = endpoint.slice("deploy-status/".length);
    if (!hash) return res.status(400).json({ error: "Deploy hash is required" });

    const payload = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "info_get_deploy",
      params: { deploy_hash: hash },
    };

    for (const rpcUrl of TESTNET_RPC_NODES) {
      try {
        const { response, data } = await rpcRequest(rpcUrl, payload);
        if (response.ok && data?.result) {
          const executionResults = data.result.execution_results || data.result.execution_info?.execution_result;
          const finalized = Array.isArray(executionResults) ? executionResults.length > 0 : Boolean(executionResults);
          const result = Array.isArray(executionResults) ? executionResults[0]?.result : executionResults?.result || executionResults;
          return res.status(200).json({
            success: true,
            finalized,
            hasError: Boolean(result?.Failure || result?.error_message),
            errorMessage: result?.Failure?.error_message || result?.error_message || "",
            result: data.result,
            source: rpcUrl,
            isSimulated: false,
          });
        }
      } catch {
        // Try the next public RPC node.
      }
    }
    return res.status(404).json({ error: "Deploy was not found on Casper Testnet yet." });
  }

  if (req.method === "GET" && endpoint.startsWith("account-info/")) {
    const publicKey = endpoint.slice("account-info/".length);
    if (!publicKey) return res.status(400).json({ error: "pubKey is required" });

    const payload = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "state_get_account_info",
      params: { public_key: publicKey },
    };

    for (const rpcUrl of TESTNET_RPC_NODES) {
      try {
        const { response, data } = await rpcRequest(rpcUrl, payload);
        if (response.ok && data?.result) {
          return res.status(200).json({ success: true, result: data.result, source: rpcUrl });
        }
      } catch {
        // Try the next public RPC node.
      }
    }
    return res.status(404).json({ error: "Account was not found on Casper Testnet." });
  }

  if (req.method === "GET" && endpoint.startsWith("balance/")) {
    const publicKey = endpoint.slice("balance/".length);
    if (!publicKey) return res.status(400).json({ error: "pubKey is required" });

    const cloudKey = process.env.CSPR_CLOUD_API_KEY || "";
    for (const baseUrl of ["https://api.testnet.cspr.cloud", "https://api.cspr.cloud"]) {
      try {
        const response = await fetch(`${baseUrl}/accounts/${publicKey}`, {
          headers: cloudKey ? { Authorization: cloudKey, "X-API-KEY": cloudKey } : {},
        });
        const data: any = await response.json().catch(() => null);
        const rawBalance = data?.data?.balance ?? data?.data?.liquid_balance ?? data?.balance ?? data?.liquid_balance;
        if (response.ok && rawBalance !== undefined) {
          return res.status(200).json({ balance: Number(rawBalance) / 1_000_000_000, source: baseUrl });
        }
      } catch {
        // Balance display is non-critical; do not stop transaction broadcasting.
      }
    }
    return res.status(503).json({ error: "Live balance is temporarily unavailable. Transaction relay remains available." });
  }

  return res.status(404).json({ error: "Unknown Casper relay endpoint" });
}
