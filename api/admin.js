// 관리자 API 하나로 묶음 (Vercel 무료 요금제 함수 개수 제한 때문)
//   POST ?a=login {password} · POST ?a=logout · GET ?a=stats&from&to · GET ?a=orders&from&to · POST ?a=refund {paymentKey, reason}
import { login, logout, guard, json } from "../lib/admin.js";
import { pipe, kvReady, hobj, kst, TTL } from "../lib/kv.js";
import { catalog, toss, testMode } from "../lib/pay.js";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const addDays = (s, n) => new Date(Date.parse(s + "T00:00:00Z") + n * 86400e3).toISOString().slice(0, 10);
function range(q) {
  const today = kst().day;
  let to = DAY_RE.test(q.get("to") || "") ? q.get("to") : today;
  let from = DAY_RE.test(q.get("from") || "") ? q.get("from") : addDays(to, -6);
  if (from > to) [from, to] = [to, from];
  const days = [];
  for (let d = from; d <= to && days.length < 366; d = addDays(d, 1)) days.push(d);
  return { from, to: days[days.length - 1], days };
}
const sumObj = (objs) => { const o = {}; for (const x of objs) for (const k in x) o[k] = (o[k] || 0) + x[k]; return o; };
const TOP = ["page", "land", "src", "cmp", "dev", "os", "reg", "book", "cart", "buy", "rsrc", "osrc", "hr"];

async function stats(q) {
  const { from, to, days } = range(q);
  const n = days.length, prevDays = days.map(d => addDays(d, -n));
  const C = [];
  for (const d of days) { C.push(["HGETALL", `a:${d}:c`], ["PFCOUNT", `a:${d}:uv`]); for (const t of TOP) C.push(["HGETALL", `a:${d}:${t}`]); }
  for (const d of prevDays) C.push(["HGETALL", `a:${d}:c`], ["PFCOUNT", `a:${d}:uv`]);
  const funnel = ["uv", "f2", "f3", "f4", "f5"];
  for (const f of funnel) C.push(["PFCOUNT", ...days.map(d => `a:${d}:${f}`)]);
  C.push(["PFCOUNT", ...prevDays.map(d => `a:${d}:uv`)]);
  const now = Date.now();
  C.push(["ZCOUNT", "a:live", now - 5 * 60e3, "+inf"]);
  const R = await pipe(C);
  let i = 0;
  const daily = [], tops = Object.fromEntries(TOP.map(t => [t, []]));
  for (const d of days) {
    const c = hobj(R[i++]), uv = Number(R[i++]) || 0;
    daily.push({ d, uv, pv: c.pv || 0, sess: c.sess || 0, orders: c.orders || 0, rev: c.rev || 0, c });
    for (const t of TOP) tops[t].push(hobj(R[i++]));
  }
  const prevDaily = [];
  for (const d of prevDays) { const c = hobj(R[i++]), uv = Number(R[i++]) || 0; prevDaily.push({ d, uv, pv: c.pv || 0, sess: c.sess || 0, orders: c.orders || 0, rev: c.rev || 0, c }); }
  const fun = funnel.map(() => Number(R[i++]) || 0);
  const prevUv = Number(R[i++]) || 0;
  const live = Number(R[i++]) || 0;
  const tot = sumObj(daily.map(x => x.c)), ptot = sumObj(prevDaily.map(x => x.c));
  const pack = (t, uv) => ({ uv, pv: t.pv || 0, sess: t.sess || 0, newv: t.newv || 0, cart: t["ev:cart"] || 0, checkout: t["ev:checkout"] || 0,
    trial: t["ev:trial"] || 0, orders: t.orders || 0, rev: t.rev || 0, torders: t["t:orders"] || 0, trev: t["t:rev"] || 0, refund: t.refund || 0 });
  const merged = {};
  for (const t of TOP) merged[t] = sumObj(tops[t]);
  const { byId } = catalog();
  const titles = {};
  for (const id of new Set([...Object.keys(merged.book), ...Object.keys(merged.cart), ...Object.keys(merged.buy)])) titles[id] = byId.get(id)?.title || id;
  return json(200, {
    from, to, days: n, live, test: testMode(),
    totals: pack(tot, fun[0]), prev: pack(ptot, prevUv),
    daily: daily.map(({ c, ...x }) => x), prevDaily: prevDaily.map(({ c, ...x }) => x),
    funnel: { visit: fun[0], view: fun[1], cart: fun[2], checkout: fun[3], buy: fun[4] },
    tops: merged, titles,
  });
}

// 주문: 우리 기록(Redis) + 토스 거래 내역으로 환불 상태 확인
const kstDay = iso => kst(new Date(iso)).day;
async function orders(q) {
  const { from, to } = range(q);
  const { byId } = catalog();
  const raw = kvReady() ? (await pipe([["LRANGE", "a:orders", 0, 4999]]))[0] || [] : [];
  const rows = new Map();
  for (const s of raw) {
    let r; try { r = JSON.parse(s); } catch { continue; }
    const day = kstDay(r.d);
    if (day < from || day > to || rows.has(r.o)) continue;
    rows.set(r.o, { orderId: r.o, paymentKey: r.k, at: r.d, amount: r.a, items: r.i, name: r.n, method: r.m, source: r.s, test: !!r.t, status: "DONE", refunded: 0 });
  }
  let tossOk = false, tossMsg = "";
  if (process.env.TOSS_SECRET_KEY) {
    const t = await toss(`/v1/transactions?startDate=${from}T00:00:00&endDate=${to}T23:59:59&limit=5000`);
    if (t.ok && Array.isArray(t.data)) {
      tossOk = true;
      const byOrder = new Map();
      for (const x of t.data) { const a = byOrder.get(x.orderId) || []; a.push(x); byOrder.set(x.orderId, a); }
      const need = [];
      for (const [oid, xs] of byOrder) {
        const last = xs[xs.length - 1], any = s => xs.some(x => x.status === s);
        const status = any("CANCELED") ? "CANCELED" : any("PARTIAL_CANCELED") ? "PARTIAL_CANCELED" : last.status;
        let r = rows.get(oid);
        if (!r) { r = { orderId: oid, paymentKey: last.paymentKey, at: xs[0].transactionAt, amount: 0, items: [], name: "", method: last.method || "", source: "기록 전 주문", test: testMode(), status, refunded: 0 }; rows.set(oid, r); need.push(r); }
        r.status = status; r.receipt = last.receiptUrl || "";
        if (status !== "DONE" && !need.includes(r)) need.push(r);
      }
      // 이름·환불액이 필요한 주문만 결제 상세 조회 (최대 40건)
      await Promise.all(need.slice(0, 40).map(async r => {
        const p = await toss(`/v1/payments/${encodeURIComponent(r.paymentKey)}`);
        if (!p.ok) return;
        const d = p.data;
        r.amount = r.amount || d.totalAmount; r.name = r.name || d.orderName; r.method = r.method || d.method;
        if (!r.items.length) r.items = String(d.metadata?.items || "").split(",").filter(Boolean);
        r.at = d.approvedAt || r.at; r.status = d.status; r.receipt = d.receipt?.url || r.receipt;
        r.refunded = (d.cancels || []).reduce((s, c) => s + (c.cancelAmount || 0), 0);
      }));
    } else tossMsg = t.data?.message || `토스 조회 실패 (${t.status})`;
  } else tossMsg = "토스 키가 없어 환불 상태를 확인하지 못했어요.";
  const list = [...rows.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)));
  for (const r of list) {
    if (r.status === "CANCELED" && !r.refunded) r.refunded = r.amount;
    r.titles = r.items.map(id => byId.get(id)?.title || id);
  }
  const real = list.filter(r => !r.test);
  const gross = real.reduce((s, r) => s + (r.amount || 0), 0), refunded = real.reduce((s, r) => s + (r.refunded || 0), 0);
  return json(200, { from, to, tossOk, tossMsg, test: testMode(), list,
    summary: { count: real.length, gross, refunded, net: gross - refunded, refunds: real.filter(r => r.refunded > 0).length, aov: real.length ? Math.round(gross / real.length) : 0,
      testCount: list.length - real.length } });
}

async function refund(request) {
  let b = {}; try { b = await request.json(); } catch {}
  const key = String(b.paymentKey || ""), reason = String(b.reason || "고객 요청 환불").slice(0, 100);
  if (!/^[A-Za-z0-9_-]{10,200}$/.test(key)) return json(400, { message: "결제 정보가 올바르지 않아요." });
  if (!process.env.TOSS_SECRET_KEY) return json(503, { message: "토스 키가 없어요." });
  const r = await toss(`/v1/payments/${encodeURIComponent(key)}/cancel`, { cancelReason: reason });
  if (!r.ok) return json(400, { message: r.data?.message || "환불에 실패했어요." });
  const amt = (r.data.cancels || []).reduce((s, c) => s + (c.cancelAmount || 0), 0);
  if (kvReady()) { const { day } = kst(); try { await pipe([["HINCRBY", `a:${day}:c`, testMode() ? "t:refund" : "refund", amt], ["EXPIRE", `a:${day}:c`, TTL]]); } catch {} }
  return json(200, { ok: true, status: r.data.status, refunded: amt });
}

async function handle(request) {
  const q = new URL(request.url).searchParams, a = q.get("a");
  if (request.method === "POST" && a === "login") return login(request);
  if (request.method === "POST" && a === "logout") return logout();
  const no = guard(request); if (no) return no;
  try {
    if (a === "stats") {
      if (!kvReady()) return json(503, { code: "no_kv", message: "방문 기록 저장소가 아직 연결되지 않았어요." });
      return await stats(q);
    }
    if (a === "orders") return await orders(q);
    if (a === "refund" && request.method === "POST") return await refund(request);
    if (a === "me") return json(200, { ok: true, kv: kvReady(), test: testMode() });
  } catch (e) { console.error("admin", e); return json(500, { message: "잠시 문제가 생겼어요. 다시 시도해 주세요." }); }
  return json(404, { message: "없는 요청이에요." });
}
export const GET = handle, POST = handle;
