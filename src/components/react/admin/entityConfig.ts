/* ============================================================
   Configurazione dichiarativa delle entita' del pannello admin.
   Un unico form generico legge questi config: aggiungere un campo
   significa modificare solo qui, non l'UI.
   ============================================================ */
import type { EntityName } from '@/types/menu';
import type { Row, InsertRow } from '@/lib/crud';

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'color' | 'gradient';

export interface FieldConfig<K extends EntityName> {
  key: Extract<keyof Row<K>, string>;
  label: string;
  type: FieldType;
  required?: boolean;
  /** occupa l'intera larghezza della griglia del form. */
  full?: boolean;
  /** campo che accetta null: se vuoto viene salvato come null. */
  nullable?: boolean;
  placeholder?: string;
}

export interface EntityConfig<K extends EntityName> {
  /** etichetta del tab. */
  label: string;
  icon: string;
  fields: FieldConfig<K>[];
  /** valori di default per un nuovo record. */
  emptyRow: InsertRow<K>;
  /** titolo mostrato nella lista. */
  title: (row: Row<K>) => string;
  /** sottotitolo mostrato nella lista. */
  subtitle: (row: Row<K>) => string;
}

type ConfigMap = { [K in EntityName]: EntityConfig<K> };

export const ENTITY_CONFIGS: ConfigMap = {
  tap_beers: {
    label: 'Birre alla spina',
    icon: '🍺',
    fields: [
      { key: 'sort_order', label: 'Ordine', type: 'number' },
      { key: 'short_name', label: 'Nome sul disco', type: 'text', required: true },
      { key: 'name', label: 'Nome completo', type: 'text', required: true, full: true },
      { key: 'origin', label: 'Origine (es. 🇨🇿 Repubblica Ceca · Pilsner)', type: 'text', full: true },
      { key: 'style_abv', label: 'Stile + gradazione (es. Pilsner · 4.4%)', type: 'text' },
      { key: 'flag', label: 'Bandiera (emoji)', type: 'text' },
      { key: 'description', label: 'Descrizione', type: 'textarea', full: true },
      { key: 'price_small', label: 'Prezzo Piccola', type: 'text' },
      { key: 'price_medium', label: 'Prezzo Media', type: 'text' },
      { key: 'price_liter', label: 'Prezzo Litro', type: 'text' },
      { key: 'disc_bg', label: 'Disco: sfondo', type: 'gradient', full: true },
      { key: 'disc_border', label: 'Disco: bordo', type: 'color' },
      { key: 'disc_ring', label: 'Disco: anello', type: 'color' },
      { key: 'disc_text', label: 'Disco: colore testo (opz.)', type: 'color', nullable: true },
      { key: 'disc_sub', label: 'Disco: colore sottotitolo (opz.)', type: 'color', nullable: true },
      { key: 'is_special', label: 'Birra del Mese (evidenziata)', type: 'checkbox' },
    ],
    emptyRow: {
      sort_order: 0,
      short_name: '',
      name: '',
      origin: '',
      style_abv: '',
      flag: '',
      description: '',
      price_small: '€',
      price_medium: '€',
      price_liter: '€',
      disc_bg: 'radial-gradient(circle,#5D4037 0%,#2C1B0E 100%)',
      disc_border: '#dcb356',
      disc_ring: 'rgba(220,179,86,.3)',
      disc_text: null,
      disc_sub: null,
      is_special: false,
    },
    title: (r) => r.name || r.short_name,
    subtitle: (r) => `${r.style_abv} · ${r.price_medium}`,
  },

  panini: {
    label: 'Panini',
    icon: '🥖',
    fields: [
      { key: 'number', label: 'Numero', type: 'number', required: true },
      { key: 'name', label: 'Ingredienti', type: 'textarea', required: true, full: true },
      { key: 'price', label: 'Prezzo (es. 4,80€)', type: 'text' },
      { key: 'sort_order', label: 'Ordine (opz.)', type: 'number' },
    ],
    emptyRow: { sort_order: 0, number: 0, name: '', price: '€' },
    title: (r) => `N° ${r.number}`,
    subtitle: (r) => r.name,
  },

  focacce: {
    label: 'Focacce & Toast',
    icon: '🍕',
    fields: [
      { key: 'sort_order', label: 'Ordine', type: 'number' },
      { key: 'label', label: 'Etichetta (es. TOAST, FOCACCIA 1)', type: 'text', required: true },
      { key: 'name', label: 'Descrizione', type: 'textarea', required: true, full: true },
      { key: 'sub', label: 'Sottotitolo (opz.)', type: 'text', full: true, nullable: true },
      { key: 'price', label: 'Prezzo', type: 'text' },
    ],
    emptyRow: { sort_order: 0, label: '', name: '', sub: null, price: '€' },
    title: (r) => r.label,
    subtitle: (r) => r.name,
  },

  bottle_beers: {
    label: 'Birre bottiglia',
    icon: '🍾',
    fields: [
      { key: 'sort_order', label: 'Ordine', type: 'number' },
      { key: 'badge', label: 'Sigla badge (es. FW, HNK)', type: 'text', required: true },
      { key: 'name', label: 'Nome', type: 'text', required: true, full: true },
      { key: 'sub', label: 'Dettaglio (es. Italia · 0,33l)', type: 'text', full: true },
      { key: 'price', label: 'Prezzo', type: 'text' },
      { key: 'badge_bg', label: 'Badge: sfondo', type: 'gradient', full: true },
      { key: 'badge_color', label: 'Badge: colore testo', type: 'color' },
    ],
    emptyRow: {
      sort_order: 0,
      badge: '',
      name: '',
      sub: '',
      price: '€',
      badge_bg: 'linear-gradient(135deg,#5D4037,#3E2723)',
      badge_color: '#ffffff',
    },
    title: (r) => r.name,
    subtitle: (r) => `${r.badge} · ${r.sub}`,
  },

  gins: {
    label: 'Gin',
    icon: '🍸',
    fields: [
      { key: 'sort_order', label: 'Ordine', type: 'number' },
      { key: 'name', label: 'Nome gin', type: 'text', required: true, full: true },
      { key: 'price', label: 'Prezzo', type: 'text' },
    ],
    emptyRow: { sort_order: 0, name: '', price: '€' },
    title: (r) => r.name,
    subtitle: (r) => r.price,
  },
};

export const ENTITY_ORDER: EntityName[] = [
  'tap_beers',
  'panini',
  'focacce',
  'bottle_beers',
  'gins',
];
