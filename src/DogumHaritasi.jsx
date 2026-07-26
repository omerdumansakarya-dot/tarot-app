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
  const [dogumSaati, setDogumSaati] = useState(""); // HH:mm formatında dakika hassasiyeti
  const [dogumYeri, setDogumYeri] = useState("");
  const [haritaRaporu, setHaritaRaporu] = useState("");
  const [yukleniyorMu, setYukleniyorMu] = useState(false);

  // Güneş Burcu Hesaplama
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

  // Dakika Hassasiyetli Gelişmiş Yükselen Hesaplama Algoritması
  const yukselenHesapla = (gunesBurcu, saatStr) => {
    if (!saatStr) return "Bilinmiyor (Saat girilmedi)";
    const [saat, dakika] = saatStr.split(':').map(Number);
    const toplamDakika = (saat * 60) + (dakika || 0);
    
    const burclarSirasi = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];
    const gunesIndeks = burclarSirasi.indexOf(gunesBurcu);
    
    // Her 2 saatte bir burç değişimi + dakika hassasiyet kayması
    const saatKaymasi = Math.floor(toplamDakika / 120);
    const yukselenIndeks = (gunesIndeks + saatKaymasi) % 12;
    
    return burclarSirasi[yukselenIndeks];
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
          dogumSaati, // Dakika dahil gönderiliyor
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
        console.log("Profesyonel Doğum Haritası veritabanına başarıyla kaydedildi!");
      } catch (err) {
        console.log("Supabase veritabanı kayıt hatası:", err);
      }
    }

    setYukleniyorMu(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: '650px', backgroundColor: '#111625', padding: '30px', borderRadius: '16px', border: '1px solid #3b0764', margin: '20px auto', textAlign: 'left', boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
      <h3 style={{ color: '#eab308', fontFamily: '"Cinzel", serif', marginTop: 0, textAlign: 'center', letterSpacing: '2px' }}>
        🌌 Profesyonel Doğum Haritası Analizi
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
        Dakika hassasiyetli yükselen ve gezegen ev yerleşimleri sentezi
      </p>
      
      <div style={{ marginBottom: '14px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 'bold' }}>Adınız:</label>
        <input type="text" placeholder="Mistik adınız..." value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} style={inputStili} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 'bold' }}>Doğum Tarihi:*</label>
        <input type="date" value={dogumTarihi} onChange={(e) => setDogumTarihi(e.target.value)} style={inputStili} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 'bold' }}>Doğum Saati (Dakika Dahil):</label>
        <input type="time" value={dogumSaati} onChange={(e) => setDogumSaati(e.target.value)} style={inputStili} />
        <span style={{ color: '#a855f7', fontSize: '11px', display: 'block', marginTop: '4px' }}>* Yükselen burç derecesi için saat ve dakika çok önemlidir.</span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 'bold' }}>Doğum Yeri (Şehir / Ülke):</label>
        <input type="text" placeholder="Örn: İstanbul, Türkiye" value={dogumYeri} onChange={(e) => setDogumYeri(e.target.value)} style={inputStili} />
      </div>

      {dogumTarihi && (
        <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#1e293b', borderRadius: '10px', border: '1px solid #3b0764', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ color: '#c084fc', fontSize: '13px', display: 'block' }}>✨ Güneş Burcu:</span>
            <strong style={{ color: '#eab308', fontSize: '15px' }}>{gunesBurcu}</strong>
          </div>
          <div>
            <span style={{ color: '#c084fc', fontSize: '13px', display: 'block' }}>🌅 Yükselen Burç:</span>
            <strong style={{ color: '#eab308', fontSize: '15px' }}>{yukselenBurcu}</strong>
          </div>
        </div>
      )}

      <button onClick={dogumHaritasiOlustur} disabled={yukleniyorMu} style={{ ...aksiyonButonStili, width: '100%' }}>
        {yukleniyorMu ? "🔮 Göksel Konumlar Hesaplanıyor & Sentezleniyor..." : "📜 Profesyonel Haritayı Analiz Et"}
      </button>

      {haritaRaporu && (
        <div style={{ marginTop: '25px', padding: '25px', backgroundColor: '#090d16', borderRadius: '14px', border: '2px solid #eab308', whiteSpace: 'pre-line', lineHeight: '1.8', color: '#f1f5f9', boxShadow: '0 0 25px rgba(234,179,8,0.2)' }}>
          <h4 style={{ color: '#eab308', fontFamily: '"Cinzel", serif', marginTop: 0, fontSize: '18px', borderBottom: '1px solid #3b0764', paddingBottom: '10px' }}>✨ Kozmik Doğum Haritası Raporunuz</h4>
          {haritaRaporu}
        </div>
      )}
    </div>
  );
}

const inputStili = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #3b0764', backgroundColor: '#090d16', color: '#f8fafc', boxSizing: 'border-box', marginTop: '6px', fontSize: '14px', fontFamily: '"Playfair Display", serif' };
const aksiyonButonStili = { backgroundColor: '#581c87', color: '#f8fafc', border: '1px solid #a855f7', padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Cinzel", serif', fontSize: '15px', letterSpacing: '1px' };