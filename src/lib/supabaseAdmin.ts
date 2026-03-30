import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase com service_role key — APENAS para uso em API routes (server-side).
 * Bypassa RLS. NUNCA importar no lado do cliente.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    '⚠️ Missing Supabase server environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
