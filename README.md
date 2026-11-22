# Goodsaem's Blog (good-site)

이 프로젝트는 [Hexo](https://hexo.io/) 정적 사이트 생성기를 기반으로 구축된 개인 블로그 프로젝트입니다. 개발 노트 작성과 이미지 캡처/업로드, Draw.io 다이어그램 연동 등을 최적화하기 위해 다양한 사용자 정의 확장 스크립트와 데스크톱 유틸리티가 통합되어 있습니다.

---

## 🚀 기술 스택 및 구성

- **블로그 엔진**: Hexo v6.3.0
- **테마**: `devpekr` (수정 및 커스텀 스타일 적용)
- **배포처**: GitHub Pages ([goodsaem.github.io](http://goodsaem.github.io))
- **대상 브랜치**: `main`

---

## 🛠️ 주요 기능 및 확장 스크립트 (`scripts/`)

Hexo의 기능을 확장하기 위해 `scripts/` 폴더 내에 다음과 같은 사용자 정의 플러그인이 작성되어 있습니다.

### 1. 포스트 헬퍼 & 고유 파일 생성 (`uniqpost.js`)
- **명령어**: `hexo uniqpost [글 제목]`
- **설명**: 6자리의 무작위 알파벳+숫자 조합(예: `c2b514.md`)으로 된 고유한 파일명을 가진 마크다운 포스트 파일을 생성합니다. 파일명 충돌을 방지하며, 날짜, 태그, 카테고리, TOC 활성화 필드가 포함된 기본 Front-matter 템플릿이 자동으로 작성됩니다.

### 2. 마크다운 인클루드 (`incl-tag.js` & `zz_include_md.js`)
- `{% incl 파일명 %}`: `source/_includes/{파일명}.md` 경로의 파일을 불러와 HTML로 변환하여 삽입합니다. (동기 렌더링 지원)
- `{% include_md 파일명 %}`: 외부 마크다운 파일을 가져와 Front-matter를 제거한 후 본문 영역만 블로그 포스트 내에 동적으로 포함시킵니다.

### 3. 사용자 정의 경고창 (`callout-box.js`)
- **문법**: `{% callout type:info title:"제목" %} 본문 내용 {% endcallout %}`
- **지원 타입**: 
  - `info` (💬)
  - `tip` (💡)
  - `warning` (⚠️)
  - `danger` (🚫)
- **설명**: 포스트 내에 중요한 알림이나 주의사항을 세련된 박스 디자인으로 강조해 줍니다.

### 4. Draw.io 다이어그램 임베드 (`draw.js`)
- **문법**: `{% draw url="다이어그램_주소" %}`
- **설명**: mxgraph (Draw.io) 다이어그램 뷰어를 포스트에 직접 삽입합니다. 툴바 버튼, 라이트박스, 확대/축소, 레이어 등의 설정을 제어할 수 있으며, 렌더링 시 Draw.io 정적 뷰어 스크립트(`viewer-static.min.js`)가 자동으로 주입됩니다.

### 5. FontAwesome 아이콘 간편 입력 (`fa.js` & `fa_free_icons.js`)
- **문법**: `{% fa 아이콘명 [크기] [스타일] [애니메이션/회전/기타옵션] %}`
  - 예: `{% fa camera lg solid spin %}`
- **FontAwesome 아이콘 갤러리**: `{% fa_all_free_class %}` 태그를 포스트나 페이지에 삽입하면, `source/_data/fa-classes.json` 데이터를 로드하여 블로그 상에 클릭 복사 가능한 모든 무료 아이콘 그리드를 렌더링해 줍니다.

---

## 🐍 파이썬 보조 유틸리티 (`python/`)

블로그 콘텐츠 생산성 향상을 위해 `python/` 폴더에 별도의 데스크톱 애플리케이션 및 스크립트가 포함되어 있습니다.

### 1. 클립보드 이미지 캡처 앱 (`python/img.py`)
- **설명**: PyQt5 기반으로 제작된 데스크톱 GUI 유틸리티입니다.
- **기능**:
  - 클립보드에 복사된 이미지를 가져와 즉시 미리보기합니다.
  - 저장 시 블로그 도메인 워터마크(`https://goodsaem.github.io/`)를 자동으로 삽입합니다.
  - 가로 폭을 최적화 비율(기본 최대 900px)로 자동 리사이징합니다.
  - 이미지를 블로그의 `source/images/` 폴더에 고유한 파일명으로 바로 저장합니다.
- **실행**: `python python/img.py` (PyQt5, Pillow 설치 필요)

### 2. 인클루드 전처리기 (`python/build-includes.py`)
- **설명**: Jekyll 스타일의 `{% include key %}` 문법을 파싱하여, `source/_includes/` 안의 내용을 읽어 `source/_posts/` 하위 파일들과 융합 후 `source/_prebuild` 디렉토리에 빌드 결과물(HTML)을 생성합니다.

### 3. LLM/Gemini 연동 테스트 (`python/gemini/`)
- LangChain 및 Google Gemini Pro API를 활용한 코드 리팩토링 및 텍스트 생성 테스트 스크립트 폴더입니다.

---

## 📂 디렉토리 구조

```text
D:/coffeeman1
├── .deploy_git/          # Git 배포용 빌드 캐시 디렉토리
├── python/               # 파이썬 유틸리티 (이미지 캡처 앱, Gemini 연동 등)
│   ├── gemini/           # Gemini API 테스트 코드
│   ├── img.py            # 클립보드 이미지 워터마크/리사이즈 저장 툴
│   └── build-includes.py # include 태그 치환 스크립트
├── scripts/              # Hexo 사용자 정의 콘솔/태그 확장 스크립트 (JS)
├── source/               # 블로그 마크다운 포스트 및 데이터 소스
│   ├── _data/            # FontAwesome 등의 메타데이터 데이터셋
│   ├── _includes/        # 재사용 가능한 마크다운 모듈들
│   ├── _posts/           # 블로그 포스트들 (대부분 고유 난수 파일명)
│   └── images/           # 블로그 본문 첨부 이미지
├── themes/
│   └── devpekr/          # 블로그 테마 디렉토리
├── _config.yml           # Hexo 전역 설정 파일
├── package.json          # 의존성 패키지 및 NPM 스크립트 정의
└── README.md             # 본 파일
```

---

## 💻 사용 방법 및 작업 워크플로우

### 1. 의존성 패키지 설치
블로그 및 유틸리티 실행을 위해 Node.js 및 Python 의존성을 설치해야 합니다.

```bash
# Node.js 패키지 설치
npm install

# Python 패키지 설치 (유틸리티 구동 필요 시)
pip install PyQt5 Pillow langchain-openai python-dotenv httpx markdown
```

### 2. 로컬 테스트 서버 구동
로컬 컴퓨터에서 블로그의 변경 사항을 실시간으로 확인합니다.

```bash
npm run server
# 또는
npx hexo server
```
서버 실행 후 웹 브라우저에서 `http://localhost:4000`에 접속하여 확인할 수 있습니다.

### 3. 새 포스트 작성
고유한 난수 파일명으로 새 글을 생성합니다.

```bash
npx hexo uniqpost "작성할 포스트 제목"
# 생성 예시: source/_posts/a1b2c3.md
```

### 4. 이미지 캡처 및 자동 첨부 (Windows 단축키 활용 권장)
1. 캡처 도구 등으로 본문에 들어갈 스크린샷을 찍어 클립보드에 저장합니다.
2. `python python/img.py`를 실행하여 캡처 앱을 엽니다.
3. 앱이 클립보드 이미지를 감지하면 저장 버튼을 클릭하여 `source/images/`에 간편하게 워터마크가 찍힌 이미지 파일로 저장할 수 있습니다.
4. 마크다운 본문에 저장된 상대 경로(`../../images/파일명.png`)를 입력해 링크합니다.

### 5. 블로그 빌드 및 배포
수정이 완료된 블로그를 정적 HTML로 빌드하고 GitHub Pages에 푸시하여 배포합니다.

```bash
# 이전 빌드 잔여물 삭제
npm run clean

# 정적 HTML 파일 빌드
npm run build

# GitHub Pages 배포 (메인 배포 레포로 푸시)
npm run deploy
```