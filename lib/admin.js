// 관리자 로그인: APP_PASSWORD로 확인 → 서명한 쿠키(14일). 비밀번호를 바꾸면 기존 로그인은 모두 풀림.
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { tooMany, failed, cleared } from "./ratelimit.js";

const COOKIE = "hr_admin", DAYS = 14;
const key = () => createHash("sha256").update("hr-admin-v1:" + (process.env.APP_PASSWORD || "")).digest();
const mac = body => createHmac("sha256", key()).update(body).digest("base64url");

export const json = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });

function samePw(given) {
  const a = createHash("sha256").update(String(given || "")).digest();
  const b = createHash("sha256").update(process.env.APP_PASSWORD || "").digest();
  return timingSafeEqual(a, b);
}
const cookie = (v, age) => `${COOKIE}=${v}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;

export async function login(request) {
  if (!process.env.APP_PASSWORD) return json(500, { message: "서버에 APP_PASSWORD가 설정되지 않았어요." });
  if (await tooMany(request, "admin")) return json(429, { message: "비밀번호를 여러 번 틀려서 15분 동안 잠겼어요. 잠시 후 다시 해 주세요." });
  let b = {}; try { b = await request.json(); } catch {}
  if (!samePw(b.password)) { await failed(request, "admin"); return json(401, { message: "비밀번호가 틀렸어요." }); }
  await cleared(request, "admin");
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + DAYS * 86400e3 })).toString("base64url");
  return json(200, { ok: true }, { "set-cookie": cookie(`${body}.${mac(body)}`, DAYS * 86400) });
}
export const logout = () => json(200, { ok: true }, { "set-cookie": cookie("", 0) });

// 로그인 안 됐으면 401 Response, 됐으면 null
export function guard(request) {
  if (!process.env.APP_PASSWORD) return json(500, { message: "서버에 APP_PASSWORD가 설정되지 않았어요." });
  const c = (request.headers.get("cookie") || "").split(/;\s*/).find(x => x.startsWith(COOKIE + "="));
  const [body, sig] = (c ? c.slice(COOKIE.length + 1) : "").split(".");
  if (body && sig) {
    const want = Buffer.from(mac(body)), got = Buffer.from(sig);
    if (want.length === got.length && timingSafeEqual(want, got)) {
      try { if (JSON.parse(Buffer.from(body, "base64url").toString()).exp > Date.now()) return null; } catch {}
    }
  }
  return json(401, { message: "로그인이 필요해요." });
}
