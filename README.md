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

## Notion CMS

The site can use Notion as the writing interface for Blog, Notes, and Projects.
During `npm run build`, the site runs an optional Notion sync first. If the
Notion environment variables are missing, the sync is skipped and the local
Markdown files are used as-is.

Required environment variables are documented in `.env.example`:

```bash
NOTION_TOKEN=secret_xxx
NOTION_BLOG_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PROJECTS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_NOTES_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Create one Notion integration, copy its internal integration token, and share
each CMS database with that integration.

### Notion Database Properties

Blog database:

- `Title`: title
- `Slug`: text, optional
- `Subtitle / Dek` or `Description`: text
- `Date` or `Publish Date`: date
- `Draft`: checkbox
- `Tags`: multi-select
- `Cover Image`: files, optional
- `Cover Image Alt`: text, optional
- `Author Note`: text, optional

Notes database:

- `Title`: title
- `Slug`: text, optional
- `Summary`: text, optional
- `Date`: date
- `Type` or `Kind`: select with `bookmark`, `photo`, or `note`
- `Draft`: checkbox
- `Tags`: multi-select
- `Cover Image`: files, optional
- `Cover Image Alt`: text, optional
- `Additional Photos`, `Photos`, `Images`, or `images`: files, optional
- `External URL`: URL, optional

Projects database:

- `Title`: title
- `Slug`: text, optional
- `Description`: text
- `Date`: date
- `Draft`: checkbox
- `Status`: select with `idea`, `active`, `paused`, or `shipped`
- `Tags`: multi-select
- `Cover Image`: files, optional
- `Cover Image Alt`: text, optional
- `External URL`: URL, optional
- `Author Note`: text, optional

The body of each Notion page becomes the Markdown body. Supported Notion blocks
include paragraphs, headings, bullets, numbered lists, quotes, to-dos, code,
dividers, callouts, images, bookmarks, embeds, and link previews.

### Local Notion Editing

Add Notion values to `.env`, then run:

```bash
npm run notion:pull
npm run dev:local
```

To make Notion the source of truth and delete Markdown files no longer present
in Notion:

```bash
npm run notion:pull:prune
```

### Online Notion Editing

Set the Notion environment variables in Netlify. Netlify will pull from Notion
as part of `npm run build`.

After editing Notion, trigger a Netlify deploy. Options:

- Push any Git commit to `main`.
- Use Netlify's manual `Trigger deploy` button.
- Create a Netlify build hook and visit/call that hook after writing in Notion.

Continuous local polling is available with `npm run notion:watch`, but it is
only for local development.

## Deployment

Netlify configuration is stored in `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

The likes endpoint is deployed as `/.netlify/functions/likes`.
