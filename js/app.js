/* ============================================================
   UYGULAMA MANTIĞI — ekran geçişleri, ürün kartları,
   maliyet/süre hesaplayıcı, ürün talep formu, iletişim
   ============================================================ */

const REQUESTS_KEY = "parlas_requests";

/* Seçili durum */
let selectedProductId = null;
let selectedPartnerId = null;
let selectedCargo = "hava";

/* ---------- Kısayollar ---------- */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ---------- Para / sayı biçimleme ---------- */
const fmtUSD = (n) => "$" + n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
const fmtTRY = (n) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺";

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
   ÜRÜN KARTLARI
   ============================================================ */
function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = PRODUCTS.map(p => `
    <button type="button" class="product-card" data-id="${p.id}">
      <span class="product-media">
        <img src="${p.foto}" alt="${p.ad}" loading="lazy"
             onerror="this.style.display='none'">
        <span class="product-ico">${p.ikon}</span>
      </span>
      <span class="product-body">
        <span class="product-name">${p.ad}</span>
        <span class="product-cat">${p.kategori}</span>
        <span class="product-price">${fmtUSD(p.birimFiyatKgUSD)} / kg</span>
      </span>
    </button>
  `).join("");

  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedProductId = card.dataset.id;
      grid.querySelectorAll(".product-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      calculate();
    });
  });
}

/* ============================================================
   TEDARİKÇİ FİRMA KARTLARI
   ============================================================ */
function renderPartners() {
  const grid = $("#partner-grid");
  grid.innerHTML = PARTNERS.map(p => {
    const fiyatEtiket = p.fiyatCarpani < 1 ? `%${Math.round((1 - p.fiyatCarpani) * 100)} daha uygun`
                       : p.fiyatCarpani > 1 ? `%${Math.round((p.fiyatCarpani - 1) * 100)} premium`
                       : "Standart fiyat";
    const sureEtiket = p.gunFark < 0 ? `${Math.abs(p.gunFark)} gün daha hızlı`
                      : p.gunFark > 0 ? `${p.gunFark} gün daha yavaş`
                      : "Standart süre";
    return `
      <button type="button" class="partner-card" data-id="${p.id}">
        <span class="partner-flag">🇨🇳</span>
        <span class="partner-name">${p.ad}</span>
        <span class="partner-city">${p.sehir}</span>
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

/* ============================================================
   HESAPLAYICI
   ============================================================ */
function setupCalculator() {
  $("#calc-kg").addEventListener("input", calculate);

  $$("#cargo-seg .seg-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedCargo = btn.dataset.cargo;
      $$("#cargo-seg .seg-btn").forEach(b => b.classList.remove("active"));
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

  let kg = parseFloat($("#calc-kg").value);
  if (!kg || kg <= 0) {
    box.className = "calc-result empty";
    box.textContent = "Lütfen geçerli bir ağırlık (kg) girin.";
    return;
  }

  const kargo = KARGO[selectedCargo];
  const partner = PARTNERS.find(p => p.id === selectedPartnerId); // seçilmemişse null

  const carpan = partner ? partner.fiyatCarpani : 1;
  const gunFark = partner ? partner.gunFark : 0;

  const birimToplam = product.birimFiyatKgUSD * kg;   // ürün bedeli
  const nakliyeToplam = kargo.usdKg * kg;             // nakliye bedeli
  const araToplam = birimToplam + nakliyeToplam;
  const toplamUSD = araToplam * carpan;               // tedarikçi çarpanı uygulanır
  const toplamTRY = toplamUSD * USD_TRY;

  // Teslim süresi (negatife düşmesin)
  const minGun = Math.max(1, kargo.minGun + gunFark);
  const maxGun = Math.max(minGun, kargo.maxGun + gunFark);

  const partnerSatir = partner
    ? `<span>Tedarikçi: <b>${partner.ad}</b> (${partner.sehir})</span>`
    : `<span class="warn">Tedarikçi seçilmedi — standart fiyat gösteriliyor.</span>`;

  box.className = "calc-result";
  box.innerHTML = `
    <div class="result-head">
      <span class="result-ico">${product.ikon}</span>
      <div>
        <strong>${product.ad}</strong>
        <span class="result-meta">${kg.toLocaleString("tr-TR")} kg · ${kargo.ad}${partner ? " · " + partner.sehir : ""}</span>
      </div>
    </div>
    <div class="result-grid">
      <div class="result-cell big">
        <span class="cell-label">Tahmini Toplam Maliyet</span>
        <span class="cell-value">${fmtUSD(toplamUSD)}</span>
        <span class="cell-sub">≈ ${fmtTRY(toplamTRY)}</span>
      </div>
      <div class="result-cell">
        <span class="cell-label">Tahmini Teslim Süresi</span>
        <span class="cell-value">${minGun}–${maxGun} gün</span>
        <span class="cell-sub">${kargo.ad}</span>
      </div>
    </div>
    <div class="result-breakdown">
      <span>Ürün bedeli: <b>${fmtUSD(birimToplam)}</b></span>
      <span>Nakliye (${fmtUSD(kargo.usdKg)}/kg): <b>${fmtUSD(nakliyeToplam)}</b></span>
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
