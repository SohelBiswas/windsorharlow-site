/* Progressive interaction: manual showcases, motion preference, quiet section transitions. */
(() => {
 'use strict';
 const root=document.documentElement, reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let manual=false;
 try{manual=sessionStorage.getItem('wh-motion')==='paused';}catch(_){}
 const motion=document.createElement('button'); motion.type='button';motion.className='motion-control';
 function sync(){const paused=manual||reduced.matches;root.classList.toggle('motion-paused',paused);motion.textContent=reduced.matches?'Reduced motion on':paused?'Resume motion':'Pause motion';motion.disabled=reduced.matches;motion.dataset.paused=String(paused);}
 sync();motion.addEventListener('click',()=>{manual=!manual;sync();try{sessionStorage.setItem('wh-motion',manual?'paused':'playing');}catch(_){}});
 document.querySelector('.foot-btm')?.append(motion);reduced.addEventListener('change',sync);
 function openIndex(){const index=document.querySelector('details#index');if(location.hash==='#index'&&index)index.open=true;}
 openIndex();addEventListener('hashchange',openIndex);
 document.querySelectorAll('[data-showcase]').forEach(showcase=>{
  const slides=[...showcase.querySelectorAll('[data-slide]')],controls=showcase.querySelector('.showcase-controls');
  const prev=controls.querySelector('[data-prev]'),next=controls.querySelector('[data-next]'),status=controls.querySelector('.showcase-status');
  const selectors=[...controls.querySelectorAll('[data-select]')];
  let current=Number(showcase.dataset.start)||0;
  showcase.setAttribute('role','region');showcase.setAttribute('aria-roledescription','carousel');showcase.tabIndex=0;
  slides.forEach(s=>{s.setAttribute('role','group');s.setAttribute('aria-roledescription','slide');});
  function select(index,focus=false){
   current=Math.min(slides.length-1,Math.max(0,index));
   slides.forEach((s,i)=>{s.hidden=i!==current;});
   selectors.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
   status.textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
   prev.disabled=current===0;next.disabled=current===slides.length-1;
   if(focus)selectors[current].focus({preventScroll:true});
   const row=selectors[current]?.parentElement;
   if(row&&row.scrollWidth>row.clientWidth){const button=selectors[current];row.scrollTo({left:Math.max(0,button.offsetLeft-row.offsetLeft-15),behavior:manual||reduced.matches?'auto':'smooth'});}
  }
  prev.addEventListener('click',()=>select(current-1));next.addEventListener('click',()=>select(current+1));
  selectors.forEach((b,i)=>{b.addEventListener('click',()=>select(i));b.addEventListener('keydown',event=>{let target;if(event.key==='ArrowRight')target=(i+1)%slides.length;if(event.key==='ArrowLeft')target=(i+slides.length-1)%slides.length;if(event.key==='Home')target=0;if(event.key==='End')target=slides.length-1;if(target!==undefined){event.preventDefault();select(target,true);}});});
  showcase.addEventListener('keydown',event=>{if(event.target!==showcase)return;if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();select(event.key==='Home'?0:event.key==='End'?slides.length-1:current+(event.key==='ArrowRight'?1:-1));}});
  let startX=null,startY=null;
  const surface=showcase.querySelector('.showcase-slides');
  surface.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;},{passive:true});
  surface.addEventListener('touchend',e=>{if(startX===null)return;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.4)select(current+(dx<0?1:-1));startX=null;},{passive:true});
  showcase.classList.add('is-enhanced');controls.hidden=false;select(current);
 });
 if('IntersectionObserver' in window){
  const sections=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('entered');sections.unobserve(e.target);}}),{threshold:.04,rootMargin:'0px 0px -15px'});
  document.querySelectorAll('[data-enter]').forEach(s=>sections.observe(s));
  const diagrams=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('motion-idle',!e.isIntersecting)));
  document.querySelectorAll('.studio-systems').forEach(s=>diagrams.observe(s));
 }else document.querySelectorAll('[data-enter]').forEach(s=>s.classList.add('entered'));
 // The opening photograph moves gently with the page; normal scrolling is unchanged.
 const scene=document.querySelector('.home-page .hero-scene');
 if(scene){
  let queued=false;
  function paintHero(){queued=false;const still=manual||reduced.matches||innerWidth<=1100;scene.style.setProperty('--hero-shift',still?'0px':`${Math.min(80,Math.max(0,scrollY)*.12)}px`);}
  function queueHero(){if(!queued){queued=true;requestAnimationFrame(paintHero);}}
  addEventListener('scroll',queueHero,{passive:true});addEventListener('resize',queueHero,{passive:true});reduced.addEventListener('change',queueHero);motion.addEventListener('click',queueHero);paintHero();
 }

})();
