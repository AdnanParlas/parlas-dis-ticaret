/* ============================================================
   PARLAS DIŞ TİCARET — VERİ / AYAR DOSYASI
   Buradaki değerleri kolayca düzenleyebilirsiniz.
   ============================================================ */

/* Güncel USD → TL kuru (TL gösterimi için). İstediğiniz zaman güncelleyin. */
const USD_TRY = 38.5;

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
    yorum: "Hesaplama aracı sayesinde maliyeti önceden gördüm, sürpriz olmadı. Kesinlikle tekrar çalışacağım." }
];

/* Kargo oranları:
   usdKg = kilogram başına nakliye ücreti (USD)
   minGun / maxGun = tahmini teslim süresi aralığı (gün) */
const KARGO = {
  hava:  { ad: "Hava Kargo",  usdKg: 6.0, minGun: 7,  maxGun: 12 },
  deniz: { ad: "Deniz Kargo", usdKg: 1.5, minGun: 30, maxGun: 45 }
};

/* Ticaret yaptığımız Çin'deki iş ortağı firmalar.
   fiyatCarpani = ürün+nakliye toplamını çarpan (1.0 = standart)
   gunFark      = teslim süresine eklenecek/çıkarılacak gün (- daha hızlı) */
const PARTNERS = [
  { id: "hongtai", ad: "Shenzhen Hongtai Electronics", sehir: "Shenzhen",
    aciklama: "Elektronik & LED ürünlerde uzman, premium kalite.", fiyatCarpani: 1.10, gunFark: -2 },
  { id: "guangtex", ad: "Guangzhou Textile Group", sehir: "Guangzhou",
    aciklama: "Tekstil ve kumaşta geniş üretim kapasitesi.", fiyatCarpani: 0.96, gunFark: 2 },
  { id: "yiwu", ad: "Yiwu Trade Co.", sehir: "Yiwu",
    aciklama: "En uygun fiyat, küçük siparişe uygun toptan merkez.", fiyatCarpani: 0.88, gunFark: 5 },
  { id: "ningbo", ad: "Ningbo Premium Mfg.", sehir: "Ningbo",
    aciklama: "Hızlı sevkiyat ve sıkı kalite kontrol.", fiyatCarpani: 1.05, gunFark: -3 }
];

/* Aktif ticaretini yaptığımız örnek ürünler.
   birimFiyatKgUSD = ürünün kilogram başına tahmini birim fiyatı (USD)
   foto = örnek görsel (internet varsa yüklenir; yoksa emoji gösterilir) */
const PRODUCTS = [
  { id: "elektronik", ad: "Elektronik Aksesuar", kategori: "Elektronik", ikon: "🔌", birimFiyatKgUSD: 14,
    foto: "https://loremflickr.com/400/300/electronics,gadget" },
  { id: "tekstil",    ad: "Tekstil & Kumaş",      kategori: "Tekstil",    ikon: "🧵", birimFiyatKgUSD: 7,
    foto: "https://loremflickr.com/400/300/textile,fabric" },
  { id: "oyuncak",    ad: "Oyuncak",              kategori: "Çocuk",      ikon: "🧸", birimFiyatKgUSD: 9,
    foto: "https://loremflickr.com/400/300/toys" },
  { id: "led",        ad: "LED Aydınlatma",       kategori: "Elektrik",   ikon: "💡", birimFiyatKgUSD: 11,
    foto: "https://loremflickr.com/400/300/led,light" },
  { id: "evaleti",    ad: "Küçük Ev Aleti",       kategori: "Beyaz Eşya", ikon: "🍳", birimFiyatKgUSD: 13,
    foto: "https://loremflickr.com/400/300/kitchen,appliance" },
  { id: "yedekparca", ad: "Otomotiv Yedek Parça", kategori: "Otomotiv",   ikon: "⚙️", birimFiyatKgUSD: 16,
    foto: "https://loremflickr.com/400/300/car,parts" }
];
