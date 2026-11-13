/* 토스페이먼츠 결제 공통 (스토어 장바구니, /checkout). 키가 test_ck/live_ck면 결제창, test_gck/live_gck면 결제위젯 */
const HRPAY=(()=>{
  let cfg=null, widgets=null;
  const onSite=location.protocol.startsWith("http")&&!location.hostname.endsWith("claude.ai")&&!location.hostname.includes("claudeusercontent");
  async function config(){if(cfg&&cfg.ready)return cfg;try{cfg=await fetch("/api/pay/config",{cache:"no-store"}).then(r=>r.json())}catch(e){cfg={ready:false}}return cfg}
  function load(){return window.TossPayments?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://js.tosspayments.com/v2/standard";s.onload=ok;s.onerror=()=>no(new Error("결제 모듈을 불러오지 못했어요."));document.head.appendChild(s)})}
  const orderId=()=>{const d=new Date(),p=n=>String(n).padStart(2,"0");const r=Array.from(crypto.getRandomValues(new Uint8Array(12)),x=>"abcdefghijkmnpqrstuvwxyz23456789"[x%32]).join("");return `HR${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${r}`};
  // 결제 폼을 그린 직후 호출: 결제 가능 여부 문구, 위젯 키면 결제수단·약관 그리기
  async function setup(sum,{pm,agr,btn,msg}){
    widgets=null;
    if(!onSite){msg("미리보기 화면에서는 결제가 되지 않아요.");btn.disabled=true;return}
    const c=await config();
    if(!c.ready){msg("결제 연결을 준비하고 있어요. 잠시 후 다시 시도해 주세요.");btn.disabled=true;return}
    if(c.mode==="test")msg("테스트 결제 모드예요. 실제로 돈이 빠져나가지 않고, 실제 파일 대신 안내 파일을 받아요.");
    if(!/_gck_/.test(c.clientKey))return;
    try{await load();const w=TossPayments(c.clientKey).widgets({customerKey:TossPayments.ANONYMOUS});
      await w.setAmount({currency:"KRW",value:sum});
      await Promise.all([w.renderPaymentMethods({selector:pm,variantKey:"DEFAULT"}),w.renderAgreement({selector:agr,variantKey:"AGREEMENT"})]);
      widgets=w}catch(e){msg("결제 수단을 불러오지 못했어요. 새로고침해 주세요.")}
  }
  // 서버가 금액을 다시 계산한 뒤 결제창 열기. expect = 화면에 보인 금액
  async function pay({items,bump="",email,name="",expect}){
    const c=await config();if(!c.ready)throw new Error("결제 연결을 준비하고 있어요.");
    const r=await fetch("/api/pay/quote",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({items,bump})});
    const q=await r.json();if(!r.ok)throw new Error(q.message||"금액을 확인하지 못했어요.");
    if(expect!=null&&q.amount!==expect){const e=new Error("금액이 바뀌었어요. 다시 확인하고 눌러 주세요.");e.changed=true;throw e}
    const id=orderId(),qs=new URLSearchParams({items:items.join(","),bump:q.bump});
    const req={orderId:id,orderName:q.orderName,successUrl:`${location.origin}/pay/success?${qs}`,failUrl:`${location.origin}/pay/fail`,customerEmail:email,metadata:{items:items.join(","),bump:q.bump}};
    if(name)req.customerName=name;
    await load();
    if(widgets)return widgets.requestPayment(req);
    return TossPayments(c.clientKey).payment({customerKey:TossPayments.ANONYMOUS}).requestPayment({method:"CARD",amount:{currency:"KRW",value:q.amount},card:{flowMode:"DEFAULT"},...req});
  }
  const cancelled=e=>e&&/CANCEL/.test(e.code||"");
  return {setup,pay,cancelled,onSite};
})();
