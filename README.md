# FrontierBlender research website

Based on [Roman Hauksson-Neill’s Academic Project Astro Template](https://github.com/RomanHauksson/academic-project-astro-template).

Node 24+, `npm ci`, then `npm run dev`. `npm run build` checks and builds static pages into `dist/`.

- `/`: research Blog article, authored in `src/paper.mdx`.
- `/leaderboard/`: approved, dated paper snapshot with category scores, tokens and costs.
- `/task/` and `/task/<slug>/`: searchable collection and 80 prerendered task pages.
- Purple light/dark theme: `src/styles/frontier.css`.

## Data

`src/data/results.json` records the November 17 paper snapshot and source archive revision. Only the approved configurations are included; this is not a live monitor. No scoring is performed by this website. `public/data/results.json` is its downloadable counterpart.

`public/tasks.json` and `public/task/` contain website input metadata and compressed reference/drawing copies only. Never copy `.blend`, oracle files, restoration workspaces, authentication files or raw trajectories into this repository. The original scoring renders are unchanged.

## GitHub Pages

Enable Pages → GitHub Actions. The included workflow derives `site` and `base` from Pages, checks the source, then builds/deploys `dist/`. All links use Astro's base path. For a custom domain, configure it in Pages and add the DNS records supplied by GitHub.

The source and deployment must remain below GitHub Pages size limits. Run `python scripts/check_site.py` after building. Preserve original task images outside the website; web image copies are display-only.
