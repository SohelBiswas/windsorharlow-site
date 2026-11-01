/* =====================================================================
   Windsor Harlow — "Ask the sample handbook" demo (AI & ML page)

   The retrieval half of a grounded AI assistant, running entirely in the
   browser: tokenise, expand synonyms, rank passages with BM25, check that
   the best passage actually covers the question, then answer by quoting
   the source, or decline. No network calls; nothing typed leaves the page.
   ===================================================================== */
(function (root) {
  "use strict";

  var DOCS = [
    { id: "delivery-policy.pdf", title: "Delivery promise", passages: [
      "Standard delivery arrives within 3 working days of dispatch for addresses in metro areas, and within 5 working days for all other areas.",
      "An order counts as delayed when it has not been delivered by the end of the promised delivery day. Delayed orders are flagged automatically in the operations dashboard every morning at 9:00.",
      "Express delivery arrives the next working day if the order is placed before 2:00 pm. Orders placed after 2:00 pm are dispatched the following working day."
    ]},
    { id: "returns-policy.pdf", title: "Returns and refunds", passages: [
      "Customers can return unused items within 30 days of delivery. Return shipping is free for orders over ₹1,500.",
      "Refunds are issued to the original payment method within 5 working days of the returned item reaching our warehouse.",
      "Perishable goods, gift cards and personalised items cannot be returned unless they arrive damaged."
    ]},
    { id: "claims-guide.pdf", title: "Damaged parcels", passages: [
      "Damaged parcels must be reported within 48 hours of delivery. Customers should keep the packaging and upload at least two photos with the claim.",
      "Claims under ₹5,000 are approved by the support team the same day. Claims above ₹5,000 go to the claims manager and are decided within 3 working days."
    ]},
    { id: "customer-help.md", title: "Changing a delivery", passages: [
      "Customers can change the delivery address free of charge until the parcel is out for delivery. After that, the parcel must be redirected through the courier, which costs ₹99.",
      "Customers can choose a safe place or a neighbour for delivery on the tracking page. Signature-required parcels cannot be left in a safe place."
    ]},
    { id: "support-hours.md", title: "Support hours", passages: [
      "Customer support is available Monday to Saturday, 8:00 am to 8:00 pm IST, by chat and phone. Email requests are answered within one working day.",
      "Support is closed on national holidays. Urgent claims raised on a holiday are handled first on the next working day."
    ]},
    { id: "privacy-notes.md", title: "Data retention", passages: [
      "Delivery photos and signatures are kept for 90 days and then deleted. Order records are kept for 7 years for tax purposes.",
      "Support staff can see a customer's name, address and order history, but not their payment card details."
    ]}
  ];

  var STOP = ("a an the and or but if of to in on at by for from with about as into is are was were be been being do does did " +
    "can could should would will shall may might must i me my we our us you your it its they them their this that these those " +
    "what when where which who whom why how long much many take takes get gets got have has had there here any some " +
    "please tell know need want im ive dont doesnt cant isnt am also just than then so very").split(" ");
  var STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = 1; });

  function stem(w) {
    if (w.length > 4 && /ery$/.test(w)) return w.slice(0, -1);              /* delivery -> deliver */
    var sufs = ["ations", "ation", "ing", "ied", "ies", "ed", "es", "ly", "s"];
    for (var i = 0; i < sufs.length; i++) {
      var s = sufs[i];
      if (w.length - s.length >= 3 && w.slice(-s.length) === s) {
        if (s === "s" && /ss$/.test(w)) break;
        if (s === "es" && !/(ss|sh|ch|x|z)es$/.test(w)) { w = w.slice(0, -1); break; }
        w = w.slice(0, -s.length);
        if (s === "ies" || s === "ied") w += "y";
        break;
      }
    }
    if (w.length > 4 && /e$/.test(w)) w = w.slice(0, -1);                   /* damage/damaged -> damag */
    return w;
  }

  function words(text) {
    return (text.toLowerCase().replace(/[’']/g, "").match(/[a-z0-9₹,.:]+/g) || [])
      .map(function (w) { return w.replace(/[,.:]+$/, ""); })
      .filter(function (w) { return w && !STOPSET[w]; });
  }
  function tokens(text) { return words(text).map(stem); }

  /* query-side synonyms: what people type -> how the documents say it */
  var SYN = {
    late: ["delay"], delay: ["late"], overdu: ["delay"],
    broken: ["damag"], broke: ["damag"], smash: ["damag"], crack: ["damag"], damag: ["broken"],
    money: ["refund"], reimburs: ["refund"], refund: ["money"], back: ["return"], send: ["return"],
    hour: ["available", "monday", "saturday"], open: ["available", "closed"], time: ["available"], timing: ["available"],
    contact: ["support", "chat", "phone"], call: ["phone"], reach: ["support"], help: ["support"],
    pictur: ["photo"], imag: ["photo"], pic: ["photo"],
    keep: ["kept"], stor: ["kept"], retain: ["kept"], retention: ["kept"], delet: ["kept"],
    card: ["payment"], pay: ["payment"], fast: ["express"], quick: ["express"], urgent: ["express"], tomorrow: ["next"],
    mov: ["chang", "redirect"], move: ["chang", "redirect"], updat: ["chang"], edit: ["chang"], modify: ["chang"], wrong: ["chang"],
    shipp: ["deliver"], ship: ["deliver"], leav: ["left"], neighbor: ["neighbour"], big: ["abov"], larg: ["abov"], small: ["under"], cost: ["charg", "free"], fee: ["charg", "cost"], arriv: ["deliver"], come: ["arriv", "deliver"],
    claim: ["claim"], report: ["report", "claim"], complain: ["claim", "report"],
    staff: ["staff", "support"], see: ["see"], data: ["detail", "record"], privacy: ["detail", "record"]
  };

  /* index */
  var P = [];
  DOCS.forEach(function (d, di) {
    d.passages.forEach(function (text, pi) {
      var t = tokens(text), tf = {};
      t.forEach(function (x) { tf[x] = (tf[x] || 0) + 1; });
      P.push({ doc: d, ref: d.id + " §" + (pi + 1), text: text, tf: tf, len: t.length });
    });
  });
  var N = P.length, avg = P.reduce(function (a, p) { return a + p.len; }, 0) / N, DF = {};
  P.forEach(function (p) { Object.keys(p.tf).forEach(function (x) { DF[x] = (DF[x] || 0) + 1; }); });
  function idf(x) { var n = DF[x] || 0; return Math.log(1 + (N - n + 0.5) / (n + 0.5)); }

  function bm25(p, term, weight) {
    var f = p.tf[term] || 0;
    if (!f) return 0;
    var k = 1.4, b = 0.7;
    return weight * idf(term) * (f * (k + 1)) / (f + k * (1 - b + b * p.len / avg));
  }

  function ask(question) {
    var q = tokens(question).filter(function (x, i, a) { return a.indexOf(x) === i; });
    if (!q.length) return { empty: true, terms: [] };
    /* "how long / how soon" questions are asking for a time limit: favour passages that state one */
    var timeQ = /\b(how long|how soon|how quickly|how many days|how many hours|when will|by when|deadline)\b/i.test(question);
    var ranked = P.map(function (p) {
      var score = 0, covered = 0, hits = [];
      q.forEach(function (term) {
        var alts = [term].concat(SYN[term] || []);
        var best = 0, hitTerm = null;
        alts.forEach(function (a, i) {
          var s = bm25(p, a, i === 0 ? 1 : 0.8);
          if (s > best) { best = s; hitTerm = a; }
        });
        if (best > 0) { covered++; hits.push(hitTerm); }
        score += best;
      });
      if (timeQ && covered) score += bm25(p, "within", 0.9);
      return { p: p, score: score, coverage: covered / q.length, hits: hits };
    }).sort(function (a, b) { return b.score - a.score; });

    var top = ranked[0];
    var ok = top.score >= 1.0 && top.coverage >= 0.6;
    var vague = !ok && top.coverage >= 0.6;
    var answer = [];
    if (ok) {
      answer.push({ n: 1, sentence: bestSentence(top) });
      var second = ranked[1];
      if (second && second.p.doc === top.p.doc && second.coverage >= 0.6 && second.score >= top.score * 0.8) answer.push({ n: 2, sentence: bestSentence(second) });
    }
    var shown = ranked.filter(function (r) { return r.coverage > 0; }).slice(0, 3);
    return { ok: ok, vague: vague, terms: q, ranked: shown.length ? shown : ranked.slice(0, 1), answer: answer };
  }

  function bestSentence(r) {
    var sents = r.p.text.match(/[^.]+(\.\d+[^.]*)*\.?/g) || [r.p.text];
    sents = sents.map(function (s) { return s.trim(); }).filter(Boolean);
    var scored = sents.map(function (s) {
      var t = tokens(s), sc = 0;
      r.hits.forEach(function (h) { if (t.indexOf(h) > -1) sc++; });
      return { s: s, sc: sc };
    });
    var top = Math.max.apply(null, scored.map(function (x) { return x.sc; }));
    /* ties: keep both sentences, so "big claims" gets the under/above rule in full */
    return scored.filter(function (x) { return x.sc === top; }).slice(0, 2).map(function (x) { return x.s; }).join(" ");
  }

  var api = { ask: ask, DOCS: DOCS, tokens: tokens, stem: stem, count: P.length };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  /* ---------------- UI ---------------- */
  var doc = root.document;
  var form = doc.getElementById("aiForm");
  if (!form) return;
  var input = doc.getElementById("aiQ");
  var steps = doc.querySelectorAll("#aiSteps li");
  var out = doc.getElementById("aiOut");
  var reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mark(text, hits) {
    return esc(text).replace(/[A-Za-z0-9₹]+/g, function (w) {
      return hits.indexOf(stem(w.toLowerCase())) > -1 ? "<mark>" + w + "</mark>" : w;
    });
  }

  function render(q, res) {
    if (res.empty) {
      out.innerHTML = '<div class="demo-answer none"><span class="mono">No question yet</span><p>Ask a full question, for example “How long do refunds take?”</p></div>';
      return;
    }
    var max = res.ranked[0].score || 1;
    var used = res.ok ? res.answer.length : 0;
    var ans = res.ok
      ? '<div class="demo-answer"><span class="mono">Answer · grounded in ' + used + (used === 1 ? " source" : " sources") + '</span><p>' +
        res.answer.map(function (a) { return esc(a.sentence) + ' <b class="cite">[' + a.n + "]</b>"; }).join(" ") + "</p></div>"
      : res.vague
        ? '<div class="demo-answer none"><span class="mono">Too broad to answer</span><p>That matches several passages equally, so I won’t pick one. Try a more specific question.</p></div>'
        : '<div class="demo-answer none"><span class="mono">Not in the documents</span><p>I can’t find that in the documents I have, so I won’t guess. A good assistant hands this to a person.</p></div>';
    var list = res.ranked.filter(function (r) { return r.coverage > 0; });
    if (!list.length) {
      out.innerHTML = ans + '<span class="mono src-h">Passages it found</span><p class="demo-empty">None of the 14 passages share a meaningful word with that question.</p>';
      return;
    }
    var src = list.map(function (r, i) {
      var pct = Math.max(4, Math.round(r.score / max * 100));
      var isUsed = res.ok && i < used;
      return '<li class="' + (isUsed ? "used" : "") + '"><div class="src-top"><span class="doc">' + esc(r.p.ref) + "</span>" +
        '<span class="rel">' + (isUsed ? "[" + (i + 1) + "] used" : Math.round(r.coverage * 100) + "% match") + "</span></div>" +
        '<div class="bar"><i style="width:' + pct + '%"></i></div><p>' + mark(r.p.text, r.hits) + "</p></li>";
    }).join("");
    out.innerHTML = ans + '<span class="mono src-h">Passages it found</span><ol class="demo-sources">' + src + "</ol>";
  }

  function run(q, instant) {
    timers.forEach(clearTimeout); timers = [];
    var res = ask(q);
    steps.forEach(function (s) { s.classList.remove("on", "done"); });
    if (instant || reduce) {
      steps.forEach(function (s) { s.classList.add("done"); });
      render(q, res); return;
    }
    out.classList.add("busy");
    steps.forEach(function (s, i) {
      timers.push(setTimeout(function () { s.classList.add("on"); }, i * 260));
      timers.push(setTimeout(function () { s.classList.remove("on"); s.classList.add("done"); }, i * 260 + 240));
    });
    timers.push(setTimeout(function () { render(q, res); out.classList.remove("busy"); }, steps.length * 260 + 60));
  }

  form.addEventListener("submit", function (e) { e.preventDefault(); run(input.value.trim(), false); });
  doc.querySelectorAll("[data-q]").forEach(function (b) {
    b.addEventListener("click", function () { input.value = b.getAttribute("data-q"); run(input.value, false); });
  });
  run(input.value || "How long do refunds take?", true);
})(typeof window !== "undefined" ? window : this);
