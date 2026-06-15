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
  { id: "tangsteel", ad: "Tangshan Iron & Steel Co.", sehir: "Tangshan", bolge: "Hebei", kurulus: 2004,
    aciklama: "Demir, çelik tel ve paslanmaz sac üretiminde Çin'in en büyük çelik bölgesinden.", fiyatCarpani: 1.04, gunFark: -1,
    kampanya: { urun: "tel", oran: 0.12, etiket: "Çelik telde %12 indirim" } },
  { id: "ningbometal", ad: "Ningbo Nonferrous Metals", sehir: "Ningbo", bolge: "Zhejiang", kurulus: 2011,
    aciklama: "Bakır ve alüminyum gibi demir dışı metallerde hızlı, sertifikalı tedarik.", fiyatCarpani: 1.08, gunFark: -2,
    kampanya: { urun: "bakir", oran: 0.08, etiket: "Bakırda %8 indirim" } },
  { id: "foshanplas", ad: "Foshan Polymer & Plastics", sehir: "Foshan", bolge: "Guangdong", kurulus: 2009,
    aciklama: "Plastik hammadde (granül) ve PVC profil/boruda geniş kapasite, uygun fiyat.", fiyatCarpani: 0.95, gunFark: 2 },
  { id: "shaoxtex", ad: "Shaoxing Textile & Yarn", sehir: "Shaoxing", bolge: "Zhejiang", kurulus: 2007,
    aciklama: "Kumaş ve iplikte Çin'in en büyük tekstil merkezi; kilo bazlı toptan.", fiyatCarpani: 0.97, gunFark: 1 },
  { id: "qingchem", ad: "Qingdao Rubber & Chemicals", sehir: "Qingdao", bolge: "Shandong", kurulus: 2006,
    aciklama: "Kauçuk hammadde, endüstriyel kimyasal ve kereste; liman avantajıyla deneyimli.", fiyatCarpani: 1.01, gunFark: 1 }
];

/* Aktif ticaretini yaptığımız hammadde / dökme ürünler — kilo ve ton ile satılır.
   birimFiyatKgUSD = ürünün kilogram başına tahmini birim fiyatı (USD)
   gorsel          = özel SVG illüstrasyon anahtarı (app.js içinde çizilir)
   onerilenFirma   = bu ürün için önerilen Çinli tedarikçi (PARTNERS id) */
const PRODUCTS = [
  { id: "demir",      ad: "Demir / Çelik Profil",    kategori: "Metal",      ikon: "🏗️", birimFiyatKgUSD: 0.9, gorsel: "demir",     onerilenFirma: "tangsteel" },
  { id: "tel",        ad: "Çelik Tel (Bobin)",       kategori: "Metal",      ikon: "🔗", birimFiyatKgUSD: 1.2,  gorsel: "tel",       onerilenFirma: "tangsteel" },
  { id: "paslanmaz",  ad: "Paslanmaz Çelik Sac",     kategori: "Metal",      ikon: "🪞", birimFiyatKgUSD: 3.2,  gorsel: "paslanmaz", onerilenFirma: "tangsteel" },
  { id: "aluminyum",  ad: "Alüminyum Külçe/Profil",  kategori: "Metal",      ikon: "🥫", birimFiyatKgUSD: 2.6,  gorsel: "aluminyum", onerilenFirma: "ningbometal" },
  { id: "bakir",      ad: "Bakır (Tel/Bobin)",       kategori: "Metal",      ikon: "🟤", birimFiyatKgUSD: 9.2,  gorsel: "bakir",     onerilenFirma: "ningbometal" },
  { id: "plastik",    ad: "Plastik Hammadde (Granül)",kategori: "Polimer",   ikon: "♻️", birimFiyatKgUSD: 1.5,  gorsel: "plastik",   onerilenFirma: "foshanplas", indirim: 0.15 },
  { id: "pvc",        ad: "PVC Boru / Profil",       kategori: "Polimer",    ikon: "🚰", birimFiyatKgUSD: 1.3,  gorsel: "pvc",       onerilenFirma: "foshanplas" },
  { id: "kaucuk",     ad: "Kauçuk Hammadde",         kategori: "Polimer",    ikon: "🛞", birimFiyatKgUSD: 1.9,  gorsel: "kaucuk",    onerilenFirma: "qingchem" },
  { id: "kumas",      ad: "Tekstil Kumaş (Top)",     kategori: "Tekstil",    ikon: "🧵", birimFiyatKgUSD: 6.0,  gorsel: "kumas",     onerilenFirma: "shaoxtex", indirim: 0.10 },
  { id: "iplik",      ad: "Polyester İplik",         kategori: "Tekstil",    ikon: "🧶", birimFiyatKgUSD: 4.0,  gorsel: "iplik",     onerilenFirma: "shaoxtex" },
  { id: "kimyasal",   ad: "Endüstriyel Kimyasal",    kategori: "Kimya",      ikon: "🧪", birimFiyatKgUSD: 2.2,  gorsel: "kimyasal",  onerilenFirma: "qingchem" },
  { id: "ahsap",      ad: "Ahşap / Kereste",         kategori: "İnşaat",     ikon: "🪵", birimFiyatKgUSD: 0.7,  gorsel: "ahsap",     onerilenFirma: "qingchem" }
];
