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
  const isaret = tutar < 0 ? "−" : "";
  return isaret + c.sembol + Math.abs(tutar).toLocaleString("tr-TR", { maximumFractionDigits: 0 });
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

/* ---------- Kategori rengi (renkli etiket) ---------- */
const KAT_RENK = {
  "Metal": "#64748b", "Polimer": "#06b6d4", "Tekstil": "#ec4899",
  "Kimya": "#8b5cf6", "İnşaat": "#f59e0b", "Enerji": "#22c55e", "Aksesuar": "#f43f5e"
};
const katRenk = (k) => KAT_RENK[k] || "#6d28d9";

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
  const id = "g_" + key;   // bu kartın gradient id öneki (çakışmayı önler)

  // dikey degrade tanımı
  const grad = (sfx, c1, c2) =>
    `<linearGradient id="${id}${sfx}" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
  const gradH = (sfx, c1, c2) =>
    `<linearGradient id="${id}${sfx}" x1="0" y1="0" x2="1" y2="0">
       <stop offset="0" stop-color="${c1}"/><stop offset="0.5" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></linearGradient>`;
  const u = (sfx) => `url(#${id}${sfx})`;

  // çerçeve: degrade arka plan + yumuşak zemin gölgesi
  const frame = (bgTop, bgBot, defs, inner) =>
    `<svg class="product-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
       <defs>${grad("bg", bgTop, bgBot)}${defs || ""}</defs>
       <rect width="400" height="300" fill="${u("bg")}"/>
       <ellipse cx="200" cy="250" rx="155" ry="24" fill="#1a2233" opacity="0.08"/>
       ${inner}</svg>`;

  // metalik bobin (yatay degrade halkalar + parlama)
  const coil = (cx, cy, gsfx) => {
    let r = "";
    for (let i = 0; i < 5; i++)
      r += `<ellipse cx="${cx}" cy="${cy}" rx="${72 - i * 13}" ry="${80 - i * 14}" fill="none" stroke="${u(gsfx)}" stroke-width="10"/>`;
    r += `<ellipse cx="${cx - 26}" cy="${cy - 30}" rx="10" ry="26" fill="#ffffff" opacity="0.35" transform="rotate(-20 ${cx} ${cy})"/>`;
    return r;
  };

  switch (key) {
    case "demir": // çelik I-profil istifi
      return frame("#eef2f7", "#d8dee7", grad("m", "#b9c1cd", "#7d8694") + grad("s", "#dde3ea", "#aab3c0"),
        `<g stroke="#5e6675" stroke-width="2.5">
          ${[0,1,2].map(i => `
            <g transform="translate(${112 + i * 88},${112 + i * 14})">
              <rect x="-58" y="-10" width="116" height="18" rx="2" fill="${u("s")}"/>
              <rect x="-12" y="-10" width="24" height="96" rx="2" fill="${u("m")}"/>
              <rect x="-58" y="78" width="116" height="18" rx="2" fill="${u("m")}"/>
              <rect x="-58" y="-10" width="116" height="5" fill="#ffffff" opacity="0.45"/>
            </g>`).join("")}
        </g>`);

    case "tel": // çelik tel bobini
      return frame("#eef2f7", "#d9dfe7", gradH("m", "#8a93a2", "#d3d9e1"),
        `${coil(200, 150, "m")}
         <path d="M268 122 q42 -12 58 18" fill="none" stroke="#8a93a2" stroke-width="8"/>`);

    case "paslanmaz": // parlak paslanmaz sac istifi
      return frame("#eef2f7", "#dadfe7", grad("a", "#e8edf3", "#c2cad6") + grad("b", "#d2dae4", "#aab4c1"),
        `<g stroke="#9aa6b4" stroke-width="2">
          ${[0,1,2,3].map(i => `
            <polygon points="70,${150 + i*26} 250,${110 + i*26} 330,${150 + i*26} 150,${190 + i*26}"
              fill="${i % 2 ? u("b") : u("a")}"/>`).join("")}
        </g>
        <polygon points="150,190 250,150 250,158 150,198" fill="#ffffff" opacity="0.35"/>`);

    case "aluminyum": // alüminyum külçe istifi
      return frame("#eef2f7", "#dadfe7", grad("t", "#e3e8ee", "#c4ccd7") + grad("l", "#aab4c1", "#8f99a8") + grad("r", "#cdd6e0", "#aeb8c5"),
        `<g stroke="#8f99a8" stroke-width="2">
          ${[[140,178],[214,178],[177,124]].map(([x,y]) => `
            <g transform="translate(${x},${y})">
              <polygon points="-55,18 55,18 42,-18 -42,-18" fill="${u("t")}"/>
              <polygon points="-55,18 -42,-18 -42,2 -55,38" fill="${u("l")}"/>
              <polygon points="55,18 42,-18 42,2 55,38" fill="${u("r")}"/>
            </g>`).join("")}
        </g>`);

    case "bakir": // bakır bobin
      return frame("#f6ece4", "#ecd9cb", gradH("m", "#9c5a34", "#e8a877"),
        `${coil(200, 150, "m")}
         <path d="M268 122 q42 -12 58 18" fill="none" stroke="#9c5a34" stroke-width="8"/>`);

    case "plastik": { // parlak plastik granül yığını
      const cols = ["#3bb2d0", "#f4b41a", "#e6584c", "#5cc28e", "#7a6ff0", "#ef8f3c"];
      const pts = [[160,212],[185,224],[210,214],[235,226],[150,234],[178,244],[205,238],[232,246],[258,234],[140,252],[168,260],[196,256],[224,262],[252,256],[278,252],[190,202],[222,204]];
      const pel = pts.map((p,i) =>
        `<ellipse cx="${p[0]}" cy="${p[1]}" rx="13" ry="10" fill="${cols[i % cols.length]}"/>
         <ellipse cx="${p[0]-4}" cy="${p[1]-3}" rx="4" ry="3" fill="#ffffff" opacity="0.55"/>`).join("");
      return frame("#e9f6f2", "#d3ece4", "",
        `<path d="M120 200 q80 -34 160 0 l-8 56 q-72 22 -144 0 z" fill="#ffffff" opacity="0.45"/>${pel}`);
    }

    case "pvc": // PVC boru demeti
      return frame("#eef2f6", "#dde3ea", grad("p", "#f4f7fa", "#c4cdd8"),
        `<g>
          ${[[150,172],[200,172],[250,172],[175,130],[225,130],[200,214]].map(([x,y]) => `
            <g transform="translate(${x},${y})">
              <rect x="-24" y="0" width="48" height="68" fill="${u("p")}"/>
              <ellipse cx="0" cy="0" rx="24" ry="11" fill="#f5f8fb" stroke="#b9c3cf" stroke-width="2.5"/>
              <ellipse cx="0" cy="0" rx="12" ry="5.5" fill="#cdd6e0"/>
              <ellipse cx="0" cy="68" rx="24" ry="11" fill="#cdd6e0"/>
            </g>`).join("")}
        </g>`);

    case "kaucuk": // lastik / kauçuk
      return frame("#eef1f5", "#dde2e9", grad("t", "#3a3e46", "#222529"),
        `<ellipse cx="200" cy="155" rx="94" ry="94" fill="${u("t")}"/>
         <ellipse cx="200" cy="155" rx="62" ry="62" fill="#4a4e57"/>
         <ellipse cx="200" cy="155" rx="40" ry="40" fill="#e3e8ee"/>
         <ellipse cx="200" cy="155" rx="40" ry="40" fill="none" stroke="#aab4c1" stroke-width="4"/>
         <g stroke="#1d2025" stroke-width="7" stroke-linecap="round">
          ${Array.from({length:14}).map((_,i) => {
            const a = (i/14) * Math.PI * 2;
            return `<line x1="${200+Math.cos(a)*64}" y1="${155+Math.sin(a)*64}" x2="${200+Math.cos(a)*92}" y2="${155+Math.sin(a)*92}"/>`;
          }).join("")}
         </g>
         <path d="M150 110 a92 92 0 0 1 70 -22" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.18"/>`);

    case "kumas": { // kumaş topları
      const cols = [["#ef6a5e","#d63f33"], ["#46bcd8","#2e96b2"], ["#f6c032","#e09a0e"]];
      return frame("#f5edf6", "#e7d8ea", cols.map((c,i) => grad("c"+i, c[0], c[1])).join(""),
        `<g stroke="#00000022" stroke-width="2">
          ${[0,1,2].map(i => `
            <g transform="translate(${120 + i*80},118)">
              <rect x="-30" y="0" width="60" height="122" rx="6" fill="${u("c"+i)}"/>
              <ellipse cx="0" cy="0" rx="30" ry="13" fill="${cols[i][0]}" stroke="#00000033"/>
              <path d="M-22 2 a22 9 0 0 0 44 0" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.55"/>
              <rect x="-30" y="6" width="8" height="116" fill="#ffffff" opacity="0.18"/>
            </g>`).join("")}
        </g>`);
    }

    case "iplik": { // iplik makaraları
      const c2 = [["#8a7ff5","#5f54d6"], ["#67cf9b","#3fae74"], ["#f59a4a","#e07a2a"]];
      return frame("#f1ecf7", "#e2d9ef", c2.map((c,i) => grad("y"+i, c[0], c[1])).join(""),
        `${[0,1,2].map(i => `
          <g transform="translate(${125 + i*75},150)">
            <rect x="-8" y="-70" width="16" height="140" fill="#c9b48f"/>
            <rect x="-28" y="-58" width="56" height="116" rx="6" fill="${u("y"+i)}"/>
            <g stroke="#ffffff" stroke-width="2.5" opacity="0.4">
              ${[-44,-30,-16,-2,12,26,40].map(y => `<line x1="-28" y1="${y}" x2="28" y2="${y+8}"/>`).join("")}
            </g>
            <ellipse cx="0" cy="-70" rx="22" ry="7" fill="#d7c39c"/>
            <ellipse cx="0" cy="70" rx="22" ry="7" fill="#b89e74"/>
          </g>`).join("")}`);
    }

    case "kimyasal": { // kimyasal variller
      const cols = [["#3f86c9","#235e97"], ["#3fb693","#22785f"], ["#c79140","#8f6a2a"]];
      return frame("#e8eff8", "#d6e1ef", cols.map((c,i) => grad("d"+i, c[0], c[1])).join(""),
        `${[0,1,2].map(i => `
          <g transform="translate(${120 + i*80},113)">
            <rect x="-32" y="0" width="64" height="132" rx="9" fill="${u("d"+i)}"/>
            <ellipse cx="0" cy="0" rx="32" ry="12" fill="${cols[i][0]}" stroke="#ffffff66" stroke-width="2"/>
            <rect x="-32" y="36" width="64" height="9" fill="#ffffff55"/>
            <rect x="-32" y="92" width="64" height="9" fill="#ffffff55"/>
            <rect x="-26" y="6" width="9" height="122" fill="#ffffff" opacity="0.22"/>
            <rect x="-14" y="-6" width="28" height="8" rx="3" fill="#00000033"/>
          </g>`).join("")}`);
    }

    case "ahsap": // kereste istifi
      return frame("#f3ece1", "#e6d8c4", grad("w1", "#c79262", "#a9713f") + grad("w2", "#b9824f", "#9a6336"),
        `<g stroke="#8a5a32" stroke-width="2.5">
          ${[0,1,2,3].map(i => `
            <g transform="translate(110,${120 + i*34})">
              <rect x="0" y="0" width="180" height="28" rx="3" fill="${i % 2 ? u("w1") : u("w2")}"/>
              <ellipse cx="0" cy="14" rx="9" ry="14" fill="#dcb98a"/>
              <ellipse cx="0" cy="14" rx="5.5" ry="9" fill="#c79a68"/>
              <ellipse cx="0" cy="14" rx="2.5" ry="4" fill="#b0814f"/>
              <ellipse cx="180" cy="14" rx="9" ry="14" fill="#dcb98a"/>
            </g>`).join("")}
        </g>`);

    case "eldiven": { // file (ağ dokulu) eldiven
      // eldiven parçaları (parmaklar + avuç + başparmak)
      const parts = `
        <rect x="163" y="98"  width="15" height="62" rx="7"/>
        <rect x="181" y="90"  width="15" height="70" rx="7"/>
        <rect x="199" y="92"  width="15" height="68" rx="7"/>
        <rect x="217" y="100" width="15" height="60" rx="7"/>
        <rect x="160" y="150" width="80" height="72" rx="20"/>
        <rect x="142" y="166" width="15" height="46" rx="7" transform="rotate(-32 149 189)"/>`;
      // ağ dokusu (çapraz çizgiler), eldivene kırpılır
      let mesh = "";
      for (let x = 120; x <= 280; x += 12) mesh += `<line x1="${x}" y1="80" x2="${x + 90}" y2="240"/>`;
      for (let x = 120; x <= 300; x += 12) mesh += `<line x1="${x}" y1="240" x2="${x + 90}" y2="80"/>`;
      return frame("#f3edf7", "#e3d6ec",
        grad("gl", "#c98be0", "#9a52c2") +
        `<clipPath id="${id}clip">${parts}</clipPath>`,
        `<g fill="${u("gl")}" stroke="#7e3ba6" stroke-width="2.5">${parts}</g>
         <g clip-path="url(#${id}clip)" stroke="#ffffff" stroke-width="2.5" opacity="0.5">${mesh}</g>
         <rect x="160" y="206" width="80" height="20" rx="8" fill="#7e3ba6"/>
         <rect x="160" y="206" width="80" height="6" fill="#ffffff" opacity="0.25"/>`);
    }

    default:
      return frame("#eef2f7", "#dadfe7", "", `<text x="200" y="175" font-size="90" text-anchor="middle">📦</text>`);
  }
}

/* ============================================================
   ÜRÜN KARTLARI
   ============================================================ */
function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = PRODUCTS.map(p => {
    const ind = p.indirim || 0;
    const indFiyat = p.birimFiyatKgUSD * (1 - ind);
    const fiyatHTML = ind
      ? `<span class="product-price">
           <span class="price-old">$${p.birimFiyatKgUSD.toFixed(2)}</span>
           <span class="price-new">$${indFiyat.toFixed(2)} / kg</span>
         </span>`
      : `<span class="product-price">$${p.birimFiyatKgUSD.toFixed(2)} / kg</span>`;
    const rozet = ind ? `<span class="sale-badge">🏷️ %${Math.round(ind * 100)} İNDİRİM</span>` : "";
    return `
    <button type="button" class="product-card${ind ? " on-sale" : ""}" data-id="${p.id}">
      <span class="product-media">${rozet}${urunGorseli(p.gorsel)}</span>
      <span class="product-body">
        <span class="product-name">${p.ad}</span>
        <span class="product-cat" style="color:${katRenk(p.kategori)};border-color:${katRenk(p.kategori)}55;background:${katRenk(p.kategori)}14">${p.kategori}</span>
        ${fiyatHTML}
      </span>
    </button>`;
  }).join("");

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
    const kampanya = p.kampanya
      ? `<span class="partner-kampanya">🔥 Kampanya: ${p.kampanya.etiket}</span>` : "";
    return `
      <button type="button" class="partner-card${p.kampanya ? " has-kampanya" : ""}" data-id="${p.id}">
        <span class="partner-rec hidden">⭐ Önerilen firma</span>
        <span class="partner-flag">🇨🇳</span>
        <span class="partner-name">${p.ad}</span>
        <span class="partner-city">📍 ${p.sehir}, ${p.bolge}</span>
        <span class="partner-since">🏭 ${p.kurulus}'den beri · ${yil} yıllık tecrübe</span>
        <span class="partner-desc">${p.aciklama}</span>
        ${kampanya}
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

  // --- MALİYET HESABI (kalem kalem) ---
  const urunIndirim = product.indirim || 0;
  const birimFiyatEff = product.birimFiyatKgUSD * (1 - urunIndirim);

  const listeBedeli   = product.birimFiyatKgUSD * kg * carpan;   // indirimsiz mal bedeli
  const urunIndirimTutar = listeBedeli - birimFiyatEff * kg * carpan;
  const indirimliMal  = birimFiyatEff * kg * carpan;            // ürün indirimi sonrası

  // Firma kampanyası (sadece seçili firma + ilgili ürün eşleşince)
  const kampanyaAktif = partner && partner.kampanya && partner.kampanya.urun === product.id;
  const kampanyaTutar = kampanyaAktif ? indirimliMal * partner.kampanya.oran : 0;
  const malBedeli     = indirimliMal - kampanyaTutar;          // net mal bedeli

  const nakliye  = kargo.usdKg * kg;                            // navlun
  const sigorta  = (malBedeli + nakliye) * VERGI.sigortaOran;  // sigorta
  const cif      = malBedeli + nakliye + sigorta;              // CIF değeri (vergi matrahı)

  const gumrukOran   = product.gumruk || 0;
  const gumrukVergisi = cif * gumrukOran;                      // gümrük vergisi
  const kdvMatrah    = cif + gumrukVergisi;
  const kdv          = kdvMatrah * VERGI.kdv;                  // KDV
  const komisyon     = Math.max(VERGI.komisyonMin, cif * VERGI.komisyonOran); // gümrük işlem/komisyon

  const toplamUSD = cif + gumrukVergisi + kdv + komisyon;      // yurda giriş toplam maliyeti

  // Teslim süresi (negatife düşmesin)
  const minGun = Math.max(1, kargo.minGun + gunFark);
  const maxGun = Math.max(minGun, kargo.maxGun + gunFark);

  // Tedarikçi satırı + önerilen firma bilgisi
  const onerilen = PARTNERS.find(p => p.id === product.onerilenFirma);
  let partnerSatir;
  if (partner) {
    const onerilenMi = partner.id === product.onerilenFirma ? " ⭐ (önerilen)" : "";
    partnerSatir = `<div class="bd-note">Tedarikçi: <b>${partner.ad}</b> (${partner.sehir})${onerilenMi}</div>`;
  } else if (onerilen) {
    partnerSatir = `<div class="bd-note warn">Önerilen firma: <b>${onerilen.ad}</b> — seçmek için karta tıklayın (zorunlu değil).</div>`;
  } else {
    partnerSatir = `<div class="bd-note warn">Tedarikçi seçilmedi — standart fiyat gösteriliyor.</div>`;
  }

  // Seçili firma yokken bu ürün için kampanyalı firma varsa öner
  const kampanyaliFirma = PARTNERS.find(p => p.kampanya && p.kampanya.urun === product.id);
  let kampanyaIpucu = "";
  if (kampanyaliFirma && (!partner || partner.id !== kampanyaliFirma.id)) {
    kampanyaIpucu = `<span class="kampanya-ipucu">🔥 <b>${kampanyaliFirma.ad}</b> bu üründe ${kampanyaliFirma.kampanya.etiket.toLowerCase()} sunuyor — o firmayı seçerek daha ucuza alın.</span>`;
  }

  // Maliyet dökümü satırı yardımcısı
  const row = (etiket, tutar, cls = "") =>
    `<div class="bd-row ${cls}"><span>${etiket}</span><span>${fmtPara(tutar)}</span></div>`;

  let dokum = "";
  if (urunIndirim > 0 || kampanyaAktif) dokum += row("Liste bedeli (ürün)", listeBedeli);
  if (urunIndirim > 0) dokum += row(`🏷️ Ürün indirimi (−%${Math.round(urunIndirim * 100)})`, -urunIndirimTutar, "save");
  if (kampanyaAktif)   dokum += row(`🔥 ${partner.kampanya.etiket}`, -kampanyaTutar, "save");
  dokum += row("Mal bedeli", malBedeli);
  dokum += row(`Nakliye (${kargo.ad})`, nakliye);
  dokum += row(`Sigorta (%${(VERGI.sigortaOran * 100).toLocaleString("tr-TR")})`, sigorta);
  dokum += row("Ara toplam (CIF / vergi matrahı)", cif, "subtotal");
  dokum += row(`Gümrük vergisi (%${(gumrukOran * 100).toLocaleString("tr-TR")})`, gumrukVergisi);
  dokum += row(`KDV (%${Math.round(VERGI.kdv * 100)})`, kdv);
  dokum += row("Gümrük işlem / komisyon", komisyon);
  dokum += row("TOPLAM (yurda giriş maliyeti)", toplamUSD, "total");

  // İkincil para birimi referansı (seçili USD değilse USD'yi de göster)
  const altSatir = selectedCurrency === "USD"
    ? `≈ ${fmtPara(toplamUSD, "TRY")}`
    : `≈ ${fmtPara(toplamUSD, "USD")}`;
  const birimMaliyet = toplamUSD / kg;   // kg başına gerçek maliyet

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
        <span class="cell-label">Tahmini Toplam Maliyet (vergiler dâhil)</span>
        <span class="cell-value">${fmtPara(toplamUSD)}</span>
        <span class="cell-sub">${altSatir} · ${fmtPara(birimMaliyet)}/kg</span>
      </div>
      <div class="result-cell">
        <span class="cell-label">Tahmini Teslim Süresi</span>
        <span class="cell-value">${minGun}–${maxGun} gün</span>
        <span class="cell-sub">${kargo.ad}</span>
      </div>
    </div>
    <div class="bd-title">Maliyet Dökümü</div>
    <div class="breakdown-list">${dokum}</div>
    ${partnerSatir}
    ${kampanyaIpucu}
    <p class="disclaimer-sm">ℹ️ Vergi ve gümrük oranları örnek/tahminîdir; gerçek oranlar ürünün GTIP'ine,
      menşe ve güncel mevzuata göre değişir.</p>
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
   DÖVİZ ÇEVİRİCİ
   ============================================================ */
const nfmt = (n, d = 2) => n.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d });

function setupConverter() {
  const from = $("#conv-from"), to = $("#conv-to");
  const opts = Object.keys(KURLAR).map(k => `<option value="${k}">${k} — ${KURLAR[k].ad}</option>`).join("");
  from.innerHTML = opts; to.innerHTML = opts;
  from.value = "TRY"; to.value = "USD";   // varsayılan: 1000 ₺ = ? $

  const convert = () => {
    const amt = parseFloat($("#conv-amount").value);
    const f = KURLAR[from.value], t = KURLAR[to.value];
    if (!amt || amt < 0 || !f || !t) {
      $("#conv-result").value = "";
      $("#conv-line").textContent = "";
      return;
    }
    const usd = amt / f.kur;           // önce USD'ye
    const sonuc = usd * t.kur;          // hedef birime
    $("#conv-result").value = nfmt(sonuc);
    $("#conv-line").innerHTML =
      `<b>${nfmt(amt)} ${f.sembol}</b> = <b>${nfmt(sonuc)} ${t.sembol}</b>
       <span class="conv-rate">(1 ${from.value} = ${nfmt(t.kur / f.kur, 4)} ${to.value})</span>`;
  };

  $("#conv-amount").addEventListener("input", convert);
  from.addEventListener("change", convert);
  to.addEventListener("change", convert);
  $("#conv-swap").addEventListener("click", () => {
    const tmp = from.value; from.value = to.value; to.value = tmp;
    convert();
  });
  convert();
}

/* ============================================================
   KUR DEĞİŞİM TABLOSU
   ============================================================ */
function renderRateTable() {
  const tbody = $("#rate-tbody");
  const tryKur = KURLAR.TRY.kur;
  const rows = Object.keys(KURLAR).filter(k => k !== "TRY").map(k => {
    const c = KURLAR[k];
    const tryDeger = tryKur / c.kur;            // 1 birim = ? ₺
    const yon = c.degisim >= 0 ? "up" : "down";
    const ok = c.degisim >= 0 ? "▲" : "▼";
    return `
      <tr>
        <td><span class="rate-sym">${c.sembol}</span> ${c.ad} <span class="rate-code">${k}</span></td>
        <td class="rate-val">${nfmt(tryDeger)} ₺</td>
        <td class="rate-chg ${yon}">${ok} %${nfmt(Math.abs(c.degisim))}</td>
      </tr>`;
  }).join("");
  tbody.innerHTML = rows;
}

/* ============================================================
   ABONELİK / DANIŞMANLIK
   ============================================================ */
const SUB_KEY = "parlas_subscription";
const getSub = () => { try { return JSON.parse(localStorage.getItem(SUB_KEY)); } catch { return null; } };

function renderAbonelik() {
  const box = $("#abonelik-icerik");
  const sub = getSub();

  if (!sub) {
    // Plan kartları
    box.innerHTML = `
      <div class="plan-grid">
        ${ABONELIK.planlar.map(p => `
          <div class="plan-card${p.oneCikan ? " one-cikan" : ""}">
            ${p.oneCikan ? `<span class="plan-badge">⭐ En Popüler</span>` : ""}
            <h4 class="plan-ad">${p.ad}</h4>
            <div class="plan-fiyat">${fmtPara(p.fiyatUSD)}<span>/${p.periyot}</span></div>
            <ul class="plan-ozellik">
              ${p.ozellikler.map(o => `<li>✓ ${o}</li>`).join("")}
            </ul>
            <button type="button" class="btn btn-primary plan-btn" data-plan="${p.id}">Abone Ol</button>
          </div>`).join("")}
      </div>`;
    box.querySelectorAll(".plan-btn").forEach(btn => {
      btn.addEventListener("click", () => abone(btn.dataset.plan));
    });
  } else {
    // Abone paneli
    const plan = ABONELIK.planlar.find(p => p.id === sub.planId) || ABONELIK.planlar[0];
    const onerilenler = ABONELIK.onerilenler.map(o => {
      const u = PRODUCTS.find(p => p.id === o.urunId) || {};
      return `
        <tr>
          <td>${u.ikon || "📦"} <b>${u.ad || o.urunId}</b></td>
          <td class="oneri-adet">${o.adet.toLocaleString("tr-TR")} ${o.birim}</td>
          <td class="oneri-not">${o.not}</td>
        </tr>`;
    }).join("");
    box.innerHTML = `
      <div class="sub-active">
        <div class="sub-head-row">
          <div>
            <span class="sub-rozet">⭐ ${plan.ad} aboneliği aktif</span>
            <p class="sub-since">Başlangıç: ${new Date(sub.tarih).toLocaleDateString("tr-TR")}</p>
          </div>
          <button type="button" id="sub-cancel" class="btn btn-ghost-dark">Aboneliği iptal et</button>
        </div>

        <h4 class="sub-blok-baslik">🎯 Size Özel Ürün Önerileri</h4>
        <div class="rate-table-wrap">
          <table class="rate-table">
            <thead><tr><th>Ürün</th><th>Önerilen Adet</th><th>Neden?</th></tr></thead>
            <tbody>${onerilenler}</tbody>
          </table>
        </div>

        <h4 class="sub-blok-baslik">🎁 Abonelere Özel Teklifler</h4>
        <div class="teklif-grid">
          ${ABONELIK.teklifler.map(t => `
            <div class="teklif-card">
              <strong>${t.baslik}</strong>
              <span>${t.aciklama}</span>
            </div>`).join("")}
        </div>

        <div class="sub-danisman">
          💬 Kişisel danışmanınız hazır — ürün ve adet planınız için
          <a href="https://wa.me/${ILETISIM.whatsapp}" target="_blank" rel="noopener">WhatsApp'tan yazın</a>.
        </div>
      </div>`;
    $("#sub-cancel").addEventListener("click", () => {
      if (confirm("Aboneliğinizi iptal etmek istediğinize emin misiniz?")) {
        localStorage.removeItem(SUB_KEY);
        renderAbonelik();
      }
    });
  }
}

function abone(planId) {
  const plan = ABONELIK.planlar.find(p => p.id === planId);
  if (!plan) return;
  const onay = confirm(`${plan.ad} paketine ${fmtPara(plan.fiyatUSD)}/${plan.periyot} karşılığında abone olmak üzeresiniz.\n\n(Demo: gerçek ödeme alınmaz.)\n\nOnaylıyor musunuz?`);
  if (!onay) return;
  localStorage.setItem(SUB_KEY, JSON.stringify({ planId, tarih: new Date().toISOString() }));
  renderAbonelik();
  $("#abonelik").scrollIntoView({ behavior: "smooth" });
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
  setupConverter();
  renderRateTable();
  renderAbonelik();
  setupRequestForm();
  setupContact();
  $("#year").textContent = new Date().getFullYear();

  // Oturum varsa doğrudan uygulamayı göster
  const session = getSession();
  if (session) showApp(session);
});
