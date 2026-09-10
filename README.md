# Vineeth Dhagey — portfolio

A static, dependency-free portfolio site. Three files plus assets; no build step, no
package manager, no framework.

```
index.html        markup, SEO metadata, JSON-LD, inline SVG icon sprite
styles.css        design tokens + components (single stylesheet)
script.js         nav, reveals, counters, cursor, hero typewriter, hero canvas
profile.png       hero photo — overwrite this file with your own portrait
volvo-logo.png    shown in the Volvo experience entry
rise-logo.png     shown in the RISE experience entry
O9FG5M0.jpg       original background image (unused)
```

## Running it

Open `index.html` directly, or serve the folder:

```
python3 -m http.server 8000
```

## Deploying

Any static host. Push the folder to a repo and enable GitHub Pages (branch `main`,
folder `/`), or drag the folder onto Netlify / Vercel / Cloudflare Pages. Nothing to
build.

Before going live, replace `https://vineethdhagey.com` in the `<link rel="canonical">`
and the Open Graph / Twitter tags in `index.html` with the real domain.

## Editing content

Everything is plain HTML — no templating.

**Adding a project.** Copy one `<article class="card reveal" data-glow>` block in the
`#projects` section and change the icon, title, description, tags and repo `href`.
Reveals and hover glow are wired by class, so nothing else is needed.

**Promoting a different project to featured.** Swap the content of `.feature__meta`.
The diagram in `.feature__visual` is hand-drawn SVG specific to the EagleEye pipeline —
if you feature something else, redraw it or delete the `.feature__visual` block
(the layout collapses to a single column cleanly).

**Swapping in a real photo.** Overwrite `profile.png` with your own portrait —
no code change needed. Square or slightly portrait crops work best (the frame is
4:4.4 and uses `object-fit: cover`). The same applies to `volvo-logo.png` and
`rise-logo.png` if you get the official marks.

**Colours and type.** All tokens live in `:root` at the top of `styles.css`. The site
uses one accent hue (`--accent` / `--accent-lift` / `--accent-deep`); changing those
three values re-themes the whole page.

## Notes

- Grey text tokens are set at WCAG AA contrast against the background
  (`--text-dim` 9.2:1, `--muted` 6.6:1, `--faint` 4.8:1). If you darken them, re-check.
- `prefers-reduced-motion: reduce` disables the hero canvas animation, the hero
  typewriter, the custom cursor, magnetic buttons, scroll-reveals and smooth scrolling.
  Counters and the hero headline render at their final state immediately.
- The custom cursor and magnetic buttons only initialise on `(pointer: fine)` devices,
  so touch is unaffected.
- The hero canvas stops when scrolled out of view and when the tab is hidden.
- Fonts load from Google Fonts; skill, project and education icons come from the
  Font Awesome 6 CDN. Both need a network connection on first load.

## Known content issues

Two dates came straight from the original site and were left as-is rather than
guessed at:

- The hero and About describe you as a Master's graduate, while the education entry
  still reads `Jan 2025 — Present` for BTH.
- The Volvo Group entry still reads `Jun 2026 — Present`. You mentioned the
  internship has finished, so set its end month in the `#experience` section.
