/* ============================================================
   Seed di Supabase con i dati di partenza (src/data/menu.json).
   Uso:
     SUPABASE_URL="https://xxx.supabase.co" \
     SUPABASE_SERVICE_ROLE_KEY="..." \
     node scripts/seed.mjs
   La service_role key bypassa le RLS: usala SOLO da riga di comando,
   MAI nel frontend. Non committarla.
   ============================================================ */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const menu = JSON.parse(readFileSync(join(__dirname, '../src/data/menu.json'), 'utf8'));

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('❌ Imposta SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nell\'ambiente.');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const TABLES = ['tap_beers', 'panini', 'focacce', 'bottle_beers', 'gins'];

async function run() {
  for (const table of TABLES) {
    const rows = menu[table];
    // Pulisce la tabella prima di reinserire (idempotente).
    const { error: delErr } = await db.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) {
      console.error(`❌ ${table}: errore in pulizia -> ${delErr.message}`);
      process.exit(1);
    }
    const { error: insErr } = await db.from(table).insert(rows);
    if (insErr) {
      console.error(`❌ ${table}: errore in inserimento -> ${insErr.message}`);
      process.exit(1);
    }
    console.log(`✅ ${table}: ${rows.length} record inseriti.`);
  }
  console.log('\n🎉 Seed completato.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
