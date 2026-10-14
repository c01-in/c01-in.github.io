# Colin Hebe Homepage

This is the personal homepage project for Colin Hebe, built with React, Vite, and Tailwind CSS. It features a modern UI, Markdown-based posts, and a knowledge base section.

## Features

- ⚡️ Fast and modern React + Vite setup
- 📝 Supports Markdown posts
- 🎨 Styled with Tailwind CSS
- 📚 Knowledge Base section
- 🖥️ Responsive design

## Getting Started

### Prerequisites

- Node.js 24 (matches CI)
- npm

### Install Dependencies

```bash
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

### Build

Build the project for production:

```bash
npm run build
```

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The live site is https://colin.quarksgames.com/, hosted on GitHub Pages from the `gh-pages` branch.

The `Deploy On Tag` workflow installs locked dependencies, checks TypeScript, builds the site, tests mood rotation, and publishes `dist`. Push a `v*` tag or run the workflow manually against the branch to publish. Only one publication runs at a time.

To deploy:

```bash
npm run deploy
```

This will build the project and publish the contents of the `dist` folder to the `gh-pages` branch.

### Notes

- Ensure the `homepage` field in `package.json` is set to `https://c01-in.github.io`.
- In `vite.config.ts`, the `base` should be set to `/` for correct asset paths.

## Build structure and validation

- Tailwind scans only `src` and `index.html`. Keep content classes there rather than enabling repository-wide scans of public assets or generated files.
- Knowledge Base, Markdown Reader, and Kotlin Playground load on navigation. Three.js tools use direct module imports; avoid the `three/examples/jsm/Addons.js` barrel.
- Add projects in `src/content/projects.ts`. Add mood components to `src/components/moods/index.ts`; the last entry is the initial mood, and refresh selects a different entry.
- Run `npm test` and `npm run build`, then `npm run preview`. Check home project links, mood refresh, `/kb`, an article, and `/kotlin` in the production preview before publishing.

## License

MIT
