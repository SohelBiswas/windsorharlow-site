/* Centre-out theatre reveal. Viewport position is the only animation clock. */
(() => {
 'use strict';
 const sections=[...document.querySelectorAll('[data-project-theatre]')];
 if(!sections.length)return;
 const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const still=()=>reduced.matches||root.classList.contains('motion-paused');
 const clamp=value=>Math.max(0,Math.min(1,value));
 let queued=false,lastStill=still();
 function paint(){
  queued=false;
  const stopped=still(),start=innerHeight*.88,end=Math.max(90,innerHeight*.16);
  const values=sections.map(section=>stopped?1:clamp((start-section.getBoundingClientRect().top)/(start-end)));
  sections.forEach((section,index)=>{
   const progress=values[index];
   section.style.setProperty('--theatre-progress',String(progress));
   section.style.setProperty('--spotlight-pointer',progress<.82?'none':'auto');
   section.dataset.theatreProgress=progress.toFixed(3);
  });
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(paint);}}
 sections.forEach(section=>{const cover=section.querySelector('.spotlight-curtains');if(cover)cover.hidden=false;});
 addEventListener('scroll',queue,{passive:true});
 addEventListener('resize',queue,{passive:true});
 addEventListener('pageshow',queue);
 reduced.addEventListener('change',queue);
 new MutationObserver(()=>{const next=still();if(next!==lastStill){lastStill=next;queue();}}).observe(root,{attributes:true,attributeFilter:['class']});
 paint();
})();
