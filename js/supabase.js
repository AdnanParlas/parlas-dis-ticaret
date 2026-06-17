/* ============================================================
   SUPABASE İSTEMCİSİ
   Buradaki anahtar PUBLIC "anon" anahtardır — tarayıcıda açık
   olması güvenlidir; veriler Row Level Security (RLS) ile korunur.
   (service_role / secret anahtarları ASLA buraya konmaz.)
   ============================================================ */
const SUPABASE_URL = "https://prjespjmjgqqmtdwcjub.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByamVzcGptamdxcW10ZHdjanViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MTcwNjMsImV4cCI6MjA5NzI5MzA2M30.eWzxOOaoADCh6o11FIVPy-uCRGUWd5hVOeQ8YxgYYyk";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
