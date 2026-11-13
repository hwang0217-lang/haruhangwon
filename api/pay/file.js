import { json, paidOrder, readPaid, catalog, testMode } from "../../lib/pay.js";
// 책 파일 내려받기: 토스에 결제 완료를 확인한 주문의 책만 풀어서 보냄
export async function GET(request) {
  const u = new URL(request.url), orderId = u.searchParams.get("order"), id = u.searchParams.get("id"), ext = u.searchParams.get("f");
  const o = await paidOrder(orderId);
  if (o.error) return json(o.status, { message: o.error });
  const b = catalog().byId.get(id);
  if (!b || !o.items.includes(id)) return json(403, { message: "이 주문에 없는 상품이에요." });
  if (!b.files.includes(ext)) return json(400, { message: "파일 형식이 올바르지 않아요." });
  // 테스트 키로 결제한 주문은 진짜 돈이 오가지 않으므로 실제 파일 대신 안내 파일만 줌
  if (testMode()) return new Response(`하루한권 테스트 결제 확인용 파일\n\n상품: ${b.title} (${ext})\n주문번호: ${orderId}\n\n테스트 결제라서 실제 파일 대신 이 안내 파일을 드려요. 라이브 키로 바꾸면 실제 파일이 내려받아집니다.\n`, {
    status: 200, headers: { "content-type": "text/plain; charset=utf-8", "content-disposition": `attachment; filename="test-${id}.txt"`, "cache-control": "no-store" } });
  let data; try { data = readPaid(id, ext); } catch (e) { return json(500, { message: "파일을 준비하지 못했어요. 고객센터로 알려 주세요." }); }
  const name = `${b.title.replace(/[\\/:*?"<>|]/g, "")}.${ext}`;
  return new Response(data, { status: 200, headers: {
    "content-type": { pdf: "application/pdf", epub: "application/epub+zip", zip: "application/zip" }[ext],
    "content-disposition": `attachment; filename="${id}.${ext}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    "cache-control": "private, no-store", "x-robots-tag": "noindex" } });
}
