// 검색·공유용 파일 만들기: 책마다 /b/<id> 페이지, 공유 미리보기 이미지(og/), sitemap.xml, robots.txt
// 사용법: node scripts/build-seo.cjs   (books.js나 book.html을 고친 뒤 다시 실행)
const fs = require("fs"), path = require("path"), vm = require("vm");
const R = path.join(__dirname, ".."), SITE = "https://haruhangwon.kr";
const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(R, "books.js"), "utf8") + ";this.BOOKS=BOOKS;this.coverSVG=coverSVG;this.won=won;", ctx);
const { BOOKS, coverSVG, won } = ctx;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const today = new Date().toISOString().slice(0, 10);

// 1) 책별 페이지
const tpl = fs.readFileSync(path.join(R, "book.html"), "utf8");
fs.mkdirSync(path.join(R, "b"), { recursive: true });
for (const b of BOOKS) {
  const url = `${SITE}/b/${b.id}`, title = `${b.title} | 하루한권`;
  const desc = `${b.sub}. ${b.pages}쪽 실전 전자책(EPUB·PDF), ${won(b.price)}. ${b.summary[0]}`.slice(0, 155);
  const ld = { "@context": "https://schema.org", "@type": "Product", name: b.title, description: b.summary.join(" "), image: `${SITE}/og/${b.id}.png`, category: b.cat, brand: { "@type": "Brand", name: "하루한권" },
    offers: { "@type": "Offer", url, priceCurrency: "KRW", price: b.price, availability: "https://schema.org/InStock" } };
  let s = tpl
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(b.title)}">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}">\n<meta property="og:type" content="product">\n<meta property="og:image" content="${SITE}/og/${b.id}.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">\n<link rel="canonical" href="${url}">\n<script type="application/ld+json">${JSON.stringify(ld)}</script>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace('<script src="/books.js"></script>', `<script>window.BOOK_ID=${JSON.stringify(b.id)}</script>\n<script src="/books.js"></script>`);
  fs.writeFileSync(path.join(R, "b", `${b.id}.html`), s);
}

// 2) 홈·스토어에 공유 이미지/캐노니컬 넣기 (한 번만)
for (const [f, u] of [["index.html", "/"], ["store.html", "/store"]]) {
  let s = fs.readFileSync(path.join(R, f), "utf8");
  if (!s.includes('property="og:image"')) {
    s = s.replace(/(<meta property="og:url"[^>]*>)/, `$1\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="하루한권">\n<meta property="og:image" content="${SITE}/og/home.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">\n<link rel="canonical" href="${SITE}${u}">`);
    fs.writeFileSync(path.join(R, f), s);
  }
}

// 3) sitemap.xml, robots.txt
const urls = ["/", "/store", ...BOOKS.map(b => `/b/${b.id}`), "/terms", "/privacy"];
fs.writeFileSync(path.join(R, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(R, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /factory\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);

// 4) 공유 미리보기 이미지 1200x630 (Playwright 필요)
(async () => {
  let chromium; try { ({ chromium } = require("playwright")); } catch { console.log("playwright 없음: og 이미지는 건너뜀"); return; }
  fs.mkdirSync(path.join(R, "og"), { recursive: true });
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const font = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@500;700&display=swap">`;
  const shell = (bg, ink, inner) => `<!doctype html><html><head><meta charset="utf-8">${font}<style>*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;background:${bg};color:${ink};font-family:'IBM Plex Sans KR',sans-serif;display:flex;align-items:center;gap:56px;padding:0 72px;overflow:hidden}.c{flex:none;width:330px;height:528px;border-radius:10px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.25)}.c svg{width:100%;height:100%;display:block}h1{word-break:keep-all;font-family:'Gowun Batang',serif;font-size:56px;line-height:1.25;letter-spacing:-1px}p{font-size:28px;margin-top:22px;opacity:.85;line-height:1.45}.m{margin-top:34px;font-size:26px;font-weight:700;display:flex;gap:18px;align-items:center}.m span{padding:8px 18px;border-radius:999px}.u{position:absolute;right:72px;bottom:36px;font-size:22px;opacity:.7}</style></head><body>${inner}</body></html>`;
  for (const b of BOOKS) {
    const c = b.cover;
    await page.setContent(shell(c.bg, c.ink, `<div class="c">${coverSVG(b)}</div><div><h1>${esc(b.title)}</h1><p>${esc(b.sub)}</p><div class="m"><span style="background:${c.ac};color:#fff">${won(b.price)}</span><span style="border:2px solid ${c.ink}">${b.pages}쪽 · EPUB·PDF</span></div></div><div class="u">하루한권 · haruhangwon.kr</div>`), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(R, "og", `${b.id}.png`) });
  }
  const picks = ["buy-agent", "partners", "shorts"].map(id => BOOKS.find(b => b.id === id));
  await page.setContent(shell("#141C2B", "#F7F3EA", `<div><h1 style="font-size:52px;word-break:keep-all">하루 저녁에 읽고<br>다음 날 써먹는 전자책</h1><p>부업·재테크·취업 실전서 ${BOOKS.length}권<br>${won(Math.min(...BOOKS.map(b=>b.price)))}부터, 결제 즉시 EPUB·PDF</p><div class="m"><span style="background:#F2B84B;color:#141C2B">haruhangwon.kr</span></div></div><div style="display:flex;gap:-40px;margin-left:auto">${picks.map((b, i) => `<div class="c" style="width:200px;height:320px;margin-left:${i ? -60 : 0}px;transform:rotate(${(i - 1) * 5}deg)">${coverSVG(b)}</div>`).join("")}</div>`), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(R, "og", "home.png") });
  await browser.close();
  console.log(`done: ${BOOKS.length} pages + og images`);
})();
