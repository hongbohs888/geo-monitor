export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.DAJIALA_KEY || 'JZL3a5747ba4b82f388';

  try {
    const { name, page = 1 } = req.body;
    if (!name) return res.status(400).json({ error: '请输入公众号名称或ID' });

    const response = await fetch('https://www.dajiala.com/fbmain/monitor/v3/post_history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        page,
        key,
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
