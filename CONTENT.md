# Editing projects

The **Blink App Redesign** project uses structured frontmatter + [Decap CMS](https://decapcms.org/) for browser editing.

## Browser editing (recommended)

**Terminal 1** — start the CMS backend:

```bash
npm run cms
```

**Terminal 2** — start the local site:

```bash
npm run dev
```

Open **http://localhost:8080/admin/** in your browser.

You should land directly on the editor — **no GitHub login** on localhost. If you see a login screen, `npm run cms` is probably not running.

After saving in the CMS, run `npm run build` to update the live HTML file (or rely on dev server for preview).

## Editing the file directly

The source file is `src/projects/blinkappredesign.md` — YAML frontmatter with `sections` → `blocks` (text or images). No more `{% section %}` shortcodes.

## Project settings in the CMS

| Field | What it does |
|-------|----------------|
| **Visible on site** | When off, hides the project page and keeps it off Work and Featured work |
| **Featured on home page** | Adds the project to Featured work on the home page |
| **Featured order** | Controls sort order (lower = earlier) |
| **Password protected** | Enables the password gate on the project page |
| **Password** | Used when protection is on; hashed into `data/project-gates.json` on build |

After saving in the CMS, run `npm run build` to update the site, featured cards, and password gates.

## Hidden projects

Projects with **Visible on site** turned off are hidden from the public site:

- No page is built at `/projects/.../`
- They won't appear on the Work page or in Featured work

To **show a project** on the site when ready:

1. Turn on **Visible on site** in the CMS (or set `visibleOnSite: true` in the markdown file)
2. Run `npm run build`

## Build for GitHub Pages

```bash
npm run build
```

Commits `projects/blinkappredesign/index.html` for deployment.

## Publishing the CMS to production

The admin UI is at `/admin/` on the built site. For editing on the live site (not just locally), you'll need a GitHub OAuth app — we can set that up when you're ready. Local editing works out of the box with `npm run cms`.
