import { itemFromOrderId, tossConfirm, tossGet, makeToken, isTest, LINK_DAYS, json } from "../../lib/pay.js";

// 결제 승인: 금액을 서버 가격표와 맞춰 본 뒤 토스에 승인 요청 → 내려받기 링크 발급.
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return json(400, { message: "요청 형식이 잘못됐어요." }); }
  const { paymentKey, orderId } = body || {};
  const amount = Number(body?.amount);
  const item = itemFromOrderId(orderId);
  if (!paymentKey || !item) return json(400, { message: "주문 정보를 찾을 수 없어요." });
  if (amount !== item.krw) return json(400, { message: "결제 금액이 상품 가격과 달라요. 결제가 승인되지 않았어요." });

  let { ok, data } = await tossConfirm({ paymentKey, orderId, amount });
  // 새로고침 등으로 이미 승인된 결제면 결제 정보를 다시 읽어서 확인
  if (!ok && data.code === "ALREADY_PROCESSED_PAYMENT") ({ ok, data } = await tossGet(paymentKey));
  if (!ok) return json(400, { code: data.code, message: data.message || "결제 승인에 실패했어요." });
  if (data.status !== "DONE" || data.orderId !== orderId || data.totalAmount !== item.krw)
    return json(400, { message: "결제가 완료되지 않았어요." });

  return json(200, {
    ok: true,
    id: item.id,
    name: item.name,
    amount: data.totalAmount,
    method: data.method,
    orderId,
    receipt: data.receipt?.url || null,
    download: `/api/pay/download?t=${makeToken(item.id, orderId)}`,
    days: LINK_DAYS,
    test: isTest(),
  });
}
