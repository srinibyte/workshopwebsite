# Prahlad's Website

Astro site for:
- `Homepage`
- `Blog`
- `Notes`
- `Gallery`
- `Projects`
- `Contact`

Hosted on Netlify.

## Local development

```bash
npm install
npm run dev
```

Build and validate:

```bash
npm run check
npm run build
```

## Content workflow

You can maintain this without Codex.

### Blog posts

Add markdown files to:

`src/content/blog/`

Frontmatter shape:

```md
---
title: "Post title"
description: "Short description"
date: "2026-05-27"
tags: ["tag-one", "tag-two"]
---
```

### Notes

Add markdown files to:

`src/content/notes/`

Frontmatter shape:

```md
---
title: "Note title"
summary: "Short summary"
date: "2026-05-27"
tags: ["tag-one", "tag-two"]
externalUrl: "https://example.com"
images:
  - src: "/uploads/your-image.jpg"
    alt: "Describe the image"
    caption: "Optional caption"
---
```

Write the note body below the frontmatter. Notes render directly into the feed on `/notes`.

### Gallery uploads

Put image files in:

`public/uploads/`

If an image belongs to a note, add it to that note's `images:` frontmatter. It will appear in:
- the note feed
- the gallery page

If you want a standalone gallery image, add a markdown file to:

`src/content/gallery/`

Example:

```md
---
title: "Gallery item"
date: "2026-05-27"
image: "/uploads/example.jpg"
alt: "Describe the image"
---
```

## Obsidian workflow

Recommended approach:
1. Write blog posts and notes in Obsidian as markdown.
2. Copy the finished markdown file into the matching content folder.
3. Copy any images into `public/uploads/`.
4. Run `npm run check`.
5. Run `npm run build`.
6. Commit and push to GitHub.

## Netlify

This repo is already configured for:
- build command: `npm run build`
- publish directory: `dist`

## Admin workflow

An in-site editor is configured at:

`/admin`

What it edits:
- `Blog`
- `Notes`
- `Projects`
- uploaded media in `public/uploads/`

Local use:
1. Run `npm run dev`
2. Run `npm run admin:proxy`
3. Open `http://127.0.0.1:4321/admin`
4. Decap can edit content directly in the repo through the local proxy

Deployment use:
1. Deploy to Netlify
2. Enable `Identity`
3. Enable `Git Gateway`
4. Invite your admin user
5. Open `/admin` on the live site and log in

Note:
- `local_backend: true` is enabled in `public/admin/config.yml` for local editing
- production editing expects Netlify Identity + Git Gateway
