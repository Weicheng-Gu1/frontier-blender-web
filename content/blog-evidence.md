# AgentRecBench blog evidence

The blog uses the approved November 17, 2026 paper snapshot. It does not rescore or run any benchmark. Model/category averages and the leaderboard come from `src/data/results.json`, also available under `public/data/results.json`.

## Interactive reconstruction figure

`public/reconstruction/provenance.json` maps the 42 predictions to model configuration, selected trial, submission/archive hashes, held-out camera, image hash, and official task score. Six tasks represent the six categories. Logo height represents a **category mean**, while the enlarged comparison caption reports the **individual task score**. Horizontal logo offsets have no metric meaning. The default predictions match the paper figure.

Images were recovered from the verified dev6 web backup snapshot. The Opus modern-villa pair comes from the paper's frozen fixed-camera capture (H03, frame 33, 32 samples, seed 42), with a separate matching GT image. The other six models use their recovered official images and the corresponding reference. Switching to Opus also switches the GT to preserve that pairing. No original submission or official score is changed.

## Analysis

- `src/data/component-analysis.json`: the supplementary material's paired summaries for 27 tasks and 551 components. Room/component values use equal task weighting.
- `src/data/diagnostic.json` and `public/diagnostics/provenance.json`: the console diagnostic's original per-view dB values and image hashes. All interventions are GT-assisted, use the fixed GT foreground mask, and do not alter official results.
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
