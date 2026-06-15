# Parlas Dış Ticaret

Çin ile ithalat & ihracat odaklı, **tamamen istemci tarafında (sunucusuz)** çalışan tanıtım ve
maliyet hesaplama sitesi. Backend yoktur; tüm veriler tarayıcıda `localStorage` ile saklanır.

## Özellikler

- **Kayıt / Giriş ekranı** — kullanıcı kaydı (localStorage), oturum hatırlama, çıkış.
- **Biz Kimiz + istatistikler** — şirket tanıtımı ve müşteri yorumları (kayıt ekranında da görünür).
- **Aktif ürünler** — örnek görselli ürün kartları.
- **Çinli tedarikçi firmalar** — seçilen firmaya göre fiyat ve teslim süresi değişir.
- **Maliyet/süre hesaplayıcı** — ağırlık (kg) + kargo tipine (Hava/Deniz) göre tahmini maliyet (USD/₺)
  ve teslim süresi.
- **Ürün talep formu** — listede olmayan ürün talepleri (localStorage'a kaydedilir).
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
hammaddeler, birim fiyat, önerilen firma), `PARTNERS` (Çinli firmalar, konum, kuruluş yılı),
`KARGO`, `KURLAR` (para birimleri/kurlar), `YORUMLAR`, `SIRKET` ve `ILETISIM` (telefon/e-posta/adres).

Ürün görselleri internet gerektirmeyen, [`js/app.js`](js/app.js) içindeki `urunGorseli()` ile çizilen
özel SVG illüstrasyonlardır (her ürünün `gorsel` anahtarına göre).

## Güvenlik notu

Sunucusuz bir demo olduğundan kullanıcı bilgileri tarayıcıda düz metin saklanır; gerçek bir kimlik
doğrulama / güvenlik sağlamaz.
