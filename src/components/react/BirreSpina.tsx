/* ============================================================
   Island "Birre alla Spina".
   Renderizza le birre passate come prop (SSR/SEO) e, dopo il mount,
   le aggiorna da Supabase tramite useLive.
   ============================================================ */
import type { CSSProperties } from 'react';
import type { TapBeer } from '@/types/menu';
import { useLive } from '@/lib/useLive';
import { loadTapBeers } from '@/lib/menu-repository';

interface Props {
  initial: TapBeer[];
}

/** Costruisce lo stile del disco a partire dai campi colore della birra. */
function discStyle(b: TapBeer): CSSProperties {
  const vars: Record<string, string> = {
    '--disc-bg': b.disc_bg,
    '--disc-border': b.disc_border,
    '--disc-ring': b.disc_ring,
  };
  if (b.disc_text) vars['--disc-text'] = b.disc_text;
  if (b.disc_sub) vars['--disc-sub'] = b.disc_sub;
  // Le CSS custom properties non sono nel tipo CSSProperties: cast al confine.
  return vars as unknown as CSSProperties;
}

function BeerCard({ beer }: { beer: TapBeer }) {
  const cardStyle: CSSProperties | undefined = beer.is_special
    ? { borderColor: 'rgba(220,179,86,.4)' }
    : undefined;
  const nameStyle: CSSProperties | undefined = beer.is_special
    ? { color: 'var(--gg)' }
    : undefined;

  return (
    <div className="tap-card" style={cardStyle}>
      <div className="tap-disc" style={discStyle(beer)}>
        <div className="td-flag">{beer.flag}</div>
        <div className="td-name">{beer.short_name}</div>
        <div className="td-abv">{beer.style_abv}</div>
      </div>
      <div className="tap-info">
        <div className="tap-name" style={nameStyle}>{beer.name}</div>
        <div className="tap-origin">{beer.origin}</div>
        <div className="tap-desc">{beer.description}</div>
        <div className="tap-prices">
          <div className="tap-price-chip">Piccola <strong>{beer.price_small}</strong></div>
          <div className="tap-price-chip">Media <strong>{beer.price_medium}</strong></div>
          <div className="tap-price-chip">Litro <strong>{beer.price_liter}</strong></div>
        </div>
      </div>
    </div>
  );
}

export default function BirreSpina({ initial }: Props) {
  const beers = useLive<TapBeer[]>(initial, loadTapBeers);

  return (
    <>
      <div className="tap-grid reveal">
        {beers.map((b) => (
          <BeerCard key={b.id} beer={b} />
        ))}
      </div>

      <div className="birre-promo reveal">
        <div className="birre-promo-txt">
          <h3>Indeciso su quale birra provare?</h3>
          <p>Assaggia 4 birre alla spina in degustazione — la soluzione perfetta per chi vuole esplorare la nostra selezione. Giraffe disponibili fino a 4 litri.</p>
        </div>
        <div className="promo-pill">
          <div className="pp-price">€9,00</div>
          <div className="pp-label">4 birre in degustazione</div>
        </div>
      </div>
    </>
  );
}
