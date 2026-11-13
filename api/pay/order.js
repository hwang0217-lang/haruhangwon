import { json, paidOrder, ticketOrder, catalog, publicBook } from "../../lib/pay.js";
// 다시 받기: 증표(t) 또는 주문번호(order)로 결제 끝난 주문의 상품 목록
export async function GET(request) {
  const q = new URL(request.url).searchParams, t = q.get("t");
  const { byId } = catalog();
  if (t) {
    const o = await ticketOrder(t);
    if (o.error) return json(o.status, { message: o.error });
    return json(200, { orderId: o.orderId, ticket: t, amount: o.amount, approvedAt: o.approvedAt, books: o.items.filter(id => byId.has(id)).map(id => publicBook(byId.get(id))) });
  }
  const orderId = q.get("order");
  const o = await paidOrder(orderId);
  if (o.error) return json(o.status, { message: o.status === 404 ? "주문번호로 찾지 못했어요. 결제한 기기의 구매내역이나 결제 완료 화면의 링크로 받아 주세요." : o.error });
  return json(200, { orderId, amount: o.payment.totalAmount, approvedAt: o.payment.approvedAt, books: o.items.filter(id => byId.has(id)).map(id => publicBook(byId.get(id))) });
}
