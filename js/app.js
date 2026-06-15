/* ============================================================
   UYGULAMA MANTIĞI — ekran geçişleri, ürün kartları,
   maliyet/süre hesaplayıcı, ürün talep formu, iletişim
   ============================================================ */

const REQUESTS_KEY = "parlas_requests";

/* Seçili durum */
let selectedProductId = null;
let selectedPartnerId = null;
let selectedCargo = "hava";
let selectedCurrency = "USD";
let selectedUnit = "kg";          // kg | ton

/* ---------- Kısayollar ---------- */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- Para / sayı biçimleme ---------- */
// USD tutarını seçili para birimine çevirip biçimler
function fmtPara(usd, kod = selectedCurrency) {
  const c = KURLAR[kod] || KURLAR.USD;
  const tutar = usd * c.kur;
  return c.sembol + tutar.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}
const fmtUSD = (n) => fmtPara(n, "USD");

/* ============================================================
   EKRAN GEÇİŞLERİ (gate <-> uygulama)
   ============================================================ */
function showApp(session) {
  $("#auth-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#user-greet").textContent = "Merhaba, " + (session.ad.split(" ")[0] || session.ad);
  window.scrollTo(0, 0);
}
function showAuth() {
  $("#app").classList.add("hidden");
  $("#auth-screen").classList.remove("hidden");
}

/* ============================================================
   KAYIT / GİRİŞ FORMLARI
   ============================================================ */
function setupAuthForms() {
  const tabReg = $("#tab-register");
  const tabLog = $("#tab-login");
  const regForm = $("#register-form");
  const logForm = $("#login-form");

  tabReg.addEventListener("click", () => {
    tabReg.classList.add("active"); tabLog.classList.remove("active");
    regForm.classList.remove("hidden"); logForm.classList.add("hidden");
  });
  tabLog.addEventListener("click", () => {
    tabLog.classList.add("active"); tabReg.classList.remove("active");
    logForm.classList.remove("hidden"); regForm.classList.add("hidden");
  });

  regForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(regForm);
    const res = registerUser({
      ad: fd.get("ad"), email: fd.get("email"),
      telefon: fd.get("telefon"), sifre: fd.get("sifre")
    });
    const msg = $("#register-msg");
    if (res.ok) { msg.textContent = ""; regForm.reset(); showApp(getSession()); }
    else { msg.textContent = res.error; msg.className = "form-msg error"; }
  });

  logForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(logForm);
    const res = loginUser({ email: fd.get("email"), sifre: fd.get("sifre") });
    const msg = $("#login-msg");
    if (res.ok) { msg.textContent = ""; logForm.reset(); showApp(getSession()); }
    else { msg.textContent = res.error; msg.className = "form-msg error"; }
  });

  $("#logout-btn").addEventListener("click", () => { clearSession(); showAuth(); });
}

/* ---------- Yıldız gösterimi ---------- */
function stars(n) {
  return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
}

/* ============================================================
   ŞİRKET HAKKINDA + İSTATİSTİK + YORUMLAR (render)
   ============================================================ */
function statHTML(s) {
  return `<div class="stat"><span class="stat-num">${s.sayi}</span><span class="stat-label">${s.etiket}</span></div>`;
}
function reviewHTML(r) {
  return `
    <div class="review">
      <div class="review-top">
        <span class="review-avatar">${r.ad.charAt(0)}</span>
        <div>
          <strong class="review-name">${r.ad}</strong>
          <span class="review-city">${r.sehir}</span>
        </div>
        <span class="review-stars">${stars(r.yildiz)}</span>
      </div>
      <p class="review-text">“${r.yorum}”</p>
    </div>`;
}

function renderAboutAndReviews() {
  // Ana paneldeki "Biz Kimiz"
  $("#about-title").textContent = SIRKET.baslik;
  $("#about-text").textContent  = SIRKET.metin;
  $("#about-stats").innerHTML   = SIRKET.istatistik.map(statHTML).join("");
  $("#reviews-grid").innerHTML  = YORUMLAR.map(reviewHTML).join("");

  // Kayıt ekranındaki tanıtım + yorumlar
  $("#auth-about-title").textContent = SIRKET.baslik;
  $("#auth-about-text").textContent  = SIRKET.metin;
  $("#auth-stats").innerHTML         = SIRKET.istatistik.map(statHTML).join("");
  $("#auth-reviews-list").innerHTML  = YORUMLAR.slice(0, 2).map(reviewHTML).join("");
}

/* ============================================================
   ÜRÜN GÖRSELLERİ — her hammadde için özel SVG illüstrasyon
   (internet gerektirmez, her zaman alakalı ve net)
   ============================================================ */
function urunGorseli(key) {
  const svg = (bg, inner) =>
    `<svg class="product-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
       <rect width="400" height="300" fill="${bg}"/>${inner}</svg>`;

  // Bobin/coil yardımcı (iç içe elipsler)
  const coil = (cx, cy, col, dark) => {
    let r = "";
    for (let i = 0; i < 5; i++)
      r += `<ellipse cx="${cx}" cy="${cy}" rx="${70 - i * 13}" ry="${78 - i * 14}" fill="none" stroke="${i % 2 ? dark : col}" stroke-width="9"/>`;
    return r;
  };

  switch (key) {
    case "demir": // I-profil / çelik kiriş istifi
      return svg("#e7ecf2", `
        <g stroke="#5e6675" stroke-width="3">
          ${[0, 1, 2].map(i => `
            <g fill="#9aa3b1" transform="translate(${110 + i * 90},${110 + i * 14})">
              <rect x="-58" y="-10" width="116" height="18" rx="2"/>
              <rect x="-12" y="-10" width="24" height="96" rx="2"/>
              <rect x="-58" y="78" width="116" height="18" rx="2"/>
            </g>`).join("")}
        </g>`);

    case "tel": // çelik tel bobini
      return svg("#e9edf2", `${coil(200, 150, "#aeb6c2", "#717b8a")}
        <path d="M262 120 q40 -10 55 20" fill="none" stroke="#717b8a" stroke-width="7"/>`);

    case "paslanmaz": // parlak sac levha istifi
      return svg("#eaeef3", `
        <g stroke="#9aa6b4" stroke-width="2.5">
          ${[0, 1, 2, 3].map(i => `
            <polygon points="70,${150 + i * 26} 250,${110 + i * 26} 330,${150 + i * 26} 150,${190 + i * 26}"
              fill="${i % 2 ? '#cdd6e0' : '#dde4ec'}"/>`).join("")}
        </g>
        <polygon points="250,110 330,150 330,158 250,118" fill="#aab4c1"/>`);

    case "aluminyum": // alüminyum külçe istifi
      return svg("#edf1f5", `
        <g stroke="#9aa6b4" stroke-width="2.5">
          ${[[140, 175], [215, 175], [177, 120]].map(([x, y]) => `
            <g transform="translate(${x},${y})">
              <polygon points="-55,18 55,18 42,-18 -42,-18" fill="#cdd6e0"/>
              <polygon points="-55,18 -42,-18 -42,2 -55,38" fill="#aab4c1"/>
              <polygon points="55,18 42,-18 42,2 55,38" fill="#bcc6d2"/>
            </g>`).join("")}
        </g>`);

    case "bakir": // bakır bobin
      return svg("#f4e7df", `${coil(200, 150, "#cf8a5f", "#9c5a34")}
        <path d="M262 120 q40 -10 55 20" fill="none" stroke="#9c5a34" stroke-width="7"/>`);

    case "plastik": { // plastik granül yığını
      const cols = ["#3bb2d0", "#f4b41a", "#e6584c", "#5cc28e", "#7a6ff0", "#ef8f3c"];
      let pel = "";
      const pts = [[160,210],[185,222],[210,212],[235,224],[150,232],[178,242],[205,236],[232,244],[258,232],[140,250],[168,258],[196,254],[224,260],[252,254],[278,250],[190,200],[222,202]];
      pts.forEach((p, i) => pel += `<ellipse cx="${p[0]}" cy="${p[1]}" rx="13" ry="10" fill="${cols[i % cols.length]}"/>`);
      return svg("#e6f4f1", `<rect x="120" y="120" width="160" height="60" rx="8" fill="#ffffff" opacity=".5"/>${pel}`);
    }

    case "pvc": // PVC boru demeti
      return svg("#eef1f4", `
        <g>
          ${[[150,170],[200,170],[250,170],[175,128],[225,128],[200,212]].map(([x, y]) => `
            <g transform="translate(${x},${y})">
              <rect x="-24" y="0" width="48" height="70" fill="#dfe5ec"/>
              <ellipse cx="0" cy="0" rx="24" ry="11" fill="#f3f6f9" stroke="#b9c3cf" stroke-width="2.5"/>
              <ellipse cx="0" cy="0" rx="12" ry="5.5" fill="#cdd6e0"/>
              <ellipse cx="0" cy="70" rx="24" ry="11" fill="#cdd6e0"/>
            </g>`).join("")}
        </g>`);

    case "kaucuk": // lastik / kauçuk
      return svg("#eceff2", `
        <ellipse cx="200" cy="155" rx="92" ry="92" fill="#2c2f36"/>
        <ellipse cx="200" cy="155" rx="62" ry="62" fill="#4a4e57"/>
        <ellipse cx="200" cy="155" rx="40" ry="40" fill="#d7dde4"/>
        <g stroke="#1d2025" stroke-width="6">
          ${Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return `<line x1="${200 + Math.cos(a) * 64}" y1="${155 + Math.sin(a) * 64}" x2="${200 + Math.cos(a) * 90}" y2="${155 + Math.sin(a) * 90}"/>`;
          }).join("")}
        </g>`);

    case "kumas": { // kumaş topları
      const cols = ["#e6584c", "#3bb2d0", "#f4b41a"];
      return svg("#f3eaf4", `
        <g stroke="#00000022" stroke-width="2">
          ${[0,1,2].map(i => `
            <g transform="translate(${120 + i * 80},120)">
              <rect x="-30" y="0" width="60" height="120" rx="6" fill="${cols[i]}"/>
              <ellipse cx="0" cy="0" rx="30" ry="13" fill="${cols[i]}" stroke="#00000033"/>
              <path d="M-22 0 a22 9 0 0 0 44 0" fill="none" stroke="#ffffff66" stroke-width="3"/>
            </g>`).join("")}
        </g>`);
    }

    case "iplik": { // iplik makaraları
      const cols = ["#7a6ff0", "#5cc28e", "#ef8f3c"];
      return svg("#f1ecf6", `
        ${[0,1,2].map(i => `
          <g transform="translate(${125 + i * 75},150)">
            <rect x="-8" y="-70" width="16" height="140" fill="#c9b48f"/>
            <rect x="-28" y="-58" width="56" height="116" rx="6" fill="${cols[i]}"/>
            <g stroke="#ffffff55" stroke-width="2.5">
              ${[-44,-30,-16,-2,12,26,40].map(y => `<line x1="-28" y1="${y}" x2="28" y2="${y + 8}"/>`).join("")}
            </g>
            <ellipse cx="0" cy="-70" rx="22" ry="7" fill="#d7c39c"/>
            <ellipse cx="0" cy="70" rx="22" ry="7" fill="#b89e74"/>
          </g>`).join("")}`);
    }

    case "kimyasal": { // kimyasal variller
      const cols = ["#2f6fb0", "#2f9e7a", "#b07a2f"];
      return svg("#e7eef7", `
        ${[0,1,2].map(i => `
          <g transform="translate(${120 + i * 80},115)">
            <rect x="-32" y="0" width="64" height="130" rx="8" fill="${cols[i]}"/>
            <ellipse cx="0" cy="0" rx="32" ry="12" fill="${cols[i]}" stroke="#ffffff55" stroke-width="2"/>
            <rect x="-32" y="34" width="64" height="9" fill="#ffffff44"/>
            <rect x="-32" y="90" width="64" height="9" fill="#ffffff44"/>
            <rect x="-14" y="-6" width="28" height="8" rx="3" fill="#00000033"/>
          </g>`).join("")}`);
    }

    case "ahsap": // kereste istifi
      return svg("#f1e9df", `
        <g stroke="#8a5a32" stroke-width="2.5">
          ${[0,1,2,3].map(i => `
            <g transform="translate(110,${120 + i * 34})">
              <rect x="0" y="0" width="180" height="28" rx="3" fill="${i % 2 ? '#c08a52' : '#b07d46'}"/>
              <ellipse cx="0" cy="14" rx="9" ry="14" fill="#d8b483"/>
              <ellipse cx="0" cy="14" rx="4" ry="7" fill="#b88a55"/>
              <ellipse cx="180" cy="14" rx="9" ry="14" fill="#d8b483"/>
            </g>`).join("")}
        </g>`);

    default:
      return svg("#e7ecf2", `<text x="200" y="170" font-size="90" text-anchor="middle">📦</text>`);
  }
}

/* ============================================================
   ÜRÜN KARTLARI
   ============================================================ */
function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = PRODUCTS.map(p => `
    <button type="button" class="product-card" data-id="${p.id}">
      <span class="product-media">${urunGorseli(p.gorsel)}</span>
      <span class="product-body">
        <span class="product-name">${p.ad}</span>
        <span class="product-cat">${p.kategori}</span>
        <span class="product-price">$${p.birimFiyatKgUSD.toFixed(2)} / kg</span>
      </span>
    </button>
  `).join("");

  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedProductId = card.dataset.id;
      grid.querySelectorAll(".product-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      updateRecommended();   // önerilen firmayı işaretle (seçim zorunlu değil)
      calculate();
    });
  });
}

/* ============================================================
   TEDARİKÇİ FİRMA KARTLARI
   ============================================================ */
function renderPartners() {
  const grid = $("#partner-grid");
  const buYil = new Date().getFullYear();
  grid.innerHTML = PARTNERS.map(p => {
    const fiyatEtiket = p.fiyatCarpani < 1 ? `%${Math.round((1 - p.fiyatCarpani) * 100)} daha uygun`
                       : p.fiyatCarpani > 1 ? `%${Math.round((p.fiyatCarpani - 1) * 100)} premium`
                       : "Standart fiyat";
    const sureEtiket = p.gunFark < 0 ? `${Math.abs(p.gunFark)} gün daha hızlı`
                      : p.gunFark > 0 ? `${p.gunFark} gün daha yavaş`
                      : "Standart süre";
    const yil = buYil - p.kurulus;
    return `
      <button type="button" class="partner-card" data-id="${p.id}">
        <span class="partner-rec hidden">⭐ Önerilen firma</span>
        <span class="partner-flag">🇨🇳</span>
        <span class="partner-name">${p.ad}</span>
        <span class="partner-city">📍 ${p.sehir}, ${p.bolge}</span>
        <span class="partner-since">🏭 ${p.kurulus}'den beri · ${yil} yıllık tecrübe</span>
        <span class="partner-desc">${p.aciklama}</span>
        <span class="partner-tags">
          <span class="tag tag-price">${fiyatEtiket}</span>
          <span class="tag tag-time">${sureEtiket}</span>
        </span>
      </button>`;
  }).join("");

  grid.querySelectorAll(".partner-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedPartnerId = card.dataset.id;
      grid.querySelectorAll(".partner-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      calculate();
    });
  });
}

/* Seçili ürünün önerilen firmasını işaretler (kullanıcıyı seçime zorlamaz) */
function updateRecommended() {
  const product = PRODUCTS.find(p => p.id === selectedProductId);
  const onerilen = product ? product.onerilenFirma : null;
  $$("#partner-grid .partner-card").forEach(card => {
    const rec = card.querySelector(".partner-rec");
    const isRec = card.dataset.id === onerilen;
    card.classList.toggle("is-recommended", isRec);
    rec.classList.toggle("hidden", !isRec);
  });
}

/* ============================================================
   HESAPLAYICI
   ============================================================ */
function setupCalculator() {
  $("#calc-miktar").addEventListener("input", calculate);
  $("#calc-currency").addEventListener("change", (e) => {
    selectedCurrency = e.target.value;
    calculate();
  });

  $$("#cargo-seg .seg-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedCargo = btn.dataset.cargo;
      $$("#cargo-seg .seg-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      calculate();
    });
  });

  $$("#unit-seg .seg-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedUnit = btn.dataset.unit;
      $$("#unit-seg .seg-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      calculate();
    });
  });
}

function calculate() {
  const box = $("#calc-result");
  const product = PRODUCTS.find(p => p.id === selectedProductId);

  if (!product) {
    box.className = "calc-result empty";
    box.textContent = "Hesaplama için yukarıdan bir ürün seçin.";
    return;
  }

  const miktar = parseFloat($("#calc-miktar").value);
  if (!miktar || miktar <= 0) {
    box.className = "calc-result empty";
    box.textContent = `Lütfen geçerli bir ağırlık (${selectedUnit}) girin.`;
    return;
  }

  // Ağırlığı kg'a çevir (ton seçiliyse x1000)
  const kg = selectedUnit === "ton" ? miktar * 1000 : miktar;

  const kargo = KARGO[selectedCargo];
  const partner = PARTNERS.find(p => p.id === selectedPartnerId);   // seçilmemişse null

  const carpan = partner ? partner.fiyatCarpani : 1;
  const gunFark = partner ? partner.gunFark : 0;

  const birimToplam = product.birimFiyatKgUSD * kg;   // ürün bedeli (USD)
  const nakliyeToplam = kargo.usdKg * kg;             // nakliye bedeli (USD)
  const araToplam = birimToplam + nakliyeToplam;
  const toplamUSD = araToplam * carpan;               // tedarikçi çarpanı uygulanır

  // Teslim süresi (negatife düşmesin)
  const minGun = Math.max(1, kargo.minGun + gunFark);
  const maxGun = Math.max(minGun, kargo.maxGun + gunFark);

  // Tedarikçi satırı + önerilen firma bilgisi
  const onerilen = PARTNERS.find(p => p.id === product.onerilenFirma);
  let partnerSatir;
  if (partner) {
    const onerilenMi = partner.id === product.onerilenFirma ? " ⭐ (önerilen)" : "";
    partnerSatir = `<span>Tedarikçi: <b>${partner.ad}</b> (${partner.sehir})${onerilenMi}</span>`;
  } else if (onerilen) {
    partnerSatir = `<span class="warn">Önerilen firma: <b>${onerilen.ad}</b> — seçmek için karta tıklayın (zorunlu değil).</span>`;
  } else {
    partnerSatir = `<span class="warn">Tedarikçi seçilmedi — standart fiyat gösteriliyor.</span>`;
  }

  // İkincil para birimi referansı (seçili USD değilse USD'yi de göster)
  const altSatir = selectedCurrency === "USD"
    ? `≈ ${fmtPara(toplamUSD, "TRY")}`
    : `≈ ${fmtPara(toplamUSD, "USD")}`;

  const agirlikMetni = selectedUnit === "ton"
    ? `${miktar.toLocaleString("tr-TR")} ton (${kg.toLocaleString("tr-TR")} kg)`
    : `${kg.toLocaleString("tr-TR")} kg`;

  box.className = "calc-result";
  box.innerHTML = `
    <div class="result-head">
      <span class="result-ico">${product.ikon}</span>
      <div>
        <strong>${product.ad}</strong>
        <span class="result-meta">${agirlikMetni} · ${kargo.ad}${partner ? " · " + partner.sehir : ""}</span>
      </div>
    </div>
    <div class="result-grid">
      <div class="result-cell big">
        <span class="cell-label">Tahmini Toplam Maliyet</span>
        <span class="cell-value">${fmtPara(toplamUSD)}</span>
        <span class="cell-sub">${altSatir}</span>
      </div>
      <div class="result-cell">
        <span class="cell-label">Tahmini Teslim Süresi</span>
        <span class="cell-value">${minGun}–${maxGun} gün</span>
        <span class="cell-sub">${kargo.ad}</span>
      </div>
    </div>
    <div class="result-breakdown">
      <span>Ürün bedeli: <b>${fmtPara(birimToplam)}</b></span>
      <span>Nakliye: <b>${fmtPara(nakliyeToplam)}</b></span>
      ${partnerSatir}
    </div>
  `;
}

/* ============================================================
   ÜRÜN TALEP FORMU
   ============================================================ */
function setupRequestForm() {
  const form = $("#request-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const urun = (fd.get("urun") || "").trim();
    const miktar = (fd.get("miktar") || "").trim();
    const not = (fd.get("not") || "").trim();
    const msg = $("#request-msg");

    if (!urun) { msg.textContent = "Lütfen ürün adını girin."; msg.className = "form-msg error"; return; }

    const session = getSession();
    const list = JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
    list.push({
      urun, miktar, not,
      musteri: session ? session.ad : "",
      email: session ? session.email : "",
      tarih: new Date().toISOString()
    });
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));

    form.reset();
    msg.textContent = "✅ Talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.";
    msg.className = "form-msg success";
  });
}

/* ============================================================
   İLETİŞİM BİLGİLERİ
   ============================================================ */
function setupContact() {
  const phone = $("#contact-phone");
  phone.href = "tel:" + ILETISIM.telefonRaw;
  $("#contact-phone-text").textContent = ILETISIM.telefon;

  const mail = $("#contact-mail");
  mail.href = "mailto:" + ILETISIM.email + "?subject=Çin%20Dış%20Ticaret%20Bilgi%20Talebi";
  $("#contact-mail-text").textContent = ILETISIM.email;

  $("#contact-wa").href = "https://wa.me/" + ILETISIM.whatsapp;

  // Konum + harita
  $("#contact-address").textContent = ILETISIM.adres;
  const sorgu = encodeURIComponent(ILETISIM.haritaSorgu);
  $("#contact-map-link").href = "https://www.google.com/maps?q=" + sorgu;
  $("#map-frame").src = "https://www.google.com/maps?q=" + sorgu + "&output=embed";
}

/* ============================================================
   BAŞLATMA
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  setupAuthForms();
  renderAboutAndReviews();
  renderProducts();
  renderPartners();
  setupCalculator();
  setupRequestForm();
  setupContact();
  $("#year").textContent = new Date().getFullYear();

  // Oturum varsa doğrudan uygulamayı göster
  const session = getSession();
  if (session) showApp(session);
});
