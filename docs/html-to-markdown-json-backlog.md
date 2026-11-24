# HTML to Markdown · JSON 변환기 작업 백로그

기준 계획서: [html-to-markdown-json-plan.md](./html-to-markdown-json-plan.md)
구현 에이전트는 **위에서 아래 순서대로** 항목을 하나씩 완료하고 `[ ]`를 `[x]`로 체크하세요.

---

## Phase 1. 포스트 및 네비게이션 연결

- [x] **BL-01. Hexo 포스트 파일 생성**
  - **대상 파일**: `source/_posts/html-to-markdown-json.md`
  - **작업 내용**: 계획서 Step 1의 Front-matter(`title`, `date`, `description`, `categories: [앱]`, `tags`, `layout: htmlconverter`, `comments: false`) 그대로 생성.
  - **완료 조건**: 파일이 존재하고 YAML 문법 오류가 없음.

- [x] **BL-02. GNB 메뉴 및 활성 상태 등록**
  - **대상 파일**: `themes/devpekr/layout/common/portal-header.ejs`
  - **작업 내용**:
    1. `isRootActive` 조건에 `page.layout === 'htmlconverter'` 추가.
    2. `isAppCategory` 드롭다운 목록(`일정 관리 달력` 아래)에 `html-to-markdown-json/` 링크 추가.
  - **완료 조건**: `/html-to-markdown-json/` 페이지에서 상단 `앱` 메뉴와 드롭다운 항목이 활성 스타일로 표시됨.

---

## Phase 2. 스타일시트 및 페이지 마크업

- [x] **BL-03. 전용 CSS 작성**
  - **대상 파일**: `source/css/portal-htmlconverter.css`
  - **작업 내용**:
    - `.portal-hc-` 접두사 스코핑 적용 (`portal-apitester.css` 색상/간격 토큰 준수).
    - `.portal-hc-page [hidden] { display: none !important; }` 규칙 추가.
    - 데스크톱 2단 그리드(`.portal-hc-workspace`) 및 `@media (max-width: 900px)` 1단 반응형 레이아웃 작성.
    - 에디터(`.portal-hc-textarea`), 드래그 강조(`.is-dragover`), 토스트(`.portal-hc-toast`) 스타일 작성.
  - **완료 조건**: 다른 페이지 CSS와 충돌 없이 데스크톱/모바일 레이아웃이 정상 표시됨.

- [x] **BL-04. 레이아웃 HTML 마크업 및 CDN 스크립트 구성**
  - **대상 파일**: `themes/devpekr/layout/htmlconverter.ejs`
  - **작업 내용**:
    - `<%- css('css/portal-htmlconverter') %>` 및 `turndown@7.2.0`, `turndown-plugin-gfm@1.0.2` CDN `<script>` 추가.
    - 브레드크럼, 히어로, 샘플/업로드/초기화 툴바, 출력 모드 탭(`Markdown` / `JSON`), 옵션 패널(`#hc-opts-md`, `#hc-opts-json`), 2단 입출력 영역(`#hc-input`, `#hc-output`), 토스트 요소(`#hc-toast`) 마크업 작성.
  - **완료 조건**: 계획서 Step 4-2에 명시된 모든 요소 ID가 누락 없이 존재함.

---

## Phase 3. 변환 엔진 및 UI 인터랙션 구현

- [x] **BL-05. HTML → Markdown 변환 로직 구현**
  - **대상 파일**: `themes/devpekr/layout/htmlconverter.ejs` (`<script>` 내부)
  - **작업 내용**:
    - `TurndownService` 로드 여부(`typeof TurndownService === 'undefined'`) 체크 및 실패 시 안내 처리.
    - `headingStyle`, `codeBlockStyle`, `bulletListMarker` 옵션 반영.
    - `turndownPluginGfm.gfm` 존재 시 플러그인 등록(표·취소선 지원).
    - `#hc-md-strip-tags` 체크 시 `DOMParser`로 `<script>`, `<style>`, `<noscript>` 제거 후 변환.
  - **완료 조건**: 제목, 리스트, 코드 블록, 표가 포함된 HTML이 Markdown으로 정확히 변환됨.

- [x] **BL-06. HTML → JSON 변환 로직 구현**
  - **대상 파일**: `themes/devpekr/layout/htmlconverter.ejs` (`<script>` 내부)
  - **작업 내용**:
    - `DOMParser.parseFromString(html, 'text/html')` 기반 재귀 함수 `nodeToObj(node, opts)` 구현.
    - 옵션 반영: 들여쓰기(`2` / `4` / `0`), 속성 포함(`#hc-json-attrs`), 공백 텍스트 무시(`#hc-json-ignore-ws`), 전체 문서 포함(`#hc-json-full-doc`).
    - `JSON.stringify`로 출력 포맷팅.
  - **완료 조건**: 유효한 JSON 문자열이 생성되며 각 옵션 변경 시 출력이 즉시 갱신됨.

- [x] **BL-07. 탭 전환, 실시간 디바운스, 통계 표시 구현**
  - **대상 파일**: `themes/devpekr/layout/htmlconverter.ejs` (`<script>` 내부)
  - **작업 내용**:
    - `Markdown` / `JSON` 탭 전환 시 옵션 패널(`#hc-opts-md`, `#hc-opts-json`) 토글 및 즉시 재변환.
    - `#hc-input` 입력 및 옵션 변경 시 `120ms` 디바운스로 변환 실행.
    - 입력/출력 글자 수 및 줄 수 통계(`#hc-in-stats`, `#hc-out-stats`) 업데이트.
  - **완료 조건**: 입력 수정 시 끊김 없이 출력과 통계가 자동 갱신됨.

- [x] **BL-08. 샘플, 파일 업로드/드롭, 복사, 다운로드, 토스트 구현**
  - **대상 파일**: `themes/devpekr/layout/htmlconverter.ejs` (`<script>` 내부)
  - **작업 내용**:
    - 샘플 HTML 3종(블로그 글, 표, 중첩 리스트) 버튼 클릭 시 입력 채우고 변환 실행.
    - `.html`/`.htm`/`.txt` 파일 업로드(`#hc-file-input`) 및 textarea 드래그 앤 드롭(`FileReader`) 구현.
    - 복사 버튼(Clipboard API + `execCommand` 폴백) 및 다운로드 버튼(`.md` / `.json` 동적 확장자) 구현.
    - 작업 결과 토스트(`#hc-toast`) 표시.
  - **완료 조건**: 샘플 로드, 파일 드롭, 복사, 다운로드 시 오류 없이 동작하고 토스트가 표시됨.

---

## Phase 4. 빌드 및 최종 검증

- [x] **BL-09. Hexo 정적 빌드 및 산출물 검증**
  - **실행 위치**: `/mnt/c/dev/devpekr.github.io`
  - **작업 내용**:
    1. `npm run clean && npm run build` 실행 및 종료 코드 `0` 확인.
    2. `public/html-to-markdown-json/index.html` 및 `public/css/portal-htmlconverter.css` 생성 확인.
    3. 생성된 HTML 내 `portal-hc-page`, `turndown.js`, `portal-htmlconverter.css`, GNB `HTML → Markdown · JSON` 링크 포함 여부 확인.
  - **완료 조건**: 빌드 에러 0건, 모든 산출물 및 링크 확인 완료 (`AGENTS.md`에 따라 임시 서버 실행 시 확인 후 반드시 종료).
