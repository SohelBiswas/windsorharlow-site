# -*- coding: utf-8 -*-
"""A small Markdown reader for blog posts (standard library only).

Supported: front matter between --- lines, ## and ### headings, paragraphs,
- bullet and 1. numbered lists, > callouts, ``` code fences, **bold**, *italic*,
`inline code` and [links](https://...). That is all a post needs; keep posts simple.
"""
import html
import re


def front_matter(text):
    meta = {}
    if text.startswith("---"):
        _, fm, body = text.split("---", 2)
        for line in fm.strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
        return meta, body.lstrip("\n")
    return meta, text


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def inline(s):
    s = html.escape(s, quote=False)
    codes = []

    def keep(m):
        codes.append(m.group(1))
        return f"\x00{len(codes) - 1}\x00"
    s = re.sub(r"`([^`]+)`", keep, s)
    s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", lambda m: (
        f'<a href="{m.group(2)}"' + (' target="_blank" rel="noopener"' if m.group(2).startswith("http") else "") + f'>{m.group(1)}</a>'), s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"(?<![*\w])\*([^*]+)\*(?!\w)", r"<em>\1</em>", s)
    s = re.sub(r"\x00(\d+)\x00", lambda m: f"<code>{codes[int(m.group(1))]}</code>", s)
    return s


def render(body):
    """Return (html, toc) where toc is a list of (id, heading) for ## headings."""
    out, toc = [], []
    lines = body.splitlines()
    i = 0
    para = []

    def flush():
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    while i < len(lines):
        line = lines[i]
        st = line.strip()
        if st.startswith("```"):
            flush()
            lang = st[3:].strip()
            code = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            label = f'<span class="code-lang">{html.escape(lang)}</span>' if lang else ""
            out.append(f'<div class="code">{label}<pre><code>{html.escape(chr(10).join(code))}</code></pre></div>')
            i += 1
            continue
        if not st:
            flush()
            i += 1
            continue
        if st.startswith("### "):
            flush()
            out.append(f"<h3>{inline(st[4:])}</h3>")
        elif st.startswith("## "):
            flush()
            t = st[3:]
            hid = slugify(t)
            toc.append((hid, t))
            out.append(f'<h2 id="{hid}">{inline(t)}</h2>')
        elif st.startswith("> "):
            flush()
            quote = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append('<aside class="callout"><p>' + inline(" ".join(quote)) + "</p></aside>")
            continue
        elif re.match(r"^(-|\d+\.)\s", st):
            flush()
            ordered = bool(re.match(r"^\d+\.", st))
            items = []
            while i < len(lines) and re.match(r"^(-|\d+\.)\s", lines[i].strip()):
                item = re.sub(r"^(-|\d+\.)\s+", "", lines[i].strip())
                i += 1
                while i < len(lines) and lines[i].startswith("  ") and lines[i].strip() and not re.match(r"^(-|\d+\.)\s", lines[i].strip()):
                    item += " " + lines[i].strip()
                    i += 1
                items.append(f"<li>{inline(item)}</li>")
            tag = "ol" if ordered else "ul"
            out.append(f"<{tag}>{''.join(items)}</{tag}>")
            continue
        else:
            para.append(st)
        i += 1
    flush()
    return "\n".join(out), toc


def reading_minutes(body):
    words = len(re.findall(r"\w+", re.sub(r"```.*?```", "", body, flags=re.S)))
    return max(1, round(words / 220))
