export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Sadece POST kabul edilir.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { kullaniciAdi, dogumTarihi, dogumSaati, dogumYeri, gunesBurcu, yukselenBurcu } = body;

    if (!dogumTarihi) {
      return res.status(400).json({ error: 'Doğum tarihi eksik.' });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'NVIDIA_API_KEY bulunamadı.' });
    }

    const prompt = `Sen uzman bir Astrolog ve Doğum Haritası (Natal Chart) analistisin.
Aşağıdaki bilgilere sahip kişi için detaylı, mistik ve yol gösterici bir Doğum Haritası Raporu hazırla:

Danışan Bilgileri:
- İsim: ${kullaniciAdi || 'Misafir'}
- Doğum Tarihi: ${dogumTarihi}
- Doğum Saati: ${dogumSaati || 'Belirtilmedi'}
- Doğum Yeri: ${dogumYeri || 'Belirtilmedi'}
- Güneş Burcu: ${gunesBurcu}
- Yükselen Burç: ${yukselenBurcu}

Lütfen raporu şu başlıklar altında Türkçe ve paragraflar halinde ver:
1. 🌟 Ruhun İmzası (Mizaç ve Genel Karakter)
2. 💼 Aşk ve İlişki Dinamikleri
3. 🚀 Kariyer, Para ve Potansiyel Beceriler
4. 🔮 Ruhsal Tekamül ve Hayat Amacı`;

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
        max_tokens: 1000
      })
    });

    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ error: 'AI Servis hatası' });
    }

    const answer = data?.choices?.[0]?.message?.content || 'Rapor üretilemedi.';
    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
  }
}