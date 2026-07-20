/* ============================================================
   Modello dati del menu — la "single source of truth" dei tipi.
   Ogni entita' e' mappata 1:1 su una tabella Supabase.
   I prezzi sono stringhe display (es. "4,80€") per preservare
   esattamente la formattazione italiana usata nel locale.
   ============================================================ */

/** Campi comuni a tutte le entita' persistite. */
export interface BaseRecord {
  readonly id: string;
  /** ordine di visualizzazione crescente. */
  sort_order: number;
}

/** Birra alla spina (sezione "Birre alla Spina"). */
export interface TapBeer extends BaseRecord {
  /** nome completo mostrato nella card (es. "Fuller's London Pride"). */
  name: string;
  /** nome breve stampato sul disco (es. "London Pride"). */
  short_name: string;
  /** riga origine (es. "🇨🇿 Repubblica Ceca · Pilsner"). */
  origin: string;
  /** stile + gradazione sul disco (es. "Pilsner · 4.4%"). */
  style_abv: string;
  /** emoji bandiera. */
  flag: string;
  description: string;
  price_small: string;
  price_medium: string;
  price_liter: string;
  /** stile del disco (gradiente CSS). */
  disc_bg: string;
  disc_border: string;
  disc_ring: string;
  /** colore testo/sottotitolo del disco: opzionale, default bianco. */
  disc_text: string | null;
  disc_sub: string | null;
  /** true per la "Birra del Mese" (bordo dorato evidenziato). */
  is_special: boolean;
}

/** Panino numerato (1..100, ma il numero e' libero). */
export interface Panino extends BaseRecord {
  /** numero mostrato come "N° X". */
  number: number;
  /** descrizione ingredienti. */
  name: string;
  price: string;
}

/** Voce di Focacce & Toast. */
export interface Focaccia extends BaseRecord {
  /** etichetta badge (es. "TOAST", "FOCACCIA 1"). */
  label: string;
  name: string;
  /** sottotitolo opzionale (es. "Pane bianco, integrale o 5 cereali"). */
  sub: string | null;
  price: string;
}

/** Birra in bottiglia (badge colorato con sigla). */
export interface BottleBeer extends BaseRecord {
  /** sigla del badge (es. "FW", "HNK"). */
  badge: string;
  name: string;
  sub: string;
  price: string;
  /** gradiente CSS di sfondo del badge. */
  badge_bg: string;
  /** colore testo del badge. */
  badge_color: string;
}

/** Gin per i Gin Tonic. */
export interface Gin extends BaseRecord {
  name: string;
  price: string;
}

/* ── Unione utile per il pannello admin ─────────────────────── */
export type EntityName = 'tap_beers' | 'panini' | 'focacce' | 'bottle_beers' | 'gins';

export interface EntityMap {
  tap_beers: TapBeer;
  panini: Panino;
  focacce: Focaccia;
  bottle_beers: BottleBeer;
  gins: Gin;
}

/** Payload di inserimento: senza id (generato dal DB). */
export type Insert<T extends BaseRecord> = Omit<T, 'id'>;
/** Payload di aggiornamento: campi parziali, id escluso. */
export type Update<T extends BaseRecord> = Partial<Omit<T, 'id'>>;
