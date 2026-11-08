# 하루한권 디자인 레퍼런스 (2026-11-08)

원칙: 남의 디자인을 베끼지 않는다. **배치·정보 순서·패턴**만 가져오고, 색·폰트는 하루한권 토큰(`--bg --card --ink --muted --line --night --lamp --accent`)과 Gowun Batang / IBM Plex Sans KR / Black Han Sans 를 유지한다.

## 1단계 진단 (수정 전, 390px · 1280px)

| 페이지 | 문제 |
|---|---|
| index | ① 첫 화면에 가격·형식이 없다 ("무엇을·얼마에"가 3초 안에 안 보임) ② 히어로 오른쪽 책등 목록이 모바일에서 화면 아래로 잘려 구매와 무관한 장식이 첫 화면을 차지 ③ 신뢰 요소(환불·즉시 다운로드·기기)가 첫 화면에 없음 ④ 히어로 문구 줄바꿈이 "받습니\n다."처럼 어색함 |
| store | ① 램프 노랑 대신 파란 `--accent`라 홈과 브랜드가 끊김 ② 맨 위 "시안입니다" 띠가 첫 화면 한 줄을 먹음 ③ 카테고리 칩 12개가 모바일에서 3줄을 차지해 책이 늦게 보임 ④ 카드에 "바로 받기"·담기 버튼이 없어 표지를 눌러야만 구매 경로가 보임 ⑤ 환불·즉시 다운로드 안내가 맨 아래 푸터에만 있음 |
| book | ① **모바일 하단 고정 바의 "바로 구매하기" 글자가 한 글자씩 세로로 깨짐** (버튼 폭이 0으로 눌림) ② 데스크톱에서 가격·구매 버튼이 표지 아래 첫 화면 밖으로 밀림 ③ 후기 자리 없음 ④ FAQ에 환불·기기 질문이 없음(환불은 푸터에만) ⑤ 파란 `--accent`라 브랜드 램프색과 불일치 |

공통: 390px 가로 스크롤 없음, 콘솔 에러 0 (수정 전에도 OK).

## 2단계 Mobbin 레퍼런스

### 웹 섹션 (search_sections)

| 검색어 | 사례 | 가져올 것 (한 줄) |
|---|---|---|
| ebook landing page hero | [Webflow 전자책 히어로](https://mobbin.com/sites/sections/b65b5244-b5e7-4267-8c1d-eb8a1e9ddc36) | 왼쪽 "최신 책" 라벨+제목+버튼, 오른쪽 큰 표지 한 권 → 홈 히어로에 실제 책 표지 노출 |
| | [Webflow 책 상세 히어로](https://mobbin.com/sites/sections/726908af-fc60-43f2-8c68-2314c84a571a) | 상단에 "← 목록" + "목차 ▾" 고정 바 → 책 상세 상단 탭 유지 |
| | [Typeform 무료 전자책](https://mobbin.com/sites/sections/ef45c09f-c5e5-4a4f-83f0-d2d51b035d4a) | 작은 분류 라벨 → 큰 제목 → 한 줄 약속 → 버튼 1개의 순서 |
| digital product pricing section | [Dropbox Shop](https://mobbin.com/sites/sections/2e219475-f42f-4fd7-81c5-966e1abcc58f) | 상품명·가격·Buy 버튼을 한 카드 오른쪽에 묶음 → 책 상세 구매 카드 |
| | [Epidemic Sound](https://mobbin.com/sites/sections/2e9b00d8-3046-4435-b50d-877c5202d58d) | 가격 바로 아래 체크 리스트 3~4줄 → "받는 것" 체크 목록 |
| | [Height](https://mobbin.com/sites/sections/1974c03f-c0ff-4f8e-ae30-250355677442) | 가격 밑 회색 보조줄("평생 소장") → 가격 옆 "한 번 결제·평생 소장" |
| book table of contents preview | [AI in Design Report 챕터](https://mobbin.com/sites/sections/bde9e82a-b11e-446f-9858-76c20256b468) | 큰 번호 01 + "이 장에서 다루는 것" 리스트 → 목차 번호 강조 유지 |
| | [Jasper 코스 목차](https://mobbin.com/sites/sections/d6bb28c1-4ee0-4d1e-b66e-6db7c2f77198) | 장 제목 펼치기/접기 → 모바일 목차 3장만 펼치고 나머지 접기 |
| | [Webflow 챕터 시작](https://mobbin.com/sites/sections/3e59667d-4649-4e43-99e0-b0ac026dd093) | 장마다 "읽는 시간" 메타 → 장별 쪽수 대신 '읽는 시간' 표기 참고 |
| testimonials section | [Charma](https://mobbin.com/sites/sections/c0290423-031b-4760-845e-9200b1d08958) | 후기 카드 = 제목 한 줄 + 본문 + 출처 → 후기 생기면 쓸 카드 틀 |
| | [Better Stack](https://mobbin.com/sites/sections/bb6c7650-38bc-45d7-b355-7f521c7bd0f8) | 높이 다른 카드 벽 → 나중에 후기 많아질 때 배치 |
| | [Webflow Community](https://mobbin.com/sites/sections/24f4fa68-cd9f-4a24-bc91-bf9310a0061f) | 다크 배경 위 카드 대비 → 다크모드 후기 카드 대비 기준 |
| FAQ section | [Notion Q&A](https://mobbin.com/sites/sections/6c304a17-56d1-4f33-9818-d6cd696d2d1d) | 한 줄 질문 + 오른쪽 +/× 아이콘, 얇은 구분선 → FAQ 아코디언 |
| | [Readymag](https://mobbin.com/sites/sections/c9d4e91b-98a6-4405-b0a6-ab4c41b9fe5c) | FAQ 끝에 "문의하기" 큰 버튼 → FAQ 아래 문의 링크 |
| | [The New Yorker](https://mobbin.com/sites/sections/329d49e3-27e8-4a57-9838-d6089bf4ea8a) | "폰·컴퓨터·태블릿에서 읽기" 기기 질문을 따로 묶음 → 기기 FAQ 추가 |

### 웹 화면 (search_screens, web)

| 검색어 | 사례 | 가져올 것 |
|---|---|---|
| ebook store product detail page | [Snowflake 상품 상세](https://mobbin.com/screens/6862cb76-5ca3-4a2a-8549-78605ae78dea) | 제목 줄 오른쪽 끝에 주 버튼 "Get" 고정 + 아래 탭 → 데스크톱에서 구매 버튼을 첫 화면 위로 |
| | [Higgsfield 마켓 상세](https://mobbin.com/screens/714f85c9-29dd-4598-8a04-1d260fdbe3cc) | 설명 바로 밑 버튼 1개, 그 아래 숫자 요약 카드 → 제목 밑 핵심 숫자(쪽수·장·형식) |
| | [Google Gemini 스토리북](https://mobbin.com/screens/c02996b1-e07f-4aa4-b546-3bc27f202c75) | 펼친 책 지면 느낌의 미리보기 → 미리보기 종이 질감 유지 |
| digital product checkout | [Behance 파일 결제](https://mobbin.com/screens/d45412a6-7e4b-4f58-a548-a7359bbb0c91) | 결제창 왼쪽에 파일 형식·용량 → 장바구니에 EPUB·PDF 표기 |
| | [Mailchimp](https://mobbin.com/screens/26daaf6d-3037-44de-bd39-36d9dd414850) | 결제 버튼 위 체크 2개("약정 없음") → 결제 버튼 위 "즉시 다운로드·7일 환불" |
| | [Unity](https://mobbin.com/screens/dafb5331-af40-4800-a066-23bf625ccf3d) | "포함된 것" 접이식 목록 → 구매 카드 '받는 파일 2개' |

### iOS 화면 (search_screens, ios) — 모바일 책 카드·구매 버튼 배치

| 검색어 | 사례 | 가져올 것 |
|---|---|---|
| reading app book detail screen | [Apple Books 상세](https://mobbin.com/screens/b0fa0ae7-6ff3-4835-8809-35c55ac7e396) | 표지 → 제목 → 형식·쪽수 카드 안에 큰 버튼 1개 → 모바일 첫 화면 순서 |
| | [Deepstash 상세](https://mobbin.com/screens/8fa958b3-67a7-44b4-ac3b-9d04540cd388) | 하단에 떠 있는 둥근 카드 + 큰 버튼 + 보조 아이콘 버튼 → **모바일 하단 고정 구매 바** |
| | [Blinkist 읽기](https://mobbin.com/screens/ea3c48f7-2bb6-4fd2-aec0-01dc925042cf) | "25분 · 10장" 한 줄 메타 → 표지 옆 "2시간 · 11장 · 91쪽" |
| bookstore app home | [Amazon Kindle 추천](https://mobbin.com/screens/e70395ea-3ae3-4ed0-a4a9-4bd4b8b8530b) | 표지 아래 제목 2줄 + 형식 + 가격 순서 → 스토어 카드 정보 순서 |
| | [Apple Books 홈](https://mobbin.com/screens/e316b289-5086-4362-9b58-05711958f1da) | 분야별 가로 스크롤 선반 → 모바일 칩을 한 줄 가로 스크롤로 |
| | [Speechify 홈](https://mobbin.com/screens/443a92ae-15e0-4402-aca4-ec9d53b080ac) | 섹션 제목 + ">" 더보기 → 홈 추천 선반 |

### 흐름 (search_flows, web)

| 검색어 | 사례 | 가져올 것 |
|---|---|---|
| digital product purchase flow | [Skillshare 디지털 상품 구매](https://mobbin.com/flows/105dfe58-dfd4-4922-9993-b5268835efc9?tab=screens) | 오른쪽 고정 구매 카드: 가격 → Buy Now → "결제하면 파일 3개 열림" 잠금 목록 → 결제 후 같은 자리에서 다운로드 |
| | [Skillshare 상품 상세](https://mobbin.com/flows/621919b1-e50b-46b8-82bf-34dbc4323df4?tab=screens) | 본문 아래 FAQ에 "환불되나요?" 포함 → 책 상세 FAQ |
| | [Etsy 다운로드](https://mobbin.com/flows/ff5aa9f0-738f-4d42-9244-e4f54fd72673?tab=screens) | 주문 완료 화면에 "Ready to download" + 큰 다운로드 버튼 → 결제 완료 화면 |

## 3단계 21st 컴포넌트

검색(무료): hero, book/product card, pricing card, testimonial, FAQ accordion, sticky buy bar(drawer), table of contents.
`get_inspiration`로 "정적 HTML·한국어·다크모드·전자책" 기준 재정렬 → 단일 상품 가격 카드·아코디언·빈 후기·하단 드로어가 상위.

`get_component`로 가져온 것 (4개, 한도 5개 이내):

| 21st 컴포넌트 | 링크 | 바닐라 변환으로 쓴 부분 |
|---|---|---|
| Single Plan Pricing Card (ln-dev7/pricing-17) | https://21st.dev/@ln-dev7/components/pricing-17 | 큰 가격 + 옆에 취소선 원가/"한 번 결제", 꽉 찬 둥근 버튼, 버튼 아래 신뢰 배지 2~3개, 하단 환불 한 줄 |
| Accordion (ddoemonn/accordion) | https://21st.dev/@ddoemonn/components/accordion | 테두리 박스 안 구분선 리스트, 오른쪽 메타 텍스트, 셰브런 회전, `prefers-reduced-motion` 존중 → `<details>`로 구현 |
| Empty Testimonial (0xUrvish/empty-testimonial) | https://21st.dev/@0xUrvish/components/empty-testimonial | 겹친 종이 3장 일러스트 + "아직 후기가 없어요" + 점선 버튼 → "후기 준비 중" 자리 |
| Smooth Drawer (kokonutd/smooth-drawer) | https://21st.dev/@kokonutd/components/smooth-drawer | 하단 고정 카드의 가격 블록(가격+"평생 소장") + 꽉 찬 CTA → 모바일 하단 구매 바 |

React·Tailwind·motion 의존성은 하나도 들여오지 않았다. 전부 기존 CSS 토큰과 바닐라 JS로 다시 썼다.
