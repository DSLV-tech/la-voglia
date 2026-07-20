/* ============================================================
   Dati statici di fallback.
   Usati quando Supabase non e' configurato o non raggiungibile,
   cosi' il sito mostra sempre il menu (SEO + resilienza).
   Fonte unica: ./menu.json (usato anche per il seed del DB).
   ============================================================ */
import raw from './menu.json';
import type { TapBeer, Panino, Focaccia, BottleBeer, Gin } from '@/types/menu';

/** Aggiunge un id sintetico stabile ai record del JSON (che non ne hanno). */
function withId<T extends object>(prefix: string, rows: readonly T[]): (T & { id: string })[] {
  return rows.map((row, i) => ({ ...row, id: `${prefix}-${i + 1}` }));
}

export const fallbackTapBeers: TapBeer[] = withId('tap', raw.tap_beers);
// I panini nel JSON non hanno sort_order (l'ordine e' dato dal numero):
// lo deriviamo qui per soddisfare il tipo Panino.
export const fallbackPanini: Panino[] = raw.panini.map((p, i) => ({
  ...p,
  id: `pan-${i + 1}`,
  sort_order: p.number,
}));
export const fallbackFocacce: Focaccia[] = withId('foc', raw.focacce);
export const fallbackBottleBeers: BottleBeer[] = withId('bot', raw.bottle_beers);
export const fallbackGins: Gin[] = withId('gin', raw.gins);
