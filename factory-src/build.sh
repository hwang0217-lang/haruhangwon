#!/bin/sh
# 앱 원본(app.html)과 연결부(shim.html)를 합쳐 factory/index.html을 만든다.
set -e
cd "$(dirname "$0")"; OUT=../factory/index.html
{
  printf '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow">'
  printf '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%%}[hidden]{display:none!important}</style>'
  cat shim.html
  printf '</head><body>\n'
  sed 's#<button class="btn gold" id="autoRun">원클릭 자동 생산</button>#&\n  <button class="btn sm ghost" onclick="ebookLogout()">로그아웃</button>#' app.html
  printf '\n</body></html>\n'
} > "$OUT"
