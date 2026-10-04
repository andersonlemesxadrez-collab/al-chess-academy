import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wenrstlmfjzijaxevzrr.supabase.co';
const supabaseAnonKey = 'sb_publishable_GQ0w4XhwSe37XeLqr1Zrwg_NN0bKQKK';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);