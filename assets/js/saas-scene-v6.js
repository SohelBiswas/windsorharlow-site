/* Illustrative code-to-cloud animation; no network calls or live metrics. */
(() => {
 'use strict';
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-saas-scene]').forEach(scene => {
  const lines = [...scene.querySelectorAll('[data-saas-line]')];
  const nodes = [...scene.querySelectorAll('[data-saas-node]')];
  const hops = [...scene.querySelectorAll('[data-saas-hop]')];
  const controls = scene.querySelector('.saas-scene-controls');
  const pause = scene.querySelector('[data-saas-pause]');
  const pauseLabel = scene.querySelector('[data-saas-pause-label]');
  const replay = scene.querySelector('[data-saas-replay]');
  if (!lines.length || nodes.length !== 3 || hops.length !== 2 || !controls || !pause || !replay) return;
  const spans = [];
  let total = 350;
  lines.forEach(line => {
   const length = Number(line.dataset.length) || 0;
   const duration = length * 27;
   spans.push({line, length, start:total, end:total + duration});
   total += duration + 170;
  });
  const cloudStart = total + 250;
  const cycle = cloudStart + 4800;
  let elapsed = 0, last = null, frame = 0, inView = false, locallyPaused = false;
  const globallyPaused = () => document.documentElement.classList.contains('motion-paused');
  const isVisible = () => inView && !document.hidden && !scene.closest('[hidden]');
  const canRun = () => isVisible() && !globallyPaused() && !reduced.matches && !locallyPaused;

  function render(time, complete = false) {
   spans.forEach(({line,length,start,end}) => {
    const count = complete ? length : Math.max(0, Math.min(length, Math.floor((time - start) / 27)));
    line.style.setProperty('--saas-characters', count);
    line.classList.toggle('is-typing', !complete && time >= start && time < end + 170);
   });
   const t = time - cloudStart;
   const activeNode = complete ? 2 : t < 0 ? -1 : t < 1150 ? 0 : t < 2300 ? 1 : 2;
   nodes.forEach((node,i) => {
    node.classList.toggle('is-current', i === activeNode);
    node.classList.toggle('is-reached', activeNode > i);
   });
   hops.forEach((hop,i) => {
    const start = i * 1150 + 350;
    const p = Math.max(0, Math.min(1, (t - start) / 800));
    hop.style.setProperty('--saas-signal', (p * 100).toFixed(2) + '%');
    hop.classList.toggle('is-active', !complete && t >= start && t < start + 800);
   });
  }

  function stop() {
   if (frame) cancelAnimationFrame(frame);
   frame = 0; last = null; scene.classList.remove('is-running');
  }

  function tick(now) {
   frame = 0;
   if (!canRun()) { stop(); return; }
   if (last !== null) elapsed += Math.min(100, Math.max(0, now - last));
   last = now;
   if (elapsed >= cycle) elapsed %= cycle;
   render(elapsed);
   frame = requestAnimationFrame(tick);
  }

  function sync() {
   const disabled = reduced.matches || globallyPaused();
   pause.disabled = disabled; replay.disabled = disabled;
   pauseLabel.textContent = locallyPaused ? 'Play' : 'Pause';
   pause.setAttribute('aria-label', (locallyPaused ? 'Play' : 'Pause') + ' code-to-cloud animation');
   pause.title = reduced.matches ? 'Reduced motion is enabled' : globallyPaused() ? 'Motion is paused using the site control' : '';
   replay.title = pause.title;
   if (reduced.matches) { stop(); render(cycle, true); return; }
   if (!canRun()) { stop(); return; }
   if (!frame) {
    scene.classList.add('is-running'); last = null;
    frame = requestAnimationFrame(tick);
   }
  }

  pause.addEventListener('click', () => { locallyPaused = !locallyPaused; sync(); });
  replay.addEventListener('click', () => { elapsed = 0; locallyPaused = false; render(0); sync(); });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { elapsed = 0; render(0, reduced.matches); sync(); });
  new MutationObserver(sync).observe(document.documentElement, {attributes:true, attributeFilter:['class']});
  const showcase = scene.closest('[data-showcase]');
  if (showcase) new MutationObserver(sync).observe(showcase, {subtree:true, attributes:true, attributeFilter:['hidden']});
  if ('IntersectionObserver' in window) {
   new IntersectionObserver(entries => { inView = entries.some(entry => entry.isIntersecting); sync(); }, {threshold:0.08}).observe(scene);
  } else { inView = true; }
  scene.classList.add('is-enhanced');
  controls.hidden = false;
  render(0, reduced.matches);
  sync();
 });
})();
