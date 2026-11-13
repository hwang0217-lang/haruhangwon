import { json, priceOrder } from "../../lib/pay.js";
// 결제창 열기 전에 서버가 계산한 금액·주문명을 받음
export async function POST(request) {
  let b = {}; try { b = await request.json(); } catch {}
  const q = priceOrder(b.items, b.bump);
  if (q.error) return json(400, { message: q.error });
  return json(200, q);
}
