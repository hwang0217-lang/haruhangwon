/* Shared engine for the 5 light hero drafts. Every slide part carries data-i; the engine sets
   data-pos (-2..2, 0 = current) on each so CSS can animate orbit / fan / fade without per-draft JS. */
const HERO_IDS=["buy-agent","partners","job-pass","shorts","side-tax"];
const HK={
  books:()=>HERO_IDS.map(id=>BOOKS.find(b=>b.id===id)).filter(Boolean),
  t1:b=>b.cover.lines.length>1?b.cover.lines.slice(0,-1).join(" "):b.cover.hook,
  t2:b=>b.cover.lines[b.cover.lines.length-1],
  price:b=>`${won(b.price)}${b.was?` <s>${won(b.was)}</s>`:""}`,
  ARL:'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M11 2L4 8l7 6z" fill="currentColor"/></svg>',
  ARR:'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 2l7 6-7 6z" fill="currentColor"/></svg>',
  PLAY:'<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z" fill="currentColor"/></svg>',
  GET:'<svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19 3 9h18zM3 3h18v2.5H3z" fill="currentColor"/></svg>',
  HEART:'<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>'
};
function heroKit(root,render,opts={}){
  const bs=HK.books(),n=bs.length;let cur=0,timer=0,paused=false;
  root.innerHTML=render(bs);
  const live=document.createElement("p");live.className="hk-sr";live.setAttribute("aria-live","polite");root.appendChild(live);
  const reduce=matchMedia("(prefers-reduced-motion: reduce)");
  function paint(first){
    root.querySelectorAll("[data-i]").forEach(el=>{
      let d=((+el.dataset.i-cur)%n+n)%n;if(d>n/2)d-=n;
      el.dataset.pos=Math.max(-2,Math.min(2,d));
      const on=d===0;if(!el.hasAttribute("data-keep"))el.setAttribute("aria-hidden",!on);
      el.querySelectorAll("a,button").forEach(a=>{if(!a.closest("[data-keep]"))a.tabIndex=on?0:-1});
    });
    root.querySelectorAll("[data-go]").forEach(g=>g.setAttribute("aria-current",+g.dataset.go===cur));
    const b=bs[cur];root.style.setProperty("--ac",b.cover.ac);root.style.setProperty("--cbg",b.cover.bg);root.style.setProperty("--cink",b.cover.ink);
    root.style.setProperty("--k",cur);
    if(!first)live.textContent=`${cur+1}/${n} ${b.title}, ${won(b.price)}`;
    opts.onChange&&opts.onChange(cur,b);
  }
  function go(i){cur=((i%n)+n)%n;paint();tick()}
  function tick(){clearTimeout(timer);if(!reduce.matches&&!paused&&!document.hidden)timer=setTimeout(()=>go(cur+1),5600)}
  root.addEventListener("click",e=>{const s=e.target.closest("[data-step]"),g=e.target.closest("[data-go]"),t=e.target.closest("[data-tab]");
    if(s)go(cur+ +s.dataset.step);else if(g)go(+g.dataset.go);else if(t){root.querySelectorAll("[data-tab]").forEach(x=>x.setAttribute("aria-selected",x===t));root.dataset.tab=t.dataset.tab}});
  root.addEventListener("keydown",e=>{if(e.target.matches("input,textarea"))return;if(e.key==="ArrowRight"){go(cur+1);e.preventDefault()}if(e.key==="ArrowLeft"){go(cur-1);e.preventDefault()}});
  let sx=null;root.addEventListener("pointerdown",e=>sx=e.clientX);root.addEventListener("pointerup",e=>{if(sx!=null&&Math.abs(e.clientX-sx)>40)go(cur+(e.clientX<sx?1:-1));sx=null});
  const hold=v=>()=>{paused=v;tick()};root.addEventListener("mouseenter",hold(true));root.addEventListener("mouseleave",hold(false));
  root.addEventListener("focusin",hold(true));root.addEventListener("focusout",e=>{if(!root.contains(e.relatedTarget))hold(false)()});
  document.addEventListener("visibilitychange",tick);
  paint(true);requestAnimationFrame(()=>root.classList.add("hk-ready"));tick();
}
