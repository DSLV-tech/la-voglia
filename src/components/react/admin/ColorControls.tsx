/* ============================================================
   Controlli colore usabili per il pannello admin:
   - ColorField   : color picker + opacità (gestisce hex e rgba)
   - GradientField: due colori + tipo (lineare/radiale) + anteprima
   Entrambi hanno un campo "Avanzate" per incollare CSS libero.
   ============================================================ */
import { useState } from 'react';

/* ── util colore ─────────────────────────────────────────── */
interface Rgb {
  r: number;
  g: number;
  b: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string): Rgb | null {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Estrae { hex, alpha } da hex / #rgb / #rrggbbaa / rgb() / rgba(). null se non riconosciuto. */
export function parseColor(value: string): { hex: string; alpha: number } | null {
  const v = value.trim();
  if (!v) return null;

  const hex8 = v.match(/^#([0-9a-fA-F]{8})$/);
  if (hex8 && hex8[1]) {
    const s = hex8[1];
    return { hex: `#${s.slice(0, 6)}`, alpha: parseInt(s.slice(6, 8), 16) / 255 };
  }
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) {
    const rgb = hexToRgb(v);
    return rgb ? { hex: rgbToHex(rgb), alpha: 1 } : null;
  }
  const rgba = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  if (rgba) {
    const r = Number(rgba[1]);
    const g = Number(rgba[2]);
    const b = Number(rgba[3]);
    const a = rgba[4] === undefined ? 1 : Number(rgba[4]);
    return { hex: rgbToHex({ r, g, b }), alpha: Number.isFinite(a) ? clamp(a, 0, 1) : 1 };
  }
  return null;
}

function composeColor(hex: string, alpha: number): string {
  if (alpha >= 0.999) return hex;
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const a = Math.round(alpha * 100) / 100;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

/* ── ColorField ──────────────────────────────────────────── */
interface ColorFieldProps {
  value: string;
  onChange: (v: string) => void;
  /** se true, mostra un toggle per lasciare il campo vuoto (usa default). */
  nullable?: boolean;
}

export function ColorField({ value, onChange, nullable }: ColorFieldProps) {
  const [advanced, setAdvanced] = useState(false);
  const parsed = parseColor(value);
  const enabled = value.trim() !== '';
  const hex = parsed?.hex ?? '#888888';
  const alpha = parsed?.alpha ?? 1;

  if (nullable && !enabled) {
    return (
      <div className="cc-row">
        <button type="button" className="cc-enable" onClick={() => onChange('#cccccc')}>
          + Imposta un colore personalizzato
        </button>
        <span className="cc-hint">(vuoto = usa il default)</span>
      </div>
    );
  }

  return (
    <div className="cc-wrap">
      <div className="cc-row">
        <input
          type="color"
          className="cc-swatch"
          value={hex}
          onChange={(e) => onChange(composeColor(e.target.value, alpha))}
          aria-label="Scegli colore"
        />
        <div className="cc-alpha">
          <span>Opacità</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(alpha * 100)}
            onChange={(e) => onChange(composeColor(hex, Number(e.target.value) / 100))}
          />
          <span className="cc-alpha-val">{Math.round(alpha * 100)}%</span>
        </div>
        {nullable && (
          <button type="button" className="cc-clear" onClick={() => onChange('')} title="Rimuovi (usa default)">
            ✕
          </button>
        )}
      </div>

      <button type="button" className="cc-adv-toggle" onClick={() => setAdvanced((a) => !a)}>
        {advanced ? 'Nascondi avanzate' : 'Avanzate (CSS)'}
      </button>
      {advanced && (
        <input
          type="text"
          className="cc-raw"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#dcb356 oppure rgba(220,179,86,.3)"
        />
      )}
    </div>
  );
}

/* ── GradientField ───────────────────────────────────────── */
interface GradientParts {
  kind: 'linear' | 'radial';
  angle: number;
  c1: string;
  c2: string;
}

function parseGradient(value: string): GradientParts {
  const v = value.trim();
  const kind: 'linear' | 'radial' = /radial-gradient/i.test(v) ? 'radial' : 'linear';
  const angleMatch = v.match(/(\d+)deg/);
  const angle = angleMatch && angleMatch[1] ? Number(angleMatch[1]) : 135;
  const colors = v.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/g) ?? [];
  return {
    kind,
    angle,
    c1: colors[0] ?? '#5D4037',
    c2: colors[1] ?? '#2C1B0E',
  };
}

function composeGradient(p: GradientParts): string {
  return p.kind === 'radial'
    ? `radial-gradient(circle,${p.c1} 0%,${p.c2} 100%)`
    : `linear-gradient(${p.angle}deg,${p.c1} 0%,${p.c2} 100%)`;
}

interface GradientFieldProps {
  value: string;
  onChange: (v: string) => void;
}

export function GradientField({ value, onChange }: GradientFieldProps) {
  const [advanced, setAdvanced] = useState(false);
  const p = parseGradient(value);
  const update = (patch: Partial<GradientParts>) => onChange(composeGradient({ ...p, ...patch }));

  const c1hex = parseColor(p.c1)?.hex ?? '#5D4037';
  const c2hex = parseColor(p.c2)?.hex ?? '#2C1B0E';

  return (
    <div className="cc-wrap">
      <div className="cc-preview" style={{ background: value || composeGradient(p) }} aria-hidden="true" />
      <div className="cc-row cc-grad-row">
        <label className="cc-mini">
          <span>Da</span>
          <input type="color" className="cc-swatch" value={c1hex} onChange={(e) => update({ c1: e.target.value })} />
        </label>
        <label className="cc-mini">
          <span>A</span>
          <input type="color" className="cc-swatch" value={c2hex} onChange={(e) => update({ c2: e.target.value })} />
        </label>
        <label className="cc-mini">
          <span>Tipo</span>
          <select
            className="cc-select"
            value={p.kind}
            onChange={(e) => update({ kind: e.target.value === 'radial' ? 'radial' : 'linear' })}
          >
            <option value="linear">Lineare</option>
            <option value="radial">Radiale</option>
          </select>
        </label>
        {p.kind === 'linear' && (
          <label className="cc-mini">
            <span>Angolo</span>
            <input
              type="number"
              className="cc-angle"
              value={p.angle}
              onChange={(e) => update({ angle: Number(e.target.value) })}
            />
          </label>
        )}
      </div>

      <button type="button" className="cc-adv-toggle" onClick={() => setAdvanced((a) => !a)}>
        {advanced ? 'Nascondi avanzate' : 'Avanzate (CSS)'}
      </button>
      {advanced && (
        <input
          type="text"
          className="cc-raw"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="linear-gradient(135deg,#f8f8f0 0%,#e8e8d8 100%)"
        />
      )}
    </div>
  );
}
