import { json, priceOrder, toss, itemsOf, ORDER_RE, catalog, publicBook } from "../../lib/pay.js";
// 결제 승인: 토스가 successUrl로 돌려보낸 뒤 화면이 호출.
// 1) 장바구니 금액을 서버에서 다시 계산해 결제 금액과 같을 때만 승인
// 2) 승인된 결제에 적힌 책 목록(metadata)이 장바구니와 다르면 바로 취소
export async function POST(request) {
  if (!process.env.TOSS_SECRET_KEY) return json(503, { message: "결제 설정이 아직 안 됐어요." });
  let b = {}; try { b = await request.json(); } catch {}
  const { paymentKey, orderId } = b, amount = Number(b.amount);
  const items = String(b.items || "").split(",").filter(Boolean), bump = String(b.bump || "");
  if (!paymentKey || typeof paymentKey !== "string" || paymentKey.length > 200 || !ORDER_RE.test(orderId || "")) return json(400, { message: "결제 정보가 올바르지 않아요." });
  const q = priceOrder(items, bump);
  if (q.error || q.amount !== amount) return json(400, { message: "결제 금액이 맞지 않아 승인하지 않았어요. 돈은 빠져나가지 않습니다." });

  let r = await toss("/v1/payments/confirm", { paymentKey, orderId, amount });
  let p = r.data;
  if (!r.ok) {
    if (r.data?.code !== "ALREADY_PROCESSED_PAYMENT") return json(400, { message: r.data?.message || "결제 승인에 실패했어요.", code: r.data?.code });
    const again = await toss(`/v1/payments/${encodeURIComponent(paymentKey)}`); p = again.data || {};
  }
  if (p.status !== "DONE" || p.orderId !== orderId) return json(400, { message: "결제가 끝나지 않았어요." });
  const paidItems = itemsOf(p);
  const same = paidItems.join(",") === items.join(",") && String(p.metadata?.bump || "") === bump && Number(p.totalAmount) === amount;
  if (!same) {
    await toss(`/v1/payments/${encodeURIComponent(paymentKey)}/cancel`, { cancelReason: "주문 정보 불일치 자동 취소" });
    return json(400, { message: "주문 정보가 맞지 않아 결제를 자동으로 취소했어요." });
  }
  const { byId } = catalog();
  return json(200, { orderId, amount, approvedAt: p.approvedAt, receipt: p.receipt?.url || "", books: items.map(id => publicBook(byId.get(id))) });
}
