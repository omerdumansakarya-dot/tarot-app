// src/components/AdBanner.jsx
import { useEffect } from 'react';

export default function AdBanner({ dataAdSlot, dataAdFormat = 'auto', fullWidthResponsive = 'true' }) {
  useEffect(() => {
    try {
      // Sayfa veya bileşen her yüklendiğinde AdSense'e reklamı basmasını söyler
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense yükleme hatası:', err);
    }
  }, []);

  return (
    <div style={{ margin: '15px auto', textAlign: 'center', overflow: 'hidden', minHeight: '90px', width: '100%' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1228419972367706"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={fullWidthResponsive}
      ></ins>
    </div>
  );
}