/* 하루한권 책 데이터 + 표지 생성기. store.html, book.html이 같이 씁니다. */
const BOOKS = [
{ id:"job-pass", cat:"취업", price:19900, was:29000, pages:77, chapters:10, checks:60,
  title:"신입 합격 자소서·면접 템플릿북", sub:"문항별 템플릿과 기출 질문 60개로 끝내는 서류·면접",
  cover:{lines:["신입 합격","자소서·면접","템플릿북"], hook:"쓰는 순서부터 답하는 순서까지", bg:"#EAF0FF", ink:"#14244F", ac:"#E2483D", motif:"doc", layout:"top"},
  summary:["지원 동기부터 자유 형식까지, 자소서에 자주 나오는 문항 12개를 빈칸 템플릿으로 드립니다.", "경험 20개를 꺼내 STAR-L로 쪼개고 직무 역량과 연결하는 순서를 표로 따라 합니다.", "기출 질문 60개의 답변 뼈대와 1분 자기소개 템플릿으로 면접까지 한 권에 준비합니다."],
  pains:["자소서 첫 문장을 쓰는 데만 하루가 걸린다.", "내 경험이 너무 평범해서 쓸 게 없는 것 같다.", "서류는 붙는데 면접에서 매번 말이 꼬인다.", "회사마다 문항이 달라 매번 처음부터 다시 쓴다."],
  who:["처음 공채를 준비하는 취업준비생", "서류 탈락이 반복되는 신입 지원자", "면접 답변을 구조로 정리하고 싶은 분", "공기업·사기업을 함께 준비하는 분"],
  toc:[["서류에서 떨어지는 진짜 이유", "누가, 얼마 동안 읽는가", "평가하는 것은 딱 두 가지", "탈락하는 자기소개서의 7가지 특징"], ["쓰기 전에: 경험 창고 만들기", "경험 20개 꺼내기", "STAR-L로 경험 쪼개기", "경험과 역량 연결표"], ["합격 문장의 규칙", "두괄식: 첫 문장이 답이다", "소제목 공식 5가지", "고쳐 쓰기 연습"], ["문항별 템플릿 12개", "지원 동기·입사 후 포부", "협업·실패·도전 경험", "직무 역량과 자유 형식"], ["직무별로 강조할 점", "영업·마케팅·생산", "IT·사무·공공기관", "중고 신입이라면"], ["완성 자기소개서 예시 3편", "식품회사 품질관리", "IT 서비스 기업 마케팅", "공공기관 사무행정 (블라인드)"], ["제출 전 점검", "제출 전 점검표 20", "맞춤법에서 자주 틀리는 것"], ["면접 준비", "1분 자기소개 템플릿", "답변의 기본 구조: PREP", "꼬리질문과 모르는 질문 대비"], ["기출 질문 60과 답변 뼈대", "기본·경험 질문 30", "직무·압박 질문 20", "회사·산업 질문 10"], ["부록: 워크시트", "기업 분석 한 장 요약", "면접 답변·복기 노트", "지원 현황표"]],
  preview:"자기소개서를 읽는 사람은 보통 인사팀 담당자와 현업 실무자입니다. 공채 시즌에는 한 사람이 하루에 수십, 많게는 수백 개의 서류를 봅니다. 한 편을 처음부터 끝까지 정독하기보다 소제목과 첫 문장을 먼저 훑고, 걸리는 부분이 있을 때 본문을 읽는 경우가 많습니다. 이 사실에서 세 가지 규칙이 나옵니다. 첫 문장에 결론이 있어야 하고, 소제목만 읽어도 내가 어떤 사람인지 보여야 하며, 숫자나 고유명사처럼 눈에 걸리는 단어가 있어야 합니다.",
  outcomes:["오늘 경험 20개를 꺼내 역량 연결표를 완성합니다.", "이번 주에 지원할 회사의 자소서를 템플릿으로 초안까지 씁니다.", "면접 전날 기출 질문 60개의 답변 뼈대를 소리 내어 점검합니다."],
  faq:[["예시 자기소개서는 실제 합격작인가요?", "아닙니다. 구조를 보여 주기 위해 편집부가 만든 가상 예시이며, 그대로 베끼지 말고 내 경험으로 바꿔 쓰는 용도입니다."], ["공기업 블라인드 채용에도 쓸 수 있나요?", "네. 공공기관 사무행정 예시와 직무별 강조점에 블라인드 채용 기준을 따로 정리했습니다."]],
  notice:"이 책의 예시는 이해를 돕기 위한 가상 사례이며 합격을 보장하지 않습니다. 기업별 채용 절차와 문항은 해마다 바뀌니 지원 전 채용 공고를 꼭 확인하세요."
},
{ id:"ebook-7days", cat:"지식창업", price:17900, was:25000, pages:52, chapters:9, checks:40,
  title:"7일 만에 전자책 써서 첫 판매하기", sub:"주제 찾기부터 크몽 등록·상세페이지까지",
  cover:{lines:["7일 만에","전자책 써서","첫 판매하기"], hook:"하루 2시간, 일주일 완성 계획표", bg:"#14213D", ink:"#FFFFFF", ac:"#FCA311", motif:"calendar7", layout:"top"},
  summary:["지식 마켓 전자책 55권의 목차·쪽수·리뷰를 분석해 팔리는 책의 공통점 5가지를 정리했습니다.", "하루 2시간씩 7일, 주제 찾기부터 목차·원고·표지·등록까지 날짜별 과제로 따라 합니다.", "상세페이지 문구 템플릿과 판매 후 30일 점검표까지 수록했습니다."],
  pains:["전자책을 써 보고 싶은데 무슨 주제로 써야 할지 모르겠다.", "목차만 몇 주째 고치고 있다.", "다 써도 표지와 상세페이지를 어떻게 만들지 막막하다.", "올렸는데 하나도 안 팔릴까 봐 시작을 못 한다."],
  who:["내 경험을 전자책으로 팔아 보고 싶은 직장인", "지식 마켓 판매를 처음 시작하는 분", "블로그·SNS 콘텐츠를 상품으로 바꾸고 싶은 분", "첫 책을 빠르게 끝내고 싶은 분"],
  toc:[["잘 팔리는 전자책은 무엇이 다른가", "분량은 50~150쪽이 중심이다", "목차가 실행 순서로 되어 있다", "대상이 좁다"], ["1일 차: 팔리는 주제 찾기", "주제를 찾는 세 가지 질문", "주제를 좁히는 공식", "수요를 확인하는 3가지 방법"], ["2일 차: 독자와 약속 정하기", "독자를 한 사람으로 그리기", "약속 한 문장", "제목 짓는 6가지 공식"], ["3일 차: 목차 설계", "실행형 목차의 기본 뼈대", "완성 목차 예시 두 가지", "분량 계획"], ["4~5일 차: 원고 쓰기", "꼭지 하나를 쓰는 4단 틀", "AI에게 맡기기 좋은 일 15가지", "저작권 지키기"], ["6일 차: 다듬기와 디자인", "세 번 읽고 세 번 고치기", "읽기 편한 본문 디자인", "표지 만들기"], ["7일 차: 등록과 상세페이지", "판매처 고르기", "상세페이지 구성 순서", "가격 정하기"], ["판매 후 30일", "숫자로 점검하기", "고객 응대 문구 템플릿", "시리즈 기획 워크시트"], ["부록", "7일 일정표", "상세페이지 문구 템플릿", "원고 연습장"]],
  preview:"본격적으로 쓰기 전에, 지식 마켓에서 실제로 반응을 얻고 있는 전자책들이 어떤 모습인지 먼저 보겠습니다. 리뷰가 수십 개 이상 쌓인 책들의 쪽수는 대부분 50~150쪽 사이였습니다. 20쪽 안팎의 짧은 책은 가격이 낮아도 리뷰가 적은 경우가 많았고, 300쪽이 넘는 책은 소수였습니다. 독자는 하루 이틀에 다 읽을 수 있으면서 내용이 빈약하지 않은 분량을 원합니다. 반응이 좋은 책의 목차는 대부분 '왜 지금, 준비, 단계별 실행, 실수와 해결, 부록' 흐름이었습니다.",
  outcomes:["오늘 팔릴 주제 하나와 약속 한 문장을 정합니다.", "일주일 뒤 목차·원고·표지가 있는 PDF 한 권을 갖습니다.", "상세페이지를 써서 판매처에 첫 책을 등록합니다."],
  faq:[["글을 써 본 적이 없어도 되나요?", "네. 꼭지 하나를 쓰는 4단 틀과 완성 예시를 드려서 빈칸을 채우듯 쓸 수 있습니다."], ["AI로 원고를 써도 되나요?", "AI에게 맡기기 좋은 일과 맡기면 안 되는 일, 저작권 주의점을 4~5일 차에 정리했습니다."]],
  notice:"판매량과 수익은 주제와 운영에 따라 다르며 이 책이 특정 수익을 보장하지 않습니다. 판매처별 등록 규정은 바뀔 수 있으니 등록 전 각 판매처의 최신 안내를 확인하세요."
},
{ id:"insta-gonggu", cat:"SNS 수익화", price:15900, was:22000, pages:39, chapters:8, checks:35,
  title:"팔로워 3천으로 시작하는 인스타 공동구매", sub:"제안서·마진표·계약 체크리스트 수록",
  cover:{lines:["팔로워 3천으로","시작하는","인스타 공동구매"], hook:"큰 계정 아니어도 됩니다", bg:"#FFE9E3", ink:"#3A1020", ac:"#E1306C", motif:"grid9", layout:"top"},
  summary:["팔로워 수보다 중요한 세 가지 숫자로 공동구매가 되는 계정인지 먼저 점검합니다.", "업체 찾기, 제안 메시지, 마진 계산, 계약 체크리스트를 순서대로 따라 합니다.", "가상 계정의 첫 공동구매 30일을 주 단위로 보여 주고, 제안서·문구 템플릿을 부록으로 드립니다."],
  pains:["팔로워가 적어서 공동구매는 남의 일이라고 생각한다.", "업체에 뭐라고 연락해야 할지 모르겠다.", "마진과 수수료를 어떻게 정하는지 감이 안 온다.", "광고 표시, 세금 같은 규칙을 몰라서 불안하다."],
  who:["팔로워 1천~1만 사이 인스타그램 운영자", "육아·살림·뷰티 등 주제가 분명한 계정", "SNS로 첫 수익을 만들고 싶은 분", "공동구매를 해 봤지만 정리가 안 된 분"],
  toc:[["공동구매는 어떻게 돈이 되는가", "세 사람의 이해관계", "수익 구조 세 가지", "공동구매가 망하는 세 가지 이유"], ["공동구매가 되는 계정 만들기", "팔로워 수보다 중요한 세 가지 숫자", "신뢰를 쌓는 게시물", "수요 조사로 시작하기"], ["팔 상품 고르고 제안하기", "상품을 고르는 5가지 기준", "업체 찾는 방법", "제안 메시지 쓰는 법"], ["마진과 조건 정하기", "정해야 할 조건 목록", "마진 계산 예시", "계약서 체크리스트"], ["오픈 전후 운영", "7일 운영 일정", "오픈 게시물 구성", "문의 응대 원칙"], ["가상 계정으로 보는 첫 공동구매 30일", "1주 차: 상품 고르기와 수요 확인", "2주 차: 업체 제안과 조건 합의", "3~4주 차: 예고, 오픈, 마감"], ["지켜야 할 규칙과 세금", "광고는 광고라고 밝힌다", "상품 표현의 주의점", "사업자등록과 세금"], ["부록", "업체 제안서 템플릿", "게시물·스토리 문구 템플릿", "연간 공동구매 계획표"]],
  preview:"공동구매에는 세 주체가 있습니다. 업체는 새로운 고객과 판매량을 원하고, 그 대가로 할인가와 수수료를 줍니다. 계정 운영자는 수익과 팔로워의 신뢰를 원하고, 소개와 운영을 맡습니다. 팔로워는 믿을 수 있는 추천과 좋은 가격을 원합니다. 셋 중 한 사람이라도 손해를 본다고 느끼면 공동구매는 한 번으로 끝납니다. 그래서 이 책은 수익 계산보다 세 사람이 모두 다시 하고 싶은 구조를 먼저 설계합니다.",
  outcomes:["오늘 내 계정의 세 가지 숫자를 확인하고 수요 조사 게시물을 올립니다.", "이번 주에 업체 세 곳에 제안 메시지를 보냅니다.", "마진표와 계약 체크리스트로 첫 공동구매 조건을 정합니다."],
  faq:[["팔로워가 3천 명보다 적어도 되나요?", "가능합니다. 팔로워 수보다 저장·댓글·문의 같은 반응 숫자가 중요하며, 2장에서 점검법을 드립니다."], ["사업자등록이 꼭 필요한가요?", "판매 방식에 따라 다릅니다. 7장에서 경우별 기준을 설명하며, 개별 상황은 세무 전문가와 확인하길 권합니다."]],
  notice:"이 책의 계정 사례는 가상이며 특정 수익을 보장하지 않습니다. 광고 표시, 상품 표현, 세금 관련 내용은 일반적인 안내이니 최신 법령과 공정거래위원회·국세청 안내를 확인하세요."
},
{ id:"first-100m", cat:"재테크", price:12900, was:18000, pages:30, chapters:6, checks:30,
  title:"사회초년생 첫 1억 로드맵", sub:"월급으로 짜는 5년 저축·투자 계획",
  cover:{lines:["사회초년생","첫 1억","로드맵"], hook:"5년 뒤 통장을 미리 설계하기", bg:"#0E3B2E", ink:"#FFFFFF", ac:"#B8F35B", motif:"road", layout:"top"},
  summary:["월 저축액과 기간별 1억 도달 표로 내 목표를 숫자로 정합니다.", "통장 네 개와 월급날 자동이체 순서로 저절로 모이는 구조를 만듭니다.", "비상금, 세금 혜택 계좌, 첫 투자, 5년 계획표와 분기 점검까지 한 번에 정리합니다."],
  pains:["월급은 들어오는데 1년 지나도 통장이 그대로다.", "1억은 너무 먼 숫자처럼 느껴진다.", "연금저축, ISA, 청약 중 뭘 먼저 해야 할지 모르겠다.", "투자는 해야 할 것 같은데 어디서부터 시작할지 모르겠다."],
  who:["첫 월급을 받은 사회초년생", "입사 1~3년 차 직장인", "저축 계획을 숫자로 세우고 싶은 분", "첫 투자 전 기본을 정리하고 싶은 분"],
  toc:[["1억까지의 숫자", "먼저 계산부터", "기간을 늘리면", "저축률 정하기"], ["통장 쪼개기와 자동이체", "네 개의 통장", "월급날 자동이체 순서", "고정비 점검"], ["비상금과 보험, 지키는 돈", "비상금이 먼저인 이유", "보험은 꼭 필요한 것만", "피해야 할 돈 습관"], ["세금 혜택 계좌 활용", "연금저축과 IRP", "ISA", "주택청약과 청년 정책 상품"], ["첫 투자 시작하기", "투자 전에 갖출 것", "적립식으로 나눠 사기", "자산 나누기 예시"], ["5년 계획표와 점검", "5년 로드맵", "분기마다 하는 30분 점검", "자산 기록표"]],
  preview:"1억은 막연한 목표처럼 보이지만, 나누면 구체적인 숫자가 됩니다. 매달 같은 금액을 저축하고 수익률이 일정하다고 가정해 5년 뒤 금액을 계산해 보면 한 가지가 분명해집니다. 5년 안에 1억을 모으는 데 가장 큰 영향을 주는 것은 수익률이 아니라 저축액이라는 점입니다. 연 3%와 7%의 차이보다 월 100만 원과 150만 원의 차이가 훨씬 큽니다. 그래서 이 책은 투자 상품보다 저축률을 정하는 것부터 시작합니다.",
  outcomes:["오늘 내 저축률과 1억까지 걸리는 기간을 숫자로 정합니다.", "다음 월급날부터 통장 네 개 자동이체가 돌아갑니다.", "5년 계획표를 만들고 분기마다 30분씩 점검합니다."],
  faq:[["월급이 적어도 의미가 있나요?", "네. 5년이 어렵다면 7년 계획도 훌륭합니다. 기간별 표로 내 속도를 정하는 법을 드립니다."], ["특정 상품을 추천하나요?", "특정 금융상품 가입을 권하지 않습니다. 계좌의 차이와 고르는 기준을 정리했습니다."]],
  notice:"이 책은 일반적인 재무 정보이며 특정 금융상품의 가입이나 투자를 권유하지 않습니다. 투자는 원금 손실이 생길 수 있고 수익률 표는 가정입니다. 세법과 정책 상품 조건은 바뀔 수 있으니 가입 전 공식 안내를 확인하세요."
},
{ id:"gym-90", cat:"건강", price:12900, was:17000, pages:58, chapters:8, checks:90,
  title:"헬스장 첫 90일 몸 만들기", sub:"주 3회 전신 루틴과 단백질 식단표",
  cover:{lines:["헬스장 첫 90일","몸 만들기"], hook:"PT 없이 혼자 시작하는", bg:"#F4F1EC", ink:"#1E1E24", ac:"#FF5A1F", motif:"barbell", layout:"top"},
  summary:["주 3회, 한 번에 60분 안쪽으로 끝나는 전신 루틴 A·B와 대체 동작표를 드립니다.", "언제 얼마나 무게를 올릴지 정해 둔 12주 진행표로 혼자서도 꾸준히 늘립니다.", "체중별 단백질 표, 직장인 1주 식단표, 편의점 조합과 90일 기록장을 수록했습니다."],
  pains:["헬스장에 가도 뭘 해야 할지 몰라 러닝머신만 걷다 온다.", "PT는 비싸서 혼자 해 보고 싶은데 자세가 걱정된다.", "몇 주 하다가 늘 그만둔다.", "단백질을 얼마나, 어떻게 먹어야 할지 모르겠다."],
  who:["헬스장을 처음 등록한 성인", "PT 없이 혼자 운동을 시작하려는 분", "주 3회 정도만 시간을 낼 수 있는 직장인", "예전에 운동하다 그만둔 분"],
  toc:[["시작 전 점검", "몸 상태 먼저 확인하기", "목표를 하나로 정하기", "첫 기록 남기기"], ["첫 2주, 헬스장과 친해지기", "준비물과 기본 매너", "첫 2주는 익히는 기간", "매번 하는 워밍업 8분"], ["주 3회 전신 루틴 A·B", "루틴 구성", "대체 동작표", "시간이 없는 날의 30분 버전"], ["동작 가이드: 7가지 기본 동작", "스쿼트·벤치프레스", "루마니안 데드리프트·로우·랫풀다운", "자세 점검 체크리스트"], ["무게 올리는 법과 12주 진행표", "횟수 먼저, 무게는 나중", "정체기와 쉬어 가는 주", "12주 진행표"], ["단백질 식단표", "하루에 얼마나", "음식별 단백질 표", "직장인 1주 식단표와 편의점 조합"], ["회복: 잠, 통증, 쉬는 날", "근육통과 통증 구분하기", "부위별 불편할 때 대처", "바쁜 주를 버티는 법"], ["90일 기록장", "출석 도장판", "운동 기록지 A·B", "4주마다 변화 기록과 90일 돌아보기"]],
  preview:"변화는 기록이 있어야 보입니다. 거울로 보는 몸은 매일 비슷해 보이기 때문에, 숫자와 사진이 없으면 한 달 뒤 '아무것도 안 변했다'고 느끼기 쉽습니다. 그래서 첫날에는 운동보다 기록을 먼저 남깁니다. 아침 공복 체중, 배꼽 높이 허리둘레, 같은 장소와 조명에서 찍은 사진 세 장, 그리고 푸시업·1분 맨몸 스쿼트·플랭크 기록. 체중은 하루에 1~2kg씩 오르내리니, 하루 숫자 대신 일주일 평균으로 봅니다.",
  outcomes:["오늘 첫 기록을 남기고 운동 요일과 시간을 정합니다.", "첫 2주 동안 루틴 A·B의 7가지 동작을 몸에 익힙니다.", "12주 진행표와 기록장으로 36번 출석을 채웁니다."],
  faq:[["운동을 한 번도 안 해 봤어도 되나요?", "네. 첫 2주는 빈 봉이나 가벼운 덤벨로 동작만 익히고, 시작 무게 정하는 법도 표로 드립니다."], ["여성도 같은 루틴을 해도 되나요?", "네. 무게는 각자 시작 무게에서 출발하므로 성별과 관계없이 같은 원리로 진행합니다."]],
  notice:"이 책은 건강한 성인을 위한 일반적인 운동·식단 정보이며 의학적 진단이나 치료를 대신하지 않습니다. 질환이 있거나 운동 중 이상 증상이 있으면 운동 전 의사와 상의하세요."
},
];

const won = n => n.toLocaleString("ko-KR") + "원";
const off = b => b.was ? Math.round((1 - b.price / b.was) * 100) : 0;

/* ---------- 표지: 1600x2560 SVG ---------- */
function coverMotif(m, c) {
  const A = c.ac, I = c.ink;
  switch (m) {
    case "doc": { // 이력서 종이 + 합격 도장
      let s = `<g transform="rotate(-6 800 1900)"><rect x="330" y="1520" width="860" height="820" rx="20" fill="${I}"/>`;
      s += `<rect x="410" y="1600" width="170" height="210" rx="10" fill="${c.bg}" opacity=".25"/>`;
      for (let i = 0; i < 3; i++) s += `<rect x="620" y="${1620 + i * 64}" width="${[460, 380, 300][i]}" height="26" rx="13" fill="${c.bg}" opacity=".35"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="410" y="${1880 + i * 66}" width="${[700, 640, 680, 560, 660, 420][i]}" height="22" rx="11" fill="${c.bg}" opacity=".2"/>`;
      return s + `</g><g transform="rotate(14 1150 2120)"><circle cx="1150" cy="2120" r="190" fill="none" stroke="${A}" stroke-width="22"/><circle cx="1150" cy="2120" r="150" fill="none" stroke="${A}" stroke-width="6"/><text x="1150" y="2170" text-anchor="middle" font-family="Black Han Sans, Do Hyeon, sans-serif" font-size="140" fill="${A}">합격</text></g>`;
    }
    case "calendar7": { // 7일 달력, 마지막 날에 책
      let s = "";
      for (let i = 0; i < 7; i++) { const x = 170 + (i % 4) * 330, y = 1560 + Math.floor(i / 4) * 360, last = i === 6;
        s += `<rect x="${x}" y="${y}" width="290" height="320" rx="24" fill="${last ? A : I}" opacity="${last ? 1 : 0.14 + i * 0.07}"/><text x="${x + 32}" y="${y + 92}" font-family="Black Han Sans, Do Hyeon, sans-serif" font-size="86" fill="${last ? c.bg : I}" opacity="${last ? 1 : 0.9}">D${i + 1}</text>`;
        if (last) s += `<g transform="translate(${x + 80} ${y + 140})"><path d="M0 20 Q65 -10 130 20 V150 Q65 120 0 150Z" fill="${c.bg}"/><path d="M0 20 Q-65 -10 -130 20 V150 Q-65 120 0 150Z" fill="${c.bg}" opacity=".7" transform="translate(130 0) scale(-1 1) translate(-130 0)"/></g>`;
        else s += `<path d="M${x + 60} ${y + 210} l40 40 l90 -90" stroke="${c.bg}" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`; }
      return s;
    }
    case "grid9": { // 인스타 3x3 피드 + 하트
      let s = ""; const cols = [I, A, I, A, I, I, I, A, I];
      for (let i = 0; i < 9; i++) { const x = 160 + (i % 3) * 300, y = 1500 + Math.floor(i / 3) * 280; s += `<rect x="${x}" y="${y}" width="280" height="260" rx="18" fill="${cols[i]}" opacity="${cols[i] === A ? 1 : 0.18 + (i % 4) * 0.08}"/>`; }
      return s + `<g transform="translate(1250 1700)"><path d="M0 70 C -140 -10, -80 -120, 0 -45 C 80 -120, 140 -10, 0 70Z" fill="${A}" transform="scale(1.3)"/></g><text x="1250" y="1930" text-anchor="middle" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="64" fill="${I}">+3,000</text>`;
    }
    case "road": { // 5년 길과 깃발 5개
      let s = `<path d="M160 2270 C 480 2270, 420 2020, 740 2000 S 1060 1800, 1300 1690" stroke="${I}" stroke-width="16" fill="none" opacity=".35" stroke-dasharray="4 30" stroke-linecap="round"/>`;
      const pts = [[220, 2250], [500, 2140], [770, 2000], [1020, 1850], [1260, 1680]];
      pts.forEach(([x, y], i) => { const last = i === 4; s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - (last ? 300 : 200)}" stroke="${I}" stroke-width="12" stroke-linecap="round"/><path d="M${x} ${y - (last ? 300 : 200)} h${last ? 200 : 120} l-36 ${last ? 50 : 34} l36 ${last ? 50 : 34} h-${last ? 200 : 120}z" fill="${last ? A : I}" opacity="${last ? 1 : 0.3 + i * 0.12}"/><text x="${x}" y="${y + 80}" text-anchor="middle" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="54" fill="${I}" opacity=".8">${i + 1}년</text>`; });
      return s + `<text x="1225" y="1500" font-family="Black Han Sans, Do Hyeon, sans-serif" font-size="110" fill="${A}" text-anchor="end">1억</text>`;
    }
    case "barbell": { // 바벨 + 90일 눈금
      let s = `<rect x="160" y="1683" width="1280" height="40" rx="20" fill="${I}"/>`;
      [[290, 460, A], [390, 360, I], [1310, 460, A], [1210, 360, I]].forEach(([x, h, col]) => { s += `<rect x="${x - 44}" y="${1703 - h / 2}" width="88" height="${h}" rx="20" fill="${col}"/>`; });
      for (let i = 0; i < 90; i++) { const x = 170 + i * 14.2; s += `<rect x="${x}" y="${2140 - (i % 10 === 9 ? 70 : 40)}" width="7" height="${i % 10 === 9 ? 70 : 40}" rx="3.5" fill="${i < 30 ? A : I}" opacity="${i < 30 ? 1 : 0.3}"/>`; }
      return s + `<text x="170" y="2230" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="52" fill="${A}">1일</text><text x="1440" y="2230" text-anchor="end" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="52" fill="${I}" opacity=".7">90일</text>`;
    }
    case "steps": { // 매달 쌓이는 적립: 12개월 계단
      let s = "";
      for (let i = 0; i < 12; i++) { const h = 120 + i * 52; s += `<rect x="${200 + i * 100}" y="${2260 - h}" width="72" height="${h}" rx="6" fill="${i === 11 ? A : I}" opacity="${i === 11 ? 1 : 0.16 + i * 0.05}"/>`; }
      return s + `<path d="M236 2120 L1336 1600" stroke="${A}" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 26"/><circle cx="1336" cy="1600" r="26" fill="${A}"/>`;
    }
    case "clock": { // 2시간 = 시계의 60도
      const cx = 800, cy = 700, r = 420, a = (deg) => [cx + r * Math.sin(deg * Math.PI / 180), cy - r * Math.cos(deg * Math.PI / 180)];
      const [x1, y1] = a(180), [x2, y2] = a(240); // 6시~8시
      let t = ""; for (let i = 0; i < 12; i++) { const [x, y] = [cx + (r - 50) * Math.sin(i * Math.PI / 6), cy - (r - 50) * Math.cos(i * Math.PI / 6)]; t += `<circle cx="${x}" cy="${y}" r="${i % 3 ? 9 : 16}" fill="${I}"/>`; }
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${I}" stroke-width="14"/><path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z" fill="${A}"/>${t}<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${I}" stroke-width="18" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + 240}" stroke="${I}" stroke-width="26" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="30" fill="${I}"/>`;
    }
    case "bubbles": { // 질문과 답이 오가는 대화
      const rows = [[220, 1640, 700, "q"], [560, 1800, 820, "a"], [220, 1960, 520, "q"], [380, 2120, 1000, "a2"]];
      return rows.map(([x, y, w, k]) => `<rect x="${x}" y="${y}" width="${w}" height="120" rx="60" fill="${k === "a2" ? A : I}" opacity="${k === "q" ? 0.22 : k === "a" ? 0.5 : 1}"/>`).join("") +
        `<rect x="${430}" y="${2168}" width="380" height="24" rx="12" fill="${c.bg}" opacity=".55"/><rect x="${850}" y="${2168}" width="220" height="24" rx="12" fill="${c.bg}" opacity=".55"/>`;
    }
    case "sunrise": { // 30분 = 지평선 위 30개 눈금
      let s = `<circle cx="800" cy="900" r="330" fill="${A}"/><rect x="0" y="900" width="1600" height="420" fill="${c.bg}"/>`;
      for (let i = 0; i <= 30; i++) { const ang = Math.PI * (i / 30); const x1 = 800 - Math.cos(ang) * 400, y1 = 900 - Math.sin(ang) * 400, x2 = 800 - Math.cos(ang) * (i % 5 ? 450 : 500), y2 = 900 - Math.sin(ang) * (i % 5 ? 450 : 500); s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${I}" stroke-width="${i % 5 ? 8 : 14}" stroke-linecap="round"/>`; }
      for (let i = 0; i < 5; i++) s += `<rect x="${200 + i * 60}" y="${940 + i * 56}" width="${1200 - i * 120}" height="14" rx="7" fill="${I}" opacity="${0.5 - i * 0.08}"/>`;
      return s;
    }
    case "tag": { // 가격표
      return `<g transform="rotate(-12 900 1900)"><path d="M520 1640 H1240 a40 40 0 0 1 40 40 V2120 a40 40 0 0 1 -40 40 H520 L320 1900 Z" fill="${A}"/><circle cx="470" cy="1900" r="40" fill="${c.bg}"/><text x="610" y="1975" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="200" fill="${c.bg}">₩</text><rect x="940" y="1810" width="240" height="30" rx="15" fill="${c.bg}" opacity=".7"/><rect x="940" y="1880" width="170" height="30" rx="15" fill="${c.bg}" opacity=".45"/><rect x="940" y="1950" width="200" height="30" rx="15" fill="${c.bg}" opacity=".45"/></g><path d="M470 1900 C 360 1700, 260 1640, 200 1560" stroke="${I}" stroke-width="10" fill="none" stroke-linecap="round" opacity=".5"/>`;
    }
    case "accounts": { // 통장 4개
      const n = [["생활비", 0.95], ["비상금", 0.7], ["저축", 0.5], ["투자", 0.35]];
      return n.map(([t, o], i) => `<g transform="translate(${160 + i * 60} ${1640 + i * 160})"><rect width="${1120 - i * 60}" height="130" rx="24" fill="${i === 1 ? A : I}" opacity="${i === 1 ? 1 : o * 0.4}"/><text x="48" y="88" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="60" fill="${i === 1 ? c.bg : I}">${t}</text></g>`).join("");
    }
    case "stickers": { // 칼선이 있는 스티커
      const st = [[430, 1820, 230, A, "star"], [1080, 1700, 190, I, "circle"], [900, 2140, 170, A, "heart"], [300, 2130, 100, I, "circle"]];
      const shape = (k, r) => k === "circle" ? `<circle r="${r}"/>` : k === "heart" ? `<path d="M0 ${r * 0.8} C ${-r * 1.4} ${-r * 0.1}, ${-r * 0.6} ${-r * 1.1}, 0 ${-r * 0.35} C ${r * 0.6} ${-r * 1.1}, ${r * 1.4} ${-r * 0.1}, 0 ${r * 0.8}Z"/>` : (() => { let p = ""; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.48 : r, a = Math.PI / 5 * i - Math.PI / 2; p += (i ? "L" : "M") + (Math.cos(a) * rr).toFixed(1) + " " + (Math.sin(a) * rr).toFixed(1); } return `<path d="${p}Z" stroke-linejoin="round"/>`; })();
      return st.map(([x, y, r, col, k], i) => `<g transform="translate(${x} ${y}) rotate(${[-10, 8, -6, 14][i]})"><g fill="#FFFFFF" stroke="#FFFFFF" stroke-width="44" stroke-linejoin="round">${shape(k, r)}</g><g fill="none" stroke="${I}" stroke-width="5" stroke-dasharray="14 12" opacity=".5" transform="scale(1.16)">${shape(k, r)}</g><g fill="${col}">${shape(k, r)}</g></g>`).join("");
    }
    case "wave": { // 60초 = 막대 60개
      let s = ""; for (let i = 0; i < 60; i++) { const h = 40 + Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.17)) * 520 * (i < 20 ? 1 : 0.55); s += `<rect x="${170 + i * 21.5}" y="${880 - h / 2}" width="11" height="${h}" rx="5.5" fill="${i < 20 ? A : I}" opacity="${i < 20 ? 1 : 0.35}"/>`; }
      return s + `<text x="170" y="1200" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="56" fill="${A}" letter-spacing="4">0:20 결론</text><text x="1430" y="1200" text-anchor="end" font-family="IBM Plex Sans KR, sans-serif" font-size="56" fill="${I}" opacity=".6" letter-spacing="4">1:00</text>`;
    }
  }
  return "";
}
function wrapKo(t, n) { // n글자 넘으면 가운데에 가까운 띄어쓰기에서 두 줄로
  if (t.length <= n) return [t];
  const mid = t.length / 2; let best = -1;
  for (let i = 0; i < t.length; i++) if (t[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best < 0 ? [t] : [t.slice(0, best), t.slice(best + 1)];
}
function coverSVG(b) {
  const c = b.cover, top = c.layout === "top", L = c.lines;
  const fs = Math.min(230, Math.floor(1240 / Math.max(...L.map(l => l.length)) * 1.05));
  const lh = fs * 1.18, sub = wrapKo(b.sub, 20);
  const blockH = 74 + 70 + fs + (L.length - 1) * lh + 60 + sub.length * 84; // 훅 + 제목 + 부제
  const hookY = top ? 440 : 2300 - blockH + 74;
  const ty0 = hookY + 70 + fs, subY = ty0 + (L.length - 1) * lh + 120;
  const title = L.map((l, i) => `<text x="160" y="${ty0 + i * lh}" font-family="Black Han Sans, Do Hyeon, sans-serif" font-size="${fs}" fill="${c.ink}" letter-spacing="-4">${l}</text>`).join("");
  const motif = top ? `<g>${coverMotif(c.motif, c)}</g>` : `<g>${coverMotif(c.motif, c)}</g>`;
  return `<svg viewBox="0 0 1600 2560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${b.title} 표지"><rect width="1600" height="2560" fill="${c.bg}"/>${motif}
<text x="160" y="230" font-family="IBM Plex Sans KR, sans-serif" font-weight="700" font-size="54" fill="${c.ink}" letter-spacing="10">하루한권 · ${b.cat}</text><rect x="160" y="280" width="140" height="10" fill="${c.ac}"/>
<text x="160" y="${hookY}" font-family="Gowun Batang, serif" font-weight="700" font-size="74" fill="${c.ac}">${c.hook}</text>${title}
${sub.map((l, i) => `<text x="160" y="${subY + i * 84}" font-family="Gowun Batang, serif" font-size="62" fill="${c.ink}" opacity=".85">${l}</text>`).join("")}
<text x="160" y="2420" font-family="IBM Plex Sans KR, sans-serif" font-size="46" fill="${c.ink}" opacity=".75">하루한권 편집부</text><text x="1440" y="2420" text-anchor="end" font-family="IBM Plex Sans KR, sans-serif" font-size="46" fill="${c.ink}" opacity=".75">EPUB · PDF</text></svg>`;
}
