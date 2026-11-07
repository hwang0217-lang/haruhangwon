import { timingSafeEqual, createHash } from "node:crypto";

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
