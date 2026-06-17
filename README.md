# Parlas Dış Ticaret

Çin ile ithalat & ihracat odaklı tanıtım ve maliyet hesaplama sitesi. Statik frontend (HTML/CSS/JS,
GitHub Pages) + veritabanı olarak **Supabase**. Kullanıcı kaydı/girişi **Supabase Auth**, ürün
talepleri ve abonelikler **Supabase Postgres** tablolarında (Row Level Security ile korunur) saklanır.
Kendi backend sunucumuz yoktur; tarayıcı doğrudan Supabase'e public **anon** anahtarla bağlanır.

## Özellikler

- **Kayıt / Giriş ekranı** — Supabase Auth ile kullanıcı kaydı, oturum hatırlama, çıkış.
- **Biz Kimiz + istatistikler** — şirket tanıtımı ve müşteri yorumları (kayıt ekranında da görünür).
- **Aktif ürünler** — özel SVG görselli, kg/ton ile satılan hammadde kartları.
- **Çinli tedarikçi firmalar** — seçilen firmaya göre fiyat ve teslim süresi değişir.
- **Maliyet hesaplayıcı** — ağırlık (kg/ton) + kargo + para birimine göre kalem kalem maliyet
  (mal bedeli, nakliye, sigorta, gümrük vergisi, KDV, komisyon) ve teslim süresi.
- **Döviz çevirici + canlı kur tablosu** — kurlar Avrupa Merkez Bankası verisinden (frankfurter.dev)
  otomatik güncellenir; günlük artış/azalış gösterilir.
- **Abonelik & danışmanlık** — Supabase'de saklanan abonelik; abonelere özel ürün önerileri ve teklifler.
- **Ürün talep formu** — Supabase'e kaydedilen ürün talepleri.
- **İletişim & konum** — telefon, e-posta, WhatsApp ve gömülü Google Haritalar.

## Çalıştırma

Sunucu gerekmez — `index.html` dosyasını bir tarayıcıda açmanız yeterli.

Yerel sunucuyla denemek isterseniz:

```bash
npx serve .
```

> Not: Ürün görselleri ve harita internet bağlantısı gerektirir; çevrimdışı açıldığında görseller
> otomatik olarak emoji ikonlara döner.

## Yapı

```
index.html        Sayfa yapısı (kayıt ekranı + ana panel)
css/style.css     Stiller (tek temadan renk yönetimi)
js/data.js        Ürünler, tedarikçiler, kargo oranları, iletişim — düzenlenebilir ayarlar
js/auth.js        Kayıt / giriş / oturum
js/app.js         Render, hesaplayıcı, formlar
```

## Özelleştirme

İçeriğin çoğu [`js/data.js`](js/data.js) içinden düzenlenebilir: `PRODUCTS` (kilo/ton ile satılan
hammaddeler, birim fiyat, gümrük oranı, indirim, önerilen firma), `PARTNERS` (Çinli firmalar, konum,
kuruluş yılı, kampanya), `KARGO`, `VERGI` (KDV/sigorta/komisyon), `KURLAR` (para birimleri, kur ve
günlük değişim), `ABONELIK` (planlar, önerilen ürünler, teklifler), `YORUMLAR`, `SIRKET` ve `ILETISIM`.

Ürün görselleri internet gerektirmeyen, [`js/app.js`](js/app.js) içindeki `urunGorseli()` ile çizilen
özel SVG illüstrasyonlardır (her ürünün `gorsel` anahtarına göre).

## Supabase

- Şema: [`supabase/migrations/`](supabase/migrations) (tablolar `product_requests`, `subscriptions` + RLS politikaları).
- İstemci yapılandırması: [`js/supabase.js`](js/supabase.js) — yalnızca **public anon** anahtar (RLS ile güvenli).
- E-posta onayı kapalıdır; kullanıcı kayıt olunca anında giriş yapar.
- `service_role` / secret anahtarları ve DB şifresi repoda **bulunmaz**; sadece CLI işlemlerinde kullanıldı.

## Güvenlik notu

Kimlik doğrulama Supabase Auth ile yapılır (şifreler Supabase tarafında güvenli saklanır). Veriler,
her kullanıcının yalnızca kendi kayıtlarına erişebildiği Row Level Security politikalarıyla korunur.
Abonelik ödeme akışı demodur (gerçek tahsilat yapılmaz).
