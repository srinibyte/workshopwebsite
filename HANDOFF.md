# Prahlad's Workshop Handoff

Use this document to resume work on the site later.

## Project Location

```sh
cd /Users/prahladsrini/projects/prahlads-workshop
```

## Current Stack

- SvelteKit
- TypeScript
- Static build via `@sveltejs/adapter-static`
- Markdown content in `src/content`
- Decap CMS route at `/admin`
- Git repo on branch `main`

## Restart Commands

```sh
npm run dev
```

Open:

```txt
http://127.0.0.1:5173/
```

If Vite chooses another port, use the URL it prints.

Verification:

```sh
npm run check
npm run build
```

## Content Folders

```txt
src/content/projects
src/content/blog
src/content/art
src/content/shenanigans
src/content/interests
src/content/notes
```

Important existing content:

- `src/content/shenanigans/the-art-of-a-veg-puff.md`
- `src/content/art/favourite-music.md`
- `src/content/art/cinema-notes.md`
- `src/content/art/book-stack.md`
- `src/content/projects/workshop-os.md`
- `src/content/blog/static-sites-living-archives.md`

## Routes

```txt
/
/projects
/projects/[slug]
/blog
/blog/[slug]
/art
/art/[slug]
/shenanigans
/shenanigans/[slug]
/admin
```

## Design Direction

The site is called:

```txt
Prahlad's Workshop
```

Current intended vibe:

- Retro but clean
- Off-white base
- More green in the palette
- Pixel art details
- Clicky, physical UI sounds, not video game sounds
- Tactile buttons
- Workshop/tinkerer feel
- Trendier, cleaner heading typography using static/system-safe font stacks

Main icon direction:

- Replace the `PW` mark with a pixel-art playing card icon.
- This work has been started in `src/routes/+layout.svelte` and `src/styles.css`, but should be checked visually next session.

Footer/contact direction:

- CMS button should not appear in the top nav.
- CMS link should only be at the bottom.
- Bottom should include a centered American Psycho-inspired business card.
- Text on card:

```txt
"oh, the subtle off white colouring of it"
```

- Include link slots for Instagram, LinkedIn, and Email.

## Latest Completed Work

Completed and committed:

- Basic SvelteKit static site
- Markdown content system
- Decap CMS config
- Projects, Blog, Art, Shenanigans sections
- First Shenanigans post: `The Art of a Veg Puff`
- Business-card footer
- Removed CMS from top nav
- CMS remains at bottom
- Softer click sound
- Wireframe doc at `WIREFRAME.md`

Recent commits:

```sh
git log --oneline -5
```

## Important Pending Request

The user asked:

```txt
ooh and also add a night mode and dark mode
```

This was not completed yet.

Next session should implement:

1. Theme toggle in bottom status strip or header.
2. Three modes:
   - light
   - night
   - dark
3. Persist selected theme in `localStorage`.
4. Use `data-theme` on `<html>` or `<body>`.
5. Add CSS variables for each theme.
6. Make sure the green direction works in all themes.

Suggested implementation:

- In `src/routes/+layout.svelte`, add:
  - `type Theme = 'light' | 'night' | 'dark'`
  - state for theme
  - `onMount` to read `localStorage`
  - function to cycle theme
  - update `document.documentElement.dataset.theme`
  - button in `.status-strip`
- In `src/styles.css`, add:
  - `:root` for light
  - `:root[data-theme='night']`
  - `:root[data-theme='dark']`

## Files To Inspect First Next Time

```txt
src/routes/+layout.svelte
src/routes/+page.svelte
src/styles.css
src/lib/sounds.ts
src/lib/content.ts
static/admin/config.yml
```

## Known Placeholder Links

Replace these later:

- Instagram: `https://www.instagram.com/`
- LinkedIn: `https://www.linkedin.com/`
- Email: `mailto:prahlad@example.com`

## Git Notes

The working tree should be checked before starting:

```sh
git status --short
```

Do not reset or overwrite user changes.

## Deployment Later

Not deployed yet.

Likely Netlify settings:

```txt
Build command: npm run build
Publish directory: build
Branch: main
```

Before deployment, update:

```txt
static/admin/config.yml
```

Replace placeholder site URLs and confirm:

```yml
repo: prahladsrini/prahlads-workshop
branch: main
```

## Resume Prompt

Suggested message to paste next week:

```txt
Resume work on Prahlad's Workshop. Read HANDOFF.md first. Continue from the pending request: add light/night/dark theme modes, finish the pixel-art playing card app icon, keep the green/off-white direction, and verify with npm run check and npm run build.
```
