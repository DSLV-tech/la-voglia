# La Voglia — Astro + React + TypeScript + Supabase

Riscrittura del sito di **La Voglia** (pub birreria, Vercelli) da singolo `index.html`
a progetto **Astro** con isole **React 18 + TypeScript** e un **pannello admin CRUD**
su **Supabase** per gestire birre e panini senza toccare il codice.

Il look è identico all'originale: il CSS è stato portato 1:1 in `src/styles/global.css`.

---

## Cosa fa

- **Sito pubblico** (`/`): stesse sezioni dell'originale (hero, storia, birre alla spina,
  menu con 100 panini + focacce + birre in bottiglia + gin, gallery, atmosfera,
  TripAdvisor, contatti).
- **Pannello admin** (`/admin`): login protetto; CRUD completo su
  **birre alla spina, panini, focacce & toast, birre in bottiglia, gin**.
- **Dati live senza rebuild**: le sezioni Birre e Menu vengono renderizzate a build-time
  (per SEO) e poi aggiornate dal browser leggendo Supabase. Quando l'admin salva una
  modifica, compare sul sito al successivo caricamento pagina.
- **Resilienza**: se Supabase non è configurato o è irraggiungibile, il sito usa i dati
  statici di `src/data/menu.json` (fallback) — non si rompe mai.

> **Nota Uiltje** — La **Ducato Freeride** è stata sostituita dalla **Uiltje** tra le birre
> alla spina (`sort_order` 7). Nome, descrizione, gradazione e colori del disco sono
> valori di partenza sensati: sistemali con precisione dal pannello admin o in
> `src/data/menu.json`.

---

## Scelte tecniche (in breve)

- **Astro + isole React**: il sito è quasi tutto statico (ottimo per SEO e performance);
  React viene usato solo dove serve interattività — filtro panini, tab del menu, admin.
- **Stato**: nessuna libreria globale. Stato server (Supabase) gestito da un hook
  `useCrud` con `useState`/`useEffect`; stato UI locale (`useState`). Per questa scala
  è più semplice ed efficace di TanStack Query/Zustand. L'API di `useCrud` è comunque
  compatibile con un futuro passaggio a TanStack Query.
- **Type-safety**: TypeScript strict, nessun `any`. I tipi di dominio (`src/types/menu.ts`)
  sono l'unica fonte di verità e generano il tipo `Database` del client Supabase.
- **Sicurezza**: la chiave `anon` è pubblica per natura; l'accesso in scrittura è protetto
  dalle **Row Level Security policy** (`supabase/schema.sql`): lettura per tutti,
  scrittura solo per utenti autenticati.

---

## Prerequisiti

- Node.js **18+** (consigliato 20+)
- Un account **Supabase** gratuito (https://supabase.com)

---

## 1) Installazione locale

```bash
npm install
```

Copia le immagini del sito attuale in `public/` (vedi `public/LEGGIMI-immagini.txt`):
`logo.png`, `logo-navbar.png`, `logo-footer.png`, `foto_bancone.webp`, `bancone.webp`,
`spillatrice.webp`, `interno.webp`.

Avvia in sviluppo:

```bash
npm run dev
```

Senza `.env` il sito parte comunque con i dati di fallback; il pannello admin mostrerà
un avviso finché non configuri Supabase.

---

## 2) Configurazione Supabase

1. Crea un progetto su Supabase.
2. **SQL Editor** → incolla ed esegui `supabase/schema.sql` (crea tabelle + RLS).
3. **Popola i dati** in uno dei due modi:
   - **SQL** (semplice): incolla ed esegui `supabase/seed.sql`.
   - **Script** (DRY, da `src/data/menu.json`):
     ```bash
     SUPABASE_URL="https://xxxx.supabase.co" \
     SUPABASE_SERVICE_ROLE_KEY="la-tua-service-role-key" \
     node scripts/seed.mjs
     ```
     > La `service_role` key bypassa le RLS: usala **solo** da riga di comando, mai nel frontend.
4. **Crea l'utente admin**: Supabase → Authentication → Users → *Add user* → inserisci
   email e password (quelle che userai su `/admin`). In Authentication → Providers,
   assicurati che **Email** sia abilitato; per un uso privato conviene **disattivare le
   registrazioni pubbliche** ("Allow new users to sign up").
5. **Variabili d'ambiente**: copia `.env.example` in `.env` e compila:
   ```
   PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
   PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
   ```
   (Le trovi in Supabase → Project Settings → API.)

Riavvia `npm run dev`. Vai su `/admin`, accedi e modifica il menu.

---

## 3) Deploy

Il sito è statico. `npm run build` genera `dist/`.

### GitHub Pages (sotto `/la-voglia`)

`astro.config.mjs` è già impostato con `site` e `base: '/la-voglia'`.
Esempio di workflow `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push: { branches: [main] }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
```

Imposta i **secrets** `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` nel repo.
Con un **dominio proprio** metti `base: '/'` in `astro.config.mjs`.

> Le modifiche dell'admin appaiono senza rideploy (il browser rilegge Supabase).
> Il rebuild serve solo ad aggiornare l'HTML statico usato per la SEO.

---

## Script

| Comando             | Cosa fa                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Server di sviluppo                        |
| `npm run build`     | Build statica in `dist/`                  |
| `npm run preview`   | Anteprima della build                     |
| `npm run typecheck` | Controllo tipi TypeScript (`astro check`) |
| `node scripts/seed.mjs` | Popola Supabase da `menu.json`        |

---

## Struttura

```
src/
  components/            # sezioni statiche (.astro)
    react/               # isole interattive
      BirreSpina.tsx     #   birre alla spina (live)
      Menu.tsx           #   tab menu + ricerca panini (live)
      admin/             #   pannello CRUD (login, form, tabelle)
  data/
    menu.json            # dati di partenza (fonte unica: fallback + seed)
    fallback.ts          # wrapper tipizzato del JSON
  lib/
    supabase.ts          # client tipizzato + rilevamento config
    menu-repository.ts   # lettura menu (Supabase → fallback)
    crud.ts / useCrud.ts # accesso dati + hook CRUD type-safe
    useLive.ts           # dati iniziali SSR + refresh dal DB
  types/
    menu.ts              # tipi di dominio (fonte di verità)
    database.ts          # tipo Database per Supabase
  styles/
    global.css           # CSS del sito, portato 1:1
    admin.css            # stili del pannello admin
  pages/
    index.astro          # sito pubblico
    admin.astro          # /admin
supabase/
  schema.sql             # tabelle + Row Level Security
  seed.sql               # dati iniziali (SQL)
scripts/
  seed.mjs               # seed via Node
```
