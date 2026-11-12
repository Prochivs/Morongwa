# Morongwa

A responsive, build-free brand website for Morongwa.

## Run locally

From this directory, start any static server, for example:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Customize

- Edit the page copy and links in `index.html`.
- Change the visual theme in the variables at the top of `styles.css`.
- Replace the GitHub contact link with the preferred email or social profile before launch.

## Deploy

The site has no build step. The included GitHub Actions workflow publishes the
repository root to GitHub Pages whenever `main` is updated.
