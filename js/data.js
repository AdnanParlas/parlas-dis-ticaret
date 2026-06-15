/* ============================================================
   PARLAS DIŞ TİCARET — VERİ / AYAR DOSYASI
   Buradaki değerleri kolayca düzenleyebilirsiniz.
   ============================================================ */

/* Para birimleri. kur = 1 USD karşılığı o para biriminden kaç birim.
   İstediğiniz zaman güncelleyin. */
const KURLAR = {
  USD: { ad: "ABD Doları",   sembol: "$", kur: 1 },
  TRY: { ad: "Türk Lirası",  sembol: "₺", kur: 38.5 },
  EUR: { ad: "Euro",         sembol: "€", kur: 0.92 },
  GBP: { ad: "İngiliz Sterlini", sembol: "£", kur: 0.78 }
};

/* İletişim & konum bilgileri — placeholder. Gerçek bilgilerinizle değiştirin. */
const ILETISIM = {
  telefon: "+90 5xx xxx xx xx",
  telefonRaw: "+905xxxxxxxxx",          // tel: bağlantısı için boşluksuz
  email: "info@parlasticaret.com",
  whatsapp: "905xxxxxxxxx",             // ülke kodu + numara (+ ve boşluk olmadan)
  adres: "Atatürk Mah. Ticaret Cad. No:12, Ataşehir / İstanbul, Türkiye",
  haritaSorgu: "Ataşehir İstanbul"      // Google Haritalar embed sorgusu
};

/* Şirket hakkında metni (kaç yıldır sektörde, neden bu işi yapıyoruz). */
const SIRKET = {
  kurulus: 2009,
  baslik: "Biz Kimiz?",
  metin:
    "Parlas Dış Ticaret olarak 2009'dan bu yana, yani 15 yılı aşkın süredir Çin ile Türkiye " +
    "arasında köprü kuruyoruz. Bu işe, küçük işletmelerin de büyük firmalar kadar güvenli ve " +
    "uygun maliyetle ithalat yapabilmesi gerektiğine inandığımız için başladık. " +
    "Doğru fabrikayı bulmaktan numune kontrolüne, gümrük süreçlerinden kapınıza teslimata kadar " +
    "tüm yükü biz taşıyoruz; siz sadece işinize odaklanın.",
  istatistik: [
    { sayi: "15+", etiket: "Yıllık tecrübe" },
    { sayi: "1.200+", etiket: "Mutlu müşteri" },
    { sayi: "40+",  etiket: "Çinli iş ortağı" },
    { sayi: "%99",  etiket: "Zamanında teslim" }
  ]
};

/* Müşteri yorumları. */
const YORUMLAR = [
  { ad: "Mehmet Y.",  sehir: "İstanbul", yildiz: 5,
    yorum: "İlk ithalatımı Parlas ile yaptım. Süreç boyunca her adımda bilgilendirildim, ürünler tahmin edilen sürede geldi." },
  { ad: "Ayşe K.",    sehir: "Bursa",    yildiz: 5,
    yorum: "Tekstil ürünlerinde fiyat farkını gerçekten hissettim. Numune onayı olmadan sevkiyat yapmamaları çok güven verici." },
  { ad: "Emre D.",    sehir: "İzmir",    yildiz: 4,
    yorum: "Elektronik aksesuar getirttim, gümrükte hiç uğraşmadım. Tek eksik biraz daha hızlı dönüş olabilirdi ama sonuç harika." },
  { ad: "Selin A.",   sehir: "Ankara",   yildiz: 5,
    yorum: "Hesaplama aracı sayesinde maliyeti önceden gördüm, sürpriz olmadı. Kesinlikle tekrar çalışacağım." },
  { ad: "Burak T.",   sehir: "Antalya",  yildiz: 5,
    yorum: "Önerdikleri Çinli firma tam aradığım kaliteyi sundu. Firma eşleştirmesi gerçekten işe yarıyor." },
  { ad: "Zeynep O.",  sehir: "Konya",    yildiz: 4,
    yorum: "Deniz kargosuyla maliyeti epey düşürdüm. Süreç biraz uzun ama bütçe dostu, planlı çalışınca sorun olmuyor." },
  { ad: "Hakan S.",   sehir: "Gaziantep",yildiz: 5,
    yorum: "Toplu otomotiv parçası ithalatında bize özel fiyat çıkardılar. İletişim çok hızlı, her sorumuza anında yanıt." },
  { ad: "Derya M.",   sehir: "Kocaeli",  yildiz: 5,
    yorum: "Küçük bir işletmeyim, beni de büyük müşteri gibi karşıladılar. Para birimini Euro seçip kolayca bütçe yaptım." }
];

/* Kargo oranları:
   usdKg = kilogram başına nakliye ücreti (USD)
   minGun / maxGun = tahmini teslim süresi aralığı (gün) */
const KARGO = {
  hava:  { ad: "Hava Kargo",  usdKg: 6.0, minGun: 7,  maxGun: 12 },
  deniz: { ad: "Deniz Kargo", usdKg: 1.5, minGun: 30, maxGun: 45 }
};

/* Ticaret yaptığımız Çin'deki iş ortağı firmalar.
   sehir / bolge = konum
   kurulus       = firmanın kuruluş yılı (kaç yıldır sektörde olduğu otomatik hesaplanır)
   fiyatCarpani  = ürün+nakliye toplamını çarpan (1.0 = standart)
   gunFark       = teslim süresine eklenecek/çıkarılacak gün (- daha hızlı) */
const PARTNERS = [
  { id: "hongtai", ad: "Shenzhen Hongtai Electronics", sehir: "Shenzhen", bolge: "Guangdong", kurulus: 2008,
    aciklama: "Elektronik & LED ürünlerde uzman, premium kalite.", fiyatCarpani: 1.10, gunFark: -2 },
  { id: "guangtex", ad: "Guangzhou Textile Group", sehir: "Guangzhou", bolge: "Guangdong", kurulus: 2005,
    aciklama: "Tekstil, giyim ve ayakkabıda geniş üretim kapasitesi.", fiyatCarpani: 0.96, gunFark: 2 },
  { id: "yiwu", ad: "Yiwu Trade Co.", sehir: "Yiwu", bolge: "Zhejiang", kurulus: 2012,
    aciklama: "En uygun fiyat; oyuncak, aksesuar ve küçük ürünlerde toptan merkez.", fiyatCarpani: 0.88, gunFark: 5 },
  { id: "ningbo", ad: "Ningbo Premium Mfg.", sehir: "Ningbo", bolge: "Zhejiang", kurulus: 2010,
    aciklama: "Ev aletleri ve enerji ürünlerinde hızlı sevkiyat, sıkı kalite kontrol.", fiyatCarpani: 1.05, gunFark: -3 },
  { id: "qingdao", ad: "Qingdao AutoParts Ltd.", sehir: "Qingdao", bolge: "Shandong", kurulus: 2006,
    aciklama: "Otomotiv yedek parça ve endüstriyel ürünlerde deneyimli.", fiyatCarpani: 1.02, gunFark: 1 }
];

/* Aktif ticaretini yaptığımız örnek ürünler.
   birimFiyatKgUSD = ürünün kilogram başına tahmini birim fiyatı (USD)
   foto            = ürünle ilgili örnek görsel (internet gerektirir)
   onerilenFirma   = bu ürün için önerilen Çinli tedarikçi (PARTNERS id) */
const PRODUCTS = [
  { id: "kulaklik", ad: "Kablosuz Kulaklık", kategori: "Elektronik", ikon: "🎧", birimFiyatKgUSD: 22, onerilenFirma: "hongtai",
    foto: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop" },
  { id: "saat", ad: "Akıllı Saat", kategori: "Elektronik", ikon: "⌚", birimFiyatKgUSD: 28, onerilenFirma: "hongtai",
    foto: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop" },
  { id: "led", ad: "LED Aydınlatma", kategori: "Elektrik", ikon: "💡", birimFiyatKgUSD: 11, onerilenFirma: "hongtai",
    foto: "https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=400&h=300&fit=crop" },
  { id: "tekstil", ad: "Tekstil & Giyim", kategori: "Tekstil", ikon: "👕", birimFiyatKgUSD: 8, onerilenFirma: "guangtex",
    foto: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=300&fit=crop" },
  { id: "ayakkabi", ad: "Spor Ayakkabı", kategori: "Tekstil", ikon: "👟", birimFiyatKgUSD: 12, onerilenFirma: "guangtex",
    foto: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop" },
  { id: "oyuncak", ad: "Oyuncak", kategori: "Çocuk", ikon: "🧸", birimFiyatKgUSD: 9, onerilenFirma: "yiwu",
    foto: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=300&fit=crop" },
  { id: "gozluk", ad: "Güneş Gözlüğü", kategori: "Aksesuar", ikon: "🕶️", birimFiyatKgUSD: 18, onerilenFirma: "yiwu",
    foto: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop" },
  { id: "canta", ad: "Çanta & Bavul", kategori: "Aksesuar", ikon: "👜", birimFiyatKgUSD: 15, onerilenFirma: "yiwu",
    foto: "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop" },
  { id: "evaleti", ad: "Küçük Ev Aleti", kategori: "Beyaz Eşya", ikon: "🍳", birimFiyatKgUSD: 13, onerilenFirma: "ningbo",
    foto: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=400&h=300&fit=crop" },
  { id: "mutfak", ad: "Mutfak Robotu", kategori: "Beyaz Eşya", ikon: "🔪", birimFiyatKgUSD: 17, onerilenFirma: "ningbo",
    foto: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop" },
  { id: "gunespaneli", ad: "Güneş Paneli", kategori: "Enerji", ikon: "🔆", birimFiyatKgUSD: 20, onerilenFirma: "ningbo",
    foto: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=300&fit=crop" },
  { id: "yedekparca", ad: "Otomotiv Yedek Parça", kategori: "Otomotiv", ikon: "⚙️", birimFiyatKgUSD: 16, onerilenFirma: "qingdao",
    foto: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop" }
];
