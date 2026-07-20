/* ============================================================
   Root del pannello admin.
   - Se Supabase non e' configurato -> avviso.
   - Se non autenticato -> LoginForm.
   - Se autenticato -> dashboard con tab per ogni entita'.
   ============================================================ */
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { EntityName } from '@/types/menu';
import { getBrowserSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { ErrorBoundary } from './ErrorBoundary';
import { LoginForm } from './LoginForm';
import { EntityManager } from './EntityManager';
import { ENTITY_CONFIGS, ENTITY_ORDER } from './entityConfig';

/** Dispatcher che passa un table letterale (typing pulito, niente unione). */
function ManagerFor({ table }: { table: EntityName }) {
  switch (table) {
    case 'tap_beers':
      return <EntityManager table="tap_beers" />;
    case 'panini':
      return <EntityManager table="panini" />;
    case 'focacce':
      return <EntityManager table="focacce" />;
    case 'bottle_beers':
      return <EntityManager table="bottle_beers" />;
    case 'gins':
      return <EntityManager table="gins" />;
    default:
      return null;
  }
}

export default function AdminApp() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [active, setActive] = useState<EntityName>('tap_beers');

  useEffect(() => {
    const db = getBrowserSupabase();
    if (!db) {
      setReady(true);
      return;
    }
    db.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = db.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="adm-notice">
        <h1>Configurazione mancante</h1>
        <p>
          Il pannello admin richiede Supabase. Copia <code>.env.example</code> in <code>.env</code>,
          inserisci <code>PUBLIC_SUPABASE_URL</code> e <code>PUBLIC_SUPABASE_ANON_KEY</code>, poi
          riavvia. Le istruzioni complete sono nel <code>README.md</code>.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="adm-boot">
        <div className="adm-spinner" aria-hidden="true"></div>
        <span>Caricamento…</span>
      </div>
    );
  }
  if (!session) return <LoginForm />;

  const logout = async () => {
    await getBrowserSupabase()?.auth.signOut();
  };

  const activeConfig = ENTITY_CONFIGS[active];

  return (
    <ErrorBoundary>
      <div className="adm-app">
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <span className="adm-logo-mark">🍺</span>
            <span className="adm-logo-text">
              La Voglia <em>Admin</em>
            </span>
          </div>

          <nav className="adm-nav">
            {ENTITY_ORDER.map((name) => (
              <button
                key={name}
                type="button"
                className={`adm-nav-item${active === name ? ' active' : ''}`}
                onClick={() => setActive(name)}
              >
                <span className="adm-nav-icon">{ENTITY_CONFIGS[name].icon}</span>
                <span className="adm-nav-label">{ENTITY_CONFIGS[name].label}</span>
              </button>
            ))}
          </nav>

          <div className="adm-sidebar-foot">
            <a className="adm-view-site" href={import.meta.env.BASE_URL} target="_blank" rel="noopener">
              ↗ Vedi il sito
            </a>
            <div className="adm-user-card">
              <span className="adm-user-avatar" aria-hidden="true">
                {(session.user.email ?? '?').charAt(0).toUpperCase()}
              </span>
              <span className="adm-user-email" title={session.user.email ?? ''}>
                {session.user.email}
              </span>
              <button className="adm-logout" type="button" onClick={logout} title="Esci">
                Esci
              </button>
            </div>
          </div>
        </aside>

        <main className="adm-content">
          <header className="adm-topbar">
            <div>
              <h1 className="adm-topbar-title">
                {activeConfig.icon} {activeConfig.label}
              </h1>
              <p className="adm-topbar-sub">Aggiungi, modifica o elimina le voci di questa sezione.</p>
            </div>
          </header>
          <ManagerFor table={active} />
        </main>
      </div>
    </ErrorBoundary>
  );
}
