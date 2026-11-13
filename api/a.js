// 방문 기록 받기 (화면의 /a.js가 sendBeacon으로 보냄). 실패해도 화면에는 영향 없음.
import { recordHit, isBot, VID_RE } from "../lib/track.js";
import { kvReady } from "../lib/kv.js";

const ok = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
export async function POST(request) {
  try {
    if (!kvReady()) return ok();
    const ua = request.headers.get("user-agent") || "";
    if (isBot(ua)) return ok();
    const text = await request.text();
    if (text.length > 4000) return ok();
    const h = JSON.parse(text);
    if (!h || !VID_RE.test(h.v || "")) return ok();
    await recordHit(h, request);
  } catch (e) { console.error("track", e.message); }
  return ok();
}
