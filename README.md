# Prahlad's Workshop

Static SvelteKit site with Git-backed Markdown content and a Decap CMS editor.

## Stack

- SvelteKit
- `@sveltejs/adapter-static`
- Markdown files in `src/content`
- Decap CMS at `/admin`
- Uploaded media in `static/uploads`

## Local Development

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Editing Content

Content is stored as Markdown:

- Projects: `src/content/projects`
- Blog: `src/content/blog`
- Art: `src/content/art`
- Interests ticker: `src/content/interests`
- Notes: `src/content/notes`

Each file has frontmatter fields:

```md
---
title: "Post title"
date: "2026-05-20"
summary: "Short description shown in lists."
tags: ["svelte", "cms"]
accent: "#d6632d"
featured: true
---

Markdown body goes here.
```

You can also edit content through `/admin` after GitHub CMS authentication is configured.

## CMS Setup

Update `static/admin/config.yml` before deploying:

- `repo`: your GitHub repo, for example `prahladsrini/prahlads-workshop`
- `branch`: usually `main`
- `site_url` and `display_url`: your deployed site URL

Decap CMS needs GitHub authentication in production. The usual static-site options are:

- Netlify Identity + Git Gateway if deploying on Netlify.
- A GitHub OAuth app / backend if deploying elsewhere.
- Local CMS editing during development with Decap's local backend.

## Build

```sh
npm run build
```

The static site is written to `build`.
