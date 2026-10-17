# Olive Tree 3D Studio

Interactive interior quotations and room models for Olive Tree Interiors.

## Website

Static website files are in `dist/`. All assets use relative URLs and support a GitHub Pages project path.

- Complete four-house quotation, room subtotals and inclusion controls.
- Kitchen, three bedroom and hall 3D viewers with mica selection and opening doors.
- PDF generation with realistic AI-generated unit reference photos.
- Customer choices save locally in the browser.

## GitHub Pages deployment

Create repository `olive-tree-3d-studio`, upload this project to its `main` branch, and choose **GitHub Actions** under **Settings → Pages → Build and deployment → Source**. The included workflow deploys only `dist/` after each push.

The public website contains client quotation details. Source SketchUp inputs remain outside the deployed `dist/` directory.

## Local checks

Run `node check-home.mjs` for quotation and room route checks. The photo PDF test additionally needs the `pdf-lib` dependency available in Node. The browser bundles its own copy.

## Asset bundle

Images and binary models are stored in checked archive parts under `assets/`. Run `python3 scripts/unpack-assets.py` after cloning. The deployment workflow does this automatically.
