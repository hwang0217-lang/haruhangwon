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
- 합격플랜 20종: `/checkout?item=x-<시험id>` 단독 결제, zip 1개. 가격은 `exam/data.json`의 krw.
- 테스트 키(`test_`)로 승인된 주문은 실제 파일 대신 안내 txt만 내려받아짐(무료 유출 방지).
- 책 파일: 저장소가 공개라서 `paid/*.enc`(AES-256-GCM으로 잠금)만 올림. 새 책을 추가하면 `FILE_KEY=... node scripts/encrypt-books.cjs <books/out 폴더> <x-<id>.zip 폴더>` 다시 실행.
- Vercel 환경 변수: `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`, `FILE_KEY`. 셋 다 있어야 결제 버튼이 켜짐.

## 방문 통계 + 관리자 (/admin) — 형 전용
- 주소: `haruhangwon.kr/admin` (비밀번호 = `APP_PASSWORD`, 15분에 6번 틀리면 잠김, 로그인 14일 유지)
- 수집: 모든 페이지 `</head>` 앞의 `/a.js` → `api/a.js`. 쿠키 없이 브라우저에 무작위 방문자 번호(`hr-vid`)만 저장. 장바구니 담기·결제 시작·체험판도 기록. 결제는 `api/pay/confirm.js`가 서버에서 기록.
- 저장: Upstash Redis (Vercel 저장소 `haruhangwon-analytics`, 환경 변수 `KV_REST_API_URL`, `KV_REST_API_TOKEN`). 일별 키 `a:<날짜>:*`, 400일 보관.
- 화면: `admin.html`, API: `api/admin.js` (`?a=login|logout|me|stats|orders|refund`). 무료 요금제 함수 개수(12개) 때문에 하나로 묶음.
- 새 페이지를 만들면 `<script src="/a.js" defer></script>`를 `</head>` 앞에 꼭 넣기.
