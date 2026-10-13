(()=>{
const $=(s,r=document)=>[...r.querySelectorAll(s)],rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const bar=$('.bar')[0];let ly=0;
const onScroll=()=>{const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
 document.documentElement.style.setProperty('--p',h>0?y/h:0);
 bar&&bar.classList.toggle('is-hidden',y>ly&&y>200);ly=y;
 const pipe=$('.pipe')[0];if(pipe){const r=pipe.getBoundingClientRect();pipe.style.setProperty('--fill',Math.min(1,Math.max(0,(innerHeight*.65-r.top)/r.height)))}};
addEventListener('scroll',onScroll,{passive:true});onScroll();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,sib=[...el.parentElement.children].filter(c=>c.classList.contains('reveal'));
 el.style.setProperty('--d',Math.max(0,Math.min(sib.indexOf(el),6))*80+'ms');el.classList.add('is-in');io.unobserve(el)}),{threshold:.12,rootMargin:'0px 0px -8% 0px'});
$('.reveal').forEach(el=>io.observe(el));
const run=el=>{const t=+el.dataset.count,d=+(el.dataset.decimals||0),p=el.dataset.prefix||'',s=el.dataset.suffix||'';
 if(rm){el.textContent=p+t.toFixed(d)+s;return}const t0=performance.now(),D=1800;cancelAnimationFrame(el._r);
 const f=n=>{const k=Math.min(1,(n-t0)/D),v=t*(1-Math.pow(1-k,4));el.textContent=p+v.toFixed(d)+s;if(k<1)el._r=requestAnimationFrame(f)};el._r=requestAnimationFrame(f)};
const cio=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?run(e.target):(cancelAnimationFrame(e.target._r),e.target.textContent=(e.target.dataset.prefix||'')+'0'+(e.target.dataset.suffix||''))),{threshold:.6});
$('[data-count]').forEach(el=>cio.observe(el));
if(!rm&&matchMedia('(pointer:fine)').matches){
 $('.tilt').forEach(t=>{const i=t.firstElementChild;t.addEventListener('pointermove',e=>{const r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;i.style.transform=`rotateY(${x*10}deg) rotateX(${-y*8}deg)`});t.addEventListener('pointerleave',()=>i.style.transform='')});
 $('.card').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}))}
const links=$('.bar__nav a'),sec=links.map(a=>document.querySelector(a.getAttribute('href')));
const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach((a,i)=>a.classList.toggle('is-active',sec[i]===e.target))}),{rootMargin:'-45% 0px -50% 0px'});
sec.forEach(s=>s&&sio.observe(s));
$('.step').forEach(s=>io.observe(s));

const cur=document.getElementById('cursor');
if(cur&&!rm&&matchMedia('(pointer:fine)').matches){
 const dot=cur.querySelector('.cursor__dot'),ring=cur.querySelector('.cursor__ring'),lab=cur.querySelector('.cursor__label');
 let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y,on=false;document.body.classList.add('has-cursor');
 addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;x=e.clientX;y=e.clientY;if(!on){on=true;rx=x;ry=y;cur.style.opacity='1'}
  dot.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%)`;
  const hot=e.target.closest('a,button,.card'),tg=e.target.closest('[data-cursor]');
  cur.classList.toggle('is-hot',!!hot&&!tg);cur.classList.toggle('is-label',!!tg);if(tg)lab.textContent=tg.dataset.cursor},{passive:true});
 document.addEventListener('pointerleave',()=>cur.style.opacity='0');document.addEventListener('pointerenter',()=>{if(on)cur.style.opacity='1'});
 (function f(){rx+=(x-rx)*.16;ry+=(y-ry)*.16;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(f)})();
}
const tt=document.getElementById('toTop');
if(tt){addEventListener('scroll',()=>tt.classList.toggle('is-on',scrollY>innerHeight*.6),{passive:true});
 tt.classList.toggle('is-on',scrollY>innerHeight*.6);
 tt.addEventListener('click',()=>scrollTo({top:0,behavior:rm?'auto':'smooth'}))}
})();
