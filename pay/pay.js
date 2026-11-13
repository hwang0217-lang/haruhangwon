/* 결제 완료·구매내역 공통: 책 목록과 내려받기 버튼, 이 기기에 주문 기억 */
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fileUrl=(o,id,f)=>`/api/pay/file?order=${encodeURIComponent(o)}&id=${encodeURIComponent(id)}&f=${f}`;
function booksHtml(order){
  return `<div>${order.books.map(x=>{const b=typeof BOOKS!=="undefined"?BOOKS.find(y=>y.id===x.id):null;return `<div class="row"><span class="cv">${b?coverSVG(b):""}</span><span><b>${esc(x.title)}</b><span class="dl"><a class="btn primary" href="${fileUrl(order.orderId,x.id,"pdf")}">PDF 받기</a><a class="btn" href="${fileUrl(order.orderId,x.id,"epub")}">EPUB 받기</a></span></span></div>`}).join("")}</div>`;
}
function orderMeta(o){
  const t=o.approvedAt?new Date(o.approvedAt).toLocaleString("ko-KR"):"";
  return `<dl class="meta"><dt>주문번호</dt><dd>${esc(o.orderId)}</dd><dt>결제 금액</dt><dd>${Number(o.amount).toLocaleString("ko-KR")}원</dd>${t?`<dt>결제 시각</dt><dd>${esc(t)}</dd>`:""}</dl>`;
}
const ORDERS={
  all(){try{return JSON.parse(localStorage.getItem("hr-orders")||"[]")}catch(e){return []}},
  add(o){try{const a=this.all().filter(x=>x.orderId!==o.orderId);a.unshift({orderId:o.orderId,amount:o.amount,approvedAt:o.approvedAt,books:o.books});localStorage.setItem("hr-orders",JSON.stringify(a.slice(0,50)))}catch(e){}}
};
