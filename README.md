# Simple Gomoku (Vanilla)

## 왜 CORS 에러가 발생했나요?
- `index.html`을 파일 경로(`file://...`)로 직접 열면 ES 모듈(`main.js`)을 불러올 때 브라우저가 동일 출처가 아니라고 판단해 로드가 차단됩니다. 이는 기본 보안 정책으로, 정적 파일이라도 HTTP(S)로 서빙해야 합니다.

## 해결 방법 (로컬에서 실행)
아래 중 하나로 간단한 로컬 서버를 띄운 뒤 `http://localhost:포트`로 접속하세요.

1) Node 내장 서버 사용
```bash
node devserver.js
# http://localhost:4173 접속
```

2) Python 내장 서버 사용
```bash
python -m http.server 4173
# http://localhost:4173 접속
```

브라우저에서 새로고침하면 격자/오목판이 정상적으로 보이고, CORS 에러 없이 동작합니다.

## GitHub Pages 배포
- Pages는 정적 파일을 HTTP로 서빙하므로 별도 설정 없이 `docs/` 또는 `gh-pages` 브랜치에 올리면 됩니다.
