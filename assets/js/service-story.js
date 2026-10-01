/* A plain-language service explorer: choose a service, then follow its workflow. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionPaused = () => reducedMotion.matches || root.classList.contains('motion-paused');
  const explorers = [];

  document.querySelectorAll('[data-service-explorer]').forEach(explorer => {
    const tabList = explorer.querySelector('.service-tabs');
    const tabs = [...explorer.querySelectorAll('[data-service-tab]')];
    const panels = [...explorer.querySelectorAll('[data-service-panel]')];
    if (!tabList || !tabs.length || tabs.length !== panels.length) return;

    // Resolve the explicit relationships, rather than depend on DOM ordering.
    const stories = tabs.map(tab => {
      const panel = panels.find(item => item.id === tab.getAttribute('aria-controls'));
      if (!panel) return null;
      const play = panel.querySelector('[data-play]');
      const label = panel.querySelector('[data-play-label]');
      const flow = panel.querySelector('.flow-steps');
      const steps = [...panel.querySelectorAll('[data-flow-step]')];
      const status = panel.querySelector('[data-flow-status]');
      if (!play || !label || !flow || !steps.length || !status) return null;
      return {
        tab, panel, play, label, flow, steps, status,
        idleLabel: label.textContent.trim() || 'Play the example',
        idleStatus: status.textContent.trim() || 'An illustrative workflow. Press play to follow the steps.',
        summary: panel.dataset.flowSummary?.trim() || 'All three steps are connected. Replay to follow the example.'
      };
    });
    // Leave all content readable if the required enhancement markup is incomplete.
    if (stories.some(story => !story)) return;

    let current = -1;
    let playing = null;
    let timer = null;

    function cancelTimer() {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    }

    function reset(story) {
      if (!story) return;
      cancelTimer();
      playing = null;
      story.panel.classList.remove('is-playing');
      story.steps.forEach(step => step.classList.remove('is-active', 'is-complete'));
      story.flow.style.setProperty('--flow-progress', '0%');
      story.play.disabled = false;
      story.label.textContent = story.idleLabel;
      story.status.textContent = story.idleStatus;
    }

    function complete(story) {
      cancelTimer();
      playing = null;
      story.panel.classList.remove('is-playing');
      story.steps.forEach(step => {
        step.classList.remove('is-active');
        step.classList.add('is-complete');
      });
      story.flow.style.setProperty('--flow-progress', '100%');
      if (story.status.textContent !== story.summary) story.status.textContent = story.summary;
      story.play.disabled = false;
      story.label.textContent = 'Replay the example';
    }

    function play(story) {
      if (document.hidden || story.panel.hidden) return;
      reset(story);
      if (motionPaused()) {
        complete(story);
        return;
      }
      playing = story;
      story.panel.classList.add('is-playing');
      story.play.disabled = true;
      story.label.textContent = 'Following the steps';

      function showStep(index) {
        if (playing !== story) return;
        if (motionPaused()) {
          complete(story);
          return;
        }
        if (index >= story.steps.length) {
          complete(story);
          return;
        }
        story.steps.forEach((step, position) => {
          step.classList.toggle('is-active', position === index);
          step.classList.toggle('is-complete', position < index);
        });
        const progress = story.steps.length === 1 ? 100 : index / (story.steps.length - 1) * 100;
        story.flow.style.setProperty('--flow-progress', `${progress}%`);
        story.status.textContent = story.steps[index].dataset.explanation || story.idleStatus;
        timer = window.setTimeout(() => showStep(index + 1), 900);
      }
      showStep(0);
    }

    function revealTab(tab, smooth) {
      // Scroll only the tab strip; never move the page or steal its scroll position.
      const bounds = tabList.getBoundingClientRect();
      const item = tab.getBoundingClientRect();
      const inset = 12;
      let delta = 0;
      if (item.left < bounds.left + inset) delta = item.left - bounds.left - inset;
      else if (item.right > bounds.right - inset) delta = item.right - bounds.right + inset;
      if (delta) tabList.scrollTo({
        left: Math.max(0, tabList.scrollLeft + delta),
        behavior: smooth && !motionPaused() ? 'smooth' : 'auto'
      });
    }

    function select(index, { focus = false, animate = false } = {}) {
      if (index < 0 || index >= stories.length) return;
      const changed = current !== index;
      if (changed) {
        reset(stories[current]);
        current = index;
        stories.forEach((story, position) => {
          const selected = position === current;
          story.panel.hidden = !selected;
          story.panel.classList.toggle('is-selected', selected);
          story.tab.classList.toggle('is-selected', selected);
          story.tab.setAttribute('aria-selected', String(selected));
          story.tab.tabIndex = selected ? 0 : -1;
        });
        reset(stories[current]);
        if (motionPaused()) complete(stories[current]);
        else if (animate) play(stories[current]);
      }
      if (focus) stories[current].tab.focus({ preventScroll: true });
      revealTab(stories[current].tab, animate);
    }

    function indexFromHash() {
      let id;
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch (_) { return -1; }
      return stories.findIndex(story => story.panel.id === id);
    }

    tabList.setAttribute('role', 'tablist');
    if (!tabList.hasAttribute('aria-label') && !tabList.hasAttribute('aria-labelledby')) {
      tabList.setAttribute('aria-label', 'Explore our services');
    }
    stories.forEach((story, index) => {
      const { tab, panel } = story;
      if (!tab.id) tab.id = `${panel.id}-tab`;
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tab.id);
      panel.tabIndex = 0;
      story.play.type = 'button';
      story.play.hidden = false;
      story.play.addEventListener('click', () => play(story));
      tab.addEventListener('click', () => select(index, { animate: true }));
      tab.addEventListener('keydown', event => {
        let target;
        if (event.key === 'ArrowRight') target = (index + 1) % stories.length;
        if (event.key === 'ArrowLeft') target = (index + stories.length - 1) % stories.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = stories.length - 1;
        if (target === undefined) return;
        event.preventDefault();
        select(target, { focus: true, animate: true });
      });
    });

    explorer.classList.add('is-enhanced');
    tabList.hidden = false;
    const initial = indexFromHash();
    select(initial < 0 ? 0 : initial);
    window.addEventListener('hashchange', () => {
      const index = indexFromHash();
      if (index >= 0) select(index, { animate: true });
    });
    explorers.push({
      stop: () => reset(stories[current]),
      finish: () => { if (current >= 0) complete(stories[current]); }
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) explorers.forEach(explorer => explorer.stop());
    else finishIfPaused();
  });
  function finishIfPaused() {
    if (motionPaused()) explorers.forEach(explorer => explorer.finish());
  }
  reducedMotion.addEventListener('change', finishIfPaused);
  new MutationObserver(finishIfPaused).observe(root, { attributes: true, attributeFilter: ['class'] });
})();
