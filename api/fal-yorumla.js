export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  
  // Hem VITE_ ile hem de düz haliyle aratıyoruz
  const API_KEY = process.env.VITE_NVIDIA_API_KEY || process.env.NVIDIA_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API Key bulunamadı!" });
  }

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600
      })
    });

    const data = await response.json();
    
    // NVIDIA'dan gelen cevabı kontrol et
    if (data.choices && data.choices[0]) {
      res.status(200).json({ ai_yaniti: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "NVIDIA geçersiz yanıt döndü: " + JSON.stringify(data) });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}