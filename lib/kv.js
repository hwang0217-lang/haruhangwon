// Upstash Redis(REST) 아주 작은 클라이언트. Vercel 저장소 연결 시 자동으로 생기는 환경 변수를 읽음.
const URL_ = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
export const kvReady = () => Boolean(URL_() && TOKEN());

// 명령 여러 개를 한 번에 보냄. 결과는 명령 순서대로 값 배열(에러난 명령은 null).
export async function pipe(cmds) {
  if (!cmds.length) return [];
  if (!kvReady()) throw new Error("KV_NOT_CONFIGURED");
  const out = [];
  for (let i = 0; i < cmds.length; i += 900) {
    const r = await fetch(URL_().replace(/\/$/, "") + "/pipeline", {
      method: "POST",
      headers: { Authorization: "Bearer " + TOKEN(), "content-type": "application/json" },
      body: JSON.stringify(cmds.slice(i, i + 900).map(c => c.map(String))),
    });
    if (!r.ok) throw new Error("KV_HTTP_" + r.status);
    const data = await r.json();
    for (const d of data) out.push(d && "result" in d ? d.result : null);
  }
  return out;
}
export const cmd = async (...c) => (await pipe([c]))[0];

// HGETALL 결과 [k,v,k,v] → {k:Number(v)}
export const hobj = arr => {
  const o = {};
  if (Array.isArray(arr)) for (let i = 0; i < arr.length; i += 2) o[arr[i]] = Number(arr[i + 1]) || 0;
  else if (arr && typeof arr === "object") for (const k in arr) o[k] = Number(arr[k]) || 0;
  return o;
};

// 한국 시간 기준 날짜/시
export function kst(d = new Date()) {
  const t = new Date(d.getTime() + 9 * 3600e3);
  return { day: t.toISOString().slice(0, 10), hour: t.getUTCHours(), dow: t.getUTCDay() };
}
export const TTL = 400 * 86400; // 일별 통계 보관 400일
