/* ============================================================
   Tipo `Database` per il client Supabase, derivato dai tipi di
   dominio in ./menu.ts cosi' da avere un'unica fonte di verita'.
   ============================================================ */
import type {
  TapBeer,
  Panino,
  Focaccia,
  BottleBeer,
  Gin,
  BaseRecord,
  Insert,
  Update,
} from './menu';

/** Costruisce la definizione tabella (Row/Insert/Update) da un tipo di dominio. */
interface TableShape<T extends BaseRecord> {
  Row: T;
  Insert: Insert<T> & { id?: string };
  Update: Update<T>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      tap_beers: TableShape<TapBeer>;
      panini: TableShape<Panino>;
      focacce: TableShape<Focaccia>;
      bottle_beers: TableShape<BottleBeer>;
      gins: TableShape<Gin>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
