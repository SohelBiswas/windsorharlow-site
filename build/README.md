# Editing the Windsor Harlow site

The site is plain HTML, one stylesheet and one script. The HTML pages are generated
from a few small Python files, so you edit content in one place and every page stays in sync.

## Where things live

| What | File |
| --- | --- |
| Service text, project case studies, FAQs, process steps | `build/content.py` |
| Blog posts (one Markdown file each) | `build/posts/*.md` |
| Card and service illustrations | `build/visuals.py` |
| AI page demo (sample documents + search logic) | `assets/js/ai-demo.js` |
| Shared page parts: nav, footer, hero, `<head>` | `build/layout.py` |
| Page assembly and the list of pages | `build/build.py` |
| All styling (colours are CSS variables at the top) | `assets/css/site.css` |
| Nav, reveals, animations, work filters, contact form | `assets/js/site.js` |
| Architecture diagrams | `assets/diagrams/*.svg` |
| Technology logos in the "stack" strip (from Simple Icons, CC0) | `build/logos.json` |
| Rune web UI screenshots | `assets/shots/` |
| Share images for links (one per page) | `assets/og/` |
| Logo files | `assets/brand/` |

## Making a change

1. Edit `build/content.py` (or the other files above).
2. From the repo root run: `python3 build/build.py`
   (Python 3.9 or newer; no packages to install).
3. Preview locally: `python3 -m http.server 8000`, then open http://localhost:8000
4. Commit and push. GitHub Pages serves the repo root.

Do not hand-edit the generated `.html` files; the next build overwrites them.

## Adding a project

Add a dict to the `WORK` list in `content.py` (copy an existing one).
`kind` is `client`, `product` or `lab`. Drop a diagram at
`assets/diagrams/<slug>-architecture.svg` and rebuild.

## Writing a blog post

Copy one of the files in `build/posts/`, rename it (the file name becomes the URL,
e.g. `my-post.md` → `blog/my-post.html`) and edit the header:

```
---
title: The post title
date: 2026-11-01
order: 1
category: Cloud & DevOps
cover: terraform-aws
service: cloud
summary: One or two sentences for cards and search results.
---
```

`order` sets the position on the blog page (1 is first). `cover` picks the card
artwork: `rune`, `terraform-aws` or `ai`. `service` is the slug of the related
service page (`ai`, `cloud`, `mobile`, `backend`, `web`, `commerce`, `salesforce`).

The body supports `##` and `###` headings, paragraphs, `-` and `1.` lists,
`> ` callouts, fenced code blocks, **bold**, *italic*, `code` and [links](https://example.com).
Rebuild and the post appears on the blog page, the home page (top three) and the sitemap.

## Share images

Each page uses `assets/og/<page>.jpg` when it exists (for example `blog-my-post.jpg`
for `blog/my-post.html`), and falls back to `assets/og/og.jpg`. The current images
were rendered for every page; ask for new ones when you add posts or projects.

## Logo files

`assets/brand/badge-vector.svg` and `assets/brand/wordmark-vector.svg` are vector traces
of the badge and wordmark (white versions end in `-white.svg`). The footer uses the white
ones. The other brand files contain small embedded images, so ask your designer for the
original vector files when you can.

## Contact form

There is no backend. Submitting opens the visitor's email app addressed to
`business@windsorharlow.com` (set as `MAIL` in `layout.py`), and shows the
message with a Copy button as a fallback.
