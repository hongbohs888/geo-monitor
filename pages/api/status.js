export default function handler(req, res) {
  res.status(200).json({
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    doubao: !!(process.env.DOUBAO_API_KEY && process.env.DOUBAO_ENDPOINT_ID),
    moonshot: !!process.env.MOONSHOT_API_KEY,
  });
}
