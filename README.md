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

## 결제 (토스페이먼츠) — 합격플랜 시험 파일
- 결제 화면: `pay.html` (주소 `/pay?item=<시험 id>`). `exam/data.json`·`exams.html`의 `buy`가 이 주소예요.
- 서버: `api/pay/config.js`(클라이언트 키), `api/pay/confirm.js`(금액 확인 후 토스 승인 → 7일짜리 내려받기 링크), `api/pay/download.js`(링크 확인 후 파일 전달), 공용 `lib/pay.js`
- 가격 기준은 `exam/data.json`의 `krw` 하나예요. 결제 금액이 이 값과 다르면 승인하지 않아요.
- 유료 파일: `paid/<id>.bin` = 크몽 발송 zip을 AES-256-GCM으로 암호화한 것(공개 저장소라 원본은 올리지 않음). 파일을 바꾸면
  `FILE_KEY=<기존 키> node scripts/encrypt-paid.mjs <zip 폴더>` 로 다시 만들어요.
- Vercel 환경 변수: `TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`(토스 상점관리자 > 개발 연동 > API 개별 연동 키), `FILE_KEY`.
  셋 다 없으면 토스 문서의 테스트 키로 돌아가고(돈이 나가지 않음), 파일 대신 체험판이 내려받아져요.
