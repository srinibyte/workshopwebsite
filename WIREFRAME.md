# Prahlad's Workshop Wireframe

## Direction

Prahlad's Workshop should feel like a warm, off-white digital workbench: retro, tactile, a little funny, and very personal. The style should borrow from old desktop software, hand-labeled storage drawers, pixel art, tool stickers, and physical workshop labels.

The site should not feel like a portfolio template. It should feel like a place Prahlad actively keeps, rearranges, and leaves interesting scraps in.

## Visual System

- Base color: off-white paper, aged plastic, faded cream.
- Accent colors: rust red, brass yellow, workshop green, faded blue, dusty magenta.
- Lines: dark brown/black outlines, thick borders, double rules, dotted dividers.
- Texture: subtle grid paper, scanline-like pixel texture, tiny label stickers.
- Buttons: clicky old-computer buttons with pressed states and short soft mechanical clicks.
- Sounds: avoid arcade/game sounds; use subtle UI clicks, switch toggles, relay taps, soft plastic button press sounds.
- Pixel art: small functional illustrations throughout, not just decoration.

Pixel art ideas:

- Workbench lamp
- Toolbox
- Soldering iron
- Folder icons
- Cassette tape
- Film reel
- Book stack
- Veg puff
- Tiny browser window
- Coffee mug
- Warning label / sticky note
- Wrench cursor / hand pointer

## Global Layout

```txt
┌──────────────────────────────────────────────────────────────┐
│ PW logo       Prahlad's Workshop          Projects Blog Art  │
│              tinkering, writing, art       Shenanigans CMS   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Page content                                                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Status strip: current interests ticker + last updated         │
└──────────────────────────────────────────────────────────────┘
```

Global components:

- Header with chunky pixel logo.
- Clicky nav buttons.
- Current interests ticker.
- Footer/status strip like old desktop software.
- Optional sound toggle, default on after first user interaction.

## Homepage

Purpose: immediately establish the workshop personality and route people to the four main areas.

```txt
┌──────────────────────────────────────────────────────────────┐
│ HERO                                                         │
│                                                              │
│ Prahlad's Workshop                                           │
│ A digital bench for projects, essays, art, recommendations,  │
│ odd findings, and whatever else is currently being tinkered  │
│ with.                                                        │
│                                                              │
│ [ Projects ] [ Blog ] [ Art ] [ Shenanigans ]                │
│                                      ┌─────────────────────┐ │
│                                      │ pixel workbench art │ │
│                                      └─────────────────────┘ │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬───────────────────────────────┐
│ Current Dabbles Ticker       │ Business Card                 │
│ music making · cinema notes  │ Prahlad Srinivasan            │
│ UI tinkering · books         │ links/socials/contact          │
└──────────────────────────────┴───────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Four Workshop Drawers                                         │
│                                                              │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│ │ Projects   │ │ Blog       │ │ Art        │ │ Shenanigans│  │
│ │ pixel icon │ │ pixel icon │ │ pixel icon │ │ veg puff   │  │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Latest from the bench                                         │
│ recent posts across blog/projects/art/shenanigans             │
└──────────────────────────────────────────────────────────────┘
```

Homepage behavior:

- Buttons depress visually and play a soft click.
- Pixel workbench has tiny animated details, like blinking light or moving fan.
- Interest ticker is CMS-editable.
- Latest section pulls from all content types.

## Blog Page

Purpose: longer writing, essays, process notes.

```txt
┌──────────────────────────────────────────────────────────────┐
│ Blog                                                         │
│ Longer writing from the workbench.                           │
├──────────────────────────────────────────────────────────────┤
│ [All] [Essays] [Process] [Notes] [Systems]                   │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ date     tag                                             │ │
│ │ Post title                                               │ │
│ │ short summary                                            │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ date     tag                                             │ │
│ │ Post title                                               │ │
│ │ short summary                                            │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Blog post page:

- Large title.
- Date, tags, reading time.
- Off-white article surface.
- Pixel margin notes or small sticker labels.
- Related posts at bottom.

CMS fields:

- Title
- Date
- Summary
- Tags
- Featured
- Body

## Projects Page

Purpose: things built, experiments, prototypes, websites, tools.

```txt
┌──────────────────────────────────────────────────────────────┐
│ Projects                                                     │
│ Things made, fixed, tested, abandoned, shipped.              │
├──────────────────────────────────────────────────────────────┤
│ [All] [Web] [Tools] [Experiments] [In progress] [Shipped]    │
├──────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌──────────────────────────────┐ │
│ │ pixel/project preview   │ │ title                        │ │
│ │ status label            │ │ summary                      │ │
│ │ accent strip            │ │ tags                         │ │
│ └─────────────────────────┘ └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Project page:

- Problem / idea.
- What I made.
- Stack / materials.
- Screenshots or artifacts.
- What I learned.
- Links.

CMS fields:

- Title
- Date
- Status
- Summary
- Tags
- Accent color
- Featured
- External link
- Body

## Art Page

Purpose: work Prahlad makes, things Prahlad likes, and recommendations across music, cinema, and books.

```txt
┌──────────────────────────────────────────────────────────────┐
│ Art                                                          │
│ Music, cinema, books, sketches, recommendations, and work.   │
├──────────────────────────────────────────────────────────────┤
│ [Made by me] [Music] [Cinema] [Books] [Recommendations]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Made by me                                                   │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│ │ music/film │ │ sketch     │ │ writing    │                │
│ └────────────┘ └────────────┘ └────────────┘                │
│                                                              │
│ Recommendations                                               │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│ │ album      │ │ film       │ │ book       │                │
│ └────────────┘ └────────────┘ └────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

Art content types:

- Own music
- Own films
- Visual work
- Music recommendations
- Cinema recommendations
- Book recommendations

Letterboxd import:

- Use Letterboxd RSS feed or exported CSV.
- Store imported films as Art entries with `kind: cinema`.
- Optional fields: rating, review URL, watched date, poster URL.

Goodreads import:

- Goodreads API access is limited, so the practical option is usually Goodreads export CSV.
- Store imported books as Art entries with `kind: book`.
- Optional fields: author, rating, review URL, read date, cover URL.

CMS fields:

- Title
- Date
- Kind: music, cinema, book, film, visual, recommendation
- Creator / author / artist
- Rating
- External URL
- Summary
- Tags
- Featured
- Body

## Shenanigans Page

Purpose: funny, loose, miscellaneous posts. This is where the site gets personality.

```txt
┌──────────────────────────────────────────────────────────────┐
│ Shenanigans                                                  │
│ Loose screws, snack reviews, tiny theories, and field notes. │
├──────────────────────────────────────────────────────────────┤
│ Featured first post: The Art of a Veg Puff                   │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ pixel veg puff                                           │ │
│ │ A serious investigation into the engineering, flake,      │ │
│ │ heat, filling distribution, and emotional architecture    │ │
│ │ of the veg puff.                                         │ │
│ └──────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ More shenanigans                                             │
│ list/grid of weird posts                                     │
└──────────────────────────────────────────────────────────────┘
```

First post:

Title: The Art of a Veg Puff

Tone: mock-serious, funny, oddly thoughtful.

Possible sections:

- The crust as architecture
- The filling distribution problem
- Why the paper bag matters
- The correct temperature window
- Flake-to-floor loss ratio
- Conclusion: a humble masterpiece

CMS fields:

- Title
- Date
- Summary
- Tags
- Featured
- Body

## Content Model

Recommended folders:

```txt
src/content/blog
src/content/projects
src/content/art
src/content/shenanigans
src/content/interests
```

Recommended routes:

```txt
/
/blog
/blog/[slug]
/projects
/projects/[slug]
/art
/art/[slug]
/shenanigans
/shenanigans/[slug]
/admin
```

## Admin Requirements

Decap CMS should support:

- Blog posts
- Projects
- Art entries
- Shenanigans posts
- Current interests ticker
- Uploads for images/audio/posters/covers

Future import tools:

- Letterboxd CSV/RSS importer.
- Goodreads CSV importer.
- Optional recommendation fields for ratings, source URLs, and creator names.

## Interaction Notes

- Sounds should be subtle and physical, not arcade-like.
- Add a sound toggle in the header or footer.
- First user interaction should unlock audio.
- Pressed states should be visible even without sound.
- Every clickable card should feel like an object.

## Next Design Pass

1. Add `/shenanigans` route and first veg puff post.
2. Expand Art schema for music/cinema/books/recommendations.
3. Add pixel-art components instead of only CSS blocks.
4. Add sound toggle and more realistic click sound.
5. Replace placeholder socials/email.
6. Add optional import scripts for Letterboxd and Goodreads exports.
