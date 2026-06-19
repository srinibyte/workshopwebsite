# Prahlad Srinivasan

Astro website with Blog, Notes, Projects, About, Decap CMS editing, and Netlify-hosted likes.

## Setup

```bash
npm install
```

## Local Website

Start the website:

```bash
npm run dev:local
```

Open:

```text
http://localhost:4321/
```

## Local Editor

Run these in two separate terminals:

```bash
npm run dev:local
npm run admin:proxy
```

Open:

```text
http://localhost:4321/admin/
```

Publishing in the local editor writes Markdown to `src/content/` and images to
`public/uploads/`. It does not deploy or push automatically.

After editing:

```bash
npm run check
npm run build
git status
git add .
git commit -m "Update site content"
git push origin main
```

The push triggers a Netlify deployment.

## Online Editor

Open:

```text
https://prahlad-workshop-site.netlify.app/admin/
```

Log in with the invited Netlify Identity account. Publishing creates a Git
commit through Git Gateway and triggers a Netlify deployment automatically.

Netlify requirements:

- Identity enabled
- Registration set to invite only
- Git Gateway enabled
- Admin email invited and confirmed

## Content

- Blog: `src/content/blog/`
- Notes: `src/content/notes/`
- Projects: `src/content/projects/`
- About: `src/content/about/about.md`
- Media: `public/uploads/`

Blog article bodies support multiple inline images through the rich-text editor.

Notes support:

- One preview image shown while collapsed
- Any number of additional photos shown when expanded
- Optional text, summary, tags, bookmark URL, captions, and alt text

## Validation

Run before pushing structural or design changes:

```bash
npm run check
npm run build
```

## Optional Notion Import

Notion can import Blog, Notes, and Projects into the local content folders.
It is not part of the default editing workflow.

Required environment variables are documented in `.env.example`.

```bash
npm run notion:pull
```

Use pruning only when Notion should replace all imported content:

```bash
npm run notion:pull:prune
```

Continuous polling is available with `npm run notion:watch`, but imported
changes still require a manual Git commit and push.

## Deployment

Netlify configuration is stored in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

The likes endpoint is deployed as `/.netlify/functions/likes`.
