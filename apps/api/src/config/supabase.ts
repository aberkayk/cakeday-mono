import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Public Supabase client (uses anon key, subject to RLS)
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

/**
 * Admin Supabase client (uses service role key, bypasses RLS)
 * Use only for server-side operations that require elevated privileges
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
