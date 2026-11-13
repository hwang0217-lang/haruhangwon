// 결제 공통: 책 가격·할인 계산(books.js 그대로 사용), 토스페이먼츠 API 호출, 잠긴 파일 풀기
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const ROOT = process.cwd();
let CAT = null;
export function catalog() {
  if (CAT) return CAT;
  const ctx = { localStorage: { getItem: () => null, setItem() {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "books.js"), "utf8") +
    ";this.BOOKS=BOOKS;this.cartDeals=cartDeals;this.bumpPick=bumpPick;", ctx);
  CAT = { BOOKS: ctx.BOOKS, cartDeals: ctx.cartDeals, bumpPick: ctx.bumpPick, byId: new Map(ctx.BOOKS.map(b => [b.id, b])) };
  return CAT;
}

// 장바구니 → 결제 금액. 화면과 똑같은 계산을 서버에서 다시 해서 금액 조작을 막음.
export function priceOrder(items, bump) {
  const { byId, cartDeals, bumpPick } = catalog();
  if (!Array.isArray(items) || !items.length || items.length > 100) return { error: "담긴 책이 없어요." };
  if (new Set(items).size !== items.length || items.some(id => !byId.has(id))) return { error: "없는 책이 섞여 있어요." };
  // '함께 사기' 할인은 화면이 권한 그 책일 때만 (권하기 전 장바구니가 6권 미만)
  if (bump) {
    const before = items.filter(id => id !== bump);
    if (!items.includes(bump) || before.length >= 6 || bumpPick(before) !== bump) bump = null;
  }
  const d = cartDeals(items, bump || null);
  const first = byId.get(items[0]).title;
  const orderName = (items.length > 1 ? `${first.slice(0, 80)} 외 ${items.length - 1}권` : first).slice(0, 100);
  return { amount: d.total, orderName, bump: bump || "" };
}

export const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

const secret = () => process.env.TOSS_SECRET_KEY || "";
export async function toss(pathname, body) {
  const r = await fetch("https://api.tosspayments.com" + pathname, {
    method: body ? "POST" : "GET",
    headers: { Authorization: "Basic " + Buffer.from(secret() + ":").toString("base64"), "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {}; try { data = await r.json(); } catch {}
  return { ok: r.ok, status: r.status, data };
}

export const ORDER_RE = /^[A-Za-z0-9_=-]{6,64}$/;
export const itemsOf = p => String(p?.metadata?.items || "").split(",").filter(Boolean);

// 결제가 끝났고 취소되지 않은 주문인지 토스에 직접 물어봄
export async function paidOrder(orderId) {
  if (!secret()) return { error: "결제 설정이 아직 안 됐어요.", status: 503 };
  if (!ORDER_RE.test(orderId || "")) return { error: "주문번호가 올바르지 않아요.", status: 400 };
  const r = await toss(`/v1/payments/orders/${encodeURIComponent(orderId)}`);
  if (!r.ok) return { error: "주문을 찾지 못했어요.", status: 404 };
  if (r.data.status !== "DONE") return { error: r.data.status === "CANCELED" || r.data.status === "PARTIAL_CANCELED" ? "환불된 주문이에요." : "결제가 끝나지 않은 주문이에요.", status: 403 };
  return { payment: r.data, items: itemsOf(r.data) };
}

export function readPaid(id, ext) {
  const key = Buffer.from(process.env.FILE_KEY || "", "base64url");
  if (key.length !== 32) throw new Error("FILE_KEY");
  const buf = fs.readFileSync(path.join(ROOT, "paid", `${id}.${ext}.enc`));
  const d = crypto.createDecipheriv("aes-256-gcm", key, buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]);
}

export const publicBook = b => ({ id: b.id, title: b.title });
