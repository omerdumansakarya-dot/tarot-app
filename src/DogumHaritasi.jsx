import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Bağlantısı
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://mwdspioshyrsmdshbzkp.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

export default function DogumHaritasi() {
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [dogumTarihi, setDogumTarihi] = useState("");
  const [dogumSaati, setDogumSaati] = useState("");
  const [dogumYeri, setDogumYeri] = useState("");
  const [haritaRaporu, setHaritaRaporu] = useState("");
  const [yukleniyorMu, setYukleniyorMu] = useState(false);

  const burcHesapla = (tarihStr) => {
    if (!tarihStr) return "Koç";
    const [, ay, gun] = tarihStr.split('-').map(Number);
    if ((ay === 3 && gun >= 21) || (ay === 4 && gun <= 20)) return "Koç";
    if ((ay === 4 && gun >= 21) || (ay === 5 && gun <= 20)) return "Boğa";
    if ((ay === 5 && gun >= 21) || (ay === 6 && gun <= 21)) return "İkizler";
    if ((ay === 6 && gun >= 22) || (ay === 7 && gun <= 22)) return "Yengeç";
    if ((ay === 7 && gun >= 23) || (ay === 8 && gun <= 22)) return "Aslan";
    if ((ay === 8 && gun >= 23) || (ay === 9 && gun <= 22)) return "Başak";
    if ((ay === 9 && gun >= 23) || (ay === 10 && gun <= 22)) return "Terazi";
    if ((ay === 10 && gun >= 23) || (ay === 11 && gun <= 21)) return "Akrep";
    if ((ay === 11 && gun >= 22) || (ay === 12 && gun <= 21)) return "Yay";
    if ((ay === 12 && gun >= 22) || (ay === 1 && gun <= 20)) return "Oğlak";
    if ((ay === 1 && gun >= 21) || (ay === 2 && gun <= 18)) return "Kova";
    return "Balık";
  };

  const yukselenHesapla = (gunesBurcu, saatStr) => {
    if (!saatStr) return "Bilinmiyor";
    const [saat] = saatStr.split(':').map(Number);
    const burclarSirasi = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];
    const gunesIndeks = burclarSirasi.indexOf(gunesBurcu);
    const saatKaymasi = Math.floor(((saat - 6 + 24) % 24) / 2);
    return burclarSirasi[(gunesIndeks + saatKaymasi) % 12];
  };

  const gunesBurcu = burcHesapla(dogumTarihi);
  const yukselenBurcu = yukselenHesapla(gunesBurcu, dogumSaati);

  const dogumHaritasiOlustur = async () => {
    if (!dogumTarihi) {
      alert("Lütfen doğum tarihinizi girin!");
      return;
    }
    setYukleniyorMu(true);
    setHaritaRaporu("");

    let gelenRapor = "";

    try {
      const res = await fetch('/api/dogum-haritasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kullaniciAdi,
          dogumTarihi,
          dogumSaati,
          dogumYeri,
          gunesBurcu,
          yukselenBurcu
        })
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        gelenRapor = data.answer;
        setHaritaRaporu(gelenRapor);
      } else {
        gelenRapor = `[Hata]: ${data.error || 'Rapor oluşturulamadı.'}`;
        setHaritaRaporu(gelenRapor);
      }
    } catch (e) {
      gelenRapor = `[Bağlantı Hatası]: ${e.message}`;
      setHaritaRaporu(gelenRapor);
    }

    // IP ve Lokasyon Bilgisi Toplama
    let ipBilgisi = "Bilinmiyor", ulkeBilgisi = "Bilinmiyor", sehirBilgisi = "Bilinmiyor";
    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      ipBilgisi = ipData.ip || "Bilinmiyor";
      ulkeBilgisi = ipData.country_name || "Bilinmiyor";
      sehirBilgisi = ipData.city || "Bilinmiyor";
    } catch (e) {
      console.log("IP bilgisi alınamadı:", e);
    }

    // SUPABASE KAYDI
    if (supabase && gelenRapor && !gelenRapor.startsWith('[')) {
      try {
        await supabase.from('dogum_haritasi_gecmisi').insert([
          {
            kullanici_adi: kullaniciAdi,
            dogum_tarihi: dogumTarihi,
            dogum_saati: dogumSaati,
            dogum_yeri: dogumYeri,
            gunes_burcu: gunesBurcu,
            yukselen_burcu: yukselenBurcu,
            harita_raporu: gelenRapor,
            ip_adresi: ipBilgisi,
            ulke: ulkeBilgisi,
            sehir: sehirBilgisi,
            cihaz_bilgisi: navigator.userAgent
          }
        ]);
        console.log("Doğum Haritası veritabanına başarıyla kaydedildi!");
      } catch (err) {
        console.log("Supabase veritabanı kayıt hatası:", err);
      }
    }

    setYukleniyorMu(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#111625', padding: '25px', borderRadius: '16px', border: '1px solid #3b0764', margin: '20px auto', textAlign: 'left', boxSizing: 'border-box' }}>
      <h3 style={{ color: '#eab308', fontFamily: '"Cinzel", serif', marginTop: 0, textAlign: 'center' }}>
        🌌 Doğum Haritası Analizi
      </h3>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#94a3b8', fontSize: '13px' }}>Adınız:</label>
        <input type="text" placeholder="İsminiz..." value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} style={inputStili} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#94a3b8', fontSize: '13px' }}>Doğum Tarihi:*</label>
        <input type="date" value={dogumTarihi} onChange={(e) => setDogumTarihi(e.target.value)} style={inputStili} />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ color: '#94a3b8', fontSize: '13px' }}>Doğum Saati:</label>
        <input type="time" value={dogumSaati} onChange={(e) => setDogumSaati(e.target.value)} style={inputStili} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#94a3b8', fontSize: '13px' }}>Doğum Yeri (Şehir):</label>
        <input type="text" placeholder="Örn: İstanbul, Ankara..." value={dogumYeri} onChange={(e) => setDogumYeri(e.target.value)} style={inputStili} />
      </div>

      {dogumTarihi && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #3b0764' }}>
          <span style={{ color: '#c084fc', fontSize: '13px' }}>✨ Güneş: <strong style={{ color: '#eab308' }}>{gunesBurcu}</strong></span>
          {dogumSaati && <span style={{ color: '#c084fc', fontSize: '13px', marginLeft: '15px' }}>🌅 Yükselen: <strong style={{ color: '#eab308' }}>{yukselenBurcu}</strong></span>}
        </div>
      )}

      <button onClick={dogumHaritasiOlustur} disabled={yukleniyorMu} style={{ ...aksiyonButonStili, width: '100%' }}>
        {yukleniyorMu ? "🔮 Yıldız Konumları Hesaplanıyor & Kaydediliyor..." : "📜 Haritayı Analiz Et"}
      </button>

      {haritaRaporu && (
        <div style={{ marginTop: '25px', padding: '20px', backgroundColor: '#090d16', borderRadius: '12px', border: '1px solid #eab308', whiteSpace: 'pre-line', lineHeight: '1.7', color: '#f1f5f9' }}>
          <h4 style={{ color: '#eab308', fontFamily: '"Cinzel", serif', marginTop: 0 }}>✨ Doğum Haritası Analiziniz:</h4>
          {haritaRaporu}
        </div>
      )}
    </div>
  );
}

const inputStili = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #3b0764', backgroundColor: '#090d16', color: '#f8fafc', boxSizing: 'border-box', marginTop: '5px' };
const aksiyonButonStili = { backgroundColor: '#581c87', color: '#f8fafc', border: '1px solid #a855f7', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Cinzel", serif' };

export default DogumHaritasi;