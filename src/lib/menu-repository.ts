/* ============================================================
   Repository del menu: unica porta d'accesso ai dati.
   - Se Supabase e' configurato -> legge dal DB (ordinati).
   - Altrimenti (o in caso di errore) -> dati statici di fallback.
   Usato sia a build-time (Astro) sia lato client (islands React).
   ============================================================ */
import { getSupabase } from './supabase';
import {
  fallbackTapBeers,
  fallbackPanini,
  fallbackFocacce,
  fallbackBottleBeers,
  fallbackGins,
} from '@/data/fallback';
import type { TapBeer, Panino, Focaccia, BottleBeer, Gin } from '@/types/menu';

export interface MenuData {
  tapBeers: TapBeer[];
  panini: Panino[];
  focacce: Focaccia[];
  bottleBeers: BottleBeer[];
  gins: Gin[];
}

/** Snapshot statico immediato (nessuna await): usato per SSR/SEO e primo render. */
export const fallbackMenu: MenuData = {
  tapBeers: fallbackTapBeers,
  panini: fallbackPanini,
  focacce: fallbackFocacce,
  bottleBeers: fallbackBottleBeers,
  gins: fallbackGins,
};

/** Carica solo le birre alla spina (usato dall'island BirreSpina). */
export async function loadTapBeers(): Promise<TapBeer[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return fallbackMenu.tapBeers;
    const { data, error } = await supabase.from('tap_beers').select('*').order('sort_order');
    if (error || !data?.length) return fallbackMenu.tapBeers;
    return data;
  } catch {
    return fallbackMenu.tapBeers;
  }
}

/**
 * Carica l'intero menu. Non lancia mai: in caso di problema torna il fallback,
 * cosi' il sito e' sempre visibile.
 */
export async function loadMenu(): Promise<MenuData> {
  try {
    const supabase = getSupabase();
    if (!supabase) return fallbackMenu;

    const [tap, pan, foc, bot, gin] = await Promise.all([
      supabase.from('tap_beers').select('*').order('sort_order'),
      supabase.from('panini').select('*').order('number'),
      supabase.from('focacce').select('*').order('sort_order'),
      supabase.from('bottle_beers').select('*').order('sort_order'),
      supabase.from('gins').select('*').order('sort_order'),
    ]);

    const anyError = tap.error || pan.error || foc.error || bot.error || gin.error;
    if (anyError) {
      console.warn('[menu-repository] Errore Supabase, uso il fallback:', anyError.message);
      return fallbackMenu;
    }

    return {
      tapBeers: tap.data?.length ? tap.data : fallbackMenu.tapBeers,
      panini: pan.data?.length ? pan.data : fallbackMenu.panini,
      focacce: foc.data?.length ? foc.data : fallbackMenu.focacce,
      bottleBeers: bot.data?.length ? bot.data : fallbackMenu.bottleBeers,
      gins: gin.data?.length ? gin.data : fallbackMenu.gins,
    };
  } catch (err) {
    console.warn('[menu-repository] Eccezione, uso il fallback:', err);
    return fallbackMenu;
  }
}
