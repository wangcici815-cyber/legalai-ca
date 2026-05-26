import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const isBuild = process.argv.includes('build');
const isCfDeploy = !!(process.env.CF_PAGES || process.env.CLOUDFLARE_BUILD);

// Only use Cloudflare adapter during build (not dev, miniflare crashes on Windows)
let adapter;
if (isBuild || isCfDeploy) {
  const cloudflare = (await import('@astrojs/cloudflare')).default;
  adapter = cloudflare({ mode: 'directory' });
}

export default defineConfig({
  site: 'https://legalai-ca.pages.dev',
  output: 'static',
  adapter,
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
