/* ============================================================
   Island "Menu": tab (Panini / Focacce & Toast / Birre bottiglia /
   Gin) + ricerca live sui panini. Renderizza i dati iniziali (SEO)
   e li aggiorna da Supabase dopo il mount.
   ============================================================ */
import { useMemo, useState, type CSSProperties } from 'react';
import type { Panino, Focaccia, BottleBeer, Gin } from '@/types/menu';
import { useLive } from '@/lib/useLive';
import { loadMenu } from '@/lib/menu-repository';

type TabId = 'panini' | 'toast' | 'bottiglia' | 'gin';

interface MenuIslandData {
  panini: Panino[];
  focacce: Focaccia[];
  bottleBeers: BottleBeer[];
  gins: Gin[];
}

interface Props {
  initial: MenuIslandData;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'panini', label: '🥖 100 Panini' },
  { id: 'toast', label: '🍕 Focacce & Toast' },
  { id: 'bottiglia', label: '🍺 Birre Bottiglia' },
  { id: 'gin', label: '🍸 Gin Tonic' },
];

/**
 * Filtri rapidi per i panini: solo corrispondenze POSITIVE per parola chiave
 * (sicuro: non dichiara mai "vegetariano" per assenza di ingredienti).
 */
interface PaniniFilter {
  id: string;
  label: string;
  match: (name: string) => boolean;
}
const PANINI_FILTERS: PaniniFilter[] = [
  { id: 'all', label: 'Tutti', match: () => true },
  { id: 'hamburger', label: '🍔 Hamburger', match: (n) => /hamburger/.test(n) },
  { id: 'wurstel', label: '🌭 Wurstel', match: (n) => /wurstel/.test(n) },
  { id: 'pesce', label: '🦐 Pesce', match: (n) => /gamber|acciugh|tonno|salmon/.test(n) },
  { id: 'piccante', label: '🔥 Piccanti', match: (n) => /diavola|peperoncino|salsa di fuoco/.test(n) },
  { id: 'dolce', label: '🍫 Dolci', match: (n) => /nutella|marmellata|arachidi/.test(n) },
];

export default function Menu({ initial }: Props) {
  const data = useLive<MenuIslandData>(initial, async () => {
    const m = await loadMenu();
    return { panini: m.panini, focacce: m.focacce, bottleBeers: m.bottleBeers, gins: m.gins };
  });

  const [tab, setTab] = useState<TabId>('panini');
  const [query, setQuery] = useState('');
  const [filterId, setFilterId] = useState('all');

  const filteredPanini = useMemo(() => {
    const q = query.trim().toLowerCase();
    const active = PANINI_FILTERS.find((f) => f.id === filterId);
    const matchFilter = active ? active.match : () => true;
    return data.panini.filter((p) => {
      const name = p.name.toLowerCase();
      const okQuery = !q || name.includes(q) || String(p.number).includes(q);
      return matchFilter(name) && okQuery;
    });
  }, [data.panini, query, filterId]);

  return (
    <>
      <div className="menu-tabs reveal">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`menu-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PANINI ── */}
      <div className={`menu-panel${tab === 'panini' ? ' active' : ''}`}>
        <div className="panini-note">
          <strong>100 panini numerati.</strong> Un menu unico che si rinnova continuamente.
          Disponibile anche <strong>senza glutine</strong> (+€1,50). Per panini fuori lista o
          modifiche chiedere il prezzo preventivo.
        </div>
        <div className="panini-search-row">
          <input
            className="panini-search"
            type="text"
            placeholder="🔍  Cerca per ingrediente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cerca panini per ingrediente"
          />
          <div className="panini-counter">
            Mostrati: <span>{filteredPanini.length}</span> / {data.panini.length}
          </div>
        </div>

        <div className="panini-filters" role="group" aria-label="Filtri rapidi panini">
          {PANINI_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`panini-chip${filterId === f.id ? ' active' : ''}`}
              onClick={() => setFilterId(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="panini-grid">
          {filteredPanini.length === 0 ? (
            <p className="panini-empty">Nessun panino trovato. Prova a cambiare filtro o ricerca.</p>
          ) : (
            filteredPanini.map((p) => (
              <div className="panino-card" key={p.id}>
                <span className="panino-num">{p.number}</span>
                <span className="panino-name">{p.name}</span>
                <span className="panino-price">{p.price}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── FOCACCE & TOAST ── */}
      <div className={`menu-panel${tab === 'toast' ? ' active' : ''}`}>
        <div className="items-grid">
          {data.focacce.map((f) => (
            <div className="item-card" key={f.id}>
              <div className="item-info">
                <div className="item-num">{f.label}</div>
                <div className="item-name">{f.name}</div>
                {f.sub && <div className="item-sub">{f.sub}</div>}
              </div>
              <div className="item-price">{f.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BIRRE IN BOTTIGLIA ── */}
      <div className={`menu-panel${tab === 'bottiglia' ? ' active' : ''}`}>
        <div className="items-grid">
          {data.bottleBeers.map((b) => {
            const badgeStyle: CSSProperties = { background: b.badge_bg, color: b.badge_color };
            return (
              <div className="item-card" key={b.id}>
                <div className="bottle-badge" style={badgeStyle}>{b.badge}</div>
                <div className="item-info">
                  <div className="item-name">{b.name}</div>
                  <div className="item-sub">{b.sub}</div>
                </div>
                <div className="item-price">{b.price}</div>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: '1.5rem', fontSize: '.85rem', color: '#666' }}>
          Maggiorazione di €1,00 / €3,00 per consumazioni al tavolo e al dehors.
        </p>
      </div>

      {/* ── GIN TONIC ── */}
      <div className={`menu-panel${tab === 'gin' ? ' active' : ''}`}>
        <div className="items-grid">
          {data.gins.map((g) => (
            <div className="item-card" key={g.id}>
              <div className="gin-bottle-icon">🍶</div>
              <div className="item-info">
                <div className="item-name">{g.name}</div>
              </div>
              <div className="item-price">{g.price}</div>
            </div>
          ))}
        </div>
        <div className="panini-note" style={{ marginTop: '2rem' }}>
          Da abbinare: <strong>Kinley alla spina</strong> o <strong>Schweppes in bottiglietta</strong> —
          acque toniche selezionate per esaltare ogni gin. Ogni mese nuovi gin da scoprire!
        </div>
      </div>
    </>
  );
}
