# SpatialSpeak project page

A static research project website, ready for GitHub Pages. The site has no build step, package dependencies, external font requests, analytics, or model inference service.

## Preview locally

Run this inside the project folder:

```sh
python3 preview.py
```

Open `http://127.0.0.1:8765`. The preview server supports video seeking. Use this local server, rather than opening `index.html` directly, so the browser can load the point clouds and video. GitHub Pages serves the site directly; the Python file is only for local preview.

## Publish on GitHub Pages

1. Create a repository for the project page and upload this folder's contents to the repository root, including `.nojekyll`.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and `/(root)`, then save.

The relative asset URLs work for both a user site and a project subdirectory. Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Public links

The Paper button links directly to https://arxiv.org/pdf/2609.33616. The BibTeX citation uses an `@article` entry with `journal = {arXiv preprint arXiv:2609.33616}`.

The Code button links to https://github.com/yangcaoai/SpatialSpeak-VLM without a release-status badge. The `codeComingSoon` option controls whether a status badge is shown.

The project-page URL recorded in the current Overleaf abstract is https://yangcaoai.github.io/SpatialSpeak/. It is configured as the canonical URL; deployment is still pending. The website abstract retains the matching scientific text without repeating a link to itself.

Public resource links are configured in `site-config.js`:

```js
window.SITE_CONFIG = {
  paperUrl: 'https://arxiv.org/pdf/2609.33616',
  arxivUrl: 'https://arxiv.org/abs/2609.33616',
  codeUrl: 'https://github.com/yangcaoai/SpatialSpeak-VLM',
  codeComingSoon: false,
  projectUrl: 'https://yangcaoai.github.io/SpatialSpeak/',
};
```

Both the Paper and Code links also work without JavaScript. No private Overleaf sharing URLs are exposed. The scene0441_00 asset is built from the updated fig5.ply and contains 21,905 points.

## Video demonstration

The 42-second, 1280 × 720 H.264 MP4 contains three 14-second examples: scene0030_00 (Figure 3), scene0441_00 (Figure 5), and scene0578_00 (Figure 6). Each pairs a leveled point cloud with a line-by-line reveal of the recorded response from the supplied PowerPoint. All three clouds start rotating immediately with no initial hold, turn 45° left by 3.5 seconds, sweep through their starting view at 7 seconds to 45° right at 10.5 seconds, and return to their starting view at 14 seconds. Smooth easing softens each direction change. For scene0441_00 and scene0578_00, the author-selected starting view is the previous 24° left turning point; scene0030_00 retains its original starting view. Posters use these same starting views. Each response types in from 1 second and is complete just before 8 seconds; the final answer appears at 8 seconds, leaving 6 seconds to read. The two-line header reads “QA-Native Reconstruction with Local and Global Context” and “for Spatial Chain-of-Thought Reasoning”, with both lines using the same font size, weight, and neutral color. All recorded response lines, including reliability labels, use the same font, size, and color. It has no audio and does not run inference.

The video supports playback controls, fullscreen, chapter buttons and direct download. Reduced-motion preferences disable automatic playback. In the interactive viewer, Replay reveals the response over about 8 seconds while rotating the cloud.

## Content and assets

- `index.html`: manuscript title, authors, abstract, results and narrative.
- `styles.css`: desktop and mobile layout.
- `app.js`: recorded examples, scene navigation, figure enlargement and citation copy.
- `demo.js`: video chapters, visibility-aware playback and response replay.
- `assets/videos/`: MP4 demonstration and three poster images.
- `cloud-viewer.js`: WebGL point-cloud renderer with mouse, touch and keyboard controls.
- `assets/figures/`: seven SVG figures converted directly from the paper's supplied PDFs, with paths for text and vector graphics and embedded original image data. White page margins are cropped by SVG viewBox. Each unmodified source PDF is also included. Metric detail views preserve the PDF's original red arrows.
- `assets/frames/`: original input images and reconstruction views extracted from the supplied seven-slide PowerPoint.
- `assets/clouds/`: the five displayed colored point clouds, repacked for browser loading. Only scene0086_02 is cropped to the author-selected display region; the other four point clouds retain all source points.

### Point-cloud representation

Each `.bin` begins with a little-endian unsigned 32-bit point count. Every point then occupies 16 bytes: three little-endian float32 coordinates, three uint8 RGB values, and one padding byte. RGB values and metric coordinates come from the PLY source. The viewer converts camera coordinates to a Y-up view, applies a rigid display rotation estimated from dominant horizontal surfaces, and then centers and scales the scene. This levels the view without changing the source geometry or metric distances. It does not perform reconstruction, inference, or measurement.

### Example mapping

| Website example | PLY source | Paper material |
| --- | --- | --- |
| scene0030_00 | `fig3_and_fig7.ply` | Figure 3 |
| scene0441_00 | `fig5.ply` | Figure 5 |
| scene0578_00 | `fig6.ply` | Figure 6 |
| scene0086_02 | `fig4.ply` | Figures 4 and 7 |
| scene0645_00 | `fig7.ply` | Figure 7 |

Reasoning text and answers are recorded examples from the paper and slides. The interactive viewer is a geometry viewer, not a live VLM demo. The additional scene0647_00 is excluded from this version.

## Measurement annotations and overview

The full paper overview is displayed directly after the demonstration video, including its performance chart. The two metric scenes appear side by side in a dedicated comparison section. Their red arrows and values are exact views of the annotated paper figures, using SVG view boxes to preserve the original marked spans. All scenes open in the rotating 3D view, with a toggle to show the original marked span for the two metric examples. The source-paper views retain the exact 2D marks. The interactive views additionally show red double-ended arrows in source 3D coordinates, with readable labels projected from their midpoints. The author requested visual alignment to the figures because original endpoint coordinates were unavailable; these are illustrative anchors and the displayed 1.24 m / 2.52 m values are reported paper results, not distances recomputed from the hand-aligned anchors.

## Key reported results

ReVSI 62.8; VSI-Bench normal training 63.3; VSI-Bench scaled training 73.0; SPAR-Bench 76.0. Benchmark comparisons preserve the paper's training/evaluation distinctions. The ReVSI chart displays a 20–65% score range; bar lengths are (score − 20) / (65 − 20), with the range labeled on the axis and in the chart note.

## Accessibility and fallback

The three QA scenes appear first, followed by the two metric reconstruction scenes. The public scene labels omit manuscript figure numbers.

Scene tabs support arrow keys, Home and End. The focused 3D viewer supports arrow keys, +/− and R. Automatic rotation starts by default and has a pause control; a user pause persists when changing scenes. Reduced-motion preferences disable automatic rotation. Point diameter is 16% larger than the previous version. Figures open in a keyboard-accessible dialog; Escape closes it. A static reconstruction image is shown if WebGL is unavailable or a point cloud cannot load. The research summary, tables, citation and paper figures remain readable without JavaScript.

## Selected display region

For scene0086_02, the author requested removal of the distant left-side region. The web asset retains source points with x ≥ −1.4: 20,189 of 21,980 points (1,791 removed). Retained coordinates and RGB values are unchanged. The original fig4.ply, annotated paper comparisons, and all other point clouds are untouched. This is a region-of-interest crop for presentation, not a new reconstruction or an outlier-removal benchmark result.

The page uses the restored blue-to-purple title gradient and purple accents; the video uses matching purple accents. The original paper figures keep their own colors. PDF-to-SVG conversion preserves vector text and lines; embedded scene photographs and reconstruction rasters remain limited by the source resolution. The enlargement dialog includes an original-PDF link.

The method section keeps the QA-RP and CoT-VC descriptions without additional summary headlines. The abstract uses the neutral heading "Abstract".


## Rotating metric annotations

`cloud-annotations.js` transforms annotation endpoints with exactly the same centering, axis conversion, leveling matrix and normalization as the point cloud. The red dashed double-headed arrow is a 3D triangle mesh; its label stays upright while following its projected midpoint. Arrow graphics are drawn above sparse points for readability. The annotation is cleared on scene changes and hidden in the static Paper view. The source PLY/BIN data is unchanged.

Illustrative source-coordinate anchors, visually aligned to the original paper figures:

- scene0086_02: (-0.85, -0.30, 1.43) to (0.30, -0.67, 1.65), paper label 1.24 m.
- scene0645_00: (-0.85, 0.55, 1.15) to (0.70, -0.24, 2.70), paper label 2.52 m.

Input and comparison thumbnails preserve each source image's native aspect ratio without cropping. They use four columns on desktop and two columns on screens up to 760 pixels wide.
