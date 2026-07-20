import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
// Deploy su Netlify alla radice del dominio: nessun `base` necessario.
// Quando conoscerai l'URL definitivo (es. https://la-voglia.netlify.app o un
// dominio tuo), impostalo in `site` per sitemap e URL canonici.
export default defineConfig({
  // site: 'https://la-voglia.netlify.app',
  integrations: [react()],
  output: 'static',
});
