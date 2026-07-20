/* ============================================================
   Form generico guidato dalla configurazione dell'entita'.
   Vale sia per la creazione sia per la modifica.
   ============================================================ */
import { useMemo, useState, type FormEvent } from 'react';
import type { EntityName } from '@/types/menu';
import type { Row, InsertRow } from '@/lib/crud';
import type { EntityConfig, FieldConfig } from './entityConfig';
import { ColorField, GradientField } from './ColorControls';

interface Props<K extends EntityName> {
  config: EntityConfig<K>;
  /** presente in modifica, assente in creazione. */
  initial?: Row<K>;
  onCancel: () => void;
  onSubmit: (values: InsertRow<K>) => Promise<void>;
}

type FormValue = string | boolean;
type FormState = Record<string, FormValue>;

function toInput(value: unknown, type: FieldConfig<EntityName>['type']): FormValue {
  if (type === 'checkbox') return Boolean(value);
  if (value === null || value === undefined) return '';
  return String(value);
}

export function EntityForm<K extends EntityName>({ config, initial, onCancel, onSubmit }: Props<K>) {
  const source = (initial ?? config.emptyRow) as Record<string, unknown>;

  const initialState = useMemo<FormState>(() => {
    const s: FormState = {};
    for (const f of config.fields) s[f.key] = toInput(source[f.key], f.type);
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const [values, setValues] = useState<FormState>(initialState);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: string, value: FormValue) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: Record<string, string | number | boolean | null> = {};
      for (const f of config.fields) {
        const raw = values[f.key];
        if (f.type === 'number') {
          payload[f.key] = raw === '' || raw === true || raw === false ? 0 : Number(raw);
        } else if (f.type === 'checkbox') {
          payload[f.key] = Boolean(raw);
        } else {
          const str = typeof raw === 'string' ? raw : '';
          payload[f.key] = f.nullable && str.trim() === '' ? null : str;
        }
      }
      // payload contiene esattamente le chiavi/tipi dei campi config: cast al confine.
      await onSubmit(payload as unknown as InsertRow<K>);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="adm-form" onSubmit={handleSubmit}>
      <div className="adm-form-grid">
        {config.fields.map((f) => (
          <div key={f.key} className={`adm-field${f.full ? ' adm-field-full' : ''}`}>
            <label htmlFor={`f-${f.key}`}>
              {f.label}
              {f.required ? ' *' : ''}
            </label>

            {f.type === 'color' ? (
              <ColorField
                value={typeof values[f.key] === 'string' ? (values[f.key] as string) : ''}
                onChange={(v) => setField(f.key, v)}
                nullable={f.nullable}
              />
            ) : f.type === 'gradient' ? (
              <GradientField
                value={typeof values[f.key] === 'string' ? (values[f.key] as string) : ''}
                onChange={(v) => setField(f.key, v)}
              />
            ) : f.type === 'textarea' ? (
              <textarea
                id={`f-${f.key}`}
                rows={3}
                required={f.required}
                value={typeof values[f.key] === 'string' ? (values[f.key] as string) : ''}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            ) : f.type === 'checkbox' ? (
              <input
                id={`f-${f.key}`}
                type="checkbox"
                checked={values[f.key] === true}
                onChange={(e) => setField(f.key, e.target.checked)}
              />
            ) : (
              <input
                id={`f-${f.key}`}
                type={f.type === 'number' ? 'number' : 'text'}
                required={f.required}
                value={typeof values[f.key] === 'string' ? (values[f.key] as string) : ''}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="adm-inline-error">{error}</p>}

      <div className="adm-form-actions">
        <button className="adm-btn adm-btn-ghost" type="button" onClick={onCancel} disabled={busy}>
          Annulla
        </button>
        <button className="adm-btn adm-btn-primary" type="submit" disabled={busy}>
          {busy ? 'Salvataggio…' : initial ? 'Salva modifiche' : 'Aggiungi'}
        </button>
      </div>
    </form>
  );
}
