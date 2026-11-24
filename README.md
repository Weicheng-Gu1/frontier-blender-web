# AgentRecBench research website

Based on [Roman Hauksson-Neill’s Academic Project Astro Template](https://github.com/RomanHauksson/academic-project-astro-template).

Node 24+, `npm ci`, then `npm run dev`. `npm run build` checks and builds static pages into `dist/`.

- `/`: research Blog article, authored in `src/paper.mdx`.
- `/leaderboard/`: approved, dated paper snapshot with category scores, tokens and costs.
- `/task/` and `/task/<slug>/`: searchable collection and 80 prerendered task pages.
- Purple light/dark theme: `src/styles/frontier.css`.

## Data

`src/data/results.json` records the November 17 paper snapshot and source archive revision. Only the approved configurations are included; this is not a live monitor. No scoring is performed by this website. `public/data/results.json` is its downloadable counterpart.

`public/atlas/current-catalog.json` and `public/task/<slug>/case.json.gz` record the published task atlas and task details. The task pages include the original instructions, camera calibration, and per-model evaluation scores. The WebP images are compressed display copies. Never copy `.blend`, oracle files, restoration workspaces, authentication files or raw trajectories into this repository. The original scoring renders are unchanged.

## GitHub Pages

The live site is published from the `gh-pages` branch (Pages → Deploy from a branch → gh-pages → root). Run `npm run deploy` to build and push the generated static site. All links use Astro's base path. The existing GitHub OAuth authorization lacks workflow scope, so the optional Actions workflow is stored at `deploy/github-pages-workflow.yml`; enabling it later requires workflow permission and moving it to `.github/workflows/astro.yml`. For a custom domain, set `PAGES_BASE=/` when deploying and configure the domain and DNS in Pages.

The source and deployment must remain below GitHub Pages size limits. Run `python scripts/check_site.py` after building. Preserve original task images outside the website; web image copies are display-only.
