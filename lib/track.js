// 방문 통계: 유입 경로·기기 판별과 Redis 기록. 개인정보(IP·이메일)는 저장하지 않음.
import { pipe, kst, TTL, kvReady } from "./kv.js";

export const VID_RE = /^[a-z0-9]{8,32}$/;
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|pingdom|monitor|curl|wget|python|axios|node-fetch|yeti|daumoa|bingpreview|scrap/i;
export const isBot = ua => !ua || BOT.test(ua);

// 경로를 정해진 모양으로만 기록 (이상한 주소로 통계가 어지러워지지 않게)
const ID = "[a-z0-9-]{1,40}";
const PATHS = [/^\/$/, /^\/store$/, /^\/exams$/, /^\/orders$/, /^\/checkout$/, /^\/terms$/, /^\/privacy$/, /^\/book$/,
  new RegExp(`^/b/${ID}$`), new RegExp(`^/exam/${ID}$`), new RegExp(`^/trial/${ID}$`), /^\/pay\/(success|fail)$/];
export function cleanPath(p) {
  let s = String(p || "/").split(/[?#]/)[0].replace(/\.html$/, "").replace(/\/index$/, "/").toLowerCase();
  if (s.length > 1) s = s.replace(/\/$/, "");
  if (s === "/index") s = "/";
  return PATHS.some(r => r.test(s)) ? s : "기타";
}
// 책/합격플랜 상세 경로 → 상품 id
export function itemOfPath(p, q) {
  let m = p.match(/^\/b\/([a-z0-9-]+)$/); if (m) return m[1];
  m = p.match(/^\/exam\/([a-z0-9-]+)$/); if (m) return "x-" + m[1];
  if (p === "/checkout" && q && /^x-[a-z0-9-]{1,40}$/.test(q)) return q;
  return "";
}

const UTM_NAMES = { naver: "네이버", kmong: "크몽", instagram: "인스타그램", ig: "인스타그램", insta: "인스타그램", youtube: "유튜브", yt: "유튜브",
  kakao: "카카오톡", kakaotalk: "카카오톡", facebook: "페이스북", fb: "페이스북", threads: "스레드", blog: "네이버 블로그", naverblog: "네이버 블로그", google: "구글", daum: "다음", tiktok: "틱톡", x: "X", twitter: "X" };
function hostLabel(h) {
  h = h.replace(/^www\./, "").replace(/^m\./, "");
  if (/^(m\.)?search\.naver\.com$/.test(h) || h === "search.naver.com") return "네이버 검색";
  if (/(^|\.)blog\.naver\.com$/.test(h) || h === "blog.naver.com") return "네이버 블로그";
  if (/(^|\.)cafe\.naver\.com$/.test(h)) return "네이버 카페";
  if (/(^|\.)naver\.(com|me)$/.test(h) || h === "naver.com") return "네이버";
  if (/(^|\.)kmong\.com$/.test(h)) return "크몽";
  if (/(^|\.)instagram\.com$/.test(h)) return "인스타그램";
  if (/(^|\.)google\./.test(h)) return "구글";
  if (/(^|\.)daum\.net$/.test(h)) return "다음";
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return "유튜브";
  if (/(^|\.)facebook\.com$/.test(h)) return "페이스북";
  if (/(^|\.)threads\.(net|com)$/.test(h)) return "스레드";
  if (/^(t\.co|x\.com|twitter\.com)$/.test(h)) return "X";
  if (/(^|\.)kakao\.com$/.test(h)) return "카카오";
  if (/(^|\.)tistory\.com$/.test(h)) return "티스토리";
  if (/(^|\.)bing\.com$/.test(h)) return "빙";
  if (/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai)$/.test(h)) return "AI 검색";
  return h.slice(0, 40);
}
// 유입 경로: utm_source > 리퍼러 > 앱 안 브라우저 > 직접 방문. 내부 이동이면 null
export function sourceOf({ ref, utm, ua, host }) {
  const us = String(utm?.s || "").toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 30);
  if (us) return UTM_NAMES[us] || us;
  let h = "";
  try { h = ref ? new URL(ref).hostname.toLowerCase() : ""; } catch {}
  if (h) {
    const self = String(host || "").toLowerCase().replace(/^www\./, "");
    if (h.replace(/^www\./, "") === self || /(^|\.)haruhangwon\.(kr|vercel\.app)$/.test(h) || /tosspayments\.com$/.test(h)) return null;
    return hostLabel(h);
  }
  if (/KAKAOTALK/i.test(ua)) return "카카오톡";
  if (/Instagram/i.test(ua)) return "인스타그램";
  if (/NAVER\(inapp/i.test(ua)) return "네이버 앱";
  if (/FBAN|FBAV/i.test(ua)) return "페이스북";
  return "직접 방문";
}

export function deviceOf(ua) {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "태블릿";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "모바일";
  return "데스크톱";
}
export function osOf(ua) {
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac OS X|Macintosh/i.test(ua)) return "macOS";
  if (/Linux|CrOS/i.test(ua)) return "Linux";
  return "기타";
}
const CITY = { Seoul: "서울", Busan: "부산", Incheon: "인천", Daegu: "대구", Daejeon: "대전", Gwangju: "광주", Ulsan: "울산", Suwon: "수원", Seongnam: "성남", Goyang: "고양", Yongin: "용인", Bucheon: "부천", Cheongju: "청주", Ansan: "안산", Jeonju: "전주", Cheonan: "천안", Changwon: "창원", Hwaseong: "화성", Namyangju: "남양주", Pohang: "포항", Jeju: "제주", "Jeju City": "제주", Gimhae: "김해", Pyeongtaek: "평택", Uijeongbu: "의정부", Paju: "파주", Siheung: "시흥", Gimpo: "김포", Gwangmyeong: "광명", Hanam: "하남", Anyang: "안양", Sejong: "세종" };
const COUNTRY = { US: "미국", JP: "일본", CN: "중국", CA: "캐나다", AU: "호주", VN: "베트남", DE: "독일", GB: "영국", SG: "싱가포르", TW: "대만", HK: "홍콩", PH: "필리핀", TH: "태국", NZ: "뉴질랜드", FR: "프랑스" };
export function regionOf(headers) {
  const c = headers.get("x-vercel-ip-country") || "";
  let city = ""; try { city = decodeURIComponent(headers.get("x-vercel-ip-city") || ""); } catch {}
  if (!c) return "알 수 없음";
  if (c === "KR") return CITY[city] || (city ? city.slice(0, 30) : "한국(기타)");
  return COUNTRY[c] || c;
}

const k = (day, name) => `a:${day}:${name}`;

// 화면에서 온 방문/행동 기록
export async function recordHit(h, req) {
  const ua = req.headers.get("user-agent") || "";
  const { day, hour } = kst();
  const vid = h.v, now = Date.now();
  const path = cleanPath(h.p);
  const C = [], touched = new Set();
  const hi = (name, field, n = 1) => { C.push(["HINCRBY", k(day, name), field, n]); touched.add(k(day, name)); };
  const pf = (name, id) => { C.push(["PFADD", k(day, name), id]); touched.add(k(day, name)); };

  if (h.t === "pv") {
    hi("c", "pv"); pf("uv", vid); hi("page", path); hi("hr", String(hour));
    const item = itemOfPath(path, h.q);
    if (item) { hi("book", item); pf("f2", vid); }
    if (h.s) { // 새 세션(브라우저 탭을 처음 연 방문)
      const src = sourceOf({ ref: h.r, utm: h.u, ua, host: req.headers.get("host") }) || "직접 방문";
      hi("c", "sess"); hi("src", src); hi("land", path); hi("dev", deviceOf(ua)); hi("os", osOf(ua)); hi("reg", regionOf(req.headers));
      if (h.n) hi("c", "newv");
      if (h.u?.c) hi("cmp", `${src} · ${String(h.u.c).slice(0, 40)}`);
      if (src !== "직접 방문") C.push(["SET", `a:v:${vid}`, src, "EX", 30 * 86400]);
      else C.push(["SET", `a:v:${vid}`, src, "EX", 30 * 86400, "NX"]);
    }
    C.push(["ZADD", "a:live", now, vid], ["ZREMRANGEBYSCORE", "a:live", 0, now - 30 * 60e3]);
  } else if (h.t === "ev") {
    if (h.e === "cart") {
      const ids = (Array.isArray(h.i) ? h.i : []).filter(x => /^(x-)?[a-z0-9-]{1,40}$/.test(x)).slice(0, 20);
      if (!ids.length) return;
      hi("c", "ev:cart"); pf("f3", vid); for (const id of ids) hi("cart", id);
    } else if (h.e === "checkout") {
      hi("c", "ev:checkout"); pf("f4", vid);
    } else if (h.e === "trial") {
      hi("c", "ev:trial");
    } else return;
    C.push(["ZADD", "a:live", now, vid]);
  } else return;
  for (const key of touched) C.push(["EXPIRE", key, TTL]);
  await pipe(C);
}

// 결제 승인 직후 서버에서 기록 (주문번호로 한 번만)
export async function recordPurchase({ orderId, paymentKey, amount, items, vid, approvedAt, method, test, orderName }) {
  if (!kvReady()) return;
  const [first] = await pipe([["SET", `a:ord:${orderId}`, "1", "NX", "EX", TTL]]);
  if (first !== "OK") return;
  const { day } = kst(approvedAt ? new Date(approvedAt) : new Date());
  const v = VID_RE.test(vid || "") ? vid : "";
  const [src0] = v ? await pipe([["GET", `a:v:${v}`]]) : [null];
  const src = src0 || "알 수 없음";
  const pre = test ? "t:" : "";
  const C = [["HINCRBY", k(day, "c"), pre + "orders", 1], ["HINCRBY", k(day, "c"), pre + "rev", amount]];
  if (!test) {
    C.push(["HINCRBY", k(day, "rsrc"), src, amount], ["HINCRBY", k(day, "osrc"), src, 1]);
    for (const id of items) C.push(["HINCRBY", k(day, "buy"), id, 1]);
    if (v) C.push(["PFADD", k(day, "f5"), v]);
  }
  for (const n of ["c", "rsrc", "osrc", "buy", "f5"]) C.push(["EXPIRE", k(day, n), TTL]);
  const rec = { o: orderId, k: paymentKey, a: amount, i: items, d: approvedAt || new Date().toISOString(), m: method || "", s: src, t: test ? 1 : 0, n: orderName || "" };
  C.push(["LPUSH", "a:orders", JSON.stringify(rec)], ["LTRIM", "a:orders", 0, 4999]);
  await pipe(C);
}
