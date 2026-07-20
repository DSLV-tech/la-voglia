/* ============================================================
   Costruisce l'URL di un file in public/ rispettando `base`.
   Evita il bug del doppio/mancante slash con import.meta.env.BASE_URL
   (che può essere "/la-voglia" oppure "/la-voglia/").
   asset('logo.png') -> "/la-voglia/logo.png"
   ============================================================ */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
