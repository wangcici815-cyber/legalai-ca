# LegalAI CA

California legal information + tools + AI assistant static website.

## Tech Stack

- **Framework**: Astro 5 (SSG)
- **UI**: Tailwind CSS 4 + React (for interactive islands)
- **Hosting**: Cloudflare Pages
- **AI**: DeepSeek-V3 API (via Cloudflare Functions)

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env.local` and add your DeepSeek API Key:

```
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

## Cloudflare Pages Deployment

### Using Wrangler CLI

```bash
# Install wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist/ --branch main
```

### Using Git Integration

1. Push this repo to GitHub/GitLab
2. In Cloudflare Pages, connect the repo
3. Build settings:
   - Build command: `npm run build`
   - Build output: `dist`
4. Add environment variables:
   - `DEEPSEEK_API_KEY`: your DeepSeek API key

## Project Structure

```
├── public/                     # Static assets
│   ├── favicon.svg
│   ├── robots.txt
│   └── _redirects              # Cloudflare redirects
├── functions/
│   └── api/
│       └── chat.ts             # DeepSeek API proxy (Cloudflare Function)
├── src/
│   ├── components/             # Astro & React components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Disclaimer.astro
│   │   ├── HeroSection.astro
│   │   ├── ToolCard.astro
│   │   ├── ArticleCard.astro
│   │   ├── ChildSupportCalculator.tsx  # React island
│   │   ├── AlimonyEstimator.tsx       # React island
│   │   └── AIChat.tsx                 # React island
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── ArticleLayout.astro
│   │   └── ToolLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── ai-assistant.astro
│   │   ├── child-support-calculator.astro
│   │   ├── alimony-estimator.astro
│   │   ├── tools/index.astro
│   │   ├── guides/[...slug].astro     # Article pages
│   │   └── [topic]/index.astro        # Topic pages
│   ├── content/
│   │   ├── config.ts
│   │   └── articles/                  # MDX content
│   ├── tools/
│   │   ├── child-support.ts           # Calculator logic
│   │   └── alimony.ts
│   └── utils/
│       └── schema.ts                  # JSON-LD generators
├── astro.config.mjs
├── wrangler.toml
├── tsconfig.json
├── package.json
└── .env.example
```

## Adding Content

1. Create a new `.mdx` file in `src/content/articles/`
2. Add frontmatter: title, description, datePublished, topic, tags
3. Write content in Markdown with JSX support
4. The article will automatically appear at `/guides/[slug]`
5. It will also appear on the corresponding topic page

## Deployment Checklist

- [ ] Set `DEEPSEEK_API_KEY` in Cloudflare Pages environment variables
- [ ] Verify `SITE_URL` in `astro.config.mjs` matches your domain
- [ ] Test AI assistant endpoint: `POST /api/chat`
- [ ] Submit sitemap to Google Search Console
- [ ] Review all pages render correctly
