import { timingSafeEqual, createHash } from "node:crypto";
import { tooMany, failed } from "./ratelimit.js";

// 비밀번호(APP_PASSWORD)가 맞는지 확인. 길이 차이로 새지 않게 해시끼리 비교.
export function checkPassword(request) {
  const expected = process.env.APP_PASSWORD || "";
  if (!expected) return { ok: false, status: 500, message: "서버에 APP_PASSWORD가 설정되지 않았어요." };
  const given = request.headers.get("x-app-password") || "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b) ? { ok: true } : { ok: false, status: 401, message: "비밀번호가 틀렸어요." };
}

export const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

// 틀린 비밀번호를 여러 번 넣으면 15분 잠금 (IP 기준)
export async function guardPassword(request) {
  if (await tooMany(request, "factory")) return { ok: false, status: 429, message: "비밀번호를 여러 번 틀려서 15분 동안 잠겼어요." };
  const r = checkPassword(request);
  if (!r.ok && r.status === 401) await failed(request, "factory");
  return r;
}
