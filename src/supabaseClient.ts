import { createClient } from '@supabase/supabase-js';

// Valores configurados diretamente para garantir estabilidade no Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wenrstlmfjzijaxevzrr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GQ0w4XhwSe37XeLqr1Zrwg_NN0bKQKK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);