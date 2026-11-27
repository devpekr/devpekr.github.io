# `devpekr.github.io` SEO / AEO / GEO 통합 최적화 가이드

## 1. 기존 프로젝트 분석 결과

- **실행 환경**: Node.js `v20.20.0`, Hexo `8.1.2` (`hexo-cli 4.3.2`)
- **배포 도메인 및 URL 정책**: `https://devpekr.github.io`, `permalink: :title/`, GitHub Actions(`.github/workflows/pages.yml`)로 `main` 푸시 시 자동 빌드·배포
- **기존 플러그인**: `hexo-generator-sitemap`, `hexo-generator-json-content`, `hexo-generator-category`, `hexo-generator-tag`, `hexo-generator-archive`, `hexo-generator-index`, `hexo-pwa`

### 발견된 주요 SEO / AEO / GEO 문제점
1. **`head.ejs` 메타데이터 결함**: `<html lang>` 속성 누락, `<link rel="canonical">` 누락, `<meta name="robots">` 누락, `viewport`에 `maximum-scale=1` 포함, 불필요한 `<meta name="keywords">` 생성, 비-게시글 페이지의 기본 대표 이미지(`og:image`) 누락.
2. **JSON-LD 구조화 데이터 문법 오류 및 범위 부족**: `ld_json.ejs`에서 `headline`, `description`을 `JSON.stringify` 없이 문자열 보간해 따옴표·줄바꿈 포함 시 `JSON.parse` 오류가 발생했으며, 홈페이지(`WebSite`)·카테고리(`CollectionPage`)·페이지(`WebPage`)·탐색 경로(`BreadcrumbList`)·웹 도구(`SoftwareApplication`)용 JSON-LD가 부재함.
3. **`sitemap.xml` 정책 결함**: `sitemap_template.xml`이 홈페이지·카테고리·태그의 `lastmod`에 매 빌드 시 현재 시각(`sNow`)을 출력하고, 고정 페이지(`about/` 등)가 누락되며 `noindex` 대상(태그/아카이브)과 `404.html` 필터링이 없었음.
4. **`robots.txt` 및 AI 검색 대응 부재**: `Sitemap:` 지시어 누락, 검색 크롤러(Google/Naver/Bing) 및 AI 검색 크롤러(`OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot` 등) 구분 정책 부재, `llms.txt` 부재.
5. **시맨틱/성능/템플릿**: `content-title.ejs`의 숨김 `<h1 class="header">`로 인해 전 페이지에 중복 `<h1>`이 발생했고, 홈페이지 `index.ejs`에는 메인 `<h1>`이 누락됨. 또한 모든 페이지에서 `mermaid.min.js`를 무조건 로드하고 있었음.

---

## 2. 적용한 개선 사항

1. **통합 SEO 설정 (`_config.yml` `seo:` 섹션)**: 사이트명, 기본 설명, 대표 도메인, 기본 이미지, JSON-LD, Sitemap, `llms.txt`, `robots.txt` 크롤러 정책, 검색엔진 인증 코드, IndexNow, `noindex` 정책을 단일 블록에서 관리(미설정 시 안전한 기본값 적용).
2. **Technical SEO & JSON-LD (`tools/seo-lib.js`, `scripts/seo.js`, `themes/devpekr/layout/common/head.ejs`)**:
   - `<html lang="ko">`, `viewport` 개선, 고유 `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`, Open Graph, Twitter Card, 작성일/수정일(`article:published_time`, `article:modified_time`), 작성자 출력.
   - `meta keywords` 제거, Front Matter → 본문 추출 → 사이트 기본값 우선순위 적용.
   - 페이지 유형별 유효한 JSON-LD 자동 생성(`WebSite`, `BlogPosting`/`TechArticle`, `SoftwareApplication`, `CollectionPage`, `WebPage`, `BreadcrumbList`, 실제 FAQ 존재 시 `FAQPage`).
3. **Sitemap · `robots.txt` · `llms.txt` 자동 생성 (`scripts/seo-generators.js`)**:
   - `sitemap.xml`: 홈페이지, 공개 게시글, 공개 고정 페이지, 검색 가치가 있는 카테고리 포함, `404.html`·인증 파일·`noindex` 페이지 제외, 실제 콘텐츠 `updated || date` 기반 `lastmod` 유지, URL 중복 제거.
   - `robots.txt`: 검색/AI 검색 크롤러 허용 및 AI 학습 크롤러 정책(`ai_training_policy: allow | disallow`) 분리 관리, CSS/JS/이미지 차단 없음, `Sitemap:` 절대 URL 등록.
   - `llms.txt`: 사이트 소개, 주요 카테고리, 온라인 웹 도구, 대표 기술 문서 요약 제공. *(참고: `llms.txt`는 실험적 보조 기능이며 검색 순위나 AI 인용을 보장하지 않습니다.)*
4. **내부 링크 · 시맨틱 · 성능 · 템플릿**:
   - `content-title.ejs`의 중복 `<h1 class="header">`를 `<div class="header">`로 수정하고 `index.ejs`에 메인 `<h1>` 추가.
   - `policy-article.ejs`에 카테고리/태그 기반 **관련 글(`seo_related_posts`)** 자동 추천 추가 및 대표 이미지 `fetchpriority="high"` 적용, `index.ejs` 카드 이미지 `alt` 보완 및 `loading="lazy"` 적용.
   - `scripts.ejs`에서 Mermaid 다이어그램이 있는 페이지에서만 `mermaid.min.js`를 동적 로드하도록 최적화.
   - `scaffolds/post.md`에 SEO Front Matter 및 AEO/GEO 권장 구조 주석 추가.
5. **IndexNow (`tools/indexnow.js`) & SEO 자동 검사 (`tools/seo-check.js`)**:
   - `npm run seo:check`로 `public/` 전체를 검사하며 치명적 오류 시 종료 코드 `1` 반환.
   - `npm run seo:indexnow`는 실제 배포 이후 변경된 URL만 선택적으로 전송(기본 비활성, 로컬 빌드 시 미실행).

---

## 3. 변경 및 추가된 파일 목록

| 구분 | 파일 경로 | 설명 |
| --- | --- | --- |
| **수정** | `_config.yml` | 통합 `seo:` 설정 블록 추가 |
| **수정** | `package.json` | `seo:check`, `seo:indexnow` 스크립트 추가 |
| **신규** | `tools/seo-lib.js` | SEO 메타, 정규 URL, JSON-LD 생성 공통 모듈 |
| **신규** | `scripts/seo.js` | Hexo SEO Helper 등록 (`seo_lang`, `seo_title`, `seo_meta_tags`, `seo_json_ld`, `seo_related_posts`) |
| **신규** | `scripts/seo-generators.js` | Hexo Generator (`sitemap.xml`, `robots.txt`, `llms.txt`) |
| **신규** | `tools/seo-check.js` | `public/` 기반 SEO 자동 검사 CLI |
| **신규** | `tools/indexnow.js` | IndexNow 선택적 URL 전송 CLI |
| **수정** | `themes/devpekr/layout/common/head.ejs` | 통합 메타·OG·Twitter·Canonical·Robots·JSON-LD 출력 |
| **수정** | `themes/devpekr/layout/common/content-title.ejs` | 중복 `<h1>` 제거 (`<div class="header">`) |
| **수정** | `themes/devpekr/layout/common/article.ejs` | 중복 `ld_json` 호출 제거 |
| **수정** | `themes/devpekr/layout/common/policy-article.ejs` | 관련 글 추천 추가, 커버 `fetchpriority="high"`, 중복 `ld_json` 제거 |
| **수정** | `themes/devpekr/layout/common/scripts.ejs` | `mermaid.min.js` 조건부 동적 로드 |
| **수정** | `themes/devpekr/layout/index.ejs` | 홈페이지 `<h1>` 추가, 리드/카드 이미지 `alt` 및 `loading="lazy"` 개선 |
| **수정** | `scaffolds/post.md` | SEO Front Matter 및 AEO/GEO 작성 가이드 추가 |
| **삭제** | `source/robots.txt` | Hexo Generator 기반 동적 생성으로 대체 |
| **신규** | `docs/SEO.md` | SEO/AEO/GEO 운영 및 검증 문서 |

### 설치한 플러그인
- 추가 외부 npm 패키지는 설치하지 않았습니다. 기존 `package.json`에 포함된 `js-yaml`과 Hexo 8 내장 Generator/Helper API만을 활용해 의존성과 빌드 복잡도를 최소화했습니다.

---

## 4. 설정 및 운영 방법

### 4.1 SEO 설정 (`_config.yml`)
- `seo.enable`: 전체 SEO 기능 활성화 여부 (`true` / `false`)
- `seo.robots.ai_training_policy`: `allow`(기존 유지) 또는 `disallow`(학습 크롤러 차단)
- `seo.verification`: Google / Naver / Bing 메타 인증 코드 입력란 (기존 `source/google*.html`, `source/naver*.html` 파일 인증과 병행 가능)
- `seo.indexnow`: `enable: true` 및 `key` 설정 후 배포 완료 뒤 `npm run seo:indexnow` 실행

### 4.2 신규 게시글 작성 (`scaffolds/post.md`)
`hexo new "글 제목"` 실행 시 `description`, `updated`, `thumbnail`, `noindex`, `schema_type` 등이 포함된 템플릿이 생성됩니다. `description`을 비워두면 본문 앞부분에서 자동 추출됩니다.

### 4.3 빌드 및 자동 검사 명령
```bash
npm run clean && npm run build
npm run seo:check
```

---

## 5. 검증 결과 요약

- `npm run clean && npm run build`: **성공** (오류 없이 전체 정적 파일 생성)
- `npm run seo:check`: **치명적 오류 0건**
  - `public/sitemap.xml` (167개 URL), `public/robots.txt`, `public/llms.txt` 정상 생성 확인
  - 모든 HTML 페이지의 `title`, `description`, `canonical`, `og:*`, `JSON-LD` 문법 검증 통과
  - `noindex` 페이지(태그·아카이브·404)와 `sitemap.xml` 간 충돌 없음 확인

### 남은 문제 및 추가 개선 사항 (콘텐츠/자산 측면)
`seo:check` 경고(Warning)로 확인된 기존 콘텐츠 개선 대상입니다. 기존 글의 의미를 임의로 변경하지 않기 위해 자동 수정하지 않았습니다.
1. **구형 게시글 이미지 `alt` 누락**: 2023년 작성된 일부 설치/개발 글(`blog/blog-fontawesome`, `coding/jhipster/*`, `setup/aws-*` 등)의 이미지에 `alt` 텍스트가 비어 있어 순차 보완이 필요합니다.
2. **구형 게시글 다중 `<h1>` 및 깨진 구형 내부 링크**: 일부 구형 마크다운 본문(`blog/blog-adsense`, `blog/blog-hexo-include`, `c2b514` 등) 내부에 `#` 제목(`<h1>`)이 여러 개 있거나, 과거 날짜형 퍼머링크(`/2023/03/27/...`)를 가리키는 내부 링크가 남아 있어 본문 정리 시 수정을 권장합니다.
3. **고해상도 PNG 배너 최적화**: `source/images/*.png` 커버 이미지를 WebP로 변환하면 LCP를 추가로 단축할 수 있습니다.
