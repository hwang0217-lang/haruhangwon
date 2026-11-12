import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHmac, createDecipheriv, timingSafeEqual } from "node:crypto";

// 토스페이먼츠 결제 + 유료 파일 내려받기 공용 코드.
// 환경 변수(Vercel):
//   TOSS_CLIENT_KEY  API 개별 연동 클라이언트 키 (없으면 토스 문서 테스트 키)
//   TOSS_SECRET_KEY  API 개별 연동 시크릿 키   (없으면 토스 문서 테스트 키)
//   FILE_KEY         paid/*.bin 을 푸는 키 (scripts/encrypt-paid.mjs 로 만든 값)
const DOCS_TEST_CLIENT = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
const DOCS_TEST_SECRET = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";

export const clientKey = () => process.env.TOSS_CLIENT_KEY || DOCS_TEST_CLIENT;
export const secretKey = () => process.env.TOSS_SECRET_KEY || DOCS_TEST_SECRET;
export const isTest = () => secretKey().startsWith("test_");

export const LINK_DAYS = 7; // 내려받기 링크 유효 기간

const ROOT = process.cwd();

// 가격은 exam/data.json 하나만 기준으로 써요(사이트 표시가와 같게).
let _catalog;
export function catalog() {
  if (!_catalog) {
    const list = JSON.parse(readFileSync(join(ROOT, "exam/data.json"), "utf8"));
    let files = {};
    try { files = JSON.parse(readFileSync(join(ROOT, "paid/manifest.json"), "utf8")); } catch {}
    _catalog = Object.fromEntries(list.map(x => [x.id, { id: x.id, name: x.name, krw: x.krw, file: files[x.id] || null }]));
  }
  return _catalog;
}

// 주문번호: HR_<상품id>_<무작위 12자>  (토스 규칙: 6~64자, 영문·숫자·-·_)
export function itemFromOrderId(orderId) {
  const m = /^HR_([a-z0-9-]{2,30})_[A-Za-z0-9]{10,20}$/.exec(String(orderId || ""));
  return m ? catalog()[m[1]] || null : null;
}

const b64u = buf => Buffer.from(buf).toString("base64url");
const signKey = () => createHmac("sha256", process.env.FILE_KEY || secretKey()).update("haruhangwon-download-v1").digest();

export function makeToken(id, orderId) {
  const body = b64u(JSON.stringify({ i: id, o: orderId, e: Date.now() + LINK_DAYS * 864e5 }));
  return body + "." + b64u(createHmac("sha256", signKey()).update(body).digest());
}

export function readToken(token) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const want = createHmac("sha256", signKey()).update(body).digest();
  const got = Buffer.from(sig, "base64url");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return p.e > Date.now() ? p : { expired: true };
  } catch { return null; }
}

// paid/<id>.bin = iv(12) + tag(16) + AES-256-GCM 암호문
export function decryptPaid(id) {
  const key = Buffer.from(process.env.FILE_KEY || "", "base64");
  if (key.length !== 32) throw new Error("FILE_KEY 없음");
  const raw = readFileSync(join(ROOT, "paid", `${id}.bin`));
  const d = createDecipheriv("aes-256-gcm", key, raw.subarray(0, 12));
  d.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([d.update(raw.subarray(28)), d.final()]);
}

const auth = () => "Basic " + Buffer.from(secretKey() + ":").toString("base64");

export async function tossConfirm({ paymentKey, orderId, amount }) {
  const r = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: auth(), "Content-Type": "application/json", "Idempotency-Key": `confirm-${orderId}` },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}

export async function tossGet(paymentKey) {
  const r = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, { headers: { Authorization: auth() } });
  return { ok: r.ok, data: await r.json().catch(() => ({})) };
}

export const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
