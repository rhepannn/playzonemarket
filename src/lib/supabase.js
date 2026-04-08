import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Peringatan: Variabel VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditemukan. Jika ini di production/deploy, pastikan kamu sudah memasukkannya ke platform hosting (Vercel/Netlify/dsb).");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)
