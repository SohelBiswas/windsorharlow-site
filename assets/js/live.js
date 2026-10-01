/* Windsor Harlow — live animation content: code snippets and technical icons. */

/* Each snippet: what gets typed into the terminal, plus the pipeline run
   that plays underneath it. Tokens are pre-marked so highlighting needs no
   parser: |k keyword, |f function, |s string, |c comment, |n number, |p punctuation. */
const SNIPPETS = [
  {
    id: "web",
    label: "Java / Spring",
    file: "src/main/java/OrderService.java",
    tag: "Spring Boot",
    lines: [
      "|c// idempotent by design — retries must not double-charge",
      "|p@|fService",
      "|p@|fRequiredArgsConstructor",
      "|kpublic class |fOrderService |p{",
      "",
      "    |p@|fTransactional",
      "    |kpublic |fOrder |fsubmit|p(|fOrderRequest |preq, |fString |pidempotencyKey) {",
      "        |kreturn |frepo|p.|ffindByKey|p(idempotencyKey)",
      "            .|forElseGet|p(() -> {",
      "                |fOrder |po = |fOrder|p.|ffrom|p(req, idempotencyKey);",
      "                |frepo|p.|fsave|p(o);",
      "                |fevents|p.|fpublish|p(|knew |fOrderSubmitted|p(o.|fgetId|p()));",
      "                |kreturn |po;",
      "            |p});",
      "    |p}",
      "|p}",
    ],
    pipeline: {
      name: "maven-verify",
      branch: "feat/idempotent-submit",
      stages: [
        ["Compile", "JDK 21"],
        ["Unit", "412 passed"],
        ["Testcontainers", "pg + kafka"],
        ["Contract", "Pact · 9 verified"],
        ["Deploy", "EKS · canary"],
      ],
    },
  },
  {
    id: "ai",
    label: "AI / RAG",
    file: "retrieval/hybrid_search.py",
    tag: "Python",
    lines: [
      "|c# hybrid retrieval — dense + BM25, then re-rank",
      "|kasync def |fretrieve|p(|pquery: |fstr|p, k: |fint = |n12|p) -> |flist|p[|fPassage|p]:",
      "    dense = |kawait |findex|p.|fsearch|p(|fembed|p(query), k=k * |n4|p)",
      "    sparse = |kawait |fbm25|p.|fsearch|p(query, k=k * |n4|p)",
      "",
      "    fused = |frrf_fuse|p(dense, sparse, k=|n60|p)",
      "    ranked = |kawait |freranker|p.|fscore|p(query, fused)|p[:k|p]",
      "",
      "|c    # refuse rather than invent when retrieval is thin",
      "    |kif |franked|p[|n0|p].score < |fSETTINGS|p.floor:",
      "        |kraise |fInsufficientContext|p(query)",
      "    |kreturn |franked",
    ],
    pipeline: {
      name: "eval-harness",
      branch: "feat/rerank-v2",
      stages: [
        ["Lint", "ruff · 0 issues"],
        ["Unit", "184 passed"],
        ["Retrieval", "recall@12 0.91"],
        ["Eval gate", "faithfulness 0.94"],
        ["Deploy", "vLLM · canary 10%"],
      ],
    },
  },
  {
    id: "mobile",
    label: "Kotlin",
    file: "sync/OutboxWorker.kt",
    tag: "Android",
    lines: [
      "|c// survives process death — the queue is on disk, not in memory",
      "|kclass |fOutboxWorker|p(ctx: |fContext|p, params: |fWorkerParameters|p) :",
      "    |fCoroutineWorker|p(ctx, params) {",
      "",
      "    |koverride suspend fun |fdoWork|p(): |fResult |p= |fwithContext|p(|fDispatchers|p.|fIO|p) {",
      "        |kval |ppending = |foutbox|p.|fpending|p(limit = |n50|p)",
      "",
      "        pending.|fforEach |p{ op ->",
      "            |kwhen |p(|kval |pr = |fapi|p.|fpush|p(op)) {",
      "                |kis |fOk    |p-> |foutbox|p.|fack|p(op.id)",
      "                |kis |fRetry |p-> |kreturn|p@withContext |fResult|p.|fretry|p()",
      "                |kis |fFatal |p-> |foutbox|p.|fdead|p(op.id, r.reason)",
      "            |p}",
      "        |p}",
      "        |fResult|p.|fsuccess|p()",
      "    |p}",
      "|p}",
    ],
    pipeline: {
      name: "gradle-check",
      branch: "feat/offline-outbox",
      stages: [
        ["Detekt", "0 violations"],
        ["Unit", "268 passed"],
        ["Instrumented", "API 29–35"],
        ["Baseline profile", "startup −18%"],
        ["Bundle", "Play internal"],
      ],
    },
  },
  {
    id: "frontend",
    label: "TypeScript",
    file: "app/orders/useOrders.ts",
    tag: "React",
    lines: [
      "|c// typed end to end — the API contract is the source of truth",
      "|kexport function |fuseOrders|p(status: |fOrderStatus|p) {",
      "  |kconst |p{ data, error, isLoading } = |fuseQuery|p({",
      "    |fqueryKey|p: [|s'orders'|p, status],",
      "    |fqueryFn|p: () => |fapi|p.|forders|p.|flist|p({ status }),",
      "    |fstaleTime|p: |n30_000|p,",
      "    |fretry|p: (count, err) => |ferr|p.status !== |n404 |p&& count < |n3|p,",
      "  |p});",
      "",
      "  |kreturn |p{",
      "    |forders|p: data ?? |fEMPTY|p,",
      "    |fisEmpty|p: !isLoading && !data?.length,",
      "    error,",
      "  |p};",
      "|p}",
    ],
    pipeline: {
      name: "vercel-ci",
      branch: "feat/orders-table",
      stages: [
        ["Typecheck", "tsc · strict"],
        ["Unit", "331 passed"],
        ["a11y", "axe · 0 serious"],
        ["Lighthouse", "LCP 1.2s"],
        ["Preview", "deployed"],
      ],
    },
  },
  {
    id: "cloud",
    label: "Terraform",
    file: "infra/modules/eks/main.tf",
    tag: "HCL",
    lines: [
      "|c# multi-AZ node group, spot for stateless workloads",
      "|kresource |s\"aws_eks_node_group\" |s\"workers\" |p{",
      "  cluster_name  = |faws_eks_cluster|p.|fmain|p.|fname",
      "  subnet_ids    = |fmodule|p.|fvpc|p.|fprivate_subnets",
      "  capacity_type = |s\"SPOT\"",
      "",
      "  |kscaling_config |p{",
      "    desired_size = |n3",
      "    min_size     = |n3",
      "    max_size     = |n24",
      "  |p}",
      "",
      "  |ktags = |flocal|p.|fcost_tags |c# chargeback from day one",
      "|p}",
    ],
    pipeline: {
      name: "terraform-apply",
      branch: "main",
      stages: [
        ["Fmt", "clean"],
        ["Validate", "12 modules"],
        ["Policy", "tfsec · 0 high"],
        ["Plan", "+7 ~2 -0"],
        ["Apply", "eu-west-1"],
      ],
    },
  },
  {
    id: "go",
    label: "Go",
    file: "internal/worker/consumer.go",
    tag: "Go",
    lines: [
      "|c// at-least-once delivery, bounded concurrency, clean shutdown",
      "|kfunc |p(w *|fWorker|p) |fRun|p(ctx |fcontext|p.|fContext|p) |kerror |p{",
      "    sem := |kmake|p(|kchan struct|p{}, w.|fmaxInflight|p)",
      "",
      "    |kfor |pmsg := |krange |pw.|fconsumer|p.|fMessages|p(ctx) {",
      "        sem <- |kstruct|p{}{}",
      "        |kgo func|p(m *|fMessage|p) {",
      "            |kdefer func|p() { <-sem }()",
      "            |kif |perr := w.|fhandle|p(ctx, m); err != |knil |p{",
      "                w.|fdlq|p.|fPublish|p(ctx, m, err)",
      "                |kreturn",
      "            |p}",
      "            m.|fAck|p()",
      "        |p}(msg)",
      "    |p}",
      "    |kreturn |pctx.|fErr|p()",
      "|p}",
    ],
    pipeline: {
      name: "go-test",
      branch: "feat/bounded-consumer",
      stages: [
        ["Vet", "clean"],
        ["Race", "-race · 0 found"],
        ["Coverage", "88.4%"],
        ["Load", "k6 · p95 42ms"],
        ["Ship", "ghcr.io"],
      ],
    },
  },
  {
    id: "salesforce",
    label: "Apex",
    file: "classes/OrderSyncBatch.cls",
    tag: "Apex",
    lines: [
      "|c// bulk-safe: one query, one DML, governor-limit tested",
      "|kpublic with sharing class |fOrderSyncBatch |kimplements |fDatabase|p.|fBatchable|p<|fSObject|p> {",
      "",
      "    |kpublic void |fexecute|p(|fDatabase|p.|fBatchableContext |pctx, |fList|p<|fOrder|p> scope) {",
      "        |fMap|p<|fId|p, |fOrder|p> pending = |knew |fMap|p<|fId|p, |fOrder|p>();",
      "",
      "        |kfor |p(|fOrder |po : scope) {",
      "            |kif |p(o.|fStatus__c |p== |s'AWAITING_SYNC'|p) pending.|fput|p(o.|fId|p, o);",
      "        |p}",
      "",
      "        |fErpGateway|p.|fpush|p(pending.|fvalues|p()); |c// idempotent, retries",
      "        |fDatabase|p.|fupdate|p(pending.|fvalues|p(), |kfalse|p);",
      "    |p}",
      "|p}",
    ],
    pipeline: {
      name: "sfdx-deploy",
      branch: "release/24.3",
      stages: [
        ["Scan", "PMD · 0 blocker"],
        ["Deploy", "scratch org"],
        ["Apex tests", "97% coverage"],
        ["Bulk test", "10k records"],
        ["Promote", "UAT sandbox"],
      ],
    },
  },
];

/* Generic technical iconography — stroke-only, drawn to the same 24px grid. */
const ICONS = {
  cloud: '<path d="M6.5 18h11a4 4 0 0 0 .4-8A6 6 0 0 0 6.2 11a3.5 3.5 0 0 0 .3 7Z"/>',
  container: '<rect x="3" y="9" width="5" height="5"/><rect x="9.5" y="9" width="5" height="5"/><rect x="9.5" y="3" width="5" height="5"/><path d="M3 16.5h13a5 5 0 0 0 5-4"/>',
  k8s: '<path d="M12 2.6 20 7v10l-8 4.4L4 17V7Z"/><circle cx="12" cy="12" r="3"/><path d="M12 4.5V9M18 8.6l-3.6 2M18 15.4l-3.6-2M12 19.5V15M6 15.4l3.6-2M6 8.6l3.6 2"/>',
  neural: '<circle cx="4.5" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><circle cx="19.5" cy="12" r="2"/><path d="M6.3 11 10.2 7M6.3 13l3.9 4M13.8 7l3.9 4M13.8 17l3.9-4"/>',
  db: '<ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v13c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-13M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  git: '<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="9" r="2.4"/><path d="M6 8.4v7.2M8.4 6h5.2a2.4 2.4 0 0 1 2.4 2.4v.6"/><path d="M15.6 11.2A6 6 0 0 1 9 17"/>',
  terminal: '<rect x="2.5" y="4" width="19" height="16"/><path d="M6.5 9.5 9.5 12l-3 2.5M12.5 15h5"/>',
  shield: '<path d="M12 2.7 20 6v6c0 4.6-3.2 7.9-8 9.3C7.2 19.9 4 16.6 4 12V6Z"/><path d="M8.8 12.2 11 14.4l4.2-4.4"/>',
  cpu: '<rect x="7" y="7" width="10" height="10"/><rect x="10.5" y="10.5" width="3" height="3"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  cloudMesh: '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4v17.2M3.4 12h17.2M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>',
  layers: '<path d="M12 2.8 21 8l-9 5.2L3 8Z"/><path d="M3 12.3 12 17.5l9-5.2M3 16.4 12 21.6l9-5.2"/>',
  mobile: '<rect x="6.5" y="2.5" width="11" height="19" rx="1.6"/><path d="M10.6 5.6h2.8M12 18.2h.01"/>',
};

/* Ring layout: [icon, label, ringIndex, degrees, accentClass] */
const ORBIT = [
  ["cloud", "Cloud", 0, -90, "key"],
  ["k8s", "K8s", 0, -30, ""],
  ["container", "Docker", 0, 30, ""],
  ["shield", "Security", 0, 90, ""],
  ["git", "GitOps", 0, 150, ""],
  ["terminal", "CI/CD", 0, 210, ""],

  ["neural", "LLM", 1, -90, "lead"],
  ["db", "Vector DB", 1, -10, "key"],
  ["cpu", "Inference", 1, 70, ""],
  ["layers", "Salesforce", 1, 150, "lead"],
  ["mobile", "Mobile", 1, 215, ""],

  ["cloudMesh", "Mesh", 2, -60, ""],
  ["db", "Kafka", 2, 60, "key"],
  ["terminal", "APIs", 2, 180, ""],
];


/* Practice glyphs — drawn to the same 48px grid, filled with the brand
   gradient. Suggestive of the discipline rather than any vendor's mark. */
const PRACTICE_GLYPHS = {
  web: `<g fill="none" stroke="url(#pgG)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="7" width="38" height="12" rx="2"/>
      <rect x="5" y="22.5" width="38" height="12" rx="2"/>
      <path d="M11 13h.02M11 28.5h.02M17 13h.02M17 28.5h.02"/>
      <path d="M24 38v4M18 42h12"/>
      <path d="M31 11.5l4 1.5-4 1.5M31 27l4 1.5-4 1.5"/>
    </g>`,
  ai: `<g fill="none" stroke="url(#pgG)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="24" r="4"/><circle cx="24" cy="11" r="4"/>
      <circle cx="24" cy="37" r="4"/><circle cx="39" cy="24" r="4"/>
      <circle cx="24" cy="24" r="4.6"/>
      <path d="M12.6 22 20.4 13.6M12.6 26l7.8 8.4M27.6 13.6 35.4 22M27.6 34.4 35.4 26"/>
      <path d="M13 24h6M29 24h6M24 15v4.4M24 28.6V33"/>
    </g>`,
  mobile: `<g fill="none" stroke="url(#pgG)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="13" y="4" width="22" height="40" rx="3.4"/>
      <path d="M21 8.5h6"/><path d="M24 39.5h.02"/>
      <path d="M18.5 17h11M18.5 22.5h11M18.5 28h6.5"/>
    </g>`,
  cloud: `<g fill="none" stroke="url(#pgG)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 34h22a8 8 0 0 0 .8-16A12 12 0 0 0 12.4 20 7 7 0 0 0 13 34Z"/>
      <path d="M24 26v11M20 33l4 4 4-4"/>
    </g>`,
  salesforce: `<g fill="none" stroke="url(#pgG)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M24 6 41 15v18L24 42 7 33V15Z"/>
      <path d="M24 6v36M41 15 24 24 7 15"/>
    </g>`,
  commerce: `<g fill="none" stroke="url(#pgG)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 12h4l4.5 20h19L40 17H14"/>
      <circle cx="19" cy="39" r="3"/><circle cx="34" cy="39" r="3"/>
    </g>`,
};
