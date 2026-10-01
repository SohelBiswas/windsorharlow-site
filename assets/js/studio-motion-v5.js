/* Business-focused panels and section reveals. Native scrolling stays in charge. */
(() => {
 'use strict';
 const root=document.documentElement, reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const still=()=>reduced.matches||root.classList.contains('motion-paused');
 document.querySelectorAll('[data-stack]').forEach(section=>{
  const tabs=[...section.querySelectorAll('[data-stack-tab]')],panels=[...section.querySelectorAll('[data-stack-panel]')],list=section.querySelector('.stack-tabs');
  if(tabs.length!==panels.length||!tabs.length)return;
  function select(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});if(focus)tabs[index].focus({preventScroll:true});}
  list.hidden=false;list.setAttribute('role','tablist');section.classList.add('stack-enhanced');
  tabs.forEach((tab,i)=>{tab.setAttribute('role','tab');panels[i].setAttribute('role','tabpanel');panels[i].tabIndex=0;tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%tabs.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();select(n,true);}});});select(0);
 });
 const scenes=[...document.querySelectorAll('[data-section-scene]')];
 if(!('IntersectionObserver' in window)){scenes.forEach(s=>s.classList.add('scene-entered','scene-visible'));return;}
 // Covers and capability assembly are scrubbed by scroll-scenes-v6.js.
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{target.classList.toggle('scene-visible',isIntersecting);if(isIntersecting)target.classList.add('scene-entered');}),{threshold:.04,rootMargin:'0px 0px -25px'});
 scenes.forEach(s=>observer.observe(s));
 root.classList.add('motion-ready');
 function revealStill(){if(still())scenes.forEach(s=>s.classList.add('scene-entered'));}reduced.addEventListener('change',revealStill);new MutationObserver(revealStill).observe(root,{attributes:true,attributeFilter:['class']});revealStill();
})();
