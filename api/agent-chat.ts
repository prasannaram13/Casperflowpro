type VercelRequest = { method?: string; body?: any };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => VercelResponse;
};

const fallback = (message: string) =>
  `CasperFlow Agent is online. I received: "${message}". ` +
  'Connect your wallet, choose Conservative, Balanced, or Aggressive, and I can help analyze Casper yield strategies.';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, history = [], context = {} } = req.body ?? {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY is not configured in Vercel.' });
  }

  const messages = [
    {
      role: 'system',
      content: `You are CasperFlow Agent, an autonomous DeFi yield assistant for Casper Network. Answer clearly and concisely in plain text. Explain the reason for recommendations. Current session context: ${JSON.stringify(context)}`
    },
    ...(Array.isArray(history)
      ? history.slice(-10).map((item: any) => ({
          role: item?.role === 'user' ? 'user' : 'assistant',
          content: String(item?.text ?? '')
        }))
      : []),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages, temperature: 0.7 })
    });

    if (!response.ok) {
      console.error('DeepSeek request failed:', response.status, await response.text());
      return res.status(502).json({ error: 'DeepSeek request failed.' });
    }

    const json: any = await response.json();
    return res.status(200).json({ text: json?.choices?.[0]?.message?.content?.trim() || fallback(message) });
  } catch (error) {
    console.error('DeepSeek handler failed:', error);
    return res.status(502).json({ error: 'Unable to reach DeepSeek.' });
  }
}
