# AgentRecBench blog evidence

The leaderboard and task figures use the ten published configurations in `src/data/results.json` and `public/data/results.json`. The console lighting and material experiments are separate diagnostics on one frozen submission.

## Interactive reconstruction figure

`public/reconstruction/provenance.json` identifies 60 predictions by trial, submission and archive hashes, image hash, camera and official task score. The six cases use a single GT camera per task across all ten configurations. Modern Villa uses exterior H01. A logo’s vertical position gives its category mean; the detailed caption reports the example task score.

## Analysis

- The four error-mode cards use the GPT-6.2-Astra (high) submissions for furnished-room, opera-house-auditorium, victorian-library and florence-historic-city. Trial IDs, submission and image hashes, exact target IDs and camera IDs are recorded under `diagnostics.astra62_local_fidelity` in the evidence manifest. The furnished-room submission contains a bin body and lid. Their combined bounding box is centered 0.358 m from the reference bin’s box. The additional Florence pair uses fresh Cycles renders from the release H13 camera, native scene materials, and the same crop on both sides. The opera house and Florence overlays use the same rectangle on both sides of each pair. Their PSNR and depth MAE come from the original full-view verifier records.

- `src/data/console-ablation.json` records a separate fixed-geometry sensitivity study of Kimi’s handheld-console submission at H01–H04. Each setting is scored from lossless verifier renders. WebP copies are for display. The reference masks, camera transforms, 768 × 576 resolution, 32 Cycles samples, frame 9 and seed 42 follow the task capture. Surface distance is taken from the fixed submission, and every variant’s depth array was checked against the baseline.

- `src/data/component-analysis.json`: the supplementary material's paired summaries for 27 tasks and 551 components. Room/component values use equal task weighting.
- `src/data/diagnostic.json` and `public/diagnostics/provenance.json`: the console diagnostic's original per-view dB values and image hashes. The four legacy stages include GT-assisted interventions, use the fixed GT foreground mask, and do not alter official results.
- Space-station H03/H06 images: frozen supplementary evidence for Astra low, trial `space-station__GtX4Q2f`. H06 depth MAE is 9.4078 m; normalized LPIPS is 99.45.
- The supplied modern-villa walkthrough is labeled GPT-6.2-Astra high in its filename. It is a qualitative demo; exact trial linkage has not been verified and it is not a leaderboard entry.

`public/data/blog-evidence-manifest.json` lists every image/video byte count and SHA256. Reconstruction and diagnostic PNG pixels are preserved. Video posters are separately derived WebPs.

## Writing sources

- User's `blog.md` outlines the title, motivation, interactive comparison, and walkthrough.
- Paper sections: benchmark construction, evaluation, experiments, and supplementary diagnostics.
- SpatialTree (Xiao et al., 2025), arXiv:2512.20617v1, §3, supplies the four-level spatial-ability framework. The blog attributes the framework explicitly rather than treating it as a universal hierarchy.
- Feynman's blackboard quotation is sourced to https://feynman.com/fun/quotes/.

## Publication

Astro emits both root-path and GitHub project-path builds. GitHub Pages serves `gh-pages`; `main` retains source. Do not add an Actions workflow unless the repository credential has the required workflow scope. The current custom domain is not changed by this release.
