# 하루한권 (haruhangwon.kr)

정적 사이트. `index.html` = 홈페이지, `store.html` = 판매 페이지(토스페이먼츠 실결제).
Vercel에 이 폴더를 그대로 올리면 됩니다.

## 전자책 공장 (/factory) — 형 전용
비밀번호로 잠긴 전자책 제작 도구. 주소: `haruhangwon.kr/factory`
- 화면: `factory/index.html` (빌드 결과. 수정은 `factory-src/app.html`, `factory-src/shim.html` 후 `factory-src/build.sh`)
- 서버: `api/factory/claude.js`(Claude API, 스트리밍), `api/factory/login.js`(비밀번호 확인), `lib/factory-auth.js`
- Vercel 환경 변수: `ANTHROPIC_API_KEY`, `APP_PASSWORD`, (선택) `CLAUDE_MODEL` 기본 `claude-opus-5-5`

## 검색·공유 (SEO)
`node scripts/build-seo.cjs` → 책별 페이지 `b/<id>.html`(주소 `/b/<id>`), 공유 미리보기 이미지 `og/*.png`, `sitemap.xml`, `robots.txt`를 다시 만듭니다.
`books.js`나 `book.html`을 고친 뒤 꼭 다시 실행하세요. (Playwright가 있어야 이미지가 만들어집니다)

## 결제 (토스페이먼츠)
- 흐름: `store.html` 장바구니 → 토스 결제창(키가 `_ck_`면 결제창, `_gck_`면 결제위젯) → `/pay/success`가 `api/pay/confirm` 호출(서버가 `books.js`로 금액을 다시 계산해 맞을 때만 승인) → PDF·EPUB 내려받기.
- 다시 받기: `/orders`에서 주문번호 입력. `api/pay/file`이 매번 토스에 결제 완료(DONE)를 확인하고, 환불된 주문은 막음.
- 책 파일: 저장소가 공개라서 `paid/*.enc`(AES-256-GCM으로 잠금)만 올림. 새 책을 추가하면 `FILE_KEY=... node scripts/encrypt-books.cjs <books/out 폴더>` 다시 실행.
- Vercel 환경 변수: `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`, `FILE_KEY`. 셋 다 있어야 결제 버튼이 켜짐.
