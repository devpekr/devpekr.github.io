# HTML to Markdown & JSON 변환기 구현 계획서

이 문서는 `devpekr.github.io` (Hexo 기반) 프로젝트에 **HTML → Markdown / JSON 온라인 변환 도구**를 추가하기 위한 상세 구현 계획서입니다.
구현 에이전트는 아래의 **파일 경로, 코드 구조, 규칙, 검증 절차**를 순서대로 그대로 따르면 됩니다.

---

## 1. 목표 및 구현 범위

- **페이지 URL(슬러그)**: `/html-to-markdown-json/` (파일명: `source/_posts/html-to-markdown-json.md`)
- **레이아웃 이름**: `htmlconverter` (`themes/devpekr/layout/htmlconverter.ejs`)
- **스타일시트**: `source/css/portal-htmlconverter.css`
- **GNB 메뉴 등록**: `themes/devpekr/layout/common/portal-header.ejs`의 `앱` 드롭다운에 링크 추가
- **핵심 기능**:
  1. **HTML 입력**: 직접 입력/붙여넣기, `.html`/`.htm` 파일 업로드, 드래그 앤 드롭, 샘플 HTML 불러오기
  2. **HTML → Markdown 변환**: `Turndown` 라이브러리(CDN) + GFM(표/취소선) 변환 지원, 변환 옵션 제공
  3. **HTML → JSON 변환**: 브라우저 내장 `DOMParser` 기반 재귀 파싱 (외부 라이브러리 불필요), 들여쓰기/압축 및 노드 필터 옵션 제공
  4. **결과 활용**: 원클릭 복사(Clipboard API + fallback), 파일 다운로드(`.md` / `.json`), 변환 통계(문자 수, 줄 수, 노드 수) 표시

---

## 2. 수정 및 생성할 파일 목록

| 작업 | 파일 경로 | 설명 |
| --- | --- | --- |
| **신규** | `source/_posts/html-to-markdown-json.md` | Hexo 포스트 메타데이터 (카테고리 `앱`, `layout: htmlconverter`) |
| **신규** | `source/css/portal-htmlconverter.css` | 전용 스타일시트 (모든 클래스 접두사 `.portal-hc-` 사용) |
| **신규** | `themes/devpekr/layout/htmlconverter.ejs` | HTML 마크업 + CDN 스크립트 + 바닐라 JS 로직 |
| **수정** | `themes/devpekr/layout/common/portal-header.ejs` | `앱` 카테고리 활성 판별 및 드롭다운 메뉴 항목 추가 |

> **주의**:
> - `themes/devpekr/layout/apitester.ejs`, `source/css/portal-apitester.css`를 참고하되 기존 파일은 수정하지 마세요.
> - 커버 이미지(`thumbnail`)는 선택 사항입니다. 별도 이미지가 없으면 `hero-art` 영역을 생략하거나 텍스트 중심 히어로로 구성하세요(깨진 `<img>` 태그를 남기지 마세요).

---

## 3. 단계별 상세 구현 지침

### Step 1. 포스트 파일 생성 (`source/_posts/html-to-markdown-json.md`)

아래 내용 그대로 파일을 생성합니다.

```markdown
---
title: HTML to Markdown · JSON 변환기
date: 2026-11-24 22:00:00
description: HTML 코드를 Markdown 또는 구조화된 JSON으로 즉시 변환하고 복사·다운로드할 수 있는 온라인 개발자 도구입니다.
categories: [앱]
tags: [HTML, Markdown, JSON, 변환기, 도구]
layout: htmlconverter
comments: false
---
```

---

### Step 2. GNB 메뉴 등록 (`themes/devpekr/layout/common/portal-header.ejs`)

파일에서 `isRootActive`와 `isAppCategory` 블록을 찾아 두 곳만 수정합니다.

1. **40번째 줄 부근 `isRootActive` 조건에 `page.layout === 'htmlconverter'` 추가**:
   ```ejs
   || (isAppCategory && (page.layout === 'barcode' || page.layout === 'charmap' || page.layout === 'asciiart' || page.layout === 'lotto' || page.layout === 'gif' || page.layout === 'apitester' || page.layout === 'calendar' || page.layout === 'htmlconverter'))
   ```
2. **59번째 줄(`일정 관리 달력`) 바로 아래에 드롭다운 항목 추가**:
   ```ejs
   <a class="<%= (page.layout === 'htmlconverter') ? 'is-sub-active' : '' %>" href="<%- url_for('html-to-markdown-json/') %>"><span>HTML → Markdown · JSON</span><b>도구</b></a>
   ```

---

### Step 3. 스타일시트 작성 (`source/css/portal-htmlconverter.css`)

기존 도구(`portal-apitester.css`, `portal-charmap.css`)와 동일한 디자인 톤을 유지합니다.

- **디자인 토큰**:
  - 페이지 배경: `#fff`, 기본 패딩: `0 32px 64px`
  - 히어로 배경: `linear-gradient(115deg, #edf4f9, #f7f9fa)`, 하단 테두리 `1px solid #dfe7ed`
  - 제목 색: `#1e2d3b`, 본문 보조 색: `#586874` / `#64748b`
  - 포인트 색: `#006bde` (활성 탭, 기본 버튼)
  - 테두리: `#dfe7ed`, 패널 배경: `#f8fafc`
- **필수 레이아웃 규칙**:
  - `.portal-hc-page [hidden] { display: none !important; }`
  - **2단 분할 작업 영역** (`.portal-hc-workspace`):
    - 데스크톱: `display: grid; grid-template-columns: 1fr 1fr; gap: 16px;`
    - 모바일(`@media (max-width: 900px)`): `grid-template-columns: 1fr;`, `.portal-hc-page` 좌우 패딩 `16px`
  - **에디터 영역** (`.portal-hc-textarea`):
    - `width: 100%; min-height: 440px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px; line-height: 1.55; resize: vertical;`
  - **드래그 앤 드롭 강조 상태** (`.portal-hc-dropzone.is-dragover`):
    - 점선 테두리 `#006bde`, 연한 파란 배경 `#eff6ff`
  - **토스트 알림** (`.portal-hc-toast`):
    - 화면 하단 중앙 고정(`position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 9999;`)

---

### Step 4. 레이아웃 및 변환 로직 작성 (`themes/devpekr/layout/htmlconverter.ejs`)

#### 4-1. 외부 라이브러리 (CDN)
Markdown 변환을 정규식으로 직접 구현하지 말고 검증된 **Turndown** CDN을 사용합니다.

```html
<%- css('css/portal-htmlconverter') %>
<script src="https://cdn.jsdelivr.net/npm/turndown@7.2.0/dist/turndown.js"></script>
<script src="https://cdn.jsdelivr.net/npm/turndown-plugin-gfm@1.0.2/dist/turndown-plugin-gfm.js"></script>
```

> **주의**: CDN 로드 실패 시를 대비해 `typeof TurndownService === 'undefined'` 체크를 두고, 실패 시 사용자에게 안내 메시지를 표시하세요. `turndownPluginGfm`이 존재할 때만 `turndownService.use(turndownPluginGfm.gfm)`를 호출하세요.

#### 4-2. HTML 구조 (요소 ID 규격)

1. **브레드크럼 & 히어로**:
   - 브레드크럼: `홈 › 앱 › HTML to Markdown · JSON 변환기`
   - 히어로: `ONLINE DEVELOPER TOOL` / `HTML to Markdown · JSON 변환기` / 간단 설명
2. **상단 툴바** (`.portal-hc-toolbar`):
   - 샘플 버튼: `샘플: 블로그 글`, `샘플: 표(Table)`, `샘플: 중첩 리스트`
   - 파일 업로드 버튼 (`#hc-upload-btn`) + 숨겨진 `<input type="file" id="hc-file-input" accept=".html,.htm,.txt" hidden>`
   - 전체 초기화 버튼 (`#hc-clear-btn`)
3. **모드 탭 & 옵션 바**:
   - 출력 탭 (`[data-hc-tab]`): `Markdown` (기본 활성), `JSON`
   - **Markdown 옵션 패널** (`#hc-opts-md`):
     - 제목 스타일 (`#hc-md-heading`): `atx` (`# 제목`) / `setext` (`===`)
     - 코드 블록 스타일 (`#hc-md-code`): `fenced` (` ``` `) / `indented`
     - 불릿 기호 (`#hc-md-bullet`): `-` / `*` / `+`
     - 체크박스 `#hc-md-strip-tags`: `<script>`, `<style>`, `<noscript>` 태그 제거 (기본 체크)
   - **JSON 옵션 패널** (`#hc-opts-json`, `hidden`):
     - 들여쓰기 (`#hc-json-indent`): `2` (2칸), `4` (4칸), `0` (한 줄 압축)
     - 체크박스 `#hc-json-attrs`: HTML 속성(`attrs`) 포함 (기본 체크)
     - 체크박스 `#hc-json-ignore-ws`: 공백만 있는 텍스트 노드 무시 (기본 체크)
     - 체크박스 `#hc-json-full-doc`: `<html>`/`<head>`/`<body>` 전체 구조 포함 (기본 해제 → `body` 내부만 반환)
4. **2단 입력/출력 패널** (`.portal-hc-workspace`):
   - **왼쪽 (입력)**:
     - 헤더: `HTML 입력` + 글자 수/줄 수 표시 (`#hc-in-stats`)
     - `<textarea id="hc-input" class="portal-hc-textarea ...">` (드래그 앤 드롭 이벤트 연결)
   - **오른쪽 (출력)**:
     - 헤더: 출력 모드명(`#hc-out-title`), 글자 수/줄 수(`#hc-out-stats`), `복사`(`#hc-copy-btn`), `다운로드`(`#hc-download-btn`) 버튼
     - `<textarea id="hc-output" class="portal-hc-textarea" readonly>`

#### 4-3. 변환 로직 명세

모든 JS 코드는 `(function () { 'use strict'; ... }());` IIFE 내부에 작성합니다.

1. **HTML 전처리 (공통)**:
   - 입력 문자열이 `trim() === ''`이면 출력도 빈 문자열 `''`로 설정.
   - `#hc-md-strip-tags`가 체크된 경우, `DOMParser`로 파싱한 뒤 `script, style, noscript` 요소를 `remove()`한 `doc.body.innerHTML`을 Turndown에 전달합니다.
2. **HTML → Markdown (`convertToMarkdown(html)`)**:
   ```js
   var service = new TurndownService({
       headingStyle: $('hc-md-heading').value,
       codeBlockStyle: $('hc-md-code').value,
       bulletListMarker: $('hc-md-bullet').value
   });
   if (window.turndownPluginGfm && window.turndownPluginGfm.gfm) {
       service.use(window.turndownPluginGfm.gfm);
   }
   return service.turndown(cleanedHtml);
   ```
3. **HTML → JSON (`convertToJson(html)`)**:
   - `new DOMParser().parseFromString(html, 'text/html')`로 파싱합니다.
   - 재귀 함수 `nodeToObj(node, opts)` 규칙:
     - **Text 노드 (`nodeType === 3`)**: `textContent`를 가져와 `opts.ignoreWs`가 참이고 `text.trim() === ''`이면 `null` 반환. 그 외에는 `{ type: 'text', text: opts.ignoreWs ? text.trim() : text }` 반환 (단, 부모 요소에서 자식 요소가 없고 텍스트만 있는 경우 `text` 문자열 프로퍼티로 단순화하면 가독성이 좋습니다).
     - **Element 노드 (`nodeType === 1`)**:
       - `obj = { tag: node.tagName.toLowerCase() }`
       - `opts.includeAttrs && node.attributes.length > 0`이면 `obj.attrs = { ... }` 추가.
       - 자식 노드 순회 후 `null` 제외:
         - 자식이 텍스트 1개뿐이면 `obj.text = ...`
         - 자식이 여러 개이거나 Element 자식이 있으면 `obj.children = [...]`
       - 반환: `obj`
     - **그 외 노드(주석 등)**: `null` 반환(무시).
   - 루트 결정:
     - `opts.fullDoc`이 참이면 `nodeToObj(doc.documentElement, opts)` 반환.
     - 거짓이면 `doc.body.childNodes`를 순회해 배열로 반환(단일 루트 요소면 해당 객체, 여러 개면 배열).
   - `JSON.stringify(result, null, indentNum)`으로 직렬화합니다.
4. **실시간 변환 & 디바운스**:
   - `#hc-input`의 `input` 이벤트 및 모든 옵션 `change` 이벤트에 `120ms` 디바운스로 `runConvert()` 실행.
   - 탭 전환 시 즉시 `runConvert()` 실행 및 `#hc-download-btn` 라벨/확장자(`.md` ↔ `.json`) 전환.
5. **파일 드래그 앤 드롭 & 업로드**:
   - `dragover` / `dragleave` / `drop` 이벤트에서 `e.preventDefault()` 처리 후 `FileReader.readAsText(file, 'UTF-8')`로 `#hc-input.value` 채우고 즉시 `runConvert()`.
6. **복사 & 다운로드**:
   - 복사: `navigator.clipboard.writeText(text)` 사용, 실패 시 `textarea.select()` + `document.execCommand('copy')` 폴백. 성공 시 토스트 표시.
   - 다운로드: `new Blob([text], { type: mime })` + `URL.createObjectURL` + `<a download="converted.md|json">`.

---

## 4. 구현 후 필수 검증 절차

구현이 완료되면 아래 순서대로 검증하고, 모든 항목이 통과해야 작업을 완료합니다.

1. **Hexo 빌드 테스트** (`/mnt/c/dev/devpekr.github.io`에서 실행):
   ```bash
   npm run clean && npm run build
   ```
   - 종료 코드 `0` 확인.
   - `public/html-to-markdown-json/index.html` 파일 생성 확인.
   - `public/css/portal-htmlconverter.css` 파일 생성 확인.
2. **생성된 HTML 검증**:
   - `public/html-to-markdown-json/index.html` 내에 `portal-hc-page`, `turndown.js`, `portal-htmlconverter.css` 링크가 정상 포함되었는지 확인.
   - `public/index.html` 또는 `public/categories/앱/index.html`의 GNB 드롭다운에 `HTML → Markdown · JSON` 링크가 포함되었는지 확인.
3. **기능 확인 (선택: 로컬 확인 필요 시)**:
   - `AGENTS.md` 규칙에 따라 개발 서버를 임의로 상시 실행 상태로 남기지 않도록 주의합니다.
   - 확인이 필요할 경우 임시로 `npx hexo server`를 띄워 확인한 뒤 반드시 종료합니다.
