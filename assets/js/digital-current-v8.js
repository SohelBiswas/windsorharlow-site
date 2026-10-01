/* Squares travel at constant speed along the same SVG paths that draw the current. */
(() => {
  'use strict';
  if (!window.matchMedia || !window.requestAnimationFrame) return;

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sampleStep = 3;
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

  function samplePath(path) {
    try {
      const length = path.getTotalLength();
      if (!Number.isFinite(length) || length <= 0) return null;
      const segments = Math.ceil(length / sampleStep);
      if (segments > 20000) return null;
      const xs = new Float32Array(segments + 1);
      const ys = new Float32Array(segments + 1);
      for (let index = 0; index <= segments; index += 1) {
        const point = path.getPointAtLength(Math.min(length, index * sampleStep));
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
        xs[index] = point.x;
        ys[index] = point.y;
      }
      return {length, segments, xs, ys};
    } catch (_) {
      // Keep server-rendered artwork when SVG geometry is unavailable.
      return null;
    }
  }

  document.querySelectorAll('[data-digital-current]').forEach(section => {
    const field = section.querySelector('.current-field');
    const toggle = section.querySelector('[data-current-toggle]');
    if (!field || !toggle) return;

    const paths = new Map();
    field.querySelectorAll('[data-current-path]').forEach(path => {
      if (path.id && !paths.has(path.id)) paths.set(path.id, path);
    });
    const cache = new Map();
    const particles = [];
    field.querySelectorAll('[data-current-particle]').forEach(element => {
      const pathId = element.dataset.path;
      const path = paths.get(pathId);
      if (!path) return;
      if (!cache.has(pathId)) cache.set(pathId, samplePath(path));
      const geometry = cache.get(pathId);
      if (!geometry) return;
      const rawPhase = Number(element.dataset.phase);
      const rawSpeed = Number(element.dataset.speed);
      const rawOpacity = Number(element.getAttribute('opacity') || 1);
      particles.push({
        element,
        geometry,
        phase: Number.isFinite(rawPhase) ? ((rawPhase % 1) + 1) % 1 : 0,
        speed: Number.isFinite(rawSpeed) && rawSpeed > 0 && rawSpeed <= 200 ? rawSpeed : 60,
        opacity: Number.isFinite(rawOpacity) ? clamp(rawOpacity) : 1,
      });
    });
    if (!particles.length) return;

    const pauseIcon = toggle.querySelector('.current-pause-icon');
    const playIcon = toggle.querySelector('.current-play-icon');
    let elapsed = 0, previous = null, frame = 0, localPaused = false;
    let inView = !('IntersectionObserver' in window);

    const globallyPaused = () => root.classList.contains('motion-paused');

    function state() {
      if (reduced.matches) return 'reduced';
      if (localPaused || globallyPaused()) return 'paused';
      if (document.hidden || section.closest('[hidden]')) return 'hidden';
      if (document.body.classList.contains('ov-locked')) return 'overture';
      if (!inView) return 'offscreen';
      return 'running';
    }

    function paint() {
      particles.forEach(particle => {
        const {geometry, element} = particle;
        const distance = (particle.phase * geometry.length + elapsed * particle.speed) % geometry.length;
        const index = Math.min(geometry.segments - 1, Math.floor(distance / sampleStep));
        const segmentLength = Math.min(sampleStep, geometry.length - index * sampleStep);
        const fraction = (distance - index * sampleStep) / segmentLength;
        const x = geometry.xs[index] + (geometry.xs[index + 1] - geometry.xs[index]) * fraction;
        const y = geometry.ys[index] + (geometry.ys[index + 1] - geometry.ys[index]) * fraction;
        const progress = distance / geometry.length;
        const fade = smooth(Math.min(progress / 0.035, (1 - progress) / 0.035));
        element.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        element.style.opacity = (particle.opacity * fade).toFixed(3);
      });
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
    }

    function updateControl() {
      const globalPause = globallyPaused();
      const paused = localPaused || globalPause || reduced.matches;
      toggle.disabled = reduced.matches || globalPause;
      toggle.classList.toggle('is-paused', paused);
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', toggle.disabled ? 'Background animation paused' : paused ? 'Resume background animation' : 'Pause background animation');
      toggle.title = reduced.matches ? 'Background animation paused — reduced motion is enabled' : globalPause ? 'Background animation paused — use the page motion control to resume' : paused ? 'Resume background animation' : 'Pause background animation';
      if (pauseIcon) pauseIcon.style.display = paused ? 'none' : 'block';
      if (playIcon) playIcon.style.display = paused ? 'block' : 'none';
    }

    function tick(now) {
      frame = 0;
      if (state() !== 'running') { sync(); return; }
      if (previous !== null) elapsed += Math.max(0, Math.min(100, now - previous)) / 1000;
      previous = now;
      paint();
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      const nextState = state();
      section.dataset.currentState = nextState;
      updateControl();
      if (nextState !== 'running') { stop(); return; }
      if (!frame) {
        previous = null;
        frame = requestAnimationFrame(tick);
      }
    }

    toggle.addEventListener('click', () => {
      if (reduced.matches || globallyPaused()) return;
      localPaused = !localPaused;
      sync();
    });
    document.addEventListener('visibilitychange', sync);
    if (reduced.addEventListener) reduced.addEventListener('change', sync);
    else if (reduced.addListener) reduced.addListener(sync);

    if ('MutationObserver' in window) {
      new MutationObserver(sync).observe(root, {attributes: true, attributeFilter: ['class']});
      new MutationObserver(sync).observe(document.body, {attributes: true, attributeFilter: ['class', 'hidden']});
      let ancestor = section;
      while (ancestor && ancestor !== document.body) {
        new MutationObserver(sync).observe(ancestor, {attributes: true, attributeFilter: ['hidden']});
        ancestor = ancestor.parentElement;
      }
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries.some(entry => entry.isIntersecting);
        sync();
      }, {threshold: 0}).observe(section);
    }

    paint();
    toggle.hidden = false;
    sync();
  });
})();
