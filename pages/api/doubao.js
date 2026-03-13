export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.DOUBAO_API_KEY;
  const endpointId = process.env.DOUBAO_ENDPOINT_ID;
  if (!apiKey || !endpointId) return res.status(500).json({ error: 'DOUBAO_API_KEY 或 DOUBAO_ENDPOINT_ID 未配置' });

  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: endpointId,
        messages: req.body.messages || [],
        max_tokens: req.body.max_tokens || 2000,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ text, raw: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
