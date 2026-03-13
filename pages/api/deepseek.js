export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'DEEPSEEK_API_KEY 未配置，请在 Vercel 环境变量中添加' });

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: req.body.messages || [],
        max_tokens: req.body.max_tokens || 2000,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    // 统一格式返回
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ text, raw: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
