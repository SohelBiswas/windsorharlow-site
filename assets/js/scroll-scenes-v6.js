/* All reveal values follow native scroll geometry, in both directions. */
(() => {
 'use strict';
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const desktop=matchMedia('(min-width: 1101px) and (min-height: 640px)');
 const still=()=>reduced.matches||root.classList.contains('motion-paused');
 const clamp=value=>Math.min(1,Math.max(0,value));
 const curtains=[...document.querySelectorAll('[data-scene-curtain]')];
 const assemblies=[...document.querySelectorAll('[data-capability-assembly]')].map(section=>({
  section,track:section.querySelector('.capability-scroll-track'),
  sticky:section.querySelector('.capability-scroll-sticky'),
  cards:[...section.querySelectorAll('.capability-panel')],enabled:false,travel:0
 }));
 curtains.forEach(section=>{
  if(!section.querySelector(':scope > .scene-curtain')){
   const cover=document.createElement('span');cover.className='scene-curtain';cover.setAttribute('aria-hidden','true');section.prepend(cover);
  }
 });
 let queued=false;
 function paint(){
  queued=false;
  const stopped=still(),start=innerHeight*.9,end=Math.max(88,innerHeight*.14);
  // Read geometry together before writing the scene styles.
  const revealValues=curtains.map(section=>stopped?1:clamp((start-section.getBoundingClientRect().top)/(start-end)));
  const assemblyValues=assemblies.map(scene=>scene.enabled?clamp((74-scene.track.getBoundingClientRect().top)/Math.max(1,scene.travel)):1);
  curtains.forEach((section,index)=>{
   const progress=revealValues[index],heading=clamp((progress-.1)/.8);
   section.style.setProperty('--scene-cover',String(1-progress));
   section.style.setProperty('--scene-heading',String(heading));
   section.style.setProperty('--scene-heading-y',`${24*(1-heading)}px`);
   section.dataset.sceneProgress=progress.toFixed(3);
  });
  assemblies.forEach((scene,index)=>{
   const progress=assemblyValues[index];scene.section.dataset.assemblyProgress=progress.toFixed(3);
   scene.cards.forEach((card,i)=>{
    const local=!scene.enabled||i===0?1:clamp((progress-(.04+(i-1)*.21))/.19);
    card.style.setProperty('--cap-opacity',String(local));
    card.style.setProperty('--cap-x',`${48*(1-local)}px`);
    card.style.setProperty('--cap-y',`${18*(1-local)}px`);
    card.style.setProperty('--cap-clip',`${100*(1-local)}%`);
    card.style.pointerEvents=local<.8?'none':'';
    card.dataset.cardProgress=local.toFixed(3);
   });
  });
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(paint);}}
 function configure(){
  const enabled=desktop.matches&&!still(),viewport=Math.max(1,innerHeight-74);
  assemblies.forEach(scene=>{
   scene.enabled=enabled;scene.travel=viewport*1.15;
   scene.section.style.setProperty('--cap-scene-viewport',`${viewport}px`);
   scene.section.style.setProperty('--cap-scene-travel',`${scene.travel}px`);
   scene.section.classList.toggle('is-assembling',enabled);
  });
  paint();
 }
 root.classList.add('scroll-scenes-ready');
 addEventListener('scroll',queue,{passive:true});
 addEventListener('resize',configure,{passive:true});
 addEventListener('pageshow',queue);
 reduced.addEventListener('change',configure);desktop.addEventListener('change',configure);
 let lastStill=still();
 new MutationObserver(()=>{const next=still();if(next!==lastStill){lastStill=next;configure();}}).observe(root,{attributes:true,attributeFilter:['class']});
 configure();
})();
