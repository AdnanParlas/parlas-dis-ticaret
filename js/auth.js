/* ============================================================
   KAYIT / GİRİŞ / OTURUM YÖNETİMİ (localStorage)
   Not: Sunucusuz demo; gerçek güvenlik sağlamaz.
   ============================================================ */

const USERS_KEY   = "parlas_users";
const SESSION_KEY = "parlas_session";

/* --- Depolama yardımcıları --- */
function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ ad: user.ad, email: user.email, telefon: user.telefon }));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* --- Doğrulama --- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* --- İşlemler --- */
// Dönüş: { ok: true, user } | { ok: false, error }
function registerUser({ ad, email, telefon, sifre }) {
  ad = (ad || "").trim();
  email = (email || "").trim().toLowerCase();
  telefon = (telefon || "").trim();

  if (!ad || !email || !telefon || !sifre)  return { ok: false, error: "Lütfen tüm alanları doldurun." };
  if (!isValidEmail(email))                  return { ok: false, error: "Geçerli bir e-posta girin." };
  if (sifre.length < 6)                      return { ok: false, error: "Şifre en az 6 karakter olmalı." };

  const users = getUsers();
  if (users.some(u => u.email === email))    return { ok: false, error: "Bu e-posta zaten kayıtlı. Giriş yapın." };

  const user = { ad, email, telefon, sifre, kayitTarihi: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  setSession(user);
  return { ok: true, user };
}

// Dönüş: { ok: true, user } | { ok: false, error }
function loginUser({ email, sifre }) {
  email = (email || "").trim().toLowerCase();
  if (!email || !sifre)        return { ok: false, error: "E-posta ve şifre girin." };

  const user = getUsers().find(u => u.email === email);
  if (!user || user.sifre !== sifre) return { ok: false, error: "E-posta veya şifre hatalı." };

  setSession(user);
  return { ok: true, user };
}
