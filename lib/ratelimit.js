// 비밀번호 틀림 횟수 제한: IP마다 15분에 6번까지. Redis가 없으면 함수 인스턴스 메모리로 대신.
import { pipe, kvReady } from "./kv.js";
const MAX = 6, WIN = 15 * 60;
const mem = new Map();
export const ipOf = req => (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";

export async function tooMany(req, scope) {
  const key = `rl:${scope}:${ipOf(req)}`;
  if (kvReady()) { try { const [n] = await pipe([["GET", key]]); return Number(n || 0) >= MAX; } catch {} }
  const m = mem.get(key); return !!m && m.until > Date.now() && m.n >= MAX;
}
export async function failed(req, scope) {
  const key = `rl:${scope}:${ipOf(req)}`;
  if (kvReady()) { try { await pipe([["INCR", key], ["EXPIRE", key, WIN, "NX"]]); return; } catch {} }
  const m = mem.get(key);
  if (!m || m.until < Date.now()) mem.set(key, { n: 1, until: Date.now() + WIN * 1000 }); else m.n++;
}
export async function cleared(req, scope) {
  const key = `rl:${scope}:${ipOf(req)}`;
  mem.delete(key);
  if (kvReady()) { try { await pipe([["DEL", key]]); } catch {} }
}
