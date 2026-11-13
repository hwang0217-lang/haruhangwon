"""합격플랜 상품 상세페이지 생성: exam/data.json -> exam/<id>.html
data.json의 buy(결제 링크)를 채우고 다시 실행하면 구매 버튼이 켜져요. exams.html 목록도 같은 값을 써요."""
import json, html, re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, 'exam/data.json'), encoding='utf-8'))
E = html.escape

def inline(t):
    t = E(t)
    return re.sub(r'(\d+\))', r'<b>\1</b>', t, count=1)

def block(text):
    out, lst, tbl = [], [], []
    def flush():
        nonlocal lst, tbl
        if lst: out.append('<ul>' + ''.join(f'<li>{inline(x)}</li>' for x in lst) + '</ul>'); lst = []
        if tbl:
            rows = [[c.strip() for c in r.strip().strip('|').split('|')] for r in tbl]
            h = '<tr>' + ''.join(f'<th>{E(c)}</th>' for c in rows[0]) + '</tr>'
            b = ''.join('<tr>' + ''.join(f'<td>{E(c)}</td>' for c in r) + '</tr>' for r in rows[1:])
            out.append(f'<div class="tw"><table>{h}{b}</table></div>'); tbl = []
    for line in text.split('\n'):
        l = line.strip()
        if not l: flush(); continue
        if l.startswith('|'): tbl.append(l); continue
        if l.startswith('- ') or re.match(r'^\d+\)', l):
            if tbl: flush()
            lst.append(l[2:] if l.startswith('- ') else l); continue
        flush(); out.append(f'<p>{inline(l)}</p>')
    flush(); return ''.join(out)

def title_html(x):
    d = x['desc']; name = re.sub(r'\(.*?\)', '', x['name']).strip()
    OVR = {'drive': ('운전면허 학과시험', '한국어·영어 모의고사'), 'ca-citizen': ('캐나다 시민권 시험', '한국어 해설 모의고사'),
           'kor-teach': ('한국어교육능력검정', '필기 모의고사 10회'), 'kiip': ('사회통합프로그램 종합평가', '모의고사 10회')}
    i = d.find('모의고사')
    if x['id'] in OVR:
        a, b = OVR[x['id']]
    elif 0 < i <= 13:
        a, b = d[:i].strip(), d[i:].strip()
    elif d.startswith(name):
        a, b = name, d[len(name):].strip()
    else:
        a, b = d, ''
    return f'<span class="t1">{E(a)}</span>' + (f'<span class="t2">{E(b)}</span>' if b else '')

def fig(p, cap):
    n, _, w, h = p
    return f'<figure><img src="/exam/img/{n}" width="{w}" height="{h}" loading="lazy" alt="{E(cap)}"><figcaption>{E(cap)}</figcaption></figure>'

def how(x):
    P = x['pics']; ged = x['id'] == 'ged-us'
    dash, exam, res, book = (P[1], P[3], P[4], P[5]) if ged else (P[1], P[2], P[3], P[4])
    tr = '' if ged else '<li><b>문제 한글 해석</b>: 영어 문제는 한국어 해석을 보이거나 숨길 수 있어요. 익숙해지면 숨기고 실전처럼 풀어요.</li>'
    timer = ('<li><b>타이머 없음</b>: 실제 인터뷰에 시간 제한이 없어서, 면접관 질문처럼 한 문제씩 풀어요.</li>' if x['id']=='us-citizen' else
             '<li><b>실제 시험 시간 타이머</b>: 실제 시험의 문항 수와 시간에 맞춰 문항당 시간이 같아요. 시간이 끝나면 자동으로 제출해요.</li>' if ged else
             '<li><b>실제 시험 시간 타이머</b>: 실제 시험의 문항 수와 시간에 맞춰 문항당 시간이 같아요. 2분 남으면 빨간색이 되고, 시간이 끝나면 자동으로 제출해요. 설정에서 끌 수도 있어요.</li>')
    if ged:
        mix='<li>수학은 시험장처럼 <b>공식표</b>를 열어 볼 수 있어요. 9~10회는 시작하면 시간 제한이 자동으로 켜져요.</li>'
        score='<li>실제 GED처럼 <b>100~200점</b>으로 환산하고, 합격선 <b>145점</b>까지 몇 점 남았는지 알려줘요.</li>'
        diff=''; wrong='<li><h3>6. 결과 다시 보기</h3><p>지난 회차 결과는 언제든 다시 열어 볼 수 있어요. 문제마다 정답과 오답, 해설이 남아 있어요. "결과 복사하기"로 점수 요약을 보호자에게 카톡으로 보낼 수도 있어요.</p></li>'
        set7=''; reset=''
    else:
        mix='<li>회차마다 쉬움 30%, 보통 50%, 어려움 20%로 섞여 있고, 회차끼리 같은 문제가 나오지 않아요.</li>'
        score='<li>실제 시험의 <b>만점, 합격선, 과락 기준</b>으로 점수와 합격 여부를 보여줘요.</li>'
        diff=' 난이도별 점수도 나와요.'; wrong='<li><h3>6. 틀린 문제만 다시 풀기</h3><p>오답 노트에 틀린 문제가 모여요. "오답만 다시 풀기"로 풀어서 맞히면 목록에서 빠져요.</p></li>'
        set7='<li><b>글자 크기</b>를 보통, 크게, 아주 크게 중에서 고를 수 있어요.</li><li>"결과 복사하기"로 점수 요약을 복사해 가족이나 선생님에게 보낼 수 있어요.</li>'
        reset=' 처음부터 다시 하려면 "기록 모두 지우기"를 눌러요.'
    return f'''<section class="how" id="how"><h2>이렇게 작동해요</h2>
<p class="lead">설치도, 회원가입도, 인터넷도 필요 없어요. 파일 하나를 브라우저로 열면 그 안에 교재, 모의고사, 채점, 기록이 다 들어 있어요.</p>
<ol class="steps">
<li><h3>1. 받고 열기</h3><p>결제하면 결제 완료 화면에서 바로 내려받아요. zip 파일의 압축을 풀고 안에 있는 HTML 파일을 더블클릭하면 크롬이나 엣지에서 바로 열려요(<a href="#open">기기별 여는 방법</a>). 한 번 받은 뒤에는 인터넷이 끊겨도 그대로 쓸 수 있어요.</p></li>
<li><h3>2. 첫 화면에서 "지금 할 일" 따라가기</h3><p>첫 화면이 지금 해야 할 공부 하나를 골라 줘요. 순서는 <b>진단 → 약점 공부 → 연습 → 실전</b>이에요.</p>
<ul><li>과목마다 1회를 먼저 풀어 지금 실력을 확인해요(진단).</li><li>점수가 60%보다 낮은 영역의 교재 단원을 공부해요.</li><li>2~8회로 연습하고, 9~10회는 시간 제한을 켜고 실전처럼 풀어요.</li><li>과목별로 몇 회까지 풀었는지, 최근 점수가 몇 점인지 한눈에 보여요.</li></ul>{fig(dash, '첫 화면: 지금 할 일과 과목별 진행')}</li>
<li><h3>3. 교재로 공부하기</h3><p>단원마다 <b>핵심 용어 → 개념 → 예시 → 자주 하는 실수 → 확인 문제</b> 순서예요. 꼭 외울 문장과 숫자에는 형광펜이 칠해져 있어서, 시간이 없을 때는 형광펜만 훑어도 돼요. 다 읽으면 "다 읽었어요"를 눌러 표시해요.</p>{fig(book, '교재: 핵심 문장 형광펜')}</li>
<li><h3>4. 모의고사 풀기</h3><ul>
{timer}
<li><b>나중에 다시 보기</b>: 헷갈리는 문제에 표시해 두고, 문제 목록에서 번호를 눌러 바로 돌아가요.</li>
<li><b>제출 전 확인</b>: 안 푼 문제가 있으면 몇 문제인지 알려 주고 한 번 더 물어봐요.</li>
{mix}</ul>{fig(exam, '모의고사: 실제 시간 타이머와 문제 목록')}</li>
<li><h3>5. 바로 채점, 약점 분석</h3><ul>
{score}
<li>영역별 정답률을 낮은 순서로 보여주고, 60% 미만은 빨간색으로 표시해요.</li>
<li>빨간 영역을 누르면 그 내용을 다루는 교재 단원이 바로 열려요.</li>
<li>문제마다 내 답, 정답, 해설을 보여줘요.{diff}</li></ul>{fig(res, '채점: 점수, 합격선, 영역별 약점')}</li>
{wrong}
<li><h3>7. 내 기록과 설정</h3><ul>
<li>푼 기록은 쓰는 기기의 브라우저에 자동으로 저장돼요. 같은 기기, 같은 브라우저로 열면 이어서 할 수 있어요.</li>
<li>인터넷 사용 기록을 지우거나 다른 기기로 옮기면 기록이 사라질 수 있어요.{reset}</li>
{set7}{tr}</ul></li>
</ol>
<div class="env" id="open"><h3>받은 파일, 이렇게 열어요</h3>
<p><b>윈도우 컴퓨터 (추천)</b></p><ol>
<li>받은 zip 파일을 마우스 오른쪽 버튼으로 누르고 <b>모두 압축 풀기</b>를 눌러요.</li>
<li>풀린 폴더의 <b>.html 파일</b>을 바탕화면으로 옮겨요.</li>
<li>더블클릭하면 크롬이나 엣지에서 열려요. 다른 프로그램으로 열리면 오른쪽 버튼 → 연결 프로그램 → Chrome.</li></ol>
<p><b>맥</b></p><ol><li>zip 파일을 더블클릭해 압축을 풀어요.</li><li>.html 파일을 더블클릭하면 사파리나 크롬에서 열려요.</li></ol>
<p><b>안드로이드폰·태블릿</b></p><ol>
<li>html 파일을 내려받거나 카톡으로 받아 <b>저장</b>해요.</li>
<li><b>내 파일 → 다운로드</b>에서 파일을 눌러요.</li>
<li><b>삼성 인터넷</b> 또는 <b>Chrome</b>을 골라요. 카톡 미리보기나 HTML 뷰어에서는 작동하지 않아요.</li></ol>
<p><b>아이폰·아이패드</b></p><ol>
<li>내려받은 파일은 아이폰 파일 앱·카톡 미리보기에서 작동하지 않아요. 컴퓨터나 안드로이드 기기로 열어 주세요.</li>
<li>무료 체험판은 위의 <b>바로 풀어 보기</b>를 누르면 아이폰 사파리에서도 풀어 볼 수 있어요.</li></ol>
<p><b>기록 저장</b></p><ol>
<li>점수·진도는 그 기기, 그 브라우저에 자동 저장돼요. 로그인은 없어요.</li>
<li>같은 기기의 같은 브라우저로 열어야 이어져요. 컴퓨터와 폰 기록은 따로예요.</li>
<li>시크릿 창이나 인터넷 기록·쿠키 삭제를 하면 기록이 지워져요.</li>
<li>여는 방법이 잘못되면 화면 위에 노란색·빨간색 안내가 번호로 떠요. 그대로 따라 하면 돼요.</li></ol>
<p>사기 전에 무료 체험판을 내려받아, 공부할 기기에서 잘 열리는지 먼저 확인해 보세요.</p></div>
</section>'''

CSS = open(os.path.join(ROOT, 'scripts/exam-page.css'), encoding='utf-8').read()

def won(n):
    return f'{n:,}원'

def value(x):
    tot = x['book'] + x['course']; me = x['krw']
    if tot > me:
        save = (tot - me) // 10000
        cmp = f'''<div class="cmp" role="img" aria-label="교재와 강의를 따로 사면 약 {won(tot)}, 합격플랜은 {won(me)}">
<div class="row"><span class="lb">교재 + 인강·학원 강의</span><span class="bar"><i style="width:100%"></i></span><b>약 {won(tot)}</b></div>
<div class="row me"><span class="lb">{E(x["name"])} 합격플랜</span><span class="bar"><i style="width:{max(6, round(me / tot * 100))}%"></i></span><b>{won(me)}</b></div>
<p class="save">따로 사는 것보다 <b>약 {save}만 원</b> 덜 들어요.</p>
<p class="est">교재 {won(x["book"])} + 대표 강의 {won(x["course"])} 기준, 2026년 11월 온라인 판매가를 조사한 추정값이에요. 학원·강의마다 다를 수 있어요.</p></div>'''
    else:
        cmp = f'''<div class="cmp free"><p class="save">공식 자료는 무료지만, 설명이 어렵거나 문제만 있는 경우가 많아요.</p>
<p>합격플랜은 <b>쉬운 한국어 해설 교재</b>와 <b>실전 모의고사, 자동 채점, 약점 분석</b>을 파일 하나에 묶었어요. 학원이나 과외를 따로 찾지 않아도 혼자 끝까지 준비할 수 있어요.</p></div>'''
    inc = [('교재', f'{x["units"]}단원', '쉬운 설명 + 핵심 형광펜'), ('모의고사', x['mocks'], f'총 {x["qn"]}문항, 회차끼리 안 겹쳐요'),
           ('타이머', '실제 시험 시간' if x['id'] != 'us-citizen' else '인터뷰 방식', '실전처럼 풀어요' if x['id'] != 'us-citizen' else '한 문제씩 질문처럼'),
           ('채점', '바로 채점', '실제 합격선 + 약점 단원 안내')]
    tiles = ''.join(f'<li><span>{a}</span><b>{b}</b><small>{c}</small></li>' for a, b, c in inc)
    return f'''<section class="value" aria-labelledby="vh">
<p class="eye">{E(x["name"])} 혼자 준비하기</p>
<h2 id="vh">학원 안 가도 됩니다.</h2>
<p class="vsub">교재부터 모의고사 10회까지 다 들어 있어요.</p>
<div class="vgrid">{cmp}<ul class="inc">{tiles}</ul></div>
<div class="vcta"><a class="btn lamp" href="/trial/{x["id"]}.html" target="_blank" rel="noopener">무료 체험판 바로 풀어 보기</a><a class="btn ghostd" href="#buy">가격 보기</a></div>
</section>'''

def page(x):
    secs = ''.join(f'<section><h2>{E(h)}</h2>{block(t)}</section>' for h, t in x['secs'])
    buy = f'<a class="btn buy" href="{E(x["buy"])}">구매하기</a>' if x.get('buy') else '<a class="btn buy" aria-disabled="true">결제 준비 중</a>'
    ref = f'<section><h2>환불</h2><p>{E(x["refund"])}</p></section>' if x.get('refund') else ''
    t = f'{x["name"]} 합격플랜'
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(t)} · 하루한권</title><meta name="description" content="{E(x["one"])}">
<meta property="og:title" content="{E(t)}"><meta property="og:description" content="{E(x["one"])}">
<meta property="og:image" content="https://haruhangwon.kr/exam/img/{x["pics"][0][0]}"><meta property="og:url" content="https://haruhangwon.kr/exam/{x["id"]}">
<link rel="canonical" href="https://haruhangwon.kr/exam/{x["id"]}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap">
<style>{CSS}</style><link rel="stylesheet" href="/ko.css"><script src="/a.js" defer></script></head><body>
<header><div class="in"><a class="logo" href="/">하루<b>한권</b></a><nav><a href="/">전자책</a><a href="/exams">합격플랜</a></nav></div></header>
<main class="in">
<p class="crumb"><a href="/exams">합격플랜</a> › {E(x["name"])}</p>
{value(x)}
<div class="top" id="buy"><div class="cover">{fig(x["pics"][0], t)}</div>
<div class="buybox"><h1>{title_html(x)}</h1><p class="lead">{E(x["one"])}</p>
<div class="price"><span>{x["krw"]:,}원</span><small>해외 결제 ${x["usd"]}</small></div>
<div class="acts">{buy}<a class="btn" href="/trial/{x["id"]}.html" target="_blank" rel="noopener">체험판 바로 풀어 보기</a><a class="btn" href="/trial/{x["id"]}.html" download="{x["name"].replace(" ","")}_무료체험판.html">체험판 파일 받기</a></div>
<p class="small">체험판: 모의고사 1회 + 교재 첫 단원 · <a href="#open">기기별 여는 방법</a> · <a href="#how">어떻게 작동하나요?</a></p></div></div>
{how(x)}
<div class="desc">{secs}{ref}</div>
<p class="note">모든 문제와 교재는 시험 범위와 형식에 맞춰 새로 만든 연습 자료이며, 시험 주관 기관과 관계가 없습니다.{" GED®는 American Council on Education의 등록 상표이며 이 상품과 관계가 없습니다." if x["id"]=="ged-us" else ""}</p>
</main></body></html>'''

for x in D:
    open(os.path.join(ROOT, f'exam/{x["id"]}.html'), 'w', encoding='utf-8').write(page(x))
print(len(D), 'pages')
