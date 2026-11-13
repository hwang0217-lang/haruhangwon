import { json, paidOrder, catalog, publicBook } from "../../lib/pay.js";
// 주문번호로 다시 받기: 결제 끝난 주문의 책 목록
export async function GET(request) {
  const orderId = new URL(request.url).searchParams.get("order");
  const o = await paidOrder(orderId);
  if (o.error) return json(o.status, { message: o.error });
  const { byId } = catalog();
  return json(200, { orderId, amount: o.payment.totalAmount, approvedAt: o.payment.approvedAt, books: o.items.filter(id => byId.has(id)).map(id => publicBook(byId.get(id))) });
}
