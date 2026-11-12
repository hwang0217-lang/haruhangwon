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
<li><h3>1. 받고 열기</h3><p>결제하면 내려받기 링크가 화면과 이메일로 와요. zip 파일의 압축을 풀고 안에 있는 HTML 파일을 더블클릭하면 크롬이나 엣지에서 바로 열려요. 한 번 받은 뒤에는 인터넷이 끊겨도 그대로 쓸 수 있어요.</p></li>
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
<div class="env"><h3>어디서 열면 되나요?</h3><ul>
<li><b>가장 좋아요</b>: 윈도우나 맥 컴퓨터의 크롬 또는 엣지</li>
<li><b>됩니다</b>: 안드로이드 휴대폰·태블릿의 크롬 (파일 앱에서 HTML 파일을 눌러 크롬으로 열기)</li>
<li><b>권장하지 않아요</b>: 아이폰·아이패드는 파일을 여는 방법이 번거롭고 기록이 저장되지 않을 수 있어요.</li>
<li>사기 전에 무료 체험판으로 내 기기에서 잘 열리는지 먼저 확인해 보세요.</li></ul></div>
</section>'''

CSS = open(os.path.join(ROOT, 'scripts/exam-page.css'), encoding='utf-8').read()

def page(x):
    secs = ''.join(f'<section><h2>{E(h)}</h2>{block(t)}</section>' for h, t in x['secs'])
    buy = f'<a class="btn buy" href="{E(x["buy"])}" rel="noopener">구매하기</a>' if x.get('buy') else '<a class="btn buy" aria-disabled="true">결제 준비 중</a>'
    ref = f'<section><h2>환불</h2><p>{E(x["refund"])}</p></section>' if x.get('refund') else ''
    t = f'{x["name"]} 합격플랜'
    return f'''<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(t)} · 하루한권</title><meta name="description" content="{E(x["one"])}">
<meta property="og:title" content="{E(t)}"><meta property="og:description" content="{E(x["one"])}">
<meta property="og:image" content="https://haruhangwon.kr/exam/img/{x["pics"][0][0]}"><meta property="og:url" content="https://haruhangwon.kr/exam/{x["id"]}">
<link rel="canonical" href="https://haruhangwon.kr/exam/{x["id"]}">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@700&family=IBM+Plex+Sans+KR:wght@400;600;700&display=swap">
<style>{CSS}</style></head><body>
<header><div class="in"><a class="logo" href="/">하루<b>한권</b></a><nav><a href="/">전자책</a><a href="/exams">합격플랜</a></nav></div></header>
<main class="in">
<p class="crumb"><a href="/exams">합격플랜</a> › {E(x["name"])}</p>
<div class="top"><div class="cover">{fig(x["pics"][0], t)}</div>
<div class="buybox"><h1>{title_html(x)}</h1><p class="lead">{E(x["one"])}</p>
<div class="price"><span>{x["krw"]:,}원</span><small>해외 결제 ${x["usd"]}</small></div>
<div class="acts">{buy}<a class="btn" href="/trial/{x["id"]}.html" download="{x["name"].replace(" ","")}_무료체험판.html">무료 체험판 받기</a></div>
<p class="small">체험판: 모의고사 1회 + 교재 첫 단원 · <a href="#how">어떻게 작동하나요?</a></p></div></div>
{how(x)}
<div class="desc">{secs}{ref}</div>
<p class="note">모든 문제와 교재는 시험 범위와 형식에 맞춰 새로 만든 연습 자료이며, 시험 주관 기관과 관계가 없습니다.{" GED®는 American Council on Education의 등록 상표이며 이 상품과 관계가 없습니다." if x["id"]=="ged-us" else ""}</p>
</main></body></html>'''

for x in D:
    open(os.path.join(ROOT, f'exam/{x["id"]}.html'), 'w', encoding='utf-8').write(page(x))
print(len(D), 'pages')
