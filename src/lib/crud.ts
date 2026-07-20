/* ============================================================
   Accesso dati generico e type-safe per il pannello admin.

   Nota tecnica: il client Supabase tipizzato non sa mappare un nome
   tabella GENERICO (`K extends EntityName`) sullo schema, e degenera a
   `never`. Per questo, SOLO all'interno di queste funzioni, usiamo il
   client in forma "non tipizzata" per la chiamata `.from()`. L'API
   pubblica resta invece rigorosamente tipizzata (Row/Insert/Update) e i
   risultati vengono ricondotti ai tipi corretti al confine. Niente `any`
   trapela all'esterno.
   ============================================================ */
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBrowserSupabase } from './supabase';
import type { Database } from '@/types/database';
import type { EntityName } from '@/types/menu';

type Tables = Database['public']['Tables'];
export type Row<K extends EntityName> = Tables[K]['Row'];
export type InsertRow<K extends EntityName> = Tables[K]['Insert'];
export type UpdateRow<K extends EntityName> = Tables[K]['Update'];

/**
 * Client senza parametro di schema: `.from(table)` accetta un nome
 * tabella generico senza collassare i tipi a `never`.
 * (SupabaseClient di default usa schema = any.)
 */
function requireClient(): SupabaseClient {
  const db = getBrowserSupabase();
  if (!db) throw new Error('Supabase non configurato: imposta le variabili in .env');
  return db as unknown as SupabaseClient;
}

export async function selectAll<K extends EntityName>(table: K): Promise<Row<K>[]> {
  const db = requireClient();
  const { data, error } = await db.from(table).select('*').order('sort_order');
  if (error) throw new Error(error.message);
  return (data ?? []) as Row<K>[];
}

export async function insertRow<K extends EntityName>(table: K, input: InsertRow<K>): Promise<void> {
  const db = requireClient();
  const { error } = await db.from(table).insert(input);
  if (error) throw new Error(error.message);
}

export async function updateRow<K extends EntityName>(
  table: K,
  id: string,
  patch: UpdateRow<K>,
): Promise<void> {
  const db = requireClient();
  const { error } = await db.from(table).update(patch).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteRow<K extends EntityName>(table: K, id: string): Promise<void> {
  const db = requireClient();
  const { error } = await db.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
