# Simple Gomoku (Vanilla)
- 접속 링크: https://marigoldj.github.io/simple-gomoku/

## 폴더 구조
- `src/` : 개발·배포용 소스(HTML/CSS/JS, lib/*).
- 루트: 설정/문서(`DESIGN.md`, GitHub Actions 워크플로 등).

## 로컬 실행 (CORS 에러 방지)
`file://.../src/index.html`로 직접 열면 ES 모듈이 차단됩니다. 간단한 HTTP 서버로 `src/`를 서빙하세요.
```bash
python -m http.server 4173 -d src
# 또는
npx serve src    # (serve 패키지가 설치되어 있다면)
```
이후 http://localhost:4173 접속.

## GitHub Pages 배포 (src 그대로)
- 워크플로 `.github/workflows/gh-pages.yml`가 `src/` 내용을 `_site`로 복사해 Pages에 올립니다. 트리거: `main` 브랜치 push 또는 수동 실행.
- Pages 설정: Settings > Pages > Source: `GitHub Actions` 선택.
- 커스텀 도메인 사용 시 리포 루트에 `CNAME` 추가.
