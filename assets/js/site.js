/* =====================================================================
   Windsor Harlow — site behaviour
   2. Navigation: floating nav + mobile drawer
   3. Scroll reveals
   4. Work filters
   5. Enquiry form (composes an email; no backend)
   ===================================================================== */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");
  doc.classList.add("js");
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var navEntry = (performance.getEntriesByType && performance.getEntriesByType("navigation")[0]) || null;
  var navType = navEntry ? navEntry.type : "navigate";

  /* ---------- 0. START AT THE TOP ----------
     A new page always opens at its beginning. Some hosts and preview frames
     carry the previous page's scroll position over; this undoes that.
     Back/forward and #anchor links keep their normal behaviour. */
  (function toTop() {
    if (location.hash) return;
    if (navType === "back_forward") return;
    try { history.scrollRestoration = "manual"; } catch (e) {}
    var go = function () {
      try { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); } catch (e) { window.scrollTo(0, 0); }
      try { document.documentElement.scrollIntoView({ block: "start", behavior: "instant" }); } catch (e) {}
    };
    go();
    var touched = false;
    ["wheel", "touchstart", "keydown"].forEach(function (t) { addEventListener(t, function () { touched = true; }, { once: true, passive: true }); });
    addEventListener("load", function () { if (!touched) go(); });
    requestAnimationFrame(function () { if (!touched) go(); });
  })();

  /* ---------- 2. NAVIGATION ---------- */
  var float = document.getElementById("floatnav");
  var hero = document.querySelector(".sky");
  if (float && hero) {
    var onScroll = function () {
      var trigger = hero.offsetHeight - 120;
      float.classList.toggle("show", window.scrollY > trigger);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  var drawer = document.getElementById("drawer");
  var lastFocus = null;
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle("drawer-open", open);
    document.querySelectorAll("[data-menu]").forEach(function (b) { b.setAttribute("aria-expanded", open ? "true" : "false"); });
    if (open) {
      lastFocus = document.activeElement;
      var first = drawer.querySelector("a,button");
      first && first.focus();
    } else if (lastFocus) {
      lastFocus.focus();
    }
  }
  document.querySelectorAll("[data-menu]").forEach(function (b) {
    b.addEventListener("click", function () { setDrawer(true); });
  });
  if (drawer) {
    drawer.querySelectorAll("[data-close], nav a").forEach(function (el) {
      el.addEventListener("click", function () { setDrawer(false); });
    });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setDrawer(false);
      if (e.key === "Tab") {
        var f = drawer.querySelectorAll("a,button");
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
  }

  /* ---------- 3. SCROLL REVEALS ---------- */
  var revealables = document.querySelectorAll(".rv, .process");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 3a. ILLUSTRATIONS: animate only while on screen ---------- */
  var arts = document.querySelectorAll(".stack-art");
  if ("IntersectionObserver" in window) {
    var artIO = new IntersectionObserver(function (es) {
      es.forEach(function (en) { en.target.classList.toggle("live", en.isIntersecting); });
    }, { threshold: 0.05 });
    arts.forEach(function (a) { artIO.observe(a); });
  } else {
    arts.forEach(function (a) { a.classList.add("live"); });
  }

  /* ---------- 3b. PROCESS LINE — fills left to right as you scroll ---------- */
  var procs = document.querySelectorAll(".process");
  if (procs.length) {
    var procTick = function () {
      var vh = window.innerHeight, narrow = window.innerWidth <= 980;
      procs.forEach(function (p) {
        var r = p.getBoundingClientRect();
        var start = vh * 0.92, end = vh * 0.3;
        var prog = reduce ? 1 : Math.max(0, Math.min(1, (start - r.top) / (start - end)));
        p.style.setProperty("--pp", prog.toFixed(3));
        var steps = p.querySelectorAll(".step");
        steps.forEach(function (s, i) {
          var lit = narrow ? s.getBoundingClientRect().top < vh * 0.78 : prog >= (steps.length > 1 ? i / (steps.length - 1) : 1) - 0.01;
          s.classList.toggle("lit", reduce || lit);
        });
      });
    };
    addEventListener("scroll", procTick, { passive: true });
    addEventListener("resize", procTick);
    procTick();
  }

  /* ---------- 3c. CARD REVEALS ON TOUCH ----------
     Work cards reveal their details on hover. Touch screens have no hover,
     so the first tap reveals and the second tap opens the project. */
  var canHover = window.matchMedia && matchMedia("(hover: hover)").matches;
  if (!canHover) {
    document.addEventListener("click", function (e) {
      var c = e.target.closest && e.target.closest("[data-reveal]");
      if (!c || c.classList.contains("open")) return;
      e.preventDefault();
      document.querySelectorAll("[data-reveal].open").forEach(function (x) { x.classList.remove("open"); });
      c.classList.add("open");
    }, true);
  }

  /* ---------- 3d. BLOG POSTS: reading progress + contents highlight ---------- */
  var post = document.getElementById("post");
  var rp = document.querySelector(".read-progress");
  if (post && rp) {
    var tocLinks = document.querySelectorAll(".post-toc a");
    var heads = Array.prototype.map.call(tocLinks, function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
    var postTick = function () {
      var r = post.getBoundingClientRect(), vh = window.innerHeight;
      var prog = Math.max(0, Math.min(1, (vh * 0.3 - r.top) / Math.max(1, r.height - vh * 0.5)));
      rp.style.setProperty("--rp", prog.toFixed(3));
      var active = -1;
      heads.forEach(function (h, i) { if (h && h.getBoundingClientRect().top < vh * 0.3) active = i; });
      tocLinks.forEach(function (a, i) { a.classList.toggle("on", i === active); });
    };
    addEventListener("scroll", postTick, { passive: true });
    addEventListener("resize", postTick);
    postTick();
  }

  /* ---------- 3e. CURSOR GLOW on dark panels ---------- */
  if (canHover && !reduce) {
    document.querySelectorAll(".band-dark, .demo, .feature, .fcta, .foot, .drip-in, .fc-back").forEach(function (el) {
      el.setAttribute("data-glow", "");
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      var g = document.createElement("span");
      g.className = "glow"; g.setAttribute("aria-hidden", "true");
      el.appendChild(g);
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--gx", (e.clientX - r.left) + "px");
        el.style.setProperty("--gy", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- 4. WORK FILTERS ---------- */
  var filters = document.querySelector("[data-filters]");
  if (filters) {
    var items = document.querySelectorAll("[data-kind]");
    var status = document.getElementById("filterStatus");
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var f = b.getAttribute("data-filter");
      filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var shown = 0;
      items.forEach(function (it) {
        var ok = f === "all" || it.getAttribute("data-kind") === f;
        it.classList.toggle("hidden", !ok);
        if (ok) shown++;
      });
      if (status) status.textContent = shown + (shown === 1 ? " project" : " projects") + " shown";
    });
  }

  /* ---------- 5. ENQUIRY FORM ---------- */
  var form = document.getElementById("enquiry");
  if (form) {
    var MAIL = form.getAttribute("data-mail") || "business@windsorharlow.com";
    var err = document.getElementById("formError");
    var hand = document.getElementById("handoff");
    var pre = document.getElementById("handoffText");
    var mailLink = document.getElementById("handoffMail");
    var copyBtn = document.getElementById("handoffCopy");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      if ((d.get("website") || "").toString().trim()) return; /* honeypot */
      var name = (d.get("name") || "").toString().trim();
      var email = (d.get("email") || "").toString().trim();
      var detail = (d.get("detail") || "").toString().trim();
      if (!name || !email || !detail) { err.textContent = "Please add your name, email and a few lines about the project."; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = "That email address doesn't look right."; return; }
      err.textContent = "";
      var service = d.getAll("service").join(", ") || "Not sure yet";
      var lines = [
        "Name: " + name,
        "Email: " + email,
        "Company: " + ((d.get("company") || "").toString().trim() || "—"),
        "Interested in: " + service,
        "Timeline: " + (d.get("timeline") || "—"),
        "",
        detail
      ];
      var text = lines.join("\n");
      var subject = "New enquiry — " + service + " — " + name;
      var href = "mailto:" + MAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      pre.textContent = "To: " + MAIL + "\nSubject: " + subject + "\n\n" + text;
      mailLink.setAttribute("href", href);
      hand.classList.add("show");
      hand.setAttribute("tabindex", "-1");
      hand.focus();
      window.location.href = href;
    });
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var t = pre.textContent;
        var done = function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy message"; }, 2000); };
        if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {});
        else { var r = document.createRange(); r.selectNodeContents(pre); var s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); done(); }
      });
    }
  }

  /* year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
