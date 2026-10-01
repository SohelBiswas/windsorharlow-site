/* Windsor Harlow — site behaviour. Every block is guarded, so this file
   is safe to load on any page. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  /* Portfolio and enquiry endpoints are independent. Configuring the
     enquiry Lambda must never activate requests to portfolio storage. */
  const MAIL = (typeof WH_MAIL !== "undefined" && WH_MAIL) || "business@windsorharlow.com";
  const API = (typeof WH_API !== "undefined" && WH_API) ? String(WH_API).replace(/\/$/, "") : null;
  const ENQUIRY_API = (typeof WH_ENQUIRY_API !== "undefined" && WH_ENQUIRY_API)
    ? String(WH_ENQUIRY_API).replace(/\/$/, "") : null;

  /* Escape before injecting anything that came from the API, an upload form
     or a URL. The server already strips angle brackets, but escaping at the
     point of injection means a change there can never become an XSS hole. */
  const esc = v => String(v == null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const BASE = window.WH_BASE || "";

  /* ---------------- masthead, progress, drawer ---------------- */
  const mast = $("#mast"), prog = $("#prog");
  addEventListener("scroll", () => {
    const y = scrollY;
    if (mast) mast.classList.toggle("stuck", y > 12);
    if (prog) {
      const h = document.body.scrollHeight - innerHeight;
      prog.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }, { passive: true });

  const burger = $("#burger"), drawer = $("#drawer"), scrim = $("#scrim");
  if (burger && drawer) {
    let isOpen = false, returnFocus = null, previousOverflow = "";
    const background = new Map();
    const focusable = () => $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer
    ).filter(el => !el.closest('[inert]') && el.getClientRects().length);
    const set = open => {
      if (open === isOpen) return;
      isOpen = open;
      if (open) {
        returnFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;
        drawer.inert = false;
        drawer.setAttribute("aria-hidden", "false");
        [...document.body.children].forEach(el => {
          if (el === drawer || el === scrim || /^(SCRIPT|STYLE|LINK)$/.test(el.tagName)) return;
          background.set(el, el.inert);
          el.inert = true;
        });
      } else {
        background.forEach((wasInert, el) => { el.inert = wasInert; });
        background.clear();
        if (returnFocus && returnFocus.isConnected && returnFocus.getClientRects().length) {
          returnFocus.focus({ preventScroll: true });
        } else if (burger.getClientRects().length) {
          burger.focus({ preventScroll: true });
        }
        drawer.inert = true;
        drawer.setAttribute("aria-hidden", "true");
      }
      drawer.classList.toggle("open", open);
      if (scrim) scrim.classList.toggle("on", open);
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : previousOverflow;
      if (open) (focusable()[0] || drawer).focus({ preventScroll: true });
    };
    drawer.inert = true;
    burger.addEventListener("click", () => set(!isOpen));
    if (scrim) scrim.addEventListener("click", () => set(false));
    const x = $("#drawerX"); if (x) x.addEventListener("click", () => set(false));
    $$("a", drawer).forEach(a => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", e => {
      if (!isOpen) return;
      if (e.key === "Escape") { e.preventDefault(); set(false); return; }
      if (e.key !== "Tab") return;
      const controls = focusable(), first = controls[0], last = controls[controls.length - 1];
      if (!first) { e.preventDefault(); drawer.focus(); return; }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === drawer)) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
    document.addEventListener("focusin", e => {
      if (isOpen && !drawer.contains(e.target)) (focusable()[0] || drawer).focus({ preventScroll: true });
    });
    addEventListener("resize", () => {
      if (isOpen && !burger.getClientRects().length) set(false);
    });
  }

  /* ---------------- scroll reveal ---------------- */
  $$("section > .wrap > *, .pillars, .prac, .eng, .steps, .work-grid, .drop, .cx, .console, .svc-grid, .matrix, .caps, .exs, .dels, .acc")
    .forEach(el => {
      if (el.closest(".hero") || el.classList.contains("figures") ||
          el.classList.contains("hero-grid") || el.classList.contains("phero-grid") ||
          el.querySelector(".h-line")) return;
      el.classList.add("rv");
    });
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.06, rootMargin: "0px 0px -40px" });
  $$(".rv").forEach((el, i) => { el.style.transitionDelay = Math.min((i % 4) * 95, 285) + "ms"; io.observe(el); });

  /* ---------------- section spy ---------------- */
  const navLinks = $$("#nav a");
  if (navLinks.length) {
    const samePage = link => {
      const url = new URL(link.href, location.href);
      return url.pathname.replace(/index\.html$/, "") === location.pathname.replace(/index\.html$/, "");
    };
    const markNav = section => navLinks.forEach(link => {
      const hash = new URL(link.href, location.href).hash;
      const active = samePage(link) && (!hash || hash === "#" + section);
      link.classList.toggle("on", active);
      if (active) link.setAttribute("aria-current", hash ? "location" : "page");
      else link.removeAttribute("aria-current");
    });
    markNav(location.hash.slice(1));
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) markNav(e.target.id);
    }), { threshold: 0.25 });
    $$("section[id]").forEach(s => spy.observe(s));
  }

  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------------- ambient aurora on dark bands ---------------- */
  $$("section.dark").forEach(sec => {
    const a = document.createElement("div");
    a.className = "aurora";
    a.setAttribute("aria-hidden", "true");
    a.innerHTML = "<i></i><i></i><i></i>";
    sec.prepend(a);
  });

  /* ---------------- count-up figures ---------------- */
  const figs = $$(".figure");
  if (figs.length) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = el => {
      const b = $("b", el);
      if (!b || b.dataset.done) return;
      b.dataset.done = "1";
      let to = b.dataset.to;
      if (to === "auto-index") to = (typeof INDEX !== "undefined" ? INDEX.length : 0);
      to = Number(to) || 0;
      const suffix = b.dataset.suffix || "";
      if (reduce) { b.textContent = to + suffix; return; }
      const dur = 1250, t0 = performance.now();
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        b.textContent = Math.round(to * eased) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const fo = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); run(e.target); fo.unobserve(e.target); }
    }), { threshold: 0.4 });
    figs.forEach(f => fo.observe(f));
  }

  /* ---------------- scroll-drawn delivery stage line ---------------- */
  const track = $("#stageTrack"), dotWrap = $("#stageDots"), stepsWrap = $("#steps");
  if (track && dotWrap && stepsWrap) {
    const steps = $$(".step", stepsWrap);
    const n = steps.length;
    dotWrap.innerHTML = steps.map((_, i) =>
      `<b style="left:calc(${(i + 0.5) * (100 / n)}% - 4.5px)"></b>`).join("");
    const dots = $$("b", dotWrap);
    const draw = () => {
      const r = stepsWrap.getBoundingClientRect();
      const span = r.height + innerHeight * 0.5;
      let p = (innerHeight * 0.85 - r.top) / span;
      p = Math.max(0, Math.min(1, p));
      track.style.setProperty("--p", p.toFixed(3));
      dots.forEach((d, i) => {
        const on = p >= (i + 0.5) / n - 0.06;
        d.classList.toggle("lit", on);
        steps[i].classList.toggle("lit", on);
      });
    };
    addEventListener("scroll", draw, { passive: true });
    addEventListener("resize", draw);
    draw();
  }


  const hasData = typeof PRACTICES !== "undefined";

  /* ---------------- stack ticker ---------------- */
  const tick = $("#tick");
  if (tick && typeof INDEX !== "undefined") {
    const words = INDEX.map(i => i[0]).sort(() => Math.random() - 0.5).slice(0, 44);
    tick.innerHTML = [...words, ...words].map(w => `<span>${w}</span>`).join("");
  }

  /* ---------------- practice explorer (home) ---------------- */
  const pList = $("#pracList"), pPanel = $("#pracPanel"), pCount = $("#pracCount");
  if (pList && pPanel && hasData) {
    pList.innerHTML = PRACTICES.map((p, i) =>
      `<button class="prac-btn${i ? "" : " on"}" role="tab" aria-selected="${!i}" data-i="${i}">
         <i>0${i + 1}</i><strong>${p.label}</strong></button>`).join("");
    const draw = i => {
      const p = PRACTICES[i];
      pPanel.innerHTML = `<div class="fade-in">
        <h3>${p.title}</h3><p class="lede">${p.lede}</p>
        <dl class="stack">${p.stack.map(([k, v]) => `<div class="stack-row"><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
        <p style="margin-top:26px"><a class="btn btn-ghost" href="${BASE}${p.href}">Open the ${p.short} practice <span class="arrow">→</span></a></p>
      </div>`;
      if (pCount) pCount.textContent = `${p.stack.length} capability groups in ${p.short}`;
      $$(".prac-btn", pList).forEach((b, j) => { b.classList.toggle("on", i === j); b.setAttribute("aria-selected", i === j); });
    };
    pList.addEventListener("click", e => { const b = e.target.closest(".prac-btn"); if (b) draw(+b.dataset.i); });
    draw(0);
  }

  /* ---------------- spearhead cards + other-practices strip ---------------- */
  const spears = $("#spears");
  if (spears && hasData) {
    const glyph = id => (typeof PRACTICE_GLYPHS !== "undefined" && PRACTICE_GLYPHS[id]) || "";
    spears.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
        <defs><linearGradient id="pgG" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="#0079CA"/><stop offset="1" stop-color="#1FA6B8"/>
        </linearGradient></defs></svg>` +
      PRACTICES.filter(p => p.lead).map(p => `
      <article class="spear" tabindex="0">
        <div class="spear-face">
          <span class="spear-glyph"><svg viewBox="0 0 48 48">${glyph(p.id)}</svg></span>
          <p class="spear-tag">Lead practice</p>
          <h3>${p.label}</h3>
          <p class="spear-blurb">${p.blurb || ""}</p>
          <span class="spear-more"><i></i>What we build</span>
        </div>
        <div class="spear-back">
          <p class="spear-tag">${p.short}</p>
          <h3>${p.title}</h3>
          <ul>${p.stack.slice(0, 5).map(([k]) => `<li>${k}</li>`).join("")}</ul>
          <a class="spear-link" href="${BASE}${p.href}">Open the practice <span class="arrow">&#8594;</span></a>
        </div>
      </article>`).join("");
  }

  const strip = $("#strip");
  if (strip && hasData) {
    strip.innerHTML = PRACTICES.filter(p => !p.lead).map((p, i) => `
      <a href="${BASE}${p.href}">
        <i>0${i + 1}</i><h3>${p.label}</h3><p>${p.blurb}</p><span>→</span>
      </a>`).join("");
  }

  /* ---------------- capability index ---------------- */
  const grid = $("#idxGrid"), chips = $("#idxChips"), meta = $("#idxMeta"),
        empty = $("#idxEmpty"), q = $("#idxq");
  if (grid && typeof INDEX !== "undefined") {
    const only = grid.dataset.cat || "";
    const rowsAll = only ? INDEX.filter(i => i[1] === only) : INDEX;
    let cat = "All";
    if (chips && !only) {
      const cats = ["All", ...new Set(INDEX.map(i => i[1]))];
      chips.innerHTML = cats.map(c => `<button class="chip${c === "All" ? " on" : ""}" data-c="${c}">${c}</button>`).join("");
    }
    const draw = () => {
      const term = (q ? q.value : "").trim().toLowerCase();
      const rows = rowsAll.filter(([n, c]) => (cat === "All" || c === cat) && n.toLowerCase().includes(term));
      grid.innerHTML = rows.map(([n, c]) => `<div class="idx-item"><span>${n}</span><b>${c}</b></div>`).join("");
      if (meta) meta.textContent = `${rows.length} of ${rowsAll.length} entries`
        + (cat !== "All" ? " · " + cat : "") + (term ? ` · matching “${term}”` : "");
      if (empty) empty.hidden = rows.length > 0;
    };
    if (chips) chips.addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      cat = b.dataset.c;
      $$(".chip", chips).forEach(c => c.classList.toggle("on", c === b));
      draw();
    });
    if (q) q.addEventListener("input", draw);
    draw();
  }

  /* ---------------- accordion ---------------- */
  $$(".acc-q").forEach(btn => btn.addEventListener("click", () => {
    const item = btn.closest(".acc-item"), body = $(".acc-a", item), open = item.classList.contains("open");
    $$(".acc-item.open").forEach(o => { o.classList.remove("open"); $(".acc-a", o).style.maxHeight = 0; $(".acc-q", o).setAttribute("aria-expanded", false); });
    if (!open) { item.classList.add("open"); body.style.maxHeight = body.scrollHeight + "px"; btn.setAttribute("aria-expanded", true); }
  }));

  /* ---------------- portfolio: read from API, fall back to seeds ---------------- */

  /* ---- animated media per practice, drawn rather than stock ---- */
  function workMedia(cat){
    const c = (cat || "").toLowerCase();

    /* quality engineering — a page is swept, violations flare,
       the report fills in beside it */
    if (c.indexOf("quality") > -1 || c.indexOf("test") > -1 || c.indexOf("accessib") > -1)
      return `<svg class="cm cm-qa" viewBox="0 0 320 180" aria-hidden="true">
        <g class="cm-page">
          <rect x="26" y="34" width="118" height="112" rx="3"/>
          <line x1="40" y1="56" x2="112" y2="56"/><line x1="40" y1="72" x2="130" y2="72"/>
          <line x1="40" y1="88" x2="96"  y2="88"/><line x1="40" y1="104" x2="124" y2="104"/>
          <line x1="40" y1="120" x2="86" y2="120"/>
        </g>
        <line class="cm-sweep" x1="26" y1="36" x2="144" y2="36"/>
        <g class="cm-flag">
          <circle cx="122" cy="72" r="4.5"/><circle cx="88" cy="104" r="4.5"/>
          <circle cx="104" cy="120" r="4.5"/>
        </g>
        <g class="cm-bars">
          <rect class="cm-trk" x="176" y="58"  width="118" height="8" rx="2"/>
          <rect class="cm-trk" x="176" y="86"  width="118" height="8" rx="2"/>
          <rect class="cm-trk" x="176" y="114" width="118" height="8" rx="2"/>
          <rect class="cm-fil"  x="176" y="58"  width="118" height="8" rx="2" style="--w:.82"/>
          <rect class="cm-fil cm-fil2" x="176" y="86"  width="118" height="8" rx="2" style="--w:.5"/>
          <rect class="cm-fil cm-fil3" x="176" y="114" width="118" height="8" rx="2" style="--w:.24"/>
        </g>
      </svg>`;

    /* developer tooling — a build crosses the air onto a device */
    if (c.indexOf("tooling") > -1 || c.indexOf("developer") > -1)
      return `<svg class="cm cm-tool" viewBox="0 0 320 180" aria-hidden="true">
        <g class="cm-host">
          <rect x="24" y="50" width="106" height="80" rx="3"/>
          <line x1="24" y1="66" x2="130" y2="66"/>
          <circle cx="34" cy="58" r="2"/><circle cx="42" cy="58" r="2"/><circle cx="50" cy="58" r="2"/>
        </g>
        <g class="cm-wave">
          <path d="M156 76 a26 26 0 0 1 0 28"/>
          <path d="M168 64 a40 40 0 0 1 0 52"/>
          <path d="M180 52 a54 54 0 0 1 0 76"/>
        </g>
        <g class="cm-dev">
          <rect x="238" y="42" width="52" height="96" rx="8"/>
          <rect class="cm-scr" x="244" y="52" width="40" height="72" rx="3"/>
        </g>
        <rect class="cm-apk" x="-7" y="-7" width="14" height="14" rx="2"/>
      </svg>`;

    if (c.indexOf("ai") === 0 || c.indexOf("ml") > -1)
      return `<svg class="cm cm-ai" viewBox="0 0 320 180" aria-hidden="true">
        <g class="cm-grid">${
          Array.from({length:40},(_,i)=>{const x=40+(i%10)*26,y=48+Math.floor(i/10)*26;
            return `<rect x="${x}" y="${y}" width="12" height="12" rx="2"/>`;}).join("")}</g>
        <g class="cm-hit">
          <rect x="118" y="48" width="12" height="12" rx="2"/>
          <rect x="196" y="74" width="12" height="12" rx="2"/>
          <rect x="66" y="100" width="12" height="12" rx="2"/></g>
        <line class="cm-scan" x1="34" y1="40" x2="34" y2="146"/>
        <circle class="cm-q" cx="20" cy="90" r="5"/>
        <circle class="cm-a" cx="300" cy="90" r="5"/>
        <path class="cm-ray" d="M26 90 H112" pathLength="100"/>
        <path class="cm-ray cm-r2" d="M212 80 H294" pathLength="100"/>
      </svg>`;
    /* security engineering — a sealed vault, key held off the disk */
    if (c.indexOf("security") > -1)
      return `<svg class="cm cm-sec" viewBox="0 0 320 180" aria-hidden="true">
        <rect class="cm-vault" x="34" y="42" width="150" height="104" rx="5"/>
        <g class="cm-rows">
          <rect x="52" y="62" width="114" height="13" rx="3"/>
          <rect x="52" y="84" width="114" height="13" rx="3"/>
          <rect x="52" y="106" width="114" height="13" rx="3"/>
        </g>
        <g class="cm-shackle">
          <path d="M96 42v-9a13 13 0 0 1 26 0v9"/>
        </g>
        <rect class="cm-key" x="214" y="60" width="72" height="34" rx="4"/>
        <text class="cm-keyt" x="250" y="82">MEMORY</text>
        <rect class="cm-disk" x="214" y="112" width="72" height="34" rx="4"/>
        <text class="cm-diskt" x="250" y="134">DISK</text>
        <line class="cm-no" x1="222" y1="120" x2="278" y2="138"/>
      </svg>`;

    /* platform engineering — pods rolling forward */
    if (c.indexOf("platform") > -1 || c.indexOf("kubernetes") > -1)
      return `<svg class="cm cm-k8s" viewBox="0 0 320 180" aria-hidden="true">
        <rect class="cm-cluster" x="26" y="34" width="268" height="112" rx="5"/>
        <g class="cm-new">
          <rect x="44" y="66" width="52" height="48" rx="4"/>
          <rect x="106" y="66" width="52" height="48" rx="4"/>
        </g>
        <g class="cm-old">
          <rect x="168" y="66" width="52" height="48" rx="4"/>
          <rect x="230" y="66" width="52" height="48" rx="4"/>
        </g>
        <line class="cm-sweep2" x1="34" y1="34" x2="34" y2="146"/>
      </svg>`;

    if (c.indexOf("cloud") > -1 || c.indexOf("infra") > -1)
      return `<svg class="cm cm-cloud" viewBox="0 0 320 180" aria-hidden="true">
        <g class="cm-zone"><rect x="42" y="44" width="70" height="92" rx="3"/>
          <text x="77" y="128">AZ-A</text></g>
        <g class="cm-zone cm-zone-b"><rect x="125" y="44" width="70" height="92" rx="3"/>
          <text x="160" y="128">AZ-B</text></g>
        <g class="cm-zone cm-zone-c"><rect x="208" y="44" width="70" height="92" rx="3"/>
          <text x="243" y="128">AZ-C</text></g>
        <path class="cm-flow" d="M20 90 H42" pathLength="100"/>
        <path class="cm-flow cm-f2" d="M112 90 H125" pathLength="100"/>
        <path class="cm-flow cm-f3" d="M195 90 H208" pathLength="100"/>
        <circle class="cm-load" r="4"/>
      </svg>`;
    return `<svg class="cm cm-web" viewBox="0 0 320 180" aria-hidden="true">
        <path class="cm-edge" d="M70 60 C120 60 120 120 170 120" pathLength="100"/>
        <path class="cm-edge cm-e2" d="M70 60 C130 60 130 60 250 60" pathLength="100"/>
        <path class="cm-edge cm-e3" d="M170 120 C210 120 210 120 250 60" pathLength="100"/>
        <circle class="cm-svc" cx="70" cy="60" r="13"/>
        <circle class="cm-svc cm-s2" cx="170" cy="120" r="13"/>
        <circle class="cm-svc cm-s3" cx="250" cy="60" r="13"/>
        <circle class="cm-msg" r="4"/>
      </svg>`;
  }

  const wGrid = $("#workGrid"), wFilters = $("#workFilters"), wCount = $("#workCount");
  let items = [], wCat = "All", apiLive = false;

  const cats = () => ["All", ...new Set(items.map(i => i.cat).filter(Boolean))];
  function drawWork() {
    if (!wGrid) return;
    /* two or three entries do not need filtering — the chips are noise */
    if (wFilters) wFilters.innerHTML = items.length < 4 ? "" : cats().map(c =>
      `<button class="wchip${c === wCat ? " on" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
    const rows = items.filter(i => wCat === "All" || i.cat === wCat);
    wGrid.innerHTML = rows.length ? rows.map(i => `
      <article class="card${i.href ? " card-link" : ""}">
        ${i.href ? `<a class="card-hit" href="${esc(i.href)}" aria-label="${esc(i.title)}"></a>` : ""}
        <div class="card-media">${i.src ? `<img src="${esc(i.src)}" alt="">` : workMedia(i.cat)}<span class="cm-cap">${esc(i.cat || "Case study")}</span></div>
        <div class="card-body">
          <p class="card-tag">${esc(i.tag || "Case study")}</p>
          <h3>${esc(i.title)}</h3>
          <p>${esc(i.body || "")}</p>
          <p class="card-foot">${esc(i.foot || "")}</p>
          ${i.href ? `<p class="card-more">Read the case study <span>&#8594;</span></p>` : ""}
          ${i.id && apiLive ? `<button class="card-del" data-del="${esc(i.id)}">Remove</button>` : ""}
        </div>
      </article>`).join("")
      : `<article class="card"><div class="card-body" style="padding:44px 24px">
           <h3>Nothing here yet</h3><p>Publish a case study below and it appears in this filter.</p></div></article>`;
    if (wCount) wCount.textContent =
      `${rows.length} entr${rows.length === 1 ? "y" : "ies"}` +
      (wCat === "All" ? "" : ` in ${wCat}`);
  }

  async function loadWork() {
    if (!wGrid) return;
    items = typeof WORK !== "undefined" ? [...WORK] : [];
    drawWork();
    if (!API) {
      /* Nothing to connect to — drop the status pill rather than telling
         visitors the backend is down. */
      $$(".pill[data-api]").forEach(p => p.remove());
      return;
    }
    try {
      const r = await fetch(`${API}/portfolio`, { headers: { Accept: "application/json" } });
      if (!r.ok) throw 0;
      const json = await r.json();
      apiLive = true;
      markApi(true);
      if (Array.isArray(json.items) && json.items.length) { items = json.items; drawWork(); }
    } catch (e) { apiLive = false; markApi(false); }
  }
  function markApi(live) {
    $$(".pill[data-api]").forEach(p => {
      p.classList.toggle("live", live); p.classList.toggle("off", !live);
      $("span", p).textContent = live ? "API connected" : "API offline — showing seed content";
    });
  }
  if (wFilters) wFilters.addEventListener("click", e => {
    const b = e.target.closest(".wchip"); if (!b) return; wCat = b.dataset.c; drawWork();
  });
  if (wGrid) wGrid.addEventListener("click", async e => {
    const b = e.target.closest("[data-del]"); if (!b) return;
    const token = prompt("Admin token to remove this entry:"); if (!token) return;
    try {
      const r = await fetch(`${API}/portfolio/${b.dataset.del}`, { method: "DELETE", headers: { "x-admin-token": token } });
      if (!r.ok) throw 0;
      items = items.filter(i => i.id !== b.dataset.del);
      if (!cats().includes(wCat)) wCat = "All";
      drawWork();
    } catch (_) { alert("Removal failed. Check the admin token."); }
  });
  loadWork();

  /* ---------------- publish console (upload) ---------------- */
  const con = $("#console");
  if (con) {
    const drop = $("#drop"), file = $("#file"), state = $("#pubState"), pick = $("#pick");
    let queued = [];
    const show = (msg, cls) => { if (state) { state.textContent = msg; state.className = "state " + (cls || ""); } };
    if (pick) pick.addEventListener("click", () => file.click());
    if (file) file.addEventListener("change", () => queue(file.files));
    if (drop) {
      ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("hot"); }));
      ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("hot"); }));
      drop.addEventListener("drop", e => queue(e.dataTransfer.files));
    }
    function queue(list) {
      queued = [...list];
      show(queued.length ? `${queued.length} file${queued.length > 1 ? "s" : ""} ready: ${queued.map(f => f.name).join(", ")}` : "", "ok");
    }
    $("#pubForm").addEventListener("submit", async e => {
      e.preventDefault();
      const title = $("#pt").value.trim();
      if (!title) { show("Give the case study a title.", "bad"); $("#pt").focus(); return; }
      const token = $("#ptoken").value.trim();
      if (!token) { show("Admin token required to publish.", "bad"); $("#ptoken").focus(); return; }

      const fd = new FormData();
      fd.append("title", title);
      fd.append("cat", $("#pc").value);
      fd.append("tag", $("#ptag").value.trim() || "Case study");
      fd.append("body", $("#pb").value.trim());
      fd.append("foot", $("#pf").value.trim());
      queued.forEach(f => fd.append("files", f));

      show("Publishing…");
      try {
        if (!API) throw new Error("No backend configured yet.");
        const r = await fetch(`${API}/portfolio`, { method: "POST", headers: { "x-admin-token": token }, body: fd });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Publish failed");
        apiLive = true; markApi(true);
        items = j.items || items;
        wCat = "All"; drawWork();
        $("#pubForm").reset(); queued = [];
        show("Published. The card is live in the grid above.", "ok");
        wGrid.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (err) {
        /* No backend yet: preview locally so the layout can still be reviewed. */
        const f = queued[0];
        const item = {
          id: "local-" + Date.now(), title, cat: $("#pc").value,
          tag: $("#ptag").value.trim() || "Local preview — not published",
          body: $("#pb").value.trim() || "Preview only. Start the API server to publish this permanently.",
          foot: $("#pf").value.trim() || (f ? `${(f.name.split(".").pop() || "file").toUpperCase()} · ${Math.round(f.size / 1024)} KB` : "")
        };
        const push = () => { items.push(item); wCat = "All"; drawWork(); };
        if (f && f.type.startsWith("image/")) {
          const rd = new FileReader(); rd.onload = () => { item.src = rd.result; push(); }; rd.readAsDataURL(f);
        } else push();
        show("API offline — added as a local preview only. " + err.message, "bad");
      }
    });
  }

  /* ---------------- enquiry form ---------------- */
  const form = $("#cform");
  if (form) {
    const msg = $("#fmsg");
    const val = id => { const el = $("#" + id); return el ? el.value.trim() : ""; };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const req = [["fn", "your name"], ["fe", "a work email"], ["fd", "a short description"]];
      let bad = null;
      req.forEach(([id]) => {
        const el = $("#" + id), blank = !el.value.trim();
        const badMail = id === "fe" && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
        el.classList.toggle("err", blank || badMail);
        el.setAttribute("aria-invalid", blank || badMail ? "true" : "false");
        if ((blank || badMail) && !bad) bad = id;
      });
      if (bad) {
        msg.className = "f-msg";
        msg.textContent = bad === "fe" && val("fe") ? "That email address doesn’t look right."
          : "Add " + req.find(r => r[0] === bad)[1] + " so we can reply.";
        $("#" + bad).focus(); return;
      }
      const payload = {
        name: val("fn"), email: val("fe"), company: val("fc"),
        practice: val("fp"), model: val("fm"), timeline: val("ft"), detail: val("fd"),
        website: val("fw")   /* honeypot — offscreen, never filled by a person */
      };
      /* The message must not be lost, whatever happens next. If there is a
         backend, try it. Otherwise — or if it fails — hand the visitor the
         composed message with a mail link AND the text itself, so a missing
         mail client is an inconvenience rather than a silent loss. */
      const lines = [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Company: ${payload.company || "—"}`,
        `Area of interest: ${payload.practice}`,
        `Help needed: ${payload.model}`,
        `Timeline: ${payload.timeline}`,
        "", "Detail:", payload.detail
      ].join("\n");
      const subject = "New enquiry — " + payload.practice + " — " + (payload.company || payload.name);

      function handoff(note) {
        const old = $("#fhand"); if (old) old.remove();
        const box = document.createElement("div");
        box.className = "f-hand"; box.id = "fhand";

        const p = document.createElement("p");
        p.className = "f-hand-h"; p.textContent = note;

        const row = document.createElement("p");
        row.className = "f-hand-a";
        const a = document.createElement("a");
        a.className = "btn";
        a.setAttribute("href", "mailto:" + MAIL
          + "?subject=" + encodeURIComponent(subject)
          + "&body=" + encodeURIComponent(lines));
        a.textContent = "Open your email app";
        const copy = document.createElement("button");
        copy.type = "button"; copy.className = "btn btn-ghost";
        copy.textContent = "Copy the message";
        copy.addEventListener("click", () => {
          const t = $("#fhandtxt");
          t.select();
          const done = () => { copy.textContent = "Copied"; setTimeout(() => copy.textContent = "Copy the message", 2200); };
          if (navigator.clipboard) navigator.clipboard.writeText(lines).then(done, () => { document.execCommand("copy"); done(); });
          else { document.execCommand("copy"); done(); }
        });
        row.append(a, copy);

        const lab = document.createElement("label");
        lab.className = "f-hand-l"; lab.setAttribute("for", "fhandtxt");
        lab.textContent = "Or send this to " + MAIL + " yourself:";
        const ta = document.createElement("textarea");
        ta.id = "fhandtxt"; ta.className = "f-hand-t"; ta.readOnly = true; ta.rows = 9;
        ta.value = lines;                       /* value, never innerHTML */

        box.append(p, row, lab, ta);
        msg.after(box);
        msg.className = "f-msg"; msg.textContent = "";
        box.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      if (!ENQUIRY_API) {
        handoff("Your enquiry is ready to send.");
        return;
      }
      msg.className = "f-msg"; msg.textContent = "Sending…";
      try {
        const r = await fetch(`${ENQUIRY_API}/enquiry`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "Send failed");
        form.reset();
        const old = $("#fhand"); if (old) old.remove();
        msg.className = "f-msg ok";
        msg.textContent = "Your enquiry has been received. We will reply by email.";
      } catch (err) {
        handoff("We could not send that from here. Your enquiry is ready to go by email instead.");
      }
    });
    /* The form starts disabled in HTML. Enable it only after its submit
       handler exists, so an earlier script failure cannot submit to a page. */
    const fields = $("#cfields", form);
    if (fields) fields.disabled = false;
  }
})();

/* ================================================================
   LIVE ANIMATIONS — typing terminal, orbit, CI pipeline
   Appended as a separate IIFE so the core file stays independent.
   ================================================================ */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  if (typeof SNIPPETS === "undefined") return;

  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /* Turn "|kasync def |ffoo" into highlighted HTML, up to `n` visible chars. */
  const CLS = { k: "tk", f: "tf", s: "ts", c: "tc", n: "tn", p: "tp" };
  function render(line, n) {
    let out = "", shown = 0, i = 0, cls = null;
    while (i < line.length) {
      if (line[i] === "|" && CLS[line[i + 1]]) { cls = CLS[line[i + 1]]; i += 2; continue; }
      if (shown >= n) break;
      let ch = line[i];
      out += cls ? `<span class="${cls}">${esc(ch)}</span>` : esc(ch);
      shown++; i++;
    }
    return { html: out, complete: shown >= visibleLength(line) };
  }
  const visibleLength = line => line.replace(/\|[kfscnp]/g, "").length;

  /* ---------------- terminal ---------------- */
  const term = $("#term");
  if (term) {
    const fileEl = $("#termFile"), tagEl = $("#termTag"), bodyEl = $("#termBody"),
          statusEl = $("#termStatus"), elapsedEl = $("#termElapsed"), tabWrap = $("#liveTabs");
    const pipeName = $("#pipeName"), pipeBranch = $("#pipeBranch"), pipeStages = $("#pipeStages");

    let idx = 0, timer = null, running = false;
    if (term.dataset.start) {
      const k = SNIPPETS.findIndex(s => s.id === term.dataset.start);
      if (k > -1) idx = k;
    }

    if (tabWrap) {
      tabWrap.innerHTML = SNIPPETS.map((s, i) =>
        `<button class="ltab${i === idx ? " on" : ""}" data-i="${i}">${s.label}</button>`).join("");
      tabWrap.addEventListener("click", e => {
        const b = e.target.closest(".ltab");
        if (!b || +b.dataset.i === idx) return;
        idx = +b.dataset.i;
        play(true);
      });
    }

    function paintStages(snip, active, passed) {
      pipeStages.innerHTML = snip.pipeline.stages.map((s, i) => `
        <div class="pstage${i < passed ? " pass" : i === active ? " on" : ""}">
          <svg class="tick" viewBox="0 0 24 24"><path d="M5 13l4.5 4.5L19 7"/></svg>
          <span>Stage ${String(i + 1).padStart(2, "0")}</span>
          <b class="pstage-name">${s[0]}</b><p>${i <= active || i < passed ? s[1] : "queued"}</p>
        </div>`).join("");
    }

    function play(manual) {
      clearTimeout(timer);
      const snip = SNIPPETS[idx];
      $$(".ltab", tabWrap).forEach((b, i) => b.classList.toggle("on", i === idx));
      fileEl.textContent = snip.file;
      tagEl.textContent = snip.tag;
      pipeName.textContent = snip.pipeline.name;
      pipeBranch.textContent = snip.pipeline.branch;
      statusEl.className = "term-status";
      statusEl.lastElementChild.textContent = "Running";
      paintStages(snip, -1, 0);

      const total = snip.lines.reduce((a, l) => a + visibleLength(l), 0);
      let li = 0, ci = 0, typed = 0;
      const t0 = performance.now();

      const draw = (caret) => {
        const rows = snip.lines.map((l, i) => {
          const chars = i < li ? visibleLength(l) : i === li ? ci : 0;
          if (i > li) return "";
          const r = render(l, chars);
          const tip = (i === li && caret) ? '<span class="caret"></span>' : "";
          return `<div class="term-line"><b>${i + 1}</b><span>${r.html}${tip}</span></div>`;
        }).join("");
        bodyEl.innerHTML = rows;
      };

      if (REDUCE) {
        li = snip.lines.length; draw(false);
        elapsedEl.textContent = "1.9s";
        statusEl.className = "term-status done";
        statusEl.lastElementChild.textContent = "Passed";
        paintStages(snip, -1, snip.pipeline.stages.length);
        return;
      }

      function step() {
        const len = visibleLength(snip.lines[li] || "");
        if (ci < len) { ci += Math.random() < 0.22 ? 2 : 1; typed++; }
        else {
          li++; ci = 0;
          if (li >= snip.lines.length) { draw(false); return finish(); }
        }
        draw(true);
        elapsedEl.textContent = ((performance.now() - t0) / 1000).toFixed(1) + "s";

        /* pipeline advances in step with typing progress */
        const stages = snip.pipeline.stages.length;
        const active = Math.min(stages - 1, Math.floor((typed / total) * stages));
        const cur = pipeStages.children[active];
        if (cur && !cur.classList.contains("on")) paintStages(snip, active, active);

        const blank = (snip.lines[li] || "").trim() === "";
        timer = setTimeout(step, blank ? 90 : 15 + Math.random() * 34);
      }

      function finish() {
        paintStages(snip, -1, snip.pipeline.stages.length);
        statusEl.className = "term-status done";
        statusEl.lastElementChild.textContent = "Passed";
        if (!manual) timer = setTimeout(() => { idx = (idx + 1) % SNIPPETS.length; play(false); }, 4200);
      }

      running = true;
      timer = setTimeout(step, 380);
    }

    /* only run while on screen — no wasted frames in a background tab */
    const to = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { if (!running) play(false); }
      else { clearTimeout(timer); running = false; }
    }), { threshold: 0.25 });
    to.observe(term);
    addEventListener("visibilitychange", () => {
      if (document.hidden) { clearTimeout(timer); running = false; }
    });
  }

  /* ---------------- orbit ---------------- */
  const orbit = $("#orbit");
  if (orbit && typeof ORBIT !== "undefined") {
    const rings = $$(".orbit-spin", orbit);
    const radii = [50, 50, 50];   // % of each ring's own box
    ORBIT.forEach(([icon, label, ring, deg, accent]) => {
      const host = rings[ring];
      if (!host) return;
      const rad = (deg * Math.PI) / 180;
      const x = 50 + radii[ring] * Math.cos(rad);
      const y = 50 + radii[ring] * Math.sin(rad);
      const el = document.createElement("div");
      el.className = "node" + (accent ? " " + accent : "");
      el.style.left = x + "%";
      el.style.top = y + "%";
      el.innerHTML = `<svg viewBox="0 0 24 24">${(typeof ICONS !== "undefined" && ICONS[icon]) || ""}</svg><em>${label}</em>`;
      host.appendChild(el);
    });
  }
})();

/* ================================================================
   SECTION TRANSITIONS
   ================================================================ */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sections = $$("section.band, section.band-tight, section.hero, section.intro");

  /* ---- seam that draws across the top of each band ---- */
  sections.forEach((sec, i) => {
    if (i === 0 || sec.classList.contains("hero") || sec.classList.contains("intro")) return;
    const seam = document.createElement("div");
    seam.className = "seam";
    sec.prepend(seam);
    if (sec.classList.contains("dark")) {
      const fade = document.createElement("div");
      fade.className = "band-fade top";
      sec.prepend(fade);
    }
  });
  const seamObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); seamObs.unobserve(e.target); }
  }), { threshold: 0.9 });
  $$(".seam").forEach(s => seamObs.observe(s));

  /* ---- gentle parallax on band content ---- */
  if (!REDUCE && matchMedia("(min-width: 820px)").matches) {
    const targets = sections
      .filter(s => !s.classList.contains("hero") && !s.classList.contains("intro"))
      .map(s => ({ sec: s, el: $(":scope > .wrap", s) }))
      .filter(t => t.el);
    targets.forEach(t => t.el.classList.add("par"));

    let ticking = false;
    const apply = () => {
      const vh = innerHeight;
      targets.forEach(({ sec, el }) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        /* -1 above centre, +1 below centre */
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty("--y", (p * -26).toFixed(1) + "px");
      });
      ticking = false;
    };
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  }

  /* ---- left rail section marker ---- */
  const named = sections.filter(s => s.id && s.id !== "top");
  const LABELS = {
    value: "The problem", capabilities: "Capabilities", industries: "Industries",
    why: "Why Windsor Harlow", approach: "Approach", global: "Global", studio: "Studio",
    intro: "Introducing", lead: "Lead", live: "In the work", platform: "Stack", "delivery-model": "Global",
    practices: "Practices", index: "Technical expertise", engagement: "Engagement",
    delivery: "Delivery", work: "Work", contact: "Contact", catalogue: "Catalogue",
    matrix: "Models", platform2: "Stack"
  };
  if (named.length > 3 && !$(".rail")) {
    const rail = document.createElement("nav");
    rail.className = "rail";
    rail.setAttribute("aria-label", "Section navigation");
    rail.innerHTML = named.map(s =>
      `<a href="#${s.id}"><i></i>${LABELS[s.id] || s.id}</a>`).join("");
    document.body.appendChild(rail);

    const links = $$("a", rail);
    const railObs = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
      document.body.classList.toggle("dark-rail", e.target.classList.contains("dark"));
    }), { threshold: 0.4 });
    named.forEach(s => railObs.observe(s));
  }
})();

/* ================================================================
   INTRO — live overlap clock on the globe readout
   ================================================================ */
(function () {
  "use strict";
  const el = document.getElementById("introClock");
  if (!el) return;
  const zones = [
    ["IST", "Asia/Kolkata"], ["GMT", "Europe/London"], ["EST", "America/New_York"],
  ];
  const tick = () => {
    try {
      el.textContent = zones.map(([label, tz]) =>
        `${label} ${new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz
        }).format(new Date())}`).join("  ·  ");
    } catch (_) { el.textContent = "Americas · EMEA · APAC"; }
  };
  tick();
  setInterval(tick, 30000);
})();

/* ================================================================
   SCROLL-DRIVEN SECTION WIPE
   Each band reveals behind a clip that opens as it enters the
   viewport, with its heading block leading the content in.
   ================================================================ */
(function () {
  "use strict";
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!CSS.supports("clip-path", "inset(0% 0 0 0)")) return;

  const bands = $$("section.band, section.band-tight, section.intro")
    .filter(s => !s.classList.contains("hero"));
  bands.forEach(b => b.classList.add("wipe"));

  let ticking = false;
  const frame = () => {
    const vh = innerHeight;
    for (const b of bands) {
      const r = b.getBoundingClientRect();
      if (r.bottom < 0) { b.style.setProperty("--wipe", "0%"); b.style.setProperty("--wipe-o", "1");
                          b.style.setProperty("--wipe-y", "0px"); continue; }
      if (r.top > vh) continue;
      /* 0 when the band's top hits the bottom of the viewport,
         1 once it has travelled 68% of the viewport height upward —
         a longer runway makes the reveal read as deliberate */
      let p = (vh - r.top) / (vh * 0.68);
      p = Math.max(0, Math.min(1, p));
      const eased = 1 - Math.pow(1 - p, 4);
      b.style.setProperty("--wipe", (100 - eased * 100).toFixed(2) + "%");
      b.style.setProperty("--wipe-o", (0.12 + eased * 0.88).toFixed(3));
      b.style.setProperty("--wipe-y", ((1 - eased) * 46).toFixed(1) + "px");
      b.style.setProperty("--wipe-s", (0.985 + eased * 0.015).toFixed(4));
    }
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });
  addEventListener("resize", frame);
  frame();
})();

/* ================================================================
   OVERTURE — the opening sequence
   Runs once per page load (5s), skippable by click, scroll or key.
   ================================================================ */
(function () {
  "use strict";
  const ov = document.getElementById("overture");
  if (!ov) return;

  /* The overture is an arrival, not a transition. Skip it when:
     - reduced motion is requested
     - the visitor deep-linked to a section (/#engagement, /#work, ...)
     - they have already seen it this browsing session
     - they came back via the browser's back/forward cache          */
  const deepLink = location.hash && location.hash.length > 1;

  /* NOTE: there used to be a file:// exemption here that always replayed the
     sequence when the site was opened off disk. It defeated both the deep-link
     and once-per-session gates, so moving from services.html to
     index.html#engagement replayed the whole overture before the section.
     Local now behaves exactly like production; use ?overture to replay. */

  /* ?overture forces it to replay — for reviewing the sequence without
     having to close the browser. ?overture=off suppresses it for a session. */
  const force = /[?&]overture(=|&|$)/.test(location.search)
             && !/[?&]overture=off/.test(location.search);
  const mute  = /[?&]overture=off/.test(location.search);

  /* sessionStorage first, session cookie as a fallback for private modes
     and embedded contexts where storage APIs throw */
  const KEY = "wh_overture";
  function wasSeen() {
    try { if (sessionStorage.getItem(KEY) === "1") return true; } catch (_) {}
    return document.cookie.split("; ").indexOf(KEY + "=1") > -1;
  }
  function markSeen() {
    try { sessionStorage.setItem(KEY, "1"); } catch (_) {}
    try { document.cookie = KEY + "=1; path=/; SameSite=Lax"; } catch (_) {}
  }
  const seen = wasSeen();
  function forget() {
    try { sessionStorage.removeItem(KEY); } catch (_) {}
    try { document.cookie = KEY + "=; path=/; Max-Age=0; SameSite=Lax"; } catch (_) {}
  }

  function dismiss() {
    ov.remove();
    document.body.classList.remove("ov-locked");
    if (deepLink) {
      const t = document.getElementById(location.hash.slice(1));
      if (t) requestAnimationFrame(() => t.scrollIntoView());
    }
  }

  /* Reduced motion is a medical preference, not a styling one — no URL
     parameter may override it. It is checked before anything else. */
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { dismiss(); return; }

  /* How did they get here? A refresh is a deliberate request to see the page
     from the top; a link click from elsewhere on the site is not. The
     Navigation Timing API distinguishes the two, and works identically on a
     live server and over file://, unlike document.referrer. */
  const navEntry = (performance.getEntriesByType &&
                    performance.getEntriesByType("navigation")[0]) || null;
  const navType = navEntry ? navEntry.type
                : (performance.navigation && performance.navigation.type === 1
                   ? "reload" : "navigate");
  const reloaded = navType === "reload";
  const restored = navType === "back_forward";

  /* A deep link is a destination, not an arrival. Someone clicking
     "Engagement" from another page asked for that section — never make them
     sit through the opening first. This outranks everything below, including
     a refresh: reloading /#engagement should leave you at #engagement. */
  if (deepLink) { markSeen(); dismiss(); return; }

  if (mute) { markSeen(); dismiss(); return; }

  if (force) {
    forget();                       /* ?overture — always replay */
  } else if (restored) {
    dismiss();                      /* back/forward is a return, not an arrival */
    return;
  } else if (!reloaded && seen) {
    dismiss();                      /* already seen it moving around the site */
    return;
  }
  /* Everything else plays: a first arrival, and every refresh of the home page. */
  if (!force) markSeen();

  const body = document.body;
  body.classList.add("ov-locked");
  scrollTo(0, 0);

  /* Geographic labels accompany the map animation; they are not client counts. */
  const num = document.getElementById("ovNum");
  if (num) {
    const names = [...ov.querySelectorAll(".wm-mark .wm-label")].map(t => t.textContent);
    const seq = ["Connecting", ...names.sort(() => Math.random() - 0.5).slice(0, 5), "Working globally"];
    let i = 0;
    const step = setInterval(() => {
      i++;
      if (i >= seq.length) { clearInterval(step); return; }
      num.textContent = seq[i];
    }, 700);
  }

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    ov.classList.add("done");
    body.classList.remove("ov-locked");
    /* release the hero's own load sequence as the curtain lifts */
    document.querySelectorAll(".hero .seq, .hero .h-line span").forEach(el => {
      el.style.animationPlayState = "running";
    });
    setTimeout(() => ov.remove(), 1500);
  }

  const timer = setTimeout(close, 5000);
  const skip = () => { clearTimeout(timer); close(); };

  ov.addEventListener("click", skip);
  addEventListener("keydown", e => {
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
  }, { once: true });
  addEventListener("wheel", skip, { once: true, passive: true });
  addEventListener("touchstart", skip, { once: true, passive: true });
  addEventListener("pageshow", e => { if (e.persisted) skip(); });
})();



/* ============================================================
   MOTION 2.0 — stagger children in reading order.
   Runs after the main script; only sets a custom property, so it
   cannot break existing behaviour.
   ============================================================ */
(function(){
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var STAGGER = ".pillars,.spears,.steps,.prac,.idx-grid,.eng,.work-grid";
  function stamp(root){
    (root || document).querySelectorAll(STAGGER).forEach(function(grid){
      var kids = grid.children, step = kids.length > 8 ? 45 : 75;
      for (var i = 0; i < kids.length; i++){
        kids[i].style.setProperty("--sd", Math.min(i * step, 420) + "ms");
      }
    });
  }
  stamp();
  // grids that get re-rendered (capability index, work filters) need re-stamping
  var host = document.getElementById("idx-grid") || document.querySelector(".idx-grid");
  if (window.MutationObserver && host){
    new MutationObserver(function(){ stamp(host.parentNode); })
      .observe(host, {childList:true});
  }
})();
