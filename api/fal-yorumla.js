export default async function handler(req, res) {
  // CORS Başlıkları
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST metoduna izin verilir.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const prompt = body?.prompt;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt bulunamadı.' });
    }

    const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Sunucuda API anahtarı (NVIDIA_API_KEY) tanımlı değil.' });
    }

    const apiResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 600
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ 
        error: data?.detail || data?.message || 'NVIDIA API hatası oluştu.' 
      });
    }

    const answer = data?.choices?.[0]?.message?.content || 'Yanıt alınamadı.';
    return res.status(200).json({ answer, ai_yaniti: answer });

  } catch (err) {
    return res.status(500).json({ error: 'Sunucu içi hata: ' + err.message });
  }
}