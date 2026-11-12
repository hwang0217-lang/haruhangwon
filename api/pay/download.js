import { readToken, catalog, decryptPaid, isTest } from "../../lib/pay.js";

const page = (status, msg) =>
  new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>하루한권</title><body style="font-family:sans-serif;max-width:560px;margin:60px auto;padding:0 16px;line-height:1.7"><h1 style="font-size:22px">${msg}</h1><p>도움이 필요하면 주문번호와 함께 고객센터로 알려 주세요.</p><p><a href="/exams">합격플랜 목록으로</a></p>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });

export function GET(request) {
  const t = readToken(new URL(request.url).searchParams.get("t"));
  if (!t) return page(403, "내려받기 링크가 올바르지 않아요.");
  if (t.expired) return page(410, "내려받기 링크 기간이 끝났어요.");
  const item = catalog()[t.i];
  if (!item) return page(404, "상품을 찾을 수 없어요.");

  if (!process.env.FILE_KEY || !item.file) {
    // 테스트 모드에서 파일 키가 아직 없으면 체험판으로 흐름만 확인
    if (isTest()) return Response.redirect(new URL(`/trial/${item.id}.html`, request.url), 302);
    return page(500, "파일 준비 중 문제가 생겼어요.");
  }
  let buf;
  try { buf = decryptPaid(item.id); } catch { return page(500, "파일 준비 중 문제가 생겼어요."); }
  return new Response(buf, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="haruhangwon-${item.id}.zip"; filename*=UTF-8''${encodeURIComponent(item.file)}`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
}
