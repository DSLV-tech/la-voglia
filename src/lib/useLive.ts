/* ============================================================
   Hook generico: parte da dati iniziali (renderizzati lato server
   per SEO) e, se Supabase e' configurato, li aggiorna dal DB dopo
   il mount. Cosi' le modifiche dell'admin appaiono senza rebuild.
   ============================================================ */
import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from './supabase';

export function useLive<T>(initial: T, fetcher: () => Promise<T>): T {
  const [data, setData] = useState<T>(initial);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    fetcher()
      .then((fresh) => {
        if (active) setData(fresh);
      })
      .catch(() => {
        /* silenzioso: resta il dato iniziale */
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}
