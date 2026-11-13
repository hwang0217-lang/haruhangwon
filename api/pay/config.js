import { json } from "../../lib/pay.js";
// 화면에서 쓸 토스 클라이언트 키(공개돼도 되는 키). 시크릿 키는 절대 내보내지 않음.
export function GET() {
  const clientKey = process.env.TOSS_CLIENT_KEY || "";
  const ready = Boolean(clientKey && process.env.TOSS_SECRET_KEY && process.env.FILE_KEY);
  return json(200, { ready, clientKey: ready ? clientKey : "", mode: /^test_/.test(clientKey) ? "test" : "live" });
}
