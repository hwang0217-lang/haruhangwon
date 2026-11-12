import { clientKey, isTest, json } from "../../lib/pay.js";

// 결제 화면이 쓸 공개 클라이언트 키. 라이브 키로 바꿀 때 Vercel 환경 변수만 바꾸면 돼요.
export function GET() {
  return json(200, { clientKey: clientKey(), test: isTest() });
}
