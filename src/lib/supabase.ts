import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('[Supabase] Initializing client...');

const isStripeKey = 
  supabaseAnonKey.startsWith('sb_publishable_') || 
  supabaseAnonKey.startsWith('pk_') || 
  supabaseAnonKey.startsWith('sk_') ||
  supabaseAnonKey.includes('stripe');

const isSecretKey = supabaseAnonKey.startsWith('sb_secret_');

// Export a helper to check if config is valid
function isSupabaseConfigured() {
  const hasUrl = !!supabaseUrl && supabaseUrl.length > 10;
  const hasKey = !!supabaseAnonKey && supabaseAnonKey.length > 20;
  const isValidUrl = hasUrl && (
    supabaseUrl.includes('.supabase.co') || 
    supabaseUrl.includes('.supabase.com') || 
    supabaseUrl.includes('localhost') ||
    supabaseUrl.includes('127.0.0.1')
  );
  
  const isCorrectKeyType = hasKey && supabaseAnonKey.startsWith('eyJ');
  
  if (!hasUrl || !hasKey) {
    console.warn('[Supabase] Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Falling back to Demo Mode.');
  }

  return hasUrl && hasKey && isCorrectKeyType && isValidUrl && !isStripeKey && !isSecretKey;
}

function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export { isSupabaseConfigured, isValidUUID };

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
