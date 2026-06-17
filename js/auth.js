/* ============================================================
   KAYIT / GİRİŞ / OTURUM — Supabase Auth
   Kullanıcı bilgileri Supabase'de güvenli şekilde saklanır.
   ============================================================ */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Supabase hata mesajlarını Türkçeleştir
function cevirHata(msg) {
  const m = (msg || "").toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already"))
    return "Bu e-posta zaten kayıtlı. Giriş yapın.";
  if (m.includes("invalid login")) return "E-posta veya şifre hatalı.";
  if (m.includes("password")) return "Şifre en az 6 karakter olmalı.";
  if (m.includes("email") && m.includes("invalid")) return "Geçerli bir e-posta girin.";
  if (m.includes("rate limit") || m.includes("too many")) return "Çok fazla deneme. Lütfen biraz sonra tekrar deneyin.";
  return "Bir hata oluştu: " + msg;
}

// Dönüş: { ok:true, user } | { ok:true, needsConfirm:true } | { ok:false, error }
async function registerUser({ ad, email, telefon, sifre }) {
  ad = (ad || "").trim();
  email = (email || "").trim().toLowerCase();
  telefon = (telefon || "").trim();

  if (!ad || !email || !telefon || !sifre) return { ok: false, error: "Lütfen tüm alanları doldurun." };
  if (!isValidEmail(email))                 return { ok: false, error: "Geçerli bir e-posta girin." };
  if (sifre.length < 6)                     return { ok: false, error: "Şifre en az 6 karakter olmalı." };

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password: sifre,
    options: { data: { ad, telefon } }   // ad/telefon kullanıcı metadata'sında
  });
  if (error) return { ok: false, error: cevirHata(error.message) };
  if (!data.session) return { ok: true, needsConfirm: true, user: data.user };  // e-posta onayı açıksa
  return { ok: true, user: data.user };
}

// Dönüş: { ok:true, user } | { ok:false, error }
async function loginUser({ email, sifre }) {
  email = (email || "").trim().toLowerCase();
  if (!email || !sifre) return { ok: false, error: "E-posta ve şifre girin." };

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: sifre });
  if (error) return { ok: false, error: cevirHata(error.message) };
  return { ok: true, user: data.user };
}

async function logoutUser() {
  await supabaseClient.auth.signOut();
}

async function currentUser() {
  const { data } = await supabaseClient.auth.getUser();
  return data.user;
}

// Kullanıcının görünen adı (metadata > e-posta)
function kullaniciAdi(user) {
  if (!user) return "";
  return (user.user_metadata && user.user_metadata.ad) || user.email || "";
}
