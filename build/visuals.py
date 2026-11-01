# -*- coding: utf-8 -*-
"""Illustrations drawn in HTML + CSS (no image files).

service_art(kind)  -> the artwork on each service card
cover(slug, base)  -> the artwork on each project card
Styles live in assets/css/site.css under "ILLUSTRATIONS" and "PROJECT COVERS".
"""


# ------------------------------------------------------------------ services
def service_art(kind):
    if kind == "assistant":  # AI & ML
        return ('<div class="ill-ai">'
                '<div class="chips-top"><span>RAG</span><span>Grounded answers</span><span>Evaluated</span></div>'
                '<div class="q">Which orders are delayed this week?</div>'
                '<div class="a"><span class="think"><i></i><i></i><i></i></span>'
                '<span class="ill-line ty" style="--w:92%;--k:0"></span><span class="ill-line ty" style="--w:76%;--k:1"></span><span class="ill-line ty" style="--w:58%;--k:2"></span>'
                '<div class="src"><span>orders.db</span><span>shipping API</span><span>SLA policy.pdf</span></div></div>'
                '<div class="ask"><span class="caret"></span><b>↑</b></div></div>')
    if kind == "cluster":  # Cloud & DevOps
        stages = [("Build", "ok"), ("Test", "ok"), ("Scan", "ok"), ("Deploy", "run")]
        pipe = "".join(f'<span class="st {c}"><i></i>{n}</span>' + ('<b class="ln"></b>' if k < 3 else "") for k, (n, c) in enumerate(stages))
        pods = "".join(f'<i class="p{k}" style="--k:{k}"></i>' for k in range(12))
        return ('<div class="ill-cloud">'
                f'<div class="pipe">{pipe}</div>'
                '<div class="cluster"><div class="hd"><b>prod · kubernetes</b><span class="live"><i></i>healthy</span></div>'
                f'<div class="pods">{pods}</div>'
                '<div class="ft"><span>3 nodes</span><span>autoscaling</span><span>us-east · ap-south</span></div></div>'
                '<div class="tf"><span>$ terraform plan</span><b>+3 ~1 −0</b></div></div>')
    if kind == "apps":  # Mobile
        return ('<div class="ill-apps">'
                '<div class="phone a"><div class="notch"></div>'
                '<div class="greet">Good morning</div>'
                '<div class="hero-card"><span>Next delivery</span><b>Today, 4:30 pm</b></div>'
                '<div class="row"><i></i><span></span></div><div class="row"><i></i><span></span></div>'
                '<div class="tabs"><i class="on"></i><i></i><i></i><i></i></div></div>'
                '<div class="phone b"><div class="notch"></div>'
                '<div class="push"><i></i><span><b>Order shipped</b>Arriving in 2 days</span></div>'
                '<div class="route"><svg viewBox="0 0 120 120" aria-hidden="true"><path d="M14 104 C 40 90, 30 54, 62 50 S 96 20, 106 14" fill="none" stroke="#2463E8" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 7"/><circle cx="14" cy="104" r="6" fill="#0B1220"/><circle cx="106" cy="14" r="7" fill="#2463E8"/></svg></div>'
                '<div class="cta">Track order</div></div>'
                '<span class="os ios">iOS</span><span class="os and">Android</span></div>')
    if kind == "dash":  # Web
        bars = "".join(f'<i style="--h:{h}%;--k:{k}"></i>' for k, h in enumerate((38, 54, 46, 70, 62, 84, 76)))
        return ('<div class="ill-dash"><div class="bar"><i></i><i></i><i></i><span>app.yourcompany.com</span></div>'
                '<div class="body"><div class="side"><b></b><i></i><i></i><i></i><i></i></div>'
                '<div class="main"><div class="kpis"><span><em>Active users <i class="livedot"></i></em><b>12.4k</b></span><span><em>Conversion</em><b>4.8%</b></span></div>'
                f'<div class="chart">{bars}</div></div></div>'
                '<span class="badge">WCAG 2.2 AA ✓</span></div>')
    if kind == "log":  # Backend
        return ('<div class="ill-log"><span style="--k:0"><span><b class="m">POST</b> /orders</span><b class="ok">201 · 84 ms</b></span>'
                '<span style="--k:1"><span>queue · order.created</span><b class="ok">✓</b></span>'
                '<span style="--k:2"><span>worker · invoice.sent</span><b class="ok">✓</b></span>'
                '<span class="dark" style="--k:3"><span><b class="m">GET</b> /orders/:id</span><b class="ok">200</b></span></div>')
    if kind == "shop":  # Commerce
        return ('<div class="ill-shop"><div class="card"><div class="img"></div><span class="ill-line" style="width:70%"></span>'
                '<div class="row"><b>₹2,499</b><span class="btn-mini">Add to cart</span></div></div>'
                '<div class="toast"><span class="ok">✓</span> Order #1042 · paid</div></div>')
    if kind == "pipeline":  # Salesforce
        cols = [("Lead", 3, 0), ("Qualified", 2, 1), ("Won", 2, 2)]
        out = []
        for name, n, hot in cols:
            cards = "".join(f'<i class="{"hot" if hot == 2 and k == 0 else ""}"></i>' for k in range(n))
            out.append(f'<div class="col"><span class="mono">{name}</span>{cards}</div>')
        return '<div class="ill-pipe">' + "".join(out) + '<i class="mover" aria-hidden="true"></i></div>'
    return ""


# ------------------------------------------------------------------ projects
def cover(slug, base=""):
    if slug == "air-bridge":
        return ('<div class="cv cv-air">'
                '<div class="win"><div class="wbar"><i></i><i></i><i></i><span>Air Bridge</span></div>'
                '<div class="dev on"><span class="ic"></span><span><b>Pixel 8</b><em>Wi-Fi · connected</em></span><i class="dot"></i></div>'
                '<div class="dev"><span class="ic"></span><span><b>Galaxy S24</b><em>Nearby · tap to pair</em></span></div>'
                '<div class="drop"><span>app-release.apk</span><div class="prog"><i></i></div></div></div>'
                '<div class="waves" aria-hidden="true"><i></i><i></i><i></i></div>'
                '<div class="ph"><span></span></div></div>')
    if slug == "accessibility-testing":
        return ('<div class="cv cv-a11y">'
                '<div class="rep"><div class="rh"><b>Accessibility report</b><span>WCAG 2.2</span></div>'
                '<div class="sev"><span>Critical</span><i style="--w:28%" class="c"></i></div>'
                '<div class="sev"><span>Serious</span><i style="--w:52%" class="s"></i></div>'
                '<div class="sev"><span>Moderate</span><i style="--w:74%" class="m"></i></div>'
                '<div class="pass">✓ Passed checks listed too</div></div>'
                '<div class="pg"><span class="img"><em>Image missing alt text</em></span><i></i><i></i><b class="scan"></b></div></div>')
    if slug == "rune":
        return ('<div class="cv cv-rune shot"><div class="ring r1"></div>'
                f'<div class="mini-b"><div class="bar"><i></i><i></i><i></i></div><img src="{base}assets/shots/rune-dashboard.jpg" alt="" loading="lazy"></div>'
                '<div class="term"><span><b>$</b> rune unseal</span><span class="dim">✓ vault unsealed</span></div></div>')
    if slug == "atlas-platform":
        workers = "".join(f'<span class="wk"><em>worker {k}</em><i style="--d:{k * .5}s"></i></span>' for k in range(1, 4))
        return ('<div class="cv cv-atlas">'
                '<div class="docs"><span></span><span></span><span></span></div>'
                '<div class="flow"><i></i><i></i><i></i></div>'
                '<div class="q">SQS</div>'
                '<div class="flow"><i></i><i></i><i></i></div>'
                f'<div class="wks">{workers}<span class="scale">KEDA · scale ↑</span></div></div>')
    if slug == "enterprise-polyglot":
        return ('<div class="cv cv-poly">'
                '<div class="svc j"><b>Java 21</b><em>Spring Boot</em></div>'
                '<div class="svc p"><b>Python</b><em>FastAPI</em></div>'
                '<div class="lane"><span>build</span><span>test</span><span>scan</span><span>deploy</span><i class="pk"></i></div>'
                '<div class="out"><span class="live"></span>one pipeline · Jenkins</div></div>')
    if slug == "gcp-platform-operations":
        bars = "".join(f'<i style="--h:{h}%"></i>' for h in (60, 72, 54, 48, 40, 36))
        return ('<div class="cv cv-gcp"><div class="term">'
                '<span><b>$</b> terraform apply</span><span class="ok">✓ gke-cluster ready</span>'
                '<span><b>$</b> gcloud builds submit</span><span class="ok">✓ release 1.4.2 live</span>'
                '<span><b>$</b> <i class="caret"></i></span></div>'
                f'<div class="cost"><em>Cost review</em><div class="bars">{bars}</div></div></div>')
    if slug == "terraform-aws":
        return ('<div class="cv cv-tf"><div class="pr">'
                '<div class="prh"><span class="open">Open</span><b>Add private subnets</b></div>'
                '<div class="diff"><span class="add">+ aws_subnet.private_a</span><span class="add">+ aws_subnet.private_b</span><span class="chg">~ aws_route_table.main</span></div>'
                '<div class="plan">Plan: 2 to add, 1 to change, 0 to destroy</div>'
                '<div class="checks"><span>✓ terraform plan</span><span>✓ OIDC auth</span></div>'
                '<div class="merge">Merge → apply</div></div></div>')
    if slug == "eks-deploy":
        pods = "".join(f'<span class="pod" style="--i:{k}"><em>v1</em><em>v2</em></span>' for k in range(6))
        return ('<div class="cv cv-eks"><div class="hd"><b>deployment/web</b><span>v1 → v2</span></div>'
                f'<div class="pods">{pods}</div>'
                '<div class="probe"><span>readiness ✓</span><span>liveness ✓</span><span>maxUnavailable: 0</span></div></div>')
    if slug == "ai-post":
        rows = "".join(f'<span class="psg"><em>{d}</em><i style="--s:{s}%"></i></span>' for d, s in
                       [("returns-policy.pdf", 92), ("claims-guide.pdf", 64), ("support-hours.md", 18)])
        return ('<div class="cv cv-rag"><div class="qq">How long do refunds take?</div>'
                f'<div class="psgs">{rows}</div>'
                '<div class="ans"><span>Within 5 working days of the item reaching the warehouse.</span><b>[1]</b></div></div>')
    return ""
