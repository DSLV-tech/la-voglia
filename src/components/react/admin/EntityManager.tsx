/* ============================================================
   Gestore CRUD di una singola entita': lista + crea/modifica/elimina.
   Generico su K: funziona per birre, panini, focacce, bottiglie, gin.
   ============================================================ */
import { useState } from 'react';
import type { EntityName } from '@/types/menu';
import type { Row, InsertRow, UpdateRow } from '@/lib/crud';
import { useCrud } from '@/lib/useCrud';
import { ENTITY_CONFIGS } from './entityConfig';
import { EntityForm } from './EntityForm';

interface Props<K extends EntityName> {
  table: K;
}

type ViewMode<K extends EntityName> =
  | { mode: 'list' }
  | { mode: 'create' }
  | { mode: 'edit'; row: Row<K> };

export function EntityManager<K extends EntityName>({ table }: Props<K>) {
  const config = ENTITY_CONFIGS[table];
  const { rows, loading, error, create, update, remove } = useCrud(table);
  const [view, setView] = useState<ViewMode<K>>({ mode: 'list' });
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (view.mode === 'create' || view.mode === 'edit') {
    const initial = view.mode === 'edit' ? view.row : undefined;
    return (
      <div className="adm-panel">
        <h3 className="adm-panel-title">
          {view.mode === 'edit' ? 'Modifica' : 'Nuovo'} — {config.label}
        </h3>
        <EntityForm
          config={config}
          initial={initial}
          onCancel={() => setView({ mode: 'list' })}
          onSubmit={async (values: InsertRow<K>) => {
            if (view.mode === 'edit') {
              await update(view.row.id, values as UpdateRow<K>);
            } else {
              await create(values);
            }
            setView({ mode: 'list' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="adm-panel">
      <div className="adm-panel-head">
        <span className="adm-count-label">
          {loading ? 'Caricamento…' : `${rows.length} ${rows.length === 1 ? 'voce' : 'voci'}`}
        </span>
        <button className="adm-btn adm-btn-primary" type="button" onClick={() => setView({ mode: 'create' })}>
          + Aggiungi
        </button>
      </div>

      {error && <p className="adm-inline-error">{error}</p>}
      {loading ? (
        <p className="adm-muted">Caricamento…</p>
      ) : rows.length === 0 ? (
        <p className="adm-muted">Nessun elemento. Aggiungi il primo con “+ Aggiungi”.</p>
      ) : (
        <ul className="adm-list">
          {rows.map((row) => (
            <li key={row.id} className="adm-list-item">
              <div className="adm-list-text">
                <span className="adm-list-title">{config.title(row)}</span>
                <span className="adm-list-sub">{config.subtitle(row)}</span>
              </div>
              <div className="adm-list-actions">
                {pendingDelete === row.id ? (
                  <>
                    <span className="adm-confirm-q">Eliminare?</span>
                    <button
                      className="adm-btn adm-btn-danger adm-btn-sm"
                      type="button"
                      onClick={async () => {
                        await remove(row.id);
                        setPendingDelete(null);
                      }}
                    >
                      Sì
                    </button>
                    <button
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      type="button"
                      onClick={() => setPendingDelete(null)}
                    >
                      No
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      type="button"
                      onClick={() => setView({ mode: 'edit', row })}
                    >
                      Modifica
                    </button>
                    <button
                      className="adm-btn adm-btn-danger adm-btn-sm"
                      type="button"
                      onClick={() => setPendingDelete(row.id)}
                    >
                      Elimina
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
