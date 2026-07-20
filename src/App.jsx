import { useState, useEffect } from 'react'
import tarotDestesi from '../tarot-veri.json'
import burcYorumlari from '../burc-veri.json'

const kartArkasiResmi = "/assets/cards/CardBacks.png";

const keltKonumlari = [
  "1. Mevcut Durum / Merkez",
  "2. Etki Eden / Karşıt Kuvvet",
  "3. Temel / Kök Neden",
  "4. Yakın Geçmiş",
  "5. Bilinç / Hedef",
  "6. Yakın Gelecek",
  "7. Kişi / Yaklaşım",
  "8. Çevre / Dış Etkenler",
  "9. Umutlar ve Korkular",
  "10. Nihai Sonuç"
];

// YENİ: Doğum tarihine göre burç hesaplayan yardımcı fonksiyon
const burcHesapla = (tarihStr) => {
  if (!tarihStr) return "Koç";
  const [yil, ay, gun] = tarihStr.split('-').map(Number);
  
  if ((ay === 3 && gun >= 21) || (ay === 4 && gun <= 20)) return "Koç";
  if ((ay === 4 && gun >= 21) || (ay === 5 && gun <= 20)) return "Boğa";
  if ((ay === 5 && gun >= 21) || (ay === 6 && gun <= 21)) return "İkizler";
  if ((ay === 6 && gun >= 22) || (ay === 7 && gun <= 22)) return "Yengeç";
  if ((ay === 7 && gun >= 23) || (ay === 8 && gun <= 22)) return "Aslan";
  if ((ay === 8 && gun >= 23) || (ay === 9 && gun <= 22)) return "Başak";
  if ((ay === 9 && gun >= 23) || (ay === 10 && gun <= 22)) return "Terazi";
  if ((ay === 10 && gun >= 23) || (ay === 11 && gun <= 21)) return "Akrep";
  if ((ay === 11 && gun >= 22) || (ay === 12 && gun <= 21)) return "Yay";
  if ((ay === 12 && gun >= 22) || (ay === 1 &&-21 && gun <= 19)) return "Oğlak"; // ya da genel Ocak
  if ((ay === 1 && gun >= 20) || (ay === 2 && gun <= 18)) return "Kova";
  return "Balık";
};

export default function App() {
  const [acilimTuru, setAcilimTuru] = useState(null);
  const [secilenKartlar, setSecilenKartlar] = useState([]);
  const [aiYorumu, setAiYorumu] = useState("");
  const [yukleniyorMu, setYukleniyorMu] = useState(false);

  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [dogumTarihi, setDogumTarihi] = useState("");
  const [dogumSaati, setDogumSaati] = useState("");
  const [odakKonusu, setOdakKonusu] = useState("genel");

  // Burcu artık doğum tarihinden otomatik türetiyoruz
  const kullaniciBurcu = burcHesapla(dogumTarihi);

  const [desteRituelDurumu, setDesteRituelDurumu] = useState("bekliyor");
  const [dizilenKartSayisi, setDizilenKartSayisi] = useState(0); 
  const [havuzDeste, setHavuzDeste] = useState([]);

  const [sesAcik, setSesAcik] = useState(true);
  const [odaklananKart, setOdaklananKart] = useState(null);
  const [ekranGenisligi, setEkranGenisligi] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setEkranGenisligi(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobil = ekranGenisligi < 850;

  const mistikKartSesiCal = () => {
    if (!sesAcik) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(369, ctx.currentTime); 
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.35); 
    } catch (e) {
      console.log("Ses motoru başlatılamadı:", e);
    }
  };

  const gunlukBurcYorumuGetir = () => {
    const bugun = new Date();
    const gun = bugun.getDate();
    const ay = bugun.getMonth() + 1;
    const yil = bugun.getFullYear();
    const tarihKodu = gun + ay + yil; 
    
    const burcHavuzu = burcYorumlari[kullaniciBurcu];
    if (!burcHavuzu) return "Yıldızlar bugün sessizliğini koruyor...";
    
    const yorumIndeksi = tarihKodu % burcHavuzu.length;
    return burcHavuzu[yorumIndeksi];
  };

  const bugununTarihiYaz = () => {
    const bugun = new Date();
    return bugun.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const acilimiBaslat = (kartSayisi) => {
    mistikKartSesiCal();
    setAiYorumu("");
    setAcilimTuru(kartSayisi);
    setOdaklananKart(null);

    let geciciDeste = [...tarotDestesi];
    let karistirilmis = [];
    while (geciciDeste.length > 0) {
      const rastgeleIndeks = Math.floor(Math.random() * geciciDeste.length);
      const tersMi = Math.random() < 0.25;
      karistirilmis.push({
        veri: geciciDeste[rastgeleIndeks],
        acik: false,
        ters: tersMi
      });
      geciciDeste.splice(rastgeleIndeks, 1);
    }

    if (kartSayisi === 10) {
      setDesteRituelDurumu("bekliyor");
      setDizilenKartSayisi(0);
      setSecilenKartlar([]);
      setHavuzDeste(karistirilmis);
    } else {
      setSecilenKartlar(karistirilmis.slice(0, kartSayisi));
    }
  };

  const desteTiklaRituel = () => {
    if (desteRituelDurumu === "bekliyor") {
      mistikKartSesiCal();
      setDesteRituelDurumu("bolundu");
      setTimeout(() => {
        setDesteRituelDurumu("birlesti");
      }, 1500);
      return;
    }

    if (desteRituelDurumu === "birlesti" && dizilenKartSayisi < 10) {
      mistikKartSesiCal();
      const sonrakiKart = havuzDeste[dizilenKartSayisi];
      setSecilenKartlar([...secilenKartlar, sonrakiKart]);
      setDizilenKartSayisi(dizilenKartSayisi + 1);
    }
  };

  const kartiCevir = (indeks) => {
    mistikKartSesiCal();
    let guncelKartlar = [...secilenKartlar];
    
    if (guncelKartlar[indeks].acik) {
      setOdaklananKart({ ...guncelKartlar[indeks], konumAd: acilimTuru === 10 ? keltKonumlari[indeks] : `${indeks + 1}. KART` });
      return;
    }

    guncelKartlar[indeks].acik = true;
    setSecilenKartlar(guncelKartlar);
  };

  const anlamGetir = (kart, tersMi, konumIndeksi = null) => {
    if (!kart) return "Bu kartın enerjisi gizemini koruyor...";
    let temelAnlam = kart.genel_anlam;

    if (kart.odak_anlamlari) {
      let jsonKey = "Genel Gidişat ve Kader";
      if (odakKonusu === "ask") jsonKey = "Aşk, İlişkiler ve Kalp Mevzuları";
      if (odakKonusu === "kariyer") jsonKey = "Kariyer, Para ve Başarı";
      if (odakKonusu === "saglik") jsonKey = "Zihinsel ve Bedensel Sağlık";
      temelAnlam = kart.odak_anlamlari[jsonKey] || kart.genel_anlam;
    }

    let prefix = "";
    if (acilimTuru === 10 && konumIndeksi !== null) {
      prefix = `[${keltKonumlari[konumIndeksi]}] Dönemeci: `;
    }

    if (tersMi) {
      return `${prefix}${temelAnlam} Fakat kart ters döndüğü için bu durum gecikmeli, dirençle veya içsel bir hesaplaşmayla gelecektir.`;
    }
    return `${prefix}${temelAnlam}`;
  };

  const odakMetniGetir = () => {
    if (odakKonusu === "ask") return "❤️ Aşk & İlişkiler";
    if (odakKonusu === "kariyer") return "💼 Kariyer & Finans";
    if (odakKonusu === "saglik") return "✨ Sağlık & Spiritüellik";
    return "Genel Gidişat ve Kader";
  };

  const falimiYorumla = async () => {
    const acikKartlarVerisi = secilenKartlar.filter(k => k.acik);
    if (acikKartlarVerisi.length !== acilimTuru) {
      alert("Lütfen önce tüm kartların üzerine tıklayarak onları açın!");
      return;
    }

    setYukleniyorMu(true);
    
    let girisCumlesi = `Sevgili ${kullaniciAdi || 'Misafir'} (${kullaniciBurcu} Burcu, Doğum: ${dogumTarihi || 'Belirtilmedi'}), ruhunun derinliklerinde saklı olan enerjiler ve özellikle yoğunlaştığın "${odakMetniGetir()}" konusu için mistik kader çarkı döndü.\n\n`;
    let kartAnalizleri = "";

    if (acilimTuru === 1) {
      const k = acikKartlarVerisi[0];
      kartAnalizleri = `🔮 Açılan tek kartın olan "${k.veri.isim}${k.ters ? ' (Ters)' : ''}", durumunun net aynasıdır: ${anlamGetir(k.veri, k.ters)}\n\n`;
    } else if (acilimTuru === 3) {
      const k1 = acikKartlarVerisi[0];
      const k2 = acikKartlarVerisi[1];
      const k3 = acikKartlarVerisi[2];
      kartAnalizleri = `🕰️ Geçmişinden gelen "${k1.veri.isim}${k1.ters ? ' (Ters)' : ''}" enerjisi (${anlamGetir(k1.veri, k1.ters)}), şu an merkezindeki "${k2.veri.isim}${k2.ters ? ' (Ters)' : ''}" gerçeğiyle yüzleşmeni sağlıyor (${anlamGetir(k2.veri, k2.ters)}). Tüm bu süreç, geleceğinde filizlenecek olan "${k3.veri.isim}${k3.ters ? ' (Ters)' : ''}" kartına bağlanıyor: ${anlamGetir(k3.veri, k3.ters)}\n\n`;
    } else if (acilimTuru === 10) {
      kartAnalizleri = acikKartlarVerisi.map((k, i) => `✦ ${keltKonumlari[i]}:\nBeliren "${k.veri.isim}${k.ters ? ' (Ters)' : ''}" kartı der ki: ${anlamGetir(k.veri, k.ters, i)}`).join("\n\n") + "\n\n";
    }

    const kartListesi = acikKartlarVerisi.map((k, i) => 
      `${keltKonumlari[i] || (i+1 + ". Kart")}: ${k.veri.isim} ${k.ters ? '(Ters)' : ''}`
    ).join(", ");

    const aiPrompt = `Kullanıcı ${kullaniciAdi} (${kullaniciBurcu} burcu, Doğum Tarihi: ${dogumTarihi}, Saat: ${dogumSaati}) ve "${odakMetniGetir()}" konusuna odaklandı. Kartlar: ${kartListesi}. 
    Yukarıdaki verilere dayanarak, spiritüel ve edebi bir dille, bu dizilimin kullanıcının hayatına getirdiği gizli mesajları ve rehberliği yorumla. Sadece yorumu yap, giriş cümlesi kurma.`;

    try {
      const response = await fetch("/api/fal-yorumla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          kullaniciAdi,
          kullaniciBurcu,
          dogumTarihi,
          dogumSaati,
          odakKonusu,
          kartlar: kartListesi
        })
      });

      const data = await response.json();
      
      if (data.ai_yaniti) {
        setAiYorumu(`${girisCumlesi}${kartAnalizleri}\n--- 🔮 AI Rehberinin Derinlemesine Analizi ---\n\n${data.ai_yaniti}`);
      } else {
        throw new Error(data.error || "Yorum alınamadı");
      }
    } catch (error) {
      setAiYorumu(`${girisCumlesi}${kartAnalizleri}\n(Not: Mistik ağlar şu an yoğun, AI yorumu geçici olarak ulaşılamaz.)`);
    } finally {
      setYukleniyorMu(false);
    }
  };

  const menuyeDon = () => {
    setAcilimTuru(null);
    setSecilenKartlar([]);
    setAiYorumu("");
    setDizilenKartSayisi(0);
    setDesteRituelDurumu("bekliyor");
    setOdaklananKart(null);
  };

  const herkesAcildiMi = secilenKartlar.length === acilimTuru && secilenKartlar.every(k => k.acik);

  return (
    <div style={{
      backgroundColor: '#070a12', color: '#f8fafc', minHeight: '100vh', width: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      fontFamily: '"Playfair Display", serif', textAlign: 'center', padding: isMobil ? '20px 10px' : '40px 15px',
      position: 'relative', overflowX: 'hidden', boxSizing: 'border-box'
    }}>
      
      <style>{`
        @keyframes floatingGlow {
          0% { transform: translateY(0px) scale(1); opacity: 0.35; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.65; }
          100% { transform: translateY(0px) scale(1); opacity: 0.35; }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .bg-glow-mor { position: absolute; width: 550px; height: 550px; background: radial-gradient(circle, rgba(147,51,234,0.35) 0%, rgba(147,51,234,0) 70%); filter: blur(60px); top: -10%; left: -10%; animation: floatingGlow 10s infinite ease-in-out; pointer-events: none; z-index: 1; }
        .bg-glow-altin { position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0) 70%); filter: blur(70px); bottom: -15%; right: -15%; animation: floatingGlow 14s infinite ease-in-out reverse; pointer-events: none; z-index: 1; }
        .icerik-kapsayici { position: relative; z-index: 2; width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; box-sizing: border-box; }
        
        .deste-yigin { position: relative; width: 140px; height: 230px; cursor: pointer; transition: all 0.6s ease; margin: 20px auto; }
        .deste-parca { position: absolute; width: 100%; height: 100%; border-radius: 10px; border: 2px solid #eab308; background: #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.7); transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1); }
        .deste-yigin.bolundu .p-sol { transform: translateX(-110px) rotate(-5deg); opacity: 0.8; }
        .deste-yigin.bolundu .p-sag { transform: translateX(110px) rotate(5deg); opacity: 0.8; }
        .deste-yigin.birlesti { transform: scale(1.05); }

        .kart-modal-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(5, 7, 14, 0.85); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
        .kart-modal-box { background: #111625; border: 2px solid #eab308; border-radius: 20px; padding: 25px; max-width: 450px; width: 100%; box-shadow: 0 0 35px rgba(234,179,8,0.3); animation: modalFadeIn 0.3s ease-out; text-align: center; position: relative; }
      `}</style>
      
      <div className="bg-glow-mor"></div>
      <div className="bg-glow-altin"></div>

      <button 
        onClick={() => setSesAcik(!sesAcik)}
        style={{
          position: 'absolute', top: isMobil ? '10px' : '20px', right: isMobil ? '10px' : '20px', zIndex: 10,
          background: 'rgba(17, 22, 37, 0.8)', border: '1px solid #3b0764', borderRadius: '50%',
          width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#eab308', fontSize: '18px', boxShadow: '0 0 10px rgba(168,85,247,0.3)'
        }}
        title={sesAcik ? "Mistik Sesleri Kapat" : "Mistik Sesleri Aç"}
      >
        {sesAcik ? "🔊" : "🔇"}
      </button>

      <div className="icerik-kapsayici">
        <h1 onClick={menuyeDon} style={{ fontFamily: '"Cinzel", serif', color: '#d8b4fe', fontSize: isMobil ? '28px' : '36px', letterSpacing: '4px', textShadow: '0 0 15px rgba(168, 85, 247, 0.6)', cursor: 'pointer', margin: '0 0 10px 0', fontWeight: '700', textAlign: 'center' }}>
          ✨ MİSTİK TAROT ✨
        </h1>
        <div style={{ width: '60px', height: '2px', backgroundColor: '#eab308', margin: '0 auto 25px auto', boxShadow: '0 0 8px #eab308' }}></div>

        {acilimTuru === null && (
          <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#111625', padding: '30px', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', margin: '0 auto', boxSizing: 'border-box' }}>
            <p style={{ color: '#c084fc', fontFamily: '"Cinzel", serif', fontSize: '18px', marginBottom: '20px', letterSpacing: '1px', textAlign: 'center' }}>Kader Formunu Doldurun</p>
            
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>Adınız:</label>
              <input type="text" placeholder="Mistik bir isim..." value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} style={inputStili} />
            </div>

            {/* Doğum Tarihi Alanı */}
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>Doğum Tarihiniz:</label>
              <input type="date" value={dogumTarihi} onChange={(e) => setDogumTarihi(e.target.value)} style={inputStili} />
            </div>

            {/* Otomatik Algılanan Burç Göstergesi */}
            {dogumTarihi && (
              <div style={{ marginBottom: '15px', textAlign: 'left', padding: '10px', backgroundColor: '#1e293b', borderRadius: '8px', border: '1px solid #3b0764' }}>
                <span style={{ color: '#c084fc', fontSize: '13px' }}>✨ Tespit Edilen Burç: </span>
                <strong style={{ color: '#eab308', fontSize: '14px' }}>{kullaniciBurcu} Burcu</strong>
              </div>
            )}

            {/* Doğum Saati Alanı */}
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>Doğum Saatiniz (İsteğe bağlı):</label>
              <input type="time" value={dogumSaati} onChange={(e) => setDogumSaati(e.target.value)} style={inputStili} />
            </div>

            <div style={{ marginBottom: '30px', textAlign: 'left' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '14px', marginBottom: '5px' }}>Odaklanmak İstediğiniz Konu:</label>
              <select value={odakKonusu} onChange={(e) => setOdakKonusu(e.target.value)} style={inputStili}>
                <option value="genel" style={{backgroundColor: '#111625'}}>Genel Gidişat ve Kader</option>
                <option value="ask" style={{backgroundColor: '#111625'}}>❤️ Aşk & İlişkiler</option>
                <option value="kariyer" style={{backgroundColor: '#111625'}}>💼 Kariyer & Finans</option>
                <option value="saglik" style={{backgroundColor: '#111625'}}>✨ Sağlık & Spiritüellik</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button onClick={() => acilimiBaslat(1)} style={menuButonStili}>✦ Tek Kart Açılımı</button>
              <button onClick={() => acilimiBaslat(3)} style={menuButonStili}>✦ Üç Kart (Geçmiş-Şimdi-Gelecek)</button>
              <button onClick={() => acilimiBaslat(10)} style={menuButonStili}>✦ On Kart (Kelt Haçı Analizi)</button>
            </div>
          </div>
        )}

        {acilimTuru !== null && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{ width: '100%', maxWidth: '650px', margin: '0 auto 20px auto', padding: '15px', backgroundColor: '#111625', borderRadius: '12px', border: '1px solid #3b0764', textAlign: 'left', boxSizing: 'border-box' }}>
              <span style={{ color: '#eab308', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>📅 {bugununTarihiYaz().toUpperCase()} BURÇ ENERJİSİ</span>
              <p style={{ margin: '5px 0 0 0', color: '#cbd5e1', fontSize: '14px', fontStyle: 'italic' }}>{gunlukBurcYorumuGetir()}</p>
            </div>

            <p style={{ fontFamily: '"Cinzel", serif', color: '#eab308', fontWeight: 'bold', fontSize: isMobil ? '18px' : '20px', letterSpacing: '2px', margin: '0 0 5px 0', textAlign: 'center' }}>
              {acilimTuru === 1 && "TEK KART AÇILIMI"}
              {acilimTuru === 3 && "ÜÇ KART AÇILIMI"}
              {acilimTuru === 10 && "ON KART (KELT HAÇI) RİTÜELİ"}
            </p>
            <p style={{ color: '#c084fc', fontSize: '14px', margin: '0 0 20px 0', textAlign: 'center' }}>
              Sevgili {kullaniciAdi || 'Misafir'} ({kullaniciBurcu}), Odak: {odakMetniGetir()}
            </p>

            <div style={{
              background: 'linear-gradient(90deg, rgba(147,51,234,0.1) 0%, rgba(234,179,8,0.15) 50%, rgba(147,51,234,0.1) 100%)',
              border: '1px solid rgba(234,179,8,0.4)', borderRadius: '30px', padding: '8px 20px',
              marginBottom: '25px', color: '#f8fafc', fontSize: isMobil ? '13px' : '14px',
              fontFamily: '"Cinzel", serif', boxShadow: '0 0 15px rgba(234,179,8,0.15)'
            }}>
              {acilimTuru === 10 && dizilenKartSayisi < 10 ? (
                <span>⚡ Mistik Rehber: {desteRituelDurumu === "bekliyor" ? "Enerjini odakla ve desteye dokun..." : `Kartlar yerleşiyor (${dizilenKartSayisi}/10) - Tıklamaya devam et!`}</span>
              ) : (
                <span>✨ Mistik Rehber: {herkesAcildiMi ? "Tüm sırlar açığa çıktı! Şimdi aşağıdan kehanetini başlat veya incelemek için kartlara tıkla." : "Kartların gizemini aralamak ve yakından incelemek için üzerlerine tıkla."}</span>
              )}
            </div>

            {acilimTuru === 10 && dizilenKartSayisi < 10 && (
              <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto 30px auto', backgroundColor: 'rgba(17,22,37,0.6)', padding: '20px', borderRadius: '16px', border: '1px solid #1e293b', boxSizing: 'border-box' }}>
                <p style={{ color: '#eab308', fontFamily: '"Cinzel", serif', fontSize: '15px', letterSpacing: '1px', margin: '0 0 10px 0' }}>
                  {desteRituelDurumu === "bekliyor" && "✦ Desteye Tıklayarak Enerjinizi Yükleyin ve Karıştırın ✦"}
                  {desteRituelDurumu === "bolundu" && "🔮 Deste 3 Parçaya Bölünerek Enerjiniz Sentezleniyor..."}
                  {desteRituelDurumu === "birlesti" && `🔮 Desteye Tek Tek Tıklayarak 10 Kartı Yerleştirin (${dizilenKartSayisi}/10)`}
                </p>
                <div onClick={desteTiklaRituel} className={`deste-yigin ${desteRituelDurumu}`}>
                  <div className="deste-parca p-sol"><img src={kartArkasiResmi} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px', opacity:0.6}}/></div>
                  <div className="deste-parca p-sag"><img src={kartArkasiResmi} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px', opacity:0.6}}/></div>
                  <div className="deste-parca p-ana"><img src={kartArkasiResmi} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px'}}/></div>
                </div>
              </div>
            )}

            {acilimTuru !== 10 && (
              <div style={{ display: 'flex', gap: isMobil ? '15px' : '20px', justifyContent: 'center', flexWrap: 'wrap', margin: '0 auto 40px auto', width: '100%' }}>
                {secilenKartlar.map((kart, indeks) => (
                  <div key={indeks} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ marginBottom: '10px', color: '#c084fc', fontSize: '13px', fontFamily: '"Cinzel", serif', fontWeight: 'bold' }}>
                      {acilimTuru === 3 ? (indeks === 0 ? "GEÇMİŞ" : indeks === 1 ? "ŞİMDİ" : "GELECEK") : "KADER KARTI"}
                    </span>
                    <div onClick={() => kartiCevir(indeks)} style={{ width: isMobil ? '130px' : '150px', height: isMobil ? '215px' : '250px', perspective: '1000px', cursor: 'pointer' }}>
                      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.6s', transform: kart.acik ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '10px', padding: '4px', background: '#1e293b' }}>
                          <img src={kartArkasiResmi} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                        </div>
                        <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: kart.ters ? 'rotateY(180deg) rotate(180deg)' : 'rotateY(180deg)', borderRadius: '10px', padding: '4px', background: 'linear-gradient(135deg, #eab308 0%, #3b0764 100%)' }}>
                          <img src={`/assets/cards${kart.veri.resim}`} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {acilimTuru === 10 && (
              <div style={{
                display: 'flex', 
                flexDirection: isMobil ? 'column' : 'row',
                justifyContent: 'center', alignItems: 'center', gap: isMobil ? '30px' : '40px',
                flexWrap: 'wrap', margin: '10px auto 40px auto', width: '100%', maxWidth: '1050px',
                backgroundColor: 'rgba(11,15,30,0.4)', padding: isMobil ? '20px 10px' : '30px 20px', 
                borderRadius: '24px', border: '1px solid rgba(59,7,100,0.4)', boxSizing: 'border-box'
              }}>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobil ? '95px 95px 95px' : '110px 110px 110px',
                  gridTemplateRows: isMobil ? '160px 160px 160px' : '185px 185px 185px',
                  gap: isMobil ? '8px' : '15px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{ gridArea: '1 / 2 / 2 / 3' }}>{renderKeltKarti(4)}</div>
                  <div style={{ gridArea: '2 / 1 / 3 / 2' }}>{renderKeltKarti(3)}</div>
                  <div style={{ gridArea: '2 / 2 / 3 / 3', position: 'relative', width: isMobil ? '95px' : '110px', height: isMobil ? '160px' : '185px', display:'flex', justifyContent:'center', alignItems:'center' }}>
                    {renderKeltKarti(0, false)}
                    {secilenKartlar[1] && (
                      <div style={{ position: 'absolute', transform: 'rotate(90deg)', zIndex: 5, boxShadow: '0 0 20px rgba(0,0,0,0.8)' }}>
                        {renderKeltKarti(1, true)}
                      </div>
                    )}
                  </div>
                  <div style={{ gridArea: '2 / 3 / 3 / 4' }}>{renderKeltKarti(5)}</div>
                  <div style={{ gridArea: '3 / 2 / 4 / 3' }}>{renderKeltKarti(2)}</div>
                </div>

                <div style={{
                  display: 'flex', 
                  flexDirection: isMobil ? 'row' : 'column',
                  gap: isMobil ? '10px' : '15px',
                  borderLeft: isMobil ? 'none' : '2px dashed rgba(234,179,8,0.3)',
                  borderTop: isMobil ? '2px dashed rgba(234,179,8,0.3)' : 'none',
                  paddingLeft: isMobil ? '0' : '30px',
                  paddingTop: isMobil ? '20px' : '0',
                  justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: isMobil ? '100%' : 'auto'
                }}>
                  {[9, 8, 7, 6].map(i => <div key={i}>{renderKeltKarti(i)}</div>)}
                </div>

              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
              <button onClick={() => acilimiBaslat(acilimTuru)} disabled={yukleniyorMu} style={aksiyonButonStili}>Kaderi Yeniden Fısılda</button>
              <button onClick={menuyeDon} disabled={yukleniyorMu} style={{ ...aksiyonButonStili, backgroundColor: '#334155', border: '1px solid #475569' }}>Girişe Dön</button>
            </div>
            
            {herkesAcildiMi && !aiYorumu && (
              <div style={{ marginBottom: '40px' }}>
                {yukleniyorMu ? (
                  <p style={{ color: '#eab308', fontFamily: '"Cinzel", serif', fontSize: '18px', fontWeight: 'bold' }}>
                    🔮 Baş Falcı Kelt Haçı dengelerini inceliyor, lütfen bekleyin...
                  </p>
                ) : (
                  <button onClick={falimiYorumla} style={{ ...aksiyonButonStili, background: 'linear-gradient(135deg, #a855f7 0%, #d8b4fe 100%)', color: '#090d16', fontSize: '18px', padding: '16px 36px', border: 'none', boxShadow: '0 0 20px rgba(216, 180, 254, 0.4)' }}>
                    ✨ Kelt Haçı Kehanetini Başlat ✨
                  </button>
                )}
              </div>
            )}

            {aiYorumu && (
              <div style={{ width: '100%', maxWidth: '750px', margin: '0 auto 40px auto', padding: '30px', backgroundColor: '#17112a', borderRadius: '16px', border: '2px solid #d8b4fe', boxShadow: '0 0 25px rgba(168, 85, 247, 0.2)', textAlign: 'left', boxSizing: 'border-box' }}>
                <h3 style={{ fontFamily: '"Cinzel", serif', color: '#eab308', margin: '0 0 15px 0', fontSize: '20px' }}>🔮 Baş Falcının Kelt Haçı Kehaneti</h3>
                <p style={{ margin: 0, color: '#f1f5f9', fontSize: '16px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{aiYorumu}</p>
              </div>
            )}

            <div style={{ width: '100%', height: '1px', backgroundColor: '#334155', margin: '20px 0 40px 0' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '750px', margin: '0 auto', textAlign: 'left', boxSizing: 'border-box' }}>
              {secilenKartlar.map((kart, index) => (
                kart.acik && (
                  <div key={index} style={{ padding: '20px', backgroundColor: '#111625', borderRadius: '14px', border: '1px solid #1e293b', borderLeft: '4px solid #eab308', boxSizing: 'border-box' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#eab308', fontSize: '16px', fontFamily: '"Cinzel", serif' }}>
                      {acilimTuru === 10 ? keltKonumlari[index] : `${index + 1}. Kart`}: {kart.veri.isim}{kart.ters ? ' (Ters)' : ''}
                    </h4>
                    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6' }}>{anlamGetir(kart.veri, kart.ters, acilimTuru === 10 ? index : null)}</p>
                  </div>
                )
              ))}
            </div>

          </div>
        )}
      </div>

      {odaklananKart && (
        <div className="kart-modal-bg" onClick={() => setOdaklananKart(null)}>
          <div className="kart-modal-box" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOdaklananKart(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '20px', cursor: 'pointer' }}>✖</button>
            <span style={{ color: '#c084fc', fontSize: '12px', fontFamily: '"Cinzel", serif', letterSpacing: '1px' }}>{odaklananKart.konumAd}</span>
            <h3 style={{ margin: '5px 0 15px 0', color: '#eab308', fontFamily: '"Cinzel", serif', fontSize: '22px' }}>{odaklananKart.veri.isim} {odaklananKart.ters ? '(Ters)' : ''}</h3>
            
            <div style={{ width: '180px', height: '300px', margin: '0 auto 20px auto', borderRadius: '10px', padding: '4px', background: 'linear-gradient(135deg, #eab308 0%, #3b0764 100%)', boxShadow: '0 10px 25px rgba(0,0,0,0.8)' }}>
              <img src={`/assets/cards${odaklananKart.veri.resim}`} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', transform: odaklananKart.ters ? 'rotate(180deg)' : 'none' }} />
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', textAlign: 'left', padding: '10px', background: '#090d16', borderRadius: '8px', border: '1px solid #334155' }}>
              <p style={{ margin: 0, color: '#f1f5f9', fontSize: '14px', lineHeight: '1.6' }}>
                {anlamGetir(odaklananKart.veri, odaklananKart.ters, acilimTuru === 10 ? keltKonumlari.indexOf(odaklananKart.konumAd) : null)}
              </p>
            </div>
            <p style={{ margin: '15px 0 0 0', color: '#64748b', fontSize: '12px' }}>✦ Pencereyi kapatmak için dışarı veya çarpıya tıkla ✦</p>
          </div>
        </div>
      )}

    </div>
  );

  function renderKeltKarti(indeks, isHorizontal = false) {
    const kart = secilenKartlar[indeks];
    
    let w = '150px';
    let h = '250px';

    if (acilimTuru === 10) {
      if (isHorizontal) {
        w = isMobil ? '85px' : '100px';
        h = isMobil ? '145px' : '170px';
      } else {
        w = isMobil ? '95px' : '110px';
        h = isMobil ? '160px' : '185px';
      }
    }

    if (!kart) {
      return (
        <div style={{
          width: w, height: h,
          border: '2px dashed rgba(168, 85, 247, 0.3)',
          borderRadius: '8px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          color: '#64748b', fontSize: isMobil ? '8px' : '10px', fontFamily: '"Cinzel", serif',
          textAlign: 'center', padding: '4px', boxSizing: 'border-box'
        }}>
          <span style={{ fontSize: isMobil ? '12px' : '14px', marginBottom: '2px', color: '#a855f7' }}>✦</span>
          {!isHorizontal && keltKonumlari[indeks] ? keltKonumlari[indeks].split(". ")[1].split(" /")[0] : ""}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        {!isHorizontal && (
          <span style={{ color: kart.acik ? '#eab308' : '#94a3b8', fontSize: isMobil ? '9px' : '10px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', whiteSpace: 'nowrap' }}>
            {indeks + 1}. KONUM
          </span>
        )}
        
        <div onClick={() => kartiCevir(indeks)} style={{ width: w, height: h, perspective: '1000px', cursor: 'pointer' }}>
          <div style={{
            position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.6s',
            transform: kart.acik ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', borderRadius: '8px', padding: '3px', background: '#1e293b', border: '1px solid #334155', boxSizing: 'border-box' }}>
              <img src={kartArkasiResmi} style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} />
            </div>
            <div style={{
              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
              transform: kart.ters ? 'rotateY(180deg) rotate(180deg)' : 'rotateY(180deg)',
              borderRadius: '8px', padding: '3px', background: 'linear-gradient(135deg, #eab308 0%, #3b0764 100%)', boxSizing: 'border-box'
            }}>
              <img src={`/assets/cards${kart.veri.resim}`} style={{ width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const inputStili = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #3b0764', backgroundColor: '#090d16', color: '#f8fafc', fontSize: '15px', fontFamily: '"Playfair Display", serif', boxSizing: 'border-box', marginTop: '5px' };
const menuButonStili = { width: '100%', backgroundColor: '#131927', color: '#e2e8f0', border: '1px solid #3b0764', padding: '14px 20px', fontSize: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Cinzel", serif', letterSpacing: '1px', textAlign: 'center', boxSizing: 'border-box' };
const aksiyonButonStili = { backgroundColor: '#581c87', color: '#f8fafc', border: '1px solid #a855f7', padding: '14px 24px', fontSize: '15px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Cinzel", serif', letterSpacing: '1px' };