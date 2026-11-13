/* 하루한권 방문 통계 (자체 수집). 쿠키 없음, 개인정보 없음.
   브라우저에 무작위 방문자 번호만 저장해 '처음 온 사람/다시 온 사람'을 구분함. */
(function () {
  try {
    if (navigator.webdriver || /^(localhost|127\.)/.test(location.hostname) && !window.HR_TRACK_LOCAL) return;
    if (location.protocol !== "https:" && location.protocol !== "http:") return;
    var ls = window.localStorage, ss = window.sessionStorage;
    if (ls.getItem("hr-notrack") === "1") return; // 관리자 본인 기기
    var rnd = function () { var a = new Uint8Array(12); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (x) { return (x % 36).toString(36); }).join(""); };
    var v = ls.getItem("hr-vid"), isNew = 0;
    if (!/^[a-z0-9]{8,32}$/.test(v || "")) { v = rnd(); ls.setItem("hr-vid", v); isNew = 1; }
    var fresh = !ss.getItem("hr-sid"); if (fresh) ss.setItem("hr-sid", "1");
    var send = function (o) {
      o.v = v;
      var body = JSON.stringify(o);
      try { if (navigator.sendBeacon && navigator.sendBeacon("/api/a", new Blob([body], { type: "text/plain" }))) return; } catch (e) {}
      try { fetch("/api/a", { method: "POST", body: body, keepalive: true }); } catch (e) {}
    };
    var q = new URLSearchParams(location.search), u = {};
    if (q.get("utm_source")) u.s = q.get("utm_source").slice(0, 40);
    if (q.get("utm_medium")) u.m = q.get("utm_medium").slice(0, 40);
    if (q.get("utm_campaign")) u.c = q.get("utm_campaign").slice(0, 40);
    var pv = { t: "pv", p: location.pathname, q: q.get("item") || "" };
    if (fresh) { pv.s = 1; pv.n = isNew; pv.r = document.referrer ? document.referrer.slice(0, 300) : ""; if (u.s || u.c) pv.u = u; }
    send(pv);
    // 다른 화면이 부르는 행동 기록: hrTrack("checkout") 등
    window.hrTrack = function (e, extra) { var o = { t: "ev", e: e }; if (extra && extra.items) o.i = extra.items; send(o); };
    window.hrVid = function () { return v; };
    // 장바구니 담기: hr-cart 저장소가 바뀌면 새로 들어간 책만 기록 (모든 화면 공통)
    var orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, val) {
      var before = null;
      if (this === ls && k === "hr-cart") { try { before = JSON.parse(ls.getItem("hr-cart") || "[]"); } catch (e) { before = []; } }
      orig.apply(this, arguments);
      if (before) { try { var add = JSON.parse(val).filter(function (id) { return before.indexOf(id) < 0; }); if (add.length) window.hrTrack("cart", { items: add }); } catch (e) {} }
    };
    // 합격플랜 체험판 열기
    document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest('a[href^="/trial/"]'); if (a) window.hrTrack("trial"); }, true);
  } catch (e) {}
})();
