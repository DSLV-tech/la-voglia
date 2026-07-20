/* ============================================================
   Hook CRUD type-safe su una tabella del menu.
   Gestisce: caricamento, errori, e le operazioni create/update/delete
   con refresh ottimizzato (ricarica la lista dopo ogni mutazione).

   Scelta di stato: per questa scala (poche decine di record, un solo
   admin) un hook con useState/useEffect e' piu' semplice ed efficace
   di TanStack Query. Se in futuro servisse cache condivisa, refetch in
   background o piu' viste, TanStack Query e' il passo d'aggiornamento
   naturale (l'API di questo hook e' gia' compatibile).
   ============================================================ */
import { useCallback, useEffect, useState } from 'react';
import type { EntityName } from '@/types/menu';
import {
  selectAll,
  insertRow,
  updateRow,
  deleteRow,
  type Row,
  type InsertRow,
  type UpdateRow,
} from './crud';

export interface CrudState<K extends EntityName> {
  rows: Row<K>[];
  loading: boolean;
  /** errore di caricamento o mutazione, gia' in italiano. */
  error: string | null;
  reload: () => Promise<void>;
  create: (input: InsertRow<K>) => Promise<void>;
  update: (id: string, patch: UpdateRow<K>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export function useCrud<K extends EntityName>(table: K): CrudState<K> {
  const [rows, setRows] = useState<Row<K>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await selectAll(table));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di caricamento');
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const create = useCallback(
    async (input: InsertRow<K>) => {
      setError(null);
      try {
        await insertRow(table, input);
        await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Errore in creazione');
        throw e;
      }
    },
    [table, reload],
  );

  const update = useCallback(
    async (id: string, patch: UpdateRow<K>) => {
      setError(null);
      try {
        await updateRow(table, id, patch);
        await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Errore in aggiornamento');
        throw e;
      }
    },
    [table, reload],
  );

  const remove = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await deleteRow(table, id);
        await reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Errore in eliminazione');
        throw e;
      }
    },
    [table, reload],
  );

  return { rows, loading, error, reload, create, update, remove };
}
