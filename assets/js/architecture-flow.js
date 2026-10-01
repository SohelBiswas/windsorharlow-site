/* Animated reference diagrams: one visible run, with explicit playback controls. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const diagrams = [];
  const motionBlocked = () => reduced.matches || document.documentElement.classList.contains('motion-paused');
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  document.querySelectorAll('[data-architecture-flow]').forEach(root => {
    let stages;
    try { stages = JSON.parse(root.dataset.flowStages); } catch (_) { return; }
    if (!Array.isArray(stages) || !stages.length) return;
    const nodes = new Map([...root.querySelectorAll('[data-architecture-node]')].map(el => [el.dataset.architectureNode, el]));
    const edges = new Map([...root.querySelectorAll('[data-architecture-edge]')].map(el => {
      const key = el.dataset.architectureEdge;
      const packet = root.querySelector(`[data-architecture-packet="${key}"]`);
      const length = el.getTotalLength();
      el.style.strokeDasharray = String(length);
      el.style.strokeDashoffset = String(length);
      return [key, {el, packet, length}];
    }));
    const play = root.querySelector('[data-architecture-play]');
    const restart = root.querySelector('[data-architecture-replay]');
    const next = root.querySelector('[data-architecture-next]');
    const lane = root.querySelector('[data-architecture-lane]');
    const caption = root.querySelector('[data-architecture-caption]');
    const count = root.querySelector('[data-architecture-count]');
    const status = root.querySelector('[data-architecture-status]');
    let index = 0;
    let elapsed = 0;
    let last = 0;
    let raf = 0;
    let visible = false;
    let hasStarted = false;
    let wantsToRun = false;
    let complete = false;
    const duration = () => stages[index].edges.length ? 2350 : 1700;
    const isExposed = () => root.getClientRects().length > 0 && !root.closest('[hidden], [aria-hidden="true"]');
    const mayAnimate = () => visible && isExposed() && !document.hidden && !motionBlocked();

    function setClass(el, name, on) {
      if (el.classList.contains(name) !== on) el.classList.toggle(name, on);
    }
    function updateButtons() {
      const active = !!raf;
      play.textContent = motionBlocked() ? 'Show next step' : complete ? 'Replay flow' : active ? 'Pause flow' : (hasStarted ? 'Resume flow' : 'Play flow');
      play.setAttribute('aria-label', play.textContent);
      next.disabled = index === stages.length - 1;
      root.classList.toggle('is-flow-playing', active);
      root.classList.toggle('is-flow-complete', complete);
    }
    function announce() {
      status.textContent = `Step ${index + 1} of ${stages.length}. ${stages[index].lane}. ${stages[index].caption}`;
    }
    function draw() {
      const stage = stages[index];
      const progress = clamp((elapsed / duration() - 0.18) / 0.56, 0, 1);
      const visited = new Set(stages.slice(0, index).flatMap(item => [...item.start, ...item.end]));
      const used = new Set(stages.slice(0, index).flatMap(item => item.edges));
      const activeNodes = new Set(progress < 1 ? stage.start : (stage.end.length ? stage.end : stage.start));
      stage.start.forEach(key => visited.add(key));
      if (progress === 1) stage.end.forEach(key => visited.add(key));
      nodes.forEach((el, key) => {
        setClass(el, 'is-flow-active', activeNodes.has(key));
        setClass(el, 'is-flow-visited', visited.has(key));
      });
      edges.forEach(({el, packet, length}, key) => {
        const active = stage.edges.includes(key);
        const value = active ? progress : used.has(key) ? 1 : 0;
        el.style.strokeDashoffset = String(length * (1 - value));
        el.style.opacity = value === 0 ? '0' : active ? '1' : '0.27';
        packet.style.opacity = active && progress > 0 && progress < 1 ? '1' : '0';
        if (active && progress > 0 && progress < 1) {
          const point = el.getPointAtLength(progress * length);
          packet.setAttribute('cx', point.x.toFixed(2));
          packet.setAttribute('cy', point.y.toFixed(2));
        }
      });
      lane.textContent = stage.lane;
      caption.textContent = stage.caption;
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')}`;
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      updateButtons();
    }
    function frame(now) {
      if (!wantsToRun || !mayAnimate()) { stop(); return; }
      if (last) elapsed += Math.min(now - last, 80);
      last = now;
      if (elapsed >= duration()) {
        if (index === stages.length - 1) {
          elapsed = duration();
          complete = true;
          wantsToRun = false;
          draw();
          stop();
          return;
        }
        index += 1;
        elapsed = 0;
      }
      draw();
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      if (wantsToRun && mayAnimate()) {
        if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
      } else stop();
      updateButtons();
    }
    function stepTo(nextIndex, spoken = true) {
      wantsToRun = false;
      stop();
      index = clamp(nextIndex, 0, stages.length - 1);
      elapsed = duration();
      hasStarted = true;
      complete = index === stages.length - 1;
      draw();
      updateButtons();
      if (spoken) announce();
    }
    function reset() {
      index = 0;
      elapsed = 0;
      complete = false;
      hasStarted = true;
      draw();
    }
    play.addEventListener('click', () => {
      if (motionBlocked()) { stepTo(complete ? 0 : Math.min(index + 1, stages.length - 1)); return; }
      if (raf || wantsToRun) { wantsToRun = false; stop(); return; }
      if (complete) reset();
      hasStarted = true;
      wantsToRun = true;
      sync();
    });
    restart.addEventListener('click', () => {
      stop();
      reset();
      wantsToRun = !motionBlocked();
      if (motionBlocked()) elapsed = duration();
      draw();
      announce();
      sync();
    });
    next.addEventListener('click', () => stepTo(index + 1));
    root.querySelector('.architecture-controls').hidden = false;
    root.classList.add('is-flow-enhanced');
    draw();
    updateButtons();
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2;
      if (visible && !hasStarted && !motionBlocked() && isExposed()) {
        hasStarted = true;
        wantsToRun = true;
      }
      sync();
    }, {threshold: [0, 0.2, 0.5]});
    observer.observe(root);
    diagrams.push({sync, root});
  });

  // The site-wide motion switch, OS preference and hidden carousel slides all
  // suspend rAF immediately. No timer or animation runs for offscreen diagrams.
  document.addEventListener('visibilitychange', () => diagrams.forEach(item => item.sync()));
  reduced.addEventListener('change', () => diagrams.forEach(item => item.sync()));
  new MutationObserver(() => diagrams.forEach(item => item.sync())).observe(document.documentElement, {attributes:true, attributeFilter:['class']});
  new MutationObserver(() => diagrams.forEach(item => item.sync())).observe(document.body, {subtree:true, attributes:true, attributeFilter:['hidden','aria-hidden']});
})();
