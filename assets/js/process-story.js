/* A native-scroll story; it never intercepts wheel, touch or keyboard scrolling. */
(() => {
 'use strict';
 const story=document.querySelector('[data-process-story]');
 if(!story)return;
 const track=story.querySelector('.process-track'),sticky=story.querySelector('.process-sticky');
 const panels=[...story.querySelectorAll('[data-process-panel]')];
 const buttons=[...story.querySelectorAll('[data-process-select]')];
 const markers=[...story.querySelectorAll('[data-process-marker]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const eligible=matchMedia('(min-width: 901px) and (min-height: 640px)');
 let active=-1,enhanced=false,queued=false,travel=0,top=74;
 const paused=()=>document.documentElement.classList.contains('motion-paused')||reduced.matches;
 function select(index){
  if(index===active)return;
  active=index;
  buttons.forEach((button,i)=>{
   if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
   button.classList.toggle('is-complete',i<index);
  });
  panels.forEach((panel,i)=>{
   panel.classList.toggle('is-current',i===index);
   if(enhanced){panel.hidden=i!==index;}else panel.hidden=false;
  });
 }
 function paint(){
  queued=false;
  if(enhanced){
   const progress=Math.max(0,Math.min(1,(top-track.getBoundingClientRect().top)/Math.max(travel,1)));
   select(Math.min(2,Math.floor(progress*3)));
   story.style.setProperty('--process-progress',String(Math.max(.04,progress)));
  }else{
   const line=innerHeight*.46;
   let nearest=0,distance=Infinity;
   panels.forEach((panel,i)=>{const d=Math.abs(panel.getBoundingClientRect().top-line);if(d<distance){distance=d;nearest=i;}});
   select(nearest);story.style.setProperty('--process-progress',String((nearest+1)/3));
  }
 }
 function queue(){if(!queued){queued=true;requestAnimationFrame(paint);}}
 function configure(){
  enhanced=eligible.matches&&!reduced.matches;
  story.classList.toggle('is-sticky',enhanced);
  story.classList.add('is-enhanced');
  story.querySelector('.process-nav').hidden=false;
  top=74;
  const available=innerHeight-top;
  story.style.setProperty('--process-top',`${top}px`);
  story.style.setProperty('--process-viewport',`${available}px`);
  travel=enhanced?track.getBoundingClientRect().height-sticky.getBoundingClientRect().height:0;
  markers.forEach((marker,i)=>marker.style.top=`${travel*i/2}px`);
  active=-1;paint();
 }
 buttons.forEach((button,i)=>button.addEventListener('click',()=>{
  const target=enhanced?markers[i]:panels[i];
  target.scrollIntoView({behavior:paused()?'auto':'smooth',block:'start'});
 }));
 addEventListener('scroll',queue,{passive:true});
 addEventListener('resize',configure,{passive:true});
 reduced.addEventListener('change',configure);
 eligible.addEventListener('change',configure);
 configure();
})();
