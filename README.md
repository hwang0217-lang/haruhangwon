# 하루한권 (haruhangwon.kr)

정적 사이트. `index.html` = 홈페이지, `store.html` = 판매 페이지(결제는 아직 시안).
Vercel에 이 폴더를 그대로 올리면 됩니다.

## 전자책 공장 (/factory) — 형 전용
비밀번호로 잠긴 전자책 제작 도구. 주소: `haruhangwon.kr/factory`
- 화면: `factory/index.html` (빌드 결과. 수정은 `factory-src/app.html`, `factory-src/shim.html` 후 `factory-src/build.sh`)
- 서버: `api/factory/claude.js`(Claude API, 스트리밍), `api/factory/login.js`(비밀번호 확인), `lib/factory-auth.js`
- Vercel 환경 변수: `ANTHROPIC_API_KEY`, `APP_PASSWORD`, (선택) `CLAUDE_MODEL` 기본 `claude-opus-5-5`

## 검색·공유 (SEO)
`node scripts/build-seo.cjs` → 책별 페이지 `b/<id>.html`(주소 `/b/<id>`), 공유 미리보기 이미지 `og/*.png`, `sitemap.xml`, `robots.txt`를 다시 만듭니다.
`books.js`나 `book.html`을 고친 뒤 꼭 다시 실행하세요. (Playwright가 있어야 이미지가 만들어집니다)
