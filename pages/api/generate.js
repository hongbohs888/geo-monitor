export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 优先用DeepSeek生成文章（最便宜），没有的话用Moonshot
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.MOONSHOT_API_KEY;
  const isDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) return res.status(500).json({ error: '请至少配置 DEEPSEEK_API_KEY 或 MOONSHOT_API_KEY' });

  const url = isDeepSeek 
    ? 'https://api.deepseek.com/chat/completions'
    : 'https://api.moonshot.cn/v1/chat/completions';
  const model = isDeepSeek ? 'deepseek-chat' : 'moonshot-v1-8k';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: req.body.messages || [],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
