# -*- coding: utf-8 -*-
"""Windsor Harlow site generator.

    python3 build/build.py

Reads copy from build/content.py and writes every page into the repository
root (the folder above build/). Static assets in assets/ are hand-written and
are not touched. No dependencies beyond the Python standard library.
"""
import os
import sys
import datetime

sys.path.insert(0, os.path.dirname(__file__))
from layout import (head, body_open, footer, topnav, sky_art, page_hero,
                    icon, orb, esc, SITE, MAIL)
from visuals import service_art, cover
import md
import glob
import json
from content import (SERVICES, WORK, PROCESS, MODELS, PRINCIPLES, HOME_FAQ,
                     CONTACT_FAQ, ORBIT_OUTER, ORBIT_INNER)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WRITTEN = []
SVC = {s["slug"]: s for s in SERVICES}
WK = {w["slug"]: w for w in WORK}


def load_posts():
    posts = []
    for f in glob.glob(os.path.join(os.path.dirname(__file__), "posts", "*.md")):
        meta, body = md.front_matter(open(f, encoding="utf-8").read())
        html_body, toc = md.render(body)
        meta.update(slug=os.path.splitext(os.path.basename(f))[0], html=html_body, toc=toc,
                    minutes=md.reading_minutes(body), order=int(meta.get("order", 99)))
        posts.append(meta)
    return sorted(posts, key=lambda p: (p["order"], p["date"]))


POSTS = load_posts()
POST_COVER = {"rune": "rune", "terraform-aws": "terraform-aws", "ai": "ai-post"}


def nice_date(d):
    x = datetime.date.fromisoformat(d)
    return f"{x.day} {x:%b %Y}"


def write(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(html)
    WRITTEN.append(path)
    print("  wrote", path)


# ------------------------------------------------------------ fragments
def faq(items, cls=""):
    out = []
    for i, (q, a) in enumerate(items):
        out.append(f'<details class="rv d{min(i,4)}"{" open" if i == 0 else ""}><summary>{q}<span class="pm" aria-hidden="true">+</span></summary><p class="ans">{a}</p></details>')
    return f'<div class="faq {cls}">{"".join(out)}</div>'


def section_head(label, title, lede="", align=""):
    lede_html = f'<p class="lede">{lede}</p>' if lede else ""
    return f'<div class="section-head {align} rv"><span class="label">{label}</span><h2 class="h-section">{title}</h2>{lede_html}</div>'


def chips(items):
    return '<div class="chips">' + "".join(f'<span class="chip">{esc(t)}</span>' for t in items) + "</div>"


def ticks(items):
    return '<ul class="ticks sm">' + "".join(f"<li>{esc(x)}</li>" for x in items) + "</ul>"


def wcard(w, base, extra_cls="", delay=0):
    """Client / product card. Hover (or first tap) pours a 'drip' panel down with the details."""
    if w["kind"] == "lab":
        return fcard(w, base, delay)
    facts = "".join(f'<span><em>{esc(k)}</em>{esc(v)}</span>' for k, v in w["facts"])
    drips = "".join(f'<i style="--x:{x}%;--w:{wd}px;--h:{h}px;--t:{t}s"></i>' for x, wd, h, t in
                    [(6, 26, 46, .05), (19, 18, 70, .12), (33, 34, 38, 0), (48, 22, 84, .1), (63, 30, 52, .16), (78, 20, 66, .04), (90, 28, 40, .14)])
    return (f'<a class="wcard drip-card rv d{delay} {extra_cls}" href="{base}work/{w["slug"]}.html" data-kind="{w["kind"]}" data-reveal>'
            f'<div class="media" aria-hidden="true">{cover(w["slug"], base)}</div>'
            f'<div class="meta"><div><span class="tag {w["kind"]}">{w["kind_label"]}</span><h3>{w["title"]}</h3><p>{w["summary"]}</p></div>'
            f'<span class="go" aria-hidden="true">→</span></div>'
            f'<div class="drip" aria-hidden="true"><div class="drip-in">'
            f'<span class="label glass">{esc(w["category"])}</span>'
            f'<h3>{esc(w["tagline"])}</h3>'
            f'<div class="dfacts">{facts}</div>'
            f'{ticks([c[0] for c in w["caps"][:4]])}'
            f'<span class="more">Read the case study <span class="arr">→</span></span>'
            f'</div><span class="drops">{drips}</span></div></a>')


def fcard(w, base, delay=0):
    """Engineering-lab card: engaging front, flips to the details on hover (or first tap)."""
    stack = " · ".join(w["lab_line"].split(" · "))
    return (f'<a class="fcard rv d{min(delay, 4)}" href="{base}work/{w["slug"]}.html" data-kind="lab" data-reveal>'
            f'<span class="fc-in">'
            f'<span class="fc-front"><span class="fc-cover" aria-hidden="true">{cover(w["slug"], base)}</span>'
            f'<span class="fc-meta"><span class="tag lab">Engineering lab</span><span class="h">{esc(w["title"])}</span>'
            f'<span class="mono">{esc(stack)}</span><span class="hint" aria-hidden="true">↻</span></span></span>'
            f'<span class="fc-back"><span class="label glass">{esc(w["category"])}</span>'
            f'<span class="h">{esc(w["tagline"])}</span><span class="p">{esc(w["summary"])}</span>'
            f'{ticks([c[0] for c in w["caps"][:3]])}'
            f'<span class="more">Explore the build <span class="arr">→</span></span></span>'
            f'</span></a>')


def rune_feature(base):
    return (f'<a class="feature rv" href="{base}work/rune.html">'
            '<svg aria-hidden="true" viewBox="0 0 1200 360" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><path d="M 600 400 C 760 260, 900 160, 1240 60" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/><path d="M 640 400 C 820 280, 960 190, 1240 120 L 1240 400 Z" fill="#fff" opacity=".08"/></svg>'
            '<div class="feature-copy"><span class="label glass">Our product · now open source</span><span class="big">Rune</span>'
            '<p>An open-source secrets manager for application passwords, keys and tokens. Encrypted, sealed by default, and yours to run.</p><span class="go" aria-hidden="true">→</span></div>'
            f'<div class="feature-shot" aria-hidden="true">{browser(base + "assets/shots/rune-dashboard.jpg", "")}'
            '<div class="terminal mini"><div><span class="p">$</span> rune unseal</div><div class="ok">✔ Vault Unsealed Successfully</div></div></div></a>')


def lab_cards(base):
    labs = [w for w in WORK if w["kind"] == "lab"]
    out = [fcard(w, base, i) for i, w in enumerate(labs)]
    out.append(f'<a class="fcta rv d4" href="{base}work.html"><span class="label glass">All work</span>'
               f'<span class="h">8 projects. Client tools, our own product and the lab.</span>'
               f'<span class="btn btn-light sm">See all work <span class="arr" aria-hidden="true">↗</span></span></a>')
    return '<div class="flip-grid">' + "".join(out) + "</div>"


def process_block(detail=False):
    steps = []
    for n, t, d, items in PROCESS:
        ul = ("<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>") if detail else ""
        steps.append(f'<div class="step"><span class="num">{n}</span><h3>{t}</h3><p>{d}</p>{ul}</div>')
    return f'<div class="process"><div class="process-line" aria-hidden="true"><i></i><b></b></div><div class="steps">{"".join(steps)}</div></div>'


def orbit_panel(base, heading_level="h2"):
    """Technology icons orbiting the badge (icons from build/logos.json, coloured to match the site)."""
    import math
    by = {l["title"]: l for l in LOGOS}
    alias = {"AWS": "Amazon Web Services"}

    def place(items, r):
        out = []
        for i, t in enumerate(items):
            a = i / len(items) * math.pi * 2
            x, y = round(math.cos(a) * r), round(math.sin(a) * r)
            lg = by.get(alias.get(t, t))
            glyph = f'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="{lg["path"]}"/></svg>' if lg else esc(t)
            out.append(f'<span style="transform:translate(-50%,-50%) translate({x}px,{y}px)"><i data-name="{esc(t)}" title="{esc(t)}">{glyph}</i></span>')
        return "".join(out)
    names = ", ".join(ORBIT_OUTER + ORBIT_INNER)
    return f"""<div class="orbit-panel rv">
  <div class="orbit-copy">
    <span class="label">Where we work</span>
    <{heading_level} class="h-section">Built in India. Working worldwide.</{heading_level}>
    <p class="lede">Remote by design, with clear communication, documented decisions and modern tools your team already knows.</p>
  </div>
  <div class="orbit" role="img" aria-label="Technologies we use, orbiting the Windsor Harlow badge: {names}">
    <div class="orbit-ring r1">{place(ORBIT_OUTER, 200)}</div>
    <div class="orbit-ring r2">{place(ORBIT_INNER, 120)}</div>
    <span class="orbit-core"><img src="{base}assets/brand/badge-vector-white.svg" alt=""></span>
  </div>
</div>"""


def stack_cards(base):
    out = []
    for s in SERVICES:
        out.append(f"""<article class="stack-card">
  <div class="stack-copy">
    <div class="svc-name">{orb(s["icon"])}<span class="n">{s["num"]}</span><span class="t">{s["name"]}</span></div>
    <h3 class="h-card">{s["title"]}</h3>
    <p>{s["summary"]}</p>
    <span class="chip" style="align-self:flex-start">{" · ".join(s["tagline"])}</span>
    <div class="card-links"><a class="link-arrow" href="{base}services/{s["slug"]}.html">Explore {s["short"]} <span aria-hidden="true">→</span></a>{f'<a class="link-arrow" href="{base}services/ai.html#demo">Try the live demo <span aria-hidden="true">→</span></a>' if s["slug"] == "ai" else ""}</div>
  </div>
  <div class="stack-art {s["tint"]}" aria-hidden="true">{service_art(s["art"])}</div>
</article>""")
    return "".join(out)


def strong_last(title):
    a, b = title.rsplit(" ", 1)
    return f'{a} <span class="strong">{b}</span>'


def bcard(p, base, cls="", delay=0):
    return (f'<a class="bcard rv d{delay} {cls}" href="{base}blog/{p["slug"]}.html">'
            f'<span class="bc-cover" aria-hidden="true">{cover(POST_COVER.get(p.get("cover", ""), ""), base)}</span>'
            f'<span class="bc-body"><span class="bc-meta"><span class="tag product">{esc(p["category"])}</span><span>{p["minutes"]} min read</span></span>'
            f'<span class="bc-title">{esc(p["title"])}</span><span class="bc-sum">{esc(p["summary"])}</span>'
            f'<span class="link-arrow">Read the post <span aria-hidden="true">→</span></span></span></a>')


def blog_section(base):
    cards = "".join(bcard(p, base, delay=i) for i, p in enumerate(POSTS[:3]))
    return f"""<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)" aria-labelledby="blog-h">
  <div class="section-head split rv"><div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start"><span class="label">From the blog</span><h2 class="h-section" id="blog-h">Notes from the studio.</h2></div><a class="link-arrow" href="{base}blog.html">All posts <span aria-hidden="true">→</span></a></div>
  <div class="blog-grid">{cards}</div>
</section>"""


LOGOS = json.load(open(os.path.join(os.path.dirname(__file__), "logos.json"), encoding="utf-8"))
SHORT = {"Amazon Web Services": "AWS", "GitHub Actions": "GitHub Actions"}


def logo_strip(label="The stack behind it"):
    items = "".join(f'<span class="lg" title="{esc(l["title"])}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="{l["path"]}"/></svg>'
                    f'<em>{esc(SHORT.get(l["title"], l["title"]))}</em></span>' for l in LOGOS)
    names = ", ".join(l["title"] for l in LOGOS)
    return (f'<section class="logos" aria-label="{label}"><div class="wrap"><span class="mono logos-h">{label}</span></div>'
            f'<div class="logos-track" aria-hidden="true"><div class="logos-row">{items}{items}</div></div>'
            f'<p class="sr-only">Technologies we use include {names}.</p></section>')


def browser(src, alt, url="localhost:2710/ui", cls=""):
    return (f'<figure class="bshot {cls}"><div class="bshot-bar"><i></i><i></i><i></i><span>{url}</span></div>'
            f'<img src="{src}" alt="{esc(alt)}" width="1600" height="1000" loading="lazy"></figure>')


def rune_spotlight(base):
    links = "".join(f'<a class="btn {"btn-light" if i else "btn-dark"} sm" href="{u}" target="_blank" rel="noopener">{esc(t)} <span class="arr" aria-hidden="true">↗</span></a>'
                    for i, (t, u) in enumerate(WK["rune"]["links"]))
    return f"""<section class="band-dark spot">
  <div class="wrap spot-grid">
    <div class="spot-copy rv">
      <span class="label">Our product · open source</span>
      <h2 class="h-section">Rune, running for real.</h2>
      <p class="lede">The dashboard of a local Rune vault with three namespaces and scoped tokens. Secrets stay encrypted, sealed by default and on machines you control.</p>
      <div class="hero-actions" style="justify-content:flex-start;flex-wrap:wrap">{links}</div>
    </div>
    <div class="spot-shot rv d1">{browser(base + "assets/shots/rune-dashboard.jpg", "Rune web UI dashboard showing secrets by namespace and token status")}</div>
  </div>
</section>"""


def rune_tour(base):
    shots = [("rune-dashboard", "Dashboard", "Secrets per namespace, active and revoked tokens, rotations."),
             ("rune-secrets", "Secrets", "Each namespace's secrets, with view, rotate, history and delete."),
             ("rune-tokens", "Tokens", "Scoped tokens: who can read or write which namespace.")]
    figs = "".join(f'<div class="tour-item rv d{i}">{browser(base + "assets/shots/" + f + ".jpg", "Rune web UI: " + t)}<h3>{t}</h3><p>{d}</p></div>' for i, (f, t, d) in enumerate(shots))
    return f"""<section class="wrap" style="padding-bottom:clamp(70px,9vw,110px)">
  {section_head("Product tour", "The web UI, running locally.", "Screens from a local Rune v1.0.0-RC vault with sample data.", "left")}
  <div class="tour">{figs}</div>
</section>"""


def page_home():
    base = ""
    eclipse_icons = "".join(f'<span class="glass-tile">{icon(n)}</span>' for n in ["spark", "cloud", "mobile", "backend"])
    marquee_set = ""
    for i, s in enumerate(SERVICES):
        cls = ' class="ghost"' if i % 2 else ""
        marquee_set += f'<span{cls}>{esc(s["short"])}</span><span class="star">✦</span>'
    client = [w for w in WORK if w["kind"] == "client"]
    html = head("Windsor Harlow — Independent engineering studio",
                "Windsor Harlow designs, builds and runs AI features, cloud platforms, mobile apps and backend systems, plus web, Shopify commerce and Salesforce. One senior team. Built in India, working globally.",
                "index.html", base)
    html += body_open(base, "index.html")
    html += f"""
<main id="main" tabindex="-1">
<section class="sky home-hero" aria-label="Introduction">
  {sky_art("h", "hero")}
  {topnav(base, "index.html")}
  <div class="hero-copy">
    <a class="label glass blur-in" href="blog/rune-is-open-source.html">✦ Rune, our secrets manager, is now open source</a>
    <h1 class="h-display words" aria-label="Build what’s next."><span class="w" style="--i:0" aria-hidden="true">Build</span> <span class="w" style="--i:1" aria-hidden="true">what’s</span> <span class="w strong" style="--i:2" aria-hidden="true">next.</span></h1>
    <p class="lede blur-in d2">An independent engineering studio for AI, cloud, mobile apps and backend systems — plus web, commerce and Salesforce. One senior team from idea to launch.</p>
    <div class="hero-actions blur-in d3">
      <a class="btn btn-dark" href="contact.html">Start a project <span class="arr" aria-hidden="true">↗</span></a>
      <a class="btn btn-light" href="#work">See our work</a>
    </div>
  </div>
  <div class="eclipse rise" aria-hidden="true">
    <span class="orbit"></span><span class="disc"></span>
    <div class="runner"><i></i></div><div class="runner2"><i></i></div>
    <div class="eclipse-inner"><span class="mono">AI · CLOUD · MOBILE · BACKEND</span><div class="eclipse-icons">{eclipse_icons}</div></div>
  </div>
</section>

<section class="marquee" aria-label="What we build"><div class="marquee-track" aria-hidden="true">{marquee_set}{marquee_set}</div><p class="sr-only">{", ".join(s["name"] for s in SERVICES)}.</p></section>

<section class="wrap" id="services" style="padding-bottom:clamp(60px,8vw,110px)">
  {section_head("Our Services", "One team. Every layer.", "Scroll through what we build — each discipline stacks onto the last, just like your product.")}
  <div class="stack">{stack_cards(base)}</div>
</section>

{logo_strip()}

<section class="band-dark" id="process"><div class="wrap">
  {section_head("How We Work", "From idea to launch.")}
  {process_block()}
  <div class="center rv" style="margin-top:40px"><a class="btn btn-light sm" href="about.html#approach">How we work <span class="arr" aria-hidden="true">↗</span></a></div>
</div></section>

<section class="wrap" id="work" style="padding-bottom:clamp(70px,9vw,120px)">
  {section_head("Selected Work", "Built for real teams.")}
  <div class="work-grid">
    {wcard(client[0], base, delay=0)}
    {wcard(client[1], base, delay=1)}
    {rune_feature(base)}
  </div>
  <div class="section-head split rv" style="margin:70px 0 24px">
    <div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start"><span class="label">Engineering lab</span><h3 class="h-card" style="max-width:640px">Reference builds we use to test patterns before we recommend them.</h3></div>
    <a class="link-arrow" href="work.html">All work <span aria-hidden="true">→</span></a>
  </div>
  {lab_cards(base)}
</section>

{blog_section(base)}

<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)">{orbit_panel(base)}</section>

<section class="wrap" style="padding-bottom:20px" aria-labelledby="faq-h">
  <div class="section-head rv"><span class="label">FAQ</span><h2 class="h-section" id="faq-h">Questions we hear first.</h2></div>
  {faq(HOME_FAQ)}
</section>
</main>
</div>
"""
    html += footer(base)
    write("index.html", html)


def page_services():
    base = ""
    rows = []
    for i, s in enumerate(SERVICES):
        ticks = "".join(f"<li>{g}</li>" for g in s["get"][:4])
        rows.append(f"""<article class="svc-row rv" id="{s["slug"]}">
  <div class="stack-art {s["tint"]}" aria-hidden="true">{service_art(s["art"])}</div>
  <div class="svc-copy">
    {orb(s["icon"])}
    <span class="eyebrow">{s["num"]} / {s["short"].upper()}</span>
    <h2 class="h-card">{s["name"]}</h2>
    <p>{s["summary"]}</p>
    <ul class="ticks">{ticks}</ul>
    {chips(s["tagline"])}
    <a class="btn btn-dark sm" style="align-self:flex-start;margin-top:6px" href="services/{s["slug"]}.html">Explore {s["short"]} <span class="arr" aria-hidden="true">↗</span></a>
  </div>
</article>""")
    models = "".join(f'<div class="model rv d{i}"><span class="mono">{n}</span><h3>{t}</h3><p>{d}</p></div>' for i, (n, t, d) in enumerate(MODELS))
    groups = []
    for s in SERVICES:
        items = [x for _, g in s["stack"] for x in g]
        groups.append(f'<div class="tech-group rv"><h3>{s["short"]}</h3>{chips(items)}</div>')
    faqs = [s["faq"][0] for s in SERVICES]
    html = head("Services — Windsor Harlow",
                "AI & machine learning, cloud & DevOps, mobile apps, backend systems, web products, Shopify commerce and Salesforce — designed, built and run by one senior engineering team.",
                "services.html", base)
    html += body_open(base, "services.html")
    html += '<main id="main" tabindex="-1">' + page_hero(base, "services.html", "ph", [("Services", None)],
                                                       'What we <span class="strong">build.</span>',
                                                       "Seven disciplines under one roof. AI, cloud, mobile and backend lead; web, commerce and Salesforce build on them, so every layer is designed together.")
    html += f"""
<section class="wrap section">{"".join(rows)}</section>
{logo_strip("Tools we use every day")}
<section class="band-dark" id="engage"><div class="wrap">
  {section_head("How We Engage", "Four ways to work together.", "Start small with a review, or bring us in for the whole product.")}
  <div class="models">{models}</div>
</div></section>
<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)">
  {section_head("Technology", "Tools we trust.", "Chosen for the job, not the trend. If your team already has a stack, we work in it.")}
  <div class="tech-groups">{"".join(groups)}</div>
</section>
<section class="wrap" style="padding-bottom:clamp(70px,9vw,110px)">
  {section_head("How We Work", "From idea to launch.")}
  {process_block(detail=True)}
</section>
<section class="wrap" style="padding-bottom:20px">
  <div class="section-head rv"><span class="label">FAQ</span><h2 class="h-section">Good questions.</h2></div>
  {faq(faqs)}
</section>
</main></div>
"""
    html += footer(base)
    write("services.html", html)


def ai_sections(base):
    """AI & ML page: live retrieval demo + the four-week pilot."""
    chips_q = ["How long do refunds take?", "When does an order count as delayed?", "My parcel arrived broken, what do I do?",
               "Who approves big claims?", "Do you deliver to Singapore?"]
    qbtns = "".join(f'<button type="button" data-q="{esc(q)}">{esc(q)}</button>' for q in chips_q)
    docs = [("delivery-policy.pdf", "Delivery promise"), ("returns-policy.pdf", "Returns and refunds"), ("claims-guide.pdf", "Damaged parcels"),
            ("customer-help.md", "Changing a delivery"), ("support-hours.md", "Support hours"), ("privacy-notes.md", "Data retention")]
    doclist = "".join(f'<span class="ddoc"><b>{t}</b><em>{f}</em></span>' for f, t in docs)
    weeks = [("Week 1", "Pick and prepare", "Agree on one task, gather the documents and write 30 to 50 real test questions with good answers."),
             ("Week 2", "Build a working prototype", "Retrieval over your documents and answers with sources, running in your own cloud account."),
             ("Week 3", "Measure and harden", "Run the test set, fix the failures, and add guardrails for refusals, privacy and cost."),
             ("Week 4", "Real users, real decision", "Put it in front of a small group, review the results, then scale it, change it or stop.")]
    wk = "".join(f'<article class="week rv d{i}"><span class="mono">{w}</span><h3>{t}</h3><p>{d}</p></article>' for i, (w, t, d) in enumerate(weeks))
    keep = ["The prototype code, in your repository", "A test set you own and can rerun", "Measured accuracy and cost per answer", "A plan for production, or a clear reason to stop"]
    return f"""
<section class="wrap" id="demo" style="padding-bottom:clamp(70px,9vw,120px)">
  <div class="demo">
    <div class="demo-head">
      <span class="label glass">Live demo · runs in your browser</span>
      <h2 class="h-section">Ask the sample handbook.</h2>
      <p class="lede">This is the first half of a grounded AI assistant: finding the right passages in your own documents. Ask about a fictional parcel company and watch it search, rank, and decide whether it can answer at all.</p>
    </div>
    <div class="demo-grid">
      <div class="demo-ask">
        <form id="aiForm" class="demo-form" autocomplete="off">
          <label for="aiQ" class="sr-only">Your question</label>
          <input id="aiQ" name="q" type="text" value="How long do refunds take?" maxlength="140">
          <button class="btn btn-light sm" type="submit">Ask</button>
        </form>
        <div class="demo-chips" aria-label="Example questions">{qbtns}</div>
        <ol class="demo-steps" id="aiSteps">
          <li><b>Search</b><span>14 passages in 6 documents</span></li>
          <li><b>Rank</b><span>Score every passage for relevance</span></li>
          <li><b>Check</b><span>Do the best passages cover the question?</span></li>
          <li><b>Answer</b><span>Quote the source, or decline</span></li>
        </ol>
        <details class="demo-docs"><summary>The sample documents</summary><div>{doclist}</div></details>
      </div>
      <div class="demo-out" id="aiOut" aria-live="polite">
        <div class="demo-answer"><span class="mono">Answer · grounded in 1 source</span><p>Refunds are issued to the original payment method within 5 working days of the returned item reaching our warehouse. <b class="cite">[1]</b></p></div>
      </div>
    </div>
    <p class="demo-note">The documents describe a fictional company, and nothing you type leaves your browser. In a real project a language model writes the final answer from these passages, in your tone, and cites them the same way.</p>
  </div>
</section>
<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)">
  {section_head("The AI pilot", "Four weeks to a clear yes or no.", "Every AI project starts the same way: one task, your documents, a test set you own, and a decision at the end.", "left")}
  <div class="weeks">{wk}</div>
  <div class="pilot-keep rv">
    <div><span class="label" style="align-self:flex-start">What you keep</span><h3 class="h-card">Proof, not a demo.</h3></div>
    <ul class="ticks">{"".join(f"<li>{k}</li>" for k in keep)}</ul>
    <div class="hero-actions" style="justify-content:flex-start;flex-wrap:wrap"><a class="btn btn-dark" href="{base}contact.html">Plan an AI pilot <span class="arr" aria-hidden="true">↗</span></a><a class="link-arrow" href="{base}blog/your-first-ai-feature.html">Read: your first AI feature <span aria-hidden="true">→</span></a></div>
  </div>
</section>"""


def page_service(s):
    base = "../"
    path = f"services/{s['slug']}.html"
    builds = "".join(f'<article class="pcard rv d{i}">{orb(s["icon"], True)}<h3>{t}</h3><p>{d}</p></article>' for i, (t, d) in enumerate(s["build"]))
    gets = "".join(f"<li>{g}</li>" for g in s["get"])
    groups = "".join(f'<div class="tech-group rv"><h3>{g}</h3>{chips(items)}</div>' for g, items in s["stack"])
    related = "".join(wcard(WK[slug], base, delay=i) for i, slug in enumerate(s["work"]))
    related_block = (f'<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)">{section_head("Related Work", "Built with this.")}'
                     f'<div class="work-grid three">{related}</div></section>') if related else ""
    others = "".join(f'<a class="lab rv" href="{o["slug"]}.html">{orb(o["icon"], True)}<h3>{o["name"]}</h3><p>{o["summary"]}</p></a>' for o in SERVICES if o["slug"] != s["slug"])
    stack_facts = "".join('<span class="fact"><b>Stack</b>%s</span>' % t for t in s["tagline"][:4])
    extra = f'<div class="facts blur-in d3">{stack_facts}</div><div class="hero-actions blur-in d3" style="justify-content:flex-start"><a class="btn btn-dark" href="../contact.html">Discuss your project <span class="arr" aria-hidden="true">↗</span></a></div>'
    html = head(f"{s['name']} — Windsor Harlow", s["summary"], path, base)
    html += body_open(base, "services.html")
    html += '<main id="main" tabindex="-1">' + page_hero(base, "services.html", "ps", [("Services", "services.html"), (s["short"], None)],
                                                       strong_last(s["title"]), s["intro"], extra, left=True)
    html += f"""
<section class="wrap section">
  {section_head("What we build", s["name"] + ".", s["summary"], "left")}
  <div class="bento">{builds}</div>
</section>
{ai_sections(base) if s["slug"] == "ai" else ""}
<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)">
  <div class="svc-row rv" style="margin:0">
    <div class="stack-art {s["tint"]}" aria-hidden="true">{service_art(s["art"])}</div>
    <div class="svc-copy"><span class="label" style="align-self:flex-start">What you get</span><h2 class="h-card">Everything you need to launch — and keep going.</h2><ul class="ticks">{gets}</ul></div>
  </div>
</section>
<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)">
  {section_head("Technology", "The stack.", "We work in your existing tools where it makes sense.")}
  <div class="tech-groups">{groups}</div>
</section>
<section class="band-dark"><div class="wrap">
  {section_head("How We Work", "From idea to launch.")}
  {process_block(detail=True)}
</div></section>
{related_block}
<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)">
  <div class="section-head rv"><span class="label">FAQ</span><h2 class="h-section">Questions about {s["short"]}.</h2></div>
  {faq(s["faq"])}
</section>
<section class="wrap" style="padding-bottom:20px">
  <div class="section-head split rv"><h2 class="h-card">Other services</h2><a class="link-arrow" href="../services.html">All services <span aria-hidden="true">→</span></a></div>
  <div class="lab-grid">{others}</div>
</section>
</main></div>
"""
    if s["slug"] == "ai":
        html += '<script src="../assets/js/ai-demo.js" defer></script>\n'
    html += footer(base)
    write(path, html)


def page_work():
    base = ""
    cards = "".join(wcard(w, base, delay=i % 3) for i, w in enumerate(WORK))
    html = head("Work — Windsor Harlow",
                "Client engagements, our own product Rune, and engineering lab reference builds across mobile, web, backend and cloud.",
                "work.html", base)
    html += body_open(base, "work.html")
    html += '<main id="main" tabindex="-1">' + page_hero(base, "work.html", "pw", [("Work", None)],
                                                       'Work that <span class="strong">ships.</span>',
                                                       "Tools built for clients, a product of our own, and an engineering lab where we test patterns before we recommend them.")
    html += f"""
<section class="wrap section">
  <div class="filters rv" data-filters role="group" aria-label="Filter projects">
    <button type="button" data-filter="all" aria-pressed="true">All</button>
    <button type="button" data-filter="client" aria-pressed="false">Client work</button>
    <button type="button" data-filter="product" aria-pressed="false">Our product</button>
    <button type="button" data-filter="lab" aria-pressed="false">Engineering lab</button>
  </div>
  <p class="sr-only" id="filterStatus" aria-live="polite">{len(WORK)} projects shown</p>
  <div class="work-grid three">{cards}<a class="fcta rv" href="contact.html"><span class="label glass">Your project next</span><span class="h">Have something similar in mind?</span><span class="btn btn-light sm">Start a project <span class="arr" aria-hidden="true">↗</span></span></a></div>
  <div class="note rv" style="margin-top:30px;max-width:760px">Client projects are shown without naming the client. Engineering lab projects are independent reference builds, not client work.</div>
</section>
{rune_spotlight(base)}
</main></div>
"""
    html += footer(base)
    write("work.html", html)


def page_case(w, nxt):
    base = "../"
    path = f"work/{w['slug']}.html"
    facts = "".join(f'<span class="fact"><b>{k}</b>{v}</span>' for k, v in w["facts"])
    extra = f'<div class="facts blur-in d3"><span class="tag {w["kind"]}" style="align-self:center">{w["kind_label"]}</span>{facts}</div>'
    if w.get("links"):
        btns = "".join(
            (f'<a class="btn btn-dark" href="{u}" target="_blank" rel="noopener">{esc(t)} <span class="arr" aria-hidden="true">↗</span></a>' if i == 0 else
             f'<a class="btn btn-light" href="{u}" target="_blank" rel="noopener">{esc(t)} ↗</a>') for i, (t, u) in enumerate(w["links"]))
        extra += f'<div class="hero-actions blur-in d3" style="justify-content:flex-start;flex-wrap:wrap">{btns}</div>'
    decisions = "".join(f'<div class="decision rv d{i}"><span class="n">0{i+1}</span><div><h3>{t}</h3><p>{d}</p></div></div>' for i, (t, d) in enumerate(w["decisions"]))
    caps = "".join(f'<div class="cap rv d{i % 4}"><h4>{t}</h4><p>{d}</p></div>' for i, (t, d) in enumerate(w["caps"]))
    rows = "".join(f'<div class="row"><span class="k">{k}</span>{chips(v)}</div>' for k, v in w["stack"])
    svc_links = " · ".join(f'<a class="link-arrow" href="../services/{x}.html">{SVC[x]["short"]} <span aria-hidden="true">→</span></a>' for x in w["services"])
    all_tags = [t for _, g in w["stack"] for t in g][:6]
    html = head(f"{w['title']} — Windsor Harlow", w["summary"], path, base)
    html += body_open(base, "work.html")
    html += '<main id="main" tabindex="-1">' + page_hero(base, "work.html", "pc", [("Work", "work.html"), (w["title"], None)],
                                                       w["title"], w["summary"],
                                                       extra, left=True)
    html += f"""
<section class="wrap section">
  <div class="cs-grid">
    <div class="cs-aside rv">
      <span class="label" style="align-self:flex-start">Overview · {w["category"]}</span>
      <h2 class="h-card">{w["tagline"]}</h2>
      <p>{w["overview"]}</p>
      {chips(all_tags)}
      <div style="display:flex;flex-wrap:wrap;gap:16px">{svc_links}</div>
    </div>
    <figure class="diagram rv d1" style="margin:0">
      <a href="../assets/diagrams/{w["slug"]}-architecture.svg" target="_blank" rel="noopener"><img src="../assets/diagrams/{w["slug"]}-architecture.svg" alt="{esc(w['title'])} reference architecture diagram" width="1200" height="800" loading="lazy"></a>
      <figcaption><span>Reference architecture</span><span>Open full size ↗</span></figcaption>
    </figure>
  </div>
</section>
{rune_tour(base) if w["slug"] == "rune" else ""}
<section class="band-dark"><div class="wrap">
  {section_head("The Engineering", "Decisions that shape the system.", "", "left")}
  <div class="decisions">{decisions}</div>
</div></section>
<section class="wrap" style="padding-bottom:clamp(70px,9vw,110px)">
  {section_head("Capabilities", "What it does.", "", "left")}
  <div class="caps">{caps}</div>
</section>
<section class="wrap" style="padding-bottom:clamp(50px,7vw,80px)">
  {section_head("Stack", "Built with.", "", "left")}
  <div class="stack-table rv">{rows}</div>
  <p class="note rv" style="margin-top:18px">{w["note"]}</p>
</section>
<section class="wrap" style="padding-bottom:20px">
  <a class="next-card rv" href="{nxt["slug"]}.html"><span><span class="label" style="margin-bottom:12px">Next project</span><br><span class="t">{nxt["title"]}</span></span><span class="go" aria-hidden="true">→</span></a>
</section>
</main></div>
"""
    html += footer(base)
    write(path, html)


def page_blog():
    base = ""
    first, rest = POSTS[0], POSTS[1:]
    cards = bcard(first, base, "lead") + "".join(bcard(p, base, delay=i + 1) for i, p in enumerate(rest))
    cats = sorted({p["category"] for p in POSTS})
    html = head("Blog — Windsor Harlow",
                "Practical writing on AI, cloud, mobile and backend engineering from the Windsor Harlow studio, plus news about Rune.",
                "blog.html", base)
    html += body_open(base, "blog.html")
    html += '<main id="main" tabindex="-1">' + page_hero(base, "blog.html", "pb", [("Blog", None)],
                                                       'Notes from the <span class="strong">studio.</span>',
                                                       "Practical writing on the things we build: AI features, cloud platforms, mobile apps and backend systems. Plus news about Rune.",
                                                       '<div class="facts blur-in d3">' + "".join(f'<span class="fact"><b>Topic</b>{esc(c)}</span>' for c in cats) + '</div>')
    html += f"""
<section class="wrap section"><div class="blog-grid index">{cards}</div></section>
</main></div>
"""
    html += footer(base)
    write("blog.html", html)


def page_post(p):
    base = "../"
    path = f"blog/{p['slug']}.html"
    toc = "".join(f'<a href="#{i}">{esc(t)}</a>' for i, t in p["toc"])
    svc = SVC.get(p.get("service", ""))
    more = "".join(bcard(o, base, delay=i) for i, o in enumerate([o for o in POSTS if o["slug"] != p["slug"]][:2]))
    ld = ('<script type="application/ld+json">{"@context":"https://schema.org","@type":"BlogPosting",'
          f'"headline":{json.dumps(p["title"])},"description":{json.dumps(p["summary"])},"datePublished":"{p["date"]}",'
          f'"author":{{"@type":"Organization","name":"Windsor Harlow"}},"publisher":{{"@type":"Organization","name":"Windsor Harlow"}},'
          f'"mainEntityOfPage":"{SITE}/{path}"}}</script>\n')
    meta = (f'<div class="post-meta blur-in d3"><span class="tag product">{esc(p["category"])}</span>'
            f'<span>{nice_date(p["date"])}</span><span aria-hidden="true">·</span><span>{p["minutes"]} min read</span><span aria-hidden="true">·</span><span>Windsor Harlow</span></div>')
    svc_card = ""
    if svc:
        svc_card = (f'<aside class="post-cta"><div class="svc-name">{orb(svc["icon"])}<span class="t">{esc(svc["name"])}</span></div>'
                    f'<p>{esc(svc["summary"])}</p><div class="hero-actions" style="justify-content:flex-start">'
                    f'<a class="btn btn-dark sm" href="../contact.html">Talk to us <span class="arr" aria-hidden="true">↗</span></a>'
                    f'<a class="link-arrow" href="../services/{svc["slug"]}.html">About this service <span aria-hidden="true">→</span></a></div></aside>')
    html = head(f"{p['title']} — Windsor Harlow", p["summary"], path, base, ld, og_type="article")
    html += body_open(base, "blog.html")
    html += '<div class="read-progress" aria-hidden="true"><i></i></div>'
    html += '<main id="main" tabindex="-1">' + page_hero(base, "blog.html", "pp", [("Blog", "blog.html"), (p["category"], None)],
                                                       esc(p["title"]), esc(p["summary"]), meta, left=True).replace('class="sky page-hero left"', 'class="sky page-hero left post-hero"')
    html += f"""
<section class="wrap section">
  <div class="post-grid">
    <aside class="post-toc" aria-label="On this page"><span class="mono">On this page</span><nav>{toc}</nav></aside>
    <article class="post-body" id="post">{p["html"]}
      {svc_card}
    </article>
  </div>
</section>
<section class="wrap" style="padding-bottom:20px">
  <div class="section-head split rv"><h2 class="h-card">More from the blog</h2><a class="link-arrow" href="../blog.html">All posts <span aria-hidden="true">→</span></a></div>
  <div class="blog-grid two">{more}</div>
</section>
</main></div>
"""
    html += footer(base)
    write(path, html)


def page_about():
    base = ""
    principles = "".join(f'<article class="pcard rv d{i % 3}">{orb(ic, True)}<h3>{t}</h3><p>{d}</p></article>' for i, (ic, t, d) in enumerate(PRINCIPLES))
    models = "".join(f'<div class="model rv d{i}"><span class="mono">{n}</span><h3>{t}</h3><p>{d}</p></div>' for i, (n, t, d) in enumerate(MODELS))
    html = head("About — Windsor Harlow",
                "Windsor Harlow is an independent engineering studio built in India, working globally. One senior team across mobile, web, backend and cloud.",
                "about.html", base)
    html += body_open(base, "about.html")
    html += '<main id="main" tabindex="-1">' + page_hero(base, "about.html", "pa", [("About", None)],
                                                       'Independent thinking. <span class="strong">Connected engineering.</span>',
                                                       "We bring software, data and infrastructure together to turn business priorities into working systems.")
    html += f"""
<section class="wrap section">
  <div class="cs-grid">
    <div class="cs-aside rv"><span class="label" style="align-self:flex-start">The studio</span><h2 class="h-section">Technology should move the business forward.</h2></div>
    <div class="rv d1" style="display:flex;flex-direction:column;gap:18px">
      <p class="lede" style="max-width:none">Windsor Harlow is an independent engineering studio. We design, build and run AI features, cloud platforms, mobile apps and backend systems, and the web products, online stores and Salesforce setups that sit on top of them.</p>
      <p class="lede" style="max-width:none">Most software problems live in the gaps between teams — design hands off to development, development hands off to operations, and nobody owns the whole. We work across every layer, so product decisions and technical decisions stay in the same conversation.</p>
      <p class="lede" style="max-width:none">We are a small, senior team. The people who scope your project are the people who build it, and everything we make is documented so your team can own it.</p>
    </div>
  </div>
</section>
<section class="band-dark"><div class="wrap">
  {section_head("Principles", "How we like to work.")}
  <div class="bento">{principles}</div>
</div></section>
<section class="wrap" style="padding-bottom:clamp(70px,9vw,110px)" id="approach">
  {section_head("Approach", "A clear path from the first question to a system you own.")}
  {process_block(detail=True)}
</section>
<section class="wrap" style="padding-bottom:clamp(70px,9vw,120px)">
  {section_head("How We Engage", "Four ways to work together.")}
  <div class="models">{models}</div>
</section>
<section class="wrap" style="padding-bottom:20px">{orbit_panel(base)}</section>
</main></div>
"""
    html += footer(base)
    write("about.html", html)


def page_contact():
    base = ""
    services = [s["short"] for s in SERVICES] + ["Not sure yet"]
    choice = "".join(f'<label><input type="checkbox" name="service" value="{esc(x)}"><span>{x}</span></label>' for x in services)
    html = head("Contact — Windsor Harlow",
                "Tell us what you’d like to build or improve. An idea, an existing system or a question is enough to start.",
                "contact.html", base)
    html += body_open(base, "contact.html")
    html += '<main id="main" tabindex="-1">' + page_hero(base, "contact.html", "pk", [("Contact", None)],
                                                       'Let’s talk about what you’re <span class="strong">building.</span>',
                                                       "An idea, an existing system or a question is enough to start. A senior engineer will reply.")
    html += f"""
<section class="wrap section">
  <div class="contact-grid">
    <div class="card form-card rv">
      <form id="enquiry" data-mail="{MAIL}" novalidate>
        <div class="form-stack">
          <h2 class="h-card">Start a conversation</h2>
          <div class="form-row">
            <div class="field"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required></div>
            <div class="field"><label for="f-email">Work email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
          </div>
          <div class="field"><label for="f-company">Company <span class="hint">(optional)</span></label><input id="f-company" name="company" autocomplete="organization"></div>
          <fieldset class="field" style="border:0;padding:0;margin:0"><legend style="font-size:14px;font-weight:600;color:var(--ink-2);margin-bottom:8px">What do you need help with?</legend><div class="choice">{choice}</div></fieldset>
          <div class="field"><label for="f-timeline">Timeline</label><select id="f-timeline" name="timeline"><option>Not decided</option><option>As soon as possible</option><option>In the next 1–3 months</option><option>Later this year</option></select></div>
          <div class="field"><label for="f-detail">Tell us a little more</label><textarea id="f-detail" name="detail" required placeholder="What are you trying to make possible? What already exists?"></textarea></div>
          <div class="hp" aria-hidden="true"><label for="f-website">Website</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
          <p class="form-error" id="formError" role="alert"></p>
          <div><button class="btn btn-dark" type="submit" style="border:0;cursor:pointer">Prepare my email <span class="arr" aria-hidden="true">↗</span></button></div>
          <p style="font-size:13px;color:var(--muted)">This form doesn’t send anything by itself — it prepares an email in your mail app to <a href="mailto:{MAIL}" style="color:var(--cobalt)">{MAIL}</a>. See our <a href="privacy.html" style="color:var(--cobalt)">privacy note</a>.</p>
        </div>
      </form>
      <div class="handoff" id="handoff" aria-live="polite">
        <h3 style="font-size:20px;font-weight:600">Your email is ready</h3>
        <p style="color:var(--body);margin-top:6px">If your mail app didn’t open, use the button below or copy the message and send it to {MAIL}.</p>
        <pre id="handoffText"></pre>
        <div class="actions"><a class="btn btn-dark sm" id="handoffMail" href="mailto:{MAIL}">Open in mail app <span class="arr" aria-hidden="true">↗</span></a><button class="btn btn-line" type="button" id="handoffCopy" style="cursor:pointer">Copy message</button></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px">
      <div class="card side-card rv d1">{orb("chat", True)}<h3>Email us directly</h3><a class="link-arrow" href="mailto:{MAIL}">{MAIL} <span aria-hidden="true">→</span></a><p style="color:var(--muted);font-size:15px">Based in India. Working with teams around the world.</p></div>
      <div class="card side-card rv d2"><h3>What happens next</h3><ul class="side-list">
        <li>{orb("doc", True)}<span><b>We read it properly</b>A senior engineer reviews your message — not a sales team.</span></li>
        <li>{orb("calendar", True)}<span><b>A short call</b>We talk through the goal, what exists and what a sensible first step looks like.</span></li>
        <li>{orb("layers", True)}<span><b>A clear proposal</b>Scope, approach and timeline — or an honest note if we’re not the right fit.</span></li>
      </ul></div>
    </div>
  </div>
</section>
<section class="band-dark"><div class="wrap">
  <div class="section-head rv"><span class="label">FAQ</span><h2 class="h-section">Before you write.</h2></div>
  {faq(CONTACT_FAQ)}
</div></section>
</main></div>
"""
    html += footer(base, heading="Prefer email? Write to us at business@windsorharlow.com — a senior engineer will reply.")
    write("contact.html", html)


def page_privacy():
    base = ""
    html = head("Privacy — Windsor Harlow", "How this website handles enquiries, browser storage, fonts and hosting.", "privacy.html", base)
    html += body_open(base, "privacy.html")
    html += '<main id="main" tabindex="-1">' + page_hero(base, "privacy.html", "pp", [("Privacy", None)],
                                                       'Privacy &amp; your <span class="strong">enquiry.</span>',
                                                       "What happens when you browse this website or choose to contact Windsor Harlow. Updated 30 October 2026.")
    html += f"""
<section class="wrap section">
  <div class="card prose rv">
    <h2>Contacting us</h2>
    <p>The enquiry form prepares a message in your browser. It does not send anything from the website. You can open the message in your email application, or copy it and send it yourself.</p>
    <p>When you send the email, Windsor Harlow receives the information you chose to include: your contact details, the subject of your enquiry and anything else you add. We use it to reply and discuss potential work. Your email provider and ours handle delivery of the message.</p>
    <h2>Browser storage</h2>
    <p>The home page plays a short opening animation once per visit. To avoid replaying it, the site stores a single value (<code>wh_overture</code>) in your browser’s session storage, or a session cookie if storage is unavailable. It contains no personal information and is cleared when you close the browser.</p>
    <h2>Fonts and hosting</h2>
    <p>Fonts are loaded from Google Fonts, which means your browser requests them from Google’s servers. The site is hosted on GitHub Pages, which may keep standard technical logs such as IP addresses for security and operation.</p>
    <h2>Analytics</h2>
    <p>This website does not use analytics or advertising trackers.</p>
    <h2>Questions</h2>
    <p>Write to <a href="mailto:{MAIL}">{MAIL}</a> about anything on this page or any information you have sent us.</p>
  </div>
</section>
</main></div>
"""
    html += footer(base)
    write("privacy.html", html)


def page_404():
    base = "/"
    html = head("Page not found — Windsor Harlow", "That page does not exist. Here is where to go instead.", "404.html", base,
                '<meta name="robots" content="noindex">\n')
    html += body_open(base, "")
    extra = '<div class="hero-actions blur-in d3" style="justify-content:flex-start"><a class="btn btn-dark" href="/index.html">Back to home <span class="arr" aria-hidden="true">↗</span></a><a class="btn btn-light" href="/services.html">Explore services</a></div>'
    html += '<main id="main" tabindex="-1">' + page_hero(base, "", "p4", None, 'Lost in the <span class="strong">sky.</span>',
                                                       "That page doesn’t exist — the link may be wrong or the page has moved. Nothing has broken on your side.", extra, left=True)
    html += "</main></div>\n" + footer(base)
    write("404.html", html)


def redirect(path, target, base):
    url = SITE + "/" + target
    html = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved — Windsor Harlow</title>
<meta name="robots" content="noindex"><link rel="canonical" href="{url}">
<meta http-equiv="refresh" content="0; url={base}{target}"></head>
<body style="font-family:system-ui,sans-serif;background:#EEF4FA;color:#101828;padding:40px">
<p>This page has moved to <a href="{base}{target}">{target}</a>.</p></body></html>
"""
    write(path, html)


def sitemap():
    today = datetime.date.today().isoformat()
    pages = ["index.html", "services.html"] + [f"services/{s['slug']}.html" for s in SERVICES] + ["work.html"] + \
            [f"work/{w['slug']}.html" for w in WORK] + ["about.html", "blog.html"] + [f"blog/{p['slug']}.html" for p in POSTS] + ["contact.html", "privacy.html"]
    urls = "".join(f"  <url><loc>{SITE}/{'' if p == 'index.html' else p}</loc><lastmod>{today}</lastmod></url>\n" for p in pages)
    write("sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    write("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")


def main():
    print("Building Windsor Harlow…")
    page_home()
    page_services()
    for s in SERVICES:
        page_service(s)
    page_work()
    for i, w in enumerate(WORK):
        page_case(w, WORK[(i + 1) % len(WORK)])
    page_about()
    page_contact()
    page_privacy()
    page_404()
    page_blog()
    for p in POSTS:
        page_post(p)
    # legacy URLs from the previous site
    redirect("studio.html", "about.html", "")
    for old, new in [("ai-data", "services/ai.html"), ("cloud-platform", "services/cloud.html"), ("digital-experience", "services/web.html"),
                     ("enterprise-systems", "services/backend.html"), ("product-engineering", "services/mobile.html")]:
        redirect(f"capabilities/{old}.html", new, "../")
    for old, new in [("web", "services/web.html"), ("ai-ml", "services/ai.html"), ("cloud", "services/cloud.html"), ("commerce", "services/commerce.html"),
                     ("salesforce", "services/salesforce.html"), ("mobile", "services/mobile.html")]:
        redirect(f"practices/{old}.html", new, "../")
    sitemap()
    print(f"Done — {len(WRITTEN)} files.")


if __name__ == "__main__":
    main()
