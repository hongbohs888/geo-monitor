export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.DAJIALA_KEY || 'JZL3a5747ba4b82f388';

  try {
    const { kw, page = 1, period = 30, sort_type = 1 } = req.body;
    if (!kw) return res.status(400).json({ error: '请输入搜索关键词' });

    const response = await fetch('https://www.dajiala.com/fbmain/monitor/v3/kw_search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kw,
        sort_type,
        mode: 1,
        period,
        page,
        key,
        any_kw: "",
        ex_kw: "",
        verifycode: "",
        type: 1
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
