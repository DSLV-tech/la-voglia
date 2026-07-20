-- ============================================================
-- La Voglia — schema Supabase.
-- Incolla tutto questo nel SQL Editor di Supabase ed esegui.
-- Crea le tabelle del menu e le Row Level Security policy:
--   • lettura pubblica (il sito legge i dati)
--   • scrittura solo per utenti autenticati (il pannello admin)
-- ============================================================

-- ── TABELLE ──────────────────────────────────────────────────
create table if not exists public.tap_beers (
  id           uuid primary key default gen_random_uuid(),
  sort_order   integer not null default 0,
  short_name   text    not null,
  name         text    not null,
  origin       text    not null default '',
  style_abv    text    not null default '',
  flag         text    not null default '',
  description  text    not null default '',
  price_small  text    not null default '',
  price_medium text    not null default '',
  price_liter  text    not null default '',
  disc_bg      text    not null,
  disc_border  text    not null,
  disc_ring    text    not null,
  disc_text    text,
  disc_sub     text,
  is_special   boolean not null default false
);

create table if not exists public.panini (
  id         uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  number     integer not null,
  name       text    not null,
  price      text    not null default ''
);

create table if not exists public.focacce (
  id         uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  label      text    not null,
  name       text    not null,
  sub        text,
  price      text    not null default ''
);

create table if not exists public.bottle_beers (
  id          uuid primary key default gen_random_uuid(),
  sort_order  integer not null default 0,
  badge       text    not null,
  name        text    not null,
  sub         text    not null default '',
  price       text    not null default '',
  badge_bg    text    not null,
  badge_color text    not null
);

create table if not exists public.gins (
  id         uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  name       text    not null,
  price      text    not null default ''
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table public.tap_beers    enable row level security;
alter table public.panini       enable row level security;
alter table public.focacce      enable row level security;
alter table public.bottle_beers enable row level security;
alter table public.gins         enable row level security;

-- Lettura pubblica (anon + authenticated) su tutte le tabelle.
do $$
declare t text;
begin
  foreach t in array array['tap_beers','panini','focacce','bottle_beers','gins']
  loop
    execute format($f$
      drop policy if exists "public_read_%1$s" on public.%1$I;
      create policy "public_read_%1$s" on public.%1$I
        for select using (true);
    $f$, t);

    -- Scrittura (insert/update/delete) riservata agli utenti autenticati.
    execute format($f$
      drop policy if exists "auth_write_%1$s" on public.%1$I;
      create policy "auth_write_%1$s" on public.%1$I
        for all
        to authenticated
        using (true)
        with check (true);
    $f$, t);
  end loop;
end $$;
