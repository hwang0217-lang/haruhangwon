import { json, paidOrder, readPaid, catalog } from "../../lib/pay.js";
// 책 파일 내려받기: 토스에 결제 완료를 확인한 주문의 책만 풀어서 보냄
export async function GET(request) {
  const u = new URL(request.url), orderId = u.searchParams.get("order"), id = u.searchParams.get("id"), ext = u.searchParams.get("f");
  if (!["pdf", "epub"].includes(ext)) return json(400, { message: "파일 형식이 올바르지 않아요." });
  const o = await paidOrder(orderId);
  if (o.error) return json(o.status, { message: o.error });
  const b = catalog().byId.get(id);
  if (!b || !o.items.includes(id)) return json(403, { message: "이 주문에 없는 책이에요." });
  let data; try { data = readPaid(id, ext); } catch (e) { return json(500, { message: "파일을 준비하지 못했어요. 고객센터로 알려 주세요." }); }
  const name = `${b.title.replace(/[\\/:*?"<>|]/g, "")}.${ext}`;
  return new Response(data, { status: 200, headers: {
    "content-type": ext === "pdf" ? "application/pdf" : "application/epub+zip",
    "content-disposition": `attachment; filename="${id}.${ext}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    "cache-control": "private, no-store", "x-robots-tag": "noindex" } });
}
