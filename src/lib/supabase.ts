/* ============================================================
   Client Supabase tipizzato + helper di ambiente.
   Le variabili PUBLIC_* sono esposte al client (Astro): la
   sicurezza e' data dalle RLS policy, non dalla segretezza.
   ============================================================ */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

/**
 * true quando entrambe le variabili sono configurate.
 * Se false, il sito funziona comunque usando i dati statici di fallback
 * (vedi src/data/fallback.ts) e il pannello admin mostra un avviso.
 */
export const isSupabaseConfigured: boolean = Boolean(url && anonKey);

/**
 * Ritorna il client tipizzato, oppure `null` se non configurato.
 * Il null-check forza il chiamante a gestire il caso "non configurato"
 * in modo type-safe (niente crash a runtime).
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (!url || !anonKey) return null;
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/** Singleton lato browser (evita di ricreare il client ad ogni render). */
let browserClient: SupabaseClient<Database> | null | undefined;
export function getBrowserSupabase(): SupabaseClient<Database> | null {
  if (browserClient === undefined) browserClient = getSupabase();
  return browserClient;
}
