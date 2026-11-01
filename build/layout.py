# -*- coding: utf-8 -*-
"""Shared page chrome: <head>, sky artwork, navigation, footer, overture."""
import os

HERE = os.path.dirname(__file__)
SITE = "https://windsorharlow.com"
MAIL = "business@windsorharlow.com"

NAV = [("Services", "services.html"), ("Work", "work.html"), ("About", "about.html"), ("Blog", "blog.html"), ("Contact", "contact.html")]

ICONS = {
    "mobile": "M7 2.5h10v19H7zM11 18.5h2",
    "web": "M3 4h18v14H3zM3 8h18M8 21h8",
    "backend": "M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01",
    "cloud": "M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6 9.5 4.25 4.25 0 0 0 7 18z",
    "search": "M11 17a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM20 20l-4.5-4.5",
    "code": "M8 7l-5 5 5 5M16 7l5 5-5 5",
    "pulse": "M3 12h4l3-7 4 14 3-7h4",
    "layers": "M12 3 4 7l8 4 8-4-8-4zM4 12l8 4 8-4M4 17l8 4 8-4",
    "user": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
    "lock": "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
    "globe": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
    "doc": "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
    "calendar": "M4 5h16v15H4zM4 10h16M9 3v4M15 3v4",
    "team": "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.5-5 5-5s5 2 5 5M11 20c0-3 2.5-5 5-5s5 2 5 5",
    "shield": "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
    "chat": "M4 5h16v11H9l-5 4z",
    "arrow": "M5 12h14M13 6l6 6-6 6",
    "cart": "M3 4h2.2l2.3 11h10.3L20 8H6.4M9.5 20h.01M17 20h.01",
    "funnel": "M4 5h16l-6 7.5V18l-4 2v-7.5z",
    "spark": "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM18.5 15.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z",
}


def icon(name, cls=""):
    return ('<svg viewBox="0 0 24 24" aria-hidden="true"%s fill="none" stroke-linecap="round" '
            'stroke-linejoin="round"><path d="%s"/></svg>') % ((' class="%s"' % cls) if cls else "", ICONS[name])


def orb(name, small=False):
    return '<span class="orb%s" aria-hidden="true">%s</span>' % (" sm" if small else "", icon(name))


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def head(title, desc, path, base, extra="", og_type="website"):
    canonical = SITE + "/" + ("" if path == "index.html" else path)
    og_name = "og" if path == "index.html" else path[:-5].replace("/", "-")
    og_img = f"assets/og/{og_name}.jpg" if os.path.exists(os.path.join(HERE, "..", "assets", "og", og_name + ".jpg")) else "assets/og/og.jpg"
    t = esc(title)
    d = esc(desc)
    return f"""<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{canonical}">
<meta name="theme-color" content="#2463E8">
<meta property="og:site_name" content="Windsor Harlow">
<meta property="og:type" content="{og_type}">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/{og_img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{d}">
<meta name="twitter:image" content="{SITE}/{og_img}">
<link rel="icon" href="{base}assets/brand/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap">
<link rel="stylesheet" href="{base}assets/css/site.css">
<script>document.documentElement.className=document.documentElement.className.replace("no-js","js");</script>
{extra}</head>
"""


def sky_art(uid, kind="hero"):
    """Silky sky artwork. kind: hero | page | foot."""
    if kind == "foot":
        return f"""<svg class="sky-art" aria-hidden="true" viewBox="0 0 1412 760" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="{uid}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0E2F9A"/><stop offset=".6" stop-color="#2463E8"/><stop offset="1" stop-color="#9CC4F5"/></linearGradient><linearGradient id="{uid}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE3FB"/><stop offset="1" stop-color="#5E93DC"/></linearGradient></defs><rect width="1412" height="760" fill="url(#{uid}b)"/><g class="sky-drift"><path d="M 1500 0 C 1260 140, 1120 320, 980 520 C 900 640, 820 720, 760 800 L 1500 800 Z" fill="url(#{uid}w)" opacity=".55"/></g><path class="sky-shine" d="M 1500 -20 C 1250 130, 1110 310, 970 510 C 890 630, 810 710, 750 800" fill="none" stroke="#fff" stroke-width="2.5" opacity=".8"/></svg>"""
    h = 960 if kind == "hero" else 640
    shade = 620 if kind == "hero" else 640
    return f"""<svg class="sky-art" aria-hidden="true" viewBox="0 0 1412 {h}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="{uid}bg" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#2F62B8"/><stop offset=".45" stop-color="#5E93DC"/><stop offset=".78" stop-color="#B9D3F0"/><stop offset="1" stop-color="#F1E6C4"/></linearGradient><linearGradient id="{uid}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEBFF"/><stop offset=".35" stop-color="#7FB2F4"/><stop offset=".7" stop-color="#2A64DA"/><stop offset="1" stop-color="#1239A6"/></linearGradient><linearGradient id="{uid}b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E2F9A"/><stop offset=".5" stop-color="#2463E8"/><stop offset="1" stop-color="#8CC0FA"/></linearGradient><linearGradient id="{uid}e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="{uid}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16367A" stop-opacity=".34"/><stop offset=".55" stop-color="#16367A" stop-opacity=".18"/><stop offset="1" stop-color="#16367A" stop-opacity="0"/></linearGradient><filter id="{uid}f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="22"/></filter><filter id="{uid}g" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs><rect width="1412" height="{h}" fill="url(#{uid}bg)"/><ellipse cx="260" cy="{h-60}" rx="520" ry="220" fill="#F7EBC6" opacity=".75" filter="url(#{uid}f)"/><g class="sky-drift"><path d="M 1500 -40 C 1240 120, 1120 300, 980 470 C 840 640, 640 820, 300 1040 L 1500 1040 Z" fill="url(#{uid}b)" opacity=".92"/><path d="M 1500 120 C 1300 260, 1180 420, 1060 560 C 940 700, 780 860, 560 1040 L 1500 1040 Z" fill="url(#{uid}a)" opacity=".75" filter="url(#{uid}g)"/></g><g class="sky-drift2"><path class="sky-shine" d="M 1500 -60 C 1230 110, 1110 290, 970 460 C 830 630, 630 810, 290 1030" fill="none" stroke="url(#{uid}e)" stroke-width="3"/><path d="M 1500 -60 C 1230 110, 1110 290, 970 460 C 830 630, 630 810, 290 1030" fill="none" stroke="#fff" stroke-width="26" opacity=".25" filter="url(#{uid}f)"/><path d="M 1500 260 C 1330 380, 1220 520, 1120 640 C 1020 760, 900 880, 760 1040" fill="none" stroke="#E6F1FF" stroke-width="1.5" opacity=".7"/></g><rect width="1412" height="{shade}" fill="url(#{uid}s)"/></svg>"""


def cur(current, href):
    return ' aria-current="page"' if current == href else ""


def menu_icon():
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>'


def topnav(base, current):
    links = "".join(
        f'<a href="{base}{href}"{cur(current, href)}>{label}</a>' for label, href in NAV)
    return f"""<header>
  <nav class="topnav" aria-label="Main">
    <a class="brand white" href="{base}index.html" aria-label="Windsor Harlow home"><img src="{base}assets/brand/logo-reverse.svg" alt="Windsor Harlow" width="120" height="32"></a>
    <div class="navlinks">{links}</div>
    <a class="btn btn-dark sm" href="{base}contact.html">Let’s talk <span class="arr" aria-hidden="true">↗</span></a>
    <button class="menu-btn" type="button" data-menu aria-controls="drawer" aria-expanded="false" aria-label="Open menu">{menu_icon()}</button>
  </nav>
</header>"""


def floatnav(base, current):
    links = "".join(
        f'<a href="{base}{href}"{cur(current, href)}>{label}</a>' for label, href in NAV)
    return f"""<div class="floatnav" id="floatnav">
  <a class="brand" href="{base}index.html" aria-label="Windsor Harlow home"><img src="{base}assets/brand/logo-primary.svg" alt="Windsor Harlow" width="100" height="26"></a>
  <nav class="links" aria-label="Quick">{links}</nav>
  <a class="btn btn-dark sm" href="{base}contact.html">Let’s talk <span class="arr" aria-hidden="true">↗</span></a>
  <button class="menu-btn" type="button" data-menu aria-controls="drawer" aria-expanded="false" aria-label="Open menu">{menu_icon()}</button>
</div>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
  <div class="drawer-top">
    <a class="brand" href="{base}index.html"><img src="{base}assets/brand/logo-primary.svg" alt="Windsor Harlow" width="110" height="28"></a>
    <button class="close" type="button" data-close aria-label="Close menu">×</button>
  </div>
  <nav aria-label="Mobile">
    <a href="{base}index.html">Home</a>
    {''.join(f'<a href="{base}{h}">{l}</a>' for l, h in NAV)}
  </nav>
  <div class="drawer-foot">
    <a class="btn btn-dark" href="{base}contact.html">Start a project <span class="arr" aria-hidden="true">↗</span></a>
    <a href="mailto:{MAIL}" style="color:var(--body)">{MAIL}</a>
  </div>
</div>"""


def footer(base, uid="ft", heading=None):
    heading = heading or "Have something to build? Tell us where you are — a senior engineer will reply."
    from content import SERVICES
    svc_links = "".join(f'<a href="{base}services/{s["slug"]}.html">{esc(s["short"])}</a>' for s in SERVICES)
    return f"""<footer class="foot" id="contact-panel">
  {sky_art(uid, "foot")}
  <div class="foot-in">
    <div class="foot-cta rv">
      <h2>{heading}</h2>
      <a class="btn btn-dark" href="{base}contact.html">Contact us <span class="arr" aria-hidden="true">↗</span></a>
    </div>
    <div class="foot-links">
      <div><h3>Contact</h3><a href="mailto:{MAIL}">{MAIL}</a><p style="margin-top:8px">Built in India. Working globally.</p></div>
      <div><h3>Services</h3>{svc_links}</div>
      <div><h3>Studio</h3><a href="{base}work.html">Work</a><a href="{base}about.html">About</a><a href="{base}work/rune.html">Rune</a><a href="{base}blog.html">Blog</a><a href="{base}contact.html">Contact</a></div>
      <div><h3>Legal</h3><a href="{base}privacy.html">Privacy</a></div>
    </div>
    <div class="foot-mark" aria-hidden="true"><img class="fm-badge" src="{base}assets/brand/badge-vector-white.svg" alt=""><img class="fm-word" src="{base}assets/brand/wordmark-vector-white.svg" alt=""></div>
    <div class="foot-base"><span>© <span data-year>2026</span> Windsor Harlow. All rights reserved.</span><span>Independent engineering studio</span></div>
  </div>
</footer>
<script src="{base}assets/js/site.js" defer></script>
</body>
</html>
"""


def body_open(base, current):
    return f"""<body>
<a class="skip" href="#main">Skip to content</a>
{floatnav(base, current)}
<div class="page">"""


def page_hero(base, current, uid, crumbs, title_html, lede, extra="", left=False):
    crumb = ""
    if crumbs:
        parts = ['<a href="%sindex.html">Home</a>' % base]
        for label, href in crumbs:
            parts.append('<span aria-hidden="true">/</span>')
            parts.append('<a href="%s%s">%s</a>' % (base, href, label) if href else '<span>%s</span>' % label)
        crumb = '<nav class="crumbs blur-in" aria-label="Breadcrumb">%s</nav>' % "".join(parts)
    return f"""<section class="sky page-hero{' left' if left else ''}" aria-label="Page introduction">
  {sky_art(uid, "page")}
  {topnav(base, current)}
  <div class="hero-copy">
    {crumb}
    <h1 class="h-page blur-in d1">{title_html}</h1>
    <p class="lede blur-in d2">{lede}</p>
    {extra}
  </div>
</section>"""
