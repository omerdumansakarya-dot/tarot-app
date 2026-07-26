export default async function handler(req, res) {
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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { kullaniciAdi, dogumTarihi, dogumSaati, dogumYeri, gunesBurcu, yukselenBurcu } = body || {};

    if (!dogumTarihi) {
      return res.status(400).json({ error: 'Doğum tarihi eksik.' });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası: NVIDIA_API_KEY tanımlanmamış.' });
    }

    const prompt = `Sen dünya çapında tanınan kıdemli bir Astrolog ve Ezoterik Doğum Haritası (Natal Chart) Master Analistisin. 
Aşağıdaki bilgilere ve dakika hassasiyetli göksel hesaplama motoru verilerine sahip bir danışan için kusursuz, derinlemesine ve mistik bir Doğum Haritası Raporu hazırla:

Danışan Bilgileri:
- İsim: ${kullaniciAdi || 'Misafir'}
- Doğum Tarihi: ${dogumTarihi}
- Doğum Saati ve Dakikası: ${dogumSaati || 'Belirtilmedi'}
- Doğum Yeri (Koordinat Referanslı): ${dogumYeri || 'Belirtilmedi'}
- Güneş Burcu (Öz Kimlik): ${gunesBurcu}
- Yükselen Burç (Maske ve Yaşam Yolu - Dakika Hassasiyetli): ${yukselenBurcu}

Lütfen raporu şu 4 kapsamlı başlık altında, akıcı, edebi ve profesyonel bir dille detaylıca kaleme al:
1. 🌟 Ruhun İmzası ve Kozmik Kimlik (Güneş ve Yükselen Dakika Sentezi)
2. 💼 Aşk, Tutku ve İlişki Dinamikleri (Venüs ve Mars Ev Konumları)
3. 🚀 Kariyer Potansiyeli, Yetenekler ve Maddi Alan (10. ve 2. Ev Etkileri)
4. 🔮 Ruhsal Tekamül, Karmik Yolculuk ve Hayat Amacı (Kuzey Ay Düğümü Teması)`;

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
        max_tokens: 800
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ error: `NVIDIA API Hatası: ${data?.error?.message || 'Bilinmeyen hata'}` });
    }

    const answer = data?.choices?.[0]?.message?.content || 'Rapor üretilemedi.';
    return res.status(200).json({ answer });

  } catch (err) {
    return res.status(500).json({ error: 'Sunucu iç hatası: ' + err.message });
  }
}